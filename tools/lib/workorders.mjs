// Read-only access to work orders (queue/<id>.json, written by work-orders.mjs) and the public-library registry
// (registry/<app>.json), plus the features route.mjs needs. Field names follow docs/pipeline.md §12 and batch-plan.md
// §3.3; anything optional is read defensively because the generator (sub-task C) is developed in parallel.
import { readdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// HMRSFW_TOOL_ROOT points the scripts at another tool-repo checkout (tests use a fixture repo).
export const TOOL_ROOT = path.resolve(process.env.HMRSFW_TOOL_ROOT || path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".."));

export const woFile = (id, root = TOOL_ROOT) => path.join(root, "queue", `${encodeURIComponent(id)}.json`);

export function loadWorkOrders(root = TOOL_ROOT) {
  const dir = path.join(root, "queue");
  if (!existsSync(dir)) return [];
  const out = [];
  for (const f of readdirSync(dir).filter((n) => n.endsWith(".json")).sort()) {
    try { const wo = JSON.parse(readFileSync(path.join(dir, f), "utf8")); if (wo && wo.id) out.push(wo); } catch { /* malformed order: reported by work-orders.mjs, not here */ }
  }
  return out;
}

export function loadWorkOrder(id, root = TOOL_ROOT) {
  for (const f of [woFile(id, root), path.join(root, "queue", `${id}.json`)]) if (existsSync(f)) return JSON.parse(readFileSync(f, "utf8"));
  return loadWorkOrders(root).find((w) => w.id === id) || null;
}

export const isCore = (wo) => wo && (wo.type === "entry" || wo.type === "shared");
export const isPage = (wo) => wo && !isCore(wo);
// Recordable: a page there is something to open in the browser for. Entry/shared orders and npm replacements (`status: "npm"`,
// no recordPath) never get a record task — record-page.mjs stops on them with "recordPath missing" (HM-1102/1103, HM-1124).
export const isRecordable = (wo) => isPage(wo) && wo.status !== "npm";
// Pages already accepted in hmrsfw-vue are regression-only (§1 范围). C writes `status: "regression"` and an `accepted`
// object ({route, in}); a bare `accepted: true` is accepted too.
export const isAccepted = (wo) => !!wo.accepted || wo.status === "accepted" || wo.status === "regression" || wo.regressionOnly === true;
// An order whose chunk imports something the registry has no entry for (`missing`, written by work-orders.mjs) is not dispatched:
// playbook 3.5, the restorer would have to invent a path. It goes back to the arbiter as a registry gap.
export const isDispatchable = (wo) => !wo.missing?.length;
export const appOf = (wo) => wo.app || (wo.site === "usercenter" || wo.site === "uc" ? "uc" : wo.site || "portal");

// Validation rules in the original chunk: explicit field from the generator, else count `trigger:` entries of
// ant-design-vue rule objects in the source chunk (a rule object almost always carries one).
export function ruleCount(wo, root = TOOL_ROOT) {
  const explicit = wo.rules ?? wo.features?.rules ?? wo.validationRules;
  if (typeof explicit === "number") return explicit;
  if (!wo.sourceChunk) return 0;
  const p = path.join(root, wo.sourceChunk);
  if (!existsSync(p)) return 0;
  return (readFileSync(p, "utf8").match(/\btrigger\s*:\s*["'`\[]/g) || []).length;
}

export function features(wo, cfg, root = TOOL_ROOT) {
  const kb = Number(wo.kb ?? 0);
  const rules = ruleCount(wo, root);
  const tier = kb < 5 ? "simple" : kb < 30 ? "medium" : "large";
  return { type: wo.type || "page", kb, rules, components: (wo.components || []).length, tier, complex: kb >= cfg.complex.kb || rules >= cfg.complex.rules, app: appOf(wo) };
}

// Product-repo paths a work order owns (its page dir), used for partial merges of packed orders.
export function ownedPaths(wo) {
  const strip = (p) => p && p.replace(/^restore\//, "").replace(/\/+$/, "");
  return [strip(wo.target), strip(wo.subComponentDir)].filter(Boolean);
}

export function loadRegistry(app, root = TOOL_ROOT) {
  const f = path.join(root, "registry", `${app}.json`);
  return existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : null;
}

// registry path "@/shared/X.vue" → product-repo path "apps/<app>/src/shared/X.vue"
export const registryToRepoPath = (app, p) => p.startsWith("@/") ? `apps/${app}/src/${p.slice(2)}` : p;

// Reverse index of deps: public-library file (repo path) → work orders that depend on it.
export function reverseDeps(orders, root = TOOL_ROOT) {
  const regs = {};
  const idx = new Map();
  for (const wo of orders) {
    const app = appOf(wo);
    regs[app] ??= loadRegistry(app, root);
    for (const d of depList(wo.deps)) {
      const files = depFiles(d, app, regs[app]);
      for (const f of files) { if (!idx.has(f)) idx.set(f, new Set()); idx.get(f).add(wo.id); }
    }
  }
  return idx;
}

// deps is an array, or C's object {entry:[export], shared:[key], api:["file.js#export"], modules, views, orders}; `orders`
// are work-order ids (dispatch order), not files.
export function depList(deps) {
  if (Array.isArray(deps)) return deps;
  if (!deps || typeof deps !== "object") return [];
  return Object.entries(deps).filter(([k, v]) => k !== "orders" && Array.isArray(v)).flatMap(([, v]) => v);
}

// A dep is either a registry path ("@/shared/X.vue"), a repo path, a registry key (chunk name / export name), or the
// original symbol a registry entry records ("index.api.x.js#P").
export function depFiles(dep, app, reg) {
  const d = typeof dep === "string" ? dep : dep.path || dep.key || "";
  if (!d) return [];
  if (d.startsWith("@/")) return [registryToRepoPath(app, d)];
  if (d.startsWith("apps/")) return [d];
  if (reg) {
    for (const sec of ["shared", "entry", "api"]) if (reg[sec]?.[d]?.path) return [registryToRepoPath(app, reg[sec][d].path)];
    for (const sec of ["shared", "entry", "api"]) for (const v of Object.values(reg[sec] || {})) if (v?.original === d && v.path) return [registryToRepoPath(app, v.path)];
  }
  return [];
}

// Registry owner of a repo path (public-library file lock).
export function ownerOf(repoPath, root = TOOL_ROOT) {
  const m = repoPath.match(/^apps\/([^/]+)\/src\/(.+)$/);
  if (!m) return null;
  const reg = loadRegistry(m[1], root);
  if (!reg) return null;
  const want = `@/${m[2]}`;
  for (const sec of ["shared", "entry", "api"]) for (const v of Object.values(reg[sec] || {})) if (v.path === want && v.owner) return v.owner;
  return null;
}
