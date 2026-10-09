// Map the renamed exports of a legacy vue chunk back to real Vue / vue-router / pinia names by function-body fingerprint.
// Usage: node tools/map-vue-exports.mjs <legacy vue chunk> <out json>
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
const [legacyPath, outPath, refArg] = process.argv.slice(2);
const refPath = path.resolve(refArg ?? "tools/vuefp/dist/vuefp.js");
const ref = await import(refPath);
const legacy = await import(path.resolve(legacyPath));
const KW = new Set("break case catch class const continue debugger default delete do else export extends finally for function if import in instanceof new return super switch this throw try typeof var void while with yield let static async await of null true false undefined".split(" "));
const tokenRe = /[A-Za-z_$][\w$]*|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|\d+(?:\.\d+)?|\s+|./g;
function tokens(src) { src = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:\\])\/\/[^\n]*/g, "$1"); return src.match(tokenRe).filter((t) => !/^\s+$/.test(t)); }
function canon(src) {
  let prev = "";
  return tokens(src).map((t) => {
    const isId = /^[A-Za-z_$][\w$]*$/.test(t) && !KW.has(t);
    const out = isId && prev !== "." ? "I" : t;
    prev = t;
    return out;
  }).join(" ");
}
function describe(v) {
  if (typeof v === "function") return { kind: "fn", src: v.toString() };
  if (typeof v === "symbol") return { kind: "sym", desc: v.description ?? "" };
  if (v && typeof v === "object") return { kind: "obj", keys: Object.keys(v).sort().join(",") };
  return { kind: typeof v, val: String(v) };
}
// reference: name -> descriptor (flatten namespaces)
const refEntries = [];
for (const [k, v] of Object.entries(ref)) {
  if ((k === "router" || k === "pinia") && v && typeof v === "object") for (const [k2, v2] of Object.entries(v)) refEntries.push([k2, v2, k]);
  else refEntries.push([k, v, "vue"]);
}
const refByCanon = new Map();
for (const [name, v, lib] of refEntries) {
  const d = describe(v);
  if (d.kind === "fn") { const c = canon(d.src); if (!refByCanon.has(c)) refByCanon.set(c, []); refByCanon.get(c).push({ name, lib, src: d.src }); }
}
const result = {}, unmatched = {}, ambiguous = {};
const localVotes = {}; // legacy local identifier -> {refLocal: count}
for (const [exp, v] of Object.entries(legacy)) {
  const d = describe(v);
  if (d.kind !== "fn") { unmatched[exp] = d; continue; }
  const c = canon(d.src);
  const hits = refByCanon.get(c);
  if (hits && hits.length === 1) {
    result[exp] = hits[0].name;
    // align identifiers to collect local-name correspondences
    const a = tokens(d.src), b = tokens(hits[0].src);
    if (a.length === b.length) for (let i = 0; i < a.length; i++) {
      if (/^[A-Za-z_$][\w$]*$/.test(a[i]) && !KW.has(a[i]) && a[i] !== b[i] && (i === 0 || a[i - 1] !== ".")) {
        localVotes[a[i]] ??= {}; localVotes[a[i]][b[i]] = (localVotes[a[i]][b[i]] ?? 0) + 1;
      }
    }
  } else if (hits && hits.length > 1) ambiguous[exp] = hits.map((h) => h.name);
  else {
    // fuzzy: same length canonical with small diff
    let best = null;
    for (const [rc, list] of refByCanon) {
      if (Math.abs(rc.length - c.length) > c.length * 0.1) continue;
      let same = 0; const n = Math.min(rc.length, c.length);
      for (let i = 0; i < n; i++) if (rc[i] === c[i]) same++;
      const score = same / Math.max(rc.length, c.length);
      if (score > 0.85 && (!best || score > best.score)) best = { score, names: list.map((l) => l.name) };
    }
    if (best && best.names.length === 1) result[exp] = best.names[0] + ` (fuzzy ${best.score.toFixed(2)})`;
    else unmatched[exp] = { ...d, src: d.src.slice(0, 120), fuzzy: best };
  }
}
// resolve the reference module's local names -> export names, to translate localVotes into real names for non-function exports
const refText = readFileSync(refPath, "utf8");
const refLocalToName = {};
for (const m of refText.matchAll(/export\{([^}]+)\}/g)) for (const part of m[1].split(",")) { const [l, n] = part.trim().split(/\s+as\s+/); refLocalToName[l] = n ?? l; }
for (const m of refText.matchAll(/([A-Za-z_$][\w$]*):([A-Za-z_$][\w$]*)/g)) if (!refLocalToName[m[2]] && /^[a-z]/.test(m[1]) && m[1].length > 3) refLocalToName[m[2]] ??= m[1];
const legacyText = readFileSync(legacyPath, "utf8");
const legacyLocalToExport = {};
for (const m of legacyText.matchAll(/export\{([^}]+)\}/g)) for (const part of m[1].split(",")) { const [l, n] = part.trim().split(/\s+as\s+/); legacyLocalToExport[l] = n ?? l; }
for (const [exp, d] of Object.entries(unmatched)) {
  const local = Object.entries(legacyLocalToExport).find(([, e]) => e === exp)?.[0];
  const votes = local && localVotes[local];
  if (votes) {
    const [refLocal] = Object.entries(votes).sort((x, y) => y[1] - x[1])[0];
    const name = refLocalToName[refLocal];
    if (name) { result[exp] = name + " (via usage)"; delete unmatched[exp]; }
  }
}
writeFileSync(outPath, JSON.stringify({ mapped: result, ambiguous, unmatched }, null, 2));
console.log("legacy exports", Object.keys(legacy).length, "mapped", Object.keys(result).length, "ambiguous", Object.keys(ambiguous).length, "unmatched", Object.keys(unmatched).length);
console.log("ambiguous", JSON.stringify(ambiguous));
console.log("unmatched", Object.keys(unmatched).join(","));
