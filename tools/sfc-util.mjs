// Helpers shared by the static checks: loading a work order, the files it delivers, compiling SFCs with hmrsfw-vue's own
// @vue/compiler-sfc, and reading render-helper calls (text children, withDirectives) out of compiled or original code.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { parse } from "@babel/parser";
import traverseModule from "@babel/traverse";
import { ROOT } from "./scope.mjs";
const traverse = traverseModule.default ?? traverseModule;

export const loadOrder = (id) => {
  const f = path.join(ROOT, "queue", `${id}.json`);
  if (!existsSync(f)) throw new Error(`work order not found: queue/${id}.json`);
  return JSON.parse(readFileSync(f, "utf8"));
};
export const loadJson = (rel) => JSON.parse(readFileSync(path.join(ROOT, rel), "utf8"));

const sfcCache = new Map();
export function compilerSfc(APP) {
  if (!sfcCache.has(APP)) {
    process.env.NODE_ENV ??= "production";
    sfcCache.set(APP, createRequire(path.resolve(APP, "package.json"))("@vue/compiler-sfc"));
  }
  return sfcCache.get(APP);
}

// Paths under an order's subComponentDir that another order delivers (HM-468). work-orders.mjs derives subComponentDir
// from the target, so a nested route's page lands inside its parent page's directory: page.uc.personLoan.detailInfo
// (target apps/uc/src/views/personLoan/detailInfo.vue) sits in page.uc.personLoan's apps/uc/src/views/personLoan/.
// Such files are the other order's deliverable, judged by its own gate. → { files: Set(another order's target),
// dirs: [another order's subComponentDir, deeper than this one's] }, repo-relative; orders sharing this order's target
// or subComponentDir (its segments) are not "another order".
const queueCache = new Map();
function queueOrders(queueDir) {
  if (!queueCache.has(queueDir)) queueCache.set(queueDir, (existsSync(queueDir) ? readdirSync(queueDir) : []).filter((n) => n.endsWith(".json")).flatMap((n) => { try { const o = JSON.parse(readFileSync(path.join(queueDir, n), "utf8")); return o?.id ? [o] : []; } catch { return []; } }));
  return queueCache.get(queueDir);
}
const repoPath = (p) => p?.replace(/^restore\//, "").replace(/^\.\//, "");
const dirPath = (p) => p && repoPath(p).replace(/\/?$/, "/");
export function foreignPaths(order, queueDir = path.join(ROOT, "queue")) {
  const dir = dirPath(order.subComponentDir), files = new Set(), dirs = [];
  if (!dir) return { files, dirs };
  for (const o of queueOrders(queueDir)) {
    const t = repoPath(o.target), d = dirPath(o.subComponentDir);
    if (t && t.startsWith(dir) && t !== repoPath(order.target)) files.add(t);
    if (d && d.startsWith(dir) && d !== dir) dirs.push(d);
  }
  return { files, dirs };
}

// Every file under an order's subComponentDir except what another order delivers (foreignPaths); `skip(name)` drops
// entries by name (orderFiles skips _seg/).
export function subDirFiles(order, APP, { skip = () => false, queueDir } = {}) {
  if (!order.subComponentDir) return [];
  const { files, dirs } = foreignPaths(order, queueDir);
  const foreign = (p) => { const r = path.relative(path.resolve(APP), p).split(path.sep).join("/"); return files.has(r) || dirs.some((d) => `${r}/`.startsWith(d)); };
  const walk = (d) => existsSync(d) ? readdirSync(d).flatMap((n) => { const p = path.join(d, n); return skip(n) || foreign(p) ? [] : statSync(p).isDirectory() ? walk(p) : [p]; }) : [];
  return walk(path.resolve(APP, order.subComponentDir));
}

// The .vue files a page/segment/shared order delivers: its target, the relative .vue imports reachable from it, and the
// files under subComponentDir (excluding segment fragments and files of a nested order, see foreignPaths).
export function orderFiles(order, APP) {
  const abs = (rel) => path.resolve(APP, rel);
  const files = new Set();
  const start = order.target && existsSync(abs(order.target)) ? [abs(order.target)] : [];
  const q = [...start];
  while (q.length) {
    const f = q.shift(); if (files.has(f)) continue; files.add(f);
    if (!/\.(vue|ts)$/.test(f)) continue;
    for (const m of readFileSync(f, "utf8").matchAll(/from\s+["'](\.{1,2}\/[^"']+\.vue)["']/g)) { const p = path.resolve(path.dirname(f), m[1]); if (existsSync(p)) q.push(p); }
  }
  for (const f of subDirFiles(order, APP, { skip: (n) => n === "_seg" })) if (f.endsWith(".vue")) files.add(f);
  return [...files];
}

// compile one SFC; returns { descriptor, code (render module), script (compiled script incl. inline template), errors }
// A segment's template fragment (*.template.html) is compiled as the <template> of an otherwise empty SFC.
const compileCache = new Map();
export function compileSfc(sfc, file, id = "data-v-00000000") {
  const st = statSync(file); const ck = `${file}|${st.size}|${st.mtimeMs}`;
  if (compileCache.has(ck)) return compileCache.get(ck);
  const res = compileSfcUncached(sfc, file, id); compileCache.set(ck, res); return res;
}
function compileSfcUncached(sfc, file, id) {
  const raw = readFileSync(file, "utf8");
  const src = file.endsWith(".template.html") ? `<template>\n${raw}\n</template>\n` : raw;
  const { descriptor, errors } = sfc.parse(src, { filename: file });
  const out = { descriptor, errors: errors.map((e) => String(e.message ?? e)), code: "", script: "" };
  if (out.errors.length) return out;
  try {
    if (descriptor.template) {
      const ts = [descriptor.script, descriptor.scriptSetup].some((b) => b?.lang === "ts" || b?.lang === "tsx") || file.endsWith(".template.html");
      const t = sfc.compileTemplate({ source: descriptor.template.content, filename: file, id, scoped: descriptor.styles.some((s) => s.scoped), compilerOptions: { mode: "module", ...(ts ? { expressionPlugins: ["typescript"] } : {}) } });
      out.errors.push(...t.errors.map((e) => String(e.message ?? e)));
      out.code = t.code;
    }
    if (descriptor.script || descriptor.scriptSetup) out.script = sfc.compileScript(descriptor, { id, inlineTemplate: true, templateOptions: { compilerOptions: { expressionPlugins: ["typescript"] } } }).content;
  } catch (e) { out.errors.push(String(e.message ?? e).split("\n")[0]); }
  return out;
}

// Calls of Vue render helpers in a piece of code. `nameOf(callee identifier) → canonical helper name or null`.
// Returns { texts: [string], directives: [{name, arg, modifiers}], components: [string], directiveNames: [string] }
const VNODE = new Set(["createElementVNode", "createElementBlock", "createVNode", "createBlock"]);
export function renderFacts(code, nameOf, { range = null, plugins = [] } = {}) {
  const ast = parse(code, { sourceType: "module", plugins: ["topLevelAwait", "typescript", ...plugins], errorRecovery: true });
  const facts = { texts: [], directives: [], components: [], directiveNames: [], branches: 0 };
  const isTrue = (n) => n?.type === "BooleanLiteral" ? n.value : n?.type === "UnaryExpression" && n.operator === "!" && n.argument.type === "NumericLiteral" ? n.argument.value === 0 : false;
  const isFalse = (n) => n?.type === "BooleanLiteral" ? !n.value : n?.type === "UnaryExpression" && n.operator === "!" && n.argument.type === "NumericLiteral" ? n.argument.value !== 0 : false;
  const dirVars = new Map(); // local var → custom directive name (from resolveDirective("x"))
  // range: [s, e] or a list of them (a segment's factRanges); a call counts when it lies inside one of them
  const ranges = !range ? null : !range.length || Array.isArray(range[0]) ? range : [range];
  const inRange = (n) => !ranges || ranges.some(([s, e]) => n.start >= s && n.end <= e);
  const strParts = (n) => {
    if (!n) return [];
    if (n.type === "StringLiteral") return [n.value];
    // {{ x + "元" }} renders like {{ x }}元: string operands of a top-level + inside toDisplayString count as text
    if (n.type === "CallExpression" && n.callee.type === "Identifier" && nameOf(n.callee.name) === "toDisplayString" && n.arguments[0]?.type === "BinaryExpression" && n.arguments[0].operator === "+") return strParts(n.arguments[0]);
    if (n.type === "TemplateLiteral") return n.quasis.map((q) => q.value.cooked).filter((s) => s !== "");
    if (n.type === "BinaryExpression" && n.operator === "+") return [...strParts(n.left), ...strParts(n.right)];
    return [];
  };
  const htmlTexts = (html) => html.replace(/<!--[\s\S]*?-->/g, "").split(/<[^>]+>/).filter((t) => t.trim() !== "");
  traverse(ast, {
    VariableDeclarator(p) { const i = p.node.init; if (i?.type === "CallExpression" && i.callee.type === "Identifier" && nameOf(i.callee.name) === "resolveDirective" && i.arguments[0]?.type === "StringLiteral" && p.node.id.type === "Identifier") dirVars.set(p.node.id.name, i.arguments[0].value); },
    AssignmentExpression(p) { const i = p.node.right; if (i?.type === "CallExpression" && i.callee.type === "Identifier" && nameOf(i.callee.name) === "resolveDirective" && i.arguments[0]?.type === "StringLiteral" && p.node.left.type === "Identifier") dirVars.set(p.node.left.name, i.arguments[0].value); },
  });
  traverse(ast, {
    CallExpression(p) {
      const n = p.node; if (n.callee.type !== "Identifier" || !inRange(n)) return;
      const h = nameOf(n.callee.name); if (!h) return;
      // a v-if without v-else: `cond ? vnode : createCommentVNode("", true)`; a constant-false branch (folded by the
      // minifier, or written v-if="false") is not counted, so D2 (no v-if="false" in the source) stays neutral
      // (the minifier may invert `!c ? vnode : comment` into `c ? comment : vnode`, so either side counts)
      if (h === "createCommentVNode" && isTrue(n.arguments[1]) && p.parentPath.isConditionalExpression() && !isFalse(p.parentPath.node.test) && !isTrue(p.parentPath.node.test)) facts.branches++;
      if (h === "createTextVNode") facts.texts.push(...strParts(n.arguments[0]));
      else if (VNODE.has(h)) facts.texts.push(...strParts(n.arguments[2]));
      else if (h === "createStaticVNode" && n.arguments[0]?.type === "StringLiteral") facts.texts.push(...htmlTexts(n.arguments[0].value));
      else if (h === "resolveComponent" && n.arguments[0]?.type === "StringLiteral") facts.components.push(n.arguments[0].value);
      else if (h === "resolveDirective" && n.arguments[0]?.type === "StringLiteral") facts.directiveNames.push(n.arguments[0].value);
      else if (h === "withDirectives" && n.arguments[1]?.type === "ArrayExpression") {
        for (const d of n.arguments[1].elements) {
          if (d?.type !== "ArrayExpression") continue;
          const [dir, , arg, mods] = d.elements;
          const name = dir?.type === "Identifier" ? (nameOf(dir.name) ?? dirVars.get(dir.name) ?? `?${dir.name}`) : "?";
          facts.directives.push({ name: name.replace(/^v(?=[A-Z])/, "").replace(/^(ModelText|ModelSelect|ModelCheckbox|ModelRadio|ModelDynamic)$/, "model").replace(/^Show$/, "show"), arg: arg?.type === "StringLiteral" ? arg.value : null, modifiers: mods?.type === "ObjectExpression" ? mods.properties.map((x) => x.key?.name ?? x.key?.value).sort().join(".") : "" });
        }
      }
    },
  });
  return facts;
}

// name resolver for compiled SFC code: `_createTextVNode` / `createTextVNode as _createTextVNode`
export const compiledNameOf = (local) => local.startsWith("_") ? local.slice(1).replace(/^directive_.*/, "") || null : null;
// name resolver for an original chunk, from the order's maps.vue table (local → "createTextVNode" / "RouterLink (vue-router)")
export const originalNameOf = (mapsVue) => (local) => mapsVue[local]?.replace(/ \(.*\)$/, "") ?? null;

export const multisetDiff = (a, b) => {
  const count = (xs) => xs.reduce((m, x) => m.set(x, (m.get(x) ?? 0) + 1), new Map());
  const ca = count(a), cb = count(b); const onlyA = [], onlyB = [];
  for (const [k, v] of ca) for (let i = 0; i < v - (cb.get(k) ?? 0); i++) onlyA.push(k);
  for (const [k, v] of cb) for (let i = 0; i < v - (ca.get(k) ?? 0); i++) onlyB.push(k);
  return { onlyA, onlyB };
};
