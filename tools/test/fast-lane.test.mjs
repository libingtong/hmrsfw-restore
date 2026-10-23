// Fast-lane mode of the scheduler (HM-48): inventory from results/*.json, restore tasks waiting for the recording, record
// dispatch restricted to the inventory and paused on a login block, gate pass → done without a merge.
// Run: node --test tools/test/fast-lane.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { makeFixture, node, issuesOf, fakeState, mc, setMeta, meta, lsRemote, git, pushBranch, showRemote, REPO } from "./fixture.mjs";
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

// ---- retirement (HM-1068) ---------------------------------------------------------------------------------------------
// After `restore/fast-lane` is merged into integration and fastLane.enabled is false, a normal tick must not restore or
// record again what the fast lane did: core orders it passed, segments of pages it handled whole, pages it left pending,
// blocked or waiting for data. Open fast-lane tasks keep going; a pass merges fixes landed on the branch since.
const core = (id, type, target, extra = {}) => ({ id, type, kb: 3, app: "portal", site: "portal", target, files: [target], deps: {}, ...extra });
const seg = (id, pageId, extra = {}) => page(id, { type: "segment", page: pageId, ...extra });
const [E1, S2, SB, NPM, SEGP, SEG1, SEG2, PEND, PBLK, PNEW, PLAN, ACC, FLT] = ["entry.portal.E1", "shared.portal.s2", "shared.portal.sb", "shared.portal.npm1", "page.portal.segp", "seg.portal.segp.1", "seg.portal.segp.2", "page.portal.pend", "page.portal.blk", "page.portal.fresh", "page.uc.land", "page.portal.acc", "page.portal.flt"];

function mergeFastLane(fx, files) {
  pushBranch(fx, { branch: "restore/fast-lane", files });
  const wt = mkdtempSync(path.join(fx.root, "wt-"));
  git(fx.root, "clone", "-q", fx.appOrigin, wt);
  git(wt, "checkout", "-q", "-B", "integration", "origin/integration");
  git(wt, "merge", "-q", "--no-ff", "-m", "Merge restore/fast-lane into integration (HM-1067)", "origin/restore/fast-lane");
  git(wt, "push", "-q", "origin", "integration");
}

function retiredSetup({ merge = true } = {}) {
  const fx = makeFixture({
    orders: [core(E1, "entry", "apps/portal/src/legacy/index.ts"), core(S2, "shared", "apps/portal/src/shared/s2.vue"), core(SB, "shared", "apps/portal/src/shared/sb.vue"), core(NPM, "shared", undefined, { status: "npm", files: [] }),
      page(SEGP, { status: "segmented", kb: 40 }), seg(SEG1, SEGP), seg(SEG2, SEGP), page(PEND), page(PBLK), page(PNEW), uc(PLAN, null), page(ACC, { status: "regression", accepted: { route: "/acc" } }), page(FLT)],
    config: { fastLane: { enabled: true, branch: "restore/fast-lane" }, cheapTier: { enabled: false } },
  });
  const dir = path.join(fx.tool, "tools/fast-lane/results");
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, "HM-34.json"), JSON.stringify({ batch: "HM-34", passed: [E1, S2], blocked: [{ id: SB, reason: "清单缺 geo 路径" }] }));
  writeFileSync(path.join(dir, "S1.json"), JSON.stringify({ batch: "S1", passed: [SEG1, SEG2], passedPages: [SEGP] }));
  writeFileSync(path.join(dir, "P1.json"), JSON.stringify({ batch: "P1", passed: [PEND, PLAN, FLT, ACC], blocked: [{ id: PBLK, reason: "globals 缺 el-button" }] }));
  writeFileSync(path.join(dir, "replay.json"), JSON.stringify({ pages: { [SEGP]: { pass: true, status: "pass" }, [PEND]: { pass: null, status: "pending" }, [PLAN]: { pass: false, status: "blocked", reason: "need-role-decision" }, [FLT]: { pass: null, status: "pending" } } }));
  const files = Object.fromEntries([E1, S2, SB, SEGP, PEND, PLAN, FLT].map((id) => [id === E1 ? "apps/portal/src/legacy/index.ts" : id.startsWith("shared") ? `apps/portal/src/shared/${id.split(".").pop()}.vue` : `apps/portal/src/views/${id}.vue`, `<template><i>${id}</i></template>\n`]));
  if (merge) mergeFastLane(fx, files); else pushBranch(fx, { branch: "restore/fast-lane", files });
  // the fast lane's own task for FLT, open and waiting for its recording (left alone by the retirement)
  node(fx, "tick.mjs", ["fast-lane", "adopt"]);
  for (const i of tasks(fx, "[restore]").filter((t) => meta(fx, t.id).workOrders[0] !== FLT)) mc(fx, "issue", "update", i.id, "--status", "cancelled", "--no-start");
  const L = JSON.parse(readFileSync(path.join(fx.state, "ledger/tasks.json"), "utf8"));
  for (const id of [SEGP, PEND, PLAN]) delete L.wos[id]; // as on the live ledger: the fast lane never had (or no longer has) a task for them
  writeFileSync(path.join(fx.state, "ledger/tasks.json"), JSON.stringify(L));
  writeFileSync(path.join(fx.state, "scheduler.config.json"), JSON.stringify({ projectId: "proj-1", fastLane: { enabled: false, branch: "restore/fast-lane" }, cheapTier: { enabled: false } }));
  return fx;
}
const ledgerWo = (fx, id) => JSON.parse(readFileSync(path.join(fx.state, "ledger/tasks.json"), "utf8")).wos[id] || {};
const woOf = (fx, i) => meta(fx, i.id).workOrders;

test("retire refuses while restore/fast-lane is not merged into integration", () => {
  const fx = retiredSetup({ merge: false });
  const r = node(fx, "tick.mjs", ["fast-lane", "retire"]);
  assert.equal(r.ok, false);
  assert.match(r.summary, /not merged into integration/);
  assert.equal(ledgerWo(fx, E1).state, undefined, "nothing written");
});

test("retire: a normal tick then dispatches only what the fast lane never did", () => {
  const fx = retiredSetup();
  const flt = tasks(fx, "[restore]").find((i) => woOf(fx, i)[0] === FLT);
  let r = node(fx, "tick.mjs", ["fast-lane", "retire", "--dry-run"]);
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.match(r.summary, /merged 2 core orders.*superseded 2 segments, held 5, noted 1 open/);
  assert.equal(ledgerWo(fx, E1).state, undefined, "dry run writes nothing");
  r = node(fx, "tick.mjs", ["fast-lane", "retire"]);
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(ledgerWo(fx, E1).state, "merged");
  assert.equal(ledgerWo(fx, E1).merged.via, "fast-lane");
  assert.equal(ledgerWo(fx, E1).retired.batch, "HM-34");
  assert.equal(ledgerWo(fx, SEG1).state, "superseded");
  assert.equal(ledgerWo(fx, SEG1).retired.page, SEGP);
  for (const id of [SB, SEGP, PEND, PBLK]) assert.equal(ledgerWo(fx, id).state, "held", id);
  assert.match(ledgerWo(fx, PBLK).retired.reason, /globals 缺 el-button/);
  assert.equal(ledgerWo(fx, PLAN).state, "held", "landed page with an undecided role");
  assert.equal(ledgerWo(fx, FLT).state, "active", "open fast-lane task untouched");
  assert.ok(meta(fx, flt.id).retiredNote, "open fast-lane task told about the switch (comment + retiredNote)");
  assert.match(node(fx, "tick.mjs", ["fast-lane", "retire"]).summary, /merged 0 core orders .*superseded 0 segments, held 0, noted 0/, "idempotent");

  r = node(fx, "tick.mjs", ["tick"]);
  assert.equal(r.ok, true, JSON.stringify(r));
  const restored = tasks(fx, "[restore]").filter((i) => i.id !== flt.id && i.status !== "cancelled").flatMap((i) => woOf(fx, i)).sort();
  assert.deepEqual(restored, [PNEW], "only the page the fast lane never touched: the npm unit gets no restore task (HM-1170)");
  const recorded = tasks(fx, "[record]").filter((i) => i.status !== "cancelled").flatMap((i) => woOf(fx, i));
  assert.ok(!recorded.some((w) => [SEG1, SEG2, SEGP, PEND, PBLK, PLAN].includes(w)), `no recording of retired orders: ${recorded}`);
  assert.ok(recorded.includes(FLT), "the open fast-lane task still gets its recording");
});

test("release: a landed page gets a fast-lane task, anything else goes back to normal dispatch, undecided roles stay held", () => {
  const fx = retiredSetup();
  node(fx, "tick.mjs", ["fast-lane", "retire"]);
  const r = node(fx, "tick.mjs", ["fast-lane", "release", PEND, PBLK, PLAN, NPM]);
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.match(r.summary, new RegExp(`${PEND}: fast-lane task`));
  assert.match(r.summary, new RegExp(`${PBLK}: back to normal dispatch`));
  assert.match(r.summary, new RegExp(`${PLAN}: still held`));
  assert.match(r.summary, new RegExp(`${NPM}: not held`));
  const t = tasks(fx, "[restore]").find((i) => woOf(fx, i)[0] === PEND && i.status !== "cancelled");
  assert.equal(meta(fx, t.id).branch, "restore/fast-lane");
  assert.match(fakeState(fx).issues[t.id].description, /快速通道已退场/);
  node(fx, "tick.mjs", ["tick"]);
  assert.ok(tasks(fx, "[restore]").some((i) => woOf(fx, i)[0] === PBLK && !meta(fx, i.id).fastLane), "PBLK dispatched normally");
  assert.equal(ledgerWo(fx, PLAN).state, "held");
});

test("fast-lane task after the retirement: pass with nothing new → done; a fix landed on the branch → merged into integration", () => {
  const fx = retiredSetup();
  node(fx, "tick.mjs", ["fast-lane", "retire"]);
  const flt = tasks(fx, "[restore]").find((i) => woOf(fx, i)[0] === FLT);
  const pass = { pass: true, stage: "browser", failed: [], pages: [{ wo: FLT, pass: true, stage: "browser" }] };
  setMeta(fx, flt.id, "waitRecord", false);
  mc(fx, "issue", "update", flt.id, "--status", "in_review", "--assignee-id", fx.id("gate"), "--no-start");
  const before = lsRemote(fx, "app", "integration");
  setMeta(fx, flt.id, "gate.1", pass);
  let r = node(fx, "tick.mjs", ["advance", flt.id]);
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(issue(fx, flt.id).status, "done");
  assert.equal(lsRemote(fx, "app", "integration"), before, "nothing new on the branch: no merge");

  // second fast-lane page, failing first: the fixer lands on the branch, the pass brings the fix into integration
  node(fx, "tick.mjs", ["fast-lane", "release", PEND]);
  const t = tasks(fx, "[restore]").find((i) => woOf(fx, i)[0] === PEND && i.status !== "cancelled");
  setMeta(fx, t.id, "waitRecord", false);
  pushBranch(fx, { branch: "restore/fast-lane", files: { [`apps/portal/src/views/${PEND}.vue`]: "<template><i>fixed</i></template>\n" } });
  setMeta(fx, t.id, "gate.1", { ...pass, pages: [{ wo: PEND, pass: true, stage: "browser" }] });
  r = node(fx, "tick.mjs", ["advance", t.id]);
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.notEqual(lsRemote(fx, "app", "integration"), before, "fix merged into integration");
  assert.match(showRemote(fx, "app", "integration", `apps/portal/src/views/${PEND}.vue`), /fixed/);
  assert.ok(meta(fx, t.id)["merge.1"], "merged like a page branch");
  assert.equal(ledgerWo(fx, PEND).state === "merged" || ledgerWo(fx, PEND).state === "done", true);
});

test("upgrade sync after the retirement: integration is merged into restore/fast-lane (no cherry-pick), so the branch carries no library change of its own", () => {
  const fx = retiredSetup();
  node(fx, "tick.mjs", ["fast-lane", "retire"]);
  pushBranch(fx, { branch: "integration", files: { "apps/portal/src/shared/Dict.vue": "<template><span>dict v2</span></template>\n" } }); // the upgrade's merge
  const up = mc(fx, "issue", "create", "--title", "[upgrade] dict", "--status", "backlog").id;
  const script = `const { Pipeline } = await import(${JSON.stringify(path.join(REPO, "tools/lib/pipeline.mjs"))}); const pl = new Pipeline({ argv: [], appDir: process.env.HMRSFW_APP_DIR }); console.log(JSON.stringify(pl.syncFastLane(${JSON.stringify(up)}, "integration")));`;
  const r = spawnSync(process.execPath, ["--input-type=module", "-e", script], { cwd: fx.tool, env: fx.env, encoding: "utf8" });
  const st = JSON.parse(r.stdout.trim().split("\n").pop() || "{}");
  assert.equal(st.state, "ok", r.stderr);
  assert.match(showRemote(fx, "app", "restore/fast-lane", "apps/portal/src/shared/Dict.vue"), /dict v2/);
  assert.equal(git(fx.root, "--git-dir", fx.appOrigin, "diff", "--name-only", "integration...restore/fast-lane"), "", "nothing on the branch that integration doesn't have");
});
