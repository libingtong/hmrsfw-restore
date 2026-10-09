// HAR replay for /xf-api/ requests (docs/pipeline.md §7.4). Nothing is ever sent to the test environment: every
// /xf-api/ request is answered from the HAR or with the uniform "not in HAR" stub.
// Matching, first hit wins:
//   1. method + path (incl. query string, as Playwright's routeFromHAR did in the POC) + decrypted, canonical body;
//   2. method + path → the first entry;
//   3. none → NOT_IN_HAR.
// Request bodies are decrypted in memory only (SM2 private key from the environment, never logged or written).
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { canonical, decryptBody } from "../sm2-body.mjs";

export const NOT_IN_HAR = '{"success":false,"code":404,"result":null,"message":"not in HAR"}';
export const sha256 = (s) => createHash("sha256").update(s).digest("hex");
const SM2_HEX = /^(04)?[0-9a-f]{192,}$/i;

// Body text → { kind, canon }: SM2 ciphertext (bare, or the {data:"<hex>"} envelope of encrypted POSTs) is decrypted
// first; JSON is canonicalised (sorted keys); anything else is compared as text.
export function bodyOf(raw) {
  if (!raw) return { kind: "none", canon: "" };
  const hex = raw.replace(/^"|"$/g, "");
  if (SM2_HEX.test(hex)) {
    try { return { kind: "sm2", canon: canonical(decryptBody(hex)) }; } catch (e) { return { kind: "sm2-undecryptable", canon: "?" + e.message }; }
  }
  let parsed;
  try { parsed = JSON.parse(raw); } catch { return { kind: "text", canon: raw }; }
  if (parsed && typeof parsed === "object" && typeof parsed.data === "string" && SM2_HEX.test(parsed.data)) {
    try { return { kind: "sm2", canon: canonical({ ...parsed, data: decryptBody(parsed.data) }) }; } catch (e) { return { kind: "sm2-undecryptable", canon: "?" + e.message }; }
  }
  return { kind: "json", canon: canonical(parsed) };
}
export const queryOf = (u) => { const q = new URL(u).searchParams; q.delete("_t"); return canonical(Object.fromEntries([...q].sort())); };

// HAR entries are recorded against http://__ORIGIN__ (build-har-confirm / record-page) or the real test host; the key
// is the request target (path + query) so the same file serves any local origin.
const target = (url) => { const u = new URL(url.replace("http://__ORIGIN__", "http://h")); return u.pathname + u.search; };

export function loadHar(file) {
  const har = JSON.parse(readFileSync(file, "utf8"));
  const byKey = new Map();
  // Recording time: both sides start the browser clock there (tools/gate/replay.mjs), so pages that print "now" or
  // compute relative dates render the same in the baseline and in every later gate run.
  const times = har.log.entries.map((e) => Date.parse(e.startedDateTime)).filter((t) => Number.isFinite(t));
  const recordedAt = times.length ? Math.min(...times) : Date.parse("2026-01-01T00:00:00Z");
  for (const e of har.log.entries) {
    const key = e.request.method + " " + target(e.request.url);
    const c = e.response.content ?? {};
    const body = c.text == null ? Buffer.alloc(0) : c.encoding === "base64" ? Buffer.from(c.text, "base64") : Buffer.from(c.text);
    const headers = {};
    for (const h of e.response.headers ?? []) { const n = h.name.toLowerCase(); if (!["content-length", "content-encoding", "transfer-encoding"].includes(n)) headers[n] = h.value; }
    if (!headers["content-type"] && c.mimeType) headers["content-type"] = c.mimeType;
    const entry = { status: e.response.status || 200, headers, body, postData: e.request.postData?.text ?? null, bodyCanon: null };
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key).push(entry);
  }
  return { file, byKey, recordedAt, record: har.log._record ?? null }; // record: what record-page.mjs noted (identity storage)
}

// → { entry, tier: "body" | "path" | null }
export function matchHar(har, method, url, reqBody) {
  const list = har.byKey.get(method + " " + target(url));
  if (!list) return { entry: null, tier: null };
  if (reqBody && reqBody.kind !== "none" && !reqBody.kind.endsWith("undecryptable")) {
    for (const e of list) {
      if (e.postData == null) continue;
      e.bodyCanon ??= bodyOf(e.postData).canon;
      if (e.bodyCanon === reqBody.canon) return { entry: e, tier: "body" };
    }
  }
  return { entry: list[0], tier: "path" };
}

// Installs the /xf-api/ router on a browser context. log(rec) receives every request except static resources.
// Requests to the real test or production hosts are aborted (and logged): the replay never leaves the machine.
export async function routeApi(ctx, har, { log, phase }) {
  await ctx.route((u) => /(^|\.)rencaidanao\.com$/.test(u.hostname), (r) => { log({ phase: phase(), method: r.request().method(), path: "EXTERNAL " + new URL(r.request().url()).host, query: "", bodyKind: "none", body: "", tier: "aborted" }); return r.abort(); });
  await ctx.route(/\/xf-api\//, (r) => {
    const q = r.request();
    const p = new URL(q.url()).pathname.replace(/^\/xf-api/, "");
    const b = bodyOf(q.postData());
    const m = matchHar(har, q.method(), q.url(), b);
    if (!p.startsWith("/jeecg-system/sys/common/static/")) log({ phase: phase(), method: q.method(), path: p, query: queryOf(q.url()), bodyKind: b.kind, body: b.canon, tier: m.tier ?? "not-in-har" });
    if (!m.entry) return r.fulfill({ status: 200, contentType: "application/json", body: NOT_IN_HAR });
    return r.fulfill({ status: m.entry.status, headers: m.entry.headers, body: m.entry.body });
  });
}

// Self-test of the matching tiers with a throwaway SM2 key pair (no real key, no HAR file):
//   node tools/gate/har.mjs --selftest
if (process.argv[1] && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href && process.argv.includes("--selftest")) {
  const { writeFileSync, mkdtempSync, rmSync } = await import("node:fs");
  const os = await import("node:os"), path = await import("node:path");
  const { sm2 } = (await import("sm-crypto")).default;
  const { privateKey, publicKey } = sm2.generateKeyPairHex();
  process.env.SM2_PRIVATE_KEY = privateKey;
  const enc = (o) => sm2.doEncrypt(JSON.stringify(o), publicKey, 1);
  const entry = (method, url, post, text) => ({ request: { method, url: "http://__ORIGIN__" + url, ...(post != null ? { postData: { text: post } } : {}) }, response: { status: 200, headers: [{ name: "content-type", value: "application/json" }], content: { text } } });
  const dir = mkdtempSync(path.join(os.tmpdir(), "har-selftest-"));
  const f = path.join(dir, "t.har");
  writeFileSync(f, JSON.stringify({ log: { entries: [
    entry("POST", "/xf-api/save", JSON.stringify({ data: enc({ name: "a", n: 1 }) }), "A"),
    entry("POST", "/xf-api/save", JSON.stringify({ data: enc({ n: 2, name: "b" }) }), "B"),
    entry("POST", "/xf-api/plain", JSON.stringify({ y: 2, x: 1 }), "P"),
  ] } }));
  const har = loadHar(f);
  rmSync(dir, { recursive: true, force: true });
  const t = (label, got, want) => { const ok = got === want; console.log(`${ok ? "ok  " : "FAIL"} ${label}: ${got}`); return ok; };
  const m = (url, body) => { const r = matchHar(har, "POST", "http://127.0.0.1:1" + url, bodyOf(body)); return r.entry ? r.tier + ":" + r.entry.body.toString() : "not-in-har"; };
  const results = [
    t("encrypted body, keys reordered, fresh ciphertext → 2nd entry by body", m("/xf-api/save", JSON.stringify({ data: enc({ name: "b", n: 2 }) })), "body:B"),
    t("encrypted body not recorded → first entry by path", m("/xf-api/save", JSON.stringify({ data: enc({ name: "zzz" }) })), "path:A"),
    t("plain JSON body, keys reordered → by body", m("/xf-api/plain", JSON.stringify({ x: 1, y: 2 })), "body:P"),
    t("unknown path → not in HAR", m("/xf-api/none", "{}"), "not-in-har"),
  ];
  delete process.env.SM2_PRIVATE_KEY;
  results.push(t("no private key → falls back to path", m("/xf-api/save", JSON.stringify({ data: enc({ name: "b", n: 2 }) })), "path:A"));
  console.log(results.every(Boolean) ? "SELFTEST PASS" : "SELFTEST FAIL");
  process.exitCode = results.every(Boolean) ? 0 : 1;
}
