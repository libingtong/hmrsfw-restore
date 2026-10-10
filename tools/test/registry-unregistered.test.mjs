// node --test tools/test/registry-unregistered.test.mjs
// unregisteredComponents() (tools/registry.mjs) on the real legacy-dist: names the original resolves by name with nothing
// registering them (HM-50: uc 403/404 `el-button`, home/homeZzgj `tooltip`), and nothing that a global registration,
// a plugin pattern or a Vue built-in covers.
import { test } from "node:test";
import assert from "node:assert/strict";
import { unregisteredComponents, loadRegistry } from "../registry.mjs";
import { hamiScope } from "../scope.mjs";

test("uc: el-button and tooltip are listed for exactly the chunks that resolve them", () => {
  const reg = loadRegistry("uc");
  const out = unregisteredComponents("usercenter", hamiScope("usercenter").all, reg.vue, reg.globals);
  assert.deepEqual(out["el-button"], ["403.1751615607545.js", "404.1751615607545.js"]);
  assert.deepEqual(out.tooltip, ["home.17516156075453.js", "homeZzgj.1751615607545.js"]);
  for (const n of Object.keys(out)) {
    assert.ok(!reg.globals.components.includes(n), `${n} is registered globally`);
    assert.ok(!reg.globals.componentPatterns.some((p) => new RegExp(p).test(n)), `${n} matches a plugin pattern`);
  }
});

test("a name becomes registered → it leaves the list", () => {
  const reg = loadRegistry("uc");
  const globals = { ...reg.globals, components: [...reg.globals.components, "ElButton"] }; // Vue's resolveAsset: el-button → ElButton
  const out = unregisteredComponents("usercenter", ["403.1751615607545.js", "home.17516156075453.js"], reg.vue, globals);
  assert.deepEqual(out, { tooltip: ["home.17516156075453.js"] });
});
