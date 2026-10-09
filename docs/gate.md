# 门槛 gate.mjs 与原版基线 baseline.mjs

对应 `docs/pipeline.md` 第七节（门槛）和第十二节（接口约定）。代码在 `tools/gate.mjs`、`tools/baseline.mjs` 和 `tools/gate/`。

## 用法

```bash
export RESTORE_ASSETS=…  RESTORE_STATE=…  HMRSFW_APP_DIR=<hmrsfw-vue 检出>
# 加密密钥只从环境变量来：VITE_HMRSFW_SM2_PUBLIC_KEY、VITE_HMRSFW_SM4_KEY、VITE_HMRSFW_SM4_STORAGE_KEY（还原版用），
# SM2_PRIVATE_KEY（解密请求体做匹配，可缺省：缺省时按「方法 + 路径」匹配）

node tools/baseline.mjs <工单id> [--har <path>]                       # 录制员（record-page.mjs）录完后调用
node tools/gate.mjs --task <任务id> --branch <b> --mode page            # 门槛员
node tools/gate.mjs --wo c01,c02 --dry-run                              # 测试：不写元数据、不评论
node tools/gate.mjs --mode integration --wo … [--dry-run]               # 集成模式：不顶替、零引用全开、整站构建
node tools/gate.mjs --regress [--dry-run]                               # 全量回归：所有有基线的页面，输出新通过 / 新失败
```

stdout 一行 JSON：

```json
{"pass":false,"failed":[{"check":"html","where":"load","hint":"HTML differs under div.main > div.padB40 (offset 9581; lengths 10884/10928)","wo":"c01"}],
 "stage":"browser","diff":"$RESTORE_STATE/gate/c01-a1","shimmed":[],"durationMs":16323,
 "stages":{"static":575,"build":1764,"browser":13799},"pages":[{"wo":"c01","pass":false,"stage":"browser","pixel":0}],"mode":"page","attempt":1}
```

另外两种输出：`{"pending":"record","missing":[{wo, why}]}`（没有基线，或 HAR、交互脚本在基线之后变了）；`{"error":"…"}`（门槛自身的问题）。
`--task` 且不带 `--dry-run` 时，同一份结果写元数据 `gate.<attempt>`（截短的 hint），并评论一条 `[GATE] PASS|FAIL …`。
hint 只含检查名、元素路径（标签名 + 第一个 class）、接口路径和步骤号，不含页面文字和接口数据；带页面内容的完整比对留在 `$RESTORE_STATE/gate/<run>/<工单>/report.json`。

## 三个阶段，失败即停

| 阶段 | 内容 | 典型耗时 |
| --- | --- | --- |
| static | `self-check.mjs <工单id>`（C 的自检；未合并前用占位：编译本页 SFC + 文本节点检查）；零引用 `check-no-legacy`（page 模式只查本页文件） | 0.1–3 s |
| build | page 模式：Vite 按需编译（生产语义），先把本页及其导入的应用内模块编译一遍，编译或导入解析错误在这里报；integration 模式：整站 `vite build` | 2 s（依赖缓存命中） |
| browser | 一个浏览器实例，HAR 回放还原版，与基线比对；失败时还原版重跑一次 | 4–15 s / 页 |

## 单页构建：为什么用按需编译

| 方案 | 单页耗时（本机，负载约 16–20） | 与整站构建一致性 |
| --- | --- | --- |
| 整站 `vite build`（门户 14 页） | 73 s；用户中心 92 s | 基准 |
| 单页入口 + `vite build`（只留本页路由） | 30–90 s：仍要打包 2766 个模块（antd、图标全量注册在入口），瓶颈在 Rollup 的 tree-shaking | 一致 |
| 单页入口 + 构建期预打包依赖 | 30–60 s | 一致 |
| **Vite 按需编译（生产语义）**，依赖预打包缓存命中 | **约 2 s 起服务 + 页面加载时只编译约 70 个模块** | 30 页回放结论与整站构建一致，见下 |

按需编译只编译页面实际加载的模块。为了得到和真实构建相同的 DOM，进程一开始就设 `NODE_ENV=production`（`tools/gate/prod-env.mjs`，必须在任何 Vue 编译器被加载前设置，否则编译器会缓存开发版，输出 `<!--v-if-->`）：模板按生产模式编译、预打包的是 Vue 生产运行时、`import.meta.env.PROD` 为真；不开 HMR、不监听文件、去掉开发代理。

依赖预打包（antd、图标、echarts 等）只取决于锁文件、vite 配置和 node_modules 位置，第一次运行后发布到 `$RESTORE_STATE/gate-cache/vite-deps/<键>/`（原子改名，先到先得），之后每次复制到本次运行自己的 `cacheDir`（`$RESTORE_STATE/gate/<run>/vite`），不写共用依赖缓存，也不改 `hmrsfw-vue` 的 vite 配置。

一致性的保证：`--mode integration`（及 `--regress`）用整站 `vite build`，`--build full` 用同一页的真实单页 `vite build`，比对完全相同。实测 30 页：按需编译与整站构建的结论一致（见下文「验证」）。

## 原版基线（baseline.mjs）

`$RESTORE_STATE/baseline/<工单id>/`，原子替换：

| 文件 | 内容 |
| --- | --- |
| `dom.html` / `text.txt` / `shot.png` | 第 1 次运行的页面根元素 outerHTML、innerText、截图（`shot.<n>.png`：其他根元素候选，`*.r2.png`：第 2 次运行） |
| `seq.json` | 请求：加载时的集合、外壳请求、交互后的请求序列（请求体只存 SHA-256） |
| `baseline.json` | 门槛读的全部内容：两次运行的 DOM 树（JSON）、文本、浮层、请求、步骤结果；HAR 路径与 SHA-256、交互脚本 SHA-256、`unstable` |
| `storage.json`（600） | 原站外壳在页面挂载前对 localStorage 的改动（还原版没有外壳，按这份补上），与 `.auth` 同一信任区 |

步骤：先跑一次「外壳探测」（页面 chunk 换成空组件，得到外壳自己的请求和挂载时的存储），再完整跑原版两次；某次交互步骤报错就重跑（最多 4 次）。两次不一致的比较项列入 `unstable`。

DOM 存成 JSON 树而不是只存字符串，所以规范化规则以后变了不用重录：比对时两边都按当时的规则重新规范化。序列化与浏览器的 outerHTML 逐字节一致（已核对），POC 的字符串规则含义不变。

## 比对内容

- 加载后：页面根元素规范化 HTML、innerText、浮层文字、`/xf-api/` 请求集合（去掉外壳请求：外壳探测得到的本页外壳请求 + 规则文件里的站点级外壳请求）、截图像素差 ≤ 0.5%（截图前隐藏浮层）。
- 有交互脚本时（`tests/interact/<id>.json`，没有就用 POC 的 `tools/interact-scripts.mjs`）：步骤无报错、交互后的请求序列（阶段、方法、路径、查询、请求体 SHA-256）、交互后的 HTML、文本、浮层。交互后等到没有进行中的界面动画、页面根元素 600 ms 不变（最多 3 秒）再截取。
- 浮层文字 = 截取时打开的弹窗 + 本阶段出现过的全部 message / notification（页面里装了 MutationObserver，出现即记录），减去外壳探测里出现的 toast（原站外壳自己的请求报错，还原版暂时没有外壳）。toast 约 3 秒后消失，只看截取那一刻会随机器快慢而变。
- 页面稳定的判据：正文文字长度和元素数 2 秒不变、没有进行中的界面动画（50 ms–2 s 的过渡和动画；逐帧滚动、无限旋转不算）、这段时间没有新的 `/xf-api/` 请求；最少 2 秒，最多 30 秒。
- 页面时钟从 HAR 录制时刻所在的那一分钟开始正常走（不冻结计时器），显示「现在」的页面在基线和以后的门槛里得到同一分钟。
- 原版自身不稳定的地方：两次基线不同的位置不比较（HTML 按标签和文本切分，文本按数字、空白切分，求两次运行的公共子序列，其余是通配）；请求集合接受两次运行的交集到并集之间。
- 还原版失败时重跑一次，第一次的失败留在本地报告里（`firstFailed`），输出里标 `retried`。

## 写请求匹配（tools/gate/har.mjs）

1. 方法 + 路径（含查询串，与 POC 用的 Playwright `routeFromHAR` 一致）+ 解密并规范化后的请求体（SM2 私钥从环境变量 `SM2_PRIVATE_KEY` 读，只在内存里解密）；
2. 方法 + 路径，取第一条；
3. 都没有：统一返回 `{"success":false,"code":404,"result":null,"message":"not in HAR"}`。

发往两个测试站或生产站域名的请求一律中止。`node tools/gate/har.mjs --selftest` 用临时生成的密钥对验证三档匹配。

## 规则文件化

- `rules/compare/`：所有比对规范化规则，**每条一个文件**（`NN-<id>.json`，按文件名顺序加载），每条一个提交，可单独 `git revert`。原计划是「一份规则文件」，但实测同一个文件里逐条追加的规则，回退中间一条时 git 会因相邻改动报冲突，所以改为一个目录。规则只能走第十五节第 3 条「规则变更单」改。字段说明见目录里的 README。
- `rules/known-diffs/`：已知差异登记（原代码本身的问题），只能由裁定员写，每条一个文件。条目按工单生效，两边的片段换成同一个占位符再比；证据 chunk 必须存在，否则条目作废并在结果里报出。

## 共享组件顶替（--mode page）

`registry/<app>.json` 里 `status: "reserved"` 的共享组件，本次运行临时用原编译 chunk 的薄包装顶替（`tools/gate/shim.mjs`）：去掉 Vite 顶层 await 包装（复用 `tools/unwrap-tla.mjs`），`./vue.<哈希>.js` 的导入映射到 `vue`，入口 chunk 的导入按清单 `entry`、接口 chunk 按 `api`、其他 chunk 按 `shared`（已还原用其路径，未还原就再包一层），带上原 chunk 的样式，补 `export default`。包装文件只写在 `$RESTORE_STATE/gate/<run>/shims/`，输出 `shimmed`。

已在 c01 上证明：把 `@shared/empty.vue`、`@shared/Gigmarketgetjobpost.vue` 标成 reserved 后，两者被顶替，c01 仍然通过。

限制：入口 chunk 本身是应用启动代码，不能单独加载；页面依赖的入口导出若在清单里没有已还原的映射，包装会失败，该页在 build 阶段报 `shim`。

## 并发安全

端口一律 0；本次运行的所有产物（含 vite cacheDir、顶替文件、截图、报告）在 `$RESTORE_STATE/gate/<工单>-a<attempt>/`（`--dry-run` 另加 `-dry<pid>`）；`--branch` 时在该目录里建 `hmrsfw-vue` 的独立 worktree；不写任何共用的追加文件；HAR、基线、`legacy-dist` 只读。唯一的共享写入是依赖预打包缓存（临时目录 + 原子改名，从不覆盖）和 `--regress` 的上次结果（原子替换）。

## 验证（2026-10-09，Mac mini，同时还有其他智能体在跑，负载 15–33）

**30 页回归**（`hmrsfw-vue` d943eb5，基线来自 POC 的回放 HAR：20 张确认页 `har/confirm-replay/`，前 10 页 `har/portal|usercenter/`）：

| | 按需编译（page 模式，`--from build` 跳过零引用以对照 POC） | 整站构建（`--regress`） | POC / README |
| --- | --- | --- | --- |
| 20 张确认页 | 18/20 | 18/20 | 回放 20/20，交互 8/8 |
| 前 10 页 | 8/10 | 8/10 | 9/10 |

两种构建的结论逐页相同，失败的是同 4 页，都是真实差异：

| 页 | 门槛的结论 | 与 POC 不同的原因 |
| --- | --- | --- |
| c09、c12（确认页）、u3 | 原版加载时弹出错误 toast（服务端失败信息、`请求地址出错: <url>`），还原版没有 | 还原版 `apps/*/src/utils/request.ts` 的响应拦截器只 reject、不弹提示，原版入口里有。POC 只看截取那一刻的浮层，toast 3 秒就消失，所以没比到；门槛改为记录阶段内出现过的全部 toast。属于公共库问题 |
| p6 | `.setAb2` 滑块验证码：还原版是桩（`legacy/SlideCaptcha.vue`） | POC 的 `verify.mjs` 显式把 `.setAb2` 排除在比对外。属于公共库缺口 |
| u4（通过） | README 记为不通过（头部依赖账号加密数据） | POC 给还原版用了另一份登录态；门槛对两边用同一份登录态，加上原版外壳在页面挂载前对存储的改动，差异消失 |

**故意改坏**（在 `hmrsfw-vue` 的副本里）：c01 改一处文字 → static 阶段 `text-nodes`（指出文件和行号）；c16 删一个按钮 → static 阶段 `text-nodes`（原 chunk 的中文字符串缺失）。没有文字的纯结构改动静态查不到，由浏览器阶段的 HTML 比对报出。

**单张耗时**（单独跑，负载约 18–28）：c17（门户，4 步交互）21–33 s：static 0.7–2.3 s、build 2.7–4.4 s、browser 15.6–22.3 s（含浏览器启动 0.6–1.5 s）；c16（用户中心，3 步）32.6 s：static 0.8、build 4.1、browser 26.9。30 页连续跑（一个进程）中位数约 9–11 s / 页。

**3 个门槛同时跑**（c09、c16、c17）：无端口、文件冲突，结论与单独跑相同；各 91–101 s（负载 21–33）；内存峰值每个 320–570 MB（门槛进程 + Vite + Chromium），合计 1.2 GB。

**POC 原流程对照**（同一台机器）：每次修正都要整站构建（门户 73 s、用户中心 92 s，高负载下合计 3–6 分钟），`verify-confirm` 每页约 29 s（原版 1–4 次 + 外壳探测 + 还原版），`interact-confirm` 再跑原版、还原版、外壳各一次；两者用固定端口（4701–4714）和共用输出文件，不能并发。入库的 POC `interact-confirm.mjs` 在 `shellStorage` 里引用了未定义的 `storageOverride`，现在运行即报错。

**写请求匹配**：`node tools/gate/har.mjs --selftest` 5/5（加密体换了密文和键顺序仍按请求体命中、未录到的体退回路径、未知路径 not in HAR、无私钥退回路径）。SM2 私钥不在本机环境里，真实页面上的请求体匹配没有跑到。

**与录制（D）的衔接**：用 D 实录的 `$RESTORE_ASSETS/har/pages/c16.har` 跑 `baseline.mjs c16 --har … --app …`（record-page 的调用方式），再跑门槛，c16 通过。
