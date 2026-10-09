#!/usr/bin/env node
// Test helper: one claim round from its own clone, as a machine's tick would do it.
// Usage: node claim-worker.mjs <clone dir> <machine> <key>...   → prints {won, lost, retries}
import { Claims } from "../lib/claims.mjs";

const [repo, machine, ...keys] = process.argv.slice(2);
try {
  const c = new Claims(repo, { backoffMs: 20, maxTries: 30 });
  console.log(JSON.stringify(c.claim(keys, machine, "test")));
} catch (e) {
  console.log(JSON.stringify({ error: e.message }));
  process.exitCode = 1;
}
