// HMRSFW_APP_DIR=<hmrsfw-vue checkout> node --test tools/test/carousel-autoplay-pause-browser.test.mjs
// pauseCarousels (HM-273) on the real ant-design-vue build in Chromium: an autoplaying fade a-carousel, mounted after a
// delay as a page shows it once its list has loaded. Without the init script the active slide at a given moment depends
// on when the slider mounted; with it both mount delays capture the same HTML (the initial slide), a page's own hover
// handler around the slider never runs, a real pointer leaving the track does not restart the rotation, and a slider
// without autoplay renders exactly as without the script.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { ROOT } from "../gate/common.mjs";
import { domTreeInPage } from "../gate/dom.mjs";
import { loadRules, normHtml } from "../gate/rules.mjs";
import { CAROUSEL_PAUSE_MS, VIEWPORT, pauseCarousels } from "../gate/replay.mjs";

const APP = process.env.HMRSFW_APP_DIR;
const skip = APP ? false : "HMRSFW_APP_DIR not set";
const DAYJS = ["advancedFormat", "customParseFormat", "localeData", "quarterOfYear", "weekOfYear", "weekYear", "weekday"];
const FILES = APP ? {
  "vue.js": "vue/dist/vue.global.prod.js", "antd.js": "ant-design-vue/dist/antd.min.js", "antd.css": "ant-design-vue/dist/antd.min.css", "dayjs.js": "dayjs/dayjs.min.js",
  ...Object.fromEntries(DAYJS.map((p) => [`dayjs-${p}.js`, `dayjs/plugin/${p}.js`])),
} : {};
// autoplaySpeed 300: the library slides every 350 ms (autoplaySpeed + 50), the same code path as the portal's 3050 ms
const doc = (delay, autoplay) => `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="/antd.css"></head><body>
<div id="app"></div>
${["vue.js", "dayjs.js", ...DAYJS.map((p) => `dayjs-${p}.js`), "antd.js"].map((f) => `<script src="/${f}"></script>`).join("")}
<script>
window.__hover = 0;
Vue.createApp({ data: () => ({ list: [] }), methods: { onHover() { window.__hover++; } }, mounted() { setTimeout(() => { this.list = [1, 2, 3, 4]; }, ${delay}); }, template: \`
  <div id="root" @mouseover="onHover" style="width: 600px">
    <a-carousel v-if="list.length" :autoplay="${autoplay}" :autoplaySpeed="300" :dots="false" effect="fade">
      <div v-for="i in list" :key="i"><h3 style="height: 120px">slide {{ i }}</h3></div>
    </a-carousel>
  </div>\` }).use(antd).mount("#app");
</script></body></html>`;

async function run(browser, { delay, autoplay = true, paused, hoverAt = null }) {
  const page = await browser.newPage({ viewport: VIEWPORT });
  if (paused) await page.addInitScript(pauseCarousels, CAROUSEL_PAUSE_MS);
  await page.route("http://fixture.test/**", (r) => {
    const f = new URL(r.request().url()).pathname.slice(1);
    if (f === "") return r.fulfill({ contentType: "text/html", body: doc(delay, autoplay) });
    return FILES[f] ? r.fulfill({ contentType: f.endsWith(".css") ? "text/css" : "text/javascript", body: readFileSync(path.join(APP, "node_modules", FILES[f])) }) : r.fulfill({ status: 404 });
  });
  const t0 = Date.now();
  await page.goto("http://fixture.test/");
  await page.waitForSelector(".slick-track");
  if (hoverAt != null) { // a real pointer over the track and away again (an interaction step passing over the slider)
    await page.waitForTimeout(Math.max(0, hoverAt - (Date.now() - t0)));
    const b = await page.locator(".slick-slide.slick-active").boundingBox();
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.waitForTimeout(100);
    await page.mouse.move(b.x + b.width / 2, b.y + b.height + 400);
  }
  const seen = new Set(); // active slide sampled every 100 ms up to the capture moment (the same for every mount delay)
  while (Date.now() - t0 < 6000) { seen.add(await page.$eval(".slick-slide.slick-active", (n) => n.getAttribute("data-index"))); await page.waitForTimeout(100); }
  const out = {
    seen: [...seen].sort(),
    active: await page.$eval(".slick-slide.slick-active", (n) => n.getAttribute("data-index")),
    capture: await page.$eval("#root", domTreeInPage),
    html: await page.$eval("#root", (n) => n.outerHTML),
    hover: await page.evaluate(() => window.__hover),
  };
  await page.close();
  return out;
}

test("autoplay: without the pause the captured slide depends on the mount moment; with it both mount delays capture the initial slide", { skip }, async () => {
  const browser = await chromium.launch();
  try {
    const rules = loadRules(path.join(ROOT, "rules/compare"));
    const free = [await run(browser, { delay: 200 }), await run(browser, { delay: 1400 })];
    for (const f of free) assert.ok(f.seen.length > 1, "rotates without the pause"); // the slide at a capture is a matter of time
    const paused = [await run(browser, { delay: 200, paused: true }), await run(browser, { delay: 1400, paused: true })];
    for (const p of paused) { assert.deepEqual(p.seen, ["0"]); assert.equal(p.hover, 0); }
    assert.equal(normHtml(paused[0].capture, rules), normHtml(paused[1].capture, rules));
    const left = await run(browser, { delay: 200, paused: true, hoverAt: 3500 });
    assert.ok(left.hover > 0, "the pointer was over the slider"); assert.deepEqual(left.seen, ["0"]);
  } finally { await browser.close(); }
});

test("no autoplay: the slider renders exactly as without the script", { skip }, async () => {
  const browser = await chromium.launch();
  try {
    const a = await run(browser, { delay: 200, autoplay: false }), b = await run(browser, { delay: 200, autoplay: false, paused: true });
    assert.equal(a.html, b.html);
    assert.equal(b.hover, 0);
  } finally { await browser.close(); }
});
