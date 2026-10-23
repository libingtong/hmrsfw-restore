// Which machine this process runs on, and what each machine can do. Everything comes from data, never from agent names:
//   - machine ids are the `machine` values of the roster's enabled agents plus the keys of roster `machines` (e.g.
//     "mac-mini"). A machine whose agents are all `enabled: false` (a retired machine kept in the roster for its
//     history) is not one of them, so a roster with one live machine resolves to it without --machine;
//   - this process's machine: --machine <id|unique prefix> > HMRSFW_MACHINE > roster `machines.<id>.hosts` matching the
//     hostname > the only machine in the roster > unknown (id null). "*" (unsharded: one tick drives every work order,
//     as before sharding) only when asked for explicitly, so two machines can't both fall back to it by accident.
//     An unknown process (e.g. a gate agent running `advance` without HMRSFW_MACHINE) owns what its host claimed;
//     `tick` refuses to run unknown.
//   - assets per machine: roster `machines.<id>.assets` (e.g. ["login", "har", "baseline"]). A roster without a
//     `machines` section puts no asset restriction on any machine.
//   - what a stage needs: scheduler.config.json `requires` (per stage), plus the work order's own `requires` (field name
//     proposed to C, read defensively: an array applies to every stage, an object is per stage).
import os from "node:os";

export const ALL = "*";

// { all: true } also counts retired machines (only disabled agents left), e.g. to keep reading their stats snapshots.
export function machineIds(roster, { all = false } = {}) {
  const agents = all ? roster.data.agents || [] : roster.agents;
  return [...new Set([...Object.keys(roster.data.machines || {}), ...agents.map((a) => a.machine).filter(Boolean)])].sort();
}

export function resolveMachine(roster, { argv = [], env = process.env, hostname = os.hostname() } = {}) {
  const ids = machineIds(roster);
  const i = argv.indexOf("--machine");
  const want = (i >= 0 ? argv[i + 1] : argv.find((a) => a.startsWith("--machine="))?.slice(10)) || env.HMRSFW_MACHINE;
  if (want) {
    if (want === ALL) return { id: ALL, source: "flag" };
    const exact = ids.find((m) => m === want);
    if (exact) return { id: exact, source: i >= 0 ? "flag" : "env" };
    const pre = ids.filter((m) => m.toLowerCase().startsWith(want.toLowerCase()));
    if (pre.length === 1) return { id: pre[0], source: i >= 0 ? "flag" : "env" };
    throw new Error(`--machine ${want}: not one of the roster machines (${ids.join(", ")})`);
  }
  const host = hostname.toLowerCase().replace(/\.local$/, "");
  for (const [id, m] of Object.entries(roster.data.machines || {})) if ((m.hosts || []).some((h) => h.toLowerCase().replace(/\.local$/, "") === host)) return { id, source: "hostname" };
  if (ids.length === 1) return { id: ids[0], source: "single" };
  return { id: null, source: "unknown" };
}

export const hostOf = (by) => String(by || "").replace(/:\d+$/, "").toLowerCase();

export function machineAssets(roster, machine) {
  const m = roster.data.machines?.[machine];
  return m && Array.isArray(m.assets) ? new Set(m.assets) : null; // null = unrestricted
}

export function woRequires(wo, stage) {
  const r = wo?.requires;
  if (Array.isArray(r)) return r;
  if (r && typeof r === "object") return [...(r[stage] || []), ...(r.all || [])];
  return [];
}

// Can `machine` run `stage` (restore / record / gate / review / fix) for these work orders?
export function canRun(roster, cfg, machine, stage, wos = []) {
  if (machine === ALL) return true;
  const have = machineAssets(roster, machine);
  if (!have) return true;
  const need = [...(cfg.requires?.[stage] || []), ...wos.flatMap((w) => woRequires(w, stage))];
  return need.every((n) => have.has(n));
}
