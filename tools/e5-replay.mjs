// E5 acceptance (batch-plan.md §2 E5, docs/pipeline.md §2 "E 样式与加密"): replay a CIPHERTEXT HAR — responses keep
// their `Crypto_Opt: true` header and SM4 body, the storage state keeps its SM4-encrypted items — once against the
// original build (legacy-dist) and once against the restored hmrsfw-vue build, and compare the page. A plaintext HAR never
// reaches the decryption branch; this one only renders when the request layer decrypts exactly like the original.
// Request bodies are captured on both sides and compared after decryption with tools/har-decrypt.mjs (SM2 bodies are
// randomized, so ciphertexts never compare equal); without SM2_PRIVATE_KEY only "was it encrypted" is compared.
// Also used to screenshot-compare styles written by tools/css-by-scope.mjs.
//
// Nothing goes to the network: /xf-api/ is answered from the HAR (or a "not in HAR" 404), other remote hosts are aborted.
// The restored build reads its keys from the environment at build time (VITE_HMRSFW_SM2_PUBLIC_KEY, VITE_HMRSFW_SM4_KEY,
// optional VITE_HMRSFW_SM4_STORAGE_KEY — the same names as hmrsfw-vue/.env.example); keys are never printed.
//
// Usage: node tools/e5-replay.mjs [ids...] --orders <file> [--app <hmrsfw-vue>] [--har-dir <dir>] [--auth-dir <dir>]
//                                 [--label <name>] [--no-build] [--allow-missing-keys]
//   --orders     work orders with id, app|site, role, recordPath, sourceChunk (tools/confirm-orders.json, queue/*.json)
//   --har-dir    ciphertext HARs <id>.har (default $RESTORE_ASSETS/har/confirm-replay)
//   --auth-dir   storage states pw-<role>.json (default $RESTORE_ASSETS/.auth)
//   --no-build   reuse <app>/dist (otherwise `npm run build` runs first)
// Output: <$RESTORE_STATE|out>/e5/<label>/<id>.json + screenshots (they show test-environment data: never commit them),
// one line per page on stdout and a final JSON summary line. Exit 1 when a page fails.
import { chromium } from "playwright";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { createServer } from "node:http";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { appDir } from "./app-dir.mjs";
import { readEntries, decryptRequestBody, keysFromEnv, canonical, sha256 } from "./har-decrypt.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const opt = (name, dflt) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : dflt; };
const VALUED = new Set(["--orders", "--app", "--har-dir", "--auth-dir", "--label"]);
const ids = args.filter((a, i) => !a.startsWith("--") && !VALUED.has(args[i - 1]));
const ordersFile = opt("--orders"); if (!ordersFile) { console.error(JSON.stringify({ error: "--orders <file> is required" })); process.exit(2); }
const assets = process.env.RESTORE_ASSETS;
const harDir = opt("--har-dir", assets && path.join(assets, "har/confirm-replay")), authDir = opt("--auth-dir", assets && path.join(assets, ".auth"));
if (!harDir || !authDir) { console.error(JSON.stringify({ error: "set RESTORE_ASSETS or pass --har-dir and --auth-dir" })); process.exit(2); }
const APP = appDir(args);
const label = opt("--label", "default");
const outDir = path.join(process.env.RESTORE_STATE ?? path.join(ROOT, "out"), "e5", label); mkdirSync(outDir, { recursive: true });
const orders = JSON.parse(readFileSync(ordersFile, "utf8")).filter((o) => !ids.length || ids.includes(o.id));
const VITE_KEYS = ["VITE_HMRSFW_SM2_PUBLIC_KEY", "VITE_HMRSFW_SM4_KEY"];
const missingKeys = VITE_KEYS.filter((k) => !process.env[k]);
if (missingKeys.length && !args.includes("--allow-missing-keys")) { console.error(JSON.stringify({ error: `not set: ${missingKeys.join(", ")} (the restored build needs them; --allow-missing-keys for a negative control)` })); process.exit(2); }
const keys = keysFromEnv();

if (!args.includes("--no-build")) execFileSync("npm", ["run", "build"], { cwd: APP, stdio: ["ignore", "ignore", "inherit"], env: process.env });

const MIME = { ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf", ".html": "text/html", ".webp": "image/webp" };
const serve = (dir) => new Promise((ok) => { const s = createServer((req, res) => { const u = decodeURIComponent(req.url.split("?")[0]); let f = path.join(dir, u); if (!f.startsWith(dir) || !existsSync(f) || statSync(f).isDirectory()) f = path.join(dir, "index.html"); res.setHeader("content-type", MIME[path.extname(f)] ?? "application/octet-stream"); res.end(readFileSync(f)); }).listen(0, "127.0.0.1", () => ok(s)); });
const DIRS = { "portal-orig": path.join(ROOT, "legacy-dist/portal"), "uc-orig": path.join(ROOT, "legacy-dist/usercenter"), "portal-rest": path.join(APP, "dist/portal"), "uc-rest": path.join(APP, "dist/uc") };
const servers = Object.fromEntries(await Promise.all(Object.entries(DIRS).map(async ([k, d]) => [k, await serve(d)])));
const originOf = (k) => `http://127.0.0.1:${servers[k].address().port}`;
const HOST = { portal: "https://hamiwebportaltest.rencaidanao.com", usercenter: "https://hamiusercentertest.rencaidanao.com" };
const appOf = (o) => ((o.app ?? o.site) === "portal" ? "portal" : "uc");
const browser = await chromium.launch();
const norm = (h) => h.replace(/data-v-[a-f0-9]+/g, "data-v-x").replace(/( data-v-x="")+/g, ' data-v-x=""').replace(/<defs><style><\/style><\/defs>/g, "").replace(/\s+/g, " ");

// HAR answers by method + path + query; repeated identical requests take the recorded responses in order, then the last.
function harResponder(entries) {
  const byKey = new Map();
  for (const e of entries) { const u = new URL(e.url, "http://h"); const k = `${e.method} ${u.pathname}${u.search}`; if (!byKey.has(k)) byKey.set(k, []); byKey.get(k).push(e); }
  const used = new Map();
  return (method, url) => { const u = new URL(url); const k = `${method} ${u.pathname}${u.search}`; const list = byKey.get(k); if (!list) return null; const n = used.get(k) ?? 0; used.set(k, n + 1); return list[Math.min(n, list.length - 1)]; };
}

async function load(kind, o, { rootClass = null, storage = null } = {}) {
  const shellOnly = kind === "shell"; const side = shellOnly ? "orig" : kind; const key = `${appOf(o)}-${side}`; const origin = originOf(key);
  const entries = readEntries(path.join(harDir, `${o.id}.har`)); const answer = harResponder(entries);
  const st = JSON.parse(readFileSync(path.join(authDir, `pw-${o.role}.json`), "utf8"));
  const ls = storage ?? Object.fromEntries((st.origins.find((x) => x.origin === HOST[o.site])?.localStorage ?? []).map((x) => [x.name, x.value]));
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, locale: "zh-CN" });
  await ctx.addInitScript((s) => { for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v); }, ls);
  const notInHar = [], aborted = [], requests = [], bodies = [], errors = []; let cryptoServed = 0;
  await ctx.route("**/*", (r) => {
    const q = r.request(); const u = new URL(q.url());
    if (u.pathname.includes("/xf-api/")) {
      const e = answer(q.method(), q.url());
      if (!e) { notInHar.push(`${q.method()} ${u.pathname}`); return r.fulfill({ status: 200, contentType: "application/json", body: '{"success":false,"code":404,"result":null,"message":"not in HAR"}' }); }
      if (e.cryptoOpt) cryptoServed++;
      return r.fulfill({ status: e.status || 200, headers: { "content-type": "application/json;charset=UTF-8", crypto_opt: e.cryptoOpt ? "true" : "false" }, body: e.resBody });
    }
    if (u.hostname === "127.0.0.1") return r.fallback();
    aborted.push(u.hostname); return r.abort();
  });
  if (shellOnly) await ctx.route((u) => u.pathname === "/assets/" + path.basename(o.sourceChunk), (r) => r.fulfill({ status: 200, contentType: "text/javascript", body: "const c={name:'ShellProbe',setup(){window.__shellMountStorage=Object.fromEntries(Object.keys(localStorage).map((k)=>[k,localStorage.getItem(k)]));return()=>null}};export default c;export const __tla=Promise.resolve();" }));
  const page = await ctx.newPage();
  page.on("request", (r) => {
    const u = r.url(); if (!u.includes("/xf-api/") || u.includes("/sys/common/static/")) return;
    const p = new URL(u).pathname; requests.push(`${r.method()} ${p}`);
    if (r.method() !== "GET") { let d; try { d = decryptRequestBody(r.postData() ?? "", keys); d = { encrypted: d.encrypted, sha: d.value === "" ? "-" : sha256(canonical(d.value)).slice(0, 16) }; } catch (e) { d = { encrypted: true, sha: /is not set/.test(e.message) ? "no-key" : "undecryptable" }; } bodies.push(`${r.method()} ${p} enc=${d.encrypted} ${d.sha}`); }
  });
  page.on("pageerror", (e) => errors.push(String(e.message).slice(0, 120)));
  await page.goto(origin + o.recordPath, { waitUntil: "load", timeout: 60000 }).catch((e) => errors.push("goto " + e.message.slice(0, 80)));
  let last = -1, stable = 0; const t0 = Date.now(); while (Date.now() - t0 < 30000) { await page.waitForTimeout(1000); const len = await page.evaluate(() => document.body.innerText.length).catch(() => -1); stable = len === last ? stable + 1 : 0; last = len; if (stable >= 3) break; }
  const sel = side === "rest" ? "#poc-main > *" : appOf(o) === "portal" ? "main > *" : "main.ant-layout-content .overscoll > div > *";
  let el = await page.$(sel);
  if (side === "orig" && rootClass) for (const c of await page.$$(sel)) if ((await c.getAttribute("class")) === rootClass) { el = c; break; }
  const html = el ? norm(await el.evaluate((n) => n.outerHTML)) : ""; const text = el ? await el.evaluate((n) => n.innerText) : "";
  const overlay = await page.evaluate(() => [...document.querySelectorAll(".ant-modal-wrap:not([style*='display: none']) .ant-modal-content, .ant-message, .ant-notification")].map((n) => n.innerText.trim()).filter(Boolean).join(" | ")).catch(() => "");
  await page.addStyleTag({ content: ".ant-modal-root,.ant-modal-mask,.ant-modal-wrap,.ant-message,.ant-notification{visibility:hidden!important}" }).catch(() => {});
  const shot = path.join(outDir, `${o.id}.${shellOnly ? "shell" : side}.png`); if (el && (await el.boundingBox())?.height) await el.screenshot({ path: shot }); else await page.screenshot({ path: shot });
  const cls = el ? await el.getAttribute("class") : null;
  const storageAfter = await page.evaluate(() => window.__shellMountStorage ?? null).catch(() => null);
  await ctx.close();
  return { html, text, overlay, requests, bodies, notInHar, aborted, errors, shot, cls, storageAfter, cryptoServed };
}
const pixelDiff = (a, b, out) => { const A = PNG.sync.read(readFileSync(a)), B = PNG.sync.read(readFileSync(b)); const w = Math.max(A.width, B.width), h = Math.max(A.height, B.height); const pad = (i) => { const p = new PNG({ width: w, height: h }); p.data.fill(255); PNG.bitblt(i, p, 0, 0, i.width, i.height, 0, 0); return p; }; const D = new PNG({ width: w, height: h }); const n = pixelmatch(pad(A).data, pad(B).data, D.data, w, h, { threshold: 0.1 }); writeFileSync(out, PNG.sync.write(D)); return { ratio: n / (w * h), sizeA: [A.width, A.height], sizeB: [B.width, B.height] }; };

const results = [];
for (const o of orders) {
  const harEntries = readEntries(path.join(harDir, `${o.id}.har`)); const harCrypto = harEntries.filter((e) => e.cryptoOpt).length;
  const sh = await load("shell", o);
  const b = await load("rest", o, { storage: sh.storageAfter });
  const SHELL = new Set(sh.requests); const set = (x) => [...new Set(x)].filter((k) => !SHELL.has(k.split(" ").slice(0, 2).join(" "))).sort().join("\n");
  // the original has races of its own (global notes, comparison rule 5): on a mismatch it is loaded again, at most 4 more times
  let a, r, origRuns = 0;
  do {
    a = await load("orig", o, { rootClass: b.cls }); origRuns++;
    const d = pixelDiff(a.shot, b.shot, path.join(outDir, `${o.id}.diff.png`));
    r = { id: o.id, app: appOf(o), harCrypto, cryptoServed: { orig: a.cryptoServed, rest: b.cryptoServed },
      htmlSame: !!a.html && a.html === b.html, textSame: a.text === b.text, overlaySame: a.overlay === b.overlay, requestsSame: set(a.requests) === set(b.requests),
      bodiesSame: set(a.bodies) === set(b.bodies), sm2Bodies: { orig: a.bodies.filter((x) => x.includes("enc=true")).length, rest: b.bodies.filter((x) => x.includes("enc=true")).length },
      pixel: +(d.ratio * 100).toFixed(3), size: [d.sizeA, d.sizeB], notInHar: { orig: [...new Set(a.notInHar)].length, rest: [...new Set(b.notInHar)].length }, aborted: { orig: a.aborted.length, rest: b.aborted.length }, errors: { orig: a.errors.slice(0, 3), rest: b.errors.slice(0, 3) }, origRuns };
    r.pass = r.htmlSame && r.textSame && r.overlaySame && r.requestsSame && r.bodiesSame && r.pixel <= 0.5;
  } while (!r.pass && origRuns < 5);
  // page outputs (HTML/text) stay under outDir only; they hold test-environment data
  writeFileSync(path.join(outDir, `${o.id}.json`), JSON.stringify({ ...r, origHtml: a.html, restHtml: b.html, origBodies: a.bodies, restBodies: b.bodies }, null, 1));
  results.push(r);
  console.log(`${o.id} ${r.pass ? "PASS" : "FAIL"} harCrypto=${harCrypto} served(orig/rest)=${a.cryptoServed}/${b.cryptoServed} html=${r.htmlSame} text=${r.textSame} req=${r.requestsSame} bodies=${r.bodiesSame} pixel=${r.pixel}% origRuns=${origRuns}`);
}
await browser.close(); Object.values(servers).forEach((s) => s.close());
const summary = { label, pages: results.length, pass: results.filter((r) => r.pass).length, cryptoPages: results.filter((r) => r.harCrypto > 0).length, cryptoPagesPass: results.filter((r) => r.harCrypto > 0 && r.pass).length, restConsumedCrypto: results.filter((r) => r.cryptoServed.rest > 0).length, restConsumedCryptoPass: results.filter((r) => r.cryptoServed.rest > 0 && r.pass).length, sm2Key: !!keys.sm2PrivateKey, missingBuildKeys: missingKeys, out: outDir };
writeFileSync(path.join(outDir, "summary.json"), JSON.stringify({ ...summary, results }, null, 1));
console.log(JSON.stringify(summary));
process.exitCode = summary.pass === summary.pages ? 0 : 1;
