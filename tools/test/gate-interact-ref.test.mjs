// node --test tools/test/gate-interact-ref.test.mjs
// Where the gate reads interaction scripts from (HM-914): record-page.mjs commits tests/interact/<id>.json to the tool
// repo's `integration` branch and the baselines are recorded with them, while main and restore/fast-lane, where the
// gate's tools come from, carry only the 8 POC scripts. Integration mode reads a fresh origin/integration pinned to one
// commit (interactRef); page mode keeps reading the working tree. The scripts here live in a commit object written to
// the tool repo's object store only (no ref, no working-tree file), the remote in a throwaway bare repo.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { ROOT, interactScript } from "../gate/common.mjs";
import { sha256 } from "../gate/har.mjs";
import { baselineFor, interactRef } from "../gate.mjs";

const git = (args, opts = {}) => execFileSync("git", args, { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"], ...opts }).trim();
const ID = "page.test.hm914.interact";
const SCRIPT = [{ click: "查询" }, { wait: 500 }];

// A commit holding tests/interact/<ID>.json and nothing else; returns its sha.
function scriptCommit(root, script) {
  const blob = git(["-C", root, "hash-object", "-w", "--stdin"], { input: JSON.stringify(script, null, 1) + "\n" });
  const sub = git(["-C", root, "mktree"], { input: `100644 blob ${blob}\t${ID}.json\n` });
  const tree = git(["-C", root, "mktree"], { input: `040000 tree ${sub}\tinteract\n` });
  const top = git(["-C", root, "mktree"], { input: `040000 tree ${tree}\ttests\n` });
  return git(["-C", root, "commit-tree", top, "-m", "hm-914 test"], { env: { ...process.env, GIT_AUTHOR_NAME: "t", GIT_AUTHOR_EMAIL: "t@t", GIT_COMMITTER_NAME: "t", GIT_COMMITTER_EMAIL: "t@t" } });
}

test("a ref reads the script from that commit; without one the working tree is read as before", async () => {
  assert.equal(existsSync(path.join(ROOT, "tests/interact", `${ID}.json`)), false);
  const sha = scriptCommit(ROOT, SCRIPT);
  assert.deepEqual(await interactScript(ID, { ref: sha }), SCRIPT);
  assert.equal(await interactScript(ID), null); // page mode: no file in the working tree, no POC script
  // a page without a script in the commit falls back to the POC scripts like the working tree does
  assert.equal(await interactScript("page.test.hm914.none", { ref: sha }), null);
  assert.deepEqual(await interactScript("c02", { ref: sha }), await interactScript("c02"));
});

test("interactRef: page mode keeps the working tree, an explicit commit is verified, integration mode fetches", () => {
  assert.equal(interactRef([], "page"), null);
  assert.equal(interactRef(["--interact-ref", "worktree"], "integration"), null);
  const sha = scriptCommit(ROOT, SCRIPT);
  assert.equal(interactRef(["--interact-ref", sha], "page"), sha);
  assert.throws(() => interactRef(["--interact-ref", "refs/heads/hm-914-no-such-branch"], "integration"), /no such commit/);

  // integration mode default: <remote>/integration fetched fresh, pinned to its commit, the private ref removed again
  const dir = mkdtempSync(path.join(tmpdir(), "hm914-"));
  try {
    const remote = path.join(dir, "remote.git"), root = path.join(dir, "tools");
    git(["init", "-q", "--bare", remote]);
    git(["init", "-q", root]);
    const pushed = scriptCommit(root, SCRIPT);
    git(["-C", root, "push", "-q", remote, `${pushed}:refs/heads/integration`]);
    const work = path.join(dir, "gate-tools");
    git(["init", "-q", work]);
    git(["-C", work, "remote", "add", "origin", remote]);
    assert.equal(interactRef([], "integration", { root: work }), pushed);
    assert.equal(git(["-C", work, "for-each-ref", "refs/gate-interact"]), "");
    // the remote moved on: the next run sees the new commit
    const next = scriptCommit(root, [...SCRIPT, { wait: 100 }]);
    git(["-C", root, "push", "-q", remote, `+${next}:refs/heads/integration`]); // not a descendant: forced
    assert.equal(interactRef([], "integration", { root: work }), next);
    rmSync(remote, { recursive: true, force: true });
    assert.throws(() => interactRef([], "integration", { root: work }), /failed 3 times/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("baselineFor: a baseline recorded with the integration branch's script matches only when that branch is read", async () => {
  const state = mkdtempSync(path.join(tmpdir(), "hm914-state-"));
  try {
    const har = path.join(state, "p.har");
    writeFileSync(har, "{}");
    const dir = path.join(state, "baseline", ID);
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, "baseline.json"), JSON.stringify({ har: { path: har, sha256: sha256(Buffer.from("{}")) }, script: sha256(JSON.stringify(SCRIPT)), sel: "main > *", paintedBox: true, runs: [] }));
    const wo = { id: ID, site: "portal" };
    const sha = scriptCommit(ROOT, SCRIPT);
    assert.deepEqual(await baselineFor(wo, state), { missing: "interaction script changed since the baseline" }); // the old integration-mode reading
    const ok = await baselineFor(wo, state, { interact: sha });
    assert.equal(ok.dir, dir);
    assert.equal(ok.missing, undefined);
    const changed = scriptCommit(ROOT, [{ click: "重置" }]); // a script that really changed is still reported
    assert.deepEqual(await baselineFor(wo, state, { interact: changed }), { missing: "interaction script changed since the baseline" });
  } finally { rmSync(state, { recursive: true, force: true }); }
});
