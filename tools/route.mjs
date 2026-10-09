#!/usr/bin/env node
// Routing for one work order (docs/pipeline.md §8, v3.1/v3.3 补充):
//   - entry / shared orders and public-library upgrades → restorer-core (还原-Opus);
//   - pages → the default page model (还原-Sonnet) on either machine;
//   - cheap tier (DeepSeek, GLM) only when cfg.cheapTier.enabled, the page is < 30KB and not complex
//     (complex = ≥ 30KB or ≥ 10 validation rules). While either cheap family has fewer than coldStartRuns finished runs in
//     the page's tier, the order goes to both (dual; branches -d / -g) — or, when the roster has only one cheap family,
//     to that family alone (single; Sonnet if it has no free slot); afterwards to the cheapest family whose first-pass
//     rate ≥ minFirstPass, Sonnet last;
//   - agents of the same family on both machines share capability data (ledger.familyCapability) and each has its own
//     free slots: maxConcurrent + preQueue − active tasks (pre-queue = running + 1).
// Usage: node tools/route.mjs <工单id> [--kind restore|upgrade] [--offline] [--app <dir>]
//   → {candidates:[{family, agents:[...], expectedCost, reason}], features, dual}
import path from "node:path";
import { fileURLToPath } from "node:url";
import { P, stateDir } from "./lib/state.mjs";
import { Roster } from "./lib/roster.mjs";
import { Ledger, familyCapability } from "./ledger.mjs";
import { loadWorkOrder, features, isCore } from "./lib/workorders.mjs";
import { Multica } from "./lib/multica.mjs";

export const BRANCH_SUFFIX = { deepseek: "-d", zhipu: "-g" };
export const ACTIVE = new Set(["todo", "in_progress"]);

// Active work per agent: tasks assigned to it that are queued or running.
export function agentLoad(issues) {
  const load = new Map();
  for (const i of issues) if (i.assignee_id && ACTIVE.has(i.status)) load.set(i.assignee_id, (load.get(i.assignee_id) || 0) + 1);
  return load;
}

export function freeSlots(a, ctx) {
  const st = ctx.agentsState?.[a.id] || {};
  if (st.cooldownUntil && st.cooldownUntil > (ctx.now ?? Date.now())) return 0;
  return Math.max(0, a.maxConcurrent + ctx.cfg.preQueue - (ctx.load?.get(a.id) || 0));
}

const agentView = (a, ctx) => ({ id: a.id, name: a.name, machine: a.machine, model: a.model, free: freeSlots(a, ctx), cooldownUntil: ctx.agentsState?.[a.id]?.cooldownUntil || null });

export function expectedCost(stats, model, cfg) {
  if (!stats || stats.tokensMean == null) return null;
  const fp = stats.firstPassRate ?? 0.5;
  return Math.round(stats.tokensMean * (cfg.priceFactor[model] ?? 1) * (1 + (1 - fp)));
}

export function route(wo, ctx, { kind = "restore", exclude = [] } = {}) {
  const { roster, cfg, capability } = ctx;
  const f = features(wo, cfg, ctx.toolRoot);
  const cand = (family, agents, reason, model) => {
    const stats = familyCapability(capability, family, model, f.tier);
    return { family, model, agents: agents.filter((a) => !exclude.includes(a.id)).map((a) => agentView(a, ctx)).sort((x, y) => y.free - x.free), expectedCost: expectedCost(stats, model, cfg), firstPassRate: stats.firstPassRate, runs: stats.runs, reason };
  };
  if (kind === "upgrade" || isCore(wo)) {
    const core = roster.role("restorer-core");
    return { candidates: [cand(core[0]?.family || "anthropic", core, kind === "upgrade" ? "公共库升级单 → 还原-Opus" : `${wo.type} → 还原-Opus`, core[0]?.model)], features: f, dual: false };
  }
  const def = roster.agents.filter((a) => a.role === "restorer" && a.model === cfg.defaultPageModel);
  const defCand = (reason) => cand(def[0]?.family || "anthropic", def, reason, cfg.defaultPageModel);
  const ct = cfg.cheapTier;
  if (!ct.enabled) return { candidates: [defCand("页面默认 Sonnet（便宜档未启用）")], features: f, dual: false };
  if (f.kb >= ct.maxKb || f.complex) return { candidates: [defCand(f.complex ? `复杂页（${f.kb}KB，校验规则 ${f.rules}）→ Sonnet` : `≥ ${ct.maxKb}KB → Sonnet`)], features: f, dual: false };
  const cheap = ct.families.map((fam) => { const ag = roster.family(fam, "restorer"); return ag.length ? cand(fam, ag, "", ag[0].model) : null; }).filter(Boolean);
  if (!cheap.length) return { candidates: [defCand("名册里没有便宜档还原员")], features: f, dual: false };
  // Cold start counts only families with an agent usable here (not excluded, e.g. by machine).
  const usable = cheap.filter((c) => c.agents.length);
  const cold = usable.filter((c) => c.runs < ct.coldStartRuns);
  if (cold.length && usable.length >= 2) {
    usable.forEach((c) => (c.reason = `冷启动（${f.tier} 档 ${c.runs}/${ct.coldStartRuns} 次）双派`));
    return { candidates: [...usable.slice(0, 2), defCand("便宜档没有空位时回退 Sonnet")], features: f, dual: true };
  }
  // Only one cheap family left (others disabled, not configured or not on this machine): there is no twin, so the cold
  // family gets the page alone; without this its first-pass rate stays empty and it never passes minFirstPass.
  if (cold.length) {
    const [c] = usable;
    c.reason = `冷启动（${f.tier} 档 ${c.runs}/${ct.coldStartRuns} 次）单派（便宜档只有 ${c.family} 一个家族）`;
    return { candidates: [c, defCand("便宜档没有空位时回退 Sonnet")], features: f, dual: false };
  }
  const ok = cheap.filter((c) => (c.firstPassRate ?? 0) >= ct.minFirstPass).sort((a, b) => (a.expectedCost ?? Infinity) - (b.expectedCost ?? Infinity));
  ok.forEach((c) => (c.reason = `便宜档：首通率 ${(c.firstPassRate * 100).toFixed(0)}%，预计 ${c.expectedCost}`));
  return { candidates: [...ok, defCand(ok.length ? "便宜档没有空位时回退 Sonnet" : `便宜档首通率低于 ${ct.minFirstPass * 100}% → Sonnet`)], features: f, dual: false };
}

// Choose concrete agents from a route result. dual → one agent from each of the first two candidates, else the first
// candidate with a free agent. Returns [{agent, family, suffix}] or [] when nobody has a free slot.
export function pick(r) {
  const top = (c) => c.agents.find((a) => a.free > 0);
  if (r.dual) {
    const [a, b] = r.candidates;
    const ta = top(a), tb = top(b);
    if (ta && tb) return [{ agent: ta, family: a.family, suffix: BRANCH_SUFFIX[a.family] || `-${a.family[0]}` }, { agent: tb, family: b.family, suffix: BRANCH_SUFFIX[b.family] || `-${b.family[0]}` }];
    const rest = r.candidates.slice(2);
    for (const c of rest) { const t = top(c); if (t) return [{ agent: t, family: c.family, suffix: "" }]; }
    return [];
  }
  for (const c of r.candidates) { const t = top(c); if (t) return [{ agent: t, family: c.family, suffix: "" }]; }
  return [];
}

function main(argv) {
  const woId = argv.find((a, i) => !a.startsWith("--") && !["--kind", "--app"].includes(argv[i - 1]));
  if (!woId) throw new Error("usage: route.mjs <工单id> [--kind restore|upgrade] [--offline]");
  const paths = P(stateDir());
  const roster = Roster.load(paths);
  const ledger = new Ledger(paths);
  const L = ledger.read();
  const wo = loadWorkOrder(woId);
  if (!wo) throw new Error(`work order not found: ${woId}`);
  let load = new Map();
  if (!argv.includes("--offline") && roster.cfg.projectId) load = agentLoad(Multica.fromArgv(argv).listIssues({ project: roster.cfg.projectId }));
  const i = argv.indexOf("--kind");
  return route(wo, { roster, cfg: roster.cfg, capability: L.capability, agentsState: L.agents, load }, { kind: i >= 0 ? argv[i + 1] : "restore" });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { console.log(JSON.stringify(main(process.argv.slice(2)))); } catch (e) { console.log(JSON.stringify({ error: e.message })); process.exitCode = 1; }
}
