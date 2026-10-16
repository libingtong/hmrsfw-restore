// Headed login (plan §4.2): opens the test site's login page, waits for the USER to log in by hand, then saves
// storageState to .auth/pw-<site>.json (one per site; the user-center identity is NOT part of it, record-page switches it).
// Never types credentials. A banner at the top of the window tells the person what to do and what the script saw; the
// moment the login is detected the state is saved and the window closes, nobody has to report back.
// All /xf-api/ requests are filtered through the confirmed allow-list even here (default deny), and every blocked request
// is appended to out/blocked-requests.jsonl. Login itself needs the login endpoints, which are NOT on the read-only list:
// they are allowed only in this window and only as the login flow the user drives (LOGIN_FLOW); logged as "login-flow".
// The two sites share ONE login: the portal opens the user center in a NEW TAB (window.open(userUrl + "/autoLogin?toPath=..&token=..")),
// and the user center's autoLogin page stores token + userroledata itself. So the user-center check looks at every tab of the
// window, not only the first one (HM-48), and the user may either log in on the user-center login page or click 「个人中心」 on the
// logged-in portal. The script never types credentials and never carries a token to the user center.
// Run in $RESTORE_ASSETS. Usage: node tools/pw-login.mjs <portal|usercenter|all> [timeoutMinutes] [--from-portal]
//   all: portal first, then user center, in one window.
//   --from-portal (usercenter only): start from the saved .auth/pw-portal.json (portal origin only, as record-page does) so that a
//     portal login that is still valid can be turned into the user-center state with one click on 「个人中心」, no second login.
import { chromium } from "playwright";
import { readFileSync, appendFileSync, mkdirSync, renameSync } from "node:fs";
const SITES = {
  portal: { url: "https://hamiwebportaltest.rencaidanao.com/login", home: "https://hamiwebportaltest.rencaidanao.com/", name: "门户" },
  // user center: wait for the identity list too, record-page needs it to switch identities
  usercenter: { url: "https://hamiusercentertest.rencaidanao.com/login", name: "用户中心", also: "userroledata",
    hint: "已登录门户的话，在门户标签页点「个人中心」（会新开标签页自动进入）；也可以直接在用户中心登录页登录" },
};
const args = process.argv.slice(2), fromPortal = args.includes("--from-portal");
const [which = "all", minutes = "20"] = args.filter((a) => !a.startsWith("--"));
const sites = which === "all" ? ["portal", "usercenter"] : [which];
if (!sites.every((s) => SITES[s])) { console.error("usage: node tools/pw-login.mjs <portal|usercenter|all> [timeoutMinutes]"); process.exit(1); }
const WL = JSON.parse(readFileSync("out/whitelist-confirmed.json", "utf8"));
const allow = new Set(WL.allow.map((a) => a.method + " " + a.url));
const prefixes = WL.allowPrefix ?? [];
const LOGIN_FLOW = /\/(login|sys\/login|randomImage|getEncryptedString|phoneLogin|sms|slidesSms|slidesSgzSms|captcha|checkCaptcha|getSysUserByToken|autoLogin|tac|xfSysUser\/checkIzPerfect)/i;
mkdirSync(".auth", { recursive: true });
if (fromPortal && which !== "usercenter") { console.error("--from-portal only goes with usercenter"); process.exit(1); }
// minutes left on the saved portal token (only the exp claim is read; the token itself is never printed)
function portalMinutesLeft() {
  try {
    const st = JSON.parse(readFileSync(".auth/pw-portal.json", "utf8"));
    const t = st.origins.flatMap((o) => o.localStorage).find((x) => x.name === "token")?.value;
    const exp = JSON.parse(Buffer.from(String(t).split(".")[1], "base64url").toString()).exp;
    return Math.floor((exp * 1000 - Date.now()) / 60000);
  } catch { return null; }
}
if (fromPortal) {
  const left = portalMinutesLeft();
  if (left === null) { console.error("--from-portal: .auth/pw-portal.json 不存在或读不出 token 过期时间，请先 pw-login.mjs portal"); process.exit(1); }
  if (left <= 2) { console.error(`--from-portal: 门户登录态已过期或只剩 ${left} 分钟，请重新登录门户`); process.exit(1); }
  console.log(`门户登录态还剩约 ${left} 分钟，在此之前完成点击「个人中心」`);
}
const browser = await chromium.launch({ headless: false });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "zh-CN", ...(fromPortal ? { storageState: ".auth/pw-portal.json" } : {}) });
let label = "";
await context.route(/\/xf-api\//, (route) => {
  const req = route.request(); const u = new URL(req.url()); const key = req.method() + " " + u.pathname.replace(/^\/xf-api/, "");
  if (allow.has(key) || prefixes.some((x) => req.method() === x.method && u.pathname.replace(/^\/xf-api/, "").startsWith(x.prefix))) return route.continue();
  if (LOGIN_FLOW.test(u.pathname)) { appendFileSync("out/blocked-requests.jsonl", JSON.stringify({ t: new Date().toISOString(), phase: "login:" + label, action: "allowed-login-flow", method: req.method(), path: u.pathname }) + "\n"); return route.continue(); }
  appendFileSync("out/blocked-requests.jsonl", JSON.stringify({ t: new Date().toISOString(), phase: "login:" + label, action: "aborted", method: req.method(), path: u.pathname }) + "\n");
  return route.abort();
});
// status banner, re-added after every navigation; text comes from window.__pwLoginStatus
await context.addInitScript(() => {
  setInterval(() => {
    if (!document.body) return;
    let b = document.getElementById("__pw_login_banner");
    if (!b) { b = document.createElement("div"); b.id = "__pw_login_banner"; b.style.cssText = "position:fixed;left:0;right:0;top:0;z-index:2147483647;padding:8px 16px;background:#e6552e;color:#fff;font:14px/1.5 sans-serif;text-align:center;pointer-events:none"; document.body.appendChild(b); }
    b.textContent = window.__pwLoginStatus ?? "";
  }, 500);
});
const page = await context.newPage();
// banner on every tab: the user center opens in a new one
const say = (text) => Promise.all(context.pages().map((p) => p.evaluate((t) => { window.__pwLoginStatus = t; }, text).catch(() => {})));
// logged in = some tab of this window is on the site's origin and holds token (+ identity list for the user center)
async function loggedIn(s) {
  for (const p of context.pages()) {
    try {
      if (new URL(p.url()).origin !== new URL(s.url).origin) continue;
      if (await p.evaluate((keys) => keys.every((k) => !!localStorage.getItem(k)), ["token", ...(s.also ? [s.also] : [])])) return true;
    } catch {}
  }
  return false;
}
const results = [];
for (const [i, site] of sites.entries()) {
  label = site;
  const s = SITES[site], step = sites.length > 1 ? `第 ${i + 1}/${sites.length} 步 · ` : "";
  if (fromPortal) await page.goto(SITES.portal.home); // saved portal state; the user clicks 「个人中心」
  else if (site === "usercenter" && results[0]) await (await context.newPage()).goto(s.url); // portal tab stays: its 「个人中心」 is the shared-login path
  else await page.goto(s.url);
  console.log(`[${site}] 浏览器已打开${s.name}登录页，请手动登录（最多等待 ${minutes} 分钟）…`);
  const deadline = Date.now() + Number(minutes) * 60000;
  let ok = false;
  while (Date.now() < deadline && context.pages().length) {
    const left = Math.ceil((deadline - Date.now()) / 60000);
    await say(`${step}请在本窗口登录${s.name}测试站（还剩约 ${left} 分钟）。${s.hint ? s.hint + "。" : ""}只需登录，不用切身份；登录后会自动保存并继续。`);
    await new Promise((r) => setTimeout(r, 2000)); // not page.waitForTimeout: the first tab may be closed
    ok = await loggedIn(s);
    if (ok) break;
  }
  if (ok) {
    await say(`${step}已检测到${s.name}登录，正在保存…`);
    await new Promise((r) => setTimeout(r, 3000)); // not page.waitForTimeout: closing the window now must not lose the login
    const tmp = `.auth/pw-${site}.json.${process.pid}.tmp`;
    await context.storageState({ path: tmp }); renameSync(tmp, `.auth/pw-${site}.json`);
    await say(`${step}${s.name}登录态已保存${i + 1 < sites.length ? "，马上打开下一个登录页" : "，窗口即将关闭"}`);
    console.log(`[${site}] 已检测到登录，storageState 已保存到 .auth/pw-${site}.json`);
    await page.waitForTimeout(1500).catch(() => {});
  } else console.log(`[${site}] ${context.pages().length ? "超时" : "窗口已关闭"}，未检测到登录，未保存`);
  results.push(ok);
  if (!ok) break;
}
await browser.close().catch(() => {});
process.exitCode = results.length === sites.length && results.every(Boolean) ? 0 : 2;
