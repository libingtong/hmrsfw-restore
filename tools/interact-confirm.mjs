// Interaction comparison (plan §4.2): original vs restored run the SAME scripted actions under replay.
// Every /xf-api/ request of every method is intercepted: method, path, query and (SM2-decrypted, canonical) body are logged.
// Allow-listed reads are answered from the HAR (or a "not in HAR" stub, identical on both sides); everything else is aborted
// and logged as a blocked write. Nothing reaches the test environment: there is no network fallback for /xf-api/.
// Pass = same post-action request sequence (incl. canonical bodies) + same post-action DOM/text + 0 writes sent.
// Usage: SM2_PRIVATE_KEY=... node tools/interact-confirm.mjs <group: s|h> [ids...]   → out/interact-confirm/<group>/<id>.json
// Decrypted bodies are kept in memory only; the JSON report stores a SHA-256 of each canonical body, never the body.
import { chromium } from "playwright";
import { createServer } from "node:http";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync, appendFileSync } from "node:fs";
import path from "node:path";
import { decryptBody, canonical } from "./sm2-body.mjs";
import { SCRIPTS } from "./interact-scripts.mjs";

const [group, ...only] = process.argv.slice(2);
const orders = JSON.parse(readFileSync("tools/confirm-orders.json", "utf8")).filter((o) => SCRIPTS[o.id] && (!only.length || only.includes(o.id)));
const WL = JSON.parse(readFileSync("out/whitelist-confirmed.json", "utf8"));
const allow = new Set(WL.allow.map((a) => a.method + " " + a.url));
const prefixes = WL.allowPrefix ?? [];
// 2026-10-09: the user decided the whitelist is no longer needed (the test environment can be reset).
// HMRSFW_NO_WHITELIST=1 lets every request through at recording; replay/interaction still never reach the network.
const NO_WHITELIST = process.env.HMRSFW_NO_WHITELIST === "1";
const allowed = (m, p) => NO_WHITELIST || allow.has(m + " " + p) || prefixes.some((x) => x.method === m && p.startsWith(x.prefix));
const MIME = { ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf", ".html": "text/html", ".webp": "image/webp" };
const serve = (dir, port) => new Promise((ok) => {
  const s = createServer((req, res) => {
    const u = decodeURIComponent(req.url.split("?")[0]);
    let f = path.join(dir, u);
    if (!existsSync(f) || statSync(f).isDirectory()) f = path.join(dir, "index.html");
    res.setHeader("content-type", MIME[path.extname(f)] ?? "application/octet-stream");
    res.end(readFileSync(f));
  }).listen(port, "127.0.0.1", () => ok(s));
});
const PORT = { "portal-orig": 4711, "uc-orig": 4712, "portal-rest": 4713, "uc-rest": 4714 };
const servers = [
  await serve(path.resolve("legacy-dist/portal"), PORT["portal-orig"]), await serve(path.resolve("legacy-dist/usercenter"), PORT["uc-orig"]),
  await serve(path.resolve(`skeleton/dist/portal-${group}`), PORT["portal-rest"]), await serve(path.resolve(`skeleton/dist/uc-${group}`), PORT["uc-rest"]),
];
const HOST = { portal: "https://hamiwebportaltest.rencaidanao.com", usercenter: "https://hamiusercentertest.rencaidanao.com" };
const outDir = `out/interact-confirm/${group}`;
mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
const norm = (h) => h.replace(/data-v-[a-f0-9]+/g, "data-v-x").replace(/( data-v-x="")+/g, ' data-v-x=""').replace(/<defs><style><\/style><\/defs>/g, "").replace(/\s+/g, " ");
const sha = (s) => createHash("sha256").update(s).digest("hex").slice(0, 16);

// Request body → canonical text (SM2 ciphertext is decrypted in memory first).
function bodyOf(req) {
  const raw = req.postData();
  if (!raw) return { kind: "none", canon: "" };
  const hex = raw.replace(/^"|"$/g, "");
  if (/^(04)?[0-9a-f]{192,}$/i.test(hex)) {
    try { return { kind: "sm2", canon: canonical(decryptBody(hex)) }; } catch (e) { return { kind: "sm2-undecryptable", canon: "?" + e.message }; }
  }
  let parsed;
  try { parsed = JSON.parse(raw); } catch { return { kind: "text", canon: raw }; }
  // Encrypted POSTs (URL in localStorage "funcs") send { data: "<SM2 hex>" }; compare the decrypted payload instead.
  if (parsed && typeof parsed === "object" && typeof parsed.data === "string" && /^(04)?[0-9a-f]{192,}$/i.test(parsed.data)) {
    try { return { kind: "sm2", canon: canonical({ ...parsed, data: decryptBody(parsed.data) }) }; } catch (e) { return { kind: "sm2-undecryptable", canon: "?" + e.message }; }
  }
  return { kind: "json", canon: canonical(parsed) };
}
const queryOf = (u) => { const q = new URL(u).searchParams; q.delete("_t"); return canonical(Object.fromEntries([...q].sort())); };

// Text with optional whitespace between characters (antd inserts a space into two-character button labels).
const looseText = (t) => new RegExp("^\\s*" + [...t].map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("\\s*") + "\\s*$");
async function step(page, s) {
  if (s.fill) await page.getByPlaceholder(s.fill[0], { exact: true }).first().fill(s.fill[1]);
  else if (s.click || s.clickSel) {
    const all = s.click ? page.locator("button, a, .ant-tabs-tab, li, span, div").filter({ hasText: looseText(s.click) }) : page.locator(s.clickSel);
    let target = null;
    for (const h of await all.all()) if (await h.isVisible()) target = h; // last visible match = innermost element
    if (!target) { if (s.optional) return "absent"; throw new Error("no visible target for " + (s.click ?? s.clickSel)); }
    await target.click({ timeout: 5000 });
  }
  else if (s.press) await page.keyboard.press(s.press);
  await page.waitForTimeout(s.wait ?? 1200);
  return null;
}

// Storage as the original page component sees it at mount time: run the original once with the page chunk replaced
// by a stub that snapshots localStorage in setup (the shell may rewrite role/user/corp info from live responses).
async function shellStorage(o) {
  const origin = `http://127.0.0.1:${PORT[(o.app === "portal" ? "portal" : "uc") + "-orig"]}`;
  const har = JSON.parse(readFileSync(`har/confirm-replay/${o.id}.har`, "utf8"));
  for (const e of har.log.entries) e.request.url = e.request.url.replace("http://__ORIGIN__", origin);
  const harPath = `${outDir}/${o.id}.shell.har`;
  writeFileSync(harPath, JSON.stringify(har));
  const st = JSON.parse(readFileSync(`.auth/pw-${o.role}.json`, "utf8"));
  const ls = storageOverride ?? Object.fromEntries((st.origins.find((x) => x.origin === HOST[o.site])?.localStorage ?? []).map((x) => [x.name, x.value]));
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, locale: "zh-CN" });
  await ctx.addInitScript((s) => { for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v); }, ls);
  await ctx.route(/\/xf-api\//, (r) => r.fulfill({ status: 200, contentType: "application/json", body: '{"success":false,"code":404,"result":null,"message":"not in HAR"}' }));
  await ctx.routeFromHAR(harPath, { url: /\/xf-api\//, notFound: "fallback" });
  await ctx.route((u) => u.pathname === "/assets/" + path.basename(o.sourceChunk), (r) => r.fulfill({ status: 200, contentType: "text/javascript", body: "const c={name:'ShellProbe',setup(){window.__shellMountStorage=Object.fromEntries(Object.keys(localStorage).map((k)=>[k,localStorage.getItem(k)]));return()=>null}};export default c;export const __tla=Promise.resolve();" }));
  const page = await ctx.newPage();
  await page.goto(origin + o.recordPath, { waitUntil: "load", timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(6000);
  const snap = await page.evaluate(() => window.__shellMountStorage ?? null).catch(() => null);
  await ctx.close();
  return snap;
}

async function run(kind, o, storageOverride = null) {
  const key = (o.app === "portal" ? "portal" : "uc") + "-" + kind;
  const origin = `http://127.0.0.1:${PORT[key]}`;
  const har = JSON.parse(readFileSync(`har/confirm-replay/${o.id}.har`, "utf8"));
  for (const e of har.log.entries) e.request.url = e.request.url.replace("http://__ORIGIN__", origin);
  const harPath = `${outDir}/${o.id}.${kind}.har`;
  writeFileSync(harPath, JSON.stringify(har));
  const st = JSON.parse(readFileSync(`.auth/pw-${o.role}.json`, "utf8"));
  const ls = Object.fromEntries((st.origins.find((x) => x.origin === HOST[o.site])?.localStorage ?? []).map((x) => [x.name, x.value]));
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, locale: "zh-CN" });
  await ctx.addInitScript((s) => { for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v); }, ls);
  const log = [], blocked = [], errors = [];
  let phase = "load";
  // Last-registered route runs first: log + allow-list gate → HAR → "not in HAR" stub. No route ever reaches the network.
  await ctx.route(/\/xf-api\//, (r) => r.fulfill({ status: 200, contentType: "application/json", body: '{"success":false,"code":404,"result":null,"message":"not in HAR"}' }));
  await ctx.routeFromHAR(harPath, { url: /\/xf-api\//, notFound: "fallback" });
  await ctx.route(/\/xf-api\//, (r) => {
    const q = r.request();
    const p = new URL(q.url()).pathname.replace(/^\/xf-api/, "");
    if (p.startsWith("/jeecg-system/sys/common/static/")) return r.fallback();
    const b = bodyOf(q);
    const ok = allowed(q.method(), p);
    log.push({ phase, method: q.method(), path: p, query: queryOf(q.url()), bodyKind: b.kind, body: b.canon, allowed: ok });
    if (ok) return r.fallback();
    const rec = { t: new Date().toISOString(), phase: `interact:${group}:${o.id}:${kind}`, action: "aborted", method: q.method(), path: p };
    blocked.push(rec);
    appendFileSync("out/blocked-requests.jsonl", JSON.stringify(rec) + "\n");
    return r.abort();
  });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(String(e.message).slice(0, 160)));
  page.on("dialog", (d) => d.dismiss());
  await page.goto(origin + o.recordPath, { waitUntil: "load", timeout: 60000 }).catch((e) => errors.push("goto " + e.message.slice(0, 80)));
  let last = -1, stable = 0;
  const t0 = Date.now();
  while (Date.now() - t0 < 30000) {
    await page.waitForTimeout(1000);
    const len = await page.evaluate(() => document.body.innerText.length).catch(() => -1);
    stable = len === last ? stable + 1 : 0; last = len;
    if (stable >= 3) break;
  }
  const steps = [];
  for (const [i, s] of SCRIPTS[o.id].entries()) {
    phase = "step" + i;
    let err = null;
    let note = null;
    try { note = (await step(page, s)) ?? null; } catch (e) { err = e.message.split("\n")[0].slice(0, 160); }
    steps.push({ i, step: s.fill ? { fill: [s.fill[0], "<test value>"] } : s, err, note });
  }
  const sel = kind === "rest" ? "#poc-main > *" : o.app === "portal" ? "main > *" : "main.ant-layout-content .overscoll > div > *";
  const el = await page.$(sel);
  const html = el ? norm(await el.evaluate((n) => n.outerHTML)) : "";
  const text = el ? await el.evaluate((n) => n.innerText) : "";
  const overlay = await page.evaluate(() => [...document.querySelectorAll(".ant-message, .ant-modal-wrap:not([style*='display: none']) .ant-modal-content, .ant-notification")].map((n) => n.innerText.trim()).filter(Boolean).join(" | "));
  await page.screenshot({ path: `${outDir}/${o.id}.${kind}.png` });
  await ctx.close();
  return { log, blocked, errors, steps, html, text, overlay };
}

// App-shell requests (present in more than half of a site's recordings, e.g. unread-message polling) fire on timers,
// so their position relative to the scripted steps is not deterministic; they are excluded, as in verify-confirm.
const allOrders = JSON.parse(readFileSync("tools/confirm-orders.json", "utf8"));
const SHELL = {};
for (const site of ["portal", "usercenter"]) {
  const sets = allOrders.filter((x) => x.site === site).map((x) => new Set(JSON.parse(readFileSync(`har/confirm-replay/${x.id}.har`, "utf8")).log.entries.map((e) => e.request.method + " " + new URL(e.request.url.replace("http://__ORIGIN__", "http://h")).pathname.replace(/^\/xf-api/, ""))));
  const count = new Map();
  for (const st of sets) for (const k of st) count.set(k, (count.get(k) ?? 0) + 1);
  SHELL[site] = new Set([...count].filter(([, n]) => n > sets.length / 2).map(([k]) => k));
}
let curSite = "portal";
let pageShell = new Set(); // per-page shell baseline measured by verify-confirm (page chunk stubbed out)
const seq = (log) => log.filter((x) => x.phase !== "load" && !SHELL[curSite].has(x.method + " " + x.path) && !pageShell.has(x.method + " " + x.path)).map((x) => `${x.phase} ${x.method} ${x.path} ${x.query} ${x.bodyKind === "sm2" ? "sm2:" : ""}${x.body}`);
const results = [];
for (const o of orders) {
  curSite = o.site;
  try { pageShell = new Set(JSON.parse(readFileSync(`out/verify-confirm/${group}/${o.id}.json`, "utf8")).shellReq.map((k) => k.replace(/^(\w+) \/xf-api/, "$1 "))); } catch { pageShell = new Set(); }
  const a = await run("orig", o), b = await run("rest", o, await shellStorage(o));
  const sa = seq(a.log), sb = seq(b.log);
  const stepErr = a.steps.some((s) => s.err) || b.steps.some((s) => s.err);
  const r = {
    id: o.id, group,
    pass: !stepErr && sa.join("\n") === sb.join("\n") && a.html === b.html && a.text === b.text && a.overlay === b.overlay,
    requestsSame: sa.join("\n") === sb.join("\n"), htmlSame: a.html === b.html, textSame: a.text === b.text, overlaySame: a.overlay === b.overlay,
    stepErrors: { orig: a.steps.filter((s) => s.err), rest: b.steps.filter((s) => s.err) },
    writesSentToTestEnv: 0,
    blockedWrites: { orig: a.blocked.map((x) => x.method + " " + x.path), rest: b.blocked.map((x) => x.method + " " + x.path) },
    sm2Bodies: { orig: a.log.filter((x) => x.bodyKind.startsWith("sm2")).length, rest: b.log.filter((x) => x.bodyKind.startsWith("sm2")).length },
    errors: { orig: a.errors.slice(0, 4), rest: b.errors.slice(0, 4) },
  };
  // Report keeps request shapes; bodies are reduced to a hash so no decrypted value is written to disk.
  const red = (s) => s.replace(/ (sm2:)?(\{.*|\[.*)$/, (m, p) => " " + (p ?? "") + "#" + sha(m));
  writeFileSync(`${outDir}/${o.id}.json`, JSON.stringify({ ...r, origSeq: sa.map(red), restSeq: sb.map(red), origOverlay: a.overlay, restOverlay: b.overlay, steps: a.steps }, null, 1));
  results.push(r);
  console.log(`${o.id} ${r.pass ? "PASS" : "FAIL"} req=${r.requestsSame} html=${r.htmlSame} text=${r.textSame} overlay=${r.overlaySame} blocked=${r.blockedWrites.orig.length}/${r.blockedWrites.rest.length} sm2=${r.sm2Bodies.orig}/${r.sm2Bodies.rest} stepErr=${stepErr}`);
}
writeFileSync(`${outDir}/summary.json`, JSON.stringify(results, null, 1));
await browser.close();
servers.forEach((s) => s.close());
