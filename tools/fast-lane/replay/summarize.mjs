// Prints one line per page from a summary.json written by verify-confirm.mjs / verify.mjs. Pure reporting; no judging.
// Usage: node summarize.mjs <confirm|legacy10> <summary.json> [label]
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
const [kind, file, label = "", idsArg = ""] = process.argv.slice(2);
if (!existsSync(file)) { console.log(`${label}(no results: ${file})`); process.exit(2); }
// <file> may be a summary.json or a results directory (then every <id>.json in it is one row, so chunked runs accumulate).
const ids = idsArg.split(/[ ,]+/).filter(Boolean);
let rows;
if (statSync(file).isDirectory()) {
  const cut = (o) => { const { origHtml, restHtml, origText, restText, origReq, restReq, shellReq, ...r } = o; return r; };
  rows = readdirSync(file).filter((f) => /^[a-z0-9]+\.json$/i.test(f) && f !== "summary.json").sort().map((f) => cut(JSON.parse(readFileSync(path.join(file, f), "utf8"))));
} else rows = JSON.parse(readFileSync(file, "utf8"));
if (ids.length) rows = rows.filter((r) => ids.includes(r.id));
let pass = 0;
for (const r of rows) {
  const why = [];
  if (!r.pass) {
    if (kind === "confirm") {
      if (r.origEmpty) why.push("original rendered empty (page root not found)");
      if (!r.htmlSame) why.push("html differs");
      if (!r.textSame) why.push("innerText differs");
      if (!r.overlaySame) why.push("overlay differs");
      if (!r.requestsSame) why.push("request set differs");
      if (r.pixel > 0.5) why.push(`pixel ${r.pixel}%`);
      if (r.errors?.rest?.length) why.push(`rest pageerror: ${r.errors.rest[0].slice(0, 90)}`);
    } else {
      if (!r.htmlSame) why.push("html differs");
      if (!r.textSame) why.push("innerText differs");
      if (!r.requests?.sameSet) why.push(`requests missing=${r.requests?.missing?.length} extra=${r.requests?.extra?.length}`);
      if (r.screenshot?.ratio > 0.005) why.push(`pixel ${(r.screenshot.ratio * 100).toFixed(2)}%`);
      if (r.errors?.restored?.length) why.push(`rest error: ${String(r.errors.restored[0]).slice(0, 90)}`);
    }
  } else pass++;
  console.log(`${label}${r.id}${r.route ? " " + r.route : ""}\t${r.pass ? "PASS" : "FAIL"}${why.length ? "\t" + why.join("; ") : ""}`);
}
console.log(`${label}TOTAL ${pass}/${rows.length} pass`);
process.exit(pass === rows.length ? 0 : 1);
