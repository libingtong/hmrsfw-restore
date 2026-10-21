// node --test tools/test/compare-volatile-canvas.test.mjs
// Volatile canvases (HM-302): a <canvas> that the original itself draws differently in its two runs (TagCanvas: random
// colours and order, a turning sphere) is left out of the pixel comparison, box only; the rest of the shot is compared
// as before, and the restored canvas must paint about as much as the original's (ink ratio), so an empty one still fails.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { PNG } from "pngjs";
import { chromium } from "playwright";
import { ROOT } from "../gate/common.mjs";
import { loadRules } from "../gate/rules.mjs";
import { compareRuns, unstableKeys } from "../gate/compare.mjs";
import { canvasBoxesInPage } from "../gate/replay.mjs";

const rules = loadRules(path.join(ROOT, "rules/compare"));
const off = { ...rules, volatileCanvas: null };
const dir = mkdtempSync(path.join(tmpdir(), "volatile-canvas-"));
test.after(() => rmSync(dir, { recursive: true, force: true }));

const W = 400, H = 200, CV = { x: 250, y: 40, w: 120, h: 100 };
// white shot; `marks`: filled rectangles [x, y, w, h, rgb]
let n = 0;
function shot(marks) {
  const P = new PNG({ width: W, height: H });
  P.data.fill(255);
  for (const [x, y, w, h, [r, g, b]] of marks) for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) { const k = (j * W + i) * 4; P.data[k] = r; P.data[k + 1] = g; P.data[k + 2] = b; }
  const f = path.join(dir, `s${n++}.png`);
  writeFileSync(f, PNG.sync.write(P));
  return f;
}
const PAGE = [[10, 10, 200, 30, [30, 30, 30]], [10, 60, 200, 100, [220, 230, 250]]]; // the page around the canvas
// "tags" inside the canvas box: four blocks at positions that depend on the run
const tags = (seed) => [0, 1, 2, 3].map((i) => [CV.x + 5 + ((seed * 37 + i * 29) % 80), CV.y + 5 + ((seed * 53 + i * 17) % 70), 30, 12, [200, 40 + 40 * i, 60]]);
const cand = (marks, canvases = [CV]) => ({ cls: "root", tree: { t: "div", a: [["class", "root"]], c: [] }, ltgt: true, text: "", shot: shot(marks), ...(canvases ? { canvases } : {}) });
const run = (c) => ({ load: { candidates: [c], requests: [] } });
const baseline = (a, b) => ({ shell: { requests: [] }, runs: [run(a), run(b)] });
const cmp = (b, r, R = rules) => compareRuns(b, run(r), { rules: R, site: "portal" });
const pixelFail = (res) => res.failed.filter((f) => f.check === "pixel");

test("volatile-canvas: the rule is on; a canvas drawn differently in the original's two runs is not compared pixel by pixel", () => {
  assert.ok(rules.ids.includes("volatile-canvas"));
  const b = baseline(cand([...PAGE, ...tags(1)]), cand([...PAGE, ...tags(2)]));
  const r = cand([...PAGE, ...tags(3)]);
  assert.equal(pixelFail(cmp(b, r, off)).length, 1); // without the rule: the canvas content differs
  const res = cmp(b, r);
  assert.deepEqual(pixelFail(res), []);
  assert.equal(res.volatileCanvases.length, 1);
  assert.deepEqual(res.volatileCanvases[0], { x: CV.x - 1, y: CV.y - 1, w: CV.w + 2, h: CV.h + 2 });
  // the two original runs alone: no load.pixel in unstable (the baseline counts as stable), as before without the canvas
  assert.ok(unstableKeys(run(b.runs[0].load.candidates[0]), run(b.runs[1].load.candidates[0]), { rules: off, site: "portal", shell: new Set() }).includes("load.pixel"));
  assert.ok(!unstableKeys(run(b.runs[0].load.candidates[0]), run(b.runs[1].load.candidates[0]), { rules, site: "portal", shell: new Set() }).includes("load.pixel"));
});

test("volatile-canvas: an empty or overfilled restored canvas still fails (ink ratio)", () => {
  const b = baseline(cand([...PAGE, ...tags(1)]), cand([...PAGE, ...tags(2)]));
  const empty = pixelFail(cmp(b, cand(PAGE)));
  assert.equal(empty.length, 1);
  assert.match(empty[0].hint, /^canvas at 249,39 122x102 .*restored paints 0\.0% of its box/);
  const filled = pixelFail(cmp(b, cand([...PAGE, [CV.x, CV.y, CV.w, 40, [10, 10, 200]]])));
  assert.equal(filled.length, 1);
  assert.match(filled[0].hint, /restored paints/);
});

test("volatile-canvas: everything outside the canvas box is compared as before", () => {
  const b = baseline(cand([...PAGE, ...tags(1)]), cand([...PAGE, ...tags(2)]));
  const r = cand([[10, 10, 200, 30, [30, 30, 30]], [10, 60, 200, 100, [250, 200, 200]], ...tags(3)]); // another panel colour
  const f = pixelFail(cmp(b, r));
  assert.equal(f.length, 1);
  assert.match(f[0].hint, /% of pixels differ/);
});

test("volatile-canvas: no mask for a stable canvas, another box, a missing box or an old baseline", () => {
  // the original draws the same in both runs (an echarts chart): the restored canvas is compared pixel by pixel
  const same = baseline(cand([...PAGE, ...tags(1)]), cand([...PAGE, ...tags(1)]));
  let res = cmp(same, cand([...PAGE, ...tags(3)]));
  assert.equal(pixelFail(res).length, 1);
  assert.deepEqual(res.volatileCanvases, []);
  const b = () => baseline(cand([...PAGE, ...tags(1)]), cand([...PAGE, ...tags(2)]));
  // the restored canvas sits elsewhere (more than 1 px off)
  res = cmp(b(), cand([...PAGE, ...tags(3)], [{ ...CV, x: CV.x + 2 }]));
  assert.equal(pixelFail(res).length, 1);
  assert.deepEqual(res.volatileCanvases, []);
  // within 1 px: same canvas
  assert.deepEqual(pixelFail(cmp(b(), cand([...PAGE, ...tags(3)], [{ ...CV, x: CV.x + 1 }]))), []);
  // the restored side has no canvas there
  assert.equal(pixelFail(cmp(b(), cand([...PAGE, ...tags(3)], []))).length, 1);
  // a baseline recorded before HM-302 (no canvas boxes stored)
  res = cmp(baseline(cand([...PAGE, ...tags(1)], null), cand([...PAGE, ...tags(2)], null)), cand([...PAGE, ...tags(3)]));
  assert.equal(pixelFail(res).length, 1);
  assert.deepEqual(res.volatileCanvases, []);
});

test("canvasBoxesInPage: visible canvases inside the root, in shot pixels", async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
    await page.setContent(`<body style="margin:0"><div style="height:50px"></div>
      <div class="root" style="margin-left:20.5px;padding:10px;width:500px">
        <div style="height:30px"></div><canvas width="200" height="100" style="width:200px;height:100px;display:block"></canvas>
        <canvas width="10" height="10" style="display:none"></canvas><canvas width="10" height="10" style="visibility:hidden"></canvas>
      </div><canvas class="outside" width="50" height="50"></canvas></body>`);
    const el = await page.$(".root");
    // element shot: the root's box starts at (20.5, 50); the canvas at (30.5, 90) → floor relative to floor of the origin
    assert.deepEqual(await el.evaluate(canvasBoxesInPage, null), [{ x: 10, y: 40, w: 201, h: 100 }]);
    // a clip in document coordinates (paintedBoxInPage), page scrolled
    await page.evaluate(() => { document.body.style.height = "3000px"; scrollTo(0, 40); });
    assert.deepEqual(await el.evaluate(canvasBoxesInPage, { x: 0, y: 0, width: 800, height: 600 }), [{ x: 30, y: 90, w: 201, h: 100 }]);
  } finally { await browser.close(); }
});
