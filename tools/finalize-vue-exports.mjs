// Merge fingerprint results with hook/symbol/object/manual resolutions into a flat alias -> name table.
import { readFileSync, writeFileSync } from "node:fs";
const HOOK = { bm: "onBeforeMount", m: "onMounted", bu: "onBeforeUpdate", u: "onUpdated", bum: "onBeforeUnmount", um: "onUnmounted", sp: "onServerPrefetch", rtg: "onRenderTriggered", rtc: "onRenderTracked" };
const manual = {
  portal: { $: "normalizeClass", A: "cloneVNode", S: "camelize?(cached string fn, verify by usage)", V: "createApp", W: "createRouter", X: "createWebHistory", a0: "normalizeStyle", a2: "renderList", a5: "withCtx", a8: "useRouter", a9: "toDisplayString", aa: "pushScopeId", ac: "useRoute", ah: "withKeys", e: "effectScope", h: "createVNode", s: "setupDevtoolsPlugin(internal)", z: "resolveDirective", D: "vShow", af: "vModelText", ad: "RouterView", ag: "RouterLink", k: "Teleport", m: "TransitionGroup", C: "Comment", F: "Fragment", T: "Text" },
  usercenter: { A: "resolveDirective", B: "cloneVNode", D: "toRef", U: "camelize?(cached string fn, verify by usage)", W: "createApp", _: "withCtx", a: "createVNode", a0: "useRoute", a1: "useRouter", a3: "renderList", a6: "toDisplayString", a7: "normalizeStyle", a8: "pushScopeId", ab: "normalizeClass", ae: "createRouter", af: "createWebHistory", ah: "createPinia", aj: "withKeys", d: "defineStore", e: "effectScope", f: "defineComponent", i: "inject", s: "setupDevtoolsPlugin(internal)", E: "vShow", ad: "KeepAlive", ag: "RouterView", al: "RouterLink", m: "Teleport", t: "TransitionGroup", C: "Comment", F: "Fragment", T: "Text" },
};
for (const site of ["portal", "usercenter"]) {
  const fp = JSON.parse(readFileSync(`out/vue-exports.${site}.json`, "utf8"));
  const text = readFileSync(`out/vue.${site}.mjs`, "utf8");
  const exp = Object.fromEntries([...text.matchAll(/export\{([^}]+)\}/g)].flatMap((m) => m[1].split(",").map((p) => { const [l, n] = p.trim().split(/\s+as\s+/); return [l, n ?? l]; })));
  const flat = {};
  for (const [k, v] of Object.entries(fp.mapped)) flat[k] = v.replace(/ \((fuzzy|via).*\)$/, "");
  for (const m of text.matchAll(/([A-Za-z_$][\w$]*)=([A-Za-z_$][\w$]*)\("(bm|m|bu|u|bum|um|sp|rtg|rtc)"\)/g)) if (exp[m[1]]) flat[exp[m[1]]] = HOOK[m[3]];
  for (const [k, v] of Object.entries(manual[site])) flat[k] ??= v;
  const missing = Object.values(exp).filter((e) => !flat[e]);
  const lib = (n) => /^(createRouter|createWebHistory|createWebHashHistory|useRouter|useRoute|RouterView|RouterLink|onBeforeRouteUpdate|onBeforeRouteLeave)$/.test(n) ? "vue-router" : /^(createPinia|defineStore|storeToRefs)$/.test(n) ? "pinia" : "vue";
  const table = Object.fromEntries(Object.entries(flat).sort().map(([k, v]) => [k, { name: v, from: lib(v) }]));
  writeFileSync(`out/vue-exports.${site}.final.json`, JSON.stringify({ site, vueVersion: site === "portal" ? "3.2.47" : "3.3.4", aliases: table, missing }, null, 2));
  console.log(site, "aliases", Object.keys(table).length, "missing", missing.join(","));
}
