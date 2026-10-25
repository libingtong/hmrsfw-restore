// node --test tools/test/gate-static-image-baseline.test.mjs
// HM-1460: a baseline recorded before har.mjs's static-image fallback existed (HM-1417) or before it was fixed to be
// transparent (this change) painted a /common/static/ <img> outside the HAR as 0×0 (decode failure) at record time.
// A fresh replay today paints it as a real, non-zero box regardless of the fallback's color, so baselineFor must treat
// such a baseline as stale and recompute it from the same HAR — otherwise the mismatch only shows up as a pixel-diff
// failure against a baseline nobody noticed was wrong (HM-407).
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { baselineFor } from "../gate.mjs";
import { sha256 } from "../gate/har.mjs";

const WO = { id: "page.test.hm1460.static-img", site: "portal" };
const SEL = "main > *";

function harFixture(dir, entries) {
  const file = path.join(dir, "p.har");
  const body = JSON.stringify({ log: { entries } });
  writeFileSync(file, body);
  return { path: file, sha256: sha256(Buffer.from(body)) };
}

const imgTree = (src) => ({ t: "div", a: [], c: [{ t: "img", a: [["src", src]], c: [] }] });
const entry = (url) => ({ request: { method: "GET", url }, response: { status: 200, headers: [], content: {} } });

function writeBaseline(dir, { har, tree, staticImageOk }) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, "baseline.json"), JSON.stringify({
    har, sel: SEL, paintedBox: true, canvasBoxes: true, ...(staticImageOk ? { staticImageOk: true } : {}),
    runs: [{ load: { candidates: [{ tree }] } }],
  }));
}

test("baselineFor: a static-image <img> this baseline's HAR never recorded forces a refresh", async () => {
  const state = mkdtempSync(path.join(tmpdir(), "hm1460-state-"));
  try {
    const har = harFixture(state, []); // nothing recorded: the image is a gap
    writeBaseline(path.join(state, "baseline", WO.id), {
      har, tree: imgTree("/xf-api/jeecg-system/sys/common/static/temp/x.jpg"),
    });
    const r = await baselineFor(WO, state);
    assert.equal(r.missing, "static-image fallback changed since the baseline (HM-1417/HM-1460)");
    assert.equal(r.refresh, har.path);
  } finally { rmSync(state, { recursive: true, force: true }); }
});

test("baselineFor: the same image present in the HAR is not a gap", async () => {
  const state = mkdtempSync(path.join(tmpdir(), "hm1460-state-"));
  try {
    const har = harFixture(state, [entry("http://__ORIGIN__/xf-api/jeecg-system/sys/common/static/temp/x.jpg")]);
    writeBaseline(path.join(state, "baseline", WO.id), {
      har, tree: imgTree("/xf-api/jeecg-system/sys/common/static/temp/x.jpg"),
    });
    const r = await baselineFor(WO, state);
    assert.equal(r.missing, undefined);
  } finally { rmSync(state, { recursive: true, force: true }); }
});

test("baselineFor: a page with no static image is unaffected", async () => {
  const state = mkdtempSync(path.join(tmpdir(), "hm1460-state-"));
  try {
    const har = harFixture(state, []);
    writeBaseline(path.join(state, "baseline", WO.id), { har, tree: { t: "div", a: [], c: [] } });
    const r = await baselineFor(WO, state);
    assert.equal(r.missing, undefined);
  } finally { rmSync(state, { recursive: true, force: true }); }
});

test("baselineFor: staticImageOk (recorded after the fix) skips the check even with a gap", async () => {
  const state = mkdtempSync(path.join(tmpdir(), "hm1460-state-"));
  try {
    const har = harFixture(state, []);
    writeBaseline(path.join(state, "baseline", WO.id), {
      har, tree: imgTree("/xf-api/jeecg-system/sys/common/static/temp/x.jpg"), staticImageOk: true,
    });
    const r = await baselineFor(WO, state);
    assert.equal(r.missing, undefined);
  } finally { rmSync(state, { recursive: true, force: true }); }
});
