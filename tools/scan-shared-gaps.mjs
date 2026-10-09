// Shared-layer inventory of the Hami build (batch-plan.md §3.2 item 4, global doc §九 5): which parts of the entry chunk,
// which global components / directives / provide keys and which entry exports the Hami scope needs. Its result fixes the
// number of entry work orders (only the appCode 018 variants), and it lists the oversized chunks with the evidence for
// "bundled library or not".
// Usage: node tools/scan-shared-gaps.mjs [--json]   → prints a summary (or the full JSON); work-orders.mjs imports scanSharedGaps()
import { pathToFileURL } from "node:url";
import { SITES, APP_OF, HAMI_APPCODE, hamiScope, siteGraph, bindingsFrom, chunkSource, kbOf, exportsOf, componentsOf, vendorLibOf } from "./scope.mjs";
import { entryGraph, reach } from "./entry-graph.mjs";

const ENTRY_GROUP_MAX = 3, ENTRY_GROUP_KB = 30; // entry component orders: ≤ 3 definitions and ≤ 30KB each

// What an entry export is, judged from its definition (used for naming and for picking the owning entry order).
export function exportKind(def) {
  if (!def) return "unknown";
  if (/^"data:image\//.test(def)) return "image";
  if (/^"[^"]*"$/.test(def) || /^`[^`]*`$/.test(def) || /^-?\d/.test(def) || /^!?[01]$/.test(def)) return "const";
  if (/\.request\(\{url:|^\w+=>\w+\("\/[^"]+",/.test(def) || /^\(?\w*(,\w+)?\)?=>\w+\.request\(/.test(def)) return "api";
  if (/__name:"|\[\["__scopeId"|\[\["render"/.test(def)) return "component";
  if (/^\w+\(\{state:|^\w+\("[\w-]+",\{state:|defineStore|^E4e\(|createStore/.test(def)) return "store";
  if (/^function|=>|^\(\)/.test(def)) return "function";
  if (/^\{|^Object\.freeze|^\[/.test(def)) return "object";
  return "binding";
}

function entryComponentDefs(g, reachable) {
  // components are the units holding `__name:"x"` objects, or the first argument of an _export_sfc(X,[["__scopeId"|"render",..]]) call
  const out = new Map();
  for (const m of g.src.matchAll(/__name:"([^"]+)"/g)) { const u = g.unitAt(m.index); if (u) out.set(u.key, { name: m[1], unit: u }); }
  for (const m of g.src.matchAll(/\b([\w$]+)\(([\w$]+),\[\["(?:__scopeId|render)"/g)) {
    const inner = [...g.units.values()].find((u) => u.name === m[2]); if (!inner || out.has(inner.key)) continue;
    const def = g.src.slice(inner.start, Math.min(inner.end, inner.start + 4000)); const name = def.match(/\bname:"([\w-]+)"/)?.[1] ?? m[2];
    out.set(inner.key, { name, unit: inner, optionsApi: true });
  }
  const list = [];
  for (const [key, c] of out) {
    const wrappers = [...g.units.values()].filter((u) => u.refs.has(key) && /^\w+\(\w+,\[\["(__scopeId|render)"/.test(g.src.slice(u.paths[0]?.[0] ?? u.start, (u.paths[0]?.[0] ?? u.start) + 80)));
    const scopeId = wrappers.map((w) => g.src.slice(w.start, w.end).match(/"(data-v-[0-9a-f]{8})"/)?.[1]).find(Boolean) ?? null;
    const size = c.unit.paths.reduce((a, [s, e]) => a + (e - s), 0);
    const def = g.src.slice(c.unit.start, Math.min(c.unit.end, c.unit.start + 3000));
    // vue-baidu-map-3x is bundled into the entry (installed with app.use); its components are the npm package, not app code
    const library = /^(bm-|baidu-map$)/.test(c.name) || /mixins:\[\w+\("abstract"\)\]|components:\{Bm\w+:/.test(def) ? "vue-baidu-map-3x" : null;
    list.push({ name: c.name, binding: c.unit.name, scopeId, library, kb: +(size / 1024).toFixed(1), at: c.unit.paths[0]?.[0] ?? c.unit.start, reachable: reachable.has(key) || wrappers.some((w) => reachable.has(w.key)), wrapperKeys: wrappers.map((w) => w.key), key, optionsApi: !!c.optionsApi });
  }
  return list.sort((a, b) => a.at - b.at);
}

export function scanSharedGaps(site) {
  const cfg = SITES[site]; const app = APP_OF[site];
  const scope = hamiScope(site); const sg = siteGraph(site);
  let keepViews = null;
  if (site === "portal") { keepViews = new Set(); const inScope = new Set([...scope.roots.map((r) => r.chunk), ...scope.extraViews]); for (const [chunk, v] of sg.views) if (inScope.has(chunk)) v.keys.forEach((k) => keepViews.add(k)); }
  const g = entryGraph(site, { keepViews });

  // entry exports the Hami chunks import
  const used = new Map();
  for (const f of scope.all) for (const b of bindingsFrom(site, f, cfg.entry)) { if (!used.has(b.imported)) used.set(b.imported, new Set()); used.get(b.imported).add(f); }
  const sideRoots = [...g.units.values()].filter((u) => u.root).map((u) => u.key);
  const exportRoots = [...used.keys()].map((e) => g.exports[e]).filter(Boolean);
  const reachable = reach(g, [...sideRoots, ...exportRoots]);

  const defOf = (key) => { const u = g.units.get(key); if (!u) return null; const [s, e] = u.paths.at(-1) ?? [u.start, u.end]; return g.src.slice(s, Math.min(e, s + 600)); };
  const exportsUsed = [...used.keys()].sort().map((alias) => {
    const key = g.exports[alias]; const def = key ? defOf(key) : null;
    return { alias, users: [...used.get(alias)].sort(), kind: exportKind(def), def: def?.slice(0, 300) ?? null, url: def?.match(/url:"([^"]+)"/)?.[1] ?? def?.match(/^\w+=>\w+\("(\/[^"]+)"/)?.[1] ?? null, method: def?.match(/method:"(\w+)"/)?.[1] ?? (def?.match(/^\w+=>\w+\("\/[^"]+",\w+,"(\w+)"\)/)?.[1] ?? null), local: key ? g.units.get(key)?.name : null };
  });

  const comps = entryComponentDefs(g, reachable);
  const compByKey = new Map(comps.map((c) => [c.key, c]));
  // exported components: an export whose unit is a component or its _export_sfc wrapper
  for (const e of exportsUsed) { const key = g.exports[e.alias]; const c = compByKey.get(key) ?? comps.find((x) => x.wrapperKeys.includes(key)); if (c) { e.kind = "component"; e.component = c.name; (c.exportedAs ??= []).push(e.alias); } }

  // global registrations in reachable code
  const inReach = (pos) => { const u = g.unitAt(pos); return u && (u.root || reachable.has(u.key)); };
  const globalsComponents = new Set(), directives = new Set(), provides = new Set(), plugins = [];
  for (const m of g.src.matchAll(/\.component\("([^"]+)",([\w$]+)\)/g)) if (inReach(m.index)) {
    globalsComponents.add(m[1]);
    const key = [...g.units.values()].find((u) => u.name === m[2])?.key; const c = compByKey.get(key) ?? comps.find((x) => x.wrapperKeys.includes(key));
    if (c) c.globalName = m[1];
  }
  for (const m of g.src.matchAll(/\.directive\("([^"]+)",/g)) if (inReach(m.index)) directives.add(m[1]);
  for (const m of g.src.matchAll(/\.provide\("([^"]+)"|\bprovide\("([^"]+)"/g)) if (inReach(m.index)) provides.add(m[1] ?? m[2]);
  // `Object.keys(X).forEach(t=>{app.directive(t,X[t])})` → every key of the module namespace X is a directive
  for (const m of g.src.matchAll(/Object\.keys\((\w+)\)\.forEach\(\(?(\w+)\)?=>\{\w+\.directive\(\2,\1\[\2\]\)/g)) if (inReach(m.index)) {
    const u = [...g.units.values()].find((x) => x.name === m[1]); const def = u ? defOf(u.key) : "";
    for (const k of (def.match(/__proto__:null,([^}]*)\}/)?.[1] ?? "").split(",")) { const name = k.split(":")[0].trim(); if (name) directives.add(name); }
  }
  // `for (const k in X) app.component(k, X[k])` → X is a component namespace (the icon set)
  for (const m of g.src.matchAll(/for\(const (\w+) in (\w+)\)\w+\.component\(\1,\2\[\1\]\)/g)) if (inReach(m.index)) {
    const u = [...g.units.values()].find((x) => x.name === m[2]); let target = u ? defOf(u.key) : "";
    if (/^\w+$/.test(target ?? "")) { const u2 = [...g.units.values()].find((x) => x.name === target); target = u2 ? defOf(u2.key) : target; }
    const names = [...(target ?? "").matchAll(/([A-Z]\w+(?:Outlined|Filled|TwoTone)):/g)].map((x) => x[1]);
    plugins.push({ kind: "component-namespace", binding: m[2], sample: names.slice(0, 5), count: names.length, lib: names.length ? "@ant-design/icons-vue" : "?" });
  }
  // app.use(plugin) calls in reachable roots
  for (const m of g.src.matchAll(/\b(\w+)\.use\((\w+)\)/g)) if (inReach(m.index)) plugins.push({ kind: "use", app: m[1], plugin: m[2] });

  // provide keys that Hami chunks read back (inject("$getUser") through the Vue alias, so match the string literal)
  const injected = {};
  for (const k of provides) for (const f of scope.all) if ((chunkSource(site, f) ?? "").includes(`"${k}"`)) (injected[k] ??= []).push(f);

  // entry component work orders: Hami-reachable component definitions, grouped in definition order
  const hamiComps = comps.filter((c) => c.reachable && !c.library);
  const groups = []; let cur = [];
  for (const c of hamiComps) { const kb = cur.reduce((a, x) => a + x.kb, 0); if (cur.length && (cur.length >= ENTRY_GROUP_MAX || kb + c.kb > ENTRY_GROUP_KB)) { groups.push(cur); cur = []; } cur.push(c); }
  if (cur.length) groups.push(cur);

  // oversized chunks: page chunks > 550KB and shared chunks > 900KB, in or out of scope, with the library evidence
  const big = [];
  for (const f of sg.files) {
    const kind = sg.kind.get(f); const kb = kbOf(site, f);
    if (!((kind === "view" && kb > 550) || (kind === "shared" && kb > 900) || (kind === "vendor" && kb > 550))) continue;
    const c = chunkSource(site, f); const names = componentsOf(site, f);
    const firstApp = names.length ? Math.min(...names.map((n) => n.at)) : c.length;
    const lib = vendorLibOf(site, f)?.lib ?? (/tinymce/.test(c) ? `tinymce ${c.match(/majorVersion:"(\d+)",minorVersion:"([\d.]+)"/)?.slice(1).join(".") ?? ""}`.trim()
      : /THREE\.|REVISION/.test(c) && /WebGLRenderer/.test(c) ? `three ${c.match(/REVISION\s*=\s*"(\d+)"/)?.[1] ?? ""}`.trim()
      : /sdkVersion/.test(c) && /easemob|webim|WebIM|im-sdk|EasemobChat/i.test(c) ? "easemob-websdk" : /FeatureCollection/.test(c.slice(0, 200)) ? "geojson" : null);
    big.push({ chunk: f, kind, kb, inScope: scope.all.has(f), components: names.map((n) => n.name), appCodeFrom: +(firstApp / 1024).toFixed(1), appCodeKb: +((c.length - firstApp) / 1024).toFixed(1), library: lib, imports: Object.keys(exportsOf(site, f)).length });
  }

  return {
    site, app, appCode: HAMI_APPCODE,
    scope: { routeViews: scope.roots.length, extraViews: scope.extraViews.length, shared: scope.shared.length, api: scope.api.length, vendor: scope.vendor.length, blocked: scope.blocked },
    entry: { components: comps.length, componentNames: new Set(comps.map((c) => c.name)).size, hamiComponents: hamiComps.map(({ name, globalName, binding, scopeId, kb, exportedAs, optionsApi }) => ({ name, globalName: globalName ?? null, binding, scopeId, kb, exportedAs: exportedAs ?? [], optionsApi })), libraryComponents: comps.filter((c) => c.reachable && c.library).map((c) => ({ name: c.name, library: c.library })), componentGroups: groups.map((gr) => gr.map((c) => ({ name: c.globalName ?? c.name, binding: c.binding, kb: c.kb }))), exportsUsed },
    globals: { components: [...globalsComponents].sort(), directives: [...directives].sort(), provide: [...provides].sort(), injectedBy: injected, plugins },
    bigChunks: big,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const res = Object.keys(SITES).map(scanSharedGaps);
  if (process.argv.includes("--json")) console.log(JSON.stringify(res, null, 1));
  else for (const r of res) {
    const k = {}; for (const e of r.entry.exportsUsed) k[e.kind] = (k[e.kind] ?? 0) + 1;
    console.log(`${r.site} (${r.app}, appCode ${r.appCode})`);
    console.log(`  scope: ${r.scope.routeViews} route views + ${r.scope.extraViews} imported views, ${r.scope.shared} shared, ${r.scope.api} api, ${r.scope.vendor} vendor/const; blocked ${r.scope.blocked.length}`);
    console.log(`  entry components: ${r.entry.components} definitions (${r.entry.componentNames} names); Hami (018) reaches ${r.entry.hamiComponents.length} app components: ${r.entry.hamiComponents.map((c) => c.globalName ?? c.name).join(", ")}; plus ${r.entry.libraryComponents.length} library components (${[...new Set(r.entry.libraryComponents.map((c) => c.library))].join(", ")})`);
    console.log(`  entry component orders: ${r.entry.componentGroups.length} (${r.entry.componentGroups.map((g) => g.map((c) => c.name).join("+")).join(" | ")}) + E1–E7 = ${r.entry.componentGroups.length + 7}`);
    console.log(`  entry exports used by Hami chunks: ${r.entry.exportsUsed.length} ${JSON.stringify(k)}`);
    console.log(`  globals: components ${r.globals.components.join(" ")}; directives ${r.globals.directives.join(" ")}; provide ${r.globals.provide.join(" ")}`);
    for (const p of r.globals.plugins.filter((p) => p.kind === "component-namespace")) console.log(`  global component namespace ${p.binding}: ${p.count} × ${p.lib} (${p.sample.join(", ")}…)`);
    for (const b of r.bigChunks) console.log(`  big ${b.kind} ${b.chunk} ${b.kb}KB inScope=${b.inScope} library=${b.library ?? "-"} app code ${b.appCodeKb}KB (${b.components.join(",") || "no components"})`);
  }
}
