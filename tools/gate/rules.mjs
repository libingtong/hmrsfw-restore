// Loads rules/compare/ (normalisation rules) and rules/known-diffs/ (known differences of the original code) and
// applies them. One JSON file per rule or entry, loaded in file-name order (see the README in each directory).
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { ROOT } from "./common.mjs";
import { dropEmptyComments, mapTree, serialize, sortAttrs } from "./dom.mjs";

export function readRuleDir(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith(".json")).sort().map((f) => {
    try { return JSON.parse(readFileSync(path.join(dir, f), "utf8")); } catch (e) { throw new Error(`${path.relative(ROOT, path.join(dir, f))}: ${e.message}`); }
  });
}

const stripTransition = (tree) => mapTree(tree, (n) => ({ ...n, a: n.a.map(([k, v]) => (k === "style" ? [k, v.replace(/(^|;)\s*(-webkit-)?transition(-[a-z-]+)?\s*:[^;]*;?/g, "$1").replace(/^\s+|\s+$/g, "")] : [k, v])) }));
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
const TREE = { "attr-order": sortAttrs, "empty-comment": dropEmptyComments, "style-transition": stripTransition, "motion-state": stripMotion };
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

// Known differences for one work order; entries whose evidence chunk does not exist are ignored and reported.
export function loadKnownDiffs(wo, dir = path.join(ROOT, "rules/known-diffs")) {
  const ok = [], invalid = [];
  for (const k of readRuleDir(dir)) {
    if (k.wo !== wo) continue;
    const chunk = k.evidence?.chunk;
    if (!k.id || !k.where || !chunk || !k.evidence.pos || !k.by || !existsSync(path.join(ROOT, chunk))) invalid.push(k.id ?? "(no id)");
    else ok.push(k);
  }
  return { list: ok, invalid };
}
// Replace the registered fragments on both sides by one placeholder (strings), or drop the request (request lists).
export function applyKnown(where, side, value, known, used) {
  for (const k of known) {
    if (k.where !== where) continue;
    const frag = side === "orig" ? k.orig : k.rest;
    if (frag == null) continue;
    if (Array.isArray(value)) { const n = value.length; value = value.filter((x) => x !== frag); if (value.length !== n) used.add(k.id); }
    else if (value.includes(frag)) { value = value.split(frag).join(`⟦known:${k.id}⟧`); used.add(k.id); }
  }
  return value;
}
