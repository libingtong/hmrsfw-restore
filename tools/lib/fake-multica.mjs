#!/usr/bin/env node
// Fake `multica` CLI for tests: the subset of commands tools/lib/multica.mjs issues, with the same flags, backed by the
// JSON file in $MULTICA_FAKE_STATE. Every write is appended to state.log so tests can assert on what would have happened
// (e.g. no task created twice, no task assigned twice). An assignment or rerun that would start a run appends a queued
// run to issue.runs. Concurrent invocations are serialised with a mkdir lock next to the state file.
import { readFileSync, writeFileSync, mkdirSync, rmSync, renameSync, statSync, existsSync } from "node:fs";
import { randomUUID } from "node:crypto";

const FILE = process.env.MULTICA_FAKE_STATE;
if (!FILE) { console.error("MULTICA_FAKE_STATE not set"); process.exit(2); }
const LOCK = FILE + ".lock";
const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

function lock() {
  for (let i = 0; i < 2000; i++) {
    try { mkdirSync(LOCK); return; } catch (e) {
      if (e.code !== "EEXIST") throw e;
      try { if (Date.now() - statSync(LOCK).mtimeMs > 30_000) rmSync(LOCK, { recursive: true, force: true }); } catch {}
      sleep(5 + Math.random() * 20);
    }
  }
  throw new Error("fake-multica: state lock timeout");
}
const unlock = () => rmSync(LOCK, { recursive: true, force: true });
const load = () => existsSync(FILE) ? JSON.parse(readFileSync(FILE, "utf8")) : {};
function save(s) { const t = `${FILE}.${process.pid}.tmp`; writeFileSync(t, JSON.stringify(s, null, 1)); renameSync(t, FILE); }

function parse(argv) {
  const pos = [], flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) { pos.push(a); continue; }
    const k = a.slice(2);
    if (["no-start", "description-stdin", "content-stdin", "full-id", "active", "unassign", "allow-duplicate"].includes(k)) { flags[k] = true; continue; }
    const v = argv[++i];
    if (k === "metadata") (flags.metadata ||= []).push(v); else flags[k] = v;
  }
  return { pos, flags };
}
const readStdin = () => { try { return readFileSync(0, "utf8"); } catch { return ""; } };
const sniff = (v, type) => {
  if (type === "string") return v;
  if (type === "number") return Number(v);
  if (type === "bool") return v === "true";
  try { return JSON.parse(v); } catch { return v; }
};
const out = (x) => process.stdout.write(JSON.stringify(x, null, 1) + "\n");
const fail = (msg) => { process.stderr.write(`Error: ${msg}\n`); process.exitCode = 1; };

const { pos, flags } = parse(process.argv.slice(2));
const [group, cmd, ...rest] = pos;
const now = () => new Date().toISOString();

lock();
try {
  const s = load();
  s.seq ??= 0; s.issues ??= {}; s.log ??= []; s.runtimes ??= []; s.agents ??= [];
  const W = (op, extra) => s.log.push({ at: now(), op, ...extra });
  const issue = (id) => { const i = s.issues[id] || Object.values(s.issues).find((x) => x.identifier === id); if (!i) throw new Error(`issue not found: ${id}`); return i; };
  const startRun = (i, why) => { if (i.assignee_id) { i.runs.unshift({ id: randomUUID(), agent_id: i.assignee_id, status: "queued", created_at: now(), why }); W("run.start", { issue: i.id, agent: i.assignee_id, why }); } };
  const view = (i) => { const { comments, runs, usage, ...rest } = i; return rest; };
  let dirty = false;

  if (group === "issue" && cmd === "list") {
    let list = Object.values(s.issues);
    if (flags.project) list = list.filter((i) => i.project_id === flags.project);
    if (flags.status) list = list.filter((i) => i.status === flags.status);
    if (flags["assignee-id"]) list = list.filter((i) => i.assignee_id === flags["assignee-id"]);
    for (const m of flags.metadata || []) { const [k, ...v] = m.split("="); const want = sniff(v.join("=")); list = list.filter((i) => i.metadata?.[k] === want || String(i.metadata?.[k]) === String(want)); }
    list.sort((a, b) => a.number - b.number);
    const off = Number(flags.offset || 0), lim = Number(flags.limit || 50);
    out(list.slice(off, off + lim).map(view));
  } else if (group === "issue" && cmd === "get") {
    out(view(issue(rest[0])));
  } else if (group === "issue" && cmd === "create") {
    const n = ++s.seq;
    const id = randomUUID();
    const i = { id, number: n, identifier: `FAKE-${n}`, title: flags.title, description: flags["description-stdin"] ? readStdin() : flags.description || "",
      status: flags.status || "todo", assignee_id: flags["assignee-id"] || null, assignee_type: flags["assignee-id"] ? "agent" : null,
      project_id: flags.project || null, parent_issue_id: flags.parent || null, metadata: {}, comments: [], runs: [], usage: { total_input_tokens: 0, total_output_tokens: 0, total_cache_read_tokens: 0, total_cache_write_tokens: 0 }, created_at: now(), updated_at: now() };
    s.issues[id] = i; W("create", { issue: id, title: i.title, assignee: i.assignee_id, status: i.status });
    if (i.assignee_id && !["backlog", "done", "cancelled"].includes(i.status)) startRun(i, "create");
    dirty = true; out(view(i));
  } else if (group === "issue" && cmd === "update") {
    const i = issue(rest[0]);
    const prevAssignee = i.assignee_id;
    if (flags.status) i.status = flags.status;
    if (flags["assignee-id"]) { i.assignee_id = flags["assignee-id"]; i.assignee_type = "agent"; }
    if (flags.title) i.title = flags.title;
    i.updated_at = now();
    W("update", { issue: i.id, status: flags.status, assignee: flags["assignee-id"], noStart: !!flags["no-start"] });
    const changed = flags["assignee-id"] && flags["assignee-id"] !== prevAssignee;
    if (!flags["no-start"] && (changed || flags.status === "todo") && !["backlog", "done", "cancelled"].includes(i.status)) startRun(i, "update");
    dirty = true; out(view(i));
  } else if (group === "issue" && cmd === "status") {
    const i = issue(rest[0]); i.status = rest[1]; W("status", { issue: i.id, status: rest[1], noStart: !!flags["no-start"] }); dirty = true; out(view(i));
  } else if (group === "issue" && cmd === "rerun") {
    const i = issue(rest[0]); startRun(i, "rerun"); dirty = true; out({ ok: true });
  } else if (group === "issue" && cmd === "metadata") {
    const [sub, id] = rest; const i = issue(id);
    if (sub === "list") out(i.metadata);
    else if (sub === "get") out(i.metadata[flags.key] ?? null);
    // the server's key rule (MUL metadata): names with "@" or Chinese are refused
    else if (sub === "set" && !/^[a-zA-Z_][a-zA-Z0-9_.-]{0,63}$/.test(flags.key ?? "")) { console.error(`invalid metadata key ${JSON.stringify(flags.key)}: must match ^[a-zA-Z_][a-zA-Z0-9_.-]{0,63}$`); process.exit(1); }
    // the server's size rule (HM-876): all keys together, Σ(key + value as stored + 8) + 8 ≤ 8192
    else if (sub === "set" && Object.entries({ ...i.metadata, [flags.key]: flags.value }).reduce((n, [k, v]) => n + Buffer.byteLength(k) + Buffer.byteLength(typeof v === "string" ? v : JSON.stringify(v)) + 8, 8) > 8192) { console.error("Error: Invalid request: metadata exceeds the 8KB size limit"); process.exit(5); }
    else if (sub === "set") { i.metadata[flags.key] = sniff(flags.value, flags.type); W("meta.set", { issue: i.id, key: flags.key }); dirty = true; out({ [flags.key]: i.metadata[flags.key] }); }
    else if (sub === "delete") { delete i.metadata[flags.key]; W("meta.delete", { issue: i.id, key: flags.key }); dirty = true; out({ ok: true }); }
  } else if (group === "issue" && cmd === "comment") {
    const [sub, id] = rest; const i = issue(id);
    if (sub === "add") { const body = flags["content-stdin"] ? readStdin() : flags.content; i.comments.push({ id: randomUUID(), content: body, created_at: now() }); W("comment", { issue: i.id, head: body.split("\n")[0].slice(0, 120) }); dirty = true; out(i.comments.at(-1)); }
    else out(i.comments);
  } else if (group === "issue" && cmd === "runs") {
    out(issue(rest[0]).runs);
  } else if (group === "issue" && cmd === "usage") {
    out(issue(rest[0]).usage);
  } else if (group === "runtime" && cmd === "list") {
    out(s.runtimes);
  } else {
    fail(`fake-multica: unsupported command: ${pos.join(" ")}`);
  }
  if (dirty) save(s);
} catch (e) {
  fail(e.message);
} finally {
  unlock();
}
