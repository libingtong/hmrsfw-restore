// Headed role switch driven by the USER: open the user center with an existing storageState, the user switches the role
// (top-right "角色"), the script waits until the role-related localStorage keys change, then saves a new storageState.
// Allow-list filtering stays on; role-switch requests (identity/role/permission/menu paths) are allowed only in this
// window and logged as "allowed-role-flow". Usage: node tools/pw-switch-role.mjs <fromLabel> <toLabel> [minutes]
import { chromium } from "playwright";
import { readFileSync, appendFileSync } from "node:fs";
const [from = "usercenter-jobseeker", to = "usercenter-corp", minutes = "20"] = process.argv.slice(2);
const WL = JSON.parse(readFileSync("out/whitelist-confirmed.json", "utf8"));
const allow = new Set(WL.allow.map((a) => a.method + " " + a.url)); const prefixes = WL.allowPrefix ?? [];
const ROLE_FLOW = /(Identity|identity|Role|role|permission|Permission|menu|Menu|changeUserForCompany|getSysUserByToken|getCompanyInfo)/;
const ROLE_KEYS = ["userroledata", "radiotype", "Recruiters", "GeneraluserId", "danwei", "routermenu", "corpInfo", "idenityType", "roleId"];
const browser = await chromium.launch({ headless: false });
const ctx = await browser.newContext({ storageState: `.auth/pw-${from}.json`, viewport: { width: 1440, height: 900 }, locale: "zh-CN" });
await ctx.route(/\/xf-api\//, (r) => {
  const q = r.request(); const p = new URL(q.url()).pathname.replace(/^\/xf-api/, "");
  if (allow.has(q.method() + " " + p) || prefixes.some((x) => x.method === q.method() && p.startsWith(x.prefix))) return r.continue();
  const action = ROLE_FLOW.test(p) ? "allowed-role-flow" : "aborted";
  appendFileSync("out/blocked-requests.jsonl", JSON.stringify({ t: new Date().toISOString(), phase: `switch:${from}->${to}`, action, method: q.method(), path: p }) + "\n");
  return action === "aborted" ? r.abort() : r.continue();
});
const page = await ctx.newPage();
await page.goto("https://hamiusercentertest.rencaidanao.com/");
const snap = () => page.evaluate((keys) => keys.map((k) => k + "=" + (localStorage.getItem(k) ?? "").length + ":" + (localStorage.getItem(k) ?? "").slice(-24)).join("|"), ROLE_KEYS).catch(() => "");
await page.waitForTimeout(5000);
const before = await snap();
console.log(`[${to}] 窗口已打开，请在右上角"角色"中切换到目标角色（最多等待 ${minutes} 分钟）…`);
const deadline = Date.now() + Number(minutes) * 60000; let changed = false;
while (Date.now() < deadline) { await page.waitForTimeout(3000); const now = await snap(); if (now && now !== before) { changed = true; break; } }
if (changed) { await page.waitForTimeout(6000); await ctx.storageState({ path: `.auth/pw-${to}.json` }); console.log(`[${to}] 检测到角色变化，已保存 .auth/pw-${to}.json；当前页面 ${new URL(page.url()).pathname}`); }
else console.log(`[${to}] 超时未检测到角色变化，未保存`);
await browser.close(); process.exitCode = changed ? 0 : 2;
