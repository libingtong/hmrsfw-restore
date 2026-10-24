// What pw-login.mjs records about the login flow (HM-1308). The 10-24 failures could not be told apart because only the
// request path was logged: login refused by the server, or accepted but not stored. Now every login-flow response is
// summarized to its HTTP status and the reply's code / success / message, never more: the body is parsed in memory only
// (it carries the token on success), request bodies are never read. Responses marked `Crypto_Opt: true` are SM4
// encrypted; they are decrypted only when VITE_HMRSFW_SM4_KEY is set (from the environment, never printed), otherwise the
// record says encrypted and the page toast (also recorded) carries the message. Of the headers that were actually sent
// only names are kept, plus Origin and Referer as origin + path, to see whether the route layer changed them.
// Messages are cut to 200 characters with JWTs and long digit runs (phone / ID numbers) masked.
import { decryptResponseBody, keysFromEnv } from "./har-decrypt.mjs";

export const clean = (s) => s == null ? null : String(s).replace(/eyJ[\w-]+\.[\w-]+\.[\w-]*/g, "<jwt>").replace(/\d{6,}/g, "<digits>").slice(0, 200);
const originPath = (u) => { try { const x = new URL(u); return x.origin + x.pathname; } catch { return u ? "<unparsable>" : null; } };
const cookieNames = (h) => h ? String(h).split(/;\s*/).map((c) => c.split("=")[0]).filter(Boolean) : [];

/** Summary of one response: { status, encrypted, decrypted, code, success, message }. `text` is the raw body. */
export function summarizeReply({ status, headers = {}, text }, { sm4Key } = {}) {
  const out = { status, encrypted: headers.crypto_opt === "true", decrypted: null, code: null, success: null, message: null };
  let value;
  try {
    const key = out.encrypted ? sm4Key ?? (() => { try { return keysFromEnv().sm4Key; } catch { return undefined; } })() : undefined;
    if (out.encrypted && !key) { out.decrypted = false; return out; }
    const r = decryptResponseBody(text, out.encrypted, { sm4Key: key });
    if (out.encrypted) out.decrypted = true;
    value = r.value;
  } catch { if (out.encrypted) out.decrypted = false; return out; }
  if (value && typeof value === "object") {
    out.code = value.code ?? null; out.success = typeof value.success === "boolean" ? value.success : null; out.message = clean(value.message);
  }
  return out;
}

/** Sent headers, names only; Origin / Referer as origin + path; cookie names (values never). `headers`: request.allHeaders(). */
export function sentHeaders(headers = {}) {
  return { headerNames: Object.keys(headers).map((k) => k.toLowerCase()).sort(), origin: headers.origin ?? null, referer: originPath(headers.referer), cookieNames: cookieNames(headers.cookie) };
}

/** One line for the console / banner, e.g. 登录接口 HTTP 200，code 412：验证码错误 */
export function replyLine(r) {
  if (r.encrypted && !r.decrypted) return `登录接口 HTTP ${r.status}（响应已加密，未设置 VITE_HMRSFW_SM4_KEY，读不到 code；看页面提示）`;
  if (r.code == null && r.success == null) return `登录接口 HTTP ${r.status}（响应不是 JSON）`;
  return `登录接口 HTTP ${r.status}，code ${r.code ?? "-"}${r.success === true ? "，成功" : r.success === false ? "，失败" : ""}${r.message ? "：" + r.message : ""}`;
}
