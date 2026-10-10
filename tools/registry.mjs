// Public-library registry registry/<app>.json (docs/pipeline.md §13): every public symbol of the original build that the
// Hami scope imports gets ONE source location in hmrsfw-vue — entry exports, shared chunks (components and small app
// modules), API modules, bundled npm code, image constants. Page maps (out/maps/<id>.json) are generated from it, so the
// same original symbol has the same path and export name in every work order.
//
// Seed: what hmrsfw-vue already has (src/legacy, src/shared, src/api, src/utils) is "restored"; everything else is
// "reserved" with its final path and name and an owner work order. Stubs in hmrsfw-vue (e.g. portal legacy/LoginModal.vue)
// stay "reserved". Planned renames (hash-named API files → business names) are recorded in `renameTo`; `path` is where
// the symbol lives today, and tools/registry-cleanup.mjs --apply moves both together.
//
// Usage: node tools/registry.mjs --app <hmrsfw-vue> [--check]
//   writes registry/portal.json, registry/uc.json; --check only compares with the committed files (exit 1 on difference)
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { ROOT, SITES, APP_OF, hamiScope, siteGraph, chunkSource, exportsOf, bindingsFrom, kbOf, componentsOf } from "./scope.mjs";
import { scanSharedGaps } from "./scan-shared-gaps.mjs";
import { parseApiChunk, nameFromUrl } from "./restore-api.mjs";
import { appDir } from "./app-dir.mjs";
import { symbolsOf } from "./entry-symbols.mjs";

export const REGISTRY_DIR = path.join(ROOT, "registry");
const pascal = (n) => n.replace(/(^|[-_ ])(\w)/g, (_, __, c) => c.toUpperCase()).replace(/[^\w$]/g, "");
const camel = (n) => { const p = pascal(n); return p.charAt(0).toLowerCase() + p.slice(1); };
export const chunkBase = (f) => f.replace(/\.\d{10,}\d*\.js$/, "").replace(/\.vue_vue_type_.*$/, "").replace(/\.es(\.min)?$/, "");

// ---- the hmrsfw-vue side: which files exist and what they export -------------------------------------------------------
function walk(dir) { if (!existsSync(dir)) return []; return readdirSync(dir).flatMap((n) => { const p = path.join(dir, n); return statSync(p).isDirectory() ? walk(p) : [p]; }); }
export function appExportIndex(APP, app) {
  const src = path.join(APP, "apps", app, "src"); const idx = new Map(); // specifier → {file, exports:Set, stub}
  for (const f of walk(src)) {
    if (!/\.(ts|vue)$/.test(f) || f.includes(`${path.sep}views${path.sep}`)) continue;
    const rel = path.relative(src, f).split(path.sep).join("/");
    const code = readFileSync(f, "utf8"); const ex = new Set();
    if (f.endsWith(".vue")) ex.add("default");
    for (const m of code.matchAll(/export\s+(?:const|let|var|function\*?|class|enum|async\s+function)\s+([\w$]+)/g)) ex.add(m[1]);
    for (const m of code.matchAll(/export\s+default\b/g)) ex.add("default");
    const aliasOf = new Map(); // exported alias → readable local name (`export { successCountdown as s }`)
    for (const m of code.matchAll(/export\s*\{([^}]*)\}(?!\s*from)/g)) for (const part of m[1].split(",")) { const [l, a] = part.trim().split(/\s+as\s+/).map((x) => x?.trim()); const nm = a ?? l; if (nm) ex.add(nm); if (a && l && a !== l) aliasOf.set(a, l); }
    for (const m of code.matchAll(/export\s*\{([^}]*)\}\s*from/g)) for (const part of m[1].split(",")) { const nm = part.trim().split(/\s+as\s+/).pop()?.trim(); if (nm) ex.add(nm); }
    const star = [...code.matchAll(/export\s*\*\s*from\s*"([^"]+)"/g)].map((m) => m[1]);
    for (const m of code.matchAll(/export\s+(?:type|interface)\s+([\w$]+)/g)) ex.add(m[1]);
    // `export { default as X } from "@/legacy/X.vue"` / "./X.vue": remember where X really lives (to see stubs behind a barrel)
    const reexports = new Map();
    for (const m of code.matchAll(/export\s*\{([^}]*)\}\s*from\s*"([^"]+)"/g)) { const from = m[2].startsWith(".") ? "@/" + path.posix.join(path.posix.dirname(path.relative(src, f).split(path.sep).join("/")), m[2]) : m[2]; for (const part of m[1].split(",")) { const nm = part.trim().split(/\s+as\s+/).pop()?.trim(); if (nm) reexports.set(nm, from.replace(/\.ts$/, "")); } }
    const stub = /^\s*(<script[^>]*>\s*)?\/\/\s*Stub\b/m.test(code.slice(0, 400));
    const spec = "@/" + rel.replace(/\.ts$/, "").replace(/\/index$/, "");
    // the chunk this file was restored from: the first chunk file name in its header ("还原自 …/x.<hash>.js", "Restored from x.<hash>.js")
    const head = code.slice(0, 600); const primary = head.match(/([\w.-]+\.\d{13}\d*\.js)/)?.[1] ?? null; const primaryBase = primary ? null : head.match(/(?:Restored from|还原自)\s+`?([\w.-]+)\.<hash>\.js/)?.[1] ?? null;
    idx.set(spec, { file: `apps/${app}/src/${rel}`, exports: ex, stub, reexports, aliasOf, star, primary, primaryBase });
  }
  // `export * from "x"` takes over every name of x
  for (const v of idx.values()) for (const from of v.star) { const t = idx.get(from.replace(/\.ts$/, "")); if (t) for (const n of t.exports) if (n !== "default") { v.exports.add(n); v.reexports.set(n, from.replace(/\.ts$/, "")); } }
  return idx;
}

// chunk → the hmrsfw-vue shared/ file restored from it (by the file header), .vue preferred over a re-export .ts
export function seedIndex(idx, sg) {
  const seeded = new Map();
  const files = [...sg.kind.keys()];
  for (const [spec, v] of [...idx].sort(([a], [b]) => (b.endsWith(".vue") ? 1 : 0) - (a.endsWith(".vue") ? 1 : 0))) {
    if (!spec.startsWith("@/shared/")) continue;
    const chunk = v.primary ?? (v.primaryBase ? files.find((f) => chunkBase(f) === v.primaryBase) : null);
    if (chunk && !seeded.has(chunk)) seeded.set(chunk, spec.replace(/\.vue$/, ""));
  }
  return seeded;
}

// Shared chunks that are npm component libraries bundled by Vite (they define a component, so scope.mjs calls them shared)
const SHARED_NPM = {
  "vue3-seamless-scroll": { npm: "vue3-seamless-scroll", export: "Vue3SeamlessScroll", note: "props 含 singleLine/copyNum，对应 2.0.1" },
  "vue-countup-v3": { npm: "vue-countup-v3", export: "default", note: "依赖不在 hmrsfw-vue/package.json 里，版本由 E7 按指纹核对后加入" },
};

// the component an export of a chunk stands for: `X=<defineComponent>({__name:"x"` or `X=<sfc>(Y,[["__scopeId",…]])`
export function componentOfExport(site, chunk, local) {
  const c = chunkSource(site, chunk) ?? ""; if (!local) return null;
  const esc = local.replace(/\$/g, "\\$");
  for (let i = 0, v = esc; i < 3; i++) {
    const m = c.match(new RegExp(`[\\s,;{(]${v}=([\\w$]+)\\(([\\w$]+|\\{(?:__name|name):"([\\w-]+)")`));
    if (!m) return null; if (m[3]) return m[3];
    v = m[2].replace(/\$/g, "\\$"); // a wrapper: follow the wrapped definition
  }
  return null;
}

// ---- vendor (non-component, non-API) chunks ------------------------------------------------------------------------
const SWIPER_MODULES = { navigation: "Navigation", pagination: "Pagination", autoplay: "Autoplay", "effect-coverflow": "EffectCoverflow", grid: "Grid", scrollbar: "Scrollbar" };
function vendorMapping(site, chunk, usedBy) {
  const c = chunkSource(site, chunk) ?? ""; const ex = exportsOf(site, chunk); delete ex.__tla; const base = chunkBase(chunk);
  const out = { chunk, exports: {} };
  const strOnly = Object.keys(ex).length && /^const [\w$]+=("[^"]*"|`[^`]*`)(,[\w$]+=("[^"]*"|`[^`]*`))*;export\{[^}]*\};?\s*$/.test(c.trim());
  if (strOnly) {
    out.kind = "asset";
    for (const [alias, local] of Object.entries(ex)) { const v = c.match(new RegExp(`[\\s,]${local.replace(/\$/g, "\\$")}=("[^"]*"|\`[^\`]*\`)`))?.[1]?.slice(1, -1) ?? ""; out.exports[alias] = { value: v.startsWith("data:") ? `data:${v.slice(5, 30)}…（内联 ${Math.round(v.length / 1024 * 10) / 10}KB）` : v, inline: v.startsWith("data:") }; }
    return out;
  }
  if (/^const \w+="FeatureCollection"/.test(c)) { out.kind = "json"; for (const alias of Object.keys(ex)) out.exports[alias] = { path: `@/assets/geo/${base}.json`, export: "default" }; return out; }
  const npm = (pkg, map) => { out.kind = "npm"; out.npm = pkg; for (const [alias, v] of Object.entries(map)) out.exports[alias] = typeof v === "string" ? { path: pkg, export: v } : { path: pkg, ...v }; };
  if (SWIPER_MODULES[base]) {
    const main = Object.keys(ex).length === 1 ? Object.keys(ex)[0] : Object.entries(ex).find(([, l]) => new RegExp(`[\\s,;{]${l.replace(/\$/g, "\\$")}=function\\(\\w+\\)\\{let\\{swiper`).test(c) || new RegExp(`function ${l.replace(/\$/g, "\\$")}\\(\\w+\\)\\{let\\{swiper`).test(c))?.[0];
    const map = {}; for (const alias of Object.keys(ex)) map[alias] = alias === main ? SWIPER_MODULES[base] : { export: null, internal: "swiper 模块之间共用的内部函数" };
    npm("swiper", map); return out;
  }
  if (base === "main" && /function m\(e,\w,h\)\{return\(\w=function/.test(c.slice(0, 80))) { npm("pinyin-match", Object.fromEntries(Object.keys(ex).map((a) => [a, "default"]))); return out; }
  if (base.startsWith("html2canvas")) { npm("html2canvas", Object.fromEntries(Object.keys(ex).map((a) => [a, "default"]))); return out; }
  if (base === "print" && /printJS/.test(c)) { npm("print-js", Object.fromEntries(Object.keys(ex).map((a) => [a, "default"]))); out.note = "依赖未在 hmrsfw-vue/package.json 里，版本由 E7 按指纹核对后加入"; return out; }
  if (/AMapUI/.test(c) && /load:function/.test(c)) { npm("@amap/amap-jsapi-loader", Object.fromEntries(Object.keys(ex).map((a) => [a, "default"]))); return out; }
  if (/zrender/.test(c) && /echarts/.test(c)) {
    // which export is which: by how the importing chunks use it
    const map = {};
    for (const [alias, local] of Object.entries(ex)) {
      const k = new RegExp(`[\\s,;]${local.replace(/\$/g, "\\$")}=([\\w$]+)`).exec(c)?.[1];
      const uses = [...usedBy.get(`${chunk}#${alias}`) ?? []].map((u) => { const b = bindingsFrom(site, u, chunk).find((x) => x.imported === alias); const s = chunkSource(site, u) ?? ""; return b ? (s.match(new RegExp(`[^\\w$.]${b.local.replace(/\$/g, "\\$")}(\\.\\w+|\\()`))?.[1] ?? "") : ""; });
      const asNs = uses.some((u) => /^\.(init|graphic|registerMap|getInstanceByDom)$/.test(u));
      const KNOWN = { i: "init", g: "getInstanceByDom", r: "registerMap", e: "graphic" };
      map[alias] = asNs ? { export: "*", namespace: "echarts" } : alias === "L" ? { export: "graphic", member: "LinearGradient" } : KNOWN[alias] ? KNOWN[alias] : { export: null, unresolved: k ?? local };
    }
    npm("echarts", map); return out;
  }
  if (base === "jspdf") {
    out.kind = "module"; out.path = `@/shared/jspdf.es.min.ts`;
    for (const [alias, local] of Object.entries(ex)) out.exports[alias] = /^E$/.test(alias) ? { path: "jspdf", export: "jsPDF", npm: true } : { path: out.path, export: "Watermark" };
    return out;
  }
  if (!Object.keys(ex).length) { out.kind = "side-effect"; out.note = /constructor===Object/.test(c.slice(0, 200)) ? "swiper 核心（ssr-window / dom7），由 npm swiper 提供" : "只有副作用导入"; return out; }
  out.kind = "module"; return out;
}

// ---- API modules: business name from the dominant controller of the urls ------------------------------------------
// the topic of one request function: its controller segment (xfJobFair → jobFair); for the controller-less licenseFree urls
// the main noun of the function name (freeCompanyExpandPositionList → company, getArticleList → article)
const SERVICE_SEGS = /^(xf-[\w-]+|job|communal|common|school|oddjob|college|extend|licenseFree|sys|jeecg-system|hardware|expired|bh)$/;
function apiTopic(url, name) {
  const segs = url.split("?")[0].split("/").filter(Boolean);
  const ctl = segs.slice(0, -1).reverse().find((s) => !SERVICE_SEGS.test(s));
  if (ctl) return camel(ctl.replace(/^xf(?=[A-Z])/i, ""));
  const core = name.replace(/^(free|get|query|find|check|list|update|add|save|delete|submit|hot|my|change|set|is|iz)+/i, "").replace(/(Page)?(List|Detail|ById|ByIds|Info|ForWebsite|ForMap|ForWebRedis|ForDistance|New|Json|ByJson|ByTags|ByCode|ByTypeId)+$/g, "");
  const word = (core.match(/^[A-Z]?[a-z]+/) ?? [name])[0];
  return word.charAt(0).toLowerCase() + word.slice(1);
}
function apiModuleName(fns, taken) {
  const count = {};
  for (const f of fns) { const k = apiTopic(f.url, f.name); count[k] = (count[k] ?? 0) + 1; }
  const ranked = Object.entries(count).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([k]) => k);
  for (const k of ranked) if (!taken.has(k)) return k;
  let i = 2; while (taken.has(`${ranked[0]}${i}`)) i++; return `${ranked[0]}${i}`;
}
function existingApiFile(APP, app, chunk) {
  const dir = path.join(APP, "apps", app, "src", "api"); if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith(".ts") && readFileSync(path.join(dir, f), "utf8").startsWith(`// 由 ${chunk} 还原`)).map((f) => {
    const code = readFileSync(path.join(dir, f), "utf8"); const names = {};
    for (const m of code.matchAll(/\/\*\* 原压缩名 ([\w$]+)(?:，导出名 ([\w$]+))? \*\/\nexport const ([\w$]+)/g)) names[m[2] ?? m[1]] = m[3];
    return { file: f, spec: `@/api/${f.replace(/\.ts$/, "")}`, names };
  });
}

const existingApiExports = (APP, app, file) => new Set([...readFileSync(path.join(APP, "apps", app, "src", "api", file), "utf8").matchAll(/export\s+const\s+([\w$]+)/g)].map((m) => m[1]));

// ---- entry exports ----------------------------------------------------------------------------------------------
// follow `X` → `X=...` in the entry source (up to 3 hops) to the first non-identifier definition
function resolveDef(src, def) { let d = def; for (let i = 0; i < 3 && /^[\w$]+$/.test(d ?? ""); i++) { const m = src.match(new RegExp(`[,;{\\s]${d.replace(/\$/g, "\\$")}=([^;]{0,600})`)); if (!m) break; d = m[1]; } return d; }
// url of an api export: literal, `CONST.key` (resolved from the entry), or a template literal (its static part)
function apiUrl(src, e) {
  if (e.url) return e.url;
  // `url:LN.logout` with LN an object literal or a TS enum `LN=(e=>(e.logout="/...",...))`
  const mem = e.def?.match(/url:([\w$]+)\.(\w+)/); if (mem) { const at = src.search(new RegExp(`[,;{\\s]${mem[1].replace(/\$/g, "\\$")}=`)); const body = at < 0 ? "" : src.slice(at, at + 6000); const v = body.match(new RegExp(`[{,([]\\s*(?:\\w+\\.)?${mem[2]}\\s*[:=]\\s*"([^"]+)"`))?.[1]; if (v) return v; }
  const tpl = e.def?.match(/`(\/[^`$]+)\$\{/)?.[1]; if (tpl) return tpl.replace(/\/$/, "");
  return null;
}
function iconName(src, def) {
  const icon = def?.match(/icon:([\w$]+)\}/)?.[1]; if (!icon) return null;
  let d = icon; for (let i = 0; i < 3; i++) { const m = src.match(new RegExp(`[,;{\\s]${d.replace(/\$/g, "\\$")}=([^;]{0,400})`)); if (!m) return null; const body = m[1]; const nm = body.match(/name:"([\w-]+)",theme:"(\w+)"/); if (nm) return pascal(nm[1]) + pascal(nm[2] === "twotone" ? "TwoTone" : nm[2]); const next = body.match(/^([\w$]+)[,;]/)?.[1]; if (!next) return null; d = next; }
  return null;
}

export function buildRegistry(site, { APP, gaps = scanSharedGaps(site), vueAliases = null, prev = null } = {}) {
  const app = APP_OF[site]; const cfg = SITES[site];
  const namesFile = JSON.parse(readFileSync(path.join(REGISTRY_DIR, `names.${app}.json`), "utf8"));
  const names = namesFile.entry; const chunkNames = namesFile.chunks ?? {};
  const idx = appExportIndex(APP, app);
  const scope = hamiScope(site); const sg = siteGraph(site);
  const entrySrc = chunkSource(site, cfg.entry);
  const warnings = [];

  // who imports what (chunk#alias → Set<importing chunk>) inside the Hami scope
  const usedBy = new Map();
  for (const f of scope.all) for (const m of (chunkSource(site, f) ?? "").matchAll(/import\{([^}]*)\}from"\.\/([^"]+)"/g)) for (const sp of m[1].split(",").map((x) => x.trim()).filter(Boolean)) { const imported = sp.split(/\s+as\s+/)[0].trim(); if (imported === "__tla") continue; const k = `${m[2]}#${imported}`; if (!usedBy.has(k)) usedBy.set(k, new Set()); usedBy.get(k).add(f); }

  // owners of entry exports: E-orders by area, component orders by group (keyed by the component's binding)
  const E = (n) => `entry.${app}.E${n}`;
  const compOrder = new Map(); gaps.entry.componentGroups.forEach((grp, i) => grp.forEach((c) => compOrder.set(c.binding, `entry.${app}.c${String(i + 1).padStart(2, "0")}`)));
  const ownerOf = (p, kind, name) => p === "@/router" ? E(3) : /store/i.test(p) || kind === "store" ? E(4) : /^@\/utils\/(request|crypto-adapter)/.test(p) || /^(request|http|API_BASE|STATIC_BASE)$/.test(name) ? E(5) : E(6);

  // vendor chunks first (an entry export used only by npm-mapped vendor chunks is library-internal)
  const vendor = {};
  for (const f of scope.vendor) vendor[f] = vendorMapping(site, f, usedBy);
  const npmChunks = new Set(Object.entries(vendor).filter(([, v]) => v.kind === "npm" || v.kind === "side-effect").map(([f]) => f));

  const entry = {}; const compNames = new Set();
  for (const e of gaps.entry.exportsUsed) {
    const n = names[e.alias]; let rec;
    const comp = e.kind === "component" ? gaps.entry.hamiComponents.find((x) => x.exportedAs.includes(e.alias)) : null;
    const url = e.kind === "api" ? apiUrl(entrySrc, e) : null;
    if (n?.ignore) rec = { status: "ignore", reason: n.ignore };
    else if (n?.npm) rec = { path: n.path, export: n.export, ...(n.local ? { local: n.local } : {}), npm: true, status: "npm" };
    else if (n) rec = { path: n.path, export: n.export, ...(url ? { url, method: e.method ?? "get" } : {}) };
    else if (e.users.every((u) => npmChunks.has(u))) rec = { status: "ignore", reason: "只被打包进来的 npm 库 chunk 使用（库内部函数）" };
    else if (url) rec = { path: "@/legacy/api", export: nameFromUrl(url), url, method: e.method ?? "get" };
    else if (comp) {
      let nm = pascal(comp.globalName ?? comp.name); for (let i = 2; compNames.has(nm); i++) nm = `${pascal(comp.globalName ?? comp.name)}${i}`; // tenant variants of one name: Foot, Foot2
      compNames.add(nm);
      rec = { path: `@/legacy/components/${nm}.vue`, export: "default" };
    } else {
      const d = resolveDef(entrySrc, e.def);
      // ant-design icons carry `X.displayName="SmileOutlined"`; otherwise resolve the svg definition's name/theme
      const disp = [e.def, e.local].filter((x) => /^[\w$]+$/.test(x ?? "")).map((x) => entrySrc.match(new RegExp(`[^\\w$.]${x.replace(/\$/g, "\\$")}\\.displayName="(\\w+)"`))?.[1]).find(Boolean);
      const ic = disp ?? (/icon:[\w$]+\}/.test(d ?? "") ? iconName(entrySrc, d) : null);
      if (ic) rec = { path: "@ant-design/icons-vue", export: ic, npm: true, status: "npm" };
      else { rec = { path: "@/legacy/utils", export: `entry_${e.alias}`, unnamed: true }; warnings.push(`entry ${e.alias}: 没有可读名（kind ${e.kind}），暂用 entry_${e.alias}`); }
    }
    if (comp) Object.assign(rec, { component: comp.name, scopeId: comp.scopeId ?? null });
    if (rec.path && !rec.npm) {
      rec.kind = comp ? "component" : e.kind;
      rec.owner = comp ? compOrder.get(comp.binding) ?? E(2) : ownerOf(rec.path, e.kind, rec.export);
    }
    rec.users = e.users.length;
    entry[e.alias] = rec;
  }

  // one function per url+method: the original defined some api functions twice (e / l, bk / bl); all aliases of a url
  // point at one export, preferring one that hmrsfw-vue already has
  const statusOf = (rec) => { const have = idx.get(rec.path); const via = have?.reexports?.get(rec.export); const target = via ? idx.get(via) : have; if (!have || !have.exports.has(rec.export)) return { status: "reserved" }; if (target?.stub) return { status: "reserved", stub: target.file }; return { status: "restored" }; };
  // a seed name that hmrsfw-vue keeps in another file of the same layer (e.g. "@/legacy" vs "@/legacy/api") lives there
  for (const rec of Object.values(entry)) if (rec.path && !rec.npm && !idx.get(rec.path)?.exports.has(rec.export)) {
    const layer = rec.path.split("/").slice(0, 2).join("/"); const hits = [...idx].filter(([spec, v]) => (spec === layer || spec.startsWith(layer + "/")) && v.exports.has(rec.export) && !spec.endsWith(".vue"));
    if (hits.length === 1) rec.path = hits[0][0];
  }
  for (const rec of Object.values(entry)) if (rec.path && !rec.npm) Object.assign(rec, statusOf(rec));
  const byUrl = new Map();
  for (const [a, rec] of Object.entries(entry)) if (rec.url && rec.path && !rec.npm) { const k = `${rec.method}|${rec.url}`; if (!byUrl.has(k)) byUrl.set(k, []); byUrl.get(k).push(a); }
  for (const aliases of byUrl.values()) {
    if (aliases.length < 2) continue;
    const canon = aliases.find((a) => entry[a].status === "restored") ?? aliases.find((a) => names[a]) ?? aliases[0];
    for (const a of aliases) if (a !== canon && !(names[a] && names[a].export !== entry[canon].export)) Object.assign(entry[a], { path: entry[canon].path, export: entry[canon].export, status: entry[canon].status, owner: entry[canon].owner, sameAs: canon });
  }
  // two different things must not share one name in one file: suffix with the url's parent segment
  const taken = new Map();
  for (const [a, rec] of Object.entries(entry)) {
    if (!rec.path || rec.npm || rec.sameAs) continue;
    const k = `${rec.path}|${rec.export}`; const owner = taken.get(k);
    if (owner && names[owner]?.export === rec.export && names[a]?.export === rec.export) { rec.sameAs = owner; continue; } // the names file maps both to one function on purpose
    if (owner) { const parent = rec.url ? camel(rec.url.split("/").filter(Boolean).slice(-2, -1)[0]?.replace(/^xf(?=[A-Z])/, "") ?? "") : ""; const nn = parent ? `${parent}${pascal(rec.export)}` : `${rec.export}${pascal(a)}`; warnings.push(`entry ${a}: ${rec.export} 已被 ${owner} 使用（${entry[owner]?.url ?? "-"} vs ${rec.url ?? "-"}），改名为 ${nn}`); rec.export = nn; Object.assign(rec, statusOf(rec)); }
    taken.set(`${rec.path}|${rec.export}`, a);
  }
  for (const rec of Object.values(entry)) if (rec.sameAs) { const c = entry[rec.sameAs]; Object.assign(rec, { path: c.path, export: c.export, status: c.status, owner: c.owner }); }


  // API-like chunks among the vendor ones (request functions only, or already restored as an API module)
  const apiLike = (f) => { const src = chunkSource(site, f) ?? ""; if (!/\.request\(\{url:/.test(src)) return false; if (existingApiFile(APP, app, f).length) return true; const n = Object.keys(exportsOf(site, f)).filter((x) => x !== "__tla").length; return parseApiChunk(src).fns.length >= n * 0.8; };
  for (const [f, v] of Object.entries(vendor)) if (v.kind === "module" && apiLike(f)) v.kind = "api";

  // shared chunks (components) and app-code modules from the vendor list
  const shared = {}; const sharedTaken = new Set();
  const exist = (spec) => idx.get(spec);
  // an existing shared file says which chunk it was restored from ("还原自 legacy-dist/.../<chunk>" / "Restored from <base>.<hash>.js")
  const seededFrom = seedIndex(idx, sg);
  const sharedChunks = [...scope.shared, ...Object.entries(vendor).filter(([, v]) => v.kind === "module").map(([f]) => f)];
  for (const f of sharedChunks) {
    const base = chunkBase(f); const ex = exportsOf(site, f); delete ex.__tla;
    const comps = componentsOf(site, f); const isComp = scope.shared.includes(f);
    const seeded = seededFrom.get(f)?.replace(/^@\/shared\//, "");
    let name = seeded ?? (base === "index" ? (comps.length ? pascal(comps.at(-1).name) : `index${f.match(/\.\d{13}(\d*)\.js$/)?.[1] ?? ""}`) : base);
    if (!seeded && (sharedTaken.has(name) || exist(`@/shared/${name}`) && seededFrom.has(f) === false && [...seededFrom.values()].includes(`@/shared/${name}`))) name = `${name}${f.match(/\.\d{13}(\d*)\.js$/)?.[1] || "2"}`;
    sharedTaken.add(name);
    const vueSpec = `@/shared/${name}.vue`, tsSpec = `@/shared/${name}`;
    const syms = Object.keys(ex).length > 1 ? symbolsOf(path.join(ROOT, SITES[site].dir, "assets", f)) : {};
    const rec = { kind: isComp ? "component" : "module", components: comps.map((c) => c.name), kb: kbOf(site, f), exports: {} };
    const aliases = Object.keys(ex);
    const lib = SHARED_NPM[base];
    if (lib) { // the npm package replaces the chunk; nothing to restore
      Object.assign(rec, { kind: "npm", npm: lib.npm, note: lib.note, status: "npm", owner: null, exports: Object.fromEntries(aliases.map((a) => [a, { path: lib.npm, export: lib.export, npm: true }])), usedBy: [...new Set(aliases.flatMap((a) => [...usedBy.get(`${f}#${a}`) ?? []]))].length });
      shared[f] = rec; continue;
    }
    const vm = vendor[f];
    if (vm?.path) rec.path = vm.path;
    if (isComp && aliases.length <= 1 && (exist(vueSpec) || !exist(tsSpec))) { rec.path = `${vueSpec}`; for (const a of aliases) rec.exports[a] = { export: "default" }; }
    else {
      rec.path ??= `${tsSpec}.ts`;
      const have = exist(tsSpec);
      const header = have ? readFileSync(path.join(APP, have.file), "utf8").split("\n").slice(0, 12).join("\n") : "";
      for (const a of aliases) {
        if (vm?.exports?.[a]?.npm) { rec.exports[a] = vm.exports[a]; continue; }
        const fromHeader = have?.aliasOf.get(a) ?? header.match(new RegExp("`?\\b" + a.replace(/\$/g, "\\$") + "`?\\s*(?:（[^）]*）)?\\s*→\\s*(?:default export\\s*`?|default\\s*/\\s*)?`?([\\w$]+)"))?.[1];
        // reserved: a component export is named after the component, anything else keeps the original export name
        const compName = syms[a]?.componentName ?? (syms[a]?.def?.match(/__name:"([\w-]+)"/)?.[1]) ?? componentOfExport(site, f, ex[a]);
        const exported = fromHeader && have.exports.has(fromHeader) ? fromHeader : have?.exports.has(a) ? a : aliases.length === 1 && isComp ? "default" : compName ? pascal(compName) : a;
        // reserved component export of a multi-export chunk: its own .vue under shared/<name>/ (one file per component)
        rec.exports[a] = !have && compName && aliases.length > 1 ? { path: `@/shared/${name}/${pascal(compName)}.vue`, export: "default" } : { export: exported };
      }
      if (vm?.exports && vm.kind === "module" && rec.path.startsWith("@/shared/jspdf")) for (const [a, v] of Object.entries(vm.exports)) rec.exports[a] = v.npm ? v : { export: v.export };
      // a multi-export chunk whose component hmrsfw-vue already has as a .vue (and no .ts barrel): the component stays there
      if (isComp && !exist(tsSpec) && exist(vueSpec)) {
        const compAlias = aliases.find((a) => syms[a]?.componentName || /__name:"|\[\["__scopeId"|\[\["render"/.test(syms[a]?.def ?? ""));
        if (compAlias) rec.exports[compAlias] = { path: vueSpec, export: "default" };
      }
    }
    // names file: per-chunk overrides (where the POC put an export, e.g. wxyy.hook `g` → @/legacy askWenXin)
    for (const [a, o] of Object.entries(chunkNames[f] ?? {})) if (rec.exports[a]) rec.exports[a] = { path: o.path, export: o.export };
    const statusOfExport = (x) => { if (x.npm) return true; const h = exist((x.path ?? rec.path).replace(/\.ts$/, "")); return !!h && !h.stub && (x.export === "default" || h.exports.has(x.export)); };
    rec.status = Object.values(rec.exports).every(statusOfExport) ? "restored" : "reserved";
    rec.owner = isComp ? `shared.${app}.${name}` : `shared.${app}.modules`;
    rec.usedBy = [...new Set(aliases.flatMap((a) => [...usedBy.get(`${f}#${a}`) ?? []]))].length;
    shared[f] = rec;
  }

  // API modules (index.api.* and request-only chunks among the vendor ones)
  const api = {}; const apiModules = {}; const moduleTaken = new Set();
  const apiChunks = [...scope.api, ...Object.entries(vendor).filter(([, v]) => v.kind === "api").map(([f]) => f)];
  for (const f of apiChunks.sort()) {
    const { fns, copies } = parseApiChunk(chunkSource(site, f) ?? "");
    const existing = existingApiFile(APP, app, f);
    const mod = apiModuleName(fns, moduleTaken); moduleTaken.add(mod);
    const keep = existing[0];
    const target = `@/api/${mod}`;
    apiModules[f] = { path: keep ? keep.spec : target, ...(keep && keep.spec !== target ? { renameTo: target } : {}), status: keep ? "restored" : "reserved", owner: keep ? null : "script:restore-api", functions: fns.length, ...(existing.length > 1 ? { duplicates: existing.slice(1).map((x) => x.spec) } : {}) };
    const usedNames = new Set(Object.values(keep?.names ?? {}));
    for (const fn of fns) {
      const alias = fn.exported ?? fn.local; if (!usedBy.has(`${f}#${alias}`)) continue;
      let nm = keep?.names[alias];
      if (!nm) { nm = fn.name; for (let i = 2; usedNames.has(nm); i++) nm = `${fn.name}${i}`; usedNames.add(nm); }
      api[`${f}#${alias}`] = { path: apiModules[f].path, export: nm, url: fn.url, method: fn.method, status: keep && keep.names[alias] ? "restored" : "reserved" };
    }
    // exports of an API chunk that are not request functions (constants, merged objects): keep the original export name
    const ex = exportsOf(site, f); delete ex.__tla;
    // a copy of the module namespace ({...ns}) is written by restore-api.mjs like the functions
    for (const alias of Object.keys(ex)) if (usedBy.has(`${f}#${alias}`) && !api[`${f}#${alias}`]) {
      const copy = copies.find((c) => c.exported === alias);
      api[`${f}#${alias}`] = { path: apiModules[f].path, export: alias, status: keep && existingApiExports(APP, app, keep.file).has(alias) ? "restored" : "reserved", ...(copy ? { owner: "script:restore-api", note: `本模块 ${copy.members.length} 个接口函数的命名空间对象的浅拷贝（键名 ${copy.members.map((m) => m.key).join("、")}），restore-api.mjs 生成` } : { note: "不是接口函数（常量或对象），按原导出名导出" }) };
    }
  }

  // npm chunks and image constants become direct mappings
  const modules = {};
  for (const [f, v] of Object.entries(vendor)) {
    if (v.kind === "module" || v.kind === "api") continue;
    // image constants: the hmrsfw-vue file restored from this chunk if there is one, otherwise @/shared/images
    const seed = v.kind === "asset" ? (seededFrom.get(f) ?? (exist(`@/shared/${chunkBase(f)}`) ? `@/shared/${chunkBase(f)}` : null)) : null;
    const assetExport = (a, x) => { const o = chunkNames[f]?.[a]; if (o) return { ...x, path: o.path, export: o.export, status: exist(o.path)?.exports.has(o.export) ? "restored" : "reserved", owner: `shared.${app}.modules` }; if (seed && exist(seed)?.exports.has(a)) return { ...x, path: seed, export: exist(seed).aliasOf.get(a) ?? a, status: "restored" }; return { ...x, path: "@/shared/images", export: Object.keys(v.exports).length === 1 ? `${camel(chunkBase(f))}Img` : camel(`${chunkBase(f)}-img-${a}`), status: "reserved", owner: `shared.${app}.modules` }; };
    modules[f] = { kind: v.kind, ...(v.npm ? { npm: v.npm } : {}), ...(v.note ? { note: v.note } : {}), exports: v.kind === "asset" ? Object.fromEntries(Object.entries(v.exports).map(([a, x]) => [a, assetExport(a, x)])) : v.exports };
  }

  // globals
  const g0 = gaps.globals;
  const globals = {
    components: [...new Set([...g0.components, "router-link", "router-view", "RouterLink", "RouterView"])].sort(),
    componentPatterns: ["^a-", "^A[A-Z]", "(Outlined|Filled|TwoTone)$", "-(outlined|filled|two-tone)$", ...(g0.components.some((c) => c.startsWith("bm-")) ? ["^bm-", "^baidu-map$"] : [])],
    directives: g0.directives, provide: g0.provide,
    notes: ["ant-design-vue 由 app.use 全量注册（a-* 组件）", "@ant-design/icons-vue 图标全量注册", ...(g0.components.includes("Swiper") ? ["swiper/vue 的 Swiper、SwiperSlide 由入口全局注册"] : []), ...(g0.components.some((c) => c.startsWith("bm-")) ? ["vue-baidu-map-3x（baidu-map、bm-*）由入口在取到 ak 后注册"] : [])],
  };

  // npm packages a page may import: hmrsfw-vue dependencies + the ones mapped above
  const pkg = JSON.parse(readFileSync(path.join(APP, "package.json"), "utf8"));
  const npm = { ...pkg.dependencies };
  for (const v of [...Object.values(modules), ...Object.values(shared)]) if (v.npm && !npm[v.npm]) npm[v.npm] = "待 E7 按指纹核对";
  const npmSubpaths = ["swiper/vue", "swiper/css", "ant-design-vue/es", "dayjs/locale", "echarts/core"];

  // src/utils is part of the public library (§13): its current exports may be imported as they are (request, cachedRequest …)
  const utils = Object.fromEntries([...idx].filter(([spec]) => spec.startsWith("@/utils/")).map(([spec, v]) => [spec, [...v.exports].filter((n) => n !== "default").sort()]));
  const vue = vueAliases ?? prev?.vue ?? {};
  const rank = (s) => ({ restored: 0, reserved: 1, npm: 2, ignore: 3 }[s] ?? 4);
  const stats = { entry: {}, shared: {}, api: {} };
  for (const v of Object.values(entry)) stats.entry[v.status] = (stats.entry[v.status] ?? 0) + 1;
  for (const v of Object.values(shared)) stats.shared[v.status] = (stats.shared[v.status] ?? 0) + 1;
  for (const v of Object.values(api)) stats.api[v.status] = (stats.api[v.status] ?? 0) + 1;
  return {
    registry: {
      $doc: "docs/work-orders.md#公共库清单", app, site, vueVersion: cfg.vueVersion, antdVersion: cfg.antdVersion, appCode: gaps.appCode,
      sources: { entryChunk: cfg.entry, vueChunk: cfg.vue, names: `registry/names.${app}.json` },
      stats,
      vue, entry: Object.fromEntries(Object.entries(entry).sort(([a, x], [b, y]) => rank(x.status) - rank(y.status) || a.localeCompare(b))),
      shared, api, apiModules, modules, utils, globals, npm, npmSubpaths,
    },
    warnings,
  };
}

export const loadRegistry = (app) => JSON.parse(readFileSync(path.join(REGISTRY_DIR, `${app}.json`), "utf8"));

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const APP = appDir(); const check = process.argv.includes("--check"); let diff = 0;
  for (const site of Object.keys(SITES)) {
    const app = APP_OF[site]; const file = path.join(REGISTRY_DIR, `${app}.json`);
    const prev = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : null;
    const vf = path.join(ROOT, "out", `vue-exports.${site}.final.json`);
    const vueAliases = existsSync(vf) ? JSON.parse(readFileSync(vf, "utf8")).aliases : null;
    const { registry, warnings } = buildRegistry(site, { APP, vueAliases, prev });
    const text = JSON.stringify(registry, null, 1) + "\n";
    if (check) { const same = prev && JSON.stringify(prev) === JSON.stringify(registry); if (!same) diff++; console.log(`${app}: ${same ? "same" : "DIFFERENT"}`); }
    else { writeFileSync(file, text); console.log(`${app}: ${file} entry ${JSON.stringify(registry.stats.entry)} shared ${JSON.stringify(registry.stats.shared)} api ${JSON.stringify(registry.stats.api)}`); }
    for (const w of warnings) console.log(`  warn ${w}`);
  }
  process.exitCode = diff ? 1 : 0;
}
