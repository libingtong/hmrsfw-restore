// API reconciliation (HM-23): the endpoints the original frontend calls × the endpoints a backend source tree provides ×
// what the test environment actually answered in the recorded HARs. Read-only; it never sends a request.
//
//   frontend  legacy-dist (every chunk, babel) + the restored project's src/api as a cross-check; scope from the work
//             orders (queue/<id>.json → sourceChunk); SM2 per the original rules (portal: POST and url ∈ localStorage
//             `funcs`, read from the recorded storage snapshot; user center: explicit `$sm2(...)` at the call site).
//   backend   Spring controllers of the tree in $VR_BACKEND_SRC — signatures only (tools/lib/apiinv-backend.mjs).
//   har       $RESTORE_ASSETS/har (or --har <dir>…), test hosts from restore.config.json recording.allowedHosts.
//
// Usage:
//   node tools/api-inventory.mjs [--app <hmrsfw-vue>] [--orders <dir holding queue/>] [--har <dir>]... [--out <dir>]
//                                [--report <md>]
//   env: VR_BACKEND_SRC (required), RESTORE_ASSETS (HAR default), VITE_HMRSFW_SM4_KEY / SM2_PRIVATE_KEY (decryption,
//        optional — without them encrypted bodies stay opaque and the report says so).
// Output: <out>/{frontend,backend,har,reconcile}.json (default out/api-inventory/, not committed: it holds parameter
// names and field shapes, never values or source), and with --report the generated block of the report between
// `<!-- api-inventory:begin -->` and `<!-- api-inventory:end -->` (text around it is kept).
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { scanSite, scanAppProject, normPath } from "./lib/apiinv-frontend.mjs";
import { scanBackend } from "./lib/apiinv-backend.mjs";
import { scanHars } from "./lib/apiinv-har.mjs";
import { loadWorkOrders } from "./lib/workorders.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : undefined; };
const opts = (n) => argv.flatMap((a, i) => (a === n ? [argv[i + 1]] : []));
const CONFIG = JSON.parse(readFileSync(path.join(ROOT, "restore.config.json"), "utf8"));
const OUT = path.resolve(opt("--out") ?? path.join(ROOT, "out", "api-inventory"));
const ORDERS_ROOT = path.resolve(opt("--orders") ?? ROOT);
const APP_DIR = opt("--app") ?? process.env[CONFIG.env?.appDir] ?? (CONFIG.env?.appDirAliases ?? []).map((v) => process.env[v]).find(Boolean);
const BACKEND = process.env.VR_BACKEND_SRC;
const ASSETS = process.env.RESTORE_ASSETS;
const HAR_DIRS = opts("--har").length ? opts("--har") : ASSETS ? [path.join(ASSETS, "har")] : [];
if (!BACKEND || !existsSync(BACKEND)) { console.error("VR_BACKEND_SRC must point at the backend source tree"); process.exit(2); }
mkdirSync(OUT, { recursive: true });
const uniq = (a) => [...new Set(a)].sort();
const COMMON_NOISE = new Set(["_t", "t", "timestamp"]); // cache-busters the frontend adds to some urls

// ---------------------------------------------------------------- frontend
const orders = loadWorkOrders(ORDERS_ROOT);
const appCode = (() => { try { return readFileSync(path.join(ROOT, CONFIG.apps[0].legacyDist, "config.js"), "utf8").match(/currentAppCode"?\s*:\s*"(\w+)"/)?.[1] ?? null; } catch { return null; } })();

/** `funcs` (the SM2 url list the portal reads from localStorage) from a recorded storage snapshot of that site. */
function sm2Funcs(app) {
  if (!ASSETS) return null;
  const dir = path.join(ASSETS, "har", "raw");
  if (!existsSync(dir)) return null;
  for (const f of readdirSync(dir).filter((n) => n.startsWith(`storage-${app.site}`))) {
    try { const ls = JSON.parse(readFileSync(path.join(dir, f), "utf8")).localStorage ?? {}; if (ls.funcs) return JSON.parse(ls.funcs).map((x) => x.value).filter(Boolean); } catch { /* not a snapshot */ }
  }
  return null;
}

function frontendInventory() {
  const apps = [];
  for (const app of CONFIG.apps) {
    const dir = path.join(ROOT, app.legacyDist);
    const site = scanSite({ site: app.site, dir, apiPrefix: app.apiPrefix });
    const entry = app.entryChunk;
    const myOrders = orders.filter((o) => o.site === app.site || o.app === app.name);
    const byChunk = {}; const entryBindings = {};
    for (const o of myOrders) {
      if (!o.sourceChunk) continue;
      const c = path.basename(o.sourceChunk);
      (byChunk[c] ??= new Set()).add(o.id);
      if (c === entry) for (const comp of Array.isArray(o.components) ? o.components : []) if (comp.binding) entryBindings[comp.binding] = o.id;
    }
    const scoped = myOrders.length > 0;
    /** Who a use in `chunk` belongs to: {scope: hami|entry|other|unknown, orders:[…]} */
    const attribute = (chunk, chain = []) => {
      if (!scoped) return { scope: "unknown", orders: [] };
      if (chunk === entry) { const hit = chain.map((b) => entryBindings[b]).find(Boolean); return hit ? { scope: "hami", orders: [hit] } : { scope: "entry", orders: [] }; }
      return byChunk[chunk] ? { scope: "hami", orders: [...byChunk[chunk]].filter((id) => !id.startsWith("entry.")) } : { scope: "other", orders: [] };
    };
    const funcs = app.site === "portal" ? sm2Funcs(app) : null;
    const fnIndex = {};
    for (const [chunk, c] of Object.entries(site.chunks)) for (const fn of c.apiFns) fnIndex[`${chunk}#${fn.exported}`] = { ...fn, chunk, uses: [] };
    for (const [chunk, c] of Object.entries(site.chunks)) for (const u of c.imports) { const fn = fnIndex[`${u.source}#${u.imported}`]; if (fn) fn.uses.push({ chunk, ...u, ...attribute(chunk, u.binding) }); }

    // endpoints: (METHOD, path) of this app
    const eps = new Map();
    const ep = (method, p) => { const k = `${method} ${p}`; if (!eps.has(k)) eps.set(k, { app: app.name, method, path: p, service: p.split("/")[1], whitespace: false, sources: [], names: { call: new Set(), literal: new Set(), query: new Set() }, resolved: new Set(), bodyKinds: new Set(), sm2: new Set(), scope: new Set(), orders: new Set(), chunks: new Set() }); return eps.get(k); };
    const sm2ByRule = (method, p) => funcs && method === "POST" && funcs.some((f) => (p + "/").toLowerCase().includes(String(f).toLowerCase().replace(/\/?$/, "")));
    for (const fn of Object.values(fnIndex)) {
      const e = ep(fn.method, fn.path);
      if (fn.rawWhitespace) e.whitespace = true;
      const calls = fn.uses.filter((u) => u.kind === "call");
      e.sources.push({ kind: "api", fn: `${fn.chunk}#${fn.exported}`, uses: fn.uses.length, calls: calls.length });
      fn.literalKeys.forEach((k) => e.names.literal.add(k)); fn.queryKeys.forEach((k) => e.names.query.add(k));
      if (fn.passThrough) { calls.forEach((u) => { u.keys.forEach((k) => e.names.call.add(k)); e.resolved.add(u.resolved); }); }
      else e.resolved.add(fn.literalResolved);
      e.bodyKinds.add(fn.bodyKind);
      if (sm2ByRule(fn.method, fn.path)) e.sm2.add("funcs");
      if (calls.some((u) => u.sm2)) e.sm2.add("$sm2");
      if (!fn.uses.length) e.scope.add("unused");
      for (const u of fn.uses) { e.scope.add(u.scope); u.orders.forEach((o) => e.orders.add(o)); e.chunks.add(u.chunk); }
    }
    for (const [chunk, c] of Object.entries(site.chunks)) {
      for (const d of c.direct) {
        const e = ep(d.method, d.path);
        if (d.rawWhitespace) e.whitespace = true;
        const at = attribute(chunk, d.binding);
        e.sources.push({ kind: "direct", chunk, form: d.form });
        d.literalKeys.forEach((k) => e.names.literal.add(k)); d.queryKeys.forEach((k) => e.names.query.add(k)); (d.callKeys ?? []).forEach((k) => e.names.call.add(k));
        e.resolved.add(d.passThrough ? (d.callResolved ?? "none") : d.literalResolved);
        e.bodyKinds.add(d.bodyKind);
        if (sm2ByRule(d.method, d.path)) e.sm2.add("funcs");
        if (d.callSm2) e.sm2.add("$sm2");
        e.scope.add(at.scope); at.orders.forEach((o) => e.orders.add(o)); e.chunks.add(chunk);
      }
    }
    const literals = [];
    for (const [chunk, c] of Object.entries(site.chunks)) for (const l of c.literals) { const at = attribute(chunk, l.binding); literals.push({ app: app.name, path: l.path, context: l.context, method: l.method, chunk, scope: at.scope, orders: at.orders }); }

    const endpoints = [...eps.values()].map((e) => {
      const scopes = [...e.scope];
      const scope = scopes.includes("hami") ? "hami" : scopes.includes("entry") ? "entry" : scopes.includes("unknown") ? "unknown" : scopes.includes("other") ? "other" : "unused";
      const resolved = e.resolved.has("none") && e.resolved.size === 1 ? "none" : e.resolved.has("partial") || e.resolved.has("none") ? "partial" : "full";
      return { app: e.app, method: e.method, path: e.path, service: e.service, whitespace: e.whitespace, scope, orders: uniq([...e.orders]), chunks: uniq([...e.chunks]), sources: e.sources,
        params: { call: uniq([...e.names.call]), literal: uniq([...e.names.literal]), query: uniq([...e.names.query]), resolved }, bodyKinds: uniq([...e.bodyKinds]),
        sm2: e.sm2.size ? uniq([...e.sm2]).join("+") : "no" };
    }).sort((a, b) => (a.path + a.method).localeCompare(b.path + b.method));

    // api modules (the 64 index.api chunks and anything else exporting request functions)
    const modules = Object.entries(site.chunks).filter(([f, c]) => c.apiFns.length || /\.api\.|apinew/.test(f)).map(([f, c]) => {
      const fns = c.apiFns;
      const locals = uniq(fns.map((x) => x.local));
      const ra = /\.api\.|apinew/.test(f) ? restoreApiLocals(path.join(dir, "assets", f)) : null;
      // functions the per-module restorer (restore-api.mjs) does not pick up, with the reason
      const raMissed = ra ? locals.filter((l) => !ra.has(l)).map((l) => { const fn = fns.find((x) => x.local === l); const why = fn.form === "config-conditional" ? "url 是条件表达式" : fn.headers.length ? "headers 里有分号，正则在分号处截断" : "写法与正则不符"; return `${fn.exported}（${fn.path}，${why}）`; }) : [];
      return { chunk: f, isApiChunk: /\.api\.|apinew/.test(f), functions: locals.length, requests: fns.length, exports: c.exportsCount, nonExportedConfigs: c.direct.length, raMissed,
        hami: uniq(fns.filter((fn) => fnIndex[`${f}#${fn.exported}`].uses.some((u) => u.scope === "hami")).map((fn) => fn.local)).length,
        entryOnly: fns.filter((fn) => { const us = fnIndex[`${f}#${fn.exported}`].uses; return us.length && !us.some((u) => u.scope === "hami") && us.some((u) => u.scope === "entry"); }).length,
        otherOnly: uniq(fns.filter((fn) => { const us = fnIndex[`${f}#${fn.exported}`].uses; return us.length && us.every((u) => u.scope === "other"); }).map((fn) => fn.local)).length,
        unused: uniq(fns.filter((fn) => !fnIndex[`${f}#${fn.exported}`].uses.length).map((fn) => fn.local)).length,
        restoreApiCount: ra ? ra.size : null, paths: uniq(fns.map((x) => x.path)) };
    }).sort((a, b) => a.chunk.localeCompare(b.chunk, "en", { numeric: true }));

    // cross-check with the work orders' own deps.api (chunk#export)
    const depsApi = new Set(myOrders.flatMap((o) => (o.deps?.api ?? []).map((x) => x.split("/").pop())));
    // orders list api-module imports in deps.api (entry exports go to deps.entry, shared chunks to deps.shared)
    const depsChunks = new Set([...depsApi].map((x) => x.split("#")[0]));
    const usedByUs = new Set(Object.values(fnIndex).filter((fn) => (/\.api\.|apinew/.test(fn.chunk) || depsChunks.has(fn.chunk)) && fn.uses.some((u) => u.scope === "hami" && u.chunk !== entry)).map((fn) => `${fn.chunk}#${fn.exported.split(".")[0]}`)); // namespace members `o.x` are the import `o`
    const depsCheck = { ordersDeps: depsApi.size, ours: usedByUs.size, onlyInOrders: [...depsApi].filter((x) => !usedByUs.has(x)).sort(), onlyOurs: [...usedByUs].filter((x) => !depsApi.has(x)).sort() };
    apps.push({ app: app.name, site: app.site, entryChunk: entry, orders: myOrders.length, scoped, sm2Funcs: funcs, chunksScanned: Object.keys(site.chunks).length, parseErrors: Object.entries(site.chunks).filter(([, c]) => c.error).map(([f]) => f), modules, endpoints, literals, depsCheck });
  }
  const appProject = APP_DIR && existsSync(APP_DIR) ? scanAppProject(APP_DIR, CONFIG.apps, CONFIG.apps[0].apiPrefix) : null;
  return { appCode, apps, appProject };
}
// Same match the per-module restorer (tools/restore-api.mjs) uses, to show both counts side by side.
function restoreApiLocals(file) {
  const src = readFileSync(file, "utf8");
  const re = /([A-Za-z_$][\w$]*)=(\(?[^=]*?\)?)=>([a-zA-Z_$][\w$]*)\.request\((\{[^;]*?\})\)(?=,[A-Za-z_$][\w$]*=|;|\)|$)/g;
  return new Set([...src.matchAll(re)].filter((m) => /url:"[^"]+"|url:`[^`]+`/.test(m[4])).map((m) => m[1]));
}

// ---------------------------------------------------------------- reconcile
// Spring patterns: `{var}` one segment, `*` within a segment, `/**` any tail (also none).
const pathRe = (p) => new RegExp("^" + p.split("/").map((s) => (s === "**" ? "\u0000" : /^\{[^}]*\}$/.test(s) ? "[^/]+" : s.replace(/[.+?^$()|[\]\\]/g, "\\$&").replace(/\*/g, "[^/]*"))).join("/").replace(/\/\u0000/g, "(?:/.*)?") + "/?$");
function backendIndex(be) {
  const exact = new Map(), patterns = [], lower = new Map();
  for (const e of be.endpoints) {
    (exact.get(e.path) ?? exact.set(e.path, []).get(e.path)).push(e);
    if (/[{*]/.test(e.path)) patterns.push([pathRe(e.path), e]);
    (lower.get(e.path.toLowerCase()) ?? lower.set(e.path.toLowerCase(), []).get(e.path.toLowerCase())).push(e);
  }
  return (p) => {
    const clean = p.replace(/\/+$/, "") || "/";
    if (exact.has(clean)) return { how: "exact", eps: exact.get(clean) };
    if (p.endsWith("{}")) { const base = clean.replace(/\/?\{\}$/, ""); const hits = patterns.filter(([re, e]) => re.test(base + "/x")).map(([, e]) => e); if (hits.length) return { how: "pathvar", eps: hits }; if (exact.has(base)) return { how: "prefix", eps: exact.get(base) }; }
    const pv = patterns.filter(([re]) => re.test(clean)).map(([, e]) => e);
    if (pv.length) return { how: "pathvar", eps: pv };
    if (lower.has(clean.toLowerCase())) return { how: "case", eps: lower.get(clean.toLowerCase()) };
    return null;
  };
}
const methodOk = (fm, bms) => fm === "?" || bms.includes("ANY") || bms.includes(fm);
const acceptedNames = (eps) => {
  let any = false; const names = new Set(); const required = new Set();
  for (const e of eps) {
    for (const p of e.params) { if (p.in === "model") { if (p.props) p.props.forEach((n) => names.add(n)); else any = true; } else names.add(p.name); if (p.required && (p.in === "query" || p.in === "file")) required.add(p.name); }
    e.requestParamsInBody.forEach((n) => names.add(n));
    if (e.body) { if (e.body.props) e.body.props.forEach((n) => names.add(n)); else any = true; }
  }
  return { any, names, required };
};
/** Differences between a HAR shape and a backend shape: keys only on one side, JSON type conflicts. */
function shapeDiff(har, be, at = "$", out = { extra: [], missing: [], type: [], compared: 0 }, depth = 0) {
  if (!har || !be || depth > 6) return out;
  if (be.type === "any" || be.unresolved || be.recursive || be.type === "none") return out;
  out.compared++;
  const hTypes = (har.types ?? [har.type]).filter((t) => t !== "null");
  if (!hTypes.length) return out;
  const bt = be.type;
  if (!hTypes.includes(bt) && !(bt === "string" && hTypes.every((t) => t === "number")) && !(bt === "number" && hTypes.every((t) => t === "string"))) { out.type.push(`${at}: ${hTypes.join("|")} ≠ ${bt}`); return out; }
  if (bt === "number" && hTypes.includes("string") || bt === "string" && hTypes.includes("number")) out.type.push(`${at}: ${hTypes.join("|")} ≠ ${bt} (数值/字符串)`);
  if (bt === "object" && har.keys && be.keys) {
    for (const k of Object.keys(har.keys)) if (!(k in be.keys)) out.extra.push(`${at}.${k}`); else shapeDiff(har.keys[k], be.keys[k], `${at}.${k}`, out, depth + 1);
    for (const k of Object.keys(be.keys)) if (!(k in har.keys)) out.missing.push(`${at}.${k}`);
  }
  if (bt === "array" && har.items && be.items) shapeDiff(har.items, be.items, `${at}[]`, out, depth + 1);
  return out;
}

function reconcile(fe, be, har) {
  const find = backendIndex(be);
  const services = new Set(be.groups.map((g) => g.service));
  const byServlet = new Map(); for (const e of be.endpoints) (byServlet.get(e.servletPath) ?? byServlet.set(e.servletPath, []).get(e.servletPath)).push(e);
  // Why a path has no backend endpoint: the service is not in the tree, the path has no service prefix at all (the
  // gateway routes on the first segment), or the service exists and lacks the endpoint.
  const missingKind = (p) => {
    const svc = p.split("/")[1];
    if (services.has(svc)) return { kind: "endpoint", note: "" };
    if (/^(xf|jeecg)-/.test(svc)) return { kind: "service", note: `服务 ${svc} 不在后端源码里` };
    const alt = byServlet.get(p.replace(/\/+$/, "")) ?? [];
    return { kind: "no-prefix", note: alt.length ? `补前缀后有：${uniq(alt.map((x) => "/" + x.service)).join("、")}` : "补任何服务前缀都没有" };
  };
  const rows = []; const usedBe = new Set();
  for (const a of fe.apps) for (const e of a.endpoints) {
    const hit = find(e.path);
    hit?.eps.forEach((x) => usedBe.add(x));
    const front = uniq([...e.params.call, ...e.params.literal, ...e.params.query]);
    const r = { app: a.app, method: e.method, path: e.path, scope: e.scope, sm2: e.sm2, orders: e.orders, chunks: e.chunks, match: hit?.how ?? "missing", ...(hit ? {} : { missing: missingKind(e.path) }), backend: hit ? uniq(hit.eps.map((x) => `${x.methods.join("|")} ${x.path} ${x.controller}.${x.handler}`)) : [], issues: [] };
    if (e.whitespace) r.issues.push({ kind: "whitespace", detail: "前端 url 字面量首尾带空格，实际请求路径与后端不符" });
    if (hit) {
      const methods = uniq(hit.eps.flatMap((x) => x.methods));
      if (!methodOk(e.method, methods)) r.issues.push({ kind: "method", detail: `前端 ${e.method}，后端 ${methods.join("|")}` });
      if (hit.how === "case") r.issues.push({ kind: "path-case", detail: `大小写不同：后端 ${hit.eps[0].path}` });
      const acc = acceptedNames(hit.eps);
      const unknown = acc.any ? [] : front.filter((n) => !acc.names.has(n) && !COMMON_NOISE.has(n));
      if (unknown.length) r.issues.push({ kind: "param-unknown", detail: `后端不接收：${unknown.join(", ")}` });
      if (e.params.resolved === "full") { const miss = [...acc.required].filter((n) => !front.includes(n)); if (miss.length) r.issues.push({ kind: "param-required", detail: `后端必填但前端未传：${miss.join(", ")}` }); }
      const bodyBe = hit.eps.some((x) => x.body);
      if (e.bodyKinds.includes("data") && !bodyBe && !acc.any && e.method !== "GET") r.issues.push({ kind: "param-place", detail: "前端以 JSON 请求体（data）发送，后端没有 @RequestBody（参数按 query/表单绑定）" });
      if (e.bodyKinds.includes("params") && bodyBe && hit.eps.every((x) => !x.body || x.body.required) && !e.bodyKinds.includes("data")) r.issues.push({ kind: "param-place", detail: "前端以 query（params）发送，后端要求 @RequestBody" });
    }
    rows.push(r);
  }
  // HAR side
  const harRows = [];
  for (const h of har.endpoints) {
    const hit = find(h.path);
    const feHits = fe.apps.flatMap((a) => a.endpoints.filter((e) => e.path === h.path || e.path.replace(/\/?\{\}$/, "") === h.path.replace(/\/[^/]+$/, "") && e.path.endsWith("{}")));
    const r = { method: h.method, path: h.path, samples: h.samples, status: h.status, cryptoOpt: h.cryptoOpt, req: { forms: h.req.forms, queryKeys: h.req.queryKeys, bodyKeys: h.req.bodyKeys }, inFrontend: feHits.length > 0, frontScope: uniq(feHits.map((e) => e.scope)), match: hit?.how ?? "missing", ...(hit ? {} : { missing: missingKind(h.path) }), backend: hit ? uniq(hit.eps.map((x) => `${x.methods.join("|")} ${x.path} ${x.controller}.${x.handler} → ${x.returnType}`)) : [], issues: [] };
    if (hit) {
      const methods = uniq(hit.eps.flatMap((x) => x.methods));
      if (!methodOk(h.method, methods)) r.issues.push({ kind: "method", detail: `测试环境 ${h.method}，后端 ${methods.join("|")}` });
      const acc = acceptedNames(hit.eps);
      const sent = uniq([...h.req.queryKeys, ...h.req.bodyKeys]).filter((n) => !COMMON_NOISE.has(n));
      const unknown = acc.any ? [] : sent.filter((n) => !acc.names.has(n));
      if (unknown.length) r.issues.push({ kind: "param-unknown", detail: `测试环境请求带了后端不接收的参数：${unknown.join(", ")}` });
      if (h.res.shape) {
        const be0 = hit.eps.find((x) => methodOk(h.method, x.methods)) ?? hit.eps[0];
        const d = shapeDiff(h.res.shape, be0.returnShape);
        r.shapeCompared = d.compared;
        if (d.extra.length || d.missing.length || d.type.length) r.issues.push({ kind: "shape", detail: { extra: d.extra, missing: d.missing, type: d.type }, returnType: be0.returnType });
        r.shapeChecked = !(be0.returnShape.type === "any" || be0.returnShape.unresolved);
        r.resultTyped = !!be0.returnShape.keys?.result && be0.returnShape.keys.result.type !== "any";
      }
    }
    harRows.push(r);
  }
  for (const h of har.endpoints) find(h.path)?.eps.forEach((x) => usedBe.add(x));
  const authOf = {};
  for (const r of rows) { const hit = find(r.path); if (hit) authOf[`${r.method} ${r.path}`] = (hit.eps.find((x) => methodOk(r.method, x.methods)) ?? hit.eps[0]).auth; }
  return { rows, harRows, authOf, backendUnused: be.endpoints.filter((x) => !usedBe.has(x)).length, find, missingKind };
}

// ---------------------------------------------------------------- report
const esc = (s) => String(s).replace(/\|/g, "\\|");
function renderReport(fe, be, har, rec) {
  const L = [];
  const inScope = rec.rows.filter((r) => r.scope === "hami" || r.scope === "entry");
  const missingAll = inScope.filter((r) => r.match === "missing");
  const missing = missingAll.filter((r) => r.missing.kind !== "no-prefix");
  const noPrefix = missingAll.filter((r) => r.missing.kind === "no-prefix");
  const caseOnly = inScope.filter((r) => r.match === "case");
  const harMissing = rec.harRows.filter((r) => r.match === "missing");
  const statusOk = (r) => Object.keys(r.status).some((s) => s.startsWith("2"));
  L.push(`生成：\`node tools/api-inventory.mjs\`，${new Date().toISOString().slice(0, 10)}。下列数字都由脚本算出，重跑即更新。`, "");
  L.push("### 三方接口数", "", "| 来源 | 口径 | 数量 |", "| --- | --- | --- |");
  for (const a of fe.apps) {
    const c = (s) => a.endpoints.filter((e) => e.scope === s).length;
    L.push(`| 前端 ${a.app} | 方法 + 路径（哈密范围 / 入口未归属 / 仅其他租户 / 无调用） | ${a.endpoints.length}（${c("hami")} / ${c("entry")} / ${c("other")} / ${c("unused")}） |`);
  }
  const uniqPaths = (rows) => new Set(rows.map((r) => `${r.method} ${r.path}`)).size;
  L.push(`| 前端合计 | 哈密范围（含入口未归属），两站去重后的方法 + 路径 | ${uniqPaths(inScope)} |`);
  L.push(`| 后端 \`${be.root}\` | ${be.counts.controllers} 个 Controller 的映射，按服务展开（${be.groups.length} 个服务） | ${be.counts.endpoints} |`);
  L.push(`| 测试环境 HAR | ${har.stats.files} 个文件、${har.stats.api} 条接口记录，方法 + 路径 | ${har.endpoints.length} |`, "");
  L.push("### 差异汇总", "", "| 类别 | 条数 | 说明 |", "| --- | --- | --- |");
  const issueCount = (kind) => inScope.filter((r) => r.issues.some((i) => i.kind === kind)).length;
  const kindN = (k) => missing.filter((r) => r.missing.kind === k).length;
  L.push(`| 前端调用、后端没有（阻断替换） | **${missing.length}** | 哈密范围内：整个服务不在源码里 ${kindN("service")} 条（${uniq(missing.filter((r) => r.missing.kind === "service").map((r) => r.path.split("/")[1])).join("、")}），服务在、接口没有 ${kindN("endpoint")} 条；另有 ${caseOnly.length} 条只差大小写 |`);
  L.push(`| 测试环境录到、后端没有 | ${harMissing.length}（其中 2xx：**${harMissing.filter(statusOk).length}**） | 2xx 才是「测试环境有、\`${be.root}\` 没有」的版本差异证据 |`);
  L.push(`| 前端路径缺服务前缀 | ${noPrefix.length} | 原包缺陷：网关按第一段路由，测试环境同样到不了后端，不算替换阻断 |`);
  L.push(`| 前端 url 带首尾空格 | ${inScope.filter((r) => r.issues.some((i) => i.kind === "whitespace")).length} | 原包缺陷，按去掉空格后的路径对账 |`);
  L.push(`| 方法不一致 | ${issueCount("method")} | |`);
  L.push(`| 参数名：前端传了后端不接收 | ${issueCount("param-unknown")} | 后端 DTO/参数里没有这个名字；多数是冗余参数，少数是改名 |`);
  L.push(`| 参数名：后端必填前端未传 | ${issueCount("param-required")} | 只统计前端参数能静态解析完整的调用 |`);
  L.push(`| 传参位置不一致 | ${issueCount("param-place")} | JSON 体 vs query，见下文说明 |`);
  L.push(`| 响应字段结构与后端返回类型不符 | ${rec.harRows.filter((r) => r.issues.some((i) => i.kind === "shape")).length} | 在 ${rec.harRows.filter((r) => r.shapeChecked).length} 个可比的测试环境接口里 |`);
  L.push(`| 后端有、前端没用 | ${rec.backendUnused} | 两站全部前端调用（含其他租户）都没匹配到的后端映射，只列数量 |`, "");

  // login requirement of the matched in-scope endpoints, per the source tree
  const auth = {}; let lf = 0;
  for (const r of inScope.filter((x) => x.match !== "missing")) {
    const a = rec.authOf[`${r.method} ${r.path}`] ?? "jwt";
    const k = a.startsWith("anon:@IgnoreAuth") ? "@IgnoreAuth" : a.startsWith("anon:shiro") ? "ShiroConfig 静态白名单" : a.startsWith("login") ? "@NeedLoginAuth" : "默认要登录";
    auth[k] = (auth[k] ?? 0) + 1;
    if (k === "默认要登录" && /licensefree/i.test(r.path)) lf++;
  }
  L.push("### 登录与加密（按源码）", "");
  L.push(`- 哈密范围内能在后端找到的 ${inScope.filter((x) => x.match !== "missing").length} 个接口：${Object.entries(auth).map(([k, n]) => `${k} ${n}`).join("，")}。其中路径带 \`licenseFree\`（原前端免登录调用）的 ${lf} 个在源码里同样是「默认要登录」：免登录靠 Nacos 配置 \`jeecg.shiro.excludeUrls\` 放行，这份配置不在源码里。录制的 HAR 全部带 token，测不出测试环境放行了哪些。`);
  L.push(`- CryptoFilter：${be.cryptoFilter}。哪些 url 加密请求体、哪些 url 加密响应，来自字典 \`crypto_req_body_params_filter_always_crypto_urls\` 等四项（数据库数据）。门户录到的 \`funcs\`（请求体加密名单）有 ${fe.apps.find((a) => a.sm2Funcs)?.sm2Funcs?.length ?? 0} 项；测试环境 ${har.stats.resEncrypted} 条响应带 \`Crypto_Opt: true\`，用 \`VITE_HMRSFW_SM4_KEY\` ${har.keys.sm4 ? `全部解开（失败 ${har.stats.resUndecrypted}）` : "未配置，没有解"}；HAR 里没有录到 SM2 加密的请求体（${har.stats.reqEncrypted} 条）。`, "");
  L.push("### 前端调用、后端没有（哈密范围）", "");
  if (!missing.length) L.push("无。", "");
  else {
    L.push("| 应用 | 方法 | 路径 | 原因 | SM2 | 测试环境 | 调用方（工单） |", "| --- | --- | --- | --- | --- | --- | --- |");
    const order = { endpoint: 0, service: 1 };
    for (const r of [...missing].sort((a, b) => order[a.missing.kind] - order[b.missing.kind] || a.path.localeCompare(b.path))) {
      const h = rec.harRows.find((x) => x.path === r.path);
      L.push(`| ${r.app} | ${r.method} | \`${esc(r.path)}\` | ${r.missing.kind === "service" ? "服务不在源码" : "接口不在源码"} | ${r.sm2} | ${h ? Object.entries(h.status).map(([s, n]) => `${s}×${n}`).join(" ") : "未录到"} | ${esc(r.orders.slice(0, 3).join(", ") || r.scope)}${r.orders.length > 3 ? ` 等 ${r.orders.length} 张` : ""} |`);
    }
    L.push("");
  }
  L.push("### 前端路径缺服务前缀（原包缺陷）", "");
  if (!noPrefix.length) L.push("无。", "");
  else { L.push("| 应用 | 方法 | 路径 | 后端 | 调用方（工单） |", "| --- | --- | --- | --- | --- |"); for (const r of noPrefix) L.push(`| ${r.app} | ${r.method} | \`${esc(r.path)}\` | ${esc(r.missing.note)} | ${esc(r.orders.join(", ") || r.scope)} |`); L.push(""); }
  const ws = inScope.filter((r) => r.issues.some((i) => i.kind === "whitespace"));
  if (ws.length) { L.push("url 字面量带首尾空格（原包缺陷，浏览器会把空格编码进路径）：", ""); for (const r of ws) L.push(`- ${r.app} ${r.method} \`${r.path}\`（${r.match === "missing" ? "去空格后后端也没有" : "去空格后后端有"}）`); L.push(""); }
  if (caseOnly.length) { L.push("只差大小写（Spring 路径区分大小写，按缺失处理）：", ""); for (const r of caseOnly) L.push(`- ${r.app} ${r.method} \`${r.path}\` → 后端 \`${r.issues.find((i) => i.kind === "path-case").detail.replace(/^大小写不同：后端 /, "")}\``); L.push(""); }

  L.push("### 其他 url 字面量（不是请求配置：上传 action、拼接的下载/预览链接等）", "");
  const lits = []; const seenLit = new Set();
  for (const a of fe.apps) for (const l of a.literals) {
    if (l.context === "enum" || !(l.scope === "hami" || l.scope === "entry")) continue;
    const k = `${a.app} ${l.path}`; if (seenLit.has(k)) continue; seenLit.add(k);
    const hit = rec.find(l.path);
    lits.push(`| ${a.app} | \`${esc(l.path)}\` | ${esc(l.context)} | ${hit ? `有（${hit.how}）` : esc(rec.missingKind(l.path).note || "接口不在源码")} |`);
  }
  if (!lits.length) L.push("无。", ""); else { L.push("| 应用 | 路径 | 位置 | 后端 |", "| --- | --- | --- | --- |", ...lits, ""); }
  L.push("### 测试环境录到、后端没有", "");
  if (!harMissing.length) L.push("无。", "");
  else { L.push("| 方法 | 路径 | 状态码 | 原因 | 前端范围 |", "| --- | --- | --- | --- | --- |"); for (const r of harMissing) L.push(`| ${r.method} | \`${esc(r.path)}\` | ${Object.entries(r.status).map(([s, n]) => `${s}×${n}`).join(" ")} | ${esc(r.missing.note || "接口不在源码")} | ${r.frontScope.join(", ") || "前端清单里没有"} |`); L.push(""); }

  L.push("### 方法不一致", "");
  const mm = inScope.filter((r) => r.issues.some((i) => i.kind === "method"));
  if (!mm.length) L.push("无。", ""); else { for (const r of mm) L.push(`- ${r.app} \`${r.path}\`：${r.issues.find((i) => i.kind === "method").detail}`); L.push(""); }

  L.push("### 参数名不一致", "");
  const pr = inScope.filter((r) => r.issues.some((i) => i.kind === "param-required" || i.kind === "param-unknown"));
  if (!pr.length) L.push("无。", "");
  else { L.push("| 应用 | 方法 | 路径 | 差异 |", "| --- | --- | --- | --- |"); for (const r of pr) L.push(`| ${r.app} | ${r.method} | \`${esc(r.path)}\` | ${esc(r.issues.filter((i) => i.kind.startsWith("param-") && i.kind !== "param-place").map((i) => i.detail).join("；"))} |`); L.push(""); }

  L.push("### 传参位置不一致", "");
  const pp = inScope.filter((r) => r.issues.some((i) => i.kind === "param-place"));
  if (!pp.length) L.push("无。", ""); else { L.push("| 应用 | 方法 | 路径 | 差异 |", "| --- | --- | --- | --- |"); for (const r of pp) L.push(`| ${r.app} | ${r.method} | \`${esc(r.path)}\` | ${esc(r.issues.find((i) => i.kind === "param-place").detail)} |`); L.push(""); }

  L.push("### 测试环境响应字段与后端返回类型", "");
  const sh = rec.harRows.filter((r) => r.issues.some((i) => i.kind === "shape"));
  if (!sh.length) L.push("可比的接口里没有发现字段差异。", "");
  else {
    L.push("`多`：测试环境返回、后端类型里没有的字段；`少`：后端类型有、测试环境没返回的字段；`类型`：JSON 类型不同。路径以 `$` 表示响应根。", "");
    L.push("| 方法 | 路径 | 后端返回类型 | 多 | 少 | 类型 |", "| --- | --- | --- | --- | --- | --- |");
    const cut = (a) => (a.length > 8 ? a.slice(0, 8).join(", ") + ` 等 ${a.length} 个` : a.join(", "));
    for (const r of sh) { const d = r.issues.find((i) => i.kind === "shape"); L.push(`| ${r.method} | \`${esc(r.path)}\` | \`${esc(d.returnType)}\` | ${esc(cut(d.detail.extra))} | ${esc(cut(d.detail.missing))} | ${esc(cut(d.detail.type))} |`); }
    L.push("");
  }
  const typed = rec.harRows.filter((r) => r.resultTyped);
  const notCmp = rec.harRows.filter((r) => r.match !== "missing" && r.shapeChecked && !r.resultTyped);
  L.push(`逐键比对的范围：${typed.length} 个接口的 \`result\` 有具体类型，合计比对 ${typed.reduce((n, r) => n + (r.shapeCompared ?? 0), 0)} 个字段节点；另有 ${notCmp.length} 个接口后端声明 \`Result<?>\`/\`Object\`/\`Map\`/\`JSONObject\`，只比对了外层 \`success/message/code/result/timestamp\`。`, "");

  if (fe.appProject) {
    const legacyPaths = new Set(fe.apps.flatMap((a) => [...a.endpoints.map((e) => `${a.app} ${e.path}`), ...a.literals.map((l) => `${a.app} ${l.path}`)]));
    const restored = fe.appProject.modules;
    const modMismatch = restored.filter((m) => { const a = fe.apps.find((x) => x.app === m.app); const lm = a?.modules.find((x) => x.chunk === m.fromChunk); return !lm || lm.functions !== m.functions || uniq(m.paths).join() !== lm.paths.join(); });
    const strays = fe.appProject.direct.flatMap((d) => d.paths.filter((p) => !legacyPaths.has(`${d.app} ${p}`)).map((p) => `${d.app} ${p}（${d.file}）`));
    const strayMods = restored.flatMap((m) => m.paths.filter((p) => !legacyPaths.has(`${m.app} ${p}`)).map((p) => `${m.app} ${p}（${m.file}）`));
    L.push("### hmrsfw-vue 已还原代码里的接口", "");
    L.push(`- \`src/api\` 已还原 ${restored.length} 个模块（门户 ${restored.filter((m) => m.app === "portal").length}、用户中心 ${restored.filter((m) => m.app === "uc").length}），每个模块的函数数和路径集合与对应旧 chunk 比对：${modMismatch.length ? "不一致 " + modMismatch.map((m) => m.file).join("、") : "全部一致"}。`);
    L.push(`- 已还原页面里直接写 url 的调用 ${fe.appProject.direct.reduce((n, d) => n + d.paths.length, 0)} 处（${fe.appProject.direct.length} 个文件）；不在旧包清单里的：${[...strays, ...strayMods].length ? [...strays, ...strayMods].join("；") : "无"}。`, "");
  }
  L.push("### 前端接口模块逐一对账（门户 44 + 用户中心 20 = 64，另加导出请求函数的其他 chunk）", "");
  L.push(`调用追踪自检（本清单算出的「哈密页面用到的 api 模块导出」对工单 \`deps.api\`）：${fe.apps.map((a) => `${a.app} ${a.depsCheck.ours} / ${a.depsCheck.ordersDeps}${a.depsCheck.onlyInOrders.length || a.depsCheck.onlyOurs.length ? `（只在工单：${a.depsCheck.onlyInOrders.join("、") || "无"}；只在本清单：${a.depsCheck.onlyOurs.join("、") || "无"}）` : "，完全一致"}`).join("；")}。`, "");
  L.push("「函数」是导出的请求函数个数，「请求」把条件 url 的两个分支分开计；「restore-api」是 `tools/restore-api.mjs` 的正则能取到的函数数，差的逐条列在最后一列。「哈密用到 / 仅其他租户」按调用方 chunk 是否属于哈密工单计。", "");
  L.push("| 应用 | chunk | 函数 | 请求 | restore-api | 导出数 | 哈密用到 | 仅其他租户 | 无调用 | hmrsfw-vue 已还原 | 差异说明 |", "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |");
  for (const a of fe.apps) for (const m of a.modules) {
    const rest = fe.appProject?.modules.find((x) => x.app === a.app && x.fromChunk === m.chunk);
    const notes = [...m.raMissed.map((x) => `restore-api 漏 ${x}`)];
    if (rest && rest.functions !== m.functions) notes.push(`已还原文件 ${rest.functions} 个函数`);
    if (!m.isApiChunk) notes.push("非 index.api chunk，导出了请求函数");
    L.push(`| ${a.app} | \`${m.chunk}\` | ${m.functions} | ${m.requests} | ${m.isApiChunk ? m.restoreApiCount : "—"} | ${m.exports} | ${m.hami} | ${m.otherOnly} | ${m.unused} | ${rest ? rest.file.split("/").pop() : ""} | ${esc(notes.join("；"))} |`);
  }
  L.push("");
  return L.join("\n");
}

// ---------------------------------------------------------------- main
const t0 = Date.now();
const fe = frontendInventory();
const be = scanBackend(path.resolve(BACKEND));
const hosts = CONFIG.recording?.allowedHosts ?? [];
const har = HAR_DIRS.length ? scanHars({ dirs: HAR_DIRS, hosts, apiPrefix: CONFIG.apps[0].apiPrefix }) : { stats: { files: 0, api: 0 }, endpoints: [], keys: {} };
const rec = reconcile(fe, be, har);
writeFileSync(path.join(OUT, "frontend.json"), JSON.stringify(fe, null, 1));
writeFileSync(path.join(OUT, "backend.json"), JSON.stringify(be, null, 1));
writeFileSync(path.join(OUT, "har.json"), JSON.stringify(har, null, 1));
writeFileSync(path.join(OUT, "reconcile.json"), JSON.stringify({ rows: rec.rows, harRows: rec.harRows, authOf: rec.authOf, backendUnused: rec.backendUnused }, null, 1));
const report = opt("--report");
if (report) {
  const md = renderReport(fe, be, har, rec);
  const file = path.resolve(report);
  const prev = existsSync(file) ? readFileSync(file, "utf8") : "<!-- api-inventory:begin -->\n<!-- api-inventory:end -->\n";
  const B = "<!-- api-inventory:begin -->", E = "<!-- api-inventory:end -->";
  if (!prev.includes(B) || !prev.includes(E)) { console.error(`${report}: markers ${B} / ${E} not found`); process.exit(2); }
  writeFileSync(file, prev.slice(0, prev.indexOf(B) + B.length) + "\n" + md + "\n" + prev.slice(prev.indexOf(E)));
}
const inScope = rec.rows.filter((r) => r.scope === "hami" || r.scope === "entry");
console.log(JSON.stringify({
  ms: Date.now() - t0, appCode: fe.appCode, out: path.relative(ROOT, OUT),
  frontend: fe.apps.map((a) => ({ app: a.app, orders: a.orders, endpoints: a.endpoints.length, hami: a.endpoints.filter((e) => e.scope === "hami").length, entry: a.endpoints.filter((e) => e.scope === "entry").length, other: a.endpoints.filter((e) => e.scope === "other").length, unused: a.endpoints.filter((e) => e.scope === "unused").length, modules: a.modules.filter((m) => m.isApiChunk).length, sm2Funcs: a.sm2Funcs?.length ?? null })),
  backend: be.counts, har: { files: har.stats.files, records: har.stats.api, endpoints: har.endpoints.length, keys: har.keys },
  missing: inScope.filter((r) => r.match === "missing").length, caseOnly: inScope.filter((r) => r.match === "case").length, harMissing: rec.harRows.filter((r) => r.match === "missing").length,
}));
