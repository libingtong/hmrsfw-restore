// Shared pieces of the recording line (record-page.mjs, record-baseline-placeholder.mjs): work-order lookup, the two
// test sites, the human-prepared login states, role pinning, interaction-coverage rule, per-order lock, and committing an
// interaction script to the integration branch. See docs/pipeline.md §6 (录制员), §12 and §14.
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
export const DEFAULT_ROLE = { portal: "portal", usercenter: "usercenter-jobseeker" };
// localStorage keys that identify the account's current role in the user center (same keys as pw-switch-role.mjs). Only
// their hash is kept, never the values.
const ROLE_KEYS = ["radiotype", "Recruiters", "GeneraluserId", "danwei", "idenityType", "roleId"];

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
  return { ...o, id, site, role: o.role ?? DEFAULT_ROLE[site], from };
}

// Login state prepared by a human (pw-login.mjs / pw-switch-role.mjs): $RESTORE_ASSETS/.auth/pw-<role>.json.
export function authState(assets, role, site) {
  const file = path.join(assets, ".auth", `pw-${role}.json`);
  if (!existsSync(file)) return { file, missing: true };
  const st = JSON.parse(readFileSync(file, "utf8"));
  const ls = Object.fromEntries((st.origins?.find((x) => x.origin === ORIGIN[site])?.localStorage ?? []).map((x) => [x.name, x.value]));
  return { file, state: st, localStorage: ls, hasToken: !!ls.token };
}

export const roleFingerprint = (ls) => sha256(JSON.stringify(ROLE_KEYS.map((k) => [k, ls[k] || null])));
// Role keys present (non-empty) in both the saved login state and the live page that differ → names only.
export const roleDrift = (saved, live) => ROLE_KEYS.filter((k) => saved[k] && live[k] && saved[k] !== live[k]);

// Role pinning (全局说明 §6「流程」3): the first successful recording with a role stores the hash of its role keys in
// $RESTORE_STATE/record/roles.json (pinRole); a later login state for the same role must carry the same role keys.
const pinFile = (state) => path.join(state, "record", "roles.json");
const readPins = (state) => (existsSync(pinFile(state)) ? JSON.parse(readFileSync(pinFile(state), "utf8")) : {});
export function checkRolePin(state, role, ls) {
  const pin = readPins(state)[role];
  return { ok: !pin || pin.fingerprint === roleFingerprint(ls), pinned: !!pin };
}
export function pinRole(state, role, ls) {
  const pins = readPins(state);
  if (pins[role]) return false;
  mkdirSync(path.dirname(pinFile(state)), { recursive: true });
  const tmp = `${pinFile(state)}.${process.pid}.tmp`;
  writeFileSync(tmp, JSON.stringify({ ...pins, [role]: { fingerprint: roleFingerprint(ls), pinnedAt: new Date().toISOString() } }, null, 1));
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
