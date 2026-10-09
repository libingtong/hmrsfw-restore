// Completion gate item 2: every in-scope route has a pass record or a blocked record with a reason.
// Usage: node tools/check-coverage.mjs <routes.json: [{site,route,chunk}]> <results.json: {"<site>:<route>": {status:"pass"|"blocked", reason?}}>
import { readFileSync } from "node:fs";
const [routesFile, resultsFile] = process.argv.slice(2);
const routes = JSON.parse(readFileSync(routesFile, "utf8")); const results = JSON.parse(readFileSync(resultsFile, "utf8"));
const missing = [], blockedNoReason = [];
for (const r of routes) { const k = `${r.site}:${r.route}`; const v = results[k]; if (!v) missing.push(k); else if (v.status === "blocked" && !v.reason) blockedNoReason.push(k); else if (!["pass", "blocked"].includes(v.status)) missing.push(k); }
const pass = routes.filter((r) => results[`${r.site}:${r.route}`]?.status === "pass").length;
console.log(`routes ${routes.length} pass ${pass} blocked ${routes.length - pass - missing.length} missing ${missing.length} blocked-without-reason ${blockedNoReason.length}`);
missing.slice(0, 30).forEach((k) => console.log("  missing " + k));
process.exitCode = missing.length || blockedNoReason.length ? 1 : 0;
