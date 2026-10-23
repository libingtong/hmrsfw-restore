# 页面还原与门槛

## 1. 工单：一张页面单的输入

工单 `queue/<id>.json` 由 `work-orders.mjs` 生成，还原员**只读不改**。字段说明见 `docs/work-orders.md`，这里列出关键几项：

| 字段 | 作用 |
| --- | --- |
| `type` / `status` | `page` / `segment` / `shared` / `entry`；只有 `status: todo` 才派单（`regression` 只做回归，`segmented` 已拆成分段单，`npm` 不出单） |
| `sourceChunk`、`kb` | 原 chunk 和它的大小 |
| `target`、`subComponentDir` | 页面文件写到哪里，子组件写到哪里。还原员只能写这两处 |
| `components`、`scopeIds` | chunk 里每个组件的 `__name` 和 scopeId。交付的 `.vue` 个数必须和它相同 |
| `maps`、`hints` | `out/maps/<id>.json`：本页每个导入对应清单里的哪个路径和导出名；`out/hints/<id>.md`：看不懂的定义查这里 |
| `deps` | 依赖的入口导出、共享组件、接口、小模块、其他页面；`orders` 是仍为 `reserved` 的依赖所属工单（门槛用它做顶替、建回归反向索引） |
| `recordPath`、`recordVia`、`role`、`recordNotes` | 录制用的路由、身份和录制说明 |
| `missing` | 清单里缺的导入。非空时不派单 |

## 2. 还原规则（还原员）

指令主体是 `tools/prompt-template-confirm.md`。项目专属的句子（多租户、站点名）只写在 `project-notes.md` 里。要点如下：

- **映射**：导入一律按 `maps` 来，不自己起路径或组件名。公共库缺东西或有错时，写进回执的 `needsFromSkeleton`，不自己补。
- **模板**：`createElementVNode` 写成元素；`{key:0}` 分支和 `createCommentVNode` 写成 `v-if/v-else-if/v-else`；`renderList` 写成 `v-for`（保留 key）；`withDirectives` 的每一项都要在同一节点、用同一表达式还原；作用域插槽按参数是解构还是整体变量分别写成 `#name="{ a }"` 或 `#name="e"`。
- **文本空白逐字一致**：原文本没有首尾空格，就和标签写在同一行。
- **不合并分支**：两个互补的独立 `v-if` 不能合并成 `v-if/v-else`。渲染结果虽然相同，但 `branches` 检查会失败。
- **脚本**：`<script setup lang="ts">`；降级后的 async 还原为 `async/await`；压缩后的变量名改成有意义的名字。
- **样式**：按项目约定处理。全自治流水线由 `css-by-scope.mjs` 按 scopeId 写入，还原员不写 `<style>`；其他情况按 scopeId 从工单给的 CSS 里摘取，`[data-v-x] .y` 写成 `:deep(.y)`。
- **不拷贝**：不得原样拷贝原 chunk 或它的 CSS（`copied` 检查按 160 字符窗口比对）。内联的 base64 图片和压缩 CSS 要抽取出来。
- **原代码本身有问题**（如引用了未定义变量）：保留原行为，标注 `// TODO:restore`，交给裁定员登记已知差异。
- **只还原，不优化**：不改版式，不改逻辑，不顺手重构。

## 3. 交付前自检

```bash
node tools/self-check.mjs <工单id> --app <产物工程>
```

检查项包括：`compile`、`components`、`text-nodes`、`directives`、`branches`、`imports`、`copied`、`secrets`、`no-legacy`、`segments`、`readability`，另外 `render-equiv` 只出报告。有失败项就改，最多跑 3 次；3 次后仍失败也照常交付，把剩余失败项写进回执的 `unresolved`。`severity: warn` 的项不影响通过，但也要照着改。

还原员必须遵守的禁止事项：不改工单、不改 `tools/`、不碰其他页面和公共库文件；页面单改到 `src/legacy|shared|api|utils`、`package.json` 或锁文件，合并时会被直接拒绝。

## 4. 交付

1. 在尝试分支上提交并推送。
2. 每张工单写一份回执 `receipts/<id>.json`：`result`、`outputs`、`todos`、`needsFromSkeleton`、`unresolved`、`selfCheck`。
3. 运行 `node tools/handoff.mjs <任务id>`（修正轮加 `--fix`）。它会写元数据、发 `[RECEIPT]` 评论，并把任务交给门槛员。还原员**不自己改状态或负责人**。
4. 卡住时也照样写回执、推分支、跑 handoff，把原因写进 `unresolved`。不要写空实现来凑数。

## 5. 门槛（`gate.mjs`）

```bash
node tools/gate.mjs --task <任务id> --branch <分支> --mode page|integration|upgrade
```

| 阶段 | 内容 | 失败即停 |
| --- | --- | --- |
| static | 复用 self-check，加零引用检查 | 约 1 秒 |
| build | page 模式：Vite 按需编译（生产语义），只编译本页用到的模块；integration 模式：整站 `vite build` | 约 2 秒（依赖缓存命中时） |
| browser | 用 HAR 回放还原版，与原版基线比对：DOM、文本、浮层、请求集合、截图（像素差 ≤ 0.5%），有交互脚本的再比对每一步之后的结果。失败时重跑一次 | 每页 4–15 秒 |

门槛有三种输出：`{pass, failed, stage, diff, shimmed}`；`{"pending":"record", missing}`（缺基线，或交互脚本、HAR 在基线之后有变化）；`{"error": …}`（门槛自身的问题，例如缺密钥、端口、浏览器）。门槛员遇到 `error` 只评论 `[GATE] ERROR`，不推进，也**绝不为了通过去改门槛脚本、规则或 HAR**。

模式：

- **page**：还没还原的共享组件和入口导出（`reserved`）用原 chunk 的薄包装临时顶替；零引用只查本页的文件。
- **integration**：不顶替，零引用全开，可以一次跑多页。用于集成回归、二分定位和规则回归。
- **upgrade**：公共库升级单专用，按改动范围判定，并对依赖改动文件的已通过页面跑回归（见 `05-deps-upgrade.md`）。

## 6. 失败后怎么处理（按顺序，取第一条适用的）

1. 这次尝试还没修过：修正员在同一分支修 1 轮（只改 diff 指出的地方，每一处都先对照原 chunk 确认原因）。
2. 默认模型还没试过：用默认模型重做，开新分支。
3. 默认模型那条分支修正不足 2 轮：再修一轮。
4. 都试过了：交给裁定员。裁定员的处理顺序是：问题在公共库 → 建升级单，本页挂起；比对器把等价写法判成不同 → 建规则变更单；原代码本身的问题 → `TODO:restore` 加已知差异登记；工单拆得不对 → 重新分段；测试资产有问题 → 退回重录；以上都不是 → 升级给人。

## 7. 快速通道（可选）

适用于想在正式门槛就绪前先批量出代码的情况：页面分批，在一条共享分支（如 `restore/fast-lane`）上批量还原，只要求 self-check 和构建通过，录制和正式门槛之后补上。操作手册见 `tools/fast-lane/README.md`。要注意：

- 一张单一个 worktree，派单前先查 `missing`；编排者自己重跑自检和构建，不能只看回执。
- 快速通道只解决「先有代码」，不等于完成。每页都还要补录制、过正式门槛。
- 结束时必须先跑 `node tools/tick.mjs fast-lane retire --app <产物工程> --dry-run` 预览、再去掉 `--dry-run` 执行，把快速通道做过的入口包、共享组件和分段在账本里标好，否则它们会被调度当成 `todo` 重新派单。
