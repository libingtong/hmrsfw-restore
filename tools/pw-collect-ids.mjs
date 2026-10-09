// Collect real detail ids from list pages (headless, allow-list filtered). Writes out/confirm-ids.json (ids only).
import { chromium } from "playwright";
import { readFileSync, writeFileSync, appendFileSync } from "node:fs";
const WL = JSON.parse(readFileSync("out/whitelist-confirmed.json", "utf8"));
const allow = new Set(WL.allow.map((a) => a.method + " " + a.url)); const prefixes = WL.allowPrefix ?? [];
const browser = await chromium.launch();
const ctx = await browser.newContext({ storageState: ".auth/pw-portal.json", viewport: { width: 1920, height: 1080 } });
await ctx.route(/\/xf-api\//, (r) => { const q = r.request(); const p = new URL(q.url()).pathname.replace(/^\/xf-api/, ""); if (allow.has(q.method() + " " + p) || prefixes.some((x) => x.method === q.method() && p.startsWith(x.prefix))) return r.continue(); appendFileSync("out/blocked-requests.jsonl", JSON.stringify({ t: new Date().toISOString(), phase: "collect-ids", action: "aborted", method: q.method(), path: p }) + "\n"); return r.abort(); });
const page = await ctx.newPage(); const out = {};
for (const [list, pattern] of [["/sceneFairList", /sceneFairDetail\/(\d+)/], ["/outFairList", /outFairDetail\/(\d+)/], ["/webFairList", /webFairDetail\/(\d+)/], ["/talents/fairList", /outFairDetail\/(\d+)/]]) {
  await page.goto("https://hamiwebportaltest.rencaidanao.com" + list, { waitUntil: "load" }); await page.waitForTimeout(6000);
  const html = await page.content(); const ids = [...new Set([...html.matchAll(new RegExp(pattern, "g"))].map((m) => m[1]))];
  out[list] = ids.slice(0, 3); console.log(list, "ids found:", ids.length);
}
writeFileSync("out/confirm-ids.json", JSON.stringify(out, null, 1)); await browser.close();
