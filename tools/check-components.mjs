// Static check: the restored order delivers as many components as the original chunk defines (batch-plan.md §3.2,
// global doc §六 页面还原 5). The chunk's components come from its `__name` / defineComponent({name}) definitions and are
// listed in the work order (`components`); each one must become its own .vue file: the main component at `target`, the
// others under `subComponentDir` (or next to the target, as the POC pages were laid out).
// Unresolved component names (used in a template but neither imported nor global) are checked by check-imports.mjs.
// Usage: node tools/check-components.mjs <order id> --app <hmrsfw-vue>   → JSON {pass, failed:[{check, where, hint}]}
import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { loadOrder, orderFiles } from "./sfc-util.mjs";
import { appDir } from "./app-dir.mjs";

export function checkComponents(order, APP, { files = orderFiles(order, APP) } = {}) {
  APP = path.resolve(APP);
  const failed = []; const vue = files.filter((f) => f.endsWith(".vue"));
  const expected = order.components ?? [];
  // a non-assembling segment delivers the target only when it holds the page's main component (the last component of the
  // page order, not of the segment); otherwise the target is another segment's output
  const mainName = order.type === "segment" && !order.assemble ? pageMain(order) : null;
  if (order.target && !existsSync(path.join(APP, order.target)) && (order.type !== "segment" || order.assemble || expected.some((c) => c.name === mainName)))
    failed.push({ check: "components", where: order.target, hint: `目标文件 ${order.target} 不存在：主组件必须写到工单 target 指定的路径` });
  if (order.type === "segment" && !order.assemble) {
    for (const out of order.outputs ?? []) if (!existsSync(path.join(APP, out))) failed.push({ check: "components", where: out, hint: `本分段要交付 ${out}，文件不存在` });
    return { failed, stats: { expected: (order.outputs ?? []).length } };
  }
  if (expected.length && vue.length !== expected.length) {
    const names = new Set(vue.map((f) => path.basename(f, ".vue")));
    const missing = expected.map((c) => c.name).filter((n, i, all) => i < all.length - 1 && !names.has(n));
    failed.push({ check: "components", where: order.subComponentDir ?? order.target, hint: `原 chunk 定义了 ${expected.length} 个组件（${expected.map((c) => c.name).join("、")}），还原版交付了 ${vue.length} 个 .vue。${vue.length < expected.length ? `每个组件单独一个文件：主组件写到 target，其余写到 ${order.subComponentDir ?? path.dirname(order.target ?? "") + "/"}<组件名>.vue${missing.length ? `（可能缺：${missing.join("、")}）` : ""}；不要把子组件合并进主组件` : "不要拆出原包里没有的组件"}` });
  }
  return { failed, stats: { expected: expected.length, delivered: vue.length } };
}

function pageMain(order) { try { return loadOrder(order.page).components?.at(-1)?.name ?? null; } catch { return null; } }

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const id = process.argv.slice(2).find((a, i, all) => !a.startsWith("--") && all[i - 1] !== "--app");
  const r = checkComponents(loadOrder(id), appDir());
  console.log(JSON.stringify({ pass: !r.failed.length, failed: r.failed, stats: r.stats }, null, 1));
  process.exitCode = r.failed.length ? 1 : 0;
}
