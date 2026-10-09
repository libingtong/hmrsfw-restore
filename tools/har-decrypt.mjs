// Decrypts recorded traffic the way the backend does (plan §4.3, docs/pipeline.md §12): request bodies with SM2
// (C1C3C2, hex, optional "04" prefix — CryptoFilter.CryptoRequestWrapper + Sm2Util.decryptP), responses marked
// `Crypto_Opt: true` with SM4/ECB/PKCS5 (Sm4Utils.encryptEcbP), browser-storage items with SM4/ECB. Every record carries
// its own URL, so request ↔ response pairing is exact; the PKCS5 length relation is only a consistency check.
//
// Keys come ONLY from the environment and are never printed or written:
//   SM2_PRIVATE_KEY               SM2 private key, hex — request bodies
//   VITE_HMRSFW_SM4_KEY           SM4 key, 32 hex — responses (same variable the hmrsfw-vue build reads)
//   VITE_HMRSFW_SM4_STORAGE_KEY   SM4 key for browser storage; empty → VITE_HMRSFW_SM4_KEY
// Plaintext stays in memory. What this tool writes (the normalized sequence) holds paths, query KEYS and SHA-256 digests
// of the canonical bodies and query — never a body, a query value or a key.
//
// Library (gate.mjs request matching, baseline.mjs seq.json, e5-replay.mjs):
//   import { readEntries, decryptEntry, normalizedSequence, matchKey, decryptRequestBody, decryptResponseBody,
//            decryptStorageValue, sm2Decrypt, sm4Decrypt, keysFromEnv, canonical, sha256 } from "./har-decrypt.mjs";
// CLI:
//   node tools/har-decrypt.mjs <file.har | capture.json> [--out <seq.json>] [--strict]   → normalized sequence (hashes only)
//   node tools/har-decrypt.mjs --check <files...>      → per file: how many encrypted records decrypted (counts only)
//   node tools/har-decrypt.mjs --selftest [files...]   → throwaway keys; SM2 also checked against tools/sm2-body.mjs. With
//                                                        files, their recorded request bodies (and decrypted responses) are
//                                                        added as samples — in memory only, the output names no values
// Accepts HAR 1.2 (record-page.mjs, routeFromHAR) and the POC capture format (har/confirm/<id>.json:
// {entries:[{method,url,status,resHeaders,body,postData}]}). Exit code: 0 ok, 1 a record failed to decrypt, 2 usage or
// missing key.
import smCrypto from "sm-crypto";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const { sm2, sm4 } = smCrypto;

export const SM2_MODE = 1; // C1C3C2: original bundle (sm2.doEncrypt(..., 1)) and backend Sm2Util (Mode.C1C3C2)
export const ENV = { sm2: "SM2_PRIVATE_KEY", sm4: "VITE_HMRSFW_SM4_KEY", sm4Storage: "VITE_HMRSFW_SM4_STORAGE_KEY" }; // variable names
const HEX = /^[0-9a-fA-F]+$/;
const isHex = (s) => typeof s === "string" && s.length > 0 && s.length % 2 === 0 && HEX.test(s);

/** Keys from the environment. `missing` lists variable NAMES only. */
export function keysFromEnv(env = process.env) {
  const sm2PrivateKey = env[ENV.sm2] || undefined, sm4Key = env[ENV.sm4] || undefined;
  const sm4StorageKey = env[ENV.sm4Storage] || sm4Key;
  const missing = [!sm2PrivateKey && ENV.sm2, !sm4Key && ENV.sm4].filter(Boolean);
  if (sm4Key && !(sm4Key.length === 32 && HEX.test(sm4Key))) throw new Error(`${ENV.sm4} is not 32 hex characters`);
  if (sm2PrivateKey && !(sm2PrivateKey.length === 64 && HEX.test(sm2PrivateKey))) throw new Error(`${ENV.sm2} is not 64 hex characters`);
  return { sm2PrivateKey, sm4Key, sm4StorageKey, missing };
}

export const sha256 = (s) => createHash("sha256").update(typeof s === "string" ? s : JSON.stringify(s)).digest("hex");
/** Canonical JSON: object keys sorted at every level, so equal parameters compare equal. */
export const canonical = (v) => JSON.stringify(v, (k, x) => (x && typeof x === "object" && !Array.isArray(x) ? Object.fromEntries(Object.keys(x).sort().map((key) => [key, x[key]])) : x));
const parseMaybeJson = (s) => { try { return JSON.parse(s); } catch { return s; } };
const isJsonText = (s) => { try { JSON.parse(s); return true; } catch { return false; } };

/** SM2 decryption, backend semantics: hex ciphertext with or without the "04" point prefix. Returns UTF-8 plaintext. */
export function sm2Decrypt(cipherHex, privateKey = keysFromEnv().sm2PrivateKey) {
  if (!privateKey) throw new Error(`${ENV.sm2} is not set`);
  const hex = String(cipherHex).trim().replace(/^04/, ""); // sm-crypto expects the ciphertext without the 04 prefix
  const plain = isHex(hex) ? sm2.doDecrypt(hex, privateKey, SM2_MODE) : "";
  if (!plain) throw new Error("SM2 decryption failed (wrong key or not an SM2 ciphertext)");
  return plain;
}

/** SM4/ECB/PKCS5 decryption of a hex ciphertext. Returns UTF-8 plaintext; `pkcs5Ok` checks the length relation. */
export function sm4Decrypt(cipherHex, key = keysFromEnv().sm4Key) {
  if (!key) throw new Error(`${ENV.sm4} is not set`);
  const hex = String(cipherHex).trim();
  if (!isHex(hex) || hex.length % 32) throw new Error("SM4 ciphertext is not hex or not block aligned");
  const bytes = sm4.decrypt(hex, key.toLowerCase(), { mode: "ecb", padding: "pkcs#7", output: "array" });
  if (!bytes || !bytes.length && hex.length !== 32) throw new Error("SM4 decryption failed (wrong key or padding)");
  const text = new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(bytes));
  return { text, pkcs5Ok: hex.length === 32 * (Math.floor(bytes.length / 16) + 1) };
}

// Mirrors Sm2CipherValidator.isLikelySm2Cipher(text, isHex=true): non-JSON hex, ≥ 97 bytes once "04" is prefixed.
export const isLikelySm2Cipher = (s) => typeof s === "string" && !isJsonText(s) && isHex(s.startsWith("04") ? s : "04" + s) && (s.startsWith("04") ? s : "04" + s).length / 2 >= 97;

/**
 * Request body as the backend reads it (CryptoRequestWrapper): a non-JSON body is the SM2 ciphertext itself; a JSON
 * body `{data: <SM2 hex>}` carries it in `data`; anything else is plaintext. Returns {encrypted, form, value}, value
 * parsed as JSON when possible (form-urlencoded bodies become an object). `form`: empty | plain | raw | data.
 */
export function decryptRequestBody(text, { privateKey } = {}) {
  if (text == null || text === "") return { encrypted: false, form: "empty", value: "" };
  const s = String(text);
  if (isJsonText(s)) {
    const v = JSON.parse(s);
    if (v && typeof v === "object" && !Array.isArray(v) && isLikelySm2Cipher(v.data)) return { encrypted: true, form: "data", value: parseMaybeJson(sm2Decrypt(v.data, privateKey ?? keysFromEnv().sm2PrivateKey)) };
    return { encrypted: false, form: "plain", value: v };
  }
  if (isLikelySm2Cipher(s.trim())) return { encrypted: true, form: "raw", value: parseMaybeJson(sm2Decrypt(s, privateKey ?? keysFromEnv().sm2PrivateKey)) };
  if (/^[^=&\s]+=[^&]*(&[^=&\s]+=[^&]*)*$/.test(s)) return { encrypted: false, form: "plain", value: Object.fromEntries(new URLSearchParams(s)) };
  return { encrypted: false, form: "plain", value: s };
}

/**
 * Response body: SM4-decrypted when `cryptoOpt` is true. The backend falls back to plaintext JSON (still flagged
 * Crypto_Opt: true) when encryption fails; that case is returned as {encrypted:false, fallbackPlain:true}.
 */
export function decryptResponseBody(text, cryptoOpt, { sm4Key } = {}) {
  const s = text == null ? "" : String(text);
  if (!cryptoOpt) return { encrypted: false, value: parseMaybeJson(s) };
  if (isJsonText(s)) return { encrypted: false, fallbackPlain: true, value: JSON.parse(s) };
  const { text: plain, pkcs5Ok } = sm4Decrypt(s, sm4Key ?? keysFromEnv().sm4Key);
  return { encrypted: true, pkcs5Ok, jsonOk: isJsonText(plain), value: parseMaybeJson(plain) };
}

/** Browser-storage item (original frontend: JSON.parse(sm4.decrypt(text, KEY))). Plain JSON passes through. Failure → null. */
export function decryptStorageValue(text, { sm4StorageKey } = {}) {
  if (text == null) return null;
  if (isJsonText(text)) return JSON.parse(text);
  try { return parseMaybeJson(sm4Decrypt(text, sm4StorageKey ?? keysFromEnv().sm4StorageKey).text); } catch { return null; }
}

const headerList = (h) => (Array.isArray(h) ? h.map((x) => [String(x.name).toLowerCase(), String(x.value)]) : typeof h === "string" ? h.split("\n").map((l) => l.split(/:\s?(.*)/)).filter((p) => p[0]).map(([n, v]) => [n.trim().toLowerCase(), (v ?? "").trim()]) : Object.entries(h ?? {}).map(([n, v]) => [n.toLowerCase(), String(v)]));
/** True when the response headers carry `Crypto_Opt: true` (HAR header array, raw header block, or object). */
export const isCryptoOpt = (headers) => headerList(headers).some(([n, v]) => n === "crypto_opt" && v.toLowerCase() === "true");

/**
 * Records of a HAR 1.2 file or a POC capture, as {method, url, status, reqBody, resBody, cryptoOpt, t}. Accepts a path or
 * an already parsed object. Base64-encoded HAR content is decoded.
 */
export function readEntries(src) {
  const doc = typeof src === "string" ? JSON.parse(readFileSync(src, "utf8")) : src;
  if (doc?.log?.entries) return doc.log.entries.map((e) => ({
    method: e.request.method.toUpperCase(), url: e.request.url, status: e.response?.status ?? 0, t: e.startedDateTime,
    reqBody: e.request.postData?.text ?? "",
    resBody: e.response?.content?.encoding === "base64" ? Buffer.from(e.response.content.text ?? "", "base64").toString("utf8") : e.response?.content?.text ?? "",
    cryptoOpt: isCryptoOpt(e.response?.headers ?? []),
  }));
  if (Array.isArray(doc?.entries)) return doc.entries.map((e) => ({
    method: String(e.method).toUpperCase(), url: e.url, status: e.status ?? 0, t: e.t,
    reqBody: typeof e.postData === "string" ? e.postData : e.postData?.text ?? "", resBody: e.body ?? "",
    cryptoOpt: e.resHeaders != null ? isCryptoOpt(e.resHeaders) : e.crypto === true,
  }));
  throw new Error("not a HAR 1.2 file or a POC capture (no log.entries / entries)");
}

const splitUrl = (url) => { const u = new URL(url, "http://__ORIGIN__"); const q = [...u.searchParams.entries()].sort(([a, x], [b, y]) => (a < b ? -1 : a > b ? 1 : x < y ? -1 : x > y ? 1 : 0)); return { path: u.pathname, query: q }; };

/** One record decrypted in memory: {method, path, query:[[k,v]...], status, req:{encrypted,form,value}, res:{...}}. */
export function decryptEntry(e, keys = keysFromEnv()) {
  const { path: p, query } = splitUrl(e.url);
  return { method: e.method, path: p, query, status: e.status, req: decryptRequestBody(e.reqBody, { privateKey: keys.sm2PrivateKey }), res: decryptResponseBody(e.resBody, e.cryptoOpt, { sm4Key: keys.sm4Key }) };
}

/**
 * Key for request matching (gate.mjs, plan §7 item 4): method + path [+ canonical query] + SHA-256 of the decrypted,
 * canonical body. `body` is the raw body text as sent/recorded (it is decrypted here) — or pass {decrypted: value}.
 */
export function matchKey({ method, url, body }, { withQuery = true, keys } = {}) {
  const { path: p, query } = splitUrl(url);
  const value = body && typeof body === "object" && "decrypted" in body ? body.decrypted : decryptRequestBody(body, { privateKey: (keys ?? keysFromEnv()).sm2PrivateKey }).value;
  return `${String(method).toUpperCase()} ${p}${withQuery && query.length ? "?" + sha256(canonical(query)).slice(0, 16) : ""} #${value === "" ? "-" : sha256(canonical(value)).slice(0, 16)}`;
}

/**
 * Normalized request sequence of a HAR (in order). Only hashes leave this function: query keys, SHA-256 of the
 * canonical query, request body and response body (both decrypted). `src`: path, parsed HAR/capture, or readEntries()
 * output. Records with `/sys/common/static/` (images) are
 * skipped unless `includeStatic`. Throws if an encrypted record needs a key that is not set.
 */
export function normalizedSequence(src, { keys = keysFromEnv(), includeStatic = false, urlFilter = /\/xf-api\// } = {}) {
  const out = [], failures = [];
  (Array.isArray(src) ? src : readEntries(src)).forEach((e, i) => {
    if (urlFilter && !urlFilter.test(e.url)) return;
    if (!includeStatic && e.url.includes("/sys/common/static/")) return;
    try {
      const d = decryptEntry(e, keys);
      out.push({ i, method: d.method, path: d.path, queryKeys: d.query.map(([k]) => k), querySha256: d.query.length ? sha256(canonical(d.query)) : null,
        status: d.status, reqEncrypted: d.req.encrypted, reqForm: d.req.form, reqSha256: d.req.value === "" ? null : sha256(canonical(d.req.value)),
        resEncrypted: d.res.encrypted, ...(d.res.encrypted ? { resPkcs5Ok: d.res.pkcs5Ok, resJsonOk: d.res.jsonOk } : {}), ...(d.res.fallbackPlain ? { resFallbackPlain: true } : {}),
        resSha256: sha256(canonical(d.res.value)), key: matchKey({ method: d.method, url: e.url, body: { decrypted: d.req.value } }) });
    } catch (err) { failures.push({ i, method: e.method, path: splitUrl(e.url).path, error: err.message }); }
  });
  return { entries: out, failures };
}

// ---------------------------------------------------------------- CLI
const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  const args = process.argv.slice(2);
  try {
    if (args.includes("--selftest")) process.exitCode = await selftest(args.filter((a) => !a.startsWith("--")));
    else if (args[0] === "--check") process.exitCode = check(args.slice(1));
    else {
      const file = args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--out");
      if (!file) throw Object.assign(new Error("usage: node tools/har-decrypt.mjs <file.har|capture.json> [--out <seq.json>] [--strict] | --check <files...> | --selftest"), { usage: true });
      const keys = keysFromEnv(); const entries = readEntries(file);
      const need = [entries.some((e) => e.cryptoOpt) && !keys.sm4Key && ENV.sm4].filter(Boolean);
      if (need.length) throw Object.assign(new Error(`encrypted responses present but ${need.join(", ")} is not set`), { usage: true });
      const seq = normalizedSequence(entries, { keys });
      const doc = { source: path.basename(file), entries: seq.entries, failures: seq.failures };
      const outIdx = args.indexOf("--out");
      if (outIdx >= 0) { mkdirSync(path.dirname(path.resolve(args[outIdx + 1])), { recursive: true }); writeFileSync(args[outIdx + 1], JSON.stringify(doc, null, 1)); } else console.log(JSON.stringify(doc));
      console.error(summaryLine(path.basename(file), seq));
      process.exitCode = seq.failures.length && (args.includes("--strict") || seq.failures.some((f) => !/is not set/.test(f.error))) ? 1 : 0;
    }
  } catch (e) { console.error(JSON.stringify({ error: e.message })); process.exitCode = 2; }
}

function summaryLine(name, seq) {
  const enc = seq.entries.filter((x) => x.resEncrypted);
  return `${name}: ${seq.entries.length} records, responses decrypted ${enc.length} (pkcs5 ok ${enc.filter((x) => x.resPkcs5Ok).length}, json ok ${enc.filter((x) => x.resJsonOk).length}), request bodies decrypted ${seq.entries.filter((x) => x.reqEncrypted).length}, failures ${seq.failures.length}`;
}

function check(files) {
  if (!files.length) throw Object.assign(new Error("usage: --check <files...>"), { usage: true });
  const keys = keysFromEnv(); let bad = 0; const tot = { files: 0, records: 0, encRes: 0, encResOk: 0, encReq: 0, encReqOk: 0 };
  for (const f of files) {
    const es = readEntries(f); let encRes = 0, encResOk = 0, encReq = 0, encReqOk = 0;
    for (const e of es) {
      if (e.cryptoOpt && !isJsonText(e.resBody)) { encRes++; try { const r = decryptResponseBody(e.resBody, true, keys); if (r.pkcs5Ok && r.jsonOk) encResOk++; } catch {} }
      let req; try { req = decryptRequestBody(e.reqBody, keys); } catch { req = { encrypted: true, failed: true }; }
      if (req.encrypted) { encReq++; if (!req.failed) encReqOk++; }
    }
    tot.files++; tot.records += es.length; tot.encRes += encRes; tot.encResOk += encResOk; tot.encReq += encReq; tot.encReqOk += encReqOk;
    const ok = encRes === encResOk && encReq === encReqOk; if (!ok) bad++;
    console.log(`${ok ? "OK  " : "FAIL"} ${path.basename(f)} records=${es.length} sm4 responses ${encResOk}/${encRes} sm2 request bodies ${encReqOk}/${encReq}`);
  }
  console.log(JSON.stringify({ ok: !bad, ...tot, keys: { [ENV.sm4]: !!keys.sm4Key, [ENV.sm2]: !!keys.sm2PrivateKey } }));
  return bad ? 1 : 0;
}

// Throwaway keys only. SM2: plaintexts in both ciphertext layouts the backend accepts (raw / {data}), with and without
// "04"; results must equal tools/sm2-body.mjs decryptBody on the same ciphertext. SM4: round trip + PKCS5 length.
// Recorded samples (files) are labelled by file and index only.
async function selftest(files = []) {
  const { decryptBody } = await import("./sm2-body.mjs");
  const { privateKey, publicKey } = sm2.generateKeyPairHex(); const sm4Key = createHash("md5").update(String(Math.random())).digest("hex");
  const samples = [{ pageNo: 1, pageSize: 10, keyword: "测试", nested: { a: [1, 2], b: null } }, { id: "1903022227748134914" }, {}, [1, "二"], "纯文本"].map((v, i) => ({ label: `builtin#${i}`, v }));
  const keys = files.length ? keysFromEnv() : null;
  for (const f of files) readEntries(f).forEach((e, i) => {
    if (e.reqBody) samples.push({ label: `${path.basename(f)}#${i} request`, v: decryptRequestBody(e.reqBody, keys).value });
    if (e.cryptoOpt && keys.sm4Key && !isJsonText(e.resBody)) samples.push({ label: `${path.basename(f)}#${i} response`, v: decryptResponseBody(e.resBody, true, keys).value });
  });
  let pass = 0, total = 0; const t = (name, ok) => { total++; if (ok) pass++; if (!ok || !files.length) console.log(`${ok ? "ok  " : "FAIL"} ${name}`); };
  for (const { label, v: s } of samples) {
    const json = typeof s === "string" ? s : JSON.stringify(s); const c = sm2.doEncrypt(json, publicKey, SM2_MODE);
    const raw = decryptRequestBody(c, { privateKey }), raw04 = decryptRequestBody("04" + c, { privateKey }), wrapped = decryptRequestBody(JSON.stringify({ data: c }), { privateKey });
    const poc = decryptBody(c, privateKey);
    t(`sm2 ${label}: raw/04/{data} decrypt equal`, raw.encrypted && raw04.encrypted && wrapped.encrypted && canonical(raw.value) === canonical(s) && canonical(raw04.value) === canonical(s) && canonical(wrapped.value) === canonical(s));
    t(`sm2 ${label}: same as sm2-body.mjs`, canonical(poc) === canonical(raw.value));
    const r = sm4.encrypt(json, sm4Key, { mode: "ecb", padding: "pkcs#7" }); const d = decryptResponseBody(r, true, { sm4Key });
    t(`sm4 ${label}: round trip + pkcs5`, d.encrypted && d.pkcs5Ok && canonical(d.value) === canonical(s));
  }
  let wrong = false; try { sm2Decrypt(sm2.doEncrypt("{}", publicKey, SM2_MODE), sm2.generateKeyPairHex().privateKey); } catch { wrong = true; } t("sm2 wrong key rejected", wrong);
  t("plain JSON body passes through", !decryptRequestBody('{"a":1}', { privateKey }).encrypted);
  t("{data: <not cipher>} stays plain", !decryptRequestBody('{"data":"abc"}', { privateKey }).encrypted);
  t("Crypto_Opt fallback plaintext", decryptResponseBody('{"a":1}', true, { sm4Key }).fallbackPlain === true);
  t("matchKey ignores SM2 randomness", matchKey({ method: "post", url: "http://x/xf-api/a?b=1&a=2", body: sm2.doEncrypt('{"x":1,"y":2}', publicKey, 1) }, { keys: { sm2PrivateKey: privateKey } }) === matchKey({ method: "POST", url: "http://y/xf-api/a?a=2&b=1", body: JSON.stringify({ data: sm2.doEncrypt('{"y":2,"x":1}', publicKey, 1) }) }, { keys: { sm2PrivateKey: privateKey } }));
  console.log(`${pass === total ? "SELFTEST PASS" : "SELFTEST FAIL"} ${pass}/${total} (samples: ${samples.length}, from files: ${samples.length - 5})`);
  return pass === total ? 0 : 1;
}
