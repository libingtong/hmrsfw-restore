// Shared pieces of the recording line (record-page.mjs, record-baseline-placeholder.mjs): work-order lookup, the two
// test sites, the human-prepared login states, user-center identities (switch, pin, account lock), interaction-coverage
// rule, per-order lock, and committing an interaction script to the integration branch. See docs/pipeline.md §6 (录制员), §12 and §14.
import { execFileSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { ROOT } from "./interact.mjs";

export { ROOT };
// The only hosts a recording may reach (§14.2). Anything else, production included, is aborted.
export const ORIGIN = { portal: "https://hamiwebportaltest.rencaidanao.com", usercenter: "https://hamiusercentertest.rencaidanao.com" };
export const TEST_HOSTS = new Set(Object.values(ORIGIN).map((o) => new URL(o).host));
export const LEGACY_DIR = { portal: "legacy-dist/portal", usercenter: "legacy-dist/usercenter" };
// One test account per site. The user center account has four identities (李炳通, HM-7, 2026-10-09), switched in the
// header dropdown ("右上角"); the identity lives in the browser only (localStorage radiotype = the identity's roleId in
// userroledata; no request header carries it), so a login state says nothing about the identity: record-page switches
// to the work order's identity before every recording and checks it again after the page load.
export const IDENTITIES = {
  general: { type: null, home: "/main", label: "普通用户" },
  jobseeker: { type: 0, home: "/jobhunterhome", label: "求职者" },
  corp: { type: 10, home: "/CorpCenter", label: "招聘单位" },
  mentor: { type: 20, home: "/mentorhome", label: "职业导师" },
};
// Work-order role → identity. Old labels from the POC (tools/confirm-orders.json, one login state per role) still work.
// Portal orders carry role general (no identity); a user-center order whose identity work-orders.mjs could not decide
// has role null (its notes say why): it stays null, record-page stops with need-role-decision instead of guessing.
const ROLE_ALIAS = { "usercenter-general": "general", "usercenter-jobseeker": "jobseeker", "usercenter-corp": "corp", "usercenter-mentor": "mentor" };
export function normalizeRole(site, role) {
  if (site === "portal") return role == null || role === "portal" || role === "general" ? "portal" : null;
  if (role == null) return null;
  const r = ROLE_ALIAS[role] ?? role;
  return IDENTITIES[r] ? r : null;
}

export const sha256 = (s) => createHash("sha256").update(s).digest("hex");
const MIME = { ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf", ".html": "text/html", ".webp": "image/webp" };
// A file of the published original (legacy-dist/<site>), SPA fallback to index.html → { contentType, body }.
export function legacyFile(site, pathname) {
  const dir = path.join(ROOT, LEGACY_DIR[site]);
  let f = path.join(dir, decodeURIComponent(pathname));
  if (!f.startsWith(dir + path.sep) || !existsSync(f) || statSync(f).isDirectory()) f = path.join(dir, "index.html");
  return { contentType: MIME[path.extname(f)] ?? "application/octet-stream", body: readFileSync(f) };
}
export const fail = (msg) => { const e = new Error(msg); e.userFacing = true; return e; };

export function envDirs() {
  const assets = process.env.RESTORE_ASSETS, state = process.env.RESTORE_STATE;
  if (!assets || !state) throw fail("RESTORE_ASSETS and RESTORE_STATE must be set (Mac mini only, docs/pipeline.md §1)");
  return { assets: path.resolve(assets), state: path.resolve(state) };
}

export const validId = (id) => typeof id === "string" && /^[A-Za-z0-9][\w.-]*$/.test(id);

// Work order: --order <file> > queue/<id>.json (C) > tools/confirm-orders.json (the 20 POC confirmation pages).
export function resolveOrder(id, orderFile) {
  let o = null, from = null;
  if (orderFile) { o = JSON.parse(readFileSync(path.resolve(orderFile), "utf8")); from = path.relative(ROOT, path.resolve(orderFile)); }
  else if (existsSync(path.join(ROOT, "queue", `${id}.json`))) { o = JSON.parse(readFileSync(path.join(ROOT, "queue", `${id}.json`), "utf8")); from = `queue/${id}.json`; }
  else { o = JSON.parse(readFileSync(path.join(ROOT, "tools/confirm-orders.json"), "utf8")).find((x) => x.id === id) ?? null; from = o && "tools/confirm-orders.json"; }
  if (!o) throw fail(`work order ${id} not found (queue/${id}.json, tools/confirm-orders.json, or pass --order <file>)`);
  if (o.id && o.id !== id) throw fail(`work order file is for ${o.id}, not ${id}`);
  const site = o.site ?? (o.app === "uc" ? "usercenter" : o.app);
  if (!ORIGIN[site]) throw fail(`work order ${id}: unknown site ${site}`);
  if (typeof o.recordPath !== "string" || !o.recordPath.startsWith("/")) throw fail(`work order ${id}: recordPath missing (must start with /)`);
  const role = normalizeRole(site, o.role);
  if (!role && !(site === "usercenter" && o.role == null)) throw fail(`work order ${id}: unknown role ${o.role} for ${site} (portal: general; usercenter: ${Object.keys(IDENTITIES).join(" / ")}, or null when undecided)`);
  return { ...o, id, site, role, from };
}

// Login state prepared by a human (pw-login.mjs), one per site: $RESTORE_ASSETS/.auth/pw-<site>.json. It carries the
// session only; the identity is switched per recording (switchIdentity).
export function authState(assets, site) {
  const file = path.join(assets, ".auth", `pw-${site}.json`);
  if (!existsSync(file)) return { file, missing: true };
  const st = JSON.parse(readFileSync(file, "utf8"));
  const ls = Object.fromEntries((st.origins?.find((x) => x.origin === ORIGIN[site])?.localStorage ?? []).map((x) => [x.name, x.value]));
  return { file, state: st, localStorage: ls, hasToken: !!ls.token };
}

// Identity of a user-center localStorage: the userroledata entry whose roleId is radiotype → IDENTITIES key, or null.
export function identityOf(ls) {
  let list = []; try { list = JSON.parse(ls.userroledata ?? "[]") ?? []; } catch {}
  // the app keeps "roleId[,…]" in radiotype (e.g. the corp branch copies localStorage danwei) and reads the first part
  const r = list.find((x) => String(x.roleId) === String(ls.radiotype ?? "").split(",")[0]);
  if (!r) return null;
  return Object.keys(IDENTITIES).find((k) => typeMatches(r, k)) ?? null;
}
const typeMatches = (r, identity) => (IDENTITIES[identity].type === null ? r.type == null || r.type === "" : Number(r.type) === IDENTITIES[identity].type);
const roleIdOf = (ls, identity) => {
  let list = []; try { list = JSON.parse(ls.userroledata ?? "[]") ?? []; } catch {}
  const t = IDENTITIES[identity].type;
  return list.find((x) => typeMatches(x, identity))?.roleId ?? null;
};

// Switches the user-center identity of `page` (already on the test site, logged in) through the header dropdown, the way a
// person does it, then waits for radiotype and the identity's home page. → {ok} | {ok:false, reason}. Never logs in.
export async function switchIdentity(page, identity, { timeout = 20000 } = {}) {
  const ls = await page.evaluate(() => ({ ...localStorage }));
  const target = roleIdOf(ls, identity);
  if (!target) return { ok: false, reason: `the account has no ${IDENTITIES[identity].label} identity (userroledata)` };
  if (identityOf(ls) !== identity) {
    // the dropdown is in the header of the identity pages; /main of another identity has none, so start from the current home
    const cur = identityOf(ls);
    if (cur && new URL(page.url()).pathname !== IDENTITIES[cur].home) await page.goto(new URL(IDENTITIES[cur].home, page.url()).href, { waitUntil: "load", timeout: 60000 });
    try {
      await page.locator(".maring .ant-dropdown-link.ant-dropdown-trigger").first().hover({ timeout });
      const radio = page.locator(`.usermenu1 input.ant-radio-input[value="${target}"]`);
      await radio.waitFor({ state: "attached", timeout });
      await radio.locator("xpath=ancestor::label[1]").click({ timeout });
      await page.waitForFunction(([t, home]) => (localStorage.getItem("radiotype") ?? "").split(",")[0] === t || location.pathname === home, [String(target), IDENTITIES[identity].home], { timeout });
    } catch (e) { return { ok: false, reason: `switch to ${IDENTITIES[identity].label} failed: ${String(e.message).split("\n")[0].slice(0, 160)}` }; }
  }
  try { await page.waitForURL((u) => u.pathname === IDENTITIES[identity].home, { timeout }); } catch {
    if (new URL(page.url()).pathname !== IDENTITIES[identity].home) await page.goto(new URL(IDENTITIES[identity].home, page.url()).href, { waitUntil: "load", timeout: 60000 }).catch(() => {});
  }
  const live = await page.evaluate(() => ({ ...localStorage })).catch(() => ({}));
  if (identityOf(live) !== identity) return { ok: false, reason: `identity after switch is ${identityOf(live) ?? "unknown"}, not ${identity}` };
  return { ok: true, localStorage: live };
}

// Pinning (全局说明 §6「流程」3): the first successful recording of a site + identity stores a hash of the account (token
// username) and the identity's roleId in $RESTORE_STATE/record/identities.json; a later recording must see the same account and roleId (a
// different test account, or a re-created identity, means earlier recordings no longer match and is blocked).
export const pinKey = (site, role) => (site === "portal" ? "portal" : `usercenter:${role}`);
// The account is the token's JWT `username` claim (only its hash is kept; the encrypted user fields in localStorage change
// with every login). → {account: sha256 | null, exp: epoch seconds | null}
export function tokenInfo(ls) {
  try { const p = JSON.parse(Buffer.from(String(ls.token).split(".")[1], "base64url").toString("utf8")); return { account: p.username ? sha256(String(p.username)) : null, exp: Number(p.exp) || null }; }
  catch { return { account: null, exp: null }; }
}
export const identityFingerprint = (site, ls) => sha256(JSON.stringify(site === "portal" ? [tokenInfo(ls).account] : [tokenInfo(ls).account, String(ls.radiotype ?? "").split(",")[0] || null]));
const pinFile = (state) => path.join(state, "record", "identities.json");
const readPins = (state) => (existsSync(pinFile(state)) ? JSON.parse(readFileSync(pinFile(state), "utf8")) : {});
export function checkPin(state, key, fingerprint) {
  const pin = readPins(state)[key];
  return { ok: !pin || pin.fingerprint === fingerprint, pinned: !!pin };
}
export function pin(state, key, fingerprint) {
  const pins = readPins(state);
  if (pins[key]) return false;
  mkdirSync(path.dirname(pinFile(state)), { recursive: true });
  const tmp = `${pinFile(state)}.${process.pid}.tmp`;
  writeFileSync(tmp, JSON.stringify({ ...pins, [key]: { fingerprint, pinnedAt: new Date().toISOString() } }, null, 1));
  renameSync(tmp, pinFile(state));
  return true;
}

// Interaction coverage (D4, configurable in tools/record-config.json until decided): an explicit boolean
// `interactRequired` on the work order wins; otherwise form and action pages must have a script and the rest are
// sampled at `sampleRate` (deterministic per id).
export function coverage(order) {
  const cfg = JSON.parse(readFileSync(path.join(ROOT, "tools/record-config.json"), "utf8")).interactCoverage;
  if (typeof order.interactRequired === "boolean") return { required: order.interactRequired, reason: "work order interactRequired" };
  const chunk = order.sourceChunk && existsSync(path.join(ROOT, order.sourceChunk)) ? readFileSync(path.join(ROOT, order.sourceChunk), "utf8").replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16))) : "";
  const kinds = [];
  if (new RegExp(cfg.formPattern).test(chunk)) kinds.push("form");
  if (cfg.actionWords.some((w) => chunk.includes(`"${w}"`))) kinds.push("action");
  const hit = kinds.filter((k) => cfg.requiredKinds.includes(k));
  if (hit.length) return { required: true, reason: `page kind ${hit.join("+")}` };
  const sampled = parseInt(sha256(cfg.seed + ":" + order.id).slice(0, 8), 16) / 0xffffffff < cfg.sampleRate;
  return { required: sampled, reason: sampled ? `sampled (${cfg.sampleRate})` : `not sampled (${cfg.sampleRate})` };
}

// One recording per work order at a time: mkdir lock $RESTORE_STATE/locks/rec-<id>, taken over when its owner is gone.
export function lockOrder(state, id) {
  const dir = path.join(state, "locks", `rec-${id}`);
  mkdirSync(path.dirname(dir), { recursive: true });
  for (let i = 0; i < 2; i++) {
    try { mkdirSync(dir); writeFileSync(path.join(dir, "owner"), String(process.pid)); return () => rmSync(dir, { recursive: true, force: true }); }
    catch (e) {
      if (e.code !== "EEXIST") throw e;
      let pid = 0; try { pid = Number(readFileSync(path.join(dir, "owner"), "utf8")); } catch {}
      let alive = false; if (pid) { try { process.kill(pid, 0); alive = true; } catch (err) { alive = err.code === "EPERM"; } }
      if (alive || (!pid && Date.now() - statMtime(dir) < 60e3)) return null;
      rmSync(dir, { recursive: true, force: true });
    }
  }
  return null;
}
const statMtime = (p) => { try { return statSync(p).mtimeMs; } catch { return 0; } };

// Account-level identity lock. Identities of one account are session state: the decision on HM-7 is that recordings of
// the same identity may run together and different identities queue. $RESTORE_STATE/locks/account-<site>.json holds
// {identity, pids}; it is changed only under the mkdir mutex account-<site>.mutex. Dead pids are dropped on every pass.
// → release function, or null when another identity still holds the account after waitMs.
export async function lockIdentity(state, site, identity, { waitMs = 30 * 60e3, pollMs = 2000 } = {}) {
  const dir = path.join(state, "locks"); mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `account-${site}.json`), mutex = path.join(dir, `account-${site}.mutex`);
  const alive = (pid) => { try { process.kill(pid, 0); return true; } catch (e) { return e.code === "EPERM"; } };
  const locked = async (fn) => {
    for (let i = 0; ; i++) {
      try { mkdirSync(mutex); break; } catch (e) {
        if (e.code !== "EEXIST") throw e;
        const m = statMtime(mutex); // 0: just released, retry
        if (m && Date.now() - m > 30e3) rmSync(mutex, { recursive: true, force: true }); // owner died inside the critical section
        await new Promise((r) => setTimeout(r, 50 + Math.random() * 100));
      }
    }
    try { return fn(); } finally { rmSync(mutex, { recursive: true, force: true }); }
  };
  const read = () => { try { const j = JSON.parse(readFileSync(file, "utf8")); return { identity: j.identity, pids: j.pids.filter(alive) }; } catch { return { identity: null, pids: [] }; } };
  const write = (j) => { const tmp = `${file}.${process.pid}.tmp`; writeFileSync(tmp, JSON.stringify(j)); renameSync(tmp, file); };
  const t0 = Date.now();
  for (;;) {
    const got = await locked(() => {
      const cur = read();
      if (cur.pids.length && cur.identity !== identity) return false;
      write({ identity, pids: [...cur.pids, process.pid] });
      return true;
    });
    if (got) return () => locked(() => { const cur = read(); const pids = cur.pids.filter((p) => p !== process.pid); write({ identity: pids.length ? cur.identity : null, pids }); });
    if (Date.now() - t0 >= waitMs) return null;
    await new Promise((r) => setTimeout(r, pollMs));
  }
}

const git = (args, opts = {}) => execFileSync("git", args, { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"], ...opts }).toString().trim();

// Commits one file onto origin/integration without touching the working tree or the checked-out branch (private
// index, commit-tree, push); retries on a concurrent push. → {committed: sha} | {committed: "unchanged"}
export function commitToIntegration(relPath, message, { remote = "origin", branch = "integration", tries = 5 } = {}) {
  const blob = git(["hash-object", "-w", path.join(ROOT, relPath)]);
  for (let i = 0; i < tries; i++) {
    const ref = `refs/record-page/${randomUUID()}`; // private ref instead of FETCH_HEAD, which concurrent runs would share
    git(["fetch", "--quiet", "--no-write-fetch-head", remote, `+refs/heads/${branch}:${ref}`]);
    const base = git(["rev-parse", ref]);
    git(["update-ref", "-d", ref]);
    let current = null; try { current = git(["rev-parse", `${base}:${relPath}`]); } catch {}
    if (current === blob) return { committed: "unchanged" };
    const index = path.join(os.tmpdir(), `record-index-${randomUUID()}`);
    try {
      const env = { ...process.env, GIT_INDEX_FILE: index };
      git(["read-tree", base], { env });
      git(["update-index", "--add", "--cacheinfo", `100644,${blob},${relPath}`], { env });
      const tree = git(["write-tree"], { env });
      const commit = git(["commit-tree", tree, "-p", base, "-m", message]);
      try { git(["push", "--quiet", remote, `${commit}:refs/heads/${branch}`]); return { committed: commit }; } catch {}
    } finally { rmSync(index, { force: true }); }
  }
  throw fail(`could not push ${relPath} to ${remote}/${branch} after ${tries} tries`);
}

// Interaction-script drafts (HM-1130). The recorder writes tests/interact/<id>.json in its task checkout; record-page
// commits it to integration itself, so the checkout never needs it as a change of its own. Left behind (untracked,
// staged or modified), the file keeps the finished task's directory from being cleaned up. At the end of every run that
// held the order lock, parkScript() takes it out of the working tree (back to HEAD's version, index included):
//   - committed (or already on integration): only {blob, committed} goes to $RESTORE_STATE/record/<id>/script.json, the
//     blob stays in the local object store;
//   - otherwise (step failed, blocked, unstable, --no-commit): the content goes to $RESTORE_STATE/record/<id>/draft.json.
// The next run in any checkout puts it back first (restoreScript(): draft.json, else the committed blob), when the
// checkout has no version of its own (file missing or equal to HEAD's). Edit either the restored file or draft.json.
const relScript = (id) => `tests/interact/${id}.json`;
const headBlob = (rel) => { try { return git(["rev-parse", "-q", "--verify", `HEAD:${rel}`]); } catch { return null; } };

export function restoreScript(state, id) {
  const rel = relScript(id), file = path.join(ROOT, rel), dir = path.join(state, "record", id);
  const own = existsSync(file) && git(["hash-object", file]) !== headBlob(rel);
  if (own) return null;
  const draft = path.join(dir, "draft.json");
  let body = existsSync(draft) ? readFileSync(draft) : null, from = "$RESTORE_STATE/record/" + id + "/draft.json";
  if (!body && existsSync(path.join(dir, "script.json"))) {
    const { blob } = JSON.parse(readFileSync(path.join(dir, "script.json"), "utf8"));
    try { body = execFileSync("git", ["cat-file", "blob", blob], { cwd: ROOT, stdio: ["ignore", "pipe", "ignore"] }); from = `committed blob ${blob.slice(0, 12)}`; } catch {}
  }
  if (!body) return null;
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, body);
  return `${rel} restored from ${from}`;
}

export function parkScript(state, id, { committed = null } = {}) {
  const rel = relScript(id), file = path.join(ROOT, rel), dir = path.join(state, "record", id);
  if (!existsSync(file)) return null;
  const blob = git(["hash-object", "-w", file]), head = headBlob(rel);
  const staged = (() => { try { git(["diff", "--cached", "--quiet", "--", rel]); return false; } catch { return true; } })();
  if (blob === head && !staged) return null;
  mkdirSync(dir, { recursive: true });
  let where;
  if (committed && committed !== "skipped") {
    writeFileSync(path.join(dir, "script.json"), JSON.stringify({ blob, committed, at: new Date().toISOString() }, null, 1));
    rmSync(path.join(dir, "draft.json"), { force: true });
    where = "$RESTORE_STATE/record/" + id + "/script.json (committed to integration)";
  } else {
    writeFileSync(path.join(dir, "draft.json"), readFileSync(file));
    where = "$RESTORE_STATE/record/" + id + "/draft.json";
  }
  if (head) git(["checkout", "HEAD", "--", rel]);
  else { git(["rm", "--cached", "-q", "--ignore-unmatch", "--", rel]); rmSync(file, { force: true }); }
  return { draft: where, note: `${rel} moved to ${where}; the next record-page run puts it back` };
}
