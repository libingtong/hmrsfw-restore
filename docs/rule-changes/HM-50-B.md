## HM-50-B：原包未注册组件登记到清单 `globals.unregistered`

分支 `rule/uc-unregistered-components`。来源：`docs/rule-changes/HM-46-findings.md` 第 B 节（U1 = HM-44、U2 = HM-43）。

### 裁定

走**清单生成工具 + check-imports 规则 3 只认清单**，不在 check-imports 里写按页面或按名字的例外：

- `tools/registry.mjs` 新增 `unregisteredComponents()`：扫描 Hami 范围内每个 chunk 中模块级 `resolveComponent` 别名（由清单 `vue` 表确定）的字符串调用，去掉 Vue 内置组件、`globals.components`（按 Vue `resolveAsset` 的三种写法：原名、camelize、首字母大写）、`globals.componentPatterns` 以及本 chunk 内 `components:{}` 局部注册的名字，剩下的写进 `globals.unregistered`：`{ 名字: [原 chunk, …] }`。清单由工具生成，不手改。
- `tools/check-imports.mjs` 规则 3：只有当工单的 `sourceChunk` 在该名字的列表里、且模板里的标签名与原包**完全相同**时才放行。别的页面用同名标签、或者改写成另一种大小写（`<ElButton>`），仍然判失败。

没有放宽任何阈值，只是让规则 3 认识「原包自己就没有注册」这一种等价写法。

### 等价依据

原包（Vue 3.2.47 编译产物）对模板里的非 HTML 标签生成 `resolveComponent("<名字>")`。名字没有注册时，`resolveComponent` 发出警告并原样返回字符串，`createVNode("<名字>")` 渲染出同名的未知元素。

还原版模板写同一个标签，`@vue/compiler-sfc` 同样编译为 `resolveComponent("<名字>")`（`el-button`、`tooltip`、`Video` 都不是 compiler-dom 认识的 HTML 标签），hmrsfw-vue 的入口（`apps/uc/src/main.ts`、`apps/portal/src/main.ts`）也没有注册这些名字，所以运行时调用和渲染结果都一样。

原包证据（入口没有 `.component("el-button"|"tooltip"|"Video"…)`，ant-design-vue 按 `ATooltip` 等名字注册，不会命中 `tooltip`）：

| 名字 | 原 chunk:位置 | 原版 | 还原版（hmrsfw-vue） | 工单 |
| --- | --- | --- | --- | --- |
| `el-button` | `legacy-dist/usercenter/assets/403.1751615607545.js`：`const r=_("el-button")` | `resolveComponent("el-button")` | `fast-lane-blocked/U1` `apps/uc/src/views/403.vue:8,10` `<el-button>` | `page.uc.403` |
| `el-button` | `legacy-dist/usercenter/assets/404.1751615607545.js`：`const c=r("el-button")` | 同上 | `fast-lane-blocked/U1` `apps/uc/src/views/404.vue` | `page.uc.404` |
| `tooltip` | `legacy-dist/usercenter/assets/home.17516156075453.js`：`se=k("tooltip")` | `resolveComponent("tooltip")` | `fast-lane-blocked/U2` `apps/uc/src/views/jobhunterhome.vue` `<tooltip>` | `page.uc.jobhunterhome` |
| `tooltip` | `legacy-dist/usercenter/assets/homeZzgj.1751615607545.js`：`Q=y("tooltip")` | 同上 | `fast-lane-blocked/U2` `apps/uc/src/views/jobhunterhomeZzgj.vue` | `page.uc.jobhunterhomeZzgj` |
| `Video` | `legacy-dist/portal/assets/ProbationBaseDetail.1783320636200.js`：`ce=h("Video")` | `resolveComponent("Video")` | 尚未还原 | `page.portal.BeOnProbation.ProbationBaseDetail` |

`Video` 是生成器在门户里多找到的一条，同样没有任何注册，属于同一类。

### 反例（仍然失败）

- 在 `page.uc.403`（`fast-lane-blocked/U1`）的 `403.vue` 里临时加 `<tooltip />` 和 `<ElButton />`：规则 3 对这两个标签各报一条失败（`tooltip` 只登记给 home/homeZzgj 两个 chunk；`ElButton` 与原包的 `el-button` 不是同一个调用）。
- 单元测试 `tools/test/registry-unregistered.test.mjs`：把 `ElButton` 加进全局组件后，`el-button` 从列表里消失（已注册的不登记）。

### 回归

- 清单：以 hmrsfw-vue `6e95728`（`main` 上清单的生成基准，`registry.mjs --check` 两端 same）重新生成，`registry/uc.json`、`registry/portal.json` 只多出 `globals.unregistered` 和一条 note，其余不变。
- check-imports，`main` 与本分支对比（不计规则 4：停放分支相对 `integration` 含多页改动，前后条数相同）：

  | 工单 | 应用分支 | `main` | 本分支 |
  | --- | --- | --- | --- |
  | `page.uc.403` | `fast-lane-blocked/U1` | `<el-button>` 未解析 1 条 | 0 |
  | `page.uc.404` | `fast-lane-blocked/U1` | `<el-button>` 未解析 1 条 | 0 |
  | `page.uc.jobhunterhome` | `fast-lane-blocked/U2` | `<tooltip>` 未解析 1 条 | 0 |
  | `page.uc.jobhunterhomeZzgj` | `fast-lane-blocked/U2` | `<tooltip>` 未解析 1 条 | 0 |

- `node --test tools/test/*.test.mjs`：结果见本单评论。

### 回退

规则是一个提交（`registry.mjs`、`check-imports.mjs`、重新生成的清单、测试、文档），`git revert` 即可，不影响其他规则。
