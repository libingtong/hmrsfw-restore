// Makes the dependencies of this checkout and of the hmrsfw-vue checkout ready (docs/pipeline.md §12). Every agent runs
// it right after checking out both repos. The hmrsfw-vue checkout comes from --app <dir> or HMRSFW_APP_DIR (tools/app-dir.mjs).
// With RESTORE_DEPS_CACHE set: each package dir's node_modules becomes a symlink into the cache. A cache entry is keyed by
// the dir, platform/arch, Node major and the SHA-256 of its package-lock.json. A missing entry is installed with `npm ci`
// into a private temp dir and published by an atomic rename, so a half-installed tree is never linked. A mkdir lock in
// <cache>/.locks/ makes concurrent agents wait for one install instead of each running their own. The cache must be
// local to the machine (stale locks are detected by the owner's pid).
// Without RESTORE_DEPS_CACHE: plain `npm ci` in place, skipped when node_modules already matches the lock file.
// hmrsfw-vue ignores `node_modules/` (directories only), which does not cover the cache symlink, so the link is also added
// to that checkout's .git/info/exclude; nothing tracked in hmrsfw-vue is changed.
// Usage: node tools/setup-workdir.mjs --app <hmrsfw-vue checkout> [--force]   (--force replaces a real node_modules dir by the cache link)
// Output: one JSON line {ok, mode, cache?, app, targets:[{dir, action, entry?}], warnings:[]}; exit 1 on failure.
import { createHash, randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, readlinkSync, renameSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { appDir } from "./app-dir.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TARGETS = [".", "tools/vuefp", "tools/vuefp33"]; // dirs of this repo with package.json + package-lock.json
const APP_LABEL = "hmrsfw-vue"; // cache label of the hmrsfw-vue checkout, keyed by its own package-lock.json
const STAMP = ".setup-workdir-lock-sha256";
const LOCK_WAIT_MS = 30 * 60e3, ORPHAN_LOCK_MS = 60e3, POLL_MS = 2e3;
const force = process.argv.includes("--force");
const cache = process.env.RESTORE_DEPS_CACHE ? path.resolve(process.env.RESTORE_DEPS_CACHE) : null;
const warnings = [];
const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
const sha = (file) => createHash("sha256").update(readFileSync(file)).digest("hex");
const lstat = (p) => { try { return lstatSync(p); } catch { return null; } };
const readJson = (p) => { try { return JSON.parse(readFileSync(p, "utf8")); } catch { return null; } };
const npmCi = (cwd) => execFileSync("npm", ["ci", "--no-audit", "--no-fund", "--loglevel=error"], { cwd, stdio: ["ignore", "ignore", "inherit"] });
const isReady = (entry) => existsSync(path.join(entry, ".ready")) && existsSync(path.join(entry, "node_modules"));

function pidAlive(pid) { try { process.kill(pid, 0); return true; } catch (e) { return e.code === "EPERM"; } }

// mkdir is atomic: whoever creates the lock dir owns the install. A lock whose owner process is gone (or that never got
// its owner.json) is moved aside with an atomic rename and retried. The lock only saves duplicate work; correctness
// comes from the atomic publish in ensureEntry, so a rare double holder costs one extra install, not a broken entry.
function withLock(name, fn) {
  const dir = path.join(cache, ".locks", name), token = randomUUID();
  mkdirSync(path.dirname(dir), { recursive: true });
  const deadline = Date.now() + LOCK_WAIT_MS;
  for (;;) {
    try { mkdirSync(dir); break; } catch (e) { if (e.code !== "EEXIST") throw e; }
    const owner = readJson(path.join(dir, "owner.json"));
    const age = Date.now() - (lstat(dir)?.mtimeMs ?? Date.now());
    if (owner ? !pidAlive(owner.pid) : age > ORPHAN_LOCK_MS) {
      const trash = `${dir}.stale-${process.pid}-${token}`;
      try { renameSync(dir, trash); rmSync(trash, { recursive: true, force: true }); } catch {}
      continue;
    }
    if (Date.now() > deadline) throw new Error(`timed out waiting for lock ${dir} (owner pid ${owner?.pid})`);
    sleep(POLL_MS);
  }
  writeFileSync(path.join(dir, "owner.json"), JSON.stringify({ pid: process.pid, token, at: new Date().toISOString() }));
  try { return fn(); } finally { if (readJson(path.join(dir, "owner.json"))?.token === token) rmSync(dir, { recursive: true, force: true }); }
}

// Returns the cache entry dir holding node_modules for one package dir, installing it first if needed.
function ensureEntry(label, abs, lockHash) {
  const name = `${label}-${process.platform}-${process.arch}-node${process.versions.node.split(".")[0]}-${lockHash.slice(0, 16)}`;
  const entry = path.join(cache, name);
  if (isReady(entry)) return { entry, installed: false };
  return withLock(name, () => {
    if (isReady(entry)) return { entry, installed: false }; // published by another agent while we waited
    if (existsSync(entry)) throw new Error(`cache entry ${entry} exists but is incomplete; delete it and rerun`);
    for (const n of readdirSync(cache)) { // temp dirs left by crashed installs
      const m = n.startsWith(name + ".tmp-") && n.slice(name.length + 5).match(/^(\d+)-/);
      if (m && !pidAlive(Number(m[1]))) rmSync(path.join(cache, n), { recursive: true, force: true });
    }
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

// Makes sure git in <repo> ignores <name> (no-op outside a git checkout or when a tracked rule already covers it).
function gitExclude(repo, name) {
  const git = (...a) => execFileSync("git", ["-C", repo, ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  try { git("rev-parse", "--git-dir"); } catch { return; }
  try { git("check-ignore", "-q", "--", name); return; } catch {} // exit 1: not ignored
  const file = path.resolve(repo, git("rev-parse", "--git-path", "info/exclude").trim());
  mkdirSync(path.dirname(file), { recursive: true });
  const cur = existsSync(file) ? readFileSync(file, "utf8") : "";
  writeFileSync(file, `${cur}${cur && !cur.endsWith("\n") ? "\n" : ""}# tools/setup-workdir.mjs: node_modules may be a symlink into RESTORE_DEPS_CACHE\n/${name}\n`);
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

const out = { ok: false, mode: cache ? "cache" : "local", ...(cache && { cache }), app: null, targets: [], warnings };
try {
  const app = (out.app = appDir());
  for (const dir of TARGETS) out.targets.push(setupTarget(dir, path.join(ROOT, dir), dir === "." ? "root" : dir.replace(/[\\/]/g, "-")));
  out.targets.push(setupTarget(app, app, APP_LABEL));
  gitExclude(app, "node_modules");
  try { // gate/record need a Playwright Chromium; a missing browser is reported, not installed
    const { chromium } = createRequire(path.join(ROOT, "package.json"))("playwright");
    if (!existsSync(chromium.executablePath())) warnings.push("Playwright Chromium not installed: run `npx playwright install chromium`");
  } catch (e) { warnings.push(`playwright check failed: ${e.message}`); }
  out.ok = true;
} catch (e) {
  out.error = e.message;
  process.exitCode = 1;
}
console.log(JSON.stringify(out));
