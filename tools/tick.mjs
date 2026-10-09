#!/usr/bin/env node
// Scheduler entry point (docs/pipeline.md §9; formats and defaults in docs/scheduler.md). Every command prints one JSON
// line: {ok, summary, anomalies:[{issue, what, suggestedAction}]}, or {"locked":true} when another run holds the lock.
//   tick                                   one dispatcher round (the 9 steps of §9)
//   advance <任务id> [--regate]            after gate.mjs: failure rules / merge / audit sampling; --regate: back to the gate
//   digest                                 daily summary for the 「调度日志」 task
//   open-upgrade <任务id> --reason "<依据>"  public-library upgrade order; the page is suspended until it merges
//   open-rule-review <分支>                 rule change review by two reviewers of families other than the arbiter's
//   resplit <工单id> / rerecord <工单id>      re-segment the order / send it back to the recorder
//   resume                                 lift the dispatch pause after an incident
// Common flags: --app <hmrsfw-vue dir> (or HMRSFW_APP_DIR; needed for merges), --dry-run (print Multica and git writes
// instead of doing them). Fake Multica for tests: MULTICA_FAKE_STATE=<file.json>.
import { Pipeline } from "./lib/pipeline.mjs";
import { appDir } from "./app-dir.mjs";

function optApp(argv) { try { return appDir(argv); } catch (e) { if (argv.some((a) => a === "--app" || a.startsWith("--app="))) throw e; return null; } }
const positional = (argv) => argv.filter((a, i) => !a.startsWith("--") && !["--app", "--reason"].includes(argv[i - 1]));
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
    case "advance": if (!target) throw new Error("usage: tick.mjs advance <任务id> [--regate]"); return pl.advance(target, { regate: argv.includes("--regate") });
    case "digest": return pl.digest();
    case "open-upgrade": {
      const reason = flag(argv, "--reason");
      if (!target || !reason) throw new Error('usage: tick.mjs open-upgrade <任务id> --reason "<依据>"');
      const meta = pl.meta(target);
      const r = pl.withWo(meta.workOrders || [], () => pl.openUpgrade(target, { reason, meta }), 60_000);
      return r;
    }
    case "open-rule-review": if (!target) throw new Error("usage: tick.mjs open-rule-review <分支>"); return pl.locks.with(`rule-${target}`, () => pl.openRuleReview(target), 60_000);
    case "resplit": if (!target) throw new Error("usage: tick.mjs resplit <工单id>"); return pl.resplit(target);
    case "rerecord": if (!target) throw new Error("usage: tick.mjs rerecord <工单id>"); return pl.rerecord(target);
    case "resume": return pl.resume();
    default: throw new Error("usage: tick.mjs tick | advance <任务id> [--regate] | digest | open-upgrade <任务id> --reason .. | open-rule-review <分支> | resplit <工单id> | rerecord <工单id> | resume");
  }
}

try {
  const out = run(process.argv.slice(2));
  console.log(JSON.stringify(out.locked ? { locked: true } : { ok: out.ok !== false, summary: out.summary ?? "", anomalies: out.anomalies ?? [], ...(out.actions?.length ? { actions: out.actions } : {}) }));
} catch (e) {
  console.log(JSON.stringify({ ok: false, summary: `error: ${e.message}`, anomalies: [{ issue: null, what: e.message, suggestedAction: "评论 [ERROR]，建排障单交给裁定员" }] }));
  process.exitCode = 1;
}
