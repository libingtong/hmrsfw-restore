// Original-side baseline for the gate (docs/pipeline.md §7.2, §12). Replays the ORIGINAL build (legacy-dist/<site>)
// under the page's HAR twice and stores what the gate compares against, so the gate only runs the restored side.
// Called by record-page.mjs (D) after recording; can be re-run any time (the HAR and login state are only read).
//   node tools/baseline.mjs <work order id> [--har <path>] [--out <dir>] [--no-coverage]
// Writes $RESTORE_STATE/baseline/<id>/ (or --out), replacing it atomically:
//   dom.html       page root outerHTML (run 1, first root candidate)      text.txt   its innerText
//   shot.png       its screenshot (shot.<n>.png: other root candidates, *.r2.png: run 2)
//   seq.json       /xf-api/ requests: load-time set, app-shell set, post-load step sequence (bodies as SHA-256 only),
//                  pages the steps opened (target="_blank", window.open)
//   baseline.json  everything the gate reads: both runs (DOM trees, texts, overlays, requests, step results), the HAR
//                  path and SHA-256, the shell probe, `unstable`
//   coverage.json  JS coverage of the page chunk (and its shared component chunks) over both runs, load and steps, with
//                  the uncovered stretches and hints for the recorder (tools/gate/coverage.mjs; --no-coverage skips it)
//   storage.json   (mode 600) localStorage changes the original app shell makes before the page mounts, applied to the
//                  restored side (which has no shell yet); same trust zone as $RESTORE_ASSETS/.auth
// Output (one JSON line): {ok, wo, steps, unstable:[...], coverage?:{page:{function,block}, shared, stable}, dir, durationMs} | {ok:false, wo, error} | {pending:"har"}
import { chromium } from "playwright";
import { chmodSync, existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { ROOT, SITES, assetsDir, authStorage, findHar, flag, interactScript, loadWorkOrder, opt, positionals, stateDir } from "./gate/common.mjs";
import { loadHar, sha256 } from "./gate/har.mjs";
import { runPage } from "./gate/replay.mjs";
import { serveStatic } from "./gate/serve.mjs";
import { loadRules } from "./gate/rules.mjs";
import { redact, unstableKeys } from "./gate/compare.mjs";
import { buildCoverage, summaryOf } from "./gate/coverage.mjs";

export const BASELINE_VERSION = 1;

// Shell probe + two original runs for one work order. Used by this CLI and by the POC comparison wrappers
// (verify-confirm.mjs), which keep the result in memory instead of writing it.
export async function recordOriginal({ browser, wo, harFile, assets, shotDir, rules, coverage = false }) {
  const site = SITES[wo.site];
  const har = loadHar(harFile);
  const storage = authStorage(wo, assets, har);
  const steps = await interactScript(wo.id);
  const pageChunk = path.basename(wo.sourceChunk), sharedChunks = (Array.isArray(wo.deps?.shared) ? wo.deps.shared : []).map((x) => path.basename(x)).filter((x) => x !== pageChunk);
  const srv = await serveStatic(path.join(ROOT, "legacy-dist", wo.site));
  try {
    // App-shell probe: the page chunk is replaced by an empty component, so whatever /xf-api/ requests still fire belong
    // to the shell; they are removed from both sides before comparing. It also yields the storage the page sees at mount.
    const shell = await runPage(browser, { origin: srv.origin, url: wo.recordPath, storage, har, stubChunk: path.basename(wo.sourceChunk) });
    // Two runs; a run whose interaction steps failed (a click timing out on a busy machine) is repeated, at most 4 runs
    // in all (the POC re-ran the original up to 4 times). If steps still fail they stay in the baseline as recorded.
    const runs = [];
    for (let n = 1; runs.length < 2 && n <= 4; n++) {
      const run = await runPage(browser, { origin: srv.origin, url: wo.recordPath, storage, har, sel: site.origSel, steps, shotDir, tag: runs.length === 0 ? "shot" : "shot.r2", coverage: coverage ? [pageChunk, ...sharedChunks] : null, pageScopes: wo.scopeIds });
      run.attempt = n;
      if (run.steps?.some((s) => s.err) && n < 4 - (1 - runs.length)) continue;
      runs.push(run);
    }
    // Coverage is built per kept run and the raw V8 data (whole script sources) is dropped right away: 16 GB machine.
    const cov = coverage ? buildCoverage({ pageChunk, sharedChunks, runs: runs.map((r) => r.coverage ?? []) }) : null;
    for (const r of runs) delete r.coverage;
    const shellSet = new Set(shell.requests);
    const unstable = unstableKeys(runs[0], runs[1], { rules, site: wo.site, shell: shellSet, shellToasts: shell.toasts });
    const before = storage.localStorage, after = shell.storageAtMount ?? before;
    const patch = { set: Object.fromEntries(Object.entries(after).filter(([k, v]) => before[k] !== v)), remove: Object.keys(before).filter((k) => !(k in after)) };
    return { shell: { requests: [...shellSet].sort(), toasts: shell.toasts ?? [], storageCaptured: !!shell.storageAtMount }, runs, unstable, steps: steps?.length ?? 0, script: steps ? sha256(JSON.stringify(steps)) : null, storagePatch: patch, coverage: cov };
  } finally { await srv.close(); }
}

// Run → what goes on disk (step request bodies reduced to SHA-256; load requests to method + path).
const slimRun = (run, dir) => ({
  settleMs: run.settleMs, errors: run.errors.slice(0, 8),
  load: { overlay: run.load.overlay, requests: [...new Set(run.load.requests.map((x) => x.method + " " + x.path))].sort(), opened: run.load.opened, candidates: run.load.candidates.map((c) => ({ cls: c.cls, tree: c.tree, ltgt: c.ltgt, text: c.text, shot: c.shot && path.basename(c.shot), empty: c.empty })) },
  ...(run.steps ? { steps: run.steps, stepLog: run.stepLog.map(redact), opened: run.opened, final: { overlay: run.final.overlay, candidates: run.final.candidates.map((c) => ({ cls: c.cls, tree: c.tree, ltgt: c.ltgt, text: c.text })) } } : {}),
});

// Baseline on disk → the shape compareRuns() expects (absolute screenshot paths).
export function readBaseline(dir) {
  const b = JSON.parse(readFileSync(path.join(dir, "baseline.json"), "utf8"));
  for (const run of b.runs) for (const c of run.load.candidates) if (c.shot) c.shot = path.join(dir, c.shot);
  const sf = path.join(dir, "storage.json");
  b.storagePatch = existsSync(sf) ? JSON.parse(readFileSync(sf, "utf8")) : { set: {}, remove: [] };
  return b;
}

async function main() {
  const argv = process.argv.slice(2);
  const [id] = positionals(argv, ["--har", "--out", "--app"]);
  if (!id) throw new Error("usage: node tools/baseline.mjs <work order id> [--har <path>] [--out <dir>]");
  const t0 = Date.now();
  const wo = loadWorkOrder(id);
  const assets = assetsDir();
  const harFile = findHar(id, assets, opt(argv, "--har"), wo);
  if (!harFile) return { pending: "har", wo: id };
  const dest = path.resolve(opt(argv, "--out") ?? path.join(stateDir(), "baseline", id));
  const tmp = `${dest}.tmp-${process.pid}`;
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });
  const rules = loadRules();
  const browser = await chromium.launch();
  try {
    const rec = await recordOriginal({ browser, wo, harFile, assets, shotDir: tmp, rules, coverage: !flag(argv, "--no-coverage") });
    const r1 = rec.runs[0], c0 = r1.load.candidates[0];
    if (!c0 || c0.empty) throw new Error(`original page root (${SITES[wo.site].origSel}) not found at ${wo.recordPath}`);
    const runs = rec.runs.map((r) => slimRun(r, tmp));
    writeFileSync(path.join(tmp, "dom.html"), c0.html);
    writeFileSync(path.join(tmp, "text.txt"), c0.text);
    writeFileSync(path.join(tmp, "seq.json"), JSON.stringify({ load: runs[0].load.requests, shell: rec.shell.requests, steps: runs[0].stepLog ?? [], opened: runs[0].opened ?? [] }, null, 1));
    writeFileSync(path.join(tmp, "baseline.json"), JSON.stringify({
      version: BASELINE_VERSION, wo: id, site: wo.site, app: wo.app, recordPath: wo.recordPath, role: wo.role, sourceChunk: wo.sourceChunk,
      har: { path: harFile, sha256: sha256(readFileSync(harFile)) }, createdAt: new Date().toISOString(), rulesAtRecord: rules.version,
      ...(rec.coverage ? { coverage: summaryOf(rec.coverage) } : {}),
      shell: rec.shell, steps: rec.steps, script: rec.script, unstable: rec.unstable, runs,
    }));
    if (rec.coverage) writeFileSync(path.join(tmp, "coverage.json"), JSON.stringify({ wo: id, site: wo.site, recordPath: wo.recordPath, role: wo.role, script: rec.script, steps: rec.steps, ...rec.coverage }, null, 1));
    writeFileSync(path.join(tmp, "storage.json"), JSON.stringify(rec.storagePatch), { mode: 0o600 });
    chmodSync(path.join(tmp, "storage.json"), 0o600);
    // Replace atomically: readers see either the old or the new baseline, never a half-written one.
    const old = `${dest}.old-${process.pid}`;
    if (existsSync(dest)) renameSync(dest, old);
    renameSync(tmp, dest);
    rmSync(old, { recursive: true, force: true });
    return { ok: true, wo: id, steps: rec.steps, unstable: rec.unstable, ...(rec.coverage ? { coverage: summaryOf(rec.coverage) } : {}), dir: dest, durationMs: Date.now() - t0 };
  } catch (e) {
    rmSync(tmp, { recursive: true, force: true });
    return { ok: false, wo: id, error: String(e.message).split("\n")[0].slice(0, 300), durationMs: Date.now() - t0 };
  } finally { await browser.close(); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().then((r) => { console.log(JSON.stringify(r)); process.exitCode = r.ok === false ? 1 : 0; }, (e) => { console.log(JSON.stringify({ ok: false, error: String(e.message).slice(0, 300) })); process.exitCode = 1; });
}
