// node --test tools/test/compare-rules-empty-style.test.mjs
// empty-style (HM-262): an empty style attribute equals no style attribute; every non-empty style is still compared.
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { ROOT } from "../gate/common.mjs";
import { loadRules, normHtml } from "../gate/rules.mjs";

const rules = loadRules(path.join(ROOT, "rules/compare"));
const el = (t, a, c = []) => ({ t, a, c });
const input = (extra) => ({ tree: el("label", [["class", "ant-radio-button-wrapper"]], [el("span", [["class", "ant-radio-button"]], [el("input", [["class", "ant-radio-button-input"], ["type", "radio"], ["value", "70"], ...extra])])]), ltgt: true });
const html = (cap) => normHtml(cap, rules);

test("empty-style: style=\"\" (or whitespace only) equals no style attribute", () => {
  assert.ok(rules.ids.includes("empty-style"));
  assert.equal(html(input([["style", ""]])), html(input([])));
  assert.equal(html(input([["style", "  "]])), html(input([])));
});

test("empty-style: non-empty styles and the other attributes are still compared", () => {
  assert.notEqual(html(input([["style", "opacity: 0;"]])), html(input([])));
  assert.notEqual(html(input([["style", "opacity: 0;"]])), html(input([["style", ""]])));
  assert.notEqual(html(input([["style", "width: 10px;"]])), html(input([["style", "width: 12px;"]])));
  assert.notEqual(html(input([["style", ""], ["disabled", ""]])), html(input([])));
});
