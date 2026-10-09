// Shared-component stand-ins for --mode page (docs/pipeline.md §7.5, §13.1): a registry entry with status "reserved"
// (not restored on this branch yet) is replaced, for this gate run only, by a thin wrapper around the ORIGINAL compiled
// chunk. The wrapper is the chunk itself with
//   - Vite's top-level-await wrapper removed (tools/unwrap-tla.mjs), so its exports exist when the page imports them;
//   - `./vue.<hash>.js` imports mapped to "vue" (out/vue-exports.<site>.final.json);
//   - entry-chunk imports mapped through registry.entry, api-chunk imports through registry.api, npm / geojson / image
//     constant chunks through registry.modules, other chunks through registry.shared (restored → its path; reserved or
//     unlisted → another wrapper, recursively); named, default and namespace imports alike;
//   - the chunk's own stylesheet imported;
//   - `export default` added for the export the registry names.
// Wrappers are written under the gate's temp dir only and never enter a repository. A chunk that cannot be wrapped
// (an entry export with no registry mapping) raises ShimError: the page cannot be judged until that dependency exists.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { ROOT } from "./common.mjs";

const require = createRequire(import.meta.url);
const { parse } = require("@babel/parser");
const generate = (require("@babel/generator").default ?? require("@babel/generator"));

export class ShimError extends Error { constructor(m) { super(`[shim] ${m}`); } } // the prefix survives Vite's error wrapping

export function loadRegistry(app, file) {
  const f = file ?? path.join(ROOT, "registry", `${app}.json`);
  if (!existsSync(f)) return null;
  return JSON.parse(readFileSync(f, "utf8"));
}
export const reservedShared = (registry) => Object.entries(registry?.shared ?? {}).filter(([, e]) => e.status === "reserved").map(([chunk, e]) => ({ chunk, ...e }));

function vueAliases(site) {
  for (const p of [path.join(ROOT, "out", `vue-exports.${site}.final.json`), process.env.RESTORE_ASSETS && path.join(process.env.RESTORE_ASSETS, "out", `vue-exports.${site}.final.json`)]) {
    if (p && existsSync(p)) return JSON.parse(readFileSync(p, "utf8")).aliases;
  }
  throw new ShimError(`out/vue-exports.${site}.final.json not found (needed to map the original Vue runtime chunk)`);
}

// ctx: { site, registry, outDir } → createShimmer(ctx)(chunkFile) returns the absolute wrapper path.
export function createShimmer({ site, registry, outDir }) {
  const assets = path.join(ROOT, "legacy-dist", site, "assets");
  const entryChunk = /src="\/assets\/([^"]+\.js)"/.exec(readFileSync(path.join(ROOT, "legacy-dist", site, "index.html"), "utf8"))?.[1];
  const vue = vueAliases(site);
  const done = new Map();
  mkdirSync(outDir, { recursive: true });

  const shim = (chunk) => {
    if (done.has(chunk)) return done.get(chunk);
    const out = path.join(outDir, chunk);
    done.set(chunk, out); // set first: chunks may import each other
    const src = path.join(assets, chunk);
    if (!existsSync(src)) throw new ShimError(`original chunk ${chunk} not found in legacy-dist/${site}/assets`);
    const unwrapped = path.join(outDir, chunk + ".unwrapped");
    let code;
    try { execFileSync(process.execPath, [path.join(ROOT, "tools/unwrap-tla.mjs"), src, unwrapped], { stdio: "ignore" }); code = readFileSync(unwrapped, "utf8"); } catch { code = readFileSync(src, "utf8"); }
    const ast = parse(code, { sourceType: "module", plugins: ["topLevelAwait"] });
    const head = [], helpers = [];
    const body = [];
    let exportNames = [], localOf = {};
    for (const node of ast.program.body) {
      if (node.type === "ExportNamedDeclaration" && !node.declaration && !node.source) {
        node.specifiers = node.specifiers.filter((s) => s.exported.name !== "__tla");
        exportNames = node.specifiers.map((s) => s.exported.name);
        localOf = Object.fromEntries(node.specifiers.map((s) => [s.exported.name, s.local.name]));
        body.push(node);
        continue;
      }
      if (node.type !== "ImportDeclaration") { body.push(node); continue; }
      const from = path.basename(node.source.value);
      for (const s of node.specifiers.filter((s) => s.type === "ImportSpecifier" && s.imported.name === "__tla")) helpers.push(`const ${s.local.name} = undefined;`);
      // [imported name, local]: default imports are "default", namespace imports "*"
      const specs = node.specifiers.filter((s) => !(s.type === "ImportSpecifier" && s.imported.name === "__tla"))
        .map((s) => [s.type === "ImportDefaultSpecifier" ? "default" : s.type === "ImportNamespaceSpecifier" ? "*" : s.imported.name, s.local.name]);
      for (const [name, local] of specs) {
        const mod = registry?.modules?.[from]?.exports?.[name];
        if (/^vue\.\d+\.js$/.test(from)) {
          const v = vue[name];
          if (!v) throw new ShimError(`${chunk}: Vue runtime export ${name} not in vue-exports map`);
          head.push(`import { ${v.name} as ${local} } from ${JSON.stringify(v.from ?? "vue")};`);
        } else if (from === entryChunk) {
          const e = registry?.entry?.[name];
          if (e?.path && e.export !== "_export_sfc") head.push(importLine(e.path, e.export, local));
          else if (name === "_" || e?.export === "_export_sfc") helpers.push(`const ${local} = (sfc, props) => { const t = sfc.__vccOpts || sfc; for (const [k, v] of props) t[k] = v; return t; };`);
          else throw new ShimError(`${chunk}: entry export ${name} has no restored mapping in the registry`);
        } else if (registry?.api?.[`${from}#${name}`]) {
          const a = registry.api[`${from}#${name}`];
          head.push(importLine(a.path, a.export, local));
        } else if (mod?.path && mod.status !== "reserved") {
          head.push(importLine(mod.path, mod.export, local)); // registry.modules: npm libraries, geojson, restored image constants
        } else {
          const r = registry?.shared?.[from];
          if (r && r.status !== "reserved" && r.path) {
            const exp = r.exports?.[name] ?? r.export ?? name;
            head.push(importLine(typeof exp === "object" ? exp.path ?? r.path : r.path, typeof exp === "object" ? exp.export : exp, local));
          } else head.push(importLine(shim(from), name, local));
        }
      }
    }
    ast.program.body = body;
    const css = path.join(assets, chunk.replace(/\.js$/, ".css"));
    const reg = registry?.shared?.[chunk];
    const defaultName = reg?.exports ? Object.entries(reg.exports).find(([, v]) => (v?.export ?? v) === "default")?.[0] : exportNames.length === 1 && (reg?.export ?? "default") === "default" ? exportNames[0] : null;
    const text = [
      `// gate stand-in for legacy-dist/${site}/assets/${chunk} (generated, temporary; not restored code)`,
      ...head,
      ...(existsSync(css) ? [`import ${JSON.stringify(css)};`] : []),
      ...helpers,
      generate(ast, { compact: false }).code,
      ...(defaultName && !exportNames.includes("default") ? [`export { ${localOf[defaultName]} as default };`] : []),
    ].join("\n");
    writeFileSync(out, text);
    return out;
  };
  return shim;
}
const importLine = (from, exp, local) => (exp === "default" ? `import ${local} from ${JSON.stringify(from)};` : exp === "*" ? `import * as ${local} from ${JSON.stringify(from)};` : `import { ${exp} as ${local} } from ${JSON.stringify(from)};`);

// Vite plugin: imports that resolve to a reserved registry path are served the wrapper instead. Bare imports inside the
// wrappers (which live outside the app) are resolved as if they came from the app's own entry file.
export function shimPlugin({ app, appDir, registry, shimmer, shimDir, used }) {
  const reserved = reservedShared(registry);
  const appSrc = path.join(appDir, "apps", app, "src");
  const mainFile = path.join(appSrc, "main.ts");
  let aliases = [];
  const strip = (p) => p.replace(/\.(vue|ts|js|mjs|tsx)$/, "");
  const toAbs = (spec) => {
    for (const a of aliases) {
      if (typeof a.find === "string" && (spec === a.find || spec.startsWith(a.find + "/"))) return path.join(a.replacement, spec.slice(a.find.length));
    }
    return null;
  };
  let byAbs = null;
  return {
    name: "gate-shim",
    enforce: "pre",
    configResolved(c) { aliases = c.resolve.alias; },
    async resolveId(source, importer, options) {
      // Not during Vite's dependency scan: a ShimError thrown there leaves the optimizer's promise pending forever (the
      // run then ends with no output); shims are resolved, and their errors reported, when the page is compiled.
      if (!importer || source.startsWith("\0") || options?.scan) return null;
      byAbs ??= new Map(reserved.map((r) => [strip(toAbs(r.path) ?? path.resolve(appSrc, r.path)), r]));
      if (importer.startsWith(shimDir) && !source.startsWith(".") && !source.startsWith("/")) return this.resolve(source, mainFile, { ...options, skipSelf: true });
      const res = await this.resolve(source, importer, { ...options, skipSelf: true });
      const abs = res?.id ? res.id.split("?")[0] : toAbs(source) ?? (source.startsWith(".") ? path.resolve(path.dirname(importer), source) : null);
      const hit = abs && byAbs.get(strip(abs));
      if (!hit) return res;
      const file = shimmer(hit.chunk);
      used.add(`${hit.path} ← legacy-dist ${hit.chunk}`);
      return file;
    },
  };
}
