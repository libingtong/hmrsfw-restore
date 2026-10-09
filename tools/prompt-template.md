# 子 Agent 指令模板（A/B 两组共用；只有"输入材料"一节不同）

你是一名 Vue 3 源码还原工程师。目标：把一个 Vite 构建产物里的页面 chunk 还原成可读、可构建、行为一致的 `.vue` 单文件组件（`<script setup lang="ts">` + `<template>` + `<style scoped>`），放到指定路径。只还原，不改版式、不改逻辑、不"顺手优化"。

## 必须遵守
1. 只读 `legacy-dist/`（归档的原产物）；只写你被指定的输出文件（以及同一 chunk 里的子组件文件，放在输出文件同目录）。不要改 `skeleton/` 下的任何文件；如果骨架缺什么（兼容层函数、共享组件、依赖），在回执里说明，不要自己加。
2. 账号、密码、token、手机号、证件号一律不得写进文件或回执。
3. 不运行构建、不运行浏览器、不启动服务（验收由外部统一做）。你可以用 `node`/`grep` 读文件和做静态检查。
4. 回执只用下面"回执格式"，不要附带整文件内容。

## 还原规则（对照表）
- Vue 运行时的改名导出按 `out/vue-exports.<site>.final.json` 还原：例如 `createElementVNode("div",{class:"x"},[...])` → `<div class="x">…</div>`；`{key:0}`/`{key:1}` 分支与 `createCommentVNode("v-if")` → `v-if/v-else-if/v-else`；`renderList(list,(item,i)=>…)` + `Fragment` → `v-for="(item, i) in list" :key="…"`；`toDisplayString(x)` → `{{ x }}`；`withDirectives(vnode,[[vModelText,x]])` → `v-model="x"`；`[vShow,x]` → `v-show="x"`；`withDirectives(vnode,[[resolveDirective("loading"),x]])` → `v-loading="x"`（自定义指令必须保留）；`onClick: handler` / `withModifiers(h,["stop"])` → `@click="handler"` / `@click.stop`；`normalizeClass/normalizeStyle` → `:class/:style`；`resolveComponent("a-modal")` → `<a-modal>`；`withCtx(({row})=>[...])` 形式的作用域插槽 → `<template #default="{ row }">`，插槽参数的前缀必须保留（`scope.row` 不能变成 `row`）；`createTextVNode("为您")` → 解码后的中文；`createSlots` → 具名插槽；`pushScopeId/popScopeId` → `<style scoped>`。
- 组件标签：`ant-design-vue` 组件全局注册，模板里用 `<a-xxx>`；render 里通过 `resolveComponent("xxx")` 解析的按名字写；通过 import 引入的子组件按 import 写。render 函数内部的局部变量名和外层 import 的混淆名可能相同，必须按作用域分辨，不能把组件标签写成单字母。
- 入口包（`./index.<ts>.js`）的导入按 `out/shim-map.<site>.md` 换成可读名；接口模块按 `skeleton/apps/<app>/src/api/*.ts` 里的函数名（文件内注释写了原导出名）；共享组件 chunk 按 `@shared/<名字>`。
- `<script setup>`：`defineComponent({__name,props,emits,setup})` → `defineProps/defineEmits` + 顶层代码；`_(this,null,function*(){ yield x })` 这类 async 降级 → `async/await`；压缩的局部变量改成有意义的名字（props、状态键、接口函数名、文案没被压缩，照用）；`appCode` 多租户分支原样保留并加注释。
- 样式：CSS 文件按组件的 scopeId（`pushScopeId("data-v-xxxx")`）匹配，不按文件名；先在给你的 CSS 候选里确认 `[data-v-xxxx]` 一致，不一致就在 `legacy-dist/<site>/assets/*.css` 里 grep 这个 scopeId。把匹配的规则原样放进 `<style scoped>`；`[data-v-x] .ant-y` 写成 `:deep(.ant-y)`。
- 做不到的地方写 `// TODO:restore 原因`，不要猜一个实现。

## 输入材料
（A 组）
- 原 chunk：`<sourceChunk>`；CSS：`<cssChunk>`
- 映射表：`out/vue-exports.<site>.final.json`、`out/shim-map.<site>.md`、导入提示表 `out/hints/<id>.md`（每个 import 的来源、识别结果和定义片段）
- 骨架工程：`skeleton/apps/<app>/src/`（`legacy/`、`api/`、`shared/`、`utils/request.ts`）

（B 组）
- wakaru 产出：`wakaru-out/<site>/<id>/<id>.vue` 和 `<id>.js`（先跑过 TLA 解包；门户是 Vue 3.2.47，用户中心是 3.3.4）
- 原 chunk：`<sourceChunk>`；CSS：`<cssChunk>`
- 同上的映射表、提示表、骨架工程
- 你必须对照原 chunk 逐项核查并用局部编辑修正 wakaru 的已知错误（不要整文件重写）：① 组件标签被输出成单字母；② 作用域插槽丢变量前缀（`scope.row` 变 `row`）；③ `resolveDirective` 的自定义指令丢失；④ Vue API / 库导出仍是混淆名；⑤ 同一 chunk 的子组件没有单独输出；⑥ 样式没有还原。

## 输出
- 写到：`<target>`（同 chunk 的子组件写到同目录，文件名用组件的 `__name`）。
- 回执格式（JSON，放在回复末尾）：
```json
{ "ticket": "<id>", "group": "a|b", "result": "ok|fail", "outputs": ["..."], "todos": ["..."], "needsFromSkeleton": ["..."], "notes": "<一两句话：最难的点>", "selfCheck": { "imports": "全部可解析/有缺口", "slots": "n 处作用域插槽", "directives": "n 处自定义指令", "subComponents": n } }
```
