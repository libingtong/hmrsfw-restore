// Interaction comparison (POC confirmation tool). The interaction steps now run inside the same page session as the
// load comparison, so this is verify-confirm.mjs restricted to the pages that have an interaction script
// (tests/interact/<id>.json or tools/interact-scripts.mjs). Every /xf-api/ request is answered from the HAR or the
// "not in HAR" stub (tools/gate/har.mjs); nothing reaches the test environment. Decrypted request bodies stay in memory;
// reports keep their SHA-256 only.
//   node tools/interact-confirm.mjs [ids...] [--app <hmrsfw-vue checkout>] [--out <dir>]   (default out: out/interact-confirm/live/)
import { readFileSync } from "node:fs";
import path from "node:path";
import { appDir } from "./app-dir.mjs";
import { ROOT, opt, positionals } from "./gate/common.mjs";
import { liveCompare } from "./verify-confirm.mjs";

const argv = process.argv.slice(2);
let ids = positionals(argv, ["--app", "--out"]);
if (!ids.length) ids = JSON.parse(readFileSync(path.join(ROOT, "tools/confirm-orders.json"), "utf8")).map((o) => o.id);
const res = await liveCompare({ ids, app: appDir(argv), outDir: path.resolve(opt(argv, "--out", path.join(ROOT, "out/interact-confirm/live"))), filter: (wo, steps) => !!steps?.length });
process.exitCode = res.every((r) => r.pass) ? 0 : 1;
