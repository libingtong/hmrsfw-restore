// node --test tools/test/record-via-root-after-steps.test.mjs
// A recordVia component its parent page mounts only after the interaction (HM-1293: page.portal.fair.signModal, which
// the web fair list renders under `v-if="signShow"`, set by the 报名参会 click). At load neither side has the
// component's root: captureRoot leaves its `empty` placeholder, whose shot is the parent page. The component is
// compared after the steps; any root at load on either side, or a missing root after the steps, still fails.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright";
import { ROOT, scopeRootSel } from "../gate/common.mjs";
import { loadRules } from "../gate/rules.mjs";
import { compareRuns, rootAfterSteps, rootlessLoad, unstableKeys } from "../gate/compare.mjs";
import { runPage } from "../gate/replay.mjs";
import { serveStatic } from "../gate/serve.mjs";

const rules = loadRules(path.join(ROOT, "rules/compare"));
const el = (t, a, c = []) => ({ t, a, c });
const cand = (cls, text) => ({ cls, tree: el("div", cls == null ? [] : [["class", cls]], [text]), ltgt: true, text });
// captureRoot's placeholder when `sel` matches nothing at load: a viewport shot (here a path that does not exist, so a
// comparison that reads it throws)
const none = () => ({ tree: null, ltgt: true, html: "", text: "", cls: null, shot: "/nonexistent/hm-1293/shot.png", empty: true });
const ov = { modals: [], toasts: [] };
const run = (load, final) => ({ load: { candidates: load, overlay: ov, requests: [] }, steps: [{ i: 0 }], stepLog: [], final: { candidates: final, overlay: ov } });
const modal = (text = "确认报名") => cand(null, text);
const cmp = (origRuns, rest, inParent = true) => compareRuns({ runs: origRuns, shell: { requests: [] } }, rest, { rules, site: "portal", restSel: "[data-v-484c8df1]:not([data-v-484c8df1] *)", inParent });
const fails = (r) => r.failed.map((f) => `${f.where}.${f.check}`).sort();
const orig = () => run([none()], [modal()]);

test("rootlessLoad / rootAfterSteps", () => {
  assert.equal(rootlessLoad(orig()), true);
  assert.equal(rootlessLoad(run([modal()], [modal()])), false);
  assert.equal(rootAfterSteps([orig(), orig()]), true);
  assert.equal(rootAfterSteps([orig(), run([none()], [])]), false); // one run without the root after the steps
  assert.equal(rootAfterSteps([orig(), run([modal()], [modal()])]), false); // one run with a root at load
  assert.equal(rootAfterSteps([]), false);
});

test("component mounted only after the steps on both sides: compared after the steps, no load shot", () => {
  const r = cmp([orig(), orig()], run([none()], [modal()]));
  assert.deepEqual(fails(r), []);
  assert.equal(r.pixel, null);
  // still compared after the steps
  assert.deepEqual(fails(cmp([orig(), orig()], run([none()], [modal("别的内容")]))), ["final.html", "final.text"]);
});

test("restored component missing after the steps: a render failure", () => {
  const r = cmp([orig(), orig()], run([none()], []));
  assert.ok(fails(r).includes("final.render"), fails(r).join(","));
  assert.match(r.failed.find((f) => f.check === "render").hint, /not found after the steps/);
});

test("a root at load on one side only is compared as before", () => {
  // restored mounts the component at load, the original does not
  assert.ok(fails(cmp([orig(), orig()], run([modal()], [modal()]))).some((f) => f.startsWith("load.")));
  assert.ok(fails(cmp([orig(), orig()], run([cand("other", "x")], [modal()]))).includes("load.root"));
  // the original mounts it at load, the restored side does not
  const o = () => run([modal()], [modal()]);
  assert.ok(fails(cmp([o(), o()], run([none()], [modal()]))).includes("load.render"));
});

test("an original run without the root after the steps: compared as before (load shot included)", () => {
  assert.throws(() => cmp([orig(), run([none()], [])], run([none()], [modal()])), /ENOENT|no such file/); // load shot compared as before
  const noShot = () => ({ ...none(), shot: null });
  const r = cmp([run([noShot()], [modal()]), run([noShot()], [])], run([noShot()], [modal()]));
  assert.deepEqual(fails(r), ["load.baseline", "load.render"]);
});

test("not a recordVia component: no root at load fails as before", () => {
  const noShot = () => ({ ...none(), shot: null });
  assert.deepEqual(fails(cmp([run([noShot()], [modal()]), run([noShot()], [modal()])], run([noShot()], [modal()]), false)), ["load.baseline", "load.render"]);
});

test("unstableKeys: two runs without the component at load compare no load shot", () => {
  const opts = { rules, site: "portal", shell: new Set(), shellToasts: [], inParent: true };
  assert.deepEqual(unstableKeys(orig(), orig(), opts), []);
  assert.deepEqual(unstableKeys(orig(), run([none()], [modal("x")]), opts).sort(), ["final.html", "final.text"]);
  assert.throws(() => unstableKeys(orig(), orig(), { ...opts, inParent: false }), /ENOENT|no such file/);
});

// Real browser, local fixture page, no HAR: the parent renders the component under v-if, opened by a click.
const SID = "data-v-484c8df1";
const page = (mountAtLoad) => `<!doctype html><html><head><meta charset="utf-8"></head><body><main><div class="list">网络招聘会<button id="b">报名参会</button></div></main><script>
const open = () => { const d = document.createElement("div"); d.setAttribute("${SID}", ""); d.innerHTML = '<div class="ant-modal-wrap" ${SID}><div class="ant-modal-content" ${SID}>确认报名</div></div>'; document.querySelector(".list").appendChild(d); };
document.getElementById("b").onclick = open;
${mountAtLoad ? "open();" : ""}
</script></body></html>`;

let browser, tmp;
const har = { byKey: new Map(), recordedAt: Date.parse("2026-10-01T00:00:00Z") };
async function replay(tag, mountAtLoad = false) {
  const root = path.join(tmp, tag);
  rmSync(root, { recursive: true, force: true });
  mkdirSync(root, { recursive: true });
  writeFileSync(path.join(root, "index.html"), page(mountAtLoad));
  const srv = await serveStatic(root);
  try { return await runPage(browser, { origin: srv.origin, url: "/", storage: { localStorage: {} }, har, sel: scopeRootSel(SID), steps: [{ click: "报名参会" }], shotDir: root, tag: "shot", componentScope: SID }); } finally { await srv.close(); }
}

test.before(async () => { browser = await chromium.launch(); tmp = mkdtempSync(path.join(os.tmpdir(), "record-via-after-steps-")); });
test.after(async () => { await browser?.close(); rmSync(tmp, { recursive: true, force: true }); });

test("browser: root only after the click on both sides passes; mounted at load on one side fails", { timeout: 120000 }, async () => {
  const a = await replay("a"), b = await replay("b"), rest = await replay("rest");
  assert.equal(a.load.candidates.length, 1);
  assert.equal(a.load.candidates[0].empty, true);
  assert.equal(a.final.candidates.length, 1);
  assert.match(a.final.candidates[0].text, /确认报名/);
  assert.equal(rootAfterSteps([a, b]), true);
  const base = { runs: [a, b], shell: { requests: [] } };
  const opts = { rules, site: "portal", restSel: scopeRootSel(SID), inParent: true };
  assert.deepEqual(fails(compareRuns(base, rest, opts)), []);
  const early = await replay("early", true);
  assert.notDeepEqual(fails(compareRuns(base, early, opts)), []);
});
