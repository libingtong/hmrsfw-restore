调度脚本 `tick.mjs`、`route.mjs`、`ledger.mjs`、`handoff.mjs`、`known-diff.mjs` 的格式、默认值和测试方法。规则本身以 `docs/pipeline.md` 第八、九、十、十三、十五、十六节为准，这里只写脚本怎么落地，以及第十二节没写到的细节。

## 文件

| 路径 | 作用 |
| --- | --- |
| `tools/tick.mjs` | 命令入口：`tick`、`advance <任务id> [--regate]`、`digest`、`open-upgrade`、`open-rule-review`、`resplit`、`rerecord`、`resume` |
| `tools/route.mjs` | `route.mjs <工单id>` 路由；也被 `tick` 调用 |
| `tools/ledger.mjs` | 账本与能力表；`seed`、`capability`、`miss-rate`、`record-run`、`show` |
| `tools/handoff.mjs` | 还原员、修正员交付 |
| `tools/known-diff.mjs` | 已知差异登记，只有裁定员能写 |
| `tools/lib/pipeline.mjs` | 状态机本体（派单、推进、失败规则、合并、审计、回归二分、升级单、规则复核、停止条件、每日摘要） |
| `tools/lib/multica.mjs` | 所有 multica 调用都经过这里：真实 / `--dry-run` / 假 CLI |
| `tools/lib/fake-multica.mjs` | 假 CLI，读写本地 JSON |
| `tools/lib/gitops.mjs` | 合并、回退、快进 `main`、提交回执，都在临时 worktree 里做 |
| `tools/lib/state.mjs` | `$RESTORE_STATE` 路径、原子写、`mkdir` 锁 |
| `tools/lib/roster.mjs` | 名册与调度配置 |
| `tools/lib/error-classes.mjs` | 运行失败类别映射表（**猜测**，见下文） |
| `tools/lib/workorders.mjs` | 读工单、公共库清单、`deps` 反向索引 |
| `tools/lib/claims.mjs` | 跨机领取：工具仓库 `claims` 分支上的工单归属、主控租约、各机统计快照、跨机命令请求（git 比较并交换） |
| `tools/lib/machine.mjs` | 本进程在哪台机器、每台机器有哪些资产、某一步需要哪些资产 |

`tick.mjs` 另有 `claims list`（各机领取数、主控、心跳）和 `claims reclaim --from <机器> [--wo <工单id>] [--force]`（接管停用机器的工单），见「机器与分片」。

所有命令输出一行 JSON。`tick.mjs` 的输出是 `{ok, summary, anomalies:[{issue, what, suggestedAction}]}`，拿不到锁时输出 `{"locked":true}`。

## `$RESTORE_STATE` 下的文件

| 路径 | 内容 |
| --- | --- |
| `agents.roster.json` | 名册（已有）。脚本按 `role`、`family`、`model`、`maxConcurrent`、`runtimeId` 选人，`escalateTo.memberId` 是升级给人时的负责人 |
| `scheduler.config.json` | 调度配置，见下一节。没有这个文件时全用默认值，但 `tick` 需要 `projectId` |
| `ledger/runs.jsonl` | 每次运行一行：工单、智能体、家族、机器、运行时、CLI 版本、multica CLI 版本、模型 ID、指令版本、token（按任务用量的增量）、结果、错误类别 |
| `ledger/capability.json` | `keys`：以「运行时\|CLI 版本\|模型 ID\|指令版本」为键，按 `simple`（< 5KB）、`medium`（5–30KB）、`large`（≥ 30KB）记首通、通过、token、修正轮数。路由按家族 + 模型聚合所有键，所以同家族的智能体（多台机器时跨机器）共享数据。`audits`：以「生成家族\|复核家族」为键的审计数和漏检数 |
| `ledger/agents.json` | 每个智能体的冷却截止时间、运行时和 CLI 版本、环境类失败重试次数 |
| `ledger/tasks.json` | 工单与任务的对应关系、创建键（幂等）、工单状态（`active` / `suspended` / `merged` / `done` / `superseded` / `held`）、录制状态；`fast-lane retire` 写入的条目带 `retired`（来源、批次、原因），见「快速通道退场」 |
| `ledger/tick-state.json` | 暂停标记、自上次回归以来的合并数、回归与二分状态、`integration` 上每个合并提交对应的任务、升级单、规则变更单 |
| `ledger/events.jsonl` | 合并、回退、done、审计、升级、规则变更、已知差异等事件，每日摘要从这里汇总 |
| `locks/` | `wo-<工单id>`、`ledger`、`integration`、`tool-main`、`tick`、`rule-<分支>`、`kd-<工单>` |
| `known-diffs/<工单>.json` | 已知差异登记，`gate.mjs` 读取 |

账本只用 `ledger` 锁做读改写，锁内不调用 multica。工单锁、`integration` 锁包住 multica 和 git 调用。锁目录超过 10 分钟视为残留；清理残留锁本身由 `<锁>.reap` 串行化，并且只清掉判定为残留的那个持有者，两个等待者不会同时进入。`tick` 每一步开始时刷新自己持有的锁的时间戳（心跳）。`tick` 里每张任务的处理单独捕获异常：一张任务出问题只记 anomaly，不中断整轮。

能力表的初始值：`tick` 第一次运行时，如果能力表为空且 `$RESTORE_ASSETS/out/confirm-stats.json` 存在，自动用其中 Sonnet 的 20 行播种（键的运行时记为 `poc-confirm`）。也可以手动 `node tools/ledger.mjs seed --from <confirm-stats.json>`。播种结果：simple 7 页首通 100%，medium 9 页 88.9%，large 4 页 50%，与 POC 的分层数据一致。

## `scheduler.config.json`

所有字段可选，缺省值写在 `tools/lib/roster.mjs` 的 `DEFAULT_CONFIG`。样例：

```json
{
 "projectId": "d18fdd43-5f49-43b7-a9c8-1b8abadb58b7",
 "parentIssueId": null,
 "logIssueId": "<调度日志任务 id>",
 "instructionsVersion": "2026-10-09",
 "defaultPageModel": "claude-sonnet-5-5",
 "cheapTier": { "enabled": false, "families": ["deepseek", "zhipu"], "maxKb": 30, "coldStartRuns": 10, "minFirstPass": 0.7 },
 "complex": { "kb": 30, "rules": 10 },
 "pack": { "maxKb": 5, "min": 3, "max": 5 },
 "preQueue": 1,
 "maxNewPerTick": 30,
 "cooldownMin": 30,
 "lockStaleMin": 10,
 "regressionEvery": 20,
 "readabilitySample": { "enabled": true, "rate": 0.05, "min": 1 },
 "receiptsBranch": "integration",
 "priceFactor": { "claude-opus-5-5": 5, "claude-sonnet-5-5": 1, "deepseek-official/deepseek-flash": 0.1, "zhipuai-coding-plan/glm-5.3-flash": 0.1 },
 "audit": { "coldAudits": 20, "coldRate": 0.5, "normalRate": 0.2, "relaxedRate": 0.1, "relaxedAfter": 50, "relaxedMissRate": 0.03, "strictRate": 1, "missRateThreshold": 0.1 },
 "stop": { "sameFailureStreak": 5, "integrationFailRate": 0.1, "unknownErrorsPerHour": 3, "minAuditsForMissRate": 10 },
 "claims": { "enabled": true, "remote": "origin", "branch": "claims", "leaderTtlMin": 30, "publishEveryMin": 10, "deadAfterMin": 60 },
 "requires": { "record": ["login"], "gate": ["har", "baseline"] }
}
```

- `readabilitySample`：每次集成回归通过后，从本批合入的页面里抽 `rate`（至少 `min` 页）发到 `logIssueId` 任务，供人工打分；`enabled: false` 关闭。见 `docs/readability.md`。
- `cheapTier.enabled` 就是便宜档的开关。G（小样本重测）通过后由裁定员或李炳通改成 `true`。
- 便宜档的路由（`route.mjs`）：只看 `cheapTier.families` 里、名册中有已启用（`enabled` 不是 `false`）还原员的家族；判断冷启动单派还是双派时，只数本次可用的家族（`tick` 只为本机还原员派单，本机没有某家族的还原员就不算这个家族）。
  - 两个及以上家族，且有一个还在冷启动（该页所在档 `runs < coldStartRuns`）：双派，前两个家族各一张，分支后缀 `-d` / `-g`。
  - 只剩一个家族且在冷启动（例如 GLM 还原员停用，或 `families` 只写 `["deepseek"]`）：单派给这个家族，原因写「冷启动（<档> <runs>/<coldStartRuns> 次）单派」；它没有空位时回退 Sonnet。不单派的话它的首通率一直为空、按 0 算，永远达不到 `minFirstPass`。
  - 冷启动结束后：首通率 ≥ `minFirstPass` 的家族按预计成本排序，Sonnet 最后；都不达标就只派 Sonnet。
- `priceFactor` 只用于给候选排序，数值是占位，拿到实际价格后替换。
- 名册可以加两个可选字段：`instructionsVersion`（该智能体的指令版本，进能力表的键）、`enabled: false`（暂时不派单）。其他字段不删不改。

## 任务元数据

第十二节的键都照用。脚本另外写这些键：

| 键 | 谁写 | 含义 |
| --- | --- | --- |
| `agent`、`family` | tick | 当前尝试的还原员 |
| `fixer`、`fixers` | tick | 当前修正员、本次尝试参与过的修正员（复核员按它们排除家族） |
| `receipt.<attempt>` | handoff | 每张工单的回执摘要：`result`、`todos` 条数、`needsFromSkeleton`、`selfCheck` |
| `merge.<attempt>` | advance | `{sha, at, pages}` |
| `gateSeq` | handoff / tick | 第几次送门槛。每次送门槛（交付、`--regate`、录制完成后重送）加 1，并删掉旧的 `gate.<attempt>`，所以过期的门槛结果不会被推进 |
| `advanced` | advance | 已处理的 `<attempt>.g<gateSeq>`，同一次门槛结果只处理一遍（并发的 `advance` 在工单锁内重读元数据后跳过） |
| `rebranch` | tick | 合并被回退后改用的新分支序号，分支名后缀 `-r<n>` |
| `arbiter` | advance | 交给过的裁定员；复核员按它排除家族 |
| `restoreKind` | advance | 改成 `audit` / `arbitrate` 前的原值（`restore` 或 `upgrade`） |
| `auditor`、`auditTier`、`auditProcessed` | advance / tick | 审计员、抽检档位、已处理的审计（`<attempt>:<合并 sha>`）。再次抽中审计时先删掉旧的 `audit.<attempt>` |
| `waitRecord` | advance | 门槛返回 `{"pending":"record"}` 时置为 `true` |
| `suspendedBy`、`upgradeTried` | open-upgrade | 挂起本页的升级单 |
| `gateMode` | handoff / tick | 升级单送门槛时为 `upgrade`：门槛员用 `--mode upgrade` |
| `fastLaneSync` | advance / tick | 升级单合并后同步到 `restore/fast-lane` 的结果：`{state: ok\|already\|no-branch\|conflict\|retry, sha, picked, conflicts, at}`，见上文「升级单与快速通道」 |
| `twinLost` | advance | 双派落选 |
| `retiredNote` | fast-lane retire | 快速通道退场时已在这张进行中的快速通道任务上留过 `[RETIRE]` 评论（时间），重复运行不再评论 |
| `purpose`、`sha`、`mainSha`、`bisect`、`libTask`、`libMergeSha`、`ruleChange`、`ruleSha` | tick | `kind=integration` 任务的用途和参数 |
| `branch`、`round`、`reviewer` | open-rule-review | `kind=rule-review` 任务 |
| `reason`、`details` | tick | `kind=incident` 任务 |
| `createKey`、`createdOn` | tick | 创建键和创建它的机器。本机账本没有这个键时（另一台机器建的、账本丢了），按 `createKey` 认领已有任务，不重建 |
| `claimedBy` | tick | 派单时工单的领取者（机器）。和 `claims` 分支对不上就报「重复派单」 |
| `advanceRequested`、`regateDone` | advance | 在不拥有该工单的机器上调用 `advance` 时只写这个键，由工单所属机器的下一轮 tick 推进。`--regate` 的请求只对发出时的那一轮门槛有效，任务之后变了（已修正、已合并）就丢弃 |
| `reopenRequest`、`reopenHandled` | tick | 主控回退了别的机器的合并（回归二分、公共库回归）时写给该任务，由所属机器重开 |
| `paused`、`resumed`、`resumedAt`、`resumedOn` | tick / resume | `kind=incident`：`paused=true` 且未 `resumed` 时，各台机器都停止派新单 |

对象和数组一律按 JSON 字符串写入（`--type string`），读的时候解码；也接受服务端原生存的对象。清空一个键用 `metadata delete`，不写空字符串。

`kind=audit`：抽中审计时把还原任务的 `kind` 改成 `audit` 再指派复核员，因为复核员指令按 `kind` 分支。审计处理完，`kind` 改回 `restoreKind`。裁定（`arbitrate`）同理。

## 状态机要点

**派单**（`tick` 第 7 步）：入口包、共享组件在前，页面在后，各自按 `kb` 降序；< 5KB 的同应用页面 3–5 张打成一单。每个还原员保持 `maxConcurrent + 1`（正在跑 + 1 张排队），冷却中的不派。双派时两张任务一起创建，各写 `twin`，账本一起记。

**创建的幂等**：每张任务有创建键（如 `restore:P1:a1-d`），`issue create` 带 `--allow-duplicate`（去重由账本负责，不靠服务端的同名拦截）。创建前查账本；先写「正在创建」再 `issue create`（状态 `backlog`、不指派），拿到 id 立即写回，然后写元数据，最后一次 `issue update` 设状态和负责人（这一步才启动运行）。中途崩溃时，下一轮先按标题认领已建的任务，或补完元数据和指派。

**分支名**：`restore/<工单 slug>-a<attempt>`，双派加 `-d`（DeepSeek）/ `-g`（GLM），打包单是 `restore/pack-<首单 slug>-<张数>-a<attempt>`。工单 id 里的 `:`、`/` 等换成 `-` 并加 6 位哈希。

**advance 的失败规则**：按第九节。「Sonnet」在入口包、共享组件和升级单上指还原-Opus，所以这类单失败后跳过「重做」，直接修正员两轮 → 裁定员。打包单部分失败时，通过的页照常合并（失败页的目录从合并里去掉），失败的页各拆成单页工单交给默认模型重做。

**合并后被回退**（审计、集成回归、公共库回归）：原分支不能再合并（git 认为它已经合进去了）。脚本从当前 `integration` 拉新分支 `<原分支>-r<n>`，在上面 revert 那次回退，也就是把被回退的内容放回去，任务改用这条分支继续走失败规则（修正员在新分支上修）。这一步冲突时，改为默认模型开新的尝试。

**合并**：`git merge --no-ff`，在 `origin/integration` 的临时 worktree 里做，持有 `locks/integration`。页面单改到 `src/legacy|shared|api|utils/`、`package.json`、锁文件时拒绝合并，按失败处理。入口包、共享组件单只能改清单里 `owner` 是自己（或没有 owner）的公共库文件；升级单只能改 owner 当前没有进行中任务的文件，不能改页面文件（`src/views/**`）。这条规则在 `tools/lib/upgrade-scope.mjs`，门槛 `--mode upgrade` 用同一个函数（HM-990）。冲突就放弃合并，元数据记 `mergeConflict.<attempt>`，按失败处理（`merge_conflict`）。

**审计**：抽检率按生成家族的档位：审计不满 20 次为冷启动 50%，漏检率 > 10% 为加严 100%，满 50 次且漏检率 < 3% 为放宽 10%，其余 20%。是否抽中由任务 id 和尝试次数的哈希决定，重复处理结果不变。复核员从「家族不属于本分支所有参与者」的复核员里选负载最低的。例如 DeepSeek 还原、Opus 修正的分支只能由 GLM 家族的复核员复核。没有可用的复核员时不卡住：页面照常 `done`，评论写明跳过审计和参与家族，`advance` / `tick` 输出一条 anomaly（检查名册的复核员），并计入每日摘要。

**集成回归**：`integration` 新合入满 20 单，或没有还原、审计、裁定中的任务时，建 `purpose=regression` 的集成任务（固定在当时的 `integration` 提交上）。通过就把 `main` 快进到该提交；失败就对 `main..该提交` 之间、还没被回退过的合并提交二分。每一步是一张 `purpose=bisect` 的集成任务，只测回归里失败的页（门槛没给出失败页时测全部已通过页），并且只测在被测提交里已经存在的页；没有这样的页时这一步直接算通过、不建任务。找到后回退该合并，相应任务重新走失败规则，再跑一次回归。回归、二分任务的创建键带「回归轮次」，新一轮不会撞上上一轮已结束的任务。

**公共库变更**：入口包、共享组件、升级单合并后，用工单 `deps` 的反向索引找出依赖改动文件的已通过页面，建 `purpose=lib-regression` 的集成任务；失败就回退这次公共库合并，公共库单重新走失败规则。升级单合并后，挂起的页面自动重派（新的尝试，按正常路由）。

**升级单与快速通道（HM-990）**：升级单送门槛时写 `gateMode: "upgrade"`，门槛给整条分支一个结论（`docs/gate.md`「升级单模式」）。合并进 `integration` 后，调度器把这次合并提交（`-m 1`，即升级的全部改动）cherry-pick 到产物仓库的 `restore/fast-lane`（配置 `fastLane.branch`）并推送，持有 `locks/fast-lane`；结果写进升级单元数据 `fastLaneSync`：`ok` / `already`（分支上已有）/ `no-branch`（没有快速通道，不用做）/ `conflict`（记 anomaly 并在升级单评论，什么都不推，快速通道页保持挂起；人工合入后把 `fastLaneSync` 设为 `{"state":"ok"}`，下一轮 tick 恢复）/ `retry`（锁忙或推送两次被拒，下一轮重试）。被挂起的快速通道页（`fastLane: true`）等到同步成功才恢复：分支保持 `restore/fast-lane`，快速通道元数据原样保留，尝试次数加一，直接送门槛（代码已在快速通道上，缺的只是公共库）；失败后照快速通道的修正员 → 裁定员流程走。普通页不变（`restore/<工单>-a<n>`，交还原员）。

**规则变更**：`open-rule-review <分支>` 给两个与裁定员不同家族的复核员各建一张 `rule-review` 任务。两人都写了 `review.<复核员 agent id>` 后（平台 metadata 键只接受 `^[a-zA-Z_][a-zA-Z0-9_.-]{0,63}$`，名册名称带 `@` 和中文，不能当键；任务描述里写明了确切键名）：都 `approve` → 合并到工具仓库 `main`，建 `purpose=rule-regression` 的全量回归，失败就回退；有人 `reject` → 第 1 轮给裁定员建排障单，裁定员修改后再运行一次 `open-rule-review` 开第 2 轮；第 2 轮仍被否决 → `blocked` 并指派名册里的 `escalateTo`。

**停止条件**（触发后暂停派新单，建排障单给裁定员，`resume` 恢复）：连续 5 次同类门槛失败（类别 = 阶段 + 第一个失败检查）；集成门槛失败率 > 10%；某个「生成家族 × 复核家族」审计满 10 次后漏检率 > 10%；一小时内 3 次无法归类的运行失败；默认还原家族（以及已启用的便宜档）全部在冷却中。

**运行失败**（`tick` 第 2 步）：读每个进行中任务的最近一次运行。限流、额度 → 该智能体冷却 30 分钟，改派同家族同模型的另一个智能体（单机运行时通常没有），没有就按路由的下一个候选；环境类 → 同一智能体重跑一次，再失败就改派；无法归类 → 报 anomaly。同一次运行只处理一次。

**失败类别映射表是猜测**。`tools/lib/error-classes.mjs` 里的文案是各家的常见写法，还没见过 Multica 对 Claude Code、dsh、Opencode 限流时实际返回什么。联调或上线后看到真实的失败，以 `multica issue runs <id>` 返回的 `error` / `result` 原文为准替换。

**快速通道退场（HM-1068）**：快速通道只在账本里记了整页的还原任务，它还原过的入口包、共享组件、分段，以及留下的待定、阻塞、等数据的页面，在 `queue/` 和账本里仍是 `todo`。`fastLane.enabled` 改成 `false` 之前（或刚改完、下一轮 `tick` 之前）运行一次：

```bash
node tools/tick.mjs fast-lane retire --app "$HMRSFW_APP_DIR" --dry-run   # 先看会写什么
node tools/tick.mjs fast-lane retire --app "$HMRSFW_APP_DIR"
```

- 前提：产物仓库 `restore/fast-lane` 已合进 `integration`（HM-1067），否则拒绝执行。
- 快速通道批次 `passed` 的入口包、共享组件，且文件在 `integration` 上 → `merged`（`merged.via = "fast-lane"`，sha 为快速通道合入 `integration` 的提交）。npm 代替单不在批次里，照常派。
- 所属页面由快速通道按整页处理的分段 → `superseded`（页面是处理单位，与 `resplit` 之后相同）。
- 快速通道合入过或试过、但没有任务也没有 `done` 的页面（回放待定、阻塞、等数据、身份未定、批次阻塞），以及试过但没通过的入口包、共享组件 → `held`：不派还原、不派录制，也不算通过（不进回归页集）。
- 有进行中快速通道任务的页面不动；每张这样的任务收到一条 `[RETIRE]` 评论（元数据 `retiredNote`）：工具仓库改用 `main`。
- 账本里已有状态的工单跳过，可以重复运行。门槛判据、归一化规则、公共库清单、`queue/` 都不改。

`fast-lane release <工单id> ...` 解除 `held`：代码已在快速通道上、身份已定的页面新建一张快速通道任务（等录制 → 门槛，不重新还原）；身份未定的页面保持 `held`；其他工单回到常规派单。

退场后（`retire` 运行过，账本 `tick-state.json` 有 `fastLane.retired`，且 `fastLane.enabled: false`）快速通道任务的行为（只关 `enabled`、没运行 `retire` 时仍是 HM-990 的旧行为）：门槛通过时，如果 `restore/fast-lane` 上有 `integration` 还没有的改动（修正员 `fl.sh land` 的修正），按页面分支合入 `integration`（页面范围检查、抽审计照常）；没有就直接 `done`。失败仍是修正员 → 裁定员。升级单合并后不再 cherry-pick，而是把 `integration` 合进 `restore/fast-lane`，挂起的快速通道页照旧在同步成功后恢复。

## 机器与分片

### 现状：只在 Mac mini 上运行（2026-10-15 起）

2026-10-15 李炳通决定停用 Office-Server（HM-212）：它上面的 Claude 命令行路径失效，GitHub 凭据和仓库缓存也反复出问题。现在全部智能体都在 Mac mini（名册 `machine` 为 `mac-mini`），只跑一个 `tick`：

- `restore.config.json` 的 `machines` 只剩 `mac`，承担全部角色（含原来只在 Office 上的 `restorer-core`、`reviewer`）。
- 名册里原 `@Office` 的智能体都是 `enabled: false`，保留只为留存历史。**全部智能体都停用的机器不算机器**（`tools/lib/machine.mjs` 的 `machineIds`），所以名册里只剩一台活着的机器，`tick` 不写 `--machine` 也会认出 `mac-mini`；写 `--machine mac` 同样可以。`--machine office` 会报错。停用机器的 `stats/<机器>.json` 快照仍然读入，能力数据不丢。
- `claims` 分支没有 Office 的领取记录（远端还没有这个分支），不用 `claims reclaim`。以后如果发现停用机器还领着工单，在 Mac 上运行 `claims reclaim --from office-server --machine mac-mini`（心跳超过 60 分钟后不用 `--force`）。
- 门槛、录制、修正、复核、还原都在同一台 16GB 的机器上抢内存，并发建议见 `docs/pipeline.md` 第四节。

下面的分片机制保留不动：以后再加机器时照此运行，`machines.test.mjs` 用一台假设的第二台机器继续覆盖。

### 多台机器时

每台机器可以各跑一个 `tick`（每台同时只跑一个，`locks/tick` 保证）。分片按能力和负载：每台只为**本机**还原员的空位领工单（拉取模式），门槛、录制、复核按资产和负载在各台之间选人，不按工单在哪台。

### 本机是哪台

`--machine <id>` > 环境变量 `HMRSFW_MACHINE` > 名册 `machines.<id>.hosts` 与主机名匹配 > 名册里只有一台机器时就是它 > 未知。`<id>` 是名册里**启用的**智能体的 `machine` 值（加上名册 `machines` 的键），可以写唯一前缀（`mac` → `mac-mini`）。不看智能体名字里的 `@Mac`。

- 未知时 `tick` 拒绝运行。其他命令（例如门槛员调用 `advance`）照常运行，这时只认本主机写下的领取记录。
- `*`（不分片：一个 tick 驱动全部工单，和分片前一样）只在明确写了 `--machine '*'` 或 `HMRSFW_MACHINE=*` 时才用。多台机器不会因为都漏配而同时退回 `*`；另一台主机写的 `*` 记录也不算本机的。
- 建议在名册里写好 `machines.<id>.hosts`，这样所有智能体不用改指令就能认出本机。

名册可以加 `machines`（可选，不删现有字段）：

```json
"machines": {
 "mac-mini": { "hosts": ["DylandeMac-mini.local"], "assets": ["login", "har", "baseline"] },
 "spare-host": { "hosts": ["spare-host.lan"], "assets": ["har", "baseline"] }
}
```

`assets` 是这台机器上有的东西：`login`（人登录过的浏览器登录态，只在有人能亲手登录的机器上）、`har`、`baseline`（多台机器时随常态同步到各台）。某一步需要什么写在 `scheduler.config.json` 的 `requires`：默认录制要 `login`，门槛要 `har` 和 `baseline`。**名册没有 `machines` 时不做任何资产限制**，门槛员在哪台由名册决定，没有写死在 Mac。HM-9 定了门槛归属后只改名册（门槛员的 `machine`、各机 `assets`），不改代码。

工单自己的额外要求读 `requires` 字段（数组 = 每一步都要；对象 = 按步骤，如 `{"record": ["login:enterprise"]}`）。这个字段名是向 C 提的建议，C 的工单目前没有机器或资产字段；C 定了别的名字，只改 `tools/lib/machine.mjs` 的 `woRequires` 一处。

### 原子领取：为什么用 git 分支

领取记录在工具仓库的 `claims` 分支（`wo/<工单>.json`：`{key, machine, at, by}`）。一轮领取 = 在刚拉到的分支头上做一个提交，不带 `--force` 推送。远端分支头变了（对方先推了），git 拒绝非快进推送，这一步就是比较并交换：先推上去的赢。落败方重新拉取，去掉已被占的工单，随机退避（150ms 起指数增长，上限 2s）后只重领剩下的，最多 12 次。

没有选「任务 assignee / metadata 当租约」：领取发生在建任务之前，这时还没有任务可写；而且 `issue metadata set` 是后写覆盖，没有条件写，两台同时写再读回都可能以为自己赢了。git 推送在服务端是原子的，失败可以明确识别。

一次 `tick` 先按本机还原员的空位排出要派的单元（大页先、小页打包），把这些单元的全部工单**一次推送**领下来，只为整组都领到的单元建任务。双派的两张任务在同一台机器上一起建（同一个领取），所以双派仍由 `twin` 互指来识别。

### 谁写什么（控制面单写）

| 对象 | 唯一写者 | 跨机可见的真相 |
| --- | --- | --- |
| 工单归属 | 先领到的机器 | `claims` 分支 `wo/*` |
| 有工单的任务（还原、升级、审计、裁定）的推进：门槛结果、失败规则、合并、抽审、重开 | 工单所属机器 | 任务元数据 |
| 任务交付（`handoff.mjs`） | 当时的负责人（在哪台都行） | 任务元数据 |
| 没有工单的任务（集成、规则复核、排障、录制）和全局步骤：派录制、集成门槛、集成回归与二分、规则复核、停止条件、重复派单检查 | 主控（`claims` 分支 `leader.json` 租约，30 分钟，剩一半时续） | 任务元数据、git |
| 合入 `integration` | 工单所属机器 | git（合并提交说明里带任务 id；回退提交保留 `This reverts commit <sha>`） |

- `advance` 在不拥有该工单的机器上调用（门槛员可能在任一台）：只写 `advanceRequested`，返回 `{"ok":true,"deferred":true}`；所属机器下一轮立即推进，不等 10 分钟的兜底。`--regate` 同理。
- 主控回退了别的机器的合并：写 `reopenRequest`，由所属机器重开。
- `resplit`、`rerecord`、`open-upgrade` 会改动工单的任务，所以只在工单所属机器上执行。在另一台机器上调用时（裁定员或被改派的还原员可能在另一台），只在 `claims` 分支写一条 `req/*.json`，返回 `deferred`；所属机器下一轮执行后删掉这条请求。
- 主控每一步全局操作前都会重新确认租约，剩余时间不到四分之一（7.5 分钟）就跳过。所以 tick 跑得慢，或各台时钟偏差在这个范围内，都不会出现两个主控。多台机器要开 NTP 对时。
- 暂停：停止条件建的排障单带 `paused=true`，各台都看到；`resume` 在任一台运行都把它标成 `resumed`，发起暂停那台账本里的暂停标记也随之失效。
- 本机账本只当明细和缓存。已通过的页、合并的 sha、录制是否完成、回归是否在进行、某工单是否已有任务，都从任务元数据或 git 推出来；回归计数改为数 `main..integration` 之间的合并提交。
- 能力表、漏检、冷却、最近的事件各机只记自己推进的那部分，每 `publishEveryMin` 分钟写到 `claims` 分支 `stats/<机器>.json`（同时是心跳）。路由、抽检档位、停止条件、每日摘要读「本机账本 + 其他机器的快照」之和（含已停用机器留下的快照），所以同家族智能体仍共享能力数据。POC 播种只算一次；只认名册里的机器，从不分片切过来时留下的 `*` 快照不计入，避免把同一份账本算两遍。
- 主控每轮检查：同一工单有两张以上未结束的任务且不是双派，或任务的 `claimedBy` 和领取记录不符 → 报「重复派单」anomaly 并记入每日摘要，由裁定员决定留哪张。

### 停用一台机器、从不分片切到分片

`claims reclaim --from <机器>`：对方心跳（`stats/<机器>.json` 的 `at`）超过 `deadAfterMin`（60 分钟）才接管；没有心跳记录或要立即接管时加 `--force`；接管后按任务元数据重建本机账本里这些工单的记录，已有任务的工单不会重派。不分片（`*`）跑过的工单要交给某台机器时也用它：`claims reclaim --from '*' --machine mac-mini`。

只有一个 tick 时可以把 `claims.enabled` 设为 `false`（不推 `claims` 分支）；两个 tick 同时跑时不能关。

## 测试

```bash
node --test tools/test/scheduler.test.mjs     # 场景：完整链路、双派、单家族冷启动单派、打包、等录制、升级单、回归二分、规则复核、限流、dry-run、路由、无异家族复核员、已知差异
node --test tools/test/concurrency.test.mjs   # 3 个 tick 并发 × 20 轮，两种锁模式
node --test tools/test/fast-lane.test.mjs     # 快速通道模式（HM-48）与退场（HM-1068）：retire 前提、写入、幂等、退场后的 tick 只派快速通道没做过的、release、退场后快速通道任务通过时合入修正
node --test tools/test/machines.test.mjs      # 单机：停用机器不算机器、--machine mac 只派给 Mac 智能体；多机（假设的第二台）：并发领取、先到先得与退避、两个 --machine 的 tick 并发、advance 只在所属机器、暂停/接管、资产判断、C 的工单格式
```

测试只用假 CLI（`MULTICA_FAKE_STATE`）和临时目录里的 git 仓库（本地裸仓库当 `origin`），不访问真实工作区和 GitHub。`HMRSFW_TOOL_ROOT` 让脚本指向测试用的工具仓库，`HMRSFW_TICK_NO_GLOBAL_LOCK=1` 关掉 `tick` 的全局锁、只靠工单锁和账本锁（只用于测试）。

对真实工作区只预览、不写：`node tools/tick.mjs tick --dry-run --app <hmrsfw-vue>`，读操作照常执行，所有写操作（multica 和 git push）只打印命令，账本不落盘。
