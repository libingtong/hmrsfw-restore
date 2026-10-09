// Module graph of the two legacy builds and the Hami scope (docs/pipeline.md §1 范围, batch-plan.md §7–§8).
// Shared by work-orders.mjs, scan-shared-gaps.mjs and registry.mjs, so every tool sees the same classification.
//
// Classification of every JS file in legacy-dist/<site>/assets (reconciled with the POC counts, batch-plan.md §8):
//   entry   the app entry chunk (exact file name; other index.<hash><n>.js files are shared component chunks)
//   vue     the Vue runtime chunk
//   view    a page: a portal import.meta.glob target / a user-center route target
//   api     index.api.* chunks (restored by script)
//   shared  a shared component chunk: defines a component (__name / defineComponent / render) and is not a view
//   vendor  a third-party library or constant chunk (swiper parts, echarts, html2canvas, jspdf, images, geojson ...)
// Hami scope: portal = components of router-xjhm.json routes + the views they import statically (closure that does not
// pass through the entry); user center = every route. Shared/vendor/api in scope = reached from those views.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const SITES = {
  portal: { app: "portal", dir: "legacy-dist/portal", entry: "index.1783320636200.js", vue: "vue.1783320636200.js", vueVersion: "3.2.47", antdVersion: "3.2.15", host: "hamiwebportaltest.rencaidanao.com" },
  usercenter: { app: "uc", dir: "legacy-dist/usercenter", entry: "index.1751615607545.js", vue: "vue.1751615607545.js", vueVersion: "3.3.4", antdVersion: "3.2.20", host: "hamiusercentertest.rencaidanao.com" },
};
export const APP_OF = { portal: "portal", usercenter: "uc" };
export const SITE_OF = { portal: "portal", uc: "usercenter" };
export const HAMI_APPCODE = "018";

// Files that look like components (they contain render helpers) but are bundled libraries. Fingerprints, not names:
// each rule is checked against the file content (see scope-vendor in scan-shared-gaps.mjs for the evidence printout).
export const VENDOR_FINGERPRINTS = [
  { lib: "echarts", version: "5.5.0", test: (c) => /Copyright \(c\) Microsoft Corporation/.test(c.slice(0, 600)) && /zrender/.test(c) && /echarts/.test(c) },
  { lib: "html2canvas", version: "1.4.1", test: (c) => /^\/\*!\s*\*\s*html2canvas \d/.test(c.slice(0, 200)) },
  // jspdf.es.min also carries the app's own watermark class (global doc §6 骨架与依赖 1); that class goes to the entry order
  { lib: "jspdf", version: "2.5.1", test: (c) => /jsPDF/.test(c) && /addImage/.test(c) && c.length > 300e3 && !/__name:"/.test(c) },
];

const memo = new Map();
const read = (site, file) => {
  const k = site + "/" + file;
  if (!memo.has(k)) { const p = path.join(ROOT, SITES[site].dir, "assets", file); memo.set(k, existsSync(p) ? readFileSync(p, "utf8") : null); }
  return memo.get(k);
};
export const chunkSource = read;
export const chunkPath = (site, file) => `${SITES[site].dir}/assets/${file}`;
export const kbOf = (site, file) => { const p = path.join(ROOT, SITES[site].dir, "assets", file); return existsSync(p) ? +(statSync(p).size / 1024).toFixed(1) : null; };

// Static imports (`import{..}from"./x.js"`, `import"./x.js"`) and dynamic imports (`import("./x.js")`).
export function importsOf(site, file) {
  const c = read(site, file) ?? "";
  const stat = [...new Set([...c.matchAll(/(?:from|import)\s*"\.\/([^"]+\.js)"/g)].map((m) => m[1]))];
  const dyn = [...new Set([...c.matchAll(/import\(\s*"\.\/([^"]+\.js)"\s*\)/g)].map((m) => m[1]))];
  return { static: stat, dynamic: dyn };
}

// Named bindings a chunk imports from another chunk: [{imported, local}]
export function bindingsFrom(site, file, from) {
  const c = read(site, file) ?? ""; const out = [];
  for (const m of c.matchAll(/import\{([^}]*)\}from"\.\/([^"]+)"/g)) {
    if (m[2] !== from) continue;
    for (const sp of m[1].split(",").map((x) => x.trim()).filter(Boolean)) {
      const [imported, local = imported] = sp.split(/\s+as\s+/).map((x) => x.trim());
      if (imported === "__tla") continue;
      out.push({ imported, local });
    }
  }
  return out;
}

export function exportsOf(site, file) {
  const c = read(site, file) ?? ""; const m = {};
  for (const e of c.matchAll(/export\{([^}]+)\}/g)) for (const part of e[1].split(",")) { const [l, n] = part.trim().split(/\s+as\s+/); if (l) m[(n ?? l).trim()] = l.trim(); }
  return m;
}

// Portal pages: import.meta.glob key -> chunk. User center: route records -> chunk.
export function viewIndex(site) {
  const cfg = SITES[site]; const entry = read(site, cfg.entry);
  const views = new Map(); // chunk -> { keys:[], routes:[] }
  const add = (chunk, rec) => { if (!views.has(chunk)) views.set(chunk, { keys: [], routes: [] }); const v = views.get(chunk); if (rec.key && !v.keys.includes(rec.key)) v.keys.push(rec.key); if (rec.route) v.routes.push(rec.route); };
  if (site === "portal") {
    for (const m of entry.matchAll(/"\/?(src\/views\/[^"]+\.vue)":\(\)=>\w+\(\(\)=>import\("\.\/([^"]+)"\)/g)) add(m[2], { key: m[1] });
  } else {
    for (const m of entry.matchAll(/path:"([^"]+)",name:"([^"]*)",meta:(\{[^}]*\}),component:\(\)=>\w+\(\(\)=>import\("\.\/([^"]+)"\)/g)) {
      let meta = {}; try { meta = Function(`return (${m[3]})`)(); } catch { meta = { raw: m[3] }; }
      add(m[4], { route: { path: m[1], name: m[2], meta } });
    }
    for (const m of entry.matchAll(/import\("\.\/([^"]+\.js)"\)/g)) add(m[1], {});
  }
  return views;
}

export function hamiPortalRoutes() {
  const data = JSON.parse(readFileSync(path.join(ROOT, "legacy-dist/portal/router/router-xjhm.json"), "utf8")).data;
  const flat = []; const walk = (rs, parent = "") => rs.forEach((r) => { flat.push({ ...r, fullPath: r.path.startsWith("/") ? r.path : `${parent}/${r.path}` }); walk(r.children ?? [], r.path); });
  walk(data); return flat;
}

function classify(site, file, views) {
  const cfg = SITES[site];
  if (file === cfg.entry) return "entry";
  if (file === cfg.vue) return "vue";
  if (views.has(file)) return "view";
  if (file.startsWith("index.api.")) return "api";
  const c = read(site, file) ?? "";
  if (VENDOR_FINGERPRINTS.some((v) => v.test(c))) return "vendor";
  const defines = /__name:"|defineComponent\(|\.render=|render:function|setup\(/.test(c);
  const renders = /createElementVNode|createVNode|openBlock|h\(|\b[A-Za-z_$]\(\)\s*,\s*[A-Za-z_$]\(/.test(c);
  return defines && renders ? "shared" : "vendor";
}

export function vendorLibOf(site, file) {
  const c = read(site, file) ?? ""; return VENDOR_FINGERPRINTS.find((v) => v.test(c)) ?? null;
}

const graphs = new Map();
export function siteGraph(site) {
  if (graphs.has(site)) return graphs.get(site);
  const cfg = SITES[site];
  const files = readdirSync(path.join(ROOT, cfg.dir, "assets")).filter((f) => f.endsWith(".js"));
  const views = viewIndex(site);
  const kind = new Map(files.map((f) => [f, classify(site, f, views)]));
  for (const v of views.keys()) if (!kind.has(v)) kind.set(v, "view-missing"); // glob key whose chunk is not on the server (404)
  const g = { site, cfg, files, views, kind };
  graphs.set(site, g); return g;
}

// Hami scope: root views, then the static closure (not through entry / vue).
export function hamiScope(site) {
  const g = siteGraph(site);
  const roots = [], blocked = [];
  if (site === "portal") {
    const glob = new Map(); for (const [chunk, v] of g.views) for (const k of v.keys) glob.set(k, chunk);
    const byChunk = new Map();
    for (const r of hamiPortalRoutes()) {
      if (!r.component) continue;
      const key = r.component.replace(/^\//, "") + ".vue"; const chunk = glob.get(key);
      if (!chunk || g.kind.get(chunk) === "view-missing") { blocked.push({ route: r.fullPath, component: r.component, reason: "原包里不存在该页面（入口 glob 中没有对应 chunk）" }); continue; }
      if (!byChunk.has(chunk)) byChunk.set(chunk, { chunk, key, routes: [] });
      byChunk.get(chunk).routes.push({ path: r.fullPath, name: r.name, meta: r.meta });
    }
    roots.push(...byChunk.values());
  } else {
    for (const [chunk, v] of g.views) if (g.kind.get(chunk) === "view") roots.push({ chunk, key: null, routes: v.routes.map((r) => ({ path: r.path, name: r.name, meta: r.meta })) });
  }
  const seen = new Set(roots.map((r) => r.chunk)); const q = [...seen]; const importedBy = new Map();
  while (q.length) {
    const f = q.shift();
    for (const d of importsOf(site, f).static) {
      if (d === g.cfg.entry || d === g.cfg.vue) continue;
      if (!importedBy.has(d)) importedBy.set(d, new Set()); importedBy.get(d).add(f);
      if (!seen.has(d)) { seen.add(d); q.push(d); }
    }
  }
  const rootSet = new Set(roots.map((r) => r.chunk));
  const by = (k) => [...seen].filter((f) => g.kind.get(f) === k).sort();
  return {
    site, roots, blocked,
    extraViews: by("view").filter((f) => !rootSet.has(f)),
    shared: by("shared"), api: by("api"), vendor: by("vendor"),
    importedBy, all: seen,
  };
}

// Component definitions inside a chunk: {name, scopeId, start, end?} in source order.
// A component is a `<alias>({__name:"x", …setup…})` / `X={__name:"x", …}` object, or a `{name:"x", …setup/render…}` one.
export function componentsOf(site, file) {
  const c = read(site, file) ?? ""; const out = [];
  const objectEnd = (start) => { let depth = 0; for (let i = start; i < c.length && i < start + 400000; i++) { const ch = c[i]; if (ch === "{") depth++; else if (ch === "}") { depth--; if (depth === 0) return i; } else if (ch === '"' || ch === "'" || ch === "`") { const q = ch; for (i++; i < c.length && c[i] !== q; i++) if (c[i] === "\\") i++; } } return Math.min(c.length, start + 400000); };
  // `re({__name:"x",…})` (defineComponent) or a plain `X={__name:"x",…}` (script setup without defineComponent)
  for (const m of c.matchAll(/[\w$][(=]\{(__name|name):"([^"]+)"/g)) {
    const at = m.index + 2; const body = c.slice(at, objectEnd(at + 0));
    if (m[1] === "name" && !/[,{](setup|render)\s*[(:]/.test(body)) continue; // a plain {name:"…"} object (route, push) is not a component
    out.push({ name: m[2], at });
  }
  const scopes = [...c.matchAll(/"(data-v-[0-9a-f]{8})"/g)].map((m) => ({ id: m[1], at: m.index }));
  // a component's scopeId comes from its _export_sfc wrapper `w(X,[["__scopeId","data-v-x"]])`, X being the variable the
  // definition is assigned to; without a recognisable variable, the first scopeId after the definition
  for (const comp of out) {
    const v = c.slice(Math.max(0, comp.at - 60), comp.at).match(/([\w$]+)=(?:[\w$]+\()?$/)?.[1];
    const w = v ? c.match(new RegExp(`\\(${v.replace(/\$/g, "\\$")},\\[\\["__scopeId","(data-v-[0-9a-f]{8})"`)) : null;
    comp.scopeId = w ? w[1] : v && new RegExp(`\\(${v.replace(/\$/g, "\\$")},\\[\\["`).test(c) ? null : scopes.find((s) => s.at > comp.at)?.id ?? null;
  }
  // de-duplicate scopeIds claimed twice (a later component without its own scope)
  const used = new Set(); for (const comp of out) { if (comp.scopeId && used.has(comp.scopeId)) comp.scopeId = null; else if (comp.scopeId) used.add(comp.scopeId); }
  return out;
}

// CSS files the entry lists for a chunk (portal glob deps / user-center route deps) + a same-name .css next to it.
export function cssOf(site, file) {
  const g = siteGraph(site); const entry = read(site, g.cfg.entry); const out = new Set();
  const i = entry.indexOf(`import("./${file}")`);
  if (i >= 0) { const tail = entry.slice(i, i + 4000); const m = tail.match(/\[((?:"assets\/[^"]+",?)+)\]/); if (m) for (const x of m[1].matchAll(/"assets\/([^"]+\.css)"/g)) out.add(x[1]); }
  const same = file.replace(/\.js$/, ".css"); if (existsSync(path.join(ROOT, g.cfg.dir, "assets", same))) out.add(same);
  // the entry lists the CSS of the whole dependency tree; a CSS named like one of the chunk's imports belongs to that chunk
  const imported = new Set(importsOf(site, file).static.map((f) => f.replace(/\.js$/, ".css")));
  return [...out].filter((f) => f === same || !imported.has(f)).map((f) => chunkPath(site, f));
}
