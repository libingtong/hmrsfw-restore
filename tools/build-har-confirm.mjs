// Build replay HARs for the 20-page confirmation from har/confirm/<id>.json. Encrypted responses stay CIPHERTEXT with
// their Crypto_Opt header (both apps decrypt in memory at replay). Request bodies are not stored in the HAR (SM2
// ciphertext is randomised, so matching is by method + URL). Usage: node tools/build-har-confirm.mjs
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
mkdirSync("har/confirm-replay", { recursive: true });
for (const f of readdirSync("har/confirm").filter((x) => x.endsWith(".json"))) {
  const raw = JSON.parse(readFileSync(`har/confirm/${f}`, "utf8"));
  const origin = new URL(raw.entries[0]?.url ?? "https://x/").origin; const seen = new Set(); const entries = [];
  for (const e of raw.entries) {
    const url = e.url.replace(origin, "http://__ORIGIN__"); const key = e.method + " " + url; if (seen.has(key)) continue; seen.add(key);
    const headers = (e.resHeaders || "").split("\n").map((l) => l.split(/:\s(.*)/)).filter((p) => p[0]).map(([name, value]) => ({ name: name.toLowerCase(), value: value ?? "" })).filter((h) => !["content-length", "content-encoding", "transfer-encoding"].includes(h.name));
    entries.push({ startedDateTime: new Date(e.t).toISOString(), time: 1, request: { method: e.method, url, httpVersion: "HTTP/1.1", cookies: [], headers: [], queryString: [], headersSize: -1, bodySize: -1 }, response: { status: e.status, statusText: "OK", httpVersion: "HTTP/1.1", cookies: [], headers, content: { size: (e.body || "").length, mimeType: headers.find((h) => h.name === "content-type")?.value ?? "application/json", text: e.body || "" }, redirectURL: "", headersSize: -1, bodySize: -1 }, cache: {}, timings: { send: 0, wait: 1, receive: 0 } });
  }
  writeFileSync(`har/confirm-replay/${raw.id}.har`, JSON.stringify({ log: { version: "1.2", creator: { name: "pw-record", version: "confirm" }, entries } }));
  console.log(raw.id, entries.length, "entries,", entries.filter((x) => x.response.headers.some((h) => h.name === "crypto_opt" && h.value === "true")).length, "encrypted (kept as ciphertext)");
}
