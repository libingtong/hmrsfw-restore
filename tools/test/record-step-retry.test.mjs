// node --test tools/test/record-step-retry.test.mjs
// record-page.mjs / record-baseline-placeholder.mjs repeat a failed interaction step (interact.mjs runStepRetry) only if
// the action was not sent — the rule tools/gate/replay.mjs got in HM-245. A click that timed out after Playwright sent
// it (the handler keeps the page busy) already happened; repeating it clicked a second time, and when the first click
// had opened a modal the second one waited behind the mask until it timed out and failed the recording (page.uc.maskunit
// "+添加屏蔽单位": the call log showed the button with ant-click-animating-without-extra-node="false", i.e. already clicked).
import { test } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { NOT_REPEATED, actionSent, runStepRetry } from "../interact.mjs";

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
    const r = await runStepRetry(p, { click: "Reset", wait: 100 });
    assert.equal(await p.evaluate(() => window.clicks), 1);
    assert.deepEqual(r, { note: NOT_REPEATED, retried: false });
  } finally { await close(); }
});

test("a slow click that opens a modal over its button does not fail the step", { timeout: 60000 }, async () => {
  // the maskunit shape: the handler mounts a full-screen mask, then keeps the main thread busy past the 5 s timeout
  const open = `window.clicks++; const m = document.createElement('div'); m.className = 'mask'; m.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.4)'; document.body.appendChild(m); ${busy(6500)}`;
  const { p, close } = await page(`<div class="contenttable"><button class="ant-btn ant-btn-primary" onclick="${open}">+添加</button></div>`);
  let before = 0;
  try {
    const r = await runStepRetry(p, { clickSel: ".contenttable button.ant-btn-primary", wait: 100 }, async () => { before++; });
    assert.equal(await p.evaluate(() => window.clicks), 1);
    assert.equal(before, 0, "no retry");
    assert.equal(r.note, NOT_REPEATED);
  } finally { await close(); }
});

test("a click that timed out before it was sent is tried once more", { timeout: 60000 }, async () => {
  // disabled for 5.5 s: the first click waits for "enabled" and times out at 5 s without sending; the retry finds it enabled
  const { p, close } = await page(`<button id="b" disabled onclick="window.clicks++">Search</button><script>setTimeout(() => { document.getElementById("b").disabled = false; }, 5500);</script>`);
  try {
    const r = await runStepRetry(p, { click: "Search", wait: 100 }, () => p.waitForTimeout(1000));
    assert.equal(await p.evaluate(() => window.clicks), 1);
    assert.deepEqual(r, { note: null, retried: true });
  } finally { await close(); }
});

test("a click that never becomes possible throws after one retry", { timeout: 60000 }, async () => {
  const { p, close } = await page(`<button disabled onclick="window.clicks++">Save</button>`);
  try {
    await assert.rejects(runStepRetry(p, { click: "Save", wait: 100 }), /Timeout 5000ms exceeded/);
    assert.equal(await p.evaluate(() => window.clicks), 0);
  } finally { await close(); }
});

test("an ordinary click: one click, no note, no retry", { timeout: 60000 }, async () => {
  const { p, close } = await page(`<button class="ant-btn ant-btn-primary" onclick="window.clicks++">OK</button>`);
  try {
    assert.deepEqual(await runStepRetry(p, { clickSel: "button.ant-btn-primary", wait: 100 }), { note: null, retried: false });
    assert.equal(await p.evaluate(() => window.clicks), 1);
  } finally { await close(); }
});

test("actionSent reads Playwright's call log", () => {
  const log = (lines) => new Error(["locator.click: Timeout 5000ms exceeded.", "Call log:", ...lines.map((l) => "  - " + l)].join("\n"));
  assert.equal(actionSent(log(["waiting for element to be visible, enabled and stable", "element is not stable"])), false);
  assert.equal(actionSent(log(["2 × waiting for element to be visible, enabled and stable", "<div class=\"ant-modal-wrap\">…</div> intercepts pointer events"])), false);
  assert.equal(actionSent(log(["element is visible, enabled and stable", "scrolling into view if needed", "performing click action"])), true);
  assert.equal(actionSent(log(["performing click action", "click action done", "waiting for scheduled navigations to finish"])), true);
  assert.equal(actionSent(new Error("no visible target for Reset")), false);
});
