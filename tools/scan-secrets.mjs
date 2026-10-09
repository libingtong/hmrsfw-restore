// Completion gate item 4: secrets and personal data in a restored project. Prints file:line and rule only, never the value.
// Usage: node tools/scan-secrets.mjs <dir>
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
const root = path.resolve(process.argv.slice(2).find((a) => !a.startsWith("--")) ?? ".");
const SKIP = new Set(["node_modules", "dist", ".git", ".auth", "har", "legacy-dist", "out", ".audit"]);
const rules = [
  ["hex-key-128+", /["'`][0-9a-fA-F]{32,}["'`]/g],
  ["mainland-mobile", /(?<!\d)1[3-9]\d{9}(?!\d)/g],
  ["id-card", /(?<!\d)\d{17}[\dXx](?!\d)/g],
  ["email", /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g],
  ["jwt-like", /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g],
  ["token-assignment", /(token|secret|password|privateKey|private_key)\s*[:=]\s*["'`][^"'`\s]{8,}["'`]/gi],
];
const hits = [];
// Reviewed false positives (file + rule + matched text), 2026-10-09: a setting-code NAME constant, and the author e-mail
// in the licence header of a vendored open-source script. Anything else on those lines still counts.
const REVIEWED = [
  { file: "skeleton/apps/uc/src/legacy/index.ts", id: "token-assignment", text: 'GAODE_MAP_KEY_SECRET\u003a "gaode_map_key_secret"' },
  { file: "skeleton/apps/portal/public/third/assist-entry1.1.js", id: "email", text: "邮箱: duheng1100" + "@163.com" },
];
const walk = (dir) => { for (const n of readdirSync(dir)) { if (SKIP.has(n)) continue; const p = path.join(dir, n); const st = statSync(p); if (st.isDirectory()) walk(p); else if (/\.(vue|ts|js|mjs|json|md|html|css|env|yml|yaml)$|^\.env/.test(n) && st.size < 2e6) { readFileSync(p, "utf8").split("\n").forEach((line, i) => { for (const [id, re] of rules) { re.lastIndex = 0; const rel = path.relative(root, p); const probe = REVIEWED.filter((x) => x.file === rel && x.id === id).reduce((l, x) => l.split(x.text).join(""), line); if (re.test(probe.replace(/\d{13,}\d*\.(js|css|png|jpg)/g, ""))) hits.push(`${path.relative(root, p)}:${i + 1} ${id}`); } }); } } };
walk(root);
console.log(`root ${root}\nhits ${hits.length}`); hits.slice(0, 50).forEach((h) => console.log("  " + h));
process.exitCode = hits.length ? 1 : 0;
