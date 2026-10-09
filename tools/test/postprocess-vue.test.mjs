// node --test tools/test/postprocess-vue.test.mjs
// Without --assets-dir, postprocess-vue.mjs puts extracted files where css-by-scope.mjs does: the order's
// <subComponentDir>/assets (HM-24). Uses real queue/ orders inside a throwaway hmrsfw-vue-shaped directory.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pageAssetsDir, postprocessVue, writePostprocessed } from "../postprocess-vue.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const order = (id) => JSON.parse(readFileSync(path.join(ROOT, "queue", `${id}.json`), "utf8"));
const PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

function fakeApp() {
  const dir = mkdtempSync(path.join(os.tmpdir(), "pp-vue-"));
  writeFileSync(path.join(dir, "package.json"), JSON.stringify({ name: "hmrsfw-vue" }));
  return dir;
}

test("a page target uses its order's subComponentDir/assets", () => {
  const app = fakeApp();
  try {
    for (const id of ["page.portal.BeOnProbation.ProbationHome", "page.uc.Createaresume", "page.portal.Guidance.GuidanceMentorDetail.index"]) {
      const o = order(id);
      assert.equal(pageAssetsDir(path.join(app, o.target)), path.join(app, o.subComponentDir, "assets"), id);
    }
  } finally { rmSync(app, { recursive: true, force: true }); }
});

test("a file inside a subComponentDir uses that directory's assets, not its own", () => {
  const app = fakeApp(); const o = order("shared.portal.homeRight2");
  try { assert.equal(pageAssetsDir(path.join(app, o.subComponentDir, "Other.vue")), path.join(app, o.subComponentDir, "assets")); }
  finally { rmSync(app, { recursive: true, force: true }); }
});

test("a file of no order falls back to <dir>/<stem>/assets", () => {
  const app = fakeApp();
  try {
    assert.equal(pageAssetsDir(path.join(app, "apps/portal/src/views/zzNoOrder/Page.vue")), path.join(app, "apps/portal/src/views/zzNoOrder/Page/assets"));
    assert.equal(pageAssetsDir(path.join(os.tmpdir(), "loose", "A.vue")), path.join(os.tmpdir(), "loose", "A", "assets"));
  } finally { rmSync(app, { recursive: true, force: true }); }
});

test("default run writes the asset into subComponentDir/assets and imports it from there", () => {
  const app = fakeApp(); const o = order("page.uc.Createaresume"); const file = path.join(app, o.target);
  try {
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, `<template><img src="${PNG}"></template>\n<script setup>\nconst bg = "${PNG}";\n</script>\n`);
    const res = postprocessVue(file); const dir = pageAssetsDir(file);
    writePostprocessed(file, res, dir);
    const out = readFileSync(file, "utf8");
    assert.equal(readdirSync(path.join(app, o.subComponentDir, "assets")).length, 1);
    assert.match(out, /src="\.\/Createaresume\/assets\/Createaresume-[0-9a-f]{10}\.png"/);
    assert.match(out, /import Createaresume_?Asset1 from "\.\/Createaresume\/assets\/Createaresume-[0-9a-f]{10}\.png";/);
    assert.equal(postprocessVue(file).changed, false); // idempotent
  } finally { rmSync(app, { recursive: true, force: true }); }
});
