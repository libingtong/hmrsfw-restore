// node --test tools/test/compare-rules-tabs-ink-bar-offset.test.mjs
// tabs-ink-bar-offset (HM-1363): the ink bar's inline left/top/right/width/height — set only once rc-tabs' ResizeObserver
// + raf chain has settled — are not compared; the active tab's own class and the rest of the tabs nav still are.
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { ROOT } from "../gate/common.mjs";
import { loadRules, normHtml } from "../gate/rules.mjs";

const rules = loadRules(path.join(ROOT, "rules/compare"));
const el = (t, a, c = []) => ({ t, a, c });
const tab = (label, active) => el("div", [["class", active ? "ant-tabs-tab ant-tabs-tab-active" : "ant-tabs-tab"]], [label]);
const nav = (inkStyle, activeIdx = 0) => ({
  tree: el("div", [["class", "ant-tabs-nav"]], [
    el("div", [["class", "ant-tabs-nav-list"]], [
      tab("单位基本信息", activeIdx === 0),
      tab("重要信息", activeIdx === 1),
      el("div", [["class", "ant-tabs-ink-bar ant-tabs-ink-bar-animated"], ...(inkStyle ? [["style", inkStyle]] : [])]),
    ]),
  ]),
  ltgt: true,
});
const html = (cap) => normHtml(cap, rules);

test("tabs-ink-bar-offset: an unsettled (no style) ink bar compares equal to a settled one", () => {
  assert.ok(rules.ids.includes("tabs-ink-bar-offset"));
  assert.equal(html(nav(null)), html(nav("left: 0px; width: 84px;")));
  assert.equal(html(nav("left: 0px; width: 84px;")), html(nav("left: 112px; width: 70px;")));
  assert.equal(html(nav("top: 0px; height: 40px;")), html(nav(null)));
});

test("tabs-ink-bar-offset: the active tab still differs when it should", () => {
  assert.notEqual(html(nav(null, 0)), html(nav(null, 1)));
  assert.notEqual(html(nav("left: 0px; width: 84px;", 0)), html(nav("left: 0px; width: 84px;", 1)));
});

test("tabs-ink-bar-offset: other declarations on the ink bar and unrelated elements are still compared", () => {
  const styled = (extra) => ({ tree: el("div", [["class", "ant-tabs-ink-bar ant-tabs-ink-bar-animated"], ["style", `left: 0px; width: 84px; ${extra}`]]), ltgt: true });
  assert.notEqual(html(styled("background: red;")), html(styled("background: blue;")));
  const more = (style) => ({ tree: el("div", [["class", "ant-tabs-nav-more"], ["style", style]]), ltgt: true });
  assert.notEqual(html(more("left: 1px;")), html(more("left: 2px;")));
});
