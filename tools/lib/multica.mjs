// The only place the scheduler scripts talk to Multica. Three modes:
//   real     — spawns `multica` (or $MULTICA_BIN);
//   dry-run  — `--dry-run` or MULTICA_DRY_RUN=1: reads still run, every write is printed to stderr as the exact command
//              line instead of being executed (and returns a placeholder result);
//   fake     — MULTICA_FAKE_STATE=<file.json>: runs tools/lib/fake-multica.mjs, which implements the same command lines
//              against a local JSON file. Tests use this so nothing touches the real workspace.
// Everything is synchronous (spawnSync) so callers can hold mkdir locks around a read-modify-write.
// Metadata objects and arrays are stored as JSON strings (--type string) and decoded on read, so we don't depend on
// how the server stores nested values; decodeMeta also accepts values that were stored natively.
// The server caps an issue's metadata as a whole at 8 KB (HM-876). A full regression's workOrders (254 pages ≈ 8.1 KB as
// JSON) no longer fits on its own, so a value whose JSON exceeds PACK_MIN is stored as PACK_PREFIX + base64(deflate-raw)
// (≈ 30 %: 254 pages → 2.3 KB) and decodeMeta unpacks it; every reader goes through decodeMeta / decodeAll (HM-1086).
import { spawnSync } from "node:child_process";
import { deflateRawSync, inflateRawSync } from "node:zlib";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const FAKE_BIN = path.join(HERE, "fake-multica.mjs");

export const PACK_PREFIX = "z1:";
export const PACK_MIN = 2048;
export function encodeMeta(v) {
  const s = JSON.stringify(v);
  return Buffer.byteLength(s) > PACK_MIN ? PACK_PREFIX + deflateRawSync(s, { level: 9 }).toString("base64") : s;
}

export function decodeMeta(v) {
  if (typeof v !== "string") return v;
  const t = v.trim();
  if (t.startsWith(PACK_PREFIX)) { try { return JSON.parse(inflateRawSync(Buffer.from(t.slice(PACK_PREFIX.length), "base64")).toString("utf8")); } catch { return v; } }
  if ((t.startsWith("{") && t.endsWith("}")) || (t.startsWith("[") && t.endsWith("]"))) { try { return JSON.parse(t); } catch { return v; } }
  return v;
}
export const decodeAll = (m) => Object.fromEntries(Object.entries(m || {}).map(([k, v]) => [k, decodeMeta(v)]));

export class MulticaError extends Error {
  constructor(args, res) {
    super(`multica ${args.slice(0, 3).join(" ")} failed (exit ${res.status}): ${(res.stderr || "").trim().split("\n").slice(-3).join(" | ")}`);
    this.args = args; this.stderr = res.stderr; this.status = res.status;
  }
}

export class Multica {
  constructor({ dryRun = false, bin, env = process.env, log = (s) => process.stderr.write(s + "\n") } = {}) {
    this.env = env;
    this.dryRun = dryRun || env.MULTICA_DRY_RUN === "1";
    this.fake = env.MULTICA_FAKE_STATE ? path.resolve(env.MULTICA_FAKE_STATE) : null;
    this.cmd = bin ? bin.split(" ") : env.MULTICA_BIN ? env.MULTICA_BIN.split(" ") : this.fake ? [process.execPath, FAKE_BIN] : ["multica"];
    this.log = log;
    this.writes = []; // command lines of writes issued (or, in dry-run, that would have been issued)
    this.seq = 0;
  }

  static fromArgv(argv = process.argv.slice(2), env = process.env) {
    return new Multica({ dryRun: argv.includes("--dry-run"), env });
  }

  quote(a) { return /^[\w@%+=:,./-]+$/.test(a) ? a : `'${String(a).replace(/'/g, `'\\''`)}'`; }

  exec(args, { input, write = false, json = true } = {}) {
    if (write) {
      const line = ["multica", ...args].map((a) => this.quote(a)).join(" ") + (input != null ? `  <<< ${JSON.stringify(input.length > 200 ? input.slice(0, 200) + "…" : input)}` : "");
      this.writes.push(line);
      if (this.dryRun) { this.log(`[dry-run] ${line}`); return null; }
    }
    const res = spawnSync(this.cmd[0], [...this.cmd.slice(1), ...args], { input, encoding: "utf8", env: this.env, maxBuffer: 256 * 1024 * 1024 });
    if (res.error) throw res.error;
    if (res.status !== 0) throw new MulticaError(args, res);
    if (!json) return res.stdout;
    const out = res.stdout.trim();
    if (!out) return null;
    try { return JSON.parse(out); } catch { return out; }
  }

  // ---- reads -------------------------------------------------------------------------------------------------------
  listIssues({ project, status, assigneeId, metadata = {}, pageSize = 100 } = {}) {
    const all = [];
    for (let offset = 0; ; offset += pageSize) {
      // stable order for offset paging (the default board order moves when statuses change)
      const args = ["issue", "list", "--output", "json", "--limit", String(pageSize), "--offset", String(offset), "--sort", "created_at", "--direction", "asc"];
      if (project) args.push("--project", project);
      if (status) args.push("--status", status);
      if (assigneeId) args.push("--assignee-id", assigneeId);
      for (const [k, v] of Object.entries(metadata)) args.push("--metadata", `${k}=${typeof v === "string" && /^(true|false|-?\d+(\.\d+)?)$/.test(v) ? JSON.stringify(v) : v}`);
      const res = this.exec(args);
      const page = Array.isArray(res) ? res : res?.issues ?? res?.data ?? [];
      all.push(...page.map((i) => ({ ...i, metadata: decodeAll(i.metadata) })));
      if (page.length < pageSize) break;
    }
    return all;
  }

  getIssue(id) { const i = this.exec(["issue", "get", id, "--output", "json"]); return i ? { ...i, metadata: decodeAll(i.metadata) } : i; }
  metadata(id) { return decodeAll(this.exec(["issue", "metadata", "list", id, "--output", "json"]) || {}); }
  // top-level comments only: never folded, and tool comments ([GATE], [REDO] …) are all top-level
  comments(id) { const r = this.exec(["issue", "comment", "list", id, "--roots-only", "--output", "json"]); return Array.isArray(r) ? r : r?.comments ?? []; }
  runs(id) { const r = this.exec(["issue", "runs", id, "--output", "json"]); return Array.isArray(r) ? r : r?.runs ?? []; }
  usage(id) { return this.exec(["issue", "usage", id, "--output", "json"]) || {}; }
  runtimes() { const r = this.exec(["runtime", "list", "--output", "json"]); return Array.isArray(r) ? r : r?.runtimes ?? []; }

  // ---- writes ------------------------------------------------------------------------------------------------------
  setMeta(id, key, value) {
    const args = ["issue", "metadata", "set", id, "--key", key, "--output", "json"];
    if (value !== null && typeof value === "object") args.push("--type", "string", "--value", encodeMeta(value));
    else if (typeof value === "number") args.push("--type", "number", "--value", String(value));
    else if (typeof value === "boolean") args.push("--type", "bool", "--value", String(value));
    else args.push("--type", "string", "--value", String(value));
    return this.exec(args, { write: true });
  }

  // undefined = leave alone, null = delete the key
  setMetaMany(id, obj) { for (const [k, v] of Object.entries(obj)) if (v === null) this.deleteMeta(id, k); else if (v !== undefined) this.setMeta(id, k, v); }
  deleteMeta(id, key) {
    try { return this.exec(["issue", "metadata", "delete", id, "--key", key], { write: true, json: false }); }
    catch (e) { if (/not found|no such|does not exist/i.test(e.stderr || "")) return null; throw e; }
  }

  create({ title, description, status = "backlog", assigneeId, parent, project, priority }) {
    // creation is made idempotent by the ledger, so the server's duplicate-title guard must not refuse it
    const args = ["issue", "create", "--title", title, "--status", status, "--output", "json", "--allow-duplicate"];
    if (assigneeId) args.push("--assignee-id", assigneeId);
    if (parent) args.push("--parent", parent);
    if (project) args.push("--project", project);
    if (priority) args.push("--priority", priority);
    if (description) args.push("--description-stdin");
    const r = this.exec(args, { write: true, input: description });
    return r ?? { id: `dry-run-${++this.seq}`, title, status, dryRun: true };
  }

  // One call so status and assignee change together; noStart records the change without starting a run.
  update(id, { status, assigneeId, noStart = false, title } = {}) {
    const args = ["issue", "update", id, "--output", "json"];
    if (status) args.push("--status", status);
    if (assigneeId) args.push("--assignee-id", assigneeId);
    if (title) args.push("--title", title);
    if (noStart) args.push("--no-start");
    return this.exec(args, { write: true });
  }

  comment(id, body) { return this.exec(["issue", "comment", "add", id, "--content-stdin", "--output", "json"], { write: true, input: body }); }
  rerun(id) { return this.exec(["issue", "rerun", id, "--output", "json"], { write: true }); }
}
