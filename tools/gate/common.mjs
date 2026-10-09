// Shared plumbing for the gate (gate.mjs) and the original-side baseline (baseline.mjs): locations, work orders,
// HAR / login-state / interaction-script lookup (docs/pipeline.md §7, §12).
// Nothing here writes outside $RESTORE_STATE; HAR files, login state and legacy-dist are only read.
import { existsSync, readFileSync } from "node:fs";
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
  let raw;
  if (existsSync(q)) raw = JSON.parse(readFileSync(q, "utf8"));
  else for (const f of ["tools/confirm-orders.json", "tools/poc-orders.json"]) { raw ??= JSON.parse(readFileSync(path.join(ROOT, f), "utf8")).find((o) => o.id === id); }
  if (!raw) throw new Error(`work order ${id} not found (queue/${id}.json, tools/confirm-orders.json, tools/poc-orders.json)`);
  const site = raw.site ?? siteOfApp(raw.app);
  if (!SITES[site]) throw new Error(`work order ${id}: unknown site ${raw.site}`);
  const app = SITES[site].app;
  const recordPath = raw.recordPath ?? raw.route;
  return {
    ...raw, id, site, app, recordPath,
    route: raw.route ?? new URL(recordPath, "http://x").pathname,
    role: raw.role ?? site,
    type: raw.type ?? "page",
    target: raw.target ? appRelative(raw.target, app) : null,
    subComponentDir: raw.subComponentDir ? appRelative(raw.subComponentDir, app) : null,
    deps: raw.deps ?? [],
  };
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

// Recorded login state of a work order, kept in memory: { localStorage, sessionStorage }. Default file:
// $RESTORE_ASSETS/.auth/pw-<role>.json (Playwright storageState); a work order may name another file (`auth`, relative
// to $RESTORE_ASSETS) in either that format or the POC's {localStorage, sessionStorage}.
export function authStorage(wo, assets) {
  const f = path.join(assets, wo.auth ?? path.join(".auth", `pw-${wo.role}.json`));
  if (!existsSync(f)) throw new Error(`login state for ${wo.id} (${wo.auth ?? "role " + wo.role}) not found under $RESTORE_ASSETS`);
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

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
