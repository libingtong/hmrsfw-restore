// Comparison of a restored run against the original baseline (or of two original runs, to find unstable steps).
// Pass = same normalised page-root HTML, same innerText, same overlay text, same /xf-api/ request set (minus the
// app-shell requests), screenshot within the pixel threshold, and — when the page has an interaction script — no step
// errors, the same post-load request sequence (bodies compared by SHA-256 of the decrypted canonical form), the same
// pages opened (target="_blank", window.open: the target path, in order) and the same final HTML / text / overlay.
// Requests are the page under test's own: a page it opens is not part of it (HM-797, tools/gate/replay.mjs).
// Where the original itself is unstable (its two baseline runs differ), the positions that
// differ between the runs are not compared (volatile mask: animated progress, timers; in the screenshot, the boxes of
// canvases whose pixels differ between the runs, HM-302: volatileCanvases); request sets accept anything
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
// A page opened by the page under test (target="_blank", window.open; tools/gate/replay.mjs) → one sequence entry.
export const openedKey = (x) => `${x.phase} ${x.target}`;
// Request log entry → what the baseline stores (body reduced to its SHA-256).
export const redact = (x) => ({ phase: x.phase, method: x.method, path: x.path, query: x.query, bodyKind: x.bodyKind, bodySha: x.bodySha ?? sha256(x.body ?? ""), tier: x.tier });

// `masks`: rectangles ({x, y, w, h}, shot pixels) not compared (volatileCanvases): B takes A's pixels there, and they
// leave the denominator too, so the ratio is over the compared pixels only.
export function pixelDiff(a, b, out, threshold, masks = []) {
  const A = PNG.sync.read(readFileSync(a)), B = PNG.sync.read(readFileSync(b));
  const w = Math.max(A.width, B.width), h = Math.max(A.height, B.height);
  const pad = (img) => { const p = new PNG({ width: w, height: h }); p.data.fill(255); PNG.bitblt(img, p, 0, 0, img.width, img.height, 0, 0); return p; };
  const PA = pad(A), PB = pad(B), skip = new Uint8Array(w * h);
  for (const m of masks) for (let y = Math.max(0, m.y); y < Math.min(h, m.y + m.h); y++) for (let x = Math.max(0, m.x); x < Math.min(w, m.x + m.w); x++) {
    const i = y * w + x;
    if (skip[i]) continue;
    skip[i] = 1; PA.data.copy(PB.data, i * 4, i * 4, i * 4 + 4);
  }
  const masked = skip.reduce((n, v) => n + v, 0);
  const D = new PNG({ width: w, height: h });
  const n = pixelmatch(PA.data, PB.data, D.data, w, h, { threshold });
  if (out) writeFileSync(out, PNG.sync.write(D));
  return { ratio: w * h > masked ? n / (w * h - masked) : 0, sizeA: [A.width, A.height], sizeB: [B.width, B.height], masked };
}
// A root that paints nothing (zero-area box, no painted content: replay.mjs paintedBoxInPage, HM-380) has no shot, only
// `blank`. Two blank roots are equal; a blank root against a shot differs in every pixel the other side paints.
const pngSize = (f) => { const P = PNG.sync.read(readFileSync(f)); return [P.width, P.height]; };
export function shotDiff(a, b, out, threshold, masks = []) {
  if (a.blank && b.blank) return { ratio: 0, sizeA: [0, 0], sizeB: [0, 0] };
  if (a.blank || b.blank) return { ratio: 1, sizeA: a.blank ? [0, 0] : pngSize(a.shot), sizeB: b.blank ? [0, 0] : pngSize(b.shot) };
  return pixelDiff(a.shot, b.shot, out, threshold, masks);
}

// Volatile canvases (HM-302; rule volatile-canvas). Like the volatile mask for HTML and text below: where the original
// itself is unstable, the differing positions are not compared. A canvas's content is not in the DOM tree, so the unit is
// the canvas's box: a <canvas> at the same box (±1 px) in both original shots and in the restored one (replay.mjs
// canvasBoxesInPage; all three shots the same size), whose pixels differ between the two original runs (TagCanvas:
// Math.random colours and order, a sphere that keeps turning). Its box (the union of the three, 1 px wider on each side)
// is left out of the pixel comparison; everything around it is compared as before. What the canvas draws from is still
// compared: its element and attributes in the HTML, the tag list it reads from the DOM. Instead of its pixels, the
// restored canvas must paint about as much as the original does: the share of the box that differs from the box's most
// common colour ("ink") within [inkRange[0] × the smaller, inkRange[1] × the larger] of the two original runs, so a canvas
// that stays empty (library missing, Start throwing) or draws something else entirely still fails.
// origs: the original shots ({shot, canvases}); rest: the restored one, or null (two original runs: unstableKeys).
const near = (a, b) => Math.abs(a.x - b.x) <= 1 && Math.abs(a.y - b.y) <= 1 && Math.abs(a.w - b.w) <= 1 && Math.abs(a.h - b.h) <= 1;
function boxDiffers(A, B, r, threshold) {
  const crop = (P) => { const C = new PNG({ width: r.w, height: r.h }); PNG.bitblt(P, C, r.x, r.y, r.w, r.h, 0, 0); return C.data; };
  return pixelmatch(crop(A), crop(B), null, r.w, r.h, { threshold }) > 0;
}
export function inkRatio(P, r) {
  const counts = new Map();
  for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) { const i = (y * P.width + x) * 4, k = (P.data[i] << 16) | (P.data[i + 1] << 8) | P.data[i + 2]; counts.set(k, (counts.get(k) ?? 0) + 1); }
  let bg = 0, most = -1;
  for (const [k, n] of counts) if (n > most) { most = n; bg = k; }
  let ink = 0;
  for (const [k, n] of counts) if (Math.abs((k >> 16) - (bg >> 16)) + Math.abs(((k >> 8) & 255) - ((bg >> 8) & 255)) + Math.abs((k & 255) - (bg & 255)) > 48) ink += n;
  return ink / (r.w * r.h);
}
export function volatileCanvases(origs, rest, { threshold, inkRange }) {
  const [a, b] = origs;
  if (!a?.shot || !b?.shot || !a.canvases || !b.canvases || (rest && (!rest.shot || !rest.canvases))) return { masks: [], failed: [] };
  const P = [a, b, ...(rest ? [rest] : [])].map((s) => PNG.sync.read(readFileSync(s.shot)));
  if (P.some((p) => p.width !== P[0].width || p.height !== P[0].height)) return { masks: [], failed: [] };
  const { width: W, height: H } = P[0], masks = [], failed = [];
  for (const r of (rest ?? a).canvases) {
    const boxes = [r, a.canvases.find((x) => near(x, r)), b.canvases.find((x) => near(x, r))];
    if (boxes.some((x) => !x)) continue;
    const x0 = Math.max(0, Math.min(...boxes.map((x) => x.x)) - 1), y0 = Math.max(0, Math.min(...boxes.map((x) => x.y)) - 1);
    const x1 = Math.min(W, Math.max(...boxes.map((x) => x.x + x.w)) + 1), y1 = Math.min(H, Math.max(...boxes.map((x) => x.y + x.h)) + 1);
    const box = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
    if (box.w <= 0 || box.h <= 0 || masks.some((m) => near(m, box)) || !boxDiffers(P[0], P[1], box, threshold)) continue;
    masks.push(box);
    if (!rest) continue;
    const io = [inkRatio(P[0], box), inkRatio(P[1], box)], ir = inkRatio(P[2], box), pct = (v) => (v * 100).toFixed(1) + "%";
    if (ir < inkRange[0] * Math.min(...io) || ir > inkRange[1] * Math.max(...io)) failed.push({ check: "pixel", where: "load", hint: `canvas at ${box.x},${box.y} ${box.w}x${box.h} (volatile in the original, not compared pixel by pixel): restored paints ${pct(ir)} of its box, the original's two runs ${pct(io[0])} / ${pct(io[1])} (allowed ${inkRange[0]}x the smaller to ${inkRange[1]}x the larger)` });
  }
  return { masks, failed };
}

// Pick the candidate the comparison uses in one phase. `cls` undefined → the first candidate (the restored side:
// #poc-main holds only the page). Otherwise the candidate whose class attribute equals `cls` (null = no class
// attribute), i.e. the original element that corresponds to the restored root of the same phase; none → null, which
// compareRuns reports as a "root" failure. No fallback to the first candidate: on the portal that is the layout header
// (`main > *` also matches homeView's header), so the comparison silently compared a different element (HM-779).
export const pickCandidate = (cands, cls) => (cls === undefined ? cands?.[0] : cands?.find((c) => c.cls === cls)) ?? null;

// A recordVia component its parent page mounts only after the interaction (HM-1293: page.portal.fair.signModal, which
// the web fair list renders under `v-if="signShow"`, set by the 报名参会 click) has no root at load on either side:
// captureRoot then leaves its single `empty` placeholder, a viewport shot of the parent page, not of the component.
// rootlessLoad: no real load candidate. rootAfterSteps: every run is rootless at load and has a root after the steps.
export const rootlessLoad = (run) => !(run?.load?.candidates ?? []).some((c) => !c.empty);
export const rootAfterSteps = (runs) => runs.length > 0 && runs.every((r) => rootlessLoad(r) && (r.final?.candidates ?? []).some((c) => !c.empty));

// Overlay → one string: open modals, then the toasts shown in the phase minus the app shell's own toasts (the shell
// probe's: the original app shell's own failing requests). Older baselines stored the overlay as a plain string.
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
    shot: lc?.shot ?? null, canvases: lc?.canvases ?? null, blank: !!lc?.blank, cls: lc?.cls ?? null, empty: !lc || lc.empty || !lc.tree, root: { load: lFound },
  };
  // pages opened by the page under test, in order; a run recorded before HM-797 has none stored and counts as having
  // opened none (re-record its baseline if the original does open a page)
  p["load.opened"] = k("load.opened", (run.load?.opened ?? []).map(openedKey));
  if (run.steps) {
    const fc = pickCandidate(run.final?.candidates, cls.final), fFound = !!fc || cls.final === undefined;
    p.finalCls = fc?.cls ?? null; p.root.final = fFound;
    p["steps.errors"] = run.steps.filter((s) => s.err).map((s) => `step ${s.i}: ${s.err}`);
    p["steps.requests"] = k("steps.requests", stepSeq(run.stepLog ?? [], new Set([...exclude, ...shell])));
    p["steps.opened"] = k("steps.opened", (run.opened ?? []).map(openedKey));
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
  // Every literal run is esc()-escaped, so the joined pattern is syntactically valid JS regex source; a large map/canvas
  // widget (HM-1392: page.portal.eMap.index's jyEmap, 9 holes, ~17KB pattern) can still make the *compiled* pattern too
  // large for a given V8 build to accept ("Invalid regular expression: …: Compiled regular expression too large" or
  // similar) — not reproducible on every Node build, so this guard is defensive, same as the two size guards above: no
  // mask for this page, fall through to a literal compare (reported as a diff, not silently passed).
  try { return new RegExp("^" + parts.join("") + "$"); } catch { return null; }
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
  if (where.endsWith(".opened")) {
    let i = 0; while (i < a.length && a[i] === b[i]) i++;
    const cut = (s) => (s ? s.split("?")[0].split("#")[0] : "(none)"); // phase + path only, no query values
    return `opened page #${i + 1}: original ${cut(a[i])}, restored ${cut(b[i])} (${a.length}/${b.length} pages opened)`;
  }
  if (where === "steps.requests") {
    let i = 0; while (i < a.length && a[i] === b[i]) i++;
    const cut = (s) => (s ? s.split(" ").slice(0, 3).join(" ") : "(none)");
    return `request #${i + 1} after load: original ${cut(a[i])}, restored ${cut(b[i])} (${a.length}/${b.length} requests)`;
  }
  return "";
}

// baseline: { runs:[run, run?], shell:{requests} }, rest: restored run. Returns { pass, failed, waived, pixel, knownUsed }.
// inParent: the restored component runs inside its restored parent page (recordVia, HM-251), so the toasts the shell
// probe saw (the parent's and its other components') are dropped on the restored side too, as the shell's requests are.
export function compareRuns(baseline, rest, { rules, site, known = [], shotOut, restSel = "#poc-main > *", inParent = false }) {
  const shell = new Set(baseline.shell?.requests ?? []);
  const exclude = rules.shellRequests(site);
  const used = new Set();
  // The original element compared with the restored root, per phase: the one with the restored root's class in that
  // phase (load root for load, final root for final) — same element on both sides, same content compared (HM-779).
  const restCls = { load: rest.load?.candidates?.[0]?.cls ?? null, final: rest.final?.candidates?.[0]?.cls ?? null };
  // The shell probe's toasts come off both sides when the restored app runs the shell too (it makes the shell probe's
  // requests: legacy App.vue / main.ts, e.g. the portal's getDictValueByCodes answered with the server's 500 message).
  // A restored app without a shell (POC App.vue, only <router-view/>) keeps all its toasts (HM-250). A recordVia
  // component mounted in its restored parent page (inParent) always drops them: the probe's toasts are the parent's (HM-251).
  const shellToasts = baseline.shell?.toasts ?? [];
  const restShell = inParent || (rest.load?.requests ?? []).some((r) => shell.has(typeof r === "string" ? r : r.method + " " + r.path));
  const R = project(rest, { rules, shell, exclude, known, side: "rest", used, shellToasts: restShell ? shellToasts : [] });
  const O = baseline.runs.map((run) => project(run, { rules, shell, exclude, cls: restCls, known, side: "orig", used, shellToasts }));
  const failed = [];
  // After the interaction neither side may have a page root any more (HM-1278: resumeAnalysisReport, where closing the
  // "generating report" modal leaves no candidate under `main > *` nor under `#poc-main > *`). The restored side's root
  // is its first candidate, so with none it used to count as found (class null) and the original's missing one failed
  // final.root. No final candidate at all in the restored run and in every original run is the same state: no root
  // failure, final html / text not compared. Any candidate on either side keeps the comparison as before.
  // A page whose original genuinely renders nothing at load on every run (HM-1432/HM-1433: setup() only makes
  // requests and navigates away, or does nothing at all — baseline.mjs emptyRenderLoad, only set when the original
  // chunk's own source confirms it) is in the same "no root, not a bug" state load-side that HM-1278 already accepts
  // final-side: no root failure, no baseline/render failure, as long as the restored side is equally empty.
  // load always has one candidate even with nothing on the page (the withShots placeholder, replay.mjs captureRoot),
  // so unlike final this checks the raw candidates' own empty flag, not O/R's class-matched empty (a class mismatch
  // alone would otherwise look the same as a genuinely empty page and could mask a real difference).
  const bothRootless = (ph) => (ph === "final" && !rest.final?.candidates?.length && baseline.runs.every((r) => !r.final?.candidates?.length))
    || (ph === "load" && !!baseline.emptyRenderLoad && (rest.load?.candidates ?? []).every((c) => c.empty) && baseline.runs.every((r) => (r.load?.candidates ?? []).every((c) => c.empty)));
  const noRoot = (ph) => ph in R.root && O.every((o) => o.root[ph] === false) && !bothRootless(ph);
  // original candidates by class only (element paths, no page text)
  const rootHint = (ph) => `no original root candidate with class ${JSON.stringify(restCls[ph])} (restored ${ph} root); original candidates: ${[...new Set(baseline.runs.flatMap((r) => (r[ph]?.candidates ?? []).map((c) => JSON.stringify(c.cls))))].join(", ")}`;
  for (const ph of ["load", "final"]) if (noRoot(ph)) failed.push({ check: "root", where: ph, hint: rootHint(ph) });
  // A recordVia component without a root at load in the restored run and in every original run, whose original root
  // appears after the steps in every run, is in the same state at load: not opened yet (HM-1293). No `baseline` /
  // `render` failure and no shot compared at load (the placeholders' shots are the parent page); its root is compared
  // after the steps, and the restored run must have one there. A root at load on either side is compared as before.
  const afterSteps = inParent && rootlessLoad(rest) && rootAfterSteps(baseline.runs);
  if (!afterSteps && !noRoot("load") && !bothRootless("load") && O.every((o) => o.empty)) failed.push({ check: "baseline", where: "load", hint: "original page root not found in the baseline" });
  if (!afterSteps && !bothRootless("load") && R.empty) failed.push({ check: "render", where: "load", hint: `restored page root (${restSel}) is empty` });
  if (afterSteps && !(rest.final?.candidates ?? []).some((c) => !c.empty)) failed.push({ check: "render", where: "final", hint: `restored component root (${restSel}) not found after the steps (the original's appears only after them)` });
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
  let pixel = null, vc = { masks: [], failed: [] };
  if ((R.shot || R.blank) && !afterSteps) {
    if (rules.volatileCanvas && O.length > 1 && R.shot) vc = volatileCanvases(O, R, { threshold: rules.pixel.threshold, inkRange: rules.volatileCanvas.inkRange });
    failed.push(...vc.failed);
    for (const [i, o] of O.entries()) {
      if (!o.shot && !o.blank) continue;
      const d = shotDiff(o, R, i === 0 ? shotOut : null, rules.pixel.threshold, vc.masks);
      if (!pixel || d.ratio < pixel.ratio) pixel = d;
    }
    if (pixel && pixel.ratio > rules.pixel.maxRatio) failed.push({ check: "pixel", where: "load", hint: `${(pixel.ratio * 100).toFixed(3)}% of pixels differ (max ${(rules.pixel.maxRatio * 100).toFixed(1)}%), size ${pixel.sizeA.join("x")} vs ${pixel.sizeB.join("x")}` });
  }
  const [kept, waived] = waiveKnown(failed, known, used);
  return { pass: kept.length === 0, failed: kept, waived, pixel: pixel && +(pixel.ratio * 100).toFixed(3), volatileCanvases: vc.masks, knownUsed: [...used], projections: { orig: O, rest: R } };
}

// Which comparison keys differ between two original runs (→ baseline "unstable").
// inParent: a recordVia component; two runs without its root at load (rootAfterSteps) have no load shot to compare.
export function unstableKeys(runA, runB, { rules, site, shell, shellToasts, inParent = false }) {
  const exclude = rules.shellRequests(site);
  const cls = { load: runA.load?.candidates?.[0]?.cls ?? null, final: runA.final?.candidates?.[0]?.cls ?? null };
  const a = project(runA, { rules, shell, exclude, cls, shellToasts });
  const b = project(runB, { rules, shell, exclude, cls, shellToasts });
  const out = Object.keys(a).filter((k) => k.includes(".") && !same(a[k], b[k]));
  const masks = rules.volatileCanvas ? volatileCanvases([a, b], null, { threshold: rules.pixel.threshold, inkRange: rules.volatileCanvas.inkRange }).masks : [];
  if ((a.shot || a.blank) && (b.shot || b.blank) && !(inParent && rootAfterSteps([runA, runB]))) { const d = shotDiff(a, b, null, rules.pixel.threshold, masks); if (d.ratio > rules.pixel.maxRatio) out.push("load.pixel"); }
  return out;
}
