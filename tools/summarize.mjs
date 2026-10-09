// Build out/summary.json + markdown tables from the ledger, verify outputs and first-pass records.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
const L = JSON.parse(readFileSync("out/ledger.json", "utf8")).rounds;
const samples = JSON.parse(readFileSync("tools/samples.json", "utf8"));
const firstPass = JSON.parse(readFileSync("out/first-pass.json", "utf8")); // {"p1":{"a":{build,verify,cat},"b":{...}}}
const ids = [...samples.portal, ...samples.usercenter].map((s) => ({ ...s, site: samples.portal.includes(s) ? "portal" : "usercenter" }));
const k = (n) => (n == null ? "—" : (n / 1000).toFixed(0) + "k");
const rows = [];
for (const s of ids) for (const g of ["a", "b"]) {
  const rs = L.filter((r) => r.ticket === s.id && r.group === g && !r.aborted);
  const restore = rs.filter((r) => r.kind !== "fix"), fixes = rs.filter((r) => r.kind === "fix");
  const v = existsSync(`out/verify/${s.site}-${g}/${s.id}.json`) ? JSON.parse(readFileSync(`out/verify/${s.site}-${g}/${s.id}.json`, "utf8")) : null;
  const fp = firstPass[s.id]?.[g] ?? {};
  rows.push({
    id: s.id, route: s.route, group: g.toUpperCase(),
    model: [...new Set(rs.map((r) => r.model))].join("+"),
    tokens: restore.reduce((a, r) => a + (r.subagentTokens ?? 0), 0), fixTokens: fixes.reduce((a, r) => a + (r.subagentTokens ?? 0), 0),
    transcript: rs.reduce((a, r) => a + (r.transcriptTotal ?? 0), 0), output: rs.reduce((a, r) => a + (r.output ?? 0), 0),
    toolUses: rs.reduce((a, r) => a + (r.toolUses ?? 0), 0), minutes: +(rs.reduce((a, r) => a + (r.durationMs ?? 0), 0) / 60000).toFixed(1),
    firstBuild: fp.build ?? "—", firstVerify: fp.verify ?? "—", firstPixel: fp.pixel ?? "—", firstRequests: fp.requests ?? "—",
    fixRounds: fixes.length, finalPass: v ? v.pass : null, finalPixel: v ? +(v.screenshot.ratio * 100).toFixed(3) : null,
    errorCats: fp.cats ?? [],
  });
}
writeFileSync("out/summary.json", JSON.stringify(rows, null, 1));
const md = ["| 页面 | 组 | 模型 | 还原 token | 修正 token | 首次构建 | 首次比对 | 首次差异像素 | 接口序列 | 修正轮数 | 最终 | 耗时(分) |", "|---|---|---|---|---|---|---|---|---|---|---|---|",
  ...rows.map((r) => `| ${r.id} ${r.route} | ${r.group} | ${r.model} | ${k(r.tokens)} | ${r.fixTokens ? k(r.fixTokens) : "0"} | ${r.firstBuild} | ${r.firstVerify} | ${r.firstPixel} | ${r.firstRequests} | ${r.fixRounds} | ${r.finalPass === true ? "通过" : r.finalPass === false ? "未通过" : "—"} | ${r.minutes} |`)].join("\n");
writeFileSync("out/summary-table.md", md + "\n");
const tot = (g, f) => rows.filter((r) => r.group === g).reduce((a, r) => a + f(r), 0);
for (const g of ["A", "B"]) console.log(g, "restore tokens", tot(g, (r) => r.tokens), "fix tokens", tot(g, (r) => r.fixTokens), "first verify pass", rows.filter((r) => r.group === g && r.firstVerify === "通过").length, "/", rows.filter((r) => r.group === g).length);
console.log(md);
