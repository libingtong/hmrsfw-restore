// node --test tools/test/gate-upgrade.test.mjs
// gate.mjs --mode upgrade (HM-990, decision 1 of HM-858): an upgrade branch is judged as a public-library change by the
// scope rule the scheduler's merge uses (tools/lib/upgrade-scope.mjs) — public/, package.json, lock files and library
// files pass, page files never — and its regression pages are the restored pages that depend on a changed file, not the
// pages it unblocks.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { appendFileSync, chmodSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { scopeViolations, registryOwnerOf } from "../lib/upgrade-scope.mjs";
import { upgradePlan } from "../gate.mjs";
import { REPO } from "./fixture.mjs";

const owner = (f) => ({ "apps/portal/src/shared/Dict.vue": "S1", "apps/portal/src/legacy/index.ts": "E1" })[f] ?? null;

test("upgrade scope: public/, package.json, lock files and library files pass; page files never", () => {
  const files = ["apps/portal/public/sjz/home/marketTop.jpg", "package.json", "package-lock.json", "apps/portal/src/shared/tagcanvas.vue", "apps/portal/src/shared/Dict.vue", "apps/portal/src/legacy/index.ts", "apps/portal/src/utils/x.ts"];
  assert.deepEqual(scopeViolations(files, { kind: "upgrade", ownerOf: owner }), []);
  assert.deepEqual(scopeViolations(files, { kind: "upgrade", ownerOf: owner, ownerBusy: () => false }), []);
  assert.deepEqual(scopeViolations(["apps/portal/src/views/market/home.vue", "apps/uc/src/views/a/index/Sub.vue"], { kind: "upgrade", ownerOf: owner }), [
    "apps/portal/src/views/market/home.vue: page file (views/), an upgrade never changes a page",
    "apps/uc/src/views/a/index/Sub.vue: page file (views/), an upgrade never changes a page",
  ]);
});

test("upgrade scope: an owned library file is refused only while its owner has an active task (the scheduler's view)", () => {
  const busy = (o) => o === "S1";
  assert.deepEqual(scopeViolations(["apps/portal/src/shared/Dict.vue", "apps/portal/src/legacy/index.ts"], { kind: "upgrade", ownerOf: owner, ownerBusy: busy }), ["apps/portal/src/shared/Dict.vue: owner S1 has an active task"]);
  assert.deepEqual(scopeViolations(["apps/portal/src/shared/Dict.vue"], { kind: "upgrade", wos: ["S1"], ownerOf: owner, ownerBusy: busy }), []);
});

test("entry/shared orders keep their rule: only files they own (page files are not their business here either)", () => {
  assert.deepEqual(scopeViolations(["apps/portal/src/shared/Dict.vue", "apps/portal/src/legacy/index.ts"], { kind: "restore", wos: ["S1"], ownerOf: owner }), ["apps/portal/src/legacy/index.ts: owned by E1"]);
  assert.deepEqual(scopeViolations(["apps/portal/src/views/x.vue", "apps/portal/public/a.png"], { kind: "restore", wos: ["S1"], ownerOf: owner }), []);
});

test("registryOwnerOf reads registry/<app>.json (shared, entry, api sections)", () => {
  const root = mkdtempSync(path.join(tmpdir(), "upg-reg-"));
  try {
    mkdirSync(path.join(root, "registry"));
    writeFileSync(path.join(root, "registry", "portal.json"), JSON.stringify({ shared: { "Dict.1.js": { path: "@/shared/Dict.vue", owner: "S1" } }, entry: { x: { path: "@/legacy/index.ts", owner: "E1" } }, api: { y: { path: "@/api/a.ts" } } }));
    const of = registryOwnerOf(root);
    assert.equal(of("apps/portal/src/shared/Dict.vue"), "S1");
    assert.equal(of("apps/portal/src/legacy/index.ts"), "E1");
    assert.equal(of("apps/portal/src/api/a.ts"), null);
    assert.equal(of("apps/uc/src/shared/Dict.vue"), null);
    assert.equal(of("package.json"), null);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

// A hmrsfw-vue-like repo with origin/integration and an upgrade branch; a tool root with queue/ and registry/.
function fixture() {
  const dir = mkdtempSync(path.join(tmpdir(), "upg-plan-"));
  const git = (cwd, ...a) => execFileSync("git", ["-C", cwd, "-c", "user.name=t", "-c", "user.email=t@t", ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  const origin = path.join(dir, "origin.git"), app = path.join(dir, "app"), root = path.join(dir, "tool");
  const write = (base, f, s) => { mkdirSync(path.dirname(path.join(base, f)), { recursive: true }); writeFileSync(path.join(base, f), s); };
  execFileSync("git", ["init", "-q", "--bare", "-b", "main", origin]);
  execFileSync("git", ["clone", "-q", origin, app], { stdio: "ignore" });
  write(app, "package.json", '{"name":"hmrsfw-vue"}\n');
  write(app, "apps/portal/src/shared/Dict.vue", "<template><span>v1</span></template>\n");
  write(app, "apps/portal/src/views/merged/index.vue", "<template><div>merged</div></template>\n");
  write(app, "apps/portal/src/views/blocked/index.vue", "<template><div>blocked</div></template>\n");
  write(app, ".env", "VITE_HMRSFW_SM2_PUBLIC_KEY=test\nVITE_HMRSFW_SM4_KEY=test\n");
  git(app, "add", "-A"); git(app, "commit", "-q", "-m", "init"); git(app, "push", "-q", "origin", "HEAD:main", "HEAD:integration");
  // an SFC compiler for the compile check (any @vue/compiler-sfc will do here), excluded like setup-workdir's link
  symlinkSync(path.join(REPO, "tools/vuefp/node_modules"), path.join(app, "node_modules"));
  appendFileSync(path.join(app, ".git/info/exclude"), "node_modules\n");
  git(app, "fetch", "-q", "origin");
  git(app, "checkout", "-q", "-b", "restore/upg-1-a1", "origin/integration");
  write(app, "apps/portal/src/shared/Dict.vue", "<template><span>v2</span></template>\n");
  write(app, "apps/portal/public/sjz/home/marketTop.jpg", "jpg");
  git(app, "add", "-A"); git(app, "commit", "-q", "-m", "upgrade"); git(app, "push", "-q", "origin", "restore/upg-1-a1");
  const page = (id, target, deps) => write(root, `queue/${id}.json`, JSON.stringify({ id, type: "page", app: "portal", site: "portal", target, deps }));
  page("page.merged", "apps/portal/src/views/merged/index.vue", ["@/shared/Dict.vue"]);
  page("page.blocked", "apps/portal/src/views/blocked/index.vue", ["@/shared/Dict.vue"]); // the page the upgrade unblocks
  page("page.notyet", "apps/portal/src/views/notyet/index.vue", ["@/shared/Dict.vue"]); // not restored on the branch
  page("page.other", "apps/portal/src/views/merged/index.vue", ["@/shared/Other.vue"]); // depends on nothing changed
  write(root, "queue/S1.json", JSON.stringify({ id: "S1", type: "shared", app: "portal", files: ["apps/portal/src/shared/Dict.vue"], deps: ["@/shared/Dict.vue"] }));
  write(root, "registry/portal.json", JSON.stringify({ shared: { "Dict.1.js": { path: "@/shared/Dict.vue", owner: "S1" } }, entry: {}, api: {} }));
  return { dir, app, root, git, write, done: () => rmSync(dir, { recursive: true, force: true }) };
}

test("upgradePlan: the branch's changes against a fresh origin/integration; restored dependent pages minus the unblocked ones", () => {
  const fx = fixture();
  try {
    // integration moves on after the upgrade was cut: its change is not the upgrade's
    fx.git(fx.app, "checkout", "-q", "-b", "int", "origin/integration");
    fx.write(fx.app, "apps/portal/src/views/merged/index.vue", "<template><div>merged v2</div></template>\n");
    fx.git(fx.app, "commit", "-q", "-am", "page merged"); fx.git(fx.app, "push", "-q", "origin", "HEAD:integration");
    fx.git(fx.app, "update-ref", "refs/remotes/origin/integration", "origin/main"); // the local ref is stale
    const plan = upgradePlan({ appDir: fx.app, branch: "restore/upg-1-a1", unblocks: ["page.blocked"], root: fx.root });
    assert.deepEqual(plan.files.sort(), ["apps/portal/public/sjz/home/marketTop.jpg", "apps/portal/src/shared/Dict.vue"]);
    assert.deepEqual(plan.pages, ["page.merged"]);
    assert.deepEqual(plan.apps, ["portal"]);
    assert.deepEqual(upgradePlan({ appDir: fx.app, branch: "restore/upg-1-a1", only: ["page.other"], root: fx.root }).pages, ["page.other"], "--wo replaces the list");
  } finally { fx.done(); }
});

test("upgradePlan: a change outside apps/ (package.json, lock file) reaches every app", () => {
  const fx = fixture();
  try {
    fx.git(fx.app, "checkout", "-q", "restore/upg-1-a1");
    fx.write(fx.app, "package.json", '{"name":"hmrsfw-vue","dependencies":{"swiper":"6.8.4"}}\n');
    const plan = upgradePlan({ appDir: fx.app, root: fx.root }); // no branch: HEAD + working tree
    assert.ok(plan.files.includes("package.json"));
    assert.deepEqual(plan.apps, ["portal", "uc"]);
  } finally { fx.done(); }
});

const gateRun = (fx, args, env = {}) => {
  const r = spawnSync(process.execPath, [path.join(REPO, "tools/gate.mjs"), ...args, "--app", fx.app, "--interact-ref", "worktree"], { encoding: "utf8", env: { ...process.env, RESTORE_STATE: path.join(fx.dir, "state"), RESTORE_ASSETS: path.join(fx.dir, "assets"), ...env }, timeout: 120000 });
  return JSON.parse(r.stdout.trim().split("\n").pop());
};

test("gate --mode upgrade: a branch that changes a page file fails the static stage on scope, before any build", () => {
  const fx = fixture();
  try {
    fx.git(fx.app, "checkout", "-q", "restore/upg-1-a1");
    fx.write(fx.app, "apps/portal/src/views/blocked/index.vue", "<template><div>patched</div></template>\n");
    fx.git(fx.app, "commit", "-q", "-am", "patch the page");
    const r = gateRun(fx, ["--mode", "upgrade", "--dry-run", "--no-checkout"]);
    assert.equal(r.pass, false, JSON.stringify(r));
    assert.equal(r.mode, "upgrade");
    assert.equal(r.stage, "static");
    assert.deepEqual(r.failed.map((f) => [f.check, f.where]), [["scope", "apps/portal/src/views/blocked/index.vue"]]);
    assert.equal(r.stages.build, undefined, "no build after a scope failure");
  } finally { fx.done(); }
});

test("gate --mode upgrade: static runs compile / zero-reference on the changed files", () => {
  const fx = fixture();
  try {
    fx.git(fx.app, "checkout", "-q", "restore/upg-1-a1");
    fx.write(fx.app, "apps/portal/src/shared/tagcanvas.ts", "export const x = (;\n// see legacy-dist/portal/assets/index.js\n");
    const r = gateRun(fx, ["--mode", "upgrade", "--dry-run", "--no-checkout"]);
    assert.equal(r.stage, "static", JSON.stringify(r));
    assert.deepEqual(r.failed.map((f) => f.check).sort(), ["compile", "no-legacy"]);
  } finally { fx.done(); }
});

test("an upgrade task runs in upgrade mode even when the gate agent passes --mode page", () => {
  const fx = fixture();
  try {
    fx.git(fx.app, "checkout", "-q", "restore/upg-1-a1");
    fx.write(fx.app, "apps/portal/src/views/blocked/index.vue", "<template><div>patched</div></template>\n");
    fx.git(fx.app, "commit", "-q", "-am", "patch the page");
    const state = path.join(fx.dir, "multica.json");
    writeFileSync(state, JSON.stringify({ seq: 1, issues: { "up-1": { id: "up-1", title: "[upgrade] #1", status: "in_review", metadata: { kind: "upgrade", workOrders: JSON.stringify(["page.blocked"]), branch: "restore/upg-1-a1", attempt: 1 }, comments: [] } }, log: [] }));
    const bin = path.join(fx.dir, "multica");
    writeFileSync(bin, `#!/bin/sh\nexec "${process.execPath}" "${path.join(REPO, "tools/lib/fake-multica.mjs")}" "$@"\n`);
    chmodSync(bin, 0o755);
    const r = gateRun(fx, ["--task", "up-1", "--mode", "page", "--dry-run", "--no-checkout"], { MULTICA_BIN: bin, MULTICA_FAKE_STATE: state });
    assert.equal(r.mode, "upgrade", JSON.stringify(r));
    assert.equal(r.stage, "static");
    assert.equal(r.failed[0].check, "scope", "judged as an upgrade, not by check-imports rule 4 of page.blocked");
  } finally { fx.done(); }
});
