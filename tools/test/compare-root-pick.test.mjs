// node --test tools/test/compare-root-pick.test.mjs
// Which original element the restored root is compared with (HM-779): per phase, the candidate with the restored root's
// class in that phase; no silent fallback to the first candidate (on the portal, homeView's header under `main > *`).
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { ROOT } from "../gate/common.mjs";
import { loadRules } from "../gate/rules.mjs";
import { compareRuns, pickCandidate, unstableKeys } from "../gate/compare.mjs";

const rules = loadRules(path.join(ROOT, "rules/compare"));
const el = (t, a, c = []) => ({ t, a, c });
const cand = (cls, text) => ({ cls, tree: el("div", cls == null ? [] : [["class", cls]], [text]), ltgt: true, text });
const ov = { modals: [], toasts: [] };
const run = (load, final) => ({ load: { candidates: load, overlay: ov, requests: [] }, ...(final ? { steps: [{ i: 1 }], stepLog: [], final: { candidates: final, overlay: ov } } : {}) });
const cmp = (origRuns, rest) => compareRuns({ runs: origRuns, shell: { requests: [] } }, rest, { rules, site: "portal" });
const fails = (r) => r.failed.map((f) => `${f.where}.${f.check}`).sort();

// original: `main > *` = layout header, page root, layout footer; restored: `#poc-main > *` = the page root only
const header = cand("headerBox", "header"), footer = cand("footCls flex", "footer");
const top = cand("bgBoxTop xf-relative", "top"), scrolled = cand("bgBoxTop xf-relative noTopShow", "");
const orig = () => run([header, top, footer], [header, scrolled, footer]);

test("root class changes with the interaction: final compares the original's final root, not the layout header", () => {
  assert.deepEqual(fails(cmp([orig(), orig()], run([top], [scrolled]))), []);
  // still compared: a different final root content fails final html/text
  assert.deepEqual(fails(cmp([orig(), orig()], run([top], [cand("bgBoxTop xf-relative noTopShow", "x")]))), ["final.html", "final.text"]);
  // the load root is still the load root
  assert.deepEqual(fails(cmp([orig(), orig()], run([cand("bgBoxTop xf-relative", "y")], [scrolled]))), ["load.html", "load.text"]);
});

test("restored root without a class: matched to the original candidate without a class, not the layout header", () => {
  const page = cand(null, "map page");
  const o = () => run([header, page, footer]);
  assert.deepEqual(fails(cmp([o(), o()], run([page]))), []);
  assert.deepEqual(fails(cmp([o(), o()], run([cand(null, "other page")]))), ["load.html", "load.text"]);
});

test("no original candidate with the restored root's class: an explicit root failure, nothing compared with another element", () => {
  const r = cmp([orig(), orig()], run([top], [cand("somethingElse", "")]));
  assert.deepEqual(fails(r), ["final.root"]);
  assert.match(r.failed[0].hint, /no original root candidate with class "somethingElse" \(restored final root\); original candidates: "headerBox", "bgBoxTop xf-relative noTopShow", "footCls flex"/);
  assert.deepEqual(fails(cmp([orig(), orig()], run([cand("nope", "top")]))), ["load.root"]);
  // the restored root equals the layout header: still no match for the page root's phase content
  assert.equal(pickCandidate([header, top], "missing"), null);
  assert.equal(pickCandidate([header, top], undefined), header);
  assert.equal(pickCandidate([header, cand(null, "p")], null).text, "p");
});

test("one original run without the root: compared with the other run only, no volatile mask from the mismatched run", () => {
  const other = run([header, top, footer], [header, cand("bgBoxTop xf-relative", "top"), footer]);
  assert.deepEqual(fails(cmp([orig(), other], run([top], [scrolled]))), []);
  assert.deepEqual(fails(cmp([orig(), other], run([top], [cand("bgBoxTop xf-relative noTopShow", "anything")]))), ["final.html", "final.text"]);
});

test("unstableKeys: two equal original runs are stable; a run whose final root differs is unstable", () => {
  const opts = { rules, site: "portal", shell: new Set(), shellToasts: [] };
  assert.deepEqual(unstableKeys(orig(), orig(), opts), []);
  const p = run([top], [scrolled]), q = run([top], [cand("bgBoxTop xf-relative noTopShow", "z")]);
  assert.deepEqual(unstableKeys(p, q, opts).sort(), ["final.html", "final.text"]);
  assert.deepEqual(unstableKeys(p, run([top], [top]), opts).sort(), ["final.html", "final.text"]);
});

test("no final root on either side (HM-1278): the same state, not a root failure; one side only still fails", () => {
  const page = cand("resumeAnalysisReport", "report");
  const o = () => run([header, page, footer], []);
  assert.deepEqual(fails(cmp([o(), o()], run([page], []))), []);
  // the original lost its root, the restored page kept one: still an explicit root failure
  assert.deepEqual(fails(cmp([o(), o()], run([page], [page]))), ["final.root"]);
  // the original kept its root (and its layout), the restored page lost it: still a root failure
  const kept = () => run([header, page, footer], [header, page, footer]);
  assert.deepEqual(fails(cmp([kept(), kept()], run([page], []))), ["final.root"]);
  // only one original run without any final candidate: compared as before
  assert.deepEqual(fails(cmp([o(), kept()], run([page], []))), ["final.root"]);
});
