#!/usr/bin/env node
// Restorer / fixer delivery (docs/pipeline.md §5, §12): commit the receipts (receipts/<工单id>.json) to the tool repo's
// integration branch, write metadata receipt.<attempt>, comment [RECEIPT] (or [FIX] with --fix), set the task to
// in_review and assign it to the gate agent from $RESTORE_STATE/agents.roster.json.
// Usage: node tools/handoff.mjs <任务id> [--fix] [--no-commit] [--dry-run]
// Prints {ok, task, gate, receipts, missing, committed} or {"locked":true}.
import { Pipeline } from "./lib/pipeline.mjs";

const argv = process.argv.slice(2);
const task = argv.find((a) => !a.startsWith("--"));
try {
  if (!task) throw new Error("usage: handoff.mjs <任务id> [--fix]");
  const out = new Pipeline({ argv }).handoff(task, { fix: argv.includes("--fix"), commit: !argv.includes("--no-commit") });
  console.log(JSON.stringify(out));
  if (out.ok === false) process.exitCode = 1;
} catch (e) {
  console.log(JSON.stringify({ ok: false, error: e.message }));
  process.exitCode = 1;
}
