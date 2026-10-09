// Build .auth/<site>-original.json (the app's own storage, as captured) and .auth/<site>-restored.json (plaintext
// equivalents for the keys the restored pages read). Values never printed. Also writes out/capture-routes.json.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
const routes = {};
const samples = JSON.parse(readFileSync("tools/samples.json", "utf8"));
for (const site of ["portal", "usercenter"]) {
  const raw = JSON.parse(readFileSync(`har/raw/storage-${site}_json.json`, "utf8"));
  writeFileSync(`.auth/${site}-original.json`, JSON.stringify({ localStorage: raw.localStorage, sessionStorage: raw.sessionStorage }));
  // plaintext user info from the captured getSysUserByToken response (portal) / listOneForWebSite (uc)
  let user = null, token = null;
  for (const f of readdirSync("har/raw")) {
    if (!f.startsWith(`har-${site}-`)) continue;
    const cap = JSON.parse(readFileSync(`har/raw/${f}`, "utf8"));
    const id = samples[site].find((s) => f.includes(s.route.replace(/[^\w]+/g, "_").replace(/^_|_$/g, "")))?.id;
    if (id) routes[site] ??= {}, routes[site][id] = cap.route;
    for (const e of cap.entries) {
      if (/getSysUserByToken|xfSysUser\/listOneForWebSite|getXfSysUserInfo/.test(e.url) && e.body) { try { const b = JSON.parse(e.plain ?? e.body); if (b && b.result && !user) user = b.result; } catch {} }
      if (e.reqHeaders && e.reqHeaders["X-Access-Token"] && !token) token = e.reqHeaders["X-Access-Token"];
    }
  }
  // token header values were redacted at capture time; take the raw storage token if present (never printed)
  const ls = raw.localStorage;
  const restored = { localStorage: Object.fromEntries(Object.entries(ls).filter(([k, v]) => !/^[0-9a-f]{32,}$/.test(String(v)))), sessionStorage: { ...raw.sessionStorage } }; // plain keys as-is; encrypted ones rebuilt below
  if (ls.token) restored.localStorage.token = ls.token;
  if (user) {
    restored.localStorage.userInfo = JSON.stringify(user.userInfo ?? user);
    restored.localStorage.xfSysUserId = JSON.stringify(user.userInfo?.id ?? user.id ?? user);
    restored.localStorage.userbyid = JSON.stringify(user.userInfo ?? user);
    if (user.sysUser) restored.localStorage.sysUserId = JSON.stringify(user.sysUser.id);
  }
  { // derive the user id the original sends (xfSysUserId) — the profile response itself is field-encrypted from the page requests (query/body parameter xfSysUserId)
    let uid = null;
    for (const f of readdirSync("har/raw")) { if (!f.startsWith(`har-${site}-`)) continue; for (const e of JSON.parse(readFileSync(`har/raw/${f}`, "utf8")).entries) { const m = (e.url + " " + (e.postData || "")).match(/xfSysUserId[=":]+"?(\w+)/); if (m) { uid = m[1]; break; } } if (uid) break; }
    if (uid) { const prev = (() => { try { return JSON.parse(restored.localStorage.userInfo || "{}"); } catch { return {}; } })(); const info = { ...(typeof prev === "object" && prev ? prev : {}), id: uid }; restored.localStorage.xfSysUserId = JSON.stringify({ id: uid }); restored.localStorage.userbyid = JSON.stringify(info); restored.localStorage.userInfo = JSON.stringify(info); }
    console.log(site, "uid derived", !!uid);
  }
  for (const k of ["idenityType", "userCenterPre", "userUrl", "funcs", "appConfig"]) if (ls[k] != null) restored.localStorage[k] = ls[k];
  writeFileSync(`.auth/${site}-restored.json`, JSON.stringify(restored));
  console.log(site, "original keys", Object.keys(ls).length, "restored keys", Object.keys(restored.localStorage).join(","), "user found", !!user, "routes", Object.keys(routes[site] ?? {}).length);
}
writeFileSync("out/capture-routes.json", JSON.stringify(routes, null, 1));
