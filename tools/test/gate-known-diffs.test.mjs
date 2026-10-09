// node --test tools/test/gate-known-diffs.test.mjs
// One known-differences register: what the arbiter adds with tools/known-diff.mjs ($RESTORE_STATE/known-diffs/) is what
// the gate applies (HM-4 review: the gate used to read a second register in rules/known-diffs/).
import { test } from "node:test";
import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import { makeFixture, node } from "./fixture.mjs";
import { applyKnown, loadKnownDiffs, waiveKnown } from "../gate/rules.mjs";

const EVIDENCE = "legacy-dist/portal/assets/App.1783320636200.js:120";

test("entries added by known-diff.mjs are what the gate loads and applies", () => {
  const fx = makeFixture();
  try {
    const add = (wo, ...extra) => node(fx, "known-diff.mjs", ["add", wo, "--evidence", EVIDENCE, "--why", "原包自身的问题", ...extra], { MULTICA_AGENT_ID: fx.id("arbiter") });
    assert.equal(add("c01", "--diff", "load.overlay").ok, true);
    assert.equal(add("c01", "--diff", JSON.stringify({ where: "load.html", orig: "<i>a</i>", rest: "<i>b</i>" })).ok, true);
    assert.equal(add("c01", "--diff", JSON.stringify({ where: "load.requests", orig: "GET /xf-job/x" })).ok, true);
    assert.equal(add("c01").ok, true); // no --diff: evidence only
    assert.equal(node(fx, "known-diff.mjs", ["add", "c01", "--evidence", "legacy-dist/portal/assets/nope.js:1", "--why", "x", "--diff", "load.text"], { MULTICA_AGENT_ID: fx.id("arbiter") }).ok, true);
    assert.equal(add("c01", "--diff", "whatever").ok, true);
    assert.equal(add("c02", "--diff", "load.html").ok, true);

    const k = loadKnownDiffs("c01", { state: fx.state, site: "portal" });
    assert.deepEqual(k.list.map((x) => x.id), ["c01#1", "c01#2", "c01#3"]);
    assert.deepEqual(k.unusable.map((x) => x.id), ["c01#4", "c01#5", "c01#6"]);
    assert.match(k.unusable[0].why, /no diff/);
    assert.match(k.unusable[1].why, /evidence file .* not found/);
    assert.match(k.unusable[2].why, /<where>\.<check>/);

    // "<where>.<check>" waives exactly that failure item
    const used = new Set();
    const [kept, waived] = waiveKnown([{ check: "overlay", where: "load", hint: "h" }, { check: "html", where: "load", hint: "h" }], k.list, used);
    assert.deepEqual(kept.map((f) => `${f.where}.${f.check}`), ["load.html"]);
    assert.deepEqual(waived.map((f) => f.known), ["c01#1"]);
    // JSON fragments: the same placeholder on both sides; request lists drop the request
    assert.equal(applyKnown("load.html", "orig", "<p><i>a</i></p>", k.list, used), applyKnown("load.html", "rest", "<p><i>b</i></p>", k.list, used));
    assert.deepEqual(applyKnown("load.requests", "orig", ["GET /xf-job/x", "GET /xf-job/y"], k.list, used), ["GET /xf-job/y"]);
    assert.deepEqual([...used].sort(), ["c01#1", "c01#2", "c01#3"]);

    assert.deepEqual(loadKnownDiffs("c02", { state: fx.state, site: "portal" }).list.map((x) => x.waive), ["load.html"]);
    assert.deepEqual(loadKnownDiffs("c03", { state: fx.state, site: "portal" }), { list: [], unusable: [], file: `${fx.state}/known-diffs/c03.json` });
  } finally { rmSync(fx.root, { recursive: true, force: true }); }
});

test("only the arbiter's tool writes the register (the gate has no second one)", () => {
  const fx = makeFixture();
  try {
    const r = node(fx, "known-diff.mjs", ["add", "c01", "--evidence", EVIDENCE, "--why", "x", "--diff", "load.text"], { MULTICA_AGENT_ID: fx.id("gate") });
    assert.equal(r.ok, false);
    assert.equal(loadKnownDiffs("c01", { state: fx.state, site: "portal" }).list.length, 0);
  } finally { rmSync(fx.root, { recursive: true, force: true }); }
});
