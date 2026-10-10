# 工单、公共库清单与交付前自检（HM-6）

本文是 `docs/pipeline.md` 第十二、十三节的细化：工单 `queue/`、公共库清单 `registry/`、每单的 `out/maps`、`out/hints`，以及还原员交付前跑的 `tools/self-check.mjs`。所有产物都由脚本生成，重跑结果相同（`node tools/registry.mjs --app … --check` 校验清单）。

## 生成方式

```bash
export HMRSFW_APP_DIR=../hmrsfw-vue
node tools/scan-shared-gaps.mjs            # 入口包与共享层盘点（只看，不写文件）
node tools/registry.mjs --app "$HMRSFW_APP_DIR"     # 写 registry/portal.json、registry/uc.json
node tools/work-orders.mjs --app "$HMRSFW_APP_DIR"  # 写 queue/、out/maps/、out/hints/
node tools/self-check.mjs <工单id> --app "$HMRSFW_APP_DIR"
```

`registry.mjs` 需要的 Vue 运行时改名表在 `registry/<app>.json` 的 `vue` 段里；重新生成它要先构建 `tools/vuefp`、`tools/vuefp33`，再跑 `map-vue-exports.mjs` 和 `finalize-vue-exports.mjs`（已核对与 POC 的结果逐项相同）。

| 脚本 | 作用 |
| --- | --- |
| `tools/scope.mjs` | 两站的模块图：每个 chunk 分为 entry / vue / view / api / shared / vendor，算出哈密范围（门户按 `router-xjhm.json`，用户中心全部路由，再沿静态 import 求闭包，不经过入口） |
| `tools/entry-graph.mjs` | 入口 chunk 的顶层绑定图，按 appCode 018 剪枝（其他租户的 `switch` 分支、`appCode=="0NN"` 的死分支、哈密路由以外的 glob 项不走） |
| `tools/scan-shared-gaps.mjs` | 哈密用到的入口导出、入口组件、全局组件/指令/provide，超大 chunk 的识别依据；决定入口包工单数 |
| `tools/registry.mjs` | 公共库清单 |
| `tools/work-orders.mjs` | 工单、maps、hints、路由清单、汇总 |
| `tools/segments.mjs` | ≥ 30KB 页面的分段方案 |
| `tools/assemble-segments.mjs` | 最后一段把片段合成 SFC |
| `tools/self-check.mjs` | 交付前自检（下文） |
| `tools/registry-cleanup.mjs` | `hmrsfw-vue` 现状清理（方案见 `docs/registry-cleanup.md`），默认只预演 |

## 数量与 batch-plan 第 6.3 节的对账

| 类别 | batch-plan 6.3（哈密） | 本次 | 差异说明 |
| --- | --- | --- | --- |
| 页面 chunk | 289（≤ 60KB）+ 5（60–114KB） | 294：门户 111 + 50，用户中心 133 | chunk 集合相同，逐个与 POC `out/hami-portal-chunks.json`、`hami-extra-view-chunks.json` 对过 |
| 其中已验收（只回归） | — | 33 | `hmrsfw-vue` 的 30 页（router.ts），加上 POC 放进 `src/shared/` 的 3 个页面 chunk（`fair/signModal`、`sjz/newHome/resource`、`special/page1/jobNews`） |
| 页面还原单 | 289 | 251 | 294 − 33 已验收 − 10 分段 |
| 分段 | 16（5 个 ≥ 60KB 页） | 21（10 页） | 门槛从 ≥ 60KB 改为 ≥ 30KB（v3.1）；5 个 ≥ 60KB 页里 3 个（formDone、CorpAttestationapprove、corpFairs）已验收，不再分段 |
| 共享组件 | 90 | 90：57 还原单 + 31 已还原（回归）+ 2 npm | `vue3-seamless-scroll`、`vue-countup-v3` 是打包进来的 npm 组件库，用依赖代替，不出单 |
| 小模块单 | — | 2（每站 1 张） | 不是组件、也不是接口的应用代码 chunk（门户 `commonInit`、`dateUtil`、`initData`、`timeOut` 等，用户中心 `wxyy.hook`、`dateUtil` 等）和图片常量 chunk。6.3 把它们算在「其他 100，按 npm 或常量处理」里，但它们是应用代码，需要有人还原 |
| 入口包 | ≤ 48（上限） | 26：门户 16，用户中心 10 | E1–E7 两站 14 张；入口组件只做 appCode 018 能走到的：门户 25 个（108 个定义中），用户中心 8 个，每单 ≤ 3 个、≤ 30KB，分别 9 张、3 张。两站入口里各有 14 个 `vue-baidu-map-3x` 组件，是 npm 包，不出单 |
| 可派单合计 | 443（不含修正 89） | 357 | 251 + 21 + 57 + 2 + 26 |
| 路由 | 门户 123、用户中心 162 | 285 + 1 阻塞 | 门户 122 条有页面（`/talents/talentScreen` 原包无 chunk，预记阻塞）；用户中心按入口实际解析为 163 条 |

**30–60KB 的页面**（全局说明第七节的待核对项）：哈密范围内共 11 页，门户 5（cityHome 32.8、eMap 30.8、sceneFair/detail 35.1、guide/jobHunt 41.2、guide/index 30.6），用户中心 6（doneList 35.8、zcyzCorpAttestation 46.8、Createaresume 58.9、collage/studentApply 35.2、sign/corpApply 37.2、gongfuWorkshop/positionPosting 31.6）。其中 3 页已验收，其余 8 页都按 ≥ 30KB 分段。大小分档：门户 < 5KB 51 页、5–30KB 105、30–60KB 5；用户中心 35、87、6、≥ 60KB 5。< 5KB 且待还原的有 75 页（门户 46、用户中心 29），可按第八节打包派单。

## 超大 chunk 的识别

| chunk | 大小 | 归类 | 是否哈密范围 | 结论与依据 |
| --- | --- | --- | --- | --- |
| 门户 `index.1783320636200102.js`（`views/unitReality`） | 553KB | 页面 | 否 | 打包了 three.js（`WebGLRenderer`、`THREE.` 136 处），应用代码只有末尾 1.3KB 的 `index` 组件。不在范围内，不出单 |
| 门户 `index.178332063620027.js`（`views/common/chat/huanxin`） | 552KB | 页面 | 否 | 打包了环信 Web IM SDK（`WEBIM` 223 处、`easemob` 47 处），组件 ConversationList / MessageItem / SendMsg / EmojisContainer / index 与 SDK 交错。不在范围内 |
| 门户 `index.178332063620028.js`（`views/common/chat`） | 616KB | 页面 | 否 | 打包了腾讯云 IM（`TencentCloudChat`、`tim-upload`），同上 |
| 门户 `china.1783320636200.js` | 568KB | 数据 | 是（被地图页引用） | 全国 geojson（以 `"FeatureCollection"` 开头），不是代码；清单里映射为 `@/assets/geo/china.json`，由脚本转出，不出还原单 |
| 门户 `index.1783320636200118.js` / 用户中心 `index.175161560754527.js` | 1018KB / 1010KB | 第三方库 | 是 | ECharts 5.5.0（tslib 版权头、`zrender`），npm 依赖 |
| 门户 `appointment.1783320636200.js` | 916KB | 共享组件 | 否 | TinyMCE 5.10.3（`majorVersion:"5",minorVersion:"10.3"`）+ 末尾 13KB 的 Editor、appointment 两个组件。不在范围内 |
| 用户中心 `Editor.1751615607545.js` | 904KB | 共享组件 | 是 | TinyMCE 5.10.3 + 末尾 3KB 的 Editor 组件。出共享单，但工单 `kb` 只算组件部分，`bundled` 字段写明前 901KB 是 tinymce，按 npm 依赖处理 |

另外几个带库或数据的共享 chunk 也在工单的 `bundled` 字段里写明了：门户 `maps.vue…`（342KB 地图数据 + 组件）、`tagcanvas.vue…`（TagCanvas 插件，无官方 npm 包，待核对）、`icon.vue…`（41KB 数据），用户中心 `SlideCaptcha.vue…`（jQuery 3.7.0 + tianai-captcha，已还原）、`cropperjs`（Cropper.js 1.6.0，已还原）。

## 工单字段

所有工单共有：`id`、`type`（page / segment / shared / entry）、`status`、`site`（portal / usercenter）、`app`（portal / uc）、`vueVersion`、`kb`、`sourceChunk`、`deps`。

`status`：`todo` 可派单；`regression` 已在 `hmrsfw-vue` 验收或还原，只做回归；`segmented` 页面已拆成分段单，本身不派；`npm` 用 npm 包代替，不派。

**page**

| 字段 | 内容 |
| --- | --- |
| `target` / `subComponentDir` | `apps/<app>/src/views/<原 glob 路径>`；用户中心按路由路径命名（与已验收的 30 页一致）；子组件放 `subComponentDir` |
| `components` / `scopeIds` | chunk 内每个组件的 `__name` 和 scopeId（由 `_export_sfc` 包装上的 `__scopeId` 对应到组件变量） |
| `cssCandidates` | 本页自己的 CSS（入口给的依赖 CSS 里，属于被导入 chunk 的已剔除） |
| `routes` / `recordPath` / `recordVia` | 路由；只被别的页面当组件引用的页面（50 个）用引用它的页面的路由录制，`recordVia` 写明是哪张 |
| `role` / `notes` | 录制身份，取值同 `record-page.mjs` 的 `IDENTITIES`：`general` / `jobseeker` / `corp` / `mentor`。门户一律 `general`；用户中心由 `tools/uc-roles.mjs` 按录制路由和原 chunk 判定（系统页和顶栏入口、身份主页、`tools/uc-identity-menus.json` 里各身份的菜单、页面之间的链接），判不出写 `null` 并在 `notes` 写原因，`record-page.mjs` 遇到 `null` 输出 `blocked: need-role-decision`，不猜。每张的判定依据在 `queue/roles.json` |
| `maps` / `hints` | `out/maps/<id>.json`、`out/hints/<id>.md` |
| `deps` | `entry`（入口导出名）、`shared`（共享 chunk）、`api`（`chunk#导出名`）、`modules`（小模块、图片常量）、`views`（被导入的其他页面工单）、`orders`（这些依赖里还是 `reserved` 的所属工单，门槛顶替和回归反向索引用） |
| `accepted` | 已验收页面的来源说明 |

**segment**（≥ 30KB、未验收的页面拆成的段）

| 字段 | 内容 |
| --- | --- |
| `page` / `index` / `of` | 所属页面工单和段号 |
| `range` | 本段负责的原 chunk 区间，单位是字符：JS 字符串下标（UTF-16 码元，即 Babel 的 `start`/`end`），左闭右开；chunk 含中文时它和字节偏移不同，按字节切会切错位置 |
| `factRanges` | 本段要还原的渲染调用所在的区间（`check-text-nodes`、`check-directives` 只查这些区间里的静态文本、指令和分支）：整组件是它的整个区间；`template` 部分是该组件定义之前的提升代码（`_withScopeId` 包装、提升的静态 vnode）加渲染函数；`script` 部分没有 |
| `components` | 本段完整还原的组件 |
| `parts` | 超过 30KB 的单个组件拆成 `script`（setup 函数体）和 `template`（渲染函数）两部分，写到 `<subComponentDir>_seg/<组件>.script.ts` / `.template.html` |
| `outputs` | 本段要交付的文件 |
| `assemble` / `after` | 最后一段 `assemble: true`，`after` 列出它要等的其他段；它负责运行 `assemble-segments.mjs` 合成 SFC，并对整页跑自检和门槛 |
| `instructions` | 给还原员的中文说明 |
| 其余 | `target`、`subComponentDir`、`routes`、`recordPath`、`role`、`notes`、`maps`、`hints`、`deps` 同所属页面 |

分段规则（`tools/segments.mjs`）：段数 `ceil(kb / 30)`；先按组件边界把整组件按源码顺序分进各段，使最大的一段尽量小；单个组件超过 30KB 的，拆成 script / template 两部分。组件的区间从上一个组件的定义结束处起算，所以组件定义之前的 `_withScopeId` 包装和提升的静态 vnode 归它自己（上一个组件的 `_export_sfc` 包装也落在这里，它不含渲染调用）。主组件在 chunk 末尾，所以总在最后一段。21 段中只有 CorpAttestation 的 script 部分（31.2KB）略超 30KB。

**shared**：`target`（单组件为 `.vue`；多组件 chunk 每个组件一个 `.vue` 放在 `subComponentDir`，非组件导出放同名 `.ts`）、`exports`（原导出名 → 清单导出）、`registryKey`、`usedBy`（依赖它的页面工单，公共库回归用）、`bundled`。`subtype: "modules"` 的小模块单列出 `chunks`（每个 chunk 对应的文件和导出）和 `files`。

**entry**：`area`（E1–E7 或 `component`）、`title`、`files`、`owns`（本单负责的入口导出：原导出名、清单路径、导出名、状态）、`components`（组件单：组件名、入口里的 binding 名、scopeId、大小、文件；`replacesStub` 表示要替换 `hmrsfw-vue` 里现有的桩）、`globals`（E2：清单的全局组件和指令）。入口单的 `kb` 是估算值（`kbEstimated: true`）。

`queue/index.json` 是所有工单的一览（id、type、status、kb、`after`、`deps.orders`）加反向索引 `dependents`；`queue/routes.json` 是 `check-coverage.mjs` 的输入；`queue/summary.json` 是上面这些数字；`queue/roles.json` 是每张页面单的身份和判定依据（判不出的是原因）。

## 公共库清单 `registry/<app>.json`

在 `docs/pipeline.md` 第十三节的格式上补充了实际需要的字段：

| 段 | 键 | 值 |
| --- | --- | --- |
| `vue` | 运行时改名 | `{name, from}` |
| `entry` | 入口导出名 | `{path, export, status, owner, kind, url?, method?, sameAs?, stub?, component?, scopeId?, users}`；npm 符号是 `{path: 包名, export, npm: true, status: "npm"}`；不需要导入的是 `{status: "ignore", reason}` |
| `shared` | 原 chunk 文件名 | `{path, kind, components, kb, exports: {原导出名: {export, path?}}, status, owner, usedBy}` |
| `api` | `chunk#原导出名` | `{path, export, url, method, status}` |
| `apiModules` | 原 chunk | `{path, renameTo?, duplicates?, status, owner, functions}` |
| `modules` | 原 chunk | npm 库（swiper 各模块、pinyin-match、html2canvas、jspdf、print-js、@amap/amap-jsapi-loader、echarts）、图片常量（→ `@/shared/images`）、geojson |
| `utils` | `@/utils/*` | 当前导出（request、cachedRequest 等可直接用） |
| `globals` | | `components`、`componentPatterns`（a-*、图标、bm-*）、`directives`（门户 trim、click-outside；用户中心 imgerr、click-outside）、`provide`（门户 $getUser 等 4 个） |
| `npm` | 包名 | 版本（`hmrsfw-vue/package.json`；不在里面的标「待 E7 按指纹核对」：print-js、vue-countup-v3） |

状态：`restored`（`hmrsfw-vue` 里已有，且不是桩）、`reserved`（还没还原，路径和名字已定）、`npm`、`ignore`。

**名字从哪里来**：入口导出先用 `registry/names.<app>.json`（POC 对照表 112 个 + 按入口定义人工核定 58 个，含 npm 符号和不需要导入的辅助函数），其余接口函数按 URL 末段、组件按组件名、图标按 `displayName`；只被打包库 chunk 使用的入口导出（dom7、ssr-window 等）标 `ignore`。同名不同接口的按 URL 区分：同一 URL 的多个导出指向同一个函数（如门户 `e` / `l` 都是 `getAreaInfo`），不同 URL 撞名的加上上一级路径（`c3` / `c4` 都叫 `checkIsCanAdd`，后者成为 `jobLoanApplyPersonCheckIsCanAdd`）；`L` / `bb` 沿用 POC 核对过的 `getDictListByType` / `getCorpIndustryListByType`。接口模块按控制器段命名（`index.api.178332063620017.js` → `@/api/jobFair`），没有控制器段的 licenseFree 接口按函数名的主题词命名。多导出的共享 chunk：组件导出按组件名各成一个 `.vue`，其余导出（工具函数、常量）沿用原导出名，页面导入时可以 `as` 成可读名。

**种子**：从 `hmrsfw-vue` 的 `legacy/`、`shared/`、`api/`、`utils/` 反推：文件头注释里的原 chunk 名、`export { 可读名 as 原导出名 }`、`export *`、桶文件再导出都识别了。门户 `legacy/` 下的 LoginModal、SlideCaptcha、VideoPlayer 是桩，标 `reserved` 并记下 `stub`，由入口组件单替换。

## maps

`out/maps/<id>.json` 由清单生成，按本地名列出 chunk 的每个导入：

```json
{ "vue": { "ee": "defineComponent", "se": "useRouter (vue-router)" },
  "entry":  { "Es": { "original": "c", "path": "@/legacy", "export": "getAppConfig", "status": "restored" } },
  "api":    { "Q":  { "original": "index.api.….js#b", "path": "@/api/…", "export": "…", "status": "restored", "url": "…" } },
  "shared": { "O":  { "original": "empty.….js#e", "path": "@/shared/empty.vue", "export": "default", "status": "restored" } },
  "views": {}, "modules": {}, "sideEffects": [], "missing": [] }
```

`reserved` 的项带 `owner`。全部 386 份 maps 的 `missing` 都为空。

## 交付前自检 `tools/self-check.mjs`

输出：`{pass, failed:[{check, where, hint, severity?}], id, type, stats, reports}`。`severity: "warn"` 的项不影响 `pass`，但 hint 同样要照着改；`reports.renderEquiv` 是 render AST 等价的报告，只出报告。退出码 0 通过、1 不通过、2 自检本身没能运行。只需要本仓库和 `hmrsfw-vue` 检出，不需要 `RESTORE_ASSETS`；单张约 2–4 秒（CPU 时间）。

| check | 内容 | 实现 |
| --- | --- | --- |
| `compile` | `hmrsfw-vue` 自带的 `@vue/compiler-sfc` 解析、编译每个 SFC（脚本为 TS 时模板表达式也按 TS） | `sfc-util.mjs` |
| `components` | 交付的 `.vue` 个数与原 chunk 的组件数相同 | `check-components.mjs` |
| `text-nodes` | 原 render 的静态文本（`createTextVNode`、各 vnode 的字符串子节点、`createStaticVNode`、插值旁的字符串）逐字出现在还原版模板里；只差首尾空格的报 warn | `check-text-nodes.mjs` |
| `directives` | `withDirectives` 的每一项（v-show、原生 v-model、自定义指令，含参数和修饰符）个数一致 | `check-directives.mjs` |
| `branches` | 没有 v-else 的 v-if 个数一致（每个渲染为空注释占位）；合并独立 v-if、漏分支都会改变它。恒为 false 的分支两边都不计，与 D2 不冲突 | `check-directives.mjs` |
| `imports` | 第十三节 2 的四条：导入只来自本页文件、清单路径（且导出名对）、清单 npm 包；不重新定义公共函数、不直接请求清单已封装且原 chunk 不是自己定义的 URL；模板里按名字用到的组件和指令必须导入或在 `globals`；本单在 `hmrsfw-vue` 里改动的文件不出本单范围（相对 `origin/integration`）。经由桶文件再导出、重复的接口文件、POC 的 npm 包装、与公共函数同名的本地函数报 warn | `check-imports.mjs` |
| `copied` | 不得原样拷贝本单原 chunk、它的 CSS 和它导入的 chunk 里的代码（160 字符窗口比对）。30 字符以上的正则字面量（身份证、手机号校验）必须原样保留，两边都先遮掉，不计入 | `check-copied.mjs` |
| `secrets` | 密钥、token、手机号、证件号、邮箱 | `scan-secrets.mjs` |
| `no-legacy` | 本单文件（含 `subComponentDir` 里的资源）零引用：源码和注释里没有 `legacy-dist` 路径、带构建哈希的文件名、编译产物；与门槛 page 模式的零引用同一套规则，还原员交付前就能看到（HM-9） | `check-no-legacy.mjs` |
| `segments` | 分段交付了片段；最后一段没有留下 `_seg/` | `self-check.mjs` |
| render-equiv | 原 render 与还原版按同版本 compiler 编译后比对（报告） | `render-equiv-confirm.mjs`（现在从 `registry/<app>.json` 取改名表，不再依赖 POC 的 `out/`） |

`check-components`、`check-copied`、`render-equiv-confirm`、`scan-secrets` 按 HM-2 的分工由本任务修改，A（门槛）只导入。四个脚本都改为按工单和 `--app` 工作，不再引用 `skeleton/`。`scan-secrets` 的两条白名单改为 `hmrsfw-vue` 里的路径，对 `hmrsfw-vue` 全仓扫描 0 处命中。

## 验证记录（2026-10-09）

**20 页确认里首次未通过的 8 份结果**：用修正员在确认运行中留下的改动记录，把最终文件逆向还原成首次交付的样子，再跑自检。

| 结果 | 首次失败原因（确认报告） | 自检 |
| --- | --- | --- |
| c05-S | 导入了不存在的占位组件路径 | error：`@/components/CancelReasonModal.vue`、`@/components/ResumeList.vue` 不是清单路径 |
| c05-H | 组件没导入（回放未覆盖） | error：`<CancelRegistrationModal>`、`<FairInfo>` 未解析；另报 v-if 分支数 30 → 29 |
| c08-H | 两个独立分支合并成 v-if/v-else | error：branches 27 → 25 |
| c09-H | 属性顺序；独立 v-if 合并成 v-else-if 链 | error：branches 7 → 6（属性顺序由比对器规范化，不归静态检查） |
| c18-S | 导入路径错误 | error：`@/api/index.api` 不是清单路径 |
| c10-H | 文案首尾空格 | warn：text-nodes 指出 `" 您即将跳转…请知悉！ "` 少了首尾空格 |
| c04-S、c04-H | 恒假分支的空注释占位缺失；H 组另有 izHide 条件写反、弹窗层级 | 未拦下：空注释占位按 D2 由比对器规范化；条件写反、层级位置属于语义，静态检查看不到 |

8 份里 5 份在交付前就会被拦下（error），1 份给出可直接照改的 warn，2 份拦不下。

**已通过的结果**：同一批 20 页的 S、H 两组最终结果（40 份，均已通过门槛）中，34 份 0 个 error。另外 6 份的 error 都是真实偏差，不是误报：c02-S、c10-S、c15-S、c15-H 页面里原样保留了内联 base64 图片或压缩 CSS（全局说明第五节「复制内容检测未通过：页面 3 处」）；c03-H、c05-H 把条件互补的两个独立 v-if 合并成了 v-if/v-else，渲染结果相同所以门槛没发现，但违反全局说明第六节第 1 条。

对 `hmrsfw-vue` 里全部已验收的 33 页和 31 个已还原共享组件跑自检：55 份通过；不通过的 9 份同样是真实问题——上面 3 页的复制内容、用户中心 `XfLoaing` 的内联图片，以及 5 个 POC 时期还原的共享组件（InterviewInvitation、ReceivedResumeList、ZgIframe、beonmodal、setStatusinterview）在组件里重新写了入口已有的接口请求。这些都列进了 `docs/registry-cleanup.md`。

**抽样核对 5 张**（`page.portal.xjhm.home.index`、`page.uc.CorpCenter`、`shared.portal.homeRight2`、`seg.uc.zcyzCorpAttestationapprove.3`、`entry.uc.c02`）：逐条对照原 chunk 的 import 语句与 `deps`、maps，入口导出、接口、共享组件、图片常量、npm 模块都对得上，路由和 `recordPath` 正确；分段区间与组件边界一致。抽样中发现多组件共享 chunk 的导出名还是原压缩名，已改为按组件名各成一个 `.vue`。

**清理脚本**：在 `hmrsfw-vue` 的临时副本上 `registry-cleanup.mjs --apply` 后，`npm run build`（两个应用）通过；之后重新生成清单再跑自检，已验收页面和共享组件的通过数不变（55 / 64），warn 从 74 条降到 40 条（imports 类 62 → 28，余下多是页面经由 `@/legacy` 桶文件导入 npm 符号，以及 text-nodes 的空白差异）。

## 对其他子任务的接口补充

第十二节的约定没有改，以下是新增字段，供 A（门槛）和 B（调度）使用：

- 工单 `status` 除 `todo` 外有 `regression`、`segmented`、`npm`，只有 `todo` 需要派单。
- 分段：非最后一段只跑静态自检，通过即可合入 `integration`；最后一段 `assemble: true`，`after` 列出前序段，派单要等它们合入；门槛只对最后一段按整页运行。
- `deps.views`：本页导入的其他页面工单（门槛顶替时与共享组件同样处理）；`deps.modules`：小模块和图片常量；`deps.orders`：`reserved` 依赖的所属工单，可直接建回归反向索引（`queue/index.json` 的 `dependents`）。
- 自检输出的 `failed` 项可能带 `severity: "warn"`，`pass` 只看非 warn 项；另有 `reports.renderEquiv`（只出报告）。
