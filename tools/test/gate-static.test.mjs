// node --test tools/test/gate-static.test.mjs
// The gate's static stage fails whenever self-check.mjs does not report a clean pass — including when self-check
// itself could not run (exit 2, `error`, pass:false with no items), which used to be read as "no failures" (HM-4 review).
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { ownerOf, selfCheckVerdict, staticStage } from "../gate/static.mjs";
import { loadWorkOrder, missingCryptoEnv } from "../gate/common.mjs";

const v = (code, out, crash) => selfCheckVerdict({ code, stdout: typeof out === "string" ? out : JSON.stringify(out, null, 1), crash }, "c01");
const failsWith = (r, re) => { assert.equal(r.length, 1); assert.equal(r[0].check, "self-check"); assert.equal(r[0].where, "c01"); assert.match(r[0].hint, re); };

test("clean pass (pretty-printed, as self-check.mjs prints it) → no failures; warn items ignored", () => {
  assert.deepEqual(v(0, { pass: true, failed: [] }), []);
  assert.deepEqual(v(0, { pass: true, failed: [{ check: "copied", where: "a.png", severity: "warn", hint: "…" }] }), []);
});

test("real failures are passed through, warn items dropped", () => {
  const r = v(1, { pass: false, failed: [{ check: "text-nodes", where: "x.vue:3", hint: "h" }, { check: "copied", severity: "warn", where: "a", hint: "w" }] });
  assert.deepEqual(r, [{ check: "text-nodes", where: "x.vue:3", hint: "h" }]);
});

test("self-check could not run: {pass:false, error, failed:[]} with exit 2 → fails", () => {
  failsWith(v(2, { pass: false, error: "work order not found: queue/c01.json", failed: [] }), /could not run: work order not found/);
});

test("error field or exit 2 alone → fails", () => {
  failsWith(v(1, { pass: false, error: "boom", failed: [] }), /could not run: boom/);
  failsWith(v(2, { pass: true, failed: [] }), /could not run: exit 2/);
});

test("pass:false without failure items → fails", () => {
  failsWith(v(1, { pass: false, failed: [] }), /without failure items/);
  failsWith(v(1, { pass: false }), /without failure items/);
});

test("inconsistent output, no JSON, crash → fails", () => {
  failsWith(v(1, { pass: true, failed: [] }), /inconsistent/);
  failsWith(v(0, { pass: false, failed: [{ check: "x", where: "y", hint: "z" }] }), /inconsistent/);
  failsWith(v(0, { failed: [] }), /inconsistent/);
  failsWith(v(1, "Error: Cannot find module"), /no JSON \(exit 1\)/);
  failsWith(v(null, "", "spawn ENOENT"), /crashed: spawn ENOENT/);
});

test("staticStage runs the script and fails the page when self-check exits 2", async () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), "gate-static-"));
  try {
    const script = (name, body) => { const f = path.join(dir, name); writeFileSync(f, body); return f; };
    const broken = script("broken.mjs", `console.log(JSON.stringify({ pass: false, error: "work order not found: queue/" + process.argv[2] + ".json", failed: [] })); process.exit(2);\n`);
    const ok = script("ok.mjs", `console.log(JSON.stringify({ pass: true, failed: [], id: process.argv[2] }, null, 1));\n`);
    const crash = script("crash.mjs", `throw new Error("boom");\n`);
    const wos = [{ id: "c01" }];
    let r = await staticStage({ wos, appDir: dir, mode: "page", selfCheckScript: broken });
    assert.equal(r.failed.c01.length, 1);
    assert.match(r.failed.c01[0].hint, /could not run: work order not found: queue\/c01\.json/);
    r = await staticStage({ wos, appDir: dir, mode: "page", selfCheckScript: crash });
    assert.equal(r.failed.c01.length, 1);
    r = await staticStage({ wos, appDir: dir, mode: "page", selfCheckScript: path.join(dir, "missing.mjs") });
    assert.equal(r.failed.c01.length, 1);
    r = await staticStage({ wos, appDir: dir, mode: "page", selfCheckScript: ok });
    assert.deepEqual(r.failed.c01, []);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

// HM-9 integration run: what the gate needs besides the page itself.
test("POC pages are self-checked under their queue/ id (same source chunk)", () => {
  const wo = loadWorkOrder("c01");
  assert.equal(wo.id, "c01");
  assert.equal(wo.queueId, "page.portal.BeOnProbation.ProbationHome");
  assert.equal(loadWorkOrder("page.uc.signUp").queueId, "page.uc.signUp");
});

test("staticStage passes the queue id to self-check, results stay under the gate's id", async () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), "gate-static-"));
  try {
    const f = path.join(dir, "echo.mjs");
    writeFileSync(f, `const id = process.argv[2]; console.log(JSON.stringify(id === "page.x" ? { pass: true, failed: [] } : { pass: false, error: "work order not found: queue/" + id + ".json", failed: [] })); process.exit(id === "page.x" ? 0 : 2);\n`);
    const r = await staticStage({ wos: [{ id: "c99", queueId: "page.x" }], appDir: dir, mode: "page", selfCheckScript: f });
    assert.deepEqual(r.failed.c99, []);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("missing crypto keys are reported by name: environment first, then .env.local / .env in the app root", () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), "gate-env-"));
  try {
    assert.deepEqual(missingCryptoEnv(dir, {}), ["VITE_HMRSFW_SM2_PUBLIC_KEY", "VITE_HMRSFW_SM4_KEY"]);
    assert.deepEqual(missingCryptoEnv(dir, { VITE_HMRSFW_SM4_KEY: "k" }), ["VITE_HMRSFW_SM2_PUBLIC_KEY"]);
    writeFileSync(path.join(dir, ".env.local"), "VITE_HMRSFW_SM2_PUBLIC_KEY=pk\nVITE_HMRSFW_SM4_KEY=\n");
    assert.deepEqual(missingCryptoEnv(dir, {}), ["VITE_HMRSFW_SM4_KEY"], "an empty value counts as missing");
    assert.deepEqual(missingCryptoEnv(dir, { VITE_HMRSFW_SM4_KEY: "k" }), []);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("integration: app-wide failures are attributed to a layer and, where an order owns the file, to that order", () => {
  assert.deepEqual(ownerOf("apps/uc/src/shared/corporganic.vue"), { layer: "shared", owner: "shared.uc.corporganic" });
  assert.deepEqual(ownerOf("apps/portal/src/shared/dateUtil.ts"), { layer: "shared", owner: "shared.portal.modules" });
  assert.deepEqual(ownerOf("apps/uc/src/views/userFairs/x.vue"), { layer: "page", owner: "page.uc.userFairs" });
  assert.deepEqual(ownerOf("apps/uc/src/api/api-56.ts"), { layer: "api" });
  assert.deepEqual(ownerOf("apps/portal/public/config.js"), { layer: "shell" });
  assert.equal(ownerOf("apps/portal/src/legacy/components/HeadNav.vue").layer, "entry");
});
