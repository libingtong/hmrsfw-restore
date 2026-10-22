// Reads the original-side coverage baseline.mjs writes (coverage.json next to baseline.json; tools/gate/coverage.mjs).
//   node tools/coverage.mjs report <工单id> [--dir <baseline dir>]      what the interaction script never reached, for the recorder
//   node tools/coverage.mjs summary [--root <dir>] [--ids a,b] [--min-function N --min-block N]
//                                                                      distribution over the baselines under <root>, pages below the thresholds
//   node tools/coverage.mjs datareq [--root <dir>] [--write]           test-data requests (D7) for pages below the thresholds
// <root> defaults to $RESTORE_BASELINE_ROOT, else $RESTORE_STATE/baseline; thresholds default to restore.config.json `coverage`.
// Output: one JSON document on stdout. Reads only; --write puts data-requirements.{json,md} under $RESTORE_STATE/coverage/.
// A page below the thresholds is closed one of two ways (docs/pipeline.md §6, recorder): an interaction the script lacks is
// added to tests/interact/<id>.json and the page re-recorded; a branch that does not render because the test environment
// has no such data goes into the data request (needs:"data"), which is handed to the project owner in one batch.
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { ROOT, flag, opt, positionals, stateDir } from "./gate/common.mjs";

export function thresholds(cfgFile = path.join(ROOT, "restore.config.json")) {
  const c = existsSync(cfgFile) ? JSON.parse(readFileSync(cfgFile, "utf8")).coverage : null;
  return c ? { minFunction: c.minFunction, minBlock: c.minBlock, requireStable: c.requireStable !== false } : null;
}

// → { below: bool, reasons: [] }. A page whose chunk was never loaded, or whose two replays disagree, cannot be trusted.
export function evaluate(cov, th) {
  const reasons = [];
  if (!th) return { below: false, reasons: ["no coverage thresholds in restore.config.json"] };
  if (!cov?.page?.loaded) return { below: true, reasons: ["page chunk not loaded during the replay"] };
  if (cov.page.function.pct < th.minFunction) reasons.push(`function ${cov.page.function.pct}% < ${th.minFunction}%`);
  if (cov.page.block.pct < th.minBlock) reasons.push(`block ${cov.page.block.pct}% < ${th.minBlock}%`);
  if (th.requireStable && cov.stable === false) reasons.push("coverage differs between the two replays");
  return { below: reasons.length > 0, reasons };
}

const baselineRoot = (argv) => path.resolve(opt(argv, "--root") ?? process.env.RESTORE_BASELINE_ROOT ?? path.join(stateDir(), "baseline"));
export function readCoverage(file) { return JSON.parse(readFileSync(file, "utf8")); }
export function loadAll(root, ids) {
  const out = [];
  for (const n of readdirSync(root).sort()) {
    if (ids && !ids.includes(n)) continue;
    const f = path.join(root, n, "coverage.json");
    if (existsSync(f)) out.push({ id: n, ...readCoverage(f) });
  }
  return out;
}

function hintLine(u) {
  const where = u.context.length ? u.context.join("/") : u.events.length ? "有事件的区块" : u.needs === "data" ? "条件/列表分支" : "函数或分支";
  const what = u.texts.length ? `，文案：${u.texts.slice(0, 5).join("、")}` : "";
  const ev = u.events.length ? `，事件：${u.events.join("、")}` : "";
  const how = u.needs === "interaction" ? "→ 补交互脚本触发" : u.needs === "data" ? "→ 多半缺数据（造数需求）" : "→ 先判断是否需要交互或数据";
  return `${where}${what}${ev} ${how}`;
}

export function report(cov, th) {
  const verdict = evaluate(cov, th);
  return {
    wo: cov.wo, page: cov.page, shared: cov.shared, stable: cov.stable, runs: cov.runs, thresholds: th, belowThreshold: verdict.below, reasons: verdict.reasons,
    uncovered: cov.uncovered.map((u) => ({ chunk: u.chunk, role: u.role, at: `${u.start}-${u.end} (line ${u.line}, col ${u.col})`, chars: u.chars, needs: u.needs, context: u.context, events: u.events, texts: u.texts, hint: hintLine(u), source: u.source })),
    truncated: cov.truncated,
  };
}

const q = (sorted, p) => sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(p * (sorted.length - 1) + 0.5))] : null;
function dist(values) {
  const v = [...values].sort((a, b) => a - b);
  const hist = {};
  for (const x of v) { const b = Math.min(90, Math.floor(x / 10) * 10); const k = `${b}-${b === 90 ? 100 : b + 10}`; hist[k] = (hist[k] ?? 0) + 1; }
  return { n: v.length, min: v[0] ?? null, p10: q(v, 0.1), p25: q(v, 0.25), median: q(v, 0.5), p75: q(v, 0.75), max: v[v.length - 1] ?? null, hist };
}

export function summary(all, th) {
  const loaded = all.filter((c) => c.page?.loaded);
  const rows = all.map((c) => ({ id: c.wo ?? c.id, route: c.recordPath, steps: c.steps, function: c.page?.loaded ? c.page.function.pct : null, block: c.page?.loaded ? c.page.block.pct : null, stable: c.stable, ...(th ? evaluate(c, th) : {}) }));
  return {
    pages: all.length, loaded: loaded.length, unstable: all.filter((c) => c.stable === false).map((c) => c.wo ?? c.id),
    function: dist(loaded.map((c) => c.page.function.pct)), block: dist(loaded.map((c) => c.page.block.pct)),
    thresholds: th, belowThreshold: th ? rows.filter((r) => r.below).length : null, rows,
  };
}

export function dataRequests(all, th) {
  const out = [];
  for (const c of all) {
    if (th && !evaluate(c, th).below) continue;
    const branches = c.uncovered.filter((u) => u.needs === "data" && u.role === "page").map((u) => ({ at: `${u.start}-${u.end}`, chars: u.chars, texts: u.texts, hint: hintLine(u), source: (u.source ?? "").slice(0, 120) }));
    if (!branches.length) continue;
    out.push({ wo: c.wo ?? c.id, site: c.site, route: c.recordPath, role: c.role, page: c.page && { function: c.page.function.pct, block: c.page.block.pct }, branches });
  }
  return out;
}

const toMd = (reqs) => ["# 造数需求清单（D7）", "", "下面的页面在原版基线回放里有分支没有渲染，多半是因为测试环境没有对应的数据。每条列出页面、身份、未渲染分支里的静态文案和代码起首（前端代码，不含任何账号或个人信息），供造数时对照。", "",
  ...reqs.flatMap((r) => [`## ${r.wo} ${r.route}（${r.site}，身份 ${r.role ?? "-"}；函数 ${r.page?.function}%，块 ${r.page?.block}%）`, ...r.branches.map((b) => `- 分支 ${b.at}（${b.chars} 字符）：${b.hint}\n  - 代码起首：\`${b.source}\``), ""])].join("\n");

async function main() {
  const argv = process.argv.slice(2);
  const [cmd, id] = positionals(argv, ["--dir", "--root", "--ids", "--min-function", "--min-block"]);
  const cfg = thresholds();
  const th = opt(argv, "--min-function") != null || opt(argv, "--min-block") != null
    ? { minFunction: Number(opt(argv, "--min-function", cfg?.minFunction ?? 0)), minBlock: Number(opt(argv, "--min-block", cfg?.minBlock ?? 0)), requireStable: cfg?.requireStable ?? true } : cfg;
  if (cmd === "report") {
    if (!id) throw new Error("usage: coverage.mjs report <工单id> [--dir <baseline dir>]");
    const dir = path.resolve(opt(argv, "--dir") ?? path.join(baselineRoot(argv), id));
    const f = path.join(dir, "coverage.json");
    if (!existsSync(f)) throw new Error(`no coverage.json in ${dir} (run tools/baseline.mjs ${id} first)`);
    return report(readCoverage(f), th);
  }
  if (cmd === "summary") return summary(loadAll(baselineRoot(argv), opt(argv, "--ids")?.split(",")), th);
  if (cmd === "datareq") {
    const reqs = dataRequests(loadAll(baselineRoot(argv), opt(argv, "--ids")?.split(",")), th);
    const res = { count: reqs.length, branches: reqs.reduce((n, r) => n + r.branches.length, 0), requests: reqs };
    if (flag(argv, "--write")) {
      const dir = path.join(stateDir(), "coverage");
      mkdirSync(dir, { recursive: true });
      for (const [name, body] of [["data-requirements.json", JSON.stringify(res, null, 1)], ["data-requirements.md", toMd(reqs)]]) { writeFileSync(path.join(dir, name + ".tmp"), body); renameSync(path.join(dir, name + ".tmp"), path.join(dir, name)); }
      res.written = dir;
    }
    return res;
  }
  throw new Error("usage: coverage.mjs report <工单id> | summary | datareq [--write]");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().then((r) => { console.log(JSON.stringify(r, null, 1)); }, (e) => { console.log(JSON.stringify({ ok: false, error: String(e.message).slice(0, 300) })); process.exitCode = 1; });
}
