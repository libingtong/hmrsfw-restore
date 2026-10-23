// node --test tools/test/shared-deps.test.mjs
// legacy-dist as a link into the shared cache (HM-1130): sparse checkout + symlink keep `git status` clean, the shared
// copy is read-only, a checkout of a commit with another legacy-dist tree is re-linked, and local mode restores the files.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { ensureLegacyDist, linkLegacyDist, unlinkLegacyDist } from "../lib/shared-deps.mjs";

const git = (cwd, ...a) => execFileSync("git", ["-C", cwd, ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
const write = (root, rel, body) => { mkdirSync(path.dirname(path.join(root, rel)), { recursive: true }); writeFileSync(path.join(root, rel), body); };

function fixture() {
  const dir = mkdtempSync(path.join(os.tmpdir(), "shared-deps-")), repo = path.join(dir, "repo"), wt = path.join(dir, "wt"), cache = path.join(dir, "cache");
  mkdirSync(repo);
  git(repo, "init", "-q", "-b", "main");
  git(repo, "config", "user.email", "t@example.com"); git(repo, "config", "user.name", "t");
  write(repo, "legacy-dist/portal/index.html", "<p>v1</p>");
  write(repo, "legacy-dist/usercenter/assets/a.js", "a1");
  write(repo, "tools/x.mjs", "x");
  git(repo, "add", "-A"); git(repo, "commit", "-q", "-m", "v1");
  write(repo, "legacy-dist/portal/index.html", "<p>v2</p>");
  git(repo, "commit", "-q", "-am", "v2");
  git(repo, "worktree", "add", "-q", "-b", "task", wt, "main~1");
  return { dir, repo, wt, cache, cleanup: () => { execFileSync("chmod", ["-R", "u+w", dir]); rmSync(dir, { recursive: true, force: true }); } };
}

test("link, clean status, read-only shared copy, relink after checkout, unlink", () => {
  const fx = fixture();
  try {
    const r = linkLegacyDist(fx.wt, fx.cache);
    assert.equal(r.action, "installed+linked");
    const local = path.join(fx.wt, "legacy-dist");
    assert.ok(lstatSync(local).isSymbolicLink());
    assert.equal(readFileSync(path.join(local, "portal/index.html"), "utf8"), "<p>v1</p>");
    assert.equal(git(fx.wt, "status", "--porcelain"), "");
    assert.throws(() => writeFileSync(path.join(local, "portal/index.html"), "changed"), /EACCES|EPERM/);
    // the main checkout is not sparse and keeps its files
    assert.ok(existsSync(path.join(fx.repo, "legacy-dist/portal/index.html")));
    assert.ok(!lstatSync(path.join(fx.repo, "legacy-dist")).isSymbolicLink());

    // a second task checkout reuses the entry
    const wt2 = path.join(fx.dir, "wt2");
    git(fx.repo, "worktree", "add", "-q", "-b", "task2", wt2, "main~1");
    assert.equal(linkLegacyDist(wt2, fx.cache).action, "linked");

    // commits and checkouts work; the link follows HEAD's tree
    write(fx.wt, "tools/y.mjs", "y");
    git(fx.wt, "add", "-A"); git(fx.wt, "commit", "-q", "-m", "y");
    assert.deepEqual(git(fx.wt, "show", "--name-only", "--format=", "HEAD").split("\n"), ["tools/y.mjs"]);
    git(fx.wt, "checkout", "-q", "--detach", "main");
    assert.equal(git(fx.wt, "status", "--porcelain"), "");
    assert.match(ensureLegacyDist(fx.wt), /re-linked/);
    assert.equal(readFileSync(path.join(local, "portal/index.html"), "utf8"), "<p>v2</p>");
    assert.equal(ensureLegacyDist(fx.wt), null);

    // local mode: real files again
    assert.equal(unlinkLegacyDist(fx.wt), true);
    assert.ok(!lstatSync(local).isSymbolicLink());
    assert.equal(readFileSync(path.join(local, "portal/index.html"), "utf8"), "<p>v2</p>");
    assert.equal(git(fx.wt, "status", "--porcelain"), "");
  } finally { fx.cleanup(); }
});

test("a legacy-dist with local changes is kept unless --force", () => {
  const fx = fixture();
  try {
    write(fx.wt, "legacy-dist/portal/index.html", "edited");
    const warnings = [];
    assert.equal(linkLegacyDist(fx.wt, fx.cache, { warnings }).action, "kept-local");
    assert.match(warnings[0], /local changes/);
    assert.equal(linkLegacyDist(fx.wt, fx.cache, { force: true }).action, "installed+linked");
    assert.equal(git(fx.wt, "status", "--porcelain"), "");
  } finally { fx.cleanup(); }
});
