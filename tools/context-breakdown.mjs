// Attribute an agent's context tokens to what was loaded: the initial context (system prompt + tool definitions + task
// prompt) and each tool result (by file category). Uses the growth of (input + cache_read + cache_creation) between
// consecutive API calls. Only numbers and file categories are printed, never content.
// Usage: node tools/context-breakdown.mjs <label>=<transcript.jsonl> ...
import { readFileSync, writeFileSync } from "node:fs";
const cat = (p = "") => {
  if (/prompt-template\.md/.test(p)) return "指令模板";
  if (/vue-exports/.test(p)) return "Vue 改名表";
  if (/shim-map/.test(p)) return "入口包对照表";
  if (/out\/hints\//.test(p)) return "导入提示表";
  if (/legacy-dist\/.*\.css/.test(p)) return "原 CSS";
  if (/legacy-dist\//.test(p)) return "原 chunk";
  if (/wakaru-out\//.test(p)) return "wakaru 产物";
  if (/apps\/[^/]+\/src\/(legacy|api|utils|shared)\//.test(p)) return "公共库文件";
  if (/restore-[ab]\/|apps\/[^/]+\/src\/views\//.test(p)) return "自己的输出";
  return "其他";
};
const rows = [];
for (const arg of process.argv.slice(2)) {
  const [label, file] = arg.split("=");
  const lines = readFileSync(file, "utf8").split("\n").filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  const pendingTool = new Map(); // tool_use id -> category
  const calls = []; // { ctx, out, cats: [categories of tool results added before this call] }
  let resultsSince = [];
  for (const o of lines) {
    const msg = o.message; if (!msg) continue;
    if (msg.role === "assistant" && msg.usage) {
      const u = msg.usage; const ctx = (u.input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0);
      // merge streamed duplicates of the same API call (same ctx)
      if (calls.length && calls[calls.length - 1].ctx === ctx) { calls[calls.length - 1].out = Math.max(calls[calls.length - 1].out, u.output_tokens ?? 0); }
      else { calls.push({ ctx, out: u.output_tokens ?? 0, cats: resultsSince }); resultsSince = []; }
      for (const c of Array.isArray(msg.content) ? msg.content : []) if (c.type === "tool_use") {
        const inp = c.input || {}; const p = inp.file_path || inp.path || inp.command || "";
        pendingTool.set(c.id, c.name === "Read" || c.name === "Grep" ? cat(p) : c.name === "Bash" ? (/(legacy-dist|wakaru-out|out\/hints|vue-exports|shim-map)/.test(p) ? cat((p.match(/(legacy-dist\S+|wakaru-out\S+|out\/hints\S+|out\/vue-exports\S+|out\/shim-map\S+)/) || [""])[0]) : "命令输出") : c.name === "Write" || c.name === "Edit" ? "写文件回显" : "其他");
      }
    }
    if (msg.role === "user" && Array.isArray(msg.content)) for (const c of msg.content) if (c.type === "tool_result") resultsSince.push(pendingTool.get(c.tool_use_id) ?? "其他");
  }
  const by = {};
  for (let i = 1; i < calls.length; i++) {
    const delta = calls[i].ctx - calls[i - 1].ctx - calls[i - 1].out; // tokens added by tool results (+ small overhead)
    const cs = calls[i].cats.length ? calls[i].cats : ["其他"];
    for (const c of cs) by[c] = (by[c] ?? 0) + Math.max(0, delta) / cs.length;
  }
  const outTotal = calls.reduce((a, c) => a + c.out, 0);
  rows.push({ label, calls: calls.length, initial: calls[0]?.ctx ?? 0, final: calls.at(-1)?.ctx ?? 0, output: outTotal, by: Object.fromEntries(Object.entries(by).map(([k, v]) => [k, Math.round(v)])) });
}
writeFileSync("out/context-breakdown.json", JSON.stringify(rows, null, 1));
for (const r of rows) console.log(JSON.stringify(r));
