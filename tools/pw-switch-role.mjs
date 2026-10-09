// Headed role switch driven by the USER: open the user center with an existing storageState, the user switches the role
// (top-right "角色"), the script waits until the role id (localStorage radiotype) differs from the one in <fromLabel>'s
// storageState on any open user-center page, then saves a new storageState. The page also shows a "已切换，点这里保存"
// button as a manual fallback when the change is not detected. Closing the window ends the run without saving.
// Allow-list filtering stays on; role-switch requests (identity/role/permission/menu paths) are allowed only in this
// window and logged as "allowed-role-flow". Usage: node tools/pw-switch-role.mjs <fromLabel> <toLabel> [minutes]
import { chromium } from "playwright";
import { readFileSync, appendFileSync } from "node:fs";
const [from = "usercenter-jobseeker", to = "usercenter-corp", minutes = "20"] = process.argv.slice(2);
const WL = JSON.parse(readFileSync("out/whitelist-confirmed.json", "utf8"));
const allow = new Set(WL.allow.map((a) => a.method + " " + a.url)); const prefixes = WL.allowPrefix ?? [];
const ROLE_FLOW = /(Identity|identity|Role|role|permission|Permission|menu|Menu|changeUserForCompany|getSysUserByToken|getCompanyInfo)/;
const UC = "https://hamiusercentertest.rencaidanao.com";
const fromState = JSON.parse(readFileSync(`.auth/pw-${from}.json`, "utf8"));
const fromRole = fromState.origins.find((o) => o.origin === UC)?.localStorage.find((i) => i.name === "radiotype")?.value ?? "";
const browser = await chromium.launch({ headless: false });
const ctx = await browser.newContext({ storageState: `.auth/pw-${from}.json`, viewport: { width: 1440, height: 900 }, locale: "zh-CN" });
await ctx.route(/\/xf-api\//, (r) => {
  const q = r.request(); const p = new URL(q.url()).pathname.replace(/^\/xf-api/, "");
  if (allow.has(q.method() + " " + p) || prefixes.some((x) => x.method === q.method() && p.startsWith(x.prefix))) return r.continue();
  const action = ROLE_FLOW.test(p) ? "allowed-role-flow" : "aborted";
  appendFileSync("out/blocked-requests.jsonl", JSON.stringify({ t: new Date().toISOString(), phase: `switch:${from}->${to}`, action, method: q.method(), path: p }) + "\n");
  return action === "aborted" ? r.abort() : r.continue();
});
let manual = false;
await ctx.exposeBinding("__pwSwitchSave", () => { manual = true; });
await ctx.addInitScript(() => {
  const add = () => {
    if (!document.body || document.getElementById("__pw_switch_save")) return;
    const b = document.createElement("button"); b.id = "__pw_switch_save"; b.textContent = "已切换，点这里保存";
    b.style.cssText = "position:fixed;left:16px;bottom:16px;z-index:2147483647;padding:10px 16px;background:#e6552e;color:#fff;border:0;border-radius:6px;font-size:14px;cursor:pointer";
    b.onclick = () => { b.textContent = "保存中…"; window.__pwSwitchSave(); };
    document.body.appendChild(b);
  };
  setInterval(add, 1500);
});
const page = await ctx.newPage();
await page.goto(UC + "/");
// The switch may navigate or open another tab: read the role from whichever user-center page answers.
const role = async () => {
  for (const p of ctx.pages()) if (p.url().startsWith(UC)) { const v = await p.evaluate(() => localStorage.getItem("radiotype")).catch(() => null); if (v !== null) return v; }
  return null;
};
console.log(`[${to}] 窗口已打开，请在右上角"角色"中切换到目标角色；没有自动保存时点左下角按钮（最多等待 ${minutes} 分钟）…`);
const deadline = Date.now() + Number(minutes) * 60000; let how = "";
while (Date.now() < deadline && browser.isConnected()) {
  await new Promise((r) => setTimeout(r, 2000));
  if (manual) { how = "manual"; break; }
  const now = await role();
  if (now && now !== fromRole) { how = "auto"; break; }
}
if (how) {
  await new Promise((r) => setTimeout(r, 6000));
  const changed = (await role()) !== fromRole;
  await ctx.storageState({ path: `.auth/pw-${to}.json` });
  console.log(`[${to}] 已保存 .auth/pw-${to}.json（${how === "auto" ? "检测到角色变化" : "手动保存"}，角色${changed ? "已" : "未"}变化）；当前页面 ${ctx.pages().map((p) => new URL(p.url()).pathname).join(" ")}`);
  if (!changed) console.log(`[${to}] 警告：角色与 ${from} 相同，请确认已切换后重跑`);
} else console.log(`[${to}] ${browser.isConnected() ? "超时" : "窗口已关闭"}，未检测到角色变化，未保存`);
await browser.close().catch(() => {}); process.exitCode = how ? 0 : 2;
