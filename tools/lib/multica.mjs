// The only place the scheduler scripts talk to Multica. Three modes:
//   real     — spawns `multica` (or $MULTICA_BIN);
//   dry-run  — `--dry-run` or MULTICA_DRY_RUN=1: reads still run, every write is printed to stderr as the exact command
//              line instead of being executed (and returns a placeholder result);
//   fake     — MULTICA_FAKE_STATE=<file.json>: runs tools/lib/fake-multica.mjs, which implements the same command lines
//              against a local JSON file. Tests use this so nothing touches the real workspace.
// Everything is synchronous (spawnSync) so callers can hold mkdir locks around a read-modify-write.
// Metadata objects and arrays are stored as JSON strings (--type string) and decoded on read, so we don't depend on
// how the server stores nested values; decodeMeta also accepts values that were stored natively.
import { spawnSync } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const FAKE_BIN = path.join(HERE, "fake-multica.mjs");

export function decodeMeta(v) {
  if (typeof v !== "string") return v;
  const t = v.trim();
  if ((t.startsWith("{") && t.endsWith("}")) || (t.startsWith("[") && t.endsWith("]"))) { try { return JSON.parse(t); } catch { return v; } }
  return v;
}
export const decodeAll = (m) => Object.fromEntries(Object.entries(m || {}).map(([k, v]) => [k, decodeMeta(v)]));

// The server caps an issue's metadata at 8 KB for all keys together (HM-876). A full-set integration order lists every
// passed page (254 ids ≈ 9 KB at HM-1086), so a workOrders list longer than WO_INLINE_MAX is written to
// $RESTORE_STATE/meta/<issue>/workOrders.json and metadata keeps only workOrdersRef {file, count, sha} (and no
// workOrders key). Readers go through resolveMeta, which puts the list back as workOrders; an inline workOrders wins
// over a ref. A ref whose file is missing or does not match leaves workOrders unset and sets workOrdersError.
export const WO_INLINE_MAX = 2048;
const woSha = (wos) => createHash("sha256").update(JSON.stringify(wos)).digest("hex").slice(0, 16);
const woFile = (id) => path.join("meta", String(id).replace(/[^\w.-]/g, "_"), "workOrders.json");
export function resolveMeta(m, env = process.env) {
  const ref = m?.workOrdersRef;
  if (!ref || m.workOrders !== undefined) return m;
  const out = { ...m };
  try {
    if (!env.RESTORE_STATE) throw new Error("RESTORE_STATE is not set");
    const f = path.join(path.resolve(env.RESTORE_STATE), ref.file);
    const wos = JSON.parse(readFileSync(f, "utf8")).workOrders;
    if (!Array.isArray(wos) || wos.length !== ref.count || woSha(wos) !== ref.sha) throw new Error(`${ref.file} does not match workOrdersRef (count ${ref.count}, sha ${ref.sha})`);
    out.workOrders = wos;
  } catch (e) { out.workOrdersError = `workOrdersRef unreadable: ${String(e.message).split("\n")[0]}`; }
  return out;
}

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
      all.push(...page.map((i) => ({ ...i, metadata: resolveMeta(decodeAll(i.metadata), this.env) })));
      if (page.length < pageSize) break;
    }
    return all;
  }

  getIssue(id) { const i = this.exec(["issue", "get", id, "--output", "json"]); return i ? { ...i, metadata: resolveMeta(decodeAll(i.metadata), this.env) } : i; }
  metadata(id) { return resolveMeta(decodeAll(this.exec(["issue", "metadata", "list", id, "--output", "json"]) || {}), this.env); }
  runs(id) { const r = this.exec(["issue", "runs", id, "--output", "json"]); return Array.isArray(r) ? r : r?.runs ?? []; }
  usage(id) { return this.exec(["issue", "usage", id, "--output", "json"]) || {}; }
  runtimes() { const r = this.exec(["runtime", "list", "--output", "json"]); return Array.isArray(r) ? r : r?.runtimes ?? []; }

  // ---- writes ------------------------------------------------------------------------------------------------------
  setMeta(id, key, value) {
    if (key === "workOrders" && Array.isArray(value) && Buffer.byteLength(JSON.stringify(value)) > WO_INLINE_MAX) return this.setWorkOrdersRef(id, value);
    const args = ["issue", "metadata", "set", id, "--key", key, "--output", "json"];
    if (value !== null && typeof value === "object") args.push("--type", "string", "--value", JSON.stringify(value));
    else if (typeof value === "number") args.push("--type", "number", "--value", String(value));
    else if (typeof value === "boolean") args.push("--type", "bool", "--value", String(value));
    else args.push("--type", "string", "--value", String(value));
    return this.exec(args, { write: true });
  }

  // A long workOrders list: the file first (written atomically; the same list always gives the same content), then the
  // inline key goes — before the ref, because an inline list that did fit can leave too little room for one more key
  // (HM-1072: 8188 of 8192 bytes) — then the ref. Repeating it after a crash is safe; in between, workOrders reads unset.
  setWorkOrdersRef(id, wos) {
    if (!this.env.RESTORE_STATE) throw new Error(`workOrders of ${id} (${wos.length} ids) is too long for metadata and RESTORE_STATE is not set`);
    const ref = { file: woFile(id), count: wos.length, sha: woSha(wos) };
    const f = path.join(path.resolve(this.env.RESTORE_STATE), ref.file);
    if (this.dryRun) this.log(`[dry-run] write ${f} (${wos.length} work orders)`);
    else {
      mkdirSync(path.dirname(f), { recursive: true });
      const tmp = `${f}.${process.pid}.${randomBytes(4).toString("hex")}.tmp`;
      writeFileSync(tmp, JSON.stringify({ issue: id, ...ref, workOrders: wos }) + "\n");
      renameSync(tmp, f);
    }
    this.deleteMeta(id, "workOrders");
    return this.setMeta(id, "workOrdersRef", ref);
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
