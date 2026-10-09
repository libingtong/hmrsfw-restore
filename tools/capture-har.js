// Runs inside the logged-in tab (same origin as the app). For each route in window.__routes:
//   1. open a same-origin iframe on the route (the app boots normally, un-hooked);
//   2. once mounted, install XHR/fetch/JSON.parse hooks on the iframe window;
//   3. re-execute the entry module (import with a cache-busting query) so a second app instance boots at the same
//      route with the hooks in place: the App-level (global) calls and the page calls are re-issued and captured.
//      Encrypted responses are captured as the plaintext the app itself produced after decryption (JSON.parse hook);
//      no key or algorithm is extracted.
// Entries are POSTed to the local receiver; nothing with tokens is returned to the console.
(async () => {
  const receiver = window.__receiver || "http://127.0.0.1:38765";
  const site = window.__site || "portal";
  const routes = window.__routes || [];
  const indexHtml = await (await fetch("/index.html", { cache: "no-store" })).text();
  const entryModule = (indexHtml.match(/src="(\/assets\/index\.[0-9]+\.js)"/) || [])[1];
  // position of JSON.parse inside the app's own response interceptor (the only parse that turns an encrypted body into JSON)
  const parseSite = window.__parseSite || (site === "portal" ? { line: 119, col: 299115 } : { line: 123, col: 327838 });
  const HOOKS = `
    window.__entries = []; window.__plains = []; window.__rawBodies = new Set(); window.__pending = 0; const PARSE_SITE = ${JSON.stringify(parseSite)};
    const now = () => Date.now();
    const XO = XMLHttpRequest.prototype.open, XS = XMLHttpRequest.prototype.send, XH = XMLHttpRequest.prototype.setRequestHeader;
    XMLHttpRequest.prototype.open = function (m, u) { this.__e = { method: m, url: new URL(u, location.href).href, reqHeaders: {}, t: now() }; return XO.apply(this, arguments); };
    XMLHttpRequest.prototype.setRequestHeader = function (k, v) { if (this.__e) this.__e.reqHeaders[k] = /token|authorization|cookie/i.test(k) ? "[redacted]" : v; return XH.apply(this, arguments); };
    XMLHttpRequest.prototype.send = function (body) {
      const e = this.__e; window.__pending++;
      if (e) { e.postData = body == null ? null : (typeof body === "string" ? body : "[non-string body]");
        this.addEventListener("loadend", () => { window.__pending--; e.status = this.status; e.resHeaders = this.getAllResponseHeaders(); e.body = this.responseText; window.__rawBodies.add(e.body); e.crypto = /crypto_opt:\\s*true/i.test(e.resHeaders); e.doneAt = now(); window.__cur = e; setTimeout(() => { if (window.__cur === e) window.__cur = null; }, 0); window.__entries.push(e); }, true); }
      else window.__pending--;
      return XS.apply(this, arguments);
    };
    const JP = JSON.parse;
    JSON.parse = function (t) { const r = JP.apply(this, arguments); try { if (typeof t === "string" && r && typeof r === "object") { const frame = (new Error().stack || "").split("\\n").slice(1, 4).join(" "); const m = frame.match(/\\/assets\\/index\\.\\d+\\.js(?:\\?[^:]*)?:(\\d+):(\\d+)/); if (m && Number(m[1]) === PARSE_SITE.line && Math.abs(Number(m[2]) - PARSE_SITE.col) < 80) { window.__plains.push(t); } } } catch {} return r; };
    const F = window.fetch; window.fetch = async function (input, init) { const e = { method: (init && init.method) || "GET", url: new URL(typeof input === "string" ? input : input.url, location.href).href, t: now(), via: "fetch", postData: init && typeof init.body === "string" ? init.body : null }; window.__pending++; try { const res = await F.apply(this, arguments); const c = res.clone(); e.status = res.status; e.resHeaders = [...res.headers].map(([k, v]) => k + ": " + v).join("\\n"); e.body = await c.text(); e.crypto = res.headers.get("crypto_opt") === "true"; window.__entries.push(e); return res; } finally { window.__pending--; } };
  `;
  const results = [];
  for (const route of routes) {
    const id = route.replace(/[^\w]+/g, "_").replace(/^_|_$/g, "") || "root";
    const frame = document.createElement("iframe");
    frame.style.cssText = "position:fixed;left:0;top:0;width:1920px;height:1080px;border:0;z-index:99999;background:#fff";
    frame.src = route;
    document.body.appendChild(frame);
    await new Promise((r) => (frame.onload = r));
    const w = frame.contentWindow;
    for (let i = 0; i < 30; i++) { const app = w.document.getElementById("app"); if (app && app.__vue_app__) break; await new Promise((r) => setTimeout(r, 500)); }
    // let the first (un-hooked) app instance finish its requests, so none of its responses complete after the hooks go in
    { let last = -1, stable = 0; for (let i = 0; i < 40 && stable < 3; i++) { await new Promise((r) => setTimeout(r, 500)); const n = w.performance.getEntriesByType("resource").length; stable = n === last ? stable + 1 : 0; last = n; } }
    const firstPath = w.location.pathname + w.location.search;
    // unmount the first instance so the re-executed entry mounts on a clean #app
    try { const el = w.document.getElementById("app"); if (el && el.__vue_app__) el.__vue_app__.unmount(); } catch {}
    const s = w.document.createElement("script");
    s.textContent = HOOKS;
    w.document.documentElement.appendChild(s);
    let rebootError = null;
    try { await w.eval(`import(${JSON.stringify(entryModule + "?reboot=" + Date.now())})`); } catch (e) { rebootError = String((e && e.message) || e); }
    let last = -1, stable = 0; const t0 = Date.now();
    while (Date.now() - t0 < 40000) {
      await new Promise((r) => setTimeout(r, 1000));
      const len = (w.document.body && w.document.body.innerText.length) || 0;
      if (w.__pending === 0 && len === last) stable++; else stable = 0;
      last = len; if (stable >= 3 && Date.now() - t0 > 6000) break;
    }
    const payload = { site, route, plains: w.__plains || [], firstPath, finalPath: w.location.pathname + w.location.search, title: w.document.title, textLength: last, rebootError, entries: w.__entries || [], capturedAt: new Date().toISOString() };
    const res = await fetch(`${receiver}/save?name=har-${site}-${id}.json`, { method: "POST", body: JSON.stringify(payload) });
    results.push({ route: route.split("?")[0], sameRoute: payload.finalPath.split("?")[0] === route.split("?")[0], text: last, rebootError, entries: payload.entries.length, nonGet: payload.entries.filter((e) => e.method.toUpperCase() !== "GET").length, crypto: payload.entries.filter((e) => e.crypto).length, decrypted: payload.plains.length, saved: res.ok });
    frame.remove();
  }
  const storage = { origin: location.origin, localStorage: Object.fromEntries(Object.keys(localStorage).map((k) => [k, localStorage.getItem(k)])), sessionStorage: Object.fromEntries(Object.keys(sessionStorage).map((k) => [k, sessionStorage.getItem(k)])), cookies: document.cookie };
  await fetch(`${receiver}/save?name=storage-${site}.json`, { method: "POST", body: JSON.stringify(storage) });
  window.__captureResults = results;
  return results;
})();
