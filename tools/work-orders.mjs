// Generates every Hami work order (docs/pipeline.md §12, batch-plan.md §3.3; field reference docs/work-orders.md):
//   queue/<id>.json          one per order: page | segment | shared | entry
//   queue/index.json         all orders in one list (id, type, status, kb, deps.orders) + reverse dependency index
//   queue/routes.json        in-scope routes → order (input of check-coverage.mjs), plus the routes blocked up front
//   queue/summary.json       counts, size bands (30–60KB pages), comparison with batch-plan.md §6.3
//   queue/roles.json         identity (role) of every page order and why (uc-roles.mjs); undecided ones with the reason
//   out/maps/<id>.json       per-order import map, generated from registry/<app>.json (same symbol → same path everywhere)
//   out/hints/<id>.md        per-order import hint sheet (definition snippets)
// Pages already accepted in hmrsfw-vue (its router.ts) get status "regression": no restore order is dispatched for them.
// Usage: node tools/work-orders.mjs --app <hmrsfw-vue> [--dry-run]   (registry/<app>.json must be current: tools/registry.mjs)
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parse } from "@babel/parser";
import { ROOT, SITES, APP_OF, hamiScope, siteGraph, chunkSource, chunkPath, kbOf, componentsOf, cssOf, importsOf } from "./scope.mjs";
import { scanSharedGaps } from "./scan-shared-gaps.mjs";
import { loadRegistry, chunkBase, appExportIndex, seedIndex } from "./registry.mjs";
import { segmentPlan, SEGMENT_KB } from "./segments.mjs";
import { describe } from "./describe-imports.mjs";
import { appDir } from "./app-dir.mjs";
import { ucRoles } from "./uc-roles.mjs";

const SMALL_KB = 5;
const ENTRY_AREAS = {
  E1: { title: "构建配置与 .env", files: ["vite.<app>.config.ts", ".env.example"], note: "别名、代理 /xf-api、base；.env.example 只放占位符（VITE_SM2_PUBLIC_KEY、VITE_SM4_KEY、地图 AK），不得出现真实值" },
  E2: { title: "main：应用创建、插件、全局组件与指令、图标、语言包、wujie 分支", files: ["apps/<app>/src/main.ts", "apps/<app>/src/directives.ts"], note: "全局注册必须与 registry 的 globals 一致" },
  E3: { title: "路由与登录/角色守卫", files: ["apps/<app>/src/router.ts"], note: "只接哈密（appCode 018）的路由；还原中的页面用工单 target 路径懒加载" },
  E4: { title: "store", files: ["apps/<app>/src/legacy/store.ts"], note: "门户 vuex，用户中心 pinia（+ autoLogin 用的 vuex）" },
  E5: { title: "请求层与加解密", files: ["apps/<app>/src/utils/request.ts", "apps/<app>/src/utils/crypto-adapter.ts"], note: "SM2 请求体、SM4 响应与存储；密钥只从 import.meta.env 读取，不从旧包提取" },
  E6: { title: "工具、常量与入口里的接口函数", files: ["apps/<app>/src/legacy/index.ts", "apps/<app>/src/legacy/utils.ts", "apps/<app>/src/legacy/api.ts", "apps/<app>/src/legacy/images.ts"], note: "按 registry.entry 中 owner 为本单的条目逐个实现，导出名以清单为准" },
  E7: { title: "样式与依赖版本", files: ["apps/<app>/src/styles/", "package.json"], note: "拆回 ant-design-vue 依赖与全局样式源文件；按站点锁版本（门户 Vue 3.2.47 / antd 3.2.15，用户中心 Vue 3.3.4 / antd 3.2.20）" },
};

// "@/legacy" is the barrel legacy/index.ts; "@/x/y" without extension is y.ts
const BARRELS = new Set(["@/legacy"]);
export const specToFile = (app, spec) => !spec?.startsWith("@/") ? null : BARRELS.has(spec) ? `apps/${app}/src/${spec.slice(2)}/index.ts` : `apps/${app}/src/${spec.slice(2)}${/\.(vue|ts|json)$/.test(spec) ? "" : ".ts"}`;
const slug = (s) => s.replace(/\.vue$/, "").replace(/[^\w/-]/g, "_").split("/").filter(Boolean).join(".");

// accepted pages in hmrsfw-vue: router.ts lines `{ path: "/x", ... import("@views/Y.vue") }`
function acceptedPages(APP, app) {
  const f = path.join(APP, "apps", app, "src", "router.ts"); if (!existsSync(f)) return [];
  return [...readFileSync(f, "utf8").matchAll(/path:\s*"([^"]+)"[^\n]*?import\("@views\/([^"]+\.vue)"\)/g)].map((m) => ({ route: m[1], view: m[2] }));
}

// ---- maps: every import binding of a chunk resolved through the registry -----------------------------------------------
// Static imports of sibling chunks ("./x.js"), read from the AST: [{ from, specs: [[imported, local]] }]. Every form is covered
// (`import{a as b}`, `import D,{__tla as t}` — a sibling view under top-level await —, `import D`, `import * as N`, `import"./x.js"`);
// the default binding is the export `default`, a namespace is `*`. A bare `import"./x.js"` has no specs.
const importsMemo = new Map();
export function relativeImports(src) {
  if (importsMemo.has(src)) return importsMemo.get(src);
  const name = (n) => n.name ?? n.value;
  const out = parse(src, { sourceType: "module", plugins: ["topLevelAwait"] }).program.body
    .filter((n) => n.type === "ImportDeclaration" && n.source.value.startsWith("./"))
    .map((n) => ({ from: n.source.value.slice(2), specs: n.specifiers.map((s) => [s.type === "ImportDefaultSpecifier" ? "default" : s.type === "ImportNamespaceSpecifier" ? "*" : name(s.imported), s.local.name]) }));
  importsMemo.set(src, out);
  return out;
}

export function buildMaps(site, chunk, reg, ordersByChunk) {
  const cfg = SITES[site]; const g = siteGraph(site); const src = chunkSource(site, chunk) ?? "";
  const out = { chunk: chunkPath(site, chunk), app: reg.app, vueVersion: reg.vueVersion, vue: {}, entry: {}, api: {}, shared: {}, views: {}, modules: {}, sideEffects: [], missing: [] };
  for (const { from, specs } of relativeImports(src)) {
    for (const [imported, local] of specs) {
      if (imported === "__tla") continue;
      if (from === cfg.vue) { const a = reg.vue[imported]; out.vue[local] = a ? `${a.name}${a.from !== "vue" ? ` (${a.from})` : ""}` : `?${imported}`; if (!a) out.missing.push(`vue:${imported}`); continue; }
      if (from === cfg.entry) { const e = reg.entry[imported]; if (!e) { out.entry[local] = { export: imported, missing: true }; out.missing.push(`entry:${imported}`); continue; }
        out.entry[local] = e.status === "ignore" ? { original: imported, ignore: e.reason } : { original: imported, path: e.path, export: e.export, status: e.status, ...(e.local ? { as: e.local } : {}), ...(e.owner && e.status === "reserved" ? { owner: e.owner } : {}) }; continue; }
      const api = reg.api[`${from}#${imported}`];
      if (api) { out.api[local] = { original: `${from}#${imported}`, path: api.path, export: api.export, status: api.status, url: api.url }; continue; }
      const sh = reg.shared[from];
      if (sh) { const x = sh.exports[imported]; out.shared[local] = x?.npm ? { original: `${from}#${imported}`, path: x.path, export: x.export, status: "npm" } : { original: `${from}#${imported}`, path: x?.path ?? sh.path, export: x?.export ?? imported, status: sh.status, ...(sh.status === "reserved" ? { owner: sh.owner } : {}) }; if (!x) out.missing.push(`shared:${from}#${imported}`); continue; }
      const mod = reg.modules[from];
      if (mod) { const x = mod.exports[imported]; out.modules[local] = x ? { original: `${from}#${imported}`, ...x } : { original: `${from}#${imported}`, missing: true }; if (!x) out.missing.push(`module:${from}#${imported}`); continue; }
      if (g.kind.get(from) === "view") { const o = ordersByChunk.get(`${site}/${from}`); out.views[local] = o ? { original: `${from}#${imported}`, path: `@/${o.target.replace(/^apps\/[^/]+\/src\//, "")}`, export: "default", order: o.id } : { original: `${from}#${imported}`, missing: true }; if (!o) out.missing.push(`view:${from}`); continue; }
      out.missing.push(`${from}#${imported}`);
    }
  }
  for (const { from, specs } of relativeImports(src)) if (!specs.length) out.sideEffects.push(from);
  return out;
}

const hintsMd = (id, site, chunk, maps) => {
  const res = describe(site, chunk);
  const target = (local) => { for (const k of ["entry", "api", "shared", "views", "modules"]) { const v = maps[k][local]; if (v) return v.ignore ? `（不需要：${v.ignore}）` : v.missing ? "（清单缺失）" : v.value ? `${v.path ?? ""} \`${v.export ?? ""}\`` : `${v.path} \`${v.export}\`${v.status === "reserved" ? "（reserved）" : ""}`; } return maps.vue[local] ? `vue \`${maps.vue[local]}\`` : ""; };
  const rows = res.filter((r) => r.from !== "vue-runtime").map((r) => `| \`${r.local}\` | ${r.from} | ${r.kind ?? r.lib} | ${target(r.local)} | ${r.def ? "`" + r.def.slice(0, 200).replace(/\|/g, "\\|").replace(/`/g, "'") + "`" : ""} |`);
  return [`# 导入提示：${id}`, "", `原 chunk \`${chunk}\`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。`, "", "| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |", "|---|---|---|---|---|", ...rows].join("\n") + "\n";
};

// Imports of the original chunk that the registry (vue / entry / api / shared / views / modules) has no entry for (docs/work-orders.md `missing`).
// An order with a non-empty `missing` is not dispatchable (playbook 3.5): the restorer would have to invent a path, and self-check refuses it.
// Written only when non-empty, so orders that are fine stay byte-identical.
function withMissing(o, maps) { const m = [...new Set(maps.missing)].sort(); if (m.length) o.missing = m; }

function depsOf(maps, selfId) {
  const deps = { entry: [], shared: [], api: [], modules: [], views: [], orders: [] };
  const add = (k, v) => { if (!deps[k].includes(v)) deps[k].push(v); };
  for (const v of Object.values(maps.entry)) if (!v.ignore && !v.missing) { add("entry", v.original); if (v.owner) add("orders", v.owner); }
  for (const v of Object.values(maps.shared)) { if (v.status !== "npm") add("shared", v.original.split("#")[0]); if (v.owner) add("orders", v.owner); }
  for (const v of Object.values(maps.api)) add("api", v.original);
  for (const v of Object.values(maps.modules)) if (v.owner) { add("modules", v.original.split("#")[0]); add("orders", v.owner); }
  for (const v of Object.values(maps.views)) if (v.order) { add("views", v.order); add("orders", v.order); }
  deps.orders = deps.orders.filter((o) => o !== selfId);
  for (const k of Object.keys(deps)) deps[k].sort();
  return deps;
}

export function buildOrders(APP) {
  const orders = []; const routes = []; const blockedRoutes = []; const roles = {}; const summary = { generatedFrom: {}, sites: {} };
  for (const site of Object.keys(SITES)) {
    const app = APP_OF[site]; const cfg = SITES[site]; const reg = loadRegistry(app); const scope = hamiScope(site); const g = siteGraph(site);
    const gaps = scanSharedGaps(site);
    const accepted = acceptedPages(APP, app);
    const acceptedByView = new Map(accepted.map((a) => [a.view, a]));
    const siteOrders = [];

    // ---- pages ----
    const pageChunks = [...scope.roots.map((r) => ({ chunk: r.chunk, key: r.key, routes: r.routes, root: true })), ...scope.extraViews.map((chunk) => ({ chunk, key: g.views.get(chunk)?.keys?.[0] ?? null, routes: [], root: false }))];
    const usedTargets = new Set(); const byChunk = new Map();
    // views the POC restored into src/shared/ (they are imported by other pages): accepted where they are
    const seeds = seedIndex(appExportIndex(APP, app), g);
    for (const p of pageChunks) {
      let rel;
      if (site === "portal") rel = p.key.replace(/^src\/views\//, "");
      else {
        const acc = accepted.find((a) => p.routes.some((r) => r.path === a.route));
        const first = p.routes[0]?.path ?? "/" + chunkBase(p.chunk);
        rel = acc ? acc.view : `${first.split("/").filter((s) => s && !s.startsWith(":")).join("/") || chunkBase(p.chunk)}.vue`;
      }
      if (usedTargets.has(rel)) rel = rel.replace(/\.vue$/, `_${chunkBase(p.chunk)}.vue`);
      usedTargets.add(rel);
      const seed = seeds.get(p.chunk);
      const target = seed ? `apps/${app}/src/${seed.slice(2)}.vue` : `apps/${app}/src/views/${rel}`;
      const acc = acceptedByView.get(rel) ?? (seed ? { route: p.routes[0]?.path ?? null, in: `hmrsfw-vue ${seed}.vue（POC 放在共享层；registry-cleanup 方案里迁回 views/${rel}）` } : null);
      const comps = componentsOf(site, p.chunk);
      const o = { id: `page.${app}.${slug(rel)}`, type: "page", status: acc ? "regression" : "todo", site, app, vueVersion: cfg.vueVersion, kb: kbOf(site, p.chunk), sourceChunk: chunkPath(site, p.chunk),
        components: comps.map((c) => ({ name: c.name, scopeId: c.scopeId })), scopeIds: comps.map((c) => c.scopeId).filter(Boolean), cssCandidates: cssOf(site, p.chunk),
        target, subComponentDir: target.replace(/\.vue$/, "/"), routes: p.routes.map((r) => ({ path: r.path, name: r.name ?? null, ...(r.meta?.title ? { title: r.meta.title } : {}) })), recordPath: p.routes[0]?.path ?? null, role: site === "portal" ? "general" : null,
        maps: null, hints: null, deps: null, stylesProvidedByScript: true, ...(acc ? { accepted: { route: acc.route, in: acc.in ?? "hmrsfw-vue router.ts（已验收，只做回归）" } } : {}) };
      byChunk.set(`${site}/${p.chunk}`, o); siteOrders.push(o);
      for (const r of p.routes) routes.push({ site, app, route: r.path, chunk: p.chunk, order: o.id });
    }
    // views reached only through another view: record through the nearest routed importer
    for (const o of siteOrders.filter((x) => x.type === "page" && !x.recordPath)) {
      const chunk = o.sourceChunk.split("/").pop(); const seen = new Set([chunk]); let q = [chunk], via = null;
      while (q.length && !via) { const next = []; for (const c of q) for (const imp of scope.importedBy.get(c) ?? []) { if (seen.has(imp)) continue; seen.add(imp); const po = byChunk.get(`${site}/${imp}`); if (po?.recordPath) { via = po; break; } next.push(imp); } q = next; }
      if (via) { o.recordPath = via.recordPath; o.recordVia = via.id; }
    }
    // identity to record with: portal needs none; user center by route and chunk, undecided → null + notes (never guessed)
    if (site === "usercenter") for (const [id, r] of ucRoles(siteOrders.filter((x) => x.type === "page"))) { const o = siteOrders.find((x) => x.id === id); o.role = r.role; if (!r.role) o.notes = r.notes; roles[id] = r; }
    else for (const o of siteOrders) if (o.type === "page") roles[o.id] = { role: "general", by: "门户不需要身份" };
    for (const b of scope.blocked) blockedRoutes.push({ site, app, route: b.route, component: b.component, reason: b.reason });

    // ---- shared (components + small app modules) ----
    const modulesOrder = { id: `shared.${app}.modules`, type: "shared", subtype: "modules", status: "todo", site, app, vueVersion: cfg.vueVersion, kb: 0, chunks: [], files: [], sourceChunk: null, maps: null, hints: null, deps: null, note: "入口和共享组件以外的小模块（工具函数、配置、图片常量），每个 chunk 一个文件；图片常量统一导出到 @/shared/images.ts，内联 base64 抽成资源文件" };
    for (const [chunk, sh] of Object.entries(reg.shared)) {
      const file = specToFile(app, sh.path);
      const allNpm = Object.values(sh.exports).every((x) => x.npm);
      if (sh.kind === "module" || sh.owner?.endsWith(".modules")) {
        if (allNpm) continue;
        modulesOrder.chunks.push({ chunk: chunkPath(site, chunk), file, status: sh.status, exports: sh.exports, kb: sh.kb }); if (sh.status !== "restored") modulesOrder.kb += sh.kb; if (!modulesOrder.files.includes(file)) modulesOrder.files.push(file);
        continue;
      }
      if (sh.status === "npm") { const o = { id: `shared.${app}.${chunkBase(chunk)}`, type: "shared", status: "npm", site, app, kb: sh.kb, sourceChunk: chunkPath(site, chunk), npm: sh.npm, registryKey: chunk, note: `打包进来的 npm 组件库 ${sh.npm}，用 npm 依赖代替，不出还原单${sh.note ? "；" + sh.note : ""}`, usedBy: [], deps: { orders: [] } }; byChunk.set(`${site}/${chunk}`, o); siteOrders.push(o); continue; }
      const comps = componentsOf(site, chunk); const c = chunkSource(site, chunk) ?? ""; const first = comps.length ? Math.min(...comps.map((x) => x.at)) : 0;
      // a big chunk whose components start late carries a bundled library or data block first
      const bundledKb = sh.kb > 40 && first / 1024 > 30 ? +(first / 1024).toFixed(1) : 0;
      const lib = bundledKb ? (/tinymce/.test(c) ? `tinymce ${c.match(/majorVersion:"(\d+)",minorVersion:"([\d.]+)"/)?.slice(1).join(".") ?? ""}`.trim() : /jQuery v3\.7\.0/.test(c) ? "jquery 3.7.0 + tianai-captcha" : /Cropper\.js v([\d.]+)/.test(c) ? `cropperjs ${c.match(/Cropper\.js v([\d.]+)/)[1]}` : /TagCanvas/.test(c) ? "TagCanvas（jQuery 插件，无官方 npm 包，待核对）" : /FeatureCollection|"coordinates"/.test(c.slice(0, first)) ? "地图 geojson 数据" : "未识别（数据或库，待核对）") : null;
      const o = { id: sh.owner, type: "shared", status: sh.status === "restored" ? "regression" : "todo", site, app, vueVersion: cfg.vueVersion, kb: bundledKb ? +(sh.kb - bundledKb).toFixed(1) : sh.kb, chunkKb: sh.kb, ...(bundledKb ? { bundled: { kb: bundledKb, what: lib, rule: "开头这段是打包进来的库或数据：库改为 npm 依赖（版本按指纹），数据抽成 JSON/资源文件，不得原样拷进 .vue" } } : {}),
        sourceChunk: chunkPath(site, chunk), components: comps.map((x) => ({ name: x.name, scopeId: x.scopeId })), scopeIds: comps.map((x) => x.scopeId).filter(Boolean), cssCandidates: cssOf(site, chunk),
        target: Object.values(sh.exports).some((x) => !x.path) || !Object.values(sh.exports).some((x) => x.path?.endsWith(".vue")) ? file : specToFile(app, Object.values(sh.exports).filter((x) => x.path?.endsWith(".vue")).at(-1).path),
        ...(Object.values(sh.exports).some((x) => x.path?.startsWith(`@/shared/${sh.path.slice(9).replace(/\.(ts|vue)$/, "")}/`)) ? { subComponentDir: `apps/${app}/src/shared/${sh.path.slice(9).replace(/\.(ts|vue)$/, "")}/` } : {}),
        exports: sh.exports, registryKey: chunk, usedBy: [], maps: null, hints: null, deps: null, stylesProvidedByScript: true };
      byChunk.set(`${site}/${chunk}`, o); siteOrders.push(o);
    }
    for (const [chunk, m] of Object.entries(reg.modules)) if (m.kind === "asset") { modulesOrder.chunks.push({ chunk: chunkPath(site, chunk), file: specToFile(app, "@/shared/images"), status: "reserved", exports: m.exports, kb: kbOf(site, chunk) }); modulesOrder.kb += kbOf(site, chunk); }
    modulesOrder.kb = +modulesOrder.kb.toFixed(1); if (!modulesOrder.files.includes(`apps/${app}/src/shared/images.ts`)) modulesOrder.files.push(`apps/${app}/src/shared/images.ts`);
    if (modulesOrder.chunks.some((x) => x.status !== "restored")) siteOrders.push(modulesOrder);

    // ---- entry ----
    const owned = (id) => Object.entries(reg.entry).filter(([, e]) => e.owner === id).map(([alias, e]) => ({ alias, path: e.path, export: e.export, status: e.status, ...(e.url ? { url: e.url } : {}), ...(e.stub ? { stub: e.stub } : {}) }));
    for (const [area, a] of Object.entries(ENTRY_AREAS)) {
      const id = `entry.${app}.${area}`; const own = owned(id);
      siteOrders.push({ id, type: "entry", area, title: a.title, status: "todo", site, app, vueVersion: cfg.vueVersion, sourceChunk: chunkPath(site, cfg.entry), kb: null, appCode: gaps.appCode,
        files: a.files.map((f) => f.replace("<app>", app)), owns: own, globals: area === "E2" ? reg.globals : undefined, note: a.note, deps: { orders: [] } });
    }
    gaps.entry.componentGroups.forEach((grp, i) => {
      const id = `entry.${app}.c${String(i + 1).padStart(2, "0")}`; const own = owned(id);
      const comps = grp.map((c) => { const h = gaps.entry.hamiComponents.find((x) => x.binding === c.binding); const e = own.find((x) => reg.entry[x.alias]?.component === h?.name); return { name: c.name, binding: c.binding, scopeId: h?.scopeId ?? null, kb: c.kb, exportedAs: h?.exportedAs ?? [], file: e?.stub ?? (e && /\.vue$/.test(e.path) ? specToFile(app, e.path) : `apps/${app}/src/legacy/components/${c.name.replace(/(^|-)(\w)/g, (_, __, x) => x.toUpperCase())}.vue`), ...(e?.stub ? { replacesStub: true } : {}) }; });
      siteOrders.push({ id, type: "entry", area: "component", title: `入口全局组件：${grp.map((c) => c.name).join("、")}`, status: "todo", site, app, vueVersion: cfg.vueVersion, sourceChunk: chunkPath(site, cfg.entry), kb: +grp.reduce((s, c) => s + c.kb, 0).toFixed(1), appCode: gaps.appCode,
        components: comps, files: [...new Set(comps.map((c) => c.file))], owns: own, note: "只还原哈密（appCode 018）用到的变体；组件定义在入口 chunk 内，按 binding 名定位", deps: { orders: [] } });
    });
    // E-order sizes: the definitions they own
    for (const o of siteOrders.filter((x) => x.type === "entry" && x.kb == null)) { o.kb = o.owns.length ? +(o.owns.length * 0.4).toFixed(1) : null; o.kbEstimated = true; } // ~0.4KB per owned export; E1/E2/E3/E7 have no export to count

    // ---- maps, hints, deps ----
    for (const o of siteOrders) {
      if (o.type === "page" || o.type === "shared" && o.subtype !== "modules") {
        const chunk = o.sourceChunk.split("/").pop();
        const maps = buildMaps(site, chunk, reg, byChunk);
        o.maps = `out/maps/${o.id}.json`; o.hints = `out/hints/${o.id}.md`; o._maps = maps; o._hints = hintsMd(o.id, site, chunk, maps);
        o.deps = depsOf(maps, o.id); withMissing(o, maps);
      } else if (o.subtype === "modules") {
        const all = { entry: {}, shared: {}, api: {}, modules: {}, views: {}, vue: {}, missing: [], sideEffects: [] };
        for (const c of o.chunks) { const m = buildMaps(site, c.chunk.split("/").pop(), reg, byChunk); for (const k of ["entry", "shared", "api", "modules", "views", "vue"]) Object.assign(all[k], m[k]); all.missing.push(...m.missing); }
        o.maps = `out/maps/${o.id}.json`; o._maps = { chunk: o.chunks.map((c) => c.chunk), app, vueVersion: cfg.vueVersion, ...all }; o.deps = depsOf(all, o.id); withMissing(o, all);
      }
    }
    // shared: which pages import it (regression set when it changes)
    const sharedByKey = new Map(siteOrders.filter((o) => o.type === "shared" && o.registryKey).map((o) => [o.registryKey, o]));
    for (const o of siteOrders) for (const s of o.deps?.shared ?? []) sharedByKey.get(s)?.usedBy.push(o.id);

    // ---- segments for pages ≥ 30KB that are not already accepted ----
    for (const o of siteOrders.filter((x) => x.type === "page" && x.kb >= SEGMENT_KB && x.status !== "regression")) {
      const chunk = o.sourceChunk.split("/").pop(); const plan = segmentPlan(site, chunk, o.kb);
      o.status = "segmented"; o.segments = [];
      const main = o.components.at(-1)?.name;
      const fileOf = (name) => name === main ? o.target : `${o.subComponentDir}${name}.vue`;
      for (const s of plan) {
        const id = `seg.${o.id.slice(5)}.${s.index}`; o.segments.push(id);
        const outputs = [...s.components.map(fileOf), ...s.parts.map((p) => `${o.subComponentDir}_seg/${p.component}.${p.part === "script" ? "script.ts" : "template.html"}`)];
        const last = s.index === s.of;
        siteOrders.push({ id, type: "segment", status: "todo", site, app, vueVersion: o.vueVersion, page: o.id, index: s.index, of: s.of, assemble: last, after: last ? o.segments.slice(0, -1).concat(plan.slice(s.index).map((x) => `seg.${o.id.slice(5)}.${x.index}`)).filter((x) => x !== id) : [],
          kb: s.kb, oversize: s.oversize || undefined, sourceChunk: o.sourceChunk, range: s.range, factRanges: s.factRanges, components: s.components.map((n) => o.components.find((c) => c.name === n) ?? { name: n }), parts: s.parts.map((p) => ({ ...p, file: `${o.subComponentDir}_seg/${p.component}.${p.part === "script" ? "script.ts" : "template.html"}` })),
          outputs, target: o.target, subComponentDir: o.subComponentDir, scopeIds: o.scopeIds, cssCandidates: o.cssCandidates, routes: o.routes, recordPath: o.recordPath, ...(o.recordVia ? { recordVia: o.recordVia } : {}), role: o.role, ...(o.notes ? { notes: o.notes } : {}),
          maps: o.maps, hints: o.hints, deps: o.deps, ...(o.missing ? { missing: o.missing } : {}), stylesProvidedByScript: true,
          instructions: [
            `本单只还原原 chunk 的字符区间 [${s.range[0]}, ${s.range[1]})（JS 字符串下标，不是字节偏移；约 ${s.kb}KB），其余部分由同页的其他分段负责。`,
            ...(s.components.length ? [`完整还原这些组件并写成 SFC：${s.components.map((n) => `${n} → ${fileOf(n)}`).join("；")}。`] : []),
            ...s.parts.map((p) => p.part === "script" ? `组件 ${p.component} 只还原 <script setup> 部分（setup 函数体，不含最后 return 的渲染函数），写成 ${o.subComponentDir}_seg/${p.component}.script.ts，内容就是将来 <script setup lang="ts"> 里的代码。` : `组件 ${p.component} 只还原 <template> 部分（setup 最后 return 的渲染函数），写成 ${o.subComponentDir}_seg/${p.component}.template.html，内容就是将来 <template> 里的模板。`),
            last ? `本单是最后一段：等其他分段合入后，运行 node tools/assemble-segments.mjs ${o.id} --app "$HMRSFW_APP_DIR" 把 _seg/ 下的片段合成 SFC（会删除 _seg/），再对整页跑 self-check。门槛只在本单之后对整页运行。` : "本单不是最后一段：只跑静态自检（self-check 会按分段模式检查片段），不跑页面门槛。",
          ] });
      }
    }

    for (const o of siteOrders) if (o.deps?.orders) o.deps.orders = o.deps.orders.filter((x) => siteOrders.some((y) => y.id === x) || x.startsWith("entry.") || x.startsWith("shared."));
    orders.push(...siteOrders);

    // ---- per-site numbers ----
    const pages = siteOrders.filter((o) => o.type === "page");
    const band = (lo, hi) => pages.filter((o) => o.kb >= lo && o.kb < hi);
    summary.sites[site] = {
      app, pages: pages.length, routeViews: scope.roots.length, importedViews: scope.extraViews.length,
      accepted: pages.filter((o) => o.status === "regression").length, pageOrders: pages.filter((o) => o.status === "todo").length,
      segmentedPages: pages.filter((o) => o.status === "segmented").map((o) => ({ id: o.id, kb: o.kb, segments: o.segments.length })),
      segments: siteOrders.filter((o) => o.type === "segment").length,
      sizeBands: { "<5": band(0, 5).length, "5-30": band(5, 30).length, "30-60": band(30, 60).length, ">=60": band(60, 1e9).length },
      pages30to60: band(30, 60).map((o) => ({ id: o.id, kb: o.kb, status: o.status })),
      shared: siteOrders.filter((o) => o.type === "shared" && o.subtype !== "modules").length, sharedTodo: siteOrders.filter((o) => o.type === "shared" && o.subtype !== "modules" && o.status === "todo").length, sharedNpm: siteOrders.filter((o) => o.type === "shared" && o.status === "npm").map((o) => o.id),
      sharedModulesOrders: siteOrders.filter((o) => o.subtype === "modules").length,
      entry: siteOrders.filter((o) => o.type === "entry").length, entryComponents: gaps.entry.hamiComponents.length,
      smallPagesForBundling: pages.filter((o) => o.status === "todo" && o.kb < SMALL_KB).length,
      blockedRoutes: scope.blocked.length, bigChunks: gaps.bigChunks,
    };
  }
  const t = (type, f = () => true) => orders.filter((o) => o.type === type && f(o)).length;
  summary.totals = {
    orders: orders.length, dispatchable: orders.filter((o) => o.status === "todo" && !o.missing).length, withMissing: orders.filter((o) => o.missing).length,
    pages: t("page"), pageOrders: t("page", (o) => o.status === "todo"), regression: orders.filter((o) => o.status === "regression").length, segmentedPages: t("page", (o) => o.status === "segmented"), segments: t("segment"),
    shared: t("shared", (o) => o.subtype !== "modules"), sharedTodo: t("shared", (o) => o.subtype !== "modules" && o.status === "todo"), sharedModules: t("shared", (o) => o.subtype === "modules"), entry: t("entry"),
  };
  return { orders, routes, blockedRoutes, roles, summary };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const APP = appDir(); const dry = process.argv.includes("--dry-run");
  const { orders, routes, blockedRoutes, roles, summary } = buildOrders(APP);
  if (!dry) {
    const q = path.join(ROOT, "queue"); rmSync(q, { recursive: true, force: true }); mkdirSync(q, { recursive: true });
    mkdirSync(path.join(ROOT, "out/maps"), { recursive: true }); mkdirSync(path.join(ROOT, "out/hints"), { recursive: true });
    // previous generated maps/hints (ids with a dot); the c01–c20 confirmation files are kept
    for (const d of ["out/maps", "out/hints"]) for (const f of readdirSync(path.join(ROOT, d))) if (/^(page|seg|shared|entry)\./.test(f)) rmSync(path.join(ROOT, d, f));
    for (const o of orders) {
      const { _maps, _hints, ...rec } = o;
      writeFileSync(path.join(q, `${o.id}.json`), JSON.stringify(rec, null, 1) + "\n");
      if (_maps && (o.type !== "segment")) writeFileSync(path.join(ROOT, o.maps), JSON.stringify({ id: o.id, ..._maps }, null, 1) + "\n");
      if (_hints) writeFileSync(path.join(ROOT, o.hints), _hints);
    }
    const reverse = {}; for (const o of orders) for (const d of o.deps?.orders ?? []) (reverse[d] ??= []).push(o.id);
    writeFileSync(path.join(q, "index.json"), JSON.stringify({ orders: orders.map((o) => ({ id: o.id, type: o.type, status: o.status, app: o.app, kb: o.kb, ...(o.after?.length ? { after: o.after } : {}), ...(o.missing ? { missing: o.missing } : {}), deps: o.deps?.orders ?? [] })), dependents: reverse }, null, 1) + "\n");
    writeFileSync(path.join(q, "routes.json"), JSON.stringify({ routes, blocked: blockedRoutes }, null, 1) + "\n");
    writeFileSync(path.join(q, "summary.json"), JSON.stringify(summary, null, 1) + "\n");
    writeFileSync(path.join(q, "roles.json"), JSON.stringify(roles, null, 1) + "\n");
  }
  console.log(JSON.stringify(summary.totals));
  for (const [site, s] of Object.entries(summary.sites)) console.log(site, JSON.stringify({ pages: s.pages, accepted: s.accepted, pageOrders: s.pageOrders, segmented: s.segmentedPages.length, segments: s.segments, bands: s.sizeBands, shared: s.shared, sharedTodo: s.sharedTodo, modules: s.sharedModulesOrders, entry: s.entry }));
}
