// Shared plumbing for the gate (gate.mjs) and the original-side baseline (baseline.mjs): locations, work orders,
// HAR / login-state / interaction-script lookup (docs/pipeline.md §7, §12).
// Nothing here writes outside $RESTORE_STATE; HAR files, login state and legacy-dist are only read.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

// site = the original site (legacy-dist/<site>), app = the hmrsfw-vue application (apps/<app>).
// origSel / restSel: where the page component's root element sits in the original and in the restored app (the
// restored apps have no shell yet: App.vue renders <main id="poc-main"><router-view/></main>).
export const SITES = {
  portal: { app: "portal", host: "https://hamiwebportaltest.rencaidanao.com", origSel: "main > *" },
  usercenter: { app: "uc", host: "https://hamiusercentertest.rencaidanao.com", origSel: "main.ant-layout-content .overscoll > div > *" },
};
export const REST_SEL = "#poc-main > *";
export const siteOfApp = (app) => Object.keys(SITES).find((s) => SITES[s].app === app);

// Pages that only exist as a component of another page (`recordVia`, docs/work-orders.md) are recorded on the parent's
// route: the original side replays the whole parent page, where `origSel` matches the layout and the parent's root, not
// the component. Both sides therefore mount the parent page (the restored side its restored file, so the component gets
// the props the parent passes) and take the component's own root(s): the outermost elements carrying its scope id
// (every element of a scoped component's template has it, the root also carries the parent's). (HM-251)
export const scopeRootSel = (scopeId) => `[${scopeId}]:not([${scopeId}] *)`;
// The page component's scope id in the original chunk: the only component, or the one named after the target file.
export function pageScopeId(wo) {
  const comps = wo.components ?? [];
  const base = path.basename(wo.target ?? "", ".vue");
  return (comps.length === 1 ? comps[0] : comps.find((c) => c.name === base))?.scopeId ?? null;
}
export function origSelOf(wo) {
  if (!wo.recordVia) return SITES[wo.site].origSel;
  const sid = pageScopeId(wo);
  if (!sid) throw new Error(`work order ${wo.id} is recorded via ${wo.recordVia} but its component has no scope id: its root cannot be told apart inside the parent page`);
  return scopeRootSel(sid);
}

export function flag(argv, name) { return argv.includes(name); }
export function opt(argv, name, dflt) {
  const i = argv.findIndex((a) => a === name || a.startsWith(name + "="));
  if (i < 0) return dflt;
  if (argv[i].includes("=")) return argv[i].slice(name.length + 1);
  const v = argv[i + 1];
  if (v === undefined || v.startsWith("--")) throw new Error(`${name} needs a value`);
  return v;
}
// Positional arguments: everything that is neither a flag nor the value of a flag listed in `valued`.
export function positionals(argv, valued) {
  const out = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) { if (valued.includes(a)) i++; continue; }
    out.push(a);
  }
  return out;
}

export function stateDir(env = process.env) {
  if (!env.RESTORE_STATE) throw new Error("RESTORE_STATE is not set (gate and baseline outputs live there)");
  return path.resolve(env.RESTORE_STATE);
}
export function assetsDir(env = process.env) {
  if (!env.RESTORE_ASSETS) throw new Error("RESTORE_ASSETS is not set (HAR files and login state live there)");
  return path.resolve(env.RESTORE_ASSETS);
}

// Work order: queue/<id>.json (written by the work-order tool), falling back to the POC pages already in hmrsfw-vue:
// the 20 confirmation orders (tools/confirm-orders.json) and the first 10 POC pages (tools/poc-orders.json).
// Normalised to the fields the gate needs.
export function loadWorkOrder(id) {
  const q = path.join(ROOT, "queue", `${id}.json`);
  let raw, queueId = id;
  if (existsSync(q)) raw = JSON.parse(readFileSync(q, "utf8"));
  else {
    for (const f of ["tools/confirm-orders.json", "tools/poc-orders.json"]) { raw ??= JSON.parse(readFileSync(path.join(ROOT, f), "utf8")).find((o) => o.id === id); }
    // A POC page is a regression order in queue/ (same source chunk): self-check only knows the queue id.
    queueId = raw ? queueIdOfChunk(raw.sourceChunk) : null;
  }
  if (!raw) throw new Error(`work order ${id} not found (queue/${id}.json, tools/confirm-orders.json, tools/poc-orders.json)`);
  const site = raw.site ?? siteOfApp(raw.app);
  if (!SITES[site]) throw new Error(`work order ${id}: unknown site ${raw.site}`);
  const app = SITES[site].app;
  const recordPath = raw.recordPath ?? raw.route;
  return {
    ...raw, id, queueId, site, app, recordPath,
    route: raw.route ?? new URL(recordPath, "http://x").pathname,
    role: raw.role ?? site,
    type: raw.type ?? "page",
    target: raw.target ? appRelative(raw.target, app) : null,
    subComponentDir: raw.subComponentDir ? appRelative(raw.subComponentDir, app) : null,
    deps: raw.deps ?? [],
  };
}
let chunkIndex = null;
function queueIdOfChunk(chunk) {
  if (!chunkIndex) {
    chunkIndex = new Map();
    const dir = path.join(ROOT, "queue");
    for (const n of existsSync(dir) ? readdirSync(dir) : []) {
      if (!n.endsWith(".json") || ["index.json", "routes.json", "summary.json"].includes(n)) continue;
      const o = JSON.parse(readFileSync(path.join(dir, n), "utf8"));
      if (o.type === "page" && o.sourceChunk) chunkIndex.set(o.sourceChunk, o.id);
    }
  }
  return chunkIndex.get(chunk) ?? null;
}

// Work-order paths come as "portal/src/views/x.vue" (POC), "apps/portal/src/…" or "@/views/x.vue"; → "apps/<app>/src/…".
export function appRelative(p, app) {
  let s = p.replace(/^restore\//, "").replace(/^\.\//, "");
  if (s.startsWith("@/")) return `apps/${app}/src/${s.slice(2)}`;
  if (s.startsWith("@views/")) return `apps/${app}/src/views/${s.slice(7)}`;
  if (s.startsWith("apps/")) return s;
  return `apps/${s}`;
}

// HAR for a work order: explicit path > the order's `har` (relative to $RESTORE_ASSETS) > har/pages/<id>.har >
// har/confirm-replay/<id>.har (POC).
export function findHar(id, assets, explicit, wo) {
  if (explicit) { if (!existsSync(explicit)) throw new Error(`HAR not found: ${explicit}`); return path.resolve(explicit); }
  if (wo?.har) { const p = path.join(assets, wo.har); return existsSync(p) ? p : null; }
  for (const p of [path.join(assets, "har/pages", `${id}.har`), path.join(assets, "har/confirm-replay", `${id}.har`)]) if (existsSync(p)) return p;
  return null;
}

// Recorded login state of a work order, kept in memory: { localStorage, sessionStorage }. Default file: the site's,
// $RESTORE_ASSETS/.auth/pw-<site>.json (Playwright storageState, saved by pw-login.mjs); the order's `role` (general /
// jobseeker / corp / mentor / null) does not pick the file. Only the POC confirmation orders keep their per-identity
// file, pw-<site>-<identity>.json (role "usercenter-jobseeker" …, README). A work order may name another file (`auth`,
// relative to $RESTORE_ASSETS) in either that format or the POC's {localStorage, sessionStorage}.
// With the page's HAR (loadHar): record-page.mjs keeps the localStorage as it was after the identity switch (radiotype,
// routermenu, …; no token) in log._record; it goes over the login state, so the page replays under the identity it
// was recorded with, whatever identity the shared login state was last saved under.
export function authStorage(wo, assets, har) {
  const st = loginStorage(wo, assets);
  Object.assign(st.localStorage, har?.record?.localStorage ?? {});
  return st;
}
function loginStateFile(wo) {
  if (wo.auth) return wo.auth;
  const legacy = typeof wo.role === "string" && wo.role.startsWith(`${wo.site}-`);
  return path.join(".auth", `pw-${legacy ? wo.role : wo.site}.json`);
}
function loginStorage(wo, assets) {
  const f = path.join(assets, loginStateFile(wo));
  if (!existsSync(f)) throw new Error(`login state for ${wo.id} (${loginStateFile(wo)}) not found under $RESTORE_ASSETS`);
  const st = JSON.parse(readFileSync(f, "utf8"));
  if (st.origins) return { localStorage: Object.fromEntries((st.origins.find((x) => x.origin === SITES[wo.site].host)?.localStorage ?? []).map((x) => [x.name, x.value])), sessionStorage: {} };
  return { localStorage: { ...(st.localStorage ?? {}) }, sessionStorage: { ...(st.sessionStorage ?? {}) } };
}

// Interaction script: tests/interact/<id>.json (recorder) > the POC confirmation scripts. null = page has none.
export async function interactScript(id) {
  const f = path.join(ROOT, "tests/interact", `${id}.json`);
  if (existsSync(f)) return JSON.parse(readFileSync(f, "utf8"));
  const { SCRIPTS } = await import("../interact-scripts.mjs");
  return SCRIPTS[id] ?? null;
}

// Keys the restored app needs to read encrypted responses and encrypt request bodies (crypto-adapter.ts). Vite takes
// them from the process environment or from .env.local / .env in the app root; a --branch worktree and a fresh clone
// have no .env.local, so the gate agent must carry them in its environment. Missing keys are the gate's own problem:
// every page with an encrypted response would fail as if the restoration were wrong. Returns the missing names only.
export const CRYPTO_ENV = ["VITE_HMRSFW_SM2_PUBLIC_KEY", "VITE_HMRSFW_SM4_KEY"];
export function missingCryptoEnv(appDir, env = process.env) {
  const files = {};
  for (const f of [".env.local", ".env"]) {
    const p = path.join(appDir, f);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split("\n")) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
      if (m && m[2].replace(/^["']|["']$/g, "")) files[m[1]] ??= true;
    }
  }
  return CRYPTO_ENV.filter((k) => !env[k]?.trim() && !files[k]);
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
