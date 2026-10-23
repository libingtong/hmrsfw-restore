// Scenario tests for tick / route / ledger / handoff against the fake Multica CLI and local git repos.
// Run: node --test tools/test/scheduler.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync, readFileSync, utimesSync } from "node:fs";
import path from "node:path";
import { makeFixture, node, issuesOf, fakeState, mc, setMeta, meta, pushBranch, writeReceipt, lsRemote, showRemote, readJson, git, ROSTER, REPO } from "./fixture.mjs";

const page = (id, kb, extra = {}) => ({ id, type: "page", kb, app: "portal", site: "portal", target: `apps/portal/src/views/${id}/index.vue`, subComponentDir: `apps/portal/src/views/${id}/index/`, deps: ["@/shared/Dict.vue"], ...extra });
const recorded = (fx, ...ids) => ids.forEach((id) => mkdirSync(path.join(fx.state, "baseline", id), { recursive: true }));
const restoreTasks = (fx) => issuesOf(fx).filter((i) => i.title.startsWith("[restore]"));
const vue = (s) => `<template><div>${s}</div></template>\n`;
const deliver = (fx, taskId, files, { fix = false, receipt = {} } = {}) => {
  const m = meta(fx, taskId);
  pushBranch(fx, { branch: m.branch, files });
  for (const wo of m.workOrders) writeReceipt(fx, wo, { branch: m.branch, ...receipt });
  const r = node(fx, "handoff.mjs", [taskId, ...(fix ? ["--fix"] : [])]);
  assert.equal(r.ok, true, JSON.stringify(r));
  return r;
};
const gate = (fx, taskId, result) => { const m = meta(fx, taskId); setMeta(fx, taskId, `gate.${m.attempt}`, result); return node(fx, "tick.mjs", ["advance", taskId]); };
const issue = (fx, id) => fakeState(fx).issues[id];
const lastComment = (fx, id) => issue(fx, id).comments.at(-1)?.content || "";

test("full chain: dispatch → handoff → gate fail → fix → pass → merge → audit issue → revert → redo → arbiter → blocked", () => {
  const fx = makeFixture({ orders: [page("P1", 10)], config: { cheapTier: { enabled: true, coldStartRuns: 0, minFirstPass: 0 }, audit: { coldRate: 1, normalRate: 1 }, regressionEvery: 100 } });
  recorded(fx, "P1");
  let r = node(fx, "tick.mjs", ["tick"]);
  assert.equal(r.ok, true, JSON.stringify(r));
  const [t] = restoreTasks(fx);
  assert.ok(t, "restore task created");
  let m = meta(fx, t.id);
  assert.equal(t.assignee_id, fx.id("deepseek-mac"), "cheap tier, not cold → deepseek");
  assert.equal(m.branch, "restore/P1-a1");
  assert.equal(t.status, "todo");

  // restorer delivers
  deliver(fx, t.id, { "apps/portal/src/views/P1/index.vue": vue("a1") });
  assert.equal(issue(fx, t.id).status, "in_review");
  assert.equal(issue(fx, t.id).assignee_id, fx.id("gate"));
  assert.match(lastComment(fx, t.id), /^\[RECEIPT\]/);
  assert.ok(showRemote(fx, "tool", "integration", "receipts/P1.json"), "receipt committed to tool repo integration");
  assert.ok(meta(fx, t.id)["receipt.1"].P1, "receipt summary in metadata");

  // gate fails → fixer round 1 on the same branch
  r = gate(fx, t.id, { pass: false, stage: "browser", failed: [{ check: "dom", where: "x" }] });
  assert.equal(r.ok, true, JSON.stringify(r));
  m = meta(fx, t.id);
  assert.equal(issue(fx, t.id).assignee_id, fx.id("fixer"));
  assert.equal(m.fixRound, 1);
  assert.equal(m.branch, "restore/P1-a1");

  // fixer delivers, gate passes → merged, audited by a reviewer of a third family (deepseek restored, anthropic fixed → zhipu)
  deliver(fx, t.id, { "apps/portal/src/views/P1/index.vue": vue("a1 fixed") }, { fix: true });
  assert.match(lastComment(fx, t.id), /^\[FIX\]/);
  r = gate(fx, t.id, { pass: true, stage: "browser", failed: [] });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(showRemote(fx, "app", "integration", "apps/portal/src/views/P1/index.vue"), vue("a1 fixed"), "merged into integration");
  const intLog = git(fx.root, "--git-dir", fx.appOrigin, "log", "--first-parent", "--format=%P", "-1", "integration");
  assert.equal(intLog.split(" ").length, 2, "merge commit (--no-ff)");
  m = meta(fx, t.id);
  assert.equal(m.kind, "audit");
  assert.equal(issue(fx, t.id).assignee_id, fx.id("review-glm"));
  assert.equal(issue(fx, t.id).status, "in_review");

  // reviewer finds a high issue → tick reverts the merge, counts a miss, sends the page to a Sonnet redo (new branch)
  setMeta(fx, t.id, "audit.1", { verdict: "issue", reviewer: "review-glm", findings: [{ severity: "high", file: "index.vue", where: "submit", what: "> became >=", evidence: "chunk:1:200" }] });
  r = node(fx, "tick.mjs", ["tick"]);
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(showRemote(fx, "app", "integration", "apps/portal/src/views/P1/index.vue"), null, "merge reverted");
  m = meta(fx, t.id);
  assert.equal(m.kind, "restore");
  assert.equal(m.attempt, 2);
  assert.equal(m.branch, "restore/P1-a2");
  assert.equal(m.history.length, 1);
  assert.equal(issue(fx, t.id).assignee_id, fx.id("sonnet-mac"));
  const cap = readJson(path.join(fx.state, "ledger", "capability.json"));
  assert.deepEqual(cap.audits["deepseek|zhipu"], { audits: 1, misses: 1 });

  // Sonnet attempt: fail → fixer 1 → fail → fixer 2 → fail → arbiter
  deliver(fx, t.id, { "apps/portal/src/views/P1/index.vue": vue("a2") });
  gate(fx, t.id, { pass: false, stage: "static", failed: ["text-nodes"] });
  assert.equal(issue(fx, t.id).assignee_id, fx.id("fixer"));
  deliver(fx, t.id, { "apps/portal/src/views/P1/index.vue": vue("a2 f1") }, { fix: true });
  gate(fx, t.id, { pass: false, stage: "static", failed: ["text-nodes"] });
  assert.equal(meta(fx, t.id).fixRound, 2);
  assert.equal(issue(fx, t.id).assignee_id, fx.id("fixer"));
  deliver(fx, t.id, { "apps/portal/src/views/P1/index.vue": vue("a2 f2") }, { fix: true });
  gate(fx, t.id, { pass: false, stage: "static", failed: ["text-nodes"] });
  assert.equal(meta(fx, t.id).kind, "arbitrate");
  assert.equal(issue(fx, t.id).assignee_id, fx.id("arbiter"));

  // arbiter: nothing applies → blocked + human (agent action); the scheduler leaves it alone afterwards
  mc(fx, "issue", "update", t.id, "--status", "blocked", "--assignee-id", "member-human", "--no-start");
  r = node(fx, "tick.mjs", ["tick"]);
  assert.equal(r.ok, true);
  assert.equal(issue(fx, t.id).status, "blocked");
  assert.equal(restoreTasks(fx).length, 1, "no new task for a blocked page");
  const runs = readFileSync(path.join(fx.state, "ledger", "runs.jsonl"), "utf8").trim().split("\n").map((l) => JSON.parse(l));
  assert.ok(runs.some((r) => r.family === "deepseek" && r.result === "delivered" && r.model && r.runtime && r.cliVersion && r.instructionsVersion), "run rows carry agent/runtime/CLI/model/instructions");
});

test("dual dispatch during cold start: first pass merges, the other is only recorded", () => {
  const fx = makeFixture({ orders: [page("P2", 8)], config: { cheapTier: { enabled: true, coldStartRuns: 10 }, audit: { coldRate: 0, normalRate: 0 }, regressionEvery: 100 } });
  recorded(fx, "P2");
  node(fx, "tick.mjs", ["tick"]);
  const ts = restoreTasks(fx);
  assert.equal(ts.length, 2, "two tasks");
  const byFam = Object.fromEntries(ts.map((t) => [meta(fx, t.id).family, t]));
  assert.ok(byFam.deepseek && byFam.zhipu);
  assert.equal(meta(fx, byFam.deepseek.id).twin, byFam.zhipu.id);
  assert.equal(meta(fx, byFam.deepseek.id).branch, "restore/P2-a1-d");
  assert.equal(meta(fx, byFam.zhipu.id).branch, "restore/P2-a1-g");
  const ledger = readJson(path.join(fx.state, "ledger", "tasks.json"));
  assert.deepEqual([...ledger.wos.P2.twins].sort(), ts.map((t) => t.id).sort(), "both tasks recorded together");

  deliver(fx, byFam.zhipu.id, { "apps/portal/src/views/P2/index.vue": vue("glm") });
  deliver(fx, byFam.deepseek.id, { "apps/portal/src/views/P2/index.vue": vue("ds") });
  gate(fx, byFam.zhipu.id, { pass: true });
  assert.equal(issue(fx, byFam.zhipu.id).status, "done");
  const shaAfterFirst = lsRemote(fx, "app", "integration");
  gate(fx, byFam.deepseek.id, { pass: true });
  assert.equal(issue(fx, byFam.deepseek.id).status, "cancelled");
  assert.equal(lsRemote(fx, "app", "integration"), shaAfterFirst, "second twin not merged");
  assert.equal(showRemote(fx, "app", "integration", "apps/portal/src/views/P2/index.vue"), vue("glm"));
  const cap = readJson(path.join(fx.state, "ledger", "capability.json"));
  const fams = Object.values(cap.keys).map((k) => k.family).sort();
  assert.deepEqual(fams, ["deepseek", "zhipu"], "both twins counted in capability");
});

test("twin fails while the other is still running → only recorded; page order touching the public library is refused", () => {
  const fx = makeFixture({ orders: [page("P2", 8)], config: { cheapTier: { enabled: true, coldStartRuns: 10 }, audit: { coldRate: 0 }, regressionEvery: 100 } });
  recorded(fx, "P2");
  node(fx, "tick.mjs", ["tick"]);
  const byFam = Object.fromEntries(restoreTasks(fx).map((t) => [meta(fx, t.id).family, t]));
  deliver(fx, byFam.deepseek.id, { "apps/portal/src/views/P2/index.vue": vue("ds") });
  gate(fx, byFam.deepseek.id, { pass: false, stage: "build", failed: ["vite"] });
  assert.equal(issue(fx, byFam.deepseek.id).status, "cancelled", "failing twin cancelled while the other runs");
  deliver(fx, byFam.zhipu.id, { "apps/portal/src/views/P2/index.vue": vue("glm"), "apps/portal/src/shared/Dict.vue": "<template>hacked</template>\n" });
  const before = lsRemote(fx, "app", "integration");
  gate(fx, byFam.zhipu.id, { pass: true });
  assert.equal(lsRemote(fx, "app", "integration"), before, "not merged");
  assert.equal(issue(fx, byFam.zhipu.id).assignee_id, fx.id("fixer"), "forbidden paths → failure rules (fixer)");
  assert.match(fakeState(fx).issues[byFam.zhipu.id].comments.map((c) => c.content).join("\n"), /合并被拒/);
});

test("pending record → wait, recording done → back to the gate", () => {
  const fx = makeFixture({ orders: [page("P8", 12)], config: { audit: { coldRate: 0 } } });
  // no baseline: tick also opens a record task
  node(fx, "tick.mjs", ["tick"]);
  const rec = issuesOf(fx).find((i) => i.title.startsWith("[record]"));
  assert.ok(rec, "record task dispatched");
  assert.equal(rec.assignee_id, fx.id("recorder"));
  const [t] = restoreTasks(fx);
  deliver(fx, t.id, { "apps/portal/src/views/P8/index.vue": vue("p8") });
  gate(fx, t.id, { pending: "record" });
  assert.equal(meta(fx, t.id).waitRecord, true);
  assert.equal(issuesOf(fx).filter((i) => i.title.startsWith("[record]")).length, 1, "no duplicate record task");
  setMeta(fx, rec.id, "record", "ok");
  mc(fx, "issue", "update", rec.id, "--status", "done", "--no-start");
  const runsBefore = issue(fx, t.id).runs.length;
  node(fx, "tick.mjs", ["tick"]);
  assert.equal(meta(fx, t.id).waitRecord, false);
  assert.equal(issue(fx, t.id).runs.length, runsBefore + 1, "gate rerun");
});

// HM-1131: a recording is there but the gate can't use it (script changed, baseline refresh failed). Before, recorded()
// stayed true, so every tick sent the task back to the gate and the gate said pending:record again.
test("pending record on a stale recording: a new record attempt, no regate until it is done, same reason twice → arbiter", () => {
  const fx = makeFixture({ orders: [page("P9", 12)], config: { audit: { coldRate: 0 } } });
  recorded(fx, "P9");
  node(fx, "tick.mjs", ["tick"]);
  const [t] = restoreTasks(fx);
  deliver(fx, t.id, { "apps/portal/src/views/P9/index.vue": vue("p9") });
  const why = "interaction script changed since the baseline";
  let r = gate(fx, t.id, { pending: "record", missingTotal: 1, byReason: { [why]: 1 }, missing: ["P9"], attempt: 1 });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(meta(fx, t.id).waitRecord, true);
  assert.deepEqual(meta(fx, t.id).recordPending, { why, n: 1, key: "1.g1" });
  const recs = () => issuesOf(fx).filter((i) => i.title.startsWith("[record] P9"));
  assert.equal(recs().length, 1, "the stale recording gets a new record attempt");
  // the same verdict advanced again (a retried handoff) counts once and opens nothing
  r = node(fx, "tick.mjs", ["advance", t.id]);
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(meta(fx, t.id).recordPending.n, 1);
  assert.equal(meta(fx, t.id).kind, "restore");
  assert.equal(recs().length, 1);
  // that attempt is cancelled (fast-lane login-ok, by hand): the page has a recording, so dispatchRecords would skip it —
  // the waiting task opens the next attempt
  mc(fx, "issue", "update", recs()[0].id, "--status", "cancelled", "--no-start");
  node(fx, "tick.mjs", ["tick"]);
  assert.equal(recs().length, 2, "cancelled attempt replaced");
  assert.equal(meta(fx, t.id).waitRecord, true);
  node(fx, "tick.mjs", ["tick"]);
  assert.equal(recs().length, 2, "replaced once");
  const rec = recs().find((x) => x.status !== "cancelled");
  assert.equal(rec.assignee_id, fx.id("recorder"));
  assert.match(issue(fx, t.id).comments.map((c) => c.content).join("\n"), /重新录制 P9/);

  // the loop: the old baseline is still there, but no tick sends the task back to the gate before the new recording
  const runs0 = issue(fx, t.id).runs.length;
  for (let k = 0; k < 2; k++) {
    r = node(fx, "tick.mjs", ["tick"]);
    assert.ok(!(r.actions || []).some((a) => a.startsWith("record ready")), JSON.stringify(r.actions));
  }
  assert.equal(meta(fx, t.id).waitRecord, true);
  assert.equal(issue(fx, t.id).runs.length, runs0, "no gate rerun on the old recording");
  assert.equal(recs().length, 2, "no further record task while one is open");

  // the new recording is done → back to the gate once
  setMeta(fx, rec.id, "record", "ok");
  mc(fx, "issue", "update", rec.id, "--status", "done", "--no-start");
  r = node(fx, "tick.mjs", ["tick"]);
  assert.ok((r.actions || []).includes(`record ready → regate ${t.id}`), JSON.stringify(r.actions));
  assert.equal(meta(fx, t.id).waitRecord, false);
  assert.equal(meta(fx, t.id).waitRecordFrom, undefined);
  assert.equal(issue(fx, t.id).runs.length, runs0 + 1, "gate rerun");
  node(fx, "tick.mjs", ["tick"]);
  assert.equal(issue(fx, t.id).runs.length, runs0 + 1, "once");

  // same reason again: recording didn't fix it → arbiter, nothing re-sent
  r = gate(fx, t.id, { pending: "record", missingTotal: 1, byReason: { [why]: 1 }, missing: ["P9"], attempt: 1 });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.ok(r.anomalies.some((a) => a.issue === t.id && /连续 2 次 PENDING record/.test(a.what)), JSON.stringify(r.anomalies));
  assert.equal(meta(fx, t.id).kind, "arbitrate");
  assert.equal(meta(fx, t.id).waitRecord, false);
  assert.equal(issue(fx, t.id).assignee_id, fx.id("arbiter"));
  assert.match(lastComment(fx, t.id), /连续 2 次 PENDING record.*不再自动重送/);
  assert.equal(recs().length, 2, "no further recording");
  const runs1 = issue(fx, t.id).runs.length;
  r = node(fx, "tick.mjs", ["tick"]);
  assert.ok(!(r.actions || []).some((a) => a.includes(t.id) && /regate/.test(a)), JSON.stringify(r.actions));
  assert.equal(issue(fx, t.id).assignee_id, fx.id("arbiter"));
  assert.equal(issue(fx, t.id).runs.length, runs1);
  // the arbiter's manual --regate starts the count again
  r = node(fx, "tick.mjs", ["advance", t.id, "--regate"]);
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(meta(fx, t.id).recordPending, undefined);
  assert.equal(issue(fx, t.id).assignee_id, fx.id("gate"));
});

test("pending record: a different reason starts the count again; a real verdict clears it; rerecord waits for its own recording", () => {
  const fx = makeFixture({ orders: [page("PA", 12)], config: { audit: { coldRate: 0 } } });
  recorded(fx, "PA");
  node(fx, "tick.mjs", ["tick"]);
  const [t] = restoreTasks(fx);
  deliver(fx, t.id, { "apps/portal/src/views/PA/index.vue": vue("pa") });
  const done = (rec) => { setMeta(fx, rec.id, "record", "ok"); mc(fx, "issue", "update", rec.id, "--status", "done", "--no-start"); };
  const recs = () => issuesOf(fx).filter((i) => i.title.startsWith("[record] PA"));
  // full gate output (missing[].why), page-specific detail after the colon ignored
  gate(fx, t.id, { pending: "record", missing: [{ wo: "PA", why: "baseline refresh failed: timeout" }], attempt: 1 });
  assert.deepEqual(meta(fx, t.id).recordPending, { why: "baseline refresh failed", n: 1, key: "1.g1" });
  done(recs().at(-1));
  node(fx, "tick.mjs", ["tick"]);
  assert.equal(meta(fx, t.id).waitRecord, false);
  gate(fx, t.id, { pending: "record", missing: [{ wo: "PA", why: "HAR changed since the baseline" }], attempt: 1 });
  assert.deepEqual(meta(fx, t.id).recordPending, { why: "HAR changed since the baseline", n: 1, key: "1.g2" }, "another reason: not a loop");
  assert.equal(meta(fx, t.id).kind, "restore");
  assert.equal(recs().length, 2, "a second record attempt");
  assert.equal(meta(fx, recs().at(-1).id).attempt, 2);
  done(recs().at(-1));
  node(fx, "tick.mjs", ["tick"]);
  gate(fx, t.id, { pass: false, stage: "browser", failed: [{ check: "dom", where: "x" }] });
  assert.equal(meta(fx, t.id).recordPending, undefined, "a real verdict ends the run");

  // arbiter's rerecord: the task waits for the new attempt, not for the ok of the older ones
  setMeta(fx, t.id, "kind", "restore");
  mc(fx, "issue", "update", t.id, "--status", "in_review", "--assignee-id", fx.id("gate"), "--no-start");
  const r = node(fx, "tick.mjs", ["rerecord", "PA"]);
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(recs().length, 3);
  assert.equal(meta(fx, recs().at(-1).id).attempt, 3);
  node(fx, "tick.mjs", ["tick"]);
  assert.equal(meta(fx, t.id).waitRecord, true, "older ok record tasks don't count");
  done(recs().at(-1));
  node(fx, "tick.mjs", ["tick"]);
  assert.equal(meta(fx, t.id).waitRecord, false);
});

// HM-1181: an integration task's pending:record only raised an anomaly; no record task was opened (dispatchRecords skips
// a page whose ledger `record` is set) and every tick re-advanced the same verdict, so the rule regressions never ran.
test("integration pending record: regression exceptions leave the page set, the rest are recorded, then back to the gate; same reason twice → incident", () => {
  const ids = ["IA", "IB", "IC", "ID", "IE", "IX"];
  const fx = makeFixture({ orders: ids.map((id) => page(id, 10, { accepted: true })), config: {} });
  recorded(fx, "IA", "IB", "ID", "IE", "IX");
  mkdirSync(path.join(fx.tool, "tools"), { recursive: true });
  const exceptions = (pages) => writeFileSync(path.join(fx.tool, "tools", "regression-exceptions.json"), JSON.stringify({ pages: Object.fromEntries(pages.map((w) => [w, { why: "test", evidence: "x.js:1:1", by: "test" }])) }));
  exceptions(["IX"]);
  git(fx.tool, "checkout", "-q", "-b", "rules/ri");
  writeFileSync(path.join(fx.tool, "rules.json"), JSON.stringify({ rules: ["base", "attr-order"] }));
  git(fx.tool, "add", "rules.json"); git(fx.tool, "commit", "-q", "-m", "rule ri"); git(fx.tool, "push", "-q", "origin", "rules/ri");
  node(fx, "tick.mjs", ["open-rule-review", "rules/ri"]);
  for (const i of issuesOf(fx).filter((x) => x.title.includes("rules/ri"))) setMeta(fx, i.id, `review.${i.assignee_id}`, { verdict: "approve", why: "equivalent" });
  node(fx, "tick.mjs", ["tick"]);
  const reg = issuesOf(fx).find((i) => i.title.startsWith("[integration] rule-regression"));
  assert.ok(reg, "rule regression created");
  assert.deepEqual(meta(fx, reg.id).workOrders, ["IA", "IB", "IC", "ID", "IE"], "a regression exception is not in the page set");
  const recs = (w) => issuesOf(fx).filter((i) => i.title.startsWith(`[record] ${w}`));
  const done = (rec) => { setMeta(fx, rec.id, "record", "ok"); mc(fx, "issue", "update", rec.id, "--status", "done", "--no-start"); };
  assert.equal(recs("IC").length, 1, "IC has no recording: dispatchRecords opened one");

  // verdict: IC no baseline, ID stale, IE now a regression exception; the full list is in the gate's detail file
  exceptions(["IX", "IE"]);
  const why = { IC: "no baseline", ID: "interaction script changed since the baseline", IE: "no baseline" };
  const detail = path.join(fx.state, "gate", `pending-${reg.id}-a1.json`);
  writeFileSync(detail, JSON.stringify({ pending: "record", missing: Object.entries(why).map(([wo, w]) => ({ wo, why: w })), attempt: 1 }));
  const verdict = { pending: "record", missingTotal: 3, byReason: { "no baseline": 2, [why.ID]: 1 }, missing: ["IC"], missingTruncated: true, attempt: 1, detail };
  const runs0 = issue(fx, reg.id).runs.length;
  let r = gate(fx, reg.id, verdict);
  assert.equal(r.ok, true, JSON.stringify(r));
  let m = meta(fx, reg.id);
  assert.deepEqual(m.workOrders, ["IA", "IB", "IC", "ID"], "the exception leaves the task's page set");
  assert.equal(m.waitRecord, true);
  assert.deepEqual(Object.keys(m.waitRecordFrom).sort(), ["IC", "ID"], "waits for the named pages only (full list from the detail file)");
  assert.equal(m.advanced, "1.g0", "the verdict is handled: the fallback does not re-advance it every tick");
  assert.equal(recs("IC").length, 1, "IC's open record task is reused");
  assert.equal(recs("ID").length, 1, "ID's stale recording gets a new record attempt");
  assert.equal(recs("IE").length, 0, "no recording for an exception");
  assert.match(lastComment(fx, reg.id), /等录制：IC、ID.*回归例外不再测：IE/);

  // nothing re-sent before the recordings are done; no duplicate record tasks
  r = node(fx, "tick.mjs", ["tick"]);
  assert.ok(!(r.actions || []).some((a) => a.includes(reg.id)), JSON.stringify(r.actions));
  assert.equal(issue(fx, reg.id).runs.length, runs0);
  assert.equal(recs("IC").length + recs("ID").length, 2);
  done(recs("IC")[0]);
  node(fx, "tick.mjs", ["tick"]);
  assert.equal(meta(fx, reg.id).waitRecord, true, "ID still recording");
  done(recs("ID")[0]);
  r = node(fx, "tick.mjs", ["tick"]);
  assert.ok((r.actions || []).includes(`record ready → regate ${reg.id}`), JSON.stringify(r.actions));
  m = meta(fx, reg.id);
  assert.equal(m.waitRecord, false);
  assert.equal(m[`gate.1`], undefined, "old verdict dropped");
  assert.equal(issue(fx, reg.id).runs.length, runs0 + 1, "gate rerun");

  // ID once more (another reason: counted from 1, recorded again), then the same reason again: recording didn't fix
  // it → incident for the arbiter, nothing re-sent, no further recording
  writeFileSync(detail, JSON.stringify({ pending: "record", missing: [{ wo: "ID", why: why.ID }], attempt: 1 }));
  r = gate(fx, reg.id, { pending: "record", missingTotal: 1, byReason: { [why.ID]: 1 }, missing: ["ID"], attempt: 1, detail });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(meta(fx, reg.id).recordPending.n, 1);
  assert.equal(recs("ID").length, 2);
  done(recs("ID").find((i) => i.status !== "done"));
  node(fx, "tick.mjs", ["tick"]);
  assert.equal(meta(fx, reg.id).waitRecord, false);
  writeFileSync(detail, JSON.stringify({ pending: "record", missing: [{ wo: "ID", why: why.ID }], attempt: 1 }));
  r = gate(fx, reg.id, { pending: "record", missingTotal: 1, byReason: { [why.ID]: 1 }, missing: ["ID"], attempt: 1, detail });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.ok(issuesOf(fx).some((i) => i.title.startsWith("[incident]") && i.assignee_id === fx.id("arbiter") && i.title.includes(reg.id)), "incident opened");
  m = meta(fx, reg.id);
  assert.equal(m.waitRecord, false);
  assert.equal(m.recordPending.n, 2);
  assert.match(lastComment(fx, reg.id), /连续 2 次 PENDING record.*裁定员/);
  assert.equal(meta(fx, reg.id).kind, "integration", "stays an integration task");
  assert.equal(recs("ID").length, 2, "no further recording");
  const runs1 = issue(fx, reg.id).runs.length;
  r = node(fx, "tick.mjs", ["tick"]);
  assert.ok(!(r.actions || []).some((a) => a.includes(reg.id)), JSON.stringify(r.actions));
  assert.equal(issue(fx, reg.id).runs.length, runs1);
});

test("integration pending record: a verdict whose full list is gone is re-gated once; a baseline newer than the verdict needs no recording", () => {
  const fx = makeFixture({ orders: ["JA", "JB"].map((id) => page(id, 10, { accepted: true })), config: {} });
  recorded(fx, "JA", "JB");
  const c = mc(fx, "issue", "create", "--title", "[integration] regression (2 页)", "--status", "todo", "--assignee-id", fx.id("gate"), "--output", "json");
  for (const [k, v] of Object.entries({ kind: "integration", purpose: "lib-regression", workOrders: ["JA", "JB"], sha: "", attempt: 1 })) setMeta(fx, c.id, k, v);
  const runs0 = issue(fx, c.id).runs.length;
  // sample only, detail file on another machine
  let r = gate(fx, c.id, { pending: "record", missingTotal: 2, byReason: { "no baseline": 2 }, missing: ["JA"], missingTruncated: true, attempt: 1, detail: "/nowhere/pending.json" });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(issue(fx, c.id).runs.length, runs0 + 1, "re-gated for a fresh verdict");
  assert.equal(issuesOf(fx).filter((i) => i.title.startsWith("[record]")).length, 0, "nothing recorded on a sample");
  // full list, but JB's baseline was rewritten after the verdict: only JA is recorded
  const detail = path.join(fx.state, "gate", `pending-${c.id}-a1.json`);
  writeFileSync(detail, JSON.stringify({ pending: "record", missing: [{ wo: "JA", why: "no baseline" }, { wo: "JB", why: "no baseline" }], attempt: 1 }));
  const later = new Date(Date.now() + 60_000);
  writeFileSync(path.join(fx.state, "baseline", "JB", "baseline.json"), "{}");
  utimesSync(path.join(fx.state, "baseline", "JB", "baseline.json"), later, later);
  r = gate(fx, c.id, { pending: "record", missingTotal: 2, byReason: { "no baseline": 2 }, missing: ["JA", "JB"], attempt: 1, detail });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.deepEqual(Object.keys(meta(fx, c.id).waitRecordFrom), ["JA"]);
  assert.deepEqual(issuesOf(fx).filter((i) => i.title.startsWith("[record]")).map((i) => i.title), ["[record] JA"]);
});

// A restore task opened on an npm order before HM-1170 (dispatch skips them now): dispatched while the order was not
// marked npm, then the order is put back as it is in queue/.
const legacyNpmTask = (fx, wo) => {
  const f = path.join(fx.tool, "queue", `${wo.id}.json`);
  writeFileSync(f, JSON.stringify({ ...wo, status: "todo" }));
  node(fx, "tick.mjs", ["tick"]);
  writeFileSync(f, JSON.stringify(wo));
  const t = restoreTasks(fx).find((i) => meta(fx, i.id).workOrders.includes(wo.id));
  assert.ok(t, `legacy restore task on ${wo.id}`);
  return t;
};

test("shared / npm orders never get a record task (HM-1124)", () => {
  const npm = { id: "shared.portal.vue-countup-v3", type: "shared", status: "npm", kb: 7, app: "portal", site: "portal", npm: "vue-countup-v3", deps: [] };
  const fx = makeFixture({ orders: [page("P9", 12), npm, page("P10", 11, { status: "npm" })], config: { audit: { coldRate: 0 } } });
  node(fx, "tick.mjs", ["tick"]);
  const recs = () => issuesOf(fx).filter((i) => i.title.startsWith("[record]"));
  assert.deepEqual(recs().map((i) => meta(fx, i.id).workOrders).flat(), ["P9"], "only the page is recorded");
  assert.deepEqual(restoreTasks(fx).flatMap((i) => meta(fx, i.id).workOrders), ["P9"], "no restore task on npm orders (HM-1170)");
  // a restore task on the npm order (from before HM-1170) that the gate sends to "pending record": no record task, and
  // no endless wait either — the arbiter gets it (HM-1131)
  const t = legacyNpmTask(fx, npm);
  setMeta(fx, t.id, `gate.${meta(fx, t.id).attempt}`, { pending: "record" });
  const r = node(fx, "tick.mjs", ["advance", t.id]);
  assert.equal(recs().length, 1, "no record task for the npm order");
  assert.ok((r.anomalies || []).some((a) => a.what.includes(npm.id)), JSON.stringify(r.anomalies));
  assert.notEqual(meta(fx, t.id).waitRecord, true, "not left waiting");
  assert.equal(meta(fx, t.id).kind, "arbitrate");
  assert.equal(issue(fx, t.id).assignee_id, fx.id("arbiter"));
  assert.match(lastComment(fx, t.id), /不录制的共享库\/npm 工单/);
  const rr = node(fx, "tick.mjs", ["rerecord", npm.id]);
  assert.equal(rr.ok, false);
  assert.equal(recs().length, 1, "rerecord refuses the npm order");
});

test("a task left waiting for an npm order (before HM-1124) goes to the arbiter on the next tick (HM-1131)", () => {
  const npm = { id: "shared.portal.vue3-seamless-scroll", type: "shared", status: "npm", kb: 7, app: "portal", site: "portal", npm: "vue3-seamless-scroll", deps: [] };
  const fx = makeFixture({ orders: [npm], config: { audit: { coldRate: 0 } } });
  const t = legacyNpmTask(fx, npm);
  mc(fx, "issue", "metadata", "set", t.id, "--key", "waitRecord", "--type", "bool", "--value", "true"); // as tick writes it
  mc(fx, "issue", "update", t.id, "--status", "in_review", "--assignee-id", fx.id("gate"), "--no-start");
  const r = node(fx, "tick.mjs", ["tick"]);
  assert.ok((r.actions || []).includes(`unrecordable wait → arbiter ${t.id}`), JSON.stringify(r.actions));
  assert.ok((r.anomalies || []).some((a) => a.issue === t.id && a.what.includes(npm.id)), JSON.stringify(r.anomalies));
  assert.equal(meta(fx, t.id).waitRecord, false);
  assert.equal(issue(fx, t.id).assignee_id, fx.id("arbiter"));
  assert.equal(issuesOf(fx).filter((i) => i.title.startsWith("[record]")).length, 0);
});

test("npm replacements never get a restore task, and their cancelled restore tasks stay cancelled (HM-1170)", () => {
  const countup = { id: "shared.portal.vue-countup-v3", type: "shared", status: "npm", kb: 7.4, app: "portal", site: "portal", npm: "vue-countup-v3", deps: {} };
  const scroll = { id: "shared.portal.vue3-seamless-scroll", type: "shared", status: "npm", kb: 5.2, app: "portal", site: "portal", npm: "vue3-seamless-scroll", deps: {} };
  const fx = makeFixture({ orders: [countup, scroll, page("P11", 12)], config: { audit: { coldRate: 0 } } });
  let r = node(fx, "tick.mjs", ["tick"]);
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.deepEqual(restoreTasks(fx).flatMap((i) => meta(fx, i.id).workOrders), ["P11"], "only the page is dispatched");

  // the two tasks opened before the fix (HM-1084 / HM-1085), cancelled by the sprint supervisor
  const old = [legacyNpmTask(fx, countup), legacyNpmTask(fx, scroll)];
  for (const t of old) mc(fx, "issue", "update", t.id, "--status", "cancelled", "--no-start");
  const before = restoreTasks(fx).length;
  for (let k = 0; k < 3; k++) { r = node(fx, "tick.mjs", ["tick"]); assert.equal(r.ok, true, JSON.stringify(r)); }
  assert.equal(restoreTasks(fx).length, before, "no new attempt on the npm orders");
  for (const t of old) {
    for (const args of [["advance", t.id], ["advance", t.id, "--regate"]]) {
      const a = node(fx, "tick.mjs", args);
      assert.equal(a.ok, false, JSON.stringify(a));
      assert.match(a.summary, /npm replacement/);
    }
    assert.equal(issue(fx, t.id).status, "cancelled", `${t.id} stays cancelled`);
  }
  assert.equal(issuesOf(fx).filter((i) => i.title.startsWith("[record]") && meta(fx, i.id).workOrders.some((w) => w.startsWith("shared."))).length, 0, "and no record task");
});

test("packed small pages: per-page verdicts, passing pages merged, failing page split off", () => {
  const fx = makeFixture({ orders: [page("S-a", 2), page("S-b", 3), page("S-c", 4)], config: { audit: { coldRate: 0 }, regressionEvery: 100 } });
  recorded(fx, "S-a", "S-b", "S-c");
  node(fx, "tick.mjs", ["tick"]);
  const ts = restoreTasks(fx);
  assert.equal(ts.length, 1, "3 small pages → one pack");
  const m = meta(fx, ts[0].id);
  assert.equal(m.workOrders.length, 3);
  deliver(fx, ts[0].id, { "apps/portal/src/views/S-a/index.vue": vue("a"), "apps/portal/src/views/S-b/index.vue": vue("b"), "apps/portal/src/views/S-c/index.vue": vue("c") });
  gate(fx, ts[0].id, { pass: false, pages: { "S-a": { pass: true }, "S-b": { pass: false, failed: ["dom"] }, "S-c": { pass: true } } });
  assert.equal(showRemote(fx, "app", "integration", "apps/portal/src/views/S-a/index.vue"), vue("a"));
  assert.equal(showRemote(fx, "app", "integration", "apps/portal/src/views/S-c/index.vue"), vue("c"));
  assert.equal(showRemote(fx, "app", "integration", "apps/portal/src/views/S-b/index.vue"), null, "failing page dropped from the merge");
  const split = restoreTasks(fx).find((t) => t.id !== ts[0].id);
  assert.ok(split, "failing page re-dispatched");
  assert.deepEqual(meta(fx, split.id).workOrders, ["S-b"]);
  assert.equal(issue(fx, ts[0].id).status, "done");
});

test("needsFromSkeleton → upgrade order, page suspended; upgrade merged → lib regression + page re-dispatched; lib regression fails → revert", () => {
  const fx = makeFixture({ orders: [page("P3", 12), page("P4", 12, { accepted: true }), { id: "S1", type: "shared", kb: 6, app: "portal", files: ["apps/portal/src/shared/Dict.vue"] }], config: { audit: { coldRate: 0 }, regressionEvery: 100 } });
  recorded(fx, "P3");
  // S1 is already restored (state done) so it isn't dispatched
  writeFileSync(path.join(fx.state, "ledger", "tasks.json"), JSON.stringify({ wos: { S1: { state: "done", tasks: [] } }, tasks: {}, seq: 0 }));
  node(fx, "tick.mjs", ["tick"]);
  const [t] = restoreTasks(fx);
  deliver(fx, t.id, { "apps/portal/src/views/P3/index.vue": vue("p3") }, { receipt: { needsFromSkeleton: ["Dict 缺 size 属性"] } });
  gate(fx, t.id, { pass: false, stage: "browser", failed: ["dom"] });
  assert.equal(issue(fx, t.id).status, "backlog", "page suspended");
  const up = issuesOf(fx).find((i) => i.title.startsWith("[upgrade]"));
  assert.ok(up, "upgrade order opened");
  assert.equal(up.assignee_id, fx.id("opus-mac"));
  assert.equal(meta(fx, t.id).suspendedBy, up.id);

  deliver(fx, up.id, { "apps/portal/src/shared/Dict.vue": "<template><span>dict v2</span></template>\n" });
  const r = gate(fx, up.id, { pass: true });
  assert.equal(r.ok, true, JSON.stringify(r));
  const libSha = lsRemote(fx, "app", "integration");
  assert.match(showRemote(fx, "app", "integration", "apps/portal/src/shared/Dict.vue"), /v2/);
  const reg = issuesOf(fx).find((i) => i.title.startsWith("[integration] lib-regression"));
  assert.ok(reg, "lib regression for pages depending on Dict.vue");
  assert.deepEqual(meta(fx, reg.id).workOrders, ["P4"]);
  assert.equal(issue(fx, t.id).status, "todo", "suspended page re-dispatched");
  assert.equal(meta(fx, t.id).attempt, 2);

  setMeta(fx, reg.id, "gate.1", { pass: false, failed: ["P4"] });
  node(fx, "tick.mjs", ["advance", reg.id]);
  assert.match(showRemote(fx, "app", "integration", "apps/portal/src/shared/Dict.vue"), /v1/, "lib merge reverted");
  assert.notEqual(lsRemote(fx, "app", "integration"), libSha);
  assert.equal(issue(fx, up.id).assignee_id, fx.id("fixer"), "upgrade back through failure rules");
});

test("integration regression every N merges: failure bisects to the culprit, reverts it; next regression fast-forwards main", () => {
  const fx = makeFixture({ orders: [page("P5", 20), page("P6", 10)], config: { audit: { coldRate: 0 }, regressionEvery: 2 } });
  recorded(fx, "P5", "P6");
  node(fx, "tick.mjs", ["tick"]);
  const ts = restoreTasks(fx);
  assert.equal(ts.length, 2);
  const byWo = Object.fromEntries(ts.map((t) => [meta(fx, t.id).workOrders[0], t]));
  for (const wo of ["P5", "P6"]) { deliver(fx, byWo[wo].id, { [`apps/portal/src/views/${wo}/index.vue`]: vue(wo) }); gate(fx, byWo[wo].id, { pass: true }); }
  const mainBefore = lsRemote(fx, "app", "main");
  node(fx, "tick.mjs", ["tick"]);
  const reg = issuesOf(fx).find((i) => i.title.startsWith("[integration] regression"));
  assert.ok(reg, "regression opened after 2 merges");
  setMeta(fx, reg.id, "gate.1", { pass: false, failed: [] }); // gate didn't say which pages failed → test all present ones
  node(fx, "tick.mjs", ["advance", reg.id]);
  const b1 = issuesOf(fx).find((i) => i.title.startsWith("[integration] bisect"));
  assert.ok(b1, "bisect step");
  assert.deepEqual(meta(fx, b1.id).workOrders, ["P5"], "only pages already merged at the tested commit");
  setMeta(fx, b1.id, "gate.1", { pass: true });
  node(fx, "tick.mjs", ["advance", b1.id]);
  assert.equal(showRemote(fx, "app", "integration", "apps/portal/src/views/P6/index.vue"), null, "culprit (P6 merge) reverted");
  assert.equal(showRemote(fx, "app", "integration", "apps/portal/src/views/P5/index.vue"), vue("P5"));
  assert.equal(issue(fx, byWo.P6.id).status, "todo", "P6 reopened");
  assert.equal(lsRemote(fx, "app", "main"), mainBefore, "main untouched");
  node(fx, "tick.mjs", ["tick"]);
  const reg2 = issuesOf(fx).filter((i) => i.title.startsWith("[integration] regression")).find((i) => i.id !== reg.id);
  assert.ok(reg2, "regression re-run after the revert");
  setMeta(fx, reg2.id, "gate.1", { pass: true });
  node(fx, "tick.mjs", ["advance", reg2.id]);
  assert.equal(lsRemote(fx, "app", "main"), lsRemote(fx, "app", "integration"), "main fast-forwarded");
});

test("readability sample: a passed integration regression posts 5 % of the batch (at least one page) to the log task; the switch turns it off", () => {
  for (const enabled of [true, false]) {
    const fx = makeFixture({ orders: [page("Q1", 20), page("Q2", 10)], config: { audit: { coldRate: 0 }, regressionEvery: 2, readabilitySample: { enabled } } });
    const log = mc(fx, "issue", "create", "--title", "调度日志", "--project", "proj-1");
    const cfgFile = path.join(fx.state, "scheduler.config.json"); const cfg = readJson(cfgFile); writeFileSync(cfgFile, JSON.stringify({ ...cfg, logIssueId: log.id }));
    recorded(fx, "Q1", "Q2");
    node(fx, "tick.mjs", ["tick"]);
    const byWo = Object.fromEntries(restoreTasks(fx).map((t) => [meta(fx, t.id).workOrders[0], t]));
    for (const wo of ["Q1", "Q2"]) { deliver(fx, byWo[wo].id, { [`apps/portal/src/views/${wo}/index.vue`]: vue(wo) }); gate(fx, byWo[wo].id, { pass: true }); }
    node(fx, "tick.mjs", ["tick"]);
    const reg = issuesOf(fx).find((i) => i.title.startsWith("[integration] regression"));
    setMeta(fx, reg.id, "gate.1", { pass: true });
    const r = node(fx, "tick.mjs", ["advance", reg.id]);
    assert.equal(r.ok, true, JSON.stringify(r));
    const posted = issue(fx, log.id).comments.map((c) => c.content).filter((c) => c.includes("可读性抽检"));
    if (!enabled) { assert.equal(posted.length, 0, "switch off → nothing posted"); continue; }
    assert.equal(posted.length, 1, "one sample comment on the log task");
    assert.match(posted[0], /本批通过的页面 2 页，按 5% 抽 1 页/); assert.match(posted[0], /评分表/); assert.match(posted[0], /\| `Q[12]` \|/);
    assert.ok(readJson(path.join(fx.state, "readability", `${fs_key(posted[0])}.json`)), "sample saved in $RESTORE_STATE/readability");
  }
});
const fs_key = (text) => text.match(/可读性抽检 `([^`]+)`/)[1];

test("rule change review: two non-arbiter families; round 2 reject escalates to the human; approval merges + regression", () => {
  const fx = makeFixture({ orders: [], config: {} });
  git(fx.tool, "checkout", "-q", "-b", "rules/r1");
  writeFileSync(path.join(fx.tool, "rules.json"), JSON.stringify({ rules: ["base", "collapse-empty-comment"] }));
  git(fx.tool, "commit", "-q", "-am", "rule r1"); git(fx.tool, "push", "-q", "origin", "rules/r1");
  let r = node(fx, "tick.mjs", ["open-rule-review", "rules/r1"]);
  assert.equal(r.ok, true, JSON.stringify(r));
  let reviews = issuesOf(fx).filter((i) => i.title.startsWith("[rule-review]"));
  assert.deepEqual(reviews.map((i) => i.assignee_id).sort(), [fx.id("review-deepseek"), fx.id("review-glm")]);
  // the key the task tells the reviewer is the one the scheduler reads; the roster name ("复核-GLM@Mac") is refused
  for (const i of reviews) assert.ok(i.description.includes(`\`review.${i.assignee_id}\``), i.description);
  assert.throws(() => setMeta(fx, reviews[0].id, "review.复核-GLM@Mac", { verdict: "approve" }), /invalid metadata key/);
  setMeta(fx, reviews.find((i) => i.assignee_id === fx.id("review-deepseek")).id, `review.${fx.id("review-deepseek")}`, { verdict: "approve", why: "ok" });
  setMeta(fx, reviews.find((i) => i.assignee_id === fx.id("review-glm")).id, `review.${fx.id("review-glm")}`, { verdict: "reject", why: "swallows real diffs" });
  node(fx, "tick.mjs", ["tick"]);
  assert.ok(issuesOf(fx).find((i) => i.title.startsWith("[incident]") && i.assignee_id === fx.id("arbiter")), "round 1 reject → back to the arbiter");
  r = node(fx, "tick.mjs", ["open-rule-review", "rules/r1"]);
  reviews = issuesOf(fx).filter((i) => i.title.includes(" r2 "));
  assert.equal(reviews.length, 2);
  for (const i of reviews) setMeta(fx, i.id, `review.${i.assignee_id}`, { verdict: i.assignee_id === fx.id("review-glm") ? "reject" : "approve", why: "x" });
  node(fx, "tick.mjs", ["tick"]);
  const blocked = issuesOf(fx).find((i) => i.status === "blocked");
  assert.ok(blocked, "escalated");
  assert.equal(blocked.assignee_id, "member-human");

  git(fx.tool, "checkout", "-q", "main"); git(fx.tool, "checkout", "-q", "-b", "rules/r2");
  writeFileSync(path.join(fx.tool, "rules.json"), JSON.stringify({ rules: ["base", "attr-order"] }));
  git(fx.tool, "commit", "-q", "-am", "rule r2"); git(fx.tool, "push", "-q", "origin", "rules/r2");
  node(fx, "tick.mjs", ["open-rule-review", "rules/r2"]);
  for (const i of issuesOf(fx).filter((x) => x.title.includes("rules/r2"))) setMeta(fx, i.id, `review.${i.assignee_id}`, { verdict: "approve", why: "equivalent" });
  node(fx, "tick.mjs", ["tick"]);
  assert.match(showRemote(fx, "tool", "main", "rules.json"), /attr-order/, "approved rule merged into tool main");
});

test("rate-limited run → agent cooldown, reassigned within the family; unknown error → anomaly", () => {
  // a second DeepSeek restorer (same model) so there is someone of the family to take the task over
  const roster = ROSTER();
  roster.agents.push({ ...roster.agents.find((a) => a.id === "a-deepseek-mac"), id: "a-deepseek-mac-2", name: "deepseek-mac-2" });
  const fx = makeFixture({ orders: [page("P9", 10), page("P10", 9)], config: { cheapTier: { enabled: true, coldStartRuns: 0, minFirstPass: 0 } }, roster });
  recorded(fx, "P9", "P10");
  node(fx, "tick.mjs", ["tick"]);
  const ts = restoreTasks(fx);
  const s = fakeState(fx);
  const t = ts.find((x) => x.assignee_id === fx.id("deepseek-mac"));
  assert.ok(t);
  s.issues[t.id].runs.unshift({ id: "run-x", agent_id: fx.id("deepseek-mac"), status: "failed", error: "API error 429: Too Many Requests" });
  const other = ts.find((x) => x.id !== t.id);
  s.issues[other.id].runs.unshift({ id: "run-y", agent_id: other.assignee_id, status: "failed", error: "segfault in harness" });
  writeFileSync(fx.fake, JSON.stringify(s));
  const r = node(fx, "tick.mjs", ["tick"]);
  assert.equal(issue(fx, t.id).assignee_id, fx.id("deepseek-mac-2"), "same family, same model");
  const agents = readJson(path.join(fx.state, "ledger", "agents.json"));
  assert.ok(agents[fx.id("deepseek-mac")].cooldownUntil > Date.now());
  assert.ok(r.anomalies.some((a) => a.issue === other.id), "unknown error reported");
  const again = node(fx, "tick.mjs", ["tick"]);
  assert.ok(!again.anomalies.some((a) => a.issue === other.id), "a failed run is handled once");
});

test("dry-run prints writes and changes nothing", () => {
  const fx = makeFixture({ orders: [page("P11", 10)] });
  recorded(fx, "P11");
  const before = fakeState(fx);
  const res = node(fx, "tick.mjs", ["tick", "--dry-run"]);
  assert.equal(res.ok, true, JSON.stringify(res));
  const after = fakeState(fx);
  assert.equal(after.log.length, before.log.length, "no writes in dry-run");
  assert.equal(readJson(path.join(fx.state, "ledger", "tasks.json"), null), null, "ledger untouched");
});

test("route.mjs: core → Opus, complex page → Sonnet, cheap tier switch, capability seed", () => {
  const fx = makeFixture({ orders: [{ id: "E1", type: "entry", kb: 50, app: "portal" }, page("BIG", 40), page("RULES", 12, { rules: 12 }), page("SMALL", 12)], config: { cheapTier: { enabled: true, coldStartRuns: 10 } } });
  let r = node(fx, "route.mjs", ["E1", "--offline"]);
  assert.deepEqual(r.candidates[0].agents.map((a) => a.id), [fx.id("opus-mac")]);
  r = node(fx, "route.mjs", ["BIG", "--offline"]);
  assert.equal(r.candidates.length, 1); assert.equal(r.candidates[0].model, "claude-sonnet-5-5"); assert.equal(r.features.complex, true);
  r = node(fx, "route.mjs", ["RULES", "--offline"]);
  assert.equal(r.features.complex, true, "≥ 10 rules is complex");
  r = node(fx, "route.mjs", ["SMALL", "--offline"]);
  assert.equal(r.dual, true); assert.deepEqual(r.candidates.slice(0, 2).map((c) => c.family), ["deepseek", "zhipu"]);
  const seed = node(fx, "ledger.mjs", ["seed", "--from", path.join(fx.root, "stats.json")]);
  assert.equal(seed.error !== undefined, true, "missing stats file reported");
  writeFileSync(path.join(fx.root, "stats.json"), JSON.stringify({ rows: [{ model: "claude-sonnet-5-5", kb: 3, firstPass: true, finalPass: true, fixRounds: 0, tokensCache: 100 }, { model: "claude-sonnet-5-5", kb: 40, firstPass: false, finalPass: true, fixRounds: 1, tokensCache: 900 }, { model: "claude-haiku-5-5", kb: 3, firstPass: true, finalPass: true, tokensCache: 50 }] }));
  const s2 = node(fx, "ledger.mjs", ["seed", "--from", path.join(fx.root, "stats.json")]);
  assert.equal(s2.tiers.simple.runs, 1); assert.equal(s2.tiers.large.firstPass, 0);
  const cap = node(fx, "ledger.mjs", ["capability"]);
  assert.equal(cap.byFamilyModel["anthropic|claude-sonnet-5-5"].large.runs, 1);
});

// Edit the fixture roster in place (e.g. enabled:false), as an operator would in $RESTORE_STATE.
const editRoster = (fx, fn) => {
  const p = path.join(fx.state, "agents.roster.json");
  const r = readJson(p);
  for (const a of r.agents) fn(a);
  writeFileSync(p, JSON.stringify(r, null, 1));
};
const glmRestorersOff = (a) => { if (a.role === "restorer" && a.family === "zhipu") a.enabled = false; };
const setCapability = (fx, family, model, tier, t) => writeFileSync(path.join(fx.state, "ledger", "capability.json"), JSON.stringify({ version: 1, keys: { [`rt|v|${model}|i`]: { family, model, tiers: { [tier]: { runs: 0, firstPass: 0, pass: 0, tokens: 0, fixRounds: 0, ...t } } } }, audits: {} }));

test("route.mjs: one cheap family → single cold-start dispatch; after cold start by first-pass rate; disabled agents never chosen", () => {
  const fx = makeFixture({ orders: [page("SMALL", 12), page("BIG", 40)], config: { cheapTier: { enabled: true, coldStartRuns: 10, minFirstPass: 0.7 } } });
  editRoster(fx, glmRestorersOff);
  const glm = [fx.id("glm-mac")];
  const ids = (r) => r.candidates.flatMap((c) => c.agents.map((a) => a.id));
  // families still lists zhipu, but the roster has no enabled zhipu restorer → one family
  let r = node(fx, "route.mjs", ["SMALL", "--offline"]);
  assert.equal(r.dual, false);
  assert.deepEqual(r.candidates.map((c) => c.family), ["deepseek", "anthropic"], "deepseek first, Sonnet fallback");
  assert.match(r.candidates[0].reason, /冷启动（medium 档 0\/10 次）单派/);
  assert.match(r.candidates[1].reason, /回退 Sonnet/);
  assert.ok(!ids(r).some((id) => glm.includes(id)), "enabled:false agents are not candidates");
  r = node(fx, "route.mjs", ["BIG", "--offline"]);
  assert.deepEqual(r.candidates.map((c) => c.model), ["claude-sonnet-5-5"], "≥ 30KB still Sonnet");

  // families: ["deepseek"] with GLM restorers enabled → also single (GLM not configured as cheap tier)
  editRoster(fx, (a) => delete a.enabled);
  writeFileSync(path.join(fx.state, "scheduler.config.json"), JSON.stringify({ projectId: "proj-1", cheapTier: { enabled: true, families: ["deepseek"] } }));
  r = node(fx, "route.mjs", ["SMALL", "--offline"]);
  assert.equal(r.dual, false);
  assert.equal(r.candidates[0].family, "deepseek");
  assert.match(r.candidates[0].reason, /冷启动.*单派/);
  assert.ok(!ids(r).some((id) => glm.includes(id)), "zhipu not in cheapTier.families → not chosen");

  // cold start over, first pass 8/10 ≥ 70% → deepseek by rate
  setCapability(fx, "deepseek", "deepseek-official/deepseek-flash", "medium", { runs: 10, firstPass: 8, pass: 10, tokens: 1000 });
  r = node(fx, "route.mjs", ["SMALL", "--offline"]);
  assert.equal(r.dual, false);
  assert.deepEqual(r.candidates.map((c) => c.family), ["deepseek", "anthropic"]);
  assert.match(r.candidates[0].reason, /首通率 80%/);
  // cold start over, first pass 5/10 < 70% → Sonnet only
  setCapability(fx, "deepseek", "deepseek-official/deepseek-flash", "medium", { runs: 10, firstPass: 5, pass: 9, tokens: 1000 });
  r = node(fx, "route.mjs", ["SMALL", "--offline"]);
  assert.deepEqual(r.candidates.map((c) => c.family), ["anthropic"]);
  assert.match(r.candidates[0].reason, /首通率低于 70% → Sonnet/);
});

test("single cheap family cold start: tick dispatches to DeepSeek alone (no twin), Sonnet once DeepSeek is full", () => {
  const ids = ["S1", "S2", "S3", "S4"];
  const fx = makeFixture({ orders: ids.map((id) => page(id, 8)), config: { cheapTier: { enabled: true, families: ["deepseek"], coldStartRuns: 10 } } });
  editRoster(fx, glmRestorersOff);
  recorded(fx, ...ids);
  const r = node(fx, "tick.mjs", ["tick"]);
  assert.equal(r.ok, true, JSON.stringify(r));
  const ts = restoreTasks(fx);
  assert.equal(ts.length, ids.length, "one task per page, no dual");
  const fam = (t) => meta(fx, t.id).family;
  // deepseek slots: maxConcurrent 2 + pre-queue 1 = 3 → the 4th page falls back to Sonnet
  assert.equal(ts.filter((t) => fam(t) === "deepseek").length, 3);
  assert.equal(ts.filter((t) => fam(t) === "anthropic").length, 1);
  assert.ok(ts.every((t) => !meta(fx, t.id).twin), "no twin");
  assert.ok(ts.every((t) => !/-[dg]$/.test(meta(fx, t.id).branch)), "no dual-dispatch branch suffix");
  assert.ok(!ts.some((t) => fam(t) === "zhipu"));
});

test("route(): a cheap family with no usable agent here (other machine) does not force dual → single cold start", async () => {
  const { route } = await import("../route.mjs");
  const { Roster, DEFAULT_CONFIG } = await import("../lib/roster.mjs");
  const cfg = { ...DEFAULT_CONFIG, cheapTier: { ...DEFAULT_CONFIG.cheapTier, enabled: true } };
  const roster = new Roster(ROSTER(), cfg);
  const ctx = { roster, cfg, capability: { keys: {}, audits: {} }, agentsState: {}, load: new Map(), toolRoot: REPO };
  const wo = page("X", 12);
  assert.equal(route(wo, ctx).dual, true, "both families usable → dual (unchanged)");
  const glm = roster.agents.filter((a) => a.family === "zhipu").map((a) => a.id);
  const r = route(wo, ctx, { exclude: glm });
  assert.equal(r.dual, false);
  assert.equal(r.candidates[0].family, "deepseek");
  assert.match(r.candidates[0].reason, /单派/);
});

test("DeepSeek branch fixed by Opus: audit goes to the GLM reviewer; without one the page is done and the gap reported", () => {
  for (const glmReviewer of [true, false]) {
    const fx = makeFixture({ orders: [page("D1", 10)], config: { cheapTier: { enabled: true, families: ["deepseek"], coldStartRuns: 10 }, audit: { coldRate: 1, normalRate: 1 }, regressionEvery: 100 } });
    editRoster(fx, glmRestorersOff);
    if (!glmReviewer) editRoster(fx, (a) => { if (a.role === "reviewer" && a.family === "zhipu") a.enabled = false; });
    recorded(fx, "D1");
    node(fx, "tick.mjs", ["tick"]);
    const [t] = restoreTasks(fx);
    assert.equal(meta(fx, t.id).family, "deepseek");
    deliver(fx, t.id, { "apps/portal/src/views/D1/index.vue": vue("ds") });
    gate(fx, t.id, { pass: false, stage: "browser", failed: [{ check: "dom", where: "x" }] });
    assert.equal(issue(fx, t.id).assignee_id, fx.id("fixer"));
    deliver(fx, t.id, { "apps/portal/src/views/D1/index.vue": vue("ds fixed") }, { fix: true });
    const r = gate(fx, t.id, { pass: true, stage: "browser", failed: [] });
    assert.equal(r.ok, true, JSON.stringify(r));
    if (glmReviewer) {
      assert.equal(issue(fx, t.id).assignee_id, fx.id("review-glm"), "deepseek + anthropic → zhipu reviewer");
      assert.equal(meta(fx, t.id).kind, "audit");
    } else {
      assert.equal(issue(fx, t.id).status, "done", "not stuck waiting for a reviewer");
      assert.match(lastComment(fx, t.id), /无可用的异家族复核员（参与家族：deepseek、anthropic）/);
      assert.equal(r.anomalies.length, 1, JSON.stringify(r));
      assert.match(r.anomalies[0].what, /没有可用的异家族复核员/);
    }
  }
});

test("known-diff: only the arbiter may register", () => {
  const fx = makeFixture({ orders: [page("P12", 10)] });
  let r = node(fx, "known-diff.mjs", ["add", "P12", "--evidence", "legacy-dist/portal/assets/x.js:120", "--why", "原包引用了未定义变量"], { MULTICA_AGENT_ID: fx.id("fixer") });
  assert.equal(r.ok, false);
  r = node(fx, "known-diff.mjs", ["add", "P12", "--evidence", "legacy-dist/portal/assets/x.js:120", "--why", "原包引用了未定义变量"], { MULTICA_AGENT_ID: fx.id("arbiter") });
  assert.equal(r.ok, true, JSON.stringify(r));
  r = node(fx, "known-diff.mjs", ["list", "P12"]);
  assert.equal(r.entries.length, 1);
  const d = node(fx, "tick.mjs", ["digest"]);
  assert.match(d.summary, /P12/);
});

test("review fixes: concurrent advance handled once; stale gate result dropped on handoff; regate after arbiter advances", async () => {
  const fx = makeFixture({ orders: [page("R1", 10)], config: { audit: { coldRate: 0 }, regressionEvery: 100 } });
  recorded(fx, "R1");
  node(fx, "tick.mjs", ["tick"]);
  const [t] = restoreTasks(fx);
  deliver(fx, t.id, { "apps/portal/src/views/R1/index.vue": vue("r1") });
  setMeta(fx, t.id, "gate.1", { pass: false, stage: "static", failed: ["x"] });
  const { spawn } = await import("node:child_process");
  const { REPO } = await import("./fixture.mjs");
  const run = () => new Promise((res) => { const p = spawn(process.execPath, [path.join(REPO, "tools/tick.mjs"), "advance", t.id], { cwd: fx.tool, env: fx.env }); p.on("close", res); });
  await Promise.all([run(), run(), run()]);
  const fixerAssigns = fakeState(fx).log.filter((e) => e.op === "update" && e.issue === t.id && e.assignee === fx.id("fixer"));
  assert.equal(fixerAssigns.length, 1, "one verdict → one fixer assignment");
  assert.equal(meta(fx, t.id).fixRound, 1);
  // fixer hands off: the previous gate.1 must be gone so nobody can advance it again
  deliver(fx, t.id, { "apps/portal/src/views/R1/index.vue": vue("r1 f1") }, { fix: true });
  assert.equal(meta(fx, t.id)["gate.1"], undefined, "stale gate result removed on handoff");
  let r = node(fx, "tick.mjs", ["advance", t.id]);
  assert.equal(r.ok, false, "no gate result yet → nothing to advance");
  // fail twice more (Sonnet: fixer 2 → arbiter), then the arbiter re-gates and the new verdict is processed
  gate(fx, t.id, { pass: false, stage: "static", failed: ["x"] });
  deliver(fx, t.id, { "apps/portal/src/views/R1/index.vue": vue("r1 f2") }, { fix: true });
  gate(fx, t.id, { pass: false, stage: "static", failed: ["x"] });
  assert.equal(meta(fx, t.id).kind, "arbitrate");
  r = node(fx, "tick.mjs", ["advance", t.id, "--regate"]);
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(issue(fx, t.id).assignee_id, fx.id("gate"));
  r = gate(fx, t.id, { pass: true });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(issue(fx, t.id).status, "done", "re-gated verdict advanced, not swallowed");
  assert.equal(showRemote(fx, "app", "integration", "apps/portal/src/views/R1/index.vue"), vue("r1 f2"));
});

test("review fixes: audit issue at fix round 0 → revert, fixer continues on a re-branch that merges cleanly", () => {
  const fx = makeFixture({ orders: [page("R2", 10)], config: { audit: { coldRate: 1 }, regressionEvery: 100 } });
  recorded(fx, "R2");
  node(fx, "tick.mjs", ["tick"]);
  const [t] = restoreTasks(fx);
  deliver(fx, t.id, { "apps/portal/src/views/R2/index.vue": vue("r2") });
  gate(fx, t.id, { pass: true });
  assert.equal(meta(fx, t.id).kind, "audit");
  assert.equal(issue(fx, t.id).assignee_id === fx.id("review-deepseek") || issue(fx, t.id).assignee_id === fx.id("review-glm"), true, "Sonnet-restored page → non-anthropic reviewer");
  setMeta(fx, t.id, "audit.1", { verdict: "issue", findings: [{ severity: "medium", what: "watch dropped", evidence: "c:1" }] });
  node(fx, "tick.mjs", ["tick"]);
  const m = meta(fx, t.id);
  assert.equal(showRemote(fx, "app", "integration", "apps/portal/src/views/R2/index.vue"), null, "reverted");
  assert.equal(m.branch, "restore/R2-a1-r1", "new branch carrying the reverted work");
  assert.equal(showRemote(fx, "app", "restore/R2-a1-r1", "apps/portal/src/views/R2/index.vue"), vue("r2"), "re-branch has the reverted work");
  assert.equal(issue(fx, t.id).assignee_id, fx.id("fixer"));
  deliver(fx, t.id, { "apps/portal/src/views/R2/index.vue": vue("r2 fixed") }, { fix: true });
  const r = gate(fx, t.id, { pass: true });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(showRemote(fx, "app", "integration", "apps/portal/src/views/R2/index.vue"), vue("r2 fixed"), "fix merged after the revert");
  // second audit on the same attempt: the old verdict was cleared, so nothing is processed until the reviewer writes
  if (meta(fx, t.id).kind === "audit") { assert.equal(meta(fx, t.id)["audit.1"], undefined); node(fx, "tick.mjs", ["tick"]); assert.equal(meta(fx, t.id).kind, "audit", "waits for the new verdict"); }
});

test("review fixes: a task whose branch was never pushed doesn't stop the round", () => {
  const fx = makeFixture({ orders: [page("R3", 10), page("R4", 12)], config: { audit: { coldRate: 0 }, maxNewPerTick: 1 } });
  recorded(fx, "R3", "R4");
  node(fx, "tick.mjs", ["tick"]);
  const [t] = restoreTasks(fx);
  for (const wo of meta(fx, t.id).workOrders) writeReceipt(fx, wo);
  node(fx, "handoff.mjs", [t.id]);
  setMeta(fx, t.id, "gate.1", { pass: true });
  const r = node(fx, "tick.mjs", ["advance", t.id]);
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(issue(fx, t.id).assignee_id, fx.id("fixer"), "missing branch → failure rules");
  const tk = node(fx, "tick.mjs", ["tick"]);
  assert.equal(tk.ok, true, JSON.stringify(tk));
  assert.equal(restoreTasks(fx).length, 2, "dispatch continued");
});

test("bisect: failing page not yet merged at the midpoint → that step counts as good without a gate run", () => {
  const fx = makeFixture({ orders: [page("B1", 20), page("B2", 15), page("B3", 10)], config: { audit: { coldRate: 0 }, regressionEvery: 3 } });
  recorded(fx, "B1", "B2", "B3");
  node(fx, "tick.mjs", ["tick"]);
  const byWo = Object.fromEntries(restoreTasks(fx).map((t) => [meta(fx, t.id).workOrders[0], t]));
  for (const wo of ["B1", "B2", "B3"]) { deliver(fx, byWo[wo].id, { [`apps/portal/src/views/${wo}/index.vue`]: vue(wo) }); gate(fx, byWo[wo].id, { pass: true }); }
  node(fx, "tick.mjs", ["tick"]);
  const reg = issuesOf(fx).find((i) => i.title.startsWith("[integration] regression"));
  setMeta(fx, reg.id, "gate.1", { pass: false, failed: ["B3"] });
  node(fx, "tick.mjs", ["advance", reg.id]);
  assert.equal(issuesOf(fx).filter((i) => i.title.startsWith("[integration] bisect")).length, 0, "B3 is only in the last merge");
  assert.equal(showRemote(fx, "app", "integration", "apps/portal/src/views/B3/index.vue"), null, "B3 merge reverted");
  assert.equal(showRemote(fx, "app", "integration", "apps/portal/src/views/B2/index.vue"), vue("B2"));
});

test("an order whose chunk imports something the registry lacks (`missing`) is never dispatched; its neighbour is", () => {
  const fx = makeFixture({ orders: [page("P1", 8, { missing: ["view:sibling.js"] }), page("P2", 8)], config: { cheapTier: { enabled: false }, audit: { coldRate: 0, normalRate: 0 }, regressionEvery: 100 } });
  recorded(fx, "P1", "P2");
  node(fx, "tick.mjs", ["tick"]);
  const ids = restoreTasks(fx).map((t) => meta(fx, t.id).wos ?? meta(fx, t.id).wo);
  assert.ok(restoreTasks(fx).length > 0, "the clean order is dispatched");
  assert.ok(!JSON.stringify(restoreTasks(fx).map((t) => meta(fx, t.id))).includes('"P1"'), `P1 must not be dispatched: ${JSON.stringify(ids)}`);
});

// HM-990 (decisions of HM-858): an upgrade is judged and merged as a public-library change; its merge is picked onto the
// app repo's fast lane; a fast-lane page suspended for it keeps restore/fast-lane and goes back to the gate.
const upgradeFixture = ({ fastLaneDict = null } = {}) => {
  const fx = makeFixture({ orders: [page("P3", 12), page("F1", 12), page("P4", 12, { accepted: true }), { id: "S1", type: "shared", kb: 6, app: "portal", files: ["apps/portal/src/shared/Dict.vue"] }], config: { audit: { coldRate: 0 }, regressionEvery: 100 } });
  recorded(fx, "P3", "F1");
  writeFileSync(path.join(fx.state, "ledger", "tasks.json"), JSON.stringify({ wos: { S1: { state: "done", tasks: [] } }, tasks: {}, seq: 0 }));
  git(fx.root, "--git-dir", fx.appOrigin, "branch", "restore/fast-lane", "integration");
  pushBranch(fx, { branch: "restore/fast-lane", files: { "apps/portal/src/views/F1/index.vue": vue("f1"), ...(fastLaneDict ? { "apps/portal/src/shared/Dict.vue": fastLaneDict } : {}) } });
  node(fx, "tick.mjs", ["tick"]);
  const p3 = restoreTasks(fx).find((i) => meta(fx, i.id).workOrders[0] === "P3");
  const f1 = restoreTasks(fx).find((i) => meta(fx, i.id).workOrders[0] === "F1");
  mc(fx, "issue", "metadata", "set", f1.id, "--key", "fastLane", "--type", "bool", "--value", "true"); setMeta(fx, f1.id, "branch", "restore/fast-lane");
  for (const t of [p3, f1]) assert.equal(node(fx, "tick.mjs", ["open-upgrade", t.id, "--reason", "Dict 缺 size；sjz/home/marketTop.jpg 缺"]).ok, true);
  const up = issuesOf(fx).find((i) => i.title.startsWith("[upgrade]"));
  assert.equal(meta(fx, p3.id).suspendedBy, up.id); assert.equal(meta(fx, f1.id).suspendedBy, up.id);
  return { fx, p3, f1, up };
};
const tickState = (fx) => readJson(path.join(fx.state, "ledger", "tick-state.json"), {});

test("upgrade (HM-990): one verdict for the branch; merged → picked onto restore/fast-lane; fast-lane page keeps its branch and goes back to the gate, a normal page is re-dispatched", () => {
  const { fx, p3, f1, up } = upgradeFixture();
  deliver(fx, up.id, { "apps/portal/src/shared/Dict.vue": "<template><span>dict v2</span></template>\n", "apps/portal/public/sjz/home/marketTop.jpg": "jpg" });
  assert.equal(meta(fx, up.id).gateMode, "upgrade", "sent to the gate in upgrade mode");
  // gate.mjs --mode upgrade: pages[] are the regression pages, not the unblocked P3/F1
  const r = gate(fx, up.id, { pass: true, mode: "upgrade", stage: "browser", failed: [], pages: [{ wo: "P4", pass: true }] });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.match(showRemote(fx, "app", "integration", "apps/portal/src/shared/Dict.vue"), /v2/, "merged into integration");
  assert.equal(tickState(fx).upgrades[up.id].state, "merged");

  // decision 2: the upgrade's change is on the fast lane too, next to the fast-lane pages
  assert.match(showRemote(fx, "app", "restore/fast-lane", "apps/portal/src/shared/Dict.vue"), /v2/);
  assert.equal(showRemote(fx, "app", "restore/fast-lane", "apps/portal/public/sjz/home/marketTop.jpg"), "jpg");
  assert.equal(showRemote(fx, "app", "restore/fast-lane", "apps/portal/src/views/F1/index.vue"), vue("f1"), "fast-lane pages untouched");
  const sync = meta(fx, up.id).fastLaneSync;
  assert.equal(sync.state, "ok");
  assert.equal(sync.picked, lsRemote(fx, "app", "restore/fast-lane"));
  const msg = git(fx.root, "--git-dir", fx.appOrigin, "log", "-1", "--format=%B", "restore/fast-lane");
  assert.match(msg, new RegExp(`cherry picked from commit ${lsRemote(fx, "app", "integration")}`));

  // decision 3: the fast-lane page keeps restore/fast-lane and its metadata, and is gated again
  const fm = meta(fx, f1.id);
  assert.equal(fm.branch, "restore/fast-lane");
  assert.equal(fm.fastLane, true);
  assert.equal(fm.suspendedBy, undefined);
  assert.equal(fm.attempt, 2);
  assert.equal(fm.history.at(-1).result, "suspended");
  assert.equal(issue(fx, f1.id).status, "in_review");
  assert.equal(issue(fx, f1.id).assignee_id, fx.id("gate"));
  assert.match(lastComment(fx, f1.id), /restore\/fast-lane.*重跑门槛/);
  // a normal page: unchanged behaviour, a restorer on restore/<order>-a<n>
  assert.equal(meta(fx, p3.id).branch, "restore/P3-a2");
  assert.equal(issue(fx, p3.id).status, "todo");
});

test("upgrade (HM-990): the merge refuses a page file (the gate's scope rule); a fast-lane conflict stops there with an anomaly", () => {
  // refused: an upgrade branch that changes a page
  let { fx, up } = upgradeFixture();
  deliver(fx, up.id, { "apps/portal/src/shared/Dict.vue": "<template><span>dict v2</span></template>\n", "apps/portal/src/views/P3/index.vue": vue("patched") });
  gate(fx, up.id, { pass: true, mode: "upgrade", failed: [], pages: [] });
  assert.match(showRemote(fx, "app", "integration", "apps/portal/src/shared/Dict.vue"), /v1/, "not merged");
  assert.ok(issue(fx, up.id).comments.some((c) => /合并被拒.*views\/P3\/index\.vue: page file/.test(c.content)));

  // conflict on the fast lane: integration gets the upgrade, the fast-lane page waits
  ({ fx, up } = upgradeFixture({ fastLaneDict: "<template><span>dict fast-lane</span></template>\n" }));
  const f1 = restoreTasks(fx).find((i) => meta(fx, i.id).workOrders[0] === "F1");
  const p3 = restoreTasks(fx).find((i) => meta(fx, i.id).workOrders[0] === "P3");
  const flSha = lsRemote(fx, "app", "restore/fast-lane");
  deliver(fx, up.id, { "apps/portal/src/shared/Dict.vue": "<template><span>dict v2</span></template>\n" });
  const r = gate(fx, up.id, { pass: true, mode: "upgrade", failed: [], pages: [] });
  assert.match(showRemote(fx, "app", "integration", "apps/portal/src/shared/Dict.vue"), /v2/);
  assert.equal(lsRemote(fx, "app", "restore/fast-lane"), flSha, "nothing pushed to the fast lane");
  assert.equal(meta(fx, up.id).fastLaneSync.state, "conflict");
  assert.deepEqual(meta(fx, up.id).fastLaneSync.conflicts, ["apps/portal/src/shared/Dict.vue"]);
  assert.ok(r.anomalies.some((a) => a.issue === up.id && /conflicts/.test(a.what)), JSON.stringify(r));
  assert.equal(issue(fx, f1.id).status, "backlog", "fast-lane page stays suspended");
  assert.equal(issue(fx, p3.id).status, "todo", "normal page resumed");
  node(fx, "tick.mjs", ["tick"]);
  assert.equal(issue(fx, f1.id).status, "backlog", "still waiting on the next tick");

  // someone lands it by hand and marks it: the next tick resumes the fast-lane page
  setMeta(fx, up.id, "fastLaneSync", { state: "ok", manual: true });
  node(fx, "tick.mjs", ["tick"]);
  assert.equal(issue(fx, f1.id).status, "in_review");
  assert.equal(meta(fx, f1.id).branch, "restore/fast-lane");
});

test("fast lane (HM-990): a fast-lane page whose receipt names a library gap opens an upgrade; resumed on restore/fast-lane, its pass is a fast-lane pass", () => {
  const fx = makeFixture({ orders: [page("F1", 12), { id: "S1", type: "shared", kb: 6, app: "portal", files: ["apps/portal/src/shared/Dict.vue"] }], config: { audit: { coldRate: 0 }, regressionEvery: 100 } });
  recorded(fx, "F1");
  writeFileSync(path.join(fx.state, "ledger", "tasks.json"), JSON.stringify({ wos: { S1: { state: "done", tasks: [] } }, tasks: {}, seq: 0 }));
  git(fx.root, "--git-dir", fx.appOrigin, "branch", "restore/fast-lane", "integration");
  node(fx, "tick.mjs", ["tick"]);
  const [t] = restoreTasks(fx);
  mc(fx, "issue", "metadata", "set", t.id, "--key", "fastLane", "--type", "bool", "--value", "true"); setMeta(fx, t.id, "branch", "restore/fast-lane");
  deliver(fx, t.id, { "apps/portal/src/views/F1/index.vue": vue("f1") }, { receipt: { needsFromSkeleton: ["sjz/home/marketTop.jpg 缺"] } });
  gate(fx, t.id, { pass: false, stage: "browser", failed: [{ check: "pixel", where: "load" }] });
  const up = issuesOf(fx).find((i) => i.title.startsWith("[upgrade]"));
  assert.ok(up, "upgrade opened for a fast-lane page");
  assert.equal(issue(fx, t.id).status, "backlog");
  deliver(fx, up.id, { "apps/portal/public/sjz/home/marketTop.jpg": "jpg" });
  gate(fx, up.id, { pass: true, mode: "upgrade", failed: [], pages: [] });
  assert.equal(showRemote(fx, "app", "restore/fast-lane", "apps/portal/public/sjz/home/marketTop.jpg"), "jpg");
  assert.equal(meta(fx, t.id).branch, "restore/fast-lane");
  assert.equal(issue(fx, t.id).assignee_id, fx.id("gate"));
  gate(fx, t.id, { pass: true, stage: "browser", failed: [], pages: [{ wo: "F1", pass: true }] });
  assert.equal(issue(fx, t.id).status, "done");
  assert.match(lastComment(fx, t.id), /快速通道/);
  assert.equal(showRemote(fx, "app", "integration", "apps/portal/src/views/F1/index.vue"), null, "a fast-lane pass merges nothing into integration");
});

test("HM-1086: a rule regression whose page list alone is over the 8 KB metadata cap still fits (workOrders packed); a refused creation does not hold up the others", () => {
  // 130 ids ≈ 9.2 KB as JSON: over the cap on its own, like HM-1072's 254 live pages (8.1 KB) plus its other keys
  const ids = Array.from({ length: 130 }, (_, n) => `page.portal.region.BeOnProbation.ProbationElegantListWithLongName${String(n).padStart(3, "0")}`);
  const fx = makeFixture({ orders: ids.map((id) => page(id, 10, { accepted: true })), config: {} });
  git(fx.tool, "checkout", "-q", "-b", "rules/big");
  writeFileSync(path.join(fx.tool, "rules.json"), JSON.stringify({ rules: ["base", "attr-order"] }));
  git(fx.tool, "commit", "-q", "-am", "rule big"); git(fx.tool, "push", "-q", "origin", "rules/big");
  node(fx, "tick.mjs", ["open-rule-review", "rules/big"]);
  for (const i of issuesOf(fx).filter((x) => x.title.includes("rules/big"))) setMeta(fx, i.id, `review.${i.assignee_id}`, { verdict: "approve", why: "equivalent" });
  let r = node(fx, "tick.mjs", ["tick"]);
  assert.ok(r.anomalies && !r.anomalies.some((a) => /metadata exceeds/.test(a.what)), JSON.stringify(r).slice(0, 2000));
  const reg = issuesOf(fx).find((i) => i.title.startsWith("[integration] rule-regression"));
  assert.ok(reg, "rule regression created");
  assert.equal(issue(fx, reg.id).status, "todo", "assigned, not left in backlog");
  const raw = issue(fx, reg.id).metadata;
  assert.match(raw.workOrders, /^z1:/, "stored packed");
  assert.deepEqual(meta(fx, reg.id).workOrders, ids, "read back intact");
  assert.equal(meta(fx, reg.id).ruleChange, "rules/big");
  const stored = Object.entries(raw).reduce((n, [k, v]) => n + Buffer.byteLength(k) + Buffer.byteLength(typeof v === "string" ? v : JSON.stringify(v)) + 8, 8);
  assert.ok(stored < 4096, `room left for gate.<attempt>: ${stored} bytes`);

  // HM-1072: a creation the server refused stays unassigned; the next tick finishes it, and one that keeps failing
  // names its task without stopping the next
  const ledgerFile = path.join(fx.state, "ledger", "tasks.json");
  const L = readJson(ledgerFile);
  const stuck = mc(fx, "issue", "create", "--title", "[integration] stuck", "--status", "backlog", "--output", "json");
  const bad = mc(fx, "issue", "create", "--title", "[integration] bad", "--status", "backlog", "--output", "json");
  L.tasks[stuck.id] = { id: stuck.id, key: "k:stuck", kind: "integration", title: "[integration] stuck", workOrders: [], assigneeId: fx.id("gate"), status: "todo", meta: { kind: "integration", purpose: "rule-regression", workOrders: ids, sha: "" }, assigned: false };
  L.tasks[bad.id] = { id: bad.id, key: "k:bad", kind: "integration", title: "[integration] bad", workOrders: [], assigneeId: fx.id("gate"), status: "todo", meta: { kind: "integration", note: "x".repeat(9000) }, assigned: false };
  writeFileSync(ledgerFile, JSON.stringify(L));
  r = node(fx, "tick.mjs", ["tick"]);
  assert.deepEqual(meta(fx, stuck.id).workOrders, ids);
  assert.equal(issue(fx, stuck.id).status, "todo");
  const a = r.anomalies.find((x) => /metadata exceeds/.test(x.what));
  assert.ok(a && a.issue === bad.id, JSON.stringify(r.anomalies));
});
