// Build mapping.json for both sites: original path/route -> chunk, css, deps, and per-chunk feature hints.
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";
const sites = {
  portal: { dir: "legacy-dist/portal", entry: "index.1783320636200.js", vue: "vue.1783320636200.js" },
  usercenter: { dir: "legacy-dist/usercenter", entry: "index.1751615607545.js", vue: "vue.1751615607545.js" },
};
const out = {};
for (const [site, cfg] of Object.entries(sites)) {
  const assets = path.join(cfg.dir, "assets");
  const entry = readFileSync(path.join(assets, cfg.entry), "utf8");
  const pages = [];
  if (site === "portal") {
    const re = /"\/?(src\/views\/[^"]+\.vue)":\(\)=>\w+\(\(\)=>import\("\.\/([^"]+)"\)\.then\([^\]]*?\[([^\]]*)\]/g;
    for (const m of entry.matchAll(re)) pages.push({ key: m[1], chunk: m[2], deps: m[3].split(",").map((x) => x.replace(/["\s]/g, "").replace(/^assets\//, "")).filter(Boolean) });
  } else {
    const re = /path:"([^"]+)",name:"([^"]*)",meta:(\{[^}]*\}),component:\(\)=>\w+\(\(\)=>import\("\.\/([^"]+)"\),\[([^\]]*)\]/g;
    for (const m of entry.matchAll(re)) pages.push({ key: m[1], name: m[2], meta: m[3], chunk: m[4], deps: m[5].split(",").map((x) => x.replace(/["\s]/g, "").replace(/^assets\//, "")).filter(Boolean) });
  }
  const vueImport = (code) => {
    const m = code.match(new RegExp(`import\\{([^}]+)\\}from"\\./${cfg.vue.replace(/\./g, "\\.")}"`));
    return m ? m[1].split(",").map((x) => x.trim()) : [];
  };
  for (const p of pages) {
    const file = path.join(assets, p.chunk);
    if (!existsSync(file)) { p.missing = true; continue; }
    const code = readFileSync(file, "utf8");
    p.size = code.length;
    p.css = p.deps.filter((d) => d.endsWith(".css"));
    p.vueImports = vueImport(code);
    p.imports = [...code.matchAll(/from"\.\/([^"]+)"/g)].map((m) => m[1]);
    p.hints = {
      components: (code.match(/__name:"/g) || []).length,
      rules: (code.match(/rules[:=]/g) || []).length,
      validate: (code.match(/validate(?:Fields)?\(/g) || []).length,
      store: (code.match(/getUser\(\)|useStore|\.getters\.|\.dispatch\(|\.commit\(|useUserStore|Store\(/g) || []).length,
      token: (code.match(/getToken\(|userInfo|isLogin|hasPermission|permission/g) || []).length,
      slotArrow: (code.match(/\(\{[a-zA-Z_$][^}]*\}\)=>/g) || []).length,
      windowOpen: (code.match(/window\.open\(/g) || []).length,
      routerPush: (code.match(/\.push\(/g) || []).length,
      table: (code.match(/columns|dataSource|pagination/g) || []).length,
      zh: (code.match(/\\u[0-9A-F]{4}/g) || []).length,
      swiper: (code.match(/Swiper|swiper/g) || []).length,
      map: (code.match(/BMap/g) || []).length,
      echarts: (code.match(/echarts|init\(/g) || []).length,
    };
  }
  out[site] = { ...cfg, pages, assetCount: readdirSync(assets).length };
  console.log(site, "pages", pages.length, "missing", pages.filter((p) => p.missing).length);
}
writeFileSync("out/mapping.json", JSON.stringify(out, null, 2));
