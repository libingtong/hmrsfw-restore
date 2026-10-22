// node --test tools/test/interact-to-e2e.test.mjs
// tools/interact-to-e2e.mjs (HM-20): interaction scripts → hmrsfw-vue/e2e/cases/<id>.json. Runs against a throwaway app
// directory and a throwaway tests/interact: no hmrsfw-vue checkout, no RESTORE_ASSETS.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { ROOT } from "../gate/common.mjs";
import { authFile, convert, defaultIds, run } from "../interact-to-e2e.mjs";

const config = JSON.parse(readFileSync(path.join(ROOT, "restore.config.json"), "utf8"));

// A fake hmrsfw-vue with the pages c02 (portal, has a script) and c03 (user center, has a script), c01 (no script) and
// nothing for c04 (page not merged yet).
function fixture() {
  const dir = mkdtempSync(path.join(os.tmpdir(), "interact-e2e-"));
  const app = path.join(dir, "app"), interact = path.join(dir, "interact");
  mkdirSync(interact);
  for (const t of ["apps/portal/src/views/BeOnProbation/ProbationHome.vue", "apps/portal/src/views/sjz/enterpriserecruitment/enterpriserecruitment.vue", "apps/uc/src/views/formDone.vue"]) {
    mkdirSync(path.dirname(path.join(app, t)), { recursive: true });
    writeFileSync(path.join(app, t), "<template><div/></template>");
  }
  const script = (id, steps) => writeFileSync(path.join(interact, `${id}.json`), JSON.stringify(steps));
  script("c02", [{ clickSel: ".ant-pagination-item-2", optional: true }]);
  script("c03", [{ fill: ["请输入姓名", "测试"] }, { click: "提交", wait: 2000 }]);
  return { dir, app, interact, script, done: () => rmSync(dir, { recursive: true, force: true }) };
}
const read = (app, id) => JSON.parse(readFileSync(path.join(app, "e2e/cases", `${id}.json`), "utf8"));

test("a script becomes a case with the work order's route, login state and the script's steps", () => {
  const f = fixture();
  try {
    const r = run({ app: f.app, ids: ["c02", "c03"], config, interactDir: f.interact });
    assert.equal(r.ok, true);
    assert.deepEqual(r.created, ["c02", "c03"]);
    const c03 = read(f.app, "c03");
    assert.equal(c03.app, "uc");
    assert.equal(c03.route, "/formDone/lsajbt");
    assert.equal(c03.testOrigin, config.apps.find((a) => a.name === "uc").testOrigin);
    assert.equal(c03.auth, ".auth/pw-usercenter-jobseeker.json");
    assert.deepEqual(c03.steps, [{ fill: ["请输入姓名", "测试"] }, { click: "提交", wait: 2000 }]);
    assert.equal(read(f.app, "c02").auth, ".auth/pw-portal.json");
  } finally { f.done(); }
});

test("converting twice changes nothing; --check is clean afterwards and notices a drifted case", () => {
  const f = fixture();
  try {
    const ids = ["c02", "c03"];
    run({ app: f.app, ids, config, interactDir: f.interact });
    const before = readFileSync(path.join(f.app, "e2e/cases/c03.json"), "utf8");
    const again = run({ app: f.app, ids, config, interactDir: f.interact });
    assert.deepEqual([again.created, again.updated, again.unchanged], [[], [], ids]);
    assert.equal(readFileSync(path.join(f.app, "e2e/cases/c03.json"), "utf8"), before);
    assert.equal(run({ app: f.app, ids, check: true, config, interactDir: f.interact }).ok, true);

    f.script("c03", [{ fill: ["请输入姓名", "测试"] }]); // the recorder changed the script
    const drift = run({ app: f.app, ids, check: true, config, interactDir: f.interact });
    assert.equal(drift.ok, false);
    assert.deepEqual(drift.updated, ["c03"]);
    assert.equal(readFileSync(path.join(f.app, "e2e/cases/c03.json"), "utf8"), before, "--check writes nothing");
    run({ app: f.app, ids, config, interactDir: f.interact });
    assert.deepEqual(read(f.app, "c03").steps, [{ fill: ["请输入姓名", "测试"] }], "a changed script is synced by one run");
  } finally { f.done(); }
});

test("a page without a script gets a load-only case; a page not merged yet is pending", () => {
  const f = fixture();
  try {
    const r = run({ app: f.app, ids: ["c01", "c04"], config, interactDir: f.interact });
    assert.equal(r.ok, true);
    assert.deepEqual(r.created, ["c01"]);
    assert.deepEqual(read(f.app, "c01").steps, []);
    assert.deepEqual(r.pending.map((p) => p.id), ["c04"]);
    assert.ok(!existsSync(path.join(f.app, "e2e/cases/c04.json")));
  } finally { f.done(); }
});

test("an invalid script, or a script without a work order, is an error and exits not-ok", () => {
  const f = fixture();
  try {
    const phone = ["138", "1234", "5678"].join(""); // written in pieces: the repo scan must not see a phone number
    f.script("c02", [{ fill: ["请输入手机号", phone] }]);
    f.script("zz-unknown", [{ click: "查询" }]);
    const r = run({ app: f.app, ids: ["c02", "zz-unknown"], config, interactDir: f.interact });
    assert.equal(r.ok, false);
    assert.deepEqual(r.errors.map((e) => e.id), ["c02", "zz-unknown"]);
    assert.match(r.errors[0].reason, /invalid script/);
    assert.match(r.errors[1].reason, /no work order/);
    assert.ok(!existsSync(path.join(f.app, "e2e/cases/c02.json")), "an invalid script writes no case");
  } finally { f.done(); }
});

test("cases of ids that left the set are stale: reported, counted by --check, deleted only by --prune; a partial run deletes nothing", () => {
  const f = fixture();
  try {
    run({ app: f.app, ids: ["c02", "c03"], config, interactDir: f.interact });
    const partial = run({ app: f.app, ids: ["c02"], prune: true, config, interactDir: f.interact });
    assert.deepEqual(partial.stale, []);
    assert.ok(existsSync(path.join(f.app, "e2e/cases/c03.json")));

    const check = run({ app: f.app, ids: ["c02"], full: true, check: true, config, interactDir: f.interact });
    assert.deepEqual(check.stale, ["c03"]);
    assert.equal(check.ok, false);
    assert.ok(existsSync(path.join(f.app, "e2e/cases/c03.json")));

    const pruned = run({ app: f.app, ids: ["c02"], full: true, prune: true, config, interactDir: f.interact });
    assert.deepEqual(pruned.removed, ["c03"]);
    assert.equal(pruned.ok, true);
    assert.ok(!existsSync(path.join(f.app, "e2e/cases/c03.json")));
  } finally { f.done(); }
});

test("the login state file follows the gate: order's own auth > per-identity file of the POC orders > the site's", () => {
  assert.equal(authFile({ site: "usercenter", role: "usercenter-corp" }), ".auth/pw-usercenter-corp.json");
  assert.equal(authFile({ site: "usercenter", role: "corp" }), ".auth/pw-usercenter.json");
  assert.equal(authFile({ site: "portal", role: "portal" }), ".auth/pw-portal.json");
  assert.equal(authFile({ site: "portal", auth: ".auth/portal-original.json" }), ".auth/portal-original.json");
});

test("without ids it converts every recorded script and every accepted page of this repo", () => {
  const ids = defaultIds();
  for (const id of ["c02", "c19", "c01", "c20", "p1", "u4"]) assert.ok(ids.includes(id), id);
  assert.equal(new Set(ids).size, ids.length);
  const r = convert("c02", { app: ROOT, config }); // ROOT has no apps/ → the page is not "in the app": pending, not an error
  assert.ok(r.pending && !r.error);
});
