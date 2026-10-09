// node --test tools/test/gate-static.test.mjs
// The gate's static stage fails whenever self-check.mjs does not report a clean pass — including when self-check
// itself could not run (exit 2, `error`, pass:false with no items), which used to be read as "no failures" (HM-4 review).
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { selfCheckVerdict, staticStage } from "../gate/static.mjs";

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
