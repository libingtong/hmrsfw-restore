# 门槛 gate.mjs 与原版基线 baseline.mjs

对应 `docs/pipeline.md` 第七节（门槛）和第十二节（接口约定）。代码在 `tools/gate.mjs`、`tools/baseline.mjs` 和 `tools/gate/`。

## 用法

```bash
export RESTORE_ASSETS=…  RESTORE_STATE=…  HMRSFW_APP_DIR=<hmrsfw-vue 检出>
# 加密密钥只从环境变量来：VITE_HMRSFW_SM2_PUBLIC_KEY、VITE_HMRSFW_SM4_KEY、VITE_HMRSFW_SM4_STORAGE_KEY（还原版用），
# SM2_PRIVATE_KEY（解密请求体做匹配，可缺省：缺省时按「方法 + 路径」匹配）
# 前两个是必需的：--branch 建的 worktree 和新 clone 都没有 .env.local，门槛员的环境里没有它们时门槛输出 {"error":"crypto keys missing …"}，
# 不会把每个有加密响应的页面误判为还原错误（HM-9 联调实测：缺密钥时 c01 在 browser 阶段失败，响应解密失败、页面报错）

node tools/baseline.mjs <工单id> [--har <path>]                       # 录制员（record-page.mjs）录完后调用
node tools/gate.mjs --task <任务id> --branch <b> --mode page            # 门槛员
node tools/gate.mjs --wo c01,c02 --dry-run                              # 测试：不写元数据、不评论
node tools/gate.mjs --mode integration --wo … [--dry-run]               # 集成模式：不顶替、零引用全开、整站构建
node tools/gate.mjs --task <集成任务id> --mode integration [--budget 7]  # 集成任务：分段跑，输出 partial 就再跑同一条命令（见「集成模式分段续跑」）
node tools/gate.mjs --task <升级单id> --branch <b> --mode upgrade       # 升级单模式（kind=upgrade 的任务即使传 --mode page 也自动用它）
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
平台的 8 KB 上限算的是**一张单全部元数据的总和**（HM-876 实测：Σ(键名 + 存储的值 + 8) + 8 ≤ 8192，转义不计，对象按 JSON 文本计），不是单个值。大集成单的 `workOrders` 一项就占 4–5 KB（HM-1086 起超过 2 KB 的 JSON 值由 tick 压缩写入，254 页约 2.3 KB；之前建的单仍是原文），所以 `gate.<attempt>` 的预算 = 8192 − 1 KB 余量（留给 tick 之后写的 `advanced`、`waitRecord`、`gateSeq`、`merge.<n>` 等）− 写入前读到的其他键，最多 7 KB（HM-839）；写入仍被拒（`metadata exceeds`）时预算减半重试，减到 256 字节后再用最小形态试一次，不报错。
完整结果写到 `$RESTORE_STATE/gate/<run>/result.json`（pending 写 `$RESTORE_STATE/gate/pending-<任务>-a<attempt>.json`），元数据用 `detail` 记路径。
pending 记 `missingTotal`、按原因计数的 `byReason` 和缺失页 id 列表 `missing`；放不下时 `missing` 只留前 10 个（再不够继续减半）作样例并标 `missingTruncated`，完整清单只在明细文件里；`advance` 用 `missingTotal` 计数，不读 `missing` 的长度。预算极小时依次去掉 `durationMs`、次要原因（标 `byReasonTruncated`）、`detail`；
pass/fail 超预算时逐级收紧：`failed` 30→10→3 条（`failedTotal` 记总数）、hint 200→120→80 字，通过的页只留 `{wo, pass}`；还放不下时 `pages` 只列未通过的页，通过的页记数 `passedOmitted`（`advance` 把未列出的页当通过）；未通过的页仍放不下时截断并标 `pagesTruncated`，不写 `passedOmitted`，未列出的页一律按失败处理（只会扩大回归范围，不会误判通过）。
评论文件写在门槛员的工作目录（`process.cwd()`），multica 不接受工作目录外的 `--content-file`；页数多时标题写「N 页」加前几个 id。
hint 只含检查名、元素路径（标签名 + 第一个 class）、接口路径和步骤号，不含页面文字和接口数据；带页面内容的完整比对留在 `$RESTORE_STATE/gate/<run>/<工单>/report.json`。

## 升级单模式（--mode upgrade，HM-990）

公共库升级单按「公共库改动」判，不再拿它要解挂的页面（元数据 `workOrders`）跑页面单的判据。`kind=upgrade`（或 `restoreKind=upgrade`）的任务，`gate.mjs` 自动用这个模式；调度器送门槛时也会写元数据 `gateMode: "upgrade"`。

| 阶段 | 内容 |
| --- | --- |
| static | 先判改动范围：分支相对最新的 `origin/integration`（门槛先 fetch）改了哪些文件，用 `tools/lib/upgrade-scope.mjs` 的 `scopeViolations` 判，和调度器合并时 `ownerViolations` 是**同一个函数**。`apps/<app>/public/**`、`package.json`、锁文件、公共库文件放行；`apps/<app>/src/views/**` 一律不行。「owner 有进行中的任务」这一条只有调度器看得到，合并时再判。范围通过后，对改动的文件跑 `self-check.mjs` 里与工单无关的几项：编译（SFC、`src/` 下的脚本）、零引用、个人信息扫描 |
| build | 改动能影响到的每个应用整站 `vite build`（`apps/` 以外的文件，如 `package.json`、锁文件，影响所有应用） |
| browser | 回归页 = 已经在该分支上（即已合入 integration 或已验收）、且工单 `deps` 引用了改动文件的页面，去掉本单要解挂的页；按 integration 模式回放比对（交互脚本取 `origin/integration`），任何一页失败升级单就不通过。没有基线的页列在 `pending`，不判、不拦。`--wo` 可指定回归页 |

要解挂的页面不在升级单门槛里判：升级合并后它们恢复，由各自的页面门槛验证。升级单 verdict 是整条分支的一个结论，`advance` 不按 `pages` 逐页判。

## 三个阶段，失败即停

| 阶段 | 内容 | 典型耗时 |
| --- | --- | --- |
| static | `self-check.mjs <工单id> --app … --no-render-equiv`（HM-6 的自检，已含本页文件的零引用；只作报告的 render-equiv 不跑）；零引用 `check-no-legacy`（page 模式只查本页文件，自检已报过的不重复；integration 模式查整个 `apps/`） | 0.2–1.0 s |
| build | page 模式：Vite 按需编译（生产语义），先把本页及其导入的应用内模块编译一遍，编译或导入解析错误在这里报；integration 模式：整站 `vite build` | 2 s（依赖缓存命中） |
| browser | 一个浏览器实例，HAR 回放还原版，与基线比对；失败时还原版重跑一次 | 4–15 s / 页 |

POC 时期的页面（`c01`…、`p1`…，`tools/confirm-orders.json`、`poc-orders.json`）在 `queue/` 里是同一个原 chunk 的回归单，自检按那张单的 id 跑（`wo.queueId`），基线、报告仍按 `c01` 等原 id。

self-check 的结论只认干净的通过（`pass:true`、退出码 0）。以下一律判 static 失败（`check: "self-check"`）：退出码 2、带 `error` 字段（如工单不在 `queue/`）、`pass:false` 却没有失败项、`pass` 与退出码矛盾、没有 JSON 输出、进程崩溃或超时。`severity: "warn"` 的条目不判失败（self-check 自己的 `pass` 也不计它们）。测试：`node --test tools/test/gate-static.test.mjs`。

每次运行都以一行 JSON 结束：Vite 依赖优化器还在打包时关服务器，`close()` 可能永不返回（只等 5 秒）；事件循环在某一步未完成时清空，输出 `{"error":"gate ended without a result …"}`，退出码 2，不会无输出地以 0 退出。

## 单页构建：为什么用按需编译

| 方案 | 单页耗时（本机，负载约 16–20） | 与整站构建一致性 |
| --- | --- | --- |
| 整站 `vite build`（门户 14 页） | 73 s；用户中心 92 s | 基准 |
| 单页入口 + `vite build`（只留本页路由） | 30–90 s：仍要打包 2766 个模块（antd、图标全量注册在入口），瓶颈在 Rollup 的 tree-shaking | 一致 |
| 单页入口 + 构建期预打包依赖 | 30–60 s | 一致 |
| **Vite 按需编译（生产语义）**，依赖预打包缓存命中 | **约 2 s 起服务 + 页面加载时只编译约 70 个模块** | 30 页回放结论与整站构建一致，见下 |

按需编译只编译页面实际加载的模块。为了得到和真实构建相同的 DOM，进程一开始就设 `NODE_ENV=production`（`tools/gate/prod-env.mjs`，必须在任何 Vue 编译器被加载前设置，否则编译器会缓存开发版，输出 `<!--v-if-->`）：模板按生产模式编译、预打包的是 Vue 生产运行时、`import.meta.env.PROD` 为真；不开 HMR、不监听文件、去掉开发代理。

依赖预打包（antd、图标、echarts 等）只取决于锁文件、vite 配置和 node_modules 位置，第一次运行后发布到 `$RESTORE_STATE/gate-cache/vite-deps/<键>/`（原子改名，先到先得），之后每次复制到本次运行自己的 `cacheDir`（`$RESTORE_STATE/gate/<run>/vite`），不写共用依赖缓存，也不改 `hmrsfw-vue` 的 vite 配置。

**工单路由带上应用自己的 meta**（`appserver.mjs` 的 `routePlugin` / `gateRouteCode`）：页面单不能改 `router.ts`，门槛在 `router.ts` 末尾给工单补一条兜底路由，条件是此刻还解析不到；页面由它顶层挂在 `#poc-main` 下（还原侧根节点取 `#poc-main` 的第一个子元素，HM-779；原版侧取布局里的页面根，用户中心原路由表里与布局并列的顶级路由 `/previewresume`、`/login`、`/403`、`/autoLogin` 没有布局，取 `#app > *`，`gate/common.mjs` 的 `bareRoutes`，HM-1225；还原版用户中心路由表同样把这 4 条放在布局路由旁边、路由已能解析时门槛不加兜底路由，页面直接挂在 `#app` 下，所以还原侧对这 4 条也取 `#app > *`，`restSelOf`，HM-1162）。门户的路由表在第一次导航的 `beforeEach` 里才从 `router-xjhm.json` 装上（带 `hideHeader`、`hideFooter` 等 meta），比兜底路由晚，而兜底路由原先没有 meta，外壳拿不到 `hideHeader`，页头页脚照常显示，原版则隐藏（HM-250）。现在应用每次 `addRoute` 后重新加一次兜底路由，meta 取应用自己记录在该路径上合并后的 meta（没有就是空）。兜底路由设 `strict`（vue-router 4 路径分加 0.7，根路径也加），同路径记录后加入时仍是兜底路由生效，与原先按加入顺序的结果相同，页面挂载方式不变。兜底路由不起名字，`next({ ...to, replace: true })` 仍按路径解析。所有兜底路由共用一层 `addRoute` 包装（HM-1275）：原先每页各包一层，重加兜底路由时走的是上一页的包装，应用每调一次 `addRoute` 就是 2^n 次加路由；4 页的集成跑看不出来，264 页（门户 146 页）的集成跑在门户第一次 `beforeEach` 里就算不完，渲染进程 100% 占满，门槛一直等。现在应用的记录和每条兜底路由各只加一次，加完后的路由表（顺序、meta）与原先相同（测试里拿旧代码逐步对照）。测试：`HMRSFW_APP_DIR=… node --test tools/test/gate-route.test.mjs`（用应用自己的 vue-router）。

**资源与 `vite build` 一致**（`tools/gate/appserver.mjs` 的 `buildAssetsPlugin`）：按需编译时，资源导入（`import x from "./a.png"`、模板里的 `src="./a.png"`、`?url`、`new URL("./a.png", import.meta.url)`）得到的是 `vite build` 会给的 URL，不是开发服务器的 `/src/…/a.png`。模板 src：plugin-vue 在开发服务器下会把相对 src 直接改写成开发 URL、不产生 import，门槛把它的 `template.transformAssetUrls` 设成构建时的值（`includeAbsolute: true`，`base: null`），模板编译成和构建相同的 import。`new URL(…)`：第二个插件 `gate-build-assets-url` 在 plugin-vue 之后、Vite 的 `vite:asset-import-meta-url` 之前，按构建的做法改写成 `new URL("<构建 URL>", self.location)`（HM-778，见 `docs/rule-changes/HM-778.md`）。照 Vite 4.4.9 `fileToBuiltUrl` 和 Rollup 3 `generateAssetFileName`：小于 `build.assetsInlineLimit`（默认 4096 字节；`.svg`、`.html`、Git LFS 占位文件除外）的内联成 `data:<mime>;base64,…`，mime 表取自 Vite 自带的那份；其余是 `<base><assetFileNames>`（默认 `assets/[name]-[hash].[ext]`，`[hash]` = 内容 SHA-256 前 8 位，文件名按 Rollup 规则清洗），开发服务器按这个 URL 返回源文件。`public/` 里的文件和 `?raw`、`?inline`、`?worker` 仍交给 Vite，两种构建结果本来相同。CSS 里的 `url()` 保留开发 URL：它不在比对的 DOM 里，像素也相同。没有照做的一处：内容完全相同、文件名不同的两个资源，Rollup 会合并成先发出的那个名字。测试：`HMRSFW_APP_DIR=… node --test tools/test/gate-assets.test.mjs`，对两个应用的全部图片和三个合成文件（超过上限、刚好 4096、4095 字节）各做一次真实 `vite build`，逐个比 URL；另用真实按需服务器和真实构建各编译一个 SFC 和一个模块（模板相对 src、`new URL`，上限以下和以上各一张），逐个比 URL。

一致性的保证：`--mode integration`（及 `--regress`）用整站 `vite build`，`--build full` 用同一页的真实单页 `vite build`，比对完全相同。实测 30 页：按需编译与整站构建逐页结论相同，失败项的检查名和位置也相同（见下文「验证」）。

## 原版基线（baseline.mjs）

回放身份：页面 HAR 里有 `record-page.mjs` 记下的 `log._record.localStorage`（切到工单身份后的存储，不含 token）时，基线和门槛都把它盖在登录态上再回放，两边用录制时的身份，与 `.auth/pw-usercenter.json` 当时存的是哪个身份无关（HM-9 实测：导师首页按求职者身份回放会少发 `queryHomeSettingById`）。

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

- 加载后：页面根元素规范化 HTML、innerText、浮层文字、`/xf-api/` 请求集合（去掉外壳请求：外壳探测得到的本页外壳请求 + 规则文件里的站点级外壳请求）、截图像素差 ≤ 0.5%（截图前隐藏浮层）。recordVia 组件若父页只在交互后才挂载它（`v-if`，HM-1293：`page.portal.fair.signModal`），还原版和原版每一次运行加载时都没有它的根、原版每一次运行交互后都有，视为同一状态：加载时不报 `baseline` / `render`、不比截图（此时的截图是父页的整屏占位，不是组件）；组件在交互后比（HTML、文本、浮层、请求序列），还原版交互后没有根报 `final.render`。基线的 `dom.html` / `text.txt` 取交互后的根，`baseline.json` 记 `rootAfterSteps: true`。任何一侧加载时有根，或不是 recordVia 页，都照旧。
- 有交互脚本时（`tests/interact/<id>.json`，没有就用 POC 的 `tools/interact-scripts.mjs`；各模式都读工具仓库现取的 `origin/integration`（录制员提交脚本的分支），整次运行固定在同一个提交，`--interact-ref <提交>|worktree` 可改，HM-914；page 模式原先读本检出的工作区，快速通道退场后门槛从 `main` 跑，录过的页全被误报「交互脚本已变」，HM-1132 起同样读 `origin/integration`）：步骤无报错、交互后的请求序列（阶段、方法、路径、查询、请求体 SHA-256）、交互后的 HTML、文本、浮层。交互后等到没有进行中的界面动画、页面根元素 600 ms 不变（最多 3 秒）再截取。交互后还原版和原版两次运行都没有任何页面根候选时，视为同一状态，不报 `final.root`，交互后的 HTML、文本不比（HM-1278）；任何一侧有候选都照旧比。
- 浮层文字 = 截取时打开的弹窗 + 本阶段出现过的全部 message / notification（页面里装了 MutationObserver，出现即记录），减去外壳探测里出现的 toast（原站外壳自己的请求报错）。还原版也跑外壳时（加载时发出了外壳探测里的请求，即 legacy `App.vue` / `main.ts` 已接上）两侧都减；还原版没有外壳（POC `App.vue` 只有 `<router-view/>`）时只减原版一侧（HM-250）。toast 约 3 秒后消失，只看截取那一刻会随机器快慢而变。记录器在 toast 出现 50 ms 后读文字，用的是浏览器原生的 setTimeout，不走页面时钟（HM-1278：回放装了 Playwright 时钟，表单页积压几十个到期定时器时页面时间会停住数秒，读晚了就漏记一侧的 toast）。
- 页面稳定的判据：正文文字长度和元素数 2 秒不变、没有进行中的界面动画（50 ms–2 s 的过渡和动画；逐帧滚动、无限旋转不算）、这段时间没有新的 `/xf-api/` 请求；最少 2 秒，最多 30 秒；并且页面时钟没有积压：页面里排一个 0 ms 的 setTimeout，500 ms（真实时间）内跑到才算（HM-1278：Playwright 时钟一个真实宏任务只跑一个到期定时器，表单页积压时 DOM 不变却没跑完，rc-motion 的上传列表停在 appear-prepare、toast 还没弹就被截取）。
- 页面时钟从 HAR 录制时刻所在的那一分钟开始正常走（不冻结计时器），显示「现在」的页面在基线和以后的门槛里得到同一分钟。
- 原版自身不稳定的地方：两次基线不同的位置不比较（HTML 按标签和文本切分，文本按数字、空白切分，求两次运行的公共子序列，其余是通配）；请求集合接受两次运行的交集到并集之间。
- 还原版失败时重跑一次，第一次的失败留在本地报告里（`firstFailed`），输出里标 `retried`。

## 写请求匹配（tools/gate/har.mjs）

1. 方法 + 路径（含查询串，与 POC 用的 Playwright `routeFromHAR` 一致）+ 解密并规范化后的请求体（SM2 私钥从环境变量 `SM2_PRIVATE_KEY` 读，只在内存里解密）；
2. 方法 + 路径，取第一条；
3. 都没有：统一返回 `{"success":false,"code":404,"result":null,"message":"not in HAR"}`。

录制时被写接口拦截名单挡下的条目（HAR 里 `_intercepted: true`，见 `docs/pipeline.md` 第六节）照常参与匹配，两边都拿到录制时那份固定的成功响应；请求日志里档位记为 `intercepted`（档位不参与比对），不算差异。测试：`node --test tools/test/record-write-guard.test.mjs`。

发往两个测试站或生产站域名的请求一律中止。`node tools/gate/har.mjs --selftest` 用临时生成的密钥对验证三档匹配。

## 规则文件化

- `rules/compare/`：所有比对规范化规则，**每条一个文件**（`NN-<id>.json`，按文件名顺序加载），每条一个提交，可单独 `git revert`。原计划是「一份规则文件」，但实测同一个文件里逐条追加的规则，回退中间一条时 git 会因相邻改动报冲突，所以改为一个目录。规则只能走第十五节第 3 条「规则变更单」改。字段说明见目录里的 README。
- 已知差异登记只有一套：HM-5 的 `tools/known-diff.mjs`（只有裁定员能写），存在 `$RESTORE_STATE/known-diffs/<工单 slug>.json`，数组 `{wo, evidence:"<原 chunk 文件>:<位置>", why, diff, by, at}`。门槛按 `diff` 的两种写法生效：
  - `"<where>.<check>"`，如 `load.overlay`、`steps.requests`、`load.pixel`、`steps.step-error`：豁免门槛这一项比对的失败（粗）；
  - JSON 字符串 `{"where":"load.html","orig":"…","rest":"…"}`：比对前两边的这段片段换成同一个占位符；`where` 是 `*.requests` 时去掉这条请求（如 `"GET /xf-job/x"`）（细）。`where` 取 `load.html|text|overlay|requests`、`steps.requests`、`final.html|text|overlay`。
  - 条目编号 `<slug>#<序号>`。缺 `by`、证据文件不存在（相对本仓库，或 `legacy-dist/<site>/assets/` 下的文件名）、没有 `diff` 或写法不对的条目不生效，在页面结果的 `knownUnusable` 里列出原因，不判失败。生效的条目列在 `knownDiffs`，被豁免的失败项留在本地 `report.json` 的 `waived`。
  - 登记：`node tools/known-diff.mjs add <工单id> --evidence "<chunk>:<位置>" --why "…" --diff "load.overlay"`。测试：`node --test tools/test/gate-known-diffs.test.mjs`（用 `known-diff.mjs` 真实写入，再由门槛读取）。

## 集成模式的失败归属（--mode integration）

整站零引用的命中不再让门槛停在 static：页面照常构建、回放、比对，`pass` 仍为 false。每条整站命中带 `layer`（`page` / `shared` / `entry` / `api` / `utils` / `shell`：`public/`、`App.vue`、`main.ts` 等）和 `owner`（`queue/` 里 `target`、`files`、`outputs` 或 `subComponentDir` 含该文件的工单；`api/` 和外壳文件没有工单），输出另有 `global: {total, byLayer, byOwner}`。写元数据时页面的失败项排在前面，不会被几百条整站命中挤出前 30 条。调度端（`tick.mjs advance`）按 `pages` 数组逐页判定，集成门槛的评论和排障单里写明整站失败按层、按工单的数量。

HM-9 实测（`hmrsfw-vue` `main` 6e95728，20 张确认页）：整站 516 处，外壳 334（`public/` 下带构建哈希的资源名 320）、共享组件 95、页面 66、接口 15、入口 6，涉及 53 张工单；页面 12 张通过、6 张本页静态失败（HM-26 的资源导入、POC 页面头注释里的原包路径）、2 张浏览器失败（c09、c12 的 toast，属 `utils/request.ts`）。

## 集成模式分段续跑（HM-1270）

266 页的全量回归在 Mac mini 上要 1.5–2 小时（10-23 实测：负载 10–20 时 static 约 9 s/页、两个应用整站构建 4–8 分钟、browser 约 13 s/页），几张回归单同时跑更久。门槛员的 shell 前台 10 分钟后把命令转后台、后台再 30 分钟就杀掉（HM-1176、HM-1072 都在约 40 分钟时被杀，无输出），所以以前一张也跑不出结论。

带 `--task` 的集成模式（或无任务时加 `--resume`）现在分段跑：

- 每次调用最多用 `--budget` 分钟（默认 7）开始新的页，到点不再开新页，输出 `{"partial":true,"done":N,"total":M,"run":"<key>","next":"…"}`，退出码 **3**，不写元数据、不评论。**再运行同一条命令**就从已判的页接着跑；全部页都有结论时输出与原来相同形状的结论（多了 `run`、`tools`、`slices`），照常写 `gate.<attempt>` 和 `[GATE]` 评论，然后 `advance`。被杀掉也不丢：已判的页都已落盘，下次接着跑。
- 每页的判法不变：同一个 self-check、同一次整站 `vite build`（只含被判页的路由，与原来一样）、同一套回放和比对（`judgePage` 就是原来循环体）。只是不再在一个进程里跑完。顺序改为先构建、再逐页 self-check + 回放。构建失败时结论与原来相同（stage `build`）。4 页样本（含一张 recordVia 页，两个应用）对照：分 4 段跑出的结论与 `--no-resume` 一次跑完的逐页、逐条失败项完全相同。
- 产物在 `$RESTORE_STATE/gate/runs/<key>/`：`run.json`、`app/`（hmrsfw-vue 在该提交的 worktree）、`global.json`（整站零引用）、`build/<app>.json` + `dist/<app>/`（构建结果和 scope id）、`pages/<工单>/result.json`（`{fp, page, staticMs}`）及截图、`report.json`。`key` 由工具提交（工作区对 `tools/`、`rules/` 有改动时再加改动的哈希）、规则版本、hmrsfw-vue 提交和页集合（每页的 app、route、recordPath、target、recordVia）决定。
- 页结论复用的条件：同一个 run，且该页的基线文件、交互脚本、已知差异与判它时相同（`fp`）；任一变了就重判。
- 一次门槛轮次（任务 + attempt + `gateSeq`）固定在一个 run 上（`runs/pins/`），工具、规则或页集合变了就换新 run。re-gate 会换 `gateSeq`，所以 re-gate 一定拿到新结论。
- **几张任务共享一个 run**：工具、规则、页集合都相同，且该 run 是在本任务创建（或最近一次 re-gate）之后才取的提交（其提交已含本任务的全部页、结论都比请求新），6 小时内的，直接用它。页逐个认领（`pages/<工单>/.claim`，记 pid 和主机；进程死了或超过 30 分钟算失效），并发的调用分着判，不重复。
- 两个应用的构建各在一次调用里做完；一次调用里已经构建过一个应用、剩余时间不够再构建一个时，先返回 `partial`。
- 超过 24 小时且没人在判的 run 在下次分段调用时删掉（含 worktree）。
- `--no-resume` 保留原来一次跑完的方式；`--dry-run`、`--regress`、`--from build` 不分段。
- **单页时间上限**（`--page-timeout <分钟>`，默认 10；HM-1275）：每页的 self-check、回放和比对合起来超过上限，就把该页记成门槛自身出错（`stage: "error"`，不算通过也不算失败），关掉它所在的浏览器（卡住的渲染进程随之结束），接着判下一页，`--budget` 照常生效。分段时这一结论和其他页一样落盘，后面的分段不再认领它；全部页都有结论后，有出错页就输出 `{"error":"N page(s) not judged within …","errorPages":[…]}`（退出码 2，不写元数据、不评论，门槛员按 `{error}` 处理），其余页的结论留在 run 里。解除：修好门槛后工具提交变了，自然换新 run；或 re-gate。一次跑完的模式（page 模式、`--no-resume`、`--regress`）同样处理，`--regress` 不拿出错页去比上次结果。10 分钟取自 10-23 各 run 里最慢的一页（负载高时 6.5 分钟，含一次重跑）。

**门槛员**：`kind=integration` 的任务，前台运行 `node tools/gate.mjs --task <任务id> --mode integration --app "$HMRSFW_APP_DIR"`（Bash 超时 600000 ms），输出 `partial` 就再运行同一条命令，直到输出结论、`pending` 或 `error`，再按原来的流程 `advance`。不要转后台、不要 nohup。

## 共享组件顶替（--mode page）

`registry/<app>.json` 里 `status: "reserved"` 的共享组件，本次运行临时用原编译 chunk 的薄包装顶替（`tools/gate/shim.mjs`）：去掉 Vite 顶层 await 包装（复用 `tools/unwrap-tla.mjs`），`./vue.<哈希>.js` 的导入映射到 `vue`，入口 chunk 的导入按清单 `entry`、接口 chunk 按 `api`、npm 库 / geojson / 图片常量 chunk 按 `modules`、其他 chunk 按 `shared`（已还原用其路径，未还原就再包一层）；具名、默认、命名空间三种导入都支持；带上原 chunk 的样式，补 `export default`（清单 `exports` 里导出为 `default` 的那个）。包装文件只写在 `$RESTORE_STATE/gate/<run>/shims/`，输出 `shimmed`。顶替出错报 `check: "shim"`（build 阶段）。Vite 的依赖扫描阶段不做顶替。

已在 c01 上证明：把 `@shared/empty.vue`、`@shared/Gigmarketgetjobpost.vue` 标成 reserved 后，两者被顶替，c01 仍然通过。按 `main` 上的清单，c05 依赖的 `@/shared/confPass.ts` 是 reserved，被原 chunk 顶替（它默认导入 `html2canvas` 的 chunk，经 `modules` 映射到 npm 包）后 c05 通过。

限制：入口 chunk 本身是应用启动代码，不能单独加载；页面依赖的入口导出若在清单里没有已还原的映射，包装会失败，该页在 build 阶段报 `shim`。

## 并发安全

集成任务的分段运行见上文（`runs/<key>/` 共享，按页认领，锁文件带 pid）。其余：端口一律 0；本次运行的所有产物（含 vite cacheDir、顶替文件、截图、报告）在 `$RESTORE_STATE/gate/<工单>-a<attempt>/`（`--dry-run` 另加 `-dry<pid>`）；`--branch` 时在该目录里建 `hmrsfw-vue` 的独立 worktree；不写任何共用的追加文件；HAR、基线、`legacy-dist` 只读。唯一的共享写入是依赖预打包缓存（临时目录 + 原子改名，从不覆盖）和 `--regress` 的上次结果（原子替换）。

## 验证（2026-10-10，Mac mini，同时有其他智能体在跑，负载 4–10）

`hmrsfw-vue` `6e95728`（当前 `main`），`hmrsfw-restore` 本分支（已合入 `main` 52147cc）。基线用 `baseline.mjs` 从 POC 的回放 HAR 重录（20 张确认页 `har/confirm-replay/`，前 10 页 `har/portal|usercenter/`），30/30 录成，c04 的 `load.html` 两次不同，列入 `unstable`。全部带 `--dry-run`，`RESTORE_STATE` 用临时目录。

**30 页：page 模式与 integration 模式逐页对比**（`--from build`：POC 的 30 页不在 `queue/`，self-check 会按上面的规则判 static 失败；零引用另有清理单）

| | page 模式（按需编译，每页一个进程，3 个并发） | integration 模式（整站 `vite build`，一个进程跑 30 页） |
| --- | --- | --- |
| 通过 | 26/30 | 26/30 |
| 失败 | c09、c12、u3（`load.overlay`），p6（`load.html` `div.setAb2`） | 相同 4 页，检查名和位置相同 |
| c05 | 通过，`shimmed: @/shared/confPass.ts ← legacy-dist confPass.1751615607545.js` | 通过（用 `hmrsfw-vue` 里的文件） |

失败的 4 页都是真实差异，与上一版结论相同：

| 页 | 门槛的结论 | 与 POC 不同的原因 |
| --- | --- | --- |
| c09、c12（确认页）、u3 | 原版加载时弹出错误 toast（服务端失败信息、`请求地址出错: <url>`），还原版没有 | 还原版 `apps/*/src/utils/request.ts` 的响应拦截器只 reject、不弹提示，原版入口里有。POC 只看截取那一刻的浮层，toast 3 秒就消失，所以没比到；门槛记录阶段内出现过的全部 toast。属于公共库问题 |
| p6 | `.setAb2` 滑块验证码：还原版是桩（`legacy/SlideCaptcha.vue`） | POC 的 `verify.mjs` 显式把 `.setAb2` 排除在比对外。属于公共库缺口 |
| u4（通过） | README 记为不通过（头部依赖账号加密数据） | POC 给还原版用了另一份登录态；门槛对两边用同一份登录态，加上原版外壳在页面挂载前对存储的改动，差异消失 |

三条待复核规则（`42-antd-click-wave`、`43-style-transition`、`44-motion-state`）已停用；上表就是停用后的结果，c02、c07、c19 仍通过（c02 第一次失败、重跑通过）。

**c01 复现（审查第 1 条）**：`node tools/gate.mjs --wo c01 --dry-run --from build` 通过（修改前 browser 阶段 `html … div.Quickentryli` 失败）；加 `--mode integration`，c01 这一页同样通过（整体 FAIL 只因零引用的 516 条全局命中）。

**故意改坏**（`queue/` 里真实工单 `page.uc.signUp`，在 `hmrsfw-vue` 检出里改后复原）：模板里「查询」改成「搜索」→ static `text-nodes` 两条（缺「查询」、多「搜索」）；删掉「重置」按钮那一行 → static `text-nodes`（缺「重置」）。都由 HM-6 的 `self-check.mjs` 报出，1.7–1.9 s。

**单张耗时与内存**（page 模式，30 页，3 个并发）：总耗时中位数 13.5 s（8.3–30.1 s）；static 0.6 s（0.4–1.4）、build 1.8 s（1.2–3.6，依赖缓存命中）、browser 10.4 s（5.6–25.8，含浏览器启动约 0.5 s，有交互的页面和重跑的页面在上端）。门槛进程（含 Vite）内存峰值中位数 262 MB（208–330 MB），不含 Chromium 子进程。integration 模式 30 页一个进程 500 s：static 17 s、整站构建两个应用 87 s、browser 395 s，进程峰值 899 MB。

**3 个门槛同时跑**：上面 30 次 page 模式就是 3 个并发跑完的，没有端口或文件冲突，结论与单独跑相同。

**POC 原流程对照**（2026-10-09 测，同一台机器）：每次修正都要整站构建（门户 73 s、用户中心 92 s，高负载下合计 3–6 分钟），`verify-confirm` 每页约 29 s（原版 1–4 次 + 外壳探测 + 还原版），`interact-confirm` 再跑原版、还原版、外壳各一次；两者用固定端口（4701–4714）和共用输出文件，不能并发。

**无输出退出的复现与修复**：依赖缓存为空时顶替出错，build 阶段失败后关服务器，Vite 的依赖优化器还在打包，`close()` 永不返回，进程以 0 退出且无输出。修复后同一场景（`--registry` 指向一份把 confPass 的 chunk 名改成不存在的清单）输出 `{"pass":false,"failed":[{"check":"shim",…}],"stage":"build",…}`，退出码 1。

**测试**：`node --test tools/test/gate-static.test.mjs tools/test/gate-known-diffs.test.mjs`；`HMRSFW_APP_DIR=… node --test tools/test/gate-assets.test.mjs`；`node tools/gate/har.mjs --selftest`。

**写请求匹配**：SM2 私钥不在本机环境里，真实页面上的「按请求体匹配」没有跑到，只有自测。

**与录制（D）的衔接**：用 D 实录的 `$RESTORE_ASSETS/har/pages/c16.har` 跑 `baseline.mjs c16 --har … --app …`（record-page 的调用方式），再跑门槛，c16 通过（2026-10-09）。
