// End-to-end hand-over between gate.mjs (A) and tick.mjs advance (B), driven with the JSON gate.mjs really prints
// (HM-9 integration run, 2026-10-10): `pages` is an array of {wo, pass, stage, failed, …}, integration runs carry
// app-wide failures without `wo`. The scheduler tests elsewhere feed hand-written verdicts; these use the real shapes.
// Run: node --test tools/test/gate-advance.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { makeFixture, node, issuesOf, fakeState, mc, setMeta, meta, pushBranch, writeReceipt, showRemote } from "./fixture.mjs";

// Seeds tick-state.json's `knownFailed` the way a prior full conclusion (onRegression / onRuleRegression) would have
// left it, so a test can start from "this page was already failing before the rule under test merged" (HM-1471).
const seedKnownFailed = (fx, failed) => {
  const p = path.join(fx.state, "ledger", "tick-state.json");
  const cur = existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : {};
  writeFileSync(p, JSON.stringify({ ...cur, knownFailed: { at: new Date().toISOString(), failed } }));
};

const page = (id, kb, extra = {}) => ({ id, type: "page", kb, app: "uc", site: "usercenter", target: `apps/uc/src/views/${id}.vue`, subComponentDir: `apps/uc/src/views/${id}/`, deps: [], ...extra });
const recorded = (fx, ...ids) => ids.forEach((id) => mkdirSync(path.join(fx.state, "baseline", id), { recursive: true }));
const restoreTasks = (fx) => issuesOf(fx).filter((i) => i.title.startsWith("[restore]"));
const issue = (fx, id) => fakeState(fx).issues[id];
const vue = (s) => `<template><div>${s}</div></template>\n`;
const deliver = (fx, taskId, files, { fix = false } = {}) => {
  const m = meta(fx, taskId);
  pushBranch(fx, { branch: m.branch, files });
  for (const wo of m.workOrders) writeReceipt(fx, wo, { branch: m.branch });
  const r = node(fx, "handoff.mjs", [taskId, ...(fix ? ["--fix"] : [])]);
  assert.equal(r.ok, true, JSON.stringify(r));
};
const gate = (fx, taskId, result) => { setMeta(fx, taskId, `gate.${meta(fx, taskId).attempt}`, result); return node(fx, "tick.mjs", ["advance", taskId]); };

// gate.mjs page-mode outputs as printed (paths shortened; no page content is ever in them)
const realFail = (wo) => ({ pass: false, failed: [{ check: "pixel", where: "load", hint: "1.564% of pixels differ (max 0.5%), size 1672x472 vs 1672x472", wo }], stage: "browser", diff: `/state/gate/${wo}-a1`, shimmed: [], durationMs: 24039, stages: { static: 468, build: 263, browserLaunch: 214, browser: 23283 }, pages: [{ wo, pass: false, stage: "browser", failed: [{ check: "pixel", where: "load", hint: "1.564% of pixels differ" }], pixel: 1.564, retried: true, ms: 11210 }], mode: "page", attempt: 1, build: "ondemand" });
const realPass = (wo) => ({ pass: true, failed: [], stage: "browser", diff: `/state/gate/${wo}-a1`, shimmed: [], durationMs: 10813, stages: { static: 445, build: 318, browserLaunch: 91, browser: 8386 }, pages: [{ wo, pass: true, stage: null, failed: [], pixel: 0.02, ms: 3990 }], mode: "page", attempt: 1, build: "ondemand", commit: "6e95728" });

test("real gate output: fail → fixer on the same branch; pass → merged into integration and done", () => {
  const fx = makeFixture({ orders: [page("F1", 7.3)], config: { audit: { coldRate: 0, normalRate: 0 }, regressionEvery: 100 } });
  recorded(fx, "F1");
  assert.equal(node(fx, "tick.mjs", ["tick"]).ok, true);
  const [t] = restoreTasks(fx);
  assert.equal(meta(fx, t.id).branch, "restore/F1-a1");
  deliver(fx, t.id, { "apps/uc/src/views/F1.vue": vue("a1") });
  assert.equal(issue(fx, t.id).assignee_id, fx.id("gate"));

  let r = gate(fx, t.id, realFail("F1"));
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(issue(fx, t.id).assignee_id, fx.id("fixer"), "browser failure → fixer");
  assert.equal(meta(fx, t.id).fixRound, 1);

  deliver(fx, t.id, { "apps/uc/src/views/F1.vue": vue("a1 fixed") }, { fix: true });
  r = gate(fx, t.id, realPass("F1"));
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(showRemote(fx, "app", "integration", "apps/uc/src/views/F1.vue"), vue("a1 fixed"), "a passing page is merged");
  assert.equal(issue(fx, t.id).status, "done");
});

test("real gate output, packed pages: per-page verdicts come from the pages array", () => {
  const fx = makeFixture({ orders: [page("S-a", 2), page("S-b", 3), page("S-c", 4)], config: { audit: { coldRate: 0, normalRate: 0 }, regressionEvery: 100 } });
  recorded(fx, "S-a", "S-b", "S-c");
  node(fx, "tick.mjs", ["tick"]);
  const [t] = restoreTasks(fx);
  assert.equal(meta(fx, t.id).workOrders.length, 3);
  deliver(fx, t.id, { "apps/uc/src/views/S-a.vue": vue("a"), "apps/uc/src/views/S-b.vue": vue("b"), "apps/uc/src/views/S-c.vue": vue("c") });
  const out = { ...realPass("S-a"), pass: false, stage: "browser", failed: [{ check: "overlay", where: "load", hint: "overlay text differs", wo: "S-b" }],
    pages: [{ wo: "S-a", pass: true, stage: null, failed: [] }, { wo: "S-b", pass: false, stage: "browser", failed: [{ check: "overlay", where: "load", hint: "overlay text differs" }] }, { wo: "S-c", pass: true, stage: null, failed: [] }] };
  assert.equal(gate(fx, t.id, out).ok, true);
  assert.equal(showRemote(fx, "app", "integration", "apps/uc/src/views/S-a.vue"), vue("a"));
  assert.equal(showRemote(fx, "app", "integration", "apps/uc/src/views/S-c.vue"), vue("c"));
  assert.equal(showRemote(fx, "app", "integration", "apps/uc/src/views/S-b.vue"), null);
  const split = restoreTasks(fx).find((x) => x.id !== t.id);
  assert.deepEqual(meta(fx, split.id).workOrders, ["S-b"]);
});

test("real gate output: pending record → waits; gate error → anomaly, nothing moves", () => {
  const fx = makeFixture({ orders: [page("R1", 6), page("E1", 8)], config: { audit: { coldRate: 0, normalRate: 0 } } });
  recorded(fx, "E1");
  node(fx, "tick.mjs", ["tick"]);
  const tR = restoreTasks(fx).find((x) => meta(fx, x.id).workOrders[0] === "R1");
  const tE = restoreTasks(fx).find((x) => meta(fx, x.id).workOrders[0] === "E1");
  deliver(fx, tR.id, { "apps/uc/src/views/R1.vue": vue("r") });
  assert.equal(gate(fx, tR.id, { pending: "record", missing: [{ wo: "R1", why: "no baseline" }], attempt: 1, durationMs: 3 }).ok, true);
  assert.equal(meta(fx, tR.id).waitRecord, true);
  deliver(fx, tE.id, { "apps/uc/src/views/E1.vue": vue("e") });
  const r = gate(fx, tE.id, { error: "crypto keys missing for the restored app: VITE_HMRSFW_SM2_PUBLIC_KEY, VITE_HMRSFW_SM4_KEY (set them in the gate's environment; docs/gate.md)" });
  assert.equal(r.ok, false);
  assert.match(r.anomalies[0].what, /gate error: crypto keys missing/);
  assert.equal(issue(fx, tE.id).assignee_id, fx.id("gate"), "a gate error is not a page failure");
  assert.equal(issue(fx, tE.id).status, "in_review");
});

test("integration gate: failed pages counted from the pages array; app-wide failures reported by owner", () => {
  const ids = ["P1", "P2", "P3", "P4"];
  const fx = makeFixture({ orders: ids.map((id) => page(id, 5)) });
  const t = mc(fx, "issue", "create", "--title", "[integration] integration-gate (4 页)", "--status", "in_review", "--assignee-id", fx.id("gate"), "--project", "proj-1");
  for (const [k, v] of Object.entries({ kind: "integration", purpose: "integration-gate", workOrders: ids, branch: "integration", attempt: 1, fixRound: 0 })) setMeta(fx, t.id, k, v);
  const global = [
    { check: "no-legacy", where: "apps/uc/src/shared/Editor.vue", hint: "legacy-dist-path ×1", layer: "shared", owner: "shared.uc.Editor" },
    { check: "no-legacy", where: "apps/uc/public/config.js", hint: "tenant-config ×3", layer: "shell" },
  ];
  const out = { pass: false, mode: "integration", attempt: 1, stage: "browser", stages: { static: 5911, build: 10029, browser: 120669 },
    failed: [...global, { check: "overlay", where: "load", hint: "overlay text differs", wo: "P2" }],
    pages: [{ wo: "P1", pass: true, stage: null, failed: [] }, { wo: "P2", pass: false, stage: "browser", failed: [{ check: "overlay", where: "load", hint: "x" }] }, { wo: "P3", pass: true, stage: null, failed: [] }, { wo: "P4", pass: true, stage: null, failed: [] }],
    global: { total: 2, byLayer: { shared: 1, shell: 1 }, byOwner: { "shared.uc.Editor": 1 } } };
  const r = gate(fx, t.id, out);
  assert.equal(r.ok, true, JSON.stringify(r));
  const c = issue(fx, t.id).comments.at(-1).content;
  assert.match(c, /1\/4 页失败/, "only P2 failed");
  assert.match(c, /shared 1/);
  const inc = issuesOf(fx).find((i) => i.title.startsWith("[incident]"));
  assert.ok(inc, "incident for the arbiter");
  assert.deepEqual(issue(fx, inc.id).metadata.details ? JSON.parse(JSON.stringify(meta(fx, inc.id).details)).failed : null, ["P2"]);
  assert.deepEqual(meta(fx, inc.id).details.global.byOwner, { "shared.uc.Editor": 1 });
});

test("slimmed verdict in metadata: the failure category comes from the wo-tagged top-level checks (HM-450)", async () => {
  const { Pipeline } = await import("../lib/pipeline.mjs");
  const p = Object.create(Pipeline.prototype);
  // as gate.mjs writes gate.<attempt>: pages without `failed`, checks in failed[] tagged with wo
  const slim = { pass: false, stage: "browser", failed: [{ check: "requests", where: "steps", hint: "request #3 after load", wo: "S-b" }, { check: "html", where: "final", hint: "HTML differs", wo: "S-a" }],
    pages: [{ wo: "S-a", pass: false, stage: "browser", pixel: 0 }, { wo: "S-b", pass: false, stage: "browser", pixel: 0 }, { wo: "S-c", pass: true, stage: null, pixel: 0 }] };
  const r = p.pageResults(slim, ["S-a", "S-b", "S-c"]);
  assert.equal(p.failCategory(r["S-a"]), "browser:html");
  assert.equal(p.failCategory(r["S-b"]), "browser:requests");
  assert.equal(r["S-c"].pass, true);
  // full verdicts keep their own per-page checks
  assert.equal(p.failCategory(p.pageResults(realFail("F1"), ["F1"]).F1), "browser:pixel");
});

test("integration gate: pending record is no verdict — a rule regression is neither passed nor reverted", () => {
  const ids = ["P1", "P2"];
  const fx = makeFixture({ orders: ids.map((id) => page(id, 5)) });
  const t = mc(fx, "issue", "create", "--title", "[integration] rule-regression (2 页)", "--status", "in_review", "--assignee-id", fx.id("gate"), "--project", "proj-1");
  for (const [k, v] of Object.entries({ kind: "integration", purpose: "rule-regression", workOrders: ids, branch: "integration", attempt: 1, fixRound: 0, ruleChange: "rule/x", ruleSha: "abc1234" })) setMeta(fx, t.id, k, v);
  const r = gate(fx, t.id, { pending: "record", missing: [{ wo: "P1", why: "no baseline" }, { wo: "P2", why: "interaction script changed since the baseline" }], attempt: 1, durationMs: 4 });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(issue(fx, t.id).status, "in_review", "not closed");
  assert.ok(!issue(fx, t.id).comments.some((c) => /已回退|reverted/.test(c.content)), "no revert");
  // HM-1181: it waits for recordings of the pages it named (no detail file: the full list is the metadata's)
  assert.equal(meta(fx, t.id).waitRecord, true);
  assert.deepEqual(Object.keys(meta(fx, t.id).waitRecordFrom).sort(), ids);
  assert.equal(meta(fx, t.id).advanced, "1.g0", "the verdict is handled once");
  assert.deepEqual(issuesOf(fx).filter((i) => i.title.startsWith("[record]")).map((i) => i.title).sort(), ["[record] P1", "[record] P2"]);
});

test("integration gate: pending record summary (HM-876) — the count comes from missingTotal, not the id sample", () => {
  const ids = Array.from({ length: 12 }, (_, i) => `Q${i}`);
  const fx = makeFixture({ orders: ids.map((id) => page(id, 5)) });
  const t = mc(fx, "issue", "create", "--title", "[integration] rule-regression (12 页)", "--status", "in_review", "--assignee-id", fx.id("gate"), "--project", "proj-1");
  for (const [k, v] of Object.entries({ kind: "integration", purpose: "rule-regression", workOrders: ids, branch: "integration", attempt: 1, fixRound: 0, ruleChange: "rule/x", ruleSha: "abc1234" })) setMeta(fx, t.id, k, v);
  // what gate.mjs slimResult writes when the list does not fit: counts, a sample, the detail file (not on this machine)
  const v = { pending: "record", missingTotal: 12, byReason: { "interaction script changed since the baseline": 9, "no baseline": 3 }, missing: ids.slice(0, 2), missingTruncated: true, attempt: 1, detail: "/state/gate/pending-x-a1.json" };
  let r = gate(fx, t.id, v);
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(issue(fx, t.id).status, "in_review", "not closed");
  assert.equal(issuesOf(fx).filter((i) => i.title.startsWith("[record]")).length, 0, "nothing recorded on the word of a sample (HM-1181)");
  assert.match(issue(fx, t.id).comments.at(-1).content, /12 页.*重跑门槛/);
  assert.equal(meta(fx, t.id)["gate.1"], undefined, "re-gated for a fresh verdict");
  // the same again: an incident for the arbiter, no further re-gate
  r = gate(fx, t.id, v);
  assert.ok(issuesOf(fx).some((i) => i.title.startsWith("[incident]")), JSON.stringify(r));
  assert.equal(meta(fx, t.id)["gate.1"]?.pending, "record", "not re-gated again");
});

test("rule regression: every page passes, only app-wide zero-reference hits fail the verdict — the rule is not reverted (HM-1270)", () => {
  const ids = ["P1", "P2", "P3"];
  const fx = makeFixture({ orders: ids.map((id) => page(id, 5)) });
  const t = mc(fx, "issue", "create", "--title", "[integration] rule-regression (3 页)", "--status", "in_review", "--assignee-id", fx.id("gate"), "--project", "proj-1");
  for (const [k, v] of Object.entries({ kind: "integration", purpose: "rule-regression", workOrders: ids, branch: "integration", attempt: 1, fixRound: 0, ruleChange: "rule/x", ruleSha: "abc1234" })) setMeta(fx, t.id, k, v);
  // what slimResult writes for a large verdict: failing pages only, the passing ones counted
  const global = { total: 336, byLayer: { shell: 332, entry: 2, shared: 2 }, byOwner: {} };
  const r = gate(fx, t.id, { pass: false, stage: "static", mode: "integration", attempt: 1, failed: [{ check: "no-legacy", where: "apps/portal/src/main.ts", hint: "x ×1", layer: "shell" }], failedTotal: 336, global, pages: [], passedOmitted: 3 });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(issue(fx, t.id).status, "done");
  assert.match(issue(fx, t.id).comments.at(-1).content, /全量回归通过.*整站零引用 336 条与规则无关/);
  assert.ok(!issue(fx, t.id).comments.some((c) => /已回退/.test(c.content)), "no revert");
});

test("rule regression: a failing page still reverts the rule", () => {
  const ids = ["P1", "P2"];
  const fx = makeFixture({ orders: ids.map((id) => page(id, 5)) });
  const g = (...a) => execFileSync("git", ["-C", fx.tool, ...a], { encoding: "utf8" }).trim();
  writeFileSync(path.join(fx.tool, "rule-x.json"), "{}"); g("add", "-A"); g("-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "-m", "rule x"); g("push", "-q", "origin", "main");
  seedKnownFailed(fx, []); // a baseline already exists (an earlier clean regression); P2 is a genuinely new failure
  const t = mc(fx, "issue", "create", "--title", "[integration] rule-regression (2 页)", "--status", "in_review", "--assignee-id", fx.id("gate"), "--project", "proj-1");
  for (const [k, v] of Object.entries({ kind: "integration", purpose: "rule-regression", workOrders: ids, branch: "integration", attempt: 1, fixRound: 0, ruleChange: "rule/x", ruleSha: g("rev-parse", "HEAD") })) setMeta(fx, t.id, k, v);
  gate(fx, t.id, { pass: false, stage: "browser", mode: "integration", attempt: 1, failed: [{ wo: "P2", check: "html", where: "load", hint: "x" }], global: { total: 3, byLayer: { shell: 3 }, byOwner: {} }, pages: [{ wo: "P1", pass: true }, { wo: "P2", pass: false, stage: "browser" }] });
  assert.match(issue(fx, t.id).comments.at(-1).content, /回归失败（新增 1 页，共 1 页失败），已回退/);
  g("fetch", "-q", "origin");
  assert.equal(showRemote(fx, "tool", "main", "rule-x.json"), null, "the rule's commit is reverted on main");
});

test("rule regression: a revert that does not happen is not reported as one — the arbiter gets an incident (HM-1276)", () => {
  const ids = ["P1", "P2"];
  const fx = makeFixture({ orders: ids.map((id) => page(id, 5)) });
  const g = (...a) => execFileSync("git", ["-C", fx.tool, ...a], { encoding: "utf8" }).trim();
  const commit = (content, m) => { writeFileSync(path.join(fx.tool, "rule-y.json"), content); g("add", "-A"); g("-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "-m", m); return g("rev-parse", "HEAD"); };
  const rule = commit('{"a":1}\n', "rule y");
  commit('{"a":2}\n', "later rule on the same lines"); // reverting `rule` now conflicts
  g("push", "-q", "origin", "main");
  seedKnownFailed(fx, []); // a baseline already exists; P2 is a genuinely new failure
  const task = (sha) => {
    const t = mc(fx, "issue", "create", "--title", "[integration] rule-regression (2 页)", "--status", "in_review", "--assignee-id", fx.id("gate"), "--project", "proj-1");
    for (const [k, v] of Object.entries({ kind: "integration", purpose: "rule-regression", workOrders: ids, branch: "integration", attempt: 1, fixRound: 0, ruleChange: "rule/y", ruleSha: sha })) setMeta(fx, t.id, k, v);
    return t.id;
  };
  const fail = { pass: false, stage: "browser", mode: "integration", attempt: 1, failed: [{ wo: "P2", check: "html", where: "load", hint: "x" }], pages: [{ wo: "P1", pass: true }, { wo: "P2", pass: false, stage: "browser" }] };
  for (const [sha, why] of [[rule, "conflict"], ["abc1234", "not on main"]]) {
    const t = task(sha);
    const r = gate(fx, t, fail);
    assert.equal(r.ok, true, JSON.stringify(r));
    const last = issue(fx, t).comments.at(-1).content;
    assert.match(last, new RegExp(`回归失败（新增 1 页，共 1 页失败），自动回退未执行（${why}），规则仍在 main`));
    assert.doesNotMatch(last, /已回退/);
    assert.equal(issue(fx, t).status, "done", "the verdict is handled");
    assert.ok(issuesOf(fx).some((i) => i.title.startsWith("[incident]") && i.title.includes(why)), `incident for ${why}`);
  }
  g("fetch", "-q", "origin");
  assert.equal(showRemote(fx, "tool", "main", "rule-y.json"), '{"a":2}\n', "main untouched");
});

test("accepted pages (queue status regression) are done by their own integration verdict, not by the whole run passing (HM-1276)", () => {
  const ids = ["A1", "A2", "A3", "N1"];
  const fx = makeFixture({ orders: [...["A1", "A2", "A3"].map((id) => page(id, 5, { status: "regression" })), page("N1", 5)] });
  const ledgerWo = (id) => JSON.parse(readFileSync(path.join(fx.state, "ledger/tasks.json"), "utf8")).wos[id] || {};
  const task = (purpose) => {
    const t = mc(fx, "issue", "create", "--title", `[integration] ${purpose} (4 页)`, "--status", "in_review", "--assignee-id", fx.id("gate"), "--project", "proj-1");
    for (const [k, v] of Object.entries({ kind: "integration", purpose, workOrders: ids, branch: "integration", attempt: 1, fixRound: 0, ruleChange: "rule/z", ruleSha: "abc1234", ...(purpose === "bisect" ? { sha: "abc1234", bisect: { candidates: ["abc1234"], lo: 0, hi: 0, mid: 0, step: 1 } } : {}) })) setMeta(fx, t.id, k, v);
    return t.id;
  };
  // a bisect step tests an older commit: it closes nothing
  gate(fx, task("bisect"), { pass: true, stage: "browser", mode: "integration", attempt: 1, failed: [], pages: ids.map((wo) => ({ wo, pass: true })) });
  assert.equal(ledgerWo("A1").state, undefined, "bisect closes nothing");
  // slimmed verdict: failing pages listed, the passing ones counted; A2 fails
  gate(fx, task("rule-regression"), { pass: false, stage: "browser", mode: "integration", attempt: 1, run: "r1", failed: [{ wo: "A2", check: "html", where: "load", hint: "x" }], pages: [{ wo: "A2", pass: false, stage: "browser" }], passedOmitted: 3 });
  assert.equal(ledgerWo("A1").state, "done");
  assert.equal(ledgerWo("A1").verified.run, "r1");
  assert.equal(ledgerWo("A3").state, "done");
  assert.equal(ledgerWo("A2").state, undefined, "a failing page stays open");
  assert.equal(ledgerWo("N1").state, undefined, "only accepted pages: a restored page is done by its own task");
  // a truncated page list decides nothing
  gate(fx, task("rule-regression"), { pass: false, stage: "browser", mode: "integration", attempt: 1, failed: [], pages: [], pagesTruncated: true, passedOmitted: 4 });
  assert.equal(ledgerWo("A2").state, undefined);
  // A2 passes later on its own
  gate(fx, task("rule-regression"), { pass: false, stage: "browser", mode: "integration", attempt: 1, run: "r2", failed: [{ wo: "N1", check: "html", where: "load", hint: "x" }], pages: ids.map((wo) => ({ wo, pass: wo !== "N1" })) });
  assert.equal(ledgerWo("A2").state, "done");
  assert.equal(ledgerWo("A1").verified.run, "r1", "an already done page keeps its first verdict");
});

test("rule regression: a passing one closes the open rule regressions it covers — rule in the tested tools, pages judged (HM-1270)", () => {
  const ids = ["P1", "P2", "P3"];
  const fx = makeFixture({ orders: ids.map((id) => page(id, 5)) });
  const g = (...a) => execFileSync("git", ["-C", fx.tool, ...a], { encoding: "utf8" }).trim();
  const ruleCommit = (n) => { writeFileSync(path.join(fx.tool, `rule-${n}.json`), "{}"); g("add", "-A"); g("-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "-m", `rule ${n}`); return g("rev-parse", "HEAD"); };
  const r1 = ruleCommit(1), r2 = ruleCommit(2);
  g("push", "-q", "origin", "main");
  g("checkout", "-q", "-b", "later"); const r3 = ruleCommit(3); g("push", "-q", "origin", "later"); g("checkout", "-q", "main");
  const task = (rule, sha, wos) => {
    const t = mc(fx, "issue", "create", "--title", `[integration] rule-regression (${wos.length} 页)`, "--status", "in_review", "--assignee-id", fx.id("gate"), "--project", "proj-1");
    for (const [k, v] of Object.entries({ kind: "integration", purpose: "rule-regression", workOrders: wos, branch: "integration", attempt: 1, fixRound: 0, ruleChange: rule, ruleSha: sha, gateSeq: 2 })) setMeta(fx, t.id, k, v);
    return t.id;
  };
  const old = task("rule/1", r1, ["P1"]);        // covered: rule 1 is in the tested tools, P1 judged
  const wider = task("rule/1b", r1, ["P1", "P3"]); // P3 not judged by the passing run
  const later = task("rule/3", r3, ["P1"]);      // rule 3 is not in the tested tools
  const cur = task("rule/2", r2, ["P1", "P2"]);
  const r = gate(fx, cur, { pass: true, stage: "browser", mode: "integration", attempt: 1, failed: [], tools: r2, pages: [{ wo: "P1", pass: true }, { wo: "P2", pass: true }] });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(issue(fx, cur).status, "done");
  assert.equal(issue(fx, old).status, "done");
  assert.match(issue(fx, old).comments.at(-1).content, new RegExp(`rule/1 全量回归通过：由 ${cur} 的回归覆盖`));
  assert.equal(meta(fx, old).advanced, "1.g2", "a later verdict of its own is not advanced");
  assert.equal(meta(fx, old).coveredBy, cur);
  assert.equal(issue(fx, wider).status, "in_review");
  assert.equal(issue(fx, later).status, "in_review");
  // a verdict from a checkout with local edits ("<sha>+<diff>") covers nothing
  const again = task("rule/1c", r1, ["P1"]);
  const cur2 = task("rule/2b", r2, ["P1", "P2"]);
  gate(fx, cur2, { pass: true, stage: "browser", mode: "integration", attempt: 1, failed: [], tools: `${r2}+abcdef123456`, pages: [{ wo: "P1", pass: true }, { wo: "P2", pass: true }] });
  assert.equal(issue(fx, cur2).status, "done");
  assert.equal(issue(fx, again).status, "in_review");
});

test("rule regression: a page that was already failing before this rule merged is not blamed on it (HM-1471)", () => {
  const ids = ["P1", "P2"];
  const fx = makeFixture({ orders: ids.map((id) => page(id, 5)) });
  const g = (...a) => execFileSync("git", ["-C", fx.tool, ...a], { encoding: "utf8" }).trim();
  writeFileSync(path.join(fx.tool, "rule-x.json"), "{}"); g("add", "-A"); g("-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "-m", "rule x"); g("push", "-q", "origin", "main");
  // the last full conclusion already saw P2 failing, before rule/x ever merged — e.g. a plain regression or an
  // earlier rule regression that ran on the same head
  seedKnownFailed(fx, ["P2"]);
  const t = mc(fx, "issue", "create", "--title", "[integration] rule-regression (2 页)", "--status", "in_review", "--assignee-id", fx.id("gate"), "--project", "proj-1");
  for (const [k, v] of Object.entries({ kind: "integration", purpose: "rule-regression", workOrders: ids, branch: "integration", attempt: 1, fixRound: 0, ruleChange: "rule/x", ruleSha: g("rev-parse", "HEAD") })) setMeta(fx, t.id, k, v);
  const r = gate(fx, t.id, { pass: false, stage: "browser", mode: "integration", attempt: 1, failed: [{ wo: "P2", check: "html", where: "load", hint: "x" }], global: { total: 3, byLayer: { shell: 3 }, byOwner: {} }, pages: [{ wo: "P1", pass: true }, { wo: "P2", pass: false, stage: "browser" }] });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.match(issue(fx, t.id).comments.at(-1).content, /全量回归通过（失败 1 页在规则合入前已失败，与本规则无关，不回退）/);
  assert.equal(issue(fx, t.id).status, "done");
  g("fetch", "-q", "origin");
  assert.equal(showRemote(fx, "tool", "main", "rule-x.json"), "{}", "the rule stays on main — the failure predates it");
});

test("rule regression: pre-existing failures don't shield a rule that also broke a new page (HM-1471)", () => {
  const ids = ["P1", "P2", "P3"];
  const fx = makeFixture({ orders: ids.map((id) => page(id, 5)) });
  const g = (...a) => execFileSync("git", ["-C", fx.tool, ...a], { encoding: "utf8" }).trim();
  writeFileSync(path.join(fx.tool, "rule-x.json"), "{}"); g("add", "-A"); g("-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "-m", "rule x"); g("push", "-q", "origin", "main");
  seedKnownFailed(fx, ["P2"]); // P2 was already failing; P3 is new
  const t = mc(fx, "issue", "create", "--title", "[integration] rule-regression (3 页)", "--status", "in_review", "--assignee-id", fx.id("gate"), "--project", "proj-1");
  for (const [k, v] of Object.entries({ kind: "integration", purpose: "rule-regression", workOrders: ids, branch: "integration", attempt: 1, fixRound: 0, ruleChange: "rule/x", ruleSha: g("rev-parse", "HEAD") })) setMeta(fx, t.id, k, v);
  const r = gate(fx, t.id, { pass: false, stage: "browser", mode: "integration", attempt: 1, failed: [{ wo: "P2", check: "html", where: "load", hint: "x" }, { wo: "P3", check: "html", where: "load", hint: "y" }], pages: [{ wo: "P1", pass: true }, { wo: "P2", pass: false, stage: "browser" }, { wo: "P3", pass: false, stage: "browser" }] });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.match(issue(fx, t.id).comments.at(-1).content, /回归失败（新增 1 页，共 2 页失败），已回退/);
  g("fetch", "-q", "origin");
  assert.equal(showRemote(fx, "tool", "main", "rule-x.json"), null, "a rule that broke a genuinely new page is still reverted");
});

test("rule regression: a budget-truncated verdict recovers the real failed set from the on-disk detail file (HM-1471)", () => {
  // gate.mjs (slimResult) drops `pages`/`passedOmitted` to fit the metadata budget on a verdict too large to list even
  // its failing pages; the only authoritative copy left is the untruncated result it names in `detail`.
  const ids = ["P1", "P2", "P3"];
  const fx = makeFixture({ orders: ids.map((id) => page(id, 5)) });
  const g = (...a) => execFileSync("git", ["-C", fx.tool, ...a], { encoding: "utf8" }).trim();
  writeFileSync(path.join(fx.tool, "rule-x.json"), "{}"); g("add", "-A"); g("-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "-m", "rule x"); g("push", "-q", "origin", "main");
  seedKnownFailed(fx, []); // a baseline already exists; P2 is a genuinely new failure
  const detail = path.join(fx.state, "gate", "runs-full-result.json");
  writeFileSync(detail, JSON.stringify({ pages: [{ wo: "P1", pass: true }, { wo: "P2", pass: false }, { wo: "P3", pass: true }] }));
  const t = mc(fx, "issue", "create", "--title", "[integration] rule-regression (3 页)", "--status", "in_review", "--assignee-id", fx.id("gate"), "--project", "proj-1");
  for (const [k, v] of Object.entries({ kind: "integration", purpose: "rule-regression", workOrders: ids, branch: "integration", attempt: 1, fixRound: 0, ruleChange: "rule/x", ruleSha: g("rev-parse", "HEAD") })) setMeta(fx, t.id, k, v);
  // the metadata verdict itself: no `pages`, no `passedOmitted` — every wo would otherwise read as failed
  const r = gate(fx, t.id, { pass: false, stage: "browser", mode: "integration", attempt: 1, failed: [], pages: [], pagesTruncated: true, detail });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.match(issue(fx, t.id).comments.at(-1).content, /回归失败（新增 1 页，共 1 页失败），已回退/, "only P2 — not all 3 — counts as failed");
  g("fetch", "-q", "origin");
  assert.equal(showRemote(fx, "tool", "main", "rule-x.json"), null);
});

test("rule regression: cold start — no knownFailed, no regression, no integration-gate yet — does not guess, does not revert (HM-1471)", () => {
  const ids = ["P1", "P2", "P3"];
  const fx = makeFixture({ orders: ids.map((id) => page(id, 5)) });
  const g = (...a) => execFileSync("git", ["-C", fx.tool, ...a], { encoding: "utf8" }).trim();
  writeFileSync(path.join(fx.tool, "rule-x.json"), "{}"); g("add", "-A"); g("-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "-m", "rule x"); g("push", "-q", "origin", "main");
  // no seedKnownFailed call: a brand-new ledger, exactly the state PR #93's first version shipped into (HM-1471)
  const t = mc(fx, "issue", "create", "--title", "[integration] rule-regression (3 页)", "--status", "in_review", "--assignee-id", fx.id("gate"), "--project", "proj-1");
  for (const [k, v] of Object.entries({ kind: "integration", purpose: "rule-regression", workOrders: ids, branch: "integration", attempt: 1, fixRound: 0, ruleChange: "rule/x", ruleSha: g("rev-parse", "HEAD") })) setMeta(fx, t.id, k, v);
  const r = gate(fx, t.id, { pass: false, stage: "browser", mode: "integration", attempt: 1, failed: [{ wo: "P2", check: "html", where: "load", hint: "x" }, { wo: "P3", check: "html", where: "load", hint: "y" }], pages: [{ wo: "P1", pass: true }, { wo: "P2", pass: false, stage: "browser" }, { wo: "P3", pass: false, stage: "browser" }] });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.match(issue(fx, t.id).comments.at(-1).content, /没有可比较的基线，不回退/);
  assert.doesNotMatch(issue(fx, t.id).comments.at(-1).content, /已回退/);
  assert.ok(issuesOf(fx).some((i) => i.title.startsWith("[incident]")), "an incident for the arbiter");
  g("fetch", "-q", "origin");
  assert.equal(showRemote(fx, "tool", "main", "rule-x.json"), "{}", "the rule stays on main — there is nothing to compare its failures against yet");
});

test("rule regression: knownFailed missing falls back to the last plain regression's failed set, then integration-gate's (HM-1471)", () => {
  const ids = ["P1", "P2"];
  const fx = makeFixture({ orders: ids.map((id) => page(id, 5)) });
  const g = (...a) => execFileSync("git", ["-C", fx.tool, ...a], { encoding: "utf8" }).trim();
  writeFileSync(path.join(fx.tool, "rule-x.json"), "{}"); g("add", "-A"); g("-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "-m", "rule x"); g("push", "-q", "origin", "main");
  // no knownFailed, but an older `regression` conclusion already recorded P2 as failing
  const p = path.join(fx.state, "ledger", "tick-state.json");
  writeFileSync(p, JSON.stringify({ regression: { state: "failed", failed: ["P2"] } }));
  const t = mc(fx, "issue", "create", "--title", "[integration] rule-regression (2 页)", "--status", "in_review", "--assignee-id", fx.id("gate"), "--project", "proj-1");
  for (const [k, v] of Object.entries({ kind: "integration", purpose: "rule-regression", workOrders: ids, branch: "integration", attempt: 1, fixRound: 0, ruleChange: "rule/x", ruleSha: g("rev-parse", "HEAD") })) setMeta(fx, t.id, k, v);
  const r = gate(fx, t.id, { pass: false, stage: "browser", mode: "integration", attempt: 1, failed: [{ wo: "P2", check: "html", where: "load", hint: "x" }], pages: [{ wo: "P1", pass: true }, { wo: "P2", pass: false, stage: "browser" }] });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.match(issue(fx, t.id).comments.at(-1).content, /全量回归通过（失败 1 页在规则合入前已失败，与本规则无关，不回退）/);
  g("fetch", "-q", "origin");
  assert.equal(showRemote(fx, "tool", "main", "rule-x.json"), "{}", "the rule stays on main — P2 was already known failing");
});

test("rule regression: a revert does not wipe the known-failed baseline to empty (HM-1471)", () => {
  const ids = ["P1", "P2", "P3"];
  const fx = makeFixture({ orders: ids.map((id) => page(id, 5)) });
  const g = (...a) => execFileSync("git", ["-C", fx.tool, ...a], { encoding: "utf8" }).trim();
  writeFileSync(path.join(fx.tool, "rule-x.json"), "{}"); g("add", "-A"); g("-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "-m", "rule x"); g("push", "-q", "origin", "main");
  seedKnownFailed(fx, ["P2"]); // P2 already known failing; P3 is this rule's own new failure
  const t = mc(fx, "issue", "create", "--title", "[integration] rule-regression (3 页)", "--status", "in_review", "--assignee-id", fx.id("gate"), "--project", "proj-1");
  for (const [k, v] of Object.entries({ kind: "integration", purpose: "rule-regression", workOrders: ids, branch: "integration", attempt: 1, fixRound: 0, ruleChange: "rule/x", ruleSha: g("rev-parse", "HEAD") })) setMeta(fx, t.id, k, v);
  gate(fx, t.id, { pass: false, stage: "browser", mode: "integration", attempt: 1, failed: [{ wo: "P2", check: "html", where: "load", hint: "x" }, { wo: "P3", check: "html", where: "load", hint: "y" }], pages: [{ wo: "P1", pass: true }, { wo: "P2", pass: false, stage: "browser" }, { wo: "P3", pass: false, stage: "browser" }] });
  const p = path.join(fx.state, "ledger", "tick-state.json");
  assert.deepEqual(JSON.parse(readFileSync(p, "utf8")).knownFailed.failed, ["P2"], "untouched — not wiped to []");
});
