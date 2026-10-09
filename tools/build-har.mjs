// Convert raw captures (har/raw/har-<site>-<id>.json) into HAR 1.2 files for Playwright routeFromHAR.
// - encrypted responses are written as the plaintext captured after the app's own decryption, without the crypto_opt header
// - POST bodies are NOT written into the HAR (so both the original and the restored app match by URL+method only);
//   they are kept in har/<site>/<id>.posts.json for the request-sequence comparison
// - the host is written as the placeholder http://__ORIGIN__ and rewritten per target at replay time
// Usage: node tools/build-har.mjs
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import path from "node:path";
const RAW = "har/raw";
const summary = [];
for (const f of readdirSync(RAW)) {
  const m = f.match(/^har-(portal|usercenter)-(.+?)(?:_json)?\.json$/);
  if (!m) continue;
  const [, site, id] = m;
  const raw = JSON.parse(readFileSync(path.join(RAW, f), "utf8"));
  const origin = new URL(raw.entries[0]?.url ?? "https://x/").origin;
  // pair encrypted bodies with the plaintexts the app's interceptor parsed: SM4/PKCS7 → hex length = 2 * 16 * (floor(bytes/16) + 1)
  const plains = (raw.plains || []).map((t) => ({ t, len: 32 * (Math.floor(Buffer.byteLength(t, "utf8") / 16) + 1), used: false }));
  for (const e of raw.entries) { if (!e.crypto) continue; delete e.plain; const hl = (e.body || "").length; const p = plains.find((x) => !x.used && x.len === hl); if (p) { p.used = true; e.plain = p.t; } else e.pairing = "unpaired"; } // a plaintext is never reused for a second response
  const entries = [], posts = [], nonGet = [], seen = new Set();
  for (const e of raw.entries) {
    const url = e.url.replace(origin, "http://__ORIGIN__");
    const method = e.method.toUpperCase();
    const headers = (e.resHeaders || "").split(/\r?\n/).map((l) => l.split(/:\s(.*)/)).filter((p) => p[0]).map(([name, value]) => ({ name: name.toLowerCase(), value: value ?? "" }));
    const body = e.crypto ? (e.plain ?? null) : e.body;
    if (e.crypto && !e.plain) { summary.push(`${site}/${id}: ENCRYPTED WITHOUT PLAINTEXT ${method} ${url}`); }
    const resHeaders = headers.filter((h) => h.name !== "crypto_opt" && h.name !== "content-length" && h.name !== "content-encoding");
    if (!resHeaders.some((h) => h.name === "content-type")) resHeaders.push({ name: "content-type", value: "application/json" });
    if (method !== "GET") { nonGet.push({ method, url: url.split("?")[0] }); posts.push({ method, url, postData: e.postData }); }
    const key = method + " " + url;
    if (seen.has(key)) continue; // keep the first response for a given method+URL
    seen.add(key);
    entries.push({
      startedDateTime: new Date(e.t || Date.now()).toISOString(), time: 1,
      request: { method, url, httpVersion: "HTTP/1.1", cookies: [], headers: [], queryString: [], headersSize: -1, bodySize: -1 },
      response: { status: e.status ?? 200, statusText: "OK", httpVersion: "HTTP/1.1", cookies: [], headers: resHeaders, content: { size: body?.length ?? 0, mimeType: resHeaders.find((h) => h.name === "content-type")?.value ?? "application/json", text: body ?? "" }, redirectURL: "", headersSize: -1, bodySize: -1 },
      cache: {}, timings: { send: 0, wait: 1, receive: 0 },
    });
  }
  mkdirSync(`har/${site}`, { recursive: true });
  writeFileSync(`har/${site}/${id}.har`, JSON.stringify({ log: { version: "1.2", creator: { name: "capture-har.js", version: "poc" }, entries } }, null, 1));
  writeFileSync(`har/${site}/${id}.posts.json`, JSON.stringify(posts, null, 1));
  summary.push(`${site}/${id}: ${entries.length} entries (${raw.entries.length} captured, ${nonGet.length} non-GET, ${raw.entries.filter((e) => e.crypto).length} encrypted -> ${raw.entries.filter((e) => e.plain).length} plaintext); route ${raw.route.split("?")[0]} final ${raw.finalPath.split("?")[0]} text ${raw.textLength}`);
  summary.push("  non-GET: " + [...new Set(nonGet.map((n) => n.method + " " + n.url.replace("http://__ORIGIN__", "")))].join(", "));
}
writeFileSync("out/har-summary.txt", summary.join("\n") + "\n");
console.log(summary.join("\n"));
