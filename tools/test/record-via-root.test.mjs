// node --test tools/test/record-via-root.test.mjs
// Pages used only as a component of another page (recordVia, HM-251): both sides mount the parent page and compare the
// component's own root(s), the outermost elements carrying its scope id; the restored scope id comes from the compiled
// SFC; the parent's toasts (shell probe) are dropped on both sides.
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { readFileSync } from "node:fs";
import { chromium } from "playwright";
import { ROOT, SITES, origSelOf, pageScopeId, scopeRootSel } from "../gate/common.mjs";
import { scopeIdPlugin } from "../gate/appserver.mjs";
import { loadRules } from "../gate/rules.mjs";
import { compareRuns } from "../gate/compare.mjs";

const rules = loadRules(path.join(ROOT, "rules/compare"));

test("root selector: origSel for ordinary pages, the component's scope root for recordVia pages", () => {
  const page = { id: "p", site: "portal", target: "apps/portal/src/views/a/index.vue", components: [{ name: "index", scopeId: "data-v-11111111" }] };
  assert.equal(origSelOf(page), SITES.portal.origSel);
  const child = { id: "c", site: "portal", recordVia: "p", target: "apps/portal/src/views/a/review.vue", components: [{ name: "review", scopeId: "data-v-06062322" }] };
  assert.equal(origSelOf(child), "[data-v-06062322]:not([data-v-06062322] *)");
  // several components in the chunk: the one named after the target file
  const two = { ...child, target: "apps/portal/src/views/x/advertTop.vue", components: [{ name: "areaCont", scopeId: "data-v-9dcb5036" }, { name: "advertTop", scopeId: "data-v-4f3c37cc" }] };
  assert.equal(pageScopeId(two), "data-v-4f3c37cc");
  assert.throws(() => origSelOf({ ...child, components: [{ name: "review" }] }), /no scope id/);
});

test("root selector: usercenter routes outside the layout take #app's first child (HM-1225)", () => {
  const uc = (id, recordPath) => ({ id, site: "usercenter", recordPath, target: `apps/uc/src/views/${id}.vue`, components: [{ name: id, scopeId: "data-v-9c460855" }] });
  assert.equal(origSelOf(uc("403", "/403")), "#app > *");
  assert.equal(origSelOf(uc("previewresume", "/previewresume?id=1")), "#app > *");
  assert.equal(origSelOf(uc("404", "/404")), SITES.usercenter.origSel);
  assert.equal(origSelOf(uc("myresume", "/myresume")), SITES.usercenter.origSel);
  // a recordVia component still takes its scope root, even on a bare route
  assert.equal(origSelOf({ ...uc("x", "/previewresume?id=1"), recordVia: "page.uc.previewresume" }), scopeRootSel("data-v-9c460855"));
});

test("usercenter bareRoutes are exactly the original router's top-level routes other than the layout route", () => {
  const src = readFileSync(path.join(ROOT, "legacy-dist/usercenter/assets/index.1751615607545.js"), "utf8");
  const from = src.indexOf("Fht=["), to = src.indexOf("CC=fQ(", from);
  assert.ok(from > 0 && to > from, "router table not found");
  const table = src.slice(from + 4, to);
  const top = [];
  for (let i = 0, depth = 0; i < table.length; i++) {
    const c = table[i];
    if (c === "[" || c === "{") depth++;
    else if (c === "]" || c === "}") depth--;
    else if (depth === 2 && table.startsWith('path:"', i)) top.push(table.slice(i + 6, table.indexOf('"', i + 6)));
  }
  assert.deepEqual(top.filter((p) => p !== "/").sort(), [...SITES.usercenter.bareRoutes].sort());
});

test("scope root selector finds the component's outermost elements only, inside the parent page", async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    // layout header, parent root (scope P) holding: the component (scope C + P on its root) with a nested child
    // component (scope D + C on its root), a second instance of the component, and an element of the parent only
    await page.setContent(`<main><div class="headerBox"></div><div class="bgColor" data-v-p>
      <div class="marT20" data-v-c data-v-p><span data-v-c>a</span><div class="inner" data-v-d data-v-c><i data-v-d>x</i></div></div>
      <p data-v-p>parent only</p>
      <div class="marT20" data-v-c data-v-p><span data-v-c>b</span></div>
    </div><div class="footCls flex"></div></main>`);
    const roots = await page.$$eval(scopeRootSel("data-v-c"), (els) => els.map((e) => e.className + ":" + e.textContent.trim()));
    assert.deepEqual(roots, ["marT20:ax", "marT20:b"]);
    // a multi-root component (Fragment): every top-level element of it
    await page.setContent(`<main><div data-v-p><h1 data-v-f>t</h1><ul data-v-f><li data-v-f>1</li></ul></div></main>`);
    assert.deepEqual(await page.$$eval(scopeRootSel("data-v-f"), (els) => els.map((e) => e.localName)), ["h1", "ul"]);
  } finally { await browser.close(); }
});

test("restored scope id is read from the compiled SFC main module, not from its style/template sub-requests", () => {
  const found = new Map();
  const p = scopeIdPlugin(found);
  const file = path.join(ROOT, "tools/test/does-not-exist/review.vue");
  p.transform('const x = 1;\nexport default /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-612d7ded"]]);', file);
  p.transform('["__scopeId", "data-v-deadbeef"]', file + "?vue&type=style&index=0&scoped=612d7ded&lang.css");
  p.transform('["__scopeId", "data-v-deadbeef"]', path.join(ROOT, "x.ts"));
  assert.deepEqual([...found], [[file, "data-v-612d7ded"]]);
});

// compareRuns with the parent mounted on the restored side
const el = (t, a, c = []) => ({ t, a, c });
const cand = (cls, text) => ({ cls, tree: el("div", [["class", cls]], [text]), ltgt: true, text });
const run = (toasts, requests = []) => ({ load: { candidates: [cand("marT20", "review")], overlay: { modals: [], toasts }, requests } });
const fails = (r) => r.failed.map((f) => `${f.where}.${f.check}`).sort();
const base = (runs) => ({ runs, shell: { requests: ["POST /parent/dict"], toasts: ["操作失败", "操作失败", "未找到对应数据"] } });

test("inParent: the parent's toasts and requests are dropped on both sides; the component's own still count", () => {
  const orig = () => run(["操作失败", "未找到对应数据", "操作失败"], ["POST /parent/dict", "POST /review/questions"]);
  // restored parent raises the same toasts (fewer or in another order: the parent's own gate judges those)
  assert.deepEqual(fails(compareRuns(base([orig(), orig()]), run(["操作失败"], ["POST /parent/dict", "POST /review/questions"]), { rules, site: "portal", inParent: true })), []);
  // without inParent (an ordinary page: the restored app has no shell) the restored toast still counts
  assert.deepEqual(fails(compareRuns(base([orig(), orig()]), run(["操作失败"], ["POST /review/questions"]), { rules, site: "portal" })), ["load.overlay"]);
  // a toast of the component itself beyond the shell's is still compared
  assert.deepEqual(fails(compareRuns(base([orig(), orig()]), run(["操作失败", "操作失败", "操作失败"], ["POST /parent/dict", "POST /review/questions"]), { rules, site: "portal", inParent: true })), ["load.overlay"]);
  // the component's own request missing still fails
  assert.deepEqual(fails(compareRuns(base([orig(), orig()]), run([], ["POST /parent/dict"]), { rules, site: "portal", inParent: true })), ["load.requests"]);
});
