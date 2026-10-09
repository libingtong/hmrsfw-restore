// Post-processing of restored .vue files (global notes §6 rule 7): inline base64 / data: resources become files, and
// minified CSS in <style> blocks is expanded one declaration per line. Neither may stay as copied from the build.
//   <template>  src="data:…" / href="data:…"  → "./…/assets/<file>" (compiler-sfc turns relative asset URLs into imports)
//   <script>    "data:…" string literals      → an `import <id> from "./…/assets/<file>"` and the identifier
//   <style>     url(data:…)                   → url(./…/assets/<file>); minified rules expanded (plain CSS only, not lang=scss/less)
// Every changed <style> block is checked: same rules, selectors and declarations as before (data: URIs compared as
// their file). Asset file names are <file stem>-<sha256 10>.<ext>, so repeated runs write nothing new.
// css-by-scope.mjs --write runs this on every component file it writes.
//
// Usage: node tools/postprocess-vue.mjs <file.vue | dir> ... [--assets-dir <dir>] [--write]
//   --assets-dir  where extracted files go (default: <dir of the file>/assets); page orders keep them in the page directory
//   without --write: report only (exit 1 when something would change)
// Library: import { postprocessVue } from "./postprocess-vue.mjs";
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parse } from "@babel/parser";
import { postcss, EXT, renderCss, roundtrip } from "./css-utils.mjs";

const DATA = /^data:([a-z0-9.+/-]+)((?:;[a-z0-9=.+-]+)*?)(;base64)?,(.*)$/is;
const decode = (uri) => { const m = uri.match(DATA); if (!m || !EXT[m[1].toLowerCase()]) return null; return { ext: EXT[m[1].toLowerCase()], buf: m[3] ? Buffer.from(m[4], "base64") : Buffer.from(decodeURIComponent(m[4]), "utf8") }; };
const relUrl = (fromFile, dir) => { const r = path.relative(path.dirname(fromFile), dir).split(path.sep).join("/"); return r === "" ? "." : r.startsWith(".") ? r : "./" + r; };
const MINIFIED = (css) => css.split("\n").some((l) => l.length > 200 || /\{[^}\n]*;[^}\n]*\}/.test(l));

/** Returns {changed, source, assets:[{name, bytes, buf}], notes:[...], styleChecks:[...]} for one .vue file. */
export function postprocessVue(file, { assetsDir = path.join(path.dirname(file), "assets"), source = readFileSync(file, "utf8") } = {}) {
  const stem = path.basename(file, ".vue"); const rel = relUrl(file, assetsDir); const assets = new Map(); const notes = []; const styleChecks = [];
  const store = (uri) => { const d = decode(uri); if (!d) return null; const name = `${stem}-${createHash("sha256").update(d.buf).digest("hex").slice(0, 10)}.${d.ext}`; assets.set(name, d.buf); return name; };
  let out = source;

  // <style> blocks
  out = out.replace(/(<style\b([^>]*)>)([\s\S]*?)(<\/style>)/g, (m, open, attrs, css, close) => {
    if (/\blang\s*=\s*["'](?!css)/.test(attrs)) { if (/data:/.test(css)) notes.push("data: URI in a non-CSS <style lang> block left as is"); return m; }
    if (!/url\(\s*["']?data:/i.test(css) && !MINIFIED(css)) return m;
    const root = postcss.parse(css); const uriOf = new Map();
    root.walkDecls((d) => { d.value = d.value.replace(/url\(\s*(["']?)(data:[^"')]*)\1\s*\)/gi, (u, q, uri) => { const name = store(uri); if (!name) return u; uriOf.set(`url(${rel}/${name})`, u); return `url(${rel}/${name})`; }); });
    const next = renderCss(root);
    const check = roundtrip(next, postcss.parse(css), { scoped: false, assetMap: uriOf }); styleChecks.push(check);
    if (!check.ok) { notes.push("style block left as is: expanded form would not be equivalent"); return m; }
    return `${open}\n${next}\n${close}`;
  });

  // <template> attributes
  out = out.replace(/(<template\b[^>]*>)([\s\S]*)(<\/template>)/, (m, open, body, close) => open + body.replace(/(\s(?:src|href|poster)=)(["'])(data:[^"']*)\2/gi, (a, attr, q, uri) => { const name = store(uri); return name ? `${attr}${q}${rel}/${name}${q}` : a; }) + close);
  if (/<template\b[\s\S]*data:image[\s\S]*<\/template>/.test(out)) notes.push("data: URI left in <template> (not in a src/href/poster attribute)");

  // <script> string literals
  out = out.replace(/(<script\b([^>]*)>)([\s\S]*?)(<\/script>)/g, (m, open, attrs, code, close) => {
    if (!/["'`]data:/.test(code)) return m;
    let ast; try { ast = parse(code, { sourceType: "module", plugins: [/lang=["']tsx?["']/.test(attrs) ? "typescript" : null, "jsx"].filter(Boolean), errorRecovery: true }); } catch { notes.push("script not parsed; data: URIs left"); return m; }
    const hits = []; const imports = new Map(); let lastImportEnd = 0;
    const visit = (n) => { if (!n || typeof n.type !== "string") return; if (n.type === "ImportDeclaration") lastImportEnd = Math.max(lastImportEnd, n.end);
      if ((n.type === "StringLiteral" || (n.type === "TemplateLiteral" && !n.expressions.length)) && /^data:/.test(n.value ?? n.quasis?.[0]?.value.cooked)) { const name = store(n.value ?? n.quasis[0].value.cooked); if (name) { const id = imports.get(name) ?? `${stem.replace(/[^A-Za-z0-9_$]/g, "_")}Asset${imports.size + 1}`; imports.set(name, id); hits.push({ start: n.start, end: n.end, id }); } }
      for (const k of Object.keys(n)) { if (k === "loc") continue; const v = n[k]; if (Array.isArray(v)) v.forEach(visit); else if (v && typeof v.type === "string") visit(v); } };
    visit(ast.program);
    if (!hits.length) return m;
    let c = code; for (const h of hits.sort((a, b) => b.start - a.start)) c = c.slice(0, h.start) + h.id + c.slice(h.end);
    const lines = [...imports].map(([name, id]) => `import ${id} from "${rel}/${name}";`).join("\n");
    c = lastImportEnd ? c.slice(0, lastImportEnd) + "\n" + lines + c.slice(lastImportEnd) : "\n" + lines + c;
    return open + c + close;
  });
  return { changed: out !== source, source: out, assets: [...assets].map(([name, buf]) => ({ name, bytes: buf.length, buf })), notes, styleChecks };
}

export function writePostprocessed(file, res, assetsDir) {
  if (res.changed) writeFileSync(file, res.source);
  if (res.assets.length) { mkdirSync(assetsDir, { recursive: true }); for (const a of res.assets) writeFileSync(path.join(assetsDir, a.name), a.buf); }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  const args = process.argv.slice(2); const ai = args.indexOf("--assets-dir");
  const targets = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--assets-dir");
  if (!targets.length) { console.error(JSON.stringify({ error: "usage: node tools/postprocess-vue.mjs <file.vue | dir> ... [--assets-dir <dir>] [--write]" })); process.exit(2); }
  const files = []; const walk = (p) => { const st = statSync(p); if (st.isDirectory()) { for (const n of readdirSync(p)) if (n !== "node_modules" && n !== "dist") walk(path.join(p, n)); } else if (p.endsWith(".vue")) files.push(p); };
  targets.forEach((t) => walk(path.resolve(t)));
  const report = []; let pending = 0, bad = 0;
  for (const f of files) {
    const assetsDir = ai >= 0 ? path.resolve(args[ai + 1]) : path.join(path.dirname(f), "assets");
    const res = postprocessVue(f, { assetsDir });
    if (!res.changed && !res.notes.length) continue;
    if (res.styleChecks.some((c) => !c.ok)) bad++;
    if (args.includes("--write")) writePostprocessed(f, res, assetsDir); else if (res.changed) pending++;
    report.push({ file: path.relative(process.cwd(), f), changed: res.changed, assets: res.assets.map((a) => ({ name: a.name, bytes: a.bytes })), styleBlocksChecked: res.styleChecks.length, styleBlocksEquivalent: res.styleChecks.filter((c) => c.ok).length, notes: res.notes });
  }
  console.log(JSON.stringify({ files: files.length, changed: report.filter((r) => r.changed).length, written: args.includes("--write"), report }, null, 1));
  process.exitCode = bad || pending ? 1 : 0;
}
