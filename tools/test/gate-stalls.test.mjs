// HM-1306: a gate round that ends without a result (gate.mjs {error}, `[GATE] ERROR` from the gate agent, a failed gate
// run nobody took over, or a gate agent that just stopped) used to leave the task in_review on the gate forever.
// tick step "gate stalls": environment errors are re-gated with backoff (30 / 60 / 120 min, at most 3 times), anything
// else — or still failing after 3 re-gates — opens one incident for the arbiter. pass / fail / pending are untouched.
// Run: node --test tools/test/gate-stalls.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { chmodSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { makeFixture, node, issuesOf, fakeState, setMeta, meta, pushBranch, writeReceipt, REPO } from "./fixture.mjs";
import { classifyGateError } from "../lib/error-classes.mjs";

const page = (id, kb) => ({ id, type: "page", kb, app: "portal", site: "portal", target: `apps/portal/src/views/${id}/index.vue`, subComponentDir: `apps/portal/src/views/${id}/index/`, deps: [] });
const recorded = (fx, ...ids) => ids.forEach((id) => mkdirSync(path.join(fx.state, "baseline", id), { recursive: true }));
const vue = (s) => `<template><div>${s}</div></template>\n`;
const issue = (fx, id) => fakeState(fx).issues[id];
const MIN = 60_000;
const ago = (ms) => new Date(Date.now() - ms).toISOString();
const edit = (fx, fn) => { const s = fakeState(fx); fn(s); writeFileSync(fx.fake, JSON.stringify(s)); };

// one restore task delivered and sitting on the gate (gate run queued by the hand-off)
function onGate(id = "G1", config = {}) {
  const fx = makeFixture({ orders: [page(id, 8)], config: { audit: { coldRate: 0, normalRate: 0 }, regressionEvery: 100, ...config } });
  recorded(fx, id);
  assert.equal(node(fx, "tick.mjs", ["tick"]).ok, true);
  const t = issuesOf(fx).find((i) => i.title.startsWith("[restore]"));
  const m = meta(fx, t.id);
  pushBranch(fx, { branch: m.branch, files: { [`apps/portal/src/views/${id}/index.vue`]: vue(id) } });
  writeReceipt(fx, id, { branch: m.branch });
  assert.equal(node(fx, "handoff.mjs", [t.id]).ok, true);
  assert.equal(issue(fx, t.id).assignee_id, fx.id("gate"));
  return { fx, t };
}
// the gate agent's run of this round ends (completed unless said otherwise), optionally with a comment
function gateRunEnds(fx, taskId, { status = "completed", error = null, comment = null } = {}) {
  edit(fx, (s) => {
    const i = s.issues[taskId];
    Object.assign(i.runs[0], { status, completed_at: new Date().toISOString(), ...(error ? { error } : {}) });
    if (comment) i.comments.push({ id: `c-${i.comments.length}`, content: comment, created_at: new Date().toISOString() });
  });
}
// time passes: every timestamp of the task (comments, runs, gateSentAt, gateError.at) moves `ms` into the past
function age(fx, taskId, ms) {
  const back = (x) => (x ? new Date(Date.parse(x) - ms).toISOString() : x);
  edit(fx, (s) => {
    const i = s.issues[taskId];
    for (const c of i.comments) c.created_at = back(c.created_at);
    for (const r of i.runs) { r.created_at = back(r.created_at); if (r.completed_at) r.completed_at = back(r.completed_at); }
    if (i.metadata.gateSentAt) i.metadata.gateSentAt = back(i.metadata.gateSentAt);
    if (i.metadata.gateError?.at) i.metadata.gateError = { ...i.metadata.gateError, at: back(i.metadata.gateError.at) };
  });
}
const incidents = (fx) => issuesOf(fx).filter((i) => i.title.startsWith("[incident]"));
const heads = (fx, id) => issue(fx, id).comments.map((c) => c.content.split("\n")[0]);

test("classifyGateError: the 10-22/10-23 environment errors vs the gate's real problems", () => {
  for (const s of ["page.screenshot: Timeout 30000ms exceeded.", "门槛运行出错：page.screenshot 超时 30000ms（浏览器截图，环境问题），未调用 advance",
    "page.goto: Timeout 60000ms exceeded.", "fatal: unable to access 'https://github.com/libingtong/hmrsfw-vue/': LibreSSL SSL_connect: SSL_ERROR_SYSCALL in connection to github.com:443",
    "ENOSPC: no space left on device, write", "磁盘已满，npm 无法写入", "daemon repo/checkout 超时，检出残缺", "gate ended without a result (a pending step never settled)",
    "2 page(s) not judged within 10 min (--page-timeout; the gate's own error, not a verdict): a, b", "browserType.launch: Target page, context or browser has been closed"])
    assert.equal(classifyGateError(s), "environment", s);
  for (const s of ["crypto keys missing for the restored app: VITE_HMRSFW_SM2_PUBLIC_KEY", "Invalid regular expression: /(?<x/: Invalid capture group name",
    "Invalid request: metadata exceeds the 8KB size limit", "TypeError: Cannot read properties of undefined (reading 'wo') at gate (tools/gate.mjs:443:12)",
    "[GATE] 本次未重跑：restore/fast-lane 仍在 523022d，与 a2 相同"])
    assert.equal(classifyGateError(s), "other", s);
});

test("environment error from gate.mjs: re-gated after 30 / 60 / 120 min, then one incident; a result resets the count", async () => {
  const { fx, t } = onGate("G1");
  // gate.mjs reportError writes gateError for the current round (through the fake CLI, as the gate agent's run would)
  const bin = path.join(fx.root, "multica-bin");
  writeFileSync(bin, `#!/bin/sh\nexec "${process.execPath}" "${path.join(REPO, "tools/lib/fake-multica.mjs")}" "$@"\n`);
  chmodSync(bin, 0o755);
  Object.assign(process.env, { MULTICA_BIN: bin, MULTICA_FAKE_STATE: fx.fake, RESTORE_STATE: fx.state });
  const { reportError } = await import("../gate.mjs");
  const seq0 = meta(fx, t.id).gateSeq;
  assert.ok(meta(fx, t.id).gateSentAt, "sendToGate notes when the round began");

  // the gate is still running: nothing happens
  let r = node(fx, "tick.mjs", ["tick"]);
  assert.equal(meta(fx, t.id).gateSeq, seq0);

  const v = reportError(t.id, 1, "page.screenshot: Timeout 30000ms exceeded.");
  assert.deepEqual({ round: v.round, class: v.class }, { round: `1.g${seq0}`, class: "environment" });
  gateRunEnds(fx, t.id, { comment: "[GATE] ERROR page.screenshot 超时 30000ms，未调用 advance" });
  r = node(fx, "tick.mjs", ["tick"]);
  assert.equal(meta(fx, t.id).gateSeq, seq0, "not before 30 min");
  assert.equal(incidents(fx).length, 0);

  age(fx, t.id, 31 * MIN);
  const runs0 = issue(fx, t.id).runs.length;
  r = node(fx, "tick.mjs", ["tick"]);
  assert.equal(r.ok, true, JSON.stringify(r));
  let m = meta(fx, t.id);
  assert.equal(m.gateSeq, seq0 + 1, "re-gated");
  assert.equal(m.gateErrorRetry.n, 1);
  assert.equal(m.gateError, undefined, "the old round's gateError goes with the send");
  assert.equal(issue(fx, t.id).runs.length, runs0 + 1, "gate rerun");
  assert.match(heads(fx, t.id).at(-1), /^\[REDO\] 门槛自身出错（环境类：page\.screenshot: Timeout 30000ms exceeded\.），第 1\/3 次自动重送门槛/);
  assert.ok(r.actions.some((a) => /regate .* #1/.test(a)));

  // 2nd error (only the agent's comment this time): 60 min backoff
  gateRunEnds(fx, t.id, { comment: "[GATE] ERROR git fetch integration: SSL_ERROR_SYSCALL (github.com:443)" });
  age(fx, t.id, 31 * MIN);
  node(fx, "tick.mjs", ["tick"]);
  assert.equal(meta(fx, t.id).gateSeq, seq0 + 1, "second retry waits 60 min");
  age(fx, t.id, 30 * MIN);
  node(fx, "tick.mjs", ["tick"]);
  assert.equal(meta(fx, t.id).gateSeq, seq0 + 2);
  assert.equal(meta(fx, t.id).gateErrorRetry.n, 2);

  // 3rd: 120 min
  gateRunEnds(fx, t.id, { comment: "[GATE] ERROR ENOSPC: no space left on device" });
  age(fx, t.id, 119 * MIN);
  node(fx, "tick.mjs", ["tick"]);
  assert.equal(meta(fx, t.id).gateSeq, seq0 + 2);
  age(fx, t.id, 2 * MIN);
  node(fx, "tick.mjs", ["tick"]);
  assert.equal(meta(fx, t.id).gateSeq, seq0 + 3);

  // 4th error: no more re-gates, one incident
  gateRunEnds(fx, t.id, { comment: "[GATE] ERROR page.goto: Timeout 60000ms exceeded." });
  age(fx, t.id, 300 * MIN);
  r = node(fx, "tick.mjs", ["tick"]);
  m = meta(fx, t.id);
  assert.equal(m.gateSeq, seq0 + 3, "max 3 re-gates");
  assert.equal(m.gateStall, `1.g${seq0 + 3}`);
  assert.equal(incidents(fx).length, 1);
  const inc = incidents(fx)[0];
  assert.match(inc.title, /门槛自身出错，自动重送 3 次仍失败/);
  assert.equal(inc.assignee_id, fx.id("arbiter"));
  assert.equal(meta(fx, inc.id).paused, false, "an incident for one task does not pause dispatch");
  assert.match(heads(fx, t.id).at(-1), /^\[GATE\] 门槛自身出错，已自动重送 3 次仍失败，不再重送 → 排障单/);
  assert.ok(r.anomalies.some((a) => a.issue === inc.id));
  node(fx, "tick.mjs", ["tick"]);
  assert.equal(incidents(fx).length, 1, "once per gate round");
  assert.equal(issue(fx, t.id).status, "in_review");
  assert.equal(issue(fx, t.id).assignee_id, fx.id("gate"), "still the gate's; the arbiter re-gates it after the fix");

  // the arbiter's --regate and then a real verdict: the count starts again
  assert.equal(node(fx, "tick.mjs", ["advance", t.id, "--regate"]).ok, true);
  setMeta(fx, t.id, "gate.1", { pass: false, stage: "browser", failed: [{ check: "pixel", where: "load", hint: "1% of pixels differ", wo: "G1" }], pages: [{ wo: "G1", pass: false, stage: "browser" }] });
  r = node(fx, "tick.mjs", ["advance", t.id]);
  assert.equal(r.ok, true, JSON.stringify(r));
  m = meta(fx, t.id);
  assert.equal(issue(fx, t.id).assignee_id, fx.id("fixer"), "a fail verdict is handled as before");
  assert.equal(m.gateErrorRetry, undefined);
  assert.equal(m.gateStall, undefined);
});

test("not an environment error: incident at once, no re-gate", () => {
  const { fx, t } = onGate("G2");
  const seq0 = meta(fx, t.id).gateSeq;
  gateRunEnds(fx, t.id, { comment: "[GATE] ERROR crypto keys missing for the restored app: VITE_HMRSFW_SM4_KEY" });
  const r = node(fx, "tick.mjs", ["tick"]);
  assert.equal(meta(fx, t.id).gateSeq, seq0, "no re-gate");
  assert.equal(incidents(fx).length, 1);
  assert.match(incidents(fx)[0].title, /门槛没有结论（\[GATE\] ERROR）/);
  assert.equal(meta(fx, incidents(fx)[0].id).details.error, "crypto keys missing for the restored app: VITE_HMRSFW_SM4_KEY");
  assert.ok(r.anomalies.some((a) => a.issue === incidents(fx)[0].id));
});

test("gate agent ended without running the gate and without [GATE] ERROR (HM-480): incident", () => {
  const { fx, t } = onGate("G3");
  gateRunEnds(fx, t.id, { comment: "[GATE] 本次未重跑：`restore/fast-lane` 仍在 523022d，与 a2 相同；规则合并并重录后再送门槛。" });
  node(fx, "tick.mjs", ["tick"]);
  assert.equal(incidents(fx).length, 1);
  assert.match(incidents(fx)[0].title, /门槛没有结论（no verdict）/);
  assert.match(meta(fx, incidents(fx)[0].id).details.error, /本次未重跑/);
});

test("a result the gate wrote is advanced, not taken for a stall; a failed gate run goes to step 2 first", () => {
  const { fx, t } = onGate("G4");
  // gate.mjs wrote a verdict, the agent's advance did not run: fallback advance's job, not an incident
  setMeta(fx, t.id, "gate.1", { pass: false, stage: "browser", failed: [{ check: "pixel", where: "load", hint: "x", wo: "G4" }], pages: [{ wo: "G4", pass: false, stage: "browser" }] });
  gateRunEnds(fx, t.id);
  node(fx, "tick.mjs", ["tick"]);
  assert.equal(incidents(fx).length, 0);

  const { fx: fx2, t: t2 } = onGate("G5");
  const seq0 = meta(fx2, t2.id).gateSeq;
  gateRunEnds(fx2, t2.id, { status: "failed", error: "runtime offline: daemon not reachable" });
  node(fx2, "tick.mjs", ["tick"]);
  assert.equal(issue(fx2, t2.id).runs[0].why, "rerun", "step 2 reruns an environment failure once");
  assert.equal(meta(fx2, t2.id).gateSeq, seq0, "step 3b leaves it to step 2");
  assert.equal(incidents(fx2).length, 0);
});

test("tasks sent before gateSentAt existed: the scheduler's send comment marks the round", () => {
  const { fx, t } = onGate("G6");
  const seq0 = meta(fx, t.id).gateSeq;
  edit(fx, (s) => { delete s.issues[t.id].metadata.gateSentAt; });
  // an ERROR from an earlier round, before the hand-off comment, does not count
  edit(fx, (s) => { s.issues[t.id].comments.unshift({ id: "old", content: "[GATE] ERROR page.screenshot 超时 30000ms", created_at: ago(500 * MIN) }); });
  age(fx, t.id, 10 * MIN); // also moves the old ERROR further back
  gateRunEnds(fx, t.id);
  node(fx, "tick.mjs", ["tick"]);
  assert.equal(meta(fx, t.id).gateSeq, seq0, "old ERROR ignored");
  assert.match(incidents(fx)[0]?.title || "", /no verdict/, "this round ended without a result");

  const { fx: fx2, t: t2 } = onGate("G7");
  edit(fx2, (s) => { delete s.issues[t2.id].metadata.gateSentAt; });
  gateRunEnds(fx2, t2.id, { comment: "[GATE] ERROR GitHub 443 SSL_ERROR_SYSCALL，拉不到 integration" });
  age(fx2, t2.id, 2 * 24 * 60 * MIN); // stuck for two days
  const seq2 = meta(fx2, t2.id).gateSeq;
  node(fx2, "tick.mjs", ["tick"]);
  assert.equal(meta(fx2, t2.id).gateSeq, seq2 + 1, "re-gated at once: the error is long past its 30 min");
});

test("perTick caps the re-gates of one round", () => {
  const ids = ["H1", "H2", "H3"];
  const fx = makeFixture({ orders: ids.map((id) => page(id, 8)), config: { audit: { coldRate: 0, normalRate: 0 }, regressionEvery: 100, gateErrorRetry: { perTick: 2 } } });
  recorded(fx, ...ids);
  node(fx, "tick.mjs", ["tick"]);
  const ts = issuesOf(fx).filter((i) => i.title.startsWith("[restore]"));
  assert.equal(ts.length, 3);
  for (const t of ts) {
    const m = meta(fx, t.id);
    pushBranch(fx, { branch: m.branch, files: { [`apps/portal/src/views/${m.workOrders[0]}/index.vue`]: vue("x") } });
    writeReceipt(fx, m.workOrders[0], { branch: m.branch });
    assert.equal(node(fx, "handoff.mjs", [t.id]).ok, true);
    gateRunEnds(fx, t.id, { comment: "[GATE] ERROR page.screenshot: Timeout 30000ms exceeded." });
    age(fx, t.id, 40 * MIN);
  }
  const seqs = () => ts.map((t) => meta(fx, t.id).gateErrorRetry?.n || 0);
  node(fx, "tick.mjs", ["tick"]);
  assert.equal(seqs().filter((n) => n === 1).length, 2, "two this round");
  node(fx, "tick.mjs", ["tick"]);
  assert.equal(seqs().filter((n) => n === 1).length, 3, "the third next round");
});
