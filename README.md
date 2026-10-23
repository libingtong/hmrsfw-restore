哈密 Vue 3 页面批量还原流水线的工具仓库。编排方案、门槛要求和各脚本之间的接口约定见 [docs/pipeline.md](docs/pipeline.md)（v3.2），第十二节是并行子任务共同遵守的契约，第十三节是公共库统一，第十五节是自治与升级给人的边界。

## 两个仓库的分工

| 仓库 | 放什么 | 谁写 |
| --- | --- | --- |
| [`libingtong/hmrsfw-vue`](https://github.com/libingtong/hmrsfw-vue) | 产物工程：两个应用（`apps/portal`、`apps/uc`）的干净 Vue 源码、两份 vite 配置、`package.json`/lock。就是最终交付物 | 还原员、修正员（只写工单指定的页面目录）；入口包、共享组件工单（公共库） |
| `libingtong/hmrsfw-restore`（本仓库） | 工具、`legacy-dist`、映射、工单、回执、公共库清单 `registry` | 工程子任务；工单、回执、清单由对应脚本和角色写 |

两个仓库都用 `main`（人工合并）、`integration`（门槛通过后自动合并）两条主干；还原尝试在 `hmrsfw-vue` 上开 `restore/<工单id>-a<attempt>` 分支。

**工具怎么找到产物工程**：通过参数 `--app <hmrsfw-vue 检出目录>` 或环境变量 `HMRSFW_APP_DIR`，参数优先；两者都没有就报错退出，没有默认路径。共用实现是 `tools/app-dir.mjs` 的 `appDir()`，新脚本直接引用它。

## 目录

| 路径 | 内容 |
| --- | --- |
| `legacy-dist/` | 线上已发布的前端产物（门户 `portal/`、用户中心 `usercenter/`），还原的唯一依据。只读，不改 |
| `queue/` | 全部哈密工单（`tools/work-orders.mjs` 生成），`index.json` 一览、`routes.json` 路由清单、`summary.json` 数量 |
| `registry/` | 公共库清单 `portal.json`、`uc.json`（`tools/registry.mjs` 生成）；`names.<app>.json` 是人工核定的入口导出名 |
| `out/maps/`、`out/hints/` | 每张工单的导入映射与提示表（由清单生成，还原员直接读）；`c01`–`c20`、`p*` 是 POC 与 20 页确认时期的旧文件 |
| `tools/` | 分析、检查、门槛脚本；`prompt-template-confirm.md` 是还原员指令主体；交付前自检 `self-check.mjs` |
| `docs/` | `pipeline.md`（编排方案）、`work-orders.md`（工单、清单、自检）、`registry-cleanup.md`（`hmrsfw-vue` 现状清理方案）、`crypto-adapter-spec.md`（加解密适配） |
| `skills/vue-restore/` | 可复用的还原方法 skill（主文件 `SKILL.md` + `references/` + `templates/`），新还原项目从这里起步；项目专属内容不写进去 |
| `batch-plan.md` | 批量还原计划 v2，工单字段见第 3 节（新增字段见 `docs/work-orders.md`） |

`receipts/`、`tests/interact/` 由阶段 2 的其他子任务按第十二节建立。

**交互脚本 → E2E**：`tests/interact/<工单id>.json` 是录制员写的脚本；`hmrsfw-vue` 自己的 E2E（`npm run e2e`，见该仓库 `e2e/README.md`、`docs/graduation.md`）跑的是 `e2e/cases/<id>.json`。录制员新增或改了脚本以后，跑一次 `node tools/interact-to-e2e.mjs --app <hmrsfw-vue 检出目录>` 同步过去（重复运行结果不变；`--check` 只检查是否同步，`--prune` 删除已不在范围内的用例）；测试：`node --test tools/test/interact-to-e2e.test.mjs`。

本仓库不包含 HAR、登录态、SM2 私钥、后端源码和接口返回的数据。它们只在 Mac mini 本机（`$RESTORE_ASSETS`、`$RESTORE_STATE`），见 `docs/pipeline.md` 第一、四节。提交前运行 `node tools/scan-secrets.mjs`。

## 开始工作

```bash
git clone https://github.com/libingtong/hmrsfw-restore
git clone https://github.com/libingtong/hmrsfw-vue
cd hmrsfw-restore
export HMRSFW_APP_DIR=$PWD/../hmrsfw-vue   # 或者每条命令带 --app ../hmrsfw-vue
node tools/setup-workdir.mjs                # 准备两个检出的依赖，输出一行 JSON
npm --prefix "$HMRSFW_APP_DIR" run build    # 构建两个应用，输出 hmrsfw-vue/dist/portal、dist/uc
```

`setup-workdir.mjs` 处理四个依赖目录：本仓库的根目录、`tools/vuefp/`、`tools/vuefp33/`，以及 `hmrsfw-vue` 检出的根目录。

- 设置了 `RESTORE_DEPS_CACHE`：各目录的 `node_modules` 软链到缓存。缓存项按「目录 + 平台 + Node 主版本 + `package-lock.json` 的 SHA-256」区分，`hmrsfw-vue` 的缓存项按它自己的 lock 文件建。缓存项不存在时在缓存目录里 `npm ci` 一次，用 `<缓存>/.locks/` 下的目录锁防止并发重复安装。lock 文件变了会自动生成新缓存项。
- 没有设置：在各目录原地 `npm ci`，`node_modules` 与 lock 文件一致时跳过。
- `hmrsfw-vue` 的 `.gitignore` 只忽略 `node_modules/` 目录，不覆盖软链，所以脚本会把 `/node_modules` 写进该检出的 `.git/info/exclude`，不改它的任何受控文件。
- 本地已有真实的 `node_modules` 目录时默认保留并给出警告，`--force` 改为软链。

## 不入库、需要另外获取的东西

| 内容 | 获取方式 |
| --- | --- |
| 各目录的 `node_modules` | `node tools/setup-workdir.mjs` |
| `tools/vuefp/`、`tools/vuefp33/` 的参考构建 `dist/vuefp.js`（`map-vue-exports.mjs` 用） | 先跑 `setup-workdir.mjs`，再 `cd tools/vuefp && npx vite build`（`vuefp33` 同理）。两者分别是 Vue 3.2.47 / 3.3.4 运行时的指纹库，对应门户和用户中心的打包版本；`render-equiv.mjs` 用它们 `node_modules` 里的 `@vue/compiler-sfc` |
| Playwright Chromium（门槛、录制用） | `npx playwright install chromium`；`setup-workdir.mjs` 发现缺失会在 `warnings` 里提示 |
| 加解密密钥 | 在 `hmrsfw-vue` 里复制 `.env.example` 为 `.env.local` 填值，不得提交 |
| HAR、登录态、原版基线、门槛产物 | 只在 Mac mini：`$RESTORE_ASSETS`、`$RESTORE_STATE` |

## 录制：登录态、身份与并发

录制只在 Mac mini 上跑（`tools/record-page.mjs`，见 `docs/pipeline.md` 第六、十二节），只访问两个测试站。

**登录态按站点存，人只登录、不切身份。** 每个站点一份：`$RESTORE_ASSETS/.auth/pw-portal.json`、`pw-usercenter.json`。两站共用一个账号，**只需登录门户一次**：在 `$RESTORE_ASSETS` 下运行 `node <本仓库>/tools/pw-login.mjs all 30`（30 是最多等待的分钟数），在弹出的门户登录页手动登录。检测到门户登录后，脚本在同一个窗口里点门户右上角原版的「用户中心」入口，由原版前端自己跳到用户中心并完成登录（`/autoLogin`），脚本先保存 `pw-usercenter.json`、再保存 `pw-portal.json`，然后分别检查两个文件都在、各自的 token 没过期，并打印各自的过期时间（只打印时间）。两站过期时间本来就不同：用户中心的 `autoLogin` 会换发自己的 token，所以不比较两站是否一致；哪个站不足 2 小时过期会单独提示。退出码 0 表示都已保存且有效，2 表示没检测到登录或超时，3 表示有登录态文件缺失、读不出或已过期。窗口自动关闭，不需要另外回复。脚本不会输入账号密码，不拼接、不调用登录接口，也不把 token 写进用户中心。万一没点到入口，窗口顶部会提示人工点一下「用户中心」。等待期间，窗口顶部和命令行会列出每个标签页在哪个站、哪个路径，以及缺的是 `token` 还是 `userroledata`，卡在哪一步一眼能看出来。只跑 `usercenter` 时，用户中心登录页会把标签页跳到门户登录页，在那里登录即可，脚本检测到门户已登录、8 秒内没有登录的用户中心标签页，会自己点门户的「用户中心」入口。门户登录态还有效时，也可以用 `pw-login.mjs usercenter --from-portal` 只补用户中心。登录态大约 4 小时内失效，失效后 record-page 输出 `blocked: login-expired`；没有登录态文件时输出 `need-login:<站点>`。

**身份由 record-page 切换，登录态不代表身份。** 用户中心的测试账号是同一个账号，在右上角可以切换四种身份，工单 `role` 填其中一个：

| role | 身份 | 首页 |
| --- | --- | --- |
| `general` | 普通用户 | `/main` |
| `jobseeker`（用户中心默认） | 求职者 | `/jobhunterhome` |
| `corp` | 招聘单位 | `/CorpCenter` |
| `mentor` | 职业导师 | `/mentorhome` |

门户的 `role` 固定为 `portal`。POC 的旧写法 `usercenter-jobseeker`、`usercenter-corp` 仍然可以用。没有「培训机构」身份（李炳通确认，2026-10-09）。

身份只存在浏览器里：localStorage 的 `radiotype` 是该身份在 `userroledata` 里的 roleId，请求头里不带身份。所以 record-page 每次开录前都会在右上角下拉框里把身份切到工单的 `role`，切换的方式和人操作一样。切换后检查一次，页面加载完再检查一次。

- 账号没有这个身份，或者切换失败：输出 `blocked: need-role:<身份>`，需要人确认账号能切出这个身份。
- 页面加载后身份变了：输出 `blocked: role-drift:<身份>`。
- 切换过程中发出的请求不写进 HAR。HAR 的 `log._record` 记录身份，以及切换后的 localStorage（去掉 token），回放时用它还原身份。
- 第一次成功录制某个身份时，会把「账号 + 该身份 roleId」的哈希固定到 `$RESTORE_STATE/record/identities.json`。账号取 token 里的 `username`，只存哈希。之后账号或身份不一致时输出 `blocked: role-changed:<身份>`。
- token 的 `exp` 已过期时，不打开浏览器，直接输出 `login-expired`。

单独检查四种身份能否切换：`RESTORE_ASSETS=… node tools/pw-switch-role.mjs --cross`。这个命令默认不保存任何东西。

POC 时期的确认工具（`pw-record`、`interact-confirm`、`verify-confirm`、`shell-probe`）仍然按角色读 `.auth/pw-usercenter-jobseeker.json`、`pw-usercenter-corp.json`。需要用它们时，登录后运行 `node tools/pw-switch-role.mjs jobseeker corp --save-legacy`，为每个身份另存一份。

**并发：同身份可以同时跑，不同身份排队。** 用户中心的录制共用一把账号级锁 `$RESTORE_STATE/locks/account-usercenter.json`：

- 持有者的身份和本次相同，就一起跑；不同就等待，默认最多 30 分钟（`--wait-identity <分钟>`），超时输出 `{"locked":true,"identityBusy":…}`。
- 锁只在真实录制期间持有。回放基线和提交脚本不碰账号，开始前就释放。
- 同身份的录制持续进来时，别的身份可能一直等到超时。录制员遇到 `identityBusy` 时，先把同身份的工单录完。
- 持有进程退出后，锁会自动清掉。
- 门户只有一个账号、没有身份，不受这把锁限制。

实测（2026-10-09）：在一个浏览器上下文里依次切到四种身份，同账号的另一个上下文每次重新加载后仍然是原身份（`pw-switch-role.mjs --cross`）。也就是说，切身份不会连带改掉别的上下文。这把锁是保守做法，按 HM-7 的决定保留：服务端数据会因身份不同而不同（例如单位信息）。

## 分支

- `main`：人工审查后合入。
- `integration`：门槛通过后自动合入。
