// Loads rules/compare/ (normalisation rules; one JSON file per rule, loaded in file-name order, see its README) and the
// known-differences register in $RESTORE_STATE/known-diffs/ (differences of the original code itself), and applies them.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { ROOT } from "./common.mjs";
import { dropEmptyComments, mapTree, serialize, sortAttrs } from "./dom.mjs";
import { slug } from "../lib/pipeline.mjs";

export function readRuleDir(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith(".json")).sort().map((f) => {
    try { return JSON.parse(readFileSync(path.join(dir, f), "utf8")); } catch (e) { throw new Error(`${path.relative(ROOT, path.join(dir, f))}: ${e.message}`); }
  });
}

const dropTransition = (v) => v.replace(/(^|;)\s*(-webkit-)?transition(-[a-z-]+)?\s*:[^;]*;?/g, "$1").replace(/^\s+|\s+$/g, "");
const stripTransition = (tree) => mapTree(tree, (n) => ({ ...n, a: n.a.map(([k, v]) => (k === "style" ? [k, dropTransition(v)] : [k, v])) }));
// ant-design-vue's carousel (vc-slick) puts `transition` on the .slick-track inline style only while it slides
// (getTrackAnimateCSS) and sets the plain track style back `speed` ms later (animationEndCallback); the target position
// (transform / left / top) is already in the style during the slide. Drop only the transition declaration on that element.
const hasClass = (n, c) => n.a.some(([k, v]) => k === "class" && v.split(/\s+/).includes(c));
const slickTrackTransition = (tree) => mapTree(tree, (n) => (hasClass(n, "slick-track") ? { ...n, a: n.a.map(([k, v]) => (k === "style" ? [k, dropTransition(v)] : [k, v])) } : n));
// Elements caught mid-transition carry Vue/rc-motion state classes (x-enter-from, x-leave-active, x-appear-prepare …),
// the motion's base class x, and the inline height/opacity of that moment; when the motion ends the classes go and an
// empty style="" is left behind. Drop the state classes with their base class and the inline style on such elements,
// and treat style="" as no style everywhere.
const MOTION = /^([\w-]+)-(appear|enter|leave)(-(from|to|active|prepare|start))?$/;
const stripMotion = (tree) => mapTree(tree, (n) => {
  const cls = n.a.find(([k]) => k === "class");
  const tokens = cls ? cls[1].split(/\s+/).filter(Boolean) : [];
  const bases = new Set(tokens.map((t) => MOTION.exec(t)?.[1]).filter(Boolean));
  if (!bases.size) return { ...n, a: n.a.filter(([k, v]) => !(k === "style" && v.trim() === "")) };
  return { ...n, a: n.a.filter(([k]) => k !== "style").map(([k, v]) => (k === "class" ? [k, tokens.filter((t) => !MOTION.test(t) && !bases.has(t)).join(" ")] : [k, v])) };
});
const TREE = { "attr-order": sortAttrs, "empty-comment": dropEmptyComments, "style-transition": stripTransition, "motion-state": stripMotion, "slick-track-transition": slickTrackTransition };
const dropAttrs = (names) => (tree) => mapTree(tree, (n) => ({ ...n, a: n.a.filter(([k]) => !names.has(k)) }));

export function loadRules(dir = path.join(ROOT, "rules/compare")) {
  const all = readRuleDir(dir);
  const on = all.filter((r) => r.enabled !== false);
  for (const r of on) if (r.kind === "tree" && !TREE[r.id]) throw new Error(`rules: unknown tree rule ${r.id}`);
  const subs = (kind) => on.filter((r) => r.kind === kind).flatMap((r) => r.subs.map(([p, f, rep]) => [new RegExp(p, f), rep]));
  const pixel = on.find((r) => r.id === "pixel") ?? { maxRatio: 0.005, threshold: 0.1 };
  const version = createHash("sha256").update(JSON.stringify(on)).digest("hex").slice(0, 12);
  return {
    version, ids: on.map((r) => r.id),
    tree: on.filter((r) => r.kind === "tree" || r.kind === "drop-attrs").map((r) => (r.kind === "tree" ? TREE[r.id] : dropAttrs(new Set(r.attrs)))),
    html: subs("html"), text: subs("text"), overlay: subs("overlay"),
    pixel: { maxRatio: pixel.maxRatio, threshold: pixel.threshold },
    shellRequests: (site) => new Set(on.filter((r) => r.kind === "shell-requests" && r.site === site).flatMap((r) => r.requests)),
  };
}

const applySubs = (s, subs) => subs.reduce((acc, [re, rep]) => acc.replace(re, rep), s);
// capture = { tree, ltgt } from domTreeInPage → normalised HTML string.
export function normHtml(capture, rules) {
  if (!capture?.tree) return "";
  const tree = rules.tree.reduce((t, fn) => fn(t), capture.tree);
  return applySubs(serialize(tree, capture.ltgt), rules.html);
}
export const normText = (s, rules) => applySubs(s ?? "", rules.text);
export const normOverlay = (s, rules) => applySubs(s ?? "", rules.overlay);

// Known differences (docs/pipeline.md §15.2 第 3 条): the register kept by tools/known-diff.mjs (HM-5) — the arbiter
// is the only writer — in $RESTORE_STATE/known-diffs/<slug(work order)>.json, an array of
// {wo, evidence:"<original chunk file>:<position>", why, diff, by, at}. The gate reads `diff` in one of two forms:
//   "<where>.<check>"                          waive the gate's failure item of that comparison, e.g. "load.overlay",
//                                              "steps.requests", "load.pixel", "steps.step-error" (coarse);
//   {"where":"load.html","orig":"…","rest":"…"} (as a JSON string) replace that fragment on each side by one placeholder
//                                              before comparing; requests: drop that request ("GET /xf-job/x") (precise).
// An entry is applied only when `by` is set, the evidence file exists (relative to this repo, or a file name under
// legacy-dist/<site>/assets/) and `diff` is one of the forms above; other entries are reported as unusable, not applied.
// Entries get the id <slug>#<n> (n = position in the append-only array).
export const KNOWN_WHERE = ["load.html", "load.text", "load.overlay", "load.requests", "steps.requests", "final.html", "final.text", "final.overlay"];
const WAIVABLE = /^(load|steps|final)\.[a-z-]+$/;
export function loadKnownDiffs(wo, { state, site }) {
  const file = path.join(state, "known-diffs", `${slug(wo)}.json`);
  const raw = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : [];
  const list = [], unusable = [];
  for (const [i, k] of (Array.isArray(raw) ? raw : []).entries()) {
    const id = `${slug(wo)}#${i + 1}`;
    const why = knownProblem(k, wo, site);
    if (why) { unusable.push({ id, why }); continue; }
    const d = String(k.diff).trim();
    if (d.startsWith("{")) { const o = JSON.parse(d); list.push({ id, where: o.where, orig: o.orig ?? null, rest: o.rest ?? null }); }
    else list.push({ id, waive: d });
  }
  return { list, unusable, file };
}
function knownProblem(k, wo, site) {
  if (!k || typeof k !== "object") return "not an object";
  if (k.wo !== undefined && k.wo !== wo) return `entry is for ${k.wo}`;
  if (!k.by) return "no by";
  const m = /^(.+?):(\d.*)$/.exec(String(k.evidence ?? ""));
  if (!m) return "evidence is not <file>:<position>";
  const f = m[1];
  if (!existsSync(path.join(ROOT, f)) && !existsSync(path.join(ROOT, "legacy-dist", site, "assets", path.basename(f)))) return `evidence file ${f} not found`;
  if (k.diff == null || String(k.diff).trim() === "") return "no diff (known-diff.mjs add … --diff)";
  const d = String(k.diff).trim();
  if (d.startsWith("{")) {
    let o;
    try { o = JSON.parse(d); } catch { return "diff is not valid JSON"; }
    if (!KNOWN_WHERE.includes(o.where)) return `diff.where must be one of ${KNOWN_WHERE.join(", ")}`;
    const isList = o.where.endsWith(".requests");
    if (isList ? o.orig == null && o.rest == null : typeof o.orig !== "string" || typeof o.rest !== "string" || !o.orig || !o.rest) return isList ? "diff needs orig or rest" : "diff needs both orig and rest strings";
    return null;
  }
  return WAIVABLE.test(d) ? null : 'diff must be "<where>.<check>" or a JSON fragment';
}
// Gate failure items covered by "<where>.<check>" entries: [kept, waived].
export function waiveKnown(failed, known, used) {
  const keep = [], waived = [];
  for (const f of failed) {
    const k = known.find((x) => x.waive && x.waive === `${f.where}.${f.check}`);
    if (k) { used.add(k.id); waived.push({ ...f, known: k.id }); } else keep.push(f);
  }
  return [keep, waived];
}
// Replace the registered fragments on both sides by one placeholder (strings), or drop the request (request lists).
export function applyKnown(where, side, value, known, used) {
  for (const k of known) {
    if (!k.where || k.where !== where) continue;
    const frag = side === "orig" ? k.orig : k.rest;
    if (frag == null) continue;
    if (Array.isArray(value)) { const n = value.length; value = value.filter((x) => x !== frag); if (value.length !== n) used.add(k.id); }
    else if (value.includes(frag)) { value = value.split(frag).join(`⟦known:${k.id}⟧`); used.add(k.id); }
  }
  return value;
}
