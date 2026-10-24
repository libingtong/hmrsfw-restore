// node --test tools/test/compare-rules-upload-progress-delay.test.mjs
// upload-progress-delay (HM-1363): a done upload's hidden (display:none) progress-bar wrapper — only rendered 300ms
// after the item mounts — compares equal to that wrapper being absent; a file that is actually uploading still differs.
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { ROOT } from "../gate/common.mjs";
import { loadRules, normHtml } from "../gate/rules.mjs";

const rules = loadRules(path.join(ROOT, "rules/compare"));
const el = (t, a, c = []) => ({ t, a, c });
const progress = (style) => el("div", [["class", "ant-upload-list-item-progress"], ...(style ? [["style", style]] : [])], ["进度条"]);
const item = (hasProgress, style) => ({
  tree: el("div", [["class", "ant-upload-list-item"]], [
    el("div", [["class", "ant-upload-list-item-info"]], ["file.png"]),
    ...(hasProgress ? [progress(style)] : []),
  ]),
  ltgt: true,
});
const html = (cap) => normHtml(cap, rules);

test("upload-progress-delay: a hidden progress wrapper compares equal to it being absent", () => {
  assert.ok(rules.ids.includes("upload-progress-delay"));
  assert.equal(html(item(false)), html(item(true, "display: none;")));
  assert.equal(html(item(true, "display: none;")), html(item(true, "display:none")));
});

test("upload-progress-delay: a visibly uploading progress wrapper still differs from absent", () => {
  assert.notEqual(html(item(false)), html(item(true, "display: block;")));
  assert.notEqual(html(item(false)), html(item(true, null)));
});

test("upload-progress-delay: unrelated elements and the rest of the item are still compared", () => {
  const info = (text) => ({ tree: el("div", [["class", "ant-upload-list-item"]], [el("div", [["class", "ant-upload-list-item-info"]], [text])]), ltgt: true });
  assert.notEqual(html(info("a.png")), html(info("b.png")));
  const other = (style) => ({ tree: el("div", [["class", "ant-upload-list-item-name"], ["style", style]]), ltgt: true });
  assert.notEqual(html(other("display: none;")), html(other("display: block;")));
});
