// Turn an index.api.*.js chunk into a readable TS module. Usage: node tools/restore-api.mjs <site> <chunk> <outTs>
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
const [site, chunk, outTs] = process.argv.slice(2);
const dir = site === "portal" ? "legacy-dist/portal" : "legacy-dist/usercenter";
const src = readFileSync(path.join(dir, "assets", chunk), "utf8");
const exp = {}; for (const e of src.matchAll(/export\{([^}]+)\}/g)) for (const part of e[1].split(",")) { const [l, n] = part.trim().split(/\s+as\s+/); exp[l] = n ?? l; }
const fns = [];
const re = /([A-Za-z_$][\w$]*)=(\(?[^=]*?\)?)=>([a-zA-Z_$][\w$]*)\.request\((\{[^;]*?\})\)(?=,[A-Za-z_$][\w$]*=|;|\)|$)/g;
const balanced = (text, start) => { let depth = 0; for (let i = start; i < text.length; i++) { if (text[i] === "{") depth++; else if (text[i] === "}") { depth--; if (depth === 0) return text.slice(start, i + 1); } } return text.slice(start); };
for (const m of src.matchAll(re)) {
  const [, local, params] = m;
  const cfg = balanced(src, m.index + m[0].indexOf(".request(") + ".request(".length);
  const url = cfg.match(/url:"([^"]+)"/)?.[1] ?? cfg.match(/url:`([^`]+)`/)?.[1];
  const method = cfg.match(/method:"([^"]+)"/)?.[1] ?? "get";
  if (!url) continue;
  const name = url.split("?")[0].split("/").filter(Boolean).pop().replace(/[^\w]/g, "_");
  fns.push({ local, exported: exp[local], params: params.replace(/^\(|\)$/g, ""), url, method, cfg, name });
}
// de-duplicate names
const RESERVED = new Set("delete default export import new class function return var let const if else for while switch case break continue do in of try catch finally throw typeof void with yield await enum extends super this null true false".split(" "));
for (const f of fns) if (RESERVED.has(f.name)) f.name = f.name + "Item";
const seen = {}; for (const f of fns) { seen[f.name] = (seen[f.name] ?? 0) + 1; if (seen[f.name] > 1) f.name += seen[f.name]; }
const ts = [`// 由 ${chunk} 还原（脚本生成）。request 的用法与原包一致：request({ url, method, params | data })。`, `import { request } from "@/utils/request";`, "",
  ...fns.map((f) => `/** 原压缩名 ${f.local}${f.exported ? `，导出名 ${f.exported}` : ""} */\nexport const ${f.name} = (${f.params || ""}) => request(${f.cfg.replace(/,headers:\{[^}]*\}/, (h) => h)});`)].join("\n");
writeFileSync(outTs, ts + "\n");
writeFileSync(outTs.replace(/\.ts$/, ".map.json"), JSON.stringify(Object.fromEntries(fns.map((f) => [f.exported ?? f.local, f.name])), null, 2));
console.log(outTs, fns.length, "functions; exports in chunk:", Object.keys(exp).length);
