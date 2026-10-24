// Interaction scripts → E2E cases (HM-20). tests/interact/<工单id>.json is what the recorder writes; the product's own E2E
// (hmrsfw-vue/e2e, `npm run e2e`) runs data files in e2e/cases/<id>.json. This tool writes those files, so a script the
// recorder adds later reaches the E2E by running this once — nothing is copied by hand, and running it twice changes nothing.
//
//   node tools/interact-to-e2e.mjs [ids...] [--app <hmrsfw-vue checkout>] [--check] [--prune]
//
// A case: { schemaVersion, id, app, route, testOrigin, auth, har?, target, subComponentDir?, steps }
//   app/route/auth/har/target  from the work order (queue/<id>.json, or the accepted pages' tools/confirm-orders.json and
//                              tools/poc-orders.json), auth and har as paths relative to $RESTORE_ASSETS (not read here)
//   testOrigin                 the app's testOrigin in restore.config.json (the login state is filed under it)
//   steps                      the script's steps, validated with interact.mjs, in the script's order; [] for a page without a script
// Without ids: every script in tests/interact/ plus the accepted pages (confirm + POC orders). A page without a script
// still gets a case (load-only checks).
//
// Not converted, with the reason in the output: no script file → fine (load-only case); an invalid script, or a script whose
// id has no work order → ERROR (exit 1: a script must not drop out silently); a page whose target file is not in the app yet → pending
// (convert again after it is merged). --check writes nothing and exits 1 when e2e/cases/ is not what a conversion would give
// (including cases of ids that are no longer in the set); --prune deletes those stale files.
// Output: one JSON line {ok, created, updated, unchanged, stale, removed, pending, errors, noExpectation, cases}.
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { appDir } from "./app-dir.mjs";
import { ROOT, loadWorkOrder, positionals } from "./gate/common.mjs";
import { loadScript, scriptPath } from "./interact.mjs";

const STEP_KEYS = ["fill", "click", "clickSel", "press", "wait", "optional"];
// "root" (HM-1294) only says where the gate takes the page root; the E2E runs the step without it.
const CASE_KEYS = ["schemaVersion", "id", "app", "route", "testOrigin", "auth", "har", "target", "subComponentDir", "steps"];
const readJson = (f) => JSON.parse(readFileSync(f, "utf8"));
const ordered = (o, keys) => Object.fromEntries(keys.filter((k) => o[k] !== undefined).map((k) => [k, o[k]]));

// Login state file of a work order, relative to $RESTORE_ASSETS — the rule of tools/gate/common.mjs loginStateFile (its
// result is a path, so it is derived here, not imported): the order's own `auth`; the POC confirmation orders'
// per-identity file (role "usercenter-jobseeker" …); otherwise the site's.
export function authFile(wo) {
  if (wo.auth) return wo.auth;
  const legacy = typeof wo.role === "string" && wo.role.startsWith(`${wo.site}-`);
  return path.join(".auth", `pw-${legacy ? wo.role : wo.site}.json`);
}

// Ids to convert when none are given.
export function defaultIds(root = ROOT) {
  const ids = new Set();
  const dir = path.join(root, "tests/interact");
  if (existsSync(dir)) for (const f of readdirSync(dir)) if (f.endsWith(".json")) ids.add(f.slice(0, -5));
  for (const f of ["tools/confirm-orders.json", "tools/poc-orders.json"]) if (existsSync(path.join(root, f))) for (const o of readJson(path.join(root, f))) ids.add(o.id);
  return [...ids].sort();
}

// → { kase } | { pending: reason } | { error: reason }
export function convert(id, { app, config, interactDir = path.join(ROOT, "tests/interact") }) {
  let steps = [];
  const sf = path.join(interactDir, `${id}.json`);
  try { const s = loadScript(sf); if (s) steps = s.map((x) => ordered(x, STEP_KEYS)); }
  catch (e) { return { error: `invalid script: ${e.message}` }; }
  const hasScript = existsSync(sf);

  let wo;
  try { wo = loadWorkOrder(id); } catch (e) { return hasScript ? { error: `script has no work order: ${e.message}` } : { pending: `no work order: ${e.message}` }; }
  if (wo.type !== "page") return hasScript ? { error: `work order ${id} is a ${wo.type}, not a page` } : { pending: `work order is a ${wo.type}` };
  const appCfg = config.apps.find((a) => a.site === wo.site);
  if (!appCfg) return { error: `restore.config.json has no app for site ${wo.site}` };
  if (!wo.target || !wo.recordPath) return { error: "work order has no target or route" };
  if (!existsSync(path.join(app, wo.target))) return { pending: `page not in the app yet (${wo.target}); convert again after it is merged` };

  const kase = {
    schemaVersion: 1, id, app: wo.app, route: wo.recordPath, testOrigin: appCfg.testOrigin, auth: authFile(wo),
    har: wo.har, target: wo.target, subComponentDir: wo.subComponentDir && existsSync(path.join(app, wo.subComponentDir)) ? wo.subComponentDir : undefined, steps,
  };
  return { kase: ordered(kase, CASE_KEYS) };
}

// Two-space JSON, one step per line.
function text(kase) {
  const { steps, ...head } = kase;
  const lines = JSON.stringify(head, null, 2).split("\n");
  lines.pop(); // closing brace
  const body = steps.length ? "[\n" + steps.map((s) => "    " + JSON.stringify(s)).join(",\n") + "\n  ]" : "[]";
  return lines.join("\n") + ",\n  \"steps\": " + body + "\n}\n";
}

export function run({ app, ids, full = false, check = false, prune = false, config = readJson(path.join(ROOT, "restore.config.json")), interactDir }) {
  const outDir = path.join(app, "e2e/cases");
  const res = { ok: true, created: [], updated: [], unchanged: [], stale: [], removed: [], pending: [], errors: [], noExpectation: [], cases: 0 };
  const wanted = new Set();
  for (const id of ids) {
    const r = convert(id, { app, config, interactDir });
    if (r.error) { res.errors.push({ id, reason: r.error }); continue; }
    if (r.pending) { res.pending.push({ id, reason: r.pending }); continue; }
    wanted.add(id);
    const file = path.join(outDir, `${id}.json`);
    const body = text(r.kase);
    const had = existsSync(file);
    if (had && readFileSync(file, "utf8") === body) res.unchanged.push(id);
    else {
      (had ? res.updated : res.created).push(id);
      if (!check) { mkdirSync(outDir, { recursive: true }); writeFileSync(file, body); }
    }
    if (!existsSync(path.join(app, "e2e/expect", `${id}.json`))) res.noExpectation.push(id);
  }
  res.cases = wanted.size;
  // Stale files only count when the whole set was converted (an explicit id list is a partial run and deletes nothing).
  if (full && existsSync(outDir)) for (const f of readdirSync(outDir)) {
    if (!f.endsWith(".json") || wanted.has(f.slice(0, -5)) || ids.includes(f.slice(0, -5))) continue;
    res.stale.push(f.slice(0, -5));
    if (prune && !check) { rmSync(path.join(outDir, f)); res.removed.push(f.slice(0, -5)); }
  }
  const inSync = !res.created.length && !res.updated.length && !(res.stale.length && !res.removed.length);
  res.ok = !res.errors.length && (!check || inSync);
  return res;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const argv = process.argv.slice(2);
  try {
    const app = appDir(argv);
    const given = positionals(argv, ["--app"]);
    const res = run({ app, ids: given.length ? given : defaultIds(), full: !given.length, check: argv.includes("--check"), prune: argv.includes("--prune") });
    console.log(JSON.stringify(res));
    process.exitCode = res.ok ? 0 : 1;
  } catch (e) {
    console.log(JSON.stringify({ ok: false, error: e.message }));
    process.exitCode = 2;
  }
}
