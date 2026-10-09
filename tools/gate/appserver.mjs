// The restored side of the gate: hmrsfw-vue served by Vite.
//
// Page mode compiles on demand (Vite dev server) instead of bundling: only the modules the page actually loads are
// compiled, about 70 for a typical page, against ~2,800 for a production build of the same single page. It runs with
// production semantics so the DOM is the one the real build produces:
//   NODE_ENV=production → @vitejs/plugin-vue compiles templates in production mode (no template comments kept, static
//   hoisting, inlined <script setup> templates), Vue's production runtime is pre-bundled (<!----> placeholders,
//   not <!--v-if-->), import.meta.env.PROD is true; no HMR client, no file watching, no dev proxy (nothing leaves the
//   machine: /xf-api/ is answered from the HAR by the browser context).
// Consistency with the full build is checked by `gate.mjs --build full` (same page, real `vite build`), see the PR.
//
// Pre-bundled dependencies (antd, icons, echarts, …) cost 10–20 s to build; they depend only on the lock file, the vite
// config and the node_modules location, so a finished set is published to $RESTORE_STATE/gate-cache/vite-deps/<key>/
// (atomic rename) and copied into each run's own cacheDir ($RESTORE_STATE/gate/<run>/vite). Vite checks a hash of the
// resolved config that includes the project root, which differs per checkout; depHash() reproduces Vite 4.4's
// getDepHash so the copied metadata is accepted. Pages that pull in a dependency the cache does not have still work:
// Vite re-optimises inside the run's own cacheDir and the runner reloads the page once.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";

const VITE_SUPPORTED = "4.4.9"; // depHash() mirrors this version's getDepHash

async function loadVite(appDir) {
  process.env.NODE_ENV = "production";
  return import(pathToFileURL(path.join(appDir, "node_modules/vite/dist/node/index.js")).href);
}
const viteVersion = (appDir) => JSON.parse(readFileSync(path.join(appDir, "node_modules/vite/package.json"), "utf8")).version;
const sha = (s) => createHash("sha256").update(s).digest("hex");

async function appConfig(vite, appDir, app, command) {
  const file = path.join(appDir, `vite.${app}.config.ts`);
  const { config } = await vite.loadConfigFromFile({ command, mode: "production" }, file, appDir, "silent");
  if (config.server) config.server = { ...config.server, proxy: undefined }; // never proxy /xf-api/ to the test environment
  return { config: { ...config, configFile: false }, file };
}

// Vite 4.4 getDepHash (dep-*.js: getDepHash), applied to a resolved config.
function depHash(config) {
  const names = ["package-lock.json", "yarn.lock", "pnpm-lock.yaml", "bun.lockb"];
  let dir = config.root, lock;
  while (dir && !lock) { lock = names.map((n) => path.join(dir, n)).find((p) => existsSync(p)); const up = path.dirname(dir); if (up === dir) break; dir = up; }
  let content = lock ? readFileSync(lock, "utf8") : "";
  if (lock && !lock.endsWith("pnpm-lock.yaml")) { const st = statDir(path.join(path.dirname(lock), "patches")); if (st) content += st.mtimeMs.toString(); }
  const o = config.optimizeDeps;
  content += JSON.stringify({
    mode: process.env.NODE_ENV || config.mode, root: config.root, resolve: config.resolve, buildTarget: config.build.target, assetsInclude: config.assetsInclude,
    plugins: config.plugins.map((p) => p.name),
    optimizeDeps: { include: o?.include, exclude: o?.exclude, esbuildOptions: { ...o?.esbuildOptions, plugins: o?.esbuildOptions?.plugins?.map((p) => p.name) } },
  }, (_, v) => (typeof v === "function" || v instanceof RegExp ? v.toString() : v));
  return sha(content).slice(0, 8);
}
function statDir(p) { try { const s = statSync(p); return s.isDirectory() ? s : null; } catch { return null; } }

function depsCacheKey(appDir, app, configFile) {
  return sha([viteVersion(appDir), app, process.platform, process.arch, process.versions.node.split(".")[0], realpathSync(path.join(appDir, "node_modules")), sha(readFileSync(path.join(appDir, "package-lock.json"))), sha(readFileSync(configFile))].join("|")).slice(0, 16);
}
function cloneDir(src, dst) {
  rmSync(dst, { recursive: true, force: true });
  mkdirSync(path.dirname(dst), { recursive: true });
  try { execFileSync("cp", ["-cR", src, dst], { stdio: "ignore" }); } catch { cpSync(src, dst, { recursive: true }); } // APFS clone when possible
}

// Plugin: make sure the work order's route reaches the page even when the app router does not list it yet (page
// orders may not edit router.ts); appended after the router is created, before the app uses it.
function routePlugin({ appDir, app, routes }) {
  const routerFile = path.join(appDir, "apps", app, "src/router.ts");
  return {
    name: "gate-route",
    enforce: "post",
    transform(code, id) {
      if (id.split("?")[0] !== routerFile || !routes.length || !/export const router\b/.test(code)) return null;
      const add = routes.map((r) => `{ const m = router.resolve(${JSON.stringify(r.recordPath)}).matched; if (!m.length || /pathMatch/.test(m[m.length - 1].path)) router.addRoute({ path: ${JSON.stringify(r.route)}, component: () => import(${JSON.stringify(r.file)}) }); }`).join("\n");
      return { code: code + "\n// gate: routes of the work orders under test\n" + add + "\n", map: null };
    },
  };
}
// Plugin for a single-page production build: the router lists only the page (plus a catch-all).
function singleRoutePlugin({ appDir, app, routes }) {
  const routerFile = path.join(appDir, "apps", app, "src/router.ts");
  return {
    name: "gate-single-route",
    enforce: "pre",
    load(id) {
      if (id !== routerFile) return null;
      return `import { createRouter, createWebHistory } from "vue-router";\nexport const router = createRouter({ history: createWebHistory("/"), routes: [${routes.map((r) => `{ path: ${JSON.stringify(r.route)}, component: () => import(${JSON.stringify(r.file)}) }`).join(", ")}, { path: "/:pathMatch(.*)*", component: { render: () => null } }] });\n`;
    },
  };
}

// Plugin: asset imports (`import x from "./a.png"`, template src="./a.png", `?url`) resolve to the URL `vite build`
// gives them, not to the dev URL /src/…/a.png (c01 failed in page mode only, because of that). Mirrors Vite 4.4.9
// fileToBuiltUrl + Rollup 3 generateAssetFileName: files under build.assetsInlineLimit (except .svg, .html, Git LFS
// placeholders) become `data:<mime>;base64,…`, the rest `<base><assetFileNames>` with [hash] = sha256(content) hex,
// first 8; the server answers those URLs from the source file. Files in public/ and ?raw / ?inline / ?worker imports
// are left to Vite (same URL in both). Not mirrored: Rollup's de-duplication of two differently named files with
// identical content (the build names both after the first one emitted). CSS url() keeps dev URLs: it is not part of
// the compared DOM and the pixels are the same.
const SKIP_QUERY = /[?&](raw|inline|worker|sharedworker)\b/;
const INVALID_CHAR = /[\u0000-\u001F"#$&*+,:;<=>?[\]^`{|}\u007F]/g; // Rollup sanitizeFileName
function viteMimes(appDir) {
  const dir = path.join(appDir, "node_modules/vite/dist/node/chunks");
  for (const f of readdirSync(dir)) {
    const src = readFileSync(path.join(dir, f), "utf8");
    const m = /\nconst mimes\$1 = (\{[^}]*\});/.exec(src);
    if (m) return JSON.parse(m[1].replace(/,\s*\}$/, "}"));
  }
  throw new Error("gate: mime table not found in vite's chunks (vite version changed?)");
}
export function buildAssetsPlugin({ appDir }) {
  let config, mimes;
  const emitted = new Map(); // "/assets/a-1234abcd.png" → source file
  return {
    name: "gate-build-assets",
    enforce: "pre",
    configResolved(c) { config = c; },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const file = emitted.get(decodeURIComponent((req.url ?? "").split("?")[0]));
        if (!file) return next();
        res.setHeader("Content-Type", (mimes ??= viteMimes(appDir))[path.extname(file).slice(1).toLowerCase()] ?? "application/octet-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.end(readFileSync(file));
      });
    },
    load(id) {
      if (id[0] === "\0" || SKIP_QUERY.test(id)) return null;
      const file = id.split(/[?#]/)[0];
      if (!/[?&]url\b/.test(id) && !config.assetsInclude(file)) return null;
      if (!existsSync(file) || (config.publicDir && file.startsWith(config.publicDir + path.sep))) return null;
      return `export default ${JSON.stringify(builtUrl(file))}`;
    },
  };
  function builtUrl(file) {
    const content = readFileSync(file);
    const lfs = content.subarray(0, 100).toString().startsWith("version https://git-lfs.github.com");
    if (!file.endsWith(".svg") && !file.endsWith(".html") && content.length < Number(config.build.assetsInlineLimit) && !lfs) {
      mimes ??= viteMimes(appDir);
      return `data:${mimes[path.extname(file).slice(1).toLowerCase()] ?? "application/octet-stream"};base64,${content.toString("base64")}`;
    }
    const out = [config.build.rollupOptions?.output].flat()[0]?.assetFileNames ?? path.posix.join(config.build.assetsDir, "[name]-[hash].[ext]");
    const name = path.basename(file).replace(INVALID_CHAR, "_");
    const ext = path.extname(name);
    const pattern = typeof out === "function" ? out({ name: path.basename(file), source: content, type: "asset" }) : out;
    const hash = sha(content);
    const fileName = pattern.replace(/\[(\w+)(?::(\d+))?\]/g, (_, k, n) => ({ name: name.slice(0, name.length - ext.length), ext: ext.slice(1), extname: ext, hash: hash.slice(0, Number(n) || 8) })[k] ?? _);
    const url = config.base + fileName;
    emitted.set(url, file);
    return url;
  }
}

// opts: { appDir, app, gateDir, stateRoot, routes:[{route, recordPath, file}], plugins:[] }
export async function startOnDemand(opts) {
  const { appDir, app, gateDir } = opts;
  const vite = await loadVite(appDir);
  const { config, file } = await appConfig(vite, appDir, app, "serve");
  const cacheDir = path.join(gateDir, "vite");
  const key = depsCacheKey(appDir, app, file);
  const shared = path.join(opts.stateRoot, "gate-cache", "vite-deps", `${app}-${key}`);
  const supported = viteVersion(appDir) === VITE_SUPPORTED;
  let seeded = false;
  if (supported && existsSync(path.join(shared, "_metadata.json"))) { cloneDir(shared, path.join(cacheDir, "deps")); seeded = true; }
  const messages = [];
  const logger = { info: (m) => messages.push(m), warn: (m) => messages.push("warn " + m), warnOnce: (m) => messages.push("warn " + m), error: (m) => messages.push("error " + m), clearScreen() {}, hasErrorLogged: () => false, hasWarned: false };
  const seedHash = {
    name: "gate-deps-seed",
    configResolved(c) {
      if (!seeded) return;
      const mf = path.join(cacheDir, "deps", "_metadata.json");
      const m = JSON.parse(readFileSync(mf, "utf8"));
      m.hash = depHash(c);
      writeFileSync(mf, JSON.stringify(m, null, 2));
    },
  };
  const server = await vite.createServer(vite.mergeConfig(config, {
    plugins: [seedHash, buildAssetsPlugin(opts), routePlugin(opts), ...(opts.plugins ?? [])],
    mode: "production", cacheDir, customLogger: logger, clearScreen: false,
    server: { port: 0, host: "127.0.0.1", strictPort: false, hmr: false, watch: { ignored: ["**/*"] }, fs: { strict: true, allow: [appDir, gateDir, realpathSync(path.join(appDir, "node_modules")), ...(opts.allow ?? [])] } },
  }));
  await server.listen();
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  const root = server.config.root;
  return {
    origin, server, messages, seeded,
    // Compile the page and everything it imports from the app (not node_modules) before the browser starts, so compile
    // and import-resolution errors are reported as the build stage. Returns [{file, error}].
    async precompile(files) {
      const errors = [], seen = new Set();
      const queue = files.map((f) => "/" + path.relative(root, f).split(path.sep).join("/"));
      while (queue.length) {
        const url = queue.shift();
        if (seen.has(url)) continue;
        seen.add(url);
        try { await server.transformRequest(url); } catch (e) { errors.push({ file: url, error: String(e.message).split("\n")[0].slice(0, 240) }); continue; }
        const mod = await server.moduleGraph.getModuleByUrl(url);
        for (const dep of mod?.importedModules ?? []) {
          if (!dep.file || dep.file.includes("/node_modules/") || dep.file.startsWith(cacheDir)) continue;
          queue.push(dep.url);
        }
      }
      return errors;
    },
    // Publish this run's pre-bundled deps for later runs (first writer wins; never overwrites).
    publishDeps() {
      const src = path.join(cacheDir, "deps");
      if (!supported || seeded || existsSync(shared) || !existsSync(path.join(src, "_metadata.json"))) return false;
      const tmp = `${shared}.tmp-${process.pid}`;
      cloneDir(src, tmp);
      for (const n of readdirSync(tmp)) if (n.startsWith("deps_temp")) rmSync(path.join(tmp, n), { recursive: true, force: true });
      const mf = path.join(tmp, "_metadata.json");
      const m = JSON.parse(readFileSync(mf, "utf8"));
      for (const d of Object.values(m.optimized ?? {})) d.src = path.resolve(src, d.src); // absolute: valid from any cacheDir
      writeFileSync(mf, JSON.stringify(m, null, 2));
      try { renameSync(tmp, shared); return true; } catch { rmSync(tmp, { recursive: true, force: true }); return false; }
    },
    depHash: () => depHash(server.config),
    // Closing while the dependency optimizer is still bundling (a page that failed early) cancels esbuild, and Vite's
    // close() then never settles: give it 5 s, the CLI exits after printing anyway.
    close: () => { let t; return Promise.race([server.close().catch(() => {}), new Promise((r) => { t = setTimeout(r, 5000); })]).finally(() => clearTimeout(t)); },
  };
}

// Production build into the gate dir. singlePage: routes = the work orders' routes only (fast consistency check);
// otherwise the whole app (integration). public/ is not copied for single pages: the static server serves it from the
// app's source instead.
export async function buildApp({ appDir, app, gateDir, routes, singlePage, plugins = [] }) {
  const vite = await loadVite(appDir);
  const { config } = await appConfig(vite, appDir, app, "build");
  const outDir = path.join(gateDir, "dist", app);
  const messages = [];
  const logger = { info: () => {}, warn: (m) => messages.push("warn " + m), warnOnce: () => {}, error: (m) => messages.push("error " + m), clearScreen() {}, hasErrorLogged: () => false, hasWarned: false };
  await vite.build(vite.mergeConfig(config, {
    plugins: [...(singlePage ? [singleRoutePlugin({ appDir, app, routes })] : [routePlugin({ appDir, app, routes })]), ...plugins],
    mode: "production", cacheDir: path.join(gateDir, "vite-build"), customLogger: logger, clearScreen: false,
    ...(singlePage ? { publicDir: false } : {}),
    build: { outDir, emptyOutDir: true, reportCompressedSize: false },
  }));
  return { outDir, publicDir: path.join(appDir, "apps", app, "public"), messages };
}
