// Completion gate: copied-content detection. Compares a restored project against legacy-dist by
//   1) whole-file SHA-256 (any file type), and
//   2) long fragments of text files: 160-char windows starting right after a token boundary (; { } , ( newline),
//      so the same code/CSS aligns no matter where it sits in a file. A text file "hits" when ≥ 3 of its windows,
//      or ≥ 2% of them, also occur in the archive.
// Images/fonts/media that match whole-file are reported separately as "asset reuse" (the plan allows them only when
// renamed and registered); any code/CSS/JSON hit counts as NOT DONE.
// Usage: node tools/check-copied.mjs <project dir> [--archive legacy-dist] [--json]
import { readdirSync, readFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
const args = process.argv.slice(2);
const root = path.resolve(args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--archive") ?? "skeleton/apps");
const archive = path.resolve(args[args.indexOf("--archive") + 1] && args.includes("--archive") ? args[args.indexOf("--archive") + 1] : "legacy-dist");
const SKIP = new Set(["node_modules", "dist", ".git"]);
const TEXT = /\.(js|mjs|cjs|ts|vue|css|scss|less|json|html|svg|map)$/i;
const W = 160, MIN_ABS = 3, MIN_RATIO = 0.02;
const files = (dir) => { const out = []; const walk = (d) => { for (const n of readdirSync(d)) { if (SKIP.has(n)) continue; const p = path.join(d, n); const st = statSync(p); if (st.isDirectory()) walk(p); else out.push(p); } }; walk(dir); return out; };
const sha = (buf) => createHash("sha256").update(buf).digest("hex");
const h64 = (s) => createHash("md5").update(s).digest("base64").slice(0, 12);
const norm = (t) => t.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ");
const windows = (text) => { const t = norm(text); const out = []; for (let i = 0; i + W <= t.length; i++) { const c = t[i - 1]; if (i === 0 || c === ";" || c === "{" || c === "}" || c === "," || c === "(" || c === "\n") out.push(h64(t.slice(i, i + W))); } return out; };
// index the archive
const fileHashes = new Map(), fragments = new Set();
for (const p of files(archive)) {
  const buf = readFileSync(p); fileHashes.set(sha(buf), path.relative(archive, p));
  if (TEXT.test(p) && buf.length < 8e6) for (const w of windows(buf.toString("utf8"))) fragments.add(w);
}
// scan the project
const code = [], assets = [];
for (const p of files(root)) {
  const rel = path.relative(root, p); const buf = readFileSync(p);
  const same = fileHashes.get(sha(buf));
  if (!TEXT.test(p)) { if (same) assets.push({ file: rel, archived: same, bytes: buf.length }); continue; }
  if (same) { code.push({ file: rel, kind: "whole-file", archived: same, bytes: buf.length }); continue; }
  const ws = windows(buf.toString("utf8")); if (!ws.length) continue;
  const hit = ws.filter((w) => fragments.has(w)).length;
  if (hit >= MIN_ABS && hit / ws.length >= MIN_RATIO || hit >= 50) code.push({ file: rel, kind: "fragments", hitWindows: hit, windows: ws.length, ratio: +(hit / ws.length).toFixed(3), bytes: buf.length });
}
code.sort((a, b) => b.bytes - a.bytes);
const report = { root, archive, archiveFiles: fileHashes.size, archiveFragments: fragments.size, codeHits: code.length, assetReuse: assets.length, code, assetsSample: assets.slice(0, 10) };
if (args.includes("--json")) console.log(JSON.stringify(report, null, 1));
else {
  console.log(`root ${root}\narchive ${archive} (${fileHashes.size} files, ${fragments.size} fragments)`);
  console.log(`code/CSS hits (not done): ${code.length}`); code.slice(0, 20).forEach((c) => console.log(`  ${c.kind.padEnd(10)} ${c.file} ${c.bytes}B ${c.kind === "fragments" ? `${c.hitWindows}/${c.windows} windows` : "= " + c.archived}`));
  console.log(`asset reuse (allowed only if renamed + registered): ${assets.length}`);
}
process.exitCode = code.length ? 1 : 0;
