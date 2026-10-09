// Per-order sliced import maps (batch-plan.md §6.1): only the bindings a chunk actually imports, each resolved through the
// public-library registry (registry/<app>.json) to one path and export name. work-orders.mjs writes them for every order;
// this script rewrites them for selected orders after a registry change (e.g. a shared component moved from reserved to
// restored) without regenerating the whole queue.
// Usage: node tools/slice-maps.mjs <order id> [<order id> ...] --app <hmrsfw-vue>    → out/maps/<id>.json
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { ROOT } from "./scope.mjs";
import { loadRegistry } from "./registry.mjs";
import { buildMaps } from "./work-orders.mjs";
import { appDir } from "./app-dir.mjs";

appDir(); // fail early without a hmrsfw-vue checkout, like every tool that reads the product
const ids = process.argv.slice(2).filter((a, i, all) => !a.startsWith("--") && all[i - 1] !== "--app");
if (!ids.length) { console.error("usage: node tools/slice-maps.mjs <order id> [...] --app <hmrsfw-vue>"); process.exit(2); }
const orders = readdirSync(path.join(ROOT, "queue")).filter((f) => /^(page|seg|shared|entry)\./.test(f)).map((f) => JSON.parse(readFileSync(path.join(ROOT, "queue", f), "utf8")));
const byChunk = new Map(orders.filter((o) => o.sourceChunk && (o.type === "page" || o.type === "shared")).map((o) => [`${o.site}/${o.sourceChunk.split("/").pop()}`, o]));
for (const id of ids) {
  const o = orders.find((x) => x.id === id); if (!o?.maps || !o.sourceChunk) { console.log(id, "skipped (no maps for this order type)"); continue; }
  const maps = buildMaps(o.site, o.sourceChunk.split("/").pop(), loadRegistry(o.app), byChunk);
  writeFileSync(path.join(ROOT, o.maps), JSON.stringify({ id: o.id, ...maps }, null, 1) + "\n");
  console.log(id, "vue", Object.keys(maps.vue).length, "entry", Object.keys(maps.entry).length, "api", Object.keys(maps.api).length, "shared", Object.keys(maps.shared).length, "views", Object.keys(maps.views).length, "missing", maps.missing.length);
}
