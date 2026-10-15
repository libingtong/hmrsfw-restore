// Static stage of the gate (docs/pipeline.md §7.3.1): the restorer's self-check (tools/self-check.mjs, owned by the
// self-check task; called as in §12: `self-check.mjs <work order id>` → {pass, failed:[{check, where, hint}]}; its
// report-only render-equiv is skipped) plus the zero-reference check, which belongs to the gate.
import { execFile } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { ROOT } from "./common.mjs";
import { scanNoLegacy } from "../check-no-legacy.mjs";

const run = promisify(execFile);

export function pageFiles(wo, appDir) {
  const files = [];
  if (wo.target) { const t = path.join(appDir, wo.target); if (existsSync(t)) files.push(t); }
  const walk = (d) => { for (const n of readdirSync(d)) { const p = path.join(d, n); if (statSync(p).isDirectory()) walk(p); else files.push(p); } };
  if (wo.subComponentDir) { const d = path.join(appDir, wo.subComponentDir); if (existsSync(d) && statSync(d).isDirectory()) walk(d); }
  return [...new Set(files)];
}

// Verdict of one self-check.mjs run (§12: exit 0 pass, 1 fail, 2 the check itself could not run). Anything but a clean
// pass is a failure: exit code 2, an `error` field, pass:false without failure items, no JSON, or a crash. Items with
// severity "warn" do not fail the gate (self-check's own pass ignores them too).
export function selfCheckVerdict({ code, stdout, crash }, id) {
  const fail = (hint) => [{ check: "self-check", where: id, hint: String(hint).split("\n")[0].slice(0, 200) }];
  let r = null;
  const text = (stdout ?? "").trim();
  try { r = JSON.parse(text); } catch { const line = text.split("\n").reverse().find((l) => l.startsWith("{")); try { r = line ? JSON.parse(line) : null; } catch { r = null; } }
  if (!r || typeof r !== "object") return fail(crash ? `self-check.mjs crashed: ${crash}` : `self-check.mjs gave no JSON (exit ${code})`);
  if (r.error || code === 2) return fail(`self-check.mjs could not run: ${r.error ?? `exit ${code}`}`);
  const items = (Array.isArray(r.failed) ? r.failed : []).filter((f) => f?.severity !== "warn");
  if (r.pass === true && code === 0 && !items.length) return [];
  if (r.pass !== false || code !== 1) return fail(`self-check.mjs output inconsistent (pass ${r.pass}, exit ${code}, ${items.length} failure(s))`);
  return items.length ? items : fail("self-check.mjs reported pass:false without failure items");
}

async function selfCheck(wo, appDir, script = path.join(ROOT, "tools/self-check.mjs")) {
  let res;
  // POC pages (c01…, p1…) are checked under their queue/ id; the result stays keyed by the gate's id.
  try { res = { code: 0, stdout: (await run(process.execPath, [script, wo.queueId ?? wo.id, "--app", appDir, "--no-render-equiv"], { cwd: ROOT, maxBuffer: 64 << 20, timeout: 300000 })).stdout }; }
  catch (e) { res = { code: typeof e.code === "number" ? e.code : null, stdout: e.stdout ?? "", crash: e.killed ? "timed out" : typeof e.code === "number" ? null : String(e.message) }; }
  return selfCheckVerdict(res, wo.id);
}

// Integration mode: whom a file outside the judged pages belongs to, so a global failure is traced to the order that has
// to fix it (§3.8: integration failures go back to the shared component or entry package, not to the page).
// layer: page / shared / entry / api / utils / shell (public/, App.vue, main.ts, router …); owner: the queue/ order whose
// target, files, outputs or subComponentDir holds the file (none for api/ and shell files, which no order owns).
let ownerIndex = null;
export function ownerOf(rel, queueDir = path.join(ROOT, "queue")) {
  if (!ownerIndex) {
    ownerIndex = { files: new Map(), dirs: [] };
    for (const n of existsSync(queueDir) ? readdirSync(queueDir) : []) {
      if (!n.endsWith(".json") || ["index.json", "routes.json", "summary.json"].includes(n)) continue;
      const o = JSON.parse(readFileSync(path.join(queueDir, n), "utf8"));
      if (!o.id || ["segmented", "npm"].includes(o.status)) continue;
      for (const f of [o.target, ...(o.files ?? []), ...(o.outputs ?? [])].filter(Boolean)) ownerIndex.files.set(f, o);
      if (o.subComponentDir) ownerIndex.dirs.push([o.subComponentDir.replace(/\/?$/, "/"), o]);
    }
    ownerIndex.dirs.sort((a, b) => b[0].length - a[0].length);
  }
  const o = ownerIndex.files.get(rel) ?? ownerIndex.dirs.find(([d]) => rel.startsWith(d))?.[1];
  const m = /^apps\/[^/]+\/src\/(views|shared|legacy|api|utils)\//.exec(rel);
  const layer = o ? { page: "page", segment: "page", shared: "shared", entry: "entry" }[o.type] ?? o.type : { views: "page", shared: "shared", legacy: "entry", api: "api", utils: "utils" }[m?.[1]] ?? "shell";
  return { layer, ...(o ? { owner: o.id } : {}) };
}

// mode "page": self-check + zero-reference on the page's own files; "integration": zero-reference over all of apps/.
export async function staticStage({ wos, appDir, mode, selfCheckScript }) {
  const t0 = Date.now();
  const failed = {};
  for (const wo of wos) {
    failed[wo.id] = (await selfCheck(wo, appDir, selfCheckScript)).map((f) => ({ ...f, check: f.check ?? "self-check" }));
    if (mode === "page") {
      // self-check.mjs runs the same scan (so the restorer sees it before handing over); report each file once
      const seen = new Set(failed[wo.id].filter((f) => f.check === "no-legacy").map((f) => `${f.where}\0${String(f.hint).split("：")[0]}`));
      const z = scanNoLegacy({ root: appDir, files: pageFiles(wo, appDir) });
      for (const h of z.hits) if (!seen.has(`${h.file}\0${h.rule} ×${h.count}`)) failed[wo.id].push({ check: "no-legacy", where: h.file, hint: `${h.rule} ×${h.count}` });
    }
  }
  let global = [];
  if (mode === "integration") global = scanNoLegacy({ root: path.join(appDir, "apps") }).hits.map((h) => ({ check: "no-legacy", where: "apps/" + h.file, hint: `${h.rule} ×${h.count}`, ...ownerOf("apps/" + h.file) }));
  return { failed, global, ms: Date.now() - t0 };
}
