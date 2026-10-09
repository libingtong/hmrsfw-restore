// Brings hmrsfw-vue in line with the public-library registry (docs/pipeline.md §13.1 种子清理; plan: docs/registry-cleanup.md).
// Default is a dry run that prints the plan; --apply changes the hmrsfw-vue working tree (no commit), after which
// `node tools/registry.mjs --app …` and `node tools/work-orders.mjs --app …` regenerate the registry and the maps.
//
//   1. API files: hash-named files get their business name (registry apiModules.renameTo); duplicate files of one chunk
//      are merged into one; functions the old regex missed are appended (restore-api.mjs parser, registry names).
//   2. npm wrappers in src/shared (echarts.ts, vue3-seamless-scroll.ts, pinyin-match copied as main.ts): imports go to the
//      npm package named by the registry; the wrapper is deleted when nothing imports it any more.
//   3. Imports in pages and shared components are rewritten to the registry's canonical path and export name
//      (Modal from "ant-design-vue" instead of the "@/legacy" barrel, "@/shared/x.vue" instead of "@shared/x", …).
//   4. Re-export barrels in src/shared (dictCode.ts → dictCode.vue, …) are deleted once nothing imports them.
// Usage: node tools/registry-cleanup.mjs --app <hmrsfw-vue> [--apply] [--json]
import { existsSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parse } from "@babel/parser";
import { ROOT, SITE_OF, chunkSource } from "./scope.mjs";
import { loadRegistry } from "./registry.mjs";
import { parseApiChunk } from "./restore-api.mjs";
import { appDir } from "./app-dir.mjs";

const APP = appDir(); const apply = process.argv.includes("--apply");
const walk = (d) => existsSync(d) ? readdirSync(d).flatMap((n) => { const p = path.join(d, n); return statSync(p).isDirectory() ? walk(p) : [p]; }) : [];
const norm = (s) => s.replace(/^@shared\//, "@/shared/").replace(/^@views\//, "@/views/").replace(/\.ts$/, "").replace(/\/index$/, "");
const plan = { apply, apps: {} };

for (const app of ["portal", "uc"]) {
  const reg = loadRegistry(app); const site = SITE_OF[app]; const src = path.join(APP, "apps", app, "src");
  const P = (plan.apps[app] = { renameApi: [], mergeApi: [], appendApi: [], rewriteImports: [], deleteFiles: [], keep: [] });
  const fileOf = (spec) => path.join(src, spec.slice(2) + (/\.(vue|ts)$/.test(spec) ? "" : ".ts"));

  // ---- 1. API modules ----
  const specMap = new Map(); // old normalized spec → new spec (for import rewriting)
  for (const [chunk, m] of Object.entries(reg.apiModules)) {
    if (m.status !== "restored") continue;
    const target = m.renameTo ?? m.path;
    if (m.renameTo) { P.renameApi.push({ chunk, from: m.path, to: m.renameTo }); specMap.set(norm(m.path), target); }
    for (const d of m.duplicates ?? []) { P.mergeApi.push({ chunk, drop: d, into: target }); specMap.set(norm(d), target); }
    const missing = Object.entries(reg.api).filter(([k, v]) => k.startsWith(chunk + "#") && v.status === "reserved");
    if (missing.length) P.appendApi.push({ chunk, file: target, functions: missing.map(([k, v]) => `${v.export}（${k.split("#")[1]}${v.url ? "，" + v.url : ""}）`) });
  }

  // ---- canonical location of every public name, by the (normalized) path it is imported from today ----
  const canon = new Map(); // `${spec}|${name}` → {path, export}
  const add = (spec, name, to) => canon.set(`${norm(spec)}|${name}`, to);
  const byName = new Map(); // readable export name → canonical {path, export} (when unique)
  // only readable names: original single/double-letter export names (`_`, `i`, `aE`) mean different things in different chunks
  const note = (name, to) => { if (!name || name === "default" || !/^[A-Za-z_$][\w$]{2,}$/.test(name)) return; const prev = byName.get(name); byName.set(name, prev && (prev.path !== to.path || prev.export !== to.export) ? null : to); };
  for (const e of Object.values(reg.entry)) if (e.path && e.export) { const to = { path: e.path, export: e.export, ...(e.export === "default" && e.local ? { local: e.local } : {}) }; note(e.export === "default" ? e.local : e.export, to); }
  for (const s of Object.values(reg.shared)) for (const x of Object.values(s.exports)) note(x.export, { path: x.path ?? s.path, export: x.export });
  for (const a of Object.values(reg.api)) note(a.export, { path: a.path, export: a.export });
  for (const [spec, names] of Object.entries(reg.utils ?? {})) for (const n of names) if (!byName.has(n)) byName.set(n, { path: spec, export: n });
  // shared files restored from a chunk the registry maps to npm (wrappers) or to a .vue (re-export barrels)
  const wrappers = new Map(); // normalized spec of the existing file → registry record of its chunk
  for (const f of walk(path.join(src, "shared"))) {
    const head = readFileSync(f, "utf8").slice(0, 600); const chunk = head.match(/([\w.-]+\.\d{13}\d*\.js)/)?.[1];
    const rec = chunk && (reg.shared[chunk] ?? reg.modules[chunk]); if (!rec) continue;
    const spec = "@/" + path.relative(src, f).split(path.sep).join("/");
    if (f.endsWith(".ts") && (rec.kind === "npm" || Object.values(rec.exports).every((x) => x.npm || (x.path ?? rec.path) !== norm(spec) + ".ts" && (x.path ?? rec.path) !== norm(spec)))) wrappers.set(norm(spec), rec);
  }

  // ---- 3. rewrite imports ----
  // the order a file belongs to gives the precise name → path table (its maps); the global by-name table is the fallback
  const orders = readdirSync(path.join(ROOT, "queue")).filter((n) => /^(page|shared)\./.test(n) && n.includes(`.${app}.`)).map((n) => JSON.parse(readFileSync(path.join(ROOT, "queue", n), "utf8"))).filter((o) => o.maps && o.target && existsSync(path.join(ROOT, o.maps)));
  const mapsOfFile = new Map();
  for (const o of orders) {
    const m = JSON.parse(readFileSync(path.join(ROOT, o.maps), "utf8")); const names = new Map();
    for (const k of ["entry", "api", "shared", "modules"]) for (const v of Object.values(m[k] ?? {})) if (v.path && v.export && v.export !== "default") names.set(v.export, { path: v.path, export: v.export });
    for (const f of orderFilesOf(o)) mapsOfFile.set(f, names);
  }
  function orderFilesOf(o) { const out = new Set(); const q = [path.join(APP, o.target)]; while (q.length) { const f = q.shift(); if (out.has(f) || !existsSync(f)) continue; out.add(f); for (const m of readFileSync(f, "utf8").matchAll(/from\s+["'](\.{1,2}\/[^"']+\.vue)["']/g)) q.push(path.resolve(path.dirname(f), m[1])); } if (o.subComponentDir) for (const f of walk(path.join(APP, o.subComponentDir))) out.add(f); return out; }
  const files = [...walk(path.join(src, "views")), ...walk(path.join(src, "shared"))].filter((f) => /\.(vue|ts)$/.test(f));
  for (const f of files) {
    const local = mapsOfFile.get(f);
    const text = readFileSync(f, "utf8"); let out = text; const changes = [];
    const blocks = f.endsWith(".vue") ? [...text.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map((m) => ({ start: m.index + m[0].indexOf(m[1]), code: m[1] })) : [{ start: 0, code: text }];
    const edits = [];
    for (const b of blocks) {
      let ast; try { ast = parse(b.code, { sourceType: "module", plugins: ["typescript", "topLevelAwait"] }); } catch { continue; }
      for (const n of ast.program.body) {
        if (n.type !== "ImportDeclaration" || n.importKind === "type" || !/^@/.test(n.source.value)) continue;
        const spec = norm(n.source.value); if (spec.startsWith("@/views/")) continue;
        // side-effect import of an npm wrapper (`import "@shared/main"`) → the npm package itself
        if (!n.specifiers.length) { const w = wrappers.get(spec); const pkg = w?.npm ?? Object.values(w?.exports ?? {}).find((x) => x.npm || (x.path && !x.path.startsWith("@/")))?.path; if (pkg) { edits.push({ start: b.start + n.start, end: b.start + n.end, text: `import "${pkg}";` }); changes.push(`${n.source.value} → ${pkg}`); } continue; }
        const groups = new Map(); let touched = false;
        for (const s of n.specifiers) {
          const imported = s.type === "ImportDefaultSpecifier" ? "default" : s.type === "ImportNamespaceSpecifier" ? "*" : s.imported.name;
          let to = specMap.has(spec) ? { path: specMap.get(spec), export: imported } : null;
          const w = wrappers.get(spec);
          // a wrapper kept the chunk's export names (`i` = echarts.init) next to readable ones
          if (!to && w) { const x = w.exports[imported] ?? Object.values(w.exports).find((e) => e.export === imported) ?? (imported === "default" ? Object.values(w.exports)[0] : null); if (x) to = { path: x.path ?? w.npm ?? w.path, export: x.export === "*" ? "default" : x.export }; else { const c = byName.get(imported); if (c) to = c; } }
          if (!to && imported !== "*" && imported !== "default") { const c = local?.get(imported) ?? (local ? null : byName.get(imported)); if (c && norm(c.path) !== spec) to = { ...c }; }
          if (to?.path && specMap.has(norm(to.path))) to.path = specMap.get(norm(to.path)); // API file renamed in this run
          if (!to && imported === "default" && /\.vue$/.test(n.source.value) === false && existsSync(fileOf(spec) .replace(/\.ts$/, ".vue"))) to = { path: spec + ".vue", export: "default" };
          if (!to && n.source.value.startsWith("@shared/")) to = { path: "@/shared/" + n.source.value.slice(8), export: imported };
          // only move an import to a file that exists (restored) or to an npm package; reserved paths come later
          if (to?.path?.startsWith("@/")) { to.path = to.path.replace(/\.ts$/, ""); if (!existsSync(fileOf(to.path)) && !existsSync(fileOf(to.path).replace(/\.ts$/, ".vue")) && !specMap.has(spec)) to = null; }
          if (to && (norm(to.path) !== spec || to.export !== imported || n.source.value.startsWith("@shared/"))) touched = true;
          const target = to ?? { path: n.source.value, export: imported };
          const key = target.path; if (!groups.has(key)) groups.set(key, []);
          groups.get(key).push({ s, export: target.export, local: s.local.name });
        }
        if (!touched) continue;
        const stmts = [...groups].map(([p, list]) => {
          const def = list.find((x) => x.export === "default" || x.s.type === "ImportDefaultSpecifier" && x.export === "default");
          const ns = list.find((x) => x.s.type === "ImportNamespaceSpecifier" || x.export === "*");
          const named = list.filter((x) => x !== def && x !== ns).map((x) => x.export === x.local ? x.local : `${x.export} as ${x.local}`);
          const parts = [def ? def.local : null, ns ? `* as ${ns.local}` : null, named.length ? `{ ${named.join(", ")} }` : null].filter(Boolean);
          return `import ${parts.join(", ")} from "${p}";`;
        });
        edits.push({ start: b.start + n.start, end: b.start + n.end, text: stmts.join("\n") });
        changes.push(`${n.source.value} → ${[...groups.keys()].join("、")}`);
      }
    }
    if (!edits.length) continue;
    for (const e of edits.sort((a, b) => b.start - a.start)) out = out.slice(0, e.start) + e.text + out.slice(e.end);
    P.rewriteImports.push({ file: path.relative(APP, f), changes });
    if (apply) writeFileSync(f, out);
  }

  // ---- 1 (apply). rename / merge / append API files ----
  for (const r of P.renameApi) if (apply && existsSync(fileOf(r.from))) renameSync(fileOf(r.from), fileOf(r.to));
  for (const m of P.mergeApi) if (apply && existsSync(fileOf(m.drop))) rmSync(fileOf(m.drop));
  for (const a of P.appendApi) {
    if (!apply) continue;
    const { fns } = parseApiChunk(chunkSource(site, a.chunk));
    const add = Object.entries(reg.api).filter(([k, v]) => k.startsWith(a.chunk + "#") && v.status === "reserved").map(([k, v]) => { const alias = k.split("#")[1]; const fn = fns.find((x) => (x.exported ?? x.local) === alias); return fn ? `/** 原压缩名 ${fn.local}，导出名 ${alias}（registry-cleanup 补充） */\nexport const ${v.export} = (${fn.params || ""}) => request(${fn.cfg});` : `// TODO:restore 导出名 ${alias} 不是接口函数，按原 chunk 补上（registry-cleanup）`; });
    const f = fileOf(a.file); writeFileSync(f, readFileSync(f, "utf8").replace(/\s*$/, "\n") + add.join("\n") + "\n");
  }

  // ---- 2/4. delete wrappers and barrels nobody imports any more ----
  const importsOf = (f) => readFileSync(f, "utf8").split("\n").filter((l) => !/^\s*(\/\/|\*)/.test(l)).join("\n").matchAll(/(?:from|import)\s+["'](@[^"']+)["']/g);
  for (const [spec, rec] of wrappers) {
    const stillUsed = apply ? walk(src).filter((f) => /\.(vue|ts)$/.test(f) && f !== fileOf(spec)).some((f) => [...importsOf(f)].some((m) => norm(m[1]) === spec)) : false;
    if (stillUsed) { P.keep.push({ file: spec, why: "仍有文件导入它" }); continue; }
    P.deleteFiles.push({ file: spec + ".ts", why: rec.kind === "npm" || rec.npm ? `npm 包 ${rec.npm ?? Object.values(rec.exports)[0]?.path} 的包装` : "只是再导出 .vue 的桶文件" });
    if (apply && existsSync(fileOf(spec))) rmSync(fileOf(spec));
  }
}
if (process.argv.includes("--json")) console.log(JSON.stringify(plan, null, 1));
else for (const [app, p] of Object.entries(plan.apps)) {
  console.log(`== ${app}${apply ? "（已应用）" : "（预演，未修改）"}`);
  for (const r of p.renameApi) console.log(`  改名  ${r.from} → ${r.to}`);
  for (const m of p.mergeApi) console.log(`  合并  ${m.drop} → ${m.into}`);
  for (const a of p.appendApi) console.log(`  补函数 ${a.file}: ${a.functions.join("；")}`);
  console.log(`  改导入 ${p.rewriteImports.length} 个文件，${p.rewriteImports.reduce((s, x) => s + x.changes.length, 0)} 条 import`);
  for (const d of p.deleteFiles) console.log(`  删除  ${d.file}（${d.why}）`);
  for (const k of p.keep) console.log(`  保留  ${k.file}（${k.why}）`);
}
