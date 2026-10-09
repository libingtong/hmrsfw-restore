// Sum token usage from a subagent JSONL transcript (only numbers are extracted; content is never printed).
// Usage: node tools/agent-usage.mjs <transcript.jsonl> [label]
import { readFileSync } from "node:fs";
const [file, label = ""] = process.argv.slice(2);
const sum = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, calls: 0, toolUses: 0 };
for (const line of readFileSync(file, "utf8").split("\n")) {
  if (!line.trim()) continue;
  let o; try { o = JSON.parse(line); } catch { continue; }
  const u = o?.message?.usage ?? o?.usage;
  if (u && typeof u.output_tokens === "number") { sum.calls++; sum.input += u.input_tokens ?? 0; sum.output += u.output_tokens ?? 0; sum.cacheRead += u.cache_read_input_tokens ?? 0; sum.cacheWrite += u.cache_creation_input_tokens ?? 0; }
  const content = o?.message?.content; if (Array.isArray(content)) sum.toolUses += content.filter((c) => c?.type === "tool_use").length;
}
sum.total = sum.input + sum.output + sum.cacheRead + sum.cacheWrite;
console.log(JSON.stringify({ label, ...sum }));
