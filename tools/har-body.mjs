// Request bodies of a recorded page HAR ($RESTORE_ASSETS/har/pages/<工单id>.har). The HAR keeps every request body
// exactly as sent (SM2 ciphertext stays ciphertext); this module turns one into a canonical text for matching and for
// the baseline request sequence, decrypting SM2 in memory with SM2_PRIVATE_KEY (tools/sm2-body.mjs). Same rules as the
// POC's interact-confirm.mjs bodyOf():
//   whole body is SM2 hex ("04…" or bare, ≥ 192 hex chars, optionally JSON-quoted) → kind "sm2"
//   JSON object whose "data" is SM2 hex (URLs listed in localStorage "funcs")      → kind "sm2", data replaced by its plaintext
//   other JSON → kind "json"; anything else → kind "text"; no body → kind "none"
// canonical() sorts object keys, so equal parameters compare equal. Decrypted values never leave memory: callers that
// write anything to disk store sha256(canon), never canon.
// Library: import { requestBody, entryKey, queryOf } from "./har-body.mjs";
//   requestBody(postData, { decrypt = true }) → { kind, canon }   (kind "sm2-undecryptable" when the key is missing/wrong)
// CLI:     node tools/har-body.mjs <file.har>  → {entries, bodies:{none,json,text,sm2,"sm2-undecryptable"}, encryptedResponses}
//          counts only; prints no body, URL or value.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { decryptBody, canonical } from "./sm2-body.mjs";

export { canonical };
const SM2_HEX = /^(04)?[0-9a-f]{192,}$/i;
export const sha256 = (s) => createHash("sha256").update(s).digest("hex");

export function requestBody(raw, { decrypt = true } = {}) {
  if (raw == null || raw === "") return { kind: "none", canon: "" };
  const hex = String(raw).replace(/^"|"$/g, "");
  if (SM2_HEX.test(hex)) {
    if (!decrypt) return { kind: "sm2", canon: null };
    try { return { kind: "sm2", canon: canonical(decryptBody(hex)) }; } catch (e) { return { kind: "sm2-undecryptable", canon: "?" + e.message }; }
  }
  let parsed;
  try { parsed = JSON.parse(raw); } catch { return { kind: "text", canon: String(raw) }; }
  if (parsed && typeof parsed === "object" && typeof parsed.data === "string" && SM2_HEX.test(parsed.data)) {
    if (!decrypt) return { kind: "sm2", canon: null };
    try { return { kind: "sm2", canon: canonical({ ...parsed, data: decryptBody(parsed.data) }) }; } catch (e) { return { kind: "sm2-undecryptable", canon: "?" + e.message }; }
  }
  return { kind: "json", canon: canonical(parsed) };
}

// Query string without the cache-buster _t, canonical.
export const queryOf = (url) => { const q = new URL(url).searchParams; q.delete("_t"); return canonical(Object.fromEntries([...q].sort())); };
// "METHOD /path" with the /xf-api prefix removed, as in the POC request logs.
export const entryKey = (method, url) => method.toUpperCase() + " " + new URL(url).pathname.replace(/^\/xf-api/, "");

// Answers requests from a HAR without network (§7 item 4): method + path + query + canonical body (repeats of the same
// request get the recorded responses in order, the last one reused) → else method + path, first entry → else null.
// → { lookup(method, url, postData) → { entry, how: "exact"|"fallback"|"missing" }, stats }
export function harResponder(har, { decrypt = !!process.env.SM2_PRIVATE_KEY } = {}) {
  const exact = new Map(), loose = new Map(), used = new Map();
  const stats = { exact: 0, fallback: 0, missing: 0, writes: { exact: 0, fallback: 0, missing: 0 } };
  const exactKey = (m, u, body) => entryKey(m, u) + " " + queryOf(u) + " " + requestBody(body, { decrypt }).canon;
  for (const e of har.log.entries) {
    const k = exactKey(e.request.method, e.request.url, e.request.postData?.text ?? null);
    if (!exact.has(k)) exact.set(k, []); exact.get(k).push(e);
    const l = entryKey(e.request.method, e.request.url); if (!loose.has(l)) loose.set(l, e);
  }
  const lookup = (method, url, postData) => {
    const k = exactKey(method, url, postData), bucket = exact.get(k);
    let entry = null, how = "missing";
    if (bucket) { const n = used.get(k) ?? 0; entry = bucket[Math.min(n, bucket.length - 1)]; used.set(k, n + 1); how = "exact"; }
    else if (loose.has(entryKey(method, url))) { entry = loose.get(entryKey(method, url)); how = "fallback"; }
    stats[how]++; if (!["GET", "HEAD", "OPTIONS"].includes(method.toUpperCase())) stats.writes[how]++;
    return { entry, how };
  };
  return { lookup, stats };
}
export const NOT_IN_HAR = '{"success":false,"code":404,"result":null,"message":"not in HAR"}';
// Playwright route.fulfill() options for a HAR entry (null → the "not in HAR" stub).
export function fulfillOptions(entry) {
  if (!entry) return { status: 200, contentType: "application/json", body: NOT_IN_HAR };
  const c = entry.response.content;
  return { status: entry.response.status || 200, headers: Object.fromEntries(entry.response.headers.filter((h) => !["content-length", "content-encoding", "transfer-encoding"].includes(h.name.toLowerCase())).map((h) => [h.name, h.value])), body: c.encoding === "base64" ? Buffer.from(c.text ?? "", "base64") : c.text ?? "" };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const file = process.argv[2];
  if (!file) { console.error("usage: node tools/har-body.mjs <file.har>"); process.exit(1); }
  const har = JSON.parse(readFileSync(file, "utf8"));
  const bodies = { none: 0, json: 0, text: 0, sm2: 0, "sm2-undecryptable": 0 };
  for (const e of har.log.entries) bodies[requestBody(e.request.postData?.text ?? null).kind]++;
  const encryptedResponses = har.log.entries.filter((e) => e.response.headers.some((h) => h.name.toLowerCase() === "crypto_opt" && h.value === "true")).length;
  console.log(JSON.stringify({ entries: har.log.entries.length, bodies, encryptedResponses, sm2Key: !!process.env.SM2_PRIVATE_KEY }));
}
