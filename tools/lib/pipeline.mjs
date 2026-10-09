// Scheduler engine shared by tick.mjs and handoff.mjs: dispatch, advance (failure rules, merge, audit sampling),
// handoff, audits, integration regression with bisect, public-library upgrades and regressions, rule-change reviews,
// stop conditions and the daily digest. docs/pipeline.md §8–§10, §13, §15, §16; formats in docs/scheduler.md.
//
// Concurrency: work-order locks (locks/wo-<id>) around anything that changes a work order's tasks, locks/ledger for
// ledger read-modify-write, locks/integration around merge/revert/fast-forward. Task creation is idempotent: the ledger
// is checked for the creation key first (then the issues' `createKey` metadata), the intent is written before
// `issue create`, the id right after it.
//
// Two machines (docs/scheduler.md 「两台机器」): each work order is claimed by one machine on the tool repo's `claims`
// branch (tools/lib/claims.mjs, a git compare-and-swap) before any task is created for it; only the owner's processes
// advance its tasks. Tasks without work orders (integration, rule review, incident, record) and the global steps belong
// to the leader (a lease on the same branch). State another machine must see lives in issue metadata or git; the local
// ledger is detail and cache.
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { P, Locks, woLock, readJson } from "./state.mjs";
import { Roster } from "./roster.mjs";
import { Multica } from "./multica.mjs";
import { Git, pageForbidden } from "./gitops.mjs";
import { classifyRunError, FAILED_RUN_STATUSES } from "./error-classes.mjs";
import { TOOL_ROOT, loadWorkOrders, loadWorkOrder, isCore, isPage, isAccepted, ownedPaths, reverseDeps, appOf } from "./workorders.mjs";
import { Ledger, runRow, recordCapability, recordAudit, auditTier, seedFromConfirm, mergeCapability } from "../ledger.mjs";
import { route, pick, agentLoad, freeSlots } from "../route.mjs";
import { Claims, claimPath, statsPath, fileKey } from "./claims.mjs";
import { ALL, resolveMachine, canRun, hostOf, machineIds } from "./machine.mjs";

export const KINDS = ["restore", "record", "integration", "audit", "rule-review", "arbitrate", "incident", "upgrade"];
const RESTORE_LIKE = new Set(["restore", "upgrade", "arbitrate"]);
export const slug = (id) => {
  const s = String(id).replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
  return s === String(id) ? s : `${s}-${createHash("sha1").update(String(id)).digest("hex").slice(0, 6)}`;
};
const short = (sha) => (sha || "").slice(0, 7);
// kind to return to when an audit / arbitration hands the task back to the restore flow
const baseKind = (meta) => (meta.kind === "audit" || meta.kind === "arbitrate" ? meta.restoreKind || "restore" : meta.kind);
const hashUnit = (s) => parseInt(createHash("sha256").update(s).digest("hex").slice(0, 8), 16) / 0x100000000;
const OPEN = (i) => !["done", "cancelled"].includes(i.status);
// Stage of the work a role does, for the asset check (machine.mjs canRun).
const STAGE = { gate: "gate", recorder: "record", fixer: "fix", reviewer: "review", arbiter: "arbitrate", restorer: "restore", "restorer-core": "restore" };
// Event types other machines need (stop conditions, digest); published in stats/<machine>.json.
const SHARED_EVENTS = new Set(["gate", "run-error", "done", "merge", "revert", "main-ff", "fail", "twin-lost", "arbitrate", "upgrade-open", "audit", "audit-skipped", "incident", "rule-merged", "rule-reverted", "rule-rejected", "needs-on-pass", "known-diff", "double-dispatch"]);

export class Pipeline {
  constructor({ argv = process.argv.slice(2), env = process.env, appDir = null, toolRoot = TOOL_ROOT, now = () => Date.now() } = {}) {
    this.argv = argv;
    this.dryRun = argv.includes("--dry-run") || env.MULTICA_DRY_RUN === "1";
    this.paths = P();
    this.roster = Roster.load(this.paths);
    this.cfg = this.roster.cfg;
    this.locks = new Locks(this.paths.root, { staleMs: this.cfg.lockStaleMs });
    this.ledger = new Ledger(this.paths, { dryRun: this.dryRun, locks: this.locks });
    this.mc = Multica.fromArgv(argv, env);
    this.toolRoot = toolRoot;
    this.appDir = appDir;
    this.now = now;
    const mi = resolveMachine(this.roster, { argv, env });
    this.machine = mi.id;
    this.machineSource = mi.source;
    this.anomalies = [];
    this.actions = [];
    this._issues = null;
    this._orders = null;
  }

  // ---- small helpers -------------------------------------------------------------------------------------------------
  get appGit() { if (!this.appDir) throw new Error("hmrsfw-vue checkout needed: pass --app <dir> or set HMRSFW_APP_DIR"); return (this._appGit ??= new Git(this.appDir, { dryRun: this.dryRun })); }
  get toolGit() { return (this._toolGit ??= new Git(this.toolRoot, { dryRun: this.dryRun })); }
  iso() { return new Date(this.now()).toISOString(); }
  act(s) { this.actions.push(s); }
  anomaly(issue, what, suggestedAction) { this.anomalies.push({ issue, what, suggestedAction }); }
  orders() { return (this._orders ??= loadWorkOrders(this.toolRoot)); }
  wo(id) { return this.orders().find((w) => w.id === id) || loadWorkOrder(id, this.toolRoot) || { id, type: "page" }; }
  issues(refresh = false) {
    if (!this._issues || refresh) this._issues = this.cfg.projectId ? this.mc.listIssues({ project: this.cfg.projectId }) : [];
    return this._issues;
  }
  pipelineIssues() { return this.issues().filter((i) => KINDS.includes(i.metadata?.kind)); }
  load() { return agentLoad(this.issues()); }
  // Tasks assigned during this run aren't in the cached issue list yet; count them so pre-queue limits hold.
  bump(agentId, n = 1) { (this._extraLoad ??= new Map()).set(agentId, (this._extraLoad.get(agentId) || 0) + n); }
  loadWithExtra() { const l = this.load(); for (const [k, v] of this._extraLoad || []) l.set(k, (l.get(k) || 0) + v); return l; }
  // Least loaded agent of a role among those whose machine has the assets the stage needs for these work orders.
  leastLoaded(role, exclude = [], wos = []) {
    const load = this.loadWithExtra();
    const orders = wos.map((w) => this.wo(w));
    const all = this.roster.role(role).filter((a) => !exclude.includes(a.id));
    const list = all.filter((a) => canRun(this.roster, this.cfg, a.machine, STAGE[role] || role, orders)).sort((a, b) => (load.get(a.id) || 0) / a.maxConcurrent - (load.get(b.id) || 0) / b.maxConcurrent);
    if (!list.length) throw new Error(all.length ? `no ${role} on a machine with the assets ${STAGE[role] || role} needs (roster machines.*.assets, config requires)` : `roster has no ${role}`);
    return list[0];
  }
  routeCtx(L) { return { roster: this.roster, cfg: this.cfg, capability: this.capability(L), agentsState: this.agentsState(L), load: this.loadWithExtra(), now: this.now(), toolRoot: this.toolRoot }; }

  // ---- machines, claims, cross-machine views ---------------------------------------------------------------------------
  get claims() {
    if (this._claims !== undefined) return this._claims;
    const C = this.cfg.claims || {};
    return (this._claims = C.enabled === false ? null : new Claims(this.toolRoot, { remote: C.remote, branch: C.branch, dryRun: this.dryRun, now: this.now }));
  }
  isLocal(a) { return !!a && (this.machine === ALL || a.machine === this.machine); }
  nonLocalIds() { return this.machine === ALL ? [] : this.roster.agents.filter((a) => a.machine !== this.machine).map((a) => a.id); }
  // The lease holder runs the global steps and owns every task without work orders. Outside a tick (advance) this is
  // read from the lease; with no lease yet only an unsharded process counts as leader.
  get isLeader() {
    if (!this.claims) return true;
    if (this._leader === undefined) { const rec = this.claims.leaderRec(); this._leader = rec ? this.mine(rec) : this.machine === ALL; }
    return this._leader;
  }
  // A claim / lease record is this process's: same machine id ("*" only from the same host), or — machine unknown — written
  // from this host (the gate agent calling `advance` on the machine whose tick claimed the order).
  mine(rec) {
    if (!rec || typeof rec !== "object") return false;
    if (this.machine === null) return hostOf(rec.by) === os.hostname().toLowerCase();
    return this.claims.isMine(rec, this.machine);
  }
  claimedHere(w) { return this.mine(this.claims.get(claimPath(w))); }
  // A work order nobody has claimed yet (tasks from before claims existed) belongs to the leader.
  ownsWos(wos) {
    if (!this.claims) return true;
    if (!wos.length) return this.isLeader;
    return wos.every((w) => { const rec = this.claims.get(claimPath(w)); return rec ? this.mine(rec) : this.isLeader; });
  }
  // Leader steps run only while the lease has a safety margin left (a long tick or clock skew must not make two leaders).
  confirmLeader() {
    if (!this.claims) return true;
    try {
      const ttl = this.cfg.claims.leaderTtlMin * 60_000;
      const l = this.claims.lease(this.machine, ttl);
      this._leader = l.leader && Date.parse(l.until) - this.now() > ttl / 4;
    } catch (e) { this._leader = false; this.anomaly(null, `leader lease: ${e.message.slice(0, 200)}`, "检查 claims 分支"); }
    return this._leader;
  }
  ownsTask(meta) {
    if (!meta || ["integration", "rule-review", "incident", "record"].includes(meta.kind)) return this.isLeader;
    return this.ownsWos(meta.workOrders || []);
  }
  ownerLabel(meta) {
    if (!meta || ["integration", "rule-review", "incident", "record"].includes(meta.kind) || !(meta.workOrders || []).length) return `leader ${this.claims?.leaderNow() || "(none)"}`;
    return [...new Set(meta.workOrders.map((w) => this.claims?.owner(w) || "unclaimed"))].join("/");
  }

  // A restore task whose work is in integration: done with a merge.<attempt>, or merged and out for audit.
  taskMerged(i) { const m = i.metadata || {}; return !m.twinLost && i.status !== "cancelled" && (m.kind === "audit" || (i.status === "done" && !!m[`merge.${m.attempt || 1}`])); }
  // Cross-machine view of every work order from issue metadata (the ledger only knows what this machine did):
  // open restore tasks, the merged one (with its merge sha), highest attempt.
  woView() {
    if (this._woView && this._woViewOf === this._issues) return this._woView;
    const v = new Map();
    for (const i of this.pipelineIssues()) {
      const m = i.metadata;
      if (!["restore", "audit", "arbitrate"].includes(m.kind) || baseKind(m) === "upgrade" || m.twinLost) continue;
      for (const w of m.workOrders || []) {
        const s = v.get(w) || { active: [], merged: null, attempts: 0 };
        s.attempts = Math.max(s.attempts, m.attempt || 1);
        if (this.taskMerged(i)) s.merged = { task: i.id, sha: m[`merge.${m.attempt || 1}`]?.sha || null };
        else if (OPEN(i)) s.active.push(i.id);
        v.set(w, s);
      }
    }
    this._woViewOf = this._issues;
    return (this._woView = v);
  }
  isMergedWo(L, w) { return ["done", "merged"].includes(L.tasks.wos[w]?.state) || !!this.woView().get(w)?.merged; }
  mergedSha(L, w) { return L.tasks.wos[w]?.merged?.sha || this.woView().get(w)?.merged?.sha || null; }
  activeTasks(L, w) { return [...new Set([...(L.tasks.wos[w]?.active || []), ...(this.woView().get(w)?.active || [])])]; }

  // Other machines' stats snapshots (claims branch stats/<machine>.json); this machine's own numbers are the live ledger.
  // Only roster machines count: a leftover "*" snapshot from before sharding is this same ledger and would double it.
  otherStats() {
    if (!this.claims) return [];
    const ids = machineIds(this.roster);
    try { return this.claims.statsAll().filter((s) => s.machine !== this.machine && ids.includes(s.machine)); } catch { return []; }
  }
  capability(L) { const others = this.otherStats(); return others.length ? mergeCapability(L.capability, ...others.map((s) => s.capability || {})) : L.capability; }
  agentsState(L) {
    const others = this.otherStats();
    if (!others.length) return L.agents;
    const out = Object.fromEntries(Object.entries(L.agents).map(([k, v]) => [k, { ...v }]));
    for (const s of others) for (const [id, until] of Object.entries(s.cooldowns || {})) { const a = (out[id] ??= {}); a.cooldownUntil = Math.max(a.cooldownUntil || 0, until); }
    return out;
  }
  sharedEvents(since) {
    const own = this.ledger.events(since);
    const others = this.otherStats().flatMap((s) => (s.events || []).filter((e) => !since || e.at > since).map((e) => ({ ...e, machine: s.machine })));
    return [...own, ...others].sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0));
  }
  meta(id) { return this.mc.metadata(id); }
  comment(id, line) { this.mc.comment(id, line); }
  isDefaultFor(wo, agent) {
    if (!agent) return false;
    if (isCore(wo)) return agent.role === "restorer-core";
    return this.roster.isDefaultPageModel(agent);
  }
  withWo(wos, fn, timeoutMs = 0) { return this.locks.with(wos.map(woLock), fn, timeoutMs); }
  branchFor(wos, attempt, suffix = "") {
    const head = wos.length > 1 ? `pack-${slug(wos[0])}-${wos.length}` : slug(wos[0]);
    return `restore/${head}-a${attempt}${suffix}`;
  }
  // Recorded: the local ledger saw it, the baseline (synced between machines) is here, or a record task says ok.
  recorded(L, wo) {
    return L.tasks.wos[wo]?.record === "ok" || existsSync(path.join(this.paths.baseline, slug(wo))) || existsSync(path.join(this.paths.baseline, wo))
      || this.pipelineIssues().some((i) => i.metadata.kind === "record" && i.metadata.record === "ok" && (i.metadata.workOrders || []).includes(wo));
  }

  // ---- idempotent task creation ---------------------------------------------------------------------------------------
  // key identifies the creation (e.g. "restore:<wo>:a1-d"); a second call with the same key returns the existing task.
  createTask({ key, title, description, meta, assigneeId, status = "todo", wos = [] }) {
    const L0 = this.ledger.read();
    const existing = L0.tasks.keys?.[key] || this.adoptByKey(key);
    if (existing) { this.finishCreate(existing, L0); return { id: existing, existed: true }; }
    const pending = L0.tasks.creating?.[key];
    if (pending && this.now() - Date.parse(pending.at) < 2 * 60_000) return { id: null, busy: true };
    if (pending) { // stale intent: a crashed run may have created the issue already — adopt it by title (only a fresh,
      // unassigned backlog issue the ledger doesn't know yet)
      const found = this.issues(true).find((i) => i.title === pending.title && i.status === "backlog" && !i.assignee_id && !L0.tasks.tasks[i.id]);
      if (found) { this.ledger.tx((L) => { (L.tasks.keys ??= {})[key] = found.id; delete (L.tasks.creating ??= {})[key]; L.tasks.tasks[found.id] = { ...pending.record, id: found.id }; }); this.finishCreate(found.id); return { id: found.id, adopted: true }; }
    }
    meta = { ...meta, createKey: key, createdOn: this.machine };
    const record = { key, kind: meta.kind, title, workOrders: wos, assigneeId, status, meta, createdAt: this.iso(), assigned: false };
    this.ledger.tx((L) => { (L.tasks.creating ??= {})[key] = { title, at: this.iso(), record }; });
    const issue = this.mc.create({ title, description, status: "backlog", project: this.cfg.projectId, parent: this.cfg.parentIssueId });
    this.ledger.tx((L) => {
      (L.tasks.keys ??= {})[key] = issue.id;
      delete (L.tasks.creating ??= {})[key];
      L.tasks.tasks[issue.id] = { ...record, id: issue.id };
      for (const w of wos) { const s = (L.tasks.wos[w] ??= { tasks: [] }); s.tasks = [...new Set([...(s.tasks || []), issue.id])]; }
    });
    this.finishCreate(issue.id);
    if (assigneeId) this.bump(assigneeId);
    this.act(`created ${title} → ${this.roster.get(assigneeId)?.name || assigneeId || "-"}`);
    return { id: issue.id, created: true };
  }

  // A task another machine (or a lost ledger) created under this key: its createKey metadata says so.
  adoptByKey(key) {
    const i = this.issues().find((x) => x.metadata?.createKey === key);
    if (!i) return null;
    this.ledger.tx((L) => { (L.tasks.keys ??= {})[key] = i.id; L.tasks.tasks[i.id] ??= { id: i.id, key, kind: i.metadata.kind, title: i.title, workOrders: i.metadata.workOrders || [], assigned: true, adopted: true }; });
    return i.id;
  }

  // Metadata + assignment of a created task; repeated safely if a previous run stopped half-way.
  finishCreate(id, L = this.ledger.read()) {
    const t = L.tasks.tasks[id];
    if (!t || t.assigned) return;
    this.mc.setMetaMany(id, { ...t.meta });
    this.mc.update(id, { status: t.status, assigneeId: t.assigneeId || undefined, noStart: !t.assigneeId || t.status === "backlog" });
    this.ledger.tx((L2) => { if (L2.tasks.tasks[id]) L2.tasks.tasks[id].assigned = true; });
  }

  // ---- dispatch -----------------------------------------------------------------------------------------------------
  restoreMeta(wos, agent, attempt, suffix, extra = {}) {
    return { kind: "restore", workOrders: wos, branch: this.branchFor(wos, attempt, suffix), attempt, fixRound: 0, agent: agent.id, family: agent.family, history: [], ...extra };
  }

  restoreDescription(wos, meta) {
    return [`还原工单：${wos.map((w) => `\`${w}\``).join("、")}`, "", `- 分支：\`${meta.branch}\`（从 hmrsfw-vue \`integration\` 拉）`, `- 第 ${meta.attempt} 次尝试`, "", "参数以任务元数据为准（`multica issue metadata list <任务id> --output json`）。按智能体指令执行，交付时运行 `node tools/handoff.mjs <任务id>`。"].join("\n");
  }

  // Dispatch one unit (single order or a pack) to the agents chosen by route.mjs. Returns created task ids.
  // Agents of other machines and agents whose machine lacks the restore assets are excluded: a machine pulls work for
  // its own restorers (rate-limit reassignment may still move a task to the other machine, §9 step 2).
  restoreExclude(wos) {
    const orders = wos.map((w) => this.wo(w));
    return this.roster.agents.filter((a) => !this.isLocal(a) || !canRun(this.roster, this.cfg, a.machine, "restore", orders)).map((a) => a.id);
  }

  dispatchUnit(wos, L) {
    const wo = this.wo(wos[0]);
    const r = route(wo, this.routeCtx(L), { exclude: this.restoreExclude(wos) });
    const picks = pick(r);
    if (!picks.length) return { none: true, route: r };
    const res = this.withWo(wos, () => {
      const L2 = this.ledger.read();
      if (this.claims && wos.some((w) => !this.claimedHere(w))) return { skipped: true, notOwner: true };
      if (wos.some((w) => (L2.tasks.wos[w]?.active || []).length || ["merged", "done", "suspended", "superseded"].includes(L2.tasks.wos[w]?.state))) return { skipped: true };
      if (wos.some((w) => this.activeTasks(L2, w).length || this.isMergedWo(L2, w))) return { skipped: true, seenElsewhere: true };
      const attempt = Math.max(0, ...wos.map((w) => Math.max(L2.tasks.wos[w]?.attempts || 0, this.woView().get(w)?.attempts || 0))) + 1;
      const ids = [];
      for (const p of picks) {
        const agent = this.roster.get(p.agent.id);
        const meta = this.restoreMeta(wos, agent, attempt, p.suffix, { ...(wos.length > 1 ? { packed: true } : {}), claimedBy: this.machine });
        const title = `[restore] ${wos.length > 1 ? `${wos[0]} +${wos.length - 1}` : wos[0]}${attempt > 1 ? ` a${attempt}` : ""}${p.suffix ? ` (${agent.family})` : ""}`;
        const c = this.createTask({ key: `restore:${wos.join(",")}:a${attempt}${p.suffix}`, title, description: this.restoreDescription(wos, meta), meta, assigneeId: agent.id, wos });
        if (c.id) ids.push(c.id);
      }
      if (ids.length === 2) for (const [a, b] of [[ids[0], ids[1]], [ids[1], ids[0]]]) this.mc.setMeta(a, "twin", b);
      this.ledger.tx((L3) => {
        for (const w of wos) {
          const s = (L3.tasks.wos[w] ??= { tasks: [] });
          s.state = "active"; s.active = ids; s.attempts = attempt; s.twins = ids.length === 2 ? ids : s.twins;
        }
        for (const id of ids) if (L3.tasks.tasks[id]) L3.tasks.tasks[id].twin = ids.length === 2 ? ids.find((x) => x !== id) : undefined;
      });
      return { ids, route: r };
    });
    return res.locked ? { locked: true } : res;
  }

  // Ordered dispatch queue: upgrades are created directly; entry/shared before pages, each by kb descending; pages
  // under pack.maxKb are packed 3–5 per order (same app).
  dispatchQueue(L) {
    const busyFiles = new Set(Object.values(L.tick.upgrades || {}).filter((u) => u.state === "active").flatMap((u) => u.files || []));
    const theirs = (w) => { const rec = this.claims ? this.claims.get(claimPath(w.id)) : null; return !!rec && !this.mine(rec); };
    const eligible = this.orders().filter((w) => !isAccepted(w) && !w.superseded && !theirs(w) && !["active", "merged", "done", "suspended", "superseded"].includes(L.tasks.wos[w.id]?.state) && !this.activeTasks(L, w.id).length && !this.isMergedWo(L, w.id));
    const core = eligible.filter(isCore).filter((w) => !(w.files || []).some((f) => busyFiles.has(f))).sort((a, b) => (b.kb || 0) - (a.kb || 0));
    const pages = eligible.filter(isPage).sort((a, b) => (b.kb || 0) - (a.kb || 0));
    const units = core.map((w) => [w.id]);
    const big = pages.filter((w) => (w.kb || 0) >= this.cfg.pack.maxKb), small = pages.filter((w) => (w.kb || 0) < this.cfg.pack.maxKb);
    units.push(...big.map((w) => [w.id]));
    const byApp = new Map();
    for (const w of small) { const a = appOf(w); if (!byApp.has(a)) byApp.set(a, []); byApp.get(a).push(w.id); }
    for (const ids of byApp.values()) {
      let i = 0;
      while (ids.length - i >= this.cfg.pack.min) { const n = Math.min(this.cfg.pack.max, ids.length - i); units.push(ids.slice(i, i + n)); i += n; }
      for (; i < ids.length; i++) units.push([ids[i]]);
    }
    return units;
  }

  // Pull model: plan the units this machine's restorers have free slots for, claim all of their work orders in one
  // compare-and-swap push, then create tasks only for the units fully won. Units another machine won meanwhile are
  // skipped; the losing push re-fetches and retries the rest after a backoff (claims.mjs).
  dispatchNew() {
    let L = this.ledger.read();
    const paused = this.pausedReason(L);
    if (paused) { this.act(`dispatch paused: ${paused}`); return 0; }
    const queue = this.dispatchQueue(L);
    const saved = new Map(this._extraLoad || []);
    const plan = [];
    let budget = this.cfg.maxNewPerTick;
    for (const unit of queue) {
      if (budget <= 0) break;
      const picks = pick(route(this.wo(unit[0]), this.routeCtx(L), { exclude: this.restoreExclude(unit) }));
      if (!picks.length) continue;
      plan.push(unit);
      for (const p of picks) this.bump(p.agent.id);
      budget -= picks.length;
    }
    this._extraLoad = saved; // planning only; dispatchUnit counts the real assignments
    if (!plan.length) return 0;
    if (this.claims) {
      const need = plan.flat().filter((w) => !this.claimedHere(w));
      if (need.length) {
        const c = this.claims.claim(need, this.machine, "dispatch");
        const lost = Object.keys(c.lost);
        if (lost.length) this.act(`claims: lost ${lost.length} to ${[...new Set(Object.values(c.lost))].join(", ")}${c.retries ? ` after ${c.retries} retries` : ""}`);
        if (c.won.length) this.act(`claims: won ${c.won.length}${c.retries ? ` after ${c.retries} retries` : ""}`);
      }
    }
    let n = 0;
    for (const unit of plan) {
      if (n >= this.cfg.maxNewPerTick) break;
      if (this.claims && unit.some((w) => !this.claimedHere(w))) continue;
      const r = this.dispatchUnit(unit, L);
      if (r.ids) { n += r.ids.length; L = this.ledger.read(); }
    }
    return n;
  }

  // Recorder keeps running + 1 queued, in page dispatch order (recording stays ahead of restoring); pages a restore task
  // is waiting for go first. Leader only: record tasks have one writer whichever machine owns the page.
  dispatchRecords() {
    const L = this.ledger.read();
    const recs = this.roster.role("recorder");
    if (!recs.length) return 0;
    const waiting = new Set(this.pipelineIssues().filter((i) => i.metadata.waitRecord === true && OPEN(i)).flatMap((i) => i.metadata.workOrders || []));
    const openRec = new Set(this.pipelineIssues().filter((i) => i.metadata.kind === "record" && OPEN(i)).flatMap((i) => i.metadata.workOrders || []));
    const pages = this.orders().filter((w) => isPage(w) && !w.superseded && L.tasks.wos[w.id]?.state !== "superseded").sort((a, b) => (waiting.has(b.id) - waiting.has(a.id)) || (b.kb || 0) - (a.kb || 0));
    let n = 0;
    for (const w of pages) {
      const s = L.tasks.wos[w.id] || {};
      if (s.record || openRec.has(w.id) || this.recorded(L, w.id)) continue;
      const load = this.loadWithExtra();
      const agent = recs.filter((a) => canRun(this.roster, this.cfg, a.machine, "record", [w])).find((a) => (load.get(a.id) || 0) < a.maxConcurrent + this.cfg.preQueue);
      if (!agent) break;
      const attempt = (s.recordAttempts || 0) + 1; // a cancelled record task is replaced by a new attempt
      const c = this.withWo([w.id], () => this.openRecord(w.id, agent, attempt));
      if (c && c.id) n++;
    }
    return n;
  }

  openRecord(woId, agent = this.leastLoaded("recorder", [], [woId]), attempt = 1) {
    const c = this.createTask({ key: `record:${woId}:a${attempt}`, title: `[record] ${woId}${attempt > 1 ? ` a${attempt}` : ""}`, description: `录制工单 \`${woId}\`：写交互脚本、录 HAR、算原版基线。按录制员指令执行。`, meta: { kind: "record", workOrders: [woId], attempt }, assigneeId: agent.id, wos: [woId] });
    if (c.id) this.ledger.tx((L) => { const s = (L.tasks.wos[woId] ??= { tasks: [] }); s.record = "pending"; s.recordTask = c.id; s.recordAttempts = Math.max(s.recordAttempts || 0, attempt); });
    return c;
  }

  // ---- handoff ------------------------------------------------------------------------------------------------------
  receiptPath(wo) {
    for (const rel of [`receipts/${wo}.json`, `receipts/${slug(wo)}.json`, `receipts/${encodeURIComponent(wo)}.json`]) if (existsSync(path.join(this.toolRoot, rel))) return rel;
    return null;
  }

  handoff(taskId, { fix = false, commit = true } = {}) {
    const meta0 = this.meta(taskId);
    if (!RESTORE_LIKE.has(meta0.kind)) return { ok: false, error: `task kind ${meta0.kind} is not handed off to the gate` };
    const wos = meta0.workOrders || [];
    const r = this.withWo(wos, () => {
      const meta = this.meta(taskId); // re-read under the lock
      const attempt = meta.attempt || 1;
      const files = {}, summary = {};
      for (const wo of wos) {
        const rel = this.receiptPath(wo);
        if (!rel) { summary[wo] = { missing: true }; continue; }
        const text = readFileSync(path.join(this.toolRoot, rel), "utf8");
        let rc; try { rc = JSON.parse(text); } catch { summary[wo] = { invalid: true }; continue; }
        files[rel] = text;
        summary[wo] = { result: rc.result ?? null, todos: (rc.todos || []).length, needsFromSkeleton: rc.needsFromSkeleton || [], selfCheck: rc.selfCheck?.pass ?? null, branch: rc.branch ?? null };
      }
      let commitRes = null;
      if (commit && Object.keys(files).length) commitRes = this.toolGit.commitFiles({ branch: this.cfg.receiptsBranch || "integration", files, message: `receipts: ${wos.join(", ")} a${attempt}${fix ? ` fix ${meta.fixRound}` : ""} (${taskId})` });
      this.mc.setMetaMany(taskId, { [`receipt.${attempt}`]: summary, handoffAt: this.iso(), ...(meta.kind === "arbitrate" ? { kind: baseKind(meta) } : {}) });
      const missing = Object.entries(summary).filter(([, v]) => v.missing || v.invalid).map(([k]) => k);
      const todos = Object.values(summary).reduce((n, v) => n + (v.todos || 0), 0);
      const line = fix
        ? `[FIX] 第 ${meta.fixRound} 轮 · \`${meta.branch}\` · 回执 ${wos.length - missing.length}/${wos.length}${missing.length ? `，缺 ${missing.join("、")}` : ""} → 门槛员`
        : `[RECEIPT] ${wos.length} 张工单 · \`${meta.branch}\` · 第 ${attempt} 次 · todos ${todos}${missing.length ? ` · 缺回执 ${missing.join("、")}` : ""} → 门槛员`;
      this.comment(taskId, line);
      const gate = this.sendToGate(taskId, meta);
      this.recordAgentRun(taskId, fix ? this.lastFixer(meta) : meta.agent, { kind: fix ? "fix" : meta.kind === "upgrade" ? "upgrade" : "restore", result: "delivered", attempt, fixRound: meta.fixRound || 0 });
      return { ok: true, task: taskId, gate: gate.name, receipts: Object.keys(files).length, missing, committed: commitRes?.committed ?? false };
    }, 120_000);
    return r;
  }

  lastFixer(meta) { return meta.fixer || this.roster.role("fixer")[0]?.id; }

  // Usage delta since the last snapshot of this task → one run row.
  recordAgentRun(taskId, agentId, extra) {
    if (!agentId) return;
    let u = {};
    try { u = this.mc.usage(taskId) || {}; } catch { u = {}; }
    const tot = { input: u.total_input_tokens || 0, output: u.total_output_tokens || 0, cacheRead: u.total_cache_read_tokens || 0, cacheWrite: u.total_cache_write_tokens || 0 };
    this.ledger.tx((L) => {
      const t = (L.tasks.tasks[taskId] ??= { id: taskId });
      const prev = t.usage || { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
      const d = Object.fromEntries(Object.keys(tot).map((k) => [k, Math.max(0, tot[k] - (prev[k] || 0))]));
      d.total = d.input + d.output + d.cacheRead + d.cacheWrite;
      t.usage = tot;
      t.lastRunTokens = d.total;
      L.newRuns.push(runRow(this.roster, L.agents, agentId, { task: taskId, workOrders: t.workOrders, tokens: d, errorCategory: null, ...extra }));
    });
  }

  // ---- advance ------------------------------------------------------------------------------------------------------
  // Only the owner of the task's work orders (the leader for integration tasks) advances it. Called on another machine
  // — the gate agent may sit anywhere — it leaves `advanceRequested` and the owner's next tick advances it.
  advance(taskId, { regate = false } = {}) {
    const meta0 = this.meta(taskId);
    const wos = meta0.workOrders || [];
    if (!this.ownsTask(meta0)) {
      const want = regate ? `regate:${meta0.attempt || 1}.g${meta0.gateSeq || 0}` : this.advKey(meta0);
      if (meta0.advanceRequested !== want) this.mc.setMeta(taskId, "advanceRequested", want);
      return { ok: true, deferred: true, summary: `${taskId} belongs to ${this.ownerLabel(meta0)}, not ${this.machine}: advance requested, its owner's tick will do it`, anomalies: [] };
    }
    const lockNames = wos.length ? wos : [`task-${taskId}`];
    const r = this.withWo(lockNames, () => {
      const meta = this.meta(taskId); // re-read under the lock: a concurrent advance may have handled this verdict
      if (regate) return this.regate(taskId, meta);
      if (meta.kind === "integration") return this.advanceIntegration(taskId, meta);
      if (!["restore", "upgrade"].includes(meta.kind)) return { ok: false, error: `advance: task kind ${meta.kind} has nothing to advance` };
      return this.advanceRestore(taskId, meta);
    }, 60_000);
    return r;
  }

  regate(taskId, meta) {
    this.mc.setMetaMany(taskId, { kind: baseKind(meta), waitRecord: false, regateAt: this.iso() });
    this.comment(taskId, `[REDO] 重跑门槛（--regate）`);
    this.sendToGate(taskId, meta);
    return { ok: true, summary: `regate ${taskId}`, anomalies: [] };
  }

  // Hand a task to the gate for a fresh verdict: drop the previous gate.<attempt> so a stale result can never be
  // advanced, and bump gateSeq, which is part of the advance key (a re-gate of the same attempt/fix round is new work).
  sendToGate(taskId, meta) {
    const gate = this.leastLoaded("gate", [], meta.workOrders || []);
    const key = `gate.${meta.attempt || 1}`;
    if (meta[key] !== undefined) this.mc.deleteMeta(taskId, key);
    this.mc.setMeta(taskId, "gateSeq", (meta.gateSeq || 0) + 1);
    const cur = this.mc.getIssue(taskId);
    if (cur && cur.assignee_id === gate.id) { this.mc.update(taskId, { status: "in_review", noStart: true }); this.mc.rerun(taskId); }
    else this.mc.update(taskId, { status: "in_review", assigneeId: gate.id });
    this.bump(gate.id);
    return gate;
  }

  gateResult(meta) { return meta[`gate.${meta.attempt || 1}`] ?? null; }
  // One verdict = one gate round: every send to the gate bumps gateSeq, so (attempt, gateSeq) names the verdict. fixRound
  // is not part of it because processing a failure changes fixRound.
  advKey(meta) { return `${meta.attempt || 1}.g${meta.gateSeq || 0}`; }

  // Per-page results of a (possibly packed) order: gate may report {pages:{wo:{pass,...}}}; otherwise one verdict for all.
  pageResults(gate, wos) {
    if (gate && gate.pages && typeof gate.pages === "object") return Object.fromEntries(wos.map((w) => [w, gate.pages[w] || { pass: false, failed: ["no per-page result"] }]));
    return Object.fromEntries(wos.map((w) => [w, gate]));
  }

  failCategory(g) {
    const f = (g?.failed || [])[0];
    const name = typeof f === "string" ? f : f?.check || f?.name || f?.what || "unknown";
    return `${g?.stage || "?"}:${String(name).split(/[\s:(]/)[0]}`;
  }

  advanceRestore(taskId, meta) {
    const attempt = meta.attempt || 1, fr = meta.fixRound || 0;
    const advKey = this.advKey(meta);
    if (meta.advanced === advKey) return { ok: true, summary: `already advanced ${taskId} (${advKey})`, anomalies: [] };
    const gate = this.gateResult(meta);
    if (!gate) return { ok: false, summary: `no gate.${attempt} on ${taskId}`, anomalies: [{ issue: taskId, what: `advance without gate.${attempt}`, suggestedAction: "门槛员重跑 gate.mjs 后再 advance" }] };
    if (gate.pending === "record") return this.waitForRecord(taskId, meta);
    if (gate.error) return { ok: false, summary: `gate error on ${taskId}`, anomalies: [{ issue: taskId, what: `gate error: ${String(gate.error).slice(0, 200)}`, suggestedAction: "建排障单交给裁定员" }] };
    const wos = meta.workOrders || [];
    const results = this.pageResults(gate, wos);
    const passed = wos.filter((w) => results[w]?.pass), failed = wos.filter((w) => !results[w]?.pass);
    const agent = this.roster.get(meta.agent);
    const tier = this.tierOf(wos);
    // capability: the restorer's first gate of this attempt decides first-pass
    this.ledger.tx((L) => {
      const row = runRow(this.roster, L.agents, meta.agent, {});
      if (fr === 0) recordCapability(L, row, { tier, firstPass: !failed.length, passed: !failed.length, tokens: L.tasks.tasks[taskId]?.lastRunTokens || 0 });
      else if (!failed.length) recordCapability(L, row, { tier, passed: true, fixRounds: fr, final: true });
      L.newEvents.push({ type: "gate", task: taskId, wos, attempt, fixRound: fr, pass: !failed.length, category: failed.length ? this.failCategory(results[failed[0]]) : null, family: agent?.family });
    });
    let out;
    if (!failed.length) out = this.onPass(taskId, meta, wos);
    else if (passed.length && wos.length > 1 && fr === 0) out = this.onPackPartial(taskId, meta, passed, failed, results);
    else out = this.onFail(taskId, meta, { reason: this.failCategory(results[failed[0]]), failed: results[failed[0]]?.failed || [] });
    if (out && out.ok !== false) this.mc.setMeta(taskId, "advanced", advKey); // busy/locked: leave it for the next try
    return out;
  }

  // The order a task restores; an upgrade is public-library work (restorer-core) whatever pages it was opened for.
  orderOf(meta) { return meta.kind === "upgrade" || meta.restoreKind === "upgrade" ? { id: `upgrade:${meta.branch}`, type: "shared" } : this.wo((meta.workOrders || [])[0]); }

  tierOf(wos) { const kb = Math.max(...wos.map((w) => Number(this.wo(w).kb || 0))); return kb < 5 ? "simple" : kb < 30 ? "medium" : "large"; }

  waitForRecord(taskId, meta) {
    this.mc.setMeta(taskId, "waitRecord", true);
    const L = this.ledger.read();
    // record tasks belong to the leader; elsewhere the leader's next dispatchRecords picks the waiting pages first
    if (this.isLeader) for (const w of meta.workOrders || []) if (!L.tasks.wos[w]?.record && !this.recorded(L, w)) this.openRecord(w);
    this.ledger.tx((L2) => L2.newEvents.push({ type: "wait-record", task: taskId, wos: meta.workOrders }));
    this.comment(taskId, `[GATE] 等录制：${(meta.workOrders || []).join("、")}`);
    return { ok: true, summary: `${taskId} waiting for recording`, anomalies: [] };
  }

  // Twin bookkeeping: the loser of a dual dispatch is only recorded, then cancelled.
  twinState(meta) {
    if (!meta.twin) return null;
    const L = this.ledger.read();
    const merged = (meta.workOrders || []).some((w) => ["merged", "done"].includes(L.tasks.wos[w]?.state));
    let tw = null;
    try { tw = this.mc.getIssue(meta.twin); } catch { tw = null; }
    return { merged, twinAlive: !!tw && !["cancelled", "done"].includes(tw.status) && !tw.metadata?.twinLost };
  }

  onPass(taskId, meta, wos) {
    const tw = this.twinState(meta);
    if (tw?.merged) return this.closeTwin(taskId, meta, "对方已先通过并合并");
    // needsFromSkeleton on a passing page: no upgrade order (the page works with today's library), noted for the digest
    const needs = Object.values(meta[`receipt.${meta.attempt || 1}`] || {}).flatMap((r) => r?.needsFromSkeleton || []);
    if (needs.length) this.ledger.tx((L) => L.newEvents.push({ type: "needs-on-pass", task: taskId, wos, needs: needs.slice(0, 10) }));
    const merge = this.mergeTask(taskId, meta, wos, []);
    if (!merge.merged) return merge.fail ? this.onFail(taskId, meta, merge.fail) : merge;
    return this.afterMerge(taskId, meta, wos, merge, isCore(this.orderOf(meta)));
  }

  // Packed order with some pages failing: merge the passing pages only, re-dispatch each failing page on its own.
  onPackPartial(taskId, meta, passed, failed, results) {
    const exclude = failed.flatMap((w) => ownedPaths(this.wo(w)));
    const merge = this.mergeTask(taskId, meta, passed, exclude);
    if (!merge.merged) return merge.fail ? this.onFail(taskId, meta, merge.fail) : merge;
    const split = [];
    for (const w of failed) {
      const L = this.ledger.read();
      const attempt = (L.tasks.wos[w]?.attempts || meta.attempt || 1) + 1;
      const agent = this.pickDefault(this.wo(w), L);
      const m = this.restoreMeta([w], agent, attempt, "", { history: [...(meta.history || []), { attempt: meta.attempt, agent: meta.agent, family: meta.family, branch: meta.branch, result: "fail", failed: results[w]?.failed || [], packedWith: meta.workOrders }] });
      const c = this.createTask({ key: `restore:${w}:a${attempt}`, title: `[restore] ${w} a${attempt}`, description: this.restoreDescription([w], m), meta: m, assigneeId: agent.id, wos: [w] });
      this.ledger.tx((L2) => { const s = (L2.tasks.wos[w] ??= { tasks: [] }); s.state = c.id ? "active" : null; s.active = c.id ? [c.id] : []; s.attempts = attempt; });
      if (!c.id) this.anomaly(taskId, `split-off of ${w} not created (busy); it will be dispatched again`, "无需处理");
      split.push(c.id);
    }
    this.mc.setMeta(taskId, "workOrders", passed);
    this.mc.setMeta(taskId, "splitOff", failed);
    this.comment(taskId, `[REDO] 打包单逐页判定：${passed.length} 页合并，${failed.length} 页拆成单页重做`);
    return this.afterMerge(taskId, { ...meta, workOrders: passed }, passed, merge, false, { split });
  }

  // Default model for a redo: this machine's agents first when one has a free slot, else whoever has the most room
  // (the core restorer may live on one machine only).
  pickDefault(wo, L, exclude = []) {
    const role = isCore(wo) ? "restorer-core" : "restorer";
    const agents = this.roster.role(role).filter((a) => (role === "restorer-core" || a.model === this.cfg.defaultPageModel) && !exclude.includes(a.id) && canRun(this.roster, this.cfg, a.machine, "restore", [wo]));
    const ctx = this.routeCtx(L);
    const free = (a) => freeSlots(a, ctx) - ((ctx.agentsState[a.id]?.cooldownUntil || 0) > this.now() ? 1e6 : 0) + (this.isLocal(a) && freeSlots(a, ctx) > 0 ? 1e3 : 0);
    agents.sort((a, b) => free(b) - free(a));
    if (!agents.length) throw new Error(`no ${role} agent for ${wo.id}`);
    return agents[0];
  }

  // Merge the task's branch into integration under locks/integration. Page orders may not touch the public library.
  mergeTask(taskId, meta, wos, excludePaths) {
    const core = meta.kind === "upgrade" || wos.some((w) => isCore(this.wo(w)));
    const r = this.locks.with("integration", () => this.appGit.merge({
      branch: meta.branch, into: "integration", excludePaths,
      message: `Merge ${meta.branch} into integration (${wos.join(", ")}; task ${taskId}, attempt ${meta.attempt})`,
      forbidden: core ? (files) => this.ownerViolations(files, wos, meta) : pageForbidden,
    }), 5 * 60_000);
    if (r.locked) return { ok: false, locked: true, summary: "integration lock busy", anomalies: [] };
    if (r.forbidden) { this.comment(taskId, `[GATE] 合并被拒：页面单改了公共库或依赖（${r.forbidden.slice(0, 3).join("；")}）`); return { merged: false, fail: { reason: "forbidden_paths", failed: r.forbidden } }; }
    if (r.conflict) { this.comment(taskId, `[GATE] 合并冲突，已放弃合并（merge_conflict）`); this.mc.setMeta(taskId, `mergeConflict.${meta.attempt}`, r.conflicts || []); return { merged: false, fail: { reason: "merge_conflict", failed: r.conflicts || [] } }; }
    if (r.missingBranch) return { merged: false, fail: { reason: "branch_missing", failed: [meta.branch] } };
    if (r.pushRejected) return { ok: false, merged: false, summary: "push to integration rejected twice", anomalies: [{ issue: taskId, what: "push to integration rejected", suggestedAction: "下一轮 tick 会重试 advance" }] };
    return { merged: true, sha: r.sha || null, files: r.files || [], alreadyMerged: !!r.alreadyMerged };
  }

  // Public-library files have an owner in registry/<app>.json; an entry/shared order may only change files it owns
  // (or unowned ones). Upgrades may change any public file whose owner has no active task.
  ownerViolations(files, wos, meta) {
    const bad = [];
    const L = this.ledger.read();
    for (const f of files) {
      const m = f.match(/^apps\/([^/]+)\/src\/(legacy|shared|api|utils)\//);
      if (!m) continue;
      const owner = this.ownerOfFile(f);
      if (!owner) continue;
      if (meta.kind === "upgrade") { if (this.activeTasks(L, owner).length && !wos.includes(owner)) bad.push(`${f}: owner ${owner} has an active task`); }
      else if (!wos.includes(owner)) bad.push(`${f}: owned by ${owner}`);
    }
    return bad;
  }
  ownerOfFile(f) {
    const m = f.match(/^apps\/([^/]+)\/src\/(.+)$/);
    if (!m) return null;
    const regFile = path.join(this.toolRoot, "registry", `${m[1]}.json`);
    const reg = readJson(regFile, null);
    if (!reg) return null;
    for (const sec of ["shared", "entry", "api"]) for (const v of Object.values(reg[sec] || {})) if (v.path === `@/${m[2]}` && v.owner) return v.owner;
    return null;
  }

  afterMerge(taskId, meta, wos0, merge, isLib, extra = {}) {
    const attempt = meta.attempt || 1;
    const wos = meta.kind === "upgrade" ? [] : wos0; // an upgrade's workOrders are the pages it unblocks, not its output
    const L0 = this.ledger.read();
    const cap0 = this.capability(L0);
    this.ledger.tx((L) => {
      for (const w of wos) { const s = (L.tasks.wos[w] ??= { tasks: [] }); s.state = "merged"; s.merged = { task: taskId, attempt, sha: merge.sha, at: this.iso() }; s.active = (s.active || []).filter((x) => x !== taskId && x !== meta.twin); }
      if (merge.sha) (L.tick.merges ??= {})[merge.sha] = { task: taskId, wos, lib: isLib, attempt, files: merge.files };
      if (!merge.alreadyMerged) L.tick.mergesSinceRegression = (L.tick.mergesSinceRegression || 0) + 1;
      L.newEvents.push({ type: "merge", task: taskId, wos, sha: merge.sha, lib: isLib });
    });
    this.mc.setMeta(taskId, `merge.${attempt}`, { sha: merge.sha, at: this.iso(), pages: wos });
    if (isLib) this.afterLibMerge(taskId, meta, merge);
    // audit sampling
    const participants = this.participants(meta);
    const gen = this.roster.get(meta.agent)?.family || meta.family;
    const tier = auditTier(cap0, gen, this.cfg);
    const sampled = hashUnit(`${taskId}:${attempt}:${merge.sha}`) < tier.rate;
    if (sampled) {
      const reviewer = this.pickReviewer(participants);
      if (reviewer) {
        if (meta[`audit.${attempt}`] !== undefined) this.mc.deleteMeta(taskId, `audit.${attempt}`); // verdict of an earlier merge
        this.mc.setMetaMany(taskId, { kind: "audit", restoreKind: meta.kind, auditor: reviewer.id, auditTier: tier.tier });
        this.mc.update(taskId, { status: "in_review", assigneeId: reviewer.id });
        this.bump(reviewer.id);
        this.comment(taskId, `[GATE] 通过，已合入 integration（${short(merge.sha)}）；抽中审计（${tier.tier} 档 ${Math.round(tier.rate * 100)}%）→ ${reviewer.name}`);
        return { ok: true, summary: `${taskId} merged ${short(merge.sha)}, audit → ${reviewer.name}`, anomalies: [], ...extra };
      }
      this.ledger.tx((L) => L.newEvents.push({ type: "audit-skipped", task: taskId, participants: [...participants] }));
    }
    // No reviewer outside the branch's families: the page is not held back (done as usual), but the gap is reported.
    const skipped = sampled ? [{ issue: taskId, what: `抽中审计但没有可用的异家族复核员（参与家族：${[...participants].join("、")}），已跳过审计`, suggestedAction: "检查名册里的复核员（enabled、家族、所在机器的资产）" }] : [];
    this.setDone(taskId, wos, `[GATE] 通过，已合入 integration（${short(merge.sha)}）${sampled ? `；无可用的异家族复核员（参与家族：${[...participants].join("、")}），跳过审计` : ""}`);
    return { ok: true, summary: `${taskId} merged ${short(merge.sha)} → done`, anomalies: skipped, ...extra };
  }

  participants(meta) {
    const fams = new Set();
    const add = (id) => { const a = this.roster.get(id); if (a) fams.add(a.family); };
    add(meta.agent);
    for (const f of meta.fixers || []) add(f);
    if (meta.fixer && (meta.fixRound || 0) > 0) add(meta.fixer);
    if (meta.arbiter) add(meta.arbiter);
    return fams;
  }

  pickReviewer(excludeFamilies) {
    const load = this.loadWithExtra();
    const list = this.roster.role("reviewer").filter((a) => !excludeFamilies.has(a.family) && canRun(this.roster, this.cfg, a.machine, "review", [])).sort((a, b) => (load.get(a.id) || 0) / a.maxConcurrent - (load.get(b.id) || 0) / b.maxConcurrent);
    return list[0] || null;
  }

  setDone(taskId, wos, line) {
    if (line) this.comment(taskId, line);
    this.mc.update(taskId, { status: "done", noStart: true });
    this.ledger.tx((L) => {
      for (const w of wos) { const s = (L.tasks.wos[w] ??= { tasks: [] }); s.state = "done"; s.active = (s.active || []).filter((x) => x !== taskId); }
      L.newEvents.push({ type: "done", task: taskId, wos });
    });
  }

  closeTwin(taskId, meta, why) {
    this.mc.setMeta(taskId, "twinLost", true);
    this.comment(taskId, `[GATE] 双派落选（${why}），只记账不合并`);
    this.mc.update(taskId, { status: "cancelled", noStart: true });
    this.ledger.tx((L) => {
      for (const w of meta.workOrders || []) { const s = L.tasks.wos[w]; if (s) s.active = (s.active || []).filter((x) => x !== taskId); }
      L.newEvents.push({ type: "twin-lost", task: taskId, wos: meta.workOrders, why });
    });
    return { ok: true, summary: `${taskId} twin lost (${why})`, anomalies: [] };
  }

  // Failure rules (§9), first that applies:
  //   1. the fixer hasn't fixed this attempt → fixer, same branch;
  //   2. the default model (Sonnet for pages) hasn't tried → default-model redo on a new branch;
  //   3. default-model branch with fewer than 2 fix rounds → fixer again;
  //   4. otherwise → arbiter.
  // A receipt with needsFromSkeleton opens a public-library upgrade instead (v3.1); a failing twin whose sibling is
  // still running is only recorded.
  onFail(taskId, meta, { reason, failed = [], forceRedo = false }) {
    const wos = meta.workOrders || [];
    const tw = this.twinState(meta);
    if (tw && (tw.merged || tw.twinAlive)) return this.closeTwin(taskId, meta, `本单失败（${reason}），另一张仍在进行或已通过`);
    const needs = Object.values(meta[`receipt.${meta.attempt || 1}`] || {}).flatMap((r) => r?.needsFromSkeleton || []);
    if (needs.length && meta.kind !== "upgrade" && !meta.suspendedBy && !meta.upgradeTried) return this.openUpgrade(taskId, { reason: `回执 needsFromSkeleton：${needs.join("；").slice(0, 500)}`, meta, auto: true });
    if (forceRedo && wos.length) return this.redo(taskId, meta, reason, failed);
    const wo = this.orderOf(meta);
    const fr = meta.fixRound || 0;
    const cur = this.roster.get(meta.agent);
    const histAgents = [...(meta.history || []).map((h) => h.agent), meta.agent];
    const defaultTried = histAgents.some((id) => this.isDefaultFor(wo, this.roster.get(id)));
    this.ledger.tx((L) => L.newEvents.push({ type: "fail", task: taskId, wos, attempt: meta.attempt, fixRound: fr, reason, family: cur?.family }));
    if (fr === 0) return this.assignFixer(taskId, meta, 1, reason);
    if (!defaultTried && wos.length) return this.redo(taskId, meta, reason, failed);
    if (this.isDefaultFor(wo, cur) && fr < 2) return this.assignFixer(taskId, meta, fr + 1, reason);
    return this.toArbiter(taskId, meta, reason);
  }

  assignFixer(taskId, meta, round, reason) {
    const fixer = this.leastLoaded("fixer", [], meta.workOrders || []);
    this.mc.setMetaMany(taskId, { kind: baseKind(meta), fixRound: round, fixer: fixer.id, fixers: [...new Set([...(meta.fixers || []), fixer.id])] });
    this.mc.update(taskId, { status: "todo", assigneeId: fixer.id });
    this.bump(fixer.id);
    this.comment(taskId, `[REDO] 门槛未过（${reason}）→ 修正员第 ${round} 轮，分支 \`${meta.branch}\``);
    return { ok: true, summary: `${taskId} → fixer round ${round}`, anomalies: [] };
  }

  redo(taskId, meta, reason, failed) {
    const wos = meta.workOrders;
    const L = this.ledger.read();
    const agent = this.pickDefault(this.orderOf(meta), L);
    const attempt = Math.max(meta.attempt || 1, ...wos.map((w) => L.tasks.wos[w]?.attempts || 0)) + 1;
    const history = [...(meta.history || []), { attempt: meta.attempt, agent: meta.agent, family: meta.family, branch: meta.branch, result: "fail", failed: failed.slice(0, 20), fixRounds: meta.fixRound || 0, fixers: meta.fixers || [] }];
    const branch = `${String(meta.branch).replace(/-a\d+(-[a-z])?(-r\d+)?$/, "")}-a${attempt}`;
    this.mc.setMetaMany(taskId, { kind: baseKind(meta) === "upgrade" ? "upgrade" : "restore", attempt, branch, fixRound: 0, agent: agent.id, family: agent.family, history, fixers: [], rebranch: null, twin: meta.twin ? null : undefined });
    this.mc.update(taskId, { status: "todo", assigneeId: agent.id });
    this.bump(agent.id);
    this.ledger.tx((L2) => { for (const w of wos) { const s = (L2.tasks.wos[w] ??= { tasks: [] }); s.attempts = attempt; s.state = "active"; s.active = [taskId]; } });
    this.comment(taskId, `[REDO] 第 ${attempt} 次尝试 → ${agent.name}（新分支 \`${branch}\`）；上次：${reason}`);
    return { ok: true, summary: `${taskId} → redo a${attempt} by ${agent.name}`, anomalies: [] };
  }

  toArbiter(taskId, meta, reason) {
    const arb = this.leastLoaded("arbiter");
    this.mc.setMetaMany(taskId, { kind: "arbitrate", restoreKind: baseKind(meta), arbitrateReason: reason, arbiter: arb.id });
    this.mc.update(taskId, { status: "todo", assigneeId: arb.id });
    this.bump(arb.id);
    this.comment(taskId, `[REDO] 升级路径已走完（${reason}）→ 裁定员`);
    this.ledger.tx((L) => L.newEvents.push({ type: "arbitrate", task: taskId, wos: meta.workOrders, reason }));
    return { ok: true, summary: `${taskId} → arbiter`, anomalies: [] };
  }

  // ---- audits -------------------------------------------------------------------------------------------------------
  processAudits() {
    let n = 0;
    for (const i of this.pipelineIssues().filter((x) => x.metadata.kind === "audit" && x.status !== "done" && x.status !== "cancelled" && this.ownsTask(x.metadata))) {
      const meta = i.metadata;
      const attempt = meta.attempt || 1;
      if (!meta[`audit.${attempt}`] || meta.auditProcessed === `${attempt}:${meta[`merge.${attempt}`]?.sha}`) continue;
      const r = this.safe(i.id, () => this.withWo(meta.workOrders || [], () => {
        const m = this.meta(i.id); // re-read under the lock
        if (m.kind !== "audit" || !m[`audit.${attempt}`] || m.auditProcessed === `${attempt}:${m[`merge.${attempt}`]?.sha}`) return { skipped: true };
        return this.processAudit(i.id, m, m[`audit.${attempt}`]);
      }));
      if (r && !r.locked) n++;
    }
    return n;
  }

  processAudit(taskId, meta, audit) {
    const attempt = meta.attempt || 1;
    const findings = audit.findings || [];
    const sev = (s) => findings.filter((f) => f.severity === s);
    const serious = audit.verdict === "issue" && (sev("high").length || sev("medium").length);
    const gen = this.roster.get(meta.agent)?.family || meta.family;
    const rev = this.roster.get(meta.auditor)?.family || "unknown";
    this.ledger.tx((L) => {
      recordAudit(L, gen, rev, !!serious);
      L.newEvents.push({ type: "audit", task: taskId, wos: meta.workOrders, verdict: audit.verdict, high: sev("high").length, medium: sev("medium").length, low: sev("low").length, gen, rev, lowFindings: sev("low").map((f) => `${f.file || ""} ${f.what || ""}`.trim()).slice(0, 10) });
    });
    this.mc.setMeta(taskId, "auditProcessed", `${attempt}:${meta[`merge.${attempt}`]?.sha}`);
    if (!serious) { this.setDone(taskId, (meta.restoreKind || meta.kind) === "upgrade" ? [] : meta.workOrders || [], null); return { ok: true }; }
    const mergeSha = meta[`merge.${attempt}`]?.sha;
    const rv = mergeSha ? this.revertMerge(mergeSha, `Revert ${meta.branch}: audit found ${sev("high").length} high / ${sev("medium").length} medium (task ${taskId})`) : null;
    const own = (meta.restoreKind || meta.kind) === "upgrade" ? [] : meta.workOrders || [];
    this.ledger.tx((L) => { for (const w of own) { const s = L.tasks.wos[w]; if (s) { s.state = "active"; s.active = [taskId]; s.merged = null; } } L.newEvents.push({ type: "revert", task: taskId, sha: mergeSha, why: "audit" }); });
    const m2 = this.rebranch(taskId, meta, rv?.sha);
    return this.onFail(taskId, { ...(m2 || meta), kind: meta.restoreKind || "restore" }, { reason: `audit:${sev("high").length}h/${sev("medium").length}m`, failed: findings.map((f) => f.what).slice(0, 20), forceRedo: !m2 });
  }

  // A reverted merge can't be merged again from the same branch (git sees it as merged). The task continues on a new
  // branch = integration + a revert of the revert, i.e. the reverted work on top of today's integration. Returns the
  // updated meta, or null when that isn't possible (then the caller starts a fresh attempt).
  rebranch(taskId, meta, revertSha) {
    if (!revertSha || typeof revertSha !== "string") return null;
    const n = (meta.rebranch || 0) + 1;
    const branch = `${String(meta.branch).replace(/-r\d+$/, "")}-r${n}`;
    const r = this.locks.with("integration", () => this.appGit.branchFromRevert({ revertSha, newBranch: branch }), 5 * 60_000);
    if (r.locked || !r.ok) return null;
    this.mc.setMetaMany(taskId, { branch, rebranch: n });
    return { ...meta, branch, rebranch: n };
  }

  revertMerge(sha, message) {
    const r = this.locks.with("integration", () => this.appGit.revert({ sha, into: "integration", message }), 5 * 60_000);
    if (r.locked || !r.reverted) this.anomaly(null, `revert ${short(sha)} failed: ${JSON.stringify(r).slice(0, 200)}`, "裁定员手动回退该合并");
    else this.ledger.tx((L) => { if (L.tick.merges?.[sha]) L.tick.merges[sha].reverted = r.sha || true; });
    return r;
  }

  // ---- public-library upgrades ---------------------------------------------------------------------------------------
  openUpgrade(taskId, opts) {
    const r = this.locks.with("upgrades", () => this.openUpgradeLocked(taskId, opts), 60_000);
    return r.locked ? { ok: false, summary: "upgrades lock busy", anomalies: [] } : r;
  }

  openUpgradeLocked(taskId, { reason, meta = this.meta(taskId), auto = false }) {
    const wos = meta.workOrders || [];
    const L = this.ledger.read();
    const open = Object.entries(L.tick.upgrades || {}).find(([, u]) => u.state === "active" && u.reason === reason);
    // the same need opened by the other machine: wait for that one (resumeSuspendedOwned resumes us when it merges)
    const elsewhere = open ? null : this.pipelineIssues().find((i) => (i.metadata.kind === "upgrade" || i.metadata.restoreKind === "upgrade") && i.metadata.reason === reason && OPEN(i) && !L.tick.upgrades?.[i.id]);
    let upId;
    if (elsewhere) upId = elsewhere.id;
    else if (open) {
      upId = open[0];
      this.ledger.tx((L2) => { const u = L2.tick.upgrades[upId]; u.forTasks = [...new Set([...u.forTasks, taskId])]; u.forWorkOrders = [...new Set([...u.forWorkOrders, ...wos])]; });
    } else {
      const seq = this.ledger.tx((L2) => (L2.tick.upgradeSeq = (L2.tick.upgradeSeq || 0) + 1));
      const agent = this.leastLoaded("restorer-core");
      const umeta = { kind: "upgrade", workOrders: wos, forTasks: [taskId], forWorkOrders: wos, reason, branch: `restore/upg-${seq}-a1`, attempt: 1, fixRound: 0, agent: agent.id, family: agent.family, history: [] };
      const c = this.createTask({ key: `upgrade:${seq}`, title: `[upgrade] #${seq} ${reason.slice(0, 60)}`, description: `公共库升级单（由 \`${taskId}\` 触发）。\n\n原因：${reason}\n\n按 \`registry/<app>.json\` 修改公共库，更新对应条目；交付运行 \`node tools/handoff.mjs <任务id>\`。合并后挂起的页面会自动重派。`, meta: umeta, assigneeId: agent.id });
      if (!c.id) return { ok: false, summary: "upgrade creation busy", anomalies: [] };
      upId = c.id;
      this.ledger.tx((L2) => { (L2.tick.upgrades ??= {})[upId] = { state: "active", reason, forTasks: [taskId], forWorkOrders: wos, createdAt: this.iso(), files: [] }; L2.newEvents.push({ type: "upgrade-open", task: upId, for: taskId, reason, auto }); });
    }
    this.mc.setMetaMany(taskId, { kind: baseKind(meta), suspendedBy: upId, upgradeTried: true });
    this.mc.update(taskId, { status: "backlog", noStart: true });
    this.ledger.tx((L2) => { for (const w of wos) { const s = (L2.tasks.wos[w] ??= { tasks: [] }); s.state = "suspended"; s.suspendedBy = upId; } });
    this.comment(taskId, `[REDO] 挂起，等公共库升级单 ${upId}：${reason.slice(0, 200)}`);
    return { ok: true, summary: `${taskId} suspended for upgrade ${upId}`, upgrade: upId, anomalies: [] };
  }

  // Lib merged: regress every passed page that depends on a changed public file; resume pages the upgrade was for.
  afterLibMerge(taskId, meta, merge) {
    const L = this.ledger.read();
    const idx = reverseDeps(this.orders(), this.toolRoot);
    const deps = new Set();
    for (const f of merge.files || []) for (const w of idx.get(f) || []) if (this.isMergedWo(L, w) || isAccepted(this.wo(w))) deps.add(w);
    if (deps.size) this.openIntegration({ purpose: "lib-regression", workOrders: [...deps].sort(), sha: merge.sha, key: `integration:lib-regression:${merge.sha}`, extra: { libTask: taskId, libMergeSha: merge.sha } });
    const up = L.tick.upgrades?.[taskId];
    if (meta.kind === "upgrade" && up) {
      this.ledger.tx((L2) => { L2.tick.upgrades[taskId].state = "merged"; L2.tick.upgrades[taskId].files = merge.files || []; });
      for (const t of up.forTasks) { try { if (this.ownsTask(this.meta(t))) this.resumeSuspended(t, taskId); } catch (e) { this.anomaly(t, `resume after upgrade: ${e.message.slice(0, 200)}`, "下一轮 tick 重试"); } }
    }
  }

  // Suspended tasks of this machine whose upgrade (opened here or on the other machine) has merged or was dropped.
  resumeSuspendedOwned() {
    const byId = new Map(this.pipelineIssues().map((i) => [i.id, i]));
    for (const i of this.pipelineIssues().filter((x) => x.metadata.suspendedBy && x.status === "backlog" && this.ownsTask(x.metadata))) {
      const up = byId.get(i.metadata.suspendedBy);
      if (!up || !(up.metadata.kind === "audit" || !OPEN(up))) continue;
      this.safe(i.id, () => { this.resumeSuspended(i.id, up.id); this.act(`resumed ${i.id} after upgrade ${up.id} (${up.status})`); });
    }
  }

  resumeSuspended(taskId, upgradeId) {
    const meta = this.meta(taskId);
    if (meta.suspendedBy !== upgradeId) return;
    this.withWo(meta.workOrders || [], () => {
      const L = this.ledger.read();
      if (this.meta(taskId).suspendedBy !== upgradeId) return; // resumed meanwhile
      const p = pick(route(this.wo(meta.workOrders[0]), this.routeCtx(L), { exclude: this.restoreExclude(meta.workOrders) }))[0];
      const agent = p ? this.roster.get(p.agent.id) : this.pickDefault(this.wo(meta.workOrders[0]), L);
      const attempt = Math.max(meta.attempt || 1, ...meta.workOrders.map((w) => L.tasks.wos[w]?.attempts || 0)) + 1;
      const history = [...(meta.history || []), { attempt: meta.attempt, agent: meta.agent, family: meta.family, branch: meta.branch, result: "suspended", upgrade: upgradeId }];
      this.mc.setMetaMany(taskId, { kind: "restore", suspendedBy: null, attempt, branch: this.branchFor(meta.workOrders, attempt), fixRound: 0, agent: agent.id, family: agent.family, history, fixers: [] });
      this.mc.update(taskId, { status: "todo", assigneeId: agent.id });
      this.bump(agent.id);
      this.ledger.tx((L2) => { for (const w of meta.workOrders) { const s = (L2.tasks.wos[w] ??= { tasks: [] }); s.state = "active"; s.active = [taskId]; s.suspendedBy = null; s.attempts = attempt; } });
      this.comment(taskId, `[REDO] 升级单 ${upgradeId} 已合并，重派 → ${agent.name}`);
    }, 60_000);
  }

  // ---- integration tasks (regression, bisect, lib/rule regression, integration gate) ----------------------------------
  // key: unique per logical run (regression epoch + bisect step, the lib / rule merge sha), so a later run never
  // resolves to an earlier, finished task.
  openIntegration({ purpose, workOrders, sha, key, extra = {} }) {
    const gate = this.leastLoaded("gate", [], workOrders);
    const meta = { kind: "integration", purpose, workOrders, sha: sha || "", branch: sha || "integration", attempt: 1, fixRound: 0, ...extra };
    const c = this.createTask({ key, title: `[integration] ${purpose}${sha ? ` @${short(sha)}` : ""} (${workOrders.length} 页)`, description: `集成门槛（${purpose}）：在 hmrsfw-vue \`${sha || "integration"}\` 上以 integration 模式跑 ${workOrders.length} 页。`, meta, assigneeId: gate.id, status: "todo" });
    if (c.created) this.ledger.tx((L) => L.newEvents.push({ type: "integration-open", task: c.id, purpose, sha, pages: workOrders.length }));
    return c;
  }

  passedPages(L) {
    return this.orders().filter((w) => isPage(w) && (this.isMergedWo(L, w.id) || isAccepted(w))).map((w) => w.id).sort();
  }

  // Both machines merge into integration, so the counts come from git (merges in main..integration) and the state from
  // the integration tasks, not from one machine's ledger. One regression per integration commit (the creation key).
  maybeRegression() {
    const L = this.ledger.read();
    const reg = this.pipelineIssues().filter((i) => i.metadata.kind === "integration" && ["regression", "bisect"].includes(i.metadata.purpose));
    if (reg.some(OPEN)) return null;
    this.appGit.fetch("integration", "main");
    const sha = this.appGit.revParse(this.appGit.remoteRef("integration"));
    const mainSha = this.appGit.revParse(this.appGit.remoteRef("main"));
    if (!sha || sha === mainSha) return null;
    if (reg.some((i) => i.metadata.purpose === "regression" && i.metadata.sha === sha)) return null; // this commit was tested
    const merges = this.appGit.mergesBetween(mainSha, sha).length;
    const idle = !this.pipelineIssues().some((i) => ["restore", "upgrade", "audit", "arbitrate"].includes(i.metadata.kind) && ["todo", "in_progress", "in_review"].includes(i.status));
    const lastReg = reg.filter((i) => i.metadata.purpose === "regression").sort((a, b) => (a.created_at < b.created_at ? 1 : -1))[0];
    const lastFailed = !!lastReg && this.gateResult(lastReg.metadata)?.pass === false;
    if (!(merges >= this.cfg.regressionEvery || (merges > 0 && idle) || lastFailed || L.tick.regressionDue)) return null;
    const pages = this.passedPages(L);
    const c = this.openIntegration({ purpose: "regression", workOrders: pages, sha, key: `integration:regression:${sha}`, extra: { mainSha } });
    if (c.id) this.ledger.tx((L2) => { L2.tick.regression = { state: "active", task: c.id, sha, mainSha, phase: "full" }; L2.tick.mergesSinceRegression = 0; L2.tick.regressionDue = false; });
    return c.id;
  }

  maybeIntegrationGate() {
    const L = this.ledger.read();
    if (L.tick.integrationGate || this.pipelineIssues().some((i) => i.metadata.purpose === "integration-gate")) return null;
    const core = this.orders().filter((w) => isCore(w) && !w.superseded);
    if (!core.length || !core.every((w) => this.isMergedWo(L, w.id) || isAccepted(w))) return null;
    const pages = this.passedPages(L);
    if (!pages.length) return null;
    const c = this.openIntegration({ purpose: "integration-gate", workOrders: pages, sha: null, key: "integration:integration-gate" });
    if (c.id) this.ledger.tx((L2) => { L2.tick.integrationGate = { task: c.id, at: this.iso(), state: "active" }; });
    return c.id;
  }

  failedWos(gate, wos) {
    if (gate?.pages) return wos.filter((w) => !gate.pages[w]?.pass);
    return (gate?.failed || []).map((f) => (typeof f === "string" ? f : f.wo || f.id || f.workOrder)).filter((w) => wos.includes(w));
  }

  advanceIntegration(taskId, meta) {
    const advKey = this.advKey(meta);
    if (meta.advanced === advKey) return { ok: true, summary: `already advanced ${taskId}`, anomalies: [] };
    const gate = this.gateResult(meta);
    if (!gate) return { ok: false, summary: `no gate result on ${taskId}`, anomalies: [{ issue: taskId, what: "integration advance without gate result", suggestedAction: "门槛员重跑" }] };
    if (gate.error) return { ok: false, summary: "gate error", anomalies: [{ issue: taskId, what: `integration gate error: ${String(gate.error).slice(0, 200)}`, suggestedAction: "建排障单交给裁定员" }] };
    const wos = meta.workOrders || [];
    const failed = gate.pass ? [] : this.failedWos(gate, wos);
    let out;
    switch (meta.purpose) {
      case "regression": out = this.onRegression(taskId, meta, gate.pass, failed); break;
      case "bisect": out = this.onBisect(taskId, meta, gate.pass); break;
      case "lib-regression": out = this.onLibRegression(taskId, meta, gate.pass, failed); break;
      case "rule-regression": out = this.onRuleRegression(taskId, meta, gate.pass, failed); break;
      case "integration-gate": out = this.onIntegrationGate(taskId, meta, gate.pass, failed); break;
      default: out = { ok: false, summary: `unknown integration purpose ${meta.purpose}`, anomalies: [] };
    }
    if (out && out.ok !== false) this.mc.setMeta(taskId, "advanced", advKey);
    return out;
  }

  closeIntegration(taskId, line) { this.comment(taskId, line); this.mc.update(taskId, { status: "done", noStart: true }); }

  onRegression(taskId, meta, pass, failed = []) {
    if (pass) {
      const r = this.locks.with("integration", () => this.appGit.fastForward({ sha: meta.sha, to: "main" }), 5 * 60_000);
      this.ledger.tx((L) => { L.tick.regression = { ...(L.tick.regression || {}), state: "passed" }; L.tick.regressionEpoch = (L.tick.regressionEpoch || 0) + 1; L.tick.lastGoodSha = meta.sha; L.newEvents.push({ type: "main-ff", sha: meta.sha, ok: !!r.ok }); });
      if (!r.ok) this.anomaly(taskId, `fast-forward main → ${short(meta.sha)} failed: ${JSON.stringify(r).slice(0, 200)}`, "裁定员检查 main 是否被手动改动");
      this.closeIntegration(taskId, `[GATE] 集成回归通过，main 快进到 ${short(meta.sha)}`);
      return { ok: true, summary: `regression @${short(meta.sha)} passed → main`, anomalies: [] };
    }
    const L = this.ledger.read();
    // merges already reverted (by either machine: the revert commit names them) can't be the cause of this failure
    const reverted = this.appGit.revertedIn(meta.mainSha, meta.sha);
    const cands = this.appGit.mergesBetween(meta.mainSha, meta.sha).filter((sha) => !L.tick.merges?.[sha]?.reverted && !reverted.has(sha));
    this.closeIntegration(taskId, `[GATE] 集成回归失败（${failed.length || "?"} 页），开始二分（${cands.length} 个合并）`);
    if (!cands.length) {
      this.ledger.tx((L2) => { L2.tick.regression = { ...(L2.tick.regression || {}), state: "failed" }; L2.tick.regressionEpoch = (L2.tick.regressionEpoch || 0) + 1; });
      return this.openIncident(`集成回归在 ${short(meta.sha)} 失败，但 main..integration 之间没有可回退的合并提交`, { sha: meta.sha, failed });
    }
    return this.bisectStep({ candidates: cands, lo: 0, hi: cands.length - 1, sha: meta.sha, mainSha: meta.mainSha, failed, step: 1 });
  }

  // Pages to test at a commit: the pages that failed the regression (all passed pages when the gate didn't say which),
  // restricted to those whose code is in that commit — a page merged later would fail there for the wrong reason.
  pagesAt(sha, failed) {
    const L = this.ledger.read();
    const pool = failed && failed.length ? failed : this.passedPages(L);
    return pool.filter((w) => {
      if (isAccepted(this.wo(w))) return true;
      const m = this.mergedSha(L, w);
      return !!m && this.appGit.isAncestor(m, sha);
    });
  }

  // Binary search for the first bad merge in candidates[lo..hi]; candidates[hi] is known bad. A step whose failing pages
  // aren't in the tested commit yet counts as good without running the gate.
  bisectStep(b) {
    while (b.lo < b.hi) {
      const mid = Math.floor((b.lo + b.hi) / 2);
      const pages = this.pagesAt(b.candidates[mid], b.failed);
      if (pages.length) {
        const c = this.openIntegration({ purpose: "bisect", workOrders: pages, sha: b.candidates[mid], key: `integration:bisect:${b.sha}:s${b.step}`, extra: { bisect: { ...b, mid } } });
        this.ledger.tx((L2) => { L2.tick.regression = { state: "active", phase: "bisect", task: c.id, ...b, mid }; });
        return { ok: true, summary: `bisect step ${b.step}: ${b.lo}..${b.hi} → test ${short(b.candidates[mid])} (${pages.length} 页)`, anomalies: [] };
      }
      b = { ...b, lo: mid + 1, step: b.step + 1 };
    }
    return this.culprit(b.candidates[b.lo], b);
  }

  onBisect(taskId, meta, pass) {
    const b = meta.bisect;
    this.closeIntegration(taskId, `[GATE] 二分第 ${b.step} 步：${short(b.candidates[b.mid])} ${pass ? "通过" : "失败"}`);
    const next = pass ? { ...b, lo: b.mid + 1 } : { ...b, hi: b.mid };
    return this.bisectStep({ ...next, step: b.step + 1 });
  }

  // The merge that broke the regression: revert it and send its task back through the failure rules.
  culprit(sha, b) {
    const L = this.ledger.read();
    const m = L.tick.merges?.[sha] || this.mergeInfo(sha);
    const rv = this.revertMerge(sha, `Revert ${short(sha)}: integration regression bisected to this merge`);
    this.ledger.tx((L2) => { L2.tick.regression = { ...b, state: "reverted", culprit: sha }; L2.tick.regressionEpoch = (L2.tick.regressionEpoch || 0) + 1; L2.tick.regressionDue = true; L2.newEvents.push({ type: "revert", sha, task: m?.task, why: "regression" }); });
    if (!m) return this.openIncident(`集成回归二分定位到 ${short(sha)}，但账本里没有这次合并的任务`, { sha });
    this.requestReopen(m.task, m.wos, `regression:${short(sha)}`, rv?.sha);
    return { ok: true, summary: `regression culprit ${short(sha)} (task ${m.task}) reverted`, anomalies: [] };
  }

  // Task and work orders of an integration merge, from its commit message (written by mergeTask), so the leader finds
  // merges made on the other machine.
  mergeInfo(sha) {
    const msg = this.appGit.raw(["log", "-1", "--format=%B", sha], { allowFail: true }).out;
    const m = msg.match(/\(([^;()]*); task ([^,()\s]+), attempt (\d+)\)/);
    return m ? { task: m[2], wos: m[1].split(",").map((x) => x.trim()).filter(Boolean), attempt: Number(m[3]) } : null;
  }

  // Reopen a task owned by this machine now; otherwise leave the request on the task for its owner's tick.
  requestReopen(taskId, wos, reason, revertSha) {
    let meta;
    try { meta = this.meta(taskId); } catch { meta = { workOrders: wos }; }
    if (baseKind(meta) === "upgrade") wos = []; // an upgrade's workOrders are the pages it unblocks, not its output
    if (this.ownsTask({ ...meta, kind: baseKind(meta) })) return this.reopen(taskId, wos, reason, revertSha);
    this.mc.setMeta(taskId, "reopenRequest", { id: createHash("sha1").update(`${taskId}:${reason}:${revertSha || ""}`).digest("hex").slice(0, 10), reason, revertSha: revertSha || null, wos, at: this.iso(), by: this.machine });
    this.act(`reopen of ${taskId} requested from its owner (${this.ownerLabel(meta)})`);
  }

  processReopenRequests() {
    for (const i of this.pipelineIssues().filter((x) => x.metadata.reopenRequest && x.metadata.reopenRequest.id !== x.metadata.reopenHandled && this.ownsTask({ ...x.metadata, kind: baseKind(x.metadata) }))) {
      const q = i.metadata.reopenRequest;
      this.safe(i.id, () => { this.mc.setMeta(i.id, "reopenHandled", q.id); this.reopen(i.id, q.wos || [], q.reason, q.revertSha); this.act(`reopened ${i.id} (${q.reason}) on request of ${q.by}`); });
    }
  }

  // A done/merged task found broken later: back to the failure rules.
  reopen(taskId, wos, reason, revertSha) {
    this.withWo(wos, () => {
      const meta = this.meta(taskId);
      this.ledger.tx((L) => { for (const w of wos) { const s = (L.tasks.wos[w] ??= { tasks: [] }); s.state = "active"; s.active = [taskId]; s.merged = null; } L.newEvents.push({ type: "reopen", task: taskId, wos, reason }); });
      this.mc.setMeta(taskId, "reopened", reason);
      const m2 = this.rebranch(taskId, meta, revertSha);
      this.onFail(taskId, { ...(m2 || meta), kind: baseKind(meta), twin: undefined }, { reason, failed: [], forceRedo: !m2 });
    }, 60_000);
  }

  onLibRegression(taskId, meta, pass, failed) {
    if (pass) { this.closeIntegration(taskId, `[GATE] 公共库回归通过（${meta.workOrders.length} 页）`); return { ok: true, summary: "lib regression passed", anomalies: [] }; }
    const rv = this.revertMerge(meta.libMergeSha, `Revert ${short(meta.libMergeSha)}: public-library regression failed on ${failed.length} pages`);
    this.ledger.tx((L) => L.newEvents.push({ type: "revert", sha: meta.libMergeSha, task: meta.libTask, why: "lib-regression", pages: failed }));
    this.closeIntegration(taskId, `[GATE] 公共库回归失败（${failed.length} 页），已回退 ${short(meta.libMergeSha)}`);
    const lm = this.ledger.read().tick.merges?.[meta.libMergeSha] || this.mergeInfo(meta.libMergeSha);
    this.requestReopen(meta.libTask, lm?.wos || [], `lib-regression:${failed.length}`, rv?.sha);
    return { ok: true, summary: `lib regression failed → reverted ${short(meta.libMergeSha)}`, anomalies: [] };
  }

  onIntegrationGate(taskId, meta, pass, failed) {
    const total = meta.workOrders.length || 1;
    const rate = pass ? 0 : failed.length / total;
    this.ledger.tx((L) => { L.tick.integrationGate = { ...(L.tick.integrationGate || {}), state: pass ? "passed" : "failed", failRate: rate, failed }; L.newEvents.push({ type: "integration-gate", pass, failRate: rate, failed: failed.length }); });
    this.closeIntegration(taskId, `[GATE] 集成门槛：${pass ? "全部通过" : `${failed.length}/${total} 页失败（${(rate * 100).toFixed(1)}%）`}`);
    if (pass) return { ok: true, summary: "integration gate passed", anomalies: [] };
    if (rate > this.cfg.stop.integrationFailRate) return this.stop(`集成门槛失败率 ${(rate * 100).toFixed(1)}% > ${this.cfg.stop.integrationFailRate * 100}%`, { failed });
    return this.openIncident(`集成门槛 ${failed.length} 页失败，按共享组件或入口包追溯`, { failed });
  }

  // ---- rule changes -------------------------------------------------------------------------------------------------
  openRuleReview(branch) {
    const arb = this.roster.role("arbiter")[0];
    const reviewers = this.roster.role("reviewer").filter((a) => a.family !== (arb?.family || "anthropic"));
    const byFam = [...new Map(reviewers.map((a) => [a.family, a])).values()];
    if (byFam.length < 2) return { ok: false, summary: "need two reviewers from families other than the arbiter's", anomalies: [{ issue: null, what: "rule review needs 2 non-arbiter families", suggestedAction: "检查名册" }] };
    this.syncRuleRounds();
    const L = this.ledger.read();
    const rc = L.tick.ruleChanges?.[branch];
    if (rc && rc.state === "reviewing") return { ok: true, summary: `rule change ${branch} already in review (round ${rc.round})`, tasks: rc.tasks, anomalies: [] };
    if (rc && rc.state === "escalated") return { ok: false, summary: `rule change ${branch} was escalated to a human`, anomalies: [] };
    const round = rc ? rc.round + 1 : 1;
    const tasks = {};
    for (const a of byFam.slice(0, 2)) {
      const c = this.createTask({ key: `rule-review:${branch}:r${round}:${a.id}`, title: `[rule-review] ${branch} r${round} (${a.name})`, description: `复核规则变更分支 \`${branch}\`（工具仓库），证据见 \`docs/rule-changes/\`。结论写进元数据 \`review.${a.name}\`。`, meta: { kind: "rule-review", branch, round, ruleChange: branch, reviewer: a.id }, assigneeId: a.id });
      if (c.id) tasks[a.id] = c.id;
    }
    this.ledger.tx((L2) => { (L2.tick.ruleChanges ??= {})[branch] = { state: "reviewing", round, tasks, openedAt: this.iso() }; L2.newEvents.push({ type: "rule-review-open", branch, round }); });
    return { ok: true, summary: `rule review ${branch} round ${round} → ${byFam.slice(0, 2).map((a) => a.name).join(", ")}`, tasks, anomalies: [] };
  }

  // Rule-review rounds as the issues show them, folded into this ledger: a new leader (or `open-rule-review` run on the
  // other machine) continues the round instead of starting over.
  syncRuleRounds() {
    const rounds = {};
    for (const i of this.pipelineIssues().filter((x) => x.metadata.kind === "rule-review" && x.metadata.branch)) {
      const m = i.metadata;
      const r = ((rounds[m.branch] ??= {})[m.round || 1] ??= { tasks: {}, open: false, verdicts: [] });
      r.tasks[m.reviewer] = i.id;
      if (OPEN(i)) r.open = true;
      const v = m[`review.${this.roster.get(m.reviewer)?.name}`];
      if (v) r.verdicts.push(v.verdict);
    }
    const L = this.ledger.read();
    for (const [branch, byRound] of Object.entries(rounds)) {
      const round = Math.max(...Object.keys(byRound).map(Number));
      const rc = L.tick.ruleChanges?.[branch];
      const r = byRound[round];
      // a closed round: all approved → merged; otherwise rejected, and a rejected 2nd round was escalated to a human
      const state = r.open ? "reviewing" : r.verdicts.length && r.verdicts.every((v) => v === "approve") ? "merged" : round >= 2 ? "escalated" : "rejected";
      if (!rc || rc.round < round) this.ledger.tx((L2) => { (L2.tick.ruleChanges ??= {})[branch] = { state, round, tasks: r.tasks, openedAt: this.iso(), rebuilt: true }; });
    }
  }

  processRuleReviews() {
    this.syncRuleRounds();
    const L = this.ledger.read();
    for (const [branch, rc] of Object.entries(L.tick.ruleChanges || {})) {
      if (rc.state !== "reviewing") continue;
      this.safe(null, () => this.processRuleReview(branch, rc));
    }
  }

  processRuleReview(branch, rc0) {
    const verdicts = {};
    for (const [agentId, taskId] of Object.entries(rc0.tasks)) {
      const v = this.issues().find((x) => x.id === taskId)?.metadata?.[`review.${this.roster.get(agentId)?.name}`];
      if (v) verdicts[agentId] = v;
    }
    if (Object.keys(verdicts).length < Object.keys(rc0.tasks).length) return;
    this.locks.with(`rule-${branch}`, () => {
      const rc = this.ledger.read().tick.ruleChanges?.[branch];
      if (!rc || rc.state !== "reviewing" || rc.round !== rc0.round) return; // handled by a concurrent round
      for (const t of Object.values(rc.tasks)) this.mc.update(t, { status: "done", noStart: true });
      if (Object.values(verdicts).every((v) => v.verdict === "approve")) this.mergeRule(branch, rc);
      else this.rejectRule(branch, rc, verdicts);
    }, 60_000);
  }

  mergeRule(branch, rc) {
    const r = this.locks.with("tool-main", () => this.toolGit.merge({ branch, into: "main", message: `Merge rule change ${branch} (approved by 2 reviewers, round ${rc.round})` }), 5 * 60_000);
    if (r.locked || !r.merged) {
      this.anomaly(null, `rule change ${branch} approved but merge failed: ${JSON.stringify(r).slice(0, 200)}`, "裁定员解决冲突后重新 open-rule-review");
      this.ledger.tx((L) => { L.tick.ruleChanges[branch].state = "merge-failed"; });
      return;
    }
    const L = this.ledger.read();
    this.ledger.tx((L2) => { L2.tick.ruleChanges[branch] = { ...rc, state: "merged", sha: r.sha }; L2.newEvents.push({ type: "rule-merged", branch, sha: r.sha }); });
    this.openIntegration({ purpose: "rule-regression", workOrders: this.passedPages(L), sha: null, key: `integration:rule-regression:${r.sha}`, extra: { ruleChange: branch, ruleSha: r.sha } });
  }

  rejectRule(branch, rc, verdicts) {
    const why = Object.entries(verdicts).filter(([, v]) => v.verdict !== "approve").map(([a, v]) => `${this.roster.get(a)?.name}: ${v.why || "reject"}`).join("；");
    if (rc.round >= 2) {
      this.ledger.tx((L) => { L.tick.ruleChanges[branch] = { ...rc, state: "escalated" }; L.newEvents.push({ type: "rule-escalated", branch, why }); });
      return this.escalate(`规则变更 \`${branch}\` 两轮复核仍不同意`, `${why}\n\n按方案第十五节第 3 条，两轮不同意升级给人决定。`, { kind: "incident", branch });
    }
    this.ledger.tx((L) => { L.tick.ruleChanges[branch] = { ...rc, state: "rejected" }; L.newEvents.push({ type: "rule-rejected", branch, round: rc.round, why }); });
    this.openIncident(`规则变更 ${branch} 第 ${rc.round} 轮被否决，请修改后重新运行 open-rule-review`, { branch, why }, false);
  }

  onRuleRegression(taskId, meta, pass, failed) {
    if (pass) { this.closeIntegration(taskId, `[GATE] 规则变更 ${meta.ruleChange} 全量回归通过`); this.ledger.tx((L) => L.newEvents.push({ type: "rule-regression", branch: meta.ruleChange, pass: true })); return { ok: true, summary: "rule regression passed", anomalies: [] }; }
    const r = this.locks.with("tool-main", () => this.toolGit.revert({ sha: meta.ruleSha, into: "main", message: `Revert rule change ${meta.ruleChange}: full regression failed on ${failed.length} pages` }), 5 * 60_000);
    this.ledger.tx((L) => { if (L.tick.ruleChanges?.[meta.ruleChange]) L.tick.ruleChanges[meta.ruleChange].state = "reverted"; L.newEvents.push({ type: "rule-reverted", branch: meta.ruleChange, pages: failed.length, ok: !!r.reverted }); });
    this.closeIntegration(taskId, `[GATE] 规则变更 ${meta.ruleChange} 回归失败（${failed.length} 页），已回退`);
    return { ok: true, summary: `rule ${meta.ruleChange} reverted`, anomalies: [] };
  }

  // ---- incidents, stop conditions, escalation -------------------------------------------------------------------------
  openIncident(reason, details = {}, pause = false, keySuffix = "") {
    const L = this.ledger.read();
    const key = `incident:${createHash("sha1").update(reason).digest("hex").slice(0, 12)}${keySuffix}`;
    const arb = this.leastLoaded("arbiter");
    const c = this.createTask({ key, title: `[incident] ${reason.slice(0, 80)}`, description: `${reason}\n\n${"```json"}\n${JSON.stringify(details, null, 1).slice(0, 4000)}\n${"```"}\n\n处理完运行 \`node tools/tick.mjs resume\`。`, meta: { kind: "incident", reason, details, paused: pause }, assigneeId: arb.id });
    if (c.created) this.ledger.tx((L2) => { L2.newEvents.push({ type: "incident", task: c.id, reason, pause }); if (pause) L2.tick.incidentTask = c.id; });
    void L;
    return { ok: true, summary: `incident ${c.id || "(busy)"}: ${reason}`, anomalies: [{ issue: c.id, what: reason, suggestedAction: "排障单已交给裁定员" }] };
  }

  // Pause is visible to both machines: an incident with metadata paused=true that `resume` hasn't lifted.
  pausedReason(L = this.ledger.read()) {
    if (L.tick.paused) {
      // lifted by a resume on the other machine: our incident is marked resumed, or (no incident was created) some resume
      // happened after we paused
      const inc = L.tick.incidentTask && this.pipelineIssues().find((i) => i.id === L.tick.incidentTask);
      const resumedLater = !L.tick.incidentTask && L.tick.pausedAt && this.pipelineIssues().some((i) => i.metadata.resumedAt && i.metadata.resumedAt > L.tick.pausedAt);
      if (!(inc?.metadata.resumed === true || resumedLater)) return L.tick.pausedReason || "paused";
    }
    const inc = this.pipelineIssues().find((i) => i.metadata.kind === "incident" && i.metadata.paused === true && i.metadata.resumed !== true);
    return inc ? `${inc.metadata.reason || inc.title}（${inc.metadata.createdOn || "?"}）` : null;
  }

  stop(reason, details) {
    const L = this.ledger.read();
    const already = this.pausedReason(L);
    if (already) return { ok: true, summary: `already paused (${already})`, anomalies: [] };
    const at = this.iso();
    this.ledger.tx((L2) => { L2.tick.paused = true; L2.tick.pausedReason = reason; L2.tick.pausedAt = at; L2.newEvents.push({ type: "pause", reason }); });
    return this.openIncident(`停止条件：${reason}`, details, true, `:${at}`);
  }

  escalate(title, body, meta = {}) {
    const who = this.roster.escalateTo;
    if (!who?.memberId) { this.anomaly(null, `escalation needed but roster has no escalateTo: ${title}`, "在名册里补 escalateTo"); return { ok: false }; }
    const c = this.createTask({ key: `escalate:${createHash("sha1").update(title).digest("hex").slice(0, 12)}`, title: `[BLOCKED] ${title.slice(0, 80)}`, description: body, meta: { kind: meta.kind || "incident", escalated: true, ...meta }, assigneeId: null, status: "backlog" });
    if (c.id && c.created) { this.mc.update(c.id, { status: "blocked", assigneeId: who.memberId }); this.comment(c.id, `[BLOCKED] ${title}`); }
    this.ledger.tx((L) => L.newEvents.push({ type: "escalate", task: c.id, title }));
    return { ok: true, task: c.id };
  }

  checkStopConditions() {
    const L = this.ledger.read();
    if (this.pausedReason(L)) return;
    const S = this.cfg.stop;
    const lastResume = this.pipelineIssues().map((i) => i.metadata.resumedAt).filter(Boolean).sort().pop() || null;
    const since = [L.tick.resumedAt || "", lastResume || ""].sort().pop() || null; // before the last resume was dealt with by the arbiter
    const gates = this.sharedEvents(since).filter((e) => e.type === "gate").slice(-S.sameFailureStreak);
    if (gates.length === S.sameFailureStreak && gates.every((g) => !g.pass && g.category && g.category === gates[0].category)) {
      this.stop(`连续 ${S.sameFailureStreak} 次同类门槛失败：${gates[0].category}`, { tasks: gates.map((g) => g.task) });
      return;
    }
    for (const p of Object.entries(this.capability(L).audits || {})) {
      const [k, v] = p;
      if (v.audits >= S.minAuditsForMissRate && v.misses / v.audits > this.cfg.audit.missRateThreshold) {
        if (!(L.tick.missRateAlerted || {})[k]) {
          this.ledger.tx((L2) => { (L2.tick.missRateAlerted ??= {})[k] = this.iso(); });
          this.stop(`漏检率 ${k} = ${((v.misses / v.audits) * 100).toFixed(1)}% > ${this.cfg.audit.missRateThreshold * 100}%`, { pair: k, ...v });
          return;
        }
      }
    }
    const hourAgo = [new Date(this.now() - 3600_000).toISOString(), since || ""].sort().pop();
    const unknown = this.sharedEvents(hourAgo).filter((e) => e.type === "run-error" && e.category === "unknown");
    if (unknown.length >= S.unknownErrorsPerHour) { this.stop(`一小时内 ${unknown.length} 次无法归类的运行失败`, { tasks: unknown.map((e) => e.task) }); return; }
    const families = [...new Set(this.roster.role("restorer").map((a) => a.family))];
    const now = this.now();
    const st = this.agentsState(L);
    const cooling = (fam) => this.roster.family(fam, "restorer").every((a) => (st[a.id]?.cooldownUntil || 0) > now);
    const def = this.roster.agents.find((a) => a.role === "restorer" && a.model === this.cfg.defaultPageModel)?.family;
    if (def && cooling(def) && families.filter((f) => f !== def).every((f) => !this.cfg.cheapTier.enabled || cooling(f))) this.stop("所有可用的还原员都在限流冷却中", {});
  }

  // ---- tick steps ---------------------------------------------------------------------------------------------------
  // Step 1: refresh runtime / CLI versions of roster agents (for run rows and capability keys).
  syncAgents() {
    const seedFile = process.env.RESTORE_ASSETS && path.join(process.env.RESTORE_ASSETS, "out", "confirm-stats.json");
    if (!Object.keys(this.ledger.read().capability.keys || {}).length && seedFile && existsSync(seedFile)) {
      this.ledger.tx((L) => seedFromConfirm(L, readJson(seedFile)));
      this.act("capability seeded from POC confirm-stats.json");
    }
    let rts = [];
    try { rts = this.mc.runtimes(); } catch { return; }
    const byId = new Map(rts.map((r) => [r.id, r]));
    this.ledger.tx((L) => {
      for (const a of this.roster.agents) {
        const rt = byId.get(a.runtimeId);
        if (!rt) continue;
        const s = (L.agents[a.id] ??= {});
        s.runtime = rt.provider || s.runtime; s.cliVersion = rt.metadata?.version || rt.version || s.cliVersion; s.multicaCli = rt.metadata?.cli_version || s.multicaCli; s.online = rt.status === "online";
      }
    });
  }

  // Step 1b: finish creations interrupted between `issue create` and assignment.
  resumeCreations() {
    const L = this.ledger.read();
    for (const [id, t] of Object.entries(L.tasks.tasks)) if (!t.assigned && t.meta) { this.finishCreate(id, L); this.act(`finished interrupted creation ${id}`); }
  }

  // Step 2: failed runs → cooldown + reassign (rate limit / quota), one retry (env), else anomaly.
  handleFailedRuns() {
    const L = this.ledger.read();
    const handled = L.tick.handledRuns || {};
    const active = this.pipelineIssues().filter((i) => ["todo", "in_progress", "in_review"].includes(i.status) && this.roster.get(i.assignee_id) && this.ownsTask(i.metadata));
    for (const i of active) this.safe(i.id, () => this.handleFailedRun(i, handled));
    // keep the handled set bounded
    this.ledger.tx((L2) => { const h = L2.tick.handledRuns || {}; const keys = Object.keys(h); if (keys.length > 5000) for (const k of keys.slice(0, keys.length - 5000)) delete h[k]; });
  }

  handleFailedRun(i, handled) {
    let runs;
    try { runs = this.mc.runs(i.id); } catch { return; }
    const last = runs[0];
    if (!last || !FAILED_RUN_STATUSES.has(last.status) || handled[last.id]) return;
    if (last.agent_id && last.agent_id !== i.assignee_id) return;
    const agent = this.roster.get(i.assignee_id);
    const cls = classifyRunError(last);
    const wos = i.metadata.workOrders || [];
    this.withWo(wos.length ? wos : [`task-${i.id}`], () => {
      // claim the run inside the ledger transaction so a concurrent round can't handle it too
      const mine = this.ledger.tx((L2) => {
        if ((L2.tick.handledRuns ??= {})[last.id]) return false;
        L2.tick.handledRuns[last.id] = this.iso();
        L2.newEvents.push({ type: "run-error", task: i.id, agent: agent.id, category: cls.category });
        L2.newRuns.push(runRow(this.roster, L2.agents, agent.id, { task: i.id, workOrders: wos, kind: i.metadata.kind, result: "error", errorCategory: cls.category, tokens: null }));
        if (cls.action === "cooldown") (L2.agents[agent.id] ??= {}).cooldownUntil = this.now() + this.cfg.cooldownMin * 60_000;
        if (cls.action === "retry") { const s = (L2.agents[agent.id] ??= {}); (s.envRetries ??= {})[`${i.id}:${agent.id}`] = (s.envRetries[`${i.id}:${agent.id}`] || 0) + 1; }
        return true;
      });
      if (!mine) return;
      if (cls.action === "cooldown") this.reassign(i, agent, `${cls.category}，${agent.name} 冷却 ${this.cfg.cooldownMin} 分钟`);
      else if (cls.action === "retry") {
        const n = this.ledger.read().agents[agent.id]?.envRetries?.[`${i.id}:${agent.id}`] || 1;
        if (n <= 1) { this.mc.rerun(i.id); this.act(`rerun ${i.id} on ${agent.name} (env failure)`); }
        else this.reassign(i, agent, "环境类失败重跑后仍失败");
      } else this.anomaly(i.id, `run failed with an unclassified error on ${agent.name}`, "检查运行日志；若是新的限流文案，补进 tools/lib/error-classes.mjs");
    });
  }

  reassign(issue, agent, why) {
    const meta = issue.metadata;
    let next = null;
    const L = this.ledger.read();
    if (["restorer", "restorer-core"].includes(agent.role)) {
      const same = this.roster.family(agent.family, agent.role).filter((a) => a.id !== agent.id && a.model === agent.model);
      const ctx = this.routeCtx(L);
      next = same.find((a) => (L.agents[a.id]?.cooldownUntil || 0) <= this.now() && a.maxConcurrent + this.cfg.preQueue - (ctx.load.get(a.id) || 0) > 0);
      if (!next && meta.workOrders?.length) {
        const r = route(this.wo(meta.workOrders[0]), ctx, { kind: meta.kind === "upgrade" ? "upgrade" : "restore", exclude: [agent.id] });
        const p = pick({ ...r, dual: false });
        next = p[0] ? this.roster.get(p[0].agent.id) : null;
      }
    } else {
      const st = this.agentsState(L);
      next = this.roster.role(agent.role).find((a) => a.id !== agent.id && (st[a.id]?.cooldownUntil || 0) <= this.now() && canRun(this.roster, this.cfg, a.machine, STAGE[a.role] || a.role, (meta.workOrders || []).map((w) => this.wo(w)))) || null;
    }
    if (!next) { this.anomaly(issue.id, `${why}; no other ${agent.role} available`, "等冷却结束后下一轮自动改派"); return; }
    const upd = ["restorer", "restorer-core"].includes(agent.role) ? { agent: next.id, family: next.family } : {};
    if (Object.keys(upd).length) this.mc.setMetaMany(issue.id, upd);
    this.mc.update(issue.id, { status: issue.status === "in_review" ? "in_review" : "todo", assigneeId: next.id });
    this.bump(next.id);
    this.comment(issue.id, `[REDO] ${why} → 改派 ${next.name}`);
    this.act(`reassigned ${issue.id} ${agent.name} → ${next.name}`);
  }

  // Step 3: delivered but still on the restorer/fixer (handoff didn't run) → gate; gated but not advanced → advance.
  fallbackGate() {
    const stale = this.now() - this.cfg.lockStaleMs;
    const due = (i, m) => m.advanceRequested === this.advKey(m) || Date.parse(i.updated_at || 0) < stale;
    for (const i of this.pipelineIssues()) {
      const m = i.metadata;
      if (typeof m.advanceRequested === "string" && m.advanceRequested.startsWith("regate:") && m.advanceRequested !== m.regateDone && this.ownsTask(m)) {
        // only for the gate round it was asked for; a task that moved on since (fixed, merged, done) drops the request
        // (attempt and gateSeq don't move when a verdict sends the task to the fixer, audit or arbiter, so also require it to
        // still be a gate-side restore/upgrade/integration task)
        const current = m.advanceRequested === `regate:${this.advKey(m)}` && OPEN(i) && ["restore", "upgrade", "integration"].includes(m.kind) && (this.roster.isRole(i.assignee_id, "gate") || m.waitRecord === true);
        this.safe(i.id, () => { this.mc.setMeta(i.id, "regateDone", m.advanceRequested); if (current) { const r = this.advance(i.id, { regate: true }); this.act(`requested regate ${i.id}: ${r.summary || ""}`); } else this.act(`stale regate request on ${i.id} dropped`); });
        continue;
      }
      if (!["restore", "upgrade"].includes(m.kind) || i.status !== "in_review" || m.waitRecord === true || m.suspendedBy || !this.ownsTask(m)) continue;
      const who = this.roster.get(i.assignee_id);
      if (who && ["restorer", "restorer-core", "fixer"].includes(who.role)) {
        // give a running handoff.mjs time to finish, then re-check under the lock before sending
        if (Date.parse(i.updated_at || 0) > this.now() - 2 * 60_000) continue;
        this.safe(i.id, () => this.withWo(m.workOrders || [], () => {
          const cur = this.mc.getIssue(i.id);
          if (cur.status !== "in_review" || !this.roster.isRole(cur.assignee_id, "restorer", "restorer-core", "fixer")) return;
          const gate = this.sendToGate(i.id, this.meta(i.id));
          this.comment(i.id, `[RECEIPT] 兜底：已交付但未送门槛 → ${gate.name}`);
          this.act(`fallback gate ${i.id}`);
        }));
      } else if (who?.role === "gate" && this.gateResult(m) && m.advanced !== this.advKey(m) && due(i, m)) {
        this.safe(i.id, () => {
          const r = this.advance(i.id);
          this.act(`fallback advance ${i.id}: ${r.summary || JSON.stringify(r)}`);
          (r.anomalies || []).forEach((a) => this.anomalies.push(a));
        });
      }
    }
    if (!this.isLeader) return;
    for (const i of this.pipelineIssues().filter((x) => x.metadata.kind === "integration" && x.status !== "done" && x.status !== "cancelled")) {
      const m = i.metadata;
      if (this.gateResult(m) && m.advanced !== this.advKey(m) && due(i, m)) this.safe(i.id, () => { const r = this.advance(i.id); this.act(`fallback advance ${i.id}: ${r.summary || ""}`); });
    }
  }

  // One broken task must not stop the whole round: report it and carry on.
  safe(issueId, fn) {
    try { return fn(); } catch (e) { this.anomaly(issueId, e.message.slice(0, 300), "检查该任务；若是脚本问题，评论 [ERROR] 并建排障单"); return null; }
  }

  // Step 4: record tasks finished → ledger; tasks waiting for a recording that is now there → back to the gate.
  syncRecords() {
    for (const i of this.pipelineIssues().filter((x) => x.metadata.kind === "record" && this.isLeader)) {
      const rec = i.metadata.record;
      const wo = (i.metadata.workOrders || [])[0];
      if (!wo) continue;
      const state = rec === "ok" ? "ok" : typeof rec === "string" && rec.startsWith("blocked") ? "blocked" : i.status === "cancelled" ? null : "pending";
      const L = this.ledger.read();
      if ((L.tasks.wos[wo]?.record || null) !== state && !(state === "pending" && L.tasks.wos[wo]?.record === "ok")) this.ledger.tx((L2) => { const s = (L2.tasks.wos[wo] ??= { tasks: [] }); s.record = state; s.recordTask = i.id; if (state === "ok") L2.newEvents.push({ type: "recorded", wo }); });
    }
    const L = this.ledger.read();
    for (const i of this.pipelineIssues().filter((x) => x.metadata.waitRecord === true && ["restore", "upgrade"].includes(x.metadata.kind) && this.ownsTask(x.metadata))) {
      const wos = i.metadata.workOrders || [];
      if (!wos.every((w) => this.recorded(L, w))) continue;
      this.safe(i.id, () => this.withWo(wos, () => {
        const m = this.meta(i.id);
        if (m.waitRecord !== true) return;
        this.mc.setMeta(i.id, "waitRecord", false);
        this.comment(i.id, `[GATE] 录制已完成，重新送门槛`);
        this.sendToGate(i.id, m);
        this.act(`record ready → regate ${i.id}`);
      }));
    }
  }

  // One round on this machine. Steps on tasks only touch the ones this machine owns; the global steps (records,
  // rule reviews, integration gate, regression, stop conditions, double-dispatch check) run on the leader only.
  tick() {
    if (this.machine === null) throw new Error("tick needs to know its machine: --machine <id>, HMRSFW_MACHINE, or roster machines.<id>.hosts (or --machine '*' for a single unsharded tick)");
    const step = (name, fn) => { this.locks.touchAll(); try { return fn(); } catch (e) { this.anomaly(null, `${name}: ${e.message.slice(0, 300)}`, "评论 [ERROR]，建排障单交给裁定员"); return 0; } };
    let lease = { leader: true, holder: this.machine };
    if (this.claims) {
      try { lease = this.claims.lease(this.machine, this.cfg.claims.leaderTtlMin * 60_000); } catch (e) { this.anomaly(null, `claims: ${e.message.slice(0, 300)}`, "检查工具仓库的 claims 分支和网络；拿不到领取记录时本轮不派新单"); return { ok: false, summary: `tick ${this.iso()} · ${this.machine} · claims unavailable`, anomalies: this.anomalies, actions: this.actions }; }
      this._leader = lease.leader;
      if (lease.acquired) this.act(`leader lease → ${this.machine}`);
    }
    step("sync agents", () => this.syncAgents());
    this.issues(true);
    step("resume creations", () => this.resumeCreations());
    step("failed runs", () => this.handleFailedRuns());
    step("fallback gate", () => this.fallbackGate());
    step("reopen requests", () => this.processReopenRequests());
    step("resume suspended", () => this.resumeSuspendedOwned());
    step("requests", () => this.processRequests());
    this.issues(true);
    step("records", () => this.syncRecords());
    step("audits", () => this.processAudits());
    if (this.isLeader && this.confirmLeader()) step("rule reviews", () => this.processRuleReviews());
    this.issues(true);
    const rec = this.isLeader && this.confirmLeader() ? step("dispatch records", () => this.dispatchRecords()) : 0;
    const neu = step("dispatch", () => this.dispatchNew());
    if (this.isLeader && this.confirmLeader()) {
      if (this.appDir) { try { this.maybeIntegrationGate(); this.maybeRegression(); } catch (e) { this.anomaly(null, `integration step failed: ${e.message}`, "检查 hmrsfw-vue 检出"); } }
      step("stop conditions", () => this.checkStopConditions());
      this.issues(true);
      step("double dispatch", () => this.detectDoubleDispatch());
    }
    step("publish stats", () => this.publishStats());
    const L = this.ledger.read();
    const counts = {};
    for (const i of this.pipelineIssues()) { const k = `${i.metadata.kind}:${i.status}`; counts[k] = (counts[k] || 0) + 1; }
    const paused = this.pausedReason(L);
    const mine = this.claims ? this.claims.claimsOf(this.machine).length : null;
    const summary = `tick ${this.iso()} · ${this.machine}${this.isLeader ? "（主控）" : `（主控 ${lease.holder}）`}${paused ? ` · 已暂停（${paused}）` : ""} · 新派还原 ${neu} · 新派录制 ${rec}${mine != null ? ` · 本机领取 ${mine}` : ""} · ${Object.entries(counts).map(([k, v]) => `${k}=${v}`).join(" ")}`;
    return { ok: true, summary, anomalies: this.anomalies, actions: this.actions };
  }

  // Leader: a work order with two open tasks that aren't each other's twin, or a task created by a machine that doesn't
  // own its work order, means a claim was bypassed. Reported, not repaired (the arbiter decides which one to keep).
  detectDoubleDispatch() {
    const byWo = new Map();
    for (const i of this.pipelineIssues()) {
      const m = i.metadata;
      if (!["restore", "audit", "arbitrate"].includes(m.kind) || baseKind(m) === "upgrade" || m.twinLost || !OPEN(i)) continue;
      for (const w of m.workOrders || []) { if (!byWo.has(w)) byWo.set(w, []); byWo.get(w).push(i); }
      const claim = this.claims && (m.workOrders || []).length ? this.claims.get(claimPath(m.workOrders[0])) : null;
      if (claim?.machine && m.claimedBy && m.claimedBy !== claim.machine && !(claim.prevs || [claim.prev]).includes(m.claimedBy)) this.reportDouble(`${i.id} created on ${m.claimedBy} but ${m.workOrders[0]} is claimed by ${claim.machine}`, [i.id], m.workOrders);
    }
    for (const [w, list] of byWo) {
      if (list.length < 2) continue;
      if (list.length === 2 && list[0].metadata.twin === list[1].id && list[1].metadata.twin === list[0].id) continue;
      this.reportDouble(`${w} has ${list.length} open tasks: ${list.map((i) => `${i.id}@${i.metadata.claimedBy || i.metadata.createdOn || "?"}`).join(", ")}`, list.map((i) => i.id), [w]);
    }
  }
  reportDouble(what, tasks, wos) {
    const key = `${wos.join(",")}:${[...tasks].sort().join(",")}`;
    const L = this.ledger.read();
    if (!(L.tick.doubleReported || {})[key]) this.ledger.tx((L2) => { (L2.tick.doubleReported ??= {})[key] = this.iso(); L2.newEvents.push({ type: "double-dispatch", wos, tasks, what }); });
    this.anomaly(tasks[0], `double dispatch: ${what}`, "裁定员保留一张、作废其余（cancelled），并检查 claims 分支");
  }

  // Heartbeat + what the other machine needs from this one (capability, audits, cooldowns, recent events) on the
  // claims branch, at most every claims.publishEveryMin minutes.
  publishStats(force = false) {
    if (!this.claims || this.dryRun) return;
    const L = this.ledger.read();
    const every = (this.cfg.claims.publishEveryMin ?? 10) * 60_000;
    if (!force && L.tick.statsPublishedAt && this.now() - Date.parse(L.tick.statsPublishedAt) < every) return;
    const since = new Date(this.now() - 48 * 3600_000).toISOString();
    const cooldowns = Object.fromEntries(Object.entries(L.agents).filter(([, v]) => (v.cooldownUntil || 0) > this.now()).map(([k, v]) => [k, v.cooldownUntil]));
    const events = this.ledger.events(since).filter((e) => SHARED_EVENTS.has(e.type)).slice(-3000);
    const runs = this.ledger.runs(since).map((r) => ({ at: r.at, family: r.family, model: r.model, total: r.tokens?.total || 0 })).slice(-5000);
    const at = this.iso();
    this.claims.write({ [statsPath(this.machine)]: { machine: this.machine, at, host: os.hostname(), capability: L.capability, cooldowns, events, runs, claims: this.claims.claimsOf(this.machine).length } }, `stats ${this.machine}`);
    this.ledger.tx((L2) => { L2.tick.statsPublishedAt = at; });
  }

  // `tick.mjs claims list|reclaim`: who owns what, the lease and each machine's heartbeat; take over a dead machine's
  // work orders and rebuild this ledger's view of them from issue metadata.
  claimsCmd(sub, { from, keys, force = false } = {}) {
    if (!this.claims) return { ok: false, summary: "claims are disabled (scheduler.config.json claims.enabled=false)", anomalies: [] };
    if (sub !== "list" && this.machine === null) throw new Error("claims reclaim needs this machine's id: --machine <id> or HMRSFW_MACHINE");
    if (sub === "list") {
      this.claims.refresh();
      const reqs = this.claims.entries("req/").length;
      const by = {};
      for (const c of this.claims.all()) by[c.machine] = (by[c.machine] || 0) + 1;
      const hb = Object.fromEntries(this.claims.statsAll().map((x) => [x.machine, x.at]));
      return { ok: true, summary: `machine ${this.machine} (${this.machineSource}) · leader ${this.claims.leaderNow() || "none"} · claims ${JSON.stringify(by)} · heartbeat ${JSON.stringify(hb)} · requests ${reqs}`, claims: by, heartbeat: hb, leader: this.claims.get("leader.json"), anomalies: [] };
    }
    if (sub === "reclaim") {
      if (!from) throw new Error("usage: tick.mjs claims reclaim --from <machine> [--wo <工单id> ...] [--force] --machine <this machine>");
      if (from === this.machine) return { ok: false, summary: `${from} is this machine`, anomalies: [] };
      const r = this.claims.reclaim({ from, to: this.machine, keys, force, deadAfterMs: this.cfg.claims.deadAfterMin * 60_000 });
      if (!r.ok) return { ok: false, summary: r.error, anomalies: [] };
      this.issues(true);
      for (const w of r.moved) this.rebuildWo(w);
      this.ledger.tx((L) => L.newEvents.push({ type: "reclaim", from, to: this.machine, wos: r.moved.length }));
      return { ok: true, summary: `reclaimed ${r.moved.length} work orders from ${from}${r.retries ? ` after ${r.retries} retries` : ""}`, moved: r.moved, anomalies: [] };
    }
    throw new Error("usage: tick.mjs claims list | claims reclaim --from <machine> [--wo <工单id>] [--force]");
  }

  // This ledger's record of a work order rebuilt from the issues (after a reclaim, or a lost ledger).
  rebuildWo(w) {
    const v = this.woView().get(w);
    const rec = this.pipelineIssues().filter((i) => i.metadata.kind === "record" && (i.metadata.workOrders || []).includes(w));
    const tasks = this.pipelineIssues().filter((i) => (i.metadata.workOrders || []).includes(w)).map((i) => i.id);
    this.ledger.tx((L) => {
      const s = (L.tasks.wos[w] ??= { tasks: [] });
      s.tasks = [...new Set([...(s.tasks || []), ...tasks])];
      s.attempts = Math.max(s.attempts || 0, v?.attempts || 0);
      s.active = v?.active || [];
      s.merged = v?.merged ? { task: v.merged.task, sha: v.merged.sha } : null;
      s.state = v?.merged ? "merged" : s.active.length ? "active" : s.state === "superseded" ? "superseded" : null;
      if (rec.some((i) => i.metadata.record === "ok")) s.record = "ok";
      for (const i of this.pipelineIssues().filter((x) => tasks.includes(x.id))) { if (i.metadata.createKey) (L.tasks.keys ??= {})[i.metadata.createKey] = i.id; L.tasks.tasks[i.id] ??= { id: i.id, kind: i.metadata.kind, title: i.title, workOrders: i.metadata.workOrders || [], assigned: true, adopted: true }; }
    });
  }

  // ---- other commands -----------------------------------------------------------------------------------------------
  // resplit / rerecord / open-upgrade change a work order's tasks, so they run on its owner. Called elsewhere (the
  // arbiter or a reassigned restorer may sit on the other machine) they leave a request on the claims branch
  // (req/*.json) that the owner's next tick carries out and deletes.
  routed(cmd, { wo = null, task = null, reason = null }, run) {
    const meta = task ? this.meta(task) : null;
    const owns = task ? this.ownsTask(meta) : this.ownsWos([wo]);
    if (owns || !this.claims) return run(meta);
    const rel = `req/${fileKey(`${cmd}-${wo || task}-${this.now()}`)}.json`;
    this.claims.write({ [rel]: { cmd, wo, task, reason, by: this.machine, at: this.iso() } }, `request ${cmd} ${wo || task}`);
    return { ok: true, deferred: true, summary: `${cmd} ${wo || task}: belongs to ${task ? this.ownerLabel(meta) : this.claims.owner(wo) || "the leader"}, request left for its tick (${rel})`, anomalies: [] };
  }

  processRequests() {
    if (!this.claims) return;
    for (const [rel, q] of this.claims.entries("req/")) {
      let owns;
      try { owns = q.task ? this.ownsTask(this.meta(q.task)) : this.ownsWos([q.wo]); } catch {
        if (this.isLeader) { this.claims.write({ [rel]: null }, `drop ${q.cmd} ${q.task}: task not found`); this.anomaly(q.task, `request ${q.cmd} dropped: task not found`, "无需处理"); }
        continue;
      }
      if (!owns) continue;
      this.safe(q.task || null, () => {
        let r;
        if (q.cmd === "resplit") r = this.resplit(q.wo);
        else if (q.cmd === "rerecord") r = this.rerecord(q.wo);
        else if (q.cmd === "open-upgrade") { const meta = this.meta(q.task); r = this.withWo(meta.workOrders || [], () => this.openUpgrade(q.task, { reason: q.reason, meta }), 60_000); }
        else r = { ok: false, summary: `unknown request ${q.cmd}` };
        if (r && r.locked) return;
        this.claims.write({ [rel]: null }, `done ${q.cmd} ${q.wo || q.task}`);
        this.act(`request ${q.cmd} ${q.wo || q.task} from ${q.by}: ${r?.summary || ""}`);
      });
    }
  }

  // Lifts the pause on both machines: this ledger's flag and every pausing incident (metadata resumed=true).
  resume() {
    const L = this.ledger.read();
    const was = this.pausedReason(L);
    for (const i of this.issues(true).filter((x) => x.metadata.kind === "incident" && x.metadata.paused === true && x.metadata.resumed !== true)) this.mc.setMetaMany(i.id, { resumed: true, resumedAt: this.iso(), resumedOn: this.machine });
    this.ledger.tx((L2) => { L2.newEvents.push({ type: "resume", was }); L2.tick.paused = false; L2.tick.pausedReason = null; L2.tick.incidentTask = null; L2.tick.resumedAt = this.iso(); });
    return { ok: true, summary: was ? `resumed (was: ${was})` : "not paused", anomalies: [] };
  }

  resplit(woId) {
    const r = this.withWo([woId], () => {
      const L = this.ledger.read();
      const active = this.activeTasks(L, woId);
      for (const t of active) { this.mc.update(t, { status: "cancelled", noStart: true }); this.comment(t, `[REDO] 工单 ${woId} 重新分段，本任务作废`); }
      this.ledger.tx((L2) => { const s = (L2.tasks.wos[woId] ??= { tasks: [] }); s.state = "superseded"; s.active = []; L2.newEvents.push({ type: "resplit", wo: woId, cancelled: active }); });
      const tool = path.join(this.toolRoot, "tools", "work-orders.mjs");
      if (!existsSync(tool)) return { ok: true, summary: `${woId} superseded; work-orders.mjs not present, new segments not generated`, anomalies: [{ issue: null, what: `resplit ${woId}: tools/work-orders.mjs missing`, suggestedAction: "待 C（work-orders.mjs）合并后重跑 resplit" }] };
      if (this.dryRun) return { ok: true, summary: `[dry-run] node tools/work-orders.mjs resplit ${woId}`, anomalies: [] };
      const res = spawnSync(process.execPath, [tool, "resplit", woId, ...(this.appDir ? ["--app", this.appDir] : [])], { cwd: this.toolRoot, encoding: "utf8" });
      return { ok: res.status === 0, summary: `${woId} superseded; work-orders.mjs resplit → ${(res.stdout || res.stderr).trim().slice(0, 300)}`, anomalies: res.status === 0 ? [] : [{ issue: null, what: `work-orders.mjs resplit ${woId} failed`, suggestedAction: "裁定员检查分段" }] };
    }, 60_000);
    return r;
  }

  rerecord(woId) {
    return this.withWo([woId], () => {
      const L = this.ledger.read();
      const n = (L.tasks.wos[woId]?.recordAttempts || 1) + 1;
      const c = this.openRecord(woId, this.leastLoaded("recorder", [], [woId]), n);
      this.ledger.tx((L2) => { const s = (L2.tasks.wos[woId] ??= { tasks: [] }); s.recordAttempts = n; s.record = "pending"; L2.newEvents.push({ type: "rerecord", wo: woId, task: c.id }); });
      const gate = this.leastLoaded("gate", [], [woId]);
      for (const t of this.activeTasks(L, woId)) {
        const meta = this.meta(t);
        this.mc.setMetaMany(t, { kind: baseKind(meta), waitRecord: true });
        this.mc.update(t, { status: "in_review", assigneeId: gate.id, noStart: true });
        this.comment(t, `[RECORD] 退回录制（${c.id}），录完自动重跑门槛`);
      }
      return { ok: true, summary: `rerecord ${woId} → ${c.id}`, anomalies: [] };
    }, 60_000);
  }

  digest() {
    const L = this.ledger.read();
    const since = L.tick.lastDigestAt || new Date(this.now() - 24 * 3600_000).toISOString();
    const ev = this.sharedEvents(since);
    const runs = [...this.ledger.runs(since).map((r) => ({ family: r.family, model: r.model, total: r.tokens?.total || 0 })), ...this.otherStats().flatMap((x) => (x.runs || []).filter((r) => r.at > since))];
    const by = (t) => ev.filter((e) => e.type === t);
    const usage = {};
    for (const r of runs) { const k = `${r.family || "?"}/${r.model || "?"}`; usage[k] = (usage[k] || 0) + (r.total || 0); }
    const lows = by("audit").flatMap((e) => (e.lowFindings || []).map((f) => `${e.task}: ${f}`));
    const lines = [
      `## 每日摘要（${since.slice(0, 16)} 起；机器：${[this.machine, ...this.otherStats().map((x) => `${x.machine}（快照 ${String(x.at).slice(0, 16)}）`)].join("、")}）`, "",
      `| 项 | 数 |`, `| --- | --- |`,
      `| 完成（done） | ${by("done").length} |`, `| 合入 integration | ${by("merge").length} |`, `| 回退 | ${by("revert").length} |`,
      `| main 快进 | ${by("main-ff").filter((e) => e.ok).length} |`, `| 门槛失败 | ${by("fail").length} |`, `| 双派落选 | ${by("twin-lost").length} |`,
      `| 交给裁定员 | ${by("arbitrate").length} |`, `| 公共库升级单 | ${by("upgrade-open").length} |`, `| 审计（ok/issue） | ${by("audit").filter((e) => e.verdict === "ok").length}/${by("audit").filter((e) => e.verdict !== "ok").length} |`,
      `| 跳过审计（无异家族复核员） | ${by("audit-skipped").length} |`, `| 排障单 | ${by("incident").length} |`, `| 重复派单告警 | ${by("double-dispatch").length} |`, "",
      `**规则变更**：${[...by("rule-merged").map((e) => `${e.branch} 合并`), ...by("rule-reverted").map((e) => `${e.branch} 回退`), ...by("rule-rejected").map((e) => `${e.branch} 第 ${e.round} 轮否决`)].join("；") || "无"}`,
      `**通过但回执提了公共库需求（未建升级单）**：${by("needs-on-pass").map((e) => `${e.wos.join("、")}：${e.needs.join("；")}`).join("\n") || "无"}`,
      `**已知差异登记**：${by("known-diff").map((e) => `${e.wo}（${e.why}）`).join("；") || "无"}`,
      `**low 级审计发现**：${lows.length ? "\n" + lows.slice(0, 20).map((l) => `- ${l}`).join("\n") : "无"}`,
      `**按默认值执行的决定**：D2 空注释节点由比对器规范化；D3 配置数据登记豁免、代码不豁免；D4 表单页和操作页必写交互脚本，其余抽 20%；D10 按额度触发情况调并发；回执 needsFromSkeleton 只在门槛失败时建升级单，通过的页只记录。`,
      `**用量（token，含缓存读）**：${Object.entries(usage).map(([k, v]) => `${k} ${v.toLocaleString("en-US")}`).join("；") || "无"}`,
      this.pausedReason(L) ? `\n**派单已暂停**：${this.pausedReason(L)}` : "",
    ];
    if (!this.dryRun) this.ledger.tx((L2) => { L2.tick.lastDigestAt = this.iso(); });
    return { ok: true, summary: lines.filter((l) => l !== "").join("\n"), anomalies: [] };
  }
}
