// Interaction scripts (docs/pipeline.md §12): tests/interact/<工单id>.json is a JSON array of steps, same meaning as the
// POC's tools/interact-scripts.mjs, so recording (record-page.mjs), the original baseline and the gate run identical actions.
//   {"fill": [placeholder, value]}       fill the first input whose placeholder is exactly `placeholder`
//   {"click": text}                      click the last visible button/link/tab/li/span/div whose whole text is `text`
//                                        (whitespace between characters ignored: antd writes "查 询")
//   {"clickSel": css}                    click the last visible element matching `css`
//   {"press": key}                       keyboard press (POC extension, e.g. "Enter")
//   {"wait": ms}                         alone: just wait; with an action: wait after it (default 1200 ms)
//   "optional": true                     a missing target is noted as "absent" instead of failing the step
// Fill values must be obvious test values ("测试", "Tst-0001"); validate() rejects anything that looks like a phone
// number, ID number or e-mail address.
// Library:  import { loadScript, validate, runStep, runStepRetry, actionSent, describeStep, apiTracker, settle } from "./interact.mjs";
// CLI:      node tools/interact.mjs --check [files...]   (default: every tests/interact/*.json) → {ok, files:[{file, steps, errors}]}
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const scriptPath = (id) => path.join(ROOT, "tests/interact", `${id}.json`);
const ACTIONS = ["fill", "click", "clickSel", "press"];
const KEYS = new Set([...ACTIONS, "wait", "optional"]);
const PERSONAL = [["mainland-mobile", /(?<!\d)1[3-9]\d{9}(?!\d)/], ["id-card", /(?<!\d)\d{17}[\dXx](?!\d)/], ["email", /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/]];

// → list of error strings (empty = valid)
export function validate(steps) {
  if (!Array.isArray(steps)) return ["script must be a JSON array of steps"];
  const errors = [];
  steps.forEach((s, i) => {
    if (!s || typeof s !== "object" || Array.isArray(s)) return errors.push(`step ${i}: not an object`);
    const extra = Object.keys(s).filter((k) => !KEYS.has(k));
    if (extra.length) errors.push(`step ${i}: unknown key ${extra.join(",")}`);
    const acts = ACTIONS.filter((k) => k in s);
    if (acts.length > 1) errors.push(`step ${i}: more than one action (${acts.join(",")})`);
    if (!acts.length && !("wait" in s)) errors.push(`step ${i}: no action and no wait`);
    if ("fill" in s) {
      if (!Array.isArray(s.fill) || s.fill.length !== 2 || !s.fill.every((x) => typeof x === "string") || !s.fill[0]) errors.push(`step ${i}: fill must be [placeholder, value]`);
      else for (const [rule, re] of PERSONAL) if (re.test(s.fill[1])) errors.push(`step ${i}: fill value looks like a real ${rule}; use an obvious test value`);
    }
    for (const k of ["click", "clickSel", "press"]) if (k in s && (typeof s[k] !== "string" || !s[k])) errors.push(`step ${i}: ${k} must be a non-empty string`);
    if ("wait" in s && !(Number.isInteger(s.wait) && s.wait >= 0 && s.wait <= 60000)) errors.push(`step ${i}: wait must be an integer 0..60000`);
    if ("optional" in s && typeof s.optional !== "boolean") errors.push(`step ${i}: optional must be true/false`);
  });
  return errors;
}

// → steps array, or null when the file does not exist; throws on invalid JSON or an invalid script
export function loadScript(file) {
  if (!existsSync(file)) return null;
  const steps = JSON.parse(readFileSync(file, "utf8"));
  const errors = validate(steps);
  if (errors.length) throw Object.assign(new Error(`${path.relative(ROOT, file)}: ${errors.join("; ")}`), { userFacing: true });
  return steps;
}

// Step as it may appear in reports, logs and comments: fill values are replaced.
export const describeStep = (s) => (s.fill ? { ...s, fill: [s.fill[0], "<test value>"] } : s);

const looseText = (t) => new RegExp("^\\s*" + [...t].map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("\\s*") + "\\s*$");

// Runs one step on a Playwright page. → null, or "absent" for a missing optional target. Throws when a required target is missing.
export async function runStep(page, s) {
  if (s.fill) await page.getByPlaceholder(s.fill[0], { exact: true }).first().fill(s.fill[1], { timeout: 5000 });
  else if (s.click || s.clickSel) {
    const all = s.click ? page.locator("button, a, .ant-tabs-tab, li, span, div").filter({ hasText: looseText(s.click) }) : page.locator(s.clickSel);
    let target = null;
    for (const h of await all.all()) if (await h.isVisible()) target = h; // last visible match = innermost element
    if (!target) { if (s.optional) return "absent"; throw new Error("no visible target for " + (s.click ?? s.clickSel)); }
    await target.click({ timeout: 5000 });
  } else if (s.press) await page.keyboard.press(s.press);
  await page.waitForTimeout(s.wait ?? 1200);
  return null;
}

// Playwright logs "performing <action> action" right before it sends the input events and "<action> action done" after
// them. A timeout after that point (the click handler keeps the main thread busy on a loaded machine) means the action
// already reached the page: doing it again would click twice, and the second click usually lands on what the first one
// opened (a modal mask "intercepts pointer events") and fails the step. Same rule as tools/gate/replay.mjs (HM-245).
const ACTION_SENT = /\bperforming \w+ action\b|\b\w+ action done\b/;
export const actionSent = (e) => ACTION_SENT.test(String(e?.message ?? ""));
export const NOT_REPEATED = "timed out after the action was sent; not repeated";

// runStep with one retry when Playwright reports an action timeout BEFORE the action was sent (target not actionable
// yet, e.g. under load), so retrying cannot submit twice. A timeout after the action was sent is not repeated: the step
// gets its usual wait and the note NOT_REPEATED. "no visible target" is a script error and is not retried.
// → { note, retried }
export async function runStepRetry(page, s, beforeRetry = async () => {}) {
  try { return { note: await runStep(page, s), retried: false }; }
  catch (e) {
    if (!/Timeout \d+ms exceeded/.test(e.message)) throw e;
    if (actionSent(e)) { await page.waitForTimeout(s.wait ?? 1200); return { note: NOT_REPEATED, retried: false }; }
    await beforeRetry();
    return { note: await runStep(page, s), retried: true };
  }
}

// Counts in-flight /xf-api/ requests of a browser context, so a run can wait until the page's requests have settled.
export function apiTracker(context, match = (u) => /\/xf-api\//.test(u)) {
  const live = new Set();
  context.on("request", (r) => { if (match(r.url())) live.add(r); });
  const done = (r) => live.delete(r);
  context.on("requestfinished", done);
  context.on("requestfailed", done);
  return {
    pending: () => live.size,
    // resolves when nothing has been in flight for `quietMs`, or after `maxMs`
    async idle(page, { quietMs = 800, maxMs = 15000 } = {}) {
      const t0 = Date.now(); let quietSince = live.size ? 0 : Date.now();
      while (Date.now() - t0 < maxMs) {
        await page.waitForTimeout(200);
        if (live.size) quietSince = 0; else if (!quietSince) quietSince = Date.now(); else if (Date.now() - quietSince >= quietMs) return true;
      }
      return false;
    },
  };
}

// Waits for the page to render: body text length unchanged for 3 checks 1 s apart and no API request in flight (max `maxMs`).
export async function settle(page, tracker, { maxMs = 40000, minMs = 3000 } = {}) {
  let last = -1, stable = 0; const t0 = Date.now();
  while (Date.now() - t0 < maxMs) {
    await page.waitForTimeout(1000);
    const len = await page.evaluate(() => (document.body ? document.body.innerText.length : 0)).catch(() => -1);
    stable = len === last && (!tracker || tracker.pending() === 0) ? stable + 1 : 0; last = len;
    if (stable >= 3 && Date.now() - t0 >= minMs) return last;
  }
  return last;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2).filter((a) => a !== "--check");
  const dir = path.join(ROOT, "tests/interact");
  const files = args.length ? args.map((f) => path.resolve(f)) : existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".json")).sort().map((f) => path.join(dir, f)) : [];
  const out = files.map((f) => {
    try { const steps = JSON.parse(readFileSync(f, "utf8")); return { file: path.relative(ROOT, f), steps: Array.isArray(steps) ? steps.length : 0, errors: validate(steps) }; }
    catch (e) { return { file: path.relative(ROOT, f), steps: 0, errors: [String(e.message)] }; }
  });
  const ok = out.every((x) => !x.errors.length);
  console.log(JSON.stringify({ ok, files: out }));
  process.exitCode = ok ? 0 : 1;
}
