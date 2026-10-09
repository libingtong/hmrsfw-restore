// Assembles the fragments of a segmented page (tools/segments.mjs) into SFCs. Run by the restorer of the page's last
// segment once the other segments are merged:  <subComponentDir>/_seg/<Comp>.script.ts + <Comp>.template.html  →  the
// component's .vue file (the page target for the main component, <subComponentDir><Comp>.vue otherwise). _seg/ is removed.
// Usage: node tools/assemble-segments.mjs <page order id> --app <hmrsfw-vue> [--dry-run]   → JSON {ok, written:[...], missing:[...]}
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { loadOrder } from "./sfc-util.mjs";
import { appDir } from "./app-dir.mjs";

const APP = appDir(); const args = process.argv.slice(2);
const id = args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--app"); const dry = args.includes("--dry-run");
const page = loadOrder(id);
if (page.type !== "page" || !page.segments) { console.log(JSON.stringify({ ok: false, error: `${id} 不是分段的页面工单` })); process.exit(2); }
const segDir = path.join(APP, page.subComponentDir, "_seg");
const parts = page.segments.map(loadOrder).flatMap((s) => s.parts ?? []);
const byComp = new Map(); for (const p of parts) { if (!byComp.has(p.component)) byComp.set(p.component, {}); byComp.get(p.component)[p.part] = p.file; }
const main = page.components.at(-1)?.name; const written = [], missing = [];
for (const [comp, f] of byComp) {
  const read = (rel) => existsSync(path.join(APP, rel)) ? readFileSync(path.join(APP, rel), "utf8").trim() : (missing.push(rel), null);
  const script = f.script ? read(f.script) : null; const template = f.template ? read(f.template) : null;
  if ((f.script && script == null) || (f.template && template == null)) continue;
  const out = comp === main ? page.target : `${page.subComponentDir}${comp}.vue`;
  const sfc = [template != null ? `<template>\n${template}\n</template>\n` : "", script != null ? `<script setup lang="ts">\n${script}\n</script>\n` : ""].filter(Boolean).join("\n");
  if (!dry) { mkdirSync(path.dirname(path.join(APP, out)), { recursive: true }); writeFileSync(path.join(APP, out), sfc); }
  written.push(out);
}
if (!missing.length && !dry && existsSync(segDir) && readdirSync(segDir).every((n) => /\.(script\.ts|template\.html)$/.test(n))) rmSync(segDir, { recursive: true });
console.log(JSON.stringify({ ok: !missing.length, written, missing }));
process.exitCode = missing.length ? 1 : 0;
