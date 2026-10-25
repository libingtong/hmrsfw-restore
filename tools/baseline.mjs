// Original-side baseline for the gate (docs/pipeline.md §7.2, §12). Replays the ORIGINAL build (legacy-dist/<site>)
// under the page's HAR twice and stores what the gate compares against, so the gate only runs the restored side.
// Called by record-page.mjs (D) after recording; can be re-run any time (the HAR and login state are only read).
//   node tools/baseline.mjs <work order id> [--har <path>] [--publish-har <path>] [--out <dir>] [--no-coverage] [--interact-ref <commit>]
// --publish-har: --har is a staged copy (record-page.mjs, HM-1246); baseline.json names the --publish-har path, and the
// staged HAR is renamed onto it right before the baseline directory is replaced, so the page HAR and its baseline change
// together. On failure the staged file is left to the caller and the published HAR and baseline stay as they were.
// --interact-ref: take tests/interact/<id>.json from that tool-repo commit, not the working tree (gate.mjs passes the
// one its integration run reads when it refreshes a baseline; HM-914).
// Writes $RESTORE_STATE/baseline/<id>/ (or --out), replacing it atomically:
//   dom.html       page root outerHTML (run 1, first root candidate; after the script's root step if it has one,
//                  HM-1294; after the steps for a recordVia component mounted only then, HM-1293)
//                  text.txt   its innerText
//   shot.png       its screenshot (shot.<n>.png: other root candidates, *.r2.png: run 2)
//   seq.json       /xf-api/ requests: load-time set, app-shell set, post-load step sequence (bodies as SHA-256 only),
//                  pages the steps opened (target="_blank", window.open)
//   baseline.json  everything the gate reads: both runs (DOM trees, texts, overlays, requests, step results), the HAR
//                  path and SHA-256, the shell probe, `unstable`, `sel` (the root selector used: common.mjs origSelOf)
//   coverage.json  JS coverage of the page chunk (and its shared component chunks) over both runs, load and steps, with
//                  the uncovered stretches and hints for the recorder (tools/gate/coverage.mjs; --no-coverage skips it)
//   storage.json   (mode 600) localStorage changes the original app shell makes before the page mounts, applied to the
//                  restored side (which has no shell yet); same trust zone as $RESTORE_ASSETS/.auth
// Output (one JSON line): {ok, wo, steps, unstable:[...], coverage?:{page:{function,block}, shared, stable}, dir, durationMs} | {ok:false, wo, error} | {pending:"har"}
import { chromium } from "playwright";
import { chmodSync, existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { ROOT, assetsDir, authStorage, findHar, flag, interactScript, loadWorkOrder, opt, origSelOf, pageScopeId, positionals, stateDir } from "./gate/common.mjs";
import { loadHar, sha256 } from "./gate/har.mjs";
import { runPage } from "./gate/replay.mjs";
import { serveStatic } from "./gate/serve.mjs";
import { loadRules } from "./gate/rules.mjs";
import { redact, rootAfterSteps, unstableKeys } from "./gate/compare.mjs";
import { buildCoverage, summaryOf } from "./gate/coverage.mjs";
import { ensureLegacyDist } from "./lib/shared-deps.mjs";

export const BASELINE_VERSION = 1;

// Shell probe + two original runs for one work order. Used by this CLI and by the POC comparison wrappers
// (verify-confirm.mjs), which keep the result in memory instead of writing it.
export async function recordOriginal({ browser, wo, harFile, assets, shotDir, rules, coverage = false, interactRef = null }) {
  const sel = origSelOf(wo); // the component's own root for recordVia pages (HM-251)
  const har = loadHar(harFile);
  const storage = authStorage(wo, assets, har);
  const steps = await interactScript(wo.id, { ref: interactRef });
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
      const run = await runPage(browser, { origin: srv.origin, url: wo.recordPath, storage, har, sel, steps, shotDir, tag: runs.length === 0 ? "shot" : "shot.r2", coverage: coverage ? [pageChunk, ...sharedChunks] : null, pageScopes: wo.scopeIds, componentScope: wo.recordVia ? pageScopeId(wo) : null });
      run.attempt = n;
      if (run.steps?.some((s) => s.err) && n < 4 - (1 - runs.length)) continue;
      runs.push(run);
    }
    // Coverage is built per kept run and the raw V8 data (whole script sources) is dropped right away: 16 GB machine.
    const cov = coverage ? buildCoverage({ pageChunk, sharedChunks, runs: runs.map((r) => r.coverage ?? []) }) : null;
    for (const r of runs) delete r.coverage;
    const shellSet = new Set(shell.requests);
    const unstable = unstableKeys(runs[0], runs[1], { rules, site: wo.site, shell: shellSet, shellToasts: shell.toasts, inParent: !!wo.recordVia });
    const before = storage.localStorage, after = shell.storageAtMount ?? before;
    const patch = { set: Object.fromEntries(Object.entries(after).filter(([k, v]) => before[k] !== v)), remove: Object.keys(before).filter((k) => !(k in after)) };
    return { sel, shell: { requests: [...shellSet].sort(), toasts: shell.toasts ?? [], storageCaptured: !!shell.storageAtMount }, runs, unstable, steps: steps?.length ?? 0, script: steps ? sha256(JSON.stringify(steps)) : null, storagePatch: patch, coverage: cov };
  } finally { await srv.close(); }
}

// Run → what goes on disk (step request bodies reduced to SHA-256; load requests to method + path).
const slimRun = (run, dir) => ({
  settleMs: run.settleMs, errors: run.errors.slice(0, 8),
  load: { overlay: run.load.overlay, requests: [...new Set(run.load.requests.map((x) => x.method + " " + x.path))].sort(), opened: run.load.opened, candidates: run.load.candidates.map((c) => ({ cls: c.cls, tree: c.tree, ltgt: c.ltgt, text: c.text, shot: c.shot && path.basename(c.shot), canvases: c.canvases, blank: c.blank, empty: c.empty })) },
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
  const relinked = ensureLegacyDist(ROOT); // HM-1130: legacy-dist may be a link into the shared cache
  if (relinked) process.stderr.write(relinked + "\n");
  const [id] = positionals(argv, ["--har", "--publish-har", "--out", "--app", "--interact-ref"]);
  if (!id) throw new Error("usage: node tools/baseline.mjs <work order id> [--har <path>] [--out <dir>]");
  const t0 = Date.now();
  const wo = loadWorkOrder(id);
  const assets = assetsDir();
  const harFile = findHar(id, assets, opt(argv, "--har"), wo);
  if (!harFile) return { pending: "har", wo: id };
  const publish = opt(argv, "--publish-har") ? path.resolve(opt(argv, "--publish-har")) : null;
  const dest = path.resolve(opt(argv, "--out") ?? path.join(stateDir(), "baseline", id));
  const tmp = `${dest}.tmp-${process.pid}`;
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });
  const rules = loadRules();
  const browser = await chromium.launch();
  try {
    const rec = await recordOriginal({ browser, wo, harFile, assets, shotDir: tmp, rules, coverage: !flag(argv, "--no-coverage"), interactRef: opt(argv, "--interact-ref") ?? null });
    // A recordVia component its parent mounts only after the interaction has its root after the steps in every run
    // (compare.mjs rootAfterSteps, HM-1293): dom.html / text.txt are that root; any other page needs its root at load.
    // With the script's root step (HM-1294) the load root is taken after the step that opens the component instead.
    const r1 = rec.runs[0], afterSteps = !!wo.recordVia && rootAfterSteps(rec.runs);
    const c0 = afterSteps ? r1.final.candidates.find((c) => !c.empty) : r1.load.candidates[0];
    if (!c0 || c0.empty) throw new Error(`original page root (${rec.sel}) not found at ${wo.recordPath}${r1.load.afterStep !== undefined ? ` after step ${r1.load.afterStep} (the root step)` : wo.recordVia && rec.steps ? " (nor after the steps in every run)" : wo.recordVia ? `; if the component only mounts after an interaction (a modal, a later tab), mark the step that opens it with "root": true in tests/interact/${id}.json` : ""}`);
    const runs = rec.runs.map((r) => slimRun(r, tmp));
    writeFileSync(path.join(tmp, "dom.html"), c0.html);
    writeFileSync(path.join(tmp, "text.txt"), c0.text);
    writeFileSync(path.join(tmp, "seq.json"), JSON.stringify({ load: runs[0].load.requests, shell: rec.shell.requests, steps: runs[0].stepLog ?? [], opened: runs[0].opened ?? [] }, null, 1));
    writeFileSync(path.join(tmp, "baseline.json"), JSON.stringify({
      version: BASELINE_VERSION, wo: id, site: wo.site, app: wo.app, recordPath: wo.recordPath, role: wo.role, sourceChunk: wo.sourceChunk,
      har: { path: publish ?? harFile, sha256: sha256(readFileSync(harFile)) }, createdAt: new Date().toISOString(), rulesAtRecord: rules.version, sel: rec.sel, ...(wo.recordVia ? { offscopeFixed: true, offscopeAll: true } : {}), ...(afterSteps ? { rootAfterSteps: true } : {}), paintedBox: true, canvasBoxes: true,
      ...(rec.coverage ? { coverage: summaryOf(rec.coverage) } : {}),
      shell: rec.shell, steps: rec.steps, script: rec.script, unstable: rec.unstable, runs,
    }));
    if (rec.coverage) writeFileSync(path.join(tmp, "coverage.json"), JSON.stringify({ wo: id, site: wo.site, recordPath: wo.recordPath, role: wo.role, script: rec.script, steps: rec.steps, ...rec.coverage }, null, 1));
    writeFileSync(path.join(tmp, "storage.json"), JSON.stringify(rec.storagePatch), { mode: 0o600 });
    chmodSync(path.join(tmp, "storage.json"), 0o600);
    // Replace atomically: readers see either the old or the new baseline, never a half-written one. A staged HAR goes in
    // place just before it (HM-1246): the gate never sees a new HAR next to the old baseline for longer than two renames.
    const old = `${dest}.old-${process.pid}`;
    if (publish && publish !== harFile) { mkdirSync(path.dirname(publish), { recursive: true }); renameSync(harFile, publish); }
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
