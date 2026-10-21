// Write guard of tools/record-page.mjs (HM-992): recording runs the interaction script against the test environment
// for real, so a script that clicks 提交 used to submit for real (sumbitImportantCompanyInfo sent the test company back
// to review five times, HM-48). /xf-api/ requests are checked against tools/record-write-denylist.json:
//   allow hit → sent as before; deny hit → NOT sent, answered with INTERCEPTED (plain JSON, no crypto_opt header: both
//   apps' axios interceptors decrypt only when crypto_opt is "true", so a plain body is the same format as an unencrypted
//   response); neither, POST, last path segment not query-shaped → sent, and reported as unlisted (warnings).
// The path matched is the request path without the /xf-api prefix and without the query string. A deny rule has a regex
// (re) on that path and/or words: the last segment split into camelCase words, lower-cased (staggingOrSubmit → stagging,
// or, submit; companyPositionAdd → company, position, add), any word on the list hits.
// Library: import { loadDenylist, writeGuard, INTERCEPTED, splitWrites } from "./record-write-guard.mjs";
//   writeGuard(list?) → { check(method, url) → {action: "intercept"|"send", rule?, allow?, unlisted?},
//                          route(route) → true when it fulfilled the request (intercepted), harFields(request), unlisted }
// CLI: node tools/record-write-guard.mjs <METHOD> <path>  → the decision as one JSON line (to check a path by hand).
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const DENYLIST_FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), "record-write-denylist.json");
export const INTERCEPTED = '{"success":true,"code":200,"result":null,"message":"intercepted"}';
const SAFE_METHODS = new Set(["OPTIONS", "HEAD"]);

export function loadDenylist(file = DENYLIST_FILE) {
  const raw = JSON.parse(readFileSync(file, "utf8"));
  const rx = (e, where, { optional = false } = {}) => {
    if (typeof e.why !== "string" || !e.why.trim()) throw new Error(`${path.basename(file)}: ${where} (${e.re ?? e.words}) without why`);
    if (optional && e.re == null) return null;
    if (typeof e.re !== "string" || !e.re) throw new Error(`${path.basename(file)}: ${where} without re`);
    return new RegExp(e.re, e.flags ?? "");
  };
  return {
    queryShape: rx(raw.queryShape, "queryShape"),
    deny: raw.deny.map((e, i) => {
      if (e.re == null && !e.words?.length) throw new Error(`${path.basename(file)}: deny[${i}] without re or words`);
      return { id: e.id ?? `deny[${i}]`, re: rx(e, `deny[${i}]`, { optional: true }), words: e.words ? new Set(e.words.map((w) => w.toLowerCase())) : null, methods: e.methods ? new Set(e.methods.map((m) => m.toUpperCase())) : null, exceptQuery: !!e.exceptQuery };
    }),
    allow: raw.allow.map((e, i) => ({ id: e.re, re: rx(e, `allow[${i}]`) })),
  };
}

export const apiPath = (url) => new URL(url).pathname.replace(/^\/xf-api(?=\/)/, "");
const lastSegment = (p) => p.slice(p.lastIndexOf("/") + 1);
export const wordsOf = (seg) => seg.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2").toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

export function classify(list, method, url) {
  const m = method.toUpperCase(), p = apiPath(url);
  if (SAFE_METHODS.has(m)) return { action: "send" };
  const allow = list.allow.find((a) => a.re.test(p));
  if (allow) return { action: "send", allow: allow.id };
  const seg = lastSegment(p), query = list.queryShape.test(seg), words = wordsOf(seg);
  const rule = list.deny.find((d) => (!d.methods || d.methods.has(m)) && !(d.exceptQuery && query) && (!d.re || d.re.test(p)) && (!d.words || words.some((w) => d.words.has(w))));
  if (rule) return { action: "intercept", rule: rule.id };
  return m === "POST" && !query ? { action: "send", unlisted: true } : { action: "send" };
}

export function writeGuard(list = loadDenylist()) {
  const hits = new WeakMap(); // Playwright Request → deny rule id (the route's request is the one the context events see)
  const unlisted = new Set(), failed = [];
  return {
    check: (method, url) => classify(list, method, url),
    route(route) {
      const q = route.request(), c = classify(list, q.method(), q.url());
      if (c.unlisted) unlisted.add(`${q.method()} ${apiPath(q.url())}`);
      if (c.action !== "intercept") return false;
      hits.set(q, c.rule);
      // never falls back to sending: a failed fulfill leaves the request failed (requestfailed), and is reported
      route.fulfill({ status: 200, contentType: "application/json;charset=UTF-8", body: INTERCEPTED }).catch((e) => { failed.push(`${q.method()} ${apiPath(q.url())}: ${String(e.message).split("\n")[0].slice(0, 120)}`); route.abort().catch(() => {}); });
      return true;
    },
    harFields: (req) => (hits.has(req) ? { _intercepted: true, _interceptRule: hits.get(req) } : {}),
    unlisted, failed,
  };
}

// HAR entries → non-GET requests that really went out (writes) and every request the guard answered (intercepted),
// grouped by method + path: {method, path, count, phases, statuses}. No bodies, no response data.
export function splitWrites(entries) {
  const writes = [], intercepted = [];
  const add = (list, e) => {
    const p = apiPath(e.request.url);
    let w = list.find((x) => x.method === e.request.method && x.path === p);
    if (!w) list.push((w = { method: e.request.method, path: p, count: 0, phases: [], statuses: [] }));
    w.count++;
    if (!w.phases.includes(e._phase)) w.phases.push(e._phase);
    if (!w.statuses.includes(e.response.status)) w.statuses.push(e.response.status);
    if (e._interceptRule && !(w.rules ??= []).includes(e._interceptRule)) w.rules.push(e._interceptRule);
  };
  for (const e of entries) {
    if (e._intercepted) add(intercepted, e);
    else if (!SAFE_METHODS.has(e.request.method) && e.request.method !== "GET") add(writes, e);
  }
  return { writes, intercepted };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [method, p] = process.argv.slice(2);
  if (!method || !p) { console.error("usage: node tools/record-write-guard.mjs <METHOD> <path>"); process.exit(1); }
  console.log(JSON.stringify({ method: method.toUpperCase(), path: p, ...classify(loadDenylist(), method, "http://h" + (p.startsWith("/xf-api/") ? p : "/xf-api" + p)) }));
}
