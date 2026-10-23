// HM-1135: the leader's tick merges the tool repo's main into its integration branch, where the recorder runs from.
import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { makeFixture, git, lsRemote, showRemote, REPO } from "./fixture.mjs";

// commit files on a branch of the tool repo's origin
function pushTool(fx, branch, files) {
  const wt = mkdtempSync(path.join(fx.root, "twt-"));
  git(fx.root, "clone", "-q", "-b", branch, fx.toolOrigin, wt);
  for (const [rel, content] of Object.entries(files)) { mkdirSync(path.dirname(path.join(wt, rel)), { recursive: true }); writeFileSync(path.join(wt, rel), content); }
  git(wt, "add", "-A"); git(wt, "-c", "user.name=t", "-c", "user.email=t@localhost", "commit", "-q", "-m", `work on ${branch}`); git(wt, "push", "-q", "origin", branch);
}

function sync(fx) {
  const script = `const { Pipeline } = await import(${JSON.stringify(path.join(REPO, "tools/lib/pipeline.mjs"))}); const pl = new Pipeline({ argv: [] }); pl.syncToolIntegration(); console.log(JSON.stringify({ actions: pl.actions, anomalies: pl.anomalies }));`;
  const r = spawnSync(process.execPath, ["--input-type=module", "-e", script], { cwd: fx.tool, env: fx.env, encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  return JSON.parse(r.stdout.trim().split("\n").pop());
}

test("main's tool and rule commits are merged into integration, integration's own commits stay; nothing to do the next time", () => {
  const fx = makeFixture();
  pushTool(fx, "integration", { "receipts/page.a.json": "{}\n", "tests/interact/page.a.json": "[]\n" });
  pushTool(fx, "main", { "tools/interact.mjs": "// v2\n", "rules.json": JSON.stringify({ rules: ["base", "new"] }) });
  const r = sync(fx);
  assert.deepEqual(r.anomalies, []);
  assert.match(r.actions.join("\n"), /tool integration ← main/);
  assert.equal(showRemote(fx, "tool", "integration", "tools/interact.mjs"), "// v2\n");
  assert.match(showRemote(fx, "tool", "integration", "rules.json"), /new/);
  assert.equal(showRemote(fx, "tool", "integration", "tests/interact/page.a.json"), "[]\n");
  assert.equal(git(fx.root, "--git-dir", fx.toolOrigin, "diff", "main", "integration", "--", "tools", "rules.json"), "");
  const head = lsRemote(fx, "tool", "integration");
  const again = sync(fx);
  assert.deepEqual(again, { actions: [], anomalies: [] });
  assert.equal(lsRemote(fx, "tool", "integration"), head, "no new commit");
});

test("a conflict is reported for the arbiter, integration is left as it was", () => {
  const fx = makeFixture();
  pushTool(fx, "integration", { "tools/interact.mjs": "// integration's copy\n" });
  pushTool(fx, "main", { "tools/interact.mjs": "// main's copy\n" });
  const head = lsRemote(fx, "tool", "integration");
  const r = sync(fx);
  assert.equal(r.anomalies.length, 1);
  assert.match(r.anomalies[0].what, /conflicts in tools\/interact\.mjs/);
  assert.equal(lsRemote(fx, "tool", "integration"), head);
});
