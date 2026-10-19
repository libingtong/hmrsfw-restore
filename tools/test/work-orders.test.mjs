// node --test tools/test/work-orders.test.mjs
// buildMaps() (tools/work-orders.mjs) on the real legacy-dist chunks: a sibling view imported with a default binding
// (`import Re,{__tla as Ve}from"./passwordModal….js"`, HM-46) lands in maps.views, a default import of an npm module
// (`import Ut from"./html2canvas.esm….js"`) resolves through the registry modules, and named imports are unchanged.
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildMaps } from "../work-orders.mjs";
import { loadRegistry } from "../registry.mjs";

test("default import of a sibling view → maps.views with the view's order", () => {
  const byChunk = new Map([["portal/passwordModal.1783320636200.js", { id: "page.portal.answer.passwordModal", target: "apps/portal/src/views/answer/passwordModal.vue" }]]);
  const maps = buildMaps("portal", "index.178332063620016.js", loadRegistry("portal"), byChunk);
  assert.deepEqual(maps.views.Re, { original: "passwordModal.1783320636200.js#default", path: "@/views/answer/passwordModal.vue", export: "default", order: "page.portal.answer.passwordModal" });
  assert.ok(!Object.keys(maps.views).includes("Ve") && !Object.values(maps).some((v) => v && typeof v === "object" && "__tla" in v), "__tla is never a binding");
  assert.ok(Object.keys(maps.entry).length > 0, "named imports from the entry still mapped");
});

test("default import of a sibling view without an order → reported missing", () => {
  const maps = buildMaps("portal", "index.178332063620016.js", loadRegistry("portal"), new Map());
  assert.equal(maps.views.Re.missing, true);
  assert.ok(maps.missing.includes("view:passwordModal.1783320636200.js"));
});

test("default import without named bindings (`import X from`) resolves through registry modules", () => {
  const maps = buildMaps("portal", "resumeAnalysisReport.1783320636200.js", loadRegistry("portal"), new Map());
  assert.equal(maps.modules.Ut?.original, "html2canvas.esm.1783320636200.js#default");
  assert.ok(!maps.missing.some((m) => m.includes("html2canvas")), JSON.stringify(maps.missing));
});

test("imports are read from the AST: default, default + named (__tla), namespace, named, bare", async () => {
  const { relativeImports } = await import("../work-orders.mjs");
  const src = 'import W,{__tla as t,a as b}from"./titles.js";import X from"./x.js";import*as N from"./n.js";import{c}from"./c.js";import"./side.js";import d from"vue";const s=\'import Z from"./in-string.js"\';';
  assert.deepEqual(relativeImports(src), [
    { from: "titles.js", specs: [["default", "W"], ["__tla", "t"], ["a", "b"]] },
    { from: "x.js", specs: [["default", "X"]] },
    { from: "n.js", specs: [["*", "N"]] },
    { from: "c.js", specs: [["c", "c"]] },
    { from: "side.js", specs: [] },
  ]);
});

test("every sibling view a chunk imports is in maps.views and deps.views once its order exists; the default binding is `default`", () => {
  const byChunk = new Map([["portal/passwordModal.1783320636200.js", { id: "page.portal.answer.passwordModal", target: "apps/portal/src/views/answer/passwordModal.vue" }]]);
  const maps = buildMaps("portal", "index.178332063620016.js", loadRegistry("portal"), byChunk);
  assert.ok(!maps.missing.some((m) => m.startsWith("view:passwordModal")), JSON.stringify(maps.missing));
  assert.ok(Object.values(maps.views).some((v) => v.order === "page.portal.answer.passwordModal" && v.export === "default"));
});

test("a chunk whose import has no registry entry is `missing`, the order is not dispatchable, and its segments inherit that", async () => {
  const { isDispatchable } = await import("../lib/workorders.mjs");
  const maps = buildMaps("portal", "index.178332063620016.js", loadRegistry("portal"), new Map());
  assert.ok(maps.missing.length > 0);
  assert.equal(isDispatchable({ id: "page.x", missing: maps.missing }), false);
  assert.equal(isDispatchable({ id: "page.y" }), true);
  assert.equal(isDispatchable({ id: "page.z", missing: [] }), true);
});

test("recordPath overrides extend the derived path of a recordVia page and need evidence (HM-949)", async () => {
  const { applyRecordPathOverrides } = await import("../work-orders.mjs");
  const orders = () => [{ id: "page.portal.sjz.fair.outFair.list", recordPath: "/fairList", recordVia: "page.portal.sjz.fair.fairList" }];
  assert.equal(applyRecordPathOverrides(orders(), { _source: "x", "page.portal.sjz.fair.outFair.list": { recordPath: "/fairList?type=30", evidence: "chunk:1" } })[0].recordPath, "/fairList?type=30");
  assert.throws(() => applyRecordPathOverrides(orders(), { "page.portal.sjz.fair.outFair.list": { recordPath: "/talents/fairList?type=30", evidence: "chunk:1" } }), /does not extend/);
  assert.throws(() => applyRecordPathOverrides(orders(), { "page.portal.sjz.fair.outFair.list": { recordPath: "/fairListX", evidence: "chunk:1" } }), /does not extend/);
  assert.throws(() => applyRecordPathOverrides(orders(), { "page.portal.sjz.fair.outFair.list": { recordPath: "/fairList?type=30" } }), /no evidence/);
  assert.equal(applyRecordPathOverrides(orders(), { "page.other": { recordPath: "/x?y", evidence: "e" } })[0].recordPath, "/fairList", "orders not in this run are skipped");
});

test("the checked-in overrides are what queue/ holds", async () => {
  const { readFileSync } = await import("node:fs");
  const overrides = JSON.parse(readFileSync(new URL("../record-path-overrides.json", import.meta.url), "utf8"));
  for (const [id, ov] of Object.entries(overrides)) {
    if (id.startsWith("_")) continue;
    assert.equal(JSON.parse(readFileSync(new URL(`../../queue/${id}.json`, import.meta.url), "utf8")).recordPath, ov.recordPath, id);
  }
});
