// node --test tools/test/compare-rules-tinymce-id.test.mjs
// tinymce-generated-id (HM-1021): TinyMCE / tinymce-vue ids are prefix_<random><counter><ms timestamp>, different on
// every run; only the digits are normalised, the prefix, the attribute and the element are still compared.
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { ROOT } from "../gate/common.mjs";
import { loadRules, normHtml } from "../gate/rules.mjs";

const rules = loadRules(path.join(ROOT, "rules/compare"));
const el = (t, a, c = []) => ({ t, a, c });
const html = (tag, attrs) => normHtml({ tree: el("div", [["class", "box"]], [el(tag, attrs, ["x"])]), ltgt: true }, rules);

test("tinymce-generated-id: the generated digits are not compared", () => {
  assert.ok(rules.ids.includes("tinymce-generated-id"));
  assert.equal(html("textarea", [["id", "tiny-vue_59372511411761057665123"]]), html("textarea", [["id", "tiny-vue_8121876511761057661234"]]));
  assert.equal(html("div", [["aria-describedby", "aria_4810267132411761057667001"]]), html("div", [["aria-describedby", "aria_10293847512411761057662002"]]));
  assert.equal(html("span", [["id", "aria_4810267132411761057667001"]]), html("span", [["id", "aria_10293847512411761057662002"]]));
  assert.equal(html("iframe", [["id", "tiny-vue_63170753621792593721576_ifr"]]), html("iframe", [["id", "tiny-vue_91543771021792593683715_ifr"]])); // the edit area
  assert.notEqual(html("iframe", [["id", "tiny-vue_63170753621792593721576_ifr"]]), html("iframe", [["id", "tiny-vue_91543771021792593683715_xyz"]]));
});

test("tinymce-generated-id: prefix, attribute, element and short ids are still compared", () => {
  assert.notEqual(html("textarea", [["id", "tiny-vue_59372511411761057665123"]]), html("textarea", [["id", "editor_59372511411761057665123"]]));
  assert.notEqual(html("span", [["id", "aria_4810267132411761057667001"]]), html("span", [["data-id", "aria_4810267132411761057667001"]]));
  assert.notEqual(html("span", [["id", "aria_4810267132411761057667001"]]), html("div", [["id", "aria_4810267132411761057667001"]]));
  assert.notEqual(html("span", [["id", "aria_12"]]), html("span", [["id", "aria_13"]])); // not a generated id
  assert.notEqual(html("span", [["id", "xaria_4810267132411761057667001"]]), html("span", [["id", "xaria_10293847512411761057662002"]]));
});
