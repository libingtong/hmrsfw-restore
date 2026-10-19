// node --test tools/test/compare-volatile-mask.test.mjs
// Volatile mask of two original runs (HM-902): matched as literal segments with startsWith/indexOf instead of a RegExp.
// Same accepted strings as the RegExp built before (copied verbatim below as `oldMaskRegex`), and no "Regular expression
// too large" for long HTML (jobRecommend 43 KB, bigData scrollList 53 KB, talents index 84 KB).
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { ROOT } from "../gate/common.mjs";
import { loadRules } from "../gate/rules.mjs";
import { compareRuns, maskSegments, maskTest } from "../gate/compare.mjs";

// tools/gate/compare.mjs before HM-902, unchanged
const tokens = (where, s) => (where.endsWith(".html") ? s.split(/(<[^>]+>)/) : s.split(/(\d+|\s+)/)).filter((x) => x !== "");
function oldMaskRegex(where, a, b) {
  const A = tokens(where, a), B = tokens(where, b);
  let p = 0; while (p < A.length && p < B.length && A[p] === B[p]) p++;
  let q = 0; while (q < A.length - p && q < B.length - p && A[A.length - 1 - q] === B[B.length - 1 - q]) q++;
  const a2 = A.slice(p, A.length - q), b2 = B.slice(p, B.length - q);
  if (a2.length * b2.length > 4e6) return null;
  const n = a2.length, m = b2.length, L = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = a2[i] === b2[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const parts = A.slice(0, p).map(esc);
  let i = 0, j = 0, hole = false, holes = 0;
  while (i < n || j < m) {
    if (i < n && j < m && a2[i] === b2[j]) { parts.push(esc(a2[i])); i++; j++; hole = false; continue; }
    if (!hole) { parts.push("[\\s\\S]*?"); hole = true; holes++; }
    if (j >= m || (i < n && L[i + 1][j] >= L[i][j + 1])) i++; else j++;
  }
  if (holes > 50) return null;
  parts.push(...A.slice(A.length - q).map(esc));
  return new RegExp("^" + parts.join("") + "$");
}
const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// deterministic PRNG, so a failure reproduces
let seed = 902;
const rnd = (n) => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff), seed % n);
const ALPHA = ["a", "b", "1", "23", " ", "\n", ".", "*", "$", "(", "\\", "[", "^", "|", "?", "<i>", "</i>", "<b x=\"1\">"];
const gen = (k) => Array.from({ length: k }, () => ALPHA[rnd(ALPHA.length)]).join("");
const mutate = (s) => {
  const t = [...s];
  for (let k = rnd(4); k >= 0; k--) { const at = rnd(t.length + 1); if (rnd(2)) t.splice(at, 1); else t.splice(at, 0, ALPHA[rnd(ALPHA.length)]); }
  return t.join("");
};

test("same verdict as the old RegExp on random text and HTML (metacharacters, newlines, tags)", () => {
  let masked = 0, accepted = 0;
  for (let c = 0; c < 3000; c++) {
    const where = c % 2 ? "load.html" : "final.text";
    const a = gen(1 + rnd(14)), b = rnd(3) ? mutate(a) : gen(1 + rnd(14));
    const re = oldMaskRegex(where, a, b), segs = maskSegments(where, a, b);
    assert.equal(segs === null, re === null, `null-ness differs for ${JSON.stringify([where, a, b])}`);
    if (!re) continue;
    masked++;
    for (const r of [a, b, mutate(a), mutate(b), mutate(mutate(a)), gen(1 + rnd(14)), "", a + b, b + a]) {
      const want = re.test(r);
      assert.equal(maskTest(segs, r), want, `verdict differs for ${JSON.stringify([where, a, b, r])}`);
      if (want) accepted++;
    }
  }
  assert.ok(masked > 2000 && accepted > 5000, `fuzz too weak: ${masked} masks, ${accepted} accepted`);
});

test("hunk count above 50 still gives no mask, as before", () => {
  const a = Array.from({ length: 60 }, (_, i) => `<i>x${i}</i><b>`).join(""), b = a.replace(/x(\d+)/g, "y$1");
  assert.equal(oldMaskRegex("load.html", a, b), null);
  assert.equal(maskSegments("load.html", a, b), null);
});

// a list page like jobRecommend: 1000 rows; the two original runs differ in a timestamp after row 600 and a counter after
// row 610, so the mask is ~43 KB of literal text, a hunk, a short literal, a hunk and ~27 KB of literal text: V8 rejects
// a literal run over ~32 K characters next to a quantifier (measured with node 26)
const row = (i, name = `岗位 ${i}`) => `<li class="job"><span>${name}</span><span>月薪 ${i}k-${i + 2}k，经验不限（${i}.${i}）[*]</span></li>`;
const listHtml = (stamp, n, edit = (i) => row(i)) => `<div data-v-x="">` + Array.from({ length: 1000 }, (_, i) => edit(i) + (i === 600 ? `<p>${stamp}</p>` : i === 610 ? `<em>${n}</em>` : "")).join("") + `</div>`;

test("long HTML: the old RegExp is too large for V8, the segment matcher gives the RegExp's answer", () => {
  const a = listHtml("10:01", 7), b = listHtml("10:02", 8);
  assert.ok(a.length > 30000);
  const re = oldMaskRegex("load.html", a, b);
  assert.throws(() => re.test(a), /Regular expression too large/);
  const segs = maskSegments("load.html", a, b);
  assert.equal(segs.length, 3);
  assert.equal(maskTest(segs, listHtml("10:03", 9)), true); // only the volatile hunks differ
  assert.equal(maskTest(segs, listHtml("10:03", 9, (i) => row(i, i === 120 ? "岗位 121" : undefined))), false); // a stable row differs
  assert.equal(maskTest(segs, listHtml("10:03", 9, (i) => (i === 800 ? "" : row(i)))), false); // a row missing
  assert.equal(maskTest(segs, listHtml("10:03", 9) + "<li></li>"), false); // anchored at the end
});

test("compareRuns on a long page: volatile hunks waived, stable differences still fail (no throw)", () => {
  const rules = loadRules(path.join(ROOT, "rules/compare"));
  const el = (t, a, c = []) => ({ t, a, c });
  const page = (stamp, n, name120 = "岗位 120") => {
    const rows = Array.from({ length: 1000 }, (_, i) => [el("li", [["class", "job"]], [el("span", [], [i === 120 ? name120 : `岗位 ${i}`]), el("span", [], [`月薪 ${i}k-${i + 2}k，经验不限（${i}.${i}）[*]`])]), ...(i === 600 ? [el("p", [], [stamp])] : i === 610 ? [el("em", [], [String(n)])] : [])]).flat();
    const tree = el("div", [["class", "jobList"]], rows);
    return { load: { candidates: [{ cls: "jobList", tree, ltgt: true, text: `${stamp}\n${n}` }], overlay: { modals: [], toasts: [] }, requests: [] } };
  };
  const base = { runs: [page("10:01", 7), page("10:02", 8)], shell: { requests: [] } };
  const fails = (rest) => compareRuns(base, rest, { rules, site: "portal" }).failed.map((f) => `${f.where}.${f.check}`).sort();
  assert.deepEqual(fails(page("10:03", 9)), []);
  assert.deepEqual(fails(page("10:03", 9, "岗位 121")), ["load.html"]);
});
