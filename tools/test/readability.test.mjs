// Readability check (check-readability.mjs), the sampler (readability-sample.mjs) and the registry business names (HM-19).
// Run: HMRSFW_APP_DIR=<hmrsfw-vue checkout> node --test tools/test/readability.test.mjs   (the checker needs the app's @vue/compiler-sfc)
import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { appDir } from "../app-dir.mjs";
import { compilerSfc } from "../sfc-util.mjs";
import { checkSource, loadRules, registryOriginals } from "../check-readability.mjs";
import { DIMENSIONS, bandOf, pickSample, renderSample, summarize } from "../readability-sample.mjs";
import { nameStats, isShortName } from "../registry.mjs";

let APP = null; try { APP = appDir(); } catch { /* no checkout: the checker tests are skipped */ }
const needApp = { skip: APP ? false : "HMRSFW_APP_DIR not set" };
const rules = (over = {}) => { const r = loadRules(); return { ...r, ...over, thresholds: { ...r.thresholds, ...(over.thresholds ?? {}) } }; };
const run = (src, over = {}, name = "apps/uc/src/views/page.vue") => checkSource(path.join(APP, name), src, { APP, rules: rules(over), sfc: compilerSfc(APP), originals: registryOriginals("uc") });
const hints = (items) => items.map((i) => i.hint).join("\n");

const GOOD = `<template>
  <div class="box">
    <a-table :data-source="rowList">
      <template #bodyCell="{ column, record }">{{ record.name }}</template>
    </a-table>
    <p v-for="(item, index) in rowList" :key="index">{{ item }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getDictListByType } from "@/legacy";

const rowList = ref<string[]>([]);
function loadRows(e?: unknown) {
  for (let i = 0; i < 3; i++) rowList.value.push(String(i));
  return getDictListByType({ e });
}
onMounted(() => loadRows());
</script>
`;
const BAD = `<template>
  <div>
    <span>{{ _ctx.title }}</span>
    <p v-if="false">never</p>
    <p v-for="(a, b) in list" :key="b">{{ a }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from "vue";
import { getDictListByType as L } from "@/legacy";
const list = ref([]);
const _hoisted_1 = h("div", null, "x");
const bb = (t: any) => L(t).then((r: any) => { list.value = r; });
</script>
`;

test("readable page: no item", needApp, () => assert.deepEqual(run(GOOD), []));

test("bad page: names, render function, compile traces, dead branch — each with a hint that says what to do", needApp, () => {
  const items = run(BAD); const text = hints(items);
  assert.ok(items.every((i) => i.check === "readability" && /:\d+$/.test(i.where)), JSON.stringify(items));
  assert.match(text, /标识符名字不可读.*\bL\b.*import 的是 getDictListByType/s, "alias L → use the imported name");
  for (const name of ["bb", "r", "t", "a", "b"]) assert.match(text, new RegExp(`\\b${name}（第`), `${name} flagged`);
  assert.match(text, /手写渲染函数：h\(\)/);
  assert.match(text, /v-if="false" 是死分支/);
  assert.match(text, /_ctx ×1/); assert.match(text, /_hoisted_1 ×1/);
});

test("mode: report → severity warn, block → none", needApp, () => {
  assert.ok(run(BAD, { mode: "report" }).every((i) => i.severity === "warn"));
  assert.ok(run(BAD, { mode: "block" }).every((i) => i.severity === undefined));
});

test("whitelist: i j k e _ allowed as local names, never as an import alias", needApp, () => {
  const ok = `<script setup lang="ts">\nconst list = [1].map((_, i) => { try { return i; } catch (e) { return e; } });\nconsole.log(list);\n</script>\n`;
  assert.deepEqual(run(ok), []);
  const alias = `<script setup lang="ts">\nimport { getDictListByType as e } from "@/legacy";\nconsole.log(e);\n</script>\n`;
  assert.match(hints(run(alias)), /\be（第 2 行/);
});

test("provenance comments may name the original (__name, data-v-…); code may not", needApp, () => {
  const c = `<script setup lang="ts">\n// 还原自原包（__name: index，_ctx 在注释里）\nconst title = "x";\nconsole.log(title);\n</script>\n`;
  assert.deepEqual(run(c), []);
  assert.match(hints(run(`<script setup lang="ts">\nconst o = { __name: "index" };\nconsole.log(o);\n</script>\n`)), /__name/);
});

test("size limits come from the rules file", needApp, () => {
  const long = `<script setup lang="ts">\nfunction work() {\n${"  console.log(1);\n".repeat(30)}}\nwork();\n</script>\n`;
  assert.deepEqual(run(long), []);
  const text = hints(run(long, { thresholds: { functionLines: 10, setupLines: 20, fileLines: 25 } }));
  assert.match(text, /函数 work 有 32 行，超过上限 10/); assert.match(text, /setup 有 \d+ 行，超过上限 20/); assert.match(text, /文件有 \d+ 行，超过上限 25/);
});

test("hand-written render: render() option and createVNode import", needApp, () => {
  const r = `<script lang="ts">\nimport { defineComponent, createVNode } from "vue";\nexport default defineComponent({ render() { return createVNode("div"); } });\n</script>\n`;
  assert.match(hints(run(r)), /手写渲染函数/);
});

test("sampler: 5 % of 20 pages is 1 page, deterministic, covers bands in proportion; min applies", () => {
  const pages = Array.from({ length: 20 }, (_, i) => ({ wo: `p${String(i).padStart(2, "0")}`, kb: i < 12 ? 3 : i < 18 ? 12 : 40, family: i % 2 ? "deepseek" : "anthropic" }));
  const a = pickSample(pages, { rate: 0.05, min: 1, key: "reg-1" }), b = pickSample(pages, { rate: 0.05, min: 1, key: "reg-1" });
  assert.equal(a.n, 1); assert.deepEqual(a.picked.map((p) => p.wo), b.picked.map((p) => p.wo));
  const big = pickSample(pages, { rate: 0.5, key: "k" }); assert.equal(big.n, 10);
  const bands = Object.fromEntries(["simple", "medium", "large"].map((x) => [x, big.picked.filter((p) => p.band === x).length]));
  assert.deepEqual(bands, { simple: 6, medium: 3, large: 1 }, "systematic sampling keeps the band proportions");
  assert.equal(pickSample([{ wo: "only", kb: 1 }], { rate: 0.05, min: 1 }).n, 1);
  assert.equal(pickSample([], {}).n, 0);
  assert.equal(bandOf(4.9), "simple"); assert.equal(bandOf(5), "medium"); assert.equal(bandOf(30), "large");
});

test("sampler: text has the scoring table; low scores flow into the summary, with the machine verdict", () => {
  const s = { key: "reg-1", N: 20, n: 1, rate: 0.05, strata: { "simple/anthropic": { pages: 6, picked: 1 } }, picked: [{ wo: "p01", band: "simple", family: "anthropic", kb: 3, metrics: { files: ["apps/uc/src/views/p01.vue"], lines: 120, setupLines: 60, items: 0, badIdentifiers: 0 } }] };
  const text = renderSample(s, { ref: "abcdef012345" });
  assert.match(text, /可读性抽检 `reg-1`/); assert.match(text, new RegExp(`${DIMENSIONS.join("（1–5） \\| ")}`)); assert.match(text, /p01/);
  const sum = summarize([{ ...s, scores: { p01: { 命名: 2, 结构: 4, 可理解性: 4, note: "变量名像 data1" } } }]);
  assert.equal(sum.rows.length, 1); assert.match(sum.text, /命名 2/); assert.match(sum.text, /规则漏了/);
  assert.equal(summarize([{ ...s, scores: { p01: { 命名: 4, 结构: 4, 可理解性: 5 } } }]).rows.length, 0);
});

test("registry: every exported symbol has a business name and records its original", () => {
  assert.ok(isShortName("a") && isShortName("_") && isShortName("bb") && !isShortName("default") && !isShortName("getList") && !isShortName("id") === false);
  const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), "..", "..");
  for (const app of ["portal", "uc"]) {
    const reg = JSON.parse(readFileSync(path.join(ROOT, "registry", `${app}.json`), "utf8"));
    assert.deepEqual(reg.stats.names.unnamed, [], `${app}: ${reg.stats.names.unnamed.join(", ")}`);
    assert.ok(reg.stats.names.symbols > 400 && reg.stats.names.renamed > 300);
    for (const [k, r] of Object.entries(reg.entry)) if (r.status !== "ignore") assert.equal(r.original, k);
    for (const [f, r] of Object.entries(reg.shared)) for (const [a, x] of Object.entries(r.exports)) assert.equal(x.original, `${f}#${a}`);
    for (const [k, r] of Object.entries(reg.api)) assert.equal(r.original, k);
  }
  const ns = nameStats({ entry: { a: { export: "x", status: "restored" }, b: { export: "getB", status: "restored" } }, shared: {}, modules: {}, api: {} });
  assert.deepEqual(ns.unnamed, ["entry:a"]);
});
