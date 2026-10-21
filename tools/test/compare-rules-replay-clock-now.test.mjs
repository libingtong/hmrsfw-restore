// node --test tools/test/compare-rules-replay-clock-now.test.mjs
// replay-clock-now (HM-1021): "now" printed to the second is the replay clock's reading (start of the HAR's recording
// minute + the time the run took to get there); only date-times inside the clock window lose their digits, the format
// and everything else stay compared, and both sides use the baseline's clock.
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { ROOT } from "../gate/common.mjs";
import { loadRules, normHtml, normNow } from "../gate/rules.mjs";
import { compareRuns, unstableKeys } from "../gate/compare.mjs";

const rules = loadRules(path.join(ROOT, "rules/compare"));
const CST = -480; // Asia/Shanghai getTimezoneOffset
const clock = { start: Date.parse("2026-10-21T14:41:00Z"), tzOffset: CST }; // 22:41:00 local
const el = (t, a, c = []) => ({ t, a, c });
const input = (title) => ({ tree: el("div", [["class", "box"]], [el("input", [["id", "basic_time"], ["title", title]])]), ltgt: true });
const html = (title, c = clock) => normNow(normHtml(input(title), rules), rules, c);

test("replay-clock-now: seconds of the replay clock's now are not compared", () => {
  assert.ok(rules.ids.includes("replay-clock-now"));
  assert.equal(html("2026-10-21 22:41:05"), html("2026-10-21 22:41:01"));
  assert.equal(html("2026-10-21 22:42:30"), html("2026-10-21 22:41:59")); // a run crossing the minute
  assert.equal(normNow("发布于 2026/10/21 22:41:07", rules, clock), "发布于 ⟦now ####/##/## ##:##:##⟧");
  assert.equal(normNow("2026-10-21T22:41:07", rules, clock), "⟦now ####-##-##T##:##:##⟧");
});

test("replay-clock-now: format, other date-times and a missing clock are still compared", () => {
  assert.notEqual(html("2026-10-21 22:41:05"), html("2026/10/21 22:41:05")); // separators
  assert.notEqual(html("2026-10-21 22:41:05"), html("2026-10-21 22:41")); // precision
  assert.notEqual(html("2026-10-21 22:40:59"), html("2026-10-21 22:40:58")); // before the clock start: data
  assert.notEqual(html("2026-10-21 22:56:00"), html("2026-10-21 22:56:01")); // past the window
  assert.notEqual(html("2026-10-20 22:41:05"), html("2026-10-20 22:41:01")); // yesterday
  assert.notEqual(html("2026-10-21 14:41:05"), html("2026-10-21 14:41:01")); // UTC wall time, not the page's local time
  assert.notEqual(html("2026-10-21 22:41:05", null), html("2026-10-21 22:41:01", null)); // baseline without a clock
  assert.notEqual(html("2026-10-21 22:41:05", { start: clock.start, tzOffset: null }), html("2026-10-21 22:41:01", { start: clock.start, tzOffset: null }));
});

// one run as runPage returns it, load phase only
const run = (title, c = clock) => ({ clock: c, errors: [], load: { overlay: { modals: [], toasts: [] }, requests: [], opened: [], candidates: [{ ...input(title), text: "发布时间", cls: "box" }] } });
const base = (a, b, c) => ({ runs: [run(a, c), run(b, c)], shell: { requests: [], toasts: [] } });

test("replay-clock-now: baseline runs and the restored run compare through the baseline's clock", () => {
  assert.deepEqual(unstableKeys(run("2026-10-21 22:41:05"), run("2026-10-21 22:41:01"), { rules, site: "usercenter", shell: new Set(), shellToasts: [] }), []);
  const restCands = (title) => ({ ...run(title, null), load: { ...run(title).load, candidates: [{ ...input(title), text: "发布时间", cls: "box" }] } });
  assert.ok(compareRuns(base("2026-10-21 22:41:05", "2026-10-21 22:41:01"), restCands("2026-10-21 22:41:03"), { rules, site: "usercenter" }).failed.every((f) => f.where !== "load" || f.check !== "html"));
  // the restored page prints another format: still a failure
  assert.ok(compareRuns(base("2026-10-21 22:41:05", "2026-10-21 22:41:05"), restCands("2026-10-21 22:41"), { rules, site: "usercenter" }).failed.some((f) => f.check === "html"));
  // a baseline recorded before the rule (no clock): nothing replaced on either side
  assert.ok(compareRuns(base("2026-10-21 22:41:05", "2026-10-21 22:41:05", null), restCands("2026-10-21 22:41:03"), { rules, site: "usercenter" }).failed.some((f) => f.check === "html"));
});
