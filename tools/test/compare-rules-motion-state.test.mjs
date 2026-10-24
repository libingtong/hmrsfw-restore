// node --test tools/test/compare-rules-motion-state.test.mjs
// motion-state (HM-4, HM-1363 §0 a, HM-1385): an element caught mid rc-motion appear/enter settles with the state
// classes and inline style both gone; one caught only mid-leave (a v-show toggle inside an active <TransitionGroup>,
// e.g. ant-design-vue's upload trigger button in picture-card mode) settles at style="display: none;" instead, since
// Vue's vShow directive only sets that in the leave transition's completion callback — it never clears style outright.
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { ROOT } from "../gate/common.mjs";
import { loadRules, normHtml } from "../gate/rules.mjs";

const rules = loadRules(path.join(ROOT, "rules/compare"));
const el = (t, a, c = []) => ({ t, a, c });
const node = (classes, style) => ({ tree: el("div", [["class", classes], ...(style ? [["style", style]] : [])], ["x"]), ltgt: true });
const html = (cap) => normHtml(cap, rules);

test("motion-state: an appear mid-transition element settles to no style, same as never having one", () => {
  assert.ok(rules.ids.includes("motion-state"));
  const settled = node("ant-upload-list-picture-card-container");
  const midAppear = node("ant-upload-list-picture-card-container ant-upload-animate-inline-appear ant-upload-animate-inline-appear-prepare", "height: 0px;");
  assert.equal(html(settled), html(midAppear));
});

test("motion-state: an enter mid-transition element also settles to no style", () => {
  const settled = node("ant-upload-list-picture-card-container");
  const midEnter = node("ant-upload-list-picture-card-container ant-upload-animate-inline-enter ant-upload-animate-inline-enter-active", "height: 32px; opacity: 0.5;");
  assert.equal(html(settled), html(midEnter));
});

test("motion-state: a leave mid-transition element settles to display:none, not to no style", () => {
  const hidden = node("ant-upload ant-upload-select ant-upload-select-picture-card", "display: none;");
  const midLeave = node("ant-upload ant-upload-select ant-upload-select-picture-card ant-upload-animate-inline-leave ant-upload-animate-inline-leave-active", "height: 104px;");
  assert.equal(html(hidden), html(midLeave));
  const visible = node("ant-upload ant-upload-select ant-upload-select-picture-card");
  assert.notEqual(html(visible), html(midLeave));
});

test("motion-state: an empty style is still treated as no style when there is no motion class at all", () => {
  assert.equal(html(node("ant-upload-list-item-name")), html(node("ant-upload-list-item-name", "")));
});

test("motion-state: unrelated classes and the rest of the element are still compared", () => {
  assert.notEqual(html(node("ant-upload-select-picture-card", "display: block;")), html(node("ant-upload-select-picture-card", "display: none;")));
});
