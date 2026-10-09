// Static check: every static text node of the original render functions appears in the restored templates with the same
// characters, leading/trailing spaces included (global doc §六 页面还原 5). The POC found "搜索" vs " 搜索 " only here:
// replay compares rendered DOM after whitespace collapsing and cannot see it.
// Original side: string children of createTextVNode / createElementVNode / createVNode / createElementBlock / createBlock and
// the text of createStaticVNode, read from the chunk (only the order's byte range for a segment). Restored side: the same
// calls in each SFC template compiled with hmrsfw-vue's @vue/compiler-sfc.
// A difference only in leading/trailing whitespace is reported with severity "warn": it is a real source difference the
// restorer should fix, but replay often cannot see it (antd components, unrendered branches), so it does not fail the check.
// Usage: node tools/check-text-nodes.mjs <order id> --app <hmrsfw-vue>   → JSON {pass, failed:[{check, where, hint}]}
import path from "node:path";
import { pathToFileURL } from "node:url";
import { ROOT, chunkSource } from "./scope.mjs";
import { compilerSfc, compileSfc, loadJson, loadOrder, multisetDiff, orderFiles, originalNameOf, compiledNameOf, renderFacts } from "./sfc-util.mjs";
import { appDir } from "./app-dir.mjs";

const show = (t) => JSON.stringify(t);
export function checkTextNodes(order, APP, { files = orderFiles(order, APP), maps = loadJson(order.maps) } = {}) {
  const chunk = order.sourceChunk.split("/").pop();
  const orig = renderFacts(chunkSource(order.site, chunk), originalNameOf(maps.vue), { range: order.type === "segment" ? order.range : null }).texts;
  const sfc = compilerSfc(APP); const restored = []; const where = new Map();
  for (const f of files) { const c = compileSfc(sfc, f); if (!c.code) continue; for (const t of renderFacts(c.code, compiledNameOf).texts) { restored.push(t); if (!where.has(t)) where.set(t, path.relative(APP, f)); } }
  const { onlyA: missing, onlyB: extra } = multisetDiff(orig, restored);
  const failed = []; const extraLeft = [...extra];
  for (const t of missing) {
    const twin = extraLeft.findIndex((x) => x.trim() === t.trim() && x.trim() !== "");
    if (twin >= 0) { const r = extraLeft.splice(twin, 1)[0]; failed.push({ check: "text-nodes", where: where.get(r) ?? order.target, severity: "warn", hint: `文本空白不一致：原 render 是 ${show(t)}，还原版是 ${show(r)}。${t.trim() === t ? "原文本没有首尾空格：把文本和标签写在同一行，如 <span>" + t + "</span>" : "原文本带首尾空格：保留空格，如 <span>" + t + "</span>"}` }); }
    else if (t.trim() === "") failed.push({ check: "text-nodes", where: order.target, severity: "warn", hint: `缺少一个纯空白文本节点 ${show(t)}：原模板在两个元素之间有空格（同一行书写），还原版把它们写成了分行或去掉了空格` });
    else failed.push({ check: "text-nodes", where: order.target, hint: `缺少文本 ${show(t)}：原 render 里有这段静态文本，还原版模板里找不到（检查是否漏了分支、写成了插值，或改了文字）` });
  }
  for (const r of extraLeft) if (r.trim() !== "") failed.push({ check: "text-nodes", where: where.get(r) ?? order.target, hint: `多出文本 ${show(r)}：原 render 里没有这段静态文本，删掉或改回原文` });
  return { failed, stats: { original: orig.length, restored: restored.length }, errors: failed.filter((x) => x.severity !== "warn").length };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const id = process.argv.slice(2).find((a, i, all) => !a.startsWith("--") && all[i - 1] !== "--app");
  const r = checkTextNodes(loadOrder(id), appDir());
  console.log(JSON.stringify({ pass: !r.errors, failed: r.failed, stats: r.stats }, null, 1));
  process.exitCode = r.errors ? 1 : 0;
}
