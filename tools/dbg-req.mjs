// Show /xf-api requests (with query) for one page on original vs restored build, HAR match status (POC debugging aid).
// Usage: node tools/dbg-req.mjs <portal|usercenter> <id> [--app <hmrsfw-vue checkout>]   restored build: <app>/dist/<portal|uc>
// Run from the POC directory (reads out/capture-routes.json, har/, .auth/ there).
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { appDir } from "./app-dir.mjs";
const [site, id] = process.argv.slice(2).filter((a, i, all) => !a.startsWith("--") && all[i - 1] !== "--app");
const app = site === "portal" ? "portal" : "uc";
const route = JSON.parse(readFileSync("out/capture-routes.json", "utf8"))[site][id];
const harId = route.replace(/[^\w]+/g, "_").replace(/^_|_$/g, "");
const MIME = { ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".html": "text/html" };
const serve = (dir, port) => createServer((req, res) => { const u = decodeURIComponent(req.url.split("?")[0]); let f = path.join(dir, u); if (!existsSync(f) || statSync(f).isDirectory()) f = path.join(dir, "index.html"); res.setHeader("content-type", MIME[path.extname(f)] ?? "application/octet-stream"); res.end(readFileSync(f)); }).listen(port, "127.0.0.1");
const s1 = serve(path.resolve(`legacy-dist/${site}`), 4621), s2 = serve(path.join(appDir(), "dist", app), 4622);
const browser = await chromium.launch();
for (const [kind, port] of [["orig", 4621], ["rest", 4622]]) {
  const origin = `http://127.0.0.1:${port}`;
  const har = JSON.parse(readFileSync(`har/${site}/${harId}.har`, "utf8")); const harUrls = new Set(har.log.entries.map((e) => e.request.method + " " + e.request.url.replace("http://__ORIGIN__", "")));
  for (const e of har.log.entries) e.request.url = e.request.url.replace("http://__ORIGIN__", origin); writeFileSync(`/tmp/dbg-${kind}.har`, JSON.stringify(har));
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const st = JSON.parse(readFileSync(`.auth/${site}-${kind === "orig" ? "original" : "restored"}.json`, "utf8"));
  await ctx.addInitScript((s) => { for (const [k, v] of Object.entries(s.localStorage)) localStorage.setItem(k, v); for (const [k, v] of Object.entries(s.sessionStorage)) sessionStorage.setItem(k, v); }, st);
  await ctx.route(/\/xf-api\//, (r) => r.fulfill({ status: 200, contentType: "application/json", body: '{"success":false,"result":null}' }));
  await ctx.routeFromHAR(`/tmp/dbg-${kind}.har`, { url: /\/xf-api\//, notFound: "fallback" });
  const page = await ctx.newPage(); const seen = [];
  page.on("request", (r) => { const u = r.url().replace(origin, ""); if (u.includes("/xf-api/") && !u.includes("/sys/common/static/")) seen.push(`${harUrls.has(r.method() + " " + u) ? "HAR " : "MISS"} ${r.method()} ${u.slice(0, 170)}`); });
  page.on("pageerror", (e) => seen.push("PAGEERROR " + String(e.message).slice(0, 150)));
  await page.goto(origin + route); await page.waitForTimeout(7000);
  console.log(`--- ${kind}\n` + seen.join("\n"));
  await ctx.close();
}
await browser.close(); s1.close(); s2.close();
