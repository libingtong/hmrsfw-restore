// node --test tools/test/compare-shell-toasts.test.mjs
// The app shell's own toasts (shell probe) come off both sides when the restored app runs the shell too (HM-250).
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { ROOT } from "../gate/common.mjs";
import { loadRules } from "../gate/rules.mjs";
import { compareRuns } from "../gate/compare.mjs";

const rules = loadRules(path.join(ROOT, "rules/compare"));
const SHELL_REQ = "POST /xf-job/school/user/getDictValueByCodes", PAGE_REQ = "GET /xf-job/job/xfJobCurriculumVitae/viewVoByIdFromCompany";
const FAIL = "操作失败，请稍后再试！";
const page = { cls: "report", tree: { t: "div", a: [["class", "report"]], c: ["r"] }, ltgt: true, text: "r" };
const req = (k) => ({ method: k.split(" ")[0], path: k.split(" ")[1] });
const run = (toasts, requests) => ({ load: { candidates: [page], overlay: { modals: ["正在生成报告中…\n99%"], toasts }, requests: requests.map(req) } });
const cmp = (orig, rest) => compareRuns({ runs: [orig, orig], shell: { requests: [SHELL_REQ], toasts: [FAIL] } }, rest, { rules, site: "portal" });
const fails = (r) => r.failed.map((f) => `${f.where}.${f.check}`).sort();
// original: shell toast + page toast
const orig = run([FAIL, FAIL], [SHELL_REQ, PAGE_REQ]);

test("restored app with the shell: the shell's toast comes off both sides", () => {
  assert.deepEqual(fails(cmp(orig, run([FAIL, FAIL], [SHELL_REQ, PAGE_REQ]))), []);
});

test("restored app with the shell still compares the page's own toasts", () => {
  // page toast missing (only the shell's) → differs
  assert.deepEqual(fails(cmp(orig, run([FAIL], [SHELL_REQ, PAGE_REQ]))), ["load.overlay"]);
  // an extra page toast → differs
  assert.deepEqual(fails(cmp(orig, run([FAIL, FAIL, FAIL], [SHELL_REQ, PAGE_REQ]))), ["load.overlay"]);
  assert.deepEqual(fails(cmp(orig, run([FAIL, "x"], [SHELL_REQ, PAGE_REQ]))), ["load.overlay"]);
});

test("restored app without the shell (no shell probe request): nothing is taken off the restored side", () => {
  assert.deepEqual(fails(cmp(orig, run([FAIL], [PAGE_REQ]))), []);
  assert.deepEqual(fails(cmp(orig, run([], [PAGE_REQ]))), ["load.overlay"]);
  assert.deepEqual(fails(cmp(orig, run([FAIL, FAIL], [PAGE_REQ]))), ["load.overlay"]);
});
