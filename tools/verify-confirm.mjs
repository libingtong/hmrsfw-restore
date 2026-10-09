// Replay comparison for the 20-page confirmation: original (legacy-dist) vs restored (skeleton/dist/<app>-<group>),
// same ciphertext HAR (har/confirm-replay/<id>.har), same ORIGINAL encrypted storage state (.auth/pw-<role>.json).
// Allow-list enforced at replay too: non-allowed /xf-api/ requests are aborted and logged.
// Usage: node tools/verify-confirm.mjs <group: s|h> [ids...]   → out/verify-confirm/<group>/<id>.json (+ png)
import { chromium } from "playwright";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { createServer } from "node:http";
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync, appendFileSync } from "node:fs";
import path from "node:path";
const [group, ...only] = process.argv.slice(2);
const orders = JSON.parse(readFileSync("tools/confirm-orders.json", "utf8")).filter((o) => !only.length || only.includes(o.id));
const WL = JSON.parse(readFileSync("out/whitelist-confirmed.json", "utf8"));
const allow = new Set(WL.allow.map((a) => a.method + " " + a.url)); const prefixes = WL.allowPrefix ?? [];
// 2026-10-09: the user decided the whitelist is no longer needed (the test environment can be reset).
// HMRSFW_NO_WHITELIST=1 lets every request through at recording; replay/interaction still never reach the network.
const NO_WHITELIST = process.env.HMRSFW_NO_WHITELIST === "1";
const allowed = (m, p) => NO_WHITELIST || allow.has(m + " " + p) || prefixes.some((x) => x.method === m && p.startsWith(x.prefix));
const MIME = { ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf", ".html": "text/html", ".webp": "image/webp" };
const serve = (dir, port) => new Promise((ok) => { const s = createServer((req, res) => { const u = decodeURIComponent(req.url.split("?")[0]); let f = path.join(dir, u); if (!existsSync(f) || statSync(f).isDirectory()) f = path.join(dir, "index.html"); res.setHeader("content-type", MIME[path.extname(f)] ?? "application/octet-stream"); res.end(readFileSync(f)); }).listen(port, "127.0.0.1", () => ok(s)); });
const servers = {
  "portal-orig": await serve(path.resolve("legacy-dist/portal"), 4701), "uc-orig": await serve(path.resolve("legacy-dist/usercenter"), 4702),
  "portal-rest": await serve(path.resolve(`skeleton/dist/portal-${group}`), 4703), "uc-rest": await serve(path.resolve(`skeleton/dist/uc-${group}`), 4704),
};
const PORT = { "portal-orig": 4701, "uc-orig": 4702, "portal-rest": 4703, "uc-rest": 4704 };
const HOST = { portal: "https://hamiwebportaltest.rencaidanao.com", usercenter: "https://hamiusercentertest.rencaidanao.com" };
const outDir = `out/verify-confirm/${group}`; mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
const norm = (h) => h.replace(/data-v-[a-f0-9]+/g, "data-v-x").replace(/( data-v-x="")+/g, ' data-v-x=""').replace(/<defs><style><\/style><\/defs>/g, "").replace(/\s+/g, " ");
async function load(kind, o, rootClass = null, storageOverride = null) {
  const shellOnly = kind === "shell"; if (shellOnly) kind = "orig";
  const key = (o.app === "portal" ? "portal" : "uc") + "-" + kind; const origin = `http://127.0.0.1:${PORT[key]}`;
  const har = JSON.parse(readFileSync(`har/confirm-replay/${o.id}.har`, "utf8")); for (const e of har.log.entries) e.request.url = e.request.url.replace("http://__ORIGIN__", origin);
  const harPath = `${outDir}/${o.id}.${shellOnly ? "shell" : kind}.har`; writeFileSync(harPath, JSON.stringify(har));
  const st = JSON.parse(readFileSync(`.auth/pw-${o.role}.json`, "utf8")); const ls = storageOverride ?? Object.fromEntries((st.origins.find((x) => x.origin === HOST[o.site])?.localStorage ?? []).map((x) => [x.name, x.value]));
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, locale: "zh-CN" });
  await ctx.addInitScript((s) => { for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v); }, ls);
  const notInHar = [], blocked = [], requests = [], errors = [];
  await ctx.route(/\/xf-api\//, (r) => { notInHar.push(r.request().method() + " " + new URL(r.request().url()).pathname); r.fulfill({ status: 200, contentType: "application/json", body: '{"success":false,"code":404,"result":null,"message":"not in HAR"}' }); });
  await ctx.routeFromHAR(harPath, { url: /\/xf-api\//, notFound: "fallback" });
  await ctx.route(/\/xf-api\//, (r) => { const q = r.request(); const p = new URL(q.url()).pathname.replace(/^\/xf-api/, ""); if (allowed(q.method(), p)) return r.fallback(); const rec = { t: new Date().toISOString(), phase: `replay:${group}:${o.id}:${kind}`, action: "aborted", method: q.method(), path: p }; blocked.push(rec); appendFileSync("out/blocked-requests.jsonl", JSON.stringify(rec) + "\n"); return r.abort(); });
  // Shell baseline: block the page's own chunk so only the app shell (layout, header, polling) runs.
  // The chunk is replaced by an empty component (not aborted): a failed chunk load would abort the first navigation and
  // the layout would never mount.
  if (shellOnly) await ctx.route((u) => u.pathname === "/assets/" + path.basename(o.sourceChunk), (r) => r.fulfill({ status: 200, contentType: "text/javascript", body: "const c={name:'ShellProbe',setup(){window.__shellMountStorage=Object.fromEntries(Object.keys(localStorage).map((k)=>[k,localStorage.getItem(k)]));return()=>null}};export default c;export const __tla=Promise.resolve();" }));
  const page = await ctx.newPage();
  page.on("request", (r) => { const u = r.url(); if (u.includes("/xf-api/") && !u.includes("/sys/common/static/")) requests.push(r.method() + " " + new URL(u).pathname); });
  page.on("pageerror", (e) => errors.push(String(e.message).slice(0, 120) + " @ " + String(e.stack).split("\n").slice(1, 3).map((l) => l.trim().replace(/http:\/\/127.0.0.1:\d+/, "")).join(" < ")));
  await page.goto(origin + o.recordPath, { waitUntil: "load", timeout: 60000 }).catch((e) => errors.push("goto " + e.message.slice(0, 80)));
  let last = -1, stable = 0; const t0 = Date.now(); while (Date.now() - t0 < 30000) { await page.waitForTimeout(1000); const len = await page.evaluate(() => document.body.innerText.length).catch(() => -1); stable = len === last ? stable + 1 : 0; last = len; if (stable >= 3) break; }
  const sel = kind === "rest" ? "#poc-main > *" : o.app === "portal" ? "main > *" : "main.ant-layout-content .overscoll > div > *";
  // In some layouts (e.g. the talents sub-site) shell elements such as the header live inside <main> too; on the
  // original side pick the child whose class matches the restored page root, falling back to the first child.
  let el = await page.$(sel);
  if (kind === "orig" && rootClass) for (const c of await page.$$(sel)) if ((await c.getAttribute("class")) === rootClass) { el = c; break; } const html = el ? norm(await el.evaluate((n) => n.outerHTML)) : ""; const text = el ? await el.evaluate((n) => n.innerText) : "";
  // Fixed overlays (modal, mask, message, notification) are positioned against the viewport, while the page element
  // sits lower in the original (its layout header is above it); compare overlay TEXT separately and hide overlays
  // before the element screenshot so the pixel check covers only the page itself.
  const overlay = await page.evaluate(() => [...document.querySelectorAll(".ant-modal-wrap:not([style*='display: none']) .ant-modal-content, .ant-message, .ant-notification")].map((n) => n.innerText.trim()).filter(Boolean).join(" | ")).catch(() => "");
  await page.addStyleTag({ content: ".ant-modal-root,.ant-modal-mask,.ant-modal-wrap,.ant-message,.ant-notification{visibility:hidden!important}" }).catch(() => {});
  const shot = `${outDir}/${o.id}.${shellOnly ? "shell" : kind}.png`; if (el && (await el.boundingBox())?.height) await el.screenshot({ path: shot }); else await page.screenshot({ path: shot });
  const cls = el ? await el.getAttribute("class") : null;
  // Storage as the page component saw it at mount time (snapshot taken by the stub in the shell-only run).
  const storageAfter = await page.evaluate(() => window.__shellMountStorage ?? null).catch(() => null);
  await ctx.close();
  return { html, text, requests, notInHar, blocked, errors, shot, cls, storageAfter, overlay };
}
const diff = (a, b, out) => { const A = PNG.sync.read(readFileSync(a)), B = PNG.sync.read(readFileSync(b)); const w = Math.max(A.width, B.width), h = Math.max(A.height, B.height); const pad = (i) => { const p = new PNG({ width: w, height: h }); p.data.fill(255); PNG.bitblt(i, p, 0, 0, i.width, i.height, 0, 0); return p; }; const D = new PNG({ width: w, height: h }); const n = pixelmatch(pad(A).data, pad(B).data, D.data, w, h, { threshold: 0.1 }); writeFileSync(out, PNG.sync.write(D)); return { ratio: n / (w * h), sizeA: [A.width, A.height], sizeB: [B.width, B.height] }; };
// App-shell requests are measured per page: the original build is loaded once more on the same route with the page
// chunk blocked; whatever /xf-api/ requests still fire belong to the shell (the restored skeleton has no shell).
// They are removed from BOTH sides before comparing.
const results = [];
for (const o of orders) {
  // The shell-only run goes first: the original shell rewrites localStorage from live-session responses (e.g. the
  // current role, user/corp info). The restored skeleton has no shell, so it starts from the storage the shell left,
  // which is exactly what the original page component saw when it mounted. (Storage stays in memory, never on disk.)
  const sh = await load("shell", o);
  const b = await load("rest", o, null, sh.storageAfter), a = await load("orig", o, b.cls);
  const SHELL = new Set(sh.requests);
  const d = diff(a.shot, b.shot, `${outDir}/${o.id}.diff.png`);
  const set = (x) => [...new Set(x)].filter((k) => !SHELL.has(k)).sort().join("\n");
  const pass = !!a.html && a.html === b.html && a.text === b.text && a.overlay === b.overlay && set(a.requests) === set(b.requests) && d.ratio <= 0.005;
  const r = { id: o.id, group, pass, htmlSame: a.html === b.html, textSame: a.text === b.text, overlaySame: a.overlay === b.overlay, overlay: a.overlay.slice(0, 120), requestsSame: set(a.requests) === set(b.requests), pixel: +(d.ratio * 100).toFixed(3), size: [d.sizeA, d.sizeB], origEmpty: !a.html, blocked: { orig: a.blocked.length, rest: b.blocked.length }, notInHar: { orig: [...new Set(a.notInHar)], rest: [...new Set(b.notInHar)] }, errors: { orig: a.errors.slice(0, 4), rest: b.errors.slice(0, 6) } };
  writeFileSync(`${outDir}/${o.id}.json`, JSON.stringify({ ...r, origHtml: a.html, restHtml: b.html, origText: a.text, restText: b.text, origReq: a.requests, restReq: b.requests, shellReq: [...SHELL].sort() }, null, 1));
  results.push(r); console.log(`${o.id} ${pass ? "PASS" : "FAIL"} html=${r.htmlSame} text=${r.textSame} req=${r.requestsSame} pixel=${r.pixel}% origEmpty=${r.origEmpty} errRest=${b.errors.length}`);
}
writeFileSync(`${outDir}/summary.json`, JSON.stringify(results, null, 1));
await browser.close(); Object.values(servers).forEach((s) => s.close());
