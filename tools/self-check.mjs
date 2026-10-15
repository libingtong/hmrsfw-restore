// Pre-delivery self-check of one work order (docs/pipeline.md §5, §12): the static checks a restorer runs before handing
// over, and the static stage of gate.mjs. Needs only this repo and the hmrsfw-vue checkout — no RESTORE_ASSETS, no HAR,
// no browser — so it runs on Office-Server too.
//
//   compile        @vue/compiler-sfc (hmrsfw-vue's own) parses and compiles every delivered SFC
//   components     as many .vue files as the chunk defines components (check-components.mjs)
//   text-nodes     static texts identical to the original render, spaces included (check-text-nodes.mjs)
//   directives     every withDirectives entry restored (check-directives.mjs)
//   imports        public library only through registry/<app>.json; nothing outside the order changed (check-imports.mjs)
//   copied         no code/CSS copied from the order's original chunks (check-copied.mjs)
//   secrets        no keys, tokens, phone or id numbers (scan-secrets.mjs)
//   no-legacy      zero references to the original build in the order's own files, comments included
//                  (check-no-legacy.mjs; the same scan the gate's static stage runs in page mode)
//   segments       a segment delivered its fragments; the assembling segment left no _seg/ behind
//   render-equiv   report only (reports.renderEquiv), never fails the check
//
// Usage: node tools/self-check.mjs <order id> [--app <hmrsfw-vue>] [--no-render-equiv]
// Output (stdout, one JSON document): {pass, failed:[{check, where, hint, severity?}], id, type, stats, reports}
//   pass is false when any item without severity "warn" is present; "warn" items should still be fixed (see hint).
// Exit code: 0 pass, 1 fail, 2 the check itself could not run (bad order id, missing checkout).
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parse } from "@babel/parser";
import { ROOT, SITES, chunkPath, importsOf } from "./scope.mjs";
import { compilerSfc, compileSfc, loadJson, loadOrder, orderFiles } from "./sfc-util.mjs";
import { checkComponents } from "./check-components.mjs";
import { checkTextNodes } from "./check-text-nodes.mjs";
import { checkDirectives } from "./check-directives.mjs";
import { checkImports } from "./check-imports.mjs";
import { indexArchive, scanFiles } from "./check-copied.mjs";
import { scanSecretFiles } from "./scan-secrets.mjs";
import { scanNoLegacy } from "./check-no-legacy.mjs";
import { renderEquiv } from "./render-equiv-confirm.mjs";
import { appDir } from "./app-dir.mjs";

const walk = (d) => existsSync(d) ? readdirSync(d).flatMap((n) => { const p = path.join(d, n); return statSync(p).isDirectory() ? walk(p) : [p]; }) : [];

// the original files a restoration may not copy from: the chunk, its CSS, and the chunks it imports (not entry/vue)
function archiveOf(order) {
  const site = order.site; const cfg = SITES[site]; const out = new Set();
  const chunks = order.sourceChunk ? [order.sourceChunk] : (order.chunks ?? []).map((c) => c.chunk);
  for (const c of chunks) {
    out.add(path.join(ROOT, c));
    const name = c.split("/").pop();
    if (name !== cfg.entry) for (const d of importsOf(site, name).static) if (d !== cfg.entry && d !== cfg.vue) out.add(path.join(ROOT, chunkPath(site, d)));
  }
  for (const css of order.cssCandidates ?? []) out.add(path.join(ROOT, css));
  if (order.type === "entry") { const css = path.join(ROOT, cfg.dir, "assets", cfg.entry.replace(/\.js$/, ".css")); if (existsSync(css)) out.add(css); }
  return [...out].filter((f) => existsSync(f));
}

export function selfCheck(order, APP, { renderEquivReport = true } = {}) {
  APP = path.resolve(APP);
  const failed = []; const stats = {}; const reports = {};
  const rel = (f) => path.relative(APP, f).split(path.sep).join("/");
  const sfc = compilerSfc(APP);
  const isSeg = order.type === "segment"; const partial = isSeg && !order.assemble;
  // the assembling segment is checked as the whole page
  const subject = isSeg && order.assemble ? { ...order, type: "page", range: null, components: loadOrderSafe(order.page)?.components ?? order.components } : order;

  // ---- which files ----
  let files;
  if (partial) files = (order.outputs ?? []).map((f) => path.join(APP, f)).filter(existsSync);
  else if (order.type === "entry") files = (order.files ?? []).map((f) => path.join(APP, f.replace(/\/$/, ""))).flatMap((f) => existsSync(f) && statSync(f).isDirectory() ? walk(f) : existsSync(f) ? [f] : []);
  else if (order.subtype === "modules") files = (order.files ?? []).map((f) => path.join(APP, f)).filter(existsSync);
  else files = orderFiles(subject, APP);
  stats.files = files.map(rel);
  if (!files.length) failed.push({ check: "compile", where: order.target ?? order.files?.[0] ?? order.id, hint: `没有找到本单要交付的文件（${partial ? (order.outputs ?? []).join("、") : order.target ?? (order.files ?? []).join("、")}）：确认写到了工单指定的路径，并且在 --app 指向的 hmrsfw-vue 检出里` });

  // ---- compile ----
  let compileOk = true;
  for (const f of files) {
    if (f.endsWith(".vue") || f.endsWith(".template.html")) {
      const c = compileSfc(sfc, f);
      for (const e of c.errors) { compileOk = false; failed.push({ check: "compile", where: rel(f), hint: `编译失败：${e.split("\n")[0].slice(0, 240)}。先修好这一处，其他检查依赖编译结果` }); }
    } else if (/\.(ts|js)$/.test(f)) {
      try { parse(readFileSync(f, "utf8"), { sourceType: "module", plugins: ["typescript", "topLevelAwait"] }); } catch (e) { compileOk = false; failed.push({ check: "compile", where: rel(f), hint: `脚本语法错误：${String(e.message).split("\n")[0]}` }); }
    }
  }

  // ---- segments ----
  if (isSeg) {
    for (const p of order.parts ?? []) if (partial && !existsSync(path.join(APP, p.file))) failed.push({ check: "segments", where: p.file, hint: `本分段要交付 ${p.file}（组件 ${p.component} 的 ${p.part === "script" ? "<script setup> 内容" : "<template> 内容"}），文件不存在` });
    if (order.assemble) { const segDir = path.join(APP, order.subComponentDir, "_seg"); if (existsSync(segDir)) failed.push({ check: "segments", where: rel(segDir), hint: `_seg/ 还在：先运行 node tools/assemble-segments.mjs ${order.page} --app "$HMRSFW_APP_DIR" 把片段合成 SFC` }); }
  }

  // ---- structure: components / text / directives (template-bearing orders only) ----
  const structural = compileOk && order.type !== "entry" && order.subtype !== "modules" && order.sourceChunk;
  if (order.type !== "entry" && order.subtype !== "modules") { const r = checkComponents(subject, APP, { files }); failed.push(...r.failed); stats.components = r.stats; }
  if (structural) {
    const maps = loadJson(subject.maps);
    const tFiles = files.filter((f) => f.endsWith(".vue") || f.endsWith(".template.html"));
    const t = checkTextNodes(subject, APP, { files: tFiles, maps }); failed.push(...t.failed); stats.textNodes = t.stats;
    const d = checkDirectives(subject, APP, { files: tFiles, maps }); failed.push(...d.failed); stats.directives = d.stats;
  }
  if (compileOk && order.type !== "entry") { const r = checkImports(subject, APP, { files: files.filter((f) => /\.(vue|ts)$/.test(f)) }); failed.push(...r.failed); stats.imports = r.stats; }

  // ---- copied / secrets ----
  const archive = archiveOf(order);
  if (archive.length && files.length) {
    const hits = scanFiles(files, indexArchive(archive, (p) => path.relative(ROOT, p)), rel);
    for (const h of hits.code) failed.push({ check: "copied", where: h.file, hint: h.kind === "whole-file" ? `整份文件与原包 ${h.archived} 相同：不能原样搬运编译产物，要还原成源码` : `有 ${h.hitWindows} 段（每段 160 字符）与原包相同：多半是原样拷贝的压缩代码、压缩 CSS 或内联 base64 图片。改写成可读源码；base64 图片抽成资源文件，样式由脚本写入` });
    for (const a of hits.assets) failed.push({ check: "copied", where: a.file, severity: "warn", hint: `资源文件与原包 ${a.archived} 相同：图片等资源可以复用，但要去掉文件名里的构建哈希并在资源清单登记` });
    stats.copiedArchive = archive.length;
  }
  // the order's files plus whatever else sits in its subComponentDir (assets): the files gate.mjs scans in page mode
  const own = order.type === "entry" || partial || !order.subComponentDir ? files : [...new Set([...files, ...walk(path.join(APP, order.subComponentDir))])];
  for (const h of scanNoLegacy({ root: APP, files: own }).hits) failed.push({ check: "no-legacy", where: h.file, hint: `${h.rule} ×${h.count}：源码、注释和资源文件名里不能出现原包路径（legacy-dist）、带构建哈希的文件名或编译产物；还原来源写进回执，不写进注释` });
  for (const h of scanSecretFiles(files, rel)) failed.push({ check: "secrets", where: `${h.file}:${h.line}`, hint: `命中规则 ${h.rule}：代码、注释、回执里不能出现密钥、token、手机号、证件号、邮箱等；密钥只从环境变量读取（import.meta.env），测试数据换成明显的假值` });

  // ---- report only ----
  if (renderEquivReport && structural && !partial && order.type !== "entry") reports.renderEquiv = renderEquiv(subject, APP, { files: files.filter((f) => f.endsWith(".vue")) });

  const errors = failed.filter((x) => x.severity !== "warn");
  return { pass: errors.length === 0, failed, id: order.id, type: order.type, stats, reports };
}

function loadOrderSafe(id) { try { return id ? loadOrder(id) : null; } catch { return null; } }

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const id = args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--app");
  let res;
  try {
    if (!id) throw new Error("usage: node tools/self-check.mjs <order id> [--app <hmrsfw-vue>] [--no-render-equiv]");
    res = selfCheck(loadOrder(id), appDir(), { renderEquivReport: !args.includes("--no-render-equiv") });
  } catch (e) { console.log(JSON.stringify({ pass: false, error: String(e.message ?? e), failed: [] })); process.exit(2); }
  console.log(JSON.stringify(res, null, 1));
  process.exitCode = res.pass ? 0 : 1;
}
