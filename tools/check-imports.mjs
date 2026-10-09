// check-imports (docs/pipeline.md §13.2): a page may only use the public library through registry/<app>.json.
//   1. imports come only from: the page's own files (relative), registry paths (with the registry's export names), npm
//      packages listed in the registry;
//   2. a page does not redefine a public symbol: no top-level declaration named like a registry export, no request to a
//      url that a registry function already wraps;
//   3. every component / directive the templates resolve by name is imported or registered globally (registry.globals);
//   4. a page or segment order changes nothing outside its own files (legacy/, shared/, api/, utils/, package.json, lock
//      files, other pages) — judged from git in the hmrsfw-vue checkout against origin/integration (or origin/main).
// Items that only differ in form from the registry (a barrel re-exporting the same symbol, a duplicate API file, a POC
// wrapper around an npm package, a function named like a public one) are reported with severity "warn" and do not fail.
// Usage: node tools/check-imports.mjs <order id> --app <hmrsfw-vue>   → JSON {pass, failed:[{check, where, hint, severity?}]}
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parse } from "@babel/parser";
import { ROOT, chunkSource } from "./scope.mjs";
import { compilerSfc, compileSfc, loadJson, loadOrder, orderFiles, renderFacts, compiledNameOf } from "./sfc-util.mjs";
import { loadRegistry, appExportIndex } from "./registry.mjs";
import { appDir } from "./app-dir.mjs";

const BUILTIN_NPM = ["vue", "vue-router", "pinia", "vuex"];
const VUE_BUILTIN_COMPONENTS = new Set(["component", "transition", "transition-group", "keep-alive", "teleport", "suspense", "slot", "template", "Transition", "TransitionGroup", "KeepAlive", "Teleport", "Suspense"]);
export const normSpec = (s) => s.replace(/^@shared\//, "@/shared/").replace(/^@views\//, "@/views/").replace(/\.ts$/, "").replace(/\/index$/, "");
const pkgOf = (s) => s.startsWith("@") ? s.split("/").slice(0, 2).join("/") : s.split("/")[0];
const pascal = (n) => n.replace(/(^|-)(\w)/g, (_, __, c) => c.toUpperCase());
const camel = (n) => n.replace(/-(\w)/g, (_, c) => c.toUpperCase());

// path → Set of allowed export names; plus names/urls of public symbols
export function registryIndex(reg) {
  const paths = new Map(); const add = (p, e) => { const k = normSpec(p); if (!paths.has(k)) paths.set(k, new Set()); if (e) paths.get(k).add(e); };
  const publicNames = new Map(); const urls = new Map();
  for (const e of Object.values(reg.entry)) if (e.path && !e.npm && e.export) { add(e.path, e.export); publicNames.set(e.export, e.path); if (e.url) urls.set(e.url, `${e.path} 的 ${e.export}`); }
  for (const s of Object.values(reg.shared)) for (const x of Object.values(s.exports)) { if (x.npm) continue; add(x.path ?? s.path, x.export); if (x.export !== "default") publicNames.set(x.export, x.path ?? s.path); }
  for (const a of Object.values(reg.api)) { add(a.path, a.export); publicNames.set(a.export, a.path); urls.set(a.url, `${a.path} 的 ${a.export}`); }
  for (const m of Object.values(reg.modules)) for (const x of Object.values(m.exports)) if (x.path?.startsWith("@/")) add(x.path, x.export);
  for (const m of Object.values(reg.apiModules ?? {})) add(m.path);
  for (const [spec, names] of Object.entries(reg.utils ?? {})) for (const n of names) { add(spec, n); if (!publicNames.has(n)) publicNames.set(n, spec); }
  // npm symbols the original reached through a chunk (entry exports, shared chunks that bundled a package)
  const npmNames = new Map();
  for (const e of Object.values(reg.entry)) if (e.npm) { npmNames.set(e.export === "default" ? e.local : e.export, e.path); }
  for (const sh of Object.values(reg.shared)) for (const x of Object.values(sh.exports)) if (x.npm) npmNames.set(x.export, x.path);
  for (const m of Object.values(reg.modules)) for (const x of Object.values(m.exports)) if (x.path && !x.path.startsWith("@/") && x.export) npmNames.set(x.export, x.path);
  const npm = new Set([...BUILTIN_NPM, ...Object.keys(reg.npm ?? {})]);
  return { paths, publicNames, urls, npm, npmNames };
}

function scriptOf(sfc, file) {
  const src = readFileSync(file, "utf8");
  if (!file.endsWith(".vue")) return [{ content: src, setup: false }];
  const { descriptor } = sfc.parse(src, { filename: file });
  return [descriptor.script, descriptor.scriptSetup].filter(Boolean).map((b) => ({ content: b.content, setup: !!b.setup }));
}

function changedFiles(APP) {
  const git = (...a) => execFileSync("git", ["-C", APP, ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trimEnd(); // keep the leading space of porcelain lines
  try {
    const base = ["origin/integration", "origin/main", "integration", "main"].find((r) => { try { git("rev-parse", "--verify", "--quiet", r); return true; } catch { return false; } });
    if (!base) return { files: null, base: null };
    const mb = git("merge-base", "HEAD", base);
    const committed = git("diff", "--name-only", `${mb}...HEAD`).split("\n").filter(Boolean);
    const work = git("status", "--porcelain", "--untracked-files=all").split("\n").filter(Boolean).map((l) => l.slice(3).replace(/^.* -> /, ""));
    return { files: [...new Set([...committed, ...work])], base };
  } catch { return { files: null, base: null }; }
}

export function checkImports(order, APP, { files = orderFiles(order, APP), maps = order.maps ? loadJson(order.maps) : null, reg = loadRegistry(order.app), allTargets = null } = {}) {
  APP = path.resolve(APP);
  const sfc = compilerSfc(APP); const idx = registryIndex(reg); const failed = []; const stats = { files: files.length, imports: 0 };
  const rel = (f) => path.relative(APP, f).split(path.sep).join("/");
  const own = new Set(files.map((f) => path.resolve(f)));
  const views = new Map(Object.values(maps?.views ?? {}).filter((v) => v.path).map((v) => [normSpec(v.path), v]));
  allTargets ??= new Map(readdirSync(path.join(ROOT, "queue")).filter((f) => /^(page|seg)\./.test(f)).map((f) => JSON.parse(readFileSync(path.join(ROOT, "queue", f), "utf8"))).filter((o) => o.target).map((o) => [path.resolve(APP, o.target), o.id]));
  const pageOrder = order.type === "page" || order.type === "segment";
  // hmrsfw-vue as it is: barrels that re-export a registry symbol, duplicate API files, POC wrappers around npm packages
  const appIdx = appExportIndex(APP, order.app);
  const dupApi = new Map(Object.values(reg.apiModules ?? {}).flatMap((m) => (m.duplicates ?? []).map((d) => [normSpec(d), m.path])));
  const warn = (where, hint) => failed.push({ check: "imports", where, hint, severity: "warn" });
  const origSrc = order.sourceChunk ? chunkSource(order.site, order.sourceChunk.split("/").pop()) ?? "" : "";

  for (const f of files) {
    const local = new Set(); const imported = new Set(); const bound = new Set(); // bound: every top-level name (template may use it as a component)
    for (const block of scriptOf(sfc, f)) {
      let ast; try { ast = parse(block.content, { sourceType: "module", plugins: ["typescript", "topLevelAwait"], errorRecovery: true }); } catch (e) { failed.push({ check: "imports", where: rel(f), hint: `脚本无法解析：${String(e.message).split("\n")[0]}` }); continue; }
      for (const n of ast.program.body) {
        if (n.type === "ImportDeclaration") {
          stats.imports++;
          const spec = n.source.value; const names = n.specifiers.map((s) => ({ imported: s.type === "ImportDefaultSpecifier" ? "default" : s.type === "ImportNamespaceSpecifier" ? "*" : s.imported.name ?? s.imported.value, local: s.local.name }));
          names.forEach((x) => imported.add(x.local));
          if (n.importKind === "type") continue;
          if (spec.startsWith(".")) {
            const target = path.resolve(path.dirname(f), spec); const cands = [target, `${target}.ts`, `${target}.vue`, path.join(target, "index.ts")];
            const hit = cands.find((c) => own.has(c)) ?? cands.find((c) => existsSync(c));
            if (!hit) { failed.push({ check: "imports", where: rel(f), hint: `相对导入 "${spec}" 找不到文件` }); continue; }
            if (own.has(hit)) continue;
            const other = allTargets.get(hit);
            if (other && [...views.values()].some((v) => v.order === other)) continue;
            failed.push({ check: "imports", where: rel(f), hint: other ? `"${spec}" 是另一张工单（${other}）的页面，maps 里没有这个依赖；页面之间不要互相导入，按 maps 处理` : `"${spec}" 不在本页目录内：页面只能相对导入自己的文件（${order.subComponentDir ?? path.dirname(order.target ?? "")}），公共代码按 maps 的路径导入` });
            continue;
          }
          if (/^@\/|^@shared\/|^@views\//.test(spec)) {
            const k = normSpec(spec);
            if (views.has(k)) continue; // another page used as a component, as listed in maps.views
            if (k.startsWith("@/views/")) { if (!views.has(k)) failed.push({ check: "imports", where: rel(f), hint: `"${spec}" 是页面文件，maps 里没有它；不要导入别的页面` }); continue; }
            const allowed = idx.paths.get(k);
            if (!allowed) {
              if (dupApi.has(k)) { warn(rel(f), `"${spec}" 是重复的接口文件，清单只认 "${dupApi.get(k)}"：改为从它导入（registry-cleanup 会合并这两个文件）`); continue; }
              if (appIdx.has(k)) { warn(rel(f), `"${spec}" 是 hmrsfw-vue 里现有的文件，但不是清单的规范路径（POC 时期的包装或重复文件）：按 maps 的路径导入`); continue; }
              failed.push({ check: "imports", where: rel(f), hint: `"${spec}" 不是公共库清单里的路径。按 maps 给出的路径导入；清单里没有的东西写进回执 needsFromSkeleton，不要自己补` }); continue;
            }
            for (const x of names) if (x.imported !== "*" && allowed.size && !allowed.has(x.imported)) {
              const at = idx.publicNames.get(x.imported) ?? idx.npmNames.get(x.imported);
              const viaBarrel = appIdx.get(k)?.exports.has(x.imported);
              const readable = appIdx.get(k)?.aliasOf.get(x.imported);
              if (viaBarrel && readable && allowed.has(readable)) { warn(rel(f), `"${spec}" 的 ${x.imported} 是原导出名，清单里的导出名是 ${readable}：改成 import { ${readable} } from "${spec}"`); continue; }
              if (viaBarrel && readable && idx.npmNames.has(readable)) { warn(rel(f), `"${spec}" 的 ${x.imported} 是 npm 包 ${idx.npmNames.get(readable)} 的 ${readable} 的再导出：改成 import { ${readable} } from "${idx.npmNames.get(readable)}"`); continue; }
              const hint = at && normSpec(at) !== k ? `${x.imported} 的规范位置是 "${at}"${viaBarrel ? `（"${spec}" 只是再导出它）` : ""}：改成 import { ${x.imported} } from "${at}"` : `清单里 "${spec}" 没有导出 ${x.imported}；可用的导出：${[...allowed].slice(0, 8).join("、")}${allowed.size > 8 ? "…" : ""}（按 maps 改）`;
              if (viaBarrel && at) warn(rel(f), hint); else failed.push({ check: "imports", where: rel(f), hint });
            }
            continue;
          }
          if (/^[@\w]/.test(spec)) { if (!idx.npm.has(pkgOf(spec))) failed.push({ check: "imports", where: rel(f), hint: `npm 包 "${pkgOf(spec)}" 不在公共库清单的依赖里；页面工单不能新增依赖，改用清单里已有的包或写进回执 needsFromSkeleton` }); continue; }
          failed.push({ check: "imports", where: rel(f), hint: `无法识别的导入 "${spec}"` });
          continue;
        }
        // rule 2: top-level definitions
        // only function / class definitions count (const router = useRouter() is a local instance, not a copy)
        const fnInit = (d) => /^(ArrowFunctionExpression|FunctionExpression|ClassExpression)$/.test(d.init?.type ?? "");
        const decls = n.type === "VariableDeclaration" ? n.declarations.filter(fnInit).map((d) => d.id) : (n.type === "FunctionDeclaration" || n.type === "ClassDeclaration") && n.id ? [n.id] : [];
        for (const id of decls) if (id?.type === "Identifier") local.add(id.name);
        if (n.type === "VariableDeclaration") for (const d of n.declarations) if (d.id.type === "Identifier") bound.add(d.id.name);
        // options API: components: { VNodes: … } registered locally
        if (n.type === "ExportDefaultDeclaration" || n.type === "VariableDeclaration" || n.type === "ExpressionStatement") for (const m of block.content.slice(n.start, n.end).matchAll(/components\s*:\s*\{([^}]*)\}/g)) for (const k of m[1].matchAll(/([A-Za-z_$][\w$]*)\s*[:,}]/g)) bound.add(k[1]);
        if ((n.type === "FunctionDeclaration" || n.type === "ClassDeclaration") && n.id) bound.add(n.id.name);
      }
      // rule 2: urls that a public function already wraps
      for (const m of block.content.matchAll(/url\s*:\s*["'`]([^"'`$]+)["'`]/g)) { const at = idx.urls.get(m[1]); if (at && !origSrc.includes(`"${m[1]}"`)) failed.push({ check: "imports", where: rel(f), hint: `页面里直接请求了 ${m[1]}，公共库已有封装（${at}）：删掉本地的请求函数，按 maps 导入` }); }
    }
    for (const nm of local) { const at = idx.publicNames.get(nm); if (at && !imported.has(nm) && pageOrder) warn(rel(f), `页面里定义了函数 ${nm}，公共库里有同名符号（${at}）：如果原 chunk 是从公共模块导入的，删掉本地定义并按 maps 导入；如果原 chunk 里本来就是本页自己的函数，改个不同的名字`); }

    // rule 3: components and directives resolved by name
    if (f.endsWith(".vue")) {
      const c = compileSfc(sfc, f);
      if (c.errors.length) continue; // compile errors are reported by the compile check
      const facts = renderFacts(c.code, compiledNameOf);
      const ok = (n) => VUE_BUILTIN_COMPONENTS.has(n) || reg.globals.components.includes(n) || reg.globals.components.includes(camel(n)) || reg.globals.componentPatterns.some((p) => new RegExp(p).test(n)) || [...imported, ...local, ...bound].some((l) => l === n || l === pascal(n) || l === camel(n));
      for (const n of new Set(facts.components)) if (!ok(n)) failed.push({ check: "imports", where: rel(f), hint: `模板用到组件 <${n}>，但既没有导入也不是全局组件（清单 globals）：按 maps 导入它；如果原包里它是全局组件而清单没有，写进回执 needsFromSkeleton` });
      for (const n of new Set(facts.directiveNames)) if (!reg.globals.directives.includes(n) && ![...local, ...imported, ...bound].includes(`v${pascal(camel(n))}`)) failed.push({ check: "imports", where: rel(f), hint: `模板用到指令 v-${n}，它不是全局指令（清单 globals.directives：${reg.globals.directives.join("、")}）` });
    }
  }

  // rule 4: what the branch changed in hmrsfw-vue
  if (pageOrder || order.type === "shared") {
    const { files: changed, base } = changedFiles(APP); stats.gitBase = base;
    if (changed) {
      const mine = (p) => (order.target && p === order.target) || (order.subComponentDir && p.startsWith(order.subComponentDir)) || files.some((f) => rel(f) === p);
      for (const p of changed) {
        if (mine(p)) continue;
        if (order.type === "shared" && (p.startsWith(`apps/${order.app}/src/shared/`) || p.startsWith(`apps/${order.app}/public/`))) continue;
        failed.push({ check: "imports", where: p, hint: `本单不能修改 ${p}${/\/(legacy|shared|api|utils)\/|package(-lock)?\.json$/.test(p) ? "（公共库文件只由入口包、共享组件工单修改）" : ""}：撤销这处改动；公共库缺东西写进回执 needsFromSkeleton` });
      }
    }
  }
  return { failed, stats, errors: failed.filter((x) => x.severity !== "warn").length };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const id = process.argv.slice(2).find((a, i, all) => !a.startsWith("--") && all[i - 1] !== "--app");
  const r = checkImports(loadOrder(id), appDir());
  console.log(JSON.stringify({ pass: !r.errors, failed: r.failed, stats: r.stats }, null, 1));
  process.exitCode = r.errors ? 1 : 0;
}
