# 可读性检查与人工抽检（HM-19）

等价门槛只回答「和原版一样吗」。一页可以全绿，代码却还是压缩产物的样子（`const r = …`、`_ctx.title`、`h()`）。可读性检查是**独立于等价门槛的另一道检查**，只管命名、结构和格式，不碰等价规则：模板文本逐字、`scope.row` 前缀、独立三元拆成多个 `v-if` 等规则照旧。

文件：`tools/check-readability.mjs`（检查）、`rules/readability.json`（规则和阈值）、`tools/readability-sample.mjs`（人工抽检）、`hmrsfw-vue` 的 `eslint.config.js` 和 `.prettierrc.json`（eslint / prettier 配置）。

## 检查什么

`self-check.mjs` 的一项，check 名 `readability`，条目是 `{check, where, hint}`，`where` 是 `文件:行号`，`hint` 说明改什么、怎么改：

| 检查 | 规则 | hint 的内容 |
| --- | --- | --- |
| 名字 | 脚本里的变量、函数、参数、import 别名，以及模板里 v-for / 插槽的别名：不能少于 3 个字符，不能是哈希式名字（`_0x1a2b`、`a1`、`n$`、十六进制串），不能和 `registry/<app>.json` 登记的原压缩符号同名（`L`、`bb`）。白名单（`i j k e _ x y id el vm fn cb ok to ws`）只对本地名字有效，**import 别名不吃白名单** | 列出每个名字、行号、原因；import 别名会指出它 import 的可读名，让还原员去掉 `as` |
| 渲染函数 | 不手写 `h()` / `render()` / JSX，不 import `createVNode` 之类 | 位置，改成 `<template>` |
| 编译产物痕迹 | `_ctx`、`_cache`、`_hoisted_N`、`_createElementVNode` 等 `_xxx` 渲染辅助函数、`$setup`、`__returned__`、`_sfc_main`、`__name:`。只扫代码，注释不扫（来源注释里写「`__name: index`」是允许的） | 每个模式出现的次数和第一处，以及该怎么写 |
| 死分支 | `v-if="false"` / `v-else-if="false"`（及 `!1`） | 删掉 |
| 长度 | 文件行数、单个函数行数、`<script setup>` / `setup()` 行数，阈值见下 | 实际行数、上限、拆分办法 |
| eslint | `eslint-plugin-vue` 的 `flat/recommended`，布局类规则交给 prettier | 规则名、第一条消息、行号、规则文档链接 |
| prettier | `.prettierrc.json` 格式检查 | 第一处差异的行号，`npx prettier --write <文件>` |

### 为什么 eslint 关掉了几条规则

下面几条会改变页面渲染或行为，修了就和原版不等价，`hmrsfw-vue/eslint.config.js` 里关闭并写了理由：`vue/no-v-html`（原页面用 v-html）、`vue/multi-word-component-names`（页面文件名是原名）、`vue/component-definition-name-casing`（`name` 是原组件名，keep-alive / devtools 会用）、`vue/attribute-hyphenation`（`fooBar` 和 `foo-bar` 作为透传属性是不同的 DOM 属性）、`vue/require-v-for-key`（加 `:key` 是原 render 没有的 prop）、`vue/no-mutating-props`（原页面就在改 props）、`vue/require-default-prop`、`vue/require-valid-default-prop`（会加上原版没有的默认值）。`vue/first-attribute-linebreak` 是布局，归 prettier。

### prettier 不改模板空白

`.prettierrc.json` 用 `htmlWhitespaceSensitivity: "strict"`：模板里元素之间、文字与元素之间的空白不动。在 hmrsfw-vue 的 7 个已验收页面（共 12 个文件，含子组件）上实测：`prettier --write` 之后 `self-check` 的 `text-nodes`、`directives`、`components` 结果与之前完全相同；模板编译后的 render AST 在 7 个文件上逐字相同，其余 5 个文件只差表达式里的单双引号和内联 `style` 里的十六进制颜色大小写（`#FFF` → `#fff`），没有别的差异。这里只验证了静态检查和 render AST，没有跑浏览器门槛；十六进制大小写在浏览器里序列化后相同，但 hint 里仍要求改完重跑 self-check，批量修 30 页时再跑一遍门槛。

## 规则文件 `rules/readability.json`

- `mode`：`report` 或 `block`。`report` 时所有可读性条目带 `severity: "warn"`，自检照常通过，门槛不因它失败，hint 照样给出；`block` 时条目不带 severity，任何一条都使自检失败。
- `thresholds`：`fileLines`、`functionLines`、`setupLines`。
- `identifiers`：`minLength`、`allow`（白名单）、`hashLike`（正则）、`registryOriginals`。
- `forbidden`：`renderFunctions`、`vIfFalse`、`compileTraces`（id、正则、hint）。
- `lint`：`eslint`、`prettier`、`maxItemsPerFile`。

规则文件和等价比对规则一样，**只能走「规则变更单」改**：只认让页面更可读的收紧或等价的豁免，不能为了让某一页通过而放宽白名单或阈值。

## 校准（2026-10-15）

样本：`hmrsfw-vue` `main` 上已验收的 30 个页面（含子组件 62 个文件）、POC 20 张确认页的 Sonnet（S 组）37 个文件、Haiku（H 组）37 个文件。下面是只看 AST 部分（行数、函数、名字、渲染函数、痕迹）的分布：

| 指标（每个文件） | 30 页 p50 / p90 / p95 / 最大 | POC S 组 p50 / p90 / p95 / 最大 | POC H 组 p50 / p90 / p95 / 最大 |
| --- | --- | --- | --- |
| 文件行数 | 255 / 1096 / 1263 / 2615 | 516 / 1099 / 1479 / 2615 | 429 / 1130 / 1348 / 2165 |
| setup 行数 | 116 / 450 / 635 / 1377 | 199 / 555 / 663 / 1377 | 189 / 572 / 718 / 1200 |
| 最长函数行数 | 22 / 45 / 70 / 129 | 28 / 70 / 77 / 129 | 25 / 56 / 75 / 79 |
| 不可读名字个数 | 0 / 2 / 3 / 10 | 0 / 3 / 3 / 4 | 0 / 8 / 18 / 48 |

**阈值取在 p95 以上、只抓最长的尾部**：`fileLines` 2000、`functionLines` 100、`setupLines` 1000。30 页里超出的是：`uc.CorpAttestationapprove`（2615 行 / setup 1377 行 / 函数 `loadCompanyInfo` 129 行）、`uc.Createaresume`（2482 行 / setup 超过 1000 行）。这两页的原 chunk 分别是 71.7KB 和 58.9KB，是最大的两页；再往下收会把正常的大页面（formDone 系列 1000–1260 行）也算进去，那是拆分页面的问题，不是写得难读。

### 30 页的达标情况

**30 页没有一页完全无条目**：30 页全部有 prettier 差异（现有页面不是 prettier 格式，一条 `npx prettier --write` 能修，已验证不影响等价），其中：

- 只有格式类条目（prettier / eslint）：19 页；
- 有命名、结构问题：11 页（下表）。

| 页面 | KB | 名字 | 手写 h() | v-if=false | 长度超限 | eslint | prettier |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `portal.BeOnProbation.ProbationHome` | 27.7 | | | | | 4 | ✗ |
| `portal.Guidance.GuidanceMentorDetail.index` | 8.1 | 1 | | | | 2 | ✗ |
| `portal.News.newsDetail` | 8.7 | 1 | | | | 2 | ✗ |
| `portal.PDFPreview.PDFPreview` | 1.5 | | | | | | ✗ |
| `portal.fair.outFair.list` | 12 | | | | | 2 | ✗ |
| `portal.fair.sceneFair.detail` | 35.1 | 1 | | | | 3 | ✗ |
| `portal.fair.webFair.list` | 10.4 | | | | | 2 | ✗ |
| `portal.oddJob.index` | 13.9 | | | | | 3 | ✗ |
| `portal.outLink.index` | 1.4 | | | | | | ✗ |
| `portal.personnelAssessment.index` | 3.5 | | | | | 1 | ✗ |
| `portal.resumeAnalysisReport.resumeAnalysisReport` | 13.9 | 1 | | | | 2 | ✗ |
| `portal.sjz.archivesSearch.index` | 15.5 | | | | | 2 | ✗ |
| `portal.sjz.enterpriserecruitment.enterpriserecruitment` | 9.2 | 1 | | | | 4 | ✗ |
| `portal.talents.fair.outFair.detail` | 29.2 | | | | | 3 | ✗ |
| `uc.CorpAttestationapprove` | 71.7 | | | 1 | 4 | 5 | ✗ |
| `uc.Createaresume` | 58.9 | 1 | | | 2 | 3 | ✗ |
| `uc.JobFairsHome` | 15.5 | 1 | | | | 5 | ✗ |
| `uc.StorageChgPassword` | 7.9 | | | | | 1 | ✗ |
| `uc.accountBind` | 2.5 | | | | | | ✗ |
| `uc.corpFairs` | 70.6 | | | | | 17 | ✗ |
| `uc.doneList` | 35.8 | | | | | 16 | ✗ |
| `uc.formDone` | 113.6 | | | | | 14 | ✗ |
| `uc.industrySkillTree` | 4.2 | 1 | | | | 4 | ✗ |
| `uc.maskunit` | 7.1 | 2 | 2 | | | 3 | ✗ |
| `uc.resumetemplate` | 2.1 | | | | | 1 | ✗ |
| `uc.signUp` | 15 | | | | | 7 | ✗ |
| `uc.trainCertificate` | 1.4 | | | | | 1 | ✗ |
| `uc.unRegister` | 1.7 | | | | | | ✗ |
| `uc.webFairWork` | 26.4 | 1 | | | | 4 | ✗ |
| `uc.zgAccount` | 1.6 | | | | | | ✗ |

（「名字」「长度超限」「eslint」列是条目数；一个条目可以含多个名字。30 页指 `views/` 下的页面单；POC 放在共享层的 `portal.fair.signModal`、`portal.sjz.newHome.resource`、`portal.special.page1.jobNews` 不在内。）

这 30 页**作为回归对象处理，本任务不改页面**：改成阻断之前，由回归流程按这份清单逐页修（先 `npx prettier --write` 和 `npx eslint --fix`，再改命名和结构），修完跑 `self-check` + 门槛确认等价没变。

### POC 20 张确认页（报告模式）的误报逐条解释

POC S 组 20 页（37 个文件）共 11 条命名 / 结构条目，**没有误报**：

| 位置 | 条目 | 解释 |
| --- | --- | --- |
| `sceneFair/detail.vue:889` `d`、`:1033` `r` | 单字母回调参数 | 真问题：`.find((d: any) => d.value == …)`、`.then((r: any) => …)`，从压缩代码带过来的名字，应为 `item` / `res` |
| `resumeAnalysisReport.vue:38` `u` | 插槽参数 | 真问题：`<template #format="u">`，应为 `percentInfo` 之类 |
| `enterpriserecruitment.vue:305` `r`、`:8` `L` | 回调参数、v-for 索引 | 真问题（`(e, L) in tabList` 里 `e` 在白名单，`L` 不是） |
| `JobFairsHome.vue:268`、`webFairWork.vue:545` `a` | `customRender: (a) => a.index + 1` | 真问题：参数是行信息，应为 `row` / `record` |
| `industrySkillTree.vue:106` `t`、`_a` | 同上 | 真问题 |
| `webFairWork.vue:611` `r` | `.then((r) => …)` | 真问题 |
| `CorpAttestationapprove.vue:616` | `v-if="false"` | 真问题：原 render 的死分支留在了模板里 |
| `CorpAttestationapprove.vue:2174` 函数 129 行 / 文件 2615 行 / setup 1377 行 | 长度 | 真问题（拆分）；这是 20 页里最大的一页 |

校准过程中去掉的误报：`ws`（WebSocket 实例，`signUp`、`unRegister` 在用）加进白名单；`__name` 出现在来源注释里（`// 还原自…（__name: index）`）不再算痕迹，只扫代码；eslint 的 `Unused eslint-disable directive`（页面里带着原有的 disable 注释）关闭；`@typescript-eslint/…` 的 disable 注释找不到规则定义，注册了插件但不启用其规则。H 组 20 页有 20 条命名 / 结构条目，最多一个文件 48 个不可读名字（`sceneFair/detail.vue`），也是真问题。

## 上线方式

1. **先只出报告**（现在）：`mode: report`。自检里 `readability` 条目带 `warn`，还原员能看到 hint，门槛不因它失败。
2. **改为阻断**：把 `rules/readability.json` 的 `mode` 改成 `block`。页面批量派单已经开始（`restore/fast-lane` 在推页面），所以这一步走「规则变更单」：裁定员提出（附上校准分布和 30 页清单），复核员复核，合并后全量回归（`node tools/gate.mjs --regress`）。改阻断之前建议先把 30 页的回归修完，否则全量回归会让 30 页全部失败。
3. 改阻断后，`prettier` 差异也会失败；需要的话可以先把 `lint.prettier` 单独留在报告模式（把 `lint.prettier` 设为 `false` 再另开一条规则变更单），先阻断命名和结构类。

## 人工抽检

`tools/readability-sample.mjs`：每次 `integration` 集成回归通过后（每 20 单一次，见 `docs/scheduler.md` `regressionEvery`），`tick.mjs` 的集成回归步骤（`Pipeline.onRegression`）自动：

1. 取这一批合入的页面（`main..integration` 之间的合并提交对应的页面单），记下每页的大小分档（`< 5KB` simple、`5–30KB` medium、`≥ 30KB` large）和生成它的模型家族（任务元数据里的 `family`）；
2. 按页面总数的 5% 抽样，至少 1 页；系统抽样：页面先按（分档、家族、工单号）排序，再按等间距取，起点由批次键决定，所以每个分档和家族按比例被抽到，同一个批次键得到同一个样本；
3. 把清单和评分表发到「调度日志」任务（`scheduler.config.json` 的 `logIssueId`）：页面、分档、家族、文件、行数、setup 行数、可读性检查命中数，以及命名 / 结构 / 可理解性各 1–5 分的空表；样本存 `$RESTORE_STATE/readability/<批次键>.json`。

开关：`scheduler.config.json` 的 `readabilitySample`，默认 `{"enabled": true, "rate": 0.05, "min": 1}`；`enabled: false` 关闭。抽检失败只记 anomaly，不影响回归结果。

评分登记和回流：

```bash
node tools/readability-sample.mjs score <批次键> <工单id> <命名> <结构> <可理解性> [备注]
node tools/readability-sample.mjs summary [<批次键>|--all] [--post --log-issue <调度日志任务id>]
```

`summary` 列出任一项 ≤ 2 的页面，并对照机器检查：可读性检查**没有命中任何一项** → 规则漏了，按备注补一条规则；命中了 → 看 hint 是否够清楚、阈值是否太松。补规则走规则变更单。

手动抽一次（不写任何东西、不发评论）：

```bash
node tools/readability-sample.mjs sample --app "$HMRSFW_APP_DIR" --pages regression --key demo --dry-run
```

## registry 业务命名

`registry/<app>.json` 里每个页面可能导入的导出符号都有业务名，并记着对应的原符号：

- `entry.<别名>`：键就是原符号，`original` 是同一个别名；
- `shared.<chunk>.exports.<别名>`、`modules.<chunk>.exports.<别名>`、`api.<chunk>#<别名>`：`original` 是 `chunk#别名`。

页面 `out/maps/<id>.json` 的 `export` 就是业务名，`original` 是原符号。`stats.names` 统计符号数、改名数和 `unnamed`（没有业务名的符号，必须为空）；`node tools/registry.mjs --check` 在 `unnamed` 非空时失败。

HM-6 只改了哈希命名的接口文件名；这次把原压缩名的导出（共享 chunk 里的 `a`、`b`、`_`，接口常量对象 `o`，图片常量 `_`）也命名了，业务名写在 `registry/names.<app>.json` 的 `chunks`（原 chunk → 原导出名 → 业务名）。门户 38 个、用户中心 11 个符号改名，例子：`init.17833206362002.js#a` → `getPieOption`、`timeOut.1783320636200.js#l` → `startChartHighlightLoop`、`dateUtil.1751615607545.js#a` → `addDays`、`Content…js#a` → `queryOddUserById`。

已还原的两个文件（`shared/down.ts`、`shared/noResumeR.ts`）同时改了名：新名 `arrowUpImg`、`arrowDownImg`、`noResumeImg`，旧名 `_`、`a` 作为 `@deprecated` 别名保留，现有页面和 `restore/fast-lane` 上正在推的页面不用动；下一次清单清理把导入改成新名后删掉别名。

清单改名后不用重新生成整个队列：`node tools/refresh-names.mjs` 只刷新工单的 `exports` 和 `out/maps`（`--check` 列出过期的文件）。
