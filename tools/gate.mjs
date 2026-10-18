// Restoration gate (docs/pipeline.md §7). Runs only the restored side and compares it with the original baseline
// recorded by baseline.mjs. Fast checks first, stop at the first failing stage:
//   static  — self-check.mjs (anything but a clean pass fails) + zero-reference check (page files only in page mode)
//   build   — page mode: the page compiled on demand by Vite with production semantics (tools/gate/appserver.mjs);
//             integration mode: a full `vite build` of the app
//   browser — HAR replay of the restored page in one shared browser, compared with the baseline
//
//   node tools/gate.mjs --task <id> --branch <b> --mode page|integration [--app <hmrsfw-vue checkout>] [--dry-run]
//   node tools/gate.mjs --wo <id>[,<id>…] [--attempt N] --mode page|integration --dry-run        (no task: tests)
//   node tools/gate.mjs --regress [--wo …] [--dry-run]     integration mode over every page that has a baseline (or the
//                                                            listed ones); prints newly passing / newly failing pages
// Options: --build ondemand|full (page mode; full = single-page `vite build`, for consistency checks)
//          --from build (with --dry-run only): diagnostic, keep going after static failures
//          --registry <file> (default registry/<app>.json), --keep (keep the gate dir even when passing)
//          --fast-lane (implied by task metadata fastLane: true): the branch is shared by many page orders (HM-526)
// Output: one JSON line on stdout:
//   {pass, failed:[{check, where, hint, wo?}], stage, diff, shimmed:[…], durationMs, stages:{static, build, browser},
//    pages:[{wo, pass, stage, failed, pixel}], mode, attempt}
//   {pending:"record", missing:[…]}      no (or a stale) baseline: the page must be recorded first
//   {error:"…"}                           the gate itself could not run (environment, port, browser …)
// With --task and without --dry-run the result is also written to task metadata gate.<attempt> and posted as one
// "[GATE] …" comment. Everything the run produces lives in $RESTORE_STATE/gate/<work order>-a<attempt>/; HAR files and
// baselines are only read; nothing is appended to shared files.
import "./gate/prod-env.mjs";
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, symlinkSync, writeFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { appDir as resolveAppDir } from "./app-dir.mjs";
import { gitExclude } from "./lib/git-exclude.mjs";
import { REST_SEL, ROOT, SITES, assetsDir, authStorage, flag, interactScript, loadWorkOrder, missingCryptoEnv, opt, origSelOf, scopeRootSel, stateDir } from "./gate/common.mjs";
import { loadHar, sha256 } from "./gate/har.mjs";
import { runPage } from "./gate/replay.mjs";
import { compareRuns } from "./gate/compare.mjs";
import { loadKnownDiffs, loadRules } from "./gate/rules.mjs";
import { staticStage, pageFiles } from "./gate/static.mjs";
import { buildApp, realpathOr, scopeIdPlugin, startOnDemand } from "./gate/appserver.mjs";
import { serveStatic } from "./gate/serve.mjs";
import { createShimmer, loadRegistry, reservedShared, shimPlugin, ShimError } from "./gate/shim.mjs";
import { readBaseline } from "./baseline.mjs";
import { decodeAll } from "./lib/multica.mjs";

const MULTICA = process.env.MULTICA_BIN || "multica";
const rel = (p) => path.relative(ROOT, p);

function multica(args) { return execFileSync(MULTICA, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }); }

function taskMeta(task) {
  const issue = JSON.parse(multica(["issue", "get", task, "--output", "json"]));
  return decodeAll(issue.metadata); // the server keeps arrays/objects as JSON strings (workOrders, history, …)
}

// Baseline present and still matching the HAR and interaction script it was recorded with?
async function baselineFor(wo, state) {
  const dir = path.join(state, "baseline", wo.id);
  if (!existsSync(path.join(dir, "baseline.json"))) return { missing: "no baseline" };
  const b = readBaseline(dir);
  if (!existsSync(b.har.path)) return { missing: "HAR gone" };
  if (sha256(readFileSync(b.har.path)) !== b.har.sha256) return { missing: "HAR changed since the baseline" };
  const script = await interactScript(wo.id);
  if ((script ? sha256(JSON.stringify(script)) : null) !== (b.script ?? null)) return { missing: "interaction script changed since the baseline" };
  // Same HAR and script, only the root selector changed (baselines from before HM-251 took a recordVia page's root with
  // `origSel`, i.e. the parent page's): recomputed from the same HAR, offline, see refreshBaseline().
  if ((b.sel ?? SITES[wo.site].origSel) !== origSelOf(wo)) return { missing: "root selector changed since the baseline", refresh: b.har.path };
  return { baseline: b, dir };
}

// Re-runs baseline.mjs for one order with the HAR its baseline was recorded with (legacy-dist replayed under that HAR,
// nothing goes to the test environment). Dry runs write into their own directory, never over the shared baseline.
function refreshBaseline(wo, har, state, dry) {
  const out = dry ? path.join(state, "gate", `baseline-dry${process.pid}`, wo.id) : path.join(state, "baseline", wo.id);
  let r;
  try { r = JSON.parse(execFileSync(process.execPath, [path.join(ROOT, "tools/baseline.mjs"), wo.id, "--har", har, "--out", out], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], timeout: 15 * 60000 }).trim().split("\n").pop()); } catch (e) { r = { ok: false, error: String(e.stdout || e.message).trim().split("\n").pop().slice(0, 200) }; }
  return r.ok ? { baseline: readBaseline(out), dir: out } : { missing: `baseline refresh failed: ${r.error ?? "?"}` };
}

// --branch: a private worktree of the hmrsfw-vue checkout at origin/<branch>, inside the gate dir.
function checkoutBranch(baseApp, branch, gateDir) {
  const wt = path.join(gateDir, "app");
  for (let i = 1; ; i++) { // GitHub connections occasionally drop: three tries, then it is the gate's own error
    try { execFileSync("git", ["-C", baseApp, "fetch", "-q", "origin", `+refs/heads/${branch}:refs/remotes/origin/${branch}`], { stdio: "ignore", timeout: 120000 }); break; } catch (e) {
      if (i >= 3) throw new Error(`git fetch of ${branch} failed 3 times`);
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5000 * i);
    }
  }
  rmSync(wt, { recursive: true, force: true });
  execFileSync("git", ["-C", baseApp, "worktree", "add", "-q", "--detach", wt, `origin/${branch}`], { stdio: "ignore" });
  symlinkSync(realpathSync(path.join(baseApp, "node_modules")), path.join(wt, "node_modules"));
  // the link is not ignored by `node_modules/` (directories only): rule 4 of check-imports would see an untracked
  // `node_modules` that is no order's change (HM-526)
  gitExclude(wt, "node_modules", "tools/gate.mjs: the --branch worktree links node_modules");
  return { dir: wt, sha: execFileSync("git", ["-C", wt, "rev-parse", "HEAD"], { encoding: "utf8" }).trim(), cleanup: () => { try { execFileSync("git", ["-C", baseApp, "worktree", "remove", "--force", wt], { stdio: "ignore" }); } catch {} } };
}

function restStorage(wo, assets, patch, har) {
  const st = authStorage(wo, assets, har);
  for (const k of patch.remove ?? []) delete st.localStorage[k];
  Object.assign(st.localStorage, patch.set ?? {});
  return st;
}

export async function gate(argv) {
  const t0 = Date.now();
  const dry = flag(argv, "--dry-run");
  const regress = flag(argv, "--regress");
  // Diagnostic only: run build + browser even when the static stage fails (comparing with older acceptance results).
  const skipStatic = opt(argv, "--from") === "build";
  if (skipStatic && !dry) throw new Error("--from build is a diagnostic option and needs --dry-run");
  const task = opt(argv, "--task");
  const meta = task ? taskMeta(task) : {};
  const mode = regress ? "integration" : opt(argv, "--mode", "page");
  if (!["page", "integration"].includes(mode)) throw new Error("--mode must be page or integration");
  const buildKind = opt(argv, "--build", mode === "page" ? "ondemand" : "full");
  const attempt = Number(opt(argv, "--attempt", meta.attempt ?? 1));
  const branch = opt(argv, "--branch", meta.branch);
  const state = stateDir();
  const assets = assetsDir();
  let ids = (opt(argv, "--wo") ?? "").split(",").filter(Boolean);
  if (!ids.length && meta.workOrders) ids = meta.workOrders;
  if (!ids.length && regress) { const { readdirSync } = await import("node:fs"); ids = existsSync(path.join(state, "baseline")) ? readdirSync(path.join(state, "baseline")).filter((d) => existsSync(path.join(state, "baseline", d, "baseline.json"))).sort() : []; }
  if (!ids.length) throw new Error("no work orders: pass --task (metadata workOrders) or --wo");
  const wos = ids.map(loadWorkOrder);

  // Baselines first: without one there is nothing to compare against.
  const bases = {}, missing = [];
  for (const wo of wos) { let b = await baselineFor(wo, state); if (b.refresh) b = refreshBaseline(wo, b.refresh, state, dry); if (b.missing) missing.push({ wo: wo.id, why: b.missing }); else bases[wo.id] = b.baseline; }
  if (missing.length && !regress) return { pending: "record", missing, attempt, durationMs: Date.now() - t0 };
  const judged = wos.filter((w) => bases[w.id]);

  const runId = regress ? `regress-${new Date().toISOString().replace(/[:.]/g, "-")}-${process.pid}` : mode === "integration" ? `integration-${ids[0]}-a${attempt}` : `${ids[0]}-a${attempt}`;
  const gateDir = path.join(state, "gate", runId + (dry && !regress ? `-dry${process.pid}` : ""));
  rmSync(gateDir, { recursive: true, force: true });
  mkdirSync(gateDir, { recursive: true });
  const stages = {};
  const out = { pass: false, failed: [], stage: null, diff: gateDir, shimmed: [], durationMs: 0, stages, pages: [], mode, attempt, build: buildKind };
  let app = null, closers = [];
  try {
    const baseApp = resolveAppDir(argv);
    if (branch && !flag(argv, "--no-checkout")) { app = checkoutBranch(baseApp, branch, gateDir); closers.push(app.cleanup); out.commit = app.sha; }
    const appDir = app?.dir ?? baseApp;
    // Fast-lane pages (HM-48) share one branch, `restore/fast-lane`, and their fixes land on it directly: rule 4 of
    // check-imports attributes each commit to the page whose files it touches instead of charging this page with all of them
    // (HM-526). Inherited by the self-check child processes.
    if (app && (flag(argv, "--fast-lane") || [true, "true"].includes(meta.fastLane))) process.env.HMRSFW_SHARED_BRANCH = "1";
    const noKeys = missingCryptoEnv(appDir);
    if (noKeys.length) throw new Error(`crypto keys missing for the restored app: ${noKeys.join(", ")} (set them in the gate's environment; docs/gate.md)`);
    const rules = loadRules();
    out.rules = rules.version;

    // ── static ──
    const st = await staticStage({ wos: judged, appDir, mode });
    stages.static = st.ms;
    const pageFail = {};
    for (const wo of judged) pageFail[wo.id] = [...(st.failed[wo.id] ?? [])];
    if (st.global.length) out.failed.push(...st.global);
    const staticBad = judged.filter((w) => pageFail[w.id].length);
    // Integration mode keeps going after app-wide zero-reference hits (each carries its layer and owning order): the
    // pages are still judged, so a failing page and a library file that still points into the archive are told apart.
    if (!regress && !skipStatic && mode === "page" && (staticBad.length || st.global.length)) {
      out.stage = "static";
      out.pages = judged.map((w) => ({ wo: w.id, pass: false, stage: pageFail[w.id].length ? "static" : null, failed: pageFail[w.id] }));
      out.failed.push(...staticBad.flatMap((w) => pageFail[w.id].map((f) => ({ ...f, wo: w.id }))));
      return out;
    }

    // ── build ──
    const tb = Date.now();
    const apps = [...new Set(judged.map((w) => w.app))];
    const servers = {};
    // A recordVia page is mounted inside its parent's restored page (common.mjs scopeRootSel): the parent passes the
    // props, the restored component is found by its compiled scope id (scopeIdPlugin).
    const mountOf = {};
    const buildFail = {};
    for (const w of judged.filter((x) => x.target)) {
      const p = w.recordVia ? loadWorkOrder(w.recordVia) : null;
      mountOf[w.id] = path.join(appDir, p ? p.target ?? "" : w.target);
      if (p && !(p.target && existsSync(mountOf[w.id]))) buildFail[w.id] = [{ check: "build", where: w.recordVia, hint: `parent page ${w.recordVia} (recordVia) has no restored file on this branch (${p.target})` }];
    }
    const routesOf = (a) => judged.filter((w) => w.app === a && w.target && !buildFail[w.id]).map((w) => ({ route: w.route, recordPath: w.recordPath, file: mountOf[w.id] }));
    const scopeIds = new Map();
    for (const a of apps) {
      const site = Object.keys(SITES).find((s) => SITES[s].app === a);
      const registry = mode === "page" ? loadRegistry(a, opt(argv, "--registry")) : null;
      const used = new Set();
      const shimDir = path.join(gateDir, "shims", a);
      const plugins = [scopeIdPlugin(scopeIds), ...(registry && reservedShared(registry).length ? [shimPlugin({ app: a, appDir, registry, shimDir, used, shimmer: createShimmer({ site, registry, outDir: shimDir }) })] : [])];
      try {
        if (mode === "page" && buildKind === "ondemand") {
          const srv = await startOnDemand({ appDir, app: a, gateDir, stateRoot: state, routes: routesOf(a), plugins, allow: [path.join(ROOT, "legacy-dist")] });
          closers.push(() => srv.close());
          for (const w of judged.filter((x) => x.app === a && !buildFail[x.id])) {
            const errs = await srv.precompile([...pageFiles(w, appDir), ...(w.recordVia ? [mountOf[w.id]] : [])].filter((f) => /\.(vue|ts|js)$/.test(f)));
            if (errs.length) buildFail[w.id] = errs.map((e) => ({ check: /\[shim\]|ShimError|registry/.test(e.error) ? "shim" : "compile", where: e.file, hint: e.error }));
          }
          servers[a] = srv;
        } else {
          const b = await buildApp({ appDir, app: a, gateDir, routes: routesOf(a), singlePage: mode === "page", plugins });
          const srv = await serveStatic(mode === "page" ? [b.outDir, b.publicDir] : [b.outDir]);
          closers.push(srv.close);
          servers[a] = srv;
        }
      } catch (e) {
        const msg = String(e.message).split("\n")[0].slice(0, 240);
        for (const w of judged.filter((x) => x.app === a)) buildFail[w.id] = [{ check: e instanceof ShimError ? "shim" : "build", where: a, hint: msg }];
      }
      out.shimmed.push(...used);
      servers[a] && (servers[a].used = used);
    }
    stages.build = Date.now() - tb;
    for (const [id, f] of Object.entries(buildFail)) pageFail[id].push(...f);
    if (!regress && Object.keys(buildFail).length) {
      out.stage = "build";
      out.pages = judged.map((w) => ({ wo: w.id, pass: false, stage: buildFail[w.id] ? "build" : null, failed: buildFail[w.id] ?? [] }));
      out.failed.push(...Object.entries(buildFail).flatMap(([id, f]) => f.map((x) => ({ ...x, wo: id }))));
      return out;
    }

    // ── browser ──
    const tw = Date.now();
    const browser = await chromium.launch();
    closers.push(() => browser.close());
    stages.browserLaunch = Date.now() - tw;
    for (const wo of judged) {
      if (pageFail[wo.id].length && !(skipStatic && !buildFail[wo.id])) { out.pages.push({ wo: wo.id, pass: false, stage: buildFail[wo.id] ? "build" : "static", failed: pageFail[wo.id] }); continue; }
      const base = bases[wo.id];
      const dir = path.join(gateDir, wo.id);
      mkdirSync(dir, { recursive: true });
      const steps = await interactScript(wo.id);
      const known = loadKnownDiffs(wo.id, { state, site: wo.site });
      const har = loadHar(base.har.path);
      const restSid = wo.recordVia ? scopeIds.get(realpathOr(path.join(appDir, wo.target))) : null;
      if (wo.recordVia && !restSid) { out.pages.push({ wo: wo.id, pass: false, stage: "browser", failed: [{ check: "root", where: "load", hint: `restored ${wo.target} has no scope id (no <style scoped>): it cannot be found inside the parent page ${wo.recordVia}` }] }); continue; }
      const restSel = restSid ? scopeRootSel(restSid) : REST_SEL;
      const once = async (tag) => {
        const rest = await runPage(browser, { origin: servers[wo.app].origin, url: wo.recordPath, storage: restStorage(wo, assets, base.storagePatch, har), har, sel: restSel, steps, shotDir: dir, tag });
        return { rest, cmp: compareRuns(base, rest, { rules, site: wo.site, known: known.list, shotOut: path.join(dir, `${tag}.diff.png`), restSel, inParent: !!restSid }) };
      };
      // A failing restored run is repeated once (busy machine: animations, toasts and timers land differently); the
      // first run's failures stay in the local report.
      let { rest, cmp } = await once("rest");
      let firstFailed = null;
      if (cmp.failed.length) { firstFailed = cmp.failed; ({ rest, cmp } = await once("rest.retry")); }
      const pass = cmp.failed.length === 0;
      // Local report with the full projections (page text included): stays in $RESTORE_STATE, never in metadata.
      writeFileSync(path.join(dir, "report.json"), JSON.stringify({ wo: wo.id, pass, failed: cmp.failed, firstFailed, pixel: cmp.pixel, knownUsed: cmp.knownUsed, waived: cmp.waived, knownUnusable: known.unusable, unstable: base.unstable, settleMs: rest.settleMs, errors: rest.errors, restRequests: [...(rest.load?.requests ?? []), ...(rest.stepLog ?? [])].map((x) => `${x.phase} ${x.method} ${x.path} ${x.tier}`), restOpened: [...(rest.load?.opened ?? []), ...(rest.opened ?? [])].map((x) => `${x.phase} ${x.target.split("?")[0]}`), restOtherRequests: (rest.otherRequests ?? []).map((x) => `${x.phase} ${x.method} ${x.path}`), orig: cmp.projections.orig.map(strip), rest: strip(cmp.projections.rest) }, null, 1));
      out.pages.push({ wo: wo.id, pass, stage: pass ? null : "browser", failed: cmp.failed, pixel: cmp.pixel, ...(firstFailed ? { retried: true } : {}), ...(cmp.knownUsed.length ? { knownDiffs: cmp.knownUsed } : {}), ...(known.unusable.length ? { knownUnusable: known.unusable } : {}), ...(base.unstable?.length ? { unstable: base.unstable } : {}), ms: rest.totalMs, ...(skipStatic && pageFail[wo.id].length ? { staticFailed: pageFail[wo.id].map((f) => `${f.check} ${f.hint}`) } : {}) });
    }
    stages.browser = Date.now() - tw;
    for (const a of apps) if (servers[a]?.publishDeps && out.pages.every((p) => p.stage !== "build")) out.depsCachePublished = servers[a].publishDeps() || undefined;
    out.failed.push(...out.pages.filter((p) => !p.pass).flatMap((p) => p.failed.map((f) => ({ ...f, wo: p.wo }))));
    out.stage = out.pages.some((p) => p.stage === "static") || (st.global.length && out.pages.every((p) => p.pass)) ? "static" : out.pages.some((p) => p.stage === "build") ? "build" : "browser";
    if (st.global.length) out.global = summarizeGlobal(st.global);
    out.pass = out.failed.length === 0 && out.pages.length === wos.length;
    if (missing.length) out.pending = missing;
    return out;
  } finally {
    for (const c of closers.reverse()) await c();
    out.durationMs = Date.now() - t0;
    if (regress) Object.assign(out, regressDiff(out, state, dry));
    if (out.pass && !flag(argv, "--keep") && !dry) rmSync(path.join(gateDir, "vite"), { recursive: true, force: true });
  }
}
const strip = (p) => Object.fromEntries(Object.entries(p).filter(([k]) => k !== "shot"));

// App-wide failures (integration mode) by layer and owning order: {total, byLayer:{layer: n}, byOwner:{order: n}}.
function summarizeGlobal(items) {
  const byLayer = {}, byOwner = {};
  for (const f of items) { byLayer[f.layer ?? "shell"] = (byLayer[f.layer ?? "shell"] ?? 0) + 1; if (f.owner) byOwner[f.owner] = (byOwner[f.owner] ?? 0) + 1; }
  return { total: items.length, byLayer, byOwner };
}

// --regress: compare with the previous regression result ($RESTORE_STATE/gate/regress-last.json, replaced atomically).
function regressDiff(out, state, dry) {
  const f = path.join(state, "gate", "regress-last.json");
  const prev = existsSync(f) ? JSON.parse(readFileSync(f, "utf8")).pages ?? {} : {};
  const now = Object.fromEntries(out.pages.map((p) => [p.wo, p.pass]));
  const newPass = Object.keys(now).filter((k) => now[k] && prev[k] !== true).sort();
  const newFail = Object.keys(now).filter((k) => !now[k] && prev[k] !== false).sort();
  if (!dry) { const tmp = `${f}.tmp-${process.pid}`; writeFileSync(tmp, JSON.stringify({ at: new Date().toISOString(), pages: now })); renameSync(tmp, f); }
  return { regress: { total: out.pages.length, passed: out.pages.filter((p) => p.pass).length, newPass, newFail, previous: Object.keys(prev).length } };
}

// Task metadata values are capped at 8 KB by the server; stay well under it.
export const META_BUDGET = 7000;
const bytes = (v) => Buffer.byteLength(JSON.stringify(v));
const clip = (s, n) => String(s ?? "").slice(0, n);

// What goes into gate.<attempt>: the fields tick.mjs advance reads (pass, pending, missing, error, stage, failed, pages
// [{wo, pass, stage}], global), shrunk until they fit META_BUDGET. Every page keeps an entry — advance reads a page
// without one as failed — passing pages shrink to {wo, pass}, then to a count (passedOmitted). The full result is in the
// file named by `detail`.
export function slimResult(out, detail) {
  if (out.pending === "record") {
    const ids = out.missing.map((m) => m.wo), byReason = {};
    for (const m of out.missing) byReason[m.why] = (byReason[m.why] ?? 0) + 1;
    const slim = { pending: "record", missingTotal: ids.length, byReason, missing: ids, attempt: out.attempt, durationMs: out.durationMs, detail };
    while (bytes(slim) > META_BUDGET && slim.missing.length) slim.missing = ids.slice(0, Math.floor(slim.missing.length / 2));
    if (slim.missing.length < ids.length) slim.missingTruncated = true;
    return slim;
  }
  // page-level failures first: hundreds of app-wide zero-reference hits must not push them out of the ones kept
  const failed = out.failed ?? [];
  const ordered = [...failed.filter((f) => f.wo), ...failed.filter((f) => !f.wo)];
  const pendingIds = Array.isArray(out.pending) ? out.pending.map((m) => m.wo ?? m) : undefined; // --regress: pages without a baseline
  const levels = [
    { failed: 30, hint: 200, page: (p) => ({ wo: p.wo, pass: p.pass, stage: p.stage, pixel: p.pixel }) },
    { failed: 10, hint: 120, page: (p) => (p.pass ? { wo: p.wo, pass: true } : { wo: p.wo, pass: false, stage: p.stage }) },
    { failed: 3, hint: 80, page: (p) => (p.pass ? { wo: p.wo, pass: true } : { wo: p.wo, pass: false, stage: p.stage }), drop: ["shimmed", "regress", "stages"] },
  ];
  let slim;
  for (const lv of levels) {
    slim = { ...out, failed: ordered.slice(0, lv.failed).map((f) => ({ ...f, hint: clip(f.hint, lv.hint) })), pages: (out.pages ?? []).map(lv.page), detail };
    if (pendingIds) slim.pending = pendingIds;
    if (ordered.length > lv.failed) slim.failedTotal = ordered.length;
    for (const k of lv.drop ?? []) delete slim[k];
    if (bytes(slim) <= META_BUDGET) return slim;
  }
  // Hundreds of pages: list the failing pages only and count the passing ones (advance reads an unlisted page as passed
  // when passedOmitted is set). Failing pages that still do not fit are cut, without passedOmitted: every unlisted page
  // then reads as failed — a wider regression set, never a page wrongly passed.
  const bad = (out.pages ?? []).filter((p) => !p.pass).map((p) => ({ wo: p.wo, pass: false, stage: p.stage }));
  slim.pages = bad;
  slim.passedOmitted = (out.pages ?? []).length - bad.length;
  if (bytes(slim) <= META_BUDGET) return slim;
  delete slim.passedOmitted;
  slim.failedPagesTotal = bad.length;
  slim.pagesTruncated = true;
  while (bytes(slim) > META_BUDGET && slim.pages.length) slim.pages = bad.slice(0, Math.floor(slim.pages.length / 2));
  return slim;
}

// "[GATE] …" title: every id for a few pages, a count and the first ones for many.
export function idList(ids, show = 5) { return ids.length <= show ? ids.join(",") : `${ids.length} 页（${ids.slice(0, 3).join(",")} 等）`; }

// Metadata gate.<attempt> + one [GATE] comment (no page text, only checks, element paths and API paths).
export function report(task, attempt, out, ids) {
  const failed = out.failed ?? []; // {pending: "record"} carries no failed list
  const ordered = [...failed.filter((f) => f.wo), ...failed.filter((f) => !f.wo)];
  // the full result stays in $RESTORE_STATE (with the gate's other output), metadata only names the file
  let detail;
  try {
    detail = path.join(out.diff ?? path.join(stateDir(), "gate"), out.diff ? "result.json" : `pending-${task}-a${attempt}.json`);
    mkdirSync(path.dirname(detail), { recursive: true });
    writeFileSync(detail, JSON.stringify(out, null, 1));
  } catch (e) { process.stderr.write("result file write failed: " + e.message + "\n"); detail = undefined; }
  const slim = slimResult(out, detail);
  try { multica(["issue", "metadata", "set", task, "--key", `gate.${attempt}`, "--value", JSON.stringify(slim)]); } catch (e) { process.stderr.write("metadata write failed: " + e.message + "\n"); }
  const secs = (ms) => (ms / 1000).toFixed(1) + "s";
  const head = out.pending === "record" ? `[GATE] PENDING record ${idList(ids)} a${attempt}: ${Object.entries(slim.byReason).map(([why, n]) => `${why} ×${n}`).join("; ")}` : `[GATE] ${out.pass ? "PASS" : "FAIL"} ${idList(ids)} a${attempt} ${out.mode} — ${secs(out.durationMs)} (static ${secs(out.stages.static ?? 0)}, build ${secs(out.stages.build ?? 0)}, browser ${secs(out.stages.browser ?? 0)})`;
  const lines = [head];
  if (out.pages?.length > 5) lines.push(`- pages: ${out.pages.filter((p) => p.pass).length}/${out.pages.length} passed${out.pass ? "" : `; failed: ${idList(out.pages.filter((p) => !p.pass).map((p) => p.wo), 10)}`}`);
  if (out.global) lines.push(`- app-wide: ${out.global.total} (${Object.entries(out.global.byLayer).map(([k, n]) => `${k} ${n}`).join(", ")})`);
  if (!out.pass && out.failed?.length) lines.push(...ordered.slice(0, 5).map((f) => `- ${f.wo ? f.wo + " " : ""}${f.where} ${f.check}: ${clip(f.hint, 160)}`));
  if (out.shimmed?.length) lines.push(`- shimmed: ${out.shimmed.join("; ")}`);
  if (detail) lines.push(`- detail: \`${path.basename(path.dirname(detail))}/${path.basename(detail)}\``);
  // multica only accepts --content-file inside the caller's working directory: the gate agent's cwd, not $RESTORE_STATE
  const file = path.join(process.cwd(), `.gate-comment-${process.pid}.md`);
  try { writeFileSync(file, lines.join("\n") + "\n"); multica(["issue", "comment", "add", task, "--content-file", file, "--output", "table"]); } catch (e) { process.stderr.write("comment failed: " + e.message + "\n"); } finally { rmSync(file, { force: true }); }
  return { slim, file, detail };
}

// CLI. Results and {pending} go to metadata + one [GATE] comment when --task is given without --dry-run; {error} is
// only printed: the gate agent comments "[GATE] ERROR …" itself (docs/pipeline.md §7), so it is never posted twice.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const argv = process.argv.slice(2);
  let printed = false;
  // Every run ends with one JSON line: if the event loop drains while a step is still pending (it happened inside Vite's
  // dependency optimizer), that is the gate's own error, not a silent exit 0.
  process.on("beforeExit", () => {
    if (printed) return;
    printed = true;
    console.log(JSON.stringify({ error: "gate ended without a result (a pending step never settled)" }));
    process.exitCode = 2;
  });
  gate(argv).then((r) => {
    printed = true;
    console.log(JSON.stringify(r));
    const task = opt(argv, "--task");
    if (task && !flag(argv, "--dry-run")) report(task, r.attempt ?? Number(opt(argv, "--attempt", 1)), r, r.pages?.map((p) => p.wo) ?? r.missing?.map((m) => m.wo) ?? []);
    process.exitCode = r.pending ? 0 : r.pass ? 0 : 1;
  }, (e) => {
    printed = true;
    console.log(JSON.stringify({ error: String(e.message).split("\n")[0].slice(0, 300) }));
    process.exitCode = 2;
  }).finally(() => setTimeout(() => process.exit(), 3000).unref()); // left-over Vite / esbuild handles must not keep it alive
}
