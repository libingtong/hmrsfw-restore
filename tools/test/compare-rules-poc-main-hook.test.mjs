// node --test tools/test/compare-rules-poc-main-hook.test.mjs
// poc-main-hook (HM-1162): the gate's own locating hook id="poc-main" (restored uc layout Home.vue, portal App.vue) is
// not compared when the compared root holds it (a usercenter bare-route page whose interaction lands on a layout page,
// root #app > * = the whole layout); every other id and attribute still is.
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { ROOT } from "../gate/common.mjs";
import { loadRules, normHtml } from "../gate/rules.mjs";

const rules = loadRules(path.join(ROOT, "rules/compare"));
const el = (t, a, c = []) => ({ t, a, c });
// layout > .overscoll > (page container) > page root, as both sides render /main after 403's 返回首页
const layout = (container) => ({ tree: el("section", [["class", "ant-layout"]], [el("div", [["class", "overscoll"]], [el("div", container, [el("div", [["class", "contentmain"]], ["x"])])])]), ltgt: true });
const html = (cap) => normHtml(cap, rules);

test("poc-main-hook: the restored container's id=\"poc-main\" is not compared", () => {
  assert.ok(rules.ids.includes("poc-main-hook"));
  assert.equal(html(layout([["data-v-34be80b2", ""]])), html(layout([["data-v-a0429b24", ""], ["id", "poc-main"]])));
  assert.equal(html(layout([])), html(layout([["id", "poc-main"]])));
});

test("poc-main-hook: other ids, other attributes of that element and its subtree are still compared", () => {
  assert.notEqual(html(layout([])), html(layout([["id", "poc-main2"]])));
  assert.notEqual(html(layout([])), html(layout([["id", "links"]])));
  assert.notEqual(html(layout([])), html(layout([["id", "poc-main"], ["class", "x"]])));
  assert.notEqual(html(layout([["id", "poc-main"]])), html({ tree: el("section", [["class", "ant-layout"]], [el("div", [["class", "overscoll"]], [el("div", [["id", "poc-main"]], [el("div", [["class", "contentmain"]], ["y"])])])]), ltgt: true }));
});
