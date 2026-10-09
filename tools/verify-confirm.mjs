// Live side-by-side comparison (POC confirmation tool, now a thin wrapper over the gate modules): the original build
// (legacy-dist/<site>) and a full build of hmrsfw-vue (<app>/dist/<portal|uc>, from `npm run build`) are replayed under
// the same HAR, with the same comparison the gate uses (tools/gate/compare.mjs, rules/compare/). Unlike the gate,
// the original side is replayed live instead of read from a baseline; nothing is written to $RESTORE_STATE.
// Pages with an interaction script are compared after the steps too (what interact-confirm.mjs used to do separately).
//   node tools/verify-confirm.mjs [ids...] [--app <hmrsfw-vue checkout>] [--out <dir>]   (default: all 20 confirmation pages)
//   → <out>/<id>.json (+ screenshots), <out>/summary.json; default out: out/verify-confirm/live/
// Needs RESTORE_ASSETS (HAR files and login state).
import { chromium } from "playwright";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { appDir } from "./app-dir.mjs";
import { REST_SEL, ROOT, assetsDir, findHar, interactScript, loadWorkOrder, opt, positionals } from "./gate/common.mjs";
import { authStorage } from "./gate/common.mjs";
import { loadHar } from "./gate/har.mjs";
import { runPage } from "./gate/replay.mjs";
import { serveStatic } from "./gate/serve.mjs";
import { compareRuns } from "./gate/compare.mjs";
import { loadKnownDiffs, loadRules } from "./gate/rules.mjs";
import { recordOriginal } from "./baseline.mjs";

export async function liveCompare({ ids, app, outDir, filter = () => true }) {
  const assets = assetsDir();
  const rules = loadRules();
  mkdirSync(outDir, { recursive: true });
  const servers = { portal: await serveStatic(path.join(app, "dist/portal")), uc: await serveStatic(path.join(app, "dist/uc")) };
  const browser = await chromium.launch();
  const results = [];
  try {
    for (const id of ids) {
      const wo = loadWorkOrder(id);
      const steps = await interactScript(id);
      if (!filter(wo, steps)) continue;
      const harFile = findHar(id, assets, null, wo);
      const dir = path.join(outDir, id);
      mkdirSync(dir, { recursive: true });
      const orig = await recordOriginal({ browser, wo, harFile, assets, shotDir: dir, rules });
      const storage = authStorage(wo, assets);
      for (const k of orig.storagePatch.remove) delete storage.localStorage[k];
      Object.assign(storage.localStorage, orig.storagePatch.set);
      const rest = await runPage(browser, { origin: servers[wo.app].origin, url: wo.recordPath, storage, har: loadHar(harFile), sel: REST_SEL, steps, shotDir: dir, tag: "rest" });
      const cmp = compareRuns({ runs: orig.runs, shell: orig.shell }, rest, { rules, site: wo.site, known: loadKnownDiffs(id).list, shotOut: path.join(dir, "diff.png") });
      const r = { id, pass: cmp.failed.length === 0, failed: cmp.failed, pixel: cmp.pixel, unstable: orig.unstable, steps: steps?.length ?? 0, errors: { orig: orig.runs[0].errors.slice(0, 4), rest: rest.errors.slice(0, 6) } };
      writeFileSync(path.join(outDir, `${id}.json`), JSON.stringify({ ...r, projections: { orig: cmp.projections.orig, rest: cmp.projections.rest } }, null, 1));
      results.push(r);
      console.log(`${id} ${r.pass ? "PASS" : "FAIL"} pixel=${r.pixel}% steps=${r.steps}${r.unstable.length ? " unstable=" + r.unstable.join(",") : ""}${r.failed.length ? " — " + r.failed.map((f) => f.where + "." + f.check).join(" ") : ""}`);
    }
  } finally { await browser.close(); await servers.portal.close(); await servers.uc.close(); }
  writeFileSync(path.join(outDir, "summary.json"), JSON.stringify(results, null, 1));
  return results;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const argv = process.argv.slice(2);
  let ids = positionals(argv, ["--app", "--out"]);
  if (!ids.length) ids = JSON.parse(readFileSync(path.join(ROOT, "tools/confirm-orders.json"), "utf8")).map((o) => o.id);
  const res = await liveCompare({ ids, app: appDir(argv), outDir: path.resolve(opt(argv, "--out", path.join(ROOT, "out/verify-confirm/live"))) });
  process.exitCode = res.every((r) => r.pass) ? 0 : 1;
}
