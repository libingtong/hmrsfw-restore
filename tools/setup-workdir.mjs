// Makes the dependencies of this checkout and of the hmrsfw-vue checkout ready (docs/pipeline.md §12). Every agent runs
// it right after checking out both repos. The hmrsfw-vue checkout comes from --app <dir> or HMRSFW_APP_DIR (tools/app-dir.mjs).
// Shared cache (tools/lib/shared-deps.mjs, HM-1130): RESTORE_DEPS_CACHE, else ~/Projects/hmrsfw-restore-deps when it exists.
// With a cache:
//   - each package dir's node_modules becomes a symlink into the cache. A cache entry is keyed by the dir, platform/arch,
//     Node major and the SHA-256 of its package-lock.json. A missing entry is installed with `npm ci` into a private temp
//     dir and published by an atomic rename, so a half-installed tree is never linked. A mkdir lock in <cache>/.locks/
//     makes concurrent agents wait for one install instead of each running their own. The cache must be local to the
//     machine (stale locks are detected by the owner's pid).
//   - this checkout's legacy-dist/ (58 MB, tracked) is taken out of the working tree by a per-worktree sparse checkout
//     and replaced by a symlink to a read-only copy of HEAD:legacy-dist in the cache (one per git tree). A task directory
//     then holds a few MB of its own files.
// Without a cache (or with --no-cache): plain `npm ci` in place, skipped when node_modules already matches the lock file;
// a legacy-dist link from an earlier run is turned back into real files.
// hmrsfw-vue ignores `node_modules/` (directories only), which does not cover the cache symlink, so the link is also added
// to that checkout's .git/info/exclude; nothing tracked in hmrsfw-vue is changed.
// Usage: node tools/setup-workdir.mjs --app <hmrsfw-vue checkout> [--force] [--no-cache]
//        (--force replaces a real node_modules dir, or a legacy-dist with local changes, by the cache link)
// Output: one JSON line {ok, mode, cache?, app, legacyDist:{action, entry?}, targets:[{dir, action, entry?}], warnings:[]};
// exit 1 on failure.
import { createHash, randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, lstatSync, mkdirSync, readFileSync, readlinkSync, renameSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { appDir } from "./app-dir.mjs";
import { gitExclude } from "./lib/git-exclude.mjs";
import { depsCacheDir, linkLegacyDist, removeCrashedTemps, unlinkLegacyDist, withLock } from "./lib/shared-deps.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TARGETS = [".", "tools/vuefp", "tools/vuefp33"]; // dirs of this repo with package.json + package-lock.json
const APP_LABEL = "hmrsfw-vue"; // cache label of the hmrsfw-vue checkout, keyed by its own package-lock.json
const STAMP = ".setup-workdir-lock-sha256";
const force = process.argv.includes("--force");
const cache = process.argv.includes("--no-cache") ? null : depsCacheDir();
const warnings = [];
const sha = (file) => createHash("sha256").update(readFileSync(file)).digest("hex");
const lstat = (p) => { try { return lstatSync(p); } catch { return null; } };
const npmCi = (cwd) => execFileSync("npm", ["ci", "--no-audit", "--no-fund", "--loglevel=error"], { cwd, stdio: ["ignore", "ignore", "inherit"] });
const isReady = (entry) => existsSync(path.join(entry, ".ready")) && existsSync(path.join(entry, "node_modules"));

// Returns the cache entry dir holding node_modules for one package dir, installing it first if needed.
function ensureEntry(label, abs, lockHash) {
  const name = `${label}-${process.platform}-${process.arch}-node${process.versions.node.split(".")[0]}-${lockHash.slice(0, 16)}`;
  const entry = path.join(cache, name);
  if (isReady(entry)) return { entry, installed: false };
  return withLock(cache, name, () => {
    if (isReady(entry)) return { entry, installed: false }; // published by another agent while we waited
    if (existsSync(entry)) throw new Error(`cache entry ${entry} exists but is incomplete; delete it and rerun`);
    removeCrashedTemps(cache, name);
    const tmp = `${entry}.tmp-${process.pid}-${randomUUID()}`;
    try {
      mkdirSync(tmp, { recursive: true });
      for (const f of ["package.json", "package-lock.json"]) writeFileSync(path.join(tmp, f), readFileSync(path.join(abs, f)));
      npmCi(tmp);
      writeFileSync(path.join(tmp, ".ready"), JSON.stringify({ lockSha256: lockHash, node: process.version, at: new Date().toISOString() }));
      try { renameSync(tmp, entry); } catch (e) { if (isReady(entry)) return { entry, installed: false }; throw e; } // fails if entry exists
      return { entry, installed: true };
    } finally { rmSync(tmp, { recursive: true, force: true }); }
  });
}

// Points <from> at <to> (an absolute link into the cache). Replaces an existing symlink; a real dir is kept unless --force.
function link(from, to) {
  const st = lstat(from);
  if (st?.isSymbolicLink()) { if (readlinkSync(from) === to) return "linked"; rmSync(from); }
  else if (st) {
    if (!force) { warnings.push(`${from} is a real directory, left as is (use --force to replace it with the cache link)`); return "kept-local"; }
    rmSync(from, { recursive: true, force: true });
  }
  symlinkSync(to, from, "dir");
  return "linked";
}

function setupTarget(dir, abs, label) {
  const lockFile = path.join(abs, "package-lock.json");
  if (!existsSync(lockFile)) throw new Error(`${lockFile} missing`);
  const lockHash = sha(lockFile), nm = path.join(abs, "node_modules");
  if (cache) {
    const { entry, installed } = ensureEntry(label, abs, lockHash);
    const action = link(nm, path.join(entry, "node_modules"));
    return { dir, action: installed && action === "linked" ? "installed+linked" : action, entry };
  }
  const st = lstat(nm), stamp = path.join(nm, STAMP);
  if (st && !st.isSymbolicLink() && existsSync(stamp) && readFileSync(stamp, "utf8") === lockHash) return { dir, action: "up-to-date" };
  if (st?.isSymbolicLink()) rmSync(nm); // a cache link from an earlier run with RESTORE_DEPS_CACHE; npm ci would write through it
  npmCi(abs);
  writeFileSync(stamp, lockHash);
  return { dir, action: "installed-local" };
}

const out = { ok: false, mode: cache ? "cache" : "local", ...(cache && { cache }), app: null, legacyDist: null, targets: [], warnings };
try {
  const app = (out.app = appDir());
  out.legacyDist = cache ? linkLegacyDist(ROOT, cache, { force, warnings }) : { action: unlinkLegacyDist(ROOT) ? "unlinked" : "local" };
  for (const dir of TARGETS) out.targets.push(setupTarget(dir, path.join(ROOT, dir), dir === "." ? "root" : dir.replace(/[\\/]/g, "-")));
  out.targets.push(setupTarget(app, app, APP_LABEL));
  gitExclude(app, "node_modules", "tools/setup-workdir.mjs: node_modules may be a symlink into RESTORE_DEPS_CACHE");
  try { // gate/record need a Playwright Chromium; a missing browser is reported, not installed
    const { chromium } = createRequire(path.join(ROOT, "package.json"))("playwright");
    if (!existsSync(chromium.executablePath())) warnings.push("Playwright Chromium not installed: run `npx playwright install chromium`");
  } catch (e) { warnings.push(`playwright check failed: ${e.message}`); }
  for (const nested of ["hmrsfw-restore", "hmrsfw-vue"]) // `multica repo checkout` run inside a checkout: a full second copy
    if (existsSync(path.join(ROOT, nested, ".git"))) warnings.push(`${path.join(ROOT, nested)} is a nested checkout (run \`multica repo checkout\` from the task workdir, not inside this repo); it is not used, delete it`);
  out.ok = true;
} catch (e) {
  out.error = e.message;
  process.exitCode = 1;
}
console.log(JSON.stringify(out));
