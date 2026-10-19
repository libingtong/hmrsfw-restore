#!/usr/bin/env node
// Drift of queue/ between the tool repo's branches, limited to the fields that decide what a gate replays and compares
// (HM-949). The gate reads queue/ from its own checkout (main), the recorder from `integration`, the fast lane from
// `restore/fast-lane`; a baseline recorded with one copy and refreshed or compared with another fails in ways that
// look like a page problem ("original page root not found"). Report only: it changes nothing.
//   node tools/queue-drift.mjs [--base origin/main] [--refs origin/restore/fast-lane,origin/integration] [--ids <json array>] [--all-fields]
// Output: {base, refs: {<ref>: {drift: [{id, field, base, ref}], onlyBase: [...], onlyRef: [...]}}}; exit 1 on any drift.
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { ROOT } from "./gate/common.mjs";

// Fields gate.mjs / baseline.mjs / replay read from a page or segment order (common.mjs loadWorkOrder, origSelOf,
// pageScopeId, findHar, authStorage, static.mjs pageFiles). role, deps.orders and notes do not change a replay.
export const REPLAY_FIELDS = ["type", "site", "app", "sourceChunk", "recordPath", "recordVia", "scopeIds", "components", "target", "subComponentDir", "har", "auth"];

export function orderDrift(a, b, fields = REPLAY_FIELDS) {
  const out = [];
  for (const f of fields ?? [...new Set([...Object.keys(a), ...Object.keys(b)])]) {
    const x = JSON.stringify(a[f] ?? null), y = JSON.stringify(b[f] ?? null);
    if (x !== y) out.push({ field: f, base: a[f] ?? null, ref: b[f] ?? null });
  }
  return out;
}

const git = (args) => execFileSync("git", ["-C", ROOT, ...args], { encoding: "utf8", maxBuffer: 256 << 20 });
const orderIds = (ref) => new Set(git(["ls-tree", "--name-only", `${ref}:queue/`]).split("\n").filter((n) => /^(page|seg)\..+\.json$/.test(n)).map((n) => n.slice(0, -5)));
const readOrder = (ref, id) => JSON.parse(git(["show", `${ref}:queue/${id}.json`]));

export function queueDrift({ base, refs, ids = null, fields = REPLAY_FIELDS }) {
  const want = ids ? new Set(ids) : null;
  const pick = (s) => (want ? new Set([...s].filter((x) => want.has(x))) : s);
  const baseIds = pick(orderIds(base));
  const res = { base, refs: {} };
  for (const ref of refs) {
    const refIds = pick(orderIds(ref));
    const r = { drift: [], onlyBase: [...baseIds].filter((x) => !refIds.has(x)).sort(), onlyRef: [...refIds].filter((x) => !baseIds.has(x)).sort() };
    for (const id of [...baseIds].filter((x) => refIds.has(x)).sort()) for (const d of orderDrift(readOrder(base, id), readOrder(ref, id), fields)) r.drift.push({ id, ...d });
    res.refs[ref] = r;
  }
  return res;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const argv = process.argv.slice(2);
  const opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : d; };
  const res = queueDrift({
    base: opt("--base", "origin/main"),
    refs: opt("--refs", "origin/restore/fast-lane,origin/integration").split(",").filter(Boolean),
    ids: opt("--ids") ? JSON.parse(opt("--ids")) : null,
    fields: argv.includes("--all-fields") ? null : REPLAY_FIELDS,
  });
  console.log(JSON.stringify(res, null, 1));
  process.exit(Object.values(res.refs).some((r) => r.drift.length) ? 1 : 0);
}
