// Feasibility prototype: render-function equivalence between an original compiled chunk and a restored .vue.
//   node tools/render-equiv.mjs <site> <original chunk> <restored.vue> [<restored sub.vue> ...]
// Pipeline (both sides end up as esbuild-minified ES2015, like the original Vite 4 build):
//   restored .vue --compiler-sfc (same Vue version, inlineTemplate, prod, hoistStatic)--> JS --esbuild(ts, es2015, minify)--> AST
//   original chunk --------------------------------------------------------------------------------------------------> AST
// For every component (defineComponent({ __name, setup })) the render function returned by setup is canonicalised:
//   - Vue runtime imports -> canonical API names (original via out/vue-exports.<site>.final.json, restored via import names)
//   - module-level constants (hoisted vnodes/props/class objects, scope-id wrappers) are inlined
//   - local bindings are alpha-renamed by first appearance; other free identifiers become "free"
//   - template-ref/closure references into setup state become "setup:<n>" (alpha by first appearance)
// and the canonical token streams are compared. Prints per component: equal / first divergence.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { parse } from "@babel/parser";
import traverseModule from "@babel/traverse";
const traverse = traverseModule.default ?? traverseModule;
const [site, origFile, ...restoredFiles] = process.argv.slice(2);
process.env.NODE_ENV = "production"; // the compiler-sfc CJS build reads __DEV__ from NODE_ENV (e.g. comment placeholders)
const req = createRequire(import.meta.url);
const vuefp = site === "portal" ? "./vuefp/" : "./vuefp33/";
const sfc = req(vuefp + "node_modules/@vue/compiler-sfc");
const esbuild = req("./vuefp/node_modules/esbuild");
// Vue runtime aliases, entry export names and API function names come from the public-library registry
// (registry/<app>.json, tools/registry.mjs), so the comparison needs nothing from the POC's out/ directory.
const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const reg = JSON.parse(readFileSync(path.join(REPO, "registry", `${site === "portal" ? "portal" : "uc"}.json`), "utf8"));
const aliases = reg.vue;
// entry-chunk export -> readable name, api chunk export -> function name
const shim = Object.fromEntries(Object.entries(reg.entry).filter(([, e]) => e.export).map(([a, e]) => [a, e.export]));
const apiMaps = {};
for (const [k, v] of Object.entries(reg.api)) { const [file, alias] = k.split("#"); (apiMaps[file] ??= {})[alias] = v.export; }
const baseName = (src) => path.basename(src).replace(/\.vue$/, "").replace(/\.(ts|js)$/, "").replace(/\.\d{10,}\d*$/, "");

async function compileRestored(file) {
  const src = readFileSync(file, "utf8");
  const { descriptor } = sfc.parse(src, { filename: file });
  const id = "x" + path.basename(file).replace(/\W/g, "");
  const script = sfc.compileScript(descriptor, { id, inlineTemplate: true, isProd: true, templateOptions: { isProd: true, compilerOptions: { hoistStatic: true, mode: "module" } } });
  const js = await esbuild.transform(script.content, { loader: "ts", target: "es2015", minify: true, format: "esm" });
  return js.code;
}

function components(code, kind) {
  const ast = parse(code, { sourceType: "module", plugins: ["topLevelAwait"] });
  // import local name -> canonical
  const imp = {};
  for (const n of ast.program.body) if (n.type === "ImportDeclaration") for (const s of n.specifiers) {
    const imported = s.imported?.name ?? "default";
    if (kind === "orig" && /\/vue\.\d+\.js$/.test(n.source.value)) imp[s.local.name] = "vue:" + (aliases[imported]?.name ?? imported);
    else if (kind === "rest" && ["vue", "vue-router", "pinia"].includes(n.source.value)) imp[s.local.name] = "vue:" + imported;
    else if (kind === "orig") {
      const file = path.basename(n.source.value);
      if (/^index\.\d+\.js$/.test(file)) imp[s.local.name] = "ext:" + (shim[imported] ?? "entry." + imported);
      else if (apiMaps[file]) imp[s.local.name] = "ext:" + (apiMaps[file][imported] ?? "api." + imported);
      else imp[s.local.name] = "ext:" + (imported === "default" || /^[a-z_$]$/.test(imported) ? "shared." + baseName(file) : baseName(file) + "." + imported);
    } else {
      imp[s.local.name] = "ext:" + (imported === "default" ? "shared." + baseName(n.source.value) : imported);
    }
  }
  // constants to inline: name -> init node (objects, arrays, literals, scope-id wrapper calls)
  const consts = new Map();
  traverse(ast, { VariableDeclarator(p) { if (p.node.id.type === "Identifier" && p.node.init) consts.set(p.node.id.name, p.node.init); }, AssignmentExpression(p) { if (p.node.left.type === "Identifier" && p.node.operator === "=" && !consts.has(p.node.left.name)) consts.set(p.node.left.name, p.node.right); } });
  const comps = [];
  traverse(ast, {
    ObjectExpression(p) {
      const nameProp = p.node.properties.find((q) => q.key && (q.key.name === "__name" || q.key.value === "__name"));
      if (!nameProp || nameProp.value.type !== "StringLiteral") return;
      const setup = p.node.properties.find((q) => q.key && q.key.name === "setup");
      if (!setup) return;
      const fn = setup.type === "ObjectMethod" ? setup : setup.value;
      const body = fn.body?.body ?? [];
      const ret = [...body].reverse().find((s) => s.type === "ReturnStatement");
      if (!ret || !ret.argument) return;
      const declared = new Set();
      p.get("properties").forEach((pp) => { if (pp.node === setup) pp.traverse({ VariableDeclarator(v) { if (v.node.id.type === "Identifier") declared.add(v.node.id.name); }, FunctionDeclaration(f) { if (f.node.id) declared.add(f.node.id.name); } }); });
      comps.push({ name: nameProp.value.value, render: ret.argument, setupBody: body, declared });
    },
  });
  return { ast, imp, consts, comps };
}

function canon(node, ctx, depth = 0) {
  const out = [];
  const locals = new Map();
  const visit = (n, d) => {
    if (n == null) { out.push("∅"); return; }
    if (Array.isArray(n)) { out.push("["); n.forEach((x) => visit(x, d)); out.push("]"); return; }
    if (typeof n !== "object") { out.push(String(n)); return; }
    if (d > 400) { out.push("…"); return; }
    switch (n.type) {
      case "Identifier": {
        const nm = n.name;
        if (ctx.imp[nm]) { out.push(ctx.imp[nm]); return; }
        if (ctx.params.has(nm)) { out.push("param:" + ctx.params.get(nm)); return; }
        if (locals.has(nm)) { out.push("local:" + locals.get(nm)); return; }
        if (ctx.consts.has(nm) && !ctx.inlining.has(nm) && !ctx.declared.has(nm)) { const init = ctx.consts.get(nm); if (["ObjectExpression", "ArrayExpression", "StringLiteral", "NumericLiteral", "BooleanLiteral", "UnaryExpression", "CallExpression", "ArrowFunctionExpression", "TemplateLiteral"].includes(init.type)) { ctx.inlining.add(nm); visit(init, d + 1); ctx.inlining.delete(nm); return; } }
        if (!ctx.setupNames.has(nm)) ctx.setupNames.set(nm, ctx.setupNames.size);
        out.push("ref:" + ctx.setupNames.get(nm)); return;
      }
      case "ArrowFunctionExpression": case "FunctionExpression": {
        n.params.forEach((pp) => { if (pp.type === "Identifier") ctx.params.set(pp.name, ctx.params.size); });
        out.push("fn(" + n.params.length + ")"); visit(n.params.map((pp) => pp.type === "Identifier" ? null : pp), d + 1); visit(n.body, d + 1); return;
      }
      case "CallExpression": {
        // scope-id wrapper: w(() => vnode)  where  w = e => (pushScopeId(id), e = e(), popScopeId(), e)
        const cal = n.callee; const init = cal.type === "Identifier" && !ctx.declared.has(cal.name) ? ctx.consts.get(cal.name) : null;
        if (init && init.type === "ArrowFunctionExpression" && init.body.type === "SequenceExpression" && n.arguments[0]?.type === "ArrowFunctionExpression") { out.push("scoped"); visit(n.arguments[0].body, d + 1); return; }
        break;
      }
      case "MemberExpression": case "OptionalMemberExpression": visit(n.object, d + 1); out.push(n.computed ? "[]" : "." + n.property.name); if (n.computed) visit(n.property, d + 1); return;
      case "ObjectProperty": { const k = String(n.key.name ?? n.key.value); const key = ctx.inStyle ? k.replace(/-([a-z])/g, (_, c) => c.toUpperCase()) : k; out.push("prop:" + key); const prev = ctx.inStyle; ctx.inStyle = k === "style" && n.value.type === "ObjectExpression"; visit(n.value, d + 1); ctx.inStyle = prev; return; }
      case "StringLiteral": out.push(/^data-v-/.test(n.value) ? "\"SCOPE\"" : JSON.stringify(n.value)); return;
      case "NumericLiteral": out.push("#" + n.value); return;
      case "BooleanLiteral": out.push(n.value ? "!0" : "!1"); return;
      case "UnaryExpression": if (n.operator === "!" && n.argument.type === "NumericLiteral") { out.push(n.argument.value ? "!1" : "!0"); return; } if (n.operator === "void") { out.push("undefined"); return; } break;
    }
    out.push(n.type + (n.operator ? n.operator : ""));
    for (const k of Object.keys(n)) {
      if (["type", "start", "end", "loc", "extra", "leadingComments", "trailingComments", "innerComments", "range", "operator", "computed", "optional", "shorthand", "method", "async", "generator", "expression", "id"].includes(k)) continue;
      visit(n[k], d + 1);
    }
  };
  visit(node, depth);
  return out;
}

const orig = components(readFileSync(origFile, "utf8"), "orig");
const restCode = (await Promise.all(restoredFiles.map(compileRestored)));
const rests = restCode.map((c) => components(c, "rest"));
const restByName = new Map(); rests.forEach((r) => r.comps.forEach((c) => restByName.set(c.name, { ...c, file: r })));
const report = [];
// <script setup> takes __name from the file name; the original may differ (e.g. "index"). Pair the single leftover on each side.
const unO = orig.comps.filter((c) => !restByName.has(c.name)), unR = [...restByName.keys()].filter((n) => !orig.comps.some((c) => c.name === n));
const alias = new Map(); if (unO.length === 1 && unR.length === 1) { alias.set(unO[0].name, unR[0]); }
for (const c of orig.comps) {
  const r = restByName.get(alias.get(c.name) ?? c.name);
  if (!r) { report.push({ component: c.name, result: "missing in restored" }); continue; }
  const a = canon(c.render, { declared: c.declared, imp: orig.imp, consts: orig.consts, params: new Map(), setupNames: new Map(), inlining: new Set() });
  const b = canon(r.render, { declared: r.declared, imp: r.file.imp, consts: r.file.consts, params: new Map(), setupNames: new Map(), inlining: new Set() });
  let i = 0; while (i < a.length && i < b.length && a[i] === b[i]) i++;
  const equal = i === a.length && i === b.length;
  report.push({ component: c.name, result: equal ? "EQUAL" : "DIFF", tokens: [a.length, b.length], firstDiffAt: equal ? null : i, original: equal ? undefined : a.slice(Math.max(0, i - 12), i + 12).join(" "), restored: equal ? undefined : b.slice(Math.max(0, i - 12), i + 12).join(" ") });
}
for (const name of restByName.keys()) if (!orig.comps.some((c) => c.name === name) && ![...alias.values()].includes(name)) report.push({ component: name, result: "extra in restored" });
console.log(JSON.stringify(report.map((r) => ({ c: r.component, r: r.result, t: r.tokens, o: r.original?.slice(0, 220), x: r.restored?.slice(0, 220) }))));
if (!process.env.RENDER_EQUIV_NO_FILE) { mkdirSync(path.join(REPO, "out"), { recursive: true }); writeFileSync(path.join(REPO, "out", `render-equiv.${path.basename(restoredFiles[0])}.json`), JSON.stringify(report, null, 1)); }
