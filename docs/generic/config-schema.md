通用化（HM-11）阶段 1 的契约之一：一个项目接入 Vue 3 + Vite 还原工作流时提供的静态配置 `restore.config.json`。机器可读的定义是 `schema/restore.config.schema.json`（JSON Schema draft 2020-12），本文解释每个字段的含义和引擎怎么用它。哈密的实例是仓库根目录的 `restore.config.json`。

本阶段只定契约，现有脚本不改。G2（引擎拆仓）按本文把写死的值换成读配置，清单见 `split-plan.md` 末尾。

## 放什么，不放什么

| 放进 `restore.config.json` | 不放 |
| --- | --- |
| 项目身份、负责人、三个仓库、子应用、测试域名、升级边界、项目规则文档的位置 | 密钥、账号、手机号、证件号、显示名、登录态、HAR（任何形式都不放，只写环境变量**名**） |
| 不随运行变化的值，改它要走 PR | 调度参数（并发、抽检率、停止条件、价格系数）：仍在 `$RESTORE_STATE/scheduler.config.json`，见 `docs/scheduler.md` |
| | 智能体名册：仍在 `$RESTORE_STATE/agents.roster.json` |

文件放在**项目数据仓库**（哈密是 `hmrsfw-restore`）的根目录。配置里的相对路径按字段有两种基准：`apps[].legacyDist`、`projectNotes` 相对数据仓库根目录；`apps[].target`、`apps[].viteConfig` 相对产物工程根目录。

## 校验

```bash
node tools/validate-config.mjs [restore.config.json] [--schema <file>] [--data-root <dir>] [--no-files]
node --test tools/test/validate-config.test.mjs        # 设置 AJV_DIR=<装了 ajv 的目录> 时同时用 ajv 交叉校验
```

`validate-config.mjs` 不依赖第三方包，实现了 schema 用到的那部分 JSON Schema 关键字；schema 里出现它不认识的关键字会直接报错，不会悄悄放过。schema 表达不了的检查也在这里做：

- `apps[].name`、`apps[].site` 不重复，`escalation.categories[].id` 不重复；
- 每个 `apps[].testOrigin` 的主机都在 `recording.allowedHosts` 里；
- `holdsSecrets` 为 `false` 的分片不带 `gate`、`recorder`、`fixer`、`arbiter` 角色；
- 默认还检查 `legacyDist` 目录和 `entryChunk`、`vueChunk` 文件存在（`--no-files` 跳过）。数据仓库根目录缺省是配置文件所在目录，配置不在数据仓库根目录时用 `--data-root` 指定；
- `projectNotes` 指向的文件不存在时给警告（哈密的 `docs/project-notes.md` 在 G2 创建）。

先做 schema 校验，有错误就只报这些错误、跳过上面的检查。输出一行 JSON：`{ok, config, errors:[{path, message}], warnings:[]}`，有错误时退出码 1；配置文件读不出来或不是合法 JSON 也按这个格式报错。G2 之后引擎的每个入口在读配置时调用它，配置不合法就拒绝运行。

## 字段

### `schemaVersion`

固定为 `1`。破坏性变更时加 1。已知的下一次破坏性变更：删除 `env.appDirAliases`（见 `env`）。

### `project`

| 字段 | 必填 | 含义 |
| --- | --- | --- |
| `id` | 是 | 项目短名（小写字母开头，2–32 位）。用于分支前缀、锁名、日志。哈密是 `hmrsfw` |
| `name` | 是 | 显示名 |
| `owner.memberId` | 是 | 项目负责人的 Multica 成员 id（user id，和名册 `escalateTo.memberId` 是同一个值）。升级给人时指派给他 |
| `owner.label` | 否 | 便于人读的称呼，脚本不使用 |
| `adapter` | 是 | 构建产物适配层。本期只有 `vue3-vite`。Vue 2 / webpack 不在范围内，引擎只预留这个枚举位 |
| `multicaProjectId` | 否 | 流水线任务所在的 Multica 项目 |

### `repos`

三个仓库，每个都有 `url`（`multica repo checkout` 用的 https 地址）和 `defaultBranch`。

| 键 | 是什么 | 额外字段 |
| --- | --- | --- |
| `engine` | 引擎：`tools/`、通用版 `pipeline.md`、schema。G2 之后是 `libingtong/vue-restore-kit`；G2 之前和 `data` 是同一个仓库 | `integrationBranch`、`ref`（可选：项目固定使用的引擎标签或提交） |
| `data` | 项目数据：本文件、`legacy-dist/`、`queue/`、`out/maps`、`out/hints`、`registry/`、`receipts/`、`tests/interact/`、`projectNotes` | `integrationBranch` |
| `app` | 产物工程：还原出的干净 Vue 源码 | `integrationBranch`（必填）、`packageName`（必填，产物工程根 `package.json` 的 `name`，定位产物目录时用来确认没有指错检出，对应现在 `app-dir.mjs` 的 `APP_PACKAGE_NAME`）、`attemptBranchPrefix`（可选，缺省 `restore/`） |

### `apps[]`

每个子应用一项，至少一项。

| 字段 | 必填 | 含义 | 哈密门户 |
| --- | --- | --- | --- |
| `name` | 是 | 子应用名：产物工程 `apps/<name>/`、`registry/<name>.json`、工单 id 中的应用段 | `portal` |
| `site` | 否 | 旧产物的站点名：`legacy-dist` 下的目录名、工单的 `site` 字段。缺省等于 `name` | `portal`（用户中心是 `usercenter`，`name` 是 `uc`） |
| `title` | 否 | 显示名 | 门户 |
| `legacyDist` | 是 | 旧构建产物目录，相对 data 仓库根目录 | `legacy-dist/portal` |
| `entryChunk` | 是 | 入口 chunk 文件名，在 `<legacyDist>/assets/` 下 | `index.1783320636200.js` |
| `vueChunk` | 否 | Vue 运行时被单独拆包时的文件名 | `vue.1783320636200.js` |
| `versions` | 是 | 按原包指纹锁定的依赖版本，键是 npm 包名，`vue` 必填且必须是 3.x | `{"vue":"3.2.47","ant-design-vue":"3.2.15"}` |
| `target` | 是 | 页面落点模板，相对产物工程根目录，必须含 `{view}` | `apps/{app}/src/views/{view}` |
| `viteConfig` | 否 | 该应用的 vite 配置，相对产物工程根目录 | `vite.portal.config.ts` |
| `testOrigin` | 否 | 测试环境地址，只能是 https，只到主机（不带路径）。主机必须在 `recording.allowedHosts` 里 | `https://hamiwebportaltest.rencaidanao.com` |
| `apiPrefix` | 否 | 后端接口路径前缀；离线回放据此区分接口请求和静态资源 | `/xf-api/` |

`target` 的占位符：`{app}` = `name`；`{view}` = 页面在 views 根下的相对路径，带 `.vue`（来源是旧产物里的路由或 `import.meta.glob` 键）。`work-orders.mjs` 用它算工单的 `target`，`subComponentDir` 是去掉 `.vue` 后加 `/`。产物工程里已有的、验收过的页面（种子）沿用它现有的路径，不按模板改名。

### `env`

| 字段 | 必填 | 含义 |
| --- | --- | --- |
| `appDir` | 是 | 固定为 `VR_APP_DIR`：产物工程检出目录的环境变量名 |
| `appDirAliases` | 否 | 兼容别名，只能是 `["HMRSFW_APP_DIR"]`。只在 `schemaVersion` 1 保留，下一个版本删除 |
| `secrets` | 否 | 项目密钥所在的环境变量名（只写名字）。哈密是 `SM2_PRIVATE_KEY`。`scan-secrets.mjs` 和各角色的环境文件按它核对 |

**定位产物工程**（G2 统一改 `tools/app-dir.mjs`）：

1. `--app <dir>`（参数优先）；
2. `VR_APP_DIR`；
3. `appDirAliases` 里的变量（`HMRSFW_APP_DIR`），使用时在输出的 `warnings` 里提示改名；
4. 都没有：报错退出，不猜默认路径。

`VR_APP_DIR` 和别名同时设置且指向不同目录时报错，不择一。找到的目录必须有 `package.json` 且 `name` 等于 `repos.app.packageName`，并且每个应用的 `target` 模板里 `{view}` 之前的目录（代入 `{app}`，哈密是 `apps/portal/src/views/`、`apps/uc/src/views/`）存在。后一条取代现在 `app-dir.mjs` 对 `apps/` 目录的写死检查。

**引擎固定的变量**（不在配置里，所有项目同名）：`RESTORE_STATE`、`RESTORE_ASSETS`、`RESTORE_DEPS_CACHE`。G2 新增 `VR_DATA_DIR`（项目数据仓库检出目录）和 `VR_CONFIG`（配置文件路径），定位顺序：`--config` > `VR_CONFIG` > `<数据目录>/restore.config.json`；数据目录：`--data` > `VR_DATA_DIR` > 引擎仓库根目录（G2 之前两者是同一个仓库）。现有以 `HMRSFW_` 开头的其他开关的改名见 `split-plan.md`。

### `recording.allowedHosts[]`

录制时浏览器**唯一**允许访问的主机，精确匹配 URL 的 host（带端口时写端口），不支持通配，不带协议。

强制位置在脚本层：`record-page.mjs` 在浏览器上下文的请求路由里，对 host 不在列表中的 http(s) 请求一律 `abort`，并在输出里列出被拦下的主机。这个检查不依赖智能体自觉，也不能用参数关掉。生产环境的主机永远不能出现在列表里；需要访问生产环境属于升级事项（`compliance-security`）。现在 `record-lib.mjs` 里的 `ORIGIN` / `TEST_HOSTS` 常量在 G2 改为读这个字段和 `apps[].testOrigin`。

### `escalation`

只有这里列出的事情才 `blocked` 并指派给人，其余由智能体按机器判据或另一个智能体复核解决（对应现在 `pipeline.md` 第十五节第 4 小节）。

| 字段 | 必填 | 含义 |
| --- | --- | --- |
| `assignee` | 是 | `owner`（即 `project.owner`）或一个 Multica 成员 id |
| `categories[]` | 是 | `{id, title, examples[]}`。`id` 只能是下面四类，四类都必须出现且各出现一次；项目只补充例子 |
| `defaults[]` | 否 | `{id, decision}`：待决事项的默认值，智能体照此执行并记进每日摘要，人可以随时推翻 |

| `id` | 含义 |
| --- | --- |
| `human-presence` | 需要人在场：登录、其他角色账号、测试环境重置、造数 |
| `money` | 超预算、新增付费模型或运行时 |
| `compliance-security` | 著作权与合同、密钥或个人数据泄露、需要访问生产环境 |
| `agent-disagreement` | 规则变更单两轮复核不同意、需要业务知识的取舍 |

### `projectNotes`

项目专属规则文档的路径，相对 data 仓库根目录。通用版 `pipeline.md` 不写任何项目的特例，项目特例（哈密的 `appCode` 多租户、路由范围、站点版本差异、D 系列决定的项目含义等）写在这里，智能体开工时和通用规则一起读。哈密是 `docs/project-notes.md`，由 G2 从现在的 `pipeline.md` 拆出，拆分表见 `split-plan.md`。

### `machines[]`（可选）

| 字段 | 必填 | 含义 |
| --- | --- | --- |
| `name` | 是 | 分片名，如 `mac`、`office` |
| `host` | 否 | Multica 运行时所在主机名，只用于核对 |
| `holdsSecrets` | 否 | 是否持有 HAR、登录态、密钥。为 `false` 的分片不得承担门槛、录制、修正、裁定（`validate-config.mjs` 检查 `roles`） |
| `roles` | 否 | 该分片承担的名册角色（`dispatcher`、`gate`、`recorder`、`fixer`、`arbiter`、`restorer`、`restorer-core`、`reviewer`） |

不写表示单机部署。

## 版本与兼容

- 新增可选字段不改 `schemaVersion`；删除字段、改含义、新增必填字段都要加 1，并在引擎里保留一个版本的读取兼容。
- 改 schema 走 PR，`tools/test/validate-config.test.mjs` 必须同时更新。
