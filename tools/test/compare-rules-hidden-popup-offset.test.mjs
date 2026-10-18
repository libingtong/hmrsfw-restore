// node --test tools/test/compare-rules-hidden-popup-offset.test.mjs
// hidden-popup-offset (HM-292): a closed vc-trigger popup's inline left/top (set by dom-align while display:none, from the
// trigger's document position) are not compared; a visible popup's position and every other element still are.
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { ROOT } from "../gate/common.mjs";
import { loadRules, normHtml } from "../gate/rules.mjs";

const rules = loadRules(path.join(ROOT, "rules/compare"));
const el = (t, a, c = []) => ({ t, a, c });
const popup = (style, cls = "ant-select-dropdown ant-select-dropdown-placement-bottomLeft") => ({ tree: el("div", [["style", "position: absolute; top: 0px; left: 0px; width: 100%;"]], [el("div", [], [el("div", [["class", cls], ["style", style]], ["未开始"])])]), ltgt: true });
const html = (cap) => normHtml(cap, rules);

test("hidden-popup-offset: a closed popup's left/top are not compared (HM-292 gate values)", () => {
  assert.ok(rules.ids.includes("hidden-popup-offset"));
  assert.equal(html(popup("min-width: 220px; width: 220px; left: -529px; top: -293px; display: none;")), html(popup("min-width: 220px; width: 220px; left: -529px; top: -383px; display: none;")));
  assert.equal(html(popup("left: -439px; top: -655px; display: none;", "ant-tooltip ant-tooltip-placement-top")), html(popup("left: 10px; top: 20px; display: none;", "ant-tooltip ant-tooltip-placement-top")));
});

test("hidden-popup-offset: the rest of a closed popup's style is still compared", () => {
  assert.notEqual(html(popup("min-width: 220px; width: 220px; left: 0px; top: 0px; display: none;")), html(popup("min-width: 200px; width: 200px; left: 0px; top: 0px; display: none;")));
  assert.notEqual(html(popup("left: 0px; top: 0px; display: none;")), html(popup("left: 0px; top: 0px; display: none; z-index: 5;")));
});

test("hidden-popup-offset: visible popups, unplaced elements and the wrapper keep their position", () => {
  assert.notEqual(html(popup("min-width: 220px; width: 220px; left: 0px; top: 44px;")), html(popup("min-width: 220px; width: 220px; left: 0px; top: 134px;")));
  assert.notEqual(html(popup("left: 0px; top: 44px; display: block;")), html(popup("left: 0px; top: 134px; display: block;")));
  // no <prefix>-placement-<placement> class: not placed by vc-align (e.g. rc-virtual-list-scrollbar, Baidu map overlays)
  assert.notEqual(html(popup("left: 0px; top: 1px; display: none;", "rc-virtual-list-scrollbar")), html(popup("left: 0px; top: 2px; display: none;", "rc-virtual-list-scrollbar")));
  assert.notEqual(html(popup("left: 0px; top: 1px; display: none;", "ant-select-dropdown")), html(popup("left: 0px; top: 2px; display: none;", "ant-select-dropdown")));
  // only left/top: padding-left, margin-top and the like are compared
  assert.notEqual(html(popup("padding-left: 1px; margin-top: 1px; display: none;")), html(popup("padding-left: 2px; margin-top: 2px; display: none;")));
});
