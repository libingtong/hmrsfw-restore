// Agent roster ($RESTORE_STATE/agents.roster.json) and scheduler config ($RESTORE_STATE/scheduler.config.json).
// Agent ids are never hard-coded: every script resolves roles and families from the roster. Fields this module reads
// beyond the roster's version 1 (all optional, docs/scheduler.md): agents[].instructionsVersion, agents[].enabled.
import { P, readJson } from "./state.mjs";

export const ROLES = ["dispatcher", "gate", "recorder", "fixer", "arbiter", "restorer", "restorer-core", "reviewer"];

export class Roster {
  constructor(data, cfg) {
    this.data = data;
    this.cfg = cfg;
    this.agents = (data.agents || []).filter((a) => a.enabled !== false);
    this.byId = new Map(this.agents.map((a) => [a.id, a]));
    this.escalateTo = data.escalateTo || null;
  }

  static load(paths = P()) {
    const data = readJson(paths.roster);
    if (!Array.isArray(data.agents) || !data.agents.length) throw new Error(`${paths.roster}: no agents`);
    return new Roster(data, loadConfig(paths));
  }

  get(id) { return this.byId.get(id); }
  role(role) { return this.agents.filter((a) => a.role === role); }
  family(family, role) { return this.agents.filter((a) => a.family === family && (!role || [].concat(role).includes(a.role))); }
  isRole(id, ...roles) { const a = this.get(id); return !!a && roles.includes(a.role); }
  one(role) { const a = this.role(role)[0]; if (!a) throw new Error(`roster has no ${role}`); return a; }
  instructionsVersion(a) { return a.instructionsVersion || this.cfg.instructionsVersion; }
  // "Sonnet" in the failure rules = the default page restorer model.
  isDefaultPageModel(a) { return a && a.role === "restorer" && a.model === this.cfg.defaultPageModel; }
}

// Defaults; $RESTORE_STATE/scheduler.config.json overrides any of them (shallow per section).
export const DEFAULT_CONFIG = {
  projectId: null,              // Multica project the pipeline tasks live in (required for tick)
  parentIssueId: null,          // optional parent for created tasks
  logIssueId: null,             // 「调度日志」 task; digest/summary are posted there by the dispatcher
  instructionsVersion: "2026-10-09",
  defaultPageModel: "claude-sonnet-5-5",
  cheapTier: { enabled: false, families: ["deepseek", "zhipu"], maxKb: 30, coldStartRuns: 10, minFirstPass: 0.7 },
  complex: { kb: 30, rules: 10 },
  pack: { maxKb: 5, min: 3, max: 5 },
  preQueue: 1,                  // keep running + 1 queued per agent
  maxNewPerTick: 30,
  cooldownMin: 30,
  lockStaleMin: 10,
  regressionEvery: 20,          // integration merges between full regressions
  receiptsBranch: "integration", // tool-repo branch handoff.mjs commits receipts to
  // Relative price per 1M tokens (cache-read口径), only used to order candidates; replace with real prices.
  priceFactor: { "claude-opus-5-5": 5, "claude-sonnet-5-5": 1, "deepseek-official/deepseek-flash": 0.1, "zhipuai-coding-plan/glm-5.3-flash": 0.1 },
  audit: { coldAudits: 20, coldRate: 0.5, normalRate: 0.2, relaxedRate: 0.1, relaxedAfter: 50, relaxedMissRate: 0.03, strictRate: 1, missRateThreshold: 0.1 },
  stop: { sameFailureStreak: 5, integrationFailRate: 0.1, unknownErrorsPerHour: 3, minAuditsForMissRate: 10 },
  // Cross-machine claims (tools/lib/claims.mjs): branch of the tool repo, leader lease, stats snapshot cadence, and how
  // long a silent machine must have been gone before `claims reclaim` takes its work orders without --force.
  // enabled:false turns claims off — only safe while a single tick runs anywhere.
  claims: { enabled: true, remote: "origin", branch: "claims", leaderTtlMin: 30, publishEveryMin: 10, deadAfterMin: 60 },
  // Assets a stage needs on the agent's machine (roster machines.<id>.assets). No `machines` in the roster = no limit.
  requires: { record: ["login"], gate: ["har", "baseline"] },
};

export function loadConfig(paths = P()) {
  const user = readJson(paths.config, {});
  const out = { ...DEFAULT_CONFIG };
  for (const [k, v] of Object.entries(user)) out[k] = v && typeof v === "object" && !Array.isArray(v) && DEFAULT_CONFIG[k] && typeof DEFAULT_CONFIG[k] === "object" ? { ...DEFAULT_CONFIG[k], ...v } : v;
  out.lockStaleMs = out.lockStaleMin * 60_000;
  return out;
}
