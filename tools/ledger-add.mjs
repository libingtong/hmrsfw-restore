// Append one agent run to out/confirm-ledger.json with harness usage + transcript usage (numbers only).
// Usage: node tools/ledger-add.mjs <ticket> <group S|H|shared> <kind restore|fix|shared> <model id> <subagentTokens> <toolUses> <durationMs> <agentId>
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
const [ticket, group, kind, model, st, tu, ms, agentId] = process.argv.slice(2);
const T = "/private/tmp/claude-501/-Users-dylan-Projects-ai-website-cloner/94b1c3b1-5c4f-472c-bcb8-c83786798e27/tasks/";
let t = {}; try { t = JSON.parse(execSync(`node tools/agent-usage.mjs ${T}${agentId}.output`).toString()); } catch {}
const L = JSON.parse(readFileSync("out/confirm-ledger.json", "utf8"));
L.rounds.push({ ticket, group, kind, model, subagentTokens: Number(st), toolUses: Number(tu), durationMs: Number(ms), transcriptTotal: t.total ?? null, input: t.input ?? null, output: t.output ?? null, cacheRead: t.cacheRead ?? null, cacheWrite: t.cacheWrite ?? null, at: new Date().toISOString() });
writeFileSync("out/confirm-ledger.json", JSON.stringify(L, null, 1));
console.log("ledger", L.rounds.length, ticket, group, kind, model, st, t.total);
