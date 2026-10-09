// Per-page sliced maps (plan §6.1): only the entries a chunk actually imports — Vue runtime aliases, entry exports
// (from out/shim-map.<site>.md), API functions (from out/api/<site>.<chunk>.map.json), shared chunks.
// Usage: node tools/slice-maps.mjs <samples.json>  → out/maps/<id>.json
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
const samples = JSON.parse(readFileSync(process.argv[2] ?? "tools/confirm-samples.json", "utf8"));
mkdirSync("out/maps", { recursive: true });
const ENTRY = { portal: "index.1783320636200.js", usercenter: "index.1751615607545.js" }; // other index.<hash><n>.js files are shared component chunks
const SHARED_ALIAS = { "index.1783320636200118.js": "echarts", "index.175161560754529.js": "CancelReasonModal", "index.175161560754528.js": "ReceivedResumeList" }; // numbered chunks named by content
const shimRows = (site) => {
  const rows = {};
  for (const line of readFileSync(`out/shim-map.${site}.md`, "utf8").split("\n")) {
    const m = line.match(/^\| `([^`]+)` \| (.+?) \| (.+?) \|\s*$/); if (m) rows[m[1]] = { readable: m[2].trim(), from: m[3].trim() };
  }
  return rows;
};
for (const s of samples) {
  const dir = `legacy-dist/${s.site}/assets`; const src = readFileSync(path.join(dir, s.chunk), "utf8");
  const aliases = JSON.parse(readFileSync(`out/vue-exports.${s.site}.final.json`, "utf8")).aliases;
  const shim = shimRows(s.site);
  const out = { id: s.id, site: s.site, chunk: s.chunk, vue: {}, entry: {}, api: {}, shared: {}, missing: [] };
  for (const m of src.matchAll(/import\{([^}]*)\}from"\.\/([^"]+)"/g)) {
    const file = m[2]; const specs = m[1].split(",").map((x) => x.trim()).filter((x) => x && !x.startsWith("__tla"));
    for (const sp of specs) {
      const [imported, local = imported] = sp.split(/\s+as\s+/);
      if (file.startsWith("vue.")) { out.vue[local] = aliases[imported]?.name ?? `?${imported}`; continue; }
      if (file === ENTRY[s.site]) { if (shim[imported]) out.entry[local] = { export: imported, ...shim[imported] }; else { out.entry[local] = { export: imported, readable: "?" }; out.missing.push(`entry:${imported}`); } continue; }
      const apiMap = `out/api/${s.site}.${file}.map.json`;
      if (existsSync(apiMap)) { const mp = JSON.parse(readFileSync(apiMap, "utf8")); out.api[local] = { file, export: imported, fn: mp[imported] ?? `?${imported}` }; continue; }
      const base = SHARED_ALIAS[file] ?? file.replace(/\.\d{10,}\d*\.js$/, ""); const short = base.split(".")[0];
      const app = s.site === "portal" ? "portal" : "uc"; const NPM = { "vue3-seamless-scroll": "vue3-seamless-scroll", main: "pinyin-match", cropperjs: "cropperjs", "html2canvas": "html2canvas", "jspdf": "jspdf", "swiper": "swiper", "navigation": "swiper", "pagination": "swiper", "autoplay": "swiper", "effect-coverflow": "swiper", "scrollbar": "swiper", "grid": "swiper" };
      const sharedFile = [base, short].flatMap((n) => ["vue", "ts"].map((ext) => `skeleton/apps/${app}/src/shared/${n}.${ext}`)).find((f) => existsSync(f));
      // A shared .ts whose header lists "`X` → Name" maps each original export to a named (or default) import.
      const tsFile = [base, short].map((n) => `skeleton/apps/${app}/src/shared/${n}.ts`).find((f) => existsSync(f));
      let named = null;
      if (tsFile) for (const m of readFileSync(tsFile, "utf8").matchAll(/`([\w$]+)` → ([\w$]+)/g)) if (m[1] === imported) named = m[2];
      if (tsFile && named) { out.shared[local] = { file, export: imported, base, target: "@shared/" + path.basename(tsFile).replace(/\.ts$/, ""), import: named === "default" ? "default" : `{ ${named} }` }; continue; }
      out.shared[local] = { file, export: imported, base, target: sharedFile ? "@shared/" + path.basename(sharedFile) : NPM[short] ? "npm:" + NPM[short] : "?" };
      if (!sharedFile && !NPM[short]) out.missing.push(`shared:${base}`);
    }
  }
  writeFileSync(`out/maps/${s.id}.json`, JSON.stringify(out, null, 1));
  console.log(s.id, "vue", Object.keys(out.vue).length, "entry", Object.keys(out.entry).length, "api", Object.keys(out.api).length, "shared", Object.keys(out.shared).length, "missing", out.missing.length);
}
