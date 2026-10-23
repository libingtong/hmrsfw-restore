// Resumable, shared integration runs (HM-1270). A full regression of ~266 pages takes 1.5–2 h on the Mac mini (static
// ~9 s and browser ~13 s a page, two app builds), more with several of them at once; the gate agent's shell kills a
// command after 10 minutes in the foreground, or 30 more in the background, so the run never got to a verdict. With a
// task, integration mode therefore works in slices: each call judges pages until its time budget is used up, keeps every
// page verdict on disk and prints {partial:true}; the next call of the same command goes on from there. The verdict of
// a page is not changed by this: the same self-check, the same build, the same replay and comparison, only no longer
// all in one process.
//
// $RESTORE_STATE/gate/runs/<key>/            one run: the tool commit, the rules, the hmrsfw-vue commit and the page set
//   run.json                                 {key, tools, rules, commit, branch, set, startedAt}
//   app/                                     the hmrsfw-vue worktree at `commit` (node_modules linked)
//   global.json                              app-wide zero-reference hits
//   build/<app>.json, dist/<app>/            the full `vite build` with the set's routes, and its scope ids
//   pages/<wo>/result.json                   {fp, page, staticMs} — fp: baseline, interaction script, known diffs
//   pages/<wo>/.claim                        the process judging the page right now
// $RESTORE_STATE/gate/runs/pins/<task>-a<attempt>-g<gateSeq>   the run a task's gate round works in
//
// Several integration tasks asking for the same pages (rule regressions are opened for the full passed-page set, HM-1176,
// HM-1180 …) share one run when tools, rules and page set are the same and the run started after the task was created or
// re-gated: the run's commit then already holds every page of the task, and every verdict in it is newer than the
// request. Pages are claimed one at a time, so concurrent calls split the work instead of doing it twice.
import { createHash } from "node:crypto";
import { closeSync, existsSync, mkdirSync, openSync, readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync, writeSync } from "node:fs";
import { hostname } from "node:os";
import path from "node:path";

export const DEFAULT_BUDGET_MIN = 7; // the gate agent's foreground limit is 10 min; one page can take a minute
export const SHARE_HOURS = 6;
export const KEEP_HOURS = 24;
export const CLAIM_STALE_MS = 30 * 60000;

export const hash = (v) => createHash("sha256").update(typeof v === "string" ? v : JSON.stringify(v)).digest("hex");
export const readJson = (f) => { try { return JSON.parse(readFileSync(f, "utf8")); } catch { return null; } };
export function writeJson(f, v) { mkdirSync(path.dirname(f), { recursive: true }); const tmp = `${f}.${process.pid}.tmp`; writeFileSync(tmp, JSON.stringify(v, null, 1)); renameSync(tmp, f); }

export const runsDir = (state) => path.join(state, "gate", "runs");
export const runKey = ({ tools, rules, commit, set }) => hash({ tools, rules, commit, set }).slice(0, 16);
// The page set as the build sees it: routes per app (the build adds a fallback route for each judged page).
export const setKey = (judged) => hash(judged.map((w) => [w.id, w.app, w.route ?? null, w.recordPath ?? null, w.target ?? null, w.recordVia ?? null])).slice(0, 16);

// ---- claims and locks: a file created with O_EXCL holding {pid, host, at} ----
function alive(c, now, staleMs) {
  if (!c || now - c.at > staleMs) return false;
  if (c.host !== hostname()) return true;
  try { process.kill(c.pid, 0); return true; } catch (e) { return e.code === "EPERM"; }
}
export function claimHolder(file, { now = Date.now(), staleMs = CLAIM_STALE_MS } = {}) {
  if (!existsSync(file)) return null;
  const c = readJson(file);
  if (!c) { try { return now - statSync(file).mtimeMs < 5000 ? { pid: null } : null; } catch { return null; } } // still being written
  return alive(c, now, staleMs) ? c : null;
}
export function tryClaim(file, { now = Date.now(), staleMs = CLAIM_STALE_MS } = {}) {
  mkdirSync(path.dirname(file), { recursive: true });
  for (let i = 0; i < 2; i++) {
    try { const fd = openSync(file, "wx"); writeSync(fd, JSON.stringify({ pid: process.pid, host: hostname(), at: now })); closeSync(fd); return true; } catch (e) {
      if (e.code !== "EEXIST") throw e;
      const c = readJson(file);
      if (c && c.pid === process.pid && c.host === hostname()) return true;
      if (claimHolder(file, { now, staleMs })) return false;
      rmSync(file, { force: true }); // the holder died or gave up: take it over
    }
  }
  return false;
}
export const release = (file) => { const c = readJson(file); if (c && c.pid === process.pid && c.host === hostname()) rmSync(file, { force: true }); };

// Run fn under the lock; null when the lock stays taken until `deadline` (ms timestamp).
export async function withLock(file, fn, { deadline = Infinity, pollMs = 2000 } = {}) {
  while (!tryClaim(file)) {
    if (Date.now() + pollMs > deadline) return null;
    await new Promise((r) => setTimeout(r, pollMs));
  }
  try { return { value: await fn() }; } finally { release(file); }
}

// ---- runs ----
export const pinFile = (state, name) => path.join(runsDir(state), "pins", `${String(name).replace(/[^\w.-]+/g, "_")}.json`);

// The run this call works in: the one pinned for this gate round, if tools, rules and page set are still the same; else
// the newest run with the same tools, rules and page set that started at or after notBefore (ms) and within shareHours.
export function pickRun({ state, tools, rules, set, pin, notBefore = 0, now = Date.now(), shareHours = SHARE_HOURS }) {
  const dir = runsDir(state);
  const same = (r) => r && r.tools === tools && r.rules === rules && r.set === set;
  const pinned = pin && readJson(pinFile(state, pin));
  if (pinned) { const r = readJson(path.join(dir, pinned.key, "run.json")); if (same(r)) return r; }
  const runs = (existsSync(dir) ? readdirSync(dir) : []).filter((k) => k !== "pins").map((k) => readJson(path.join(dir, k, "run.json")));
  return runs.filter((r) => same(r) && Date.parse(r.startedAt) >= notBefore && now - Date.parse(r.startedAt) <= shareHours * 3600e3)
    .sort((a, b) => (a.startedAt < b.startedAt ? 1 : a.startedAt > b.startedAt ? -1 : 0))[0] ?? null;
}

export function createRun({ state, tools, rules, set, commit, branch, now = Date.now() }) {
  const key = runKey({ tools, rules, commit, set });
  const f = path.join(runsDir(state), key, "run.json");
  const old = readJson(f);
  if (old) return old;
  const run = { key, tools, rules, set, commit, branch, startedAt: new Date(now).toISOString() };
  writeJson(f, run);
  return run;
}

export function pinRun(state, name, run) {
  const f = pinFile(state, name);
  const p = readJson(f);
  const slices = p?.key === run.key ? (p.slices ?? 0) + 1 : 1;
  writeJson(f, { key: run.key, at: new Date().toISOString(), slices });
  return slices;
}

// A page's verdict is reused only for the same baseline, interaction script and known diffs (tools, rules, commit and
// page set are the run's key).
export const pageFp = ({ baselineSha, script, known }) => hash({ baselineSha, script: script ?? null, known }).slice(0, 16);
export function pageResult(runDir, wo, fp) { const r = readJson(path.join(runDir, "pages", wo, "result.json")); return r && r.fp === fp ? r : null; }
export function savePageResult(runDir, wo, fp, page, extra = {}) { writeJson(path.join(runDir, "pages", wo, "result.json"), { fp, page, ...extra, at: new Date().toISOString() }); }

// Runs older than keepHours with nobody working in them: worktree and files go.
export function staleRuns(state, { now = Date.now(), keepHours = KEEP_HOURS } = {}) {
  const dir = runsDir(state);
  const out = [];
  for (const k of existsSync(dir) ? readdirSync(dir) : []) {
    if (k === "pins") continue;
    const r = readJson(path.join(dir, k, "run.json"));
    const started = r ? Date.parse(r.startedAt) : (() => { try { return statSync(path.join(dir, k)).mtimeMs; } catch { return now; } })();
    if (now - started <= keepHours * 3600e3) continue;
    const pages = path.join(dir, k, "pages");
    const busy = existsSync(pages) && readdirSync(pages).some((w) => claimHolder(path.join(pages, w, ".claim"), { now }));
    if (!busy) out.push(path.join(dir, k));
  }
  return out;
}
