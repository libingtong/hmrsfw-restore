// node --test tools/test/gate-report.test.mjs
// gate.mjs report() (HM-839): an 81-page integration run must fit the 8 KB metadata cap — pending and fail alike — and
// the comment file must live in the caller's working directory (multica rejects --content-file outside it).
import { test } from "node:test";
import assert from "node:assert/strict";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const root = mkdtempSync(path.join(tmpdir(), "gate-report-"));
const log = path.join(root, "calls.jsonl");
const bin = path.join(root, "multica");
// fake multica: records argv, and for `comment add` whether the content file exists and lies under the cwd
writeFileSync(bin, `#!/usr/bin/env node
const fs = require("fs"), path = require("path"), a = process.argv.slice(2);
const i = a.indexOf("--content-file"), f = i >= 0 ? a[i + 1] : null;
fs.appendFileSync(${JSON.stringify(log)}, JSON.stringify({ a, cwd: process.cwd(), content: f && fs.existsSync(f) ? fs.readFileSync(f, "utf8") : null, inCwd: f ? !path.relative(process.cwd(), f).startsWith("..") : null }) + "\\n");
`);
chmodSync(bin, 0o755);
process.env.MULTICA_BIN = bin;
process.env.RESTORE_STATE = path.join(root, "state");
const { report, slimResult, META_BUDGET } = await import("../gate.mjs");

const ids = Array.from({ length: 81 }, (_, i) => `page.uc.SomeLongishPageName${String(i).padStart(3, "0")}`);
const calls = () => readFileSync(log, "utf8").trim().split("\n").map((l) => JSON.parse(l));
const metaOf = (c) => JSON.parse(c.find((x) => x.a[1] === "metadata").a.at(-1));

function run(out) {
  rmSync(log, { force: true });
  const work = path.join(root, "work"); mkdirSync(work, { recursive: true });
  const prev = process.cwd(); process.chdir(work);
  try { report("task-1", 2, out, out.pages?.map((p) => p.wo) ?? out.missing.map((m) => m.wo)); } finally { process.chdir(prev); }
  const c = calls();
  const comment = c.find((x) => x.a[1] === "comment");
  assert.ok(comment.inCwd, "comment file under cwd");
  assert.ok(comment.content?.startsWith("[GATE]"), "comment file present when multica runs");
  assert.deepEqual(readdirSync(work), [], "comment file removed");
  const raw = c.find((x) => x.a[1] === "metadata").a.at(-1);
  assert.ok(Buffer.byteLength(raw) <= META_BUDGET, `metadata ${Buffer.byteLength(raw)} B`);
  return { meta: metaOf(c), comment: comment.content };
}

test("81-page pending result: counts, reasons, every id, full detail in a file", () => {
  const missing = ids.map((wo, i) => ({ wo, why: i < 55 ? "interaction script changed since the baseline" : "no baseline" }));
  const { meta, comment } = run({ pending: "record", missing, attempt: 2, durationMs: 1234 });
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
  const { meta, comment } = run(out);
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
