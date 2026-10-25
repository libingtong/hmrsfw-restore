// node --test tools/test/compare-volatile-mask-guard.test.mjs
// HM-1392: the volatile mask (two original runs differ → the differing span is a wildcard, HM-302) builds a RegExp from
// the page's own HTML; on one page (jyEmap map widget) that pattern was too large for V8 to compile and the construction
// threw, uncaught, out of compareRuns → one page crashed the entire 258-page gate.mjs run. The guard must behave exactly
// like the function's two existing size bail-outs: no mask, fall through to a literal (reported) diff — not a crash.
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { ROOT } from "../gate/common.mjs";
import { loadRules } from "../gate/rules.mjs";
import { compareRuns } from "../gate/compare.mjs";

const rules = loadRules(path.join(ROOT, "rules/compare"));
const cand = (text) => ({ cls: null, tree: { t: "div", a: [], c: [text] }, ltgt: true, text });
const run = (text) => ({ load: { candidates: [cand(text)], overlay: { modals: [], toasts: [] }, requests: [] } });
const cmp = (origRuns, restText) => compareRuns({ runs: origRuns, shell: { requests: [] } }, run(restText), { rules, site: "portal" });

test("RegExp construction failing while building the volatile mask does not crash compareRuns", () => {
  const RealRegExp = globalThis.RegExp;
  globalThis.RegExp = function () { throw new SyntaxError("Invalid regular expression: /x/: Compiled regular expression too large"); };
  try {
    // two original runs disagree (volatile) and the restored run also disagrees with both: without a mask this is a
    // reported html diff, same outcome as the function's "too many holes" / "pattern too large" bail-outs.
    const r = cmp([run("a"), run("b")], "c");
    assert.deepEqual(r.failed.map((f) => `${f.where}.${f.check}`), ["load.html", "load.text"]);
  } finally { globalThis.RegExp = RealRegExp; }
});

test("control: with a real RegExp the same inputs mask through both load.html and load.text (same volatile span, any value matches)", () => {
  const r = cmp([run("a"), run("b")], "c");
  assert.deepEqual(r.failed, []);
});
