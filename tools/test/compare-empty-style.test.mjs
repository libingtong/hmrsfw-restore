// node --test tools/test/compare-empty-style.test.mjs
// empty-style (HM-336): style="" (no declarations) equals no style attribute; a style with declarations is still compared.
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { ROOT } from "../gate/common.mjs";
import { loadRules, normHtml } from "../gate/rules.mjs";

const rules = loadRules(path.join(ROOT, "rules/compare"));
const el = (t, a, c = []) => ({ t, a, c });
const input = (attrs) => ({ tree: el("div", [["class", "ant-input-number-input-wrap"]], [el("input", [["class", "ant-input-number-input"], ["role", "spinbutton"], ["step", "1"], ...attrs])]), ltgt: true });
const html = (cap) => normHtml(cap, rules);

test("empty-style: an input whose caret was hidden by a screenshot equals the untouched input", () => {
  assert.ok(rules.ids.includes("empty-style"));
  assert.equal(html(input([["style", ""]])), html(input([])));
  assert.equal(html(input([["style", "  "]])), html(input([])));
  assert.equal(html({ tree: el("div", [["style", ""]], [el("span", [["style", ""], ["class", "a"]], ["x"])]), ltgt: true }), html({ tree: el("div", [], [el("span", [["class", "a"]], ["x"])]), ltgt: true }));
});

test("empty-style: a style with declarations, other empty attributes and the element itself are still compared", () => {
  assert.notEqual(html(input([["style", "caret-color: transparent !important;"]])), html(input([])));
  assert.notEqual(html(input([["style", "width: 60px;"]])), html(input([["style", ""]])));
  assert.notEqual(html(input([["class", ""]])), html(input([]))); // only style
  assert.notEqual(html(input([["disabled", ""]])), html(input([["style", ""]])));
  assert.notEqual(html({ tree: el("div", [["style", ""]]), ltgt: true }), html({ tree: el("span", []), ltgt: true }));
});
