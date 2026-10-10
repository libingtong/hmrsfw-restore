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
