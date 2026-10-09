// Failure categories for agent runs that ended in error (docs/pipeline.md §9 step 2).
// THIS TABLE IS A GUESS. Nobody has seen yet what Multica reports when Claude Code, dsh or Opencode hit a rate limit
// or run out of quota; the patterns below are the usual provider wordings. Once real failures show up (HM-9 联调 or
// production), replace the patterns with the actual `error` / `result` text from `multica issue runs <id>` — the
// actual returned text wins over this table.
export const ERROR_CLASSES = [
  { category: "rate_limit", action: "cooldown", patterns: [/rate[ _-]?limit/i, /\b429\b/, /too many requests/i, /overloaded/i, /限流/, /请求过于频繁/] },
  { category: "quota", action: "cooldown", patterns: [/quota/i, /insufficient[ _](balance|credit|funds)/i, /billing/i, /\b402\b/, /usage limit/i, /余额不足/, /额度/] },
  { category: "env", action: "retry", patterns: [/ENOENT/, /EACCES/, /ECONNRESET|ECONNREFUSED|ETIMEDOUT/, /network/i, /timed? ?out/i, /daemon/i, /runtime (is )?offline/i, /checkout failed/i, /npm ERR/i, /spawn .* failed/i] },
];

export function classifyRunError(run) {
  const text = [run?.error, typeof run?.result === "string" ? run.result : JSON.stringify(run?.result ?? ""), run?.status_reason, run?.failure_reason].filter(Boolean).join(" ");
  for (const c of ERROR_CLASSES) if (c.patterns.some((re) => re.test(text))) return { category: c.category, action: c.action };
  return { category: "unknown", action: "report" };
}

export const FAILED_RUN_STATUSES = new Set(["failed", "error", "errored", "timeout", "timed_out"]);
