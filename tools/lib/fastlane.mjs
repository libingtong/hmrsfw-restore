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
export const fastLaneBranch = (pl) => pl.cfg.fastLane?.branch || "restore/fast-lane";
const inventory = (pl) => (pl._flInv ??= fastLaneInventory({ toolRoot: pl.toolRoot, state: pl.paths.root }));
export const fastLanePageIds = (pl) => new Set(inventory(pl).pages.map((p) => p.id));
export const isFastLane = (meta) => meta?.fastLane === true;

// Order in which records are opened: portal first, then user center by ROLE_ORDER, as the inventory sorted them. Pages
// without a role are not recordable (record-page stops with need-role-decision).
export function recordQueue(pl) { return inventory(pl).pages.filter((p) => p.role).map((p) => p.id); }

// One restore task per recordable page, created waiting for its recording (waitRecord): when the record task says ok,
// syncRecords sends it to the gate. Idempotent through the creation key.
export function adoptPages(pl) {
  if (!fastLaneOn(pl)) return 0;
  const agent = pl.roster.agents.find((a) => a.role === "restorer" && a.enabled !== false && a.model === pl.cfg.defaultPageModel && pl.isLocal(a));
  if (!agent) { pl.anomaly(null, `fast lane: no enabled restorer on ${pl.machine} with model ${pl.cfg.defaultPageModel}`, "检查名册"); return 0; }
  const L = pl.ledger.read();
  let n = 0;
  for (const p of inventory(pl).pages) {
    if (!p.role || p.replay === "pass") continue;
    const key = `restore:${p.id}:fl`;
    if (L.tasks.keys?.[key] || pl.pipelineIssues().some((i) => i.metadata.createKey === key)) continue;
    const branch = fastLaneBranch(pl);
    const meta = { kind: "restore", workOrders: [p.id], branch, attempt: 1, fixRound: 0, agent: agent.id, family: agent.family, history: [], fastLane: true, waitRecord: true, role: p.role, claimedBy: pl.machine };
    const c = pl.withWo([p.id], () => pl.createTask({ key, title: `[restore] ${p.id}（快速通道）`, description: flDescription(p, branch), meta, assigneeId: null, status: "in_review", wos: [p.id] }));
    if (c.id) { n++; pl.ledger.tx((L2) => { const s = (L2.tasks.wos[p.id] ??= { tasks: [] }); s.state = "active"; s.active = [c.id]; s.attempts = 1; }); }
  }
  return n;
}

export function flDescription(p, branch) {
  return [`快速通道页面 \`${p.id}\`（${p.app}，身份 ${p.role}）：代码已在 hmrsfw-vue \`${branch}\`，这张单只负责回放比对和交互比对。`, "",
    "- 先录制（`[record]` 任务），录完自动送门槛；门槛员运行 `node tools/gate.mjs --task <任务id> --branch " + branch + " --mode page`，再 `node tools/tick.mjs advance <任务id>`。",
    "- 通过：不合入 integration、不抽审计，单直接 `done`；代码随 HM-34 的 PR 走合并员。",
    "- 失败：修正员按 `tools/fast-lane/README.md` 第 1–2 节在私有克隆里改，`fl.sh land` 合入 `" + branch + "` 并推送，然后 `node tools/handoff.mjs <任务id> --fix`。修正不允许改 `legacy/`、`shared/`、`api/`、`utils/`、`package.json`、门槛脚本、归一化规则、公共库清单、HAR。",
    "- 参数以任务元数据为准。"].join("\n");
}

// Gate PASS of a fast-lane task: nothing to merge, no audit — done.
export function passFastLane(pl, taskId, meta, wos) {
  pl.setDone(taskId, wos, `[GATE] 通过（快速通道：代码已在 \`${meta.branch}\`，随 HM-34 的 PR 合并，不合入 integration、不抽审计）`);
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
