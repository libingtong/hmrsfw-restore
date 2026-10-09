// Report-only render-equivalence (batch-plan.md §3.2: not a gate until the false-positive rate is ≤ 10%). Runs
// render-equiv.mjs on the files a work order delivers against its original chunk, with the original and the restored
// render functions compiled by the same Vue version (tools/vuefp: 3.2.47, tools/vuefp33: 3.3.4).
// Usage: node tools/render-equiv-confirm.mjs <order id> [<order id> ...] --app <hmrsfw-vue>   → one JSON line per order
// self-check.mjs calls renderEquiv(); its result goes to `reports.renderEquiv`, never to `failed`.
import { execFileSync } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { ROOT } from "./scope.mjs";
import { loadOrder, orderFiles } from "./sfc-util.mjs";
import { appDir } from "./app-dir.mjs";

export function renderEquiv(order, APP, { files = orderFiles(order, APP).filter((f) => f.endsWith(".vue")) } = {}) {
  if (!files.length || !order.sourceChunk) return { skipped: "没有可比对的 .vue 文件" };
  try {
    const out = execFileSync(process.execPath, [path.join(ROOT, "tools/render-equiv.mjs"), order.site, path.join(ROOT, order.sourceChunk), ...files.map((f) => path.resolve(APP, f))], { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: 120000, env: { ...process.env, RENDER_EQUIV_NO_FILE: "1" } });
    const res = out.split("\n").filter((l) => l.startsWith("[")).flatMap((l) => JSON.parse(l)).map((x) => ({ component: x.c, result: x.r, tokens: x.t }));
    return { allEqual: res.every((x) => x.result === "EQUAL"), components: res };
  } catch (e) { return { error: String(e.stderr || e.message).split("\n").find((l) => /Error/.test(l))?.slice(0, 200) ?? "render-equiv failed" }; }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const APP = appDir(); const ids = process.argv.slice(2).filter((a, i, all) => !a.startsWith("--") && all[i - 1] !== "--app");
  for (const id of ids) console.log(JSON.stringify({ id, ...renderEquiv(loadOrder(id), APP) }));
}
