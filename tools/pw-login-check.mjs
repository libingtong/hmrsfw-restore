// Check of the login states pw-login.mjs saved (HM-967). Each site is checked on its own: the file exists, its token's exp
// claim can be read, and the token has not expired. The two sites' exp are NOT compared: the user center's autoLogin page
// trades the portal token for a token of its own, with its own expiry (HM-560 assumed they matched; they never do).
// Only the exp claim is read, the token is never printed.
import { readFileSync } from "node:fs";

export const SOON_MS = 2 * 3600e3; // less than this left → hint to log in again soon

// exp (seconds) of the token stored for `origin` in a saved storageState file; null when the file, the token or exp is missing
export function tokenExp(file, origin) {
  try {
    const st = JSON.parse(readFileSync(file, "utf8"));
    const t = st.origins.find((o) => o.origin === origin)?.localStorage.find((x) => x.name === "token")?.value;
    const exp = JSON.parse(Buffer.from(String(t).replace(/^"|"$/g, "").split(".")[1], "base64url").toString()).exp;
    return Number.isFinite(exp) ? exp : null;
  } catch { return null; }
}

const fmt = (sec) => new Date(sec * 1000).toLocaleString("zh-CN", { hour12: false });
const span = (ms) => { const m = Math.floor(ms / 60000); return m >= 60 ? `${Math.floor(m / 60)} 小时 ${m % 60} 分钟` : `${m} 分钟`; };

// sites: [{ key, name, file, origin }] → { ok, lines: [{ level: "log" | "warn" | "error", text }] }
// ok = every site's file exists and holds an unexpired token; a site expiring within SOON_MS only adds a hint.
export function checkSaved(sites, now = Date.now()) {
  const lines = [];
  let ok = true;
  for (const s of sites) {
    const exp = tokenExp(s.file, s.origin);
    if (exp === null) { ok = false; lines.push({ level: "error", text: `[${s.key}] 校验失败：${s.file} 不存在或读不出 token 过期时间，请重新登录${s.name}` }); continue; }
    const left = exp * 1000 - now;
    if (left <= 0) { ok = false; lines.push({ level: "error", text: `[${s.key}] 校验失败：${s.name} token 已于 ${fmt(exp)} 过期，请重新登录${s.name}` }); continue; }
    lines.push({ level: "log", text: `[${s.key}] token 过期时间：${fmt(exp)}（还剩约 ${span(left)}）` });
    if (left < SOON_MS) lines.push({ level: "warn", text: `[${s.key}] 提示：${s.name}登录态不足 2 小时就过期，录制前请留意，必要时重新登录` });
  }
  lines.push(ok ? { level: "log", text: `校验通过：${sites.map((s) => s.name).join("、")}登录态都已保存且未过期（各站 token 过期时间各自独立，不要求一致）` } : { level: "error", text: "校验失败：有登录态文件缺失、读不出或已过期" });
  return { ok, lines };
}
