// Headed login (plan §4.2): opens the test site's login page, waits for the USER to log in by hand, then saves
// storageState to .auth/pw-<label>.json. Never types credentials. All /xf-api/ requests are filtered through the
// confirmed allow-list even here (default deny), and every blocked request is appended to out/blocked-requests.jsonl.
// Login itself needs the login endpoints, which are NOT on the read-only list: they are allowed only on this page
// and only as the login flow the user drives (see LOGIN_FLOW below); they are logged as "login-flow".
// Usage: node tools/pw-login.mjs <label> <loginUrl> <tokenStorageKey> [timeoutMinutes]
import { chromium } from "playwright";
import { readFileSync, appendFileSync, mkdirSync } from "node:fs";
const [label = "portal", loginUrl = "https://hamiwebportaltest.rencaidanao.com/login", tokenKey = "token", minutes = "20"] = process.argv.slice(2);
const WL = JSON.parse(readFileSync("out/whitelist-confirmed.json", "utf8"));
const allow = new Set(WL.allow.map((a) => a.method + " " + a.url));
const prefixes = WL.allowPrefix ?? [];
const LOGIN_FLOW = /\/(login|sys\/login|randomImage|getEncryptedString|phoneLogin|sms|slidesSms|slidesSgzSms|captcha|checkCaptcha|getSysUserByToken|autoLogin|tac|xfSysUser\/checkIzPerfect)/i;
mkdirSync(".auth", { recursive: true });
const browser = await chromium.launch({ headless: false });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "zh-CN" });
await context.route(/\/xf-api\//, (route) => {
  const req = route.request(); const u = new URL(req.url()); const key = req.method() + " " + u.pathname.replace(/^\/xf-api/, "");
  if (allow.has(key) || prefixes.some((x) => req.method() === x.method && u.pathname.replace(/^\/xf-api/, "").startsWith(x.prefix))) return route.continue();
  if (LOGIN_FLOW.test(u.pathname)) { appendFileSync("out/blocked-requests.jsonl", JSON.stringify({ t: new Date().toISOString(), phase: "login:" + label, action: "allowed-login-flow", method: req.method(), path: u.pathname }) + "\n"); return route.continue(); }
  appendFileSync("out/blocked-requests.jsonl", JSON.stringify({ t: new Date().toISOString(), phase: "login:" + label, action: "aborted", method: req.method(), path: u.pathname }) + "\n");
  return route.abort();
});
const page = await context.newPage();
await page.goto(loginUrl);
console.log(`[${label}] 浏览器已打开登录页，请手动登录（最多等待 ${minutes} 分钟）…`);
const deadline = Date.now() + Number(minutes) * 60000;
let ok = false;
while (Date.now() < deadline) {
  await page.waitForTimeout(3000);
  try { ok = await page.evaluate((k) => !!localStorage.getItem(k), tokenKey); } catch {}
  if (ok) break;
}
if (ok) { await page.waitForTimeout(3000); await context.storageState({ path: `.auth/pw-${label}.json` }); console.log(`[${label}] 已检测到登录，storageState 已保存到 .auth/pw-${label}.json`); }
else console.log(`[${label}] 超时未检测到登录，未保存`);
await browser.close();
process.exitCode = ok ? 0 : 2;
