# HM-34 快速通道：批次 run 操作手册

HM-34 不等正式流水线（门槛基线、调度、录制）就绪，直接按 POC 验证过的 A 流程还原，产物持续推到 `hmrsfw-vue` 的 `restore/fast-lane` 分支。入口包、共享层和接线已由 HM-34 完成；页面分成 `batches.json` 里的 8 个批次，每批一张子单，由 Mika 执行，run 内用子智能体并行。

本目录：

| 文件 | 用途 |
| --- | --- |
| `restorer-instructions.md` | 发给每个还原子智能体的统一指令（含「已知坑」） |
| `fl.sh` | 工作区脚本：私有克隆里的一单一 worktree、合入（cherry-pick）、自检基准 |
| `replay/` | 离线 HAR 回放回归（20 页确认 + POC 早期 10 页），只从 HAR 应答，不联网 |
| `batches.json` | 页面批次 |
| `results/<批次>.json` | 每批结果（通过 / 阻塞及原因），各批只写自己的文件 |

## 1. 准备（每个批次 run 开头做一次）

```bash
W=<本 run 的工作目录>; export FL_WORK=$W
multica repo checkout https://github.com/libingtong/hmrsfw-restore --ref restore/fast-lane   # → $W/hmrsfw-restore（下称 RESTORE）
git clone -q https://github.com/libingtong/hmrsfw-vue $W/fl-vue
git -C $W/fl-vue checkout -q -B restore/fast-lane origin/restore/fast-lane
cd $W/hmrsfw-restore && RESTORE_DEPS_CACHE=/Users/dylan/Projects/hmrsfw-restore-deps node tools/setup-workdir.mjs --app $W/fl-vue
cp tools/fast-lane/fl.sh $W/ && $W/fl.sh base
mkdir -p $W/replay && cp tools/fast-lane/replay/* $W/replay/
```

- **必须用私有克隆 `fl-vue`**，不要用 `multica repo checkout` 出来的 hmrsfw-vue：后者与其他任务共用同一个本地裸仓库，`fl.sh base` 会改本地的 `origin/integration` 引用（让 self-check 的越界检查以 fast-lane 为基准），在共享仓库里改会影响别人。
- `git fetch` / `git pull` 会把 `origin/integration` 恢复成远端值，之后要再跑一次 `$W/fl.sh base`。

## 2. 每张工单

1. **一单一 worktree**：`$W/fl.sh new <短名>` → `$W/wt/<短名>`。同一 worktree 放两张单，越界检查会互相误报。
2. 派子智能体（页面用 `model: sonnet`，分段单用 `model: opus`），**前台**调用（`run_in_background: false`），一条消息里并行派 5–6 个。提示模板：

   ```
   先完整阅读 <RESTORE>/tools/fast-lane/restorer-instructions.md 并严格照做（包括末尾「已知坑」）。
   RESTORE=<RESTORE 绝对路径>
   WT=<$W/wt/短名 的绝对路径>
   你的名字：<短名>。工单：<工单 id>。
   页面文件写到工单 target，子组件放 subComponentDir。self-check 通过，最后 npm --prefix "$WT" run build:<portal|uc> 通过（页面经路由 glob 进入构建，编译错误会让整站构建失败）。最终回复末尾给回执 JSON。
   ```

3. 编排者复核（不信回执，自己跑）：`cd RESTORE && node tools/self-check.mjs <id> --app $W/wt/<短名>` 为 `pass:true`，`npm --prefix $W/wt/<短名> run build:<app>` 退出码 0。
4. 通过 → `$W/fl.sh land <短名> "restore(page): <id>（HM-xx 快速通道）"`，再 `$W/fl.sh drop <短名>`。
5. 不通过 → 把失败项发回给同一子智能体（SendMessage）或另派 Opus 修正，最多 3 轮；仍不过就不合入，记进阻塞清单（原因写具体：哪项检查、哪一行、为什么修不了）。公共库缺东西、清单/工单错了，不要在页面里绕，记阻塞并写明需要改什么。

## 3. 同步（约每 10 单一次，以及批次结束时）

```bash
cd $W/fl-vue
git pull -q --rebase origin restore/fast-lane && npm run build && git push -q origin restore/fast-lane
$W/fl.sh base
```

几个批次同时在推同一分支，各自改的是不同页面目录，rebase 不会冲突；真冲突了说明碰了别人的文件，停下来查。

## 4. 批次结束

1. 全量构建 `npm run build`（两个应用）。
2. 回放回归：`$W/replay/run-locked.sh $W/fl-vue --env-file /Users/dylan/Projects/hmrsfw-vue/.env.local`，必须是 confirm 20/20、legacy10 10/10（全机一把锁，会排队）。`--env-file` 只把 `VITE_HMRSFW_*` 导入构建进程，不打印、不复制。`$W/replay/out/` 里有 HAR 副本和测试数据，不得提交或外传。
3. `node tools/scan-secrets.mjs --app $W/fl-vue` 为 0；`git -C $W/fl-vue ls-files | grep -E '\.env\.local|\.har$|\.auth/|\.pem$'` 为空。
4. 推 `restore/fast-lane`；在 RESTORE 写 `tools/fast-lane/results/<批次>.json`（`{batch, passed:[id], blocked:[{id, reason}], notes}`），提交并推 `hmrsfw-restore` 的 `restore/fast-lane`（先 `git pull --rebase`）。
5. 回报见子单描述。

## 硬规则（摘要，全文见项目说明）

只访问测试环境，而且本流程根本不需要访问它；不输入账号密码、不调用登录接口；密钥只从环境变量读，不从旧包提取；HAR、`.auth/`、账号、手机号、证件号、显示名不进仓库、评论；页面只按 `registry/<app>.json` 导入公共代码，页面单不改 `legacy/`、`shared/`、`api/`、`utils/`、`package.json`；不为了让某一页通过而改门槛脚本、归一化规则、公共库清单或工单；交互比对只从 HAR 应答；不使用 Haiku；只推送到 `hmrsfw-restore`、`hmrsfw-vue`。

## 已知、不在页面批次里处理的事（HM-34 汇总）

- **录制**：多数页面没有 HAR，正式门槛（`tools/gate.mjs`）会返回 `pending: record`。登录态 2026-10-09 已过期，需要李炳通重新登录后才能录制。页面在批次里按「静态通过」（self-check + 构建）合入，回放判定等录制后补。
- **E7**（依赖与样式）：`tinymce@5.10.3`、`nprogress@0.2.0`、`print-js`、`vue-countup-v3` 未入 `package.json`；两站 Vue/antd 版本未拆；`legacy.css` 未拆。放在收尾子单做，做完全量回归。
- 回放定位钩子：两站外壳上的 `id="poc-main"` 不是原包内容。门槛 `tools/gate/common.mjs` 的 `REST_SEL` 仍是 `#poc-main > *`，改选择器要走规则变更单。
