// node --test tools/test/segment-gate.test.mjs
// The static self-check of segment orders (HM-49) on the real work orders and legacy-dist chunks:
//   - check-components: a non-assembling segment needs the page target only when it holds the page's main component.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { checkComponents } from "../check-components.mjs";
import { loadOrder } from "../sfc-util.mjs";

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
