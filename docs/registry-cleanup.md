# hmrsfw-vue 现状清理方案（公共库统一，HM-6）

按 `docs/pipeline.md` 第十三节 1 的要求，公共库清单从 `hmrsfw-vue` 现有的 `legacy/`、`shared/`、`api/` 反推，同时清理现状里的问题。本任务**只出方案和脚本，不改 `hmrsfw-vue`**。脚本是 `tools/registry-cleanup.mjs`：默认只预演，`--apply` 才改工作区（不提交）。

```bash
node tools/registry-cleanup.mjs --app ../hmrsfw-vue            # 预演，打印下面的清单
node tools/registry-cleanup.mjs --app ../hmrsfw-vue --apply    # 落地：改 hmrsfw-vue 工作区
node tools/registry.mjs --app ../hmrsfw-vue                    # 落地后重新生成清单（路径随改名更新，renameTo 消失）
node tools/work-orders.mjs --app ../hmrsfw-vue                 # 重新生成工单和 maps
```

落地后要对全部已验收页面跑一次回归（第十三节 4）。已在 `hmrsfw-vue` 的临时副本上完整应用过一次：`npm run build` 两个应用都通过；重新生成清单后，已验收页面和共享组件的自检通过数不变，warn 从 74 条降到 40 条。

## 1. 重复的组件和文件

| 现状 | 核对结论 | 处理 |
| --- | --- | --- |
| 门户 `legacy/SlideCaptcha.vue` 与用户中心 `shared/SlideCaptcha.vue` | 不是同一份东西的两个副本：门户这份是入口包组件 `SlideCaptcha`（入口导出 `aE`）的**桩**（只保留 props 和 `getCatha()`）；用户中心那份是共享 chunk `SlideCaptcha.vue_vue_type_style_index_0_lang.*.js` 的完整还原。两个应用的 Vue、antd 版本不同，各自一套，每个应用内都只有一份 | 不合并。门户的桩由入口组件单 `entry.portal.c02` 按原包还原后替换（清单里该导出标 `reserved`，`stub` 指向现有文件）。门户的 LoginModal、VideoPlayer 也是桩，分别由 `entry.portal.c03`、`entry.portal.c05` 替换 |
| 门户 `api/api-17.ts` 与 `api/api-178332063620017.ts` | 都由 `index.api.178332063620017.js` 生成，内容相同 | 合并为 `api/jobFair.ts` |
| 用户中心 `api/api-55.ts` 与 `api/api-17516156075455.ts` | 都由 `index.api.17516156075455.js` 生成 | 合并为 `api/talentStayUniversity.ts` |
| 用户中心 `shared/dictCode.ts`、`dictCodeByType.ts`、`email.ts`、`idCard.ts`、`phone.ts` | 只是把同名 `.vue` 再导出一次（POC 为兼容 `@shared/dictCode` 和 `@shared/dictCode.vue` 两种写法），一个组件有两个入口 | 页面统一改为从 `.vue` 导入后删除 |
| 门户 `shared/signModal.vue`、`shared/resource.vue`、`shared/jobNews.vue` | 原包里是**页面** chunk（`views/fair/signModal`、`views/sjz/newHome/resource`、`views/special/page1/jobNews`），被别的页面当组件引用，POC 放进了共享层 | 暂不移动：工单把它们当作已验收页面，`target` 就是现在的位置，maps 也指向这里。迁回 `views/` 要和路由（E3）一起做，单独出单 |
| 用户中心 `shared/city.vue` | 来自入口包的全局组件 `city`（`app.component("city", …)`），不是共享 chunk | 由入口组件单 `entry.uc.c03` 接手；那张单的 `files` 里写的是 `legacy/components/City.vue`，接手时决定沿用现有文件还是移动 |

## 2. 第三方库包装改为 npm 依赖

| 现有文件 | 内容 | 处理 |
| --- | --- | --- |
| 门户 `shared/echarts.ts` | 再导出 npm `echarts`，保留原导出名 `i`/`g`/`r`/`e`/`L` | 页面改为 `import { init, graphic, … } from "echarts"`，删除 |
| 门户 `shared/vue3-seamless-scroll.ts` | 再导出 npm `vue3-seamless-scroll@2.0.1` | 页面改为 `import { Vue3SeamlessScroll } from "vue3-seamless-scroll"`，删除 |
| 用户中心 `shared/main.ts` | **原样搬运**的 `pinyin-match` 源码（35KB） | 改为 npm `pinyin-match@1.2.4`（已在 `package.json`），删除 |
| 用户中心 `shared/jspdf.es.min.ts` | 应用自己的水印类 + 再导出 npm `jsPDF` | 保留水印类；页面里的 `jsPDF` 改为从 `jspdf` 导入 |

清单里另有两个打包进来的 npm 组件库 chunk（`vue3-seamless-scroll.es`、`vue-countup-v3.es`），以及 `print-js`、`@amap/amap-jsapi-loader`、swiper 各模块，都直接映射到 npm 包。`print-js`、`vue-countup-v3` 不在 `package.json` 里，版本由 E7 按指纹核对后加入。

## 3. 按哈希命名的接口文件改名

| 应用 | 现文件 | 新文件 | 原 chunk |
| --- | --- | --- | --- |
| 门户 | `api-117.ts` | `jobCompany.ts` | `index.1783320636200117.js` |
| 门户 | `api-1783320636200.ts` | `company.ts` | `index.api.1783320636200.js` |
| 门户 | `api-15.ts` | `archive.ts` | `index.api.178332063620015.js` |
| 门户 | `api-17.ts`（+ `api-178332063620017.ts`） | `jobFair.ts` | `index.api.178332063620017.js` |
| 门户 | `api-17833206362002.ts` | `jobCurriculumVitae.ts` | `index.api.17833206362002.js` |
| 门户 | `api-24.ts` | `oddJob.ts` | `index.api.178332063620024.js` |
| 门户 | `api-178332063620033.ts` | `jobCompanyPosition.ts` | `index.api.178332063620033.js` |
| 门户 | `api-08.ts` | `sysArticle.ts` | `index.api.17833206362008.js` |
| 用户中心 | `api-175161560754511.ts` | `jobCompany.ts` | `index.api.175161560754511.js` |
| 用户中心 | `api-175161560754512.ts` | `jobFair.ts` | `index.api.175161560754512.js` |
| 用户中心 | `api-17516156075453.ts` | `user.ts` | `index.api.17516156075453.js` |
| 用户中心 | `api-17516156075455.ts`（+ `api-55.ts`） | `talentStayUniversity.ts` | `index.api.17516156075455.js` |
| 用户中心 | `api-56.ts` | `jobCurriculumVitae.ts` | `index.api.17516156075456.js` |

新名取自接口 URL 的控制器段（`/xf-job/job/xfJobFair/…` → `jobFair`）；没有控制器段的 `licenseFree` 接口取函数名的主题词。新旧对应同时记在 `registry/<app>.json` 的 `apiModules`（`path` 是现在的位置，`renameTo` 是新名）。准确的表以 `node tools/registry-cleanup.mjs --app …` 的预演输出为准。

改名时顺带补上旧脚本漏掉的 3 个函数：门户 `jobCompany` 的导出 `o`（不是接口函数，是常量对象，留 TODO 按原 chunk 补）；用户中心 `jobCurriculumVitae` 的 `downPdf`、`downPdf2`（配置里带 `Content-Type` 头，旧的正则解析器漏掉了）。`restore-api.mjs` 已改为 AST 解析，不会再漏。

## 4. 页面导入改为清单的规范路径

现有页面经由 `@/legacy` 桶文件导入 `Modal`、`message`、`dayjs`、`request`、`API_BASE` 等，或用 `@shared/x` 的写法。脚本按每页工单的 maps 改成清单路径：npm 符号直接从包导入，`API_BASE`/`STATIC_BASE`/`request` 从 `@/utils/request`，共享组件用 `@/shared/x.vue`。预演结果：门户 16 个文件 60 条 import，用户中心 38 个文件 99 条 import。只会改到已经存在的位置，清单里 `reserved` 的路径不动。

## 5. 脚本不处理、要单独出单的问题

自检在已验收页面和已还原共享组件上查出的真实问题（详见 `docs/work-orders.md` 验证记录）：

| 问题 | 位置 | 建议 |
| --- | --- | --- |
| 原样保留内联 base64 图片、压缩 CSS | 门户 `sjz/enterpriserecruitment`、`outLink`，用户中心 `accountBind`、`shared/XfLoaing.vue` | 等 E 的后处理（抽取 base64、展开压缩 CSS）上线后对这 4 个文件跑一次 |
| 组件里重新写了入口已有的接口请求 | 用户中心 `shared/InterviewInvitation.vue`、`ReceivedResumeList.vue`、`ZgIframe.vue`、`beonmodal.vue`、`setStatusinterview.vue` | 改为按清单导入入口的函数（`@/legacy`、`@/legacy/api`）。这些函数在清单里大多还是 `reserved`，要等 `entry.uc.E6` 完成后再改 |
| 条件互补的两个独立 v-if 被合并成 v-if/v-else | 确认阶段 H 组的 c03、c05（不在 `hmrsfw-vue` 里，`hmrsfw-vue` 用的是 S 组） | 无需处理，记录在案 |
