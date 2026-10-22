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
// style="" is an empty declaration block: it renders exactly like no style attribute (no selector in either app tells the
// two apart: the original's stylesheets have no [style], the restored app only TinyMCE's [style*="border-width: 0px"]). It is left on an element once something wrote and cleared (or wrote an empty value into) its inline
// style, so whether it is there depends on the element's patch history at capture time, not on the page code (HM-262:
// the same 18 antd inputs carry it in the original at load and in the restored page after the interaction steps).
// Drop an empty (whitespace-only) style attribute; any non-empty style is compared as before.
const dropEmptyStyle = (tree) => mapTree(tree, (n) => ({ ...n, a: n.a.filter(([k, v]) => !(k === "style" && v.trim() === "")) }));
// Baidu map JS API tiles (vue-baidu-map-3x loads the map from api.map.baidu.com; both apps): each tile <img> is appended
// to the tile layer in its own onload (getscript `this.hb.onload=function(){…f.Mb.appendChild(i.hb)…}`), so the order of
// the tiles among their siblings is the order in which the downloads finished (two original runs already differ, HM-239).
// Sort an element's children by tile (z, y, x) when all of them are Baidu tile images; which tiles there are, their src
// (host shard, x/y/z, style version) and their style (position, size) are compared as before.
const TILE_SRC = /^https?:\/\/[\w-]+\.bdimg\.com\/tile\/\?/;
const srcOf = (n) => n.a.find(([k]) => k === "src")?.[1] ?? "";
const isTile = (n) => !!n && typeof n === "object" && n.t === "img" && TILE_SRC.test(srcOf(n));
const tileKey = (n) => { const q = new URLSearchParams(srcOf(n).split("?")[1]); return [Number(q.get("z")), Number(q.get("y")), Number(q.get("x")), srcOf(n)]; };
const byTile = (x, y) => { const a = tileKey(x), b = tileKey(y); for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1; return 0; };
const baiduTileOrder = (tree) => mapTree(tree, (n) => (n.c.length > 1 && n.c.every(isTile) ? { ...n, c: n.c.slice().sort(byTile) } : n));
// ant-design-vue's popups (vc-trigger PopupInner, both apps): every change of `visible` runs measure → align, closing
// included (useVisibleStatus sets 'measure' on any visible change; alignDisabled is false in 'align'), and vc-align only
// checks that the trigger is visible, not the popup. So right after a popup closes, dom-align positions it once more
// while it is display:none (zero rect): its inline left/top become a function of where the trigger sits in the document
// (a 90 px layout header above the page moves top by 90 px, HM-292), not of the page code. Opening re-aligns before the
// popup shows (opacity 0 until 'motion'), so these values are never rendered. On an element that vc-align has placed
// (class <prefix>-placement-<placement>, set from onAlign) and whose inline style has display: none, drop the left and
// top declarations; the rest of the style, a visible popup's position and every other element are compared as before.
const PLACED = /^ant-[a-z]+(-[a-z]+)*-placement-[a-zA-Z]+$/;
const decls = (v) => v.split(";").map((d) => d.trim()).filter(Boolean);
const prop = (d) => d.split(":")[0].trim().toLowerCase();
const hiddenPopupOffset = (tree) => mapTree(tree, (n) => {
  const cls = n.a.find(([k]) => k === "class")?.[1] ?? "", st = n.a.find(([k]) => k === "style")?.[1] ?? "";
  if (!cls.split(/\s+/).some((t) => PLACED.test(t)) || !decls(st).some((d) => prop(d) === "display" && /^none$/i.test(d.slice(d.indexOf(":") + 1).trim()))) return n;
  return { ...n, a: n.a.map(([k, v]) => (k === "style" ? [k, decls(v).filter((d) => prop(d) !== "left" && prop(d) !== "top").map((d) => d + ";").join(" ")] : [k, v])) };
});
const TREE = { "attr-order": sortAttrs, "empty-comment": dropEmptyComments, "style-transition": stripTransition, "motion-state": stripMotion, "slick-track-transition": slickTrackTransition, "empty-style": dropEmptyStyle, "baidu-tile-order": baiduTileOrder, "hidden-popup-offset": hiddenPopupOffset };
const dropAttrs = (names) => (tree) => mapTree(tree, (n) => ({ ...n, a: n.a.filter(([k]) => !names.has(k)) }));

export function loadRules(dir = path.join(ROOT, "rules/compare")) {
  const all = readRuleDir(dir);
  const on = all.filter((r) => r.enabled !== false);
  for (const r of on) if (r.kind === "tree" && !TREE[r.id]) throw new Error(`rules: unknown tree rule ${r.id}`);
  const subs = (kind) => on.filter((r) => r.kind === kind).flatMap((r) => r.subs.map(([p, f, rep]) => [new RegExp(p, f), rep]));
  const pixel = on.find((r) => r.id === "pixel") ?? { maxRatio: 0.005, threshold: 0.1 };
  const vc = on.find((r) => r.id === "volatile-canvas");
  const version = createHash("sha256").update(JSON.stringify(on)).digest("hex").slice(0, 12);
  return {
    version, ids: on.map((r) => r.id),
    tree: on.filter((r) => r.kind === "tree" || r.kind === "drop-attrs").map((r) => (r.kind === "tree" ? TREE[r.id] : dropAttrs(new Set(r.attrs)))),
    html: subs("html"), text: subs("text"), overlay: subs("overlay"),
    pixel: { maxRatio: pixel.maxRatio, threshold: pixel.threshold },
    volatileCanvas: vc ? { inkRange: vc.inkRange } : null,
    shellRequests: (site) => new Set(on.filter((r) => r.kind === "shell-requests" && r.site === site).flatMap((r) => r.requests)),
    now: on.filter((r) => r.kind === "now").map((r) => ({ windowMs: r.windowMinutes * 60000 }))[0] ?? null,
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
// "Now" printed to the second (HM-1021). Both sides' page clocks start at the HAR's recording minute and run normally
// (replay.mjs), so a page that prints new Date() as YYYY-MM-DD HH:mm:ss shows the seconds that passed until it got
// there, which differ between any two runs. A date-time to the second (separators - or /, space or T) whose instant lies
// in [clock start, clock start + windowMinutes) is the replay clock's reading: its digits are replaced by #, the
// separators and the place where it stands stay compared. clock = the run's {start, tzOffset} (the page's
// getTimezoneOffset: the printed wall time is local); compareRuns uses the baseline's for both sides, so a baseline
// recorded before this rule has none and nothing is replaced on either side. Other date-times (data from the HAR, now
// minus a day, …) are compared as before.
const DATE_TIME = /\b(\d{4})([-/])(\d{2})\2(\d{2})[ T](\d{2}):(\d{2}):(\d{2})\b/g;
export function normNow(s, rules, clock) {
  if (!s || !rules.now || !Number.isFinite(clock?.start) || !Number.isFinite(clock?.tzOffset)) return s;
  return s.replace(DATE_TIME, (m, y, _sep, mo, d, h, mi, se) => {
    const at = Date.UTC(+y, +mo - 1, +d, +h, +mi, +se) + clock.tzOffset * 60000;
    return at >= clock.start && at < clock.start + rules.now.windowMs ? `⟦now ${m.replace(/\d/g, "#")}⟧` : m;
  });
}

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
