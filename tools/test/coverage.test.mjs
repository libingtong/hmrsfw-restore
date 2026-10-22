// node --test tools/test/coverage.test.mjs
// Coverage maths (tools/gate/coverage.mjs) on hand-made V8 data, the hints for an uncovered modal, and the threshold /
// summary / data-request helpers (tools/coverage.mjs). No browser, no network.
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildCoverage, measure, paintScript, pickScripts, scriptName, uncoveredStretches, unitePainted } from "../gate/coverage.mjs";
import { dataRequests, evaluate, summary } from "../coverage.mjs";

// A page chunk in the shape the build produces: a setup() with two handlers and a modal that only opens on click.
const SOURCE = [
  'const a=1;function open(){visible=!0;track("\\u6253\\u5f00")}',
  'export default {setup(){return()=>h("div",null,[h(M,{visible:v,onOk:save,onCancel:close,title:"\\u7f16\\u8f91\\u8d44\\u6599"},{footer:()=>[h("span","\\u4fdd\\u5b58\\u4fe1\\u606f")]}),h(B,{onClick:open})])}}',
].join("\n");
const at = (needle) => SOURCE.indexOf(needle);
const range = (needle, count, len = needle.length) => ({ startOffset: at(needle), endOffset: at(needle) + len, count });
// Script top-level (whole file, ran), open() never called, the modal props object's footer slot never rendered.
const FOOTER = '()=>[h("span","\\u4fdd\\u5b58\\u4fe1\\u606f")]';
const entry = (extra = []) => ({
  url: "http://127.0.0.1:1/assets/Page.1.js", source: SOURCE,
  functions: [
    { functionName: "", isBlockCoverage: true, ranges: [{ startOffset: 0, endOffset: SOURCE.length, count: 1 }] },
    { functionName: "open", isBlockCoverage: true, ranges: [range("function open(){visible=!0;track(\"\\u6253\\u5f00\")}", 0)] },
    { functionName: "setup", isBlockCoverage: true, ranges: [range("setup(){return()=>h(\"div\"", 1, SOURCE.length - at("setup(){return()=>h(\"div\"") - 2)] },
    { functionName: "", isBlockCoverage: true, ranges: [range(FOOTER, 0)] },
    ...extra,
  ],
});

test("function and block coverage count what ran; the top-level function is not counted", () => {
  const m = measure(SOURCE, paintScript(entry()));
  assert.equal(m.function.total, 3);
  assert.equal(m.function.covered, 1);
  assert.ok(m.block.pct > 0 && m.block.pct < 100);
  assert.equal(m.block.chars, [...SOURCE].filter((c) => !/\s/.test(c)).length);
});

test("a nested block that ran inside an uncovered function wins over its parent; a never-run block inside a run function shows", () => {
  const inner = { functionName: "", isBlockCoverage: true, ranges: [range('track("\\u6253\\u5f00")', 1)] };
  const p = paintScript(entry([inner]));
  assert.equal(p.covered[at("track(")], 1);
  assert.equal(p.covered[at("visible=!0")], 0);
  assert.equal(p.covered[at("h(B,")], 1);
  assert.equal(p.covered[at("h(\"span\"")], 0);
});

test("uncovered stretches are merged across a comma and carry readable hints; the Chinese text is un-escaped", () => {
  const cov = buildCoverage({ pageChunk: "Page.1.js", runs: [[entry()]] });
  const modal = cov.uncovered.find((u) => u.texts.includes("保存信息"));
  assert.ok(modal, JSON.stringify(cov.uncovered.map((u) => u.texts)));
  assert.ok(modal.context.includes("modal"), "footer slot of a component with onOk/onCancel is a modal context");
  assert.ok(modal.context.includes("slot:footer"));
  assert.equal(modal.needs, "interaction");
  assert.equal(modal.chunk, "Page.1.js");
  const stretches = uncoveredStretches(SOURCE, paintScript(entry()));
  assert.ok(stretches.every((s) => s.start < s.end && s.chars >= 12));
});

test("two runs are united; a click in run 2 raises the number and run 1 alone stays lower", () => {
  const ranOpen = entry();
  ranOpen.functions[1].ranges[0].count = 1;
  const one = buildCoverage({ pageChunk: "Page.1.js", runs: [[entry()]] });
  const two = buildCoverage({ pageChunk: "Page.1.js", runs: [[entry()], [ranOpen]] });
  assert.ok(two.page.function.pct > one.page.function.pct);
  assert.ok(two.page.block.pct > one.page.block.pct);
  assert.equal(two.stable, false, "the two replays disagree");
  assert.equal(buildCoverage({ pageChunk: "Page.1.js", runs: [[entry()], [entry()]] }).stable, true);
  assert.deepEqual(unitePainted([paintScript(entry()), paintScript(ranOpen)]).fns.filter((f) => f.name === "open").map((f) => f.covered), [true]);
});

test("shared chunks are listed separately and a chunk that never loaded is reported as such", () => {
  const sh = { ...entry(), url: "http://127.0.0.1:1/assets/Shared.1.js" };
  const cov = buildCoverage({ pageChunk: "Page.1.js", sharedChunks: ["Shared.1.js", "Missing.1.js"], runs: [[entry(), sh]] });
  assert.equal(cov.shared.length, 2);
  assert.equal(cov.shared[0].loaded, true);
  assert.equal(cov.shared[1].loaded, false);
  assert.ok(cov.uncovered.some((u) => u.role === "shared"));
  assert.deepEqual(pickScripts([entry(), sh, { url: "http://x/assets/index.js", source: "", functions: [] }], ["Page.1.js"]).map((e) => scriptName(e.url)), ["Page.1.js"]);
});

test("thresholds, summary and data requests", () => {
  const cov = (wo, f, b, needs = "data", stable = true) => ({ wo, site: "portal", recordPath: "/" + wo, role: "general", steps: 0, stable, page: { loaded: true, function: { pct: f }, block: { pct: b } }, shared: [], uncovered: [{ role: "page", start: 1, end: 99, chars: 98, needs, context: [], events: [], texts: ["暂无数据"], line: 1, col: 1, source: "?(n(),d(\"div\"))" }] });
  const th = { minFunction: 50, minBlock: 50, requireStable: true };
  assert.equal(evaluate(cov("a", 60, 60), th).below, false);
  assert.deepEqual(evaluate(cov("b", 40, 60), th).reasons, ["function 40% < 50%"]);
  assert.equal(evaluate(cov("c", 60, 60, "data", false), th).below, true);
  assert.equal(evaluate({ page: { loaded: false } }, th).below, true);
  assert.equal(evaluate(cov("a", 1, 1), null).below, false);
  const all = [cov("a", 60, 60), cov("b", 40, 30), cov("c", 30, 30, "interaction")];
  const s = summary(all, th);
  assert.equal(s.pages, 3);
  assert.equal(s.belowThreshold, 2);
  assert.equal(s.function.median, 40);
  const req = dataRequests(all, th);
  assert.deepEqual(req.map((r) => r.wo), ["b"], "only below-threshold pages with data-shaped gaps, interaction gaps are the recorder's");
});
