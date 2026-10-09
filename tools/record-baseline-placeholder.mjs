// PLACEHOLDER for A's tools/baseline.mjs, used by record-page.mjs until A is merged (delete it then). Same command line
// as §12 (`<工单id> [--har <path>]`), plus --order/--script for work orders that are not in queue/ yet.
// It replays the ORIGINAL page (legacy-dist served on 127.0.0.1, port 0) twice from the recorded HAR, runs the
// interaction script, and lists the phases whose request set or page text differ between the two runs as `unstable`.
// It writes NO baseline: $RESTORE_STATE/baseline/<id>/ stays absent, so the gate keeps answering {"pending":"record"}
// until `record-page.mjs <id> --baseline-only` is rerun with A's baseline.mjs.
// Replay never reaches the network: /xf-api/ is answered from the HAR (method + path + query + decrypted canonical body;
// else method + path, first entry; else a "not in HAR" stub, as in §7 item 4); every other host is aborted.
// Output: {ok, placeholder:true, unstable:[{phase, what:[...]}], polling:["METHOD /path"], replay:{runs, exact, fallback, missing, writes:{exact, fallback, missing}}}
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import path from "node:path";
import { apiTracker, loadScript, runStepRetry, scriptPath, settle } from "./interact.mjs";
import { entryKey, fulfillOptions, harResponder, queryOf, requestBody, sha256 } from "./har-body.mjs";
import { authState, envDirs, legacyFile, resolveOrder } from "./record-lib.mjs";

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf(n); return i < 0 ? undefined : argv[i + 1]; };
const id = argv.find((a, i) => !a.startsWith("--") && !["--har", "--order", "--script", "--app"].includes(argv[i - 1]));
const isApi = (u) => /\/xf-api\//.test(u);

function serve(site) {
  return new Promise((ok) => {
    const s = createServer((req, res) => { const f = legacyFile(site, req.url.split("?")[0]); res.setHeader("content-type", f.contentType); res.end(f.body); }).listen(0, "127.0.0.1", () => ok(s));
  });
}

async function replay(browser, { origin, har, ls, order, steps, decrypt }) {
  const { lookup, stats } = harResponder(har, { decrypt });
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, locale: "zh-CN" });
  await ctx.addInitScript((s) => { for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v); }, ls);
  const log = [];
  let phase = "load";
  await ctx.route("**/*", async (r) => {
    const q = r.request(), u = new URL(q.url());
    if (u.origin === origin && !isApi(q.url())) return r.continue();
    if (!isApi(q.url())) return r.abort();
    const body = requestBody(q.postData(), { decrypt });
    log.push({ phase, key: entryKey(q.method(), q.url()) + " " + queryOf(q.url()) + " " + sha256(body.canon ?? "").slice(0, 16) });
    return r.fulfill(fulfillOptions(lookup(q.method(), q.url(), q.postData()).entry));
  });
  const tracker = apiTracker(ctx);
  const page = await ctx.newPage();
  page.on("dialog", (d) => d.dismiss().catch(() => {}));
  const snaps = {};
  const snap = async (p) => { snaps[p] = { text: await page.evaluate(() => document.body?.innerText ?? "").catch(() => ""), req: log.filter((x) => x.phase === p).map((x) => x.key) }; };
  await page.goto(origin + order.recordPath, { waitUntil: "load", timeout: 60000 }).catch(() => {});
  await settle(page, tracker, { maxMs: 30000 });
  await snap("load");
  for (const [i, s] of steps.entries()) {
    phase = `step${i}`;
    let err = null; try { await runStepRetry(page, s, () => tracker.idle(page)); } catch (e) { err = String(e.message).split("\n")[0].slice(0, 120); }
    await tracker.idle(page);
    await snap(phase); snaps[phase].err = err;
  }
  await ctx.close();
  return { snaps, stats };
}

try {
  if (!id) throw new Error("usage: node tools/record-baseline-placeholder.mjs <工单id> --har <path> [--order <file>] [--script <file>]");
  const { assets } = envDirs();
  const order = resolveOrder(id, opt("--order"));
  const steps = loadScript(opt("--script") ? path.resolve(opt("--script")) : scriptPath(id)) ?? [];
  const harFile = opt("--har") ?? path.join(assets, "har", "pages", `${id}.har`);
  const har = JSON.parse(readFileSync(harFile, "utf8"));
  const auth = authState(assets, order.role, order.site);
  if (auth.missing) throw new Error(`no login state for role ${order.role}`);
  const server = await serve(order.site);
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  const decrypt = !!process.env.SM2_PRIVATE_KEY;
  try {
    const a = await replay(browser, { origin, har, ls: auth.localStorage, order, steps, decrypt });
    const b = await replay(browser, { origin, har, ls: auth.localStorage, order, steps, decrypt });
    // Timer-driven requests (unread-message polling etc.) land in different phases from run to run: a key seen in 2+ phases
    // whose phase set differs between the runs is reported as `polling` and left out of the per-phase comparison.
    const phasesOf = (snaps) => { const m = new Map(); for (const [p, x] of Object.entries(snaps)) for (const k of x.req) { if (!m.has(k)) m.set(k, new Set()); m.get(k).add(p); } return m; };
    const pa = phasesOf(a.snaps), pb = phasesOf(b.snaps);
    const polling = new Set([...new Set([...pa.keys(), ...pb.keys()])].filter((k) => { const x = pa.get(k) ?? new Set(), y = pb.get(k) ?? new Set(); return [...x].sort().join() !== [...y].sort().join() && Math.max(x.size, y.size) >= 2; }));
    const reqSet = (x) => [...new Set((x?.req ?? []).filter((k) => !polling.has(k)))].sort().join("\n");
    const unstable = [];
    for (const p of Object.keys(a.snaps)) {
      const x = a.snaps[p], y = b.snaps[p] ?? {};
      const what = [];
      if (x.text !== y.text) what.push("text");
      if (reqSet(x) !== reqSet(y)) what.push("requests");
      if (x.err || y.err) what.push("step error: " + (x.err ?? y.err));
      if (what.length) unstable.push({ phase: p, what });
    }
    const pollingPaths = [...new Set([...polling].map((k) => k.split(" ").slice(0, 2).join(" ")))];
    console.log(JSON.stringify({ ok: true, placeholder: true, unstable, polling: pollingPaths, replay: { runs: 2, ...a.stats } }));
  } finally { await browser.close(); server.close(); }
} catch (e) {
  console.log(JSON.stringify({ error: String(e.message).split("\n")[0] }));
  process.exitCode = 1;
}
