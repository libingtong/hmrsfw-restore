// node --test tools/test/replay-step-retry.test.mjs
// When runPage repeats a failed interaction step (HM-245): only if the action was not sent. A click that timed out after
// Playwright sent it (the handler keeps the page busy) already happened; repeating it clicked twice and recorded a
// second request in the baseline.
import { test } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { actionSent, runStep } from "../gate/replay.mjs";

const page = async (body) => {
  const browser = await chromium.launch();
  const p = await browser.newPage();
  await p.setContent(`<html><body>${body}<script>window.clicks = 0;</script></body></html>`);
  return { p, close: () => browser.close() };
};
const busy = (ms) => `const t = Date.now(); while (Date.now() - t < ${ms}) {}`;

test("a click whose handler outlasts the timeout is not repeated", { timeout: 60000 }, async () => {
  const { p, close } = await page(`<button onclick="window.clicks++; ${busy(6500)}">Reset</button>`);
  try {
    const r = await runStep(p, { click: "Reset", wait: 100 });
    assert.equal(await p.evaluate(() => window.clicks), 1);
    assert.equal(r.err, null);
    assert.match(r.note, /not repeated/);
  } finally { await close(); }
});

test("a click that timed out before it was sent is tried once more", { timeout: 60000 }, async () => {
  // disabled for 5.5 s: the first click waits for "enabled" and times out at 5 s without sending; the retry 1 s later
  // finds the button enabled
  const { p, close } = await page(`<button id="b" disabled onclick="window.clicks++">Search</button><script>setTimeout(() => { document.getElementById("b").disabled = false; }, 5500);</script>`);
  try {
    const r = await runStep(p, { click: "Search", wait: 100 });
    assert.equal(await p.evaluate(() => window.clicks), 1);
    assert.deepEqual(r, { note: null, err: null });
  } finally { await close(); }
});

test("a click that never becomes possible is an error after one retry", { timeout: 60000 }, async () => {
  const { p, close } = await page(`<button disabled onclick="window.clicks++">Save</button>`);
  try {
    const r = await runStep(p, { click: "Save", wait: 100 });
    assert.equal(await p.evaluate(() => window.clicks), 0);
    assert.match(r.err, /Timeout 5000ms exceeded/);
  } finally { await close(); }
});

test("an ordinary click: one click, no note", { timeout: 60000 }, async () => {
  const { p, close } = await page(`<button onclick="window.clicks++">OK</button>`);
  try {
    assert.deepEqual(await runStep(p, { click: "OK", wait: 100 }), { note: null, err: null });
    assert.equal(await p.evaluate(() => window.clicks), 1);
  } finally { await close(); }
});

test("actionSent reads Playwright's call log", () => {
  const log = (lines) => new Error(["locator.click: Timeout 5000ms exceeded.", "Call log:", ...lines.map((l) => "  - " + l)].join("\n"));
  assert.equal(actionSent(log(["waiting for element to be visible, enabled and stable", "element is not enabled"])), false);
  assert.equal(actionSent(log(["element is visible, enabled and stable", "scrolling into view if needed", "performing click action"])), true);
  assert.equal(actionSent(log(["performing click action", "click action done", "waiting for scheduled navigations to finish"])), true);
  assert.equal(actionSent(new Error("no visible target for Reset")), false);
});
