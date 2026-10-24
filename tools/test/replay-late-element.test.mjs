// node --test tools/test/replay-late-element.test.mjs
// HM-1371: tools/gate/replay.mjs has its own copy of the click/clickSel target search (used by both baseline.mjs and
// gate.mjs, via runPage). Same bug as tools/interact.mjs (see interact-late-element.test.mjs): a single instant
// isVisible() check missed an element that mounts a moment after the step starts, so an "optional" step reported it
// absent and a "root": true step left runPage with no root to capture — baseline.mjs then rejected the run with
// "original page root ... not found" (HM-1362).
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright";
import { step, runPage } from "../gate/replay.mjs";
import { scopeRootSel } from "../gate/common.mjs";
import { serveStatic } from "../gate/serve.mjs";

const page = async (body) => {
  const browser = await chromium.launch();
  const p = await browser.newPage();
  await p.setContent(`<html><body>${body}<script>window.clicks = 0;</script></body></html>`);
  return { p, close: () => browser.close() };
};
const lateInsert = (html, delayMs) => `<script>setTimeout(() => { document.body.insertAdjacentHTML("beforeend", ${JSON.stringify(html)}); }, ${delayMs});</script>`;

test("a clickSel target that mounts 1.5s late is waited for and clicked, not skipped as absent", { timeout: 20000 }, async () => {
  const { p, close } = await page(lateInsert('<img class="defaultImg" style="width:20px;height:20px" onclick="window.clicks++">', 1500));
  try {
    const note = await step(p, { clickSel: "img.defaultImg", optional: true, wait: 100 });
    assert.equal(note, null);
    assert.equal(await p.evaluate(() => window.clicks), 1);
  } finally { await close(); }
});

test("an optional target that never appears is still reported absent, after waiting out the budget", { timeout: 20000 }, async () => {
  const { p, close } = await page("");
  try {
    const t0 = Date.now();
    const note = await step(p, { clickSel: "img.defaultImg", optional: true, wait: 100 });
    assert.equal(note, "absent");
    assert.ok(Date.now() - t0 >= 4000, "waited out the visibility budget before giving up");
  } finally { await close(); }
});

test("a root step throws when its target never appears, even when marked optional", { timeout: 20000 }, async () => {
  const { p, close } = await page("");
  try {
    await assert.rejects(step(p, { clickSel: "img.defaultImg", optional: true, root: true, wait: 100 }), /no visible target/);
  } finally { await close(); }
});

// End-to-end through runPage, the function baseline.mjs and gate.mjs both call: a floating-layer entry point (the
// portal's img.defaultImg, HM-1364) that only mounts ~1.5s after load, opened by a "root": true + "optional": true
// step — the shape of the HM-1364/HM-1362 report. Before the fix this produced an empty load root (the overlay never
// opened); after it, the root is the open overlay.
const OVERLAY_PAGE = `<!doctype html><html><head><meta charset="utf-8"></head><body><main><div class="list" data-v-p></div></main><script>
setTimeout(() => {
  const img = document.createElement("img");
  img.className = "defaultImg"; img.setAttribute("data-v-p", ""); img.style.cssText = "width:20px;height:20px";
  img.onclick = () => {
    const o = document.createElement("div");
    o.className = "overlay"; o.setAttribute("data-v-c", ""); o.setAttribute("data-v-p", "");
    o.textContent = "浮层已打开";
    document.querySelector(".list").appendChild(o);
  };
  document.querySelector(".list").appendChild(img);
}, 1500);
</script></body></html>`;

let browser, tmp, n = 0;
const har = { byKey: new Map(), recordedAt: Date.parse("2026-10-01T00:00:00Z") };
async function run(steps) {
  const root = path.join(tmp, String(n++));
  mkdirSync(root, { recursive: true });
  writeFileSync(path.join(root, "index.html"), OVERLAY_PAGE);
  const srv = await serveStatic(root);
  try { return await runPage(browser, { origin: srv.origin, url: "/", storage: { localStorage: {} }, har, sel: scopeRootSel("data-v-c"), steps, shotDir: root, tag: "shot", componentScope: "data-v-c" }); } finally { await srv.close(); }
}

test.before(async () => { browser = await chromium.launch(); tmp = mkdtempSync(path.join(os.tmpdir(), "replay-late-element-")); });
test.after(async () => { await browser?.close(); rmSync(tmp, { recursive: true, force: true }); });

test("runPage: a root step's target that mounts late opens the overlay instead of being skipped as absent", { timeout: 90000 }, async () => {
  const r = await run([{ clickSel: "img.defaultImg", optional: true, root: true, wait: 300 }]);
  assert.equal(r.load.candidates.length, 1);
  assert.equal(r.load.candidates[0].empty, undefined, "the overlay root was captured, not an empty load root");
  assert.match(r.load.candidates[0].text, /浮层已打开/);
});
