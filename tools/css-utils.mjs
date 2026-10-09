// Shared CSS helpers for css-by-scope.mjs and postprocess-vue.mjs: selector splitting, data: URI extraction, the
// expanded rendering, and the roundtrip (compile the generated CSS with the original compiler-sfc version and compare
// it rule by rule with the original). postcss and compiler-sfc come from tools/vuefp (Vue 3.2.47, portal) and
// tools/vuefp33 (Vue 3.3.4, user center), as in render-equiv.mjs.
import { createRequire } from "node:module";
import { createHash } from "node:crypto";

const req = createRequire(import.meta.url);
export const postcss = req("./vuefp/node_modules/postcss");
export const sfcFor = (app) => req(app === "portal" ? "./vuefp/node_modules/@vue/compiler-sfc" : "./vuefp33/node_modules/@vue/compiler-sfc");

// Top-level split of one selector into compounds and combinators, respecting [], (), strings.
export function splitSelector(sel) {
  const parts = []; let cur = "", depth = 0, quote = null;
  const flushComb = (c) => { if (cur) parts.push({ t: "c", v: cur }); cur = ""; const last = parts[parts.length - 1]; if (last?.t === "k") { if (c !== " ") last.v = c; } else parts.push({ t: "k", v: c }); };
  for (let i = 0; i < sel.length; i++) {
    const ch = sel[i];
    if (quote) { cur += ch; if (ch === "\\") cur += sel[++i] ?? ""; else if (ch === quote) quote = null; continue; }
    if (ch === "\\") { cur += ch + (sel[++i] ?? ""); continue; }
    if (ch === '"' || ch === "'") { quote = ch; cur += ch; continue; }
    if (ch === "[" || ch === "(") depth++; else if (ch === "]" || ch === ")") depth--;
    if (depth === 0 && (ch === " " || ch === "\n" || ch === "\t" || ch === ">" || ch === "+" || ch === "~")) { if (!cur && !parts.length) continue; flushComb(/\s/.test(ch) ? " " : ch); continue; }
    cur += ch;
  }
  if (cur) parts.push({ t: "c", v: cur });
  while (parts[parts.length - 1]?.t === "k") parts.pop();
  return parts;
}
export const joinParts = (parts) => parts.map((p) => (p.t === "k" ? (p.v === " " ? " " : ` ${p.v} `) : p.v)).join("");

// ---------------------------------------------------------------- data: URIs → files
export const EXT = { "image/png": "png", "image/jpeg": "jpg", "image/jpg": "jpg", "image/gif": "gif", "image/svg+xml": "svg", "image/webp": "webp", "image/x-icon": "ico", "font/woff": "woff", "font/woff2": "woff2", "application/font-woff": "woff", "font/ttf": "ttf", "application/x-font-ttf": "ttf", "font/otf": "otf" };
export const DATA_URI = /url\(\s*(["']?)(data:([a-z0-9.+/-]+)(;[a-z0-9=.+-]+)*?(;base64)?,([^"')]*))\1\s*\)/gi;
/** Replaces data: URIs in declaration values with url(<relDir>/<file>); returns the assets [{name, bytes, buf}]. */
export function extractDataUris(root, relDir, prefix) {
  const assets = new Map();
  root.walkDecls((d) => {
    d.value = d.value.replace(DATA_URI, (m, q, uri, mime, params, b64, data) => {
      const ext = EXT[mime.toLowerCase()]; if (!ext) return m;
      const buf = b64 ? Buffer.from(data, "base64") : Buffer.from(decodeURIComponent(data), "utf8");
      const name = `${prefix}-${createHash("sha256").update(buf).digest("hex").slice(0, 10)}.${ext}`;
      assets.set(name, buf); return `url(${relDir}/${name})`;
    });
  });
  return [...assets].map(([name, buf]) => ({ name, bytes: buf.length, buf }));
}

// ---------------------------------------------------------------- expanded rendering
export const prettySelector = (s) => joinParts(splitSelector(s.replace(/\s+/g, " ").trim()));
/** Readable CSS: one selector per line, one declaration per line, two-space indent. */
export function renderCss(root, indent = "") {
  const lines = [];
  root.each((n) => {
    if (n.type === "comment") { lines.push(`${indent}/* ${n.text} */`); return; }
    if (n.type === "decl") { lines.push(`${indent}${n.prop}: ${n.value.trim()}${n.important ? " !important" : ""};`); return; }
    if (n.type === "rule") { lines.push(n.selectors.map((s, i, a) => indent + prettySelector(s) + (i < a.length - 1 ? "," : " {")).join("\n")); lines.push(renderCss(n, indent + "  ")); lines.push(`${indent}}`); }
    else if (n.type === "atrule") { if (!n.nodes) lines.push(`${indent}@${n.name} ${n.params};`); else { lines.push(`${indent}@${n.name} ${n.params.replace(/\s+/g, " ").trim()} {`); lines.push(renderCss(n, indent + "  ")); lines.push(`${indent}}`); } }
    if (!indent) lines.push("");
  });
  return lines.filter((l) => l !== undefined).join("\n").replace(/\n{3,}/g, "\n\n").replace(/\n+$/, "");
}

// ---------------------------------------------------------------- roundtrip
const normSel = (s) => s.replace(/\s*([>+~])\s*/g, "$1").replace(/\s+/g, " ").replace(/(^|[\s>+~(,])\*(?=\[)/g, "$1").trim();
const normVal = (v) => v.replace(/\s+/g, " ").replace(/\s*,\s*/g, ",").trim();
export function canonicalCss(root) {
  const out = [];
  const walk = (node, pre) => node.each((n) => {
    if (n.type === "rule") { out.push(`${pre}${n.selectors.map(normSel).join(",")}{${n.nodes.filter((d) => d.type === "decl").map((d) => `${d.prop.toLowerCase()}:${normVal(d.value)}${d.important ? "!important" : ""}`).join(";")}}`); }
    else if (n.type === "atrule") { if (n.nodes) walk(n, `${pre}@${n.name} ${normVal(n.params)}|`); else out.push(`${pre}@${n.name} ${normVal(n.params)}`); }
  });
  walk(root, ""); return out;
}
/** Compiles `css` the way the original build did and compares it rule by rule with `original`. */
export function roundtrip(css, original, { id, scoped, app, assetMap }) {
  const sfc = sfcFor(app);
  let back = css; for (const [rel, uri] of assetMap ?? []) back = back.split(rel).join(uri);
  const r = scoped ? sfc.compileStyle({ source: back, filename: "x.vue", id, scoped: true, isProd: true }) : { code: back, errors: [] };
  if (r.errors?.length) return { ok: false, errors: r.errors.map(String).slice(0, 3) };
  const a = canonicalCss(postcss.parse(r.code)), b = canonicalCss(original);
  const mismatches = []; for (let i = 0; i < Math.max(a.length, b.length); i++) if (a[i] !== b[i]) mismatches.push({ i, generated: a[i]?.slice(0, 200), original: b[i]?.slice(0, 200) });
  return { ok: !mismatches.length, rules: b.length, mismatches: mismatches.slice(0, 5) };
}
