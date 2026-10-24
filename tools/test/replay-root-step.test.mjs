// node --test tools/test/replay-root-step.test.mjs
// Root step (HM-1294). A component that only mounts after an interaction (page.portal.fair.signModal: the modal opened
// by 「报名参会」; page.portal.answer.passwordModal: the password box of a protected questionnaire; the archivesSearch tab
// contents) has no root at load, so baseline.mjs stopped at "original page root not found". The script's step marked
// "root": true now runs before the root capture: the captured root is the open component, compared as the load root;
// requests keep their phases. Real browser, local fixture page, no HAR file.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright";
import { runPage } from "../gate/replay.mjs";
import { validate } from "../interact.mjs";
import { ROOT, scopeRootSel } from "../gate/common.mjs";
import { compareRuns } from "../gate/compare.mjs";
import { loadRules } from "../gate/rules.mjs";
import { serveStatic } from "../gate/serve.mjs";

// Parent page (scope P) with a list request at load; 「报名参会」 asks the server, then mounts the modal component (scope
// C, v-if); 「下一步」 inside it asks again; 「关闭」 unmounts it.
const PAGE = `<!doctype html><html><head><meta charset="utf-8"></head><body><main><div class="list" data-v-p><button id="open">报名参会</button></div></main><script>
fetch("/xf-api/fair/list");
document.getElementById("open").onclick = async () => {
  await fetch("/xf-api/fair/check");
  const m = document.createElement("div");
  m.className = "signModal"; m.setAttribute("data-v-c", ""); m.setAttribute("data-v-p", "");
  m.innerHTML = '<p data-v-c>报名信息</p><button data-v-c id="next">下一步</button><button data-v-c id="close">关闭</button>';
  document.querySelector(".list").appendChild(m);
  m.querySelector("#next").onclick = () => { fetch("/xf-api/fair/next"); m.querySelector("p").textContent = "第二步"; };
  m.querySelector("#close").onclick = () => m.remove();
};
</script></body></html>`;

let browser, tmp, n = 0;
const har = { byKey: new Map(), recordedAt: Date.parse("2026-10-01T00:00:00Z") };
async function run(steps) {
  const root = path.join(tmp, String(n++));
  mkdirSync(root, { recursive: true });
  writeFileSync(path.join(root, "index.html"), PAGE);
  const srv = await serveStatic(root);
  try { return await runPage(browser, { origin: srv.origin, url: "/", storage: { localStorage: {} }, har, sel: scopeRootSel("data-v-c"), steps, shotDir: root, tag: "shot", componentScope: "data-v-c" }); } finally { await srv.close(); }
}
const paths = (log) => log.map((x) => `${x.phase} ${x.path}`);

test.before(async () => { browser = await chromium.launch(); tmp = mkdtempSync(path.join(os.tmpdir(), "replay-root-step-")); });
test.after(async () => { await browser?.close(); rmSync(tmp, { recursive: true, force: true }); });

test("without a root step a modal component has no root at load (what baseline.mjs rejected)", { timeout: 90000 }, async () => {
  const r = await run([{ click: "报名参会", wait: 300 }]);
  assert.equal(r.load.candidates.length, 1);
  assert.equal(r.load.candidates[0].empty, true);
  assert.equal(r.load.afterStep, undefined);
  assert.equal(r.final.candidates[0].cls, "signModal"); // opened only by the steps, after the capture
});

test("root step: the root is the open modal, captured with its shot; later steps still compared as steps", { timeout: 90000 }, async () => {
  const r = await run([{ click: "报名参会", wait: 300, root: true }, { click: "下一步", wait: 300 }]);
  const c = r.load.candidates;
  assert.equal(c.length, 1);
  assert.equal(c[0].cls, "signModal");
  assert.ok(!c[0].empty && c[0].shot, "load root has a screenshot");
  assert.match(c[0].text, /报名信息/);
  assert.equal(r.load.afterStep, 0);
  // the load set is the page load's requests only; the opening click's request is in the step sequence
  assert.deepEqual(paths(r.load.requests), ["load /fair/list"]);
  assert.deepEqual(paths(r.stepLog), ["step0 /fair/check", "step1 /fair/next"]);
  assert.deepEqual(r.steps.map((s) => [s.i, s.err]), [[0, null], [1, null]]);
  assert.match(r.final.candidates[0].text, /第二步/);
});

test("root step after closing: no root, reported as such (the modal is v-if: do not close it before the root step)", { timeout: 90000 }, async () => {
  const r = await run([{ click: "报名参会", wait: 300 }, { click: "关闭", wait: 300, root: true }]);
  assert.equal(r.load.candidates[0].empty, true);
  assert.equal(r.load.afterStep, 1);
});

test("a script without a root step is captured as before", { timeout: 90000 }, async () => {
  const r = await run(null);
  assert.equal(r.steps, undefined);
  assert.equal(r.load.afterStep, undefined);
  assert.deepEqual(paths(r.load.requests), ["load /fair/list"]);
});

test("compareRuns: a root-step run against a root-step baseline of the same page passes on the usual checks", { timeout: 180000 }, async () => {
  const steps = [{ click: "报名参会", wait: 300, root: true }, { click: "下一步", wait: 300 }];
  const base = { runs: [await run(steps), await run(steps)], shell: { requests: [], toasts: [] } };
  const rest = await run(steps);
  const cmp = compareRuns(base, rest, { rules: loadRules(path.join(ROOT, "rules/compare")), site: "portal", restSel: scopeRootSel("data-v-c"), inParent: true });
  assert.deepEqual(cmp.failed, []);
  assert.ok(cmp.pixel !== null, "load shot compared");
  // the same page without the root step on the restored side: no load root there → fails, nothing waived
  const late = await run(steps.map(({ root, ...s }) => s));
  assert.ok(compareRuns(base, late, { rules: loadRules(path.join(ROOT, "rules/compare")), site: "portal", restSel: scopeRootSel("data-v-c"), inParent: true }).failed.length > 0);
});

test("validate: root is true on at most one action or wait step", () => {
  assert.deepEqual(validate([{ click: "报名参会", root: true }, { wait: 500 }]), []);
  assert.deepEqual(validate([{ wait: 800, root: true }]), []);
  assert.match(validate([{ root: true }]).join(";"), /no action and no wait/);
  assert.match(validate([{ click: "a", root: false }]).join(";"), /root must be true/);
  assert.match(validate([{ click: "a", root: true }, { click: "b", root: true }]).join(";"), /more than one root step/);
});
