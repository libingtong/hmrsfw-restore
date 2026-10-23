// Fast-lane mode of the scheduler (HM-48): pages that HM-34's fast lane landed on hmrsfw-vue `restore/fast-lane` with a
// static pass only (self-check + build) still need the recording and the formal gate (replay + interaction compare).
// This module knows which pages those are and how their tasks differ from a normal restore task:
//   - the page's code is already on `restore/fast-lane`, so a gate PASS does not merge anything into `integration` (the
//     whole branch goes through HM-34's pull request) and no audit is sampled: the task is simply done;
//   - a failing page is fixed on `restore/fast-lane` itself (fixer → arbiter; no redo, the fast lane's restorer was the
//     redo already);
//   - the scheduler only handles the inventory's pages: `dispatchNew` is off and `dispatchRecords` is restricted to them.
// Everything here is read-only on queue/, results/ and the gate's rules; nothing relaxes a gate criterion.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { loadWorkOrder } from "./workorders.mjs";

// Roles record-page.mjs can switch to, in the order a recording run should go through them (same role runs together,
// different roles queue on the account lock).
export const ROLE_ORDER = ["general", "jobseeker", "corp", "mentor"];
// record= values meaning "the human has to log in again" (record-page.mjs `blocked`).
export const LOGIN_BLOCKS = ["blocked:login-expired", "blocked:need-login"];
const reasonOf = (r) => String(r || "").replace(/\s+/g, " ").slice(0, 160);

const readJson = (f, fb) => { try { return JSON.parse(readFileSync(f, "utf8")); } catch (e) { if (e.code === "ENOENT") return fb; throw e; } };

// Pages every fast-lane batch reports as passed (results/<batch>.json: `passed` order ids and, for segmented pages,
// `passedPages`), minus what is already accepted in hmrsfw-vue (queue status `regression`) — batches landing later are
// picked up on the next call. `replay.json` (written at the end, by page id) is the formal result.
export function fastLaneInventory({ toolRoot, assets = process.env.RESTORE_ASSETS, state = process.env.RESTORE_STATE } = {}) {
  const dir = path.join(toolRoot, "tools/fast-lane/results");
  const replay = readJson(path.join(dir, "replay.json"), { pages: {} }).pages || {};
  const found = new Map(), batchBlocked = [], notInQueue = [], accepted = [];
  for (const f of existsSync(dir) ? readdirSync(dir).filter((n) => n.endsWith(".json") && n !== "replay.json").sort() : []) {
    const r = readJson(path.join(dir, f), {});
    const batch = r.batch || f.replace(/\.json$/, "");
    for (const id of [...(r.passed || []), ...(r.passedPages || [])].filter((x) => String(x).startsWith("page."))) if (!found.has(id)) found.set(id, batch);
    for (const b of r.blocked || []) if (String(b.id).startsWith("page.") || String(b.id).startsWith("seg.")) batchBlocked.push({ id: b.id, batch, reason: reasonOf(b.reason) });
  }
  const pages = [];
  for (const [id, batch] of found) {
    const wo = loadWorkOrder(id, toolRoot);
    if (!wo) { notInQueue.push(id); continue; }
    if (wo.status === "regression" || wo.accepted) { accepted.push(id); continue; }
    const har = !!assets && existsSync(path.join(assets, "har/pages", `${id}.har`));
    const baseline = !!state && existsSync(path.join(state, "baseline", id, "baseline.json"));
    pages.push({ id, batch, app: wo.app, site: wo.site, role: wo.role ?? null, roleNote: wo.role == null ? reasonOf(wo.notes) : undefined, kb: wo.kb, recordPath: wo.recordPath, segmented: wo.status === "segmented", har, baseline, replay: replay[id] ? (replay[id].pass ? "pass" : "fail") : null });
  }
  const roleRank = (r) => (ROLE_ORDER.includes(r) ? ROLE_ORDER.indexOf(r) : ROLE_ORDER.length); // undecided roles last
  pages.sort((a, b) => (a.site === b.site ? 0 : a.site === "portal" ? -1 : 1) || roleRank(a.role) - roleRank(b.role) || (b.kb || 0) - (a.kb || 0) || (a.id < b.id ? -1 : 1));
  const groups = {};
  for (const p of pages) { const k = `${p.app}/${p.role ?? "need-role-decision"}`; (groups[k] ??= []).push(p.id); }
  return { total: pages.length, recordable: pages.filter((p) => p.role).length, groups: Object.fromEntries(Object.entries(groups).map(([k, v]) => [k, v.length])), pages, batchBlocked, notInQueue, accepted };
}

export const fastLaneOn = (pl) => !!pl.cfg.fastLane?.enabled;
// `fast-lane retire` ran (HM-1068) and the mode is off: the branch is in integration and is kept as a branch off it.
export const fastLaneRetired = (pl) => !fastLaneOn(pl) && !!pl.ledger.read().tick.fastLane?.retired;
export const fastLaneBranch = (pl) => pl.cfg.fastLane?.branch || "restore/fast-lane";
const inventory = (pl) => (pl._flInv ??= fastLaneInventory({ toolRoot: pl.toolRoot, state: pl.paths.root }));
export const fastLanePageIds = (pl) => new Set(inventory(pl).pages.map((p) => p.id));
export const isFastLane = (meta) => meta?.fastLane === true;

// Order in which records are opened: portal first, then user center by ROLE_ORDER, as the inventory sorted them. Pages
// without a role are not recordable (record-page stops with need-role-decision).
export function recordQueue(pl) { return inventory(pl).pages.filter((p) => p.role).map((p) => p.id); }

// One restore task per recordable page, created waiting for its recording (waitRecord): when the record task says ok,
// syncRecords sends it to the gate. Idempotent through the creation key.
export function adoptPages(pl, limit = pl.cfg.fastLane?.adoptPerTick ?? 25) { // creating a task is ~12 CLI calls: a few per tick keep the tick (and its lock) short
  if (!fastLaneOn(pl)) return 0;
  const agent = laneAgent(pl);
  if (!agent) return 0;
  let n = 0;
  for (const p of inventory(pl).pages) {
    if (n >= limit) break;
    if (!p.role || p.replay === "pass") continue;
    const c = adoptPage(pl, p, agent);
    if (c?.id && !c.existed) n++;
  }
  return n;
}

function laneAgent(pl) {
  const agent = pl.roster.agents.find((a) => a.role === "restorer" && a.enabled !== false && a.model === pl.cfg.defaultPageModel && pl.isLocal(a));
  if (!agent) pl.anomaly(null, `fast lane: no enabled restorer on ${pl.machine} with model ${pl.cfg.defaultPageModel}`, "检查名册");
  return agent;
}

// One page's restore task (also used by `fast-lane release` after the retirement, with the mode off).
function adoptPage(pl, p, agent = laneAgent(pl), key = `restore:${p.id}:fl`) {
  if (!agent) return { why: "no restorer" };
  const L = pl.ledger.read();
  if (L.tasks.keys?.[key] || pl.pipelineIssues().some((i) => i.metadata.createKey === key)) return { why: `${key} exists` };
  const branch = fastLaneBranch(pl);
  const meta = { kind: "restore", workOrders: [p.id], branch, attempt: 1, fixRound: 0, agent: agent.id, family: agent.family, history: [], fastLane: true, waitRecord: true, role: p.role, claimedBy: pl.machine };
  const c = pl.withWo([p.id], () => pl.createTask({ key, title: `[restore] ${p.id}（快速通道）`, description: flDescription(p, branch, fastLaneRetired(pl)), meta, assigneeId: null, status: "in_review", wos: [p.id] }));
  if (c.id) pl.ledger.tx((L2) => { const s = (L2.tasks.wos[p.id] ??= { tasks: [] }); s.state = "active"; s.active = [c.id]; s.attempts = 1; });
  return c;
}

const TOOL_URL = "https://github.com/libingtong/hmrsfw-restore", APP_URL = "https://github.com/libingtong/hmrsfw-vue";

// The agents' standing instructions say "tool repo main / integration"; for fast-lane pages the tool code (this mode, the
// regenerated queue/) is on `restore/fast-lane`, so every fast-lane task spells out the refs. Task text wins over the
// generic instructions here: with main's `advance`, a pass would merge the whole fast-lane branch into integration.
export function flDescription(p, branch, retired = false) {
  return [`快速通道页面 \`${p.id}\`（${p.app}，身份 ${p.role}）：代码已在 hmrsfw-vue \`${branch}\`，这张单只负责回放比对和交互比对。`, "",
    retired
      ? `**检出（以本单为准）**：快速通道已退场（HM-1068），工具仓库用 main：\`multica repo checkout ${TOOL_URL}\`；产物仓库 \`multica repo checkout ${APP_URL} --ref ${branch}\`。`
      : `**检出（与智能体通用指令不同，以本单为准）**：工具仓库 \`multica repo checkout ${TOOL_URL} --ref ${branch}\`（不要用 main：main 的 \`advance\` 不认快速通道，通过时会把整条分支合进 integration）；产物仓库 \`multica repo checkout ${APP_URL} --ref ${branch}\`。`,
    "- 门槛员：录制员把交互脚本提交在工具仓库 `integration` 分支，门槛要读到同一份：`node tools/gate.mjs --task <任务id> --branch " + branch + " --mode page --interact-ref origin/integration --app \"$HMRSFW_APP_DIR\"`（`--interact-ref` 直接读最新 integration 上的脚本，不要 `git checkout origin/integration -- tests/interact`：那会把几百个脚本留成暂存改动，任务目录清理不掉，HM-1130），然后 `node tools/tick.mjs advance <任务id> --app \"$HMRSFW_APP_DIR\"`。",
    retired ? `- 通过：\`${branch}\` 上有 integration 没有的修正时，调度器把它合入 integration（照常抽审计）；没有就直接 \`done\`。` : "- 通过：不合入 integration、不抽审计，单直接 `done`；代码随 HM-34 的 PR 走合并员。",
    "- 失败：修正员在产物仓库私有克隆里改（`tools/fast-lane/README.md` 第 1–2 节），`fl.sh land` 合入 `" + branch + "` 并推送，再 `node tools/handoff.mjs <任务id> --fix`。不许改 `legacy/`、`shared/`、`api/`、`utils/`、`package.json`、门槛脚本、归一化规则、公共库清单、HAR。",
    "- 参数以任务元数据为准。"].join("\n");
}

export function recordDescription(woId, branch) {
  return [`录制工单 \`${woId}\`：写交互脚本、录 HAR、算原版基线（快速通道页面，门槛的前置）。`, "",
    `**检出（以本单为准）**：工具仓库 \`multica repo checkout ${TOOL_URL} --ref ${branch}\`（\`queue/\` 已带 \`role\`，\`record-page\` 是含身份切换的版本；integration 分支的版本较旧，不要用）；产物仓库 \`--ref ${branch}\`。交互脚本由 \`record-page.mjs\` 自己提交到工具仓库 integration 分支，不用手动提交。`,
    "- 登录态由人准备，只检测不登录；报 `login-expired` / `need-login` / `need-role*` / `role-*` 时：元数据 `record=blocked:<原因>`，评论 `[RECORD] blocked <原因>`，任务设 `done`（不要 blocked、不要指派人，调度脚本会暂停新的录制并通知李炳通），结束。",
    "- 成功：`record=ok`，评论 `[RECORD] ok <步数>`，状态 `done`。其余按录制员通用指令。"].join("\n");
}

// Gate PASS of a fast-lane task: nothing to merge, no audit — done. After the retirement (fastLaneRetired) the branch is
// already in integration (HM-1067); a fix landed on it since is merged like any page branch (page scope, audit
// sampling), and with nothing new on it the task is done as before.
export function passFastLane(pl, taskId, meta, wos) {
  if (fastLaneRetired(pl)) {
    const g = pl.appGit;
    g.fetch("integration");
    const head = g.fetchOptional(meta.branch) ? g.remoteRef(meta.branch) : null;
    if (head && !g.isAncestor(head, g.remoteRef("integration")) && g.changedFiles(g.remoteRef("integration"), head).length) return null; // the caller merges
  }
  return passDone(pl, taskId, meta, wos);
}
function passDone(pl, taskId, meta, wos) {
  pl.setDone(taskId, wos, !fastLaneRetired(pl) ? `[GATE] 通过（快速通道：代码已在 \`${meta.branch}\`，随 HM-34 的 PR 合并，不合入 integration、不抽审计）` : `[GATE] 通过（快速通道已退场：\`${meta.branch}\` 已在 integration 里，没有新的修正要合入，不抽审计）`);
  pl.ledger.tx((L) => L.newEvents.push({ type: "fast-lane-pass", task: taskId, wos }));
  return { ok: true, summary: `${taskId} fast-lane pass → done`, anomalies: [] };
}

// syncRecords hook: a record task blocked on the login stops new recordings until `fast-lane login-ok`.
export function noteRecordBlocks(pl) {
  if (!fastLaneOn(pl)) return;
  const L = pl.ledger.read();
  const blocked = pl.pipelineIssues().filter((i) => i.metadata.kind === "record" && LOGIN_BLOCKS.includes(i.metadata.record) && i.status !== "cancelled" && !i.metadata.loginHandled);
  if (blocked.length && !L.tick.fastLane?.loginNeeded) {
    pl.ledger.tx((L2) => { (L2.tick.fastLane ??= {}).loginNeeded = { at: pl.iso(), reason: blocked[0].metadata.record, tasks: blocked.map((i) => i.id) }; L2.newEvents.push({ type: "fast-lane-login-needed", reason: blocked[0].metadata.record }); });
    pl.anomaly(blocked[0].id, `快速通道录制遇到 ${blocked[0].metadata.record}，已暂停新的录制`, "回到 HM-48，请李炳通重新登录（pw-login.mjs），回复后运行 tick.mjs fast-lane login-ok");
  }
}
export const loginNeeded = (pl) => !!pl.ledger.read().tick.fastLane?.loginNeeded;

// After the human logged in again: lift the pause and send every login-blocked page back to the recorder.
export function loginOk(pl) {
  const L = pl.ledger.read();
  const blocked = pl.pipelineIssues().filter((i) => i.metadata.kind === "record" && LOGIN_BLOCKS.includes(i.metadata.record) && !i.metadata.loginHandled);
  let n = 0;
  for (const i of blocked) {
    const wo = (i.metadata.workOrders || [])[0];
    pl.mc.setMeta(i.id, "loginHandled", true);
    pl.mc.deleteMeta(i.id, "record"); // syncRecords would otherwise put the block back into the ledger
    if (i.status !== "cancelled") pl.mc.update(i.id, { status: "cancelled", noStart: true }); // the recorder may have left it done/in_review
    pl.ledger.tx((L2) => { const s = (L2.tasks.wos[wo] ??= { tasks: [] }); s.record = null; });
    n++;
  }
  pl.ledger.tx((L2) => { delete (L2.tick.fastLane ??= {}).loginNeeded; L2.newEvents.push({ type: "fast-lane-login-ok", reopened: n }); });
  return { ok: true, summary: `fast lane: login pause lifted, ${n} login-blocked record task(s) closed; next tick records them again`, anomalies: [] };
}

// Progress for the HM-48 comments: per state, with the reason of every blocked page (no test data, only ids and reasons).
export function status(pl) {
  const inv = inventory(pl);
  const rec = new Map(), res = new Map();
  for (const i of pl.pipelineIssues()) {
    const m = i.metadata, wo = (m.workOrders || [])[0];
    if (!wo) continue;
    if (m.kind === "record" && i.status !== "cancelled") rec.set(wo, m.record || "pending");
    else if (m.fastLane === true) res.set(wo, i);
  }
  const out = { total: inv.total, recordable: inv.recordable, recorded: 0, recordPending: 0, gatePass: 0, gateFail: 0, fixing: 0, waitingRecord: 0, needRoleDecision: [], blocked: [] };
  for (const p of inv.pages) {
    if (!p.role) { out.needRoleDecision.push({ id: p.id, reason: p.roleNote }); continue; }
    const r = rec.get(p.id) ?? (p.baseline ? "ok" : null);
    if (typeof r === "string" && r.startsWith("blocked")) { out.blocked.push({ id: p.id, reason: r }); continue; }
    const t = res.get(p.id);
    if (r === "ok") out.recorded++; else out.recordPending++;
    if (!t) continue;
    if (t.status === "done") out.gatePass++;
    else if (t.metadata.waitRecord === true) out.waitingRecord++;
    else if ((t.metadata.fixRound || 0) > 0 || t.status === "todo" || t.status === "in_progress") out.fixing++;
    else if (t.status === "blocked") out.blocked.push({ id: p.id, reason: "blocked（裁定员未解决）" });
  }
  return out;
}

// results/replay.json: the formal verdict per page, written at the end of the run (HM-48 完成标准). Only ids, states and
// reasons — no gate diff, HAR content or test data.
export function report(pl) {
  const inv = inventory(pl);
  const rec = new Map(), res = new Map();
  for (const i of pl.pipelineIssues()) {
    const m = i.metadata, wo = (m.workOrders || [])[0];
    if (!wo) continue;
    if (m.kind === "record" && i.status !== "cancelled" && !m.loginHandled) rec.set(wo, m.record || "pending");
    else if (m.fastLane === true) res.set(wo, i);
  }
  const pages = {}, counts = { pass: 0, blocked: 0, pending: 0 };
  for (const p of inv.pages) {
    const t = res.get(p.id), r = rec.get(p.id);
    let v;
    if (!p.role) v = { pass: false, status: "blocked", reason: `need-role-decision：${p.roleNote || "身份未判定"}` };
    else if (t?.status === "done") v = { pass: true, status: "pass", task: t.id };
    else if (typeof r === "string" && r.startsWith("blocked")) v = { pass: false, status: "blocked", reason: reasonOf(r), task: t?.id };
    else if (t?.status === "blocked") v = { pass: false, status: "blocked", reason: reasonOf(t.metadata.arbitrateReason || "裁定员未解决"), task: t.id };
    else v = { pass: null, status: "pending", task: t?.id };
    pages[p.id] = v;
    counts[v.status === "pass" ? "pass" : v.status === "blocked" ? "blocked" : "pending"]++;
  }
  return { generatedAt: pl.iso(), counts, pages };
}

// ---- retirement (HM-1068) ---------------------------------------------------------------------------------------------
// The fast lane only wrote ledger entries for its whole-page restore tasks (adoptPages). The entry packs, shared
// components and segments it restored, and the pages it left pending or blocked, are still `todo` in queue/ and unknown
// to the ledger, so a normal tick (`dispatchNew`, `dispatchRecords`) would restore and record them all over again.
// `tick.mjs fast-lane retire` writes them into the ledger once, after `restore/fast-lane` has been merged into
// integration (HM-1067), with the source noted in `retired`:
//   - core (entry / shared) orders a fast-lane batch passed whose files are on integration → `merged` (via fast-lane);
//   - segments of a page the fast lane handled as a whole → `superseded` (the page is the unit, as after a resplit);
//   - pages the fast lane landed or tried that have no task and are not done (pending, blocked, waiting for data or a
//     decision), and core orders it tried but never passed → `held`: neither restored nor recorded again, never counted
//     as passed. `fast-lane release <工单id>` lets one go: a landed page gets a fast-lane task (record + gate on the code
//     that is already in integration), anything else goes back to normal dispatch.
// Pages with an open fast-lane task are left alone: advance, fixes and re-recording go on in normal mode (passFastLane
// merges what the fixers landed on the branch since). Nothing here touches queue/, the gate, its rules or the registry.
function laneResults(toolRoot) {
  const dir = path.join(toolRoot, "tools/fast-lane/results");
  const passed = new Map(), blocked = new Map();
  for (const f of existsSync(dir) ? readdirSync(dir).filter((n) => n.endsWith(".json") && n !== "replay.json").sort() : []) {
    const r = readJson(path.join(dir, f), {});
    const batch = r.batch || f.replace(/\.json$/, "");
    for (const id of [...(r.passed || []), ...(r.passedPages || [])]) if (!passed.has(id)) passed.set(id, batch);
    for (const b of r.blocked || []) if (!blocked.has(b.id)) blocked.set(b.id, { batch, reason: reasonOf(b.reason) });
  }
  const replay = readJson(path.join(dir, "replay.json"), { pages: {} }).pages || {};
  return { passed, blocked, replay };
}

const HELD = ["active", "merged", "done", "suspended", "superseded", "held"];

// What retire would write, from results/*.json, replay.json, the ledger, the open tasks and integration's file list.
export function retirePlan(pl, { onIntegration }) {
  const { passed, blocked, replay } = laneResults(pl.toolRoot);
  const L = pl.ledger.read();
  const open = new Set(pl.pipelineIssues().filter((i) => ["restore", "audit", "arbitrate", "upgrade"].includes(i.metadata.kind) && !["done", "cancelled"].includes(i.status)).flatMap((i) => i.metadata.workOrders || []));
  const landed = (id) => passed.has(id) || !!replay[id];
  const plan = { merged: [], superseded: [], held: [], kept: [] };
  for (const w of pl.orders()) {
    if (w.superseded || w.status === "regression" || w.accepted || w.regressionOnly === true || w.status === "accepted") continue;
    const s = L.tasks.wos[w.id] || {};
    if (HELD.includes(s.state) || open.has(w.id) || pl.isMergedWo(L, w.id)) continue;
    if (w.type === "entry" || w.type === "shared") {
      if (w.status === "npm") continue; // the npm stand-ins were never in a batch, and normal dispatch skips them too (isRestorable, HM-1170)
      if (passed.has(w.id)) {
        const paths = [w.target, ...(w.files || [])].filter(Boolean);
        const on = paths.filter(onIntegration);
        if (on.length) { plan.merged.push({ id: w.id, batch: passed.get(w.id), missing: paths.filter((p) => !onIntegration(p)) }); continue; }
        plan.kept.push({ id: w.id, why: "passed in a batch but none of its files is on integration" });
      } else if (blocked.has(w.id)) plan.held.push({ id: w.id, reason: `快速通道阻塞（${blocked.get(w.id).batch}）：${blocked.get(w.id).reason}` });
      continue;
    }
    if (w.type === "segment" && w.page && (landed(w.page) || blocked.has(w.page))) {
      const v = replay[w.page]?.status || (passed.has(w.page) ? "landed" : "blocked");
      plan.superseded.push({ id: w.id, page: w.page, pageStatus: v });
      continue;
    }
    if (landed(w.id)) {
      const v = replay[w.id];
      plan.held.push({ id: w.id, reason: `快速通道${v ? `回放${v.status === "pass" ? "通过" : v.status === "blocked" ? "阻塞" : "待定"}` : "已合入"}，无任务${v?.reason ? `：${reasonOf(v.reason)}` : ""}` });
    } else if (blocked.has(w.id)) plan.held.push({ id: w.id, reason: `快速通道阻塞（${blocked.get(w.id).batch}）：${blocked.get(w.id).reason}` });
  }
  return plan;
}

// tick.mjs fast-lane retire [--dry-run]: needs the hmrsfw-vue checkout (--app) to check that the fast-lane branch is
// merged into integration and which files are there. Idempotent: what is already in the ledger is skipped.
export function retire(pl) {
  const branch = fastLaneBranch(pl), g = pl.appGit;
  g.fetch("integration");
  const integ = g.remoteRef("integration");
  if (g.fetchOptional(branch) && !g.isAncestor(g.remoteRef(branch), integ)) return { ok: false, summary: `${branch} is not merged into integration yet: merge it first (HM-1067), then retire`, anomalies: [] };
  const files = g.out(["ls-tree", "-r", "--name-only", integ]).split("\n").filter(Boolean);
  const fileSet = new Set(files);
  const onIntegration = (p) => { const q = String(p).replace(/^restore\//, "").replace(/\/+$/, ""); return fileSet.has(q) || files.some((f) => f.startsWith(q + "/")); };
  const sha = g.revParse(integ);
  const via = g.revParse(g.remoteRef(branch)) ? g.findMerge(g.remoteRef(branch), integ) : null;
  const plan = retirePlan(pl, { onIntegration });
  const at = pl.iso();
  const note = (extra) => ({ by: "fast-lane", issue: "HM-1068", at, ...extra });
  pl.ledger.tx((L) => {
    for (const m of plan.merged) { const s = (L.tasks.wos[m.id] ??= { tasks: [] }); s.state = "merged"; s.merged = { task: null, via: "fast-lane", sha: via || sha, at }; s.retired = note({ batch: m.batch }); }
    for (const m of plan.superseded) { const s = (L.tasks.wos[m.id] ??= { tasks: [] }); s.state = "superseded"; s.active = []; s.retired = note({ page: m.page, pageStatus: m.pageStatus }); }
    for (const m of plan.held) { const s = (L.tasks.wos[m.id] ??= { tasks: [] }); s.state = "held"; s.active = []; s.retired = note({ reason: m.reason }); }
    (L.tick.fastLane ??= {}).retired ??= { at, integration: sha, by: "HM-1068" };
    L.newEvents.push({ type: "fast-lane-retire", integration: sha, merged: plan.merged.length, superseded: plan.superseded.length, held: plan.held.length });
  });
  // open fast-lane tasks carry the fast-lane checkout instructions: from now on the tool repo is main (its advance merges
  // the fixes landed on the branch, see passFastLane)
  const openFl = pl.pipelineIssues().filter((i) => isFastLane(i.metadata) && !["done", "cancelled"].includes(i.status) && !i.metadata.retiredNote);
  for (const i of openFl) {
    pl.comment(i.id, `[RETIRE] 快速通道已退场（HM-1068）：本单继续按常规调度推进，工具仓库改用 main（\`multica repo checkout ${TOOL_URL}\`），不再用 \`${branch}\`。修正仍落在产物仓库 \`${branch}\`；门槛通过时，调度器把该分支上 integration 还没有的修正合入 integration。`);
    pl.mc.setMeta(i.id, "retiredNote", at);
  }
  const gaps = plan.merged.filter((m) => m.missing.length);
  const anomalies = plan.kept.map((k) => ({ issue: null, what: `${k.id}: ${k.why}`, suggestedAction: "裁定员核对后决定派单还是手工登记" }));
  return { ok: true, summary: `fast lane retired${pl.dryRun ? " (dry run, nothing written)" : ""}: merged ${plan.merged.length} core orders (integration ${String(sha).slice(0, 7)}), superseded ${plan.superseded.length} segments, held ${plan.held.length}, noted ${openFl.length} open fast-lane task(s)${gaps.length ? `; ${gaps.length} merged order(s) list files not on integration: ${gaps.map((m) => `${m.id} (${m.missing.join(", ")})`).join("; ")}` : ""}`, plan, anomalies };
}

// tick.mjs fast-lane release <工单id> ...: a held order leaves the hold. A page whose code the fast lane landed gets a
// fast-lane task (waitRecord → record → gate on the branch); any other order goes back to normal dispatch.
export function release(pl, ids) {
  const L = pl.ledger.read();
  const inv = new Map(inventory(pl).pages.map((p) => [p.id, p]));
  const out = [];
  for (const id of ids) {
    const s = L.tasks.wos[id];
    if (!s?.retired || !["held", "superseded"].includes(s.state)) { out.push(`${id}: not held by the fast-lane retirement`); continue; }
    const p = inv.get(id);
    if (p && !p.role) { out.push(`${id}: still held — its code is on the fast lane but the role is undecided (need-role-decision)`); continue; }
    const free = () => pl.ledger.tx((L2) => { const t = L2.tasks.wos[id]; t.state = null; t.released = { at: pl.iso(), was: t.retired }; delete t.retired; });
    if (!p) { free(); out.push(`${id}: back to normal dispatch`); continue; }
    // a fast-lane task the page had before (cancelled) keeps its creation key: a release gets a key of its own
    const n = Object.keys(L.tasks.keys || {}).filter((k) => k.startsWith(`restore:${id}:fl`)).length;
    const c = adoptPage(pl, p, undefined, n ? `restore:${id}:fl-r${n}` : undefined);
    if (c?.id) { pl.ledger.tx((L2) => { const t = L2.tasks.wos[id]; t.released = { at: pl.iso(), was: t.retired }; delete t.retired; }); out.push(`${id}: fast-lane task ${c.id} (record + gate)`); }
    else out.push(`${id}: still held — fast-lane task not created (${c?.why || "busy"}), try again`);
  }
  return { ok: true, summary: out.join("; "), anomalies: pl.anomalies };
}
