// Machine verification: original (legacy-dist static) vs restored (skeleton build) under the same HAR replay.
//   node tools/verify.mjs <site: portal|usercenter> <group: a|b> [ids...]
// Outputs out/verify/<site>-<group>/<id>.json + screenshots + diff pngs.
import { chromium } from "playwright";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { createServer } from "node:http";
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync, readdirSync } from "node:fs";
import path from "node:path";

const [site, group, ...only] = process.argv.slice(2);
const app = site === "portal" ? "portal" : "uc";
const samples = JSON.parse(readFileSync("tools/samples.json", "utf8"))[site];
const routes = JSON.parse(readFileSync("out/capture-routes.json", "utf8"))[site]; // id -> full route with query
const ORIG_DIR = path.resolve(`legacy-dist/${site}`);
const REST_DIR = path.resolve(`skeleton/dist/${app}-${group}`);
const MIME = { ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf", ".html": "text/html", ".mp4": "video/mp4", ".webp": "image/webp" };
function serve(dir, port) {
  return new Promise((resolve) => {
    const srv = createServer((req, res) => {
      const u = decodeURIComponent(req.url.split("?")[0]);
      let f = path.join(dir, u);
      if (!existsSync(f) || statSync(f).isDirectory()) f = path.join(dir, "index.html"); // SPA fallback
      res.setHeader("content-type", MIME[path.extname(f)] ?? "application/octet-stream");
      res.end(readFileSync(f));
    }).listen(port, "127.0.0.1", () => resolve(srv));
  });
}
const ORIG_PORT = 4601, REST_PORT = 4602;
const origSrv = await serve(ORIG_DIR, ORIG_PORT), restSrv = await serve(REST_DIR, REST_PORT);
const outDir = `out/verify/${site}-${group}`; mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
const storage = { orig: JSON.parse(readFileSync(`.auth/${site}-original.json`, "utf8")), rest: JSON.parse(readFileSync(`.auth/${site}-restored.json`, "utf8")) };

async function load(kind, id, route) {
  const port = kind === "orig" ? ORIG_PORT : REST_PORT;
  const origin = `http://127.0.0.1:${port}`;
  const harId = route.replace(/[^\w]+/g, "_").replace(/^_|_$/g, "");
  const har = JSON.parse(readFileSync(`har/${site}/${harId}.har`, "utf8"));
  for (const e of har.log.entries) e.request.url = e.request.url.replace("http://__ORIGIN__", origin);
  const harPath = `${outDir}/${id}.${kind}.har`; writeFileSync(harPath, JSON.stringify(har));
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, locale: "zh-CN" });
  const st = storage[kind];
  await context.addInitScript((s) => { for (const [k, v] of Object.entries(s.localStorage)) localStorage.setItem(k, v); for (const [k, v] of Object.entries(s.sessionStorage)) sessionStorage.setItem(k, v); }, st);
  // requests not in the HAR get a deterministic stub (same for both sides) instead of a network error, and are listed
  const notInHar = [];
  await context.route(/\/xf-api\//, (r) => { notInHar.push(r.request().method() + " " + r.request().url().replace(origin, "").split("?")[0]); r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: false, code: 404, result: null, message: "not in HAR" }) }); });
  await context.routeFromHAR(harPath, { url: /\/xf-api\//, notFound: "fallback", update: false });
  const page = await context.newPage();
  const requests = [], aborted = [], errors = [];
  page.on("request", (r) => { if (r.url().includes("/xf-api/")) requests.push({ method: r.method(), url: r.url().replace(origin, ""), postData: r.postData() }); });
  page.on("requestfailed", (r) => { if (r.url().includes("/xf-api/")) aborted.push(r.method() + " " + r.url().replace(origin, "").split("?")[0]); });
  page.on("pageerror", (e) => errors.push(String(e.message).slice(0, 200)));
  page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text().slice(0, 200)); });
  await page.goto(origin + route, { waitUntil: "load", timeout: 60000 });
  // wait until the page text is stable
  let last = -1, stable = 0; const t0 = Date.now();
  while (Date.now() - t0 < 30000) { await page.waitForTimeout(1000); const len = await page.evaluate(() => document.body.innerText.length); if (len === last) stable++; else stable = 0; last = len; if (stable >= 3) break; }
  // the page component root: original = first element child of <main> (or #app > .content area), restored = #poc-main > *
  const sel = kind === "rest" ? "#poc-main > *" : (site === "portal" ? "main > *" : "main.ant-layout-content .overscoll > div > *");
  const el = await page.$(sel);
  const box = el ? await el.boundingBox() : null;
  const html = el ? await el.evaluate((n) => { const c = n.cloneNode(true); c.querySelectorAll(".setAb2").forEach((x) => { x.innerHTML = "[slide-captcha: skeleton stub, excluded]"; }); return c.outerHTML; }).then((h) => h.replace(/data-v-[a-f0-9]+/g, "data-v-x").replace(/( data-v-x="")+/g, " data-v-x=\"\"").replace(/<defs><style><\/style><\/defs>/g, "").replace(/\s+/g, " ")) : "";
  const text = el ? await el.evaluate((n) => n.innerText) : "";
  const shot = `${outDir}/${id}.${kind}.png`;
  if (el && box && box.width > 0 && box.height > 0) await el.screenshot({ path: shot }); else await page.screenshot({ path: shot, fullPage: false });
  await context.close();
  return { requests, aborted: [...aborted, ...notInHar.map((x) => "STUB " + x)], errors, box, html, text, shot, textLength: last };
}
function diff(a, b, out) {
  const A = PNG.sync.read(readFileSync(a)), B = PNG.sync.read(readFileSync(b));
  const w = Math.max(A.width, B.width), h = Math.max(A.height, B.height);
  const pad = (img) => { const p = new PNG({ width: w, height: h }); p.data.fill(255); PNG.bitblt(img, p, 0, 0, img.width, img.height, 0, 0); return p; };
  const PA = pad(A), PB = pad(B), D = new PNG({ width: w, height: h });
  const n = pixelmatch(PA.data, PB.data, D.data, w, h, { threshold: 0.1 });
  writeFileSync(out, PNG.sync.write(D));
  return { diffPixels: n, total: w * h, ratio: n / (w * h), sizeA: [A.width, A.height], sizeB: [B.width, B.height] };
}
// App-level (global) calls = requests present in every HAR of the site; they are not part of the page comparison
const harFiles = readdirSync(`har/${site}`).filter((f) => f.endsWith(".har"));
const perHar = harFiles.map((f) => new Set(JSON.parse(readFileSync(`har/${site}/${f}`, "utf8")).log.entries.map((e) => e.request.method + " " + e.request.url.replace("http://__ORIGIN__", "").split("?")[0])));
const GLOBAL = new Set([...perHar[0]].filter((x) => perHar.every((h) => h.has(x))));
const isStatic = (x) => /\/sys\/common\/static\//.test(x);
const results = [];
for (const s of samples) {
  if (only.length && !only.includes(s.id)) continue;
  const route = routes[s.id];
  const o = await load("orig", s.id, route), r = await load("rest", s.id, route);
  const d = diff(o.shot, r.shot, `${outDir}/${s.id}.diff.png`);
  const seq = (reqs) => reqs.map((x) => x.method + " " + x.url.split("?")[0]).filter((x) => !/getSysUserByToken|queryNoReaded/.test(x) && !GLOBAL.has(x) && !isStatic(x));
  const so = seq(o.requests), sr = seq(r.requests);
  const missing = so.filter((x) => !sr.includes(x)), extra = sr.filter((x) => !so.includes(x));
  const pass = o.html === r.html && o.text === r.text && missing.length === 0 && extra.length === 0 && d.ratio <= 0.005;
  const res = { id: s.id, route: route.split("?")[0], pass, screenshot: d, textSame: o.text === r.text, textLen: [o.text.length, r.text.length], htmlSame: o.html === r.html, requests: { original: so.length, restored: sr.length, missing: [...new Set(missing)], extra: [...new Set(extra)], sameSet: missing.length === 0 && extra.length === 0, originalSeq: so, restoredSeq: sr }, aborted: { original: o.aborted, restored: r.aborted }, errors: { original: o.errors.slice(0, 5), restored: r.errors.slice(0, 8) } };
  writeFileSync(`${outDir}/${s.id}.json`, JSON.stringify({ ...res, origText: o.text, restText: r.text, origHtml: o.html, restHtml: r.html }, null, 1));
  results.push(res);
  console.log(`${s.id} ${res.route}: ${pass ? "PASS" : "FAIL"} pixelDiff=${(d.ratio * 100).toFixed(2)}% size ${d.sizeA}->${d.sizeB} textSame=${res.textSame} (${res.textLen}) htmlSame=${res.htmlSame} requests same=${res.requests.sameSet} missing=${missing.length} extra=${extra.length} errors(rest)=${r.errors.length}`);
}
writeFileSync(`${outDir}/summary.json`, JSON.stringify(results, null, 1));
await browser.close(); origSrv.close(); restSrv.close();
