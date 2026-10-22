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
// The fallback route keeps the page mounted top-level under #poc-main (the restored root is #poc-main's first child,
// HM-779), but carries the meta the app's own record would give: the portal router adds the records of the router file
// (router-xjhm.json, meta such as hideHeader / hideFooter) in its first beforeEach, after this code ran, and the
// meta-less fallback hid them from the shell, which then showed the header and footer the original hides (HM-250).
// Every app addRoute re-adds the fallback with the merged meta of the app's records for that path (none → {}). The
// fallback is `strict` (+0.7 path score in vue-router 4, root path included), so it still wins over a same-path record
// added later, as it did by insertion order before. It has no name, so a navigation spread from a route it matched
// (`next({ ...to, replace: true })`) still resolves by path.
export const gateRouteCode = (routes) => routes.map((r) => {
  const P = JSON.stringify(r.recordPath), rec = (meta) => `{ path: ${JSON.stringify(r.route)}, strict: true, meta: ${meta}, component: () => import(${JSON.stringify(r.file)}) }`;
  return `{ const unmatched = () => { const m = router.resolve(${P}).matched; return !m.length || /pathMatch/.test(m[m.length - 1].path); };
  if (unmatched()) { const add = router.addRoute; let drop = add(${rec("{}")});
    router.addRoute = (...a) => { const out = add(...a); drop(); const meta = unmatched() ? {} : { ...router.resolve(${P}).meta }; drop = add(${rec("meta")}); return out; }; } }`;
}).join("\n");
function routePlugin({ appDir, app, routes }) {
  const routerFile = path.join(appDir, "apps", app, "src/router.ts");
  return {
    name: "gate-route",
    enforce: "post",
    transform(code, id) {
      if (id.split("?")[0] !== routerFile || !routes.length || !/export const router\b/.test(code)) return null;
      return { code: code + "\n// gate: routes of the work orders under test\n" + gateRouteCode(routes) + "\n", map: null };
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
// Template src="./a.png": with a dev server, @vitejs/plugin-vue 4.3.4 (resolveTemplateCompilerOptions) passes the
// compiler transformAssetUrls { base: <dev base>/<dir of the .vue> }, which rewrites "./a.png" to the string
// "/src/…/a.png" with no import, so load() never sees it (HM-778). The build passes { includeAbsolute: true } instead,
// which turns relative, absolute and aliased src into imports. vueBuildAssetUrls() sets the build value as the plugin's
// own template.transformAssetUrls (base: null overrides the dev base in plugin-vue's merge), so the template compiles
// to the same imports as in the build and the asset goes through load() like an explicit import.
// new URL("./a.png", import.meta.url): Vite's vite:asset-import-meta-url gives it fileToDevUrl when serving and
// fileToBuiltUrl when building (HM-778). The second plugin, gate-build-assets-url, runs as a normal plugin (after
// plugin-vue has compiled the SFC, before vite:asset-import-meta-url) and rewrites such an expression the way the build
// does: new URL("<built URL>", self.location). Same match as Vite 4.4.9 (string literal first argument; a template
// literal with ${} is a glob and left to Vite); a relative URL is resolved against the importer, others with the
// resolver (aliases). Left to Vite, same URL in both modes: public/ files, files that do not exist (Vite keeps the URL
// as written). Not mirrored: Vite skips matches inside comments and strings (strip-literal); rewriting a commented-out
// expression has no effect, and an asset URL expression spelled inside a string literal does not occur in the app.
const SKIP_QUERY = /[?&](raw|inline|worker|sharedworker)\b/;
const IMPORT_META_URL = /\bnew\s+URL\s*\(\s*('[^']+'|"[^"]+"|`[^`]+`)\s*,\s*import\.meta\.url\s*(?:,\s*)?\)/g; // Vite 4.4.9 assetImportMetaUrlPlugin
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
// transformAssetUrls as plugin-vue 4.3.4 resolves it for a build, from the user's option t, in a form its dev-server
// merge ({ base, ...t } unless t is the legacy tags-only form) leaves unchanged.
function vueBuildAssetUrls(t) {
  if (!t || typeof t !== "object") return { base: null, includeAbsolute: t !== false };
  return Object.values(t).some((v) => Array.isArray(v)) ? { base: null, includeAbsolute: true, tags: t } : { base: null, includeAbsolute: true, ...t };
}
// Returns two plugins (Vite flattens the array): gate-build-assets (pre: imports, template src, serving the URLs) and
// gate-build-assets-url (normal: new URL(…, import.meta.url)).
export function buildAssetsPlugin({ appDir }) {
  let config, mimes;
  const emitted = new Map(); // "/assets/a-1234abcd.png" → source file
  const isPublic = (file) => config.publicDir && file.startsWith(config.publicDir + path.sep);
  const assets = {
    name: "gate-build-assets",
    enforce: "pre",
    configResolved(c) {
      config = c;
      const vue = c.plugins.find((p) => p.name === "vite:vue");
      if (vue?.api?.options) { const o = vue.api.options; vue.api.options = { ...o, template: { ...o.template, transformAssetUrls: vueBuildAssetUrls(o.template?.transformAssetUrls) } }; }
    },
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
      if (!existsSync(file) || isPublic(file)) return null;
      return `export default ${JSON.stringify(builtUrl(file))}`;
    },
  };
  const importMetaUrl = {
    name: "gate-build-assets-url",
    async transform(code, id, options) {
      if (options?.ssr || id[0] === "\0" || !code.includes("new URL") || !code.includes("import.meta.url")) return null;
      const importer = id.split(/[?#]/)[0];
      const edits = [];
      for (const m of code.matchAll(IMPORT_META_URL)) {
        const lit = m[1];
        if (lit[0] === "`" && lit.includes("${")) continue;
        const url = lit.slice(1, -1);
        const file = url[0] === "." ? path.resolve(path.dirname(importer), url) : (await this.resolve(url, id))?.id?.split(/[?#]/)[0];
        if (!file || !path.isAbsolute(file) || !existsSync(file) || !statSync(file).isFile() || isPublic(file)) continue;
        edits.push([m.index, m.index + m[0].length, `new URL(${JSON.stringify(builtUrl(file))}, self.location)`]);
      }
      if (!edits.length) return null;
      let out = code;
      for (const [a, b, rep] of edits.reverse()) out = out.slice(0, a) + rep + out.slice(b);
      return { code: out, map: null };
    },
  };
  return [assets, importMetaUrl];
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

// Plugin: the scope id @vitejs/plugin-vue gives each compiled SFC (`_export_sfc(_sfc_main, [["__scopeId", "data-v-…"]])`
// in the main module; style and template sub-requests carry `?vue&…`), recorded per real file path into `found`. The
// gate finds a recordVia page's restored component inside the restored parent page by it (HM-251).
export function scopeIdPlugin(found) {
  return {
    name: "gate-scope-ids",
    enforce: "post",
    transform(code, id) {
      const [file, query = ""] = id.split("?");
      if (!file.endsWith(".vue") || /(^|&)vue(&|$)/.test(query)) return null;
      const m = /\["__scopeId",\s*"(data-v-[0-9a-f]+)"\]/.exec(code);
      if (m) found.set(realpathOr(file), m[1]);
      return null;
    },
  };
}
export const realpathOr = (f) => { try { return realpathSync(f); } catch { return f; } };

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
