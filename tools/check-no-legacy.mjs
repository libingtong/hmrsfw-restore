// Zero-reference check (batch-plan §0.1): references to the original build in restored code. Must be 0.
// gate.mjs runs it on the page's own files in --mode page and on the whole apps/ tree in --mode integration.
// Comments count too (provenance belongs in restore-manifest.json, not in source comments).
// v3.1 layout: apps/<app>/src/legacy is the restored entry-export layer of the shared library (docs/pipeline.md §13), no
// longer the POC shim, so importing from it or living in it is not a hit; whether a page may import a path at all is
// check-imports' job (self-check.mjs).
// CLI:  node tools/check-no-legacy.mjs [<dir>] [--app <hmrsfw-vue checkout>] [--json]   (default dir: <app>/apps)
// Lib:  import { scanNoLegacy } from "./check-no-legacy.mjs"; scanNoLegacy({ root, files? }) → { root, total, byRule, hits }
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { appDir } from "./app-dir.mjs";

const SKIP = new Set(["node_modules", "dist", ".git"]);
const TEXT = /\.(vue|ts|tsx|js|mjs|cjs|css|scss|less|html|json)$/;
export const RULES = [
  { id: "legacy-dist-path", re: /legacy-dist/g, note: "import/url/src (or comment) pointing into the archive" },
  { id: "hashed-build-file", re: /[\w-]+\.\d{13,}\d*\.(js|css)\b/g, note: "build-hashed JS/CSS file name" },
  { id: "compiled-sfc-helper", re: /__vccOpts|\bpushScopeId\(|\bpopScopeId\(/g, note: "compiled SFC helpers in source" },
  { id: "bundle-banner", re: /\/\*![\s\S]{0,80}?(ant-design-vue|swiper|vue) v?\d+\.\d+/g, note: "bundled library banner (compiled bundle copied in)" },
  { id: "tenant-config", re: /var projectData\s*=|currentAppCode/g, note: "original multi-tenant config.js copied in" },
];

const walk = (dir, out = []) => {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
};

// files: absolute paths (page mode: the page's own files); default: everything under root.
export function scanNoLegacy({ root, files }) {
  root = path.resolve(root);
  const hits = [];
  for (const p of files ?? walk(root)) {
    const name = path.basename(p), rel = path.relative(root, p);
    if (!TEXT.test(name)) { if (/\.\d{13,}\d*\./.test(name)) hits.push({ rule: "hashed-asset-name", file: rel, count: 1 }); continue; }
    const text = readFileSync(p, "utf8");
    if (/\.(js|ts|vue|mjs|css)$/.test(name) && text.split("\n").some((l) => l.length > 2000)) hits.push({ rule: "minified-line", file: rel, count: 1 });
    for (const r of RULES) { const n = (text.match(r.re) || []).length; if (n) hits.push({ rule: r.id, file: rel, count: n }); }
  }
  const byRule = {};
  for (const h of hits) byRule[h.rule] = (byRule[h.rule] ?? 0) + h.count;
  return { root, total: hits.reduce((a, h) => a + h.count, 0), byRule, hits };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const dir = args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--app");
  const r = scanNoLegacy({ root: dir ? path.resolve(dir) : path.join(appDir(args), "apps") });
  if (args.includes("--json")) console.log(JSON.stringify(r, null, 1));
  else { console.log(`root ${r.root}`); console.log(`total ${r.total}`, r.byRule); }
  process.exitCode = r.hits.length ? 1 : 0;
}
