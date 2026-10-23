// Restoration gate (docs/pipeline.md §7). Runs only the restored side and compares it with the original baseline
// recorded by baseline.mjs. Fast checks first, stop at the first failing stage:
//   static  — self-check.mjs (anything but a clean pass fails) + zero-reference check (page files only in page mode)
//   build   — page mode: the page compiled on demand by Vite with production semantics (tools/gate/appserver.mjs);
//             integration mode: a full `vite build` of the app
//   browser — HAR replay of the restored page in one shared browser, compared with the baseline
// Upgrade mode (public-library upgrade orders, HM-990; a task of kind upgrade always runs in it): the branch is judged as
// a public-library change, not as the pages it unblocks (metadata workOrders — those are judged by their own gates once
// resumed):
//   static  — scope: the files the branch changed against integration, by tools/lib/upgrade-scope.mjs (the rule the
//             scheduler's merge applies: public/**, package.json, lock files, library files allowed, views/** never);
//             then compile, zero-reference and secrets on those files (self-check.mjs selfCheckFiles)
//   build   — a full `vite build` of every app the change can reach
//   browser — integration-mode replay of the pages already restored on the branch that depend on a changed file (queue
//             deps, the scheduler's lib-regression set); any failure fails the upgrade
//
//   node tools/gate.mjs --task <id> --branch <b> --mode page|integration|upgrade [--app <hmrsfw-vue checkout>] [--dry-run]
//   node tools/gate.mjs --wo <id>[,<id>…] [--attempt N] --mode page|integration --dry-run        (no task: tests)
//   node tools/gate.mjs --regress [--wo …] [--dry-run]     integration mode over every page that has a baseline (or the
//                                                            listed ones); prints newly passing / newly failing pages
// Options: --build ondemand|full (page mode; full = single-page `vite build`, for consistency checks)
//          --from build (with --dry-run only): diagnostic, keep going after static failures
//          --registry <file> (default registry/<app>.json), --keep (keep the gate dir even when passing)
//          --fast-lane (implied by task metadata fastLane: true): the branch is shared by many page orders (HM-526)
//          --interact-ref <commit>|worktree: where tests/interact comes from (interactRef; default in every mode: a fresh
//            origin/integration of the tool repo, HM-914 / HM-1132; worktree: this checkout's working tree)
// Output: one JSON line on stdout:
//   {pass, failed:[{check, where, hint, wo?}], stage, diff, shimmed:[…], durationMs, stages:{static, build, browser},
//    pages:[{wo, pass, stage, failed, pixel}], mode, attempt}
//   {pending:"record", missing:[…]}      no (or a stale) baseline: the page must be recorded first
//   {partial:true, done, total, run, next} integration mode with a task (or --resume), exit 3: the --budget minutes
//                                         (default 7) are used up; run the same command again to go on (HM-1270,
//                                         tools/gate/runs.mjs; --no-resume runs all pages in one process as before)
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
import { INTERACT_BRANCH, REST_SEL, ROOT, SITES, assetsDir, authStorage, flag, interactScript, loadWorkOrder, missingCryptoEnv, opt, origSelOf, scopeRootSel, stateDir } from "./gate/common.mjs";
import { loadHar, sha256 } from "./gate/har.mjs";
import { VIEWPORT, runPage } from "./gate/replay.mjs";
import { compareRuns } from "./gate/compare.mjs";
import { loadKnownDiffs, loadRules } from "./gate/rules.mjs";
import { pageFiles, selfCheck, staticStage } from "./gate/static.mjs";
import { buildApp, realpathOr, scopeIdPlugin, startOnDemand } from "./gate/appserver.mjs";
import { serveStatic } from "./gate/serve.mjs";
import { createShimmer, loadRegistry, reservedShared, shimPlugin, ShimError } from "./gate/shim.mjs";
import { readBaseline } from "./baseline.mjs";
import { decodeAll } from "./lib/multica.mjs";
import { scopeViolations, registryOwnerOf } from "./lib/upgrade-scope.mjs";
import { isPage, loadWorkOrders, reverseDeps } from "./lib/workorders.mjs";
import { changedFiles } from "./check-imports.mjs";
import { selfCheckFiles } from "./self-check.mjs";
import { ensureLegacyDist } from "./lib/shared-deps.mjs";
import { DEFAULT_BUDGET_MIN, createRun, hash, pageFp, pageResult, pickRun, pinRun, readJson, release, runsDir, savePageResult, setKey, staleRuns, tryClaim, claimHolder, withLock, writeJson } from "./gate/runs.mjs";

const MULTICA = process.env.MULTICA_BIN || "multica";
const rel = (p) => path.relative(ROOT, p);

function multica(args) { return execFileSync(MULTICA, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }); }

function taskInfo(task) {
  const issue = JSON.parse(multica(["issue", "get", task, "--output", "json"]));
  return { meta: decodeAll(issue.metadata), createdAt: issue.created_at }; // the server keeps arrays/objects as JSON strings (workOrders, history, …)
}

// Where the interaction scripts come from (HM-914). record-page.mjs commits them to the tool repo's `integration` branch
// and the baselines were recorded with those; main and restore/fast-lane, where the gate's tools come from, carry only
// the 8 POC scripts, so an integration run that read its own checkout saw "interaction script changed" on almost every
// page. Integration mode therefore takes tests/interact from a fresh origin/integration, pinned to one commit for the
// whole run (the hash check, the steps replayed and a refreshed baseline read the same scripts). Page mode does the same
// since HM-1132: after the fast lane retired (HM-1068) page gates run from main too and every recorded page came back
// "interaction script changed", so the recorder and the gate looped. --interact-ref names another commit, `worktree`
// keeps the checkout's files. null = working tree.
export function interactRef(argv, { root = ROOT, remote = "origin" } = {}) {
  const want = opt(argv, "--interact-ref", `${remote}/${INTERACT_BRANCH}`);
  if (want === "worktree") return null;
  const git = (args) => execFileSync("git", ["-C", root, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], timeout: 120000 }).trim();
  if (want !== `${remote}/${INTERACT_BRANCH}`) { try { return git(["rev-parse", "--verify", "--quiet", `${want}^{commit}`]); } catch { throw new Error(`--interact-ref ${want}: no such commit in the tool repo`); } }
  const tmp = `refs/gate-interact/${process.pid}-${Date.now()}`; // a private ref: concurrent gates never share one
  for (let i = 1; ; i++) { // same retries as checkoutBranch, then it is the gate's own error
    try { git(["fetch", "-q", "--no-write-fetch-head", remote, `+refs/heads/${INTERACT_BRANCH}:${tmp}`]); break; } catch (e) {
      if (i >= 3) throw new Error(`git fetch of the tool repo's ${INTERACT_BRANCH} branch (interaction scripts) failed 3 times`);
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5000 * i);
    }
  }
  try { return git(["rev-parse", `${tmp}^{commit}`]); } finally { try { git(["update-ref", "-d", tmp]); } catch {} }
}

// Baseline present and still matching the HAR and interaction script it was recorded with?
export async function baselineFor(wo, state, { interact = null } = {}) {
  const dir = path.join(state, "baseline", wo.id);
  if (!existsSync(path.join(dir, "baseline.json"))) return { missing: "no baseline" };
  const b = readBaseline(dir);
  if (!existsSync(b.har.path)) return { missing: "HAR gone" };
  if (sha256(readFileSync(b.har.path)) !== b.har.sha256) return { missing: "HAR changed since the baseline" };
  const script = await interactScript(wo.id, { ref: interact });
  if ((script ? sha256(JSON.stringify(script)) : null) !== (b.script ?? null)) return { missing: "interaction script changed since the baseline" };
  // Same HAR and script, only the root selector changed (baselines from before HM-251 took a recordVia page's root with
  // `origSel`, i.e. the parent page's): recomputed from the same HAR, offline, see refreshBaseline().
  if ((b.sel ?? SITES[wo.site].origSel) !== origSelOf(wo)) return { missing: "root selector changed since the baseline", refresh: b.har.path };
  // Same again for recordVia baselines whose component shots still include the fixed elements outside the component
  // (taken before HM-253), or the parent page's and the shell's other elements next to it (before HM-342; replay.mjs
  // markOffscope). `offscopeAll` implies `offscopeFixed`.
  if (wo.recordVia && !b.offscopeFixed) return { missing: "component shots taken with off-scope fixed elements (before HM-253)", refresh: b.har.path };
  if (wo.recordVia && !b.offscopeAll) return { missing: "component shots taken with off-scope elements around the component (before HM-342)", refresh: b.har.path };
  // Same again for baselines that may hold a zero-area root shot as the whole viewport (taken before HM-380, replay.mjs
  // paintedBoxInPage): any load shot of exactly the viewport's size. A root that really is that size is shot the same way
  // again, so recomputing it changes nothing.
  if (!b.paintedBox && b.runs.some((r) => r.load.candidates.some((c) => c.shot && existsSync(c.shot) && sameSize(c.shot, VIEWPORT)))) return { missing: "zero-area root shot as the whole viewport (before HM-380)", refresh: b.har.path };
  // Same again for baselines with an a-carousel captured while it autoplayed (before HM-273, replay.mjs pauseCarousels):
  // the active slide depended on when the original side settled. Recomputed from the same HAR with the slider paused.
  if (!b.carouselPaused && b.runs.some((r) => [r.load, r.final].some((p) => p?.candidates?.some((c) => JSON.stringify(c.tree ?? null).includes("slick-track"))))) return { missing: "carousel captured while autoplaying (before HM-273)", refresh: b.har.path };
  // Same again for baselines whose shots hold a <canvas> but not its box (before HM-302, replay.mjs canvasBoxesInPage):
  // without it compareRuns cannot tell a canvas that differs between the original's two runs (volatileCanvases).
  // Recomputed from the same HAR; the shots, DOM and requests are taken as before.
  if (!b.canvasBoxes && b.runs.some((r) => r.load?.candidates?.some((c) => c.shot && JSON.stringify(c.tree ?? null).includes('"t":"canvas"')))) return { missing: "canvas boxes not recorded (before HM-302)", refresh: b.har.path };
  return { baseline: b, dir };
}

// PNG header: width and height at bytes 16–23.
const sameSize = (file, { width, height }) => { const h = readFileSync(file).subarray(16, 24); return h.length === 8 && h.readUInt32BE(0) === width && h.readUInt32BE(4) === height; };

// Re-runs baseline.mjs for one order with the HAR its baseline was recorded with (legacy-dist replayed under that HAR,
// nothing goes to the test environment). Dry runs write into their own directory, never over the shared baseline.
function refreshBaseline(wo, har, state, dry, interact) {
  const out = dry ? path.join(state, "gate", `baseline-dry${process.pid}`, wo.id) : path.join(state, "baseline", wo.id);
  let r;
  try { r = JSON.parse(execFileSync(process.execPath, [path.join(ROOT, "tools/baseline.mjs"), wo.id, "--har", har, "--out", out, ...(interact ? ["--interact-ref", interact] : [])], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], timeout: 15 * 60000 }).trim().split("\n").pop()); } catch (e) { r = { ok: false, error: String(e.stdout || e.message).trim().split("\n").pop().slice(0, 200) }; }
  return r.ok ? { baseline: readBaseline(out), dir: out } : { missing: `baseline refresh failed: ${r.error ?? "?"}` };
}

// GitHub connections occasionally drop: three tries, then it is the gate's own error.
function fetchBranches(baseApp, branches) {
  for (let i = 1; ; i++) {
    try { execFileSync("git", ["-C", baseApp, "fetch", "-q", "origin", ...branches.map((b) => `+refs/heads/${b}:refs/remotes/origin/${b}`)], { stdio: "ignore", timeout: 120000 }); return; } catch (e) {
      if (i >= 3) throw new Error(`git fetch of ${branches.join(", ")} failed 3 times`);
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5000 * i);
    }
  }
}

// --branch: a private worktree of the hmrsfw-vue checkout at origin/<branch>, inside the gate dir.
function checkoutBranch(baseApp, branch, gateDir) {
  const wt = path.join(gateDir, "app");
  fetchBranches(baseApp, [branch]);
  rmSync(wt, { recursive: true, force: true });
  execFileSync("git", ["-C", baseApp, "worktree", "add", "-q", "--detach", wt, `origin/${branch}`], { stdio: "ignore" });
  symlinkSync(realpathSync(path.join(baseApp, "node_modules")), path.join(wt, "node_modules"));
  // the link is not ignored by `node_modules/` (directories only): rule 4 of check-imports would see an untracked
  // `node_modules` that is no order's change (HM-526)
  gitExclude(wt, "node_modules", "tools/gate.mjs: the --branch worktree links node_modules");
  return { dir: wt, sha: execFileSync("git", ["-C", wt, "rev-parse", "HEAD"], { encoding: "utf8" }).trim(), cleanup: () => { try { execFileSync("git", ["-C", baseApp, "worktree", "remove", "--force", wt], { stdio: "ignore" }); } catch {} } };
}

// Upgrade mode: what the branch changed against integration and which pages that can reach. `branch` null: the
// checkout's own HEAD and working tree (--no-checkout, tests). files: repo paths, deleted ones included. pages: page
// orders already restored on the branch (their target is in its tree, i.e. merged into integration before the upgrade
// was cut, or accepted) whose queue deps name a changed file, minus the pages the upgrade unblocks; `only` (--wo)
// replaces that list. apps: the apps a change can reach (a file outside apps/ — package.json, lock files, root config —
// reaches all of them).
export function upgradePlan({ appDir, branch = null, unblocks = [], only = [], root = ROOT }) {
  const git = (...a) => execFileSync("git", ["-C", appDir, ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 64 << 20 }).trim();
  let files, tree;
  if (branch) {
    fetchBranches(appDir, ["integration", branch]); // a stale origin/integration would charge the upgrade with integration's own changes
    const head = `origin/${branch}`;
    files = git("diff", "--name-only", `${git("merge-base", head, "origin/integration")}...${head}`).split("\n").filter(Boolean);
    tree = new Set(git("ls-tree", "-r", "--name-only", head).split("\n"));
  } else {
    const ch = changedFiles(appDir);
    if (!ch.files) throw new Error(`upgrade mode: cannot tell what ${appDir} changed (no origin/integration or main)`);
    files = ch.files;
    tree = new Set(git("ls-files").split("\n").concat(files.filter((f) => existsSync(path.join(appDir, f)))));
  }
  const orders = loadWorkOrders(root);
  const byId = new Map(orders.map((w) => [w.id, w]));
  let pages = only;
  if (!only.length) {
    const idx = reverseDeps(orders, root), set = new Set();
    for (const f of files) for (const id of idx.get(f) ?? []) { const w = byId.get(id); if (isPage(w) && w.target && tree.has(w.target) && !unblocks.includes(id)) set.add(id); }
    pages = [...set].sort();
  }
  const all = [...new Set(Object.values(SITES).map((s) => s.app))];
  const apps = new Set(pages.map((id) => byId.get(id)?.app).filter(Boolean));
  for (const f of files) { const m = /^apps\/([^/]+)\//.exec(f); if (!m) all.forEach((a) => apps.add(a)); else if (all.includes(m[1])) apps.add(m[1]); }
  return { files, pages, apps: [...apps].sort() };
}

// Upgrade mode, static stage: scope first (nothing else is worth checking on a branch that changed a page), then the
// order-independent self-check items on the changed files that still exist.
function upgradeStatic({ appDir, plan, unblocks }) {
  const t0 = Date.now();
  if (!plan.files.length) return { global: [{ check: "scope", where: "branch", hint: "the upgrade branch changes nothing against integration" }], ms: Date.now() - t0 };
  const scope = scopeViolations(plan.files, { kind: "upgrade", wos: unblocks, ownerOf: registryOwnerOf(ROOT) });
  if (scope.length) return { global: scope.map((v) => ({ check: "scope", where: v.split(": ")[0], hint: v.slice(v.indexOf(": ") + 2) })), ms: Date.now() - t0 };
  const present = plan.files.map((f) => path.join(appDir, f)).filter((f) => existsSync(f));
  return { global: selfCheckFiles(present, appDir), ms: Date.now() - t0 };
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
  const info = task ? taskInfo(task) : { meta: {} };
  const meta = info.meta;
  // An upgrade task is always judged as an upgrade: in page mode it would be judged by the pages it unblocks (HM-858).
  const upgradeTask = [meta.kind, meta.restoreKind].includes("upgrade");
  let mode = regress ? "integration" : opt(argv, "--mode", upgradeTask ? "upgrade" : "page");
  if (upgradeTask && mode === "page") mode = "upgrade";
  if (!["page", "integration", "upgrade"].includes(mode)) throw new Error("--mode must be page, integration or upgrade");
  const upgrade = mode === "upgrade";
  const buildKind = opt(argv, "--build", mode === "page" ? "ondemand" : "full");
  const attempt = Number(opt(argv, "--attempt", meta.attempt ?? 1));
  const branch = opt(argv, "--branch", meta.branch);
  const state = stateDir();
  const assets = assetsDir();
  let ids = (opt(argv, "--wo") ?? "").split(",").filter(Boolean);
  if (!ids.length && meta.workOrders && !upgrade) ids = meta.workOrders;
  if (!ids.length && regress) { const { readdirSync } = await import("node:fs"); ids = existsSync(path.join(state, "baseline")) ? readdirSync(path.join(state, "baseline")).filter((d) => existsSync(path.join(state, "baseline", d, "baseline.json"))).sort() : []; }
  const plan = upgrade ? upgradePlan({ appDir: resolveAppDir(argv), branch: flag(argv, "--no-checkout") ? null : branch, unblocks: meta.workOrders || [], only: ids }) : null;
  if (plan) ids = plan.pages;
  if (!ids.length && !upgrade) throw new Error("no work orders: pass --task (metadata workOrders) or --wo");
  const wos = ids.map(loadWorkOrder);
  const interact = interactRef(argv);

  // Baselines first: without one there is nothing to compare against.
  const bases = {}, baseDirs = {}, missing = [];
  for (const wo of wos) { let b = await baselineFor(wo, state, { interact }); if (b.refresh) b = refreshBaseline(wo, b.refresh, state, dry, interact); if (b.missing) missing.push({ wo: wo.id, why: b.missing }); else { bases[wo.id] = b.baseline; baseDirs[wo.id] = b.dir; } }
  if (missing.length && !regress && !upgrade) return { pending: "record", missing, attempt, durationMs: Date.now() - t0, ...(interact ? { interactRef: interact } : {}) };
  const judged = wos.filter((w) => bases[w.id]);

  // Integration mode with a task runs in slices that tasks with the same pages share (HM-1270, tools/gate/runs.mjs);
  // --no-resume keeps the one-process run below, --resume gives slices to a run without a task.
  const sliced = mode === "integration" && !regress && !dry && !skipStatic && !!branch && !flag(argv, "--no-checkout") && !flag(argv, "--no-resume") && (!!task || flag(argv, "--resume"));
  if (sliced) {
    const budgetMs = Number(opt(argv, "--budget", DEFAULT_BUDGET_MIN)) * 60000;
    return slicedRun({ argv, task, meta, createdAt: info.createdAt, attempt, branch, wos, judged, bases, baseDirs, interact, state, assets, t0, budgetMs });
  }

  const runId = regress ? `regress-${new Date().toISOString().replace(/[:.]/g, "-")}-${process.pid}` : upgrade ? `upgrade-${String(branch || task || "head").replace(/[^\w.-]+/g, "_")}-a${attempt}` : mode === "integration" ? `integration-${task ?? ids[0]}-a${attempt}` : `${ids[0]}-a${attempt}`;
  // Integration orders of different rule changes all list the same sorted pages, so the dir is keyed by the task: keyed by
  // the first page, concurrent regressions wiped each other's app worktree (ENOTEMPTY / not a git repository, HM-1235).
  const gateDir = path.join(state, "gate", runId + (dry && !regress ? `-dry${process.pid}` : ""));
  rmSync(gateDir, { recursive: true, force: true });
  mkdirSync(gateDir, { recursive: true });
  const stages = {};
  const out = { pass: false, failed: [], stage: null, diff: gateDir, shimmed: [], durationMs: 0, stages, pages: [], mode, attempt, build: buildKind, ...(interact ? { interactRef: interact } : {}), ...(plan ? { branch: branch ?? null, changed: plan.files.length, apps: plan.apps } : {}) };
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
    // upgrade mode: the branch's own checks only; the judged pages are unchanged by it (no views/**), their self-check
    // would charge each of them with the upgrade's files (check-imports rule 4)
    const st = upgrade ? { ...upgradeStatic({ appDir, plan, unblocks: meta.workOrders || [] }), failed: {} } : await staticStage({ wos: judged, appDir, mode });
    stages.static = st.ms;
    const pageFail = {};
    for (const wo of judged) pageFail[wo.id] = [...(st.failed[wo.id] ?? [])];
    if (st.global.length) out.failed.push(...st.global);
    if (upgrade && !skipStatic && st.global.length) { out.stage = "static"; return out; }
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
    const apps = upgrade ? plan.apps : [...new Set(judged.map((w) => w.app))];
    const servers = {};
    // A recordVia page is mounted inside its parent's restored page (common.mjs scopeRootSel): the parent passes the
    // props, the restored component is found by its compiled scope id (scopeIdPlugin).
    const mountOf = {};
    const buildFail = {};
    const appFail = []; // upgrade mode: a failing build fails the branch even when no page of that app is judged
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
          const srv = await startOnDemand({ appDir, app: a, gateDir, stateRoot: state, routes: routesOf(a), plugins, allow: [path.join(ROOT, "legacy-dist"), realpathOr(path.join(ROOT, "legacy-dist"))] });
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
        if (upgrade) appFail.push({ check: "build", where: a, hint: msg });
      }
      out.shimmed.push(...used);
      servers[a] && (servers[a].used = used);
    }
    stages.build = Date.now() - tb;
    for (const [id, f] of Object.entries(buildFail)) pageFail[id].push(...f);
    if (!regress && (Object.keys(buildFail).length || appFail.length)) {
      out.stage = "build";
      out.pages = judged.map((w) => ({ wo: w.id, pass: false, stage: buildFail[w.id] ? "build" : null, failed: buildFail[w.id] ?? [] }));
      out.failed.push(...(Object.keys(buildFail).length ? [] : appFail), ...Object.entries(buildFail).flatMap(([id, f]) => f.map((x) => ({ ...x, wo: id }))));
      return out;
    }

    // ── browser ──
    const tw = Date.now();
    const browser = await chromium.launch();
    closers.push(() => browser.close());
    stages.browserLaunch = Date.now() - tw;
    for (const wo of judged) {
      if (pageFail[wo.id].length && !(skipStatic && !buildFail[wo.id])) { out.pages.push({ wo: wo.id, pass: false, stage: buildFail[wo.id] ? "build" : "static", failed: pageFail[wo.id] }); continue; }
      const page = await judgePage({ browser, wo, base: bases[wo.id], dir: path.join(gateDir, wo.id), interact, state, assets, appDir, scopeIds, origin: servers[wo.app].origin, rules });
      out.pages.push({ ...page, ...(skipStatic && pageFail[wo.id].length ? { staticFailed: pageFail[wo.id].map((f) => `${f.check} ${f.hint}`) } : {}) });
    }
    stages.browser = Date.now() - tw;
    for (const a of apps) if (servers[a]?.publishDeps && out.pages.every((p) => p.stage !== "build")) out.depsCachePublished = servers[a].publishDeps() || undefined;
    out.failed.push(...out.pages.filter((p) => !p.pass).flatMap((p) => p.failed.map((f) => ({ ...f, wo: p.wo }))));
    out.stage = out.pages.some((p) => p.stage === "static") || (st.global.length && out.pages.every((p) => p.pass)) ? "static" : out.pages.some((p) => p.stage === "build") ? "build" : "browser";
    if (st.global.length) out.global = summarizeGlobal(st.global);
    // upgrade mode: pages without a baseline are listed in `pending` and not judged; they do not hold the upgrade back
    out.pass = out.failed.length === 0 && out.pages.length === (upgrade ? judged.length : wos.length);
    if (missing.length) out.pending = missing;
    return out;
  } finally {
    for (const c of closers.reverse()) await c();
    out.durationMs = Date.now() - t0;
    if (regress) Object.assign(out, regressDiff(out, state, dry));
    if (out.pass && !flag(argv, "--keep") && !dry) rmSync(path.join(gateDir, "vite"), { recursive: true, force: true });
  }
}

// The tool commit the gate runs with; local edits under tools/ or rules/ make it a different version.
function toolVersion(root = ROOT) {
  const git = (args) => execFileSync("git", ["-C", root, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 64 << 20 }).trim();
  const head = git(["rev-parse", "HEAD"]);
  const diff = git(["diff", "HEAD", "--", "tools", "rules"]);
  return diff ? `${head}+${hash(diff).slice(0, 12)}` : head;
}

// The run's hmrsfw-vue worktree at its commit, (re)made when missing or broken (the checkout it came from may be gone).
function ensureRunApp(baseApp, run, appDir) {
  try { if (execFileSync("git", ["-C", appDir, "rev-parse", "HEAD"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim() === run.commit && existsSync(path.join(appDir, "node_modules"))) return; } catch {}
  try { execFileSync("git", ["-C", baseApp, "worktree", "remove", "--force", appDir], { stdio: "ignore" }); } catch {}
  rmSync(appDir, { recursive: true, force: true });
  try { execFileSync("git", ["-C", baseApp, "worktree", "prune"], { stdio: "ignore" }); } catch {}
  try { execFileSync("git", ["-C", baseApp, "cat-file", "-e", `${run.commit}^{commit}`], { stdio: "ignore" }); } catch { fetchBranches(baseApp, [run.branch]); }
  execFileSync("git", ["-C", baseApp, "worktree", "add", "-q", "--detach", appDir, run.commit], { stdio: "ignore" });
  symlinkSync(realpathSync(path.join(baseApp, "node_modules")), path.join(appDir, "node_modules"));
  gitExclude(appDir, "node_modules", "tools/gate.mjs: the --branch worktree links node_modules");
}

// Integration mode in slices (HM-1270, tools/gate/runs.mjs). Per page the same as the one-process run in gate(): the
// self-check, the full build with the judged pages' routes, the replay and the comparison (judgePage); the order is
// build first, then each page's self-check and replay, and every page verdict is kept as soon as it is known. Stops
// starting pages once budgetMs is used up and returns {partial:true}; the verdict, when every page has one, is shaped
// like gate()'s.
async function slicedRun({ argv, task, meta, createdAt, attempt, branch, wos, judged, bases, baseDirs, interact, state, assets, t0, budgetMs }) {
  const deadline = budgetMs > 0 ? t0 + budgetMs : Infinity;
  const baseApp = resolveAppDir(argv);
  const tools = toolVersion();
  const rules = loadRules();
  const set = setKey(judged);
  const pin = task ? `${task}-a${attempt}-g${meta.gateSeq ?? 0}` : `wo-${hash(judged.map((w) => w.id)).slice(0, 12)}`;
  // a run shared with other tasks must have fetched its commit after this task's page list was fixed (created) and after
  // the last re-gate (a re-gate asks for new verdicts)
  const notBefore = Math.max(Date.parse(createdAt ?? "") || 0, Date.parse(meta.regateAt ?? "") || 0);
  const root = runsDir(state);
  mkdirSync(root, { recursive: true });
  for (const d of staleRuns(state)) { try { execFileSync("git", ["-C", baseApp, "worktree", "remove", "--force", path.join(d, "app")], { stdio: "ignore" }); } catch {} rmSync(d, { recursive: true, force: true }); }
  const picked = await withLock(path.join(root, ".pick.lock"), () => {
    const r = pickRun({ state, tools, rules: rules.version, set, pin, notBefore });
    if (r) return r;
    fetchBranches(baseApp, [branch]);
    const commit = execFileSync("git", ["-C", baseApp, "rev-parse", `origin/${branch}^{commit}`], { encoding: "utf8" }).trim();
    return createRun({ state, tools, rules: rules.version, set, commit, branch });
  }, { deadline: Date.now() + 10 * 60000 });
  if (!picked) throw new Error(`${path.join(root, ".pick.lock")} held for 10 minutes`);
  const run = picked.value;
  const runDir = path.join(root, run.key);
  const slices = pinRun(state, pin, run);
  const appDir = path.join(runDir, "app");
  const head = { mode: "integration", attempt, build: "full", ...(interact ? { interactRef: interact } : {}), run: run.key, diff: runDir, commit: run.commit, tools, slices };
  const partial = (extra) => ({ partial: true, ...head, ...extra, durationMs: Date.now() - t0, next: "未完：再运行同一条命令，从已判的页接着跑（HM-1270）" });
  const app = await withLock(path.join(runDir, ".app.lock"), () => ensureRunApp(baseApp, run, appDir), { deadline: Date.now() + 10 * 60000 });
  if (!app) throw new Error(`${runDir}/.app.lock held for 10 minutes`);
  const noKeys = missingCryptoEnv(appDir);
  if (noKeys.length) throw new Error(`crypto keys missing for the restored app: ${noKeys.join(", ")} (set them in the gate's environment; docs/gate.md)`);

  // ── app-wide zero-reference hits, once per run ──
  const gf = path.join(runDir, "global.json");
  let global = readJson(gf);
  if (!global) { global = (await staticStage({ wos: [], appDir, mode: "integration" })).global; writeJson(gf, global); }

  // ── build, once per run and app ──
  const stages = { static: 0, build: 0, browser: 0 };
  const apps = [...new Set(judged.map((w) => w.app))];
  const mountOf = {}, buildFail = {}, scopeIds = new Map(), dist = {};
  for (const w of judged.filter((x) => x.target)) {
    const p = w.recordVia ? loadWorkOrder(w.recordVia) : null;
    mountOf[w.id] = path.join(appDir, p ? p.target ?? "" : w.target);
    if (p && !(p.target && existsSync(mountOf[w.id]))) buildFail[w.id] = [{ check: "build", where: w.recordVia, hint: `parent page ${w.recordVia} (recordVia) has no restored file on this branch (${p.target})` }];
  }
  const routesOf = (a) => judged.filter((w) => w.app === a && w.target && !buildFail[w.id]).map((w) => ({ route: w.route, recordPath: w.recordPath, file: mountOf[w.id] }));
  let builtMs = 0; // a build cannot be cut short: after one in this call, the next waits for a call with time for it
  for (const a of apps) {
    const bf = path.join(runDir, "build", `${a}.json`);
    if (!readJson(bf) && builtMs && Date.now() + builtMs > deadline) return partial({ done: 0, total: judged.length, waiting: `build of ${a}` });
    const got = readJson(bf) ? { value: readJson(bf) } : await withLock(path.join(runDir, `.build-${a}.lock`), async () => {
      const done = readJson(bf);
      if (done) return done;
      const tb = Date.now(), found = new Map();
      let res;
      try { const b = await buildApp({ appDir, app: a, gateDir: runDir, routes: routesOf(a), singlePage: false, plugins: [scopeIdPlugin(found)] }); res = { ok: true, outDir: b.outDir, scopeIds: [...found], ms: Date.now() - tb }; } catch (e) { res = { ok: false, check: e instanceof ShimError ? "shim" : "build", hint: String(e.message).split("\n")[0].slice(0, 240), ms: Date.now() - tb }; }
      writeJson(bf, res);
      builtMs = res.ms;
      return res;
    }, { deadline });
    if (!got) return partial({ done: 0, total: judged.length, waiting: `build of ${a} in another process` });
    const b = got.value;
    stages.build += b.ms;
    if (!b.ok) for (const w of judged.filter((x) => x.app === a)) buildFail[w.id] = [{ check: b.check, where: a, hint: b.hint }];
    else { for (const [f, sid] of b.scopeIds) scopeIds.set(f, sid); dist[a] = b.outDir; }
  }
  const out = { pass: false, failed: [...global], stage: null, diff: runDir, shimmed: [], durationMs: 0, stages, pages: [], ...head, rules: rules.version };
  if (Object.keys(buildFail).length) { // as gate(): a failing build is the verdict
    out.stage = "build";
    out.pages = judged.map((w) => ({ wo: w.id, pass: false, stage: buildFail[w.id] ? "build" : null, failed: buildFail[w.id] ?? [] }));
    out.failed.push(...Object.entries(buildFail).flatMap(([id, f]) => f.map((x) => ({ ...x, wo: id }))));
    out.durationMs = Date.now() - t0;
    return out;
  }

  // ── pages: self-check, then replay and comparison; each verdict kept as soon as it is known ──
  const results = {}, ctx = {};
  for (const wo of judged) {
    const steps = await interactScript(wo.id, { ref: interact });
    const known = loadKnownDiffs(wo.id, { state, site: wo.site });
    const fp = pageFp({ baselineSha: sha256(readFileSync(path.join(baseDirs[wo.id], "baseline.json"))), script: steps ? sha256(JSON.stringify(steps)) : null, known });
    ctx[wo.id] = { steps, known, fp };
    const r = pageResult(runDir, wo.id, fp);
    if (r) results[wo.id] = r;
  }
  let browser = null;
  const servers = {};
  const judgeOne = async (wo) => {
    const claim = path.join(runDir, "pages", wo.id, ".claim");
    if (!tryClaim(claim)) return false;
    try {
      const again = pageResult(runDir, wo.id, ctx[wo.id].fp); // finished by another process meanwhile
      if (again) { results[wo.id] = again; return true; }
      const ts = Date.now();
      const sf = (await selfCheck(wo, appDir)).map((f) => ({ ...f, check: f.check ?? "self-check" }));
      const staticMs = Date.now() - ts;
      let page;
      if (sf.length) page = { wo: wo.id, pass: false, stage: "static", failed: sf };
      else {
        browser ??= await chromium.launch();
        servers[wo.app] ??= await serveStatic([dist[wo.app]]);
        page = await judgePage({ browser, wo, base: bases[wo.id], dir: path.join(runDir, "pages", wo.id), interact, state, assets, appDir, scopeIds, origin: servers[wo.app].origin, rules, ...ctx[wo.id] });
      }
      savePageResult(runDir, wo.id, ctx[wo.id].fp, page, { staticMs });
      results[wo.id] = { page, staticMs };
      return true;
    } finally { release(claim); }
  };
  try {
    let todo = judged.filter((w) => !results[w.id]);
    while (todo.length && Date.now() < deadline) {
      let progressed = false;
      for (const wo of todo) { if (Date.now() >= deadline) break; if (await judgeOne(wo)) progressed = true; }
      for (const w of todo) if (!results[w.id]) { const r = pageResult(runDir, w.id, ctx[w.id].fp); if (r) results[w.id] = r; }
      todo = todo.filter((w) => !results[w.id]);
      if (todo.length && !progressed) await new Promise((r) => setTimeout(r, 10000)); // the rest are being judged elsewhere
    }
  } finally {
    if (browser) await browser.close().catch(() => {});
    for (const s of Object.values(servers)) await s.close();
  }
  const left = judged.filter((w) => !results[w.id]);
  if (left.length) return partial({ done: judged.length - left.length, total: judged.length, claimedElsewhere: left.filter((w) => claimHolder(path.join(runDir, "pages", w.id, ".claim"))).length });

  for (const w of judged) { stages.static += results[w.id].staticMs ?? 0; stages.browser += results[w.id].page.ms ?? 0; }
  out.pages = judged.map((w) => results[w.id].page);
  out.failed.push(...out.pages.filter((p) => !p.pass).flatMap((p) => p.failed.map((f) => ({ ...f, wo: p.wo }))));
  out.stage = out.pages.some((p) => p.stage === "static") || (global.length && out.pages.every((p) => p.pass)) ? "static" : out.pages.some((p) => p.stage === "build") ? "build" : "browser";
  if (global.length) out.global = summarizeGlobal(global);
  out.pass = out.failed.length === 0 && out.pages.length === wos.length;
  out.durationMs = Date.now() - t0;
  return out;
}

// Browser stage of one page: replay the restored page under the baseline's HAR and compare with the baseline. A failing
// restored run is repeated once (busy machine: animations, toasts and timers land differently); the first run's failures
// stay in the local report. Returns the page entry of the verdict; report.json and the shots go to dir.
async function judgePage({ browser, wo, base, dir, interact, state, assets, appDir, scopeIds, origin, rules, steps, known }) {
  mkdirSync(dir, { recursive: true });
  steps ??= await interactScript(wo.id, { ref: interact });
  known ??= loadKnownDiffs(wo.id, { state, site: wo.site });
  const har = loadHar(base.har.path);
  const restSid = wo.recordVia ? scopeIds.get(realpathOr(path.join(appDir, wo.target))) : null;
  if (wo.recordVia && !restSid) return { wo: wo.id, pass: false, stage: "browser", failed: [{ check: "root", where: "load", hint: `restored ${wo.target} has no scope id (no <style scoped>): it cannot be found inside the parent page ${wo.recordVia}` }] };
  const restSel = restSid ? scopeRootSel(restSid) : REST_SEL;
  const once = async (tag) => {
    const rest = await runPage(browser, { origin, url: wo.recordPath, storage: restStorage(wo, assets, base.storagePatch, har), har, sel: restSel, steps, shotDir: dir, tag, componentScope: restSid });
    return { rest, cmp: compareRuns(base, rest, { rules, site: wo.site, known: known.list, shotOut: path.join(dir, `${tag}.diff.png`), restSel, inParent: !!restSid }) };
  };
  let { rest, cmp } = await once("rest");
  let firstFailed = null;
  if (cmp.failed.length) { firstFailed = cmp.failed; ({ rest, cmp } = await once("rest.retry")); }
  const pass = cmp.failed.length === 0;
  // Local report with the full projections (page text included): stays in $RESTORE_STATE, never in metadata.
  writeFileSync(path.join(dir, "report.json"), JSON.stringify({ wo: wo.id, pass, failed: cmp.failed, firstFailed, pixel: cmp.pixel, ...(cmp.volatileCanvases?.length ? { volatileCanvases: cmp.volatileCanvases } : {}), knownUsed: cmp.knownUsed, waived: cmp.waived, knownUnusable: known.unusable, unstable: base.unstable, settleMs: rest.settleMs, errors: rest.errors, restRequests: [...(rest.load?.requests ?? []), ...(rest.stepLog ?? [])].map((x) => `${x.phase} ${x.method} ${x.path} ${x.tier}`), restOpened: [...(rest.load?.opened ?? []), ...(rest.opened ?? [])].map((x) => `${x.phase} ${x.target.split("?")[0]}`), restOtherRequests: (rest.otherRequests ?? []).map((x) => `${x.phase} ${x.method} ${x.path}`), orig: cmp.projections.orig.map(strip), rest: strip(cmp.projections.rest) }, null, 1));
  return { wo: wo.id, pass, stage: pass ? null : "browser", failed: cmp.failed, pixel: cmp.pixel, ...(firstFailed ? { retried: true } : {}), ...(cmp.knownUsed.length ? { knownDiffs: cmp.knownUsed } : {}), ...(known.unusable.length ? { knownUnusable: known.unusable } : {}), ...(base.unstable?.length ? { unstable: base.unstable } : {}), ms: rest.totalMs };
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

// The server caps an issue's metadata as a whole — every key together — at 8 KB, not each value (HM-876, measured on
// HM-876 itself: Σ(key + value as stored + 8) + 8 ≤ 8192; escaping does not count, objects are stored as their JSON
// text). A large integration order's workOrders alone takes 4–5 KB, so gate.<attempt> gets what the task's other keys
// leave free, less headroom for the keys tick writes after the verdict (advanced, waitRecord, gateSeq, merge.<n> …), and
// never more than META_BUDGET.
export const META_CAP = 8192;
export const META_HEADROOM = 1024;
export const META_BUDGET = 7000;
export const META_FLOOR = 256; // below this a refused write is retried once more with the bare verdict (budget 0)
const bytes = (v) => Buffer.byteLength(JSON.stringify(v));
const clip = (s, n) => String(s ?? "").slice(0, n);
const storedBytes = (v) => Buffer.byteLength(typeof v === "string" ? v : JSON.stringify(v));
export const metaBytes = (m) => Object.entries(m ?? {}).reduce((n, [k, v]) => n + Buffer.byteLength(k) + storedBytes(v) + 8, 8);
// Budget for `key` on an issue whose current (raw, as `issue get` returns it) metadata is `meta`: its own old value is
// replaced, so it does not count.
export function metaBudget(meta, key) {
  const rest = Object.fromEntries(Object.entries(meta ?? {}).filter(([k]) => k !== key));
  return Math.max(0, Math.min(META_BUDGET, META_CAP - META_HEADROOM - metaBytes(rest) - Buffer.byteLength(key) - 8));
}

// What goes into gate.<attempt>: the fields tick.mjs advance reads (pass, pending, missingTotal, error, stage, failed,
// pages [{wo, pass, stage}], global), shrunk until they fit `budget`. The full result is in the file named by `detail`.
// pending: counts by reason, the missing ids while they fit, else the first ones as a sample (missingTruncated).
// pass/fail: every page keeps an entry — advance reads a page without one as failed — passing pages shrink to {wo, pass},
// then to a count (passedOmitted).
export function slimResult(out, detail, budget = META_BUDGET) {
  if (out.pending === "record") {
    const ids = out.missing.map((m) => m.wo), byReason = {};
    for (const m of out.missing) byReason[m.why] = (byReason[m.why] ?? 0) + 1;
    const slim = { pending: "record", missingTotal: ids.length, byReason, missing: ids, attempt: out.attempt, durationMs: out.durationMs, detail };
    if (bytes(slim) > budget) slim.missing = ids.slice(0, 10);
    while (bytes(slim) > budget && slim.missing.length) slim.missing = ids.slice(0, Math.floor(slim.missing.length / 2));
    if (slim.missing.length < ids.length) slim.missingTruncated = true;
    if (bytes(slim) > budget) delete slim.durationMs;
    // many distinct reasons (each names a page-specific cause): keep the most frequent ones
    const top = Object.entries(byReason).sort((a, b) => b[1] - a[1]);
    while (bytes(slim) > budget && Object.keys(slim.byReason).length > 1) { slim.byReason = Object.fromEntries(top.slice(0, Object.keys(slim.byReason).length - 1)); slim.byReasonTruncated = true; }
    if (bytes(slim) > budget) delete slim.detail; // the [GATE] comment names it too
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
    if (bytes(slim) <= budget) return slim;
  }
  // Hundreds of pages: list the failing pages only and count the passing ones (advance reads an unlisted page as passed
  // when passedOmitted is set). Failing pages that still do not fit are cut, without passedOmitted: every unlisted page
  // then reads as failed — a wider regression set, never a page wrongly passed.
  const bad = (out.pages ?? []).filter((p) => !p.pass).map((p) => ({ wo: p.wo, pass: false, stage: p.stage }));
  slim.pages = bad;
  slim.passedOmitted = (out.pages ?? []).length - bad.length;
  if (bytes(slim) <= budget) return slim;
  delete slim.passedOmitted;
  slim.failedPagesTotal = bad.length;
  slim.pagesTruncated = true;
  while (bytes(slim) > budget && slim.pages.length) slim.pages = bad.slice(0, Math.floor(slim.pages.length / 2));
  // still too large (a tiny budget): the verdict, its stage and counts only — failed ids then come from `detail`
  if (bytes(slim) > budget && pendingIds) { slim.pendingTotal = pendingIds.length; delete slim.pending; }
  if (bytes(slim) > budget) { slim.failed = []; delete slim.global; delete slim.commit; delete slim.rules; delete slim.build; }
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
  // The budget is what the task's other metadata leaves free (HM-876). A refused write (another key grew meanwhile,
  // or the server counts differently) is retried with half the budget, down to META_FLOOR, then once with the bare
  // verdict (budget 0).
  const key = `gate.${attempt}`;
  let budget;
  try { budget = metaBudget(JSON.parse(multica(["issue", "get", task, "--output", "json"])).metadata, key); } catch (e) { process.stderr.write("metadata read failed: " + e.message + "\n"); budget = META_FLOOR; }
  let slim;
  for (;;) {
    slim = slimResult(out, detail, budget);
    try { multica(["issue", "metadata", "set", task, "--key", key, "--value", JSON.stringify(slim)]); break; } catch (e) {
      const msg = String(e.stderr || e.message);
      if (!/exceeds/i.test(msg) || budget === 0) { process.stderr.write("metadata write failed: " + msg.trim().split("\n").pop() + "\n"); break; }
      budget = budget > META_FLOOR ? Math.max(META_FLOOR, Math.floor(budget / 2)) : 0;
    }
  }
  const secs = (ms) => (ms / 1000).toFixed(1) + "s";
  const head = out.pending === "record" ? `[GATE] PENDING record ${idList(ids)} a${attempt}: ${Object.entries(out.missing.reduce((a, m) => ((a[m.why] = (a[m.why] ?? 0) + 1), a), {})).map(([why, n]) => `${why} ×${n}`).join("; ")}` : `[GATE] ${out.pass ? "PASS" : "FAIL"} ${idList(ids)} a${attempt} ${out.mode} — ${secs(out.durationMs)} (static ${secs(out.stages.static ?? 0)}, build ${secs(out.stages.build ?? 0)}, browser ${secs(out.stages.browser ?? 0)})`;
  const lines = [head];
  if (out.pages?.length > 5) lines.push(`- pages: ${out.pages.filter((p) => p.pass).length}/${out.pages.length} passed${out.pass ? "" : `; failed: ${idList(out.pages.filter((p) => !p.pass).map((p) => p.wo), 10)}`}`);
  if (out.global) lines.push(`- app-wide: ${out.global.total} (${Object.entries(out.global.byLayer).map(([k, n]) => `${k} ${n}`).join(", ")})`);
  if (out.mode === "upgrade") lines.push(`- upgrade: ${out.changed ?? 0} changed file(s), build ${(out.apps ?? []).join("+") || "-"}, regression ${out.pages?.filter((p) => p.pass).length ?? 0}/${out.pages?.length ?? 0} page(s)${Array.isArray(out.pending) && out.pending.length ? `, ${out.pending.length} without baseline` : ""}`);
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
  const relinked = ensureLegacyDist(ROOT); // HM-1130: legacy-dist may be a link into the shared cache
  if (relinked) process.stderr.write(relinked + "\n");
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
    // {partial:true}: a slice of an integration run (HM-1270), no verdict yet; exit 3, nothing written to the task
    if (r.partial) { process.exitCode = 3; return; }
    if (task && !flag(argv, "--dry-run")) report(task, r.attempt ?? Number(opt(argv, "--attempt", 1)), r, r.mode === "upgrade" ? [`upgrade ${r.branch ?? task}`] : r.pages?.map((p) => p.wo) ?? r.missing?.map((m) => m.wo) ?? []);
    process.exitCode = r.pending ? 0 : r.pass ? 0 : 1;
  }, (e) => {
    printed = true;
    console.log(JSON.stringify({ error: String(e.message).split("\n")[0].slice(0, 300) }));
    process.exitCode = 2;
  }).finally(() => setTimeout(() => process.exit(), 3000).unref()); // left-over Vite / esbuild handles must not keep it alive
}
