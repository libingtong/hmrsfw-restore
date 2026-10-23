// Readability check (HM-19, docs/readability.md): independent of the equivalence gate. A page can be green against the
// original and still look like a minified bundle; this check looks only at names, structure and layout of the restored
// sources. It is the `readability` item of self-check.mjs; rules and thresholds live in rules/readability.json.
//
//   identifiers   no 1–2 character or hash-like names (whitelist in the rules file), no original minified symbol of the
//                 public-library registry (L, bb …) used as a name
//   render        no hand-written h() / render() / JSX, no createVNode-style imports
//   traces        no compiler output (_ctx, _cache, _hoisted_N, _createElementVNode, $setup, __name …)
//   dead-branch   no v-if="false" / v-else-if="false"
//   size          file, function and setup() length limits
//   eslint        eslint-plugin-vue "recommended" with hmrsfw-vue's own eslint.config.js (async)
//   prettier      format check with hmrsfw-vue's own .prettierrc.json (async)
//
// mode "report" (rules file): every item carries severity "warn" — self-check still passes. mode "block": no severity,
// any item fails self-check. Items are {check:"readability", where:"<file>:<line>", hint}; the hint says what to change.
//
// Usage: node tools/check-readability.mjs --app <hmrsfw-vue> <file.vue|file.ts>... [--rules <file>] [--mode report|block]
//        node tools/check-readability.mjs --app <hmrsfw-vue> --orders <order id>...      (the files of those work orders)
//        node tools/check-readability.mjs --app <hmrsfw-vue> --regression               (every accepted page: calibration)
//   --report prints the per-file metrics and the distribution (percentiles) instead of the items.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parse } from "@babel/parser";
import traverseModule from "@babel/traverse";
import { ROOT } from "./scope.mjs";
import { compilerSfc, loadOrder, orderFiles } from "./sfc-util.mjs";
import { loadWorkOrders } from "./lib/workorders.mjs";
import { appDir } from "./app-dir.mjs";

const traverse = traverseModule.default ?? traverseModule;
export const RULES_FILE = path.join(ROOT, "rules", "readability.json");
export const loadRules = (file = RULES_FILE) => JSON.parse(readFileSync(file, "utf8"));

// the commonly generated names of Vue's render helpers, imported from "vue": using them by hand means a render function
const RENDER_IMPORTS = new Set(["h", "createVNode", "createElementVNode", "createElementBlock", "createBlock", "createCommentVNode", "createTextVNode", "createStaticVNode", "openBlock", "withCtx", "withDirectives", "renderList", "renderSlot", "resolveComponent", "resolveDirective", "resolveDynamicComponent", "mergeProps", "toDisplayString", "normalizeClass", "normalizeStyle"]);
const sev = (rules) => (rules.mode === "block" ? {} : { severity: "warn" });
const rel = (APP, f) => path.relative(APP, f).split(path.sep).join("/");
const lineCount = (s) => (s.length ? s.split("\n").length - (s.endsWith("\n") ? 1 : 0) : 0);
const lineOf = (text, offset) => { let n = 1; for (let i = 0; i < offset && i < text.length; i++) if (text.charCodeAt(i) === 10) n++; return n; };
const list = (xs, max = 8) => xs.slice(0, max).join("、") + (xs.length > max ? `……共 ${xs.length} 处` : "");

// ---- registry: original minified symbol → readable names -------------------------------------------------------------
const registryCache = new Map();
export function registryOriginals(app, root = ROOT) {
  const k = `${root}|${app}`; if (registryCache.has(k)) return registryCache.get(k);
  const f = path.join(root, "registry", `${app}.json`); const map = new Map();
  const add = (alias, name) => { if (!alias || !name || name === "default" || alias === name) return; if (!map.has(alias)) map.set(alias, new Set()); map.get(alias).add(name); };
  if (existsSync(f)) {
    const r = JSON.parse(readFileSync(f, "utf8"));
    for (const [a, v] of Object.entries(r.vue ?? {})) add(a, v.name);
    for (const [a, v] of Object.entries(r.entry ?? {})) add(a, v.export);
    for (const v of Object.values(r.shared ?? {})) for (const [a, x] of Object.entries(v.exports ?? {})) add(a, x.export);
    for (const [k2, v] of Object.entries(r.api ?? {})) add(k2.split("#")[1], v.export);
    for (const v of Object.values(r.modules ?? {})) for (const [a, x] of Object.entries(v.exports ?? {})) add(a, x.export);
  }
  registryCache.set(k, map); return map;
}
const appOfFile = (APP, f) => f.split(path.sep).join("/").match(/(?:^|\/)(?:apps\/)?(portal|uc)\/src\//)?.[1] ?? null; // also the POC trees (restore-s/uc/src/…)

// ---- the parts of an SFC / TS file --------------------------------------------------------------------------------------
function blocksOf(sfc, file, src) {
  if (!file.endsWith(".vue")) return { scripts: [{ code: src, line0: 0, lang: "ts", setup: false }], template: null, descriptor: null };
  const { descriptor, errors } = sfc.parse(src, { filename: file });
  if (errors.length) return { scripts: [], template: null, descriptor: null, error: String(errors[0].message ?? errors[0]) };
  const scripts = [descriptor.script, descriptor.scriptSetup].filter(Boolean).map((b) => ({ code: b.content, line0: b.loc.start.line - 1, lang: b.lang ?? "js", setup: b === descriptor.scriptSetup }));
  return { scripts, template: descriptor.template?.ast ?? null, descriptor };
}
const babelParse = (code, lang) => parse(code, { sourceType: "module", errorRecovery: true, plugins: [...(/^(ts|tsx)$/.test(lang) ? ["typescript"] : []), ...(/^(jsx|tsx)$/.test(lang) ? ["jsx"] : []), "topLevelAwait"] });

// names declared by an arrow-parameter list written as text (`{ row, index }`, `scope`, `item, i`) with their kind
function paramNames(text) {
  try { const ast = parse(`(${text}) => 0`, { sourceType: "module", plugins: ["typescript"] }); const out = []; traverse(ast, { ArrowFunctionExpression(p) { for (const [n, b] of Object.entries(p.scope.bindings)) out.push({ name: n, kind: "param" }); p.stop(); } }); return out; } catch { return []; }
}

// ---- the checks --------------------------------------------------------------------------------------------------------
function identifierProblems(name, kind, rules, originals) {
  const id = rules.identifiers; const bare = name.replace(/^_+|_+$/g, "");
  if (bare === "") return null; // _, __ : "unused"
  if (kind !== "module" && id.allow.includes(bare)) return null;
  const reg = id.registryOriginals && originals?.get(name);
  const short = bare.length < id.minLength;
  const hash = (id.hashLike ?? []).some((p) => new RegExp(p).test(name));
  if (!short && !hash && !reg) return null;
  return reg ? `和原压缩包的符号名 ${name} 同名${reg.size > 2 ? `（清单里有 ${reg.size} 个不同的符号用过它）` : `（清单里对应 ${list([...reg], 2)}）`}` : hash ? "像压缩或编译生成的名字" : `只有 ${bare.length} 个字符`;
}

export function checkSource(file, src, { APP, rules, sfc, originals, onMetrics } = {}) {
  const failed = []; const S = sev(rules); const where = rel(APP, file); const lines = lineCount(src);
  const push = (line, hint, extra = {}) => failed.push({ check: "readability", where: `${where}:${line}`, hint, ...S, ...extra });
  const metrics = { file: where, lines, setupLines: 0, maxFunctionLines: 0, functions: 0, identifiers: 0, badIdentifiers: 0, renderFns: 0, traces: 0, deadBranches: 0 };
  const { scripts, template, descriptor, error } = blocksOf(sfc, file, src);
  if (error) { onMetrics?.(metrics); return failed; } // a file that does not parse is the compile check's business

  // -- identifiers (script) --
  const bad = [];
  const seenScopes = new Set();
  for (const sc of scripts) {
    let ast; try { ast = babelParse(sc.code, sc.lang); } catch { continue; }
    const imported = new Map(); // local name → source module
    const renderHits = [];
    const fnLens = [];
    traverse(ast, {
      Scopable(p) {
        if (seenScopes.has(p.scope.uid + "|" + sc.line0)) return; seenScopes.add(p.scope.uid + "|" + sc.line0);
        for (const [name, b] of Object.entries(p.scope.bindings)) {
          if (b.kind === "unknown" && b.path.isTSTypeParameter?.()) continue;
          if (b.path.node.type?.startsWith("TS") && !b.path.isTSEnumDeclaration()) continue; // type names are not run-time identifiers
          metrics.identifiers++;
          let why = identifierProblems(name, b.kind, rules, originals);
          const from = b.kind === "module" ? b.path.node.imported?.name ?? b.path.node.imported?.value : null;
          if (why && from && from !== name && from !== "default" && from.length >= rules.identifiers.minLength) why += `；它 import 的是 ${from}，去掉 \`as ${name}\` 直接用这个名字`;
          if (why) bad.push({ name, line: (b.identifier.loc?.start.line ?? 1) + sc.line0, why, kind: b.kind });
        }
      },
      ImportDeclaration(p) { for (const s of p.node.specifiers) imported.set(s.local.name, p.node.source.value); },
      Function(p) {
        const n = p.node; if (!n.loc) return;
        const len = n.loc.end.line - n.loc.start.line + 1;
        const name = n.id?.name || (p.parent.type === "VariableDeclarator" && p.parent.id?.name) || (p.parent.type === "AssignmentExpression" && p.parent.left?.name) || p.parent.key?.name || (p.parent.type === "CallExpression" ? "(回调)" : "(匿名函数)");
        fnLens.push({ name, line: n.loc.start.line + sc.line0, len }); metrics.functions++;
        if (!sc.setup && p.parent.key?.name === "setup") metrics.setupLines = Math.max(metrics.setupLines, len);
      },
      CallExpression(p) { const c = p.node.callee; if (c.type === "Identifier" && imported.get(c.name) === "vue" && RENDER_IMPORTS.has(p.scope.getBinding(c.name)?.path.node.imported?.name ?? c.name)) renderHits.push({ line: c.loc.start.line + sc.line0, what: `${c.name}()` }); },
      ObjectProperty(p) { if (p.node.key.name === "render" && !p.node.computed && /Function/.test(p.node.value.type)) renderHits.push({ line: p.node.loc.start.line + sc.line0, what: "render 选项" }); },
      ObjectMethod(p) { if (p.node.key.name === "render" && !p.node.computed) renderHits.push({ line: p.node.loc.start.line + sc.line0, what: "render() 方法" }); },
      JSXElement(p) { renderHits.push({ line: p.node.loc.start.line + sc.line0, what: "JSX" }); p.skip(); },
    });
    if (rules.forbidden.renderFunctions) {
      for (const [local, from] of imported) if (from === "vue" && RENDER_IMPORTS.has(local) && !renderHits.some((h) => h.what.startsWith(local))) { /* imported but unused is not a render function */ }
      if (renderHits.length) { metrics.renderFns += renderHits.length; push(renderHits[0].line, `手写渲染函数：${list(renderHits.map((h) => `${h.what}（第 ${h.line} 行）`), 5)}。页面不写 h() / render 函数 / JSX，改成 <template>（v-for、v-if、插槽都有对应写法）；模板文本逐字、scope.row 前缀等等价规则不变`); }
    }
    // setup length: <script setup> is one big setup
    if (sc.setup) metrics.setupLines = Math.max(metrics.setupLines, lineCount(sc.code.replace(/^\n+|\s+$/g, "")));
    const big = fnLens.filter((f) => f.len > rules.thresholds.functionLines).sort((a, b) => b.len - a.len);
    metrics.maxFunctionLines = Math.max(metrics.maxFunctionLines, ...fnLens.map((f) => f.len), 0);
    for (const f of big.slice(0, 5)) push(f.line, `函数 ${f.name} 有 ${f.len} 行，超过上限 ${rules.thresholds.functionLines}。按职责拆成几个有名字的小函数（取数、转换、提交各一个），不要把整段逻辑堆在一个函数里`);
  }
  // -- identifiers (template: v-for aliases and slot params) --
  const walk = (n, fn) => { fn(n); for (const c of n.children ?? []) if (c && typeof c === "object") walk(c, fn); };
  if (template) walk(template, (n) => {
    if (n.type !== 1) return;
    for (const p of n.props ?? []) {
      if (p.type !== 7) continue;
      const names = [];
      if (p.name === "for" && p.exp?.content) { const left = p.exp.content.match(/^([\s\S]*?)\s+(?:in|of)\s+[\s\S]*$/)?.[1]?.trim(); if (left) names.push(...paramNames(left.replace(/^\(([\s\S]*)\)$/, "$1"))); } // the parsed AST has the raw `(item, index) in list`
      else if (p.name === "slot" && p.exp?.content) names.push(...paramNames(p.exp.content));
      for (const { name, kind } of names) { metrics.identifiers++; const why = identifierProblems(name, kind, rules, originals); if (why) bad.push({ name, line: p.loc.start.line, why, kind: "template", tmpl: true }); }
      if (rules.forbidden.vIfFalse && (p.name === "if" || p.name === "else-if") && /^\s*(false|!1)\s*$/.test(p.exp?.content ?? "")) { metrics.deadBranches++; push(p.loc.start.line, `v-${p.name}="${p.exp.content.trim()}" 是死分支：这块内容永远不会渲染，删掉它（连同里面的子节点）；不要为了凑原 render 的形状留着`); }
    }
  });
  if (bad.length) {
    metrics.badIdentifiers = bad.length;
    const byName = new Map(); for (const b of bad) { if (!byName.has(b.name)) byName.set(b.name, { ...b, count: 0 }); byName.get(b.name).count++; }
    const items = [...byName.values()].map((b) => `${b.name}（第 ${b.line} 行${b.count > 1 ? `等 ${b.count} 处` : ""}，${b.why}）`);
    push(Math.min(...bad.map((b) => b.line)), `${bad.length} 处标识符名字不可读：${list(items, 10)}。按它在业务里的含义改成完整的英文名（如 list / pageSize / selectedRow / getDictListByType）；import 进来的符号用清单 maps 里的 export 名，需要换名就 \`as\` 成可读名。白名单（i、j、k、e、_ 等）见 rules/readability.json`);
  }
  // -- compile traces (whole file, comments included) --
  if (rules.forbidden.compileTraces?.length) {
    const hits = [];
    // provenance comments may name the original (`__name: index`, `data-v-…`); only code is scanned, so blank comments out first
    const code = src.replace(/\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, " ")).replace(/^([ \t]*)\/\/.*$/gm, (m) => " ".repeat(m.length));
    for (const t of rules.forbidden.compileTraces) { const re = new RegExp(t.pattern, "g"); const found = [...code.matchAll(re)]; if (found.length) hits.push({ ...t, count: found.length, line: lineOf(code, found[0].index), first: found[0][0] }); }
    if (hits.length) { metrics.traces = hits.reduce((s, h) => s + h.count, 0); push(Math.min(...hits.map((h) => h.line)), `编译产物的痕迹：${hits.map((h) => `${h.first} ×${h.count}（第 ${h.line} 行起）`).join("、")}。${hits[0].hint}${hits.length > 1 ? `；其余同理：${hits.slice(1).map((h) => h.hint).join("；")}` : ""}`); }
  }
  // -- size --
  if (lines > rules.thresholds.fileLines) push(1, `文件有 ${lines} 行，超过上限 ${rules.thresholds.fileLines}。把页面里相对独立的块拆成子组件（放在页面的 subComponentDir 里），样式、常量、接口调用各归各处`);
  if (metrics.setupLines > rules.thresholds.setupLines) { const sl = scripts.find((s) => s.setup)?.line0 ?? 0; push(sl + 1, `setup 有 ${metrics.setupLines} 行，超过上限 ${rules.thresholds.setupLines}。把状态和方法按功能拆成组合式函数（useXxx）或子组件，setup 里只留装配`); }
  onMetrics?.(metrics);
  return failed;
}

// ---- ESLint and Prettier of the app (async: both APIs are promise based) ---------------------------------------------------
const requireFromApp = (APP) => createRequire(path.join(APP, "package.json"));
export async function lintFiles(files, { APP, rules }) {
  const failed = []; const S = sev(rules); const R = requireFromApp(APP);
  const env = (what, hint) => failed.push({ check: "readability", where: `(${what})`, hint, severity: "warn" });
  const max = rules.lint.maxItemsPerFile ?? 12;
  const codeFiles = files.filter((f) => /\.(vue|ts)$/.test(f) && existsSync(f));
  if (rules.lint.eslint && codeFiles.length) {
    try {
      const { ESLint } = R("eslint");
      if (!existsSync(path.join(APP, "eslint.config.js"))) throw new Error("hmrsfw-vue 里没有 eslint.config.js");
      const results = await new ESLint({ cwd: APP }).lintFiles(codeFiles);
      for (const res of results) {
        const f = rel(APP, res.filePath); const byRule = new Map();
        for (const m of res.messages) { const k = m.ruleId ?? "parse"; if (!byRule.has(k)) byRule.set(k, []); byRule.get(k).push(m); }
        const groups = [...byRule].sort((a, b) => a[1][0].line - b[1][0].line);
        for (const [ruleId, ms] of groups.slice(0, max)) failed.push({ check: "readability", where: `${f}:${ms[0].line}`, ...S, hint: `eslint ${ruleId}${ms.length > 1 ? ` ×${ms.length}` : ""}：${ms[0].message}${ms.length > 1 ? `（第 ${ms.slice(0, 6).map((m) => m.line).join("、")} 行${ms.length > 6 ? "等" : ""}）` : ""}。${ruleId.startsWith("vue/") ? `规则说明：https://eslint.vuejs.org/rules/${ruleId.slice(4)}.html；` : ""}在 hmrsfw-vue 目录运行 \`npx eslint ${f}\` 看全部` });
        if (groups.length > max) failed.push({ check: "readability", where: f, ...S, hint: `eslint 另有 ${groups.length - max} 条规则的问题没有逐条列出：在 hmrsfw-vue 目录运行 \`npx eslint ${f}\`` });
      }
    } catch (e) { env("eslint", `eslint 没有跑起来：${String(e.message ?? e).split("\n")[0]}。hmrsfw-vue 需要 eslint、eslint-plugin-vue 等 devDependencies（node tools/setup-workdir.mjs --app …）；本次没有 eslint 结果`); }
  }
  if (rules.lint.prettier && codeFiles.length) {
    try {
      const prettier = R("prettier");
      for (const file of codeFiles) {
        const src = readFileSync(file, "utf8"); const f = rel(APP, file);
        if (await prettier.getFileInfo(file, { ignorePath: path.join(APP, ".prettierignore") }).then((i) => i.ignored)) continue;
        const opts = (await prettier.resolveConfig(file)) ?? {};
        const out = await prettier.format(src, { ...opts, filepath: file });
        if (out === src) continue;
        const a = src.split("\n"), b = out.split("\n"); let first = 0; while (first < a.length && a[first] === b[first]) first++;
        let diff = 0; for (let i = 0; i < Math.max(a.length, b.length); i++) if (a[i] !== b[i]) diff++;
        failed.push({ check: "readability", where: `${f}:${first + 1}`, ...S, hint: `prettier 格式不一致：从第 ${first + 1} 行起有差异（约 ${diff} 行）。在 hmrsfw-vue 目录运行 \`npx prettier --write ${f}\`，然后重跑 self-check 确认 text-nodes、directives 仍然通过（配置 .prettierrc.json 用 htmlWhitespaceSensitivity: strict，不改模板空白）` });
      }
    } catch (e) { env("prettier", `prettier 没有跑起来：${String(e.message ?? e).split("\n")[0]}。hmrsfw-vue 需要 prettier devDependency；本次没有格式检查结果`); }
  }
  return failed;
}

// ---- entry points ----------------------------------------------------------------------------------------------------------
// sync part: names, structure, traces, size (what self-check's sync API runs)
export function checkReadability(files, APP, { rules = loadRules(), metrics = [] } = {}) {
  APP = path.resolve(APP); const sfc = compilerSfc(APP); const failed = [];
  for (const file of files.filter((f) => /\.(vue|ts)$/.test(f) && existsSync(f))) {
    const originals = registryOriginals(appOfFile(APP, file) ?? "");
    failed.push(...checkSource(file, readFileSync(file, "utf8"), { APP, rules, sfc, originals, onMetrics: (m) => metrics.push(m) }));
  }
  return { failed, stats: { files: metrics.length, items: failed.length, mode: rules.mode } };
}
// the whole check: the sync part plus ESLint and Prettier
export async function checkReadabilityFull(files, APP, opts = {}) {
  const rules = opts.rules ?? loadRules(); const metrics = opts.metrics ?? [];
  const r = checkReadability(files, APP, { rules, metrics });
  const lint = await lintFiles(files, { APP: path.resolve(APP), rules });
  return { failed: [...r.failed, ...lint], stats: { ...r.stats, items: r.failed.length + lint.length } };
}

const pct = (xs, p) => { if (!xs.length) return 0; const s = [...xs].sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.ceil((p / 100) * s.length) - 1)]; };
export function distribution(metrics) {
  const col = (k) => metrics.map((m) => m[k]);
  const row = (k) => ({ metric: k, p50: pct(col(k), 50), p75: pct(col(k), 75), p90: pct(col(k), 90), p95: pct(col(k), 95), max: Math.max(0, ...col(k)) });
  return ["lines", "setupLines", "maxFunctionLines", "functions", "badIdentifiers", "renderFns", "traces", "deadBranches"].map(row);
}

const walkDir = (d) => existsSync(d) ? readdirSync(d).flatMap((n) => { const p = path.join(d, n); return statSync(p).isDirectory() ? walkDir(p) : [p]; }) : [];
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const argv = process.argv.slice(2); const flag = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : undefined; };
  try {
    const APP = appDir(argv); const rules = loadRules(flag("--rules") ?? RULES_FILE); if (flag("--mode")) rules.mode = flag("--mode");
    const VALUED = ["--app", "--rules", "--mode"];
    const pos = argv.filter((a, i) => !a.startsWith("--") && !VALUED.includes(argv[i - 1]));
    let files;
    if (argv.includes("--regression")) files = [...new Set(loadWorkOrders().filter((w) => w.type === "page" && w.status === "regression").flatMap((w) => orderFiles(w, APP)))];
    else if (argv.includes("--orders")) files = [...new Set(pos.flatMap((id) => orderFiles(loadOrder(id), APP)))];
    else files = pos.map((f) => (existsSync(path.resolve(f)) ? path.resolve(f) : path.resolve(APP, f))).flatMap((f) => (existsSync(f) && statSync(f).isDirectory() ? walkDir(f) : [f]));
    const metrics = [];
    const res = argv.includes("--no-lint") ? checkReadability(files, APP, { rules, metrics }) : await checkReadabilityFull(files, APP, { rules, metrics });
    if (argv.includes("--report")) console.log(JSON.stringify({ mode: rules.mode, thresholds: rules.thresholds, files: metrics.length, distribution: distribution(metrics), metrics, items: res.failed.length }, null, 1));
    else console.log(JSON.stringify({ pass: res.failed.every((f) => f.severity === "warn"), failed: res.failed, stats: res.stats }, null, 1));
    process.exitCode = res.failed.some((f) => f.severity !== "warn") ? 1 : 0;
  } catch (e) { console.log(JSON.stringify({ pass: false, error: String(e.message ?? e), failed: [] })); process.exitCode = 2; }
}
