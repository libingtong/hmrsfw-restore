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
// The user-center check looks at every tab of the window, not only the first one (HM-48). While waiting, the banner and the
// console show every tab's site + path and which key it lacks (token / userroledata). In usercenter mode the user center's
// /login sends the tab to the portal login page; once the portal is logged in and no user-center tab follows within 8 s,
// the script clicks the portal's entry itself, as in all mode (HM-951).
// Run in $RESTORE_ASSETS. Usage: node tools/pw-login.mjs <portal|usercenter|all> [timeoutMinutes] [--from-portal]
//   all: log in to the portal once; the user center follows through the portal's 「用户中心」 entry. pw-usercenter.json is
//     saved first, then pw-portal.json again.
//   Afterwards every saved site is checked on its own (pw-login-check.mjs, HM-967): file present, token not expired, its
//   expiry printed, a hint when less than 2 hours are left. The two sites' expiries differ by design: the user center's
//   autoLogin trades the portal token for its own. Exit code: 0 all saved and valid, 2 not logged in / timed out, 3 a
//   saved state is missing, unreadable or expired.
//   --from-portal (usercenter only): start from the saved .auth/pw-portal.json (portal origin only, as record-page does) and
//     enter the user center through the same entry, no second login.
import { chromium } from "playwright";
import { readFileSync, appendFileSync, mkdirSync, renameSync } from "node:fs";
import { tokenExp as expIn, checkSaved } from "./pw-login-check.mjs";
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
const tokenExp = (file, site) => expIn(file, new URL(SITES[site].url).origin);
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
    if (!b) { b = document.createElement("div"); b.id = "__pw_login_banner"; b.style.cssText = "position:fixed;left:0;right:0;top:0;z-index:2147483647;padding:8px 16px;white-space:pre-line;background:#e6552e;color:#fff;font:14px/1.5 sans-serif;text-align:center;pointer-events:none"; document.body.appendChild(b); }
    b.textContent = window.__pwLoginStatus ?? "";
  }, 500);
});
const page = await context.newPage();
// banner on every tab: the user center opens in a new one
const say = (text) => Promise.all(context.pages().map((p) => p.evaluate((t) => { window.__pwLoginStatus = t; }, text).catch(() => {})));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); // not page.waitForTimeout: the first tab may be closed
// What each tab of the window holds, for detection and for the banner: which site it is on and whether its localStorage has
// token / userroledata. Only presence is read, never a value; only origin + path are shown, never the query (autoLogin
// carries the token there). A tab that does not answer within 3 s (navigating, busy) counts as unknown for this round.
const ORIGINS = Object.fromEntries(Object.entries(SITES).map(([k, v]) => [new URL(v.url).origin, k]));
const keysOf = (s) => ["token", ...(s.also ? [s.also] : [])];
async function tabStates() {
  return Promise.all(context.pages().map(async (p, n) => {
    let origin = "", path = "";
    try { const u = new URL(p.url()); origin = u.origin; path = u.pathname; } catch {}
    const has = await Promise.race([
      p.evaluate(() => ({ token: !!localStorage.getItem("token"), userroledata: !!localStorage.getItem("userroledata") })),
      sleep(3000).then(() => null),
    ]).catch(() => null);
    return { n: n + 1, site: ORIGINS[origin] ?? null, origin, path, has };
  }));
}
// logged in = some tab of this window is on the site's origin and holds token (+ identity list for the user center)
const loggedIn = (s, tabs) => tabs.some((t) => t.site && SITES[t.site] === s && t.has && keysOf(s).every((k) => t.has[k]));
// one line for the whole window, e.g. 标签页 1 门户 /：有 token；标签页 2 用户中心 /jobhunterhome：缺 userroledata
function describe(tabs) {
  return tabs.map((t) => {
    const host = t.site ? SITES[t.site].name : t.origin && t.origin !== "null" ? t.origin.replace(/^https?:\/\//, "") : "空白页";
    const where = `标签页 ${t.n} ${host}${t.site || host !== "空白页" ? " " + t.path : ""}`;
    if (!t.site) return where;
    if (!t.has) return `${where}：读不到（页面正在跳转）`;
    const need = keysOf(SITES[t.site]), miss = need.filter((k) => !t.has[k]);
    return `${where}：${miss.length ? "缺 " + miss.join("、") : "有 " + need.join("、")}`;
  }).join("；");
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
  let hint = "", clicked = false;
  if (viaPortal) {
    if (fromPortal) await page.goto(SITES.portal.home);
    await say(`${step}门户已登录，正在通过门户的「${ENTRY}」入口进入用户中心，请勿操作…`);
    clicked = await clickPortalEntry();
    console.log(`[${site}] ${clicked ? `已点击门户「${ENTRY}」入口，等待用户中心自动登录` : `没找到门户「${ENTRY}」入口，请人工点击或在用户中心登录页登录`}（最多等待 ${minutes} 分钟）…`);
    if (!clicked) { hint = s.hint; if (!fromPortal) await (await context.newPage()).goto(s.url); } // portal tab stays: its entry is the shared-login path
  } else {
    await page.goto(s.url);
    // the user center's own /login is an empty page that sends the same tab to the portal login page (?invalidtoken=1)
    hint = site === "usercenter" ? `用户中心登录页会跳到门户登录页，在那里登录即可；门户登录后脚本会自动点门户的「${ENTRY}」入口` : "";
    console.log(`[${site}] 浏览器已打开${s.name}登录页，请手动登录（最多等待 ${minutes} 分钟）…`);
  }
  const deadline = Date.now() + Number(minutes) * 60000;
  // portalSince: since when the portal tab is logged in but no user-center tab has the token; noRoleSince: since when a
  // user-center tab has the token but not the identity list. Both drive the hints below (HM-951).
  let ok = false, lastLine = "", portalSince = 0, noRoleSince = 0, autoClicked = clicked;
  while (Date.now() < deadline && context.pages().length) {
    const tabs = await tabStates();
    ok = loggedIn(s, tabs);
    if (ok) break;
    const line = describe(tabs);
    if (line !== lastLine) { console.log(`[${site}] ${line}`); lastLine = line; }
    let tip = hint;
    if (site === "usercenter") {
      const uc = tabs.filter((t) => t.site === "usercenter" && t.has);
      // logged in on the portal, but no user-center tab holds the token: the portal's own redirect may still come, give it
      // 8 s, then click the portal's 「用户中心」 entry once (the same click as all / --from-portal); then ask the person
      if (tabs.some((t) => t.site === "portal" && t.has?.token) && !uc.some((t) => t.has.token)) {
        portalSince ||= Date.now();
        if (!autoClicked && Date.now() - portalSince > 8000) {
          autoClicked = true;
          await say(`${step}门户已登录，正在点门户的「${ENTRY}」入口进入用户中心，请勿操作…`);
          const done = await clickPortalEntry();
          console.log(`[${site}] 门户已登录、还没有登录的用户中心标签页：${done ? `已点击门户「${ENTRY}」入口` : `没点到门户「${ENTRY}」入口`}`);
          portalSince = Date.now();
          continue;
        }
        if (Date.now() - portalSince > 15000) tip = `门户已登录，但还没有登录的用户中心标签页：请在门户标签页右上角点「${ENTRY}」（会新开标签页自动进入）`;
      } else portalSince = 0;
      // the user center has the token but not the identity list: its autoLogin page or layout did not finish
      if (uc.some((t) => t.has.token && !t.has.userroledata)) {
        noRoleSince ||= Date.now();
        if (Date.now() - noRoleSince > 15000) tip = `用户中心标签页有 token、没有身份列表 userroledata：请在用户中心标签页刷新一次；还不行就回门户标签页再点「${ENTRY}」`;
      } else noRoleSince = 0;
    }
    const left = Math.ceil((deadline - Date.now()) / 60000);
    await say((viaPortal && !tip
      ? `${step}正在等待用户中心自动登录（还剩约 ${left} 分钟），请勿操作。`
      : `${step}请在本窗口登录${s.name}测试站（还剩约 ${left} 分钟）。${tip ? tip + "。" : ""}只需登录，不用切身份；登录后会自动保存并继续。`) + `\n当前：${line}`);
    await sleep(2000);
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
// every site this run relies on (both with all / --from-portal) is checked on its own: file present, token not expired.
// The two expiries are not compared, the user center's autoLogin issues its own token (HM-967). Only exp is printed.
if (code === 0) {
  const keys = which === "all" || fromPortal ? ["portal", "usercenter"] : sites;
  const { ok, lines } = checkSaved(keys.map((k) => ({ key: k, name: SITES[k].name, file: `.auth/pw-${k}.json`, origin: new URL(SITES[k].url).origin })));
  for (const l of lines) console[l.level](l.text);
  if (!ok) code = 3;
}
process.exitCode = code;
