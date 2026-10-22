#!/usr/bin/env node
// Scheduler entry point (docs/pipeline.md §9; formats and defaults in docs/scheduler.md). Every command prints one JSON
// line: {ok, summary, anomalies:[{issue, what, suggestedAction}]}, or {"locked":true} when another run holds the lock.
//   tick                                   one dispatcher round (the 9 steps of §9)
//   advance <任务id> [--regate]            after gate.mjs: failure rules / merge / audit sampling; --regate: back to the gate
//   digest                                 daily summary for the 「调度日志」 task
//   open-upgrade <任务id> --reason "<依据>"  public-library upgrade order; the page is suspended until it merges
//   open-rule-review <分支>                 rule change review by two reviewers of families other than the arbiter's
//   resplit <工单id> / rerecord <工单id>      re-segment the order / send it back to the recorder
//   resume                                 lift the dispatch pause after an incident (on every machine)
//   fast-lane status|adopt|login-ok|report fast-lane mode (HM-48, config fastLane.enabled): progress / create the restore tasks of
//                                          the inventory's pages / lift the recording pause after the human logged in again /
//                                          report [--write]: results/replay.json (verdict per page)
//   fast-lane retire [--dry-run]           after restore/fast-lane is merged into integration: write what the fast lane did into
//                                          the ledger so a normal tick doesn't redo it (HM-1068); release <工单id> ...: let a held one go
//   claims list                            work orders per machine, leader lease, heartbeats
//   claims reclaim --from <machine> [--wo <工单id> ...] [--force]
//                                          take over a dead machine's work orders (refused while its heartbeat is fresh)
// Common flags: --app <hmrsfw-vue dir> (or HMRSFW_APP_DIR; needed for merges), --machine <id> (or HMRSFW_MACHINE, or
// roster machines.<id>.hosts; see tools/lib/machine.mjs), --dry-run (print Multica and git writes instead of doing them).
// Fake Multica for tests: MULTICA_FAKE_STATE=<file.json>.
import { Pipeline } from "./lib/pipeline.mjs";
import { appDir } from "./app-dir.mjs";

function optApp(argv) { try { return appDir(argv); } catch (e) { if (argv.some((a) => a === "--app" || a.startsWith("--app="))) throw e; return null; } }
const VALUED = ["--app", "--reason", "--machine", "--from", "--wo"];
const positional = (argv) => argv.filter((a, i) => !a.startsWith("--") && !VALUED.includes(argv[i - 1]));
const all = (argv, name) => argv.flatMap((a, i) => (a === name && argv[i + 1] ? [argv[i + 1]] : []));
const flag = (argv, name) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : undefined; };

export function run(argv) {
  const [cmd, target] = positional(argv);
  const needsApp = ["advance", "tick"].includes(cmd);
  const app = optApp(argv);
  if (needsApp && cmd === "advance" && !app && !argv.includes("--regate")) throw new Error("advance needs the hmrsfw-vue checkout: --app <dir> or HMRSFW_APP_DIR");
  const pl = new Pipeline({ argv, appDir: app });
  switch (cmd) {
    case "tick": {
      if (process.env.HMRSFW_TICK_NO_GLOBAL_LOCK === "1") return pl.tick();
      return pl.locks.with("tick", () => pl.tick());
    }
    case "advance": {
      if (!target) throw new Error("usage: tick.mjs advance <任务id> [--regate]");
      const r = pl.advance(target, { regate: argv.includes("--regate") });
      // what the steps after the verdict noted (a fast-lane pick that conflicts, a resume that failed) is reported here too
      return pl.anomalies.length ? { ...r, anomalies: [...(r.anomalies || []), ...pl.anomalies] } : r;
    }
    case "digest": return pl.digest();
    case "open-upgrade": {
      const reason = flag(argv, "--reason");
      if (!target || !reason) throw new Error('usage: tick.mjs open-upgrade <任务id> --reason "<依据>"');
      return pl.routed("open-upgrade", { task: target, reason }, (meta) => pl.withWo(meta.workOrders || [], () => pl.openUpgrade(target, { reason, meta }), 60_000));
    }
    case "open-rule-review": if (!target) throw new Error("usage: tick.mjs open-rule-review <分支>"); return pl.locks.with(`rule-${target}`, () => pl.openRuleReview(target), 60_000);
    case "resplit": if (!target) throw new Error("usage: tick.mjs resplit <工单id>"); return pl.routed("resplit", { wo: target }, () => pl.resplit(target));
    case "rerecord": if (!target) throw new Error("usage: tick.mjs rerecord <工单id>"); return pl.routed("rerecord", { wo: target }, () => pl.rerecord(target));
    case "resume": return pl.resume();
    case "fast-lane": return pl.fastLaneCmd(target);
    case "claims": { const wo = all(argv, "--wo"); return pl.claimsCmd(target, { from: flag(argv, "--from"), keys: wo.length ? wo : null, force: argv.includes("--force") }); }
    default: throw new Error("usage: tick.mjs tick | advance <任务id> [--regate] | digest | fast-lane status|adopt|login-ok|report|retire|release | open-upgrade <任务id> --reason .. | open-rule-review <分支> | resplit <工单id> | rerecord <工单id> | resume | claims list|reclaim");
  }
}

try {
  const out = run(process.argv.slice(2));
  console.log(JSON.stringify(out.locked ? { locked: true } : { ok: out.ok !== false, summary: out.summary ?? "", anomalies: out.anomalies ?? [], ...(out.deferred ? { deferred: true } : {}), ...(out.actions?.length ? { actions: out.actions } : {}) }));
} catch (e) {
  console.log(JSON.stringify({ ok: false, summary: `error: ${e.message}`, anomalies: [{ issue: null, what: e.message, suggestedAction: "评论 [ERROR]，建排障单交给裁定员" }] }));
  process.exitCode = 1;
}
