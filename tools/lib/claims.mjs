// Cross-machine claims on a branch of the tool repo (default `claims` on origin). Two machines may each run a tick; a
// work order must be claimed by exactly one of them before any task is created for it. The claim is a file on the branch
// and a claim round is one commit pushed without --force: git only accepts it when the remote tip is still the one we
// built on, so the push is a compare-and-swap. Whoever pushes first wins; the loser's push is rejected, it re-fetches,
// drops the keys that are now taken and retries the rest after a random backoff.
//
// Branch layout (all JSON):
//   wo/<key>.json        {key, machine, at, by}          owner of a work order (the machine whose tick drives it)
//   leader.json          {machine, until, at, by}        lease for the global steps (records, regression, rule reviews…)
//   stats/<machine>.json capability / audits / cooldowns / recent events of one machine, and its heartbeat (`at`)
//
// Commits are built with plumbing (temporary index, hash-object, commit-tree), so no worktree is touched.
// dryRun: fetch and reads run; writes are printed and treated as successful.
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { createHash } from "node:crypto";

const sleepSync = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
export const fileKey = (key) => {
  const s = String(key).replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "_";
  return s === String(key) ? s : `${s}-${createHash("sha1").update(String(key)).digest("hex").slice(0, 6)}`;
};
export const claimPath = (key) => `wo/${fileKey(key)}.json`;
export const statsPath = (machine) => `stats/${fileKey(machine)}.json`;
const REJECTED = /\[rejected\]|non-fast-forward|fetch first|stale info|failed to update ref|cannot lock ref|reference already exists/i;

export class ClaimError extends Error {}

export class Claims {
  constructor(repo, { remote = "origin", branch = "claims", dryRun = false, log = (s) => process.stderr.write(s + "\n"), now = () => Date.now(), by = `${os.hostname()}:${process.pid}`, maxTries = 12, backoffMs = 150, beforePush = null } = {}) {
    this.repo = path.resolve(repo);
    this.remote = remote; this.branch = branch; this.dryRun = dryRun; this.log = log; this.now = now; this.by = by;
    this.maxTries = maxTries; this.backoffMs = backoffMs;
    this.beforePush = beforePush; // tests: called between fetch and push, to force a lost race
    this.tip = null; this.files = new Map(); this.loaded = false;
    this.stats = { pushes: 0, rejected: 0 };
  }

  git(args, { input, env, allowFail = false } = {}) {
    const res = spawnSync("git", args, { cwd: this.repo, input, encoding: input instanceof Buffer ? undefined : "utf8", env: { ...process.env, GIT_TERMINAL_PROMPT: "0", ...env }, maxBuffer: 256 * 1024 * 1024 });
    if (res.error) throw res.error;
    if (res.status !== 0 && !allowFail) throw new ClaimError(`git ${args.slice(0, 3).join(" ")}: ${String(res.stderr || "").trim().split("\n").slice(-2).join(" | ")}`);
    return { ok: res.status === 0, out: typeof res.stdout === "string" ? res.stdout.trim() : res.stdout, err: String(res.stderr || "") };
  }
  get ref() { return `refs/remotes/${this.remote}/${this.branch}`; }

  // Fetch the branch and load every file on it. A missing branch is an empty claim set.
  refresh() {
    const f = this.git(["fetch", "--quiet", this.remote, `+refs/heads/${this.branch}:${this.ref}`], { allowFail: true });
    if (!f.ok) {
      if (!/couldn't find remote ref|could not find remote ref|not our ref/i.test(f.err)) throw new ClaimError(`fetch ${this.remote} ${this.branch}: ${f.err.trim().split("\n").pop()}`);
      this.git(["update-ref", "-d", this.ref], { allowFail: true });
      this.tip = null; this.files = new Map(); this.loaded = true;
      return this;
    }
    this.tip = this.git(["rev-parse", "--verify", "--quiet", `${this.ref}^{commit}`], { allowFail: true }).out || null;
    this.files = this.tip ? this.readTree(this.tip) : new Map();
    this.loaded = true;
    return this;
  }
  ensure() { if (!this.loaded) this.refresh(); return this; }

  readTree(tip) {
    const entries = this.git(["ls-tree", "-r", tip]).out.split("\n").filter(Boolean).map((l) => { const [meta, p] = l.split("\t"); return { sha: meta.split(" ")[2], path: p }; });
    const out = new Map();
    if (!entries.length) return out;
    const res = spawnSync("git", ["cat-file", "--batch"], { cwd: this.repo, input: entries.map((e) => e.sha).join("\n") + "\n", maxBuffer: 256 * 1024 * 1024 });
    const buf = res.stdout;
    let pos = 0;
    for (const e of entries) {
      const nl = buf.indexOf(0x0a, pos);
      const size = Number(buf.subarray(pos, nl).toString("utf8").split(" ")[2]);
      const body = buf.subarray(nl + 1, nl + 1 + size).toString("utf8");
      pos = nl + 1 + size + 1;
      try { out.set(e.path, JSON.parse(body)); } catch { out.set(e.path, body); }
    }
    return out;
  }

  get(p) { this.ensure(); return this.files.get(p) ?? null; }
  owner(key) { const c = this.get(claimPath(key)); return c && typeof c === "object" ? c.machine : null; }
  claimsOf(machine) { this.ensure(); return [...this.files.entries()].filter(([p, v]) => p.startsWith("wo/") && v?.machine === machine).map(([, v]) => v.key); }
  all() { this.ensure(); return [...this.files.entries()].filter(([p]) => p.startsWith("wo/")).map(([, v]) => v); }
  statsAll() { this.ensure(); return [...this.files.entries()].filter(([p]) => p.startsWith("stats/")).map(([, v]) => v).filter((v) => v && typeof v === "object"); }

  // One CAS round: write `changes` (path → object, or null to delete) on top of the fetched tip and push without force.
  // Returns {ok:true, sha} or {ok:false, rejected:true} when someone else pushed first.
  commit(changes, message) {
    if (this.dryRun) { this.log(`[dry-run] git push ${this.remote} ${this.branch}: ${message} (${Object.keys(changes).length} files)`); for (const [p, v] of Object.entries(changes)) if (v === null) this.files.delete(p); else this.files.set(p, v); return { ok: true, dryRun: true }; }
    const dir = mkdtempSync(path.join(os.tmpdir(), "hmrsfw-claims-"));
    const env = { GIT_INDEX_FILE: path.join(dir, "index") };
    try {
      if (this.tip) this.git(["read-tree", this.tip], { env }); else this.git(["read-tree", "--empty"], { env });
      for (const [p, v] of Object.entries(changes)) {
        if (v === null) { this.git(["update-index", "--force-remove", "--", p], { env, allowFail: true }); continue; }
        const blob = this.git(["hash-object", "-w", "--stdin"], { input: JSON.stringify(v, null, 1) + "\n" }).out;
        this.git(["update-index", "--add", "--cacheinfo", `100644,${blob},${p}`], { env });
      }
      const tree = this.git(["write-tree"], { env }).out;
      const id = ["-c", "user.name=hmrsfw-scheduler", "-c", "user.email=hmrsfw-scheduler@localhost"];
      const sha = this.git([...id, "commit-tree", tree, ...(this.tip ? ["-p", this.tip] : []), "-m", message]).out;
      if (this.beforePush) this.beforePush(this);
      this.stats.pushes++;
      const r = this.git(["push", "--quiet", "--porcelain", this.remote, `${sha}:refs/heads/${this.branch}`], { allowFail: true });
      if (!r.ok || /\[rejected\]|!\s/.test(r.out || "")) {
        if (REJECTED.test(r.err + (r.out || ""))) { this.stats.rejected++; return { ok: false, rejected: true }; }
        throw new ClaimError(`push ${this.branch}: ${r.err.trim().split("\n").slice(-2).join(" | ")}`);
      }
      this.git(["update-ref", this.ref, sha], { allowFail: true });
      this.tip = sha;
      for (const [p, v] of Object.entries(changes)) if (v === null) this.files.delete(p); else this.files.set(p, v);
      return { ok: true, sha };
    } finally { rmSync(dir, { recursive: true, force: true }); }
  }

  backoff(tryNo) { sleepSync(Math.min(2000, this.backoffMs * 2 ** tryNo) * (0.5 + Math.random())); }

  // Run plan(files) → {changes, result} in CAS rounds until the push lands or nothing is left to write.
  cas(plan, message) {
    for (let tryNo = 0; tryNo < this.maxTries; tryNo++) {
      this.refresh();
      const { changes, result } = plan(this);
      if (!changes || !Object.keys(changes).length) return { ...result, retries: tryNo };
      const r = this.commit(changes, message);
      if (r.ok) return { ...result, retries: tryNo, sha: r.sha };
      this.backoff(tryNo);
    }
    throw new ClaimError(`claims: gave up after ${this.maxTries} rejected pushes to ${this.branch}`);
  }

  // First come, first served: claim every free key for `machine`. Keys already owned by `machine` count as won;
  // keys owned by another machine are reported in `lost`.
  claim(keys, machine, why = "claim") {
    keys = [...new Set(keys)];
    if (!keys.length) return { won: [], lost: {}, retries: 0 };
    const at = new Date(this.now()).toISOString();
    return this.cas((c) => {
      const won = [], lost = {}, changes = {};
      for (const k of keys) {
        const o = c.owner(k);
        if (o === machine) won.push(k);
        else if (o) lost[k] = o;
        else { changes[claimPath(k)] = { key: k, machine, at, by: this.by, why }; won.push(k); }
      }
      return { changes, result: { won, lost } };
    }, `claim ${keys.length > 3 ? `${keys.slice(0, 3).join(", ")} +${keys.length - 3}` : keys.join(", ")} → ${machine}`);
  }

  // Move claims from one machine to another (a machine that is gone for good). Refuses while the old machine's heartbeat
  // is fresher than deadAfterMs unless force.
  reclaim({ from, to, keys = null, force = false, deadAfterMs = 60 * 60_000 }) {
    this.refresh();
    const hb = this.get(statsPath(from))?.at;
    if (!force && hb && this.now() - Date.parse(hb) < deadAfterMs) return { ok: false, error: `${from} heartbeat ${hb} is recent; pass --force to take its claims anyway`, moved: [] };
    const at = new Date(this.now()).toISOString();
    return { ok: true, ...this.cas((c) => {
      const changes = {}, moved = [];
      for (const v of c.all()) if (v.machine === from && (!keys || keys.includes(v.key))) { changes[claimPath(v.key)] = { ...v, machine: to, at, by: this.by, why: `reclaim from ${from}`, prev: from }; moved.push(v.key); }
      return { changes, result: { moved } };
    }, `reclaim ${from} → ${to}`) };
  }

  // Leader lease for the global steps. Renewed when less than half of the ttl is left.
  lease(machine, ttlMs) {
    const at = new Date(this.now()).toISOString();
    return this.cas((c) => {
      const cur = c.get("leader.json");
      const left = cur ? Date.parse(cur.until) - this.now() : -1;
      if (cur && cur.machine !== machine && left > 0) return { changes: null, result: { leader: false, holder: cur.machine, until: cur.until } };
      if (cur && cur.machine === machine && left > ttlMs / 2) return { changes: null, result: { leader: true, holder: machine, until: cur.until } };
      const until = new Date(this.now() + ttlMs).toISOString();
      return { changes: { "leader.json": { machine, until, at, by: this.by, prev: cur?.machine ?? null } }, result: { leader: true, holder: machine, until, acquired: cur?.machine !== machine } };
    }, `leader → ${machine}`);
  }
  leaderNow() { const cur = this.get("leader.json"); return cur && Date.parse(cur.until) > this.now() ? cur.machine : null; }

  write(files, message) { return this.cas(() => ({ changes: files, result: {} }), message); }
}

