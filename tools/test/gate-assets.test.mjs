// HMRSFW_APP_DIR=<hmrsfw-vue checkout> node --test tools/test/gate-assets.test.mjs
// The gate's on-demand server gives every asset of hmrsfw-vue the same URL `vite build` gives it (data: URI under
// assetsInlineLimit, /assets/<name>-<hash>.<ext> otherwise). Builds one throwaway entry that imports every asset under
// apps/<app>/src with the app's own vite config and compares the built values with buildAssetsPlugin's. A second test
// per app compiles one SFC through a real on-demand server (the gate's plugin, the app's config) and through
// `vite build`: template src="./a.png", one file under and one over assetsInlineLimit, must give the build's URLs
// (HM-778). Skipped when HMRSFW_APP_DIR is not set.
import "../gate/prod-env.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import os from "node:os";
import { createHash, randomBytes } from "node:crypto";
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
      // Three extra files cover emitted assets (one with a character Rollup sanitises) and the exact-limit edge, whether
      // or not the app's own images include any over the inline limit.
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
      assert.ok(ours.some((u) => u.startsWith("data:")) && ["/assets/big_name-", "/assets/edge-"].every((p) => ours.some((u) => u.startsWith(p))) && ours.some((u) => u.startsWith("data:image/gif")), "inline and emitted assets covered");
    } finally { rmSync(tmp, { recursive: true, force: true }); }
  });
}

// Fixtures live in a temp dir inside the checkout (bare imports such as "vue" resolve from its node_modules) that is
// also the Vite root: plugin-vue only takes its dev-server branch for files under the root.
const FIXTURE_VUE = `<template><div><img class="t" src="./img/small.png" /><img class="t" src="./img/big.png" /></div></template>
`;
const urlStrings = (code) => [...code.matchAll(/"(data:[^"]*|\/assets\/[^"]*)"/g)].map((m) => m[1]);
const short = (u) => (u.startsWith("data:") ? `${u.slice(0, u.indexOf(",") + 1)}…sha256:${createHash("sha256").update(u).digest("hex").slice(0, 12)}` : u);

for (const app of ["portal", "uc"]) {
  test(`${app}: template src on demand equals vite build's`, { skip: !APP && "HMRSFW_APP_DIR not set" }, async () => {
    const vite = await import(pathToFileURL(path.join(APP, "node_modules/vite/dist/node/index.js")).href);
    const tmp = mkdtempSync(path.join(APP, ".gate-assets-"));
    try {
      const { config } = await vite.loadConfigFromFile({ command: "build", mode: "production" }, path.join(APP, `vite.${app}.config.ts`), APP, "silent");
      const limit = Number(config.build?.assetsInlineLimit ?? 4096);
      mkdirSync(path.join(tmp, "img"));
      writeFileSync(path.join(tmp, "img/small.png"), randomBytes(limit - 1000));
      writeFileSync(path.join(tmp, "img/big.png"), randomBytes(limit + 1000));
      writeFileSync(path.join(tmp, "c.vue"), FIXTURE_VUE);
      writeFileSync(path.join(tmp, "entry.js"), `import C from "./c.vue";\nexport default C;\n`);
      const base = { ...config, configFile: false, root: tmp, logLevel: "silent", publicDir: false, mode: "production" };

      // vite build: every URL string the bundle holds (Vue itself is external)
      const outDir = path.join(tmp, "dist");
      await vite.build(vite.mergeConfig(base, {
        cacheDir: path.join(tmp, "vite-build"),
        build: { outDir, emptyOutDir: true, write: true, rollupOptions: { input: path.join(tmp, "entry.js"), external: (id) => /node_modules|^vue(-portal)?(\/|$)/.test(id), preserveEntrySignatures: "strict", output: { entryFileNames: "entry.mjs" } } },
      }));
      const built = urlStrings(readFileSync(path.join(outDir, "entry.mjs"), "utf8")).map(short).sort();

      // on demand: template imports resolved through the server (the gate plugin's load)
      const server = await vite.createServer(vite.mergeConfig(base, {
        cacheDir: path.join(tmp, "vite"), appType: "custom", optimizeDeps: { disabled: true },
        plugins: [buildAssetsPlugin({ appDir: APP })],
        server: { middlewareMode: true, hmr: false, watch: { ignored: ["**/*"] } },
      }));
      const ours = [], leftovers = [];
      try {
        for (const url of ["/c.vue"]) {
          const { code } = await server.transformRequest(url);
          for (const [, spec] of code.matchAll(/^import \w+ from "([^"]*\/img\/[^"]*)";?$/gm)) ours.push(JSON.parse(/^export default (".*")/m.exec((await server.transformRequest(spec)).code)[1]));
          const rest = code.replace(/^import .*$/gm, "");
          if (/\/img\//.test(rest)) leftovers.push(`${url}: ${/.{0,60}\/img\/.{0,30}/.exec(rest)[0]}`);
        }
      } finally { await server.close(); }

      assert.deepEqual(leftovers, [], "dev URLs left in the compiled code");
      assert.deepEqual(ours.map(short).sort(), built);
      assert.equal(built.length, 2, "2 template imports");
      assert.ok(built.some((u) => u.startsWith("data:")) && built.some((u) => u.startsWith("/assets/big-")), "inline and emitted assets covered");
    } finally { rmSync(tmp, { recursive: true, force: true }); }
  });
}
