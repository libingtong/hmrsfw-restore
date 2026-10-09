// Frontend side of the API reconciliation (HM-23, tools/api-inventory.mjs): every backend endpoint the original bundles
// call, read from legacy-dist with @babel/parser. Three shapes are recognised:
//   1. api modules — `X=e=>a.request({url,method,params|data})` assigned to an exported binding (index.api.*.js and any
//      other chunk that exports such functions); a call site imports the export and calls it;
//   2. direct calls — a `{url:"<api path>", method, ...}` request config anywhere else (page, shared, entry chunk);
//   3. other literals — an api path that is not a request config's `url` (upload `action`, window.open, img src…).
// Paths are normalised to the gateway form `/<service>/<path>`: origin, `/xf-api` prefix and query are removed; a
// dynamic tail (`"/a/b/"+id`, template `${}`) becomes `{}`. Only names leave this module — keys of literal objects at
// call sites, never their values.
import { readdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;

const SERVICE_RE = /^\/?(?:xf-api\/+)?([A-Za-z][\w-]*)\/[\w{}./-]*/;
// A path is an api path when its first segment is a backend service name (xf-*, jeecg-*) or another gateway prefix seen
// in the bundles; the caller passes extra prefixes from the config (`apiPrefix`).
export const looksLikeApi = (s, prefixes) => {
  if (typeof s !== "string") return false;
  const t = s.replace(/^https?:\/\/[^/]+/, "");
  if (prefixes.some((p) => t.startsWith(p))) return true;
  return /^\/?(?:xf-[a-z]+|jeecg-[a-z]+)\/\w/.test(t);
};
// Looser test for a value that is already known to be a request url (`url:` of a request config, helper call argument,
// enum member used as a url): any relative path with two or more segments that is not a static asset.
const looksLikeUrlPath = (s, prefixes) => typeof s === "string" && (looksLikeApi(s, prefixes) || (/^\/?[A-Za-z][\w-]*\/[\w{}-]/.test(s) && !/\.(js|css|png|jpe?g|gif|svg|html?)(\?|$)/.test(s) && !/^\/?(assets|static|img|images)\//.test(s)));
const METHODS = new Set(["get", "post", "put", "delete", "patch"]);

/** `/xf-api/xf-job/a/b?x=1` → `/xf-job/a/b`; `{}` marks a dynamic segment. */
export function normPath(raw, apiPrefix = "/xf-api/") {
  let s = String(raw).replace(/^https?:\/\/[^/]+/, "").split(/[?#]/)[0].trim(); // a few bundle literals end in a space
  const pre = apiPrefix.replace(/^\/|\/$/g, "");
  s = s.replace(/^\/+/, "");
  if (s === pre || s.startsWith(pre + "/")) s = s.slice(pre.length);
  s = "/" + s.replace(/^\/+/, "").replace(/\/{2,}/g, "/");
  return s;
}
const queryKeysOf = (raw) => { const q = String(raw).split("?")[1]; return q ? [...new Set(q.split("&").map((kv) => kv.split("=")[0]).filter((k) => /^[\w.[\]-]+$/.test(k)))] : []; };

/** Static text of a url expression: string, template (`${}` → `{}`), `"lit" + expr` chains, or `Enum.member`. */
function urlText(node, enums = {}) {
  if (!node) return null;
  if (node.type === "MemberExpression" && !node.computed && node.property.type === "Identifier" && enums[node.property.name]) return { text: enums[node.property.name], dynamic: false, viaEnum: true };
  if (node.type === "StringLiteral") return { text: node.value, dynamic: false };
  if (node.type === "TemplateLiteral") return { text: node.quasis.map((q) => q.value.cooked ?? q.value.raw).join("{}"), dynamic: node.expressions.length > 0 };
  if (node.type === "BinaryExpression" && node.operator === "+") {
    const l = urlText(node.left, enums);
    if (!l) return null;
    const r = urlText(node.right, enums);
    return { text: l.text + (r ? r.text : "{}"), dynamic: true };
  }
  return null;
}
// After `"/a/b?x="+e` the dynamic part is a query value, not a path segment; after `"/a/b/"+e` it is a path variable.
const cleanDynamicPath = (t) => { const [p, q] = t.split("?"); return { p: p.replace(/\/\{\}.*$/, "/{}").replace(/([^/])\{\}.*$/, "$1{}"), q }; };

const propKey = (p) => (p.type === "ObjectProperty" || p.type === "ObjectMethod") && !p.computed ? (p.key.type === "Identifier" ? p.key.name : p.key.type === "StringLiteral" ? p.key.value : null) : null;
const objProp = (obj, name) => obj.properties.find((p) => propKey(p) === name);

/** Keys of an object argument, following one level of local bindings (`const q = reactive({..})`, `q.value`, `q.x = …`). */
function argKeys(argPath, depth = 0) {
  if (!argPath || depth > 3) return { keys: [], resolved: "none" };
  const n = argPath.node;
  if (n.type === "ObjectExpression") {
    const keys = []; let partial = false;
    argPath.get("properties").forEach((pp) => {
      const k = propKey(pp.node);
      if (k) keys.push(k);
      else if (pp.node.type === "SpreadElement") { const sub = argKeys(pp.get("argument"), depth + 1); keys.push(...sub.keys); if (sub.resolved !== "full") partial = true; }
      else partial = true;
    });
    return { keys, resolved: partial ? "partial" : "full" };
  }
  if (n.type === "CallExpression" && n.arguments[0]?.type === "ObjectExpression") { // reactive({..}) / ref({..}) / Object.assign({..}, x, …)
    const parts = n.arguments.map((_, i) => argKeys(argPath.get(`arguments.${i}`), depth + 1));
    const keys = [...new Set(parts.flatMap((p) => p.keys))];
    return { keys, resolved: parts.every((p) => p.resolved === "full") ? "full" : keys.length ? "partial" : "none" };
  }
  if (n.type === "Identifier") {
    const b = argPath.scope.getBinding(n.name);
    if (!b || !b.path.isVariableDeclarator() || !b.path.node.init) return { keys: [], resolved: "none" };
    const base = argKeys(b.path.get("init"), depth + 1);
    const extra = assignedKeys(b, null);
    return { keys: [...new Set([...base.keys, ...extra])], resolved: base.resolved === "none" && extra.length ? "partial" : base.resolved };
  }
  if (n.type === "MemberExpression" && n.object.type === "Identifier" && !n.computed) {
    const b = argPath.scope.getBinding(n.object.name);
    if (!b || !b.path.isVariableDeclarator() || !b.path.node.init) return { keys: [], resolved: "none" };
    const prop = n.property.name;
    let inner = { keys: [], resolved: "none" };
    const init = b.path.get("init");
    if (prop === "value" && init.isCallExpression() && init.node.arguments[0]) inner = argKeys(init.get("arguments.0"), depth + 1);
    else if (init.isObjectExpression() || (init.isCallExpression() && init.node.arguments[0]?.type === "ObjectExpression")) {
      const o = init.isObjectExpression() ? init : init.get("arguments.0");
      const pi = o.node.properties.findIndex((p) => propKey(p) === prop);
      if (pi >= 0 && o.node.properties[pi].type === "ObjectProperty") inner = argKeys(o.get(`properties.${pi}.value`), depth + 1);
    }
    const extra = assignedKeys(b, prop);
    return { keys: [...new Set([...inner.keys, ...extra])], resolved: inner.resolved === "none" && extra.length ? "partial" : inner.resolved };
  }
  return { keys: [], resolved: "none" };
}
// `q.k = …` (prop null) or `q.<prop>.k = …` assignments on a binding.
function assignedKeys(binding, prop) {
  const out = [];
  for (const ref of binding.referencePaths) {
    let m = ref.parentPath;
    if (prop) { if (!m?.isMemberExpression() || m.node.object !== ref.node || m.node.computed || m.node.property.name !== prop) continue; m = m.parentPath; }
    if (m?.isMemberExpression() && !m.node.computed && m.parentPath?.isAssignmentExpression() && m.parentPath.node.left === m.node) out.push(m.node.property.name);
  }
  return out;
}

/** Names of the bindings a path sits in, innermost first (attribution inside the entry chunk, whose module body is
 *  wrapped in a top-level-await function, so the outermost name alone says nothing). */
function bindingChain(p) {
  const names = [];
  for (let cur = p; cur && cur.parentPath; cur = cur.parentPath) {
    if (cur.isVariableDeclarator() && cur.node.id.type === "Identifier") names.push(cur.node.id.name);
    else if (cur.isAssignmentExpression() && cur.node.left.type === "Identifier") names.push(cur.node.left.name);
    else if (cur.isFunctionDeclaration() && cur.node.id) names.push(cur.node.id.name);
  }
  return [...new Set(names)];
}

/** Keys of a call's first argument; `{data: x.$sm2(obj)}` (user center: explicit SM2 via the `$sm2` global property)
 *  is unwrapped to the keys of `obj` and flagged. */
function callArgInfo(callPath) {
  if (!callPath.node.arguments.length) return { keys: [], resolved: "full", sm2: false };
  const a0 = callPath.get("arguments.0");
  if (a0.isObjectExpression()) {
    const i = a0.node.properties.findIndex((p) => p.type === "ObjectProperty" && p.value.type === "CallExpression" && p.value.callee.type === "MemberExpression" && !p.value.callee.computed && p.value.callee.property.name === "$sm2");
    if (i >= 0 && a0.node.properties[i].value.arguments.length) return { ...argKeys(a0.get(`properties.${i}.value.arguments.0`)), sm2: true, wrapKey: propKey(a0.node.properties[i]) };
  }
  return { ...argKeys(a0), sm2: false };
}

function parseChunk(src) {
  return parse(src, { sourceType: "module", errorRecovery: true, allowReturnOutsideFunction: true, allowAwaitOutsideFunction: true, plugins: ["topLevelAwait"] });
}

/**
 * Scan one site's legacy-dist. Returns {chunks:{<file>:{apiFns:[...], direct:[...], literals:[...], imports:[...]}}}
 * with apiFns = exported request functions of that chunk.
 */
export function scanSite({ site, dir, apiPrefix }) {
  const assets = path.join(dir, "assets");
  const prefixes = [apiPrefix];
  const files = readdirSync(assets).filter((f) => f.endsWith(".js")).sort();
  const chunks = {};
  for (const f of files) {
    const src = readFileSync(path.join(assets, f), "utf8");
    if (!/xf-|jeecg-|request\(|\bimport\b/.test(src)) { chunks[f] = { apiFns: [], direct: [], literals: [], imports: [] }; continue; }
    let ast;
    try { ast = parseChunk(src); } catch (e) { chunks[f] = { error: String(e.message).slice(0, 120), apiFns: [], direct: [], literals: [], imports: [] }; continue; }
    const exp = {}; // local → exported
    const imports = []; // {source, imported, local}
    const reqConfigs = []; const literals = [];
    const enums = {}; // `X.member = "/svc/path"` (TS enum objects of url constants) → member → path
    // Inlined module namespaces: `b = Object.freeze(Object.defineProperty({__proto__:null, name: local, …}, …))`, often
    // copied (`_ = assign({}, b)`) and exported; consumers call `ns.name(…)`.
    const nsKeys = {}; // namespace var → {key: local}
    const nsAlias = {}; // var → namespace var
    traverse(ast, {
      ObjectExpression(p) {
        if (!p.node.properties.some((x) => x.type === "ObjectProperty" && propKey(x) === "__proto__" && x.value.type === "NullLiteral")) return;
        let top = p.parentPath; while (top && top.isCallExpression()) top = top.parentPath;
        const name = top?.isAssignmentExpression() && top.node.left.type === "Identifier" ? top.node.left.name : top?.isVariableDeclarator() && top.node.id.type === "Identifier" ? top.node.id.name : null;
        if (name) nsKeys[name] = Object.fromEntries(p.node.properties.filter((x) => x.type === "ObjectProperty" && x.value.type === "Identifier").map((x) => [propKey(x), x.value.name]));
      },
    });
    const aliasOf = (id, init) => { if (id?.type === "Identifier" && init?.type === "CallExpression") { const a = init.arguments.find((x) => x.type === "Identifier" && nsKeys[x.name]); if (a) nsAlias[id.name] = a.name; } };
    traverse(ast, {
      VariableDeclarator(p) { aliasOf(p.node.id, p.node.init); },
      AssignmentExpression(p) {
        const { left, right } = p.node;
        aliasOf(left, right);
        if (left.type === "MemberExpression" && !left.computed && left.property.type === "Identifier" && right.type === "StringLiteral" && looksLikeUrlPath(right.value, prefixes) && /^\/|^(xf|jeecg)-/.test(right.value)) enums[left.property.name] = right.value;
      },
    });
    const methodArg = (args) => { const m = args.find((a) => a.type === "StringLiteral" && METHODS.has(a.value.toLowerCase())); return m ? m.value.toUpperCase() : null; };
    traverse(ast, {
      ExportNamedDeclaration(p) { for (const s of p.node.specifiers || []) if (s.local && s.exported) exp[s.local.name] = s.exported.name ?? s.exported.value; },
      ImportDeclaration(p) { for (const s of p.node.specifiers) imports.push({ source: path.basename(p.node.source.value), imported: s.type === "ImportSpecifier" ? (s.imported.name ?? s.imported.value) : "default", local: s.local.name, path: p }); },
      ObjectExpression(p) {
        const u = objProp(p.node, "url");
        if (!u || u.type !== "ObjectProperty") return;
        const isConfig = ["method", "params", "data", "headers"].some((k) => objProp(p.node, k)) || p.parentPath.isCallExpression();
        // `url: cond ? "/a/edit" : "/a/add"` → one config per branch
        const alts = u.value.type === "ConditionalExpression" ? [u.value.consequent, u.value.alternate] : [u.value];
        for (const alt of alts) {
        const t = urlText(alt, enums);
        if (!t || !(isConfig ? looksLikeUrlPath(t.text, prefixes) : looksLikeApi(t.text, prefixes))) continue;
        const m = objProp(p.node, "method");
        const method = m?.type === "ObjectProperty" && m.value.type === "StringLiteral" ? m.value.value.toUpperCase() : (m ? "?" : "GET");
        const pp = objProp(p.node, "params"), dp = objProp(p.node, "data"), hp = objProp(p.node, "headers");
        const pi = p.node.properties.indexOf(pp), di = p.node.properties.indexOf(dp);
        const paramsKeys = pp?.type === "ObjectProperty" ? argKeys(p.get(`properties.${pi}.value`)) : null;
        const dataKeys = dp?.type === "ObjectProperty" ? argKeys(p.get(`properties.${di}.value`)) : null;
        const passArgs = [pp, dp].filter((x) => x?.type === "ObjectProperty" && x.value.type === "Identifier").map((x) => x.value.name);
        reqConfigs.push({ text: t.text, method, hasParams: !!pp, hasData: !!dp, paramsKeys, dataKeys, passArgs, headers: hp?.type === "ObjectProperty" && hp.value.type === "ObjectExpression" ? hp.value.properties.map(propKey).filter(Boolean) : [], form: alts.length > 1 ? "config-conditional" : "config", node: p });
        }
      },
      CallExpression(p) { // helper wrappers: `IN("/svc/path", e, "post")`
        const a = p.node.arguments;
        if (!a.length || !methodArg(a.slice(1))) return;
        const t = urlText(a[0], enums);
        if (!t || !looksLikeUrlPath(t.text, prefixes)) return;
        const method = methodArg(a.slice(1));
        const body = a[1] && !(a[1].type === "StringLiteral") ? argKeys(p.get("arguments.1")) : null;
        reqConfigs.push({ text: t.text, method, hasParams: method === "GET", hasData: method !== "GET", paramsKeys: method === "GET" ? body : null, dataKeys: method !== "GET" ? body : null, passArgs: a[1]?.type === "Identifier" ? [a[1].name] : [], headers: [], form: "helper", node: p });
      },
      StringLiteral(p) {
        const v = p.node.value;
        if (!looksLikeApi(v, prefixes)) return;
        const parent = p.parentPath;
        if (parent.isObjectProperty() && propKey(parent.node) === "url" && parent.parentPath.isObjectExpression()) return; // request config, handled above
        if (parent.isConditionalExpression() && parent.parentPath.isObjectProperty() && propKey(parent.parentPath.node) === "url") return;
        if (parent.isCallExpression() && parent.node.arguments[0] === p.node && methodArg(parent.node.arguments.slice(1))) return; // helper call, handled above
        if (parent.isAssignmentExpression() && parent.node.left.type === "MemberExpression" && enums[parent.node.left.property?.name] === v) { literals.push({ path: normPath(cleanDynamicPath(v).p, apiPrefix), context: "enum", member: parent.node.left.property.name, method: "?", binding: bindingChain(p) }); return; }
        let top = p; while (top.parentPath && (top.parentPath.isBinaryExpression() || top.parentPath.isTemplateLiteral())) top = top.parentPath;
        if (top !== p && (top.parentPath?.isObjectProperty() && propKey(top.parentPath.node) === "url" || top.parentPath?.isCallExpression() && top.parentPath.node.arguments[0] === top.node && methodArg(top.parentPath.node.arguments.slice(1)))) return;
        const holder = top.parentPath;
        const key = holder.isObjectProperty() ? propKey(holder.node) : holder.isCallExpression() ? "call-arg" : holder.isAssignmentExpression() ? "assign" : holder.isVariableDeclarator() ? "const" : holder.type;
        const { p: rawPath } = cleanDynamicPath(v + (top !== p && parent.node.left === p.node ? "{}" : ""));
        literals.push({ path: normPath(rawPath, apiPrefix), context: key, method: key === "action" ? "POST" : "?", binding: bindingChain(p) });
      },
    });
    const apiFns = [], direct = [];
    for (const r of reqConfigs) {
      const { p: rawPath } = cleanDynamicPath(r.text);
      // An exported request function: the config sits in `<local> = (args) => x.request(config)` (or function body).
      const fnPath = r.node.findParent((pp) => pp.isFunction());
      let local = null;
      if (fnPath) {
        const decl = fnPath.parentPath;
        if (decl.isVariableDeclarator() && decl.node.id.type === "Identifier") local = decl.node.id.name;
        else if (decl.isAssignmentExpression() && decl.node.left.type === "Identifier") local = decl.node.left.name;
        else if (fnPath.isFunctionDeclaration() && fnPath.node.id) local = fnPath.node.id.name;
      }
      const rec = { path: normPath(rawPath, apiPrefix), rawWhitespace: rawPath !== rawPath.trim(), method: r.method, form: r.form, bodyKind: r.hasData ? "data" : r.hasParams ? "params" : "none", queryKeys: queryKeysOf(r.text), headers: r.headers,
        literalKeys: [...(r.paramsKeys?.keys ?? []), ...(r.dataKeys?.keys ?? [])], literalResolved: r.paramsKeys?.resolved ?? r.dataKeys?.resolved ?? "none" };
      // The config passes the function's own parameter straight through (`params:e`): param names come from call sites.
      const passThrough = !!fnPath && r.passArgs.some((n) => fnPath.node.params.some((a) => a.type === "Identifier" && a.name === n));
      if (local && exp[local] !== undefined) { apiFns.push({ ...rec, local, exported: exp[local], passThrough }); continue; }
      const viaNs = local && Object.entries({ ...Object.fromEntries(Object.keys(nsKeys).map((n) => [n, n])), ...nsAlias }).flatMap(([v, ns]) => exp[v] !== undefined ? Object.entries(nsKeys[ns]).filter(([, l]) => l === local).map(([k]) => `${exp[v]}.${k}`) : []);
      if (viaNs?.length) { for (const exported of viaNs) apiFns.push({ ...rec, local, exported, passThrough }); continue; }
      // A chunk-local request function (`const b = e => x.request({…params:e})`): its call sites in the same chunk give the names.
      const localCalls = [];
      if (local && passThrough) {
        const b = (fnPath.parentPath.scope || fnPath.scope).getBinding(local);
        for (const ref of b?.referencePaths ?? []) if (ref.parentPath?.isCallExpression() && ref.parentPath.node.callee === ref.node && ref.parentPath.node.arguments.length) localCalls.push(callArgInfo(ref.parentPath));
      }
      direct.push({ ...rec, binding: bindingChain(r.node), viaLocalFn: local || null, passThrough, callKeys: [...new Set(localCalls.flatMap((c) => c.keys))], callSm2: localCalls.some((c) => c.sm2), callResolved: localCalls.length ? (localCalls.every((c) => c.resolved === "full") ? "full" : localCalls.some((c) => c.keys.length) ? "partial" : "none") : null });
    }
    // Call sites of imported functions: resolved later against the exporting chunk; collect them here per import.
    const importUses = [];
    for (const im of imports) {
      const b = im.path.scope.getBinding(im.local);
      if (!b) continue;
      for (const ref of b.referencePaths) {
        const call = ref.parentPath?.isCallExpression() && ref.parentPath.node.callee === ref.node ? ref.parentPath : null;
        const mem = ref.parentPath?.isMemberExpression() && ref.parentPath.node.object === ref.node && !ref.parentPath.node.computed ? ref.parentPath : null;
        if (mem) { // `ns.fn(...)` on an imported namespace export
          const mcall = mem.parentPath?.isCallExpression() && mem.parentPath.node.callee === mem.node ? mem.parentPath : null;
          const a0 = mcall ? callArgInfo(mcall) : { keys: [], resolved: "none", sm2: false };
          importUses.push({ source: im.source, imported: `${im.imported}.${mem.node.property.name}`, kind: mcall ? "call" : "ref", keys: a0.keys, resolved: a0.resolved, sm2: a0.sm2, binding: bindingChain(ref) });
        }
        if (call) {
          const a0 = callArgInfo(call);
          importUses.push({ source: im.source, imported: im.imported, kind: "call", keys: a0.keys, resolved: a0.resolved, sm2: a0.sm2, binding: bindingChain(ref) });
        } else importUses.push({ source: im.source, imported: im.imported, kind: "ref", keys: [], resolved: "none", binding: bindingChain(ref) });
      }
    }
    chunks[f] = { apiFns, direct, literals, imports: importUses, exportsCount: Object.keys(exp).length };
  }
  return { site, chunks };
}

/**
 * Restored project (hmrsfw-vue): api modules under apps/<app>/src/api and direct `request({url…})` calls elsewhere.
 * Used only as a cross-check — every path found there must already be in the legacy inventory.
 */
export function scanAppProject(appDirPath, apps, apiPrefix) {
  const out = { modules: [], direct: [] };
  const walk = (d, acc = []) => { for (const n of readdirSync(d, { withFileTypes: true })) { if (n.name === "node_modules") continue; const p = path.join(d, n.name); if (n.isDirectory()) walk(p, acc); else if (/\.(ts|js|vue)$/.test(n.name)) acc.push(p); } return acc; };
  for (const app of apps) {
    const src = path.join(appDirPath, "apps", app.name, "src");
    if (!existsSync(src)) continue;
    for (const f of walk(src)) {
      const text = readFileSync(f, "utf8");
      const rel = path.relative(appDirPath, f);
      const urls = [...text.matchAll(/url\s*:\s*(["'`])([^"'`]+)\1/g)].map((m) => m[2]).filter((u) => looksLikeUrlPath(u, [apiPrefix]));
      if (rel.includes(`/src/api/`)) {
        const from = text.match(/由 (\S+\.js) 还原/)?.[1] ?? null;
        out.modules.push({ app: app.name, file: rel, fromChunk: from, functions: (text.match(/^export const \w+ = /gm) || []).length, paths: urls.map((u) => normPath(cleanDynamicPath(u).p, apiPrefix)) });
      } else if (urls.length) out.direct.push({ app: app.name, file: rel, paths: urls.map((u) => normPath(cleanDynamicPath(u).p, apiPrefix)) });
    }
  }
  return out;
}
