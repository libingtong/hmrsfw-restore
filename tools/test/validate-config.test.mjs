// node --test tools/test/validate-config.test.mjs
// The Hami restore.config.json must pass; each broken copy must fail on the expected path. When ajv is resolvable
// (AJV_DIR=<dir containing node_modules/ajv>), every case is also run through ajv's draft 2020-12 validator and the
// pass/fail verdicts must agree with validate-config.mjs.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SCHEMA_PATH, semanticCheck, validate, validateConfigFile } from "../validate-config.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const CONFIG = path.join(ROOT, "restore.config.json");
const schema = JSON.parse(readFileSync(SCHEMA_PATH, "utf8"));
const base = JSON.parse(readFileSync(CONFIG, "utf8"));
const clone = () => structuredClone(base);

let ajv = null;
if (process.env.AJV_DIR) {
  const req = createRequire(path.join(path.resolve(process.env.AJV_DIR), "x.js"));
  const Ajv2020 = req("ajv/dist/2020").default;
  ajv = new Ajv2020({ allErrors: true, strict: false }).compile(schema);
}

test("Hami restore.config.json is valid, files included", () => {
  const out = validateConfigFile(CONFIG);
  assert.deepEqual(out.errors, []);
  assert.equal(out.ok, true);
  if (ajv) assert.equal(ajv(base), true, JSON.stringify(ajv.errors));
});

const broken = {
  "missing owner": [(c) => delete c.project.owner, "/project"],
  "owner is not a uuid": [(c) => (c.project.owner.memberId = "李炳通"), "/project/owner/memberId"],
  "unknown top-level key": [(c) => (c.hosts = []), "/hosts"],
  "appDir must be VR_APP_DIR": [(c) => (c.env.appDir = "HMRSFW_APP_DIR"), "/env/appDir"],
  "alias outside the one allowed": [(c) => (c.env.appDirAliases = ["FOO_APP_DIR"]), "/env/appDirAliases/0"],
  "adapter other than vue3-vite": [(c) => (c.project.adapter = "vue2-webpack"), "/project/adapter"],
  "target without {view}": [(c) => (c.apps[0].target = "apps/portal/src/views/"), "/apps/0/target"],
  "vue 2 version": [(c) => (c.apps[0].versions.vue = "2.7.16"), "/apps/0/versions/vue"],
  "host with scheme": [(c) => (c.recording.allowedHosts = ["https://hamiwebportaltest.rencaidanao.com"]), "/recording/allowedHosts/0"],
  "escalation category missing": [(c) => (c.escalation.categories = c.escalation.categories.filter((x) => x.id !== "money")), "/escalation/categories"],
  "absolute projectNotes": [(c) => (c.projectNotes = "/Users/x/notes.md"), "/projectNotes"],
  "projectNotes escapes the repo": [(c) => (c.projectNotes = "../notes.md"), "/projectNotes"],
  "repo url not https": [(c) => (c.repos.app.url = "git" + "@github.com:libingtong/hmrsfw-vue.git"), "/repos/app/url"],
  "no apps": [(c) => (c.apps = []), "/apps"],
  "http testOrigin": [(c) => (c.apps[0].testOrigin = "http://hamiwebportaltest.rencaidanao.com"), "/apps/0/testOrigin"],
  "unknown machine role": [(c) => (c.machines[0].roles = ["boss"]), "/machines/0/roles/0"],
};

for (const [name, [mutate, where]] of Object.entries(broken)) {
  test(`schema rejects: ${name}`, () => {
    const c = clone(); mutate(c);
    const errs = validate(schema, c);
    assert.ok(errs.some((e) => e.path === where), `${where} not in ${JSON.stringify(errs)}`);
    if (ajv) assert.equal(ajv(c), false, "ajv accepted it");
  });
}

test("semantic: testOrigin host must be in allowedHosts", () => {
  const c = clone(); c.recording.allowedHosts = ["hamiwebportaltest.rencaidanao.com"];
  assert.deepEqual(validate(schema, c), []);
  const { errors } = semanticCheck(c, ROOT, { files: false });
  assert.deepEqual(errors.map((e) => e.path), ["/apps/1/testOrigin"]);
});

test("semantic: duplicate app names and missing chunks", () => {
  const c = clone(); c.apps[1].name = "portal"; c.apps[1].site = "portal"; c.apps[0].entryChunk = "index.nope.js";
  const { errors } = semanticCheck(c, ROOT);
  assert.deepEqual(errors.map((e) => e.path).sort(), ["/apps", "/apps", "/apps/0/entryChunk"]);
});

test("semantic: duplicate escalation category, secret roles on a machine without secrets", () => {
  const c = clone(); c.escalation.categories.push({ ...c.escalation.categories[1] }); c.machines[1].roles.push("gate", "fixer");
  assert.deepEqual(validate(schema, c), []);
  const { errors } = semanticCheck(c, ROOT, { files: false });
  assert.deepEqual(errors.map((e) => e.path).sort(), ["/escalation/categories", "/machines/1/roles"]);
});

test("malformed configs give errors, not exceptions", () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), "vr-config-"));
  try {
    const cases = { "null": null, "array": [], "apps-null": { ...clone(), apps: [null] }, "legacyDist-number": (() => { const c = clone(); c.apps[0].legacyDist = 5; return c; })() };
    for (const [name, data] of Object.entries(cases)) {
      const f = path.join(dir, `${name}.json`); writeFileSync(f, JSON.stringify(data));
      const out = validateConfigFile(f);
      assert.equal(out.ok, false, name); assert.ok(out.errors.length, name);
    }
    const f = path.join(dir, "broken.json"); writeFileSync(f, "{");
    assert.equal(validateConfigFile(f).ok, false);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("unsupported schema keywords throw instead of passing silently", () => {
  assert.throws(() => validate({ oneOf: [{ type: "string" }] }, "x"), /not supported/);
});
