// node --test tools/test/shared-branch-gate.test.mjs
// Rule 4 of check-imports on a branch several page orders share (HM-526, fast lane `restore/fast-lane`): a file another
// page owns is not this order's change when every commit touching it is only that page's; anything else stays this order's.
// Merges in the range (HM-1310) touch what they changed on their own and are never another page's.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { changedFiles, otherPagesOnly, pageOwners } from "../check-imports.mjs";

const A = "apps/portal/src/views/a.vue", B = "apps/portal/src/views/b.vue", BSUB = "apps/portal/src/views/b/Sub.vue";
const C = "apps/portal/src/views/c.vue", SHARED = "apps/portal/src/shared/x.ts";
const owner = (p) => ({ [A]: "page.a", [B]: "page.b", [BSUB]: "page.b", [C]: "page.c" })[p] ?? null;
const mineA = (p) => p === A;

function repo() {
  const dir = mkdtempSync(path.join(tmpdir(), "shared-branch-"));
  const git = (...a) => execFileSync("git", ["-C", dir, ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  git("init", "-q", "-b", "main"); git("config", "user.email", "t@t"); git("config", "user.name", "t");
  const write = (f, s) => { mkdirSync(path.dirname(path.join(dir, f)), { recursive: true }); writeFileSync(path.join(dir, f), s); };
  const commit = (files, msg) => { for (const f of files) write(f, `${msg}\n`); git("add", "-A"); git("commit", "-q", "-m", msg); return git("rev-parse", "HEAD"); };
  const base = commit([A, B, BSUB, C, SHARED], "base");
  return { dir, git, write, commit, base, done: () => rmSync(dir, { recursive: true, force: true }) };
}
const run = (r, files, work = new Set()) => otherPagesOnly(r.dir, { mb: r.base, files, work, me: ["page.a"], mine: mineA, owner });

test("another page's own fix commit is that page's change", () => {
  const r = repo();
  try {
    r.commit([B], "fix(page): page.b 修正第 1 轮");
    r.commit([BSUB, C], "fix(page): page.b + page.c");
    assert.deepEqual([...run(r, [B, BSUB, C])], [[B, "page.b"], [BSUB, "page.b"], [C, "page.c"]]);
  } finally { r.done(); }
});

test("a commit that also touches this page's files, a shared file or names this order stays this order's", () => {
  const r = repo();
  try {
    r.commit([A, B], "fix(page): page.a");
    assert.deepEqual([...run(r, [A, B])], []);
  } finally { r.done(); }
  const s = repo();
  try {
    s.commit([B, SHARED], "fix(page): page.b");
    assert.deepEqual([...run(s, [B, SHARED])], []);
  } finally { s.done(); }
  const t = repo();
  try {
    t.commit([C], "fix(page): page.a 顺手改了 page.c");
    assert.deepEqual([...run(t, [C])], []);
  } finally { t.done(); }
});

test("one non-attributable commit on a file keeps it this order's; so does the working tree", () => {
  const r = repo();
  try {
    r.commit([B], "fix(page): page.b");
    r.commit([A, B], "fix(page): page.a");
    r.commit([C], "fix(page): page.c");
    assert.deepEqual([...run(r, [A, B, C])], [[C, "page.c"]]);
    assert.deepEqual([...run(r, [A, B, C], new Set([C]))], []);
  } finally { r.done(); }
});

// HM-1310: the fast lane takes integration by merging it (HM-1068), so mb..HEAD always holds merges; a merge counts as
// touching only what it changed on its own (differs from every parent), and that is never another page's change.
test("a merge in the range: the commits it brings are attributed one by one", () => {
  const r = repo();
  try {
    r.git("checkout", "-q", "-b", "side");
    r.commit([C], "fix(page): page.c");
    r.git("checkout", "-q", "main");
    r.commit([B], "fix(page): page.b");
    r.git("merge", "-q", "--no-ff", "-m", "merge", "side");
    assert.deepEqual([...run(r, [B, C])], [[B, "page.b"], [C, "page.c"]]);
    // a commit of this order on another page's file stays this order's, whichever side of the merge it came from
    r.git("checkout", "-q", "-b", "side2", r.base);
    r.commit([B], "fix(page): page.a 顺手改了 page.b");
    r.git("checkout", "-q", "main");
    r.git("merge", "-q", "--no-ff", "-X", "theirs", "-m", "merge side2", "side2");
    assert.deepEqual([...run(r, [B, C])], [[C, "page.c"]]);
  } finally { r.done(); }
});

test("a file a merge changed on its own (differs from every parent) stays this order's", () => {
  const r = repo();
  try {
    r.git("checkout", "-q", "-b", "side");
    r.commit([C], "fix(page): page.c");
    r.git("checkout", "-q", "main");
    r.commit([B], "fix(page): page.b");
    r.git("merge", "-q", "--no-ff", "--no-commit", "side");
    r.write(B, "edited in the merge\n"); r.git("add", "-A"); r.git("commit", "-q", "-m", "merge side");
    assert.deepEqual([...run(r, [B, C])], [[C, "page.c"]]);
  } finally { r.done(); }
});

test("changedFiles + otherPagesOnly: integration merged into the shared branch, then another page's fix (HM-1310)", () => {
  const r = repo();
  try {
    r.git("checkout", "-q", "-b", "integration");
    r.git("checkout", "-q", "-b", "fast");
    r.commit([B], "fix(page): page.b 修正第 1 轮");
    r.git("checkout", "-q", "integration");
    r.git("merge", "-q", "--no-ff", "-m", "Merge fast into integration", "fast");
    r.commit([SHARED], "upgrade(shared)");
    r.git("checkout", "-q", "fast");
    r.git("merge", "-q", "--no-ff", "-m", "Merge integration into fast", "integration");
    r.commit([C], "fix(page): page.c 修正第 1 轮");
    const ch = changedFiles(r.dir);
    assert.equal(ch.mb, r.git("rev-parse", "integration"));
    assert.deepEqual(ch.files, [C]);
    assert.deepEqual([...otherPagesOnly(r.dir, { mb: ch.mb, files: ch.files, work: ch.work, me: ["page.a"], mine: mineA, owner })], [[C, "page.c"]]);
    // the page that owns the fix is charged with it
    assert.deepEqual([...otherPagesOnly(r.dir, { mb: ch.mb, files: ch.files, work: ch.work, me: ["page.c"], mine: (p) => p === C, owner })], []);
  } finally { r.done(); }
});

test("pageOwners: target and subComponentDir of page and segment orders, segments count as their page", () => {
  const own = pageOwners();
  assert.equal(own("apps/portal/src/views/LookForJob/PostDetail.vue"), "page.portal.LookForJob.PostDetail");
  assert.equal(own("apps/uc/src/views/zcyzCorpAttestationapprove/BusinessModal.vue"), "page.uc.zcyzCorpAttestationapprove");
  assert.equal(own("apps/portal/src/shared/index.ts"), null);
  assert.equal(own("package.json"), null);
});

// HM-990: an upgrade merged into integration reaches the fast lane as a cherry-pick (syncFastLane), so the branch's
// merge-base with integration stays put; changedFiles must not charge the pages gated there with the upgrade's files.
test("changedFiles: files only cherry-picks of base commits touch are not the branch's change", () => {
  const r = repo();
  try {
    r.git("checkout", "-q", "-b", "integration");
    r.git("checkout", "-q", "-b", "upg");
    const PUB = "apps/portal/public/sjz/bg.jpg";
    r.commit([PUB, SHARED], "upgrade(shared)");
    r.git("checkout", "-q", "integration");
    r.git("merge", "-q", "--no-ff", "-m", "Merge upg into integration", "upg");
    const up = r.git("rev-parse", "HEAD");
    r.git("checkout", "-q", "-b", "fast", r.base);
    r.commit([B], "fix(page): page.b");
    r.git("cherry-pick", "-x", "-m", "1", up);
    r.commit([A], "fix(page): page.a");
    let ch = changedFiles(r.dir);
    assert.equal(ch.base, "integration");
    assert.deepEqual(ch.files.sort(), [A, B].sort());
    assert.deepEqual(ch.picked.sort(), [PUB, SHARED].sort());
    // a later commit of the branch on a picked file keeps that file the branch's
    r.commit([SHARED], "fix(page): page.a 改了 shared");
    ch = changedFiles(r.dir);
    assert.deepEqual(ch.files.sort(), [A, B, SHARED].sort());
    // a pick of a commit that is not in the base is the branch's own change
    r.git("checkout", "-q", "-b", "elsewhere", r.base);
    const other = r.commit([C], "fix(page): page.c 别处");
    r.git("checkout", "-q", "fast");
    r.git("cherry-pick", "-x", other);
    assert.ok(changedFiles(r.dir).files.includes(C));
  } finally { r.done(); }
});
