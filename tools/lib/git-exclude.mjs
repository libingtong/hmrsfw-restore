// Makes sure git in <repo> ignores <name> at the top of the checkout, through the repository's info/exclude (shared by all
// worktrees of it; nothing tracked changes). No-op outside a git checkout or when a rule already covers it.
// hmrsfw-vue's .gitignore has `node_modules/`, which matches directories only, not a node_modules symlink: setup-workdir.mjs
// (cache link) and gate.mjs (the --branch worktree's link) both add it here.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

export function gitExclude(repo, name, why) {
  const git = (...a) => execFileSync("git", ["-C", repo, ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  try { git("rev-parse", "--git-dir"); } catch { return; }
  try { git("check-ignore", "-q", "--", name); return; } catch {} // exit 1: not ignored
  const file = path.resolve(repo, git("rev-parse", "--git-path", "info/exclude").trim());
  mkdirSync(path.dirname(file), { recursive: true });
  const cur = existsSync(file) ? readFileSync(file, "utf8") : "";
  writeFileSync(file, `${cur}${cur && !cur.endsWith("\n") ? "\n" : ""}# ${why}\n/${name}\n`);
}
