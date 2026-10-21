// What a public-library change may touch (HM-990, decision 1 of HM-858). One function for both sides: gate.mjs
// --mode upgrade judges an upgrade branch with it before anything is built, and the scheduler's merge
// (pipeline.mjs ownerViolations) refuses a merge with it — so the gate and the scheduler never disagree about an upgrade.
//   - an upgrade never changes a page: apps/<app>/src/views/** is refused;
//   - a public-library file (src/legacy|shared|api|utils/) that registry/<app>.json gives an owner: an upgrade may change
//     it unless that owner has an active task (ownerBusy); an entry/shared order only when it owns the file;
//   - everything else is allowed: public/**, package.json, lock files, library files nobody owns.
// ownerBusy(owner) → bool comes from the live schedule (the scheduler's ledger and issues). The gate has no view of it and
// passes null: that part is decided at merge time, the rest is the same.
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export const PAGE_FILE = /^apps\/[^/]+\/src\/views\//;
const LIB_FILE = /^apps\/([^/]+)\/src\/(legacy|shared|api|utils)\//;

export function scopeViolations(files, { kind, wos = [], ownerOf, ownerBusy = null }) {
  const bad = [];
  for (const f of files) {
    if (kind === "upgrade" && PAGE_FILE.test(f)) { bad.push(`${f}: page file (views/), an upgrade never changes a page`); continue; }
    if (!LIB_FILE.test(f)) continue;
    const owner = ownerOf(f);
    if (!owner) continue;
    if (kind === "upgrade") { if (ownerBusy && ownerBusy(owner) && !wos.includes(owner)) bad.push(`${f}: owner ${owner} has an active task`); }
    else if (!wos.includes(owner)) bad.push(`${f}: owned by ${owner}`);
  }
  return bad;
}

// apps/<app>/src/<p> → the order registry/<app>.json names as owner of "@/<p>" (shared, entry or api section), or null.
// Registries are read once per returned function.
export function registryOwnerOf(toolRoot) {
  const regs = new Map();
  const reg = (app) => {
    if (!regs.has(app)) { const f = path.join(toolRoot, "registry", `${app}.json`); regs.set(app, existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : null); }
    return regs.get(app);
  };
  return (f) => {
    const m = f.match(/^apps\/([^/]+)\/src\/(.+)$/);
    const r = m && reg(m[1]);
    if (!r) return null;
    for (const sec of ["shared", "entry", "api"]) for (const v of Object.values(r[sec] || {})) if (v.path === `@/${m[2]}` && v.owner) return v.owner;
    return null;
  };
}
