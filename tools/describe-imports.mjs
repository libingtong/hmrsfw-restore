// For a chunk, list every imported binding with where it comes from and a definition snippet (hint sheet for restorers).
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { symbolsOf } from "./entry-symbols.mjs";
const symCache = new Map();
const symbols = (site, chunk) => { const p = path.join(mapping[site].dir, "assets", chunk); if (!symCache.has(p)) symCache.set(p, existsSync(p) ? symbolsOf(p) : {}); return symCache.get(p); };
const mapping = JSON.parse(readFileSync("out/mapping.json", "utf8"));
const vueAliases = { portal: JSON.parse(readFileSync("out/vue-exports.portal.final.json", "utf8")).aliases, usercenter: JSON.parse(readFileSync("out/vue-exports.usercenter.final.json", "utf8")).aliases };
const cache = new Map();
const read = (site, chunk) => { const p = path.join(mapping[site].dir, "assets", chunk); if (!cache.has(p)) cache.set(p, existsSync(p) ? readFileSync(p, "utf8") : ""); return cache.get(p); };
function exportsOf(src) { const m = {}; for (const e of src.matchAll(/export\{([^}]+)\}/g)) for (const part of e[1].split(",")) { const [l, n] = part.trim().split(/\s+as\s+/); m[n ?? l] = l; } return m; }
function snippet(src, local) {
  const pats = [new RegExp(`(?:const|let|var)\\s+${local.replace(/\$/g, "\\$")}=`), new RegExp(`function ${local.replace(/\$/g, "\\$")}\\(`), new RegExp(`[,;{]${local.replace(/\$/g, "\\$")}=(?!=)`), new RegExp(`class ${local.replace(/\$/g, "\\$")}\\b`)];
  for (const re of pats) { const m = re.exec(src); if (m) { const s = src.slice(m.index + 1, m.index + 420).replace(/\s+/g, " "); const name = s.match(/name:"([A-Za-z-]+)"/)?.[1]; return { def: s, componentName: name }; } }
  return { def: "(定义未定位)" };
}
export function describe(site, chunk) {
  const src = read(site, chunk);
  const out = [];
  for (const im of src.matchAll(/import\{([^}]+)\}from"\.\/([^"]+)"/g)) {
    const from = im[2];
    const isVue = from.startsWith("vue.");
    const ex = isVue ? null : exportsOf(read(site, from));
    for (const part of im[1].split(",")) {
      const [imported, local] = part.trim().split(/\s+as\s+/).map((x) => x.trim());
      if (imported === "__tla") continue;
      const loc = local ?? imported;
      if (isVue) { const a = vueAliases[site][imported]; out.push({ local: loc, from: "vue-runtime", name: a?.name ?? "?", lib: a?.from ?? "vue" }); continue; }
      const srcLocal = ex?.[imported];
      const sym = symbols(site, from)[imported];
      const sn = sym && sym.kind !== "unknown" ? { def: sym.def, componentName: sym.componentName } : srcLocal ? snippet(read(site, from), srcLocal) : { def: "(源文件无此导出)" };
      const kind = from.startsWith("index.api.") || /url:"/.test(sn.def) ? "api" : from.startsWith("index.1") ? "entry" : "shared";
      out.push({ local: loc, from, kind, exportedAs: imported, sourceLocal: srcLocal, componentName: sn.componentName, def: sn.def });
    }
  }
  return out;
}
if (process.argv[2]) {
  const [site, chunk, outFile] = process.argv.slice(2);
  const res = describe(site, chunk);
  const md = ["# 导入提示：" + chunk, "", "| 本地名 | 来源 | 类型 | 识别 | 定义片段 |", "|---|---|---|---|---|", ...res.map((r) => `| \`${r.local}\` | ${r.from} | ${r.kind ?? r.lib} | ${r.name ?? r.componentName ?? ""} | ${r.def ? "`" + r.def.slice(0, 200).replace(/\|/g, "\\|") + "`" : ""} |`)].join("\n");
  writeFileSync(outFile, md);
  console.log(outFile, res.length, "bindings");
}
