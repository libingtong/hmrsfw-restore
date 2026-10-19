// node --test tools/test/gate-zero-box-shot.test.mjs
// Roots without an area (HM-380): an empty list wrapper (scrollList: div.marT20.scrolls > div.scrollContent, no items)
// has height 0, so an element screenshot is impossible and captureRoot used to shoot the whole viewport: the parent page
// and the shell around the root, which sit 90 px apart between the sides. paintedBoxInPage gives the root's painted
// content instead (null = nothing painted → no shot, candidate `blank`); compareRuns treats two blank roots as equal and
// a blank root against a painted one as different.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { chromium } from "playwright";
import { ROOT } from "../gate/common.mjs";
import { loadRules } from "../gate/rules.mjs";
import { compareRuns, unstableKeys } from "../gate/compare.mjs";
import { paintedBoxInPage, VIEWPORT } from "../gate/replay.mjs";

const C = "data-v-9e281131";
const SCROLL_CSS = `.scrollContent[${C}]{max-height:680px;overflow-y:auto}.marT20{margin-top:20px}`;
// [shell header placeholder (original side only)], parent page: [banner, title, the component root, block below]
const doc = (root, { header = true } = {}) => `<!doctype html><head><style>${SCROLL_CSS}</style></head><body style="margin:0"><main>
${header ? `<div class="headerBox" style="height:90px;background:#123"></div>` : ""}
<div class="banner" style="height:300px;background:linear-gradient(#fff,#26d)"></div><h2 style="margin:0;height:60px;color:#0aa">关于大会</h2>
${root}
<div class="below" style="height:900px;background:#eee"></div></main></body>`;
const empty = `<div ${C} class="marT20 scrolls"><div ${C} class="scrollContent"></div></div>`;
const item = (i) => `<div class="s-item" style="height:50px;background:#2b7;margin-bottom:20px">0${i}</div>`;

async function withPage(fn) {
  const browser = await chromium.launch();
  try { const page = await browser.newPage({ viewport: VIEWPORT }); return await fn(page); } finally { await browser.close(); }
}
const painted = async (page, html) => { await page.setContent(html); return (await page.$(".root, .scrolls")).evaluate(paintedBoxInPage); };

test("an empty list root paints nothing; with items it has a box and is shot as before", () => withPage(async (page) => {
  await page.setContent(doc(empty));
  const el = await page.$(".scrolls");
  assert.equal((await el.boundingBox()).height, 0);
  assert.equal(await el.evaluate(paintedBoxInPage), null);
  await page.setContent(doc(empty.replace("</div></div>", `${item(1)}${item(2)}</div></div>`)));
  assert.ok((await (await page.$(".scrolls")).boundingBox()).height > 0); // the zero-area branch is not taken
}));

test("content overflowing a zero-height root is its painted box; clipped, hidden or display:none content is not", () => withPage(async (page) => {
  // floated items in a zero-height root: painted below its top edge
  let b = await painted(page, doc(`<div class="root" style="width:600px">${item(1).replace('style="', 'style="float:left;width:200px;')}</div>`));
  assert.deepEqual(b && [b.width, b.height], [200, 50]);
  // text directly in a zero-height root
  b = await painted(page, doc(`<div class="root" style="height:0;font-size:20px;line-height:30px">x</div>`));
  assert.ok(b && b.width > 0 && b.height > 0); // the glyph boxes, not the line box
  // a visible grandchild under a visibility:hidden child still paints; the hidden child itself does not add its box
  b = await painted(page, doc(`<div class="root" style="height:0"><div style="visibility:hidden;height:80px;width:500px"><span style="visibility:visible;display:inline-block;width:40px;height:40px"></span></div></div>`));
  assert.deepEqual(b && [b.width, b.height], [40, 40]);
  // a zero-height root that clips: nothing paints
  assert.equal(await painted(page, doc(`<div class="root" style="height:0;overflow:hidden">${item(1)}</div>`)), null);
  // the scrollList child clips vertically too (overflow-y: auto) once it has no height
  assert.equal(await painted(page, doc(`<div class="root"><div style="height:0;overflow-y:auto">${item(1)}</div></div>`)), null);
  assert.equal(await painted(page, doc(`<div class="root" style="height:0"><div style="display:none">${item(1)}</div></div>`)), null);
}));

test("the zero-area root no longer depends on the parent page and shell around it; the old viewport shot did", () => withPage(async (page) => {
  const viewport = async (opts) => { await page.setContent(doc(empty, opts)); return page.screenshot(); };
  assert.notDeepEqual(await viewport({ header: true }), await viewport({ header: false })); // before: shell + parent, 90 px apart
  for (const header of [true, false]) assert.equal(await painted(page, doc(empty, { header })), null); // now: blank on both sides
  // overflowing content: the clip of its painted box is the same picture with and without the header
  const root = `<div class="root" style="width:600px">${item(1).replace('style="', 'style="float:left;width:200px;')}</div>`;
  const clip = async (header) => { const b = await painted(page, doc(root, { header })); return page.screenshot({ fullPage: true, clip: b }); };
  assert.deepEqual(await clip(true), await clip(false));
}));

const rules = loadRules(path.join(ROOT, "rules/compare"));
const ov = { modals: [], toasts: [] };
const tree = { t: "div", a: [["class", "marT20 scrolls"]], c: [{ t: "div", a: [["class", "scrollContent"]], c: [] }] };
const cand = (x) => ({ cls: "marT20 scrolls", tree, ltgt: true, text: "", ...x });
const run = (c) => ({ load: { candidates: [c], overlay: ov, requests: [] } });
const cmp = (origRuns, rest) => compareRuns({ runs: origRuns, shell: { requests: [] } }, rest, { rules, site: "portal" });

test("compareRuns: blank vs blank passes the pixel check; blank vs a painted shot fails it (either side)", () => withPage(async (page) => {
  const dir = mkdtempSync(path.join(tmpdir(), "zero-box-"));
  try {
    const shot = path.join(dir, "shot.png");
    await page.setContent(`<body style="margin:0"><div style="width:300px;height:100px;background:#26d"></div></body>`);
    await (await page.$("div")).screenshot({ path: shot });
    const blank = cand({ blank: true }), painted = cand({ shot });
    let r = cmp([run(blank), run(blank)], run(blank));
    assert.deepEqual(r.failed, []);
    assert.equal(r.pixel, 0);
    r = cmp([run(blank), run(blank)], run(painted));
    assert.deepEqual(r.failed.map((f) => f.check), ["pixel"]);
    assert.match(r.failed[0].hint, /^100\.000% of pixels differ .* size 0x0 vs 300x100$/);
    r = cmp([run(painted), run(painted)], run(blank));
    assert.deepEqual(r.failed.map((f) => f.check), ["pixel"]);
    assert.match(r.failed[0].hint, /size 300x100 vs 0x0$/);
    // one original run blank, the other painted (unstable original): either one matches
    assert.deepEqual(cmp([run(blank), run(painted)], run(blank)).failed, []);
    assert.deepEqual(cmp([run(blank), run(painted)], run(painted)).failed, []);
    const opts = { rules, site: "portal", shell: [] };
    assert.deepEqual(unstableKeys(run(blank), run(blank), opts), []);
    assert.deepEqual(unstableKeys(run(blank), run(painted), opts), ["load.pixel"]);
  } finally { rmSync(dir, { recursive: true, force: true }); }
}));
