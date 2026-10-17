// node --test tools/test/compare-rules-carousel.test.mjs
// Normalisation rules for time-dependent state of carousels and charts (HM-652): only the stated part is normalised,
// everything next to it is still compared.
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { ROOT } from "../gate/common.mjs";
import { loadRules, normHtml } from "../gate/rules.mjs";

const rules = loadRules(path.join(ROOT, "rules/compare"));
const el = (t, a, c = []) => ({ t, a, c });
const track = (style, cls = "slick-track") => ({ tree: el("div", [["class", "slick-list"]], [el("div", [["class", cls], ["style", style]], [el("div", [["class", "slick-slide slick-active"], ["data-index", "0"]], ["x"])])]), ltgt: true });
const html = (cap) => normHtml(cap, rules);

test("slick-track-transition: a track caught mid-slide equals the same track at rest", () => {
  assert.ok(rules.ids.includes("slick-track-transition"));
  const rest = "width: 550px; opacity: 1; transform: translate3d(0px, 0px, 0px);";
  assert.equal(html(track(rest + " transition: -webkit-transform 500ms;")), html(track(rest)));
  assert.equal(html(track("transition: transform 500ms ease; width: 550px; opacity: 1; transform: translate3d(0px, 0px, 0px);")), html(track(rest)));
});

test("slick-track-transition: the track position, other styles and other elements are still compared", () => {
  const at = (x) => `width: 2900px; opacity: 1; transform: translate3d(${x}px, 0px, 0px); transition: -webkit-transform 500ms;`;
  assert.notEqual(html(track(at(-580))), html(track(at(-1160)))); // another slide is another slide
  assert.notEqual(html(track("width: 550px; opacity: 1;")), html(track("width: 580px; opacity: 1;")));
  // transition on any element that is not the slick track is kept (fade slides, page elements)
  assert.notEqual(html(track("opacity: 1; transition: opacity 500ms;", "slick-slide")), html(track("opacity: 1;", "slick-slide")));
  assert.notEqual(html(track("opacity: 1; transition: opacity 500ms;", "slick-track-x")), html(track("opacity: 1;", "slick-track-x")));
});

const chart = (attrs) => ({ tree: el("div", [["class", "box"]], [el("div", attrs, [el("canvas", [["width", "600"]])])]), ltgt: true });
test("echarts-instance-id: the per-run instance number is not compared; presence, element and the rest are", () => {
  assert.ok(rules.ids.includes("echarts-instance-id"));
  const st = ["style", "user-select: none;"];
  assert.equal(html(chart([["_echarts_instance_", "ec_1792144146926"], ["class", "setSize"], st])), html(chart([["_echarts_instance_", "ec_1792144143116"], ["class", "setSize"], st])));
  assert.notEqual(html(chart([["_echarts_instance_", "ec_1792144146926"], ["class", "setSize"], st])), html(chart([["class", "setSize"], st]))); // not initialised
  assert.notEqual(html(chart([["_echarts_instance_", "ec_1"], ["class", "setSize"], st])), html(chart([["_echarts_instance_", "ec_2"], ["class", "other"], st])));
  assert.notEqual(html(chart([["_echarts_instance_", "x1"], st])), html(chart([["_echarts_instance_", "x2"], st]))); // only the ec_<digits> form
});
