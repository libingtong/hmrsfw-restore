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

// The gate's own errors (HM-1306): a gate round that ended without a verdict — gate.mjs printed {error}, or the gate
// agent stopped before it (checkout, setup) and commented `[GATE] ERROR`. "environment" is what goes away by itself
// on a later try (an overloaded machine, the network, a full disk, a broken checkout): the scheduler re-gates it with
// backoff. Anything else (a missing key, a tool bug) is "other" and goes to the arbiter at once. The patterns are the
// texts seen on HM-264/290/349/369 (10-22/10-23) plus the usual Playwright / git / Node wordings.
export const GATE_ENV_PATTERNS = [
  /\bTimeout \d+ ?ms exceeded/i, /\b(screenshot|goto|waitFor\w*|evaluate|launch)\b.{0,40}(timed? ?out|超时)/i, /超时 ?\d+ ?ms/, /not judged within .*--page-timeout/,
  /gate ended without a result/, /Target (page, context or browser )?(has been )?closed/i, /browser has been closed/i,
  /SSL_ERROR_SYSCALL|github\.com\S{0,20}:443\b|port 443\b|Could not resolve host|unable to access 'https?:|Connection (reset|timed out)|ECONNRESET|ETIMEDOUT|EAI_AGAIN|ENOTFOUND|network (error|is unreachable)|网络(错误|异常|不可用|超时|中断)/i,
  /ENOSPC|no space left|disk (is )?full|磁盘(已)?满|空间不足/i,
  /EMFILE|ENFILE/,
  /repo\/checkout|checkout.{0,12}(failed|timed? ?out|超时|失败)|检出.{0,6}(超时|失败|残缺|不完整)|index\.lock|context deadline exceeded|daemon.{0,40}(timed? ?out|超时|deadline|offline|unreachable|not reachable)/i,
  // interactRef / fetchBranches (gate.mjs): three retries of a bare `git fetch`, then this wording — the same GitHub
  // flakiness as the SSL_ERROR_SYSCALL/443 case above, just without those words (HM-1352).
  /git fetch of .+ failed \d+ times/i,
];

export function classifyGateError(text) {
  return GATE_ENV_PATTERNS.some((re) => re.test(String(text ?? ""))) ? "environment" : "other";
}
