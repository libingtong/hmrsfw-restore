// Identity (role) of every user-center page work order, for record-page.mjs (HM-35; docs/pipeline.md §12 queue/).
// The user-center router is one flat list and the menus come from the backend per identity, so the identity of a page is
// read from its record route and its chunk, strongest evidence first:
//   1. system page (login, transit, error) or a header entry every identity has (user dropdown, message bell) → general;
//   2. home of an identity: the original's identity switch (changeRole / header dropdown: userroledata type → push(home));
//      a home of an identity record-page cannot switch to (IDENTITIES) → null;
//   3. menu of an identity: tools/uc-identity-menus.json (routermenu of the test account per identity, HM-9);
//   4. links (a route path literal in a chunk; a route with params matches its static part): a page linked only from pages
//      of one identity → that identity; a page nothing decided links to, whose own links go only to pages of one identity
//      (homes and identity-free pages left out: "back to home" is no evidence) → that identity. Repeated until nothing
//      changes; links from identity-switch pages (they link to two or more homes) do not count.
//   5. arbiter decisions: tools/uc-role-decisions.json (HM-227), read from the original chunk with file:line:col evidence,
//      for pages rules 1–4 leave without a role (never overrides a role they found): `decided` → that role;
//      `pending` → still null, its notes carry the suggestion and what a person has to confirm.
// Anything else, and a page linked from pages of different identities, gets null and a reason (notes): record-page then
// stops with blocked need-role-decision instead of guessing.
// Usage: import { ucRoles } from "./uc-roles.mjs"; ucRoles(pageOrders) → Map(order id → { role, by } | { role: null, notes })
import { readFileSync } from "node:fs";
import path from "node:path";
import { ROOT, chunkSource } from "./scope.mjs";
import { IDENTITIES } from "./record-lib.mjs";

const SYSTEM = { "/login": "登录页", "/autoLogin": "登录中转页", "/403": "无权限页", "/404": "空白页" };
// entry chunk: user dropdown key 0/1/2 → StorageChgPassword / changephone / nom; the bell → mynews (no identity check)
const HEADER = { "/StorageChgPassword": "顶栏下拉「修改密码」", "/changephone": "顶栏下拉「更改手机号」", "/nom": "顶栏下拉「个人基本信息」", "/mynews": "顶栏消息铃铛" };
// identity switch of the original (changeRole chunk and the header dropdown): userroledata type → home; any other type → /main
const HOMES = { "/main": { type: "其他", label: "普通用户" }, "/jobhunterhome": { type: 0, label: "求职者" }, "/CorpCenter": { type: "10/100/110", label: "招聘单位" }, "/mentorhome": { type: 20, label: "职业导师" },
  "/schoolgraduatehome": { type: 40, label: "高校毕业生" }, "/marketCenter": { type: 50, label: "招聘超市" }, "/experthome": { type: 60, label: "专家" }, "/collage/studentInfo": { type: 120, label: "在校生" } };
const identityOfHome = (p) => Object.keys(IDENTITIES).find((k) => IDENTITIES[k].home === p) ?? null;
const MENUS = JSON.parse(readFileSync(path.join(ROOT, "tools/uc-identity-menus.json"), "utf8"));
const DECISIONS = JSON.parse(readFileSync(path.join(ROOT, "tools/uc-role-decisions.json"), "utf8"));
const staticPart = (p) => p.replace(/\/:.*$/, "") || "/";

export function ucRoles(pages) {
  const site = "usercenter";
  const byRoute = new Map(); for (const o of pages) for (const r of o.routes) byRoute.set(staticPart(r.path), o.id);
  const links = new Map(pages.map((o) => {
    const src = chunkSource(site, o.sourceChunk.split("/").pop()) ?? "";
    return [o.id, new Set([...src.matchAll(/"(\/[A-Za-z][\w/]*)"/g)].map((m) => byRoute.get(m[1].replace(/(.)\/$/, "$1"))).filter((x) => x && x !== o.id))];
  }));
  const linkedFrom = (id) => pages.filter((x) => links.get(x.id).has(id));
  const homeOrders = new Set(Object.keys(HOMES).map((p) => byRoute.get(p)).filter(Boolean));
  const hub = (id) => [...links.get(id)].filter((x) => homeOrders.has(x)).length >= 2;
  const out = new Map();
  for (const o of pages) {
    const p = staticPart(o.recordPath);
    if (SYSTEM[p]) { out.set(o.id, { role: "general", by: `系统页（${SYSTEM[p]}），与身份无关` }); continue; }
    if (HEADER[p]) { out.set(o.id, { role: "general", by: `${HEADER[p]}，所有身份共用，与身份无关` }); continue; }
    if (HOMES[p]) {
      const id = identityOfHome(p), h = HOMES[p];
      out.set(o.id, id ? { role: id, by: `「${h.label}」身份的主页（原版切换身份时跳到 ${p}）` } : { role: null, notes: `「${h.label}」身份（userroledata type ${h.type}）的主页，record-page 能切的身份（${Object.keys(IDENTITIES).join(" / ")}）里没有它` });
      continue;
    }
    const inMenu = Object.keys(IDENTITIES).filter((k) => MENUS[k]?.includes(p));
    if (inMenu.length === 1) out.set(o.id, { role: inMenu[0], by: `「${IDENTITIES[inMenu[0]].label}」身份的菜单项（uc-identity-menus.json）` });
    else if (inMenu.length > 1) out.set(o.id, { role: null, notes: `${inMenu.map((k) => IDENTITIES[k].label).join("、")}的菜单里都有 ${p}` });
  }
  // a decided page with a role passes it on through its links; a foreign identity's home counts as its own identity
  const generic = new Set(pages.filter((o) => homeOrders.has(o.id) || SYSTEM[staticPart(o.recordPath)] || HEADER[staticPart(o.recordPath)]).map((o) => o.id));
  const tag = (id) => { const d = out.get(id); if (!d) return null; if (d.role) return d.role; const h = Object.entries(HOMES).find(([p]) => byRoute.get(p) === id); return h ? `type:${h[1].type}` : null; };
  const label = (t) => IDENTITIES[t]?.label ?? `「${Object.values(HOMES).find((h) => `type:${h.type}` === t)?.label}」`;
  // one pass over the undecided pages: inbound links, or (outbound) where the page's own links point
  const pass = (outbound) => {
    const next = [];
    for (const o of pages) {
      if (out.has(o.id)) continue;
      const from = outbound ? pages.filter((x) => links.get(o.id).has(x.id) && tag(x.id) && !generic.has(x.id)) : linkedFrom(o.id).filter((x) => tag(x.id) && !hub(x.id));
      const tags = [...new Set(from.map((x) => tag(x.id)))];
      if (!tags.length) continue;
      const ids = from.map((x) => x.id).sort().join("、");
      const only = (t) => outbound ? `它链出去的页面只属于${t}身份` : `只有${t}身份的页面链到它`;
      next.push([o.id, tags.length > 1 ? { role: null, notes: `${outbound ? "它链到不同身份的页面" : "不同身份的页面都链到它"}：${from.map((x) => `${x.id}（${label(tag(x.id))}）`).join("、")}` }
        : IDENTITIES[tags[0]] ? { role: tags[0], by: `${only(`「${IDENTITIES[tags[0]].label}」`)}：${ids}` } : { role: null, notes: `${only(label(tags[0]))}（${ids}），record-page 切不到这个身份` }]);
    }
    for (const [id, d] of next) out.set(id, d);
    return next.length > 0;
  };
  // inbound evidence first, until it settles; outbound only for what is still open, then inbound again
  do { while (pass(false)); } while (pass(true));
  for (const o of pages) {
    if (out.get(o.id)?.role) continue;
    const p = staticPart(o.recordPath), d = DECISIONS.decided[p], q = DECISIONS.pending[p];
    if (d && IDENTITIES[d.role]) out.set(o.id, { role: d.role, by: `裁定（uc-role-decisions.json）：${d.by}`, evidence: d.evidence });
    else if (q) out.set(o.id, { role: null, notes: `待人确认（uc-role-decisions.json）：${q.notes}；建议 ${q.suggest}；需要确认：${q.ask}`, evidence: q.evidence });
  }
  for (const o of pages) if (!out.has(o.id)) out.set(o.id, { role: null, notes: `没有身份线索：${o.recordPath} 不是身份主页，不在已录到的求职者 / 招聘单位 / 职业导师菜单里，也没有和已定身份的页面互相链接（可能是普通用户身份的菜单，或哈密没有开放的功能）` });
  return out;
}
