// 3 concurrent `tick.mjs tick` × 20 rounds against the fake CLI: no task created twice, no task assigned twice.
// Two variants: the normal global tick lock, and HMRSFW_TICK_NO_GLOBAL_LOCK=1 so only the work-order and ledger locks
// stand between the three processes. Between rounds some tasks are closed at random (as if delivered) to free slots.
// Run: node --test tools/test/concurrency.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { writeFileSync, readFileSync } from "node:fs";
import path from "node:path";
import { makeFixture, REPO, fakeState } from "./fixture.mjs";

const ORDERS = Array.from({ length: 18 }, (_, i) => ({ id: `C${String(i + 1).padStart(2, "0")}`, type: "page", kb: 6 + i * 2, app: "portal", target: `apps/portal/src/views/C${i + 1}/index.vue` }));

const tickOnce = (fx, extraEnv) => new Promise((resolve) => {
  const p = spawn(process.execPath, [path.join(REPO, "tools/tick.mjs"), "tick"], { cwd: fx.tool, env: { ...fx.env, ...extraEnv } });
  let out = "";
  p.stdout.on("data", (d) => (out += d));
  p.on("close", (code) => { try { resolve({ code, ...JSON.parse(out.trim().split("\n").pop()) }); } catch { resolve({ code, raw: out }); } });
});

function closeSome(fx, rnd) {
  // emulate agents finishing: close ~1/3 of open tasks (fake state is only written between rounds, no tick running)
  const s = JSON.parse(readFileSync(fx.fake, "utf8"));
  for (const i of Object.values(s.issues)) if (["todo", "in_progress"].includes(i.status) && rnd() < 0.33) i.status = "done";
  writeFileSync(fx.fake, JSON.stringify(s));
}

function check(fx) {
  const s = fakeState(fx);
  const issues = Object.values(s.issues);
  const titles = issues.map((i) => i.title);
  const dupTitles = titles.filter((t, k) => titles.indexOf(t) !== k);
  // per work order: restore tasks of attempt 1 are 1 (single) or 2 (dual, different families)
  const perWo = {};
  for (const i of issues) { const m = i.metadata; if (m.kind !== "restore") continue; const wos = typeof m.workOrders === "string" ? JSON.parse(m.workOrders) : m.workOrders; for (const w of wos) (perWo[w] ??= []).push(m.family); }
  const badWo = Object.entries(perWo).filter(([, fams]) => fams.length > 2 || (fams.length === 2 && fams[0] === fams[1]));
  const records = {};
  for (const i of issues) if (i.title.startsWith("[record]")) records[i.title] = (records[i.title] || 0) + 1;
  // assignments that start a run: at most one per issue (nothing advances in this test)
  const starts = {};
  for (const e of s.log) if (e.op === "run.start") starts[e.issue] = (starts[e.issue] || 0) + 1;
  const doubleStarts = Object.entries(starts).filter(([, n]) => n > 1);
  return { issues: issues.length, dupTitles, badWo, doubleStarts, records: Object.values(records).filter((n) => n > 1).length, perWo };
}

for (const variant of [{ name: "global tick lock", env: {} }, { name: "work-order locks only", env: { HMRSFW_TICK_NO_GLOBAL_LOCK: "1" } }]) {
  test(`3 concurrent ticks × 20 rounds (${variant.name}): no duplicate creation or assignment`, async () => {
    const fx = makeFixture({ orders: ORDERS, config: { cheapTier: { enabled: true, coldStartRuns: 10 }, maxNewPerTick: 6 } });
    let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    let locked = 0, errors = [];
    for (let round = 0; round < 20; round++) {
      const res = await Promise.all([tickOnce(fx, variant.env), tickOnce(fx, variant.env), tickOnce(fx, variant.env)]);
      for (const r of res) { if (r.locked) locked++; else if (r.ok !== true) errors.push(r); }
      closeSome(fx, rnd);
    }
    const c = check(fx);
    console.log(JSON.stringify({ variant: variant.name, issues: c.issues, lockedRuns: locked, errors: errors.length, workOrdersDispatched: Object.keys(c.perWo).length }));
    assert.deepEqual(errors.map((e) => e.summary || e.raw), [], "no tick failed");
    assert.deepEqual(c.dupTitles, [], "no task created twice");
    assert.deepEqual(c.badWo, [], "at most one task per work order (two for a dual dispatch)");
    assert.deepEqual(c.doubleStarts, [], "no task assigned twice");
    assert.equal(c.records, 0, "no duplicate record task");
    assert.ok(Object.keys(c.perWo).length >= 12, "work kept flowing");
  });
}
