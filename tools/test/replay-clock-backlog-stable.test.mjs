// node --test tools/test/replay-clock-backlog-stable.test.mjs
// Settling under the replay clock (HM-1278). runPage installs Playwright's clock (setSystemTime), which runs the page's
// due timers one per real macrotask; a page with many due timers that each re-render (a big form) keeps the page's time
// standing for seconds while its DOM text and element count do not change. waitStable took that for settled and the
// capture caught the page half-way (antd upload list items still "appear-prepare" with their inline height:
// page.uc.personLoan.detailInfo, page.uc.CorpAttestationapprove). A page setTimeout(0) that has not run within 500 ms
// now counts as not settled. Real browser, local fixture page, no HAR file.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright";
import { runPage } from "../gate/replay.mjs";
import { serveStatic } from "../gate/serve.mjs";

// 60 due timers of ~120 ms work each (≈ 7 s of backlog), then a timer that only changes the root's class (what
// rc-motion does when an appear motion ends): text and element count stay the same throughout.
const page = (timers) => `<!doctype html><html><head><meta charset="utf-8"></head><body><main><div class="item appear-prepare">表单</div></main><script>
for (let i = 0; i < ${timers}; i++) setTimeout(() => { const t = performance.now(); while (performance.now() - t < 120); }, 10);
setTimeout(() => { document.querySelector(".item").className = "item"; }, 20);
</script></body></html>`;

let browser, tmp;
const har = { byKey: new Map(), recordedAt: Date.parse("2026-10-01T00:00:00Z") };
async function run(timers, tag) {
  const root = path.join(tmp, tag);
  mkdirSync(root, { recursive: true });
  writeFileSync(path.join(root, "index.html"), page(timers));
  const srv = await serveStatic(root);
  try { return await runPage(browser, { origin: srv.origin, url: "/", storage: { localStorage: {} }, har, sel: "main > *", shotDir: root, tag: "shot" }); } finally { await srv.close(); }
}

test.before(async () => { browser = await chromium.launch(); tmp = mkdtempSync(path.join(os.tmpdir(), "replay-clock-backlog-")); });
test.after(async () => { await browser?.close(); rmSync(tmp, { recursive: true, force: true }); });

test("backlogged replay clock: captured after the page's timers have run", async () => {
  const r = await run(60, "backlog");
  assert.equal(r.load.candidates[0].cls, "item");
  assert.ok(r.settleMs > 0, `settled within the limit (${r.settleMs})`);
});

test("no backlog: settles as before", async () => {
  const r = await run(0, "idle");
  assert.equal(r.load.candidates[0].cls, "item");
  assert.ok(r.settleMs > 0 && r.settleMs < 4000, String(r.settleMs));
});
