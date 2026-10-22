// node --test tools/test/gate-report.test.mjs
// gate.mjs report() (HM-839): an 81-page integration run must fit the 8 KB metadata cap — pending and fail alike — and
// the comment file must live in the caller's working directory (multica rejects --content-file outside it).
// HM-876: the cap is on the issue's whole metadata (measured: Σ(key + stored value + 8) + 8 ≤ 8192), and a large
// integration order's workOrders takes most of it; the fake multica refuses writes past the cap like the server does.
import { test } from "node:test";
import assert from "node:assert/strict";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const root = mkdtempSync(path.join(tmpdir(), "gate-report-"));
const log = path.join(root, "calls.jsonl");
const metaFile = path.join(root, "meta.json");
const bin = path.join(root, "multica");
// fake multica: records argv, and for `comment add` whether the content file exists and lies under the cwd; `issue get`
// returns the metadata in meta.json; `metadata set` stores into it, refused past the server's cap
writeFileSync(bin, `#!/usr/bin/env node
const fs = require("fs"), path = require("path"), a = process.argv.slice(2);
const i = a.indexOf("--content-file"), f = i >= 0 ? a[i + 1] : null;
const ok = (a[1] !== "metadata") || (() => {
  const m = fs.existsSync(${JSON.stringify(metaFile)}) ? JSON.parse(fs.readFileSync(${JSON.stringify(metaFile)}, "utf8")) : {};
  m[a[a.indexOf("--key") + 1]] = a[a.indexOf("--value") + 1];
  const size = Object.entries(m).reduce((n, [k, v]) => n + Buffer.byteLength(k) + Buffer.byteLength(typeof v === "string" ? v : JSON.stringify(v)) + 8, 8);
  if (size > 8192) return false;
  fs.writeFileSync(${JSON.stringify(metaFile)}, JSON.stringify(m));
  return true;
})();
fs.appendFileSync(${JSON.stringify(log)}, JSON.stringify({ a, ok, cwd: process.cwd(), content: f && fs.existsSync(f) ? fs.readFileSync(f, "utf8") : null, inCwd: f ? !path.relative(process.cwd(), f).startsWith("..") : null }) + "\\n");
// FAKE_HIDE: a key another writer adds between the gate's read and its write (the read does not see it)
if (a[0] === "issue" && a[1] === "get") { const m = fs.existsSync(${JSON.stringify(metaFile)}) ? JSON.parse(fs.readFileSync(${JSON.stringify(metaFile)}, "utf8")) : {}; delete m[process.env.FAKE_HIDE]; console.log(JSON.stringify({ id: a[2], metadata: m })); }
if (!ok) { console.error("Error: Invalid request: metadata exceeds the 8KB size limit"); process.exit(1); }
`);
chmodSync(bin, 0o755);
process.env.MULTICA_BIN = bin;
process.env.RESTORE_STATE = path.join(root, "state");
const { report, slimResult, metaBudget, metaBytes, META_BUDGET, META_CAP, META_HEADROOM } = await import("../gate.mjs");

const ids = Array.from({ length: 81 }, (_, i) => `page.uc.SomeLongishPageName${String(i).padStart(3, "0")}`);
const calls = () => readFileSync(log, "utf8").trim().split("\n").map((l) => JSON.parse(l));
const sets = (c) => c.filter((x) => x.a[1] === "metadata");
const metaOf = (c) => JSON.parse(sets(c).filter((x) => x.ok).at(-1).a.at(-1));

// `others`: the task's metadata before the gate writes (as the server stores it: arrays/objects as JSON text)
function run(out, others = {}) {
  rmSync(log, { force: true });
  writeFileSync(metaFile, JSON.stringify(others));
  const work = path.join(root, "work"); mkdirSync(work, { recursive: true });
  const prev = process.cwd(); process.chdir(work);
  try { report("task-1", 2, out, out.pages?.map((p) => p.wo) ?? out.missing.map((m) => m.wo)); } finally { process.chdir(prev); }
  const c = calls();
  const comment = c.find((x) => x.a[1] === "comment");
  assert.ok(comment.inCwd, "comment file under cwd");
  assert.ok(comment.content?.startsWith("[GATE]"), "comment file present when multica runs");
  assert.deepEqual(readdirSync(work), [], "comment file removed");
  assert.ok(sets(c).some((x) => x.ok), "gate.<attempt> written");
  const raw = sets(c).filter((x) => x.ok).at(-1).a.at(-1);
  assert.ok(Buffer.byteLength(raw) <= META_BUDGET, `metadata ${Buffer.byteLength(raw)} B`);
  const all = JSON.parse(readFileSync(metaFile, "utf8"));
  assert.ok(metaBytes(all) <= META_CAP, `whole metadata ${metaBytes(all)} B`);
  return { meta: metaOf(c), comment, calls: c, all };
}
test("81-page pending result: counts, reasons, every id, full detail in a file", () => {
  const missing = ids.map((wo, i) => ({ wo, why: i < 55 ? "interaction script changed since the baseline" : "no baseline" }));
  const { meta, comment: { content: comment } } = run({ pending: "record", missing, attempt: 2, durationMs: 1234 });
  assert.equal(meta.pending, "record");
  assert.equal(meta.missingTotal, 81);
  assert.deepEqual(meta.byReason, { "interaction script changed since the baseline": 55, "no baseline": 26 });
  assert.deepEqual(meta.missing, ids);
  assert.deepEqual(JSON.parse(readFileSync(meta.detail, "utf8")).missing, missing);
  const head = comment.split("\n")[0];
  assert.match(head, /^\[GATE\] PENDING record 81 页（page\.uc\.SomeLongishPageName000,.* 等） a2: interaction script changed since the baseline ×55; no baseline ×26$/);
});

test("81-page fail result: every page kept (advance treats a page without an entry as failed), failed tightened", () => {
  const pages = ids.map((wo, i) => ({ wo, pass: i % 3 !== 0, stage: i % 3 ? null : "browser", pixel: 0.0123, failed: i % 3 ? [] : [{ check: "html", where: "load", hint: "x".repeat(300) }], ms: 4000 }));
  const failed = pages.filter((p) => !p.pass).flatMap((p) => [0, 1].map(() => ({ check: "html", where: "div.main > div.padB40", hint: "HTML differs ".repeat(30), wo: p.wo })));
  const diff = path.join(process.env.RESTORE_STATE, "gate", "integration-x-a2");
  const out = { pass: false, failed, stage: "browser", diff, shimmed: ["a", "b"], durationMs: 9e5, stages: { static: 1, build: 2, browser: 3 }, pages, mode: "integration", attempt: 2, build: "full" };
  const { meta, comment: { content: comment } } = run(out);
  assert.equal(meta.pass, false);
  assert.equal(meta.stage, "browser");
  assert.equal(meta.pages.length, 81);
  assert.deepEqual(meta.pages.filter((p) => !p.pass).map((p) => p.wo), pages.filter((p) => !p.pass).map((p) => p.wo));
  assert.ok(meta.pages.filter((p) => p.pass).every((p) => Object.keys(p).length === 2));
  assert.equal(meta.failedTotal, failed.length);
  assert.ok(meta.failed.length <= 10 && meta.failed.every((f) => f.wo && f.check));
  assert.equal(meta.detail, path.join(diff, "result.json"));
  assert.equal(JSON.parse(readFileSync(meta.detail, "utf8")).failed.length, failed.length);
  assert.match(comment.split("\n")[0], /^\[GATE\] FAIL 81 页（.* 等） a2 integration/);
  assert.match(comment, /- pages: 54\/81 passed; failed: 27 页/);
});

test("small results are untouched by the budget", () => {
  const out = { pass: true, failed: [], stage: "browser", diff: "/x", shimmed: [], durationMs: 1, stages: {}, pages: [{ wo: "c01", pass: true, stage: null, pixel: 0, ms: 3 }], mode: "page", attempt: 1 };
  assert.deepEqual(slimResult(out, "/x/result.json").pages, [{ wo: "c01", pass: true, stage: null, pixel: 0 }]);
  const p = slimResult({ pending: "record", missing: [{ wo: "c01", why: "no baseline" }], attempt: 1 }, "/d");
  assert.deepEqual(p.missing, ["c01"]);
  assert.equal(p.missingTruncated, undefined);
});

test("a huge pending list is truncated, total kept", () => {
  const many = Array.from({ length: 2000 }, (_, i) => ({ wo: `page.portal.Page${i}`, why: "no baseline" }));
  const p = slimResult({ pending: "record", missing: many, attempt: 1 }, "/d");
  assert.ok(Buffer.byteLength(JSON.stringify(p)) <= META_BUDGET);
  assert.equal(p.missingTotal, 2000);
  assert.ok(p.missingTruncated && p.missing.length > 0);
});

test.after(() => rmSync(root, { recursive: true, force: true }));

test("hundreds of pages: failing pages listed, passing ones counted, and advance reads them right", async () => {
  const { Pipeline } = await import("../lib/pipeline.mjs");
  const P = Pipeline.prototype;
  const many = Array.from({ length: 437 }, (_, i) => `page.portal.SomePageName${String(i).padStart(3, "0")}`);
  const mk = (failEvery) => {
    const pages = many.map((wo, i) => ({ wo, pass: i % failEvery !== 0, stage: i % failEvery ? null : "browser", pixel: 0 }));
    const failed = pages.filter((p) => !p.pass).map((p) => ({ check: "html", where: "load", hint: "h", wo: p.wo }));
    return { out: { pass: false, failed, stage: "browser", diff: "/s", shimmed: [], durationMs: 1, stages: {}, pages, mode: "integration", attempt: 1 }, bad: failed.map((f) => f.wo) };
  };
  const { out, bad } = mk(10);
  const g = JSON.parse(JSON.stringify(slimResult(out, "/s/result.json")));
  assert.ok(Buffer.byteLength(JSON.stringify(g)) <= META_BUDGET);
  assert.equal(g.passedOmitted, 437 - bad.length);
  assert.deepEqual(P.failedWos.call(P, g, many), bad);
  const res = P.pageResults.call(P, g, many);
  assert.deepEqual(many.filter((w) => !res[w].pass), bad);
  // every page failing: the list is cut and nothing reads as passed
  const all = mk(1);
  const g2 = slimResult(all.out, "/s/result.json");
  assert.ok(Buffer.byteLength(JSON.stringify(g2)) <= META_BUDGET);
  assert.ok(g2.pagesTruncated && g2.passedOmitted === undefined);
  assert.deepEqual(P.failedWos.call(P, g2, many), many);
});

// ── HM-876: the cap is on the whole metadata ──

test("metaBytes reproduces the server's cap as measured on HM-876", () => {
  assert.equal(metaBytes({ probe1: "a".repeat(8170) }), META_CAP, "one key: 8170 accepted, 8171 refused");
  assert.equal(metaBytes({ probe1: "a".repeat(5000), probe2: "b".repeat(3156) }), META_CAP, "two keys share it: 5000 + 3156 accepted, 3157 refused");
  assert.equal(metaBytes({ q: '"'.repeat(6000) }) <= META_CAP, true, "escaping does not count (6000 quotes accepted)");
  const obj = (n) => JSON.stringify({ k: Array.from({ length: n }, (_, i) => `p${String(i).padStart(13, "0")}`) });
  assert.ok(metaBytes({ probe3: obj(480) }) <= META_CAP && metaBytes({ probe3: obj(481) }) > META_CAP, "an object counts as its JSON text: 480 ids accepted, 481 refused");
  assert.equal(metaBudget({}, "gate.1"), META_BUDGET, "an empty task: the HM-839 budget");
  assert.equal(metaBudget({ "gate.1": "x".repeat(7000) }, "gate.1"), META_BUDGET, "the key's own old value is replaced, not added");
});

// a 132-page rule-regression order as the scheduler creates it (HM-873): workOrders alone is ~4.6 KB
const integrationMeta = (wos) => ({ attempt: 1, branch: "integration", createKey: `integration:rule-regression:${"0".repeat(40)}`, createdOn: "mac-mini", fixRound: 0, kind: "integration", purpose: "rule-regression", ruleChange: "rule/hm-253-record-via-offscope-fixed", ruleSha: "0".repeat(40), sha: "", workOrders: JSON.stringify(wos) });
const pageIds = (n) => Array.from({ length: n }, (_, i) => `page.portal.someModule.SomePage${String(i).padStart(3, "0")}`);

test("HM-873 shape: 132 pages pending on a task whose workOrders is 4.6 KB — written, whole metadata under the cap with headroom", () => {
  const wos = pageIds(132);
  const others = integrationMeta(wos);
  assert.ok(metaBytes(others) > 4500, `others ${metaBytes(others)} B`);
  const missing = wos.map((wo, i) => ({ wo, why: i < 129 ? "interaction script changed since the baseline" : "no baseline" }));
  const { meta, all, calls: c, comment } = run({ pending: "record", missing, attempt: 2, durationMs: 1234 }, others);
  assert.equal(sets(c).length, 1, "first write accepted");
  assert.ok(metaBytes(all) <= META_CAP - META_HEADROOM, `whole metadata ${metaBytes(all)} B leaves headroom for tick's keys`);
  assert.equal(meta.pending, "record");
  assert.equal(meta.missingTotal, 132);
  assert.deepEqual(meta.byReason, { "interaction script changed since the baseline": 129, "no baseline": 3 });
  assert.equal(meta.missingTruncated, true);
  assert.deepEqual(meta.missing, wos.slice(0, meta.missing.length));
  assert.ok(meta.missing.length >= 1 && meta.missing.length <= 10, `sample of ${meta.missing.length}`);
  assert.deepEqual(JSON.parse(readFileSync(meta.detail, "utf8")).missing, missing, "the full list stays in the detail file");
  assert.match(comment.content.split("\n")[0], /a2: interaction script changed since the baseline ×129; no baseline ×3$/);
});

test("over 150 pages pending: gate.<attempt> under 8 KB and written even on a crowded task", () => {
  for (const n of [151, 200, 400]) {
    const wos = pageIds(n);
    const missing = wos.map((wo, i) => ({ wo, why: i % 7 ? "interaction script changed since the baseline" : "no baseline" }));
    const raw = JSON.stringify(slimResult({ pending: "record", missing, attempt: 1, durationMs: 9 }, "/state/gate/pending-x-a1.json"));
    assert.ok(Buffer.byteLength(raw) < 8192, `${n} pages alone: ${Buffer.byteLength(raw)} B`);
    // 200+ pages: workOrders leaves less than the headroom — the gate still writes, the bare verdict at worst
    const { meta, all } = run({ pending: "record", missing, attempt: 2, durationMs: 1 }, integrationMeta(n <= 200 ? wos : wos.slice(0, 205)));
    assert.equal(meta.missingTotal, n);
    if (!meta.byReasonTruncated) assert.equal(meta.byReason["no baseline"], Math.ceil(n / 7));
    else assert.deepEqual(meta.byReason, { "interaction script changed since the baseline": n - Math.ceil(n / 7) }, "the most frequent reason kept");
    assert.ok(metaBytes(all) <= META_CAP);
  }
});

test("a write refused anyway (another key grew after the read) is retried smaller", () => {
  const wos = pageIds(132);
  const others = { ...integrationMeta(wos), history: "h".repeat(2500) };
  process.env.FAKE_HIDE = "history";
  try {
    const missing = wos.map((wo) => ({ wo, why: "no baseline" }));
    const { meta, calls: c } = run({ pending: "record", missing, attempt: 2, durationMs: 1 }, others);
    assert.ok(sets(c).length >= 2 && !sets(c)[0].ok && sets(c).at(-1).ok, sets(c).map((x) => x.ok).join(","));
    assert.equal(meta.missingTotal, 132);
  } finally { delete process.env.FAKE_HIDE; }
});

test("fail result on a crowded task: pages shrink to failing ones, advance still reads every page right", () => {
  const wos = pageIds(132);
  const pages = wos.map((wo, i) => ({ wo, pass: i % 10 !== 0, stage: i % 10 ? null : "browser", pixel: 0.01, failed: i % 10 ? [] : [{ check: "html", where: "load", hint: "x".repeat(300) }] }));
  const failed = pages.filter((p) => !p.pass).map((p) => ({ check: "html", where: "load", hint: "y".repeat(300), wo: p.wo }));
  const out = { pass: false, failed, stage: "browser", diff: path.join(process.env.RESTORE_STATE, "gate", "integration-y-a2"), shimmed: [], durationMs: 1, stages: { static: 1, build: 1, browser: 1 }, pages, mode: "integration", attempt: 2, build: "full" };
  const { meta, all } = run(out, integrationMeta(wos));
  assert.ok(metaBytes(all) <= META_CAP - META_HEADROOM);
  const listed = Object.fromEntries(meta.pages.map((p) => [p.wo, p]));
  const read = (w) => (listed[w] ? listed[w].pass : !!meta.passedOmitted); // pipeline.mjs failedWos / pageResults
  assert.deepEqual(wos.filter((w) => !read(w)), pages.filter((p) => !p.pass).map((p) => p.wo));
});

test("small pending results are written as before (HM-857 / HM-863 shape: 125 pages, 3 without a baseline)", () => {
  const wos = pageIds(125);
  const missing = ["page.portal.fair.signModal", "page.portal.sjz.newHome.resource", "page.portal.special.page1.jobNews"].map((wo) => ({ wo, why: "no baseline" }));
  const { meta } = run({ pending: "record", missing, attempt: 1, durationMs: 1235 }, integrationMeta(wos));
  const detail = meta.detail;
  assert.deepEqual(meta, { pending: "record", missingTotal: 3, byReason: { "no baseline": 3 }, missing: missing.map((m) => m.wo), attempt: 1, durationMs: 1235, detail });
});
