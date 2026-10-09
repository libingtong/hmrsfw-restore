// Completion gate: copied-content detection. Compares a restored project against legacy-dist by
//   1) whole-file SHA-256 (any file type), and
//   2) long fragments of text files: 160-char windows starting right after a token boundary (; { } , ( newline),
//      so the same code/CSS aligns no matter where it sits in a file. A text file "hits" when ≥ 3 of its windows,
//      or ≥ 2% of them, also occur in the archive.
// Images/fonts/media that match whole-file are reported separately as "asset reuse" (the plan allows them only when
// renamed and registered); any code/CSS/JSON hit counts as NOT DONE.
// Usage: node tools/check-copied.mjs <dir> [--archive legacy-dist] [--json]       (e.g. <hmrsfw-vue>/apps)
// self-check.mjs uses indexArchive()/scanFiles() with only the order's own chunk, CSS and imported chunks as archive.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { pathToFileURL } from "node:url";

const SKIP = new Set(["node_modules", "dist", ".git"]);
const TEXT = /\.(js|mjs|cjs|ts|vue|css|scss|less|json|html|svg|map)$/i;
const W = 160, MIN_ABS = 3, MIN_RATIO = 0.02;
export const listFiles = (dir) => { const out = []; const walk = (d) => { for (const n of readdirSync(d)) { if (SKIP.has(n)) continue; const p = path.join(d, n); const st = statSync(p); if (st.isDirectory()) walk(p); else out.push(p); } }; walk(dir); return out; };
const sha = (buf) => createHash("sha256").update(buf).digest("hex");
const h64 = (s) => createHash("md5").update(s).digest("base64").slice(0, 12);
// Long regular-expression literals (id-card, phone validators) must stay verbatim in a faithful restoration, and their many
// "(" give dozens of overlapping windows; they are masked on both sides so they cannot count as copied code.
const REGEX_LITERAL = /(?<=[(=:,!&|?{};]\s*|return\s+)\/(?![/*])(?:\\.|\[(?:\\.|[^\]\\\n])*\]|[^/\\\n[]){30,}\/[dgimsuy]*/g;
const norm = (t) => t.replace(/\r\n/g, "\n").replace(REGEX_LITERAL, "/R/").replace(/[ \t]+/g, " ");
const windows = (text) => { const t = norm(text); const out = []; for (let i = 0; i + W <= t.length; i++) { const c = t[i - 1]; if (i === 0 || c === ";" || c === "{" || c === "}" || c === "," || c === "(" || c === "\n") out.push(h64(t.slice(i, i + W))); } return out; };

export function indexArchive(files, rel = (p) => p) {
  const fileHashes = new Map(), fragments = new Set();
  for (const p of files) {
    const buf = readFileSync(p); fileHashes.set(sha(buf), rel(p));
    if (TEXT.test(p) && buf.length < 8e6) for (const w of windows(buf.toString("utf8"))) fragments.add(w);
  }
  return { fileHashes, fragments };
}

export function scanFiles(files, { fileHashes, fragments }, rel = (p) => p) {
  const code = [], assets = [];
  for (const p of files) {
    const buf = readFileSync(p); const same = fileHashes.get(sha(buf));
    if (!TEXT.test(p)) { if (same) assets.push({ file: rel(p), archived: same, bytes: buf.length }); continue; }
    if (same) { code.push({ file: rel(p), kind: "whole-file", archived: same, bytes: buf.length }); continue; }
    const ws = windows(buf.toString("utf8")); if (!ws.length) continue;
    const hit = ws.filter((w) => fragments.has(w)).length;
    if (hit >= MIN_ABS && hit / ws.length >= MIN_RATIO || hit >= 50) code.push({ file: rel(p), kind: "fragments", hitWindows: hit, windows: ws.length, ratio: +(hit / ws.length).toFixed(3), bytes: buf.length });
  }
  return { code: code.sort((a, b) => b.bytes - a.bytes), assets };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const rootArg = args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--archive");
  if (!rootArg) { console.error("usage: node tools/check-copied.mjs <dir to check, e.g. <hmrsfw-vue>/apps> [--archive legacy-dist] [--json]"); process.exit(2); }
  const root = path.resolve(rootArg);
  const archive = path.resolve(args.includes("--archive") ? args[args.indexOf("--archive") + 1] : "legacy-dist");
  const idx = indexArchive(listFiles(archive), (p) => path.relative(archive, p));
  const { code, assets } = scanFiles(listFiles(root), idx, (p) => path.relative(root, p));
  const report = { root, archive, archiveFiles: idx.fileHashes.size, archiveFragments: idx.fragments.size, codeHits: code.length, assetReuse: assets.length, code, assetsSample: assets.slice(0, 10) };
  if (args.includes("--json")) console.log(JSON.stringify(report, null, 1));
  else {
    console.log(`root ${root}\narchive ${archive} (${idx.fileHashes.size} files, ${idx.fragments.size} fragments)`);
    console.log(`code/CSS hits (not done): ${code.length}`); code.slice(0, 20).forEach((c) => console.log(`  ${c.kind.padEnd(10)} ${c.file} ${c.bytes}B ${c.kind === "fragments" ? `${c.hitWindows}/${c.windows} windows` : "= " + c.archived}`));
    console.log(`asset reuse (allowed only if renamed + registered): ${assets.length}`);
  }
  process.exitCode = code.length ? 1 : 0;
}
