// End-to-end hand-over between gate.mjs (A) and tick.mjs advance (B), driven with the JSON gate.mjs really prints
// (HM-9 integration run, 2026-10-10): `pages` is an array of {wo, pass, stage, failed, …}, integration runs carry
// app-wide failures without `wo`. The scheduler tests elsewhere feed hand-written verdicts; these use the real shapes.
// Run: node --test tools/test/gate-advance.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { makeFixture, node, issuesOf, fakeState, mc, setMeta, meta, pushBranch, writeReceipt, showRemote } from "./fixture.mjs";

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
  assert.equal(r.ok, false);
  assert.match(r.anomalies[0].what, /pending record: 2 pages/);
  assert.equal(issue(fx, t.id).status, "in_review", "not closed");
  assert.equal(meta(fx, t.id).advanced, undefined, "not marked advanced: a later --regate can still be advanced");
  assert.ok(!issue(fx, t.id).comments.some((c) => /已回退|reverted/.test(c.content)), "no revert");
});

test("integration gate: pending record summary (HM-876) — the count comes from missingTotal, not the id sample", () => {
  const ids = Array.from({ length: 12 }, (_, i) => `Q${i}`);
  const fx = makeFixture({ orders: ids.map((id) => page(id, 5)) });
  const t = mc(fx, "issue", "create", "--title", "[integration] rule-regression (12 页)", "--status", "in_review", "--assignee-id", fx.id("gate"), "--project", "proj-1");
  for (const [k, v] of Object.entries({ kind: "integration", purpose: "rule-regression", workOrders: ids, branch: "integration", attempt: 1, fixRound: 0, ruleChange: "rule/x", ruleSha: "abc1234" })) setMeta(fx, t.id, k, v);
  // what gate.mjs slimResult writes when the list does not fit: counts, a sample, the detail file
  const r = gate(fx, t.id, { pending: "record", missingTotal: 12, byReason: { "interaction script changed since the baseline": 9, "no baseline": 3 }, missing: ids.slice(0, 2), missingTruncated: true, attempt: 1, detail: "/state/gate/pending-x-a1.json" });
  assert.equal(r.ok, false);
  assert.match(r.anomalies[0].what, /pending record: 12 pages without a usable baseline \(interaction script changed since the baseline ×9; no baseline ×3\)/);
  assert.equal(issue(fx, t.id).status, "in_review", "not closed");
  assert.equal(meta(fx, t.id).advanced, undefined);
});
