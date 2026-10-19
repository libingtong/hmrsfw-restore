// node --test tools/test/gate-offscope-fixed.test.mjs
// Off-scope elements in component shots (HM-253, HM-342): a recordVia page's root is a component inside its parent page;
// a fixed element outside it (the parent's side tab) lands on the component's box at an offset that depends
// on where the component sits in the page (the shell's header is there on the original side only) and on scrolling. markOffscope hides the
// elements outside the component while a screenshot is taken (HM-342: static ones too, see gate-offscope-edge.test.mjs);
// the component (its own fixed parts included), its ancestors and teleported content stay.
import { test } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { markOffscope, unmarkOffscope, OFFSCOPE_CSS, VIEWPORT } from "../gate/replay.mjs";

const C = "data-v-bb4a8a3f", PARENT = "data-v-4c1ba3f2", SEL = `[${C}]:not([${C}] *)`;
// [shell header placeholder (original side only)], parent page: [block above, wrapper (sticky nav inside), component root
// (own fixed button, below its box), block below, the parent's fixed side tab (homeRight .rightFixed: top 540px, right 0)], a fixed
// wrapper outside holding teleported component content
const doc = ({ header = true, tab = true } = {}) => `<!doctype html><body style="margin:0"><main>
${header ? `<div class="headerBox" style="height:90px;background:#123"></div>` : ""}
<div ${PARENT} class="above" style="height:200px;background:#eee"></div>
<div ${PARENT} class="bgColor" style="position:relative"><div ${PARENT} class="nav" style="position:sticky;top:0;height:30px;background:#f60"></div>
<div ${C} ${PARENT} class="bgcImg" style="height:526px;background:#26d"><div style="margin:20px 360px;height:330px;background:#2b7"></div><div ${C} class="own" style="position:fixed;right:300px;top:1000px;width:40px;height:40px;background:#fff"></div></div></div>
<div ${PARENT} class="below" style="height:100px;background:#ddd"></div>
${tab ? `<div data-v-85da16f2 class="kefu" style="position:fixed;top:540px;right:0;width:51px;height:148px;background:#0af"><span>点击展开</span></div>` : ""}</main>
<div class="teleport" style="position:fixed;left:0;bottom:0"><div ${C} class="tp">x</div></div></body>`;

async function withPage(fn) {
  const browser = await chromium.launch();
  try { const page = await browser.newPage({ viewport: VIEWPORT }); return await fn(page); } finally { await browser.close(); }
}
const vis = (page, q) => page.$eval(q, (n) => getComputedStyle(n).visibility);

test("hides the elements outside the component; keeps its own, its ancestors' and teleported content", () => withPage(async (page) => {
  await page.setContent(doc());
  const el = await page.$(SEL);
  // outermost ones only: .headerBox, .above, .nav (sticky sibling of the root), .below, .kefu (its span is covered by the CSS)
  assert.equal(await markOffscope(el, C), 5);
  const tag = await page.addStyleTag({ content: OFFSCOPE_CSS });
  for (const q of [".headerBox", ".above", ".nav", ".below", ".kefu", ".kefu span"]) assert.equal(await vis(page, q), "hidden", q);
  assert.equal(await page.$$eval("[data-gate-offscope] [data-gate-offscope]", (a) => a.length), 0);
  for (const q of [".bgcImg", ".own", ".bgColor", "main", ".teleport", ".tp"]) assert.equal(await vis(page, q), "visible", q);
  await tag.evaluate((n) => n.remove());
  await unmarkOffscope(page);
  assert.equal(await page.$$eval("[data-gate-offscope]", (a) => a.length), 0); // DOM left as it was
}));

test("no or invalid scope id: nothing is marked (other pages are shot as before)", () => withPage(async (page) => {
  await page.setContent(doc());
  const el = await page.$(SEL);
  assert.equal(await markOffscope(el, null), 0);
  assert.equal(await markOffscope(el, undefined), 0);
  assert.equal(await markOffscope(el, "x]{}*{display:none"), 0);
  assert.equal(await page.$$eval("[data-gate-offscope]", (a) => a.length), 0);
}));

test("component shot no longer depends on the parent's layout around it; without the rule it does", () => withPage(async (page) => {
  const shot = async (opts, hide) => {
    await page.setContent(doc(opts));
    const el = await page.$(SEL);
    const tag = hide && (await markOffscope(el, C)) ? await page.addStyleTag({ content: OFFSCOPE_CSS }) : null;
    const buf = await el.screenshot();
    if (tag) { await tag.evaluate((n) => n.remove()); await unmarkOffscope(page); }
    return buf;
  };
  // the same component with and without the shell's 90 px header above the parent page (original / restored side): it
  // fits in the viewport, nothing scrolls, and the fixed tab crosses its box 90 px apart
  const a0 = await shot({ header: true }, false), b0 = await shot({ header: false }, false);
  assert.notDeepEqual(a0, b0);
  const a1 = await shot({ header: true }, true), b1 = await shot({ header: false }, true);
  assert.deepEqual(a1, b1);
  assert.deepEqual(a1, await shot({ header: true, tab: false }, false)); // equals the component with no tab at all
}));
