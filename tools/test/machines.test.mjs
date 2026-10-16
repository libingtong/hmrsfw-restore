// Machines. Since 2026-10-15 the pipeline runs on the Mac mini alone (Office-Server retired): the single-machine tests
// pin that down (resolution without --machine, dispatch only to Mac agents, a retired machine ignored). The sharding
// code still supports more machines, so the multi-machine tests keep covering it with a hypothetical second machine
// "spare-host": cross-machine claims (git compare-and-swap on the `claims` branch), per-machine ticks, advance on the
// owner only, pause / reclaim across machines, machine resolution and asset checks, and C's work-order format.
// Everything runs against local bare repos and the fake Multica CLI.
// Run: node --test tools/test/machines.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { cpSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { makeFixture, node, issuesOf, fakeState, mc, setMeta, meta, pushBranch, writeReceipt, showRemote, git, REPO, ROSTER } from "./fixture.mjs";
import { Claims } from "../lib/claims.mjs";
import { resolveMachine, canRun, machineIds } from "../lib/machine.mjs";
import { Roster, DEFAULT_CONFIG } from "../lib/roster.mjs";
import { depList, isAccepted, reverseDeps } from "../lib/workorders.mjs";

const page = (id, kb, extra = {}) => ({ id, type: "page", kb, app: "portal", site: "portal", target: `apps/portal/src/views/${id}/index.vue`, subComponentDir: `apps/portal/src/views/${id}/index/`, deps: ["@/shared/Dict.vue"], ...extra });
const vue = (s) => `<template><div>${s}</div></template>\n`;
const decode = (v) => (typeof v === "string" && /^[[{]/.test(v) ? JSON.parse(v) : v);
const claimsOn = (fx) => {
  const r = spawnSync("git", ["--git-dir", fx.toolOrigin, "ls-tree", "-r", "--name-only", "claims"], { encoding: "utf8" });
  const out = {};
  for (const p of r.stdout.split("\n").filter((l) => l.startsWith("wo/"))) { const c = JSON.parse(showRemote(fx, "tool", "claims", p)); out[c.key] = c.machine; }
  return out;
};

// The live roster plus restorers on a second machine (`machine` value `host`), optionally all disabled (retired).
function withSecondMachine(host, { enabled = true } = {}) {
  const r = ROSTER();
  const A = (key, family, model, maxConcurrent) => ({ name: `${key}@${host}`, id: `a-${key}-${host}`, role: "restorer", family, model, machine: host, runtimeId: `rt-${family}-${host}`, maxConcurrent, ...(enabled ? {} : { enabled: false }) });
  r.agents.push(A("sonnet", "anthropic", "claude-sonnet-5-5", 4), A("deepseek", "deepseek", "deepseek-official/deepseek-flash", 3), A("glm", "zhipu", "zhipuai-coding-plan/glm-5.3-flash", 3));
  return r;
}

// A second machine: its own $RESTORE_STATE (own ledger and locks), its own clones of both repos.
function addMachine(fx, name) {
  const state = path.join(fx.root, `state-${name}`);
  cpSync(fx.state, state, { recursive: true });
  for (const d of ["ledger", "locks"]) { spawnSync("rm", ["-rf", path.join(state, d)]); mkdirSync(path.join(state, d), { recursive: true }); }
  const tool = path.join(fx.root, `tool-${name}`), app = path.join(fx.root, `app-${name}`);
  git(fx.root, "clone", "-q", fx.toolOrigin, tool);
  git(fx.root, "clone", "-q", fx.appOrigin, app);
  return { ...fx, state, tool, app, env: { ...fx.env, RESTORE_STATE: state, HMRSFW_TOOL_ROOT: tool, HMRSFW_APP_DIR: app } };
}

const tickAsync = (fx, machine) => new Promise((resolve) => {
  const p = spawn(process.execPath, [path.join(REPO, "tools/tick.mjs"), "tick", "--machine", machine], { cwd: fx.tool, env: fx.env });
  let out = "", err = "";
  p.stdout.on("data", (d) => (out += d));
  p.stderr.on("data", (d) => (err += d));
  p.on("close", (code) => { try { resolve({ code, machine, ...JSON.parse(out.trim().split("\n").pop()) }); } catch { resolve({ code, machine, raw: out, err }); } });
});

const worker = (clone, machine, keys) => new Promise((resolve) => {
  const p = spawn(process.execPath, [path.join(REPO, "tools/test/claim-worker.mjs"), clone, machine, ...keys]);
  let out = "";
  p.stdout.on("data", (d) => (out += d));
  p.on("close", () => resolve(JSON.parse(out.trim())));
});

function bareWithClones(n) {
  const fx = makeFixture({ orders: [] });
  const clones = Array.from({ length: n }, (_, i) => { const d = path.join(fx.root, `c${i}`); git(fx.root, "clone", "-q", fx.toolOrigin, d); return d; });
  return { fx, clones };
}

test("claims: two machines race for the same keys from their own clones — every key has exactly one owner", async () => {
  const { fx, clones } = bareWithClones(2);
  let retries = 0;
  for (let round = 0; round < 8; round++) {
    const keys = Array.from({ length: 12 }, (_, i) => `R${round}-K${i}`);
    const [a, b] = await Promise.all([worker(clones[0], "mac-mini", keys), worker(clones[1], "spare-host", [...keys].reverse())]);
    assert.ok(!a.error && !b.error, JSON.stringify({ a, b }));
    retries += a.retries + b.retries;
    const wonA = new Set(a.won), wonB = new Set(b.won);
    for (const k of keys) {
      assert.ok(wonA.has(k) !== wonB.has(k), `${k} won by exactly one machine (a=${wonA.has(k)}, b=${wonB.has(k)})`);
      if (wonA.has(k)) assert.equal(b.lost[k], "mac-mini"); else assert.equal(a.lost[k], "spare-host");
    }
    const on = claimsOn(fx);
    for (const k of keys) assert.equal(on[k], wonA.has(k) ? "mac-mini" : "spare-host", `branch agrees on ${k}`);
  }
  console.log(JSON.stringify({ rounds: 8, keysPerRound: 12, totalRetries: retries }));
});

test("claims: first come first served — the loser's push is rejected, it backs off, re-fetches and keeps only free keys", () => {
  const { clones } = bareWithClones(2);
  const A = new Claims(clones[0], { backoffMs: 5 });
  let raced = false;
  const B = new Claims(clones[1], { backoffMs: 5, beforePush: () => { if (!raced) { raced = true; assert.deepEqual(A.claim(["k2", "k3"], "mac-mini").won, ["k2", "k3"]); } } });
  const r = B.claim(["k1", "k2"], "spare-host");
  assert.equal(r.retries, 1, "one rejected push, one retry");
  assert.equal(B.stats.rejected, 1);
  assert.deepEqual(r.won, ["k1"]);
  assert.deepEqual(r.lost, { k2: "mac-mini" });
  // a later claim of an owned key is a no-op for the owner and a loss for the other
  assert.deepEqual(A.claim(["k1", "k3"], "mac-mini"), { won: ["k3"], lost: { k1: "spare-host" }, retries: 0 });
  // leader lease: one holder until it expires
  assert.equal(A.lease("mac-mini", 60_000).leader, true);
  assert.equal(B.lease("spare-host", 60_000).leader, false);
  const later = new Claims(clones[1], { now: () => Date.now() + 120_000 });
  assert.equal(later.lease("spare-host", 60_000).leader, true, "expired lease is taken over");
  // "*" from two hosts is two claimants, not one
  assert.deepEqual(new Claims(clones[0], { by: "host-a:1" }).claim(["s1"], "*").won, ["s1"]);
  const other = new Claims(clones[1], { by: "host-b:2" }).claim(["s1"], "*");
  assert.deepEqual(other.won, []);
  assert.equal(other.lost.s1, "*@host-a");
});

test("two ticks with different --machine, concurrently, same queue: one claimant per work order, local restorers only", async () => {
  const orders = Array.from({ length: 24 }, (_, i) => page(`M${String(i + 1).padStart(2, "0")}`, 6 + i * 2));
  const fx = makeFixture({ orders, config: { maxNewPerTick: 6, claims: { publishEveryMin: 0 } }, roster: withSecondMachine("spare-host") });
  const mac = addMachine(fx, "mac"), spare = addMachine(fx, "spare");
  let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const errors = [];
  for (let round = 0; round < 6; round++) {
    const res = await Promise.all([tickAsync(mac, "mac-mini"), tickAsync(spare, "spare-host")]);
    for (const r of res) if (r.ok !== true) errors.push(r);
    const s = JSON.parse(readFileSync(fx.fake, "utf8"));
    for (const i of Object.values(s.issues)) if (["todo", "in_progress"].includes(i.status) && rnd() < 0.4) i.status = "done";
    writeFileSync(fx.fake, JSON.stringify(s));
  }
  assert.deepEqual(errors.map((e) => e.summary || e.raw || e.err), [], "no tick failed");
  const on = claimsOn(fx);
  const st = fakeState(fx);
  const issues = Object.values(st.issues);
  const machineOf = Object.fromEntries(fx.roster.agents.map((a) => [a.id, a.machine]));
  const perWo = {};
  for (const i of issues) {
    const m = Object.fromEntries(Object.entries(i.metadata).map(([k, v]) => [k, decode(v)]));
    if (m.kind !== "restore") continue;
    for (const w of m.workOrders) (perWo[w] ??= []).push({ id: i.id, by: m.claimedBy, agent: i.assignee_id });
  }
  for (const [w, list] of Object.entries(perWo)) {
    assert.equal(new Set(list.map((x) => x.by)).size, 1, `${w}: one claimant (${list.map((x) => x.by)})`);
    assert.equal(list[0].by, on[w], `${w}: tasks created by the claim owner`);
    for (const x of list) assert.equal(machineOf[x.agent], x.by, `${w}: restorer is local to ${x.by}`);
  }
  const titles = issues.map((i) => i.title);
  assert.deepEqual(titles.filter((t, k) => titles.indexOf(t) !== k), [], "no task created twice");
  const starts = {};
  for (const e of st.log) if (e.op === "run.start") starts[e.issue] = (starts[e.issue] || 0) + 1;
  assert.deepEqual(Object.entries(starts).filter(([, n]) => n > 1), [], "no task assigned twice");
  const byMachine = {};
  for (const list of Object.values(perWo)) byMachine[list[0].by] = (byMachine[list[0].by] || 0) + 1;
  assert.ok(byMachine["mac-mini"] > 0 && byMachine["spare-host"] > 0, `both machines pulled work: ${JSON.stringify(byMachine)}`);
  const leader = JSON.parse(showRemote(fx, "tool", "claims", "leader.json"));
  const recordMakers = new Set(issues.filter((i) => i.title.startsWith("[record]")).map((i) => decode(i.metadata.createdOn)));
  assert.deepEqual([...recordMakers], [leader.machine], "record tasks only from the leader");
  assert.ok(showRemote(fx, "tool", "claims", "stats/mac-mini.json") && showRemote(fx, "tool", "claims", "stats/spare-host.json"), "both machines published stats");
  console.log(JSON.stringify({ workOrders: Object.keys(perWo).length, byMachine, leader: leader.machine, issues: issues.length }));
});

test("advance on a machine that doesn't own the work order only requests it; the owner's tick advances", () => {
  const fx = makeFixture({ orders: [page("P1", 10)], config: { audit: { coldRate: 0, normalRate: 0 } }, roster: withSecondMachine("spare-host") });
  const spare = addMachine(fx, "spare");
  mkdirSync(path.join(spare.state, "baseline", "P1"), { recursive: true });
  let r = node(spare, "tick.mjs", ["tick", "--machine", "spare-host"]);
  assert.equal(r.ok, true, JSON.stringify(r));
  const [t] = issuesOf(fx).filter((i) => i.title.startsWith("[restore]"));
  assert.equal(t.assignee_id, fx.id("sonnet-spare-host"), "spare pulled it for its own restorer");
  const m = meta(fx, t.id);
  assert.equal(m.claimedBy, "spare-host");
  pushBranch(fx, { branch: m.branch, files: { "apps/portal/src/views/P1/index.vue": vue("p1") } });
  writeReceipt(spare, "P1", { branch: m.branch });
  assert.equal(node(spare, "handoff.mjs", [t.id, "--no-commit"]).ok, true);
  setMeta(fx, t.id, "gate.1", { pass: true, stage: "browser", failed: [] });
  r = node(fx, "tick.mjs", ["advance", t.id, "--machine", "mac-mini"]);
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(r.deferred, true, "mac does not advance spare's task");
  assert.equal(meta(fx, t.id).advanceRequested, "1.g1");
  assert.equal(showRemote(fx, "app", "integration", "apps/portal/src/views/P1/index.vue"), null, "nothing merged by mac");
  r = node(spare, "tick.mjs", ["tick", "--machine", "spare-host"]);
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(showRemote(fx, "app", "integration", "apps/portal/src/views/P1/index.vue"), vue("p1"), "spare merged it");
  assert.equal(fakeState(fx).issues[t.id].status, "done");
});

test("double dispatch is detected; pause and resume reach both machines; reclaim waits for a dead heartbeat", () => {
  const fx = makeFixture({ orders: [page("D1", 12), page("D2", 14), page("D3", 16)], config: { claims: { publishEveryMin: 0 } }, roster: withSecondMachine("spare-host") });
  const spare = addMachine(fx, "spare");
  let r = node(fx, "tick.mjs", ["tick", "--machine", "mac-mini"]);
  assert.equal(r.ok, true, JSON.stringify(r));
  const on = claimsOn(fx);
  assert.ok(Object.values(on).every((m) => m === "mac-mini") && Object.keys(on).length >= 1, JSON.stringify(on));
  const w = Object.keys(on)[0];
  // a task for a mac-owned work order created behind the claims' back
  const dup = mc(fx, "issue", "create", "--title", `[restore] ${w} rogue`, "--status", "todo", "--project", "proj-1");
  for (const [k, v] of Object.entries({ kind: "restore", workOrders: JSON.stringify([w]), attempt: "1", claimedBy: "spare-host" })) mc(fx, "issue", "metadata", "set", dup.id, "--key", k, "--type", k === "attempt" ? "number" : "string", "--value", v);
  r = node(fx, "tick.mjs", ["tick", "--machine", "mac-mini"]);
  assert.ok(r.anomalies.some((a) => /double dispatch/.test(a.what)), JSON.stringify(r.anomalies));
  mc(fx, "issue", "update", dup.id, "--status", "cancelled", "--no-start");

  // pause raised on mac (an open incident with paused=true) stops spare's dispatch too
  const inc = mc(fx, "issue", "create", "--title", "[incident] stop", "--status", "todo", "--project", "proj-1");
  for (const [k, v, t] of [["kind", "incident", "string"], ["paused", "true", "bool"], ["reason", "test stop", "string"]]) mc(fx, "issue", "metadata", "set", inc.id, "--key", k, "--type", t, "--value", v);
  r = node(spare, "tick.mjs", ["tick", "--machine", "spare-host"]);
  assert.match(r.summary, /已暂停/);
  assert.equal(issuesOf(fx).filter((i) => i.title.startsWith("[restore]") && i.status !== "cancelled" && decode(i.metadata.claimedBy) === "spare-host").length, 0, "spare dispatched nothing while paused");
  // mac's own ledger flag points at the same incident; resuming on spare lifts it on mac too
  const tsFile = path.join(fx.state, "ledger", "tick-state.json");
  writeFileSync(tsFile, JSON.stringify({ ...JSON.parse(readFileSync(tsFile, "utf8")), paused: true, pausedReason: "test stop", incidentTask: inc.id }));
  r = node(spare, "tick.mjs", ["resume", "--machine", "spare-host"]);
  assert.match(r.summary, /resumed/);
  assert.equal(meta(fx, inc.id).resumed, true);
  r = node(fx, "tick.mjs", ["tick", "--machine", "mac-mini"]);
  assert.doesNotMatch(r.summary, /已暂停/, "mac resumed by spare's resume");

  // reclaim: refused while mac's heartbeat is fresh, done with --force, and spare's ledger learns the tasks
  r = node(spare, "tick.mjs", ["claims", "reclaim", "--from", "mac-mini", "--machine", "spare-host"]);
  assert.equal(r.ok, false);
  assert.match(r.summary, /heartbeat/);
  r = node(spare, "tick.mjs", ["claims", "reclaim", "--from", "mac-mini", "--force", "--machine", "spare-host"]);
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.ok(Object.values(claimsOn(fx)).every((m) => m === "spare-host"));
  const tasks = JSON.parse(readFileSync(path.join(spare.state, "ledger", "tasks.json"), "utf8"));
  assert.ok((tasks.wos[w]?.active || []).length >= 1, "spare ledger rebuilt from issues");
  r = node(spare, "tick.mjs", ["tick", "--machine", "spare-host"]);
  assert.equal(r.ok, true, JSON.stringify(r));
  const restores = issuesOf(fx).filter((i) => i.title.startsWith("[restore]") && i.status !== "cancelled" && decode(i.metadata.workOrders).includes(w));
  assert.equal(restores.length, 1, "reclaimed order is not dispatched again");

  // a manual command for an order spare owns, run on mac, becomes a request spare carries out
  r = node(fx, "tick.mjs", ["rerecord", w, "--machine", "mac-mini"]);
  assert.equal(r.deferred, true, JSON.stringify(r));
  r = node(spare, "tick.mjs", ["tick", "--machine", "spare-host"]);
  assert.ok((r.actions || []).some((a) => a.startsWith(`request rerecord ${w}`)), JSON.stringify(r.actions));
  const left = spawnSync("git", ["--git-dir", fx.toolOrigin, "ls-tree", "-r", "--name-only", "claims", "req/"], { encoding: "utf8" }).stdout.trim();
  assert.equal(left, "", "request removed once done");
});

test("single machine: a retired machine (only disabled agents left) is not a machine; no --machine needed", () => {
  const r = new Roster(withSecondMachine("retired-host", { enabled: false }), DEFAULT_CONFIG);
  assert.deepEqual(machineIds(r), ["mac-mini"]);
  assert.deepEqual(machineIds(r, { all: true }), ["mac-mini", "retired-host"], "its stats snapshot is still read");
  assert.deepEqual(resolveMachine(r, { argv: [], env: {}, hostname: "whatever" }), { id: "mac-mini", source: "single" });
  assert.equal(resolveMachine(r, { argv: ["--machine", "mac"], env: {} }).id, "mac-mini");
  assert.throws(() => resolveMachine(r, { argv: ["--machine", "retired"], env: {} }), /not one of the roster machines/);
});

test("single machine: tick --machine mac assigns restore (page and entry), record and rule-review tasks to Mac agents only", () => {
  const orders = [page("Q1", 8), page("Q2", 12), page("Q3", 20), page("Q4", 40), { id: "E1", type: "entry", kb: 50, app: "portal" }];
  const fx = makeFixture({ orders, config: { cheapTier: { enabled: true, coldStartRuns: 10 } }, roster: withSecondMachine("retired-host", { enabled: false }) });
  for (const id of ["Q1", "Q2", "Q4", "E1"]) mkdirSync(path.join(fx.state, "baseline", id), { recursive: true }); // Q3 → record task
  const macIds = new Set(fx.roster.agents.filter((a) => a.machine === "mac-mini").map((a) => a.id));
  let r = node(fx, "tick.mjs", ["tick", "--machine", "mac"]);
  assert.equal(r.ok, true, JSON.stringify(r));
  r = node(fx, "tick.mjs", ["tick"], { HMRSFW_MACHINE: "" });
  assert.equal(r.ok, true, `no --machine: the only live machine is used (${JSON.stringify(r)})`);
  git(fx.tool, "checkout", "-q", "-b", "rules/m1");
  writeFileSync(path.join(fx.tool, "rules.json"), JSON.stringify({ rules: ["base", "m1"] }));
  git(fx.tool, "commit", "-q", "-am", "rule m1"); git(fx.tool, "push", "-q", "origin", "rules/m1");
  r = node(fx, "tick.mjs", ["open-rule-review", "rules/m1", "--machine", "mac"]);
  assert.equal(r.ok, true, JSON.stringify(r));
  const issues = issuesOf(fx);
  const kinds = new Set(issues.map((i) => i.title.match(/^\[([a-z-]+)\]/)?.[1]));
  for (const k of ["restore", "record", "rule-review"]) assert.ok(kinds.has(k), `${k} task created (${[...kinds]})`);
  const assigned = issues.filter((i) => i.assignee_id);
  assert.ok(assigned.length >= 5);
  assert.deepEqual(assigned.filter((i) => !macIds.has(i.assignee_id)).map((i) => `${i.title} → ${i.assignee_id}`), [], "every assignee is a Mac agent");
  assert.ok(assigned.some((i) => i.assignee_id === fx.id("opus-mac")), "entry → the Mac Opus restorer-core");
  const restores = issues.filter((i) => i.title.startsWith("[restore]"));
  assert.ok(restores.every((i) => decode(i.metadata.claimedBy) === "mac-mini"), "claimed by mac-mini");
  assert.deepEqual(issues.filter((i) => i.title.startsWith("[rule-review]")).map((i) => i.assignee_id).sort(), [fx.id("review-deepseek"), fx.id("review-glm")], "two non-arbiter families, both on the Mac");
});

test("machine resolution and asset checks come from roster data, not agent names", () => {
  const data = { agents: [{ id: "g1", role: "gate", machine: "mac-mini" }, { id: "g2", role: "gate", machine: "spare-host" }] };
  const r0 = new Roster(data, DEFAULT_CONFIG);
  assert.equal(resolveMachine(r0, { argv: ["--machine", "spare"], env: {} }).id, "spare-host");
  assert.equal(resolveMachine(r0, { argv: [], env: { HMRSFW_MACHINE: "mac" } }).id, "mac-mini");
  assert.equal(resolveMachine(r0, { argv: [], env: {}, hostname: "whatever" }).id, null, "two machines, no mapping → unknown, never a silent '*'");
  assert.equal(resolveMachine(r0, { argv: ["--machine", "*"], env: {} }).id, "*", "unsharded only when asked for");
  assert.throws(() => resolveMachine(r0, { argv: ["--machine", "nope"], env: {} }));
  const r1 = new Roster({ ...data, machines: { "mac-mini": { hosts: ["DylandeMac-mini.local"], assets: ["login", "har", "baseline"] }, "spare-host": { hosts: ["spare-host.lan"], assets: [] } } }, DEFAULT_CONFIG);
  assert.equal(resolveMachine(r1, { argv: [], env: {}, hostname: "Spare-Host.lan" }).id, "spare-host");
  assert.equal(canRun(r0, DEFAULT_CONFIG, "spare-host", "gate"), true, "no machines section: no restriction (gate placement not hard-coded)");
  assert.equal(canRun(r1, DEFAULT_CONFIG, "spare-host", "gate"), false);
  assert.equal(canRun(r1, DEFAULT_CONFIG, "spare-host", "restore"), true);
  assert.equal(canRun(r1, DEFAULT_CONFIG, "spare-host", "restore", [{ requires: { restore: ["gpu"] } }]), false, "work order requirement");
  const r2 = new Roster({ ...data, machines: { "mac-mini": { assets: ["login"] }, "spare-host": { assets: ["har", "baseline"] } } }, DEFAULT_CONFIG);
  assert.equal(canRun(r2, DEFAULT_CONFIG, "spare-host", "gate"), true, "gate moves with the assets");
  assert.equal(canRun(r2, DEFAULT_CONFIG, "mac-mini", "gate"), false);
});

test("work orders in C's format: deps object, accepted object, status regression", () => {
  assert.deepEqual(depList({ entry: ["B"], shared: ["Dict.123.js"], api: ["index.api.1.js#P"], modules: [], views: [], orders: ["x"] }), ["B", "Dict.123.js", "index.api.1.js#P"]);
  assert.equal(isAccepted({ status: "regression", accepted: { route: "/a" } }), true);
  assert.equal(isAccepted({ status: "todo" }), false);
  const fx = makeFixture({ orders: [] });
  writeFileSync(path.join(fx.tool, "registry", "portal.json"), JSON.stringify({ shared: { "Dict.123.js": { path: "@/shared/Dict.vue" } }, entry: { B: { path: "@/legacy/b.js" } }, api: { P: { original: "index.api.1.js#P", path: "@/api/user.js" } } }));
  const idx = reverseDeps([{ id: "p", app: "portal", deps: { entry: ["B"], shared: ["Dict.123.js"], api: ["index.api.1.js#P"], orders: [] } }], fx.tool);
  assert.deepEqual([...idx.keys()].sort(), ["apps/portal/src/api/user.js", "apps/portal/src/legacy/b.js", "apps/portal/src/shared/Dict.vue"]);
});

