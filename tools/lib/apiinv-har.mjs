// Test-environment side of the API reconciliation (HM-23, tools/api-inventory.mjs): what the recorded HARs show the
// test backend actually answered. Per method + gateway path: status codes, Crypto_Opt, how the request body was sent
// (plain / SM2), the request parameter NAMES (query keys, plain or decrypted body keys) and the response JSON SHAPE
// (keys and JSON types). No value leaves this module — a shape is {type, keys:{k: shape}, items: shape}.
// Encrypted responses need VITE_HMRSFW_SM4_KEY and encrypted request bodies SM2_PRIVATE_KEY (tools/har-decrypt.mjs);
// without them the record says so and the shape / body keys stay unknown.
import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import { readEntries, decryptRequestBody, decryptResponseBody, keysFromEnv } from "../har-decrypt.mjs";
import { normPath } from "./apiinv-frontend.mjs";

const MAX_DEPTH = 6;
const jsonType = (v) => (v === null ? "null" : Array.isArray(v) ? "array" : typeof v);

/** Shape of a JSON value (keys and types only). Arrays merge the shapes of all their items. */
export function shapeOf(v, depth = 0) {
  const t = jsonType(v);
  if (depth >= MAX_DEPTH) return { type: t };
  if (t === "object") return { type: t, keys: Object.fromEntries(Object.keys(v).sort().map((k) => [k, shapeOf(v[k], depth + 1)])) };
  if (t === "array") return { type: t, items: v.reduce((acc, x) => mergeShape(acc, shapeOf(x, depth + 1)), null) };
  return { type: t };
}

/** Union of two shapes: `types` lists every JSON type seen; keys and items merge recursively. */
export function mergeShape(a, b) {
  if (!a) return b; if (!b) return a;
  const types = [...new Set([...(a.types ?? [a.type]), ...(b.types ?? [b.type])])].sort();
  const out = { type: types.filter((t) => t !== "null")[0] ?? "null" };
  if (types.length > 1) out.types = types;
  if (a.keys || b.keys) { out.keys = { ...(a.keys ?? {}) }; for (const [k, s] of Object.entries(b.keys ?? {})) out.keys[k] = mergeShape(out.keys[k], s); }
  if (a.items || b.items) out.items = mergeShape(a.items, b.items);
  return out;
}

function harFiles(dirs) {
  const out = [];
  const walk = (d) => { for (const n of readdirSync(d)) { const p = path.join(d, n); const st = statSync(p); if (st.isDirectory()) walk(p); else out.push(p); } };
  for (const d of dirs) walk(d);
  // HAR 1.2 and POC captures ({entries:[…]}). *.posts.json repeat the request half of a capture; storage-*.json is browser storage.
  return out.filter((f) => /\.har$/.test(f) || (/\.json$/.test(f) && !/\.posts\.json$/.test(f) && !/storage-/.test(path.basename(f)))).sort();
}

/**
 * Inventory of the recorded traffic. `dirs`: HAR directories; `hosts`: allowed test hosts (others are skipped and
 * counted); `apiPrefix`: the gateway prefix in front of every backend call.
 */
export function scanHars({ dirs, hosts, apiPrefix }) {
  const keys = keysFromEnv();
  const pre = "/" + apiPrefix.replace(/^\/|\/$/g, "") + "/";
  const files = harFiles(dirs);
  const eps = new Map();
  const stats = { files: files.length, entries: 0, api: 0, skippedHosts: {}, unreadable: [], reqEncrypted: 0, reqUndecrypted: 0, resEncrypted: 0, resUndecrypted: 0, resNotJson: 0 };
  for (const f of files) {
    let entries;
    try { entries = readEntries(f); } catch { stats.unreadable.push(path.basename(f)); continue; }
    for (const e of entries) {
      stats.entries++;
      let u; try { u = new URL(e.url); } catch { continue; }
      if (!u.pathname.startsWith(pre)) continue;
      if (!hosts.includes(u.hostname)) { stats.skippedHosts[u.hostname] = (stats.skippedHosts[u.hostname] ?? 0) + 1; continue; }
      stats.api++;
      const p = normPath(u.pathname, apiPrefix);
      const k = `${e.method} ${p}`;
      const rec = eps.get(k) ?? { method: e.method, path: p, samples: 0, files: new Set(), sites: new Set(), status: {}, cryptoOpt: { true: 0, false: 0 }, req: { forms: {}, encrypted: 0, undecrypted: 0, queryKeys: new Set(), bodyKeys: new Set() }, res: { encrypted: 0, undecrypted: 0, notJson: 0, shape: null, success: {} } };
      rec.samples++; rec.files.add(path.relative(path.dirname(dirs[0]), f)); rec.sites.add(u.hostname);
      rec.status[e.status] = (rec.status[e.status] ?? 0) + 1;
      rec.cryptoOpt[e.cryptoOpt ? "true" : "false"]++;
      for (const q of u.searchParams.keys()) rec.req.queryKeys.add(q);
      // Request body
      let reqForm = "empty";
      try {
        const r = decryptRequestBody(e.reqBody, { privateKey: keys.sm2PrivateKey });
        reqForm = r.form; if (r.encrypted) { rec.req.encrypted++; stats.reqEncrypted++; }
        if (r.value && typeof r.value === "object" && !Array.isArray(r.value)) for (const bk of Object.keys(r.value)) rec.req.bodyKeys.add(bk);
      } catch { reqForm = "sm2-undecrypted"; rec.req.encrypted++; rec.req.undecrypted++; stats.reqEncrypted++; stats.reqUndecrypted++; }
      rec.req.forms[reqForm] = (rec.req.forms[reqForm] ?? 0) + 1;
      // Response body
      try {
        const r = decryptResponseBody(e.resBody, e.cryptoOpt, { sm4Key: keys.sm4Key });
        if (r.encrypted) { rec.res.encrypted++; stats.resEncrypted++; }
        if (r.value && typeof r.value === "object") {
          rec.res.shape = mergeShape(rec.res.shape, shapeOf(r.value));
          if ("success" in r.value) rec.res.success[String(r.value.success)] = (rec.res.success[String(r.value.success)] ?? 0) + 1;
        } else if (e.resBody) { rec.res.notJson++; stats.resNotJson++; }
      } catch { rec.res.undecrypted++; stats.resUndecrypted++; }
      eps.set(k, rec);
    }
  }
  const endpoints = [...eps.values()].map((r) => ({ ...r, files: [...r.files].sort(), sites: [...r.sites].sort(), req: { ...r.req, queryKeys: [...r.req.queryKeys].sort(), bodyKeys: [...r.req.bodyKeys].sort() } }))
    .sort((a, b) => (a.path + a.method).localeCompare(b.path + b.method));
  return { stats, endpoints, keys: { sm2: !!keys.sm2PrivateKey, sm4: !!keys.sm4Key } };
}
