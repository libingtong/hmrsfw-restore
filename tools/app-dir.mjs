// Locates the hmrsfw-vue checkout (the product project) for any tool in this repo (docs/pipeline.md §12 命令行).
// Order: `--app <dir>` (or `--app=<dir>`) on the command line > env HMRSFW_APP_DIR. Neither → throws; there is no default
// path, so a tool never silently builds or checks some other copy of the project.
// Usage: import { appDir } from "./app-dir.mjs"; const APP = appDir();   // absolute path
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export const APP_PACKAGE_NAME = "hmrsfw-vue";

export function appDir(argv = process.argv.slice(2), env = process.env) {
  const i = argv.findIndex((a) => a === "--app" || a.startsWith("--app="));
  const fromArg = i < 0 ? undefined : argv[i].startsWith("--app=") ? argv[i].slice(6) : argv[i + 1];
  if (i >= 0 && (!fromArg || fromArg.startsWith("--"))) throw new Error("--app needs a directory: --app <hmrsfw-vue checkout>");
  const raw = fromArg ?? env.HMRSFW_APP_DIR;
  if (!raw) throw new Error("hmrsfw-vue checkout not given: pass --app <dir> or set HMRSFW_APP_DIR");
  const dir = path.resolve(raw);
  let name;
  try { name = JSON.parse(readFileSync(path.join(dir, "package.json"), "utf8")).name; } catch { name = undefined; }
  if (name !== APP_PACKAGE_NAME || !existsSync(path.join(dir, "apps")))
    throw new Error(`${dir} is not a hmrsfw-vue checkout (expected package.json name "${APP_PACKAGE_NAME}" and apps/)`);
  return dir;
}
