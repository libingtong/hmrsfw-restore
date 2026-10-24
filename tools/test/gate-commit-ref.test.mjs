// node --test tools/test/gate-commit-ref.test.mjs
// Integration tasks opened at a commit carry the full SHA as `branch` (pipeline.mjs openIntegration). The gate used to
// fetch it as refs/heads/<sha> and failed three times (HM-1330); fetchRef checks out the commit itself.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fetchRef, isCommitSha } from "../gate.mjs";
import { createRun, pickRun } from "../gate/runs.mjs";

const git = (dir, ...a) => execFileSync("git", ["-C", dir, ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();

function fixture() {
  const root = mkdtempSync(path.join(tmpdir(), "gate-sha-"));
  const remote = path.join(root, "remote.git"), work = path.join(root, "work"), clone = path.join(root, "clone");
  git(root, "init", "-q", "--bare", "-b", "integration", remote);
  mkdirSync(work); git(work, "init", "-q", "-b", "integration"); git(work, "config", "user.email", "t@t"); git(work, "config", "user.name", "t");
  const commit = (n) => { writeFileSync(path.join(work, "f"), n); git(work, "add", "-A"); git(work, "commit", "-q", "-m", n); return git(work, "rev-parse", "HEAD"); };
  const old = commit("a"); commit("b");
  git(work, "push", "-q", remote, "integration");
  git(root, "clone", "-q", "--single-branch", "-b", "integration", remote, clone);
  return { root, remote, work, clone, old, commit };
}

test("isCommitSha: a full 40-hex name only", () => {
  assert.equal(isCommitSha("afed44fc40bbc1fa159b10e84083ae4ee662f32d"), true);
  assert.equal(isCommitSha("afed44f"), false);
  assert.equal(isCommitSha("integration"), false);
  assert.equal(isCommitSha("restore/page.x-a1"), false);
  assert.equal(isCommitSha(undefined), false);
});

test("fetchRef: a branch name → origin/<branch>; a SHA behind integration's tip → the SHA itself", () => {
  const f = fixture();
  try {
    assert.equal(fetchRef(f.clone, "integration"), "origin/integration");
    assert.equal(fetchRef(f.clone, f.old), f.old);
    assert.equal(fetchRef(f.clone, f.old.toUpperCase()), f.old);
    // a commit pushed after the clone, only reachable via integration: fetched with it
    const later = f.commit("c"); git(f.work, "push", "-q", f.remote, "integration");
    assert.equal(fetchRef(f.clone, later), later);
    assert.equal(git(f.clone, "cat-file", "-t", later), "commit");
  } finally { rmSync(f.root, { recursive: true, force: true }); }
});

test("fetchRef: a SHA on another branch only is fetched by itself", () => {
  const f = fixture();
  try {
    git(f.work, "checkout", "-q", "-b", "side");
    const side = f.commit("s"); git(f.work, "push", "-q", f.remote, "side");
    git(f.remote, "config", "uploadpack.allowReachableSHA1InWant", "true"); // what GitHub allows
    assert.equal(fetchRef(f.clone, side), side);
  } finally { rmSync(f.root, { recursive: true, force: true }); }
});

test("pickRun with commit: a run of the same pages at another commit is not shared", () => {
  const state = mkdtempSync(path.join(tmpdir(), "gate-sha-runs-"));
  try {
    const base = { state, tools: "t", rules: "r", set: "s" };
    const a = "a".repeat(40), b = "b".repeat(40);
    createRun({ ...base, commit: a, branch: "integration" });
    assert.equal(pickRun({ ...base, pin: null })?.commit, a); // unpinned: shared as before
    assert.equal(pickRun({ ...base, pin: null, commit: b }), null);
    assert.equal(pickRun({ ...base, pin: null, commit: a })?.commit, a);
  } finally { rmSync(state, { recursive: true, force: true }); }
});
