// Test fixture for the scheduler scripts: a throw-away $RESTORE_STATE with a synthetic roster, a fake Multica state,
// a fixture tool repo (queue/, registry/, receipts/) and a fixture hmrsfw-vue repo, both with local bare "origin"s.
// Nothing here talks to the real workspace or GitHub.
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

export const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const git = (cwd, ...args) => { const r = spawnSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", ...args], { cwd, encoding: "utf8" }); if (r.status !== 0) throw new Error(`git ${args.join(" ")}: ${r.stderr}`); return r.stdout.trim(); };
export { git };

// Mirrors the live roster since 2026-10-15: every agent on the Mac mini (Office-Server retired). Tests that need a
// second machine add its agents themselves (machines.test.mjs).
export const ROSTER = (prefix = "a") => {
  // reviewers carry the live roster's naming ("@" and Chinese), which metadata keys must not be built from
  const NAMES = { "review-claude": "复核-Claude@Mac", "review-deepseek": "复核-DeepSeek@Mac", "review-glm": "复核-GLM@Mac" };
  const A = (key, role, family, model, machine, maxConcurrent) => ({ name: NAMES[key] ?? key, id: `${prefix}-${key}`, role, family, model, machine, runtimeId: `rt-${family}-${machine}`, maxConcurrent });
  return {
    version: 1,
    agents: [
      A("dispatcher", "dispatcher", "anthropic", "claude-sonnet-5-5", "mac-mini", 3),
      A("gate", "gate", "anthropic", "claude-sonnet-5-5", "mac-mini", 3),
      A("recorder", "recorder", "anthropic", "claude-sonnet-5-5", "mac-mini", 2),
      A("fixer", "fixer", "anthropic", "claude-opus-5-5", "mac-mini", 2),
      A("arbiter", "arbiter", "anthropic", "claude-opus-5-5", "mac-mini", 2),
      A("sonnet-mac", "restorer", "anthropic", "claude-sonnet-5-5", "mac-mini", 2),
      A("deepseek-mac", "restorer", "deepseek", "deepseek-official/deepseek-flash", "mac-mini", 2),
      A("glm-mac", "restorer", "zhipu", "zhipuai-coding-plan/glm-5.3-flash", "mac-mini", 1),
      A("opus-mac", "restorer-core", "anthropic", "claude-opus-5-5", "mac-mini", 2),
      A("review-claude", "reviewer", "anthropic", "claude-sonnet-5-5", "mac-mini", 2),
      A("review-deepseek", "reviewer", "deepseek", "deepseek-official/deepseek-v4-pro", "mac-mini", 2),
      A("review-glm", "reviewer", "zhipu", "zhipuai-coding-plan/glm-5.3", "mac-mini", 2),
    ],
    escalateTo: { name: "human", memberId: "member-human" },
  };
};

export function makeFixture({ orders = [], config = {}, registry = null, roster: rosterIn = null } = {}) {
  const root = mkdtempSync(path.join(os.tmpdir(), "hmrsfw-sched-test-"));
  const state = path.join(root, "state");
  for (const d of ["ledger", "locks", "gate", "baseline"]) mkdirSync(path.join(state, d), { recursive: true });
  const roster = rosterIn || ROSTER();
  writeFileSync(path.join(state, "agents.roster.json"), JSON.stringify(roster, null, 1));
  writeFileSync(path.join(state, "scheduler.config.json"), JSON.stringify({ projectId: "proj-1", ...config }, null, 1));
  const fake = path.join(root, "multica.json");
  const runtimes = [...new Set(roster.agents.map((a) => a.runtimeId))].map((id) => ({ id, provider: id.includes("anthropic") ? "claude" : id.includes("deepseek") ? "dsh" : "opencode", status: "online", metadata: { version: "1.0.0-test", cli_version: "v0.0.0-test" } }));
  writeFileSync(fake, JSON.stringify({ seq: 0, issues: {}, log: [], runtimes }));

  // product repo (hmrsfw-vue)
  const appOrigin = path.join(root, "app-origin.git");
  const app = path.join(root, "app");
  git(root, "init", "-q", "--bare", "-b", "main", appOrigin);
  git(root, "clone", "-q", appOrigin, app);
  writeFileSync(path.join(app, "package.json"), JSON.stringify({ name: "hmrsfw-vue", private: true }));
  mkdirSync(path.join(app, "apps/portal/src/shared"), { recursive: true });
  mkdirSync(path.join(app, "apps/portal/src/views"), { recursive: true });
  writeFileSync(path.join(app, "apps/portal/src/shared/Dict.vue"), "<template><span>dict v1</span></template>\n");
  writeFileSync(path.join(app, "apps/portal/src/views/.keep"), "");
  git(app, "add", "-A"); git(app, "commit", "-q", "-m", "init"); git(app, "push", "-q", "origin", "main");
  git(app, "push", "-q", "origin", "main:integration");

  // tool repo (hmrsfw-restore) fixture
  const toolOrigin = path.join(root, "tool-origin.git");
  const tool = path.join(root, "tool");
  git(root, "init", "-q", "--bare", "-b", "main", toolOrigin);
  git(root, "clone", "-q", toolOrigin, tool);
  mkdirSync(path.join(tool, "queue"), { recursive: true });
  mkdirSync(path.join(tool, "registry"), { recursive: true });
  mkdirSync(path.join(tool, "receipts"), { recursive: true });
  for (const o of orders) writeFileSync(path.join(tool, "queue", `${o.id}.json`), JSON.stringify(o, null, 1));
  writeFileSync(path.join(tool, "registry", "portal.json"), JSON.stringify(registry || { shared: { "Dict.123.js": { path: "@/shared/Dict.vue", export: "default", status: "restored", owner: "S1" } }, entry: {}, api: {}, globals: {}, npm: {} }, null, 1));
  writeFileSync(path.join(tool, "rules.json"), JSON.stringify({ rules: ["base"] }));
  writeFileSync(path.join(tool, "receipts", ".keep"), "");
  git(tool, "add", "-A"); git(tool, "commit", "-q", "-m", "init"); git(tool, "push", "-q", "origin", "main");
  git(tool, "push", "-q", "origin", "main:integration");

  // one unsharded tick ("*"), as before sharding; machines.test.mjs passes --machine per process
  const env = { ...process.env, RESTORE_STATE: state, MULTICA_FAKE_STATE: fake, HMRSFW_TOOL_ROOT: tool, HMRSFW_APP_DIR: app, HMRSFW_MACHINE: "*" };
  delete env.MULTICA_DRY_RUN;
  return { root, state, fake, app, tool, appOrigin, toolOrigin, env, roster, id: (name) => `a-${name}` };
}

export function node(fx, script, args = [], extraEnv = {}) {
  const r = spawnSync(process.execPath, [path.join(REPO, "tools", script), ...args], { cwd: fx.tool, env: { ...fx.env, ...extraEnv }, encoding: "utf8" });
  let out = null;
  try { out = JSON.parse(r.stdout.trim().split("\n").pop()); } catch { out = { raw: r.stdout, stderr: r.stderr }; }
  if (r.status !== 0 && !(out && out.ok === false)) out = { ...out, exit: r.status, stderr: r.stderr };
  return out;
}

export const fakeState = (fx) => JSON.parse(readFileSync(fx.fake, "utf8"));
export const issuesOf = (fx) => Object.values(fakeState(fx).issues);
export const readJson = (p, d) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : d);

// Run the fake CLI directly (what an agent would do through `multica`).
export function mc(fx, ...args) {
  const r = spawnSync(process.execPath, [path.join(REPO, "tools/lib/fake-multica.mjs"), ...args], { env: fx.env, encoding: "utf8" });
  if (r.status !== 0) throw new Error(`fake multica ${args.join(" ")}: ${r.stderr}`);
  return r.stdout ? JSON.parse(r.stdout) : null;
}
export const setMeta = (fx, id, key, value) => mc(fx, "issue", "metadata", "set", id, "--key", key, "--type", "string", "--value", typeof value === "string" ? value : JSON.stringify(value));
export const meta = (fx, id) => { const m = mc(fx, "issue", "metadata", "list", id); return Object.fromEntries(Object.entries(m).map(([k, v]) => { try { return [k, typeof v === "string" && /^[[{]/.test(v) ? JSON.parse(v) : v]; } catch { return [k, v]; } })); };

// Simulated restorer / fixer: commit page files on the task's branch in a clone of the product repo and push.
export function pushBranch(fx, { branch, from = "integration", files }) {
  const wt = mkdtempSync(path.join(fx.root, "wt-"));
  git(fx.root, "clone", "-q", fx.appOrigin, wt);
  const exists = spawnSync("git", ["ls-remote", "--exit-code", "--heads", "origin", branch], { cwd: wt }).status === 0;
  if (exists) git(wt, "checkout", "-q", "-B", branch, `origin/${branch}`); else git(wt, "checkout", "-q", "-b", branch, `origin/${from}`);
  for (const [rel, content] of Object.entries(files)) { mkdirSync(path.dirname(path.join(wt, rel)), { recursive: true }); writeFileSync(path.join(wt, rel), content); }
  git(wt, "add", "-A"); git(wt, "commit", "-q", "-m", `work on ${branch}`); git(wt, "push", "-q", "origin", branch);
}

export function writeReceipt(fx, wo, extra = {}) {
  writeFileSync(path.join(fx.tool, "receipts", `${wo}.json`), JSON.stringify({ ticket: wo, id: wo, group: "test", result: "ok", outputs: [], todos: [], needsFromSkeleton: [], selfCheck: { pass: true }, ...extra }, null, 1));
}

export function lsRemote(fx, repo, branch) { return git(fx.root, "ls-remote", repo === "app" ? fx.appOrigin : fx.toolOrigin, `refs/heads/${branch}`).split("\t")[0] || null; }
export function showRemote(fx, repo, branch, file) {
  const r = spawnSync("git", ["--git-dir", repo === "app" ? fx.appOrigin : fx.toolOrigin, "show", `${branch}:${file}`], { encoding: "utf8" });
  return r.status === 0 ? r.stdout : null;
}
