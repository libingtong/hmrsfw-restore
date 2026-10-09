通用化（HM-11）阶段 1 的契约之三：`hmrsfw-restore` 里现有的每个目录和文件归哪一层，`docs/pipeline.md` 的每一节归通用版还是归项目规则，以及现有代码里写死项目信息的位置。G2（引擎拆仓）照这张表搬文件、改代码；本阶段不搬任何文件。

## 两层的划分原则

| 层 | 判据 | G2 之后的位置 |
| --- | --- | --- |
| **引擎** | 换一个 Vue 3 + Vite 项目也原样能用；项目差异全部来自 `restore.config.json`、工单或项目钩子 | `libingtong/vue-restore-kit` |
| **项目数据** | 只对这个项目有意义：旧产物、生成的映射和工单、公共库清单、回执、交互脚本、项目规则、项目专属的加解密和身份切换实现 | 哈密沿用 `libingtong/hmrsfw-restore` |
| **项目钩子** | 逻辑因项目而异、又不能写成配置的代码（哈密：`appCode` 多租户过滤、用户中心身份切换、SM2/SM4 加解密）。引擎定义接口，项目在数据仓库 `hooks/` 下实现 | 接口在引擎，实现在数据仓库 |
| **退役** | POC 阶段的一次性脚本，已被阶段 2 的工具取代 | G2 移到数据仓库 `poc/` 归档，不进引擎 |

表里「改」一栏是 G2 必须做的配置化改动，「来源」标注文件现在在 `main` 还是在尚未合并的 PR 上（HM-4 的 `gate.mjs`、`baseline.mjs` 还没有 PR，按引擎处理）。

## 目录与文件归属

### 根目录与文档

| 路径 | 来源 | 归属 | 说明与 G2 改动 |
| --- | --- | --- | --- |
| `README.md` | main，PR #2/#4 改 | 拆 | 通用部分（工具怎么定位产物工程、`setup-workdir`、分支模型）进引擎 README；两个仓库的分工、哈密的获取方式留数据仓库 |
| `.gitignore` | main | 两边各一份 | 引擎：依赖与构建产物；数据：`har/`、`.auth/`、密钥、`out/*` 例外规则、`receipts/` 例外 |
| `package.json`、`package-lock.json` | main | 引擎 | 工具依赖。改 `name`；数据仓库不需要 Node 依赖 |
| `batch-plan.md` | main | 数据 | 哈密批量计划 v2（历史文档）。第 3 节工单字段已由 `docs/work-orders.md`（PR #4）接管，引擎以后者为准 |
| `restore.config.json` | 本 PR | 数据 | 哈密实例 |
| `schema/restore.config.schema.json` | 本 PR | 引擎 | |
| `docs/generic/*.md` | 本 PR | 引擎 | G2 后并入引擎 `docs/` |
| `docs/pipeline.md` | main | 拆 | 见下一节 |
| `docs/crypto-adapter-spec.md` | main | 数据 | 哈密 SM2/SM4 适配规范。引擎只留「加解密适配层接口」一节（G2 新写） |
| `docs/scheduler.md` | PR #1 | 引擎 | 第 134、136 行的环境变量改名 |
| `docs/work-orders.md` | PR #4 | 拆 | 工单格式、分段、`maps` 生成规则进引擎；哈密范围（`appCode`、`router-xjhm.json`、站点名）进 `project-notes.md` |
| `docs/registry-cleanup.md` | PR #4 | 数据 | 哈密公共库清单的清理记录 |
| `docs/styles-and-crypto.md` | PR #3 | 拆 | 样式归还（`css-by-scope`、后处理）进引擎；加解密部分进数据仓库 |
| `docs/project-notes.md` | G2 新建 | 数据 | 从 `pipeline.md` 拆出的哈密专属规则 |

### 项目数据目录

| 路径 | 来源 | 归属 | 说明 |
| --- | --- | --- | --- |
| `legacy-dist/portal/`、`legacy-dist/usercenter/` | main | 数据 | 旧产物，只读。路径和入口 chunk 写在 `apps[]` |
| `out/maps/`（20 个）、`out/hints/`（59 个） | main | 数据 | 引擎脚本生成，提交在数据仓库 |
| `queue/`、`registry/` | PR #4 | 数据 | 工单、公共库清单 |
| `receipts/` | 阶段 2 | 数据 | 回执，`handoff.mjs` 提交 |
| `tests/interact/` | PR #2 | 数据 | 交互脚本 |
| `tests/record-fixtures/` | PR #2 | 数据 | 用哈密页面做的录制回归样例；引擎测试改用合成样例（G2） |

### `tools/`：引擎

| 文件 | 来源 | G2 改动 |
| --- | --- | --- |
| `app-dir.mjs` | main | `VR_APP_DIR` + 别名 `HMRSFW_APP_DIR`（一版），包名从 `repos.app.packageName` 读，`apps/` 目录检查改为按 `apps[].target` 模板检查，规则见 `config-schema.md`「env」 |
| `setup-workdir.mjs` | main | `APP_LABEL` 改为读配置；加 `--data`、`--config-ref`、`--tool-ref` 和 `ticket-metadata.md` 列的检查 |
| `validate-config.mjs`、`test/validate-config.test.mjs` | 本 PR | 无 |
| `analyze.mjs`、`describe-imports.mjs`、`slice-maps.mjs`、`finalize-vue-exports.mjs` | main | 站点名（`portal`/`usercenter`）和入口 chunk 改为遍历 `apps[]` |
| `entry-symbols.mjs`、`local-defs.mjs`、`map-vue-exports.mjs`、`unwrap-tla.mjs` | main | 无项目信息 |
| `restore-api.mjs` | main，PR #4 改 | 接口前缀读 `apps[].apiPrefix` |
| `render-equiv.mjs` | main，PR #4 改 | 按 `apps[].versions.vue` 选指纹库 |
| `check-components.mjs`、`check-copied.mjs`、`check-coverage.mjs`、`check-no-legacy.mjs`、`scan-secrets.mjs` | main，PR #4 改 | 注释里的 `hmrsfw-vue` 改为「产物工程」；`scan-secrets` 按 `env.secrets` 补规则 |
| `check-imports.mjs`、`check-text-nodes.mjs`、`check-directives.mjs`、`self-check.mjs`、`sfc-util.mjs`、`segments.mjs`、`assemble-segments.mjs` | PR #4 | 同上 |
| `work-orders.mjs`、`registry.mjs`、`registry-cleanup.mjs`、`scan-shared-gaps.mjs` | PR #4 | `target` 用 `apps[].target` 模板；哈密范围判定移到钩子 `hooks/scope.mjs` |
| `scope.mjs` | PR #4 | `SITES`、`APP_OF`、`SITE_OF` 改为由 `apps[]` 生成；`HAMI_APPCODE` 和 `hamiScope()` 移到钩子 |
| `entry-graph.mjs` | PR #4 | `appCode` 相关判定移到钩子 |
| `tick.mjs`、`route.mjs`、`ledger.mjs`、`handoff.mjs`、`known-diff.mjs`、`lib/*.mjs`、`test/*.mjs` | PR #1 | 派单写 `ticket-metadata.md` 的定位键；`HMRSFW_TOOL_ROOT` → `VR_TOOL_ROOT`，`HMRSFW_TICK_NO_GLOBAL_LOCK` → `VR_TICK_NO_GLOBAL_LOCK`；任务描述不再写仓库名 |
| `record-page.mjs`、`record-lib.mjs`、`interact.mjs`、`har-body.mjs`、`record-compare.mjs`、`record-baseline-placeholder.mjs` | PR #2 | `ORIGIN`、`TEST_HOSTS` 改读 `apps[].testOrigin` 和 `recording.allowedHosts`；`LEGACY_DIR` 读 `apps[].legacyDist`；`/xf-api/` 读 `apiPrefix`；`IDENTITIES`（用户中心四个身份）移到钩子 `hooks/identity.mjs`；`har-body.mjs` 现在 `import "./sm2-body.mjs"`，改为经钩子 `hooks/crypto.mjs` 解密，否则搬走 `sm2-body.mjs` 后引擎缺依赖 |
| `pw-login.mjs` | main，PR #2 改 | 登录页地址由 `testOrigin` 拼；仍由人登录 |
| `css-by-scope.mjs`、`css-utils.mjs`、`postprocess-vue.mjs` | PR #3 | 注释改名 |
| `har-decrypt.mjs`、`e5-replay.mjs` | PR #3 | 框架留引擎，SM2/SM4 的具体算法和密钥变量名经钩子 `hooks/crypto.mjs` 提供 |
| `gate.mjs`、`baseline.mjs` | HM-4（未提 PR） | 按本表写：不写死域名、接口前缀和仓库 |
| `archive.mjs` | main | 加 `allowedHosts` 检查（现在任意 origin 都能抓） |
| `agent-usage.mjs`、`context-breakdown.mjs` | main | 无项目信息，开发辅助 |
| `prompt-template.md`、`prompt-template-confirm.md` | main，PR #4 改 | 还原员指令主体留引擎；其中 `appCode`、哈密路由的句子移到 `project-notes.md` |
| `vuefp/`、`vuefp33/` | main | 按 Vue 版本的指纹库。改名 `fingerprints/vue-3.2.47/`、`fingerprints/vue-3.3.4/`，按 `apps[].versions.vue` 选择；新项目遇到新版本时由 `init` 生成 |

### `tools/`：项目数据（含钩子实现）

| 文件 | 来源 | 说明 |
| --- | --- | --- |
| `sm2-body.mjs` | main | 哈密 SM2 请求体解密，变为 `hooks/crypto.mjs` 的一部分 |
| `pw-switch-role.mjs` | main，PR #2 改 | 用户中心身份切换，变为 `hooks/identity.mjs` 的一部分 |
| `record-config.json` | PR #2 | `interactCoverage`：D4 的哈密取值（动作词、抽检率、种子 `hm-d4`）。G2 评估是否并入 `restore.config.json` 的新字段 |
| `copy-exemptions.json` | PR #3 | 哈密的复制检查豁免（D3） |

### `tools/`：退役（POC 一次性脚本，移到数据仓库 `poc/`）

`build-har-confirm.mjs`、`build-har.mjs`、`build-storage.mjs`、`capture-har.js`、`receiver.mjs`（依赖不在仓库里的 `scripts/hmrsfw/`）、`pw-record.mjs`、`pw-collect-ids.mjs`（被 `record-page.mjs` 取代）、`verify.mjs`、`verify-confirm.mjs`、`interact-confirm.mjs`、`interact-scripts.mjs`、`render-equiv-confirm.mjs`（被 `gate.mjs` 取代）、`shell-probe.mjs`、`dbg-dom.mjs`、`dbg-probe.mjs`、`dbg-req.mjs`、`dbg-uc.mjs`、`post-whitelist.mjs`（白名单已取消）、`summarize.mjs`、`wakaru-audit.mjs`、`ledger-add.mjs`、`confirm-stats.mjs`、`confirm-orders.json`、`confirm-samples.json`、`samples.json`。

其中 `confirm-stats.mjs` 的输出被 `ledger.mjs seed` 用来给能力表播种（PR #1），播种入口留在引擎，读的文件由参数给出。

## `docs/pipeline.md` 各节归属

| 节 | 归属 | 拆法 |
| --- | --- | --- |
| 开头说明、修订记录 | 拆 | 版本演进留通用版；「按《全局说明》对齐」「与 v2 相比」的哈密背景进 `project-notes.md` |
| 一、已定项 | 拆 | 通用：分支模型、`done` 由智能体设置、交互比对用 HAR、裁定员、漏检率阈值。哈密：产物工程路径、两个仓库（→ `repos`）、两台机器和本机路径（→ `machines`；`RESTORE_ASSETS`/`RESTORE_STATE` 的取值写在各机环境文件）、模型 ID（→ 名册）、范围数字（161 + 133 + 90 + ≤48、已验收 30 页）、预算 |
| 二、前置工程 | 项目 | 哈密阶段 2 的拆分历史。通用版改写为「接入新项目」：`init` 脚手架 → 写配置 → 生成映射与工单 → 录制 |
| 三、整体流程 | 通用 | 原样 |
| 四、智能体清单 | 拆 | 通用：角色和职责、家族路由、环境变量表（用 `VR_*` 新名）。哈密：机器分配、并发数字、具体模型（→ 名册与 `machines`） |
| 五、还原员统一指令 | 通用 | 「开工」改为 `ticket-metadata.md` 的开工步骤，去掉仓库地址（G3） |
| 六、修正员、审计员、录制员 | 通用 | 同上；「全部录完后人工重置测试环境」改为引用 `escalation` 的 `human-presence` |
| 七、门槛员与 `gate.mjs` 要求 | 通用 | 去掉仓库地址 |
| 八、路由与抽检 | 通用 | 便宜档具体模型和家族由 `scheduler.config.json` 给出 |
| 九、调度员与状态机 | 通用 | 「指派李炳通」改为「指派 `escalation.assignee`」 |
| 十、任务约定与人工裁定 | 通用 | 原样 |
| 十一、自检 | 通用 | 「12 个智能体」改为「名册里的全部智能体」 |
| 十二、接口约定 | 通用 | `hmrsfw-vue` 改为「产物工程」；元数据表补上 `ticket-metadata.md` 的定位键；`HMRSFW_APP_DIR` 改 `VR_APP_DIR` |
| 十三、公共库统一 | 拆 | 机制（清单唯一事实来源、先占位、`check-imports`、单一修改入口、变更回归）通用。哈密特例进 `project-notes.md`：门户与用户中心版本不同、`SlideCaptcha` 重复、`vue3-seamless-scroll`/`echarts` 包装、`api-178332063620017.ts` 改名、E7 拆 `package.json` |
| 十四、全局约束 | 拆 | 原则通用（只访问 `allowedHosts`、登录由人、密钥只读环境变量、个人信息不入库、不为通过改规则、`done` 规则、文档冲突以最新实测为准）。具体仓库和域名改为引用配置；「与全局说明不一致」小节进 `project-notes.md` |
| 十五、自治与升级 | 拆 | 1–3、5 小节通用；4 小节的框架通用，例子和 D2/D3/D4/D10 默认值进 `restore.config.json` 的 `escalation`（已填） |

## 环境变量改名

| 现在 | G2 之后 | 处理 |
| --- | --- | --- |
| `HMRSFW_APP_DIR` | `VR_APP_DIR` | 别名保留一个版本（`env.appDirAliases`） |
| `HMRSFW_NO_WHITELIST` | `VR_NO_WHITELIST` | 白名单已取消，G2 评估直接删除这个开关；保留时同样留一版别名 |
| `HMRSFW_TOOL_ROOT` | `VR_TOOL_ROOT` | 只用于测试，直接改 |
| `HMRSFW_TICK_NO_GLOBAL_LOCK` | `VR_TICK_NO_GLOBAL_LOCK` | 只用于测试，直接改 |
| `HMRSFW_RECEIVER_PORT` | 无 | 随 `receiver.mjs` 退役 |
| `VITE_HMRSFW_SM2_PUBLIC_KEY`、`VITE_HMRSFW_SM4_KEY`、`VITE_HMRSFW_SM4_STORAGE_KEY` | 不改 | 这是产物工程 `hmrsfw-vue` 自己的构建变量，不属于引擎 |
| `RESTORE_STATE`、`RESTORE_ASSETS`、`RESTORE_DEPS_CACHE`、`SM2_PRIVATE_KEY` | 不改 | 前三个是引擎固定名；`SM2_PRIVATE_KEY` 由 `env.secrets` 声明 |
| — | `VR_DATA_DIR`、`VR_CONFIG` | 新增，见 `config-schema.md`「env」 |

## 写死项目信息的位置

盘点命令（在本仓库根目录运行，排除 `legacy-dist/`、`out/`、`registry/`、`queue/`、锁文件和本 PR 新增的配置与文档）：

```bash
git grep -n -E 'hmrsfw|HMRSFW|hami|rencaidanao|appCode|libingtong' <ref> -- . ':!legacy-dist' ':!out' ':!registry' ':!queue' ':!*package-lock.json'
```

盘点时间 2026-10-09，`main` 为 `9de9d20`；四个未合并 PR 只统计它们相对 `main` 新增或修改的文件，取各自分支当时的最新提交（PR #1 `7878191`、PR #2 `347e5f2`、PR #3 `8c5ea82`、PR #4 `d8f85cb`）。类别：域名 → `recording.allowedHosts`、`apps[].testOrigin`；仓库地址、仓库/包名 → `repos`；环境变量 → 上一节；`appCode`、哈密范围/命名 → 钩子或 `project-notes.md`；项目名 → 注释和日志改为 `project.id`。

已经写死的地方不在 HM-4～HM-8、HM-10 里返工，由 G2 统一处理；这些任务里**新写的代码**读 `restore.config.json`。

#### main

| 文件 | 行数 | 行号 | 类别 |
| --- | --- | --- | --- |
| `README.md` | 13 | 7, 8, 10, 12, 31, 32, 33, 34, 36, 39, 41, 43, 53 | 仓库地址、仓库/包名、环境变量 |
| `batch-plan.md` | 5 | 5, 75, 218, 257, 312 | 仓库/包名、appCode、哈密范围/命名 |
| `docs/crypto-adapter-spec.md` | 8 | 9, 10, 43, 45, 46, 47, 48, 50 | 仓库/包名、环境变量 |
| `docs/pipeline.md` | 17 | 5, 11, 12, 16, 17, 21, 101, 121, 156, 217, 355, 357, 377, 403, 435, 436, 438 | 仓库/包名、仓库地址、环境变量、域名 |
| `package.json` | 1 | 2 | 仓库/包名 |
| `tools/app-dir.mjs` | 7 | 1, 2, 8, 13, 14, 15, 20 | 仓库/包名、环境变量 |
| `tools/confirm-orders.json` | 1 | 285 | 域名 |
| `tools/confirm-samples.json` | 1 | 129 | 域名 |
| `tools/interact-confirm.mjs` | 3 | 22, 23, 40 | 环境变量、域名 |
| `tools/prompt-template-confirm.md` | 1 | 25 | appCode |
| `tools/prompt-template.md` | 1 | 15 | appCode |
| `tools/pw-collect-ids.mjs` | 1 | 11 | 域名 |
| `tools/pw-login.mjs` | 1 | 9 | 域名 |
| `tools/pw-record.mjs` | 3 | 9, 16, 17 | 域名、环境变量 |
| `tools/pw-switch-role.mjs` | 1 | 22 | 域名 |
| `tools/receiver.mjs` | 4 | 1, 3, 4, 9 | 项目名、环境变量 |
| `tools/setup-workdir.mjs` | 6 | 1, 2, 9, 10, 11, 23 | 仓库/包名、环境变量 |
| `tools/shell-probe.mjs` | 1 | 15 | 域名 |
| `tools/verify-confirm.mjs` | 3 | 16, 17, 26 | 环境变量、域名 |

#### PR #1 HM-5（`hm-5-scheduler` 相对 main 新增或修改的文件）

| 文件 | 行数 | 行号 | 类别 |
| --- | --- | --- | --- |
| `docs/scheduler.md` | 2 | 134, 136 | 环境变量、仓库/包名 |
| `tools/lib/gitops.mjs` | 2 | 31, 53 | 项目名 |
| `tools/lib/pipeline.mjs` | 4 | 52, 132, 725, 1185 | 仓库/包名、环境变量 |
| `tools/lib/workorders.mjs` | 3 | 8, 9, 30 | 环境变量、仓库/包名 |
| `tools/test/concurrency.test.mjs` | 2 | 2, 46 | 环境变量 |
| `tools/test/fixture.mjs` | 6 | 2, 40, 50, 55, 63, 78 | 仓库/包名、项目名、环境变量 |
| `tools/tick.mjs` | 3 | 11, 24, 28 | 仓库/包名、环境变量 |

#### PR #2 HM-7（`hm-7-record-page` 相对 main 新增或修改的文件）

| 文件 | 行数 | 行号 | 类别 |
| --- | --- | --- | --- |
| `README.md` | 13 | 7, 8, 10, 12, 31, 32, 33, 34, 36, 39, 41, 43, 53 | 仓库地址、仓库/包名、环境变量 |
| `tests/record-fixtures/README.md` | 1 | 9 | 环境变量 |
| `tools/pw-login.mjs` | 2 | 13, 15 | 域名 |
| `tools/record-lib.mjs` | 1 | 13 | 域名 |
| `tools/record-page.mjs` | 3 | 12, 26, 248 | 环境变量、仓库/包名 |

#### PR #3 HM-8（`hm-8/css-by-scope-har-decrypt` 相对 main 新增或修改的文件）

| 文件 | 行数 | 行号 | 类别 |
| --- | --- | --- | --- |
| `docs/styles-and-crypto.md` | 7 | 3, 18, 19, 20, 22, 27, 73 | 仓库/包名、环境变量 |
| `tools/copy-exemptions.json` | 1 | 2 | 仓库/包名 |
| `tools/css-by-scope.mjs` | 1 | 15 | 仓库/包名 |
| `tools/e5-replay.mjs` | 6 | 3, 10, 11, 13, 45, 57 | 仓库/包名、环境变量、域名 |
| `tools/har-decrypt.mjs` | 3 | 8, 9, 33 | 环境变量、仓库/包名 |

#### PR #4 HM-6（`agent/mika/e87bd8316be8` 相对 main 新增或修改的文件）

| 文件 | 行数 | 行号 | 类别 |
| --- | --- | --- | --- |
| `README.md` | 14 | 7, 8, 10, 12, 23, 33, 34, 35, 36, 38, 41, 43, 45, 55 | 仓库地址、仓库/包名、环境变量 |
| `batch-plan.md` | 5 | 5, 75, 218, 257, 312 | 仓库/包名、appCode、哈密范围/命名 |
| `docs/registry-cleanup.md` | 8 | 1, 3, 6, 7, 8, 9, 12, 70 | 仓库/包名 |
| `docs/work-orders.md` | 20 | 8, 10, 11, 12, 20, 27, 33, 34, 39, 63, 94, 112, 114, 118, 136, 140, 145, 151, 171, 175 | 环境变量、仓库/包名、appCode、哈密范围/命名 |
| `tools/assemble-segments.mjs` | 1 | 4 | 仓库/包名 |
| `tools/check-components.mjs` | 1 | 6 | 仓库/包名 |
| `tools/check-copied.mjs` | 2 | 8, 52 | 仓库/包名 |
| `tools/check-directives.mjs` | 1 | 6 | 仓库/包名 |
| `tools/check-imports.mjs` | 5 | 8, 11, 75, 108, 152 | 仓库/包名 |
| `tools/check-text-nodes.mjs` | 2 | 6, 9 | 仓库/包名 |
| `tools/entry-graph.mjs` | 8 | 1, 8, 17, 19, 20, 29, 76, 86 | appCode |
| `tools/prompt-template-confirm.md` | 3 | 6, 7, 25 | 仓库/包名、环境变量、appCode |
| `tools/prompt-template.md` | 4 | 6, 14, 15, 23 | 仓库/包名、环境变量、appCode |
| `tools/registry-cleanup.mjs` | 3 | 1, 2, 12 | 仓库/包名 |
| `tools/registry.mjs` | 17 | 2, 6, 7, 11, 16, 27, 57, 72, 107, 182, 203, 232, 234, 302, 343, 358, 374 | 哈密范围/命名、仓库/包名、appCode |
| `tools/render-equiv-confirm.mjs` | 1 | 4 | 仓库/包名 |
| `tools/scan-secrets.mjs` | 3 | 2, 17, 25 | 仓库/包名 |
| `tools/scan-shared-gaps.mjs` | 11 | 3, 7, 49, 102, 104, 117, 121, 123, 134, 136, 141 | appCode、哈密范围/命名 |
| `tools/scope.mjs` | 5 | 19, 20, 90, 126, 132 | 域名、哈密范围/命名 |
| `tools/self-check.mjs` | 6 | 2, 5, 15, 66, 82, 120 | 仓库/包名、环境变量 |
| `tools/sfc-util.mjs` | 1 | 1 | 仓库/包名 |
| `tools/slice-maps.mjs` | 3 | 5, 13, 15 | 仓库/包名 |
| `tools/work-orders.mjs` | 14 | 8, 9, 13, 24, 36, 90, 113, 118, 160, 165, 166, 167, 207, 227 | 仓库/包名、哈密范围/命名、appCode、环境变量 |

### 正则查不到、同样要配置化的写死项

| 写死的内容 | 位置 | 改为 |
| --- | --- | --- |
| 入口 chunk 和 Vue chunk 的文件名（`1783320636200`、`1751615607545`） | `tools/analyze.mjs`、`tools/slice-maps.mjs`（main）；`tools/scope.mjs`、`docs/work-orders.md`、`docs/registry-cleanup.md`（PR #4）；`docs/pipeline.md` | `apps[].entryChunk`、`vueChunk` |
| 站点名 `portal` / `usercenter` 和应用名 `uc` 的对应 | `main` 与四个 PR 共 26 个脚本含 `usercenter`。引擎和钩子里的 13 个：`analyze.mjs`、`css-by-scope.mjs`、`describe-imports.mjs`、`e5-replay.mjs`、`finalize-vue-exports.mjs`、`lib/workorders.mjs`、`pw-login.mjs`、`pw-switch-role.mjs`、`record-lib.mjs`、`record-page.mjs`、`restore-api.mjs`、`scope.mjs`、`slice-maps.mjs`；其余属退役脚本 | `apps[].name`、`apps[].site` |
| 接口前缀 `/xf-api` | `main` 与四个 PR 共 18 个脚本在代码里使用（`work-orders.mjs` 只在说明文字里提到）。引擎和钩子里的 8 个：`e5-replay.mjs`、`har-body.mjs`、`har-decrypt.mjs`、`interact.mjs`、`pw-login.mjs`、`pw-switch-role.mjs`、`record-baseline-placeholder.mjs`、`record-page.mjs`；其余属退役脚本 | `apps[].apiPrefix` |
| Vue / ant-design-vue 版本 | `tools/scope.mjs`（PR #4）、`tools/vuefp*/package.json` | `apps[].versions` |
| SM2/SM4 与 `Crypto_Opt` 响应头 | `tools/har-decrypt.mjs`、`tools/e5-replay.mjs`（PR #3）；`tools/work-orders.mjs`（PR #4）；`build-har*.mjs`、`pw-record.mjs`（main，退役） | 钩子 `hooks/crypto.mjs` |
| 用户中心四个身份 | `tools/record-lib.mjs` 的 `IDENTITIES`（PR #2） | 钩子 `hooks/identity.mjs` |
| 本机绝对路径（`/Users/dylan/Projects/...`） | `docs/pipeline.md` 第一节、`docs/crypto-adapter-spec.md` | 各机环境文件里的 `RESTORE_ASSETS`、`RESTORE_STATE`；文档只写变量名 |
