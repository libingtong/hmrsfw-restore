#!/usr/bin/env node
// Scheduler ledger in $RESTORE_STATE/ledger/ (docs/pipeline.md §12):
//   runs.jsonl       one row per agent run: work orders, agent, family, machine, runtime, CLI version, model id,
//                    instructions version, tokens, result, error category
//   capability.json  per key "runtime|CLI version|model id|instructions version": first-pass / pass counts and tokens per
//                    tier; plus audit counts per "generator family|reviewer family" (miss rate)
//   agents.json      per agent: cooldown, last seen runtime/CLI version, env retry counts
//   tasks.json       work order ↔ task index the scheduler uses for idempotent creation (checked before every create)
//   tick-state.json  pause flag, merge counters, regression/bisect state, open rule changes and upgrades
//   events.jsonl     what happened (merges, reverts, done, audit findings…) — source of the daily digest
// All writes go through Ledger.tx(), which holds locks/ledger for the read-modify-write.
//
// CLI:
//   node tools/ledger.mjs seed [--from <confirm-stats.json>]   seed capability from the POC 20-page confirm (Sonnet rows)
//   node tools/ledger.mjs capability                           capability table (per key and per family)
//   node tools/ledger.mjs miss-rate                            audits, misses and audit tier per family
//   node tools/ledger.mjs record-run --task <id> --agent <id> --kind <k> --result <r> [--tier t] [--error <cat>] [--tokens n]
//   node tools/ledger.mjs show <work order id | task id>
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { P, readJson, writeJson, appendJsonl, readJsonl, Locks, stateDir } from "./lib/state.mjs";
import { Roster, loadConfig } from "./lib/roster.mjs";

export const TIERS = ["simple", "medium", "large"];
const emptyTier = () => ({ runs: 0, firstPass: 0, pass: 0, tokens: 0, fixRounds: 0 });

export class Ledger {
  constructor(paths = P(), { dryRun = false, locks } = {}) {
    this.p = paths;
    this.dryRun = dryRun;
    this.locks = locks || new Locks(paths.root, { staleMs: loadConfig(paths).lockStaleMs });
  }

  // dry-run keeps one in-memory copy so a whole run sees its own (unsaved) changes.
  read() {
    if (this.dryRun && this.mem) return this.mem;
    const L = {
      tasks: readJson(this.p.tasks, { wos: {}, tasks: {}, seq: 0 }),
      tick: readJson(this.p.tickState, { paused: false, mergesSinceRegression: 0, events: 0 }),
      agents: readJson(this.p.agents, {}),
      capability: readJson(this.p.capability, { version: 1, keys: {}, audits: {} }),
    };
    if (this.dryRun) this.mem = L;
    return L;
  }

  // fn(L) mutates L in place; may return a value. events/runs pushed onto L.newEvents / L.newRuns are appended.
  tx(fn, timeoutMs = 30_000) {
    const r = this.locks.with("ledger", () => {
      const L = this.read();
      L.newEvents = []; L.newRuns = [];
      const out = fn(L);
      if (this.dryRun) { if (L.newEvents.length) process.stderr.write(`[dry-run] ledger events: ${L.newEvents.map((e) => e.type).join(", ")}\n`); return out; }
      writeJson(this.p.tasks, L.tasks);
      writeJson(this.p.tickState, L.tick);
      writeJson(this.p.agents, L.agents);
      writeJson(this.p.capability, L.capability);
      const at = new Date().toISOString();
      for (const e of L.newEvents) appendJsonl(this.p.events, { at, ...e });
      for (const r of L.newRuns) appendJsonl(this.p.runs, { at, ...r });
      return out;
    }, timeoutMs);
    if (r && r.locked) throw new Error("ledger lock busy");
    return r;
  }

  events(sinceIso) { return readJsonl(this.p.events).filter((e) => !sinceIso || e.at > sinceIso); }
  runs(sinceIso) { return readJsonl(this.p.runs).filter((e) => !sinceIso || e.at > sinceIso); }
}

export const capKey = ({ runtime, cliVersion, model, instructionsVersion }) => [runtime || "?", cliVersion || "?", model || "?", instructionsVersion || "?"].join("|");

// Build a run row for an agent from the roster + what we know of its runtime.
export function runRow(roster, agentsState, agentId, extra) {
  const a = roster.get(agentId) || { id: agentId };
  const st = agentsState[agentId] || {};
  return {
    agent: a.id, agentName: a.name, role: a.role, family: a.family, machine: a.machine,
    runtimeId: a.runtimeId, runtime: st.runtime || null, cliVersion: st.cliVersion || null, multicaCli: st.multicaCli || null,
    model: a.model, instructionsVersion: roster.instructionsVersion(a), ...extra,
  };
}

// Count one restore attempt's outcome into capability (call once per attempt: firstPass known at first gate).
export function recordCapability(L, row, { tier, firstPass, passed, fixRounds = 0, tokens = 0, final = false }) {
  const key = capKey(row);
  const k = (L.capability.keys[key] ??= { family: row.family, model: row.model, runtime: row.runtime, cliVersion: row.cliVersion, instructionsVersion: row.instructionsVersion, tiers: {} });
  const t = (k.tiers[tier] ??= emptyTier());
  if (!final) { t.runs++; if (firstPass) t.firstPass++; t.tokens += tokens; }
  if (passed) { t.pass++; t.fixRounds += fixRounds; }
}

// Aggregate over every key of a family (both machines share it, §4 家族与路由), optionally one model.
export function familyCapability(cap, family, model, tier) {
  const agg = emptyTier();
  for (const k of Object.values(cap.keys || {})) {
    if (k.family !== family || (model && k.model !== model)) continue;
    const t = k.tiers?.[tier];
    if (!t) continue;
    for (const f of Object.keys(agg)) agg[f] += t[f] || 0;
  }
  return { ...agg, firstPassRate: agg.runs ? agg.firstPass / agg.runs : null, tokensMean: agg.runs ? agg.tokens / agg.runs : null };
}

// Sum capability tables: this machine's live one plus other machines' snapshots (claims branch stats/<machine>.json).
// Each run is counted on exactly one machine (the one that advanced it), so counters add up; the POC seed is taken once.
export function mergeCapability(...caps) {
  const out = { version: 1, keys: {}, audits: {} };
  for (const c of caps) {
    for (const [key, k] of Object.entries(c.keys || {})) {
      if (k.seed && out.keys[key]) continue;
      const o = (out.keys[key] ??= { ...k, tiers: {} });
      for (const [tier, t] of Object.entries(k.tiers || {})) { const ot = (o.tiers[tier] ??= emptyTier()); for (const f of Object.keys(ot)) ot[f] += t[f] || 0; }
    }
    for (const [k, v] of Object.entries(c.audits || {})) { const a = (out.audits[k] ??= { audits: 0, misses: 0 }); a.audits += v.audits || 0; a.misses += v.misses || 0; }
  }
  return out;
}

export function recordAudit(L, genFamily, revFamily, miss) {
  const k = `${genFamily}|${revFamily}`;
  const a = (L.capability.audits[k] ??= { audits: 0, misses: 0 });
  a.audits++; if (miss) a.misses++;
}

// Miss rate per generator family (over all reviewer families) → audit tier and sampling rate.
export function auditTier(cap, genFamily, cfg) {
  let audits = 0, misses = 0;
  for (const [k, v] of Object.entries(cap.audits || {})) if (k.startsWith(`${genFamily}|`)) { audits += v.audits; misses += v.misses; }
  const missRate = audits ? misses / audits : null;
  const A = cfg.audit;
  if (audits < A.coldAudits) return { tier: "cold", rate: A.coldRate, audits, misses, missRate };
  if (missRate > A.missRateThreshold) return { tier: "strict", rate: A.strictRate, audits, misses, missRate };
  if (audits >= A.relaxedAfter && missRate < A.relaxedMissRate) return { tier: "relaxed", rate: A.relaxedRate, audits, misses, missRate };
  return { tier: "normal", rate: A.normalRate, audits, misses, missRate };
}

export function missRates(cap) {
  return Object.entries(cap.audits || {}).map(([k, v]) => { const [gen, rev] = k.split("|"); return { gen, rev, ...v, missRate: v.audits ? v.misses / v.audits : null }; });
}

// Seed: the POC confirm (out/confirm-stats.json) ran Sonnet 5.5 on 20 pages; its rows give per-tier first-pass and token
// numbers. Seeded under a key with runtime "poc" so real runs never overwrite it; family aggregation includes it.
export function seedFromConfirm(L, stats) {
  const tierOf = (kb) => (kb < 5 ? "simple" : kb < 30 ? "medium" : "large");
  const key = capKey({ runtime: "poc-confirm", cliVersion: "poc", model: "claude-sonnet-5-5", instructionsVersion: "prompt-template-confirm" });
  const k = { family: "anthropic", model: "claude-sonnet-5-5", runtime: "poc-confirm", cliVersion: "poc", instructionsVersion: "prompt-template-confirm", seed: true, tiers: {} };
  for (const r of stats.rows.filter((r) => r.model === "claude-sonnet-5-5")) {
    const t = (k.tiers[tierOf(r.kb)] ??= emptyTier());
    t.runs++; if (r.firstPass) t.firstPass++; if (r.finalPass) { t.pass++; t.fixRounds += r.fixRounds || 0; }
    t.tokens += r.tokensCache || 0;
  }
  L.capability.keys[key] = k;
  return { key, tiers: k.tiers };
}

// ---- CLI -------------------------------------------------------------------------------------------------------------
function arg(argv, name, dflt) { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : dflt; }

function main(argv) {
  const cmd = argv[0];
  const paths = P(stateDir());
  const ledger = new Ledger(paths, { dryRun: argv.includes("--dry-run") });
  const cfg = loadConfig(paths);
  if (cmd === "seed") {
    const from = arg(argv, "--from", process.env.RESTORE_ASSETS && path.join(process.env.RESTORE_ASSETS, "out", "confirm-stats.json"));
    if (!from || !existsSync(from)) throw new Error(`${from || "confirm-stats.json"} not found (pass --from <POC out/confirm-stats.json>)`);
    return ledger.tx((L) => seedFromConfirm(L, readJson(from)));
  }
  if (cmd === "capability") {
    const { capability } = ledger.read();
    const fam = {};
    for (const k of Object.values(capability.keys)) for (const tier of TIERS) {
      const id = `${k.family}|${k.model}`;
      fam[id] ??= {};
      fam[id][tier] = familyCapability(capability, k.family, k.model, tier);
    }
    return { keys: capability.keys, byFamilyModel: fam };
  }
  if (cmd === "miss-rate") {
    const { capability } = ledger.read();
    const families = [...new Set(Roster.load(paths).agents.map((a) => a.family))];
    return { pairs: missRates(capability), tiers: Object.fromEntries(families.map((f) => [f, auditTier(capability, f, cfg)])), threshold: cfg.audit.missRateThreshold };
  }
  if (cmd === "record-run") {
    const roster = Roster.load(paths);
    return ledger.tx((L) => {
      const row = runRow(roster, L.agents, arg(argv, "--agent"), { task: arg(argv, "--task"), kind: arg(argv, "--kind", "restore"), result: arg(argv, "--result"), tier: arg(argv, "--tier"), errorCategory: arg(argv, "--error") || null, tokens: { total: Number(arg(argv, "--tokens", 0)) } });
      L.newRuns.push(row);
      return row;
    });
  }
  if (cmd === "show") {
    const id = argv[1];
    const { tasks } = ledger.read();
    return tasks.wos[id] ? { wo: tasks.wos[id], tasks: (tasks.wos[id].tasks || []).map((t) => ({ id: t, ...tasks.tasks[t] })) } : tasks.tasks[id] ? { task: tasks.tasks[id] } : { error: "not found" };
  }
  throw new Error("usage: ledger.mjs seed|capability|miss-rate|record-run|show");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { console.log(JSON.stringify(main(process.argv.slice(2)))); } catch (e) { console.log(JSON.stringify({ error: e.message })); process.exitCode = 1; }
}
