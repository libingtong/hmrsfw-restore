// Two machines: cross-machine claims (git compare-and-swap on the `claims` branch), per-machine ticks, advance on the
// owner only, pause / reclaim across machines, machine resolution and asset checks, and C's work-order format.
// Everything runs against local bare repos and the fake Multica CLI.
// Run: node --test tools/test/machines.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { cpSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { makeFixture, node, issuesOf, fakeState, mc, setMeta, meta, pushBranch, writeReceipt, showRemote, git, REPO } from "./fixture.mjs";
import { Claims } from "../lib/claims.mjs";
import { resolveMachine, canRun } from "../lib/machine.mjs";
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
    const [a, b] = await Promise.all([worker(clones[0], "mac-mini", keys), worker(clones[1], "office-server", [...keys].reverse())]);
    assert.ok(!a.error && !b.error, JSON.stringify({ a, b }));
    retries += a.retries + b.retries;
    const wonA = new Set(a.won), wonB = new Set(b.won);
    for (const k of keys) {
      assert.ok(wonA.has(k) !== wonB.has(k), `${k} won by exactly one machine (a=${wonA.has(k)}, b=${wonB.has(k)})`);
      if (wonA.has(k)) assert.equal(b.lost[k], "mac-mini"); else assert.equal(a.lost[k], "office-server");
    }
    const on = claimsOn(fx);
    for (const k of keys) assert.equal(on[k], wonA.has(k) ? "mac-mini" : "office-server", `branch agrees on ${k}`);
  }
  console.log(JSON.stringify({ rounds: 8, keysPerRound: 12, totalRetries: retries }));
});

test("claims: first come first served — the loser's push is rejected, it backs off, re-fetches and keeps only free keys", () => {
  const { clones } = bareWithClones(2);
  const A = new Claims(clones[0], { backoffMs: 5 });
  let raced = false;
  const B = new Claims(clones[1], { backoffMs: 5, beforePush: () => { if (!raced) { raced = true; assert.deepEqual(A.claim(["k2", "k3"], "mac-mini").won, ["k2", "k3"]); } } });
  const r = B.claim(["k1", "k2"], "office-server");
  assert.equal(r.retries, 1, "one rejected push, one retry");
  assert.equal(B.stats.rejected, 1);
  assert.deepEqual(r.won, ["k1"]);
  assert.deepEqual(r.lost, { k2: "mac-mini" });
  // a later claim of an owned key is a no-op for the owner and a loss for the other
  assert.deepEqual(A.claim(["k1", "k3"], "mac-mini"), { won: ["k3"], lost: { k1: "office-server" }, retries: 0 });
  // leader lease: one holder until it expires
  assert.equal(A.lease("mac-mini", 60_000).leader, true);
  assert.equal(B.lease("office-server", 60_000).leader, false);
  const later = new Claims(clones[1], { now: () => Date.now() + 120_000 });
  assert.equal(later.lease("office-server", 60_000).leader, true, "expired lease is taken over");
  // "*" from two hosts is two claimants, not one
  assert.deepEqual(new Claims(clones[0], { by: "host-a:1" }).claim(["s1"], "*").won, ["s1"]);
  const other = new Claims(clones[1], { by: "host-b:2" }).claim(["s1"], "*");
  assert.deepEqual(other.won, []);
  assert.equal(other.lost.s1, "*@host-a");
});

test("two ticks with different --machine, concurrently, same queue: one claimant per work order, local restorers only", async () => {
  const orders = Array.from({ length: 24 }, (_, i) => page(`M${String(i + 1).padStart(2, "0")}`, 6 + i * 2));
  const fx = makeFixture({ orders, config: { maxNewPerTick: 6, claims: { publishEveryMin: 0 } } });
  const mac = addMachine(fx, "mac"), office = addMachine(fx, "office");
  let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const errors = [];
  for (let round = 0; round < 6; round++) {
    const res = await Promise.all([tickAsync(mac, "mac-mini"), tickAsync(office, "office-server")]);
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
  assert.ok(byMachine["mac-mini"] > 0 && byMachine["office-server"] > 0, `both machines pulled work: ${JSON.stringify(byMachine)}`);
  const leader = JSON.parse(showRemote(fx, "tool", "claims", "leader.json"));
  const recordMakers = new Set(issues.filter((i) => i.title.startsWith("[record]")).map((i) => decode(i.metadata.createdOn)));
  assert.deepEqual([...recordMakers], [leader.machine], "record tasks only from the leader");
  assert.ok(showRemote(fx, "tool", "claims", "stats/mac-mini.json") && showRemote(fx, "tool", "claims", "stats/office-server.json"), "both machines published stats");
  console.log(JSON.stringify({ workOrders: Object.keys(perWo).length, byMachine, leader: leader.machine, issues: issues.length }));
});

test("advance on a machine that doesn't own the work order only requests it; the owner's tick advances", () => {
  const fx = makeFixture({ orders: [page("P1", 10)], config: { audit: { coldRate: 0, normalRate: 0 } } });
  const office = addMachine(fx, "office");
  mkdirSync(path.join(office.state, "baseline", "P1"), { recursive: true });
  let r = node(office, "tick.mjs", ["tick", "--machine", "office-server"]);
  assert.equal(r.ok, true, JSON.stringify(r));
  const [t] = issuesOf(fx).filter((i) => i.title.startsWith("[restore]"));
  assert.equal(t.assignee_id, fx.id("sonnet-office"), "office pulled it for its own restorer");
  const m = meta(fx, t.id);
  assert.equal(m.claimedBy, "office-server");
  pushBranch(fx, { branch: m.branch, files: { "apps/portal/src/views/P1/index.vue": vue("p1") } });
  writeReceipt(office, "P1", { branch: m.branch });
  assert.equal(node(office, "handoff.mjs", [t.id, "--no-commit"]).ok, true);
  setMeta(fx, t.id, "gate.1", { pass: true, stage: "browser", failed: [] });
  r = node(fx, "tick.mjs", ["advance", t.id, "--machine", "mac-mini"]);
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(r.deferred, true, "mac does not advance office's task");
  assert.equal(meta(fx, t.id).advanceRequested, "1.g1");
  assert.equal(showRemote(fx, "app", "integration", "apps/portal/src/views/P1/index.vue"), null, "nothing merged by mac");
  r = node(office, "tick.mjs", ["tick", "--machine", "office-server"]);
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(showRemote(fx, "app", "integration", "apps/portal/src/views/P1/index.vue"), vue("p1"), "office merged it");
  assert.equal(fakeState(fx).issues[t.id].status, "done");
});

test("double dispatch is detected; pause and resume reach both machines; reclaim waits for a dead heartbeat", () => {
  const fx = makeFixture({ orders: [page("D1", 12), page("D2", 14), page("D3", 16)], config: { claims: { publishEveryMin: 0 } } });
  const office = addMachine(fx, "office");
  let r = node(fx, "tick.mjs", ["tick", "--machine", "mac-mini"]);
  assert.equal(r.ok, true, JSON.stringify(r));
  const on = claimsOn(fx);
  assert.ok(Object.values(on).every((m) => m === "mac-mini") && Object.keys(on).length >= 1, JSON.stringify(on));
  const w = Object.keys(on)[0];
  // a task for a mac-owned work order created behind the claims' back
  const dup = mc(fx, "issue", "create", "--title", `[restore] ${w} rogue`, "--status", "todo", "--project", "proj-1");
  for (const [k, v] of Object.entries({ kind: "restore", workOrders: JSON.stringify([w]), attempt: "1", claimedBy: "office-server" })) mc(fx, "issue", "metadata", "set", dup.id, "--key", k, "--type", k === "attempt" ? "number" : "string", "--value", v);
  r = node(fx, "tick.mjs", ["tick", "--machine", "mac-mini"]);
  assert.ok(r.anomalies.some((a) => /double dispatch/.test(a.what)), JSON.stringify(r.anomalies));
  mc(fx, "issue", "update", dup.id, "--status", "cancelled", "--no-start");

  // pause raised on mac (an open incident with paused=true) stops office's dispatch too
  const inc = mc(fx, "issue", "create", "--title", "[incident] stop", "--status", "todo", "--project", "proj-1");
  for (const [k, v, t] of [["kind", "incident", "string"], ["paused", "true", "bool"], ["reason", "test stop", "string"]]) mc(fx, "issue", "metadata", "set", inc.id, "--key", k, "--type", t, "--value", v);
  r = node(office, "tick.mjs", ["tick", "--machine", "office-server"]);
  assert.match(r.summary, /已暂停/);
  assert.equal(issuesOf(fx).filter((i) => i.title.startsWith("[restore]") && i.status !== "cancelled" && decode(i.metadata.claimedBy) === "office-server").length, 0, "office dispatched nothing while paused");
  // mac's own ledger flag points at the same incident; resuming on office lifts it on mac too
  const tsFile = path.join(fx.state, "ledger", "tick-state.json");
  writeFileSync(tsFile, JSON.stringify({ ...JSON.parse(readFileSync(tsFile, "utf8")), paused: true, pausedReason: "test stop", incidentTask: inc.id }));
  r = node(office, "tick.mjs", ["resume", "--machine", "office-server"]);
  assert.match(r.summary, /resumed/);
  assert.equal(meta(fx, inc.id).resumed, true);
  r = node(fx, "tick.mjs", ["tick", "--machine", "mac-mini"]);
  assert.doesNotMatch(r.summary, /已暂停/, "mac resumed by office's resume");

  // reclaim: refused while mac's heartbeat is fresh, done with --force, and office's ledger learns the tasks
  r = node(office, "tick.mjs", ["claims", "reclaim", "--from", "mac-mini", "--machine", "office-server"]);
  assert.equal(r.ok, false);
  assert.match(r.summary, /heartbeat/);
  r = node(office, "tick.mjs", ["claims", "reclaim", "--from", "mac-mini", "--force", "--machine", "office-server"]);
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.ok(Object.values(claimsOn(fx)).every((m) => m === "office-server"));
  const tasks = JSON.parse(readFileSync(path.join(office.state, "ledger", "tasks.json"), "utf8"));
  assert.ok((tasks.wos[w]?.active || []).length >= 1, "office ledger rebuilt from issues");
  r = node(office, "tick.mjs", ["tick", "--machine", "office-server"]);
  assert.equal(r.ok, true, JSON.stringify(r));
  const restores = issuesOf(fx).filter((i) => i.title.startsWith("[restore]") && i.status !== "cancelled" && decode(i.metadata.workOrders).includes(w));
  assert.equal(restores.length, 1, "reclaimed order is not dispatched again");

  // a manual command for an order office owns, run on mac, becomes a request office carries out
  r = node(fx, "tick.mjs", ["rerecord", w, "--machine", "mac-mini"]);
  assert.equal(r.deferred, true, JSON.stringify(r));
  r = node(office, "tick.mjs", ["tick", "--machine", "office-server"]);
  assert.ok((r.actions || []).some((a) => a.startsWith(`request rerecord ${w}`)), JSON.stringify(r.actions));
  const left = spawnSync("git", ["--git-dir", fx.toolOrigin, "ls-tree", "-r", "--name-only", "claims", "req/"], { encoding: "utf8" }).stdout.trim();
  assert.equal(left, "", "request removed once done");
});

test("machine resolution and asset checks come from roster data, not agent names", () => {
  const data = { agents: [{ id: "g1", role: "gate", machine: "mac-mini" }, { id: "g2", role: "gate", machine: "office-server" }] };
  const r0 = new Roster(data, DEFAULT_CONFIG);
  assert.equal(resolveMachine(r0, { argv: ["--machine", "office"], env: {} }).id, "office-server");
  assert.equal(resolveMachine(r0, { argv: [], env: { HMRSFW_MACHINE: "mac" } }).id, "mac-mini");
  assert.equal(resolveMachine(r0, { argv: [], env: {}, hostname: "whatever" }).id, null, "two machines, no mapping → unknown, never a silent '*'");
  assert.equal(resolveMachine(r0, { argv: ["--machine", "*"], env: {} }).id, "*", "unsharded only when asked for");
  assert.throws(() => resolveMachine(r0, { argv: ["--machine", "nope"], env: {} }));
  const r1 = new Roster({ ...data, machines: { "mac-mini": { hosts: ["DylandeMac-mini.local"], assets: ["login", "har", "baseline"] }, "office-server": { hosts: ["Dylan-Office-Server"], assets: [] } } }, DEFAULT_CONFIG);
  assert.equal(resolveMachine(r1, { argv: [], env: {}, hostname: "dylan-office-server" }).id, "office-server");
  assert.equal(canRun(r0, DEFAULT_CONFIG, "office-server", "gate"), true, "no machines section: no restriction (gate placement not hard-coded)");
  assert.equal(canRun(r1, DEFAULT_CONFIG, "office-server", "gate"), false);
  assert.equal(canRun(r1, DEFAULT_CONFIG, "office-server", "restore"), true);
  assert.equal(canRun(r1, DEFAULT_CONFIG, "office-server", "restore", [{ requires: { restore: ["gpu"] } }]), false, "work order requirement");
  const r2 = new Roster({ ...data, machines: { "mac-mini": { assets: ["login"] }, "office-server": { assets: ["har", "baseline"] } } }, DEFAULT_CONFIG);
  assert.equal(canRun(r2, DEFAULT_CONFIG, "office-server", "gate"), true, "gate moves with the assets");
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

