// Static stage of the gate (docs/pipeline.md §7.3.1): the restorer's self-check (tools/self-check.mjs, owned by the
// self-check task; called as in §12: `self-check.mjs <work order id>` → {pass, failed:[{check, where, hint}]}) plus the
// zero-reference check, which belongs to the gate. Until self-check.mjs exists a placeholder compiles the page's SFCs.
import { execFile } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { promisify } from "node:util";
import { ROOT } from "./common.mjs";
import { scanNoLegacy } from "../check-no-legacy.mjs";

const run = promisify(execFile);

export function pageFiles(wo, appDir) {
  const files = [];
  if (wo.target) { const t = path.join(appDir, wo.target); if (existsSync(t)) files.push(t); }
  const walk = (d) => { for (const n of readdirSync(d)) { const p = path.join(d, n); if (statSync(p).isDirectory()) walk(p); else files.push(p); } };
  if (wo.subComponentDir) { const d = path.join(appDir, wo.subComponentDir); if (existsSync(d) && statSync(d).isDirectory()) walk(d); }
  return [...new Set(files)];
}

async function selfCheck(wo, appDir) {
  const script = path.join(ROOT, "tools/self-check.mjs");
  if (existsSync(script)) {
    let out;
    try { out = (await run(process.execPath, [script, wo.id, "--app", appDir], { cwd: ROOT, maxBuffer: 64 << 20, timeout: 300000 })).stdout; } catch (e) { out = e.stdout ?? ""; if (!out.trim()) return { impl: "self-check.mjs", failed: [{ check: "self-check", where: wo.id, hint: "self-check.mjs crashed: " + String(e.message).split("\n")[0].slice(0, 160) }] }; }
    const line = out.trim().split("\n").reverse().find((l) => l.startsWith("{"));
    const r = line ? JSON.parse(line) : { pass: false, failed: [{ check: "self-check", where: wo.id, hint: "no JSON output" }] };
    return { impl: "self-check.mjs", failed: r.pass ? [] : r.failed ?? [] };
  }
  // Placeholder: every .vue file of the page must parse and compile (script + template) with the app's compiler.
  const sfc = createRequire(path.join(appDir, "package.json"))("@vue/compiler-sfc");
  const failed = [];
  if (!wo.target || !existsSync(path.join(appDir, wo.target))) failed.push({ check: "exists", where: wo.target ?? wo.id, hint: "page file not found" });
  for (const f of pageFiles(wo, appDir).filter((x) => x.endsWith(".vue"))) {
    const rel = path.relative(appDir, f);
    try {
      const { descriptor, errors } = sfc.parse(readFileSync(f, "utf8"), { filename: f });
      if (errors.length) throw errors[0];
      if (descriptor.script || descriptor.scriptSetup) sfc.compileScript(descriptor, { id: "gate", inlineTemplate: true, isProd: true });
      else if (descriptor.template) { const r = sfc.compileTemplate({ source: descriptor.template.content, filename: f, id: "gate", isProd: true }); if (r.errors.length) throw r.errors[0]; }
    } catch (e) { failed.push({ check: "compile", where: rel, hint: String(e.message ?? e).split("\n")[0].slice(0, 200) }); }
  }
  if (!failed.length) failed.push(...textCheck(wo, appDir, sfc));
  return { impl: "placeholder", failed };
}

// Placeholder text check (until self-check.mjs brings check-text-nodes): every static text and placeholder/title/alt
// value in the page templates must occur in the original chunk's string literals, and every original string literal
// with Chinese text must occur in the page's files. Whitespace is ignored on both sides. Catches changed, added and
// deleted texts; hints name the file and the text's position only.
const babel = createRequire(path.join(ROOT, "package.json"))("@babel/parser");
function chunkStrings(file) {
  const ast = babel.parse(readFileSync(file, "utf8"), { sourceType: "module", plugins: ["topLevelAwait"], errorRecovery: true });
  const out = [];
  const visit = (n) => {
    if (!n || typeof n !== "object") return;
    if (Array.isArray(n)) { for (const x of n) visit(x); return; }
    if (n.type === "StringLiteral") out.push(n.value);
    else if (n.type === "TemplateElement") out.push(n.value.cooked ?? n.value.raw);
    for (const k in n) if (k !== "loc" && k !== "start" && k !== "end" && n[k] && typeof n[k] === "object") visit(n[k]);
  };
  visit(ast.program);
  return out;
}
const squash = (s) => s.replace(/\s+/g, "");
const decode = (s) => s.replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
function textCheck(wo, appDir, sfc) {
  const chunk = wo.sourceChunk && path.join(ROOT, wo.sourceChunk);
  if (!chunk || !existsSync(chunk)) return [];
  const lits = chunkStrings(chunk);
  const origAll = squash(lits.join("\u0000"));
  const files = pageFiles(wo, appDir).filter((f) => /\.(vue|ts|js)$/.test(f));
  const restAll = squash(decode(files.map((f) => readFileSync(f, "utf8")).join("\u0000")));
  const failed = [];
  for (const f of files.filter((x) => x.endsWith(".vue"))) {
    const { descriptor } = sfc.parse(readFileSync(f, "utf8"), { filename: f });
    if (!descriptor.template?.ast) continue;
    const walk = (n) => {
      if (n.type === 2) { const t = squash(decode(n.content)); if (t && !origAll.includes(t)) failed.push({ check: "text-nodes", where: `${path.relative(appDir, f)}:${n.loc.start.line}`, hint: "template text not found in the original chunk" }); }
      if (n.type === 1) for (const p of n.props) if (p.type === 6 && ["placeholder", "title", "alt"].includes(p.name) && p.value) { const t = squash(decode(p.value.content)); if (t && !origAll.includes(t)) failed.push({ check: "text-nodes", where: `${path.relative(appDir, f)}:${p.loc.start.line}`, hint: `${p.name} value not found in the original chunk` }); }
      for (const c of n.children ?? []) walk(c);
    };
    walk(descriptor.template.ast);
  }
  const missing = [...new Set(lits.filter((s) => /[一-鿿]/.test(s)).map(squash))].filter((t) => t && !restAll.includes(t));
  if (missing.length) failed.push({ check: "text-nodes", where: path.relative(appDir, wo.target ? path.join(appDir, wo.target) : appDir), hint: `${missing.length} Chinese string(s) of the original chunk missing from the page files` });
  return failed;
}

// mode "page": self-check + zero-reference on the page's own files; "integration": zero-reference over all of apps/.
export async function staticStage({ wos, appDir, mode }) {
  const t0 = Date.now();
  const failed = {}, impl = new Set();
  for (const wo of wos) {
    const sc = await selfCheck(wo, appDir);
    impl.add(sc.impl);
    failed[wo.id] = sc.failed.map((f) => ({ ...f, check: f.check ?? "self-check" }));
    if (mode === "page") {
      const z = scanNoLegacy({ root: appDir, files: pageFiles(wo, appDir) });
      for (const h of z.hits) failed[wo.id].push({ check: "no-legacy", where: h.file, hint: `${h.rule} ×${h.count}` });
    }
  }
  let global = [];
  if (mode === "integration") global = scanNoLegacy({ root: path.join(appDir, "apps") }).hits.map((h) => ({ check: "no-legacy", where: "apps/" + h.file, hint: `${h.rule} ×${h.count}` }));
  return { failed, global, impl: [...impl].join(","), ms: Date.now() - t0 };
}
