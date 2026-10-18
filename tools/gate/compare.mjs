// Comparison of a restored run against the original baseline (or of two original runs, to find unstable steps).
// Pass = same normalised page-root HTML, same innerText, same overlay text, same /xf-api/ request set (minus the
// app-shell requests), screenshot within the pixel threshold, and — when the page has an interaction script — no step
// errors, the same post-load request sequence (bodies compared by SHA-256 of the decrypted canonical form) and the same
// final HTML / text / overlay. Where the original itself is unstable (its two baseline runs differ), the positions that
// differ between the runs are not compared (volatile mask: animated progress, timers); request sets accept anything
// between the intersection and the union of the two runs; request sequences accept either run.
// Hints only name element paths, API paths and step numbers: no page text or data (they go into task metadata).
import { readFileSync, writeFileSync } from "node:fs";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { sha256 } from "./har.mjs";
import { firstDiff } from "./dom.mjs";
import { applyKnown, normHtml, normOverlay, normText, waiveKnown } from "./rules.mjs";

export const loadSet = (requests, shell) => [...new Set(requests.map((r) => (typeof r === "string" ? r : r.method + " " + r.path)))].filter((k) => !k.includes("EXTERNAL ") && !shell.has(k)).sort();
export const seqKey = (x) => `${x.phase} ${x.method} ${x.path} ${x.query} ${x.bodyKind === "sm2" ? "sm2:" : ""}${x.bodySha ?? sha256(x.body ?? "")}`;
export const stepSeq = (log, exclude) => log.filter((x) => x.phase !== "load" && !x.path.startsWith("EXTERNAL ") && !exclude.has(x.method + " " + x.path)).map(seqKey);
// Request log entry → what the baseline stores (body reduced to its SHA-256).
export const redact = (x) => ({ phase: x.phase, method: x.method, path: x.path, query: x.query, bodyKind: x.bodyKind, bodySha: x.bodySha ?? sha256(x.body ?? ""), tier: x.tier });

export function pixelDiff(a, b, out, threshold) {
  const A = PNG.sync.read(readFileSync(a)), B = PNG.sync.read(readFileSync(b));
  const w = Math.max(A.width, B.width), h = Math.max(A.height, B.height);
  const pad = (img) => { const p = new PNG({ width: w, height: h }); p.data.fill(255); PNG.bitblt(img, p, 0, 0, img.width, img.height, 0, 0); return p; };
  const D = new PNG({ width: w, height: h });
  const n = pixelmatch(pad(A).data, pad(B).data, D.data, w, h, { threshold });
  if (out) writeFileSync(out, PNG.sync.write(D));
  return { ratio: n / (w * h), sizeA: [A.width, A.height], sizeB: [B.width, B.height] };
}

// Pick the candidate the comparison uses in one phase. `cls` undefined → the first candidate (the restored side:
// #poc-main holds only the page). Otherwise the candidate whose class attribute equals `cls` (null = no class
// attribute), i.e. the original element that corresponds to the restored root of the same phase; none → null, which
// compareRuns reports as a "root" failure. No fallback to the first candidate: on the portal that is the layout header
// (`main > *` also matches homeView's header), so the comparison silently compared a different element (HM-779).
export const pickCandidate = (cands, cls) => (cls === undefined ? cands?.[0] : cands?.find((c) => c.cls === cls)) ?? null;

// Overlay → one string: open modals, then the toasts shown in the phase minus the app shell's own toasts (the shell
// probe's; the restored app has no shell yet). Older baselines stored the overlay as a plain string.
export function overlayText(ov, shellToasts = []) {
  if (typeof ov === "string" || ov == null) return ov ?? "";
  const drop = [...shellToasts];
  const toasts = ov.toasts.filter((t) => { const i = drop.indexOf(t); if (i >= 0) { drop.splice(i, 1); return false; } return true; });
  return [...ov.modals, ...toasts].join(" | ");
}

// Projections of one run (original or restored) used for comparison. `cls` = {load, final}: class of the restored root
// in each phase (the root's class can change with the interaction, e.g. a v-if/v-else root); omitted → first candidate.
// A phase whose root is not found has html/text null and root[phase] false.
export function project(run, { rules, shell, exclude, cls = {}, known, side, used, shellToasts }) {
  const k = (where, v) => (known ? applyKnown(where, side, v, known, used) : v);
  const lc = pickCandidate(run.load?.candidates, cls.load), lFound = !!lc || cls.load === undefined;
  const p = {
    "load.html": lFound ? k("load.html", normHtml(lc, rules)) : null,
    "load.text": lFound ? k("load.text", normText(lc?.text, rules)) : null,
    "load.overlay": k("load.overlay", normOverlay(overlayText(run.load?.overlay, shellToasts), rules)),
    "load.requests": k("load.requests", loadSet(run.load?.requests ?? [], new Set([...shell, ...exclude]))),
    shot: lc?.shot ?? null, cls: lc?.cls ?? null, empty: !lc || lc.empty || !lc.tree, root: { load: lFound },
  };
  if (run.steps) {
    const fc = pickCandidate(run.final?.candidates, cls.final), fFound = !!fc || cls.final === undefined;
    p.finalCls = fc?.cls ?? null; p.root.final = fFound;
    p["steps.errors"] = run.steps.filter((s) => s.err).map((s) => `step ${s.i}: ${s.err}`);
    p["steps.requests"] = k("steps.requests", stepSeq(run.stepLog ?? [], new Set([...exclude, ...shell])));
    p["final.html"] = fFound ? k("final.html", normHtml(fc, rules)) : null;
    p["final.text"] = fFound ? k("final.text", normText(fc?.text, rules)) : null;
    p["final.overlay"] = k("final.overlay", normOverlay(overlayText(run.final?.overlay, shellToasts), rules));
  }
  return p;
}

const same = (a, b) => (Array.isArray(a) ? a.join("\n") === b.join("\n") : a === b);

// Volatile mask from two original runs A and B: tokens equal in both must match in order; each hunk where A and B
// differ matches anything. Tokens: tags and text runs for HTML; digit runs, whitespace and other runs for text.
const tokens = (where, s) => (where.endsWith(".html") ? s.split(/(<[^>]+>)/) : s.split(/(\d+|\s+)/)).filter((x) => x !== "");
function maskRegex(where, a, b) {
  const A = tokens(where, a), B = tokens(where, b);
  let p = 0; while (p < A.length && p < B.length && A[p] === B[p]) p++;
  let q = 0; while (q < A.length - p && q < B.length - p && A[A.length - 1 - q] === B[B.length - 1 - q]) q++;
  const a2 = A.slice(p, A.length - q), b2 = B.slice(p, B.length - q);
  if (a2.length * b2.length > 4e6) return null;
  // LCS of the middle part → the common subsequence stays literal, everything else becomes a wildcard hunk.
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
function volatileMatch(where, a, b, r) {
  if (same(a, b)) return false;
  if (where === "load.requests") { const both = a.filter((x) => b.includes(x)), any = new Set([...a, ...b]); return both.every((x) => r.includes(x)) && r.every((x) => any.has(x)); }
  if (Array.isArray(a)) return false;
  const re = maskRegex(where, a, b);
  return !!re && re.test(r);
}
function hint(where, a, b) {
  if (where.endsWith(".html")) { const d = firstDiff(a, b); return `HTML differs under ${d.path} (offset ${d.offset}; lengths ${d.lengths.join("/")})`; }
  if (where.endsWith(".text") || where.endsWith(".overlay")) {
    const la = a.split("\n"), lb = b.split("\n"); let i = 0; while (i < la.length && la[i] === lb[i]) i++;
    return `${where.endsWith(".text") ? "innerText" : "overlay text"} differs from line ${i + 1} (lines ${la.length}/${lb.length}, chars ${a.length}/${b.length})`;
  }
  if (where === "load.requests") {
    const missing = a.filter((x) => !b.includes(x)), extra = b.filter((x) => !a.includes(x));
    return [missing.length ? "missing " + missing.join(", ") : "", extra.length ? "extra " + extra.join(", ") : ""].filter(Boolean).join("; ");
  }
  if (where === "steps.requests") {
    let i = 0; while (i < a.length && a[i] === b[i]) i++;
    const cut = (s) => (s ? s.split(" ").slice(0, 3).join(" ") : "(none)");
    return `request #${i + 1} after load: original ${cut(a[i])}, restored ${cut(b[i])} (${a.length}/${b.length} requests)`;
  }
  return "";
}

// baseline: { runs:[run, run?], shell:{requests} }, rest: restored run. Returns { pass, failed, waived, pixel, knownUsed }.
export function compareRuns(baseline, rest, { rules, site, known = [], shotOut }) {
  const shell = new Set(baseline.shell?.requests ?? []);
  const exclude = rules.shellRequests(site);
  const used = new Set();
  // The original element compared with the restored root, per phase: the one with the restored root's class in that
  // phase (load root for load, final root for final) — same element on both sides, same content compared (HM-779).
  const restCls = { load: rest.load?.candidates?.[0]?.cls ?? null, final: rest.final?.candidates?.[0]?.cls ?? null };
  const R = project(rest, { rules, shell, exclude, known, side: "rest", used });
  const O = baseline.runs.map((run) => project(run, { rules, shell, exclude, cls: restCls, known, side: "orig", used, shellToasts: baseline.shell?.toasts ?? [] }));
  const failed = [];
  const noRoot = (ph) => ph in R.root && O.every((o) => o.root[ph] === false);
  // original candidates by class only (element paths, no page text)
  const rootHint = (ph) => `no original root candidate with class ${JSON.stringify(restCls[ph])} (restored ${ph} root); original candidates: ${[...new Set(baseline.runs.flatMap((r) => (r[ph]?.candidates ?? []).map((c) => JSON.stringify(c.cls))))].join(", ")}`;
  for (const ph of ["load", "final"]) if (noRoot(ph)) failed.push({ check: "root", where: ph, hint: rootHint(ph) });
  if (!noRoot("load") && O.every((o) => o.empty)) failed.push({ check: "baseline", where: "load", hint: "original page root not found in the baseline" });
  if (R.empty) failed.push({ check: "render", where: "load", hint: "restored page root (#poc-main > *) is empty" });
  const keys = Object.keys(R).filter((k) => k.includes(".") && k !== "steps.errors");
  for (const where of keys) {
    if (!(where in O[0])) { failed.push({ check: where.split(".")[1], where: where.split(".")[0], hint: "baseline has no interaction run" }); continue; }
    // runs whose root was found in this phase; none → already reported as "root"
    const os = O.filter((o) => o[where] !== null);
    if (!os.length) continue;
    if (os.some((o) => same(o[where], R[where]))) continue;
    if (os.length > 1 && volatileMatch(where, os[0][where], os[1][where], R[where])) continue;
    failed.push({ check: where.split(".")[1], where: where.split(".")[0], hint: hint(where, os[0][where], R[where]) });
  }
  if (R["steps.errors"]?.length) failed.push({ check: "step-error", where: "steps", hint: R["steps.errors"].slice(0, 3).join("; ") });
  let pixel = null;
  if (R.shot) {
    for (const [i, o] of O.entries()) {
      if (!o.shot) continue;
      const d = pixelDiff(o.shot, R.shot, i === 0 ? shotOut : null, rules.pixel.threshold);
      if (!pixel || d.ratio < pixel.ratio) pixel = d;
    }
    if (pixel && pixel.ratio > rules.pixel.maxRatio) failed.push({ check: "pixel", where: "load", hint: `${(pixel.ratio * 100).toFixed(3)}% of pixels differ (max ${(rules.pixel.maxRatio * 100).toFixed(1)}%), size ${pixel.sizeA.join("x")} vs ${pixel.sizeB.join("x")}` });
  }
  const [kept, waived] = waiveKnown(failed, known, used);
  return { pass: kept.length === 0, failed: kept, waived, pixel: pixel && +(pixel.ratio * 100).toFixed(3), knownUsed: [...used], projections: { orig: O, rest: R } };
}

// Which comparison keys differ between two original runs (→ baseline "unstable").
export function unstableKeys(runA, runB, { rules, site, shell, shellToasts }) {
  const exclude = rules.shellRequests(site);
  const cls = { load: runA.load?.candidates?.[0]?.cls ?? null, final: runA.final?.candidates?.[0]?.cls ?? null };
  const a = project(runA, { rules, shell, exclude, cls, shellToasts });
  const b = project(runB, { rules, shell, exclude, cls, shellToasts });
  const out = Object.keys(a).filter((k) => k.includes(".") && !same(a[k], b[k]));
  if (a.shot && b.shot) { const d = pixelDiff(a.shot, b.shot, null, rules.pixel.threshold); if (d.ratio > rules.pixel.maxRatio) out.push("load.pixel"); }
  return out;
}
