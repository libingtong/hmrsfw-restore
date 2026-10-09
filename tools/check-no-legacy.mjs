// Completion gate (plan section 0): count references to the original build in a restored project. Must be 0.
// Usage: node tools/check-no-legacy.mjs <project dir> [--json]
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
const args = process.argv.slice(2); const root = path.resolve(args.find((a) => !a.startsWith("--")) ?? "skeleton/apps");
const SKIP = new Set(["node_modules", "dist", ".git"]);
const TEXT = /\.(vue|ts|tsx|js|mjs|cjs|css|scss|less|html|json)$/;
const rules = [
  { id: "legacy-dist-path", re: /legacy-dist/g, note: "import/url/src pointing into the archive" },
  { id: "hashed-build-file", re: /[\w-]+\.\d{13,}\d*\.(js|css)\b/g, note: "build-hashed JS/CSS file name" },
  { id: "shim-import", re: /from\s+["'](?:@\/|\.{1,2}\/(?:\.\.\/)*)legacy(?:\/[\w.-]+)?["']/g, note: "import from the POC shim layer (alias or relative)" },
  { id: "compiled-sfc-helper", re: /__vccOpts|\bpushScopeId\(|\bpopScopeId\(/g, note: "compiled SFC helpers in source" },
  { id: "bundle-banner", re: /\/\*![\s\S]{0,80}?(ant-design-vue|swiper|vue) v?\d+\.\d+/g, note: "bundled library banner (compiled bundle copied in)" },
  { id: "tenant-config", re: /var projectData\s*=|currentAppCode/g, note: "original multi-tenant config.js copied in" },
];
const hits = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = path.join(dir, name); const st = statSync(p);
    if (st.isDirectory()) { walk(p); continue; }
    const rel = path.relative(root, p);
    if (!TEXT.test(name)) { if (/\.\d{13,}\d*\./.test(name)) hits.push({ rule: "hashed-asset-name", file: rel, count: 1 }); continue; }
    if (/^legacy\//.test(rel) || rel.includes(`${path.sep}legacy${path.sep}`)) hits.push({ rule: "shim-dir", file: rel, count: 1 });
    const text = readFileSync(p, "utf8");
    if (/\.(js|ts|vue|mjs|css)$/.test(name) && text.split("\n").some((l) => l.length > 2000)) hits.push({ rule: "minified-line", file: rel, count: 1 });
    for (const r of rules) { const n = (text.match(r.re) || []).length; if (n) hits.push({ rule: r.id, file: rel, count: n }); }
  }
};
walk(root);
const byRule = {};
for (const h of hits) byRule[h.rule] = (byRule[h.rule] ?? 0) + h.count;
if (process.argv.includes("--json")) console.log(JSON.stringify({ root, total: hits.reduce((a, h) => a + h.count, 0), byRule, hits }, null, 1));
else { console.log(`root ${root}`); console.log(`total ${hits.reduce((a, h) => a + h.count, 0)}`, byRule); }
process.exitCode = hits.length ? 1 : 0;
