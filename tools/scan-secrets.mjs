// Completion gate item 4: secrets and personal data in a restored project. Prints file:line and rule only, never the value.
// Usage: node tools/scan-secrets.mjs <dir>        (this repo: `node tools/scan-secrets.mjs .`; the product: `node tools/scan-secrets.mjs <hmrsfw-vue>`)
// self-check.mjs calls scanSecretFiles() on the files of one work order.
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const SKIP = new Set(["node_modules", "dist", ".git", ".auth", "har", "legacy-dist", "out", ".audit"]);
const RULES = [
  ["hex-key-128+", /["'`][0-9a-fA-F]{32,}["'`]/g],
  ["mainland-mobile", /(?<!\d)1[3-9]\d{9}(?!\d)/g],
  ["id-card", /(?<!\d)\d{17}[\dXx](?!\d)/g],
  ["email", /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g],
  ["jwt-like", /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g],
  ["token-assignment", /(token|secret|password|privateKey|private_key)\s*[:=]\s*["'`][^"'`\s]{8,}["'`]/gi],
];
// Reviewed false positives (path inside hmrsfw-vue + rule + matched text), 2026-10-09: a setting-code NAME constant, and the
// author e-mail in the licence header of a vendored open-source script. Anything else on those lines still counts.
const REVIEWED = [
  { file: "apps/uc/src/legacy/index.ts", id: "token-assignment", text: "GAODE_MAP_KEY_SECRET" + ': "gaode_map_key_secret"' },
  { file: "apps/portal/public/third/assist-entry1.1.js", id: "email", text: "邮箱: duheng1100" + "@163.com" },
];
const SCANNED = /\.(vue|ts|js|mjs|json|md|html|css|env|yml|yaml)$|^\.env/;

// files: absolute paths; rel(p): the path REVIEWED entries are matched against (relative to the hmrsfw-vue root)
export function scanSecretFiles(files, rel) {
  const hits = [];
  for (const p of files) {
    const n = path.basename(p); if (!SCANNED.test(n)) continue;
    const st = statSync(p); if (st.size >= 2e6) continue;
    const r = rel(p);
    readFileSync(p, "utf8").split("\n").forEach((line, i) => {
      for (const [id, re] of RULES) {
        re.lastIndex = 0;
        const probe = REVIEWED.filter((x) => (r === x.file || r.endsWith("/" + x.file)) && x.id === id).reduce((l, x) => l.split(x.text).join(""), line);
        if (re.test(probe.replace(/\d{13,}\d*\.(js|css|png|jpg)/g, ""))) hits.push({ file: r, line: i + 1, rule: id });
      }
    });
  }
  return hits;
}

const walk = (dir, out = []) => { for (const n of readdirSync(dir)) { if (SKIP.has(n)) continue; const p = path.join(dir, n); const st = statSync(p); if (st.isDirectory()) walk(p, out); else out.push(p); } return out; };

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = path.resolve(process.argv.slice(2).find((a) => !a.startsWith("--")) ?? ".");
  const hits = scanSecretFiles(walk(root), (p) => path.relative(root, p).split(path.sep).join("/"));
  console.log(`root ${root}\nhits ${hits.length}`); hits.slice(0, 50).forEach((h) => console.log(`  ${h.file}:${h.line} ${h.rule}`));
  process.exitCode = hits.length ? 1 : 0;
}
