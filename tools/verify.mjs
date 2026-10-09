// Replay comparison for the first 10 POC pages (tools/poc-orders.json: p1–p6 portal, u1–u4 user center), now the same
// live comparison as verify-confirm.mjs (original legacy-dist vs <app>/dist build, same HAR, gate comparison rules).
//   node tools/verify.mjs <site: portal|usercenter> [ids...] [--app <hmrsfw-vue checkout>] [--out <dir>]
//   → out/verify/<site>/<id>.json + screenshots, summary.json
import { readFileSync } from "node:fs";
import path from "node:path";
import { appDir } from "./app-dir.mjs";
import { ROOT, opt, positionals } from "./gate/common.mjs";
import { liveCompare } from "./verify-confirm.mjs";

const argv = process.argv.slice(2);
const [site, ...rest] = positionals(argv, ["--app", "--out"]);
const only = rest.filter((x) => !/^(a|b|final)$/.test(x)); // the POC's group argument is gone (one product project)
const ids = JSON.parse(readFileSync(path.join(ROOT, "tools/poc-orders.json"), "utf8")).filter((o) => o.site === site && (!only.length || only.includes(o.id))).map((o) => o.id);
if (!ids.length) { console.error("usage: node tools/verify.mjs <portal|usercenter> [ids...] [--app <dir>]"); process.exit(2); }
const res = await liveCompare({ ids, app: appDir(argv), outDir: path.resolve(opt(argv, "--out", path.join(ROOT, "out/verify", site))) });
process.exitCode = res.every((r) => r.pass) ? 0 : 1;
