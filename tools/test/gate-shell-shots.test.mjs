// node --test tools/test/gate-shell-shots.test.mjs
// Shell layout in screenshots (HM-262): on the original side the layout's fixed header (a sibling of the page's roots under
// origSel, without the page's scopeId) is drawn over a root taller than the viewport once the element screenshot scrolls.
// shellLayoutCss hides only those siblings while a screenshot is taken; the page's own roots, fixed or not, stay.
import { test } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { shellLayoutCss, VIEWPORT } from "../gate/replay.mjs";

const P = "data-v-0cf261ff", H = "data-v-c9994972", F = "data-v-48a64537", SEL = "main > *";
// homeView-like layout: [fixed header, page root (tall), page's fixed side panel (own root), footer]
const doc = ({ header = true, footer = true, rootScope = P } = {}) => `<!doctype html><body style="margin:0"><main>
${header ? `<div ${H} class="headerBox" style="height:90px"><div class="headerCls" style="position:fixed;top:0;left:0;right:0;height:90px;z-index:1000;background:#0a7"></div></div>` : ""}
<div ${rootScope} class="bgBoxTop" style="height:1400px;background:linear-gradient(#fff,#ccd)"><div style="height:40px;background:#f60"></div></div>
<div data-v-ef35af0a ${P} class="recommend" style="position:fixed;right:20px;top:400px;width:300px;height:500px;background:#36f"></div>
${footer ? `<div ${F} class="footCls" style="height:200px;background:#333"></div>` : ""}</main></body>`;

async function withPage(fn) {
  const browser = await chromium.launch();
  try { const page = await browser.newPage({ viewport: VIEWPORT }); return await fn(page); } finally { await browser.close(); }
}
const vis = (page, q) => page.$eval(q, (n) => getComputedStyle(n).visibility);

test("hides the layout siblings (and their content), keeps the page's roots and its fixed panel", () => withPage(async (page) => {
  await page.setContent(doc());
  const css = await shellLayoutCss(page, SEL, [P]);
  assert.ok(css);
  await page.addStyleTag({ content: css });
  assert.equal(await vis(page, ".headerBox"), "hidden");
  assert.equal(await vis(page, ".headerCls"), "hidden");
  assert.equal(await vis(page, ".footCls"), "hidden");
  assert.equal(await vis(page, ".bgBoxTop"), "visible");
  assert.equal(await vis(page, ".recommend"), "visible");
}));

test("no page scopeId on any candidate, or none given: nothing is hidden (shot as before)", () => withPage(async (page) => {
  await page.setContent(doc({ rootScope: "data-v-11111111" }).replace(` ${P} class="recommend"`, ` class="recommend"`));
  assert.equal(await shellLayoutCss(page, SEL, [P]), "");
  assert.equal(await shellLayoutCss(page, SEL, []), "");
  assert.equal(await shellLayoutCss(page, SEL, undefined), "");
  assert.equal(await shellLayoutCss(page, SEL, ["x]{}*{display:none"]), ""); // only data-v-<8 hex> ids are used
}));

test("a tall root shot with the layout hidden equals the same root without any layout (restored side)", () => withPage(async (page) => {
  const shot = async (html, hideShell) => {
    await page.setContent(html);
    const tag = hideShell ? await page.addStyleTag({ content: await shellLayoutCss(page, SEL, [P]) }) : null;
    const buf = await (await page.$(".bgBoxTop")).screenshot();
    if (tag) await tag.evaluate((n) => n.remove());
    return buf;
  };
  // without layout the root starts at y = 0; give the restored-like page the same offset so both shots see the same scroll
  const restored = await shot(doc({ header: false, footer: true }).replace(`<main>`, `<main><div style="height:90px"></div>`), false);
  const before = await shot(doc(), false), after = await shot(doc(), true);
  assert.notDeepEqual(before, restored); // the fixed header is drawn over the scrolled root
  assert.deepEqual(after, restored);
}));
