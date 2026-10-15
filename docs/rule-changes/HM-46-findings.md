## HM-46：快速通道发现的门槛与清单问题（待裁定员提单）

已建单：A 组 → HM-49；B、C 组 → HM-50（都指派裁定员，HM-46 完成后自动开始）。

这份文档只整理问题和证据，**不是规则变更**：门槛脚本、归一化规则、公共库清单都没有改。每一组由裁定员判断是否适用、提出规则变更单（`rule/<名>` 分支 + `docs/rule-changes/<单号>.md`），再运行 `tick.mjs open-rule-review` 交两名复核员复核。

来源：`restore/fast-lane` 分支的 `tools/fast-lane/results/{P1,S1,U1,U2}.json`（P1 = HM-41、S1 = HM-45、U1 = HM-44、U2 = HM-43）。下面的偏移、行号以 `main`（本 PR 合入前 `179fdac`）和本 PR 重新生成的 `queue/` 为准。

同一批阻塞里「兄弟页面默认导入不进 maps」那一类已在本 PR 修掉（`tools/work-orders.mjs` 的 `buildMaps`），不在这里。

### A. 分段门槛（S1）

**A1. `tools/check-components.mjs:17` 的条件恒为真**

```js
const expected = order.type === "segment" && !order.assemble ? order.components : order.components ?? [];
if (order.target && !existsSync(path.join(APP, order.target)) && (order.type !== "segment" || order.assemble || expected.some((c) => c.name === order.components?.at?.(-1)?.name)))
```

非末段时 `expected` 就是 `order.components`，于是 `expected.some((c) => c.name === order.components.at(-1).name)` 只要本段有组件就成立。意图应该是「本段包含整页的主组件时才要求 `target` 存在」，主组件是页面单（`order.page`）的 `components.at(-1)`，不是分段单自己的最后一个组件。结果：不含主组件的非末段也被要求 `target` 存在，S1 的非末段 self-check 因此都过不了，批次只能以末段对整页的 self-check 为准。

**A2. `tools/segments.mjs` 的区间单位和起点**

- 单位：`range` 来自 Babel 的 `node.start`，是 JS 字符串下标（UTF-16 码元），`docs/work-orders.md:82` 写的是「字节区间」。10 个分段页里 7 个是用户中心含中文的 chunk，字符数和字节数不同：

  | 分段单 | `range` | chunk 字符数 / 字节数 | 区间终点换算成字节 |
  | --- | --- | --- | --- |
  | `seg.uc.CorpAttestation.1` | `[0,31927]` | 61482 / 64574 | 33145 |
  | `seg.uc.collage.studentApply.1` | `[0,18105]` | 33451 / 36043 | 20085 |
  | `seg.uc.gongfuWorkshop.positionPosting.1` | `[0,13143]` | 30698 / 32374 | 13815 |
  | `seg.uc.sign.corpApply.1` | `[0,19548]` | 35570 / 38084 | 21614 |
  | `seg.uc.zcyzCorpAttestation.1` | `[0,22232]` | 45359 / 47897 | 22972 |
  | `seg.uc.zcyzCorpAttestationapprove.1` / `.2` | `[0,15621]` / `[15621,36757]` | 60874 / 64872 | 16797 / 38849 |

  按字节去切的人会切错位置。改代码还是改文档，由裁定员定。
- 起点：`componentRegions()` 从含 `__name` 的语句（或声明符）起算。组件前面的 `_withScopeId` 包装函数、被提升的静态 vnode 落在上一个组件的区间里，于是落进上一段：
  - `seg.uc.gongfuWorkshop.positionPosting.2` 的第一个组件 `workPositionAddOrEditModel`（`data-v-4378db7d`），它的包装函数 `te=i=>(fe("data-v-4378db7d")…` 在第 1 段区间 `[0,13143]` 的末尾；
  - `seg.uc.zcyzCorpAttestationapprove.2`（主组件 script 片段），包装函数 `j=k=>(Ze("data-v-e472039d")…` 在第 1 段区间末尾。

  后果（S1 记录）：上一段 text-nodes 把这些静态文本算给自己而误报，后一段的分段自检看不到它们；`*.script.ts` 片段也被查模板文本。S1 的建议：区间从包装函数起算；script 片段跳过 text-nodes。

同批记录的相关问题（S1 notes 第 3、4 条，可与 A 合并考虑）：片段放在 `_seg/` 下，相对导入按片段目录解析，按合成后位置写的 `./<dir>/Child.vue` 在片段阶段报找不到；`css-by-scope <id> --write` 在同页其他段文件不存在时拒写。

### B. 用户中心原包未注册的组件（U1、U2）

原包模板用 `resolveComponent` 按名字解析，但用户中心入口没有注册这些组件，运行时它们按未知元素原样渲染。`registry/uc.json` 的 `globals.components` / `componentPatterns` 里都没有，`check-imports` 规则 3 判失败：

| 组件 | 原 chunk 证据 | 受影响工单 |
| --- | --- | --- |
| `el-button` | `legacy-dist/usercenter/assets/403.1751615607545.js`、`404.1751615607545.js`：`_("el-button")` | `page.uc.403`、`page.uc.404` |
| `tooltip` | `legacy-dist/usercenter/assets/home.17516156075453.js`：`k("tooltip")`；`homeZzgj.1751615607545.js`：`y("tooltip")` | `page.uc.jobhunterhome`、`page.uc.jobhunterhomeZzgj` |

页面已还原（hmrsfw-vue 分支 `fast-lane-blocked/U1`、`fast-lane-blocked/U2`），其余检查全过。要定的是：在清单里登记「原包未注册、按未知元素渲染」的组件（例如 `globals` 下单独一类，不和真正的全局组件混在一起），还是在 `check-imports` 规则 3 加例外。用 `<component :is>` 之类绕过检测的写法已被编排者退回，不可取。

本 PR 修复 `buildMaps` 后，`page.uc.jobhunterhome` 只剩 `tooltip` 这一条（`myresume` 的页面导入已进 maps）。

### C. 清单补登（S1、P1）

**C1. `signModal`：本 PR 后大概率不需要补登**

原 chunk 都以默认导入引用 `signModal.1783320636200.js`，本 PR 修好 `buildMaps` 后，maps.views 给出 `@/shared/signModal.vue`（工单 `page.portal.fair.signModal`，POC 时期放在共享层）。在 `restore/fast-lane` 上套用本 PR 的 `buildMaps` 重新生成后复跑 self-check，`page.portal.cityHome.index`、`page.portal.fair.outFair.detail`、`page.portal.fair.webFair.detail` 的「`@/shared/signModal.vue` 不是清单的规范路径」都不再出现。请裁定员确认后关掉这一项；要把 signModal 迁回 `views/`，走 `registry-cleanup` 方案。

**C2. `o` 导出缺失（`@/api/jobCompany`，`main` 上叫 `@/api/api-117`）**

- 清单：`registry/portal.json` 的 `api["index.1783320636200117.js#o"]` → `export: "o"`、`status: "reserved"`、无 owner，note「不是接口函数（常量或对象），按原导出名导出」。
- 原 chunk `legacy-dist/portal/assets/index.1783320636200117.js`：`export{…,_ as o,…}`，`_=p({},b)`，`b` 是本模块 6 个接口函数的命名空间对象（`Object.freeze(Object.defineProperty({__proto__:null,getCompanyInfo,getRecommendTalentList,izAlreadySubmitCompany,queryCompanyInfo,submitNewGuideCompanyInfo,verifyCompanyInfo},Symbol.toStringTag,{value:"Module"}))`）。也就是 `o` 是整个模块的浅拷贝。
- 现状：接口模块里没有 `o`，按清单 `import { o } from "@/api/jobCompany"` 构建报 `"o" is not exported`。`page.portal.guide.index`（S1）只能先注释两处调用、`StepForm5.vue` 临时改成 `import * as`（都标了 `TODO:restore`）。
- 要定的是谁补：`restore-api.mjs` 生成接口模块时给这类 reserved 常量导出生成 `export const o = { … }`，还是归入口/共享层工单手写；补上后页面改回 `import { o as companyApi }` 即可。

### 本 PR 已验证的部分（供参考）

在 `restore/fast-lane`（工具仓库 `9db1f58`、hmrsfw-vue `restore/fast-lane`）上只替换 `tools/work-orders.mjs` 重新生成，以各停放分支与 `restore/fast-lane` 的分叉点为 base 复跑 self-check：P1/S1 停放与阻塞分支上的 12 页，因默认导入（含 signModal）造成的本页失败全部消失，`page.uc.jobhunterhome` 只剩 B 组的 `tooltip`。
