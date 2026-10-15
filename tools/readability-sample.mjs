// Manual readability sampling (HM-19, docs/readability.md): after every integration regression the dispatcher picks 5 % of the
// pages that passed in this batch (at least one), stratified by size band and by the model family that generated them, and
// posts the list plus a scoring table (naming / structure / understandability, 1–5 each) to the 「调度日志」 task, where 李炳通
// looks at a few. Low scores flow back into rule improvements (`summary`).
//
//   sample   pick and post a sample          readability-sample.mjs sample --pages <wo,wo,…|regression> --app <hmrsfw-vue>
//                                              [--key <batch key>] [--rate 0.05] [--min 1] [--families <wo=family,…|file.json>]
//                                              [--ref <sha>] [--log-issue <id>] [--dry-run]
//   score    record one page's scores        readability-sample.mjs score <key> <wo> <命名> <结构> <可理解性> [备注]
//   summary  low scores → rule candidates    readability-sample.mjs summary [<key>|--all] [--post] [--log-issue <id>]
//
// The sample is systematic over the pages sorted by (size band, family, id) with a start point drawn from the key: every band
// and family is hit in proportion to its size, and the same key always gives the same sample. Pages are read from the
// --app checkout; the machine metrics next to each page (lines, setup length, names the readability check flags) come from
// the same code as the self-check item, so the reviewer sees where the rules and the human reading disagree.
// --dry-run: print the sample (and the Multica command it would issue); write nothing, post nothing.
// State: $RESTORE_STATE/readability/<key>.json.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { appDir } from "./app-dir.mjs";
import { orderFiles } from "./sfc-util.mjs";
import { checkReadability, loadRules } from "./check-readability.mjs";
import { isPage, loadWorkOrders } from "./lib/workorders.mjs";
import { Multica } from "./lib/multica.mjs";
import { P, readJson, stateDir, writeJson } from "./lib/state.mjs";

export const DIMENSIONS = ["命名", "结构", "可理解性"];
export const LOW = 2; // a score of 1–2 in any dimension flows back into the rules
export const bandOf = (kb) => (kb < 5 ? "simple" : kb < 30 ? "medium" : "large"); // same bands as the scheduler (docs/scheduler.md)

// small seeded generator: the same key gives the same start point
function rng(seed) { let a = parseInt(createHash("sha256").update(String(seed)).digest("hex").slice(0, 8), 16) >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// pages: [{wo, kb, family, ...}] → the sampled ones (systematic sampling over the stratum order)
export function pickSample(pages, { rate = 0.05, min = 1, key = "" } = {}) {
  const N = pages.length; if (!N) return { n: 0, picked: [], strata: {} };
  const n = Math.min(N, Math.max(min, Math.ceil(rate * N - 1e-9)));
  const sorted = [...pages].map((p) => ({ ...p, band: p.band ?? bandOf(p.kb ?? 0), family: p.family ?? "unknown" })).sort((a, b) => a.band.localeCompare(b.band) || a.family.localeCompare(b.family) || a.wo.localeCompare(b.wo));
  const step = N / n; const start = rng(key)() * step; const picked = [];
  for (let i = 0; i < n; i++) picked.push(sorted[Math.min(N - 1, Math.floor(start + i * step))]);
  const strata = {}; for (const p of sorted) { const k = `${p.band}/${p.family}`; strata[k] ??= { pages: 0, picked: 0 }; strata[k].pages++; }
  for (const p of picked) strata[`${p.band}/${p.family}`].picked++;
  return { n, picked, strata };
}

// machine view of one page: the same numbers the self-check item is made of
export function pageMetrics(order, APP, rules = loadRules()) {
  try {
    const metrics = []; const files = orderFiles(order, APP);
    const r = checkReadability(files, APP, { rules, metrics });
    return { files: files.map((f) => path.relative(APP, f).split(path.sep).join("/")), lines: metrics.reduce((s, m) => s + m.lines, 0), setupLines: Math.max(0, ...metrics.map((m) => m.setupLines)), badIdentifiers: metrics.reduce((s, m) => s + m.badIdentifiers, 0), items: r.failed.length };
  } catch (e) { return { error: String(e.message ?? e).split("\n")[0] }; }
}

export function renderSample({ key, batch, picked, n, N, strata, rate }, { ref } = {}) {
  const at = ref ? `@${ref.slice(0, 8)}` : "";
  const lines = [
    `## 可读性抽检 \`${key}\``, "",
    `本批通过的页面 ${N} 页，按 ${Math.round(rate * 100)}% 抽 ${n} 页（至少 1 页），按大小分档 × 生成模型家族分层。${batch ? `批次：${batch}。` : ""}请抽看下面的页面，在表里打分（1–5，5 最好）。`, "",
    `| 页面 | 档 | 模型家族 | 文件${at ? `（hmrsfw-vue${at}）` : ""} | 行数 | setup 行数 | 可读性检查命中（命名 / 结构，不含 eslint、prettier） |`, "| --- | --- | --- | --- | --- | --- | --- |",
    ...picked.map((p) => `| \`${p.wo}\` | ${p.band}（${p.kb ?? "?"}KB） | ${p.family} | ${p.metrics?.files?.[0] ? `\`${p.metrics.files[0]}\`${(p.metrics.files.length > 1) ? ` 等 ${p.metrics.files.length} 个` : ""}` : "-"} | ${p.metrics?.lines ?? "-"} | ${p.metrics?.setupLines ?? "-"} | ${p.metrics?.error ? "（未能计算）" : `${p.metrics?.items ?? "-"} 项${p.metrics?.badIdentifiers ? `，其中不可读名字 ${p.metrics.badIdentifiers} 处` : ""}`} |`), "",
    "分层情况：" + Object.entries(strata).map(([k, v]) => `${k} ${v.picked}/${v.pages}`).join("；"), "",
    `### 评分表`, "", `| 页面 | ${DIMENSIONS.map((d) => `${d}（1–5）`).join(" | ")} | 备注 |`, `| --- | ${DIMENSIONS.map(() => "---").join(" | ")} | --- |`,
    ...picked.map((p) => `| \`${p.wo}\` | | | | |`), "",
    `评分登记：\`node tools/readability-sample.mjs score ${key} <工单id> <命名> <结构> <可理解性> [备注]\`；任一项 ≤ ${LOW} 的会进入 \`summary\`，对照可读性检查的命中情况整理成规则改进（走规则变更单）。`,
  ];
  return lines.join("\n");
}

// ---- pipeline entry: used by tick.mjs after an integration regression -------------------------------------------------------
export function sampleBatch({ pages, key, batch, APP, rate = 0.05, min = 1, ref, orders = loadWorkOrders(), rules = loadRules(), dryRun = false, root }) {
  const byId = new Map(orders.map((o) => [o.id, o]));
  const rows = pages.filter((p) => byId.has(p.wo) && isPage(byId.get(p.wo))).map((p) => ({ ...p, kb: byId.get(p.wo).kb ?? 0 }));
  const { n, picked, strata } = pickSample(rows, { rate, min, key });
  for (const p of picked) p.metrics = APP ? pageMetrics(byId.get(p.wo), APP, rules) : null;
  const sample = { key, batch, rate, N: rows.length, n, picked, strata, ref: ref ?? null, at: new Date().toISOString() };
  if (!dryRun && n) writeJson(path.join(root ?? P().root, "readability", `${safe(key)}.json`), { ...sample, scores: {} });
  return { ...sample, text: renderSample(sample, { ref }) };
}
const safe = (s) => String(s).replace(/[^\w.-]+/g, "_");
const dirOf = (root) => path.join(root ?? P().root, "readability");
const load = (key, root) => readJson(path.join(dirOf(root), `${safe(key)}.json`), null);

export function recordScore(key, wo, scores, note = "", root) {
  const s = load(key, root); if (!s) throw new Error(`no sample ${key}`);
  if (!s.picked.some((p) => p.wo === wo)) throw new Error(`${wo} is not in sample ${key}`);
  if (scores.length !== DIMENSIONS.length || scores.some((x) => !(x >= 1 && x <= 5))) throw new Error(`scores: ${DIMENSIONS.length} integers 1–5 (${DIMENSIONS.join(" / ")})`);
  s.scores[wo] = { ...Object.fromEntries(DIMENSIONS.map((d, i) => [d, scores[i]])), note, at: new Date().toISOString() };
  writeJson(path.join(dirOf(root), `${safe(key)}.json`), s); return s.scores[wo];
}

// low scores → rule improvement candidates: the page, the dimension, and whether the machine check saw anything
export function summarize(samples) {
  const rows = [];
  for (const s of samples) for (const p of s.picked) { const sc = s.scores?.[p.wo]; if (!sc) continue; const low = DIMENSIONS.filter((d) => sc[d] <= LOW); if (low.length) rows.push({ key: s.key, wo: p.wo, family: p.family, band: p.band, low, scores: sc, items: p.metrics?.items ?? null, note: sc.note }); }
  const scored = samples.flatMap((s) => Object.keys(s.scores ?? {}));
  const lines = [`## 可读性抽检小结（${samples.length} 次抽样，已评分 ${scored.length} 页，低分 ${rows.length} 页）`, ""];
  if (!rows.length) lines.push("没有低分页面，规则暂不需要改。");
  for (const r of rows) lines.push(`- \`${r.wo}\`（${r.band}，${r.family}；抽样 ${r.key}）：${r.low.map((d) => `${d} ${r.scores[d]}`).join("、")}${r.note ? `；备注：${r.note}` : ""}。${r.items === 0 ? "**可读性检查没有命中任何一项 → 规则漏了，按备注补一条规则（走规则变更单）。**" : r.items == null ? "" : `可读性检查命中 ${r.items} 项 → 检查已看到问题，看 hint 是否够清楚、阈值是否太松。`}`);
  return { rows, text: lines.join("\n") };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const argv = process.argv.slice(2); const flag = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : undefined; };
  const VALUED = ["--app", "--pages", "--key", "--rate", "--min", "--families", "--ref", "--log-issue", "--batch"];
  const pos = argv.filter((a, i) => !a.startsWith("--") && !VALUED.includes(argv[i - 1]));
  const [cmd = "sample", ...rest] = pos; const dryRun = argv.includes("--dry-run");
  try {
    if (cmd === "sample") {
      const APP = appDir(argv); const orders = loadWorkOrders();
      const list = flag("--pages") === "regression" || !flag("--pages") ? orders.filter((w) => isPage(w) && w.status === "regression").map((w) => w.id) : flag("--pages").split(",").map((x) => x.trim()).filter(Boolean);
      let fam = {}; const fv = flag("--families");
      if (fv) fam = existsSync(fv) ? JSON.parse(readFileSync(fv, "utf8")) : Object.fromEntries(fv.split(",").map((x) => x.split("=")));
      const key = flag("--key") ?? `adhoc-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, "")}`;
      const res = sampleBatch({ pages: list.map((wo) => ({ wo, family: fam[wo] })), key, batch: flag("--batch"), APP, rate: Number(flag("--rate") ?? 0.05), min: Number(flag("--min") ?? 1), ref: flag("--ref"), orders, dryRun, root: dryRun ? undefined : stateDir() });
      const logIssue = flag("--log-issue");
      if (logIssue) Multica.fromArgv(argv).comment(logIssue, res.text);
      console.log(dryRun || !logIssue ? res.text : JSON.stringify({ ok: true, key, n: res.n, N: res.N, picked: res.picked.map((p) => p.wo) }));
    } else if (cmd === "score") {
      const [key, wo, a, b, c, ...note] = rest; const r = recordScore(key, wo, [a, b, c].map(Number), note.join(" ")); console.log(JSON.stringify({ ok: true, wo, ...r }));
    } else if (cmd === "summary") {
      const dir = dirOf(); const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".json")) : [];
      const samples = (rest[0] && !argv.includes("--all") ? [load(rest[0])].filter(Boolean) : files.map((f) => readJson(path.join(dir, f), null)).filter(Boolean));
      const r = summarize(samples); const logIssue = flag("--log-issue");
      if (argv.includes("--post") && logIssue) Multica.fromArgv(argv).comment(logIssue, r.text);
      console.log(r.text);
    } else throw new Error("usage: readability-sample.mjs sample|score|summary (see the header of the file)");
  } catch (e) { console.log(JSON.stringify({ ok: false, error: String(e.message ?? e) })); process.exitCode = 1; }
}
