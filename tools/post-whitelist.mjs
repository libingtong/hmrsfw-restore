// Draft of the read-only endpoint allow-list (plan §4.2). Extracts every request({url, method}) from both bundles,
// classifies by the last path segment, and writes out/whitelist-draft.{json,md} for HUMAN CONFIRMATION.
// Nothing is allowed until the user confirms (out/whitelist-confirmed.json is written only from the user's decision).
// Usage: node tools/post-whitelist.mjs
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
const sites = { portal: "legacy-dist/portal/assets", usercenter: "legacy-dist/usercenter/assets" };
const WRITE = /^(add|save|insert|create|update|edit|modify|delete|del|remove|cancel|submit|apply|deliver|sign|set(?!ting)|upload|import|send|bind|unbind|reset|audit|approve|reject|publish|withdraw|collect|care|follow|shield|report|feedback|register|logout|login|change|transfer|copy|move|sort|enable|disable|top|recommend(?!ation)|browse|scan|log|record|increase|incr|vote|like|clear|push|batch)/i;
const WRITE_ANYWHERE = /(updateScanTimes|saveCopy|saveName|ShieldList\/(add|cancel)|UserCare\/(add|cancel)|addLog|trackPoints)/;
const READ = /^(list|query|get|find|load|tree|dict|search|check|count|page|select|show|detail|info|view|statis|popular|free|vitaeTemp|recommendation|is|has|validate|verify)/i;
const found = new Map();
for (const [site, dir] of Object.entries(sites)) for (const f of readdirSync(dir)) {
  if (!f.endsWith(".js")) continue;
  const t = readFileSync(path.join(dir, f), "utf8");
  for (const m of t.matchAll(/url:\s*["`]([^"`]+)["`]\s*,\s*method:\s*["`](\w+)["`]/g)) {
    const url = m[1].split("?")[0], method = m[2].toUpperCase(), key = method + " " + url;
    if (!found.has(key)) found.set(key, { method, url, sites: new Set(), files: new Set() });
    found.get(key).sites.add(site); found.get(key).files.add(f);
  }
}
const rows = [...found.values()].map((r) => {
  const last = r.url.split("/").filter(Boolean).pop() ?? "";
  let cls, why;
  if (WRITE_ANYWHERE.test(r.url)) { cls = "write"; why = "known write endpoint"; }
  else if (WRITE.test(last)) { cls = "write"; why = "name looks like a write: " + (last.match(WRITE) || [""])[0]; }
  else if (READ.test(last)) { cls = "read"; why = "name looks like a read: " + (last.match(READ) || [""])[0]; }
  else { cls = "review"; why = "name not recognised"; }
  if (cls === "read" && /set/i.test(last) && !/setting/i.test(last)) { cls = "review"; why = "read-like name containing Set"; }
  return { method: r.method, url: r.url, class: cls, why, sites: [...r.sites].join("+") };
}).sort((a, b) => a.class.localeCompare(b.class) || a.url.localeCompare(b.url));
const count = (c) => rows.filter((r) => r.class === c).length;
writeFileSync("out/whitelist-draft.json", JSON.stringify({ note: "DRAFT — not in effect until confirmed by the user", generatedAt: new Date().toISOString(), totals: { endpoints: rows.length, read: count("read"), write: count("write"), review: count("review") }, rows }, null, 1));
const md = [`# 只读接口白名单初稿（待你确认，确认前不生效）`, ``, `共 ${rows.length} 个接口（URL + 方法）：建议放行 ${count("read")}、建议拦截 ${count("write")}、需人工判定 ${count("review")}。`, ``, `确认方式：在 \`out/whitelist-draft.json\` 里把要放行的行改成 \`"class": "read"\`、要拦截的改成 \`"write"\`，或直接告诉我改哪几条；我据此生成 \`out/whitelist-confirmed.json\`，并在计划第 11 节写确认记录。`, ``, `| 分类 | 方法 | 接口 | 站点 | 依据 |`, `|---|---|---|---|---|`, ...rows.map((r) => `| ${r.class === "read" ? "建议放行" : r.class === "write" ? "建议拦截" : "**需判定**"} | ${r.method} | \`${r.url}\` | ${r.sites} | ${r.why} |`)].join("\n");
writeFileSync("out/whitelist-draft.md", md + "\n");
console.log(`endpoints ${rows.length}: read ${count("read")}, write ${count("write")}, review ${count("review")}`);
for (const u of ["/xf-job/job/xfJobCurriculumVitae/saveCopy", "/xf-job/job/xfJobCurriculumVitae/saveName", "/xf-job/job/xfJobShieldList/add", "/xf-job/job/xfJobShieldList/cancel", "/xf-job/job/xfJobUserCare/add", "/xf-job/school/licenseFree/updateScanTimes"]) { const r = rows.filter((x) => x.url === u); console.log(" ", u, r.map((x) => x.method + ":" + x.class).join(",") || "not found"); }
