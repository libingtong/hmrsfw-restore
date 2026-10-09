// Headless recording for the 20-page confirmation (plan §4.2/4.3). Reuses .auth/pw-<role>.json storageState.
// - Every /xf-api/ request (all methods) is checked against out/whitelist-confirmed.json; not allowed → abort + logged.
// - Response bodies are stored AS RECEIVED (encrypted ones stay ciphertext with their Crypto_Opt header). Nothing is
//   decrypted here, so no plaintext of encrypted responses ever reaches disk.
// - Output: har/confirm/<id>.json  (same entry shape as tools/build-har.mjs input: method,url,status,resHeaders,body,postData)
// Usage: node tools/pw-record.mjs [ids...]
import { chromium } from "playwright";
import { readFileSync, writeFileSync, appendFileSync, mkdirSync } from "node:fs";
const ORIGIN = { portal: "https://hamiwebportaltest.rencaidanao.com", usercenter: "https://hamiusercentertest.rencaidanao.com" };
const samples = JSON.parse(readFileSync("tools/confirm-samples.json", "utf8"));
const only = process.argv.slice(2);
const WL = JSON.parse(readFileSync("out/whitelist-confirmed.json", "utf8"));
const allow = new Set(WL.allow.map((a) => a.method + " " + a.url));
const prefixes = WL.allowPrefix ?? [];
// 2026-10-09: the user decided the whitelist is no longer needed (the test environment can be reset).
// HMRSFW_NO_WHITELIST=1 lets every request through at recording; replay/interaction still never reach the network.
const NO_WHITELIST = process.env.HMRSFW_NO_WHITELIST === "1";
const allowed = (method, p) => NO_WHITELIST || allow.has(method + " " + p) || prefixes.some((x) => x.method === method && p.startsWith(x.prefix));
const roleOf = (s) => s.role ?? (s.site === "portal" ? "portal" : "usercenter-jobseeker");
const routeUrl = (s) => s.recordPath ?? (s.site === "portal" ? "/" + s.route.replace(/^src\/views\//, "").replace(/\.vue$/, "") : s.route.replace(/\/:[\w?]+/g, ""));
mkdirSync("har/confirm", { recursive: true });
const browser = await chromium.launch();
const summary = [];
for (const s of samples) {
  if (only.length && !only.includes(s.id)) continue;
  const role = roleOf(s);
  const context = await browser.newContext({ storageState: `.auth/pw-${role}.json`, viewport: { width: 1920, height: 1080 }, locale: "zh-CN" });
  const entries = [], blocked = [];
  await context.route(/\/xf-api\//, (route) => {
    const req = route.request(); const u = new URL(req.url()); const p = u.pathname.replace(/^\/xf-api/, "");
    if (allowed(req.method(), p)) return route.continue();
    const rec = { t: new Date().toISOString(), phase: "record:" + s.id, action: "aborted", method: req.method(), path: u.pathname };
    blocked.push(rec); appendFileSync("out/blocked-requests.jsonl", JSON.stringify(rec) + "\n");
    return route.abort();
  });
  const page = await context.newPage();
  page.on("response", async (res) => {
    const req = res.request(); if (!/\/xf-api\//.test(req.url()) || /\/sys\/common\/static\//.test(req.url())) return;
    let body = ""; try { body = await res.text(); } catch {}
    const headers = res.headers();
    entries.push({ method: req.method(), url: req.url(), status: res.status(), resHeaders: Object.entries(headers).map(([k, v]) => `${k}: ${v}`).join("\n"), body, crypto: headers["crypto_opt"] === "true", postData: req.postData() ?? null, t: Date.now() });
  });
  const url = ORIGIN[s.site] + routeUrl(s);
  let finalPath = "", text = 0;
  try {
    await page.goto(url, { waitUntil: "load", timeout: 60000 });
    let last = -1, stable = 0; const t0 = Date.now();
    while (Date.now() - t0 < 40000) { await page.waitForTimeout(1000); const len = await page.evaluate(() => document.body.innerText.length); stable = len === last ? stable + 1 : 0; last = len; if (stable >= 3 && Date.now() - t0 > 5000) break; }
    finalPath = new URL(page.url()).pathname; text = last;
  } catch (e) { finalPath = "ERROR " + String(e.message).slice(0, 80); }
  writeFileSync(`har/confirm/${s.id}.json`, JSON.stringify({ id: s.id, site: s.site, route: routeUrl(s), role, finalPath, textLength: text, entries }, null, 1));
  summary.push({ id: s.id, role, path: routeUrl(s), finalPath, text, entries: entries.length, encrypted: entries.filter((e) => e.crypto).length, blocked: blocked.length });
  await context.close();
}
await browser.close();
writeFileSync("out/confirm-record-summary.json", JSON.stringify(summary, null, 1));
for (const r of summary) console.log(`${r.id} ${r.role} ${r.path} -> ${r.finalPath} text=${r.text} entries=${r.entries} encrypted=${r.encrypted} blocked=${r.blocked}`);
