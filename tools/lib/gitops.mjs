// Git writes the scheduler makes: merge a restore branch into `integration` (--no-ff), revert such a merge, pick an
// upgrade merge onto the fast lane, fast-forward `main`, and commit receipts to the tool repo. Every write happens in a
// throw-away worktree on the remote branch, so the caller's own checkout (the gate agent is sitting on the restore branch)
// is never touched. Callers hold locks/integration around merge/revert/fast-forward, locks/fast-lane around the pick
// (docs/pipeline.md §9 并发安全).
// dryRun: fetches and reads run, writes are printed and skipped.
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import os from "node:os";

export class GitError extends Error {}

export class Git {
  constructor(repo, { dryRun = false, remote = "origin", log = (s) => process.stderr.write(s + "\n") } = {}) {
    this.repo = path.resolve(repo);
    this.dryRun = dryRun;
    this.remote = remote;
    this.log = log;
  }

  raw(args, { cwd = this.repo, allowFail = false, input } = {}) {
    const res = spawnSync("git", args, { cwd, encoding: "utf8", input, env: { ...process.env, GIT_TERMINAL_PROMPT: "0" }, maxBuffer: 64 * 1024 * 1024 });
    if (res.error) throw res.error;
    if (res.status !== 0 && !allowFail) throw new GitError(`git ${args.join(" ")}: ${(res.stderr || res.stdout).trim().split("\n").slice(-3).join(" | ")}`);
    return { ok: res.status === 0, out: (res.stdout || "").trim(), err: (res.stderr || "").trim() };
  }
  out(args, opts) { return this.raw(args, opts).out; }

  identity(cwd) {
    const email = this.raw(["config", "user.email"], { cwd, allowFail: true }).out;
    return email ? [] : ["-c", "user.name=hmrsfw-scheduler", "-c", "user.email=hmrsfw-scheduler@localhost"];
  }

  fetch(...branches) {
    const specs = branches.filter(Boolean).map((b) => `+refs/heads/${b}:refs/remotes/${this.remote}/${b}`);
    this.raw(["fetch", "--quiet", this.remote, ...specs]);
  }
  // A branch that may not exist on the remote (a restorer that never pushed): false instead of throwing.
  fetchOptional(b) { return this.raw(["fetch", "--quiet", this.remote, `+refs/heads/${b}:refs/remotes/${this.remote}/${b}`], { allowFail: true }).ok; }
  // The merge commit on base's first-parent line that brought `head` in.
  findMerge(head, base) {
    for (const m of this.out(["rev-list", "--first-parent", "--merges", "-n", "2000", base]).split("\n").filter(Boolean)) if (this.isAncestor(head, m) && !this.isAncestor(head, `${m}^1`)) return m;
    return null;
  }
  remoteRef(b) { return `${this.remote}/${b}`; }
  // Commits reverted on the first-parent line (from, to]: the "This reverts commit <sha>" trailer of each revert.
  revertedIn(from, to) {
    const log = this.out(["log", "--first-parent", "--format=%B%x1e", from ? `${from}..${to}` : to]);
    return new Set([...log.matchAll(/This reverts commit ([0-9a-f]{40})/g)].map((m) => m[1]));
  }
  revParse(ref) { return this.raw(["rev-parse", "--verify", "--quiet", `${ref}^{commit}`], { allowFail: true }).out || null; }
  commitTime(ref) { const t = Number(this.raw(["log", "-1", "--format=%ct", ref], { allowFail: true }).out); return t ? t * 1000 : null; }
  isAncestor(a, b) { return this.raw(["merge-base", "--is-ancestor", a, b], { allowFail: true }).ok; }
  changedFiles(base, head) { return this.out(["diff", "--name-only", `${base}...${head}`]).split("\n").filter(Boolean); }
  // First-parent merge commits in (from, to], oldest first.
  mergesBetween(from, to) { return this.out(["rev-list", "--first-parent", "--merges", "--reverse", from ? `${from}..${to}` : to]).split("\n").filter(Boolean); }

  withWorktree(ref, fn) {
    const dir = mkdtempSync(path.join(os.tmpdir(), "hmrsfw-wt-"));
    this.raw(["worktree", "add", "--quiet", "--detach", dir, ref]);
    try { return fn(dir); } finally {
      this.raw(["worktree", "remove", "--force", dir], { allowFail: true });
      rmSync(dir, { recursive: true, force: true });
      this.raw(["worktree", "prune"], { allowFail: true });
    }
  }

  push(cwd, target) {
    if (this.dryRun) { this.log(`[dry-run] git push ${this.remote} HEAD:refs/heads/${target}`); return true; }
    return this.raw(["push", "--quiet", this.remote, `HEAD:refs/heads/${target}`], { cwd, allowFail: true }).ok;
  }

  // Merge `branch` into `into` with a merge commit. excludePaths: paths whose changes are dropped from the merge (failed
  // pages of a packed order). forbidden(files) → list of violations; non-empty refuses the merge before touching anything.
  merge({ branch, into = "integration", message, excludePaths = [], forbidden }) {
    for (let tryNo = 0; tryNo < 2; tryNo++) {
      this.fetch(into);
      if (!this.fetchOptional(branch)) return { merged: false, missingBranch: true };
      const head = this.remoteRef(branch), base = this.remoteRef(into);
      if (!this.revParse(head)) return { merged: false, missingBranch: true };
      if (this.isAncestor(head, base)) return { merged: true, alreadyMerged: true, sha: this.findMerge(head, base) };
      const files = this.changedFiles(base, head);
      const violations = forbidden ? forbidden(files) : [];
      if (violations.length) return { merged: false, forbidden: violations, files };
      if (this.dryRun) { this.log(`[dry-run] git merge --no-ff ${head} into ${into}${excludePaths.length ? ` (dropping ${excludePaths.join(", ")})` : ""}`); return { merged: true, dryRun: true, files }; }
      const res = this.withWorktree(base, (wt) => {
        const m = this.raw([...this.identity(wt), "merge", "--no-ff", "--no-commit", head], { cwd: wt, allowFail: true });
        if (!m.ok) {
          const conflicts = this.out(["diff", "--name-only", "--diff-filter=U"], { cwd: wt, allowFail: true }).split("\n").filter(Boolean);
          this.raw(["merge", "--abort"], { cwd: wt, allowFail: true });
          return { merged: false, conflict: true, conflicts };
        }
        for (const p of excludePaths) {
          this.raw(["rm", "-r", "-q", "-f", "--ignore-unmatch", "--", p], { cwd: wt });
          if (this.raw(["cat-file", "-e", `HEAD:${p}`], { cwd: wt, allowFail: true }).ok) this.raw(["checkout", "HEAD", "--", p], { cwd: wt });
        }
        this.raw([...this.identity(wt), "commit", "--quiet", "--no-verify", "-m", message || `Merge ${branch} into ${into}`], { cwd: wt });
        const sha = this.out(["rev-parse", "HEAD"], { cwd: wt });
        if (!this.push(wt, into)) return { merged: false, pushRejected: true };
        return { merged: true, sha, files };
      });
      if (!res.pushRejected) return res;
    }
    return { merged: false, pushRejected: true };
  }

  // Revert a commit on `into`. Merge commits are reverted against their first parent.
  revert({ sha, into = "integration", message }) {
    for (let tryNo = 0; tryNo < 2; tryNo++) {
      this.fetch(into);
      const base = this.remoteRef(into);
      if (!this.isAncestor(sha, base)) return { reverted: false, notOnBranch: true };
      if (this.dryRun) { this.log(`[dry-run] git revert ${sha} on ${into}`); return { reverted: true, dryRun: true }; }
      const parents = this.out(["rev-list", "--parents", "-n", "1", sha]).split(" ").length - 1;
      const res = this.withWorktree(base, (wt) => {
        const r = this.raw([...this.identity(wt), "revert", "--no-edit", ...(parents > 1 ? ["-m", "1"] : []), sha], { cwd: wt, allowFail: true });
        if (!r.ok) { this.raw(["revert", "--abort"], { cwd: wt, allowFail: true }); return { reverted: false, conflict: true }; }
        // keep git's trailer: revertedIn() finds reverted merges by it, whichever machine reverted them
        if (message) this.raw([...this.identity(wt), "commit", "--amend", "--quiet", "--no-verify", "-m", `${message}\n\nThis reverts commit ${this.out(["rev-parse", sha])}.`], { cwd: wt });
        const out = this.out(["rev-parse", "HEAD"], { cwd: wt });
        if (!this.push(wt, into)) return { reverted: false, pushRejected: true };
        return { reverted: true, sha: out };
      });
      if (!res.pushRejected) return res;
    }
    return { reverted: false, pushRejected: true };
  }

  // New branch = base + a revert of `revertSha` (which itself reverted a merge): the reverted work on top of today's base.
  branchFromRevert({ revertSha, base = "integration", newBranch }) {
    this.fetch(base);
    if (this.dryRun) { this.log(`[dry-run] git revert ${revertSha} on ${base} && git push ${this.remote} HEAD:refs/heads/${newBranch}`); return { ok: true, dryRun: true }; }
    return this.withWorktree(this.remoteRef(base), (wt) => {
      const r = this.raw([...this.identity(wt), "revert", "--no-edit", revertSha], { cwd: wt, allowFail: true });
      if (!r.ok) { this.raw(["revert", "--abort"], { cwd: wt, allowFail: true }); return { ok: false, conflict: true }; }
      return { ok: this.raw(["push", "--quiet", "--force", this.remote, `HEAD:refs/heads/${newBranch}`], { cwd: wt, allowFail: true }).ok };
    });
  }

  // Apply commit `sha` onto `into` as one new commit and push (HM-990: an upgrade merged into integration, brought to the
  // fast lane). A merge commit is picked against its first parent (-m 1), i.e. everything the merged branch brought in.
  // → {picked, sha} | {picked, already} (the change is on `into` already) | {missingBranch} | {conflict, conflicts}
  //   (nothing pushed) | {pushRejected} (twice).
  cherryPick({ sha, into, message }) {
    for (let tryNo = 0; tryNo < 2; tryNo++) {
      if (!this.fetchOptional(into) || !this.revParse(this.remoteRef(into))) return { picked: false, missingBranch: true };
      if (this.dryRun) { this.log(`[dry-run] git cherry-pick -m 1 ${sha} onto ${into} && git push`); return { picked: true, dryRun: true }; }
      const parents = this.out(["rev-list", "--parents", "-n", "1", sha]).split(" ").length - 1;
      const res = this.withWorktree(this.remoteRef(into), (wt) => {
        const r = this.raw([...this.identity(wt), "cherry-pick", "--no-commit", ...(parents > 1 ? ["-m", "1"] : []), sha], { cwd: wt, allowFail: true });
        if (!r.ok) {
          const conflicts = this.out(["diff", "--name-only", "--diff-filter=U"], { cwd: wt, allowFail: true }).split("\n").filter(Boolean);
          this.raw(["cherry-pick", "--abort"], { cwd: wt, allowFail: true });
          return { picked: false, conflict: true, conflicts };
        }
        if (this.raw(["diff", "--cached", "--quiet"], { cwd: wt, allowFail: true }).ok) return { picked: true, already: true };
        this.raw([...this.identity(wt), "commit", "--quiet", "--no-verify", "-m", `${message || `Pick ${sha} into ${into}`}\n\n(cherry picked from commit ${this.out(["rev-parse", sha])})`], { cwd: wt });
        const out = this.out(["rev-parse", "HEAD"], { cwd: wt });
        if (!this.push(wt, into)) return { pushRejected: true };
        return { picked: true, sha: out };
      });
      if (!res.pushRejected) return res;
    }
    return { picked: false, pushRejected: true };
  }

  // Move `to` forward to sha; refuses anything that is not a fast-forward.
  fastForward({ sha, to = "main" }) {
    this.fetch(to);
    const cur = this.revParse(this.remoteRef(to));
    if (cur === sha) return { ok: true, already: true };
    if (cur && !this.isAncestor(cur, sha)) return { ok: false, notFastForward: true };
    if (this.dryRun) { this.log(`[dry-run] git push ${this.remote} ${sha}:refs/heads/${to}`); return { ok: true, dryRun: true }; }
    const r = this.raw(["push", "--quiet", this.remote, `${sha}:refs/heads/${to}`], { allowFail: true });
    return { ok: r.ok, error: r.ok ? undefined : r.err };
  }

  // Write files (relative path → content) on `branch` and push; retries on a concurrent push.
  commitFiles({ branch, files, message }) {
    for (let tryNo = 0; tryNo < 4; tryNo++) {
      this.fetch(branch);
      if (this.dryRun) { this.log(`[dry-run] git commit ${Object.keys(files).join(", ")} on ${branch} && git push`); return { committed: true, dryRun: true }; }
      const res = this.withWorktree(this.remoteRef(branch), (wt) => {
        for (const [rel, content] of Object.entries(files)) { const p = path.join(wt, rel); mkdirSync(path.dirname(p), { recursive: true }); writeFileSync(p, content); }
        this.raw(["add", "--", ...Object.keys(files)], { cwd: wt });
        if (this.raw(["diff", "--cached", "--quiet"], { cwd: wt, allowFail: true }).ok) return { committed: false, unchanged: true };
        this.raw([...this.identity(wt), "commit", "--quiet", "--no-verify", "-m", message], { cwd: wt });
        const sha = this.out(["rev-parse", "HEAD"], { cwd: wt });
        return this.push(wt, branch) ? { committed: true, sha } : { pushRejected: true };
      });
      if (!res.pushRejected) return res;
    }
    return { committed: false, pushRejected: true };
  }

  readFileAt(ref, rel) { const r = this.raw(["show", `${ref}:${rel}`], { allowFail: true }); return r.ok ? r.out : null; }
}

// Paths a page order may not touch (§13.2 第 4 条): public library, package manifests, lock files.
export function pageForbidden(files) {
  const bad = [];
  for (const f of files) {
    if (/(^|\/)src\/(legacy|shared|api|utils)\//.test(f)) bad.push(`${f}: public library`);
    else if (/(^|\/)package\.json$/.test(f)) bad.push(`${f}: package.json`);
    else if (/(^|\/)(package-lock\.json|pnpm-lock\.yaml|yarn\.lock|npm-shrinkwrap\.json|bun\.lockb?)$/.test(f)) bad.push(`${f}: lock file`);
  }
  return bad;
}
