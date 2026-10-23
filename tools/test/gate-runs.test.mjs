// node --test tools/test/gate-runs.test.mjs
// Resumable, shared integration runs (HM-1270, tools/gate/runs.mjs): which run a gate round works in, page claims, page
// verdicts kept per baseline / script / known diffs, and the clean-up of old runs.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir, hostname } from "node:os";
import path from "node:path";
import { claimHolder, createRun, pageFp, pageResult, pickRun, pinFile, pinRun, readJson, release, runsDir, savePageResult, setKey, staleRuns, tryClaim, withLock } from "../gate/runs.mjs";

const tmp = () => mkdtempSync(path.join(tmpdir(), "gate-runs-"));
const H = 3600e3;
const base = { tools: "t1", rules: "r1", set: "s1" };

test("a gate round keeps its pinned run; another task adopts a run only if it started after the task was created or re-gated", () => {
  const state = tmp();
  try {
    const now = Date.parse("2026-10-23T12:00:00Z");
    const a = createRun({ state, ...base, commit: "c1", branch: "integration", now: now - 2 * H });
    pinRun(state, "taskA-a1-g1", a);
    // the pinned round goes on in its run
    assert.equal(pickRun({ state, ...base, pin: "taskA-a1-g1", notBefore: now, now })?.key, a.key);
    // a task created before the run started shares it; one created (or re-gated) after it does not
    assert.equal(pickRun({ state, ...base, pin: "taskB-a1-g1", notBefore: now - 3 * H, now })?.key, a.key);
    assert.equal(pickRun({ state, ...base, pin: "taskB-a1-g1", notBefore: now - 1 * H, now }), null);
    // other tools, rules or page set: never shared, and a pin to such a run is dropped
    for (const k of ["tools", "rules", "set"]) assert.equal(pickRun({ state, ...base, [k]: "other", pin: "taskA-a1-g1", now }), null);
    // older than SHARE_HOURS: not adopted
    assert.equal(pickRun({ state, ...base, notBefore: 0, now: now + 10 * H }), null);
    // the newest of several
    const b = createRun({ state, ...base, commit: "c2", branch: "integration", now: now - 1 * H });
    assert.equal(pickRun({ state, ...base, notBefore: 0, now })?.key, b.key);
    // the same inputs name the same run
    assert.equal(createRun({ state, ...base, commit: "c2", branch: "integration", now }).key, b.key);
    assert.equal(pinRun(state, "taskA-a1-g1", a), 2);
    assert.equal(readJson(pinFile(state, "taskA-a1-g1")).slices, 2);
  } finally { rmSync(state, { recursive: true, force: true }); }
});

test("page claims: one holder at a time; a dead holder's or an old claim is taken over", async () => {
  const state = tmp();
  try {
    const f = path.join(state, "pages", "p1", ".claim");
    assert.equal(tryClaim(f), true);
    assert.equal(tryClaim(f), true); // our own
    assert.equal(claimHolder(f).pid, process.pid);
    release(f);
    assert.equal(claimHolder(f), null);
    // a live other process on this host holds it (pid 1 always exists)
    writeFileSync(f, JSON.stringify({ pid: 1, host: hostname(), at: Date.now() }));
    assert.equal(tryClaim(f), false);
    release(f); // not ours: left alone
    assert.ok(claimHolder(f));
    // a dead process
    writeFileSync(f, JSON.stringify({ pid: 2 ** 22 + 12345, host: hostname(), at: Date.now() }));
    assert.equal(tryClaim(f), true);
    release(f);
    // another host: alive until it is old
    writeFileSync(f, JSON.stringify({ pid: 1, host: "elsewhere", at: Date.now() }));
    assert.equal(tryClaim(f), false);
    writeFileSync(f, JSON.stringify({ pid: 1, host: "elsewhere", at: Date.now() - 31 * 60000 }));
    assert.equal(tryClaim(f), true);
    release(f);
    // withLock: runs fn, or gives up at the deadline
    const lock = path.join(state, ".l");
    assert.deepEqual(await withLock(lock, () => 7), { value: 7 });
    writeFileSync(lock, JSON.stringify({ pid: 1, host: hostname(), at: Date.now() }));
    assert.equal(await withLock(lock, () => 7, { deadline: Date.now() + 50, pollMs: 20 }), null);
  } finally { rmSync(state, { recursive: true, force: true }); }
});

test("a page verdict is reused only for the same baseline, script and known diffs", () => {
  const state = tmp();
  try {
    const run = path.join(state, "run");
    const known = { list: [], unusable: [] };
    const fp = pageFp({ baselineSha: "b1", script: "s1", known });
    savePageResult(run, "p1", fp, { wo: "p1", pass: true, stage: null, failed: [] }, { staticMs: 5 });
    assert.equal(pageResult(run, "p1", fp).page.pass, true);
    assert.equal(pageResult(run, "p1", fp).staticMs, 5);
    assert.equal(pageResult(run, "p1", pageFp({ baselineSha: "b2", script: "s1", known })), null);
    assert.equal(pageResult(run, "p1", pageFp({ baselineSha: "b1", script: null, known })), null);
    assert.equal(pageResult(run, "p1", pageFp({ baselineSha: "b1", script: "s1", known: { list: [{ check: "x" }], unusable: [] } })), null);
    assert.equal(pageResult(run, "p2", fp), null);
    // the page set includes what the build depends on
    const w = { id: "p1", app: "portal", route: "/a", recordPath: "/a", target: "x.vue" };
    assert.equal(setKey([w]), setKey([{ ...w }]));
    assert.notEqual(setKey([w]), setKey([{ ...w, route: "/b" }]));
    assert.notEqual(setKey([w]), setKey([w, { ...w, id: "p2" }]));
  } finally { rmSync(state, { recursive: true, force: true }); }
});

test("old runs go unless a page is being judged in them", () => {
  const state = tmp();
  try {
    const now = Date.now();
    const old = createRun({ state, ...base, commit: "c1", branch: "integration", now: now - 30 * H });
    const busy = createRun({ state, ...base, commit: "c2", branch: "integration", now: now - 30 * H });
    const fresh = createRun({ state, ...base, commit: "c3", branch: "integration", now: now - 1 * H });
    tryClaim(path.join(runsDir(state), busy.key, "pages", "p1", ".claim"));
    const gone = staleRuns(state, { now }).map((d) => path.basename(d));
    assert.deepEqual(gone, [old.key]);
    assert.ok(!gone.includes(fresh.key));
  } finally { rmSync(state, { recursive: true, force: true }); }
});
