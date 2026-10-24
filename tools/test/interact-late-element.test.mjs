// node --test tools/test/interact-late-element.test.mjs
// HM-1371: runStep found a click/clickSel target with a single instant isVisible() check. An element that mounts a
// moment after the step starts (an entry image whose src only resolves after the page's own request, HM-1364) was
// not there yet on that one check, and the step treated it as genuinely absent — "optional" skipped it silently, and
// a "root": true step left the page root never captured (HM-1362: baseline.mjs replay of the re-recorded HAR failed
// with "original page root ... not found" because the same miss happened again on replay).
import { test } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { runStep } from "../interact.mjs";

const page = async (body) => {
  const browser = await chromium.launch();
  const p = await browser.newPage();
  await p.setContent(`<html><body>${body}<script>window.clicks = 0;</script></body></html>`);
  return { p, close: () => browser.close() };
};
// Mirrors the reported shape: an element inserted into the DOM after a delay, not present at the step's first check.
const lateInsert = (html, delayMs) => `<script>setTimeout(() => { document.body.insertAdjacentHTML("beforeend", ${JSON.stringify(html)}); }, ${delayMs});</script>`;

test("a clickSel target that mounts 1.5s late is waited for and clicked, not skipped as absent", { timeout: 20000 }, async () => {
  const { p, close } = await page(lateInsert('<img class="defaultImg" style="width:20px;height:20px" onclick="window.clicks++">', 1500));
  try {
    const note = await runStep(p, { clickSel: "img.defaultImg", optional: true, wait: 100 });
    assert.equal(note, null);
    assert.equal(await p.evaluate(() => window.clicks), 1);
  } finally { await close(); }
});

test("a click (text match) target that mounts late is waited for, not skipped as absent", { timeout: 20000 }, async () => {
  const { p, close } = await page(lateInsert('<button onclick="window.clicks++">打开</button>', 1500));
  try {
    const note = await runStep(p, { click: "打开", optional: true, wait: 100 });
    assert.equal(note, null);
    assert.equal(await p.evaluate(() => window.clicks), 1);
  } finally { await close(); }
});

test("an optional target that never appears is still reported absent, after waiting out the budget", { timeout: 20000 }, async () => {
  const { p, close } = await page("");
  try {
    const t0 = Date.now();
    const note = await runStep(p, { clickSel: "img.defaultImg", optional: true, wait: 100 });
    assert.equal(note, "absent");
    assert.ok(Date.now() - t0 >= 4000, "waited out the visibility budget before giving up");
  } finally { await close(); }
});

test("a required target that never appears throws (not optional)", { timeout: 20000 }, async () => {
  const { p, close } = await page("");
  try {
    await assert.rejects(runStep(p, { clickSel: "img.defaultImg", wait: 100 }), /no visible target/);
  } finally { await close(); }
});

test("a root step target that mounts late is waited for and clicked (root is never silently skipped)", { timeout: 20000 }, async () => {
  const { p, close } = await page(lateInsert('<img class="defaultImg" style="width:20px;height:20px" onclick="window.clicks++">', 1500));
  try {
    const note = await runStep(p, { clickSel: "img.defaultImg", optional: true, root: true, wait: 100 });
    assert.equal(note, null);
    assert.equal(await p.evaluate(() => window.clicks), 1);
  } finally { await close(); }
});

test("a root step throws when its target never appears, even when marked optional", { timeout: 20000 }, async () => {
  const { p, close } = await page("");
  try {
    await assert.rejects(runStep(p, { clickSel: "img.defaultImg", optional: true, root: true, wait: 100 }), /no visible target/);
  } finally { await close(); }
});
