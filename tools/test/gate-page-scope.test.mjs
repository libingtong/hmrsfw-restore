// node --test tools/test/gate-page-scope.test.mjs
// Measurement scope of the interaction run (HM-797): the request sequence is the page under test's own. A page it opens
// (target="_blank") is recorded as "opened <target>" and compared; that other page's start-up requests are not, so how
// fast the new tab starts on either side no longer decides the result. Real browser, local fixture sites, no HAR file.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright";
import { ROOT } from "../gate/common.mjs";
import { loadRules } from "../gate/rules.mjs";
import { runPage } from "../gate/replay.mjs";
import { serveStatic } from "../gate/serve.mjs";
import { compareRuns } from "../gate/compare.mjs";

const rules = loadRules(path.join(ROOT, "rules/compare"));
// One SPA: "/" is the page under test (an iframe, a target=_blank link, a search button); "/JobList" is the page the
// link opens, which requests its list `tabDelay` ms after start-up; "/frame" is the iframe, which requests on load.
const site = ({ tabDelay, search = "/xf-api/search", href = "/JobList?isJobMarket=1" }) => `<!doctype html><html><head><meta charset="utf-8"></head><body><script>
const get = (u) => fetch(u, { method: "POST", body: "{}" }).then((r) => r.text());
if (location.pathname === "/JobList") setTimeout(() => { get("/xf-api/jobList"); get("/xf-api/areaInfo"); }, ${tabDelay});
else if (location.pathname === "/frame") get("/xf-api/frameData");
else {
  document.body.innerHTML = '<main><div class="page"><iframe src="/frame"></iframe><a class="more" target="_blank" href="${href}">查看更多</a><button class="go">搜索</button><p class="out">-</p></div></main>';
  get("/xf-api/pageData");
  document.querySelector(".go").onclick = () => get("${search}").then(() => { document.querySelector(".out").textContent = "done"; });
}
</script></body></html>`;

let browser, tmp;
const har = { byKey: new Map(), recordedAt: Date.parse("2026-10-01T00:00:00Z") }; // every /xf-api/ request → "not in HAR"
const steps = [{ click: "查看更多" }, { click: "搜索" }];
async function run(opts, tag) {
  const root = path.join(tmp, tag);
  mkdirSync(root, { recursive: true });
  writeFileSync(path.join(root, "index.html"), site(opts));
  const srv = await serveStatic(root);
  try { return await runPage(browser, { origin: srv.origin, url: "/", storage: { localStorage: {} }, har, sel: "main > *", steps, shotDir: root, tag: "shot" }); } finally { await srv.close(); }
}
const cmp = (origRuns, rest) => compareRuns({ runs: origRuns, shell: { requests: [] } }, rest, { rules, site: "portal" });
const fails = (r) => r.failed.filter((f) => f.check !== "pixel").map((f) => `${f.where}.${f.check}`).sort();
const reqs = (r) => r.stepLog.map((x) => `${x.phase} ${x.path}`);

test.before(async () => { browser = await chromium.launch(); tmp = mkdtempSync(path.join(os.tmpdir(), "gate-page-scope-")); });
test.after(async () => { await browser?.close(); rmSync(tmp, { recursive: true, force: true }); });

test("target=_blank: new tab slow on one side, fast on the other → same result; the opened target is compared", async () => {
  const slow = await run({ tabDelay: 4000 }, "orig-slow"), slow2 = await run({ tabDelay: 4000 }, "orig-slow2"), fast = await run({ tabDelay: 0 }, "rest-fast");
  // the page under test's own requests, iframe included; nothing from the new tab on either side
  for (const r of [slow, fast]) {
    assert.deepEqual(r.load.requests.map((x) => x.path).sort(), ["/frameData", "/pageData"]);
    assert.deepEqual(reqs(r), ["step1 /search"]);
    assert.deepEqual(r.opened, [{ phase: "step0", target: "/JobList?isJobMarket=1" }]);
  }
  // the race is real: the fast tab did request before the capture (previously logged as the page's step0 requests)
  assert.ok(fast.otherRequests.some((x) => x.phase === "step0" && x.path === "/jobList"), JSON.stringify(fast.otherRequests));
  assert.deepEqual(fails(cmp([slow, slow2], fast)), []);
  assert.deepEqual(fails(cmp([fast, fast], slow)), []);
});

test("the page's own requests are still compared; a different opened target fails steps.opened", async () => {
  const orig = await run({ tabDelay: 4000 }, "orig");
  const otherSearch = await run({ tabDelay: 0, search: "/xf-api/search2" }, "rest-search2");
  assert.deepEqual(fails(cmp([orig, orig], otherSearch)), ["steps.requests"]);
  const otherTarget = await run({ tabDelay: 0, href: "/JobList?isJobMarket=2" }, "rest-target");
  const r = cmp([orig, orig], otherTarget);
  assert.deepEqual(fails(r), ["final.html", "load.html", "steps.opened"]); // the href itself is in the page root's HTML too
  assert.match(r.failed.find((f) => f.check === "opened").hint, /^opened page #1: original step0 \/JobList, restored step0 \/JobList \(1\/1 pages opened\)$/);
  // a link that does not open a new tab any more (same target, no target=_blank) also fails steps.opened
  const none = structuredClone(orig); none.opened = [];
  assert.deepEqual(fails(cmp([orig, orig], none)), ["steps.opened"]);
});

test("baseline recorded before HM-797 (no opened pages stored): counts as having opened none; requests compared as before", async () => {
  const orig = await run({ tabDelay: 4000 }, "orig-old");
  const old = structuredClone(orig); delete old.opened; delete old.load.opened;
  const rest = await run({ tabDelay: 0 }, "rest-old");
  // the original does open a page, the old baseline does not say so: fails until the baseline is re-recorded
  assert.deepEqual(fails(cmp([old, old], rest)), ["steps.opened"]);
  const noTab = structuredClone(rest); noTab.opened = []; noTab.load.opened = [];
  assert.deepEqual(fails(cmp([old, old], noTab)), []);
  const otherSearch = await run({ tabDelay: 0, search: "/xf-api/search2" }, "rest-old-search2");
  otherSearch.opened = [];
  assert.deepEqual(fails(cmp([old, old], otherSearch)), ["steps.requests"]);
});

test("a new page whose navigation is aborted (host outside the replay) is recorded with the target it was opened with", async () => {
  const r = await run({ tabDelay: 0, href: "https://hamiwebportaltest.rencaidanao.com/x/y?z=1" }, "external");
  assert.deepEqual(r.opened, [{ phase: "step0", target: "hamiwebportaltest.rencaidanao.com/x/y" }]);
});
