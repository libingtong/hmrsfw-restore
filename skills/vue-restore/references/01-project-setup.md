# 立项与隔离

新还原项目在动手还原任何页面之前，先把下面这些事情定下来，写进 Multica 项目描述和 `docs/project-notes.md`。这一步没做完，后面每张单都会各自去猜。

## 1. 立项清单（填完才开工）

| 项 | 要定什么 | 写在哪 |
| --- | --- | --- |
| 项目身份 | 短名（用于分支前缀、锁名，如 `<proj>`）、显示名、负责人（Multica 成员 id） | `restore.config.json` 的 `project` |
| 目标机器 | 在哪台机器上跑。录制要人登录，所以录制必须在人能操作浏览器的那台机器上 | 项目描述、`machines` |
| 原产物 | 构建产物在哪个目录，入口 chunk 是哪个，Vue 运行时 chunk 是哪个；目录里有没有已有的还原成果 | `apps[].legacyDist`、`entryChunk`、`vueChunk` |
| 产物工程 | 还原出的源码放在哪个仓库或目录，包名是什么 | `repos.app` |
| 测试地址 | **唯一**的测试站域名；接口前缀 | `apps[].testOrigin`、`apiPrefix`、`recording.allowedHosts` |
| 技术基线 | 框架和组件库的确切版本，以产物证据锁定（见 `02-artifact-analysis.md`），不按印象写 | `apps[].versions` |
| 交付方式 | 推 GitHub 私有仓库，还是只在本地 worktree 分支、不推远程；谁合并到 `main` | 项目描述 |
| 状态与资产目录 | 本机 `RESTORE_STATE`（账本、基线、门槛产物）、`RESTORE_ASSETS`（HAR、登录态），**每个项目一套** | 智能体环境变量文件，不入库 |
| 密钥 | 需要哪些环境变量（只写变量名） | `env.secrets` |
| 身份与账号 | 测试账号有几种身份，页面要用哪种身份录制 | 项目钩子 + `project-notes.md` |
| 升级给谁 | 需要人在场、钱、合规、智能体意见无法统一时，升级给谁 | `escalation` |

`restore.config.json` 的样例见 `templates/restore.config.example.json`，字段含义见 `docs/generic/config-schema.md`。写完后运行 `node tools/validate-config.mjs <配置>` 校验。

### 环境变量（按角色发放，写在各智能体的环境文件里，0600，不入库）

| 变量 | 谁有 |
| --- | --- |
| `RESTORE_STATE` | 全部智能体 |
| `RESTORE_ASSETS`、请求解密私钥 | 只有门槛员、录制员（还原员拿不到 HAR 和登录态） |
| 前端加解密密钥（如 `VITE_*` 公钥、对称密钥） | 门槛员：门槛的 worktree 里没有 `.env.local`，缺了就会报 `crypto keys missing` |
| `RESTORE_DEPS_CACHE` | 还原员、复核员等：共享依赖缓存，避免每个任务目录各装一份 `node_modules` |
| `VR_APP_DIR`（兼容 `HMRSFW_APP_DIR`）或 `--app` | 用到产物工程的脚本；两者都没有就报错，不猜默认路径 |

## 2. 隔离规则（写进项目描述，所有子单和智能体都继承）

同一台机器上常常同时跑好几个还原项目，它们的目录、域名、智能体名字都很像，最容易出事的就是串项目。项目描述里要写一段「强制隔离」：

- 本项目的所有任务、子任务、智能体、运行状态、证据、构建产物都挂在本项目下。
- 列出**禁止混用**的项目名、任务号、目录、测试域名、分支和智能体。
- 不访问其他项目的测试域名，不读取或复制其他项目的凭据、Cookie、登录态、HAR、个人数据、任务状态或源码。
- 新建专用智能体时绑定本项目，指令里写明目录和测试域名；绑定没核验完不得启动任务。
- 每张单在创建或指派前核对四件事：项目 id、目标目录、唯一测试域名、工作流仓库。

## 3. Git 与工作区

- 产物目录还不是 git 仓库时，先 `git init`，加 `.gitignore`（至少包括 `node_modules/`、`*.har`、`.auth/`、`.env*`），把现有内容原样提交为基线（例如 `baseline: original build output`）。只新增 `.git` 和 `.gitignore`，已有文件一个都不动。
- **先有基线提交，再切 worktree 模式**。目录还不是 git 仓库就把项目资源切成 worktree，第一次运行必然失败（实际发生过）。
- 分支模型：`main`（人工或回归通过后合入）、`integration`（门槛通过后合入）、每次尝试一条 `restore/<工单>-a<n>`。轻量模式可以每批一条分支，由收尾单统一合并。
- 同一个目录不允许两个原地（in_place）任务同时写。要并行，先确认已经隔离到各自的 worktree。
- 不推送到未知远程。只推送项目描述里列出的仓库。

## 4. 引擎接入（G1）

1. 从上游 `hmrsfw-restore` 的 `main` 拷入 `tools/`、`schema/`、`rules/`、`package.json` 和通用文档。记下上游提交指纹。上游的 `legacy-dist/`、`queue/`、`registry/`、`out/` 是别的项目的数据，剔除。
2. 写本项目的 `restore.config.json` 和项目钩子。上游的站点名、`appCode`、域名、接口前缀这些默认值不要带进来。写死的位置见 `docs/generic/split-plan.md`。
3. 用原产物离线重建映射：路由 → chunk、CSS scope、入口导出、接口封装、组件解析、依赖指纹。然后生成公共库清单 `registry/`、工单 `queue/`、`out/maps/`、`out/hints/`，以及 `tests/interact/` 骨架。
4. **已有成果沿用，不推倒重来**：已经还原好的页面在工单里标成 `regression`（只做回归），不再派还原单。现有源码要先接上引擎的自检，不能因为接入引擎而改变业务行为。
5. 准备依赖（`setup-workdir.mjs`）、Playwright Chromium，以及对应 Vue 版本的指纹库（`tools/vuefp*`。遇到新的 Vue 版本，要新建一个指纹库）。
6. 跑引擎自带测试和本项目的静态检查。映射重建出来的数字要和摸底时的数字一致，不一致的逐项说明原因。

## 5. 摸底单（G0）要回答的问题

在建 G1 之前，先用一张摸底单回答下面这些问题，结果写进 `project-notes.md` 初稿：

- 环境：`node`、`npm`、`git` 的版本；能否访问引擎仓库；测试站首页能否打开（只发一次 GET，不登录）。缺什么，列给人去装。
- 产物：在哪、是什么构建工具（不是 Vite 时立即停下，见 `02-artifact-analysis.md`）；入口、共享、页面 chunk 各有多少；路由表；接口模块；有没有加密；有没有多租户分支；样式怎么组织。
- 已有成果：哪些是原产物，哪些是已经还原或手写的源码；工程结构和命令；能不能 `build`；完成到什么程度。
- 引擎适配：哪些脚本能直接用，哪些只需改配置，哪些写死了别的项目的逻辑，需要改代码或写钩子。
- 录制：哪些页面要登录才能录，需要哪些身份。
- 计划：分几批，每批多少页，哪些地方需要人参与。

产物目录里没有构建产物时，只用 GET 抓取测试站首页 `index.html` 和它引用的静态资源，存进 `legacy-dist/` 并提交到基线。不登录，也不抓接口数据。

## 6. 项目笔记

`docs/project-notes.md` 是项目专属规则的唯一出处，模板见 `templates/project-notes.md`。下列内容只写在这里，不进引擎文档，也不进本 skill：目录、命令、依赖版本、身份与账号约定、已知阻塞、加解密方式、HAR 与密钥的边界、批次计划，以及按默认值执行的决定。
