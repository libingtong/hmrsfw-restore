// HMRSFW_APP_DIR=<hmrsfw-vue checkout> node --test tools/test/hidden-popup-offset-browser.test.mjs
// hidden-popup-offset (HM-292) on the real ant-design-vue build in Chromium: the same a-select with the same steps, only a
// block above the page differs (0 / 90 px, the portal homeView header). Open, the popup sits at the same place on both;
// once closed (display:none) its inline top differs by exactly that height, and opening again re-aligns it. Captured
// like the gate does (domTreeInPage), the closed popup normalises to the same HTML.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { ROOT } from "../gate/common.mjs";
import { domTreeInPage } from "../gate/dom.mjs";
import { loadRules, normHtml } from "../gate/rules.mjs";
import { VIEWPORT } from "../gate/replay.mjs";

const APP = process.env.HMRSFW_APP_DIR;
const skip = APP ? false : "HMRSFW_APP_DIR not set";
const DAYJS = ["advancedFormat", "customParseFormat", "localeData", "quarterOfYear", "weekOfYear", "weekYear", "weekday"];
const FILES = APP ? {
  "vue.js": "vue/dist/vue.global.prod.js", "antd.js": "ant-design-vue/dist/antd.min.js", "antd.css": "ant-design-vue/dist/antd.min.css", "dayjs.js": "dayjs/dayjs.min.js",
  ...Object.fromEntries(DAYJS.map((p) => [`dayjs-${p}.js`, `dayjs/plugin/${p}.js`])),
} : {};
const doc = (pad) => `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="/antd.css"></head><body>
<div style="height:${pad}px"></div><div id="app"></div>
${["vue.js", "dayjs.js", ...DAYJS.map((p) => `dayjs-${p}.js`), "antd.js"].map((f) => `<script src="/${f}"></script>`).join("")}
<script>
Vue.createApp({ data: () => ({ v: undefined, rows: 20 }), template: \`
  <a-config-provider :getPopupContainer="(n) => n.parentNode">
    <div id="root" style="padding: 300px 0 0 560px">
      <a-select v-model:value="v" size="large" allowClear placeholder="p" style="width:220px">
        <a-select-option value="1">a1</a-select-option><a-select-option value="2">a2</a-select-option><a-select-option value="3">a3</a-select-option>
      </a-select>
      <button id="reset" @click="v = undefined; rows = rows === 20 ? 4 : 20">reset</button>
    </div>
    <div v-for="i in rows" :key="i" style="height:60px">{{ i }}</div>
  </a-config-provider>\` }).use(antd).mount("#app");
</script></body></html>`;

async function run(browser, pad) {
  const page = await browser.newPage({ viewport: VIEWPORT });
  await page.route("http://fixture.test/**", (r) => {
    const f = new URL(r.request().url()).pathname.slice(1);
    if (f === "") return r.fulfill({ contentType: "text/html", body: doc(pad) });
    return FILES[f] ? r.fulfill({ contentType: f.endsWith(".css") ? "text/css" : "text/javascript", body: readFileSync(path.join(APP, "node_modules", FILES[f])) }) : r.fulfill({ status: 404 });
  });
  await page.goto("http://fixture.test/");
  await page.waitForSelector(".ant-select");
  const style = () => page.$eval(".ant-select-dropdown", (n) => n.getAttribute("style"));
  const gap = () => page.evaluate(() => Math.round(document.querySelector(".ant-select-dropdown").getBoundingClientRect().top - document.querySelector(".ant-select").getBoundingClientRect().bottom));
  await page.click(".ant-select"); await page.waitForTimeout(800);
  const open = { style: await style(), gap: await gap() };
  await page.getByText("a2", { exact: true }).click(); await page.waitForTimeout(1500);
  await page.click("#reset"); await page.waitForTimeout(1500);
  const closed = { style: await style(), capture: await page.$eval("#root", domTreeInPage) };
  await page.click(".ant-select"); await page.waitForTimeout(800);
  const reopen = { style: await style(), gap: await gap() };
  await page.close();
  return { open, closed, reopen };
}
const top = (s) => Number(/(?:^|;)\s*top:\s*(-?[\d.]+)px/.exec(s)?.[1]);

test("closed popup: top follows the document offset of the trigger, the open popup does not; the rule makes the capture equal", { skip }, async () => {
  const browser = await chromium.launch();
  try {
    const a = await run(browser, 0), b = await run(browser, 90);
    assert.equal(a.open.style, b.open.style);
    assert.equal(a.open.gap, b.open.gap);
    assert.match(a.closed.style, /display: none/);
    assert.equal(top(b.closed.style) - top(a.closed.style), 90);
    assert.equal(a.reopen.style, a.open.style);
    assert.equal(b.reopen.style, b.open.style);
    const rules = loadRules(path.join(ROOT, "rules/compare"));
    const off = { ...rules, tree: rules.tree.filter((f) => f.name !== "hiddenPopupOffset") };
    assert.notEqual(normHtml(a.closed.capture, off), normHtml(b.closed.capture, off));
    assert.equal(normHtml(a.closed.capture, rules), normHtml(b.closed.capture, rules));
  } finally { await browser.close(); }
});
