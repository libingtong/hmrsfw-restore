// Static gate: every component a restored template uses must be imported in the SFC or registered globally.
// A component used only by name and never registered renders as an unknown element without any error in a production
// build, so the replay comparison misses it whenever that part of the page is not shown at load time.
// Usage: node tools/check-components.mjs [restore-s restore-h ...]  → prints offenders, exit 1 if any
import { readFileSync, readdirSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
const req = createRequire(import.meta.url);
const sfc = req("../skeleton/node_modules/@vue/compiler-sfc");
const roots = process.argv.slice(2).length ? process.argv.slice(2) : ["restore-s", "restore-h"];

// Globally registered names per app (from skeleton main.ts): ant-design-vue (a-*), the icon set, router, plus app-specific ones.
const GLOBAL_COMMON = (n) => /^a-/.test(n) || /^[A-Z]\w+(Outlined|Filled|TwoTone)$/.test(n) || /-(outlined|filled|two-tone)$/.test(n)
  || ["router-link", "router-view", "RouterLink", "RouterView", "transition", "keep-alive", "teleport", "Teleport", "component", "slot", "template"].includes(n);
const GLOBAL_APP = { portal: new Set(["cus-pagination"]), uc: new Set(["city"]) };
const BAIDU = (n) => /^(baidu-map|bm-[\w-]+)$/.test(n); // vue-baidu-map-3x, registered globally in the user center
const pascal = (n) => n.replace(/(^|-)(\w)/g, (_, __, c) => c.toUpperCase());

const walk = (d) => readdirSync(d).flatMap((n) => { const p = path.join(d, n); return statSync(p).isDirectory() ? walk(p) : p.endsWith(".vue") ? [p] : []; });
const offenders = [];
for (const root of roots) for (const file of walk(root)) {
  const app = file.includes("/portal/") ? "portal" : "uc";
  const src = readFileSync(file, "utf8");
  const { descriptor } = sfc.parse(src, { filename: file });
  if (!descriptor.template) continue;
  let compiled;
  try { compiled = descriptor.script || descriptor.scriptSetup ? sfc.compileScript(descriptor, { id: "x", inlineTemplate: true }).content : sfc.compileTemplate({ source: descriptor.template.content, filename: file, id: "x" }).code; } catch (e) { offenders.push(`${file}: compile error ${String(e.message).slice(0, 80)}`); continue; }
  const local = new Set();
  // names bound in <script setup> / <script> (imports and top-level consts) count as local components
  for (const m of (descriptor.scriptSetup?.content ?? "").concat(descriptor.script?.content ?? "").matchAll(/import\s+([\w$]+)|import\s*\{([^}]*)\}|(?:const|let)\s+([\w$]+)\s*=/g)) {
    if (m[1]) local.add(m[1]);
    if (m[2]) for (const s of m[2].split(",")) { const nm = s.trim().split(/\s+as\s+/).pop(); if (nm) local.add(nm.trim()); }
    if (m[3]) local.add(m[3]);
  }
  for (const m of compiled.matchAll(/_resolveComponent\("([^"]+)"/g)) {
    const n = m[1];
    if (GLOBAL_COMMON(n) || GLOBAL_APP[app].has(n) || (app === "uc" && BAIDU(n)) || local.has(n) || local.has(pascal(n))) continue;
    offenders.push(`${file}: <${n}> is neither imported nor globally registered`);
  }
}
for (const o of offenders) console.log(o);
console.log(offenders.length ? `${offenders.length} unresolved` : "ok: all components resolved");
process.exit(offenders.length ? 1 : 0);
