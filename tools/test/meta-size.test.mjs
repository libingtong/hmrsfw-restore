// node --test tools/test/meta-size.test.mjs
// HM-1086: a full-set integration order lists every passed page; at 254 pages workOrders alone is past the server's 8 KB
// metadata cap, so finishCreate failed half-way and every tick retried the same key (HM-1072 stuck in backlog). A long
// workOrders now goes to $RESTORE_STATE/meta/<issue>/workOrders.json with only workOrdersRef in metadata; Multica and
// gate.mjs put the list back on read. The fake multica refuses writes past the cap like the server.
import test from "node:test";
import assert from "node:assert/strict";
import { chmodSync, existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { makeFixture, node, issuesOf, fakeState, mc, setMeta, meta, REPO } from "./fixture.mjs";
import { Multica, WO_INLINE_MAX } from "../lib/multica.mjs";

// HM-1072 as found: kind, purpose and the 254-id workOrders (8109 B) written, 8188 of 8192 bytes, the next key refused
const N = 254;
const ids = Array.from({ length: N }, (_, i) => `page.uc.resume.SomePage${String(i).padStart(3, "0")}`.padEnd(i < 234 ? 29 : 28, "x"));
// the queue need not hold the 254 orders: the stuck creation lives in the ledger and the metadata only
const page = (id) => ({ id, type: "page", kb: 5, app: "uc", site: "usercenter", target: `apps/uc/src/views/${id}.vue`, subComponentDir: `apps/uc/src/views/${id}/`, deps: [], accepted: true });
const metaBytes = (m) => Object.entries(m).reduce((n, [k, v]) => n + Buffer.byteLength(k) + Buffer.byteLength(typeof v === "string" ? v : JSON.stringify(v)) + 8, 8);
const KEY = `integration:rule-regression:${"1a676d73".padEnd(40, "0")}`;
const TITLE = `[integration] rule-regression (${N} 页)`;

// The ledger and the issue exactly as HM-1072 was left: issue created in backlog, kind + purpose + workOrders written,
// the next key refused, assigned: false.
function stuck(fx) {
  const i = mc(fx, "issue", "create", "--title", TITLE, "--status", "backlog", "--project", "proj-1");
  const m = { kind: "integration", purpose: "rule-regression", workOrders: ids, sha: "", branch: "integration", attempt: 1, fixRound: 0, ruleChange: "rule/hm-1060-legacy-tinymce", ruleSha: KEY.split(":")[2], createKey: KEY, createdOn: "mac-mini" };
  assert.ok(metaBytes({ ...m, workOrders: JSON.stringify(ids) }) > 8192, "inline, the order is past the cap");
  setMeta(fx, i.id, "kind", "integration"); setMeta(fx, i.id, "purpose", "rule-regression"); setMeta(fx, i.id, "workOrders", ids);
  assert.equal(Buffer.byteLength(JSON.stringify(ids)), 8109);
  assert.equal(metaBytes(fakeState(fx).issues[i.id].metadata), 8188);
  assert.throws(() => setMeta(fx, i.id, "sha", ""), /exceeds the 8KB size limit/, "the fake refuses the next key like the server");
  const tasks = { wos: {}, seq: 0, keys: { [KEY]: i.id }, tasks: { [i.id]: { key: KEY, kind: "integration", title: TITLE, workOrders: [], assigneeId: fx.id("gate"), status: "todo", meta: m, createdAt: new Date().toISOString(), assigned: false, id: i.id } } };
  writeFileSync(path.join(fx.state, "ledger", "tasks.json"), JSON.stringify(tasks));
  return i.id;
}

test("HM-1072 shape: the interrupted creation finishes on the next tick, workOrders by reference, no duplicate", () => {
  const fx = makeFixture({ orders: [page("P0")], config: { regressionEvery: 1000 } });
  const id = stuck(fx);
  const r = node(fx, "tick.mjs", ["tick"]);
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 2000));
  const i = fakeState(fx).issues[id];
  assert.equal(i.status, "todo");
  assert.equal(i.assignee_id, fx.id("gate"));
  const m = meta(fx, id);
  assert.equal(m.workOrders, undefined, "no inline list");
  assert.equal(m.workOrdersRef.count, N);
  assert.ok(metaBytes(i.metadata) < 2048, `whole metadata ${metaBytes(i.metadata)} B`);
  const file = JSON.parse(readFileSync(path.join(fx.state, m.workOrdersRef.file), "utf8"));
  assert.deepEqual(file.workOrders, ids);
  assert.equal(JSON.parse(readFileSync(path.join(fx.state, "ledger", "tasks.json"), "utf8")).tasks[id].assigned, true);
  // the scheduler's own reads see the list
  assert.deepEqual(new Multica({ env: fx.env }).metadata(id).workOrders, ids);
  // a second tick creates nothing new for this key and raises no metadata error
  const r2 = node(fx, "tick.mjs", ["tick"]);
  assert.equal(r2.ok, true, JSON.stringify(r2).slice(0, 2000));
  assert.ok(!JSON.stringify(r2).includes("exceeds"), "no size error");
  assert.equal(issuesOf(fx).filter((x) => x.title.startsWith("[integration] rule-regression")).length, 1);
  assert.ok(!issuesOf(fx).some((x) => x.title.startsWith("[incident]") && /exceeds/.test(JSON.stringify(x.metadata))));
});

test("advance resolves the referenced list: failing pages counted against all 254; a missing file is no verdict", () => {
  const fx = makeFixture({ orders: [page("P0")], config: { regressionEvery: 1000 } });
  const id = stuck(fx);
  node(fx, "tick.mjs", ["tick"]);
  mc(fx, "issue", "update", id, "--status", "in_review", "--no-start");
  // what gate.mjs slimResult writes for hundreds of pages: failing ones listed, passing ones counted
  const verdict = { pass: false, mode: "integration", attempt: 1, stage: "browser", failed: [{ check: "html", where: "load", hint: "x", wo: ids[7] }], pages: [{ wo: ids[7], pass: false, stage: "browser" }], passedOmitted: N - 1 };
  const ref = meta(fx, id).workOrdersRef;
  rmSync(path.join(fx.state, ref.file));
  setMeta(fx, id, "gate.1", verdict);
  let r = node(fx, "tick.mjs", ["advance", id]);
  assert.equal(r.ok, false);
  assert.match(JSON.stringify(r.anomalies), /workOrdersRef unreadable/);
  assert.equal(fakeState(fx).issues[id].status, "in_review", "not closed, not reverted");
  // file back (as the runbook says: from the ledger's record) → advance counts 1 failing page of 254
  writeFileSync(path.join(fx.state, ref.file), JSON.stringify({ workOrders: ids }));
  r = node(fx, "tick.mjs", ["advance", id]);
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 2000));
  assert.match(fakeState(fx).issues[id].comments.at(-1).content, /回归失败（1 页）/);
});

test("gate.mjs --task reads the referenced list", async () => {
  const fx = makeFixture({ orders: [page("P0")] });
  const id = stuck(fx);
  node(fx, "tick.mjs", ["tick"]);
  const bin = path.join(fx.root, "multica-bin");
  writeFileSync(bin, `#!/bin/sh\nexec "${process.execPath}" "${path.join(REPO, "tools/lib/fake-multica.mjs")}" "$@"\n`);
  chmodSync(bin, 0o755);
  const save = { ...process.env };
  Object.assign(process.env, fx.env, { MULTICA_BIN: bin });
  try {
    const { taskMeta } = await import("../gate.mjs");
    assert.deepEqual(taskMeta(id).workOrders, ids);
    const ref = meta(fx, id).workOrdersRef;
    writeFileSync(path.join(fx.state, ref.file), JSON.stringify({ workOrders: ids.slice(1) }));
    assert.throws(() => taskMeta(id), /does not match workOrdersRef/, "a stale file is an error, not a shorter run");
  } finally { process.env = save; }
});

test("Multica.setMeta: short lists stay inline, long ones by reference; dry-run writes no file", () => {
  const fx = makeFixture({ orders: [] });
  const i = mc(fx, "issue", "create", "--title", "t", "--status", "backlog");
  const m = new Multica({ env: fx.env });
  m.setMeta(i.id, "workOrders", ids.slice(0, 3));
  assert.deepEqual(meta(fx, i.id).workOrders, ids.slice(0, 3));
  assert.ok(Buffer.byteLength(JSON.stringify(ids)) > WO_INLINE_MAX);
  m.setMeta(i.id, "workOrders", ids);
  assert.equal(meta(fx, i.id).workOrders, undefined, "the inline key is removed: it would win over the ref");
  assert.deepEqual(m.metadata(i.id).workOrders, ids);
  // shrinking back (a split keeps only the passing pages): the inline list wins over the old ref
  m.setMeta(i.id, "workOrders", ids.slice(0, 2));
  assert.deepEqual(m.metadata(i.id).workOrders, ids.slice(0, 2));
  const j = mc(fx, "issue", "create", "--title", "u", "--status", "backlog");
  const logs = [];
  new Multica({ env: fx.env, dryRun: true, log: (s) => logs.push(s) }).setMeta(j.id, "workOrders", ids);
  assert.ok(!existsSync(path.join(fx.state, "meta", j.id)), "dry-run: no file");
  assert.ok(logs.some((l) => l.includes(`${N} work orders`)) && logs.some((l) => l.includes("workOrdersRef")));
});
