// $RESTORE_STATE layout, atomic JSON I/O and mkdir locks for the scheduler scripts (docs/pipeline.md §9, §12).
// Locks: $RESTORE_STATE/locks/<name>/ created with mkdir (atomic); owner.json inside says who holds it. A lock older than
// lockStaleMin (default 10 min) is treated as left over by a crashed run. Clearing it is serialised by a helper lock
// (<name>.reap) and only removes the exact owner that was judged stale, so two waiters can't both clear and both enter.
// Long holders call touchAll() to refresh the timestamp (heartbeat).
import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync, rmSync, statSync, appendFileSync, readdirSync, utimesSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { randomBytes } from "node:crypto";

export function stateDir(env = process.env) {
  const dir = env.RESTORE_STATE;
  if (!dir) throw new Error("RESTORE_STATE is not set (the scheduler keeps its ledger, locks and roster there)");
  return path.resolve(dir);
}

export const P = (root = stateDir()) => ({
  root,
  roster: path.join(root, "agents.roster.json"),
  config: path.join(root, "scheduler.config.json"),
  ledger: path.join(root, "ledger"),
  capability: path.join(root, "ledger", "capability.json"),
  agents: path.join(root, "ledger", "agents.json"),
  runs: path.join(root, "ledger", "runs.jsonl"),
  tasks: path.join(root, "ledger", "tasks.json"),
  tickState: path.join(root, "ledger", "tick-state.json"),
  events: path.join(root, "ledger", "events.jsonl"),
  locks: path.join(root, "locks"),
  gate: path.join(root, "gate"),
  baseline: path.join(root, "baseline"),
  knownDiffs: path.join(root, "known-diffs"),
});

export function readJson(file, fallback) {
  try { return JSON.parse(readFileSync(file, "utf8")); } catch (e) { if (e.code === "ENOENT" && fallback !== undefined) return fallback; throw e; }
}

// Write to a sibling temp file then rename: readers never see a half-written file.
export function writeJson(file, data) {
  mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.${randomBytes(4).toString("hex")}.tmp`;
  writeFileSync(tmp, JSON.stringify(data, null, 1) + "\n");
  renameSync(tmp, file);
}

export function appendJsonl(file, row) {
  mkdirSync(path.dirname(file), { recursive: true });
  appendFileSync(file, JSON.stringify(row) + "\n");
}

export function readJsonl(file) {
  if (!existsSync(file)) return [];
  return readFileSync(file, "utf8").split("\n").filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
}

const sleepSync = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

export class Locks {
  constructor(root = stateDir(), { staleMs = 10 * 60_000 } = {}) {
    this.dir = path.join(root, "locks");
    this.staleMs = staleMs;
    this.held = new Map();
    mkdirSync(this.dir, { recursive: true });
  }

  static safe(name) { return name.replace(/[^\w.@-]+/g, "_"); }

  // One attempt. Returns true when acquired. Clears a stale lock once and retries.
  tryAcquire(name) {
    const dir = path.join(this.dir, Locks.safe(name));
    if (this.held.has(name)) return true;
    for (let i = 0; i < 2; i++) {
      try {
        mkdirSync(dir);
        const token = randomBytes(6).toString("hex");
        writeFileSync(path.join(dir, "owner.json"), JSON.stringify({ name, pid: process.pid, host: os.hostname(), at: new Date().toISOString(), token }));
        this.held.set(name, { dir, token });
        return true;
      } catch (e) {
        if (e.code !== "EEXIST") throw e;
        if (!this.isStale(dir)) return false;
        if (!this.reap(dir)) return false;
      }
    }
    return false;
  }

  ownerToken(dir) { try { return JSON.parse(readFileSync(path.join(dir, "owner.json"), "utf8")).token || null; } catch { return null; } }

  reap(dir) {
    const token = this.ownerToken(dir);
    const guard = `${dir}.reap`;
    try { mkdirSync(guard); } catch (e) {
      if (e.code !== "EEXIST") throw e;
      try { if (Date.now() - statSync(guard).mtimeMs > 60_000) rmSync(guard, { recursive: true, force: true }); } catch { /* gone */ }
      return false;
    }
    try {
      if (!this.isStale(dir) || this.ownerToken(dir) !== token) return false; // re-taken meanwhile
      const trash = `${dir}.stale-${randomBytes(4).toString("hex")}`;
      renameSync(dir, trash);
      rmSync(trash, { recursive: true, force: true });
      return true;
    } catch { return false; } finally { rmSync(guard, { recursive: true, force: true }); }
  }

  touchAll() { const t = new Date(); for (const { dir } of this.held.values()) { try { utimesSync(dir, t, t); } catch { /* released */ } } }

  isStale(dir) {
    try { return Date.now() - statSync(dir).mtimeMs > this.staleMs; } catch { return false; }
  }

  // Wait up to timeoutMs (0 = single attempt).
  acquire(name, timeoutMs = 0) {
    const end = Date.now() + timeoutMs;
    for (;;) {
      if (this.tryAcquire(name)) return true;
      if (Date.now() >= end) return false;
      sleepSync(50 + Math.floor(Math.random() * 100));
    }
  }

  // All-or-nothing over several names, taken in sorted order so two callers can't deadlock.
  acquireAll(names, timeoutMs = 0) {
    const sorted = [...new Set(names)].sort();
    const got = [];
    for (const n of sorted) {
      if (!this.acquire(n, timeoutMs)) { got.reverse().forEach((g) => this.release(g)); return false; }
      got.push(n);
    }
    return true;
  }

  release(name) {
    const h = this.held.get(name);
    if (!h) return;
    this.held.delete(name);
    try {
      const owner = JSON.parse(readFileSync(path.join(h.dir, "owner.json"), "utf8"));
      if (owner.token !== h.token) return; // our lock went stale and someone else holds it now
    } catch { return; }
    rmSync(h.dir, { recursive: true, force: true });
  }

  releaseAll() { [...this.held.keys()].reverse().forEach((n) => this.release(n)); }

  // Run fn while holding the locks; returns {locked:true} when they can't be taken.
  with(names, fn, timeoutMs = 0) {
    const list = Array.isArray(names) ? names : [names];
    const fresh = list.filter((n) => !this.held.has(n));
    if (!this.acquireAll(fresh, timeoutMs)) return { locked: true };
    try { return fn(); } finally { fresh.forEach((n) => this.release(n)); }
  }

  list() { try { return readdirSync(this.dir); } catch { return []; } }
}

export const woLock = (wo) => `wo-${wo}`;
