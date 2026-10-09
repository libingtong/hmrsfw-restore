通用化（HM-11）阶段 1 的契约之二：`tick.mjs` 派单时写进任务元数据的键，以及智能体怎样只靠这些键完成检出和 `setup-workdir`。目标是智能体指令里**不出现任何项目信息**：仓库地址、分支、配置位置、产物目录的环境变量名，全部从元数据读。

本文只定契约。`tick.mjs`、`handoff.mjs`、`setup-workdir.mjs` 按本文实现是 G2 的工作，智能体指令改为只读这些键是 G3 的工作。在那之前，现有任务没有 `contract` 键，智能体照现在 `docs/pipeline.md` 第五至七节的写法执行。

第十二节「任务元数据键」和 `docs/scheduler.md`「任务元数据」里的键全部照旧，本文只新增「定位」类的键，并把已有的几个键的含义写死。

## 编码

沿用 `docs/scheduler.md`：对象和数组按 JSON 字符串写入（`--type string`），读的时候解码；整数照常写。清空一个键用 `metadata delete`，不写空字符串。元数据里不得出现密钥、账号、手机号、证件号、显示名、HAR 内容。

## 键

### 定位键（新增）

| 键 | 例子（哈密，G2 之前） | 含义 |
| --- | --- | --- |
| `contract` | `vr-ticket/1` | 本契约的版本。有这个键，智能体就只按本文执行 |
| `project` | `hmrsfw` | `restore.config.json` 的 `project.id`，用于日志和核对 |
| `toolRepo` | `https://github.com/libingtong/hmrsfw-restore` | 引擎仓库（配置 `repos.engine.url`）。G2 之后是 `vue-restore-kit` |
| `toolRef` | `9de9d20…`（40 位提交） | 本次运行使用的引擎提交，派单时解析：`repos.engine.ref` > `integrationBranch` > `defaultBranch` 的当前提交 |
| `dataRepo` | `https://github.com/libingtong/hmrsfw-restore` | 项目数据仓库（`repos.data.url`） |
| `dataRef` | 40 位提交 | 派单时 `repos.data.integrationBranch`（没有则 `defaultBranch`）的当前提交。`dataRepo` 与 `toolRepo` 相同时必须等于 `toolRef`，智能体只检出一次 |
| `configRef` | `restore.config.json@<dataRef>` | 配置文件在数据仓库里的路径；`@` 后面的提交必须等于 `dataRef` |
| `appRepo` | `https://github.com/libingtong/hmrsfw-vue` | 产物工程（`repos.app.url`） |
| `appRef` | 40 位提交，或等于 `branch` | 产物工程检出哪个引用。分支还没推送过：派单时 `repos.app.integrationBranch` 的当前提交（新分支的起点）；推送过之后：等于 `branch`，取分支最新提交 |
| `appDirEnv` | `VR_APP_DIR` | 产物工程检出目录要导出到哪个环境变量（配置 `env.appDir`） |
| `app` | `portal` | 本任务涉及的子应用（`apps[].name`）。打包单只打同一应用的页，所以只有一个值 |
| `branchRepo` | `app` | `branch` 在哪个仓库：`app`（还原、修正、门槛、审计）、`tool`（规则变更单：门槛脚本、归一化规则在引擎里）、`data`（预留：只改项目数据的分支） |

### 已有键（含义固定）

| 键 | 含义 |
| --- | --- |
| `kind` | `restore` / `upgrade` / `record` / `integration` / `audit` / `arbitrate` / `rule-review` / `incident` |
| `workOrders` | 工单 id 数组，工单文件是数据仓库里的 `queue/<工单id>.json` |
| `branch` | 本次尝试的分支，在 `branchRepo` 指定的仓库里。**不透明字符串**，由 `tick.mjs` 生成（规则见 `docs/scheduler.md`「分支名」，含双派后缀、打包单、`-r<n>`），智能体照抄，不自己拼 |
| `attempt` | 第几次尝试（整数，从 1 开始） |
| `fixRound` | 本次尝试已经修过几轮 |

### 各类任务必须有的键

`●` 必填，`○` 有就写，`—` 不写。

| 键 | restore / upgrade | audit / arbitrate | record | integration | rule-review | incident |
| --- | --- | --- | --- | --- | --- | --- |
| `contract`、`project`、`toolRepo`、`toolRef`、`dataRepo`、`dataRef`、`configRef` | ● | ● | ● | ● | ● | ● |
| `appRepo`、`appRef`、`appDirEnv` | ● | ● | ● | ● | ○ | ○ |
| `app` | ● | ● | ● | ○ | — | — |
| `workOrders` | ● | ● | ● | ○ | — | — |
| `branch`、`branchRepo` | ● | ● | — | — | ●（`branchRepo=tool`） | — |
| `attempt`、`fixRound` | ● | ● | — | — | — | — |

`audit`、`arbitrate` 是同一张还原任务改了 `kind`（见 `docs/scheduler.md`），定位键沿用原值不重写。录制员要用产物工程里的入口和应用配置（`record-page.mjs` 接受 `--app`），所以 `record` 也带 `appRepo`。`integration` 任务的 `appRef` 就是它要测的提交（现有的 `sha` 键）。

### 谁写、什么时候改

| 时机 | 写什么 |
| --- | --- |
| `tick` 派新单（建任务后、指派前，与现有元数据一起一次写入） | 全部定位键；有 `branch` 的任务 `appRef` = 产物工程 `integrationBranch` 的当前提交 |
| `tick` 开新的尝试（重做、`-r<n>` 重开分支、挂起后重派） | `branch`、`attempt`、`fixRound`；`toolRef`、`dataRef`、`configRef`、`appRef` 重新解析为当时的提交（`-r<n>` 分支由脚本建好并推送，此时 `appRef` = 新 `branch`） |
| `handoff.mjs` 交付（分支第一次推送之后） | `appRef` = `branch` |
| 其余时候 | 不改定位键。同一次尝试里的修正、门槛、审计都在同一个 `toolRef`、`dataRef` 上跑，结果可复现 |

## 智能体的开工步骤

下面的步骤对所有角色相同，指令里只写这一段，不写任何地址。`<键>` 表示从元数据取的值。

1. `multica issue metadata list <任务id> --output json`。
   - 没有 `contract`：兼容期，按旧指令执行。
   - 有 `contract` 但不是 `vr-ticket/1`：评论 `[ENV] unsupported_contract <值>` 后结束，不按旧指令猜。
2. 引擎：`multica repo checkout <toolRepo> --ref <toolRef>`，记为 TOOL。
3. 数据：`dataRepo` 与 `toolRepo` 相同则 DATA = TOOL；否则 `multica repo checkout <dataRepo> --ref <dataRef>`，记为 DATA。
4. 产物工程：`multica repo checkout <appRepo> --ref <appRef>`，记为 APP。
   - 没有 `branch`（录制、集成等）：停在这个提交上，不建分支。
   - 有 `branch` 且 `branchRepo=app`：`git -C APP switch -C <branch>`。`appRef` 是起点提交时，这一步从起点新建分支；`appRef` 等于 `branch` 时，HEAD 已是远端分支的最新提交，这一步只是把本地分支名对齐（`multica repo checkout` 会建自己的工作分支）。推送一律 `git push origin <branch>`。
   - `branchRepo=tool`（规则变更单）：对 TOOL 做同样的处理；`branchRepo=data` 对 DATA 做同样的处理。
5. 环境变量：`export <appDirEnv>=APP`，`export VR_DATA_DIR=DATA`，`export VR_CONFIG=DATA/<configRef 的路径部分>`。
6. `node TOOL/tools/setup-workdir.mjs --app APP --data DATA --config-ref <configRef> --tool-ref <toolRef> --data-ref <dataRef>`，有 `branch` 时加 `--branch <branch> --branch-repo <branchRepo>`。
7. 之后所有工具都用 `node TOOL/tools/<脚本>` 运行；读工单 `DATA/queue/<工单id>.json`、项目规则 `DATA/<projectNotes>`（路径从配置读）。

### 写回数据仓库

DATA 检出固定在 `dataRef`，**只读**。智能体不直接向数据仓库推送。回执、交互脚本等写回数据仓库的内容，一律由引擎脚本（`handoff.mjs`、`record-page.mjs` 等）在 `repos.data.integrationBranch` 的远端最新提交上用临时 worktree 提交，和现在 `tools/lib/gitops.mjs` 提交回执的做法一样，所以不会因为 `dataRef` 落后而推送冲突。入口包、共享组件工单对 `registry/` 的更新怎样交给脚本提交，由 G2 在 `handoff.mjs` 里定。

### `setup-workdir.mjs` 在 G2 要加的检查

在现有的依赖准备之前，依次检查，任何一条不满足都输出 `{ok:false, error:<代码>, detail}` 并退出 1：

| 代码 | 条件 |
| --- | --- |
| `tool_ref_mismatch` | TOOL 的 `HEAD` 不是 `toolRef` |
| `data_ref_mismatch` | DATA 的 `HEAD` 不是 `dataRef` |
| `config_ref_mismatch` | `configRef` 的提交不等于 `dataRef` |
| `config_missing` | DATA 里没有 `configRef` 的路径 |
| `config_invalid` | `validate-config.mjs` 不通过（检查文件存在性） |
| `app_mismatch` | APP 的 `package.json` 的 `name` 不是 `repos.app.packageName`，或 `apps[].target` 模板里 `{view}` 之前的目录（代入 `{app}`）不存在 |
| `branch_mismatch` | 有 `branch` 时，`branchRepo` 对应检出的当前本地分支不是 `branch` |

通过时输出里增加 `resolved: {tool, data, app, config, project, apps:[...]}`，后面的脚本和智能体都以它为准。

### 失败时

`setup-workdir` 报错属于环境问题，不是还原失败：智能体评论 `[ENV] <error 代码> <一行说明>`，不改状态和负责人，不写回执，结束。`tick` 第 2 步把 `[ENV]` 当作环境类失败处理：同一智能体按**同样的定位键**重跑一次（重新检出），再失败换候选；仍然失败就报 anomaly 交给裁定员。定位键只在「谁写、什么时候改」表里的时机改变，不因为 `[ENV]` 刷新。

### 禁止

- 不从元数据以外的地方推断仓库地址、分支或配置位置；不检出元数据没有列出的仓库。
- 不修改 `restore.config.json`、schema 和定位键（定位键只由 `tick.mjs`、`handoff.mjs` 写）。
- 定位键缺失或互相矛盾时不猜，按「失败时」处理。

## 与现有实现的对照

| 现在写死的地方 | G2 之后 |
| --- | --- |
| 指令里的 `multica repo checkout https://github.com/libingtong/hmrsfw-restore --ref integration` | 开工第 2–4 步 |
| `tick` 任务描述里的「从 hmrsfw-vue `integration` 拉」（`tools/lib/pipeline.mjs`） | 描述只写「参数以任务元数据为准」，分支起点看 `appRepo`、`appRef` |
| `HMRSFW_APP_DIR` / `--app` | `appDirEnv`（`VR_APP_DIR`）+ `--app`，别名保留一个版本 |
| `HMRSFW_TOOL_ROOT`（测试用） | `VR_TOOL_ROOT` |
