// node --test tools/test/gate-offscope-edge.test.mjs
// Neighbours in the edge rows of component shots (HM-342). An element screenshot is the box's enclosing whole-pixel
// rectangle, so a box with fractional edges leaves a partial pixel row at its edges, painted mostly by whatever lies
// next to the box. page.portal.talents.index.frendLinks ends its parent page with a transparent root 108.59 px high:
// on the original side the homeView footer (rgba(51,51,51,.9)) is right below it, on the restored side the App footer
// (#f1f3f4), so the last of the 110 rows differs (1200 px = 0.909%) though the component is the same. markOffscope
// hides the elements outside the component while the shot is taken, so both sides show the component on its ancestors'
// backgrounds only.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { chromium } from "playwright";
import { markOffscope, unmarkOffscope, OFFSCOPE_CSS, VIEWPORT } from "../gate/replay.mjs";

const { PNG } = createRequire(import.meta.url)("pngjs");
const C = "data-v-0b7f2f66", PARENT = "data-v-8e0faf38", SEL = `[${C}]:not([${C}] *)`;
// original: shell header + parent page + homeView footer (dark); restored: parent page + App footer (light), the
// component at another fractional offset; the component itself is the same on both
const doc = ({ header, above, footer }) => `<!doctype html><body style="margin:0;background:#fff"><div id="app"><main>
${header ? `<div class="headerBox" style="height:90px;background:#123"></div>` : ""}
<div ${PARENT} class="above" style="height:${above}px;background:#eee"></div>
<div ${PARENT} class="bgColor" style="background:#f3f3f3"><div ${PARENT} class="main" style="width:1200px;margin:0 auto">
<div ${C} ${PARENT} class="marB70 marT40" style="height:108.59375px"><div ${C} style="height:50px;border-bottom:2px solid #c00"></div><div ${C} style="margin-top:20px;height:20px;background:#09c"></div></div>
</div></div>
${footer === "dark" ? `<div class="footCls" style="height:300px;background:rgba(51,51,51,.9)"></div>` : footer === "light" ? `<footer><div class="fotBox" style="height:300px;background:#f1f3f4"></div></footer>` : ""}
</main></div></body>`;
const ORIG = { header: true, above: 470.5, footer: "dark" }, REST = { header: false, above: 709.625, footer: "light" };

async function withPage(fn) {
  const browser = await chromium.launch();
  try { const page = await browser.newPage({ viewport: VIEWPORT }); return await fn(page); } finally { await browser.close(); }
}
const shot = async (page, opts, hide) => {
  await page.setContent(doc(opts));
  const el = await page.$(SEL);
  const tag = hide && (await markOffscope(el, C)) ? await page.addStyleTag({ content: OFFSCOPE_CSS }) : null;
  const png = PNG.sync.read(await el.screenshot());
  if (tag) { await tag.evaluate((n) => n.remove()); await unmarkOffscope(page); }
  return png;
};
const row = (png, y) => png.data.subarray(y * png.width * 4, (y + 1) * png.width * 4);
const rgb = (png, x, y) => [...png.data.subarray((y * png.width + x) * 4, (y * png.width + x) * 4 + 3)];

test("without the rule the last row is the neighbour below the component: differs between the sides", () => withPage(async (page) => {
  const a = await shot(page, ORIG, false), b = await shot(page, REST, false);
  assert.deepEqual([a.width, a.height, b.width, b.height], [1200, 110, 1200, 110]);
  for (let y = 0; y < 109; y++) assert.ok(row(a, y).equals(row(b, y)), `row ${y}`);
  assert.deepEqual(rgb(a, 5, 109), [71, 71, 71]); // the dark footer over the white page
  assert.deepEqual(rgb(b, 5, 109), [241, 243, 244]); // the light footer
}));

test("with the rule both sides give the same shot: the component on its ancestors' backgrounds", () => withPage(async (page) => {
  const a = await shot(page, ORIG, true), b = await shot(page, REST, true);
  assert.deepEqual([a.width, a.height, b.width, b.height], [1200, 110, 1200, 110]);
  assert.ok(a.data.equals(b.data));
  // the partial rows at both edges show the page background instead of the neighbours (.above, the footer); every row
  // in between is what the shot without the rule had
  const plain = await shot(page, ORIG, false);
  for (const y of [0, 109]) { assert.deepEqual(rgb(a, 5, y), [255, 255, 255], `row ${y}`); assert.ok(!row(a, y).equals(row(plain, y)), `row ${y}`); }
  for (let y = 1; y < 109; y++) assert.ok(row(a, y).equals(row(plain, y)), `row ${y}`);
}));

test("the component's own pixels are still compared: a change inside it shows with the rule", () => withPage(async (page) => {
  const a = await shot(page, ORIG, true);
  await page.setContent(doc(REST).replace("background:#09c", "background:#0c9"));
  const el = await page.$(SEL);
  await markOffscope(el, C);
  const tag = await page.addStyleTag({ content: OFFSCOPE_CSS });
  const b = PNG.sync.read(await el.screenshot());
  await tag.evaluate((n) => n.remove()); await unmarkOffscope(page);
  assert.ok(!a.data.equals(b.data));
}));
