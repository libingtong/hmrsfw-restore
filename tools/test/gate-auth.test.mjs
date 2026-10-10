// node --test tools/test/gate-auth.test.mjs
// Login state for the gate, the baseline and verify-confirm (authStorage): one file per site, pw-<site>.json, whatever
// the order's `role` (HM-35 review: role general / corp / … used to pick pw-general.json, pw-corp.json, which do not
// exist). The identity comes from the HAR's _record.localStorage. POC confirmation orders keep their per-identity file;
// an explicit `auth` still wins.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { SITES, authStorage, loadWorkOrder } from "../gate/common.mjs";

// Each file carries its own name under `file`, so the test sees which one was read. pw-general / pw-corp / pw-jobseeker
// are decoys: reading any of them is the bug.
function fakeAssets() {
  const dir = mkdtempSync(path.join(os.tmpdir(), "gate-auth-"));
  mkdirSync(path.join(dir, ".auth"));
  const storageState = (site, name) => ({ cookies: [], origins: [{ origin: SITES[site].host, localStorage: [{ name: "file", value: name }, { name: "radiotype", value: "1" }] }] });
  const files = {
    "pw-portal.json": storageState("portal", "pw-portal.json"),
    "pw-usercenter.json": storageState("usercenter", "pw-usercenter.json"),
    "pw-usercenter-jobseeker.json": storageState("usercenter", "pw-usercenter-jobseeker.json"),
    "pw-general.json": storageState("portal", "pw-general.json"),
    "pw-corp.json": storageState("usercenter", "pw-corp.json"),
    "pw-jobseeker.json": storageState("usercenter", "pw-jobseeker.json"),
    "portal-original.json": { localStorage: { file: "portal-original.json" }, sessionStorage: {} },
  };
  for (const [n, c] of Object.entries(files)) writeFileSync(path.join(dir, ".auth", n), JSON.stringify(c));
  return dir;
}
const fileOf = (id, assets, har) => authStorage(loadWorkOrder(id), assets, har).localStorage.file;

test("queue orders with a role read the site's login state", () => {
  const assets = fakeAssets();
  try {
    for (const [id, role, file] of [
      ["page.portal.login", "general", "pw-portal.json"],
      ["seg.uc.CorpAttestation.1", "corp", "pw-usercenter.json"],
      ["page.uc.CorpCenter", "corp", "pw-usercenter.json"],
      ["page.uc.login", "general", "pw-usercenter.json"],
      ["page.uc.accountBind", null, "pw-usercenter.json"],
    ]) {
      const wo = loadWorkOrder(id);
      assert.equal(wo.role, role ?? wo.site, `${id}: role`);
      assert.equal(fileOf(id, assets), file, id);
    }
  } finally { rmSync(assets, { recursive: true, force: true }); }
});

test("the HAR's recorded identity goes over the site login state", () => {
  const assets = fakeAssets();
  try {
    const st = authStorage(loadWorkOrder("page.uc.CorpCenter"), assets, { record: { localStorage: { radiotype: "2" } } });
    assert.equal(st.localStorage.file, "pw-usercenter.json");
    assert.equal(st.localStorage.radiotype, "2");
  } finally { rmSync(assets, { recursive: true, force: true }); }
});

test("POC orders: per-identity file for confirmation orders, explicit auth wins", () => {
  const assets = fakeAssets();
  try {
    assert.equal(fileOf("c01", assets), "pw-portal.json"); // role "portal"
    assert.equal(fileOf("c03", assets), "pw-usercenter-jobseeker.json"); // role "usercenter-jobseeker"
    assert.equal(fileOf("p1", assets), "portal-original.json"); // auth ".auth/portal-original.json"
  } finally { rmSync(assets, { recursive: true, force: true }); }
});

test("missing site login state names the file it looked for", () => {
  const assets = mkdtempSync(path.join(os.tmpdir(), "gate-auth-"));
  try {
    assert.throws(() => authStorage(loadWorkOrder("page.uc.CorpCenter"), assets), /page\.uc\.CorpCenter \(\.auth\/pw-usercenter\.json\) not found/);
  } finally { rmSync(assets, { recursive: true, force: true }); }
});
