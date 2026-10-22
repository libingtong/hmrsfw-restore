// Machine-wide cache shared by every task checkout on the Mac mini (HM-1130): node_modules per package-lock.json
// (tools/setup-workdir.mjs) and legacy-dist per git tree. A task checkout keeps only symlinks into it, so a new task
// directory costs a few MB instead of 100–700 MB.
// Cache dir: RESTORE_DEPS_CACHE, else ~/Projects/hmrsfw-restore-deps when that dir exists (the Mac mini's cache; agents
// without the variable used to install locally), else none (plain local install, e.g. another machine).
// legacy-dist: the checkout's legacy-dist/ is taken out of the working tree with a per-worktree sparse checkout
// (`/*`, `!/legacy-dist/`) and replaced by a symlink to <cache>/legacy-dist-<tree>/legacy-dist, a read-only copy of
// HEAD:legacy-dist made with `git archive`. sparse.expectFilesOutsideOfPatterns keeps git from treating the symlinked
// files as present (which would show them as deleted); the link itself goes into info/exclude. Checkouts, merges and
// commits work as before: git never writes legacy-dist here. When HEAD's legacy-dist tree changes (checkout of a branch
// with other legacy-dist files), ensureLegacyDist() re-points the link; setup-workdir, gate, record-page and baseline call it.
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { chmodSync, existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, readlinkSync, renameSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { gitExclude } from "./git-exclude.mjs";

export const DEFAULT_DEPS_CACHE = path.join(os.homedir(), "Projects", "hmrsfw-restore-deps");
const LOCK_WAIT_MS = 30 * 60e3, ORPHAN_LOCK_MS = 60e3, POLL_MS = 2e3;
const SPARSE = ["/*", "!/legacy-dist/"];
const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
const lstat = (p) => { try { return lstatSync(p); } catch { return null; } };
const readJson = (p) => { try { return JSON.parse(readFileSync(p, "utf8")); } catch { return null; } };
const git = (root, args, opts = {}) => execFileSync("git", ["-C", root, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 512e6, ...opts }).trim();

export function pidAlive(pid) { try { process.kill(pid, 0); return true; } catch (e) { return e.code === "EPERM"; } }

// null = no shared cache: install / check out locally.
export function depsCacheDir({ env = process.env } = {}) {
  if (env.RESTORE_DEPS_CACHE) return path.resolve(env.RESTORE_DEPS_CACHE);
  return existsSync(DEFAULT_DEPS_CACHE) ? DEFAULT_DEPS_CACHE : null;
}

// mkdir is atomic: whoever creates the lock dir owns the install. A lock whose owner process is gone (or that never got
// its owner.json) is moved aside with an atomic rename and retried. The lock only saves duplicate work; correctness
// comes from the atomic publish of each cache entry, so a rare double holder costs one extra install, not a broken entry.
export function withLock(cache, name, fn) {
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

// Temp dirs <name>.tmp-<pid>-… left by crashed installs of this entry.
export function removeCrashedTemps(cache, name) {
  for (const n of readdirSync(cache)) {
    const m = n.startsWith(name + ".tmp-") && n.slice(name.length + 5).match(/^(\d+)-/);
    if (m && !pidAlive(Number(m[1]))) { chmodTree(path.join(cache, n), true); rmSync(path.join(cache, n), { recursive: true, force: true }); }
  }
}

function chmodTree(dir, writable) {
  if (!existsSync(dir)) return;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (writable) chmodSync(p, 0o755); chmodTree(p, writable); if (!writable) chmodSync(p, 0o555); }
    else if (e.isFile()) chmodSync(p, writable ? 0o644 : 0o444);
  }
}

export const legacyTree = (root) => { try { return git(root, ["rev-parse", "-q", "--verify", "HEAD:legacy-dist"]); } catch { return null; } };
const entryName = (tree) => `legacy-dist-${tree.slice(0, 16)}`;

// <cache>/legacy-dist-<tree>/legacy-dist, extracted from the object store once per tree (files and dirs read-only:
// every task's link points here, an in-place write would change it for all of them).
function ensureLegacyEntry(root, cache, tree) {
  const name = entryName(tree), entry = path.join(cache, name), target = path.join(entry, "legacy-dist");
  const ready = () => existsSync(path.join(entry, ".ready")) && existsSync(target);
  if (ready()) return { target, installed: false };
  mkdirSync(cache, { recursive: true });
  return withLock(cache, name, () => {
    if (ready()) return { target, installed: false };
    if (existsSync(entry)) throw new Error(`cache entry ${entry} exists but is incomplete; delete it and rerun`);
    removeCrashedTemps(cache, name);
    const tmp = `${entry}.tmp-${process.pid}-${randomUUID()}`;
    try {
      mkdirSync(tmp, { recursive: true });
      const tar = execFileSync("git", ["-C", root, "archive", "--format=tar", tree], { maxBuffer: 1024e6 });
      mkdirSync(path.join(tmp, "legacy-dist"));
      execFileSync("tar", ["-x", "-f", "-", "-C", path.join(tmp, "legacy-dist")], { input: tar, stdio: ["pipe", "ignore", "inherit"] });
      chmodTree(path.join(tmp, "legacy-dist"), false);
      chmodSync(path.join(tmp, "legacy-dist"), 0o555);
      writeFileSync(path.join(tmp, ".ready"), JSON.stringify({ tree, at: new Date().toISOString() }));
      try { renameSync(tmp, entry); } catch (e) { if (ready()) return { target, installed: false }; throw e; }
      return { target, installed: true };
    } finally { if (existsSync(tmp)) { chmodTree(tmp, true); chmodSync(tmp, 0o755); rmSync(tmp, { recursive: true, force: true }); } }
  });
}

const isGitCheckout = (root) => { try { return git(root, ["rev-parse", "--show-prefix"]) === ""; } catch { return false; } }; // the checkout's top dir

function enableSparse(root) {
  // per worktree: `sparse-checkout set` turns on extensions.worktreeConfig and removes the real files; without
  // expectFilesOutsideOfPatterns git would clear the skip-worktree bits of the files it sees through the link
  git(root, ["sparse-checkout", "set", "--no-cone", ...SPARSE]);
  git(root, ["config", "--worktree", "sparse.expectFilesOutsideOfPatterns", "true"]);
}

// Points <root>/legacy-dist at the shared copy of HEAD:legacy-dist. A real legacy-dist with local changes or untracked
// files is left alone (warning) unless force. → {action, entry?}
export function linkLegacyDist(root, cache, { force = false, warnings = [] } = {}) {
  const local = path.join(root, "legacy-dist");
  if (!isGitCheckout(root)) return { action: "not-a-checkout" };
  const tree = legacyTree(root);
  if (!tree) return { action: "not-in-HEAD" };
  const st = lstat(local);
  if (st && !st.isSymbolicLink()) {
    const dirty = git(root, ["status", "--porcelain", "--untracked-files=all", "--", "legacy-dist"]);
    if (dirty && !force) { warnings.push(`legacy-dist has local changes, left as a real directory (use --force to replace it with the shared copy): ${dirty.split("\n").slice(0, 3).join("; ")}`); return { action: "kept-local" }; }
    if (dirty) { // --force: drop them, or sparse-checkout keeps the changed files in the working tree
      git(root, ["checkout", "HEAD", "--", "legacy-dist"]);
      git(root, ["clean", "-fdq", "--", "legacy-dist"]);
      warnings.push(`legacy-dist: local changes dropped (--force): ${dirty.split("\n").slice(0, 3).join("; ")}`);
    }
  }
  const { target, installed } = ensureLegacyEntry(root, cache, tree);
  if (st?.isSymbolicLink() && readlinkSync(local) === target) return { action: "linked", entry: path.dirname(target) };
  if (st?.isSymbolicLink()) rmSync(local);
  enableSparse(root); // removes the real files (clean, or --force)
  if (existsSync(local) && !lstat(local).isSymbolicLink()) rmSync(local, { recursive: true, force: true });
  symlinkSync(target, local, "dir");
  gitExclude(root, "legacy-dist", "tools/lib/shared-deps.mjs: legacy-dist is a symlink into RESTORE_DEPS_CACHE (sparse checkout)");
  return { action: installed ? "installed+linked" : "linked", entry: path.dirname(target) };
}

// Undo linkLegacyDist: real files back from the index (local mode).
export function unlinkLegacyDist(root) {
  const local = path.join(root, "legacy-dist"), st = lstat(local);
  if (!st?.isSymbolicLink()) return false;
  rmSync(local);
  try { git(root, ["config", "--worktree", "--unset", "sparse.expectFilesOutsideOfPatterns"]); } catch {}
  git(root, ["sparse-checkout", "disable"]);
  return true;
}

// Cheap check for the tools that read legacy-dist: a link to another tree than HEAD's (after a checkout or merge that
// changed legacy-dist) is re-pointed. No-op for a real legacy-dist. Returns a warning string or null; never throws.
export function ensureLegacyDist(root) {
  try {
    const local = path.join(root, "legacy-dist"), st = lstat(local);
    if (!st?.isSymbolicLink()) return null;
    const tree = legacyTree(root);
    if (!tree) return null;
    const cur = readlinkSync(local);
    if (path.basename(path.dirname(cur)) === entryName(tree) && existsSync(cur)) return null;
    const cache = depsCacheDir() ?? path.dirname(path.dirname(cur));
    const r = linkLegacyDist(root, cache);
    return `legacy-dist re-linked to HEAD's tree ${tree.slice(0, 12)} (${r.action})`;
  } catch (e) { return `legacy-dist link check failed: ${e.message}`; }
}
