// Static check: every withDirectives entry of the original render (v-show, v-model on native elements, custom directives
// such as v-trim / v-click-outside) is restored as the same directive, with the same argument and modifiers, as many times
// (global doc §六 页面还原 5: same node, same expression). Expressions are renamed during restoration, so the comparison is
// by directive, argument and modifiers; the hint names the directive whose count differs. The same pass compares the number
// of v-if branches without v-else ("branches"), which catches independent v-ifs merged into a v-if / v-else chain.
// Usage: node tools/check-directives.mjs <order id> --app <hmrsfw-vue>   → JSON {pass, failed:[{check, where, hint}]}
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chunkSource } from "./scope.mjs";
import { compilerSfc, compileSfc, loadJson, loadOrder, multisetDiff, orderFiles, originalNameOf, compiledNameOf, renderFacts } from "./sfc-util.mjs";
import { appDir } from "./app-dir.mjs";

const key = (d) => `v-${d.name}${d.arg ? ":" + d.arg : ""}${d.modifiers ? "." + d.modifiers : ""}`;
export function checkDirectives(order, APP, { files = orderFiles(order, APP), maps = loadJson(order.maps) } = {}) {
  const chunk = order.sourceChunk.split("/").pop();
  const origFacts = renderFacts(chunkSource(order.site, chunk), originalNameOf(maps.vue), { range: order.type === "segment" ? order.factRanges ?? order.range : null });
  const orig = origFacts.directives.map(key);
  const sfc = compilerSfc(APP); const restored = []; const where = new Map(); let branches = 0;
  for (const f of files) { const c = compileSfc(sfc, f); if (!c.code) continue; const facts = renderFacts(c.code, compiledNameOf); branches += facts.branches; for (const d of facts.directives) { restored.push(key(d)); where.set(key(d), path.relative(APP, f)); } }
  const { onlyA: missing, onlyB: extra } = multisetDiff(orig, restored);
  const count = (xs, k) => xs.filter((x) => x === k).length;
  const failed = [];
  for (const k of new Set(missing)) failed.push({ check: "directives", where: order.target, hint: `${k} 原 render 里有 ${count(orig, k)} 处，还原版只有 ${count(restored, k)} 处：原 chunk 里每个 withDirectives([[${k.replace(/^v-/, "")}, 表达式]]) 都要在同一个节点上用同一个表达式还原成 ${k}="..."${k.startsWith("v-show") ? "（不要改写成 v-if）" : ""}` });
  for (const k of new Set(extra)) failed.push({ check: "directives", where: where.get(k) ?? order.target, hint: `${k} 还原版有 ${count(restored, k)} 处，原 render 只有 ${count(orig, k)} 处：删掉多出的 ${k}，或改回原来的写法` });
  // v-if branches without v-else (each leaves an empty comment placeholder): merging two independent v-ifs into a
  // v-if / v-else chain, or dropping a branch, changes this count (global doc §六 页面还原 1)
  if (origFacts.branches !== branches) failed.push({ check: "branches", where: order.target, hint: `没有 v-else 的 v-if 分支数不一致：原 render 有 ${origFacts.branches} 处（每处渲染为空注释占位），还原版有 ${branches} 处。${branches < origFacts.branches ? "常见原因：把相邻的两个独立三元/v-if 合并成了 v-if / v-else(-if) 链，或漏了一个分支；相邻的独立三元要还原成多个独立的 v-if" : "常见原因：把原来的 v-if / v-else 链拆成了独立的 v-if，或多写了分支"}` });
  return { failed, stats: { original: orig.length, restored: restored.length, branches: [origFacts.branches, branches] }, errors: failed.length };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const id = process.argv.slice(2).find((a, i, all) => !a.startsWith("--") && all[i - 1] !== "--app");
  const r = checkDirectives(loadOrder(id), appDir());
  console.log(JSON.stringify({ pass: !r.failed.length, failed: r.failed, stats: r.stats }, null, 1));
  process.exitCode = r.failed.length ? 1 : 0;
}
