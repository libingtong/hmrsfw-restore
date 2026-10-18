// node --test tools/test/compare-root-pick.test.mjs
// Which original candidate the restored root is compared with (HM-239): a classless restored root matches the
// classless original candidate, not the layout header that comes first under portal's <main>.
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { ROOT } from "../gate/common.mjs";
import { loadRules } from "../gate/rules.mjs";
import { compareRuns, pickCandidate } from "../gate/compare.mjs";

const rules = loadRules(path.join(ROOT, "rules/compare"));
const el = (t, a, c = []) => ({ t, a, c });
const cand = (cls, text, inner = text) => ({ cls, text, ltgt: true, tree: el("div", cls == null ? [] : [["class", cls]], [el("span", [], [inner])]) });
const header = cand("headerBox", "用户中心");
const footer = cand("footCls flex", "版权所有");
const page = cand(null, "找工作");
const run = (cands) => ({ load: { candidates: cands, overlay: { modals: [], toasts: [] }, requests: [] } });
const baseline = { runs: [run([header, page, footer]), run([header, page, footer])], shell: { requests: [] } };
const failedChecks = (rest) => compareRuns(baseline, run(rest), { rules, site: "portal" }).failed.map((f) => f.check);

test("pickCandidate: same class first, a classless root matches a classless candidate, else the first", () => {
  const cands = [header, page, footer];
  assert.equal(pickCandidate(cands, "footCls flex"), footer);
  assert.equal(pickCandidate(cands, null), page);
  assert.equal(pickCandidate(cands, undefined), header);
  assert.equal(pickCandidate(cands, "other"), header);
  assert.equal(pickCandidate([header, footer], null), header); // no classless candidate: unchanged fallback
  assert.equal(pickCandidate([], null), null);
});

test("compareRuns: a classless restored root equal to the classless page root passes", () => {
  assert.deepEqual(failedChecks([cand(null, "找工作")]), []);
});

test("compareRuns: a classless restored root is still compared — different content fails", () => {
  const f = failedChecks([cand(null, "找机构")]);
  assert.ok(f.includes("html") && f.includes("text"), f.join(","));
});

test("compareRuns: a restored root with a class still matches by class only", () => {
  assert.deepEqual(failedChecks([cand("footCls flex", "版权所有")]), []);
  assert.ok(failedChecks([cand("jyEmap", "找工作")]).includes("html")); // class not in the original → first candidate
});

test("compareRuns: an empty restored page is not matched to a classless candidate", () => {
  const f = failedChecks([{ tree: null, ltgt: true, html: "", text: "", cls: null, empty: true }]);
  assert.ok(f.includes("render"), f.join(","));
});
