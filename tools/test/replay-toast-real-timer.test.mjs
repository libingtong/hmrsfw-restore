// node --test tools/test/replay-toast-real-timer.test.mjs
// Toast recorder under the replay clock (HM-1278). runPage installs Playwright's clock (setSystemTime), which works off
// the page's due timers one per real macrotask; a page with many due timers that each re-render (a big form: one per
// input) keeps the fake time standing for seconds. The recorder read a new toast's text in a page setTimeout(50), which
// sat in that queue: the read came after the capture and the toast was missing on that side only (page.uc.collage.
// studentInfo, page.uc.sign.corpInfo, page.uc.404 in the 10-23 integration run). The read now uses the browser's own
// timer. Real browser, local fixture page, no HAR file.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright";
import { runPage } from "../gate/replay.mjs";
import { serveStatic } from "../gate/serve.mjs";

// 60 due timers of ~120 ms work each (≈ 7 s of fake-clock backlog), then a toast shown straight away (not by a timer)
// and closed by the page 3 s later, the way ant-design-vue's message does.
const page = (timers) => `<!doctype html><html><head><meta charset="utf-8"></head><body><main><div class="page">表单</div></main><script>
for (let i = 0; i < ${timers}; i++) setTimeout(() => { const t = performance.now(); while (performance.now() - t < 120); }, 10);
const box = document.createElement("div"); box.className = "ant-message"; document.body.appendChild(box);
const n = document.createElement("div"); n.className = "ant-message-notice"; n.textContent = "请求地址出错: /x"; box.appendChild(n);
setTimeout(() => n.remove(), 3000);
</script></body></html>`;

let browser, tmp;
const har = { byKey: new Map(), recordedAt: Date.parse("2026-10-01T00:00:00Z") };
async function run(timers, tag) {
  const root = path.join(tmp, tag);
  rmSync(root, { recursive: true, force: true });
  mkdirSync(root, { recursive: true });
  writeFileSync(path.join(root, "index.html"), page(timers));
  const srv = await serveStatic(root);
  try { return await runPage(browser, { origin: srv.origin, url: "/", storage: { localStorage: {} }, har, sel: "main > *", shotDir: root, tag: "shot" }); } finally { await srv.close(); }
}

test.before(async () => { browser = await chromium.launch(); tmp = mkdtempSync(path.join(os.tmpdir(), "replay-toast-timer-")); });
test.after(async () => { await browser?.close(); rmSync(tmp, { recursive: true, force: true }); });

test("toast shown while the replay clock is backlogged is recorded", async () => {
  const r = await run(60, "backlog");
  assert.deepEqual(r.load.overlay.toasts, ["请求地址出错: /x"]);
});

test("no backlog: recorded as before", async () => {
  const r = await run(0, "idle");
  assert.deepEqual(r.load.overlay.toasts, ["请求地址出错: /x"]);
});
