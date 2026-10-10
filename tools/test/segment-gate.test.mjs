// node --test tools/test/segment-gate.test.mjs
// The static self-check of segment orders (HM-49) on the real work orders and legacy-dist chunks:
//   - check-components: a non-assembling segment needs the page target only when it holds the page's main component;
//   - segments: a component's region starts where the previous definition ends, so its _withScopeId wrapper and hoisted
//     static vnodes are its own; a script part restores no render calls, a template part also owns the hoisted code.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { checkComponents } from "../check-components.mjs";
import { loadOrder, loadJson, originalNameOf, renderFacts } from "../sfc-util.mjs";
import { componentRegions, segmentPlan } from "../segments.mjs";
import { chunkSource } from "../scope.mjs";

const SFC = "<template>\n  <div />\n</template>\n";
function app(files) {
  const dir = mkdtempSync(path.join(tmpdir(), "seg-gate-"));
  for (const f of files) { mkdirSync(path.dirname(path.join(dir, f)), { recursive: true }); writeFileSync(path.join(dir, f), SFC); }
  return dir;
}

test("check-components: a segment without the page's main component does not need the target", () => {
  const seg = loadOrder("seg.uc.zcyzCorpAttestationapprove.1"); // BusinessModal; the main component is in segments 2–3
  const dir = app(seg.outputs);
  try { assert.deepEqual(checkComponents(seg, dir, { files: seg.outputs.map((f) => path.join(dir, f)) }).failed, []); } finally { rmSync(dir, { recursive: true }); }
});

test("check-components: target still required for the assembling segment and for a segment holding the main component", () => {
  const dir = app([]);
  try {
    const last = loadOrder("seg.uc.zcyzCorpAttestationapprove.3");
    assert.ok(checkComponents(last, dir, { files: [] }).failed.some((f) => f.where === last.target));
    const seg = loadOrder("seg.uc.zcyzCorpAttestationapprove.1");
    const withMain = { ...seg, components: [...seg.components, { name: "zcyzCorpAttestationapprove" }] };
    assert.ok(checkComponents(withMain, dir, { files: [] }).failed.some((f) => f.where === seg.target));
  } finally { rmSync(dir, { recursive: true }); }
});

test("segments: hoisted code before a definition belongs to that component (positionPosting, approve)", () => {
  const src = chunkSource("usercenter", "index.175161560754523.js");
  const r = componentRegions("usercenter", "index.175161560754523.js");
  const add = r.find((x) => x.name === "workPositionAddOrEditModel"), prev = r[r.indexOf(add) - 1];
  assert.ok(src.slice(add.start, add.def).includes('fe("data-v-4378db7d")'), "the _withScopeId wrapper of workPositionAddOrEditModel");
  assert.ok(!src.slice(prev.start, prev.end).includes('fe("data-v-4378db7d")'));
  for (let i = 1; i < r.length; i++) assert.equal(r[i].start, r[i - 1].end, "regions are contiguous");
  const approve = segmentPlan("usercenter", "zcyzCorpAttestationapprove.1751615607545.js", loadOrder("page.uc.zcyzCorpAttestationapprove").kb);
  const parts = approve.flatMap((s) => s.parts.map((p) => ({ ...p, seg: s })));
  const main = componentRegions("usercenter", "zcyzCorpAttestationapprove.1751615607545.js").at(-1);
  assert.deepEqual(parts.find((p) => p.part === "script").seg.factRanges, [], "a script-only segment checks no render calls");
  assert.deepEqual(parts.find((p) => p.part === "template").seg.factRanges[0], [main.start, main.def], "the template part owns the hoisted vnodes");
});

test("text-nodes original side: hoisted texts are counted for the segment that restores their component", () => {
  const texts = (id) => { const o = loadOrder(id); return renderFacts(chunkSource(o.site, o.sourceChunk.split("/").pop()), originalNameOf(loadJson(o.maps).vue), { range: o.factRanges }).texts; };
  const s1 = texts("seg.uc.gongfuWorkshop.positionPosting.1"), s2 = texts("seg.uc.gongfuWorkshop.positionPosting.2");
  assert.ok(!s1.includes("元/月") && s2.filter((t) => t === "元/月").length === 2, "元/月 is workPositionAddOrEditModel's (segment 2)");
  assert.ok(!texts("seg.uc.collage.studentApply.1").includes("就业协议合同"), "the main component's hoisted texts are not segment 1's");
  assert.deepEqual(texts("seg.uc.zcyzCorpAttestationapprove.2"), [], "script part: no template texts");
});
