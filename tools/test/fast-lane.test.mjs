// Fast-lane mode of the scheduler (HM-48): inventory from results/*.json, restore tasks waiting for the recording, record
// dispatch restricted to the inventory and paused on a login block, gate pass → done without a merge.
// Run: node --test tools/test/fast-lane.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { makeFixture, node, issuesOf, fakeState, mc, setMeta, meta, lsRemote, git } from "./fixture.mjs";
import { fastLaneInventory } from "../lib/fastlane.mjs";

const page = (id, extra = {}) => ({ id, type: "page", kb: 10, app: "portal", site: "portal", role: "general", target: `apps/portal/src/views/${id}.vue`, subComponentDir: `apps/portal/src/views/${id}/`, recordPath: `/${id}`, deps: {}, ...extra });
const uc = (id, role, extra = {}) => page(id, { app: "uc", site: "usercenter", role, ...(role == null ? { notes: "没有身份线索" } : {}), ...extra });
const tasks = (fx, prefix) => issuesOf(fx).filter((i) => i.title.startsWith(prefix));
const issue = (fx, id) => fakeState(fx).issues[id];

const [P1, U1, U2, U3, U4, Q, A1] = ["page.portal.p1", "page.uc.u1", "page.uc.u2", "page.uc.u3", "page.uc.u4", "page.portal.q", "page.portal.a1"];
function setup() {
  const fx = makeFixture({ orders: [page(P1), uc(U1, "corp"), uc(U2, null), uc(U3, "corp"), uc(U4, "jobseeker"), page(Q), page(A1, { status: "regression", accepted: { route: "/a1" } })], config: { fastLane: { enabled: true, branch: "restore/fast-lane" } } });
  const dir = path.join(fx.tool, "tools/fast-lane/results");
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, "B1.json"), JSON.stringify({ batch: "B1", passed: [P1, U1, U2, A1, "shared.portal.x", "seg.portal.y.1"], blocked: [{ id: "page.portal.z", reason: "x" }] }));
  writeFileSync(path.join(dir, "B2.json"), JSON.stringify({ batch: "B2", passed: [U3, "seg.portal.y.2"], passedPages: [U4] }));
  return fx;
}

test("inventory: passed pages minus accepted, grouped by site and role, undecided roles counted apart", () => {
  const fx = setup();
  const inv = fastLaneInventory({ toolRoot: fx.tool, assets: undefined, state: fx.state });
  assert.equal(inv.total, 5);
  assert.equal(inv.recordable, 4);
  assert.deepEqual(inv.accepted, [A1]);
  assert.equal(inv.pages[0].id, P1, "portal first");
  assert.deepEqual(inv.pages.slice(1, 4).map((p) => p.role), ["jobseeker", "corp", "corp"], "user center by role order");
  assert.equal(inv.pages.at(-1).id, U2);
  assert.equal(inv.pages.at(-1).role, null);
  assert.equal(inv.groups["uc/need-role-decision"], 1);
  assert.equal(inv.batchBlocked.length, 1);
});

test("tick in fast-lane mode: restore tasks wait for the recording, records only for the inventory, login block pauses, gate pass → done without a merge", () => {
  const fx = setup();
  const integrationBefore = lsRemote(fx, "app", "integration");
  let r = node(fx, "tick.mjs", ["tick"]);
  assert.equal(r.ok, true, JSON.stringify(r));
  const restore = tasks(fx, "[restore]");
  assert.deepEqual(restore.map((i) => meta(fx, i.id).workOrders[0]).sort(), [P1, U1, U3, U4].sort(), "one restore task per recordable page; none for U2 (undecided role), Q, A1");
  for (const i of restore) {
    const m = meta(fx, i.id);
    assert.ok(m.fastLane === true || m.fastLane === "true");
    assert.equal(m.branch, "restore/fast-lane");
    assert.equal(i.status, "in_review");
    assert.ok(!i.assignee_id, "not assigned while waiting for the recording");
    assert.equal(m.waitRecord === true || m.waitRecord === "true", true);
  }
  const recs = tasks(fx, "[record]");
  assert.equal(recs.length, 3, "recorder keeps running + 1 queued (2 + 1)");
  const recOf = (wo) => recs.find((i) => meta(fx, i.id).workOrders[0] === wo);
  assert.deepEqual(recs.map((i) => meta(fx, i.id).workOrders[0]).sort(), [P1, U1, U4].sort(), "portal first, then jobseeker, corp");
  assert.ok(![...tasks(fx, "[record]"), ...tasks(fx, "[restore]")].some((i) => i.title.includes(Q)), "pages outside the inventory are never dispatched");

  // P1 recorded → back to the gate → pass → done, no merge
  setMeta(fx, recOf(P1).id, "record", "ok");
  mc(fx, "issue", "update", recOf(P1).id, "--status", "done", "--no-start");
  // U1: the login expired
  setMeta(fx, recOf(U1).id, "record", "blocked:login-expired");
  mc(fx, "issue", "update", recOf(U1).id, "--status", "done", "--no-start");
  r = node(fx, "tick.mjs", ["tick"]);
  const p1 = restore.find((i) => meta(fx, i.id).workOrders[0] === P1);
  assert.equal(issue(fx, p1.id).assignee_id, fx.id("gate"), "recorded page goes to the gate");
  assert.ok(r.anomalies.some((a) => /login-expired/.test(a.what)), JSON.stringify(r.anomalies));
  assert.equal(tasks(fx, "[record]").length, 3, "no new recording while a login is needed (U3 would be next)");

  setMeta(fx, p1.id, `gate.1`, { pass: true, stage: "browser", failed: [], pages: [{ wo: P1, pass: true, stage: "browser" }] });
  r = node(fx, "tick.mjs", ["advance", p1.id]);
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(issue(fx, p1.id).status, "done");
  assert.equal(lsRemote(fx, "app", "integration"), integrationBefore, "nothing merged into integration");
  assert.ok(!meta(fx, p1.id)["merge.1"] && !meta(fx, p1.id)["audit.1"]);

  // the human logged in again
  r = node(fx, "tick.mjs", ["fast-lane", "login-ok"]);
  assert.equal(r.ok, true, JSON.stringify(r));
  node(fx, "tick.mjs", ["tick"]);
  const recs2 = tasks(fx, "[record]");
  assert.ok(recs2.some((i) => /u1 a2/.test(i.title)), "login-blocked page recorded again as attempt 2");
  assert.ok(recs2.some((i) => meta(fx, i.id).workOrders[0] === U3), "paused page dispatched after the login");
  const st = JSON.parse(node(fx, "tick.mjs", ["fast-lane", "status"]).summary);
  assert.equal(st.total, 5);
  assert.equal(st.gatePass, 1);
  assert.equal(st.needRoleDecision.length, 1);
  const rep = node(fx, "tick.mjs", ["fast-lane", "report", "--write"]);
  assert.deepEqual(JSON.parse(rep.summary), { pass: 1, blocked: 1, pending: 3 }, "U2 undecided role is blocked, the rest pending");
  const written = JSON.parse(readFileSync(path.join(fx.tool, "tools/fast-lane/results/replay.json"), "utf8"));
  assert.equal(written.pages[P1].status, "pass");
  assert.match(written.pages[U2].reason, /need-role-decision/);
});

test("gate failure of a fast-lane task: fixer twice, then the arbiter; never a redo on another branch", () => {
  const fx = setup();
  node(fx, "tick.mjs", ["tick"]);
  const t = tasks(fx, "[restore]").find((i) => meta(fx, i.id).workOrders[0] === P1);
  const fail = { pass: false, stage: "browser", failed: [{ check: "html", where: "load" }], pages: [{ wo: P1, pass: false, stage: "browser" }] };
  const m0 = meta(fx, t.id);
  mc(fx, "issue", "update", t.id, "--status", "in_review", "--assignee-id", fx.id("gate"), "--no-start");
  setMeta(fx, t.id, "waitRecord", false);
  for (const [round, who] of [[1, "fixer"], [2, "fixer"], [3, "arbiter"]]) {
    setMeta(fx, t.id, `gate.${m0.attempt}`, fail);
    setMeta(fx, t.id, "gateSeq", round);
    const r = node(fx, "tick.mjs", ["advance", t.id]);
    assert.equal(r.ok, true, JSON.stringify(r));
    assert.equal(issue(fx, t.id).assignee_id, fx.id(who), `round ${round} → ${who}`);
    assert.equal(meta(fx, t.id).branch, "restore/fast-lane", "no new branch");
    mc(fx, "issue", "update", t.id, "--status", "in_review", "--assignee-id", fx.id("gate"), "--no-start");
  }
});
