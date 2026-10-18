// One page run in a browser context under HAR replay: load → wait until stable → capture the page root (DOM tree,
// text, overlay text, screenshot, /xf-api/ requests) → interaction steps → capture again. Used for the original side
// by baseline.mjs and for the restored side by gate.mjs, so both sides go through exactly the same code.
// Logic taken over from the POC's verify-confirm.mjs / interact-confirm.mjs (stability wait, overlay handling, shell
// probe, step runner); the whitelist is gone (v3: every /xf-api/ request is answered locally).
import path from "node:path";
import { routeApi } from "./har.mjs";
import { FIXED_CITY, fixedLocalCity } from "./thirdparty.mjs";
import { domTreeInPage } from "./dom.mjs";
import { pickScripts } from "./coverage.mjs";

export const VIEWPORT = { width: 1920, height: 1080 };
// Overlay text = open modals at capture time + every message / notification shown during the phase (recorded by a
// MutationObserver as they appear: toasts vanish after ~3 s, so a snapshot would depend on timing).
const MODAL_SEL = ".ant-modal-wrap:not([style*='display: none']) .ant-modal-content";
const TOAST_SEL = ".ant-message-notice, .ant-notification-notice";
// Init script (page context): toast recorder + window.__gateBusy() = number of running UI animations (50 ms – 2 s):
// per-frame JS motion (marquees set ~1 ms transitions every frame) and long or infinite animations (spinners, slow
// scrollers) never end, so they do not count.
function toastRecorder(sel) {
  window.__gateBusy = () => document.getAnimations().filter((a) => { if (a.playState !== "running") return false; const t = a.effect?.getComputedTiming?.(); const total = (t?.duration ?? 0) * (t?.iterations ?? Infinity); return total >= 50 && total <= 2000; }).length;
  window.__gateToasts = [];
  window.__gatePhase = "load";
  const seen = new WeakSet();
  const grab = (el) => { if (seen.has(el)) return; seen.add(el); const phase = window.__gatePhase; setTimeout(() => { const t = el.innerText.trim(); if (t) window.__gateToasts.push({ phase, t }); }, 50); };
  new MutationObserver((muts) => { for (const m of muts) for (const n of m.addedNodes) if (n.nodeType === 1) { if (n.matches(sel)) grab(n); n.querySelectorAll?.(sel).forEach(grab); } }).observe(document, { childList: true, subtree: true });
}
const HIDE_OVERLAYS = ".ant-modal-root,.ant-modal-mask,.ant-modal-wrap,.ant-message,.ant-notification{visibility:hidden!important}";
// Shell layout in screenshots (HM-262). On the original side the app shell's layout sits next to the page's roots under
// origSel: the portal's homeView renders [header, RouterView, footer] and its header is position: fixed. An element
// screenshot of a root taller than the viewport scrolls, and the fixed header is drawn over the root wherever the
// viewport top then is. The restored side has no shell (the gate mounts the page as a top-level route), so that strip is
// shell, not page. While each screenshot is taken, the siblings under `sel` that carry none of the page's scopeIds are
// made invisible (visibility only: layout is unchanged; DOM and text are captured before, with the shell visible). The
// page's own fixed parts (a root of its own, or inside one) carry the page's scopeId and stay visible. Only when some
// candidate carries a page scopeId (pages without scoped styles, or recorded through a parent page, are shot as before).
// Returns the CSS or "". The scopeIds come from runPage's opts.pageScopes (original side only: baseline.mjs passes the
// work order's scopeIds; the restored side passes none and is shot as before).
const PAGE_SCOPES = new WeakMap();
export async function shellLayoutCss(page, sel, scopes) {
  const ids = (scopes ?? []).filter((s) => /^data-v-[0-9a-f]{8}$/.test(s));
  if (!ids.length) return "";
  const own = await page.evaluate(([q, ss]) => ss.some((s) => document.querySelector(`${q}[${s}]`)), [sel, ids]).catch(() => false);
  if (!own) return "";
  const shell = sel + ids.map((s) => `:not([${s}])`).join("");
  return `${shell},${shell} *{visibility:hidden!important}`;
}
// Stability: the page counts as settled when body text length and element count stay the same for `stableMs`, no UI
// animation or transition (50 ms – 2 s: antd collapse/fade, a carousel sliding) is running and no /xf-api/ request was
// made in that window (HAR answers are immediate). POC: 3 × 1 s on body text length only.
export const STABLE = { pollMs: 500, stableMs: 2000, minMs: 2000, maxMs: 30000 };

export async function waitStable(page, lastRequestAt, s = STABLE) {
  const t0 = Date.now();
  let last = "", since = Date.now();
  while (Date.now() - t0 < s.maxMs) {
    await page.waitForTimeout(s.pollMs);
    const sig = await page.evaluate(() => document.body.innerText.length + ":" + document.getElementsByTagName("*").length + (window.__gateBusy?.() ? ":busy" + Math.random() : "")).catch(() => "x" + Math.random());
    if (sig !== last || lastRequestAt() > since) {
      if (process.env.GATE_DEBUG_STABLE) process.stderr.write(`[stable] +${Date.now() - t0}ms ${sig !== last ? "dom " + last + " -> " + sig : "request"}\n`);
      last = sig; since = Date.now(); continue;
    }
    if (Date.now() - since >= s.stableMs && Date.now() - t0 >= s.minMs) return Date.now() - t0;
  }
  return -1;
}

// After the interaction steps: wait (at most `maxMs`) until no UI animation runs and the page root's HTML has not
// changed for `quietMs` (motion classes and validation messages settle), then capture.
export async function waitQuiet(page, sel, { quietMs = 600, maxMs = 3000 } = {}) {
  const t0 = Date.now();
  let last = null, since = Date.now();
  while (Date.now() - t0 < maxMs) {
    const sig = await page.evaluate((q) => [...document.querySelectorAll(q)].reduce((n, e) => n + e.outerHTML.length, 0) + (window.__gateBusy?.() ? ":busy" + Math.random() : ""), sel).catch(() => Math.random());
    if (sig !== last) { last = sig; since = Date.now(); } else if (Date.now() - since >= quietMs) return Date.now() - t0;
    await page.waitForTimeout(100);
  }
  return -1;
}

// Text with optional whitespace between characters (antd inserts a space into two-character button labels).
const looseText = (t) => new RegExp("^\\s*" + [...t].map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("\\s*") + "\\s*$");
export async function step(page, s) {
  if (s.fill) await page.getByPlaceholder(s.fill[0], { exact: true }).first().fill(s.fill[1]);
  else if (s.click || s.clickSel) {
    const all = s.click ? page.locator("button, a, .ant-tabs-tab, li, span, div").filter({ hasText: looseText(s.click) }) : page.locator(s.clickSel);
    let target = null;
    for (const h of await all.all()) if (await h.isVisible()) target = h; // last visible match = innermost element
    if (!target) { if (s.optional) return "absent"; throw new Error("no visible target for " + (s.click ?? s.clickSel)); }
    await target.click({ timeout: 5000 });
  } else if (s.press) await page.keyboard.press(s.press);
  await page.waitForTimeout(s.wait ?? 1200);
  return null;
}

// Playwright logs "performing <action> action" right before it sends the input events and "<action> action done" after
// them. A step that fails after that point (the click handler keeps the main thread busy, or the wait for scheduled
// navigations runs out on a busy machine) has already reached the page: doing it again would click twice (HM-245).
const ACTION_SENT = /\bperforming \w+ action\b|\b\w+ action done\b/;
export const actionSent = (e) => ACTION_SENT.test(String(e?.message ?? ""));

// One step as runPage runs it → { note, err }. A step that failed before its action was sent (target not actionable
// yet on a busy machine, as record-page does) is tried once more after 1 s; one whose action was sent is not repeated:
// it gets the step's usual wait and a note, and what it did is compared like any other step.
export async function runStep(page, s) {
  try { return { note: (await step(page, s)) ?? null, err: null }; }
  catch (e) {
    if (actionSent(e)) { await page.waitForTimeout(s.wait ?? 1200); return { note: "timed out after the action was sent; not repeated", err: null }; }
    await page.waitForTimeout(1000);
    try { return { note: (await step(page, s)) ?? null, err: null }; } catch (e2) { return { note: null, err: e2.message.split("\n")[0].slice(0, 160) }; }
  }
}

async function captureRoot(page, sel, shotBase, withShots, phases) {
  const els = await page.$$(sel);
  await page.waitForTimeout(60); // toast texts are read 50 ms after they appear
  const overlay = await page.evaluate(([q, ph]) => ({
    modals: [...document.querySelectorAll(q)].map((n) => n.innerText.trim()).filter(Boolean),
    toasts: (window.__gateToasts ?? []).filter((x) => new RegExp(ph).test(x.phase)).map((x) => x.t),
  }), [MODAL_SEL, phases.source]).catch(() => ({ modals: [], toasts: [] }));
  const candidates = [];
  let hide = null;
  if (withShots) hide = await page.addStyleTag({ content: HIDE_OVERLAYS }).catch(() => null);
  const shellCss = withShots ? await shellLayoutCss(page, sel, PAGE_SCOPES.get(page)) : "";
  for (const [i, el] of els.entries()) {
    const c = { ...(await el.evaluate(domTreeInPage)), ...(await el.evaluate((n) => ({ html: n.outerHTML, text: n.innerText, cls: n.getAttribute("class") }))) };
    if (withShots) {
      const file = `${shotBase}${i ? "." + i : ""}.png`;
      const box = await el.boundingBox();
      // added only around the screenshot: the DOM tree and innerText above are taken with the shell visible
      const shell = shellCss ? await page.addStyleTag({ content: shellCss }).catch(() => null) : null;
      // Element screenshots wait for the element to stop moving; a page with a running carousel can exceed that on a
      // busy machine, so fall back to a full-page clip of the same box.
      if (box?.height && box.width) await el.screenshot({ path: file, timeout: 15000 }).catch(async () => { const b = await el.evaluate((n) => { const r = n.getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: r.height }; }); await page.screenshot({ path: file, fullPage: true, clip: b }); });
      else await page.screenshot({ path: file });
      if (shell) await shell.evaluate((n) => n.remove()).catch(() => {});
      c.shot = file;
    }
    candidates.push(c);
  }
  if (!els.length && withShots) { const file = `${shotBase}.png`; await page.screenshot({ path: file }); candidates.push({ tree: null, ltgt: true, html: "", text: "", cls: null, shot: file, empty: true }); }
  if (hide) await hide.evaluate((n) => n.remove()).catch(() => {});
  return { candidates, overlay };
}

// Pages the page under test opens (a target="_blank" link, window.open) → "<path>?<query>#<hash>" on the replay origin
// (`_t` cache-busters dropped, other parameters sorted), "<host><path>" elsewhere. Both sides serve on different local
// origins, so only the target is compared.
export function openedTarget(url, origin) {
  let u;
  try { u = new URL(url); } catch { return String(url); }
  if (u.protocol === "about:") return u.href;
  if (u.origin !== origin) return u.host + u.pathname;
  const q = new URLSearchParams([...u.searchParams].filter(([k]) => k !== "_t").sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
  return u.pathname + (q.size ? "?" + q : "") + u.hash;
}

// opts: { origin, url, storage: {localStorage, sessionStorage}, har, sel, steps, shotDir, tag, stubChunk, coverage }
// coverage = names of the scripts to measure (basenames under /assets/): V8 precise coverage over the whole run, load and
// steps, returned as res.coverage = [{url, source, functions}] for those scripts only (tools/gate/coverage.mjs).
// stubChunk = basename of the page chunk: replaced by an empty component that snapshots localStorage at mount (shell
// probe: what the app shell alone requests, and the storage the page component sees when it mounts).
// Measurement scope (HM-797): the requests compared are the ones the page under test makes (its main frame and its
// iframes). A page it opens (target="_blank", window.open) is not part of it: the opening is recorded as {phase, target}
// (res.load.opened during load, res.opened during the steps), and that page's own requests go to res.otherRequests
// (diagnostics only, never compared), so whether they land before the capture (a race between the two pages' start-up
// speed) no longer matters. The other page is left running as before; only what is measured changes.
export async function runPage(browser, opts) {
  const ctx = await browser.newContext({ viewport: VIEWPORT, locale: "zh-CN" });
  await ctx.addInitScript(toastRecorder, TOAST_SEL);
  await ctx.addInitScript((s) => { for (const [k, v] of Object.entries(s.localStorage)) localStorage.setItem(k, v); for (const [k, v] of Object.entries(s.sessionStorage ?? {})) sessionStorage.setItem(k, v); }, opts.storage);
  await ctx.addInitScript(fixedLocalCity, FIXED_CITY); // Baidu IP location: same city on both sides (thirdparty.mjs)
  const log = [], errors = [], opened = [], otherRequests = [];
  let phase = "load", lastRequestAt = 0, outdated = 0, page = null;
  // A request without a frame (service worker) cannot be attributed: it stays with the page under test, as before.
  const fromOther = (q) => { try { return !!page && q.frame().page() !== page; } catch { return false; } };
  await routeApi(ctx, opts.har, { log: (r, q) => { if (q && fromOther(q)) { otherRequests.push(r); return; } lastRequestAt = Date.now(); log.push(r); }, phase: () => phase });
  if (opts.stubChunk) await ctx.route((u) => u.pathname === "/assets/" + opts.stubChunk, (r) => r.fulfill({ status: 200, contentType: "text/javascript", body: "const c={name:'ShellProbe',setup(){window.__shellMountStorage=Object.fromEntries(Object.keys(localStorage).map((k)=>[k,localStorage.getItem(k)]));return()=>null}};export default c;export const __tla=Promise.resolve();" }));
  page = await ctx.newPage();
  // A new page's first navigation request comes before the page exists (Playwright has no frame for it yet) and carries
  // the target the page under test asked for; the page itself may end on an error page (hosts outside the replay are
  // aborted). A page opened without one (window.open() with no URL) is recorded with its own URL when it appears.
  const pendingNav = [];
  ctx.on("request", (q) => { if (!q.isNavigationRequest()) return; try { q.frame(); } catch { pendingNav.push({ url: q.url(), phase }); } });
  ctx.on("page", (p) => {
    if (p === page) return;
    const i = pendingNav.findIndex((x) => x.url === p.url());
    const nav = i >= 0 ? pendingNav.splice(i, 1)[0] : p.url().startsWith("chrome-error:") ? pendingNav.shift() : null;
    opened.push({ phase: nav?.phase ?? phase, target: openedTarget(nav?.url ?? p.url(), opts.origin) });
  });
  if (opts.coverage?.length) await page.coverage.startJSCoverage({ resetOnNavigation: false, reportAnonymousScripts: false });
  // The page's clock starts at the beginning of the HAR's recording minute and runs normally (no fake timers), so pages
  // that print "now" show the same minute in the baseline and in later gate runs.
  await page.clock.setSystemTime(new Date(Math.floor(opts.har.recordedAt / 60000) * 60000));
  page.on("pageerror", (e) => errors.push(String(e.message).slice(0, 160)));
  page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text().slice(0, 200)); });
  page.on("dialog", (d) => d.dismiss().catch(() => {}));
  // vite dev server: a dependency discovered at runtime makes older optimized-dep URLs answer 504; reload once.
  page.on("response", (r) => { if (r.status() === 504 && r.url().startsWith(opts.origin)) outdated++; });
  const t0 = Date.now();
  const go = () => page.goto(opts.origin + opts.url, { waitUntil: "load", timeout: 60000 }).catch((e) => errors.push("goto " + e.message.slice(0, 80)));
  await go();
  let settle = await waitStable(page, () => lastRequestAt);
  if (outdated) { errors.push(`reloaded after ${outdated} outdated dependency responses`); outdated = 0; log.length = 0; opened.length = 0; otherRequests.length = 0; await go(); settle = await waitStable(page, () => lastRequestAt); }
  const res = { settleMs: settle, loadMs: Date.now() - t0, errors };
  if (opts.stubChunk) {
    await page.waitForTimeout(Math.max(0, 6000 - (Date.now() - t0)));
    res.storageAtMount = await page.evaluate(() => window.__shellMountStorage ?? null).catch(() => null);
    res.toasts = await page.evaluate(() => (window.__gateToasts ?? []).map((x) => x.t)).catch(() => []);
    res.requests = log.map((x) => x.method + " " + x.path);
    await ctx.close();
    return res;
  }
  if (opts.pageScopes?.length) PAGE_SCOPES.set(page, opts.pageScopes); // shellLayoutCss
  const base = path.join(opts.shotDir, opts.tag);
  res.load = { ...(await captureRoot(page, opts.sel, base, true, /^load$/)), requests: log.map((x) => ({ ...x })), opened: opened.map((x) => ({ ...x })) };
  if (opts.steps?.length) {
    res.steps = [];
    for (const [i, s] of opts.steps.entries()) {
      phase = "step" + i;
      await page.evaluate((p) => { window.__gatePhase = p; }, phase).catch(() => {});
      const { err, note } = await runStep(page, s);
      res.steps.push({ i, step: s.fill ? { fill: [s.fill[0], "<test value>"] } : s, err, note });
    }
    await waitQuiet(page, opts.sel);
    res.final = await captureRoot(page, opts.sel, base + ".final", false, /^step/);
    res.stepLog = log.filter((x) => x.phase !== "load");
    res.opened = opened.filter((x) => x.phase !== "load");
  }
  res.otherRequests = otherRequests.map((x) => ({ phase: x.phase, method: x.method, path: x.path }));
  res.totalMs = Date.now() - t0;
  if (opts.coverage?.length) res.coverage = pickScripts(await page.coverage.stopJSCoverage(), opts.coverage);
  await ctx.close();
  return res;
}
