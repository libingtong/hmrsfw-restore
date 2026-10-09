#!/usr/bin/env node
// Known-difference register (docs/pipeline.md §15.2 第 3 条): a difference caused by the original code itself, with
// evidence in the original chunk. Only the arbiter may add entries (checked against MULTICA_AGENT_ID and the roster).
// Stored in $RESTORE_STATE/known-diffs/<工单 slug>.json as an array; gate.mjs reads it, the daily digest lists it.
// Usage: node tools/known-diff.mjs add <工单id> --evidence "<原 chunk 文件:位置>" --why "<一句话>" [--diff "<门槛 diff 条目>"]
//        node tools/known-diff.mjs list [<工单id>]
import path from "node:path";
import { readdirSync } from "node:fs";
import { P, readJson, writeJson, Locks, stateDir } from "./lib/state.mjs";
import { Roster } from "./lib/roster.mjs";
import { Ledger } from "./ledger.mjs";
import { slug } from "./lib/pipeline.mjs";

const argv = process.argv.slice(2);
const flag = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : undefined; };
const pos = argv.filter((a, i) => !a.startsWith("--") && !["--evidence", "--why", "--diff"].includes(argv[i - 1]));

try {
  const paths = P(stateDir());
  const [cmd, wo] = pos;
  const file = (w) => path.join(paths.knownDiffs, `${slug(w)}.json`);
  if (cmd === "add") {
    const evidence = flag("--evidence"), why = flag("--why");
    if (!wo || !evidence || !why) throw new Error('usage: known-diff.mjs add <工单id> --evidence "<原 chunk 文件:位置>" --why "<一句话>"');
    const roster = Roster.load(paths);
    const me = process.env.MULTICA_AGENT_ID;
    if (!roster.isRole(me, "arbiter")) throw new Error("only the arbiter may register known differences (MULTICA_AGENT_ID is not an arbiter in the roster)");
    if (!/\S+:\S+/.test(evidence)) throw new Error("--evidence must point into the original chunk: <file>:<position>");
    const entry = { wo, evidence, why, diff: flag("--diff") || null, by: me, at: new Date().toISOString() };
    new Locks(paths.root).with(`kd-${slug(wo)}`, () => { const list = readJson(file(wo), []); list.push(entry); writeJson(file(wo), list); }, 30_000);
    new Ledger(paths).tx((L) => L.newEvents.push({ type: "known-diff", wo, why, evidence }));
    console.log(JSON.stringify({ ok: true, entry }));
  } else if (cmd === "list") {
    const files = wo ? [file(wo)] : (() => { try { return readdirSync(paths.knownDiffs).map((f) => path.join(paths.knownDiffs, f)); } catch { return []; } })();
    console.log(JSON.stringify({ ok: true, entries: files.flatMap((f) => readJson(f, [])) }));
  } else throw new Error("usage: known-diff.mjs add <工单id> --evidence .. --why .. | list [<工单id>]");
} catch (e) {
  console.log(JSON.stringify({ ok: false, error: e.message }));
  process.exitCode = 1;
}
