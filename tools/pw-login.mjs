// Headed login (plan §4.2): opens the test site's login page, waits for the USER to log in by hand, then saves
// storageState to .auth/pw-<site>.json (one per site; the user-center identity is NOT part of it, record-page switches it).
// Never types credentials. A banner at the top of the window tells the person what to do and what the script saw; the
// moment the login is detected the state is saved and the window closes, nobody has to report back.
// All /xf-api/ requests are filtered through the confirmed allow-list even here (default deny), and every blocked request
// is appended to out/blocked-requests.jsonl. Login itself needs the login endpoints, which are NOT on the read-only list:
// they are allowed only in this window and only as the login flow the user drives (LOGIN_FLOW); logged as "login-flow".
// The two sites share ONE login: the portal header's 「用户中心」 entry (a span, not a link) runs the portal's own
// Dt("main", "") = window.open(userUrl + "/autoLogin?toPath=..&token=..") in a NEW TAB, and the user center's autoLogin page
// stores token + userroledata itself. So once the portal is logged in, the script clicks that entry on the portal page,
// in the same window and browser context, and the original front-ends do the rest (HM-560): the person logs in once.
// The script never types credentials, never builds the autoLogin URL, never calls a login endpoint and never writes a
// token into the user center; the token is never printed, only its exp claim is read. If the entry cannot be found or
// clicked, the banner asks the person to click it (or log in on the user-center login page) and detection carries on.
// The user-center check looks at every tab of the window, not only the first one (HM-48).
// Run in $RESTORE_ASSETS. Usage: node tools/pw-login.mjs <portal|usercenter|all> [timeoutMinutes] [--from-portal]
//   all: log in to the portal once; the user center follows through the portal's 「用户中心」 entry. pw-usercenter.json is
//     saved first, then pw-portal.json again; both tokens' exp must match.
//   --from-portal (usercenter only): start from the saved .auth/pw-portal.json (portal origin only, as record-page does) and
//     enter the user center through the same entry, no second login.
import { chromium } from "playwright";
import { readFileSync, appendFileSync, mkdirSync, renameSync } from "node:fs";
const SITES = {
  portal: { url: "https://hamiwebportaltest.rencaidanao.com/login", home: "https://hamiwebportaltest.rencaidanao.com/", name: "门户" },
  // user center: wait for the identity list too, record-page needs it to switch identities
  usercenter: { url: "https://hamiusercentertest.rencaidanao.com/login", name: "用户中心", also: "userroledata",
    hint: "脚本没能自动点到入口：请在门户标签页右上角点「用户中心」（会新开标签页自动进入）；也可以直接在用户中心登录页登录" },
};
const ENTRY = "用户中心"; // text of the portal header entry (legacy portal headers: span.pointer → Dt("main", ""))
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
// exp (seconds) of the token stored for the site's own origin in a saved state; only the exp claim is read, the token is never printed
function tokenExp(file, site) {
  try {
    const st = JSON.parse(readFileSync(file, "utf8"));
    const origin = new URL(SITES[site].url).origin;
    const t = st.origins.find((o) => o.origin === origin)?.localStorage.find((x) => x.name === "token")?.value;
    const exp = JSON.parse(Buffer.from(String(t).replace(/^"|"$/g, "").split(".")[1], "base64url").toString()).exp;
    return Number.isFinite(exp) ? exp : null;
  } catch { return null; }
}
if (fromPortal) {
  const exp = tokenExp(".auth/pw-portal.json", "portal"), left = exp === null ? null : Math.floor((exp * 1000 - Date.now()) / 60000);
  if (left === null) { console.error("--from-portal: .auth/pw-portal.json 不存在或读不出 token 过期时间，请先 pw-login.mjs portal"); process.exit(1); }
  if (left <= 2) { console.error(`--from-portal: 门户登录态已过期或只剩 ${left} 分钟，请重新登录门户`); process.exit(1); }
  console.log(`门户登录态还剩约 ${left} 分钟`);
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
const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); // not page.waitForTimeout: the first tab may be closed
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
// Click the portal header's own 「用户中心」 entry (the visible one; the dropdown copy is v-show hidden). The portal page's
// handler opens the user center; nothing else is done here. Falls back to the portal home page when the current portal
// page has no header (some routes hide it). Returns whether a click happened.
async function clickPortalEntry() {
  const portalOrigin = new URL(SITES.portal.url).origin;
  const tab = context.pages().find((p) => { try { return new URL(p.url()).origin === portalOrigin; } catch { return false; } }) ?? page;
  const entry = () => tab.getByText(ENTRY, { exact: true }).filter({ visible: true }).first();
  for (const go of [false, true]) {
    try {
      if (go) await tab.goto(SITES.portal.home);
      await entry().waitFor({ state: "visible", timeout: go ? 30000 : 10000 });
      await entry().click({ timeout: 10000 });
      return true;
    } catch {}
  }
  return false;
}
const results = [];
for (const [i, site] of sites.entries()) {
  label = site;
  const s = SITES[site], step = sites.length > 1 ? `第 ${i + 1}/${sites.length} 步 · ` : "";
  // the user center follows the portal login when there is one in this window (all after the portal step, or --from-portal)
  const viaPortal = site === "usercenter" && (fromPortal || results[0] === true);
  let hint = "";
  if (viaPortal) {
    if (fromPortal) await page.goto(SITES.portal.home);
    await say(`${step}门户已登录，正在通过门户的「${ENTRY}」入口进入用户中心，请勿操作…`);
    const clicked = await clickPortalEntry();
    console.log(`[${site}] ${clicked ? `已点击门户「${ENTRY}」入口，等待用户中心自动登录` : `没找到门户「${ENTRY}」入口，请人工点击或在用户中心登录页登录`}（最多等待 ${minutes} 分钟）…`);
    if (!clicked) { hint = s.hint; if (!fromPortal) await (await context.newPage()).goto(s.url); } // portal tab stays: its entry is the shared-login path
  } else {
    await page.goto(s.url);
    hint = s.hint && site === "usercenter" ? "也可以在门户登录后点「用户中心」" : "";
    console.log(`[${site}] 浏览器已打开${s.name}登录页，请手动登录（最多等待 ${minutes} 分钟）…`);
  }
  const deadline = Date.now() + Number(minutes) * 60000;
  let ok = false;
  while (Date.now() < deadline && context.pages().length) {
    const left = Math.ceil((deadline - Date.now()) / 60000);
    await say(viaPortal && !hint
      ? `${step}正在等待用户中心自动登录（还剩约 ${left} 分钟），请勿操作。`
      : `${step}请在本窗口登录${s.name}测试站（还剩约 ${left} 分钟）。${hint ? hint + "。" : ""}只需登录，不用切身份；登录后会自动保存并继续。`);
    await sleep(2000);
    ok = await loggedIn(s);
    if (ok) break;
  }
  if (ok) {
    await say(`${step}已检测到${s.name}登录，正在保存…`);
    await sleep(3000); // closing the window now must not lose the login
    const save = async (name) => { const tmp = `.auth/pw-${name}.json.${process.pid}.tmp`; await context.storageState({ path: tmp }); renameSync(tmp, `.auth/pw-${name}.json`); };
    await save(site);
    console.log(`[${site}] 已检测到登录，storageState 已保存到 .auth/pw-${site}.json`);
    // same window, same context: save the portal again after the user center, so both files come from this one login
    if (viaPortal && !fromPortal) { await save("portal"); console.log(`[portal] 已在进入用户中心后重新保存 .auth/pw-portal.json`); }
    await say(`${step}${s.name}登录态已保存${i + 1 < sites.length ? "，马上进入下一步" : "，窗口即将关闭"}`);
    await sleep(1500);
  } else console.log(`[${site}] ${context.pages().length ? "超时" : "窗口已关闭"}，未检测到登录，未保存`);
  results.push(ok);
  if (!ok) break;
}
await browser.close().catch(() => {});
let code = results.length === sites.length && results.every(Boolean) ? 0 : 2;
// both sites saved from one login → both files exist and their tokens expire at the same moment (only exp is printed)
if (code === 0 && (which === "all" || fromPortal)) {
  const exp = { portal: tokenExp(".auth/pw-portal.json", "portal"), usercenter: tokenExp(".auth/pw-usercenter.json", "usercenter") };
  for (const [k, v] of Object.entries(exp)) console.log(`[${k}] token 过期时间：${v === null ? "读不出" : new Date(v * 1000).toLocaleString("zh-CN", { hour12: false })}`);
  if (exp.portal === null || exp.usercenter === null) { console.error("校验失败：有登录态文件不存在或读不出 token 过期时间"); code = 3; }
  else if (exp.portal !== exp.usercenter) { console.error("校验失败：门户和用户中心的 token 过期时间不一致，两站登录态不是同一次登录"); code = 3; }
  else console.log("校验通过：两站 token 过期时间一致");
}
process.exitCode = code;
