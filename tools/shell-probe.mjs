// Shell baseline per (site, role): load the ORIGINAL build on an unknown route, under the union of that site's
// confirmation HARs and the role's original storage state, and record which /xf-api/ requests the app shell
// (header, footer, nav, polling) sends by itself. The restored project (hmrsfw-vue) has no shell yet, so these requests are
// excluded from the page comparison in verify-confirm / interact-confirm.
// Usage: node tools/shell-probe.mjs   → out/shell-baseline.json  { "<site>|<role>": { finalUrl, requests: [...] } }
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFileSync, writeFileSync, existsSync, statSync, mkdirSync } from "node:fs";
import path from "node:path";

const orders = JSON.parse(readFileSync("tools/confirm-orders.json", "utf8"));
const MIME = { ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".html": "text/html", ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf" };
const DIR = { portal: "legacy-dist/portal", usercenter: "legacy-dist/usercenter" };
const PORT = { portal: 4721, usercenter: 4722 };
const HOST = { portal: "https://hamiwebportaltest.rencaidanao.com", usercenter: "https://hamiusercentertest.rencaidanao.com" };
const servers = Object.entries(DIR).map(([site, dir]) => createServer((req, res) => {
  const u = decodeURIComponent(req.url.split("?")[0]);
  let f = path.join(path.resolve(dir), u);
  if (!existsSync(f) || statSync(f).isDirectory()) f = path.join(path.resolve(dir), "index.html");
  res.setHeader("content-type", MIME[path.extname(f)] ?? "application/octet-stream");
  res.end(readFileSync(f));
}).listen(PORT[site], "127.0.0.1"));

mkdirSync("out/shell-probe", { recursive: true });
const browser = await chromium.launch();
const out = {};
const groups = [...new Set(orders.map((o) => o.site + "|" + o.role))];
for (const key of groups) {
  const [site, role] = key.split("|");
  const origin = `http://127.0.0.1:${PORT[site]}`;
  // Union HAR: every recorded response of this site+role, so shell requests get their real responses.
  const entries = [];
  const seen = new Set();
  for (const o of orders.filter((x) => x.site === site && x.role === role)) {
    for (const e of JSON.parse(readFileSync(`har/confirm-replay/${o.id}.har`, "utf8")).log.entries) {
      e.request.url = e.request.url.replace("http://__ORIGIN__", origin);
      const k = e.request.method + " " + e.request.url + " " + (e.request.postData?.text ?? "");
      if (!seen.has(k)) { seen.add(k); entries.push(e); }
    }
  }
  const harPath = `out/shell-probe/${site}-${role}.har`;
  writeFileSync(harPath, JSON.stringify({ log: { version: "1.2", creator: { name: "shell-probe", version: "1" }, entries } }));
  const st = JSON.parse(readFileSync(`.auth/pw-${role}.json`, "utf8"));
  const ls = Object.fromEntries((st.origins.find((x) => x.origin === HOST[site])?.localStorage ?? []).map((x) => [x.name, x.value]));
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, locale: "zh-CN" });
  await ctx.addInitScript((s) => { for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v); }, ls);
  await ctx.route(/\/xf-api\//, (r) => r.fulfill({ status: 200, contentType: "application/json", body: '{"success":false,"code":404,"result":null,"message":"not in HAR"}' }));
  await ctx.routeFromHAR(harPath, { url: /\/xf-api\//, notFound: "fallback" });
  // Same allow-list gate as everywhere else; non-allowed requests are aborted (never sent anywhere).
  const WL = JSON.parse(readFileSync("out/whitelist-confirmed.json", "utf8"));
  const allow = new Set(WL.allow.map((a) => a.method + " " + a.url));
  await ctx.route(/\/xf-api\//, (r) => {
    const q = r.request(); const p = new URL(q.url()).pathname.replace(/^\/xf-api/, "");
    if (allow.has(q.method() + " " + p) || (WL.allowPrefix ?? []).some((x) => x.method === q.method() && p.startsWith(x.prefix))) return r.fallback();
    return r.abort();
  });
  const page = await ctx.newPage();
  const requests = new Set();
  page.on("request", (r) => { const u = r.url(); if (u.includes("/xf-api/") && !u.includes("/sys/common/static/")) requests.add(r.method() + " " + new URL(u).pathname); });
  await page.goto(origin + "/__shell_probe__", { waitUntil: "load", timeout: 60000 }).catch(() => {});
  // Wait as long as verify-confirm does (stabilisation up to 30 s) plus a margin, so timer-driven shell requests show up.
  await page.waitForTimeout(12000);
  out[key] = { finalUrl: page.url().replace(origin, ""), requests: [...requests].sort() };
  console.log(key, "→", out[key].finalUrl, out[key].requests.length, "requests");
  await ctx.close();
}
writeFileSync("out/shell-baseline.json", JSON.stringify(out, null, 1));
await browser.close();
servers.forEach((s) => s.close());
