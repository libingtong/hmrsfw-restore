// HMRSFW_APP_DIR=<hmrsfw-vue checkout> node --test tools/test/gate-assets.test.mjs
// The gate's on-demand server gives every asset of hmrsfw-vue the same URL `vite build` gives it (data: URI under
// assetsInlineLimit, /assets/<name>-<hash>.<ext> otherwise). Builds one throwaway entry that imports every asset under
// apps/<app>/src with the app's own vite config and compares the built values with buildAssetsPlugin's. Skipped when
// HMRSFW_APP_DIR is not set.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import os from "node:os";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { buildAssetsPlugin } from "../gate/appserver.mjs";

const APP = process.env.HMRSFW_APP_DIR && path.resolve(process.env.HMRSFW_APP_DIR);
const IMG = /\.(png|jpe?g|gif|svg|webp|ico|bmp)$/i;
const walk = (d) => readdirSync(d).flatMap((n) => { const p = path.join(d, n); return statSync(p).isDirectory() ? walk(p) : [p]; });

for (const app of ["portal", "uc"]) {
  test(`${app}: on-demand asset URLs equal vite build's`, { skip: !APP && "HMRSFW_APP_DIR not set" }, async () => {
    const vite = await import(pathToFileURL(path.join(APP, "node_modules/vite/dist/node/index.js")).href);
    const tmp = mkdtempSync(path.join(os.tmpdir(), "gate-assets-"));
    try {
      // The app's own images are all under the inline limit today; two extra files cover emitted assets (one with a
      // character Rollup sanitises) and the exact-limit edge.
      const extra = [["big+name.png", 9000], ["edge.jpg", 4096], ["under.gif", 4095]].map(([n, size]) => { const f = path.join(tmp, n); writeFileSync(f, randomBytes(size)); return f; });
      const files = [...walk(path.join(APP, "apps", app, "src")).filter((f) => IMG.test(f)).sort(), ...extra];
      const entry = path.join(tmp, "entry.js");
      writeFileSync(entry, files.map((f, i) => `import a${i} from ${JSON.stringify(f)};`).join("\n") + `\nexport default [${files.map((_, i) => `a${i}`).join(", ")}];\n`);
      const { config } = await vite.loadConfigFromFile({ command: "build", mode: "production" }, path.join(APP, `vite.${app}.config.ts`), APP, "silent");
      const outDir = path.join(tmp, "dist");
      await vite.build(vite.mergeConfig({ ...config, configFile: false }, {
        logLevel: "silent", cacheDir: path.join(tmp, "vite"), publicDir: false,
        build: { outDir, emptyOutDir: true, write: true, rollupOptions: { input: entry, preserveEntrySignatures: "strict", output: { entryFileNames: "entry.mjs" } } },
      }));
      const built = (await import(pathToFileURL(path.join(outDir, "entry.mjs")).href)).default;

      const resolved = await vite.resolveConfig({ ...config, configFile: false, logLevel: "silent" }, "serve", "production");
      const plugin = buildAssetsPlugin({ appDir: APP });
      plugin.configResolved(resolved);
      const ours = files.map((f) => JSON.parse(/^export default (.*)$/.exec(plugin.load(f))[1]));
      const diff = files.map((f, i) => [path.relative(APP, f), built[i], ours[i]]).filter(([, b, o]) => b !== o);
      assert.deepEqual(diff.map(([f, b, o]) => `${f}: build ${b.slice(0, 60)} | gate ${o.slice(0, 60)}`), []);
      assert.ok(ours.some((u) => u.startsWith("data:")) && ours.filter((u) => u.startsWith("/assets/")).length === 2, "inline and emitted assets covered");
    } finally { rmSync(tmp, { recursive: true, force: true }); }
  });
}
