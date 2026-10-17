// node --test tools/test/gate-node-modules-link.test.mjs
// The gate's --branch worktree links node_modules (HM-526): hmrsfw-vue's `node_modules/` ignores directories only, so
// without the info/exclude entry `git status` lists the link and rule 4 of check-imports charges it to the page.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { gitExclude } from "../lib/git-exclude.mjs";

const git = (dir, ...a) => execFileSync("git", ["-C", dir, ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trimEnd();

test("a node_modules link in a worktree is ignored after gitExclude; other untracked files are not", () => {
  const root = mkdtempSync(path.join(tmpdir(), "nm-link-"));
  try {
    const repo = path.join(root, "app"), wt = path.join(root, "wt"), deps = path.join(root, "deps");
    mkdirSync(repo); mkdirSync(deps); mkdirSync(path.join(repo, "node_modules"));
    git(repo, "init", "-q", "-b", "main"); git(repo, "config", "user.email", "t@t"); git(repo, "config", "user.name", "t");
    writeFileSync(path.join(repo, ".gitignore"), "node_modules/\n");
    git(repo, "add", "-A"); git(repo, "commit", "-q", "-m", "base");
    git(repo, "worktree", "add", "-q", "--detach", wt, "main");
    symlinkSync(deps, path.join(wt, "node_modules"));
    assert.equal(git(wt, "status", "--porcelain", "--untracked-files=all"), "?? node_modules"); // the misjudgement
    gitExclude(wt, "node_modules", "test");
    assert.equal(git(wt, "status", "--porcelain", "--untracked-files=all"), "");
    gitExclude(wt, "node_modules", "test"); // idempotent: already ignored, nothing appended
    const exclude = readFileSync(path.resolve(wt, git(wt, "rev-parse", "--git-path", "info/exclude")), "utf8");
    assert.equal(exclude.split("\n").filter((l) => l === "/node_modules").length, 1);
    writeFileSync(path.join(wt, "stray.vue"), "");
    mkdirSync(path.join(wt, "sub")); symlinkSync(deps, path.join(wt, "sub", "node_modules"));
    assert.equal(git(wt, "status", "--porcelain", "--untracked-files=all"), "?? stray.vue\n?? sub/node_modules"); // only the top-level link
  } finally { rmSync(root, { recursive: true, force: true }); }
});
