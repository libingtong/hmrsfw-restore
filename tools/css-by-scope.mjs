// Gives each component its styles back from the compiled stylesheets (global notes §6 rule 6: restorers do not write
// <style>; this script does). Scoped rules are found by their `data-v-<hash>` attribute, the attribute is taken out again
// (the exact inverse of @vue/compiler-sfc's scoped transform: `:deep()`, `:slotted()`, keyframe renaming), and the result
// is written into the component's .vue as `<style scoped>`, expanded one declaration per line. Inline base64 / data: URIs
// become files under the page's `assets/` directory. Every generated block is compiled back with the SAME compiler-sfc
// version as the original build (portal 3.2.47 tools/vuefp, uc 3.3.4 tools/vuefp33) and must reproduce the original rules
// exactly; any rule that does not is reported and the run fails.
//
// Which component owns which scopeId comes from the chunk itself: `_export_sfc(Comp, [["__scopeId","data-v-…"]])` with
// Comp's `__name` (or `name`). The default export of the chunk is the page's main component (→ work order `target`);
// the others go to `<subComponentDir>/<Name>.vue`. Rules without a scope attribute in the same stylesheet (a plain
// <style> block of the component) are kept in a separate non-scoped <style> of the component they sit next to.
//
// Usage:
//   node tools/css-by-scope.mjs <work-order id> [--orders <file> | --queue <dir>] [--app <hmrsfw-vue>] [--write | --check]
//       default: print the plan as JSON (per component: file, rule counts, assets, roundtrip) without writing
//       --write  replace every <style> block of each component file with the generated ones, write extracted assets,
//                then run postprocess-vue.mjs on the file (data: URIs in template/script → assets)
//       --check  exit 1 when a component's current <style> blocks differ from what would be generated
//   node tools/css-by-scope.mjs --chunk <legacy-dist/…/x.js> [--css <file> ...]   → the generated CSS per scopeId (stdout)
// Work orders: queue/<id>.json (docs/pipeline.md §12) or an entry of --orders <file> (e.g. tools/confirm-orders.json).
// Fields used: sourceChunk, target, subComponentDir, app|site, cssCandidates (optional: when absent every .css in the
// chunk's assets directory is searched). Library: import { planStyles, componentsOfChunk, scopedCss, unscopeSelector,
// formatVueStyles, writeStyles, checkStyles } from "./css-by-scope.mjs" (CSS rendering and the roundtrip: ./css-utils.mjs).
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parse } from "@babel/parser";
import { postcss, splitSelector, joinParts, EXT, DATA_URI, extractDataUris, renderCss, roundtrip } from "./css-utils.mjs";
import { postprocessVue, writePostprocessed } from "./postprocess-vue.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// ---------------------------------------------------------------- chunk: scopeId → component
const strOf = (n) => (n?.type === "StringLiteral" ? n.value : n?.type === "TemplateLiteral" && !n.expressions.length ? n.quasis[0].value.cooked : undefined);
const propOf = (obj, key) => obj?.properties?.find((p) => p.type === "ObjectProperty" && (p.key.name === key || p.key.value === key));
/** [{scopeId, name, local, isDefault}] for every `_export_sfc(Comp, [["__scopeId", id]])` in the chunk, plus `defaultName`. */
export function componentsOfChunk(chunkFile) {
  const code = readFileSync(chunkFile, "utf8");
  const ast = parse(code, { sourceType: "module", allowAwaitOutsideFunction: true, errorRecovery: true });
  const inits = new Map(); const found = []; let defaultLocal;
  const visit = (n, parent) => {
    if (!n || typeof n.type !== "string") return;
    if (n.type === "VariableDeclarator" && n.id.type === "Identifier" && n.init) inits.set(n.id.name, n.init);
    if (n.type === "ExportNamedDeclaration") for (const s of n.specifiers ?? []) if ((s.exported.name ?? s.exported.value) === "default") defaultLocal = s.local.name;
    if (n.type === "ExportDefaultDeclaration" && n.declaration.type === "Identifier") defaultLocal = n.declaration.name;
    if (n.type === "CallExpression" && n.arguments.length === 2 && n.arguments[1].type === "ArrayExpression") {
      const pair = n.arguments[1].elements.find((e) => e?.type === "ArrayExpression" && strOf(e.elements[0]) === "__scopeId");
      if (pair) found.push({ scopeId: strOf(pair.elements[1]), comp: n.arguments[0], wrapper: parent?.type === "VariableDeclarator" ? parent.id.name : undefined });
    }
    for (const k of Object.keys(n)) { if (k === "loc" || k === "start" || k === "end") continue; const v = n[k]; if (Array.isArray(v)) v.forEach((c) => visit(c, n)); else if (v && typeof v.type === "string") visit(v, n); }
  };
  visit(ast.program);
  const objOf = (n, depth = 0) => { if (!n || depth > 4) return; if (n.type === "ObjectExpression") return n; if (n.type === "CallExpression") return objOf(n.arguments[0], depth + 1); if (n.type === "Identifier") return objOf(inits.get(n.name), depth + 1); if (n.type === "AssignmentExpression") return objOf(n.right, depth + 1); };
  const nameOf = (n) => { const o = objOf(n); return strOf(propOf(o, "__name")?.value) ?? strOf(propOf(o, "name")?.value); };
  // the default export may be the _export_sfc result itself or a variable holding it
  let dl = defaultLocal; for (let i = 0; i < 4 && dl && inits.get(dl)?.type === "Identifier"; i++) dl = inits.get(dl).name;
  const out = found.map((f) => ({ scopeId: f.scopeId, name: nameOf(f.comp), local: f.comp.type === "Identifier" ? f.comp.name : undefined, isDefault: !!dl && (f.wrapper === dl || f.comp.name === dl) }));
  const defaultName = out.find((c) => c.isDefault)?.name ?? (dl ? nameOf({ type: "Identifier", name: dl }) : undefined);
  return { components: out, defaultName };
}

// ---------------------------------------------------------------- selectors
const attrRe = (id, slotted) => new RegExp(`\\[${id}${slotted ? "-s" : ""}\\]`, "g");
/** Which of `ids` occur in a selector: [{id, slotted}]. */
export const scopesIn = (sel, ids) => ids.flatMap((id) => [...(sel.match(attrRe(id, true)) ? [{ id, slotted: true }] : []), ...(sel.replace(attrRe(id, true), "").match(attrRe(id, false)) ? [{ id, slotted: false }] : [])]);
/** Inverse of compiler-sfc's rewriteSelector for one selector of scope `id`. Returns the source selector or null. */
export function unscopeSelector(sel, id, slotted = false) {
  const re = attrRe(id, slotted); const parts = splitSelector(sel);
  const idx = parts.findIndex((p) => p.t === "c" && p.v.match(re));
  if (idx < 0 || parts.some((p, i) => i !== idx && p.t === "c" && p.v.match(re))) return null;
  const compound = parts[idx].v.replace(re, "");
  if (slotted) return idx === parts.length - 1 ? joinParts([...parts.slice(0, idx), { t: "c", v: `:slotted(${compound || "*"})` }]) : null;
  // the attribute goes after the last non-pseudo part, so it leads a compound only for pure pseudos (`[data-v]:root`) —
  // or for the deprecated `::v-deep.x`, which compiles to `[data-v].x` and has no :deep() equivalent
  if (idx === parts.length - 1 && parts[idx].v.search(re) === 0 && compound && !compound.startsWith(":")) return joinParts([...parts.slice(0, idx), { t: "c", v: `::v-deep${compound}` }]);
  if (idx === parts.length - 1) return joinParts([...parts.slice(0, idx), { t: "c", v: compound || "*" }]);
  // attribute on an inner compound: everything after it was written inside :deep()
  const comb = parts[idx + 1].v; const rest = joinParts(parts.slice(idx + 2));
  const head = compound ? [...parts.slice(0, idx), { t: "c", v: compound }] : parts.slice(0, idx);
  if (!head.length) return comb === " " ? `:deep(${rest})` : null;
  return joinParts(head) + (comb === " " ? " " : ` ${comb} `) + `:deep(${rest})`;
}

// ---------------------------------------------------------------- stylesheet → per-scope rule lists
const shortId = (id) => id.replace(/^data-v-/, "");
/**
 * Splits the given stylesheets into {[scopeId]: postcss Root (scoped), [scopeId + ":plain"]: Root (unscoped rules next
 * to that scope)} with selectors already unscoped and keyframes renamed back. Also returns the original rules per
 * scope (for the roundtrip) and the problems found.
 */
export function scopedCss(cssFiles, ids) {
  const out = {}, originals = {}, problems = [], sources = {};
  const rootFor = (key) => (out[key] ??= postcss.root());
  const origFor = (key) => (originals[key] ??= postcss.root());
  for (const file of cssFiles) {
    const css = postcss.parse(readFileSync(file, "utf8"), { from: file });
    // keyframes renamed by the scoped transform: name-<shortId>
    const kf = {}; css.walkAtRules(/keyframes$/i, (a) => { for (const id of ids) if (a.params.endsWith("-" + shortId(id))) (kf[id] ??= new Set()).add(a.params.slice(0, -shortId(id).length - 1)); });
    let lastScope = null; const pendingPlain = [];
    const ownerOfNode = (node) => {
      if (node.type === "rule") { const s = node.selectors.flatMap((x) => scopesIn(x, ids)); return s.length ? s[0].id : null; }
      if (node.type === "atrule" && /keyframes$/i.test(node.name)) return ids.find((id) => node.params.endsWith("-" + shortId(id))) ?? null;
      if (node.type === "atrule" && node.nodes) { const inner = new Set(); node.walkRules((r) => r.selectors.forEach((x) => scopesIn(x, ids).forEach((s) => inner.add(s.id)))); return inner.size ? [...inner] : null; }
      return null;
    };
    const unscopeRule = (rule, id) => {
      const sels = rule.selectors.map((s) => { const sc = scopesIn(s, [id]); if (!sc.length) return `:global(${s})`; const u = unscopeSelector(s, id, sc[0].slotted); if (u == null) problems.push({ file: path.basename(file), scopeId: id, selector: s, problem: "cannot unscope" }); return u ?? s; });
      const r = rule.clone({ selectors: sels });
      if (kf[id]) r.walkDecls(/^(-webkit-)?animation(-name)?$/i, (d) => { d.value = d.value.replace(new RegExp(`\\b(${[...kf[id]].map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})-${shortId(id)}\\b`, "g"), "$1"); });
      return r;
    };
    const addScoped = (id, node, orig) => { rootFor(id).append(node); origFor(id).append(orig.clone()); (sources[id] ??= new Set()).add(path.basename(file)); };
    for (const node of css.nodes) {
      const owner = ownerOfNode(node);
      if (owner == null) { if (node.type !== "comment") pendingPlain.push(node); continue; }
      const owners = Array.isArray(owner) ? owner : [owner];
      // unscoped rules that came before belong to the plain <style> of the component they sit next to
      if (pendingPlain.length) { const k = (lastScope ?? owners[0]) + ":plain"; pendingPlain.splice(0).forEach((n) => { rootFor(k).append(n.clone()); origFor(k).append(n.clone()); }); }
      if (node.type === "rule") addScoped(owner, unscopeRule(node, owner), node);
      else if (/keyframes$/i.test(node.name)) addScoped(owner, node.clone({ params: node.params.slice(0, -shortId(owner).length - 1) }), node);
      else for (const id of owners) {
        // at-rule (@media, @supports) holding rules of one or more scopes: one copy per scope with only its rules
        const copy = node.clone(); const orig = node.clone();
        copy.walkRules((r) => { if (!r.selectors.some((s) => scopesIn(s, [id]).length)) r.remove(); else r.replaceWith(unscopeRule(r, id)); });
        orig.walkRules((r) => { if (!r.selectors.some((s) => scopesIn(s, [id]).length)) r.remove(); });
        addScoped(id, copy, orig);
      }
      lastScope = owners[owners.length - 1];
    }
    if (pendingPlain.length && lastScope) pendingPlain.splice(0).forEach((n) => { rootFor(lastScope + ":plain").append(n.clone()); origFor(lastScope + ":plain").append(n.clone()); });
    if (pendingPlain.length) problems.push({ file: path.basename(file), problem: `${pendingPlain.length} unscoped rule(s) with no scoped neighbour (not assigned)` });
  }
  return { roots: out, originals, problems, sources: Object.fromEntries(Object.entries(sources).map(([k, v]) => [k, [...v]])) };
}

// ---------------------------------------------------------------- work order → plan
const appOf = (o) => (o.app ?? (o.site === "usercenter" ? "uc" : o.site)) === "uc" ? "uc" : "portal";
function loadOrder(id, args) {
  const ordersArg = args.indexOf("--orders"), queueArg = args.indexOf("--queue");
  if (ordersArg >= 0) { const o = JSON.parse(readFileSync(args[ordersArg + 1], "utf8")).find((x) => x.id === id); if (!o) throw new Error(`work order ${id} not in ${args[ordersArg + 1]}`); return o; }
  const f = path.join(queueArg >= 0 ? args[queueArg + 1] : path.join(ROOT, "queue"), `${id}.json`);
  if (!existsSync(f)) throw new Error(`work order not found: ${f} (use --orders <file> or --queue <dir>)`);
  return JSON.parse(readFileSync(f, "utf8"));
}
// work-order paths are relative to the product's apps/ directory (confirm orders) or to the checkout root
const inApp = (appDir, p) => [path.join(appDir, p), path.join(appDir, "apps", p)].find((x) => existsSync(x) || existsSync(path.dirname(x))) ?? path.join(appDir, "apps", p);
const findVue = (dir, name) => { if (!existsSync(dir)) return; for (const n of readdirSync(dir, { withFileTypes: true })) { const p = path.join(dir, n.name); if (n.isFile() && n.name === name + ".vue") return p; if (n.isDirectory() && n.name !== "assets") { const f = findVue(p, name); if (f) return f; } } };
const relUrl = (fromFile, dir) => { const r = path.relative(path.dirname(fromFile), dir).split(path.sep).join("/"); return r.startsWith(".") ? r : "./" + r; };

/**
 * Everything css-by-scope would write for a work order, without writing it:
 * {components:[{name, scopeId, file, blocks:[{scoped, css}], assets, rules, roundtrip}], assetsDir, problems, ok}.
 */
export function planStyles(order, { appDir }) {
  const app = appOf(order); const chunk = path.resolve(ROOT, order.sourceChunk);
  const { components, defaultName } = componentsOfChunk(chunk);
  const ids = components.map((c) => c.scopeId);
  const cssFiles = (order.cssCandidates?.length ? order.cssCandidates.map((f) => path.resolve(ROOT, f)) : readdirSync(path.dirname(chunk)).filter((f) => f.endsWith(".css")).map((f) => path.join(path.dirname(chunk), f)))
    .filter((f) => ids.some((id) => readFileSync(f, "utf8").includes(id)));
  const { roots, originals, problems, sources } = scopedCss(cssFiles, ids);
  const target = inApp(appDir, order.target); const subDir = order.subComponentDir ? inApp(appDir, order.subComponentDir) : path.join(path.dirname(target), path.basename(target, ".vue"));
  const assetsDir = path.join(subDir, "assets");
  const result = [];
  for (const c of components) {
    const isMain = c.isDefault || c.name === defaultName || c.name === path.basename(target, ".vue");
    const file = isMain ? target : path.join(subDir, `${c.name}.vue`);
    const resolved = existsSync(file) ? file : findVue(subDir, c.name) ?? file;
    const blocks = [], assets = [], rt = [];
    for (const [key, scoped] of [[c.scopeId, true], [c.scopeId + ":plain", false]]) {
      if (!roots[key]?.nodes.length) continue;
      const root = roots[key]; const before = root.toString();
      const extracted = extractDataUris(root, relUrl(resolved, assetsDir), shortId(c.scopeId));
      // asset url → the original data: URI, so the roundtrip compares against the untouched stylesheet
      const uriOf = new Map(); postcss.parse(before).walkDecls((d) => d.value.replace(DATA_URI, (m, q, uri) => { const buf = /;base64,/.test(uri) ? Buffer.from(uri.split(",")[1], "base64") : Buffer.from(decodeURIComponent(uri.slice(uri.indexOf(",") + 1)), "utf8"); const ext = EXT[uri.slice(5).split(/[;,]/)[0].toLowerCase()]; if (ext) uriOf.set(`url(${relUrl(resolved, assetsDir)}/${shortId(c.scopeId)}-${createHash("sha256").update(buf).digest("hex").slice(0, 10)}.${ext})`, m); return m; }));
      const css = renderCss(root);
      blocks.push({ scoped, css }); assets.push(...extracted);
      rt.push({ scoped, ...roundtrip(css, originals[key], { id: c.scopeId, scoped, app, assetMap: uriOf }) });
    }
    result.push({ name: c.name, scopeId: c.scopeId, main: isMain, file: path.relative(appDir, resolved), exists: existsSync(resolved), blocks, assets, rules: rt.reduce((n, r) => n + (r.rules ?? 0), 0), roundtrip: rt, sources: sources[c.scopeId] ?? [] });
  }
  const ok = !problems.length && result.every((c) => c.exists && c.roundtrip.every((r) => r.ok));
  return { id: order.id, app, chunk: path.relative(ROOT, chunk), css: cssFiles.map((f) => path.relative(ROOT, f)), assetsDir: path.relative(appDir, assetsDir), components: result, problems, ok };
}

// ---------------------------------------------------------------- .vue writing
const STYLE_BLOCK = /\n*<style\b[^>]*>[\s\S]*?<\/style>[ \t]*/g;
/** The generated <style> blocks as text (scoped first, then the plain one). */
export const formatVueStyles = (blocks) => blocks.map((b) => `<style${b.scoped ? " scoped" : ""}>\n${b.css}\n</style>\n`).join("\n");
const currentStyles = (src) => (src.match(/<style\b[^>]*>[\s\S]*?<\/style>/g) ?? []).join("\n");
const normStyle = (s) => s.replace(/\s+/g, " ").trim();
/** Writes the style blocks and their assets, then runs postprocess-vue.mjs (data: URIs in template/script) on each file. */
export function writeStyles(plan, { appDir }) {
  const written = [], notes = []; const dir = path.join(appDir, plan.assetsDir);
  for (const c of plan.components) {
    const file = path.join(appDir, c.file); if (!c.exists) continue;
    const src = readFileSync(file, "utf8"); const body = src.replace(STYLE_BLOCK, "").replace(/\s+$/, "\n");
    const styled = c.blocks.length ? `${body}\n${formatVueStyles(c.blocks)}` : body;
    if (c.assets.length) { mkdirSync(dir, { recursive: true }); for (const a of c.assets) writeFileSync(path.join(dir, a.name), a.buf); }
    const pp = postprocessVue(file, { assetsDir: dir, source: styled });
    if (pp.source !== src) { writeFileSync(file, pp.source); written.push(c.file); }
    writePostprocessed(file, { ...pp, changed: false }, dir);
    notes.push(...pp.notes.map((n) => `${c.file}: ${n}`));
  }
  return { written, notes };
}
export const checkStyles = (plan, { appDir }) => plan.components.filter((c) => c.exists).filter((c) => normStyle(currentStyles(readFileSync(path.join(appDir, c.file), "utf8"))) !== normStyle(c.blocks.length ? formatVueStyles(c.blocks) : "")).map((c) => c.file);

// ---------------------------------------------------------------- CLI
const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  const args = process.argv.slice(2);
  try {
    if (args.includes("--chunk")) {
      const chunk = path.resolve(args[args.indexOf("--chunk") + 1]); const { components } = componentsOfChunk(chunk);
      const css = args.flatMap((a, i) => (a === "--css" ? [path.resolve(args[i + 1])] : [])); const files = css.length ? css : readdirSync(path.dirname(chunk)).filter((f) => f.endsWith(".css")).map((f) => path.join(path.dirname(chunk), f)).filter((f) => components.some((c) => readFileSync(f, "utf8").includes(c.scopeId)));
      const { roots, problems } = scopedCss(files, components.map((c) => c.scopeId));
      for (const c of components) for (const key of [c.scopeId, c.scopeId + ":plain"]) if (roots[key]?.nodes.length) console.log(`/* ${c.name} ${key} */\n${renderCss(roots[key])}\n`);
      if (problems.length) { console.error(JSON.stringify({ problems })); process.exitCode = 1; }
    } else {
      const id = args.find((a, i) => !a.startsWith("--") && !["--orders", "--queue", "--app"].includes(args[i - 1]));
      if (!id) throw new Error("usage: node tools/css-by-scope.mjs <work-order id> [--orders <file> | --queue <dir>] [--app <dir>] [--write | --check]");
      const { appDir } = await import("./app-dir.mjs"); const APP = appDir(args);
      const plan = planStyles(loadOrder(id, args), { appDir: APP });
      const summary = { ...plan, components: plan.components.map(({ blocks, assets, ...c }) => ({ ...c, blocks: blocks.map((b) => ({ scoped: b.scoped, lines: b.css.split("\n").length })), assets: assets.map((a) => ({ name: a.name, bytes: a.bytes })) })) };
      if (args.includes("--check")) { const differ = checkStyles(plan, { appDir: APP }); console.log(JSON.stringify({ id, ok: plan.ok && !differ.length, differ, problems: plan.problems })); process.exitCode = plan.ok && !differ.length ? 0 : 1; }
      else if (args.includes("--write")) { if (!plan.ok) { console.log(JSON.stringify(summary)); throw new Error("not written: roundtrip mismatch, unresolved component file, or unassigned rules (see output)"); } const { written, notes } = writeStyles(plan, { appDir: APP }); console.log(JSON.stringify({ ...summary, written, notes })); }
      else console.log(JSON.stringify(summary, null, 1));
      if (!plan.ok) process.exitCode = 1;
    }
  } catch (e) { console.error(JSON.stringify({ error: e.message })); process.exitCode = 2; }
}
