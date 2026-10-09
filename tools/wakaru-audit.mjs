// Static audit of wakaru output vs the original chunk, per sample: quantifies the error classes found during the POC.
// Usage: node tools/wakaru-audit.mjs  -> out/wakaru-audit.json + table on stdout
import { readFileSync, readdirSync, existsSync, writeFileSync } from "node:fs";
import path from "node:path";
const samples = JSON.parse(readFileSync("tools/samples.json", "utf8"));
const mapping = JSON.parse(readFileSync("out/mapping.json", "utf8"));
const vueAlias = { portal: JSON.parse(readFileSync("out/vue-exports.portal.final.json", "utf8")).aliases, usercenter: JSON.parse(readFileSync("out/vue-exports.usercenter.final.json", "utf8")).aliases };
const HTML = new Set("a b i p q s u br hr li ol ul dl dt dd em td th tr h1 h2 h3 h4 h5 h6 img div span view main form label input button select option textarea table thead tbody tfoot template component slot svg path video section header footer nav article aside strong small sup sub iframe canvas audio source pre code".split(" "));
const count = (s, re) => (s.match(re) || []).length;
const rows = [];
for (const site of ["portal", "usercenter"]) {
  for (const x of samples[site]) {
    const page = mapping[site].pages.find((p) => p.key === x.key);
    const chunk = readFileSync(path.join(mapping[site].dir, "assets", page.chunk), "utf8");
    const dir = `wakaru-out/${site}/${x.id}`;
    const files = existsSync(dir) ? readdirSync(dir) : [];
    const vueFile = files.find((f) => f.endsWith(".vue"));
    const vue = vueFile ? readFileSync(path.join(dir, vueFile), "utf8") : "";
    const js = files.find((f) => f.endsWith(".js")) ? readFileSync(path.join(dir, files.find((f) => f.endsWith(".js"))), "utf8") : "";
    const tpl = (vue.match(/<template>[\s\S]*<\/template>/) || [""])[0];
    // original chunk facts
    const components = count(chunk, /__name:"/g);
    const aliasOf = (name) => Object.entries(vueAlias[site]).filter(([, v]) => v.name === name).map(([k]) => k);
    const importClause = (chunk.match(/import\{([^}]+)\}from"\.\/vue\.\d+\.js"/) || [, ""])[1];
    const localFor = (name) => aliasOf(name).map((a) => (importClause.match(new RegExp(`(?:^|,)${a.replace("$", "\\$")} as ([\\w$]+)`)) || [])[1]).filter(Boolean);
    const resolveDirLocals = localFor("resolveDirective");
    const customDirectives = resolveDirLocals.reduce((n, l) => n + count(chunk, new RegExp(`[^\\w$]${l.replace("$", "\\$")}\\("`, "g")), 0);
    const withCtxLocals = localFor("withCtx");
    const scopedSlots = withCtxLocals.reduce((n, l) => n + count(chunk, new RegExp(`[^\\w$]${l.replace("$", "\\$")}\\(\\(\\{`, "g")) + count(chunk, new RegExp(`[^\\w$]${l.replace("$", "\\$")}\\(\\([a-zA-Z_$]+\\)=>`, "g")), 0);
    const vShowLocal = localFor("vShow");
    const vShows = vShowLocal.reduce((n, l) => n + count(chunk, new RegExp(`\\[${l.replace("$", "\\$")},`, "g")), 0);
    const hasCss = page.css.length > 0;
    // wakaru output facts
    const tags = [...tpl.matchAll(/<([A-Za-z_$][\w$-]*)/g)].map((m) => m[1]);
    const singleLetterTags = tags.filter((t) => t.length <= 2 && !HTML.has(t.toLowerCase()));
    const row = {
      id: x.id, route: x.route, chunkKB: +(chunk.length / 1024).toFixed(1),
      componentsInChunk: components, vueFilesFromWakaru: files.filter((f) => f.endsWith(".vue")).length,
      mainComponentMissing: components > 1 && vue && !new RegExp(`__name:"${(x.key.split("/").pop() || "").replace(".vue", "")}"`).test(chunk) ? null : undefined,
      singleLetterTags: singleLetterTags.length, singleLetterTagSample: [...new Set(singleLetterTags)].slice(0, 5).join(","),
      componentIsObfuscated: count(tpl, /<component :is="[\w$]+"/g),
      lostHoistedNodes: count(tpl, /<!-- wakaru:/g) + count(tpl, /\{\{\s*[A-Za-z_$][\w$]{0,2}\s*\}\}/g),
      customDirectivesInChunk: customDirectives, customDirectivesInVue: count(tpl, /\sv-(?!if|else|for|show|model|slot|bind|on|html|text)[a-z][\w-]*/g),
      vShowInChunk: vShows, vShowInVue: count(tpl, /\sv-show=/g),
      scopedSlotsInChunk: scopedSlots, slotsInVue: count(tpl, /(#|v-slot:)[\w-]+="/g),
      propsDestructured: count(vue + js, /const \{[^}]+\} = props/g),
      obfuscatedImports: count(vue, /from "\.\/(vue|index)\.\d+\.js"/g),
      styleBlocks: count(vue, /<style/g), cssExpected: hasCss,
    };
    rows.push(row);
  }
}
writeFileSync("out/wakaru-audit.json", JSON.stringify(rows, null, 1));
const cols = ["id", "chunkKB", "componentsInChunk", "vueFilesFromWakaru", "singleLetterTags", "componentIsObfuscated", "lostHoistedNodes", "customDirectivesInChunk", "customDirectivesInVue", "vShowInChunk", "vShowInVue", "scopedSlotsInChunk", "propsDestructured", "obfuscatedImports", "styleBlocks"];
console.log(cols.join("\t"));
for (const r of rows) console.log(cols.map((c) => r[c]).join("\t"));
