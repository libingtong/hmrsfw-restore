// Carries a registry name change into the generated orders without regenerating the whole queue (work-orders.mjs derives
// statuses from the hmrsfw-vue router and would also move unrelated orders): after `node tools/registry.mjs`, run this to
//   - update `exports` of the shared orders (original export → registry name) and `chunks[].exports` of the modules orders
//   - rewrite out/maps/<id>.json of every order whose bindings point at a registry record that changed
// Only files whose content changes are written; --check lists them and exits 1 when there are any (CI: nothing stale).
// Usage: node tools/refresh-names.mjs [--check]        (reads registry/<app>.json, queue/, legacy-dist)
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { ROOT, SITES, APP_OF, chunkPath } from "./scope.mjs";
import { loadRegistry } from "./registry.mjs";
import { buildMaps } from "./work-orders.mjs";

const check = process.argv.includes("--check");
const json = (f) => JSON.parse(readFileSync(f, "utf8"));
const out = (f, v) => JSON.stringify(v, null, 1) + "\n";
const changed = [];
const put = (rel, value) => { const f = path.join(ROOT, rel); const text = out(f, value); if (existsSync(f) && readFileSync(f, "utf8") === text) return; changed.push(rel); if (!check) writeFileSync(f, text); };

const orders = readdirSync(path.join(ROOT, "queue")).filter((f) => /^(page|seg|shared|entry)\./.test(f)).map((f) => ({ file: `queue/${f}`, o: json(path.join(ROOT, "queue", f)) }));
const byChunk = new Map(orders.map((x) => x.o).filter((o) => o.sourceChunk && (o.type === "page" || o.type === "shared")).map((o) => [`${o.site}/${o.sourceChunk.split("/").pop()}`, o]));
for (const { file, o } of orders) {
  const reg = loadRegistry(o.app);
  // shared order: exports straight from the registry record
  if (o.type === "shared" && o.registryKey && reg.shared[o.registryKey] && o.exports) { const next = { ...o, exports: reg.shared[o.registryKey].exports }; if (JSON.stringify(next.exports) !== JSON.stringify(o.exports)) { put(file, next); o.exports = next.exports; } }
  // modules order: every chunk it lists
  if (o.subtype === "modules" && o.chunks) {
    let dirty = false;
    const chunks = o.chunks.map((c) => { const key = c.chunk.split("/").pop(); const rec = reg.shared[key] ?? reg.modules[key]; if (!rec) return c; const exports = rec.exports; if (JSON.stringify(exports) === JSON.stringify(c.exports)) return c; dirty = true; return { ...c, exports }; });
    if (dirty) put(file, { ...o, chunks });
  }
}
// maps
for (const { o } of orders) {
  // a segmented page and its segments share out/maps/<page>.json: only the page order writes it
  if (!o.maps || o.type === "segment") continue; const reg = loadRegistry(o.app); const site = o.site;
  let maps;
  if (o.subtype === "modules") {
    const all = { entry: {}, shared: {}, api: {}, modules: {}, views: {}, vue: {}, missing: [], sideEffects: [] };
    for (const c of o.chunks) { const m = buildMaps(site, c.chunk.split("/").pop(), reg, byChunk); for (const k of ["entry", "shared", "api", "modules", "views", "vue"]) Object.assign(all[k], m[k]); all.missing.push(...m.missing); }
    maps = { id: o.id, chunk: o.chunks.map((c) => c.chunk), app: o.app, vueVersion: SITES[site].vueVersion, ...all };
  } else if (o.sourceChunk) maps = { id: o.id, ...buildMaps(site, o.sourceChunk.split("/").pop(), reg, byChunk) };
  else continue;
  const f = path.join(ROOT, o.maps); if (!existsSync(f)) continue;
  const old = json(f);
  // segments keep a slice of the page's maps (slice-maps.mjs); leave orders whose maps differ in shape from a full rebuild alone
  if (JSON.stringify(Object.keys(old)) !== JSON.stringify(Object.keys(maps))) continue;
  put(o.maps, maps);
}
console.log(JSON.stringify({ check, changed: changed.length, files: changed.slice(0, 200) }));
process.exitCode = check && changed.length ? 1 : 0;
