// Statistics for the 20-page confirmation report (plan §5/§6): first-pass rates, fix rounds, token use vs. the
// Fable-era fit, per-tier Haiku eligibility. Reads out/confirm-ledger.json, out/confirm-firstpass.json,
// tools/confirm-orders.json. Usage: node tools/confirm-stats.mjs → out/confirm-stats.json (+ console summary)
import { readFileSync, writeFileSync } from "node:fs";
const L = JSON.parse(readFileSync("out/confirm-ledger.json", "utf8")).rounds;
const FP = JSON.parse(readFileSync("out/confirm-firstpass.json", "utf8"));
const orders = JSON.parse(readFileSync("tools/confirm-orders.json", "utf8"));
const fitFinal = (kb) => 65900 + 2590 * kb; // final-context fit (Fable 5.1, plan §6.4)
const fitCache = (kb) => 780000 + 92600 * kb; // incl. cache reads
const pct = (a, b) => (b ? Math.round((a / b) * 1000) / 10 : null);
const tier = (o) => (o.kb < 5 ? "简单(<5KB)" : o.kb < 30 ? "中等(5–30KB)" : "大(≥30KB)");
const rows = [];
for (const o of orders) for (const g of ["S", "H"]) {
  const restore = L.filter((r) => r.ticket === o.id && r.group === g && r.kind === "restore");
  const fixes = L.filter((r) => r.ticket === o.id && r.group === g && r.kind === "fix");
  const f = FP[o.id]?.[g] ?? {};
  const r = restore.at(-1);
  rows.push({
    id: o.id, group: g, kb: o.kb, components: o.components.length, tier: tier(o), split: o.split, category: o.category,
    model: r?.model, firstPass: f.firstPass ?? null, fixRounds: fixes.length, cats: f.cats ?? [], finalPass: f.finalPass ?? null,
    tokensFinal: r?.subagentTokens ?? null, tokensCache: r?.transcriptTotal ?? null, durationMs: r?.durationMs ?? null, toolUses: r?.toolUses ?? null,
    fixTokensFinal: fixes.reduce((a, x) => a + x.subagentTokens, 0), fixTokensCache: fixes.reduce((a, x) => a + (x.transcriptTotal ?? 0), 0),
    devFinal: r ? pct(r.subagentTokens - fitFinal(o.kb), fitFinal(o.kb)) : null,
    devCache: r?.transcriptTotal ? pct(r.transcriptTotal - fitCache(o.kb), fitCache(o.kb)) : null,
  });
}
const by = (g) => rows.filter((r) => r.group === g);
const summary = {};
for (const g of ["S", "H"]) {
  const x = by(g);
  const fpN = x.filter((r) => r.firstPass === true).length;
  summary[g] = {
    pages: x.length, firstPass: fpN, firstPassRate: pct(fpN, x.length), fixRoundsTotal: x.reduce((a, r) => a + r.fixRounds, 0),
    fixRoundsMean: Math.round((x.reduce((a, r) => a + r.fixRounds, 0) / x.length) * 100) / 100,
    tokensFinalSum: x.reduce((a, r) => a + (r.tokensFinal ?? 0), 0), tokensCacheSum: x.reduce((a, r) => a + (r.tokensCache ?? 0), 0),
    tokensFinalMean: Math.round(x.reduce((a, r) => a + (r.tokensFinal ?? 0), 0) / x.length), tokensCacheMean: Math.round(x.reduce((a, r) => a + (r.tokensCache ?? 0), 0) / x.length),
    durationMeanMin: Math.round((x.reduce((a, r) => a + (r.durationMs ?? 0), 0) / x.length / 60000) * 10) / 10,
    outOfBandCache: x.filter((r) => r.devCache !== null && Math.abs(r.devCache) > 30).map((r) => `${r.id}(${r.devCache > 0 ? "+" : ""}${r.devCache}%)`),
    outOfBandFinal: x.filter((r) => r.devFinal !== null && Math.abs(r.devFinal) > 30).map((r) => `${r.id}(${r.devFinal > 0 ? "+" : ""}${r.devFinal}%)`),
    stillFailing: x.filter((r) => r.finalPass === false).map((r) => r.id),
  };
}
// Per tier: Haiku is enabled in a tier when H first-pass ≥ S first-pass − 10 pp and mean H fix rounds ≤ 0.3 (plan §5)
const tiers = {};
for (const t of [...new Set(rows.map((r) => r.tier))]) {
  const s = rows.filter((r) => r.tier === t && r.group === "S"), h = rows.filter((r) => r.tier === t && r.group === "H");
  const sR = pct(s.filter((r) => r.firstPass).length, s.length), hR = pct(h.filter((r) => r.firstPass).length, h.length);
  const hFix = Math.round((h.reduce((a, r) => a + r.fixRounds, 0) / h.length) * 100) / 100;
  tiers[t] = { pages: s.length, kbRange: [Math.min(...s.map((r) => r.kb)), Math.max(...s.map((r) => r.kb))], sFirstPass: sR, hFirstPass: hR, hFixMean: hFix,
    hTokensCacheMean: Math.round(h.reduce((a, r) => a + (r.tokensCache ?? 0), 0) / h.length), sTokensCacheMean: Math.round(s.reduce((a, r) => a + (r.tokensCache ?? 0), 0) / s.length),
    haikuEligible: hR !== null && sR !== null && hR >= sR - 10 && hFix <= 0.3 };
}
// Linear fit (least squares) per group on the cache-inclusive measure, to replace the Fable-era coefficients in §6.4
const fit = (g, key) => {
  const x = by(g).filter((r) => r[key] != null); const n = x.length;
  const mx = x.reduce((a, r) => a + r.kb, 0) / n, my = x.reduce((a, r) => a + r[key], 0) / n;
  const b = x.reduce((a, r) => a + (r.kb - mx) * (r[key] - my), 0) / x.reduce((a, r) => a + (r.kb - mx) ** 2, 0);
  return { intercept: Math.round(my - b * mx), perKB: Math.round(b) };
};
const fits = { S: { final: fit("S", "tokensFinal"), cache: fit("S", "tokensCache") }, H: { final: fit("H", "tokensFinal"), cache: fit("H", "tokensCache") } };
const shared = L.filter((r) => r.kind === "shared");
const fixAll = L.filter((r) => r.kind === "fix");
const out = { rows, summary, tiers, fits, shared: { agents: shared.length, tokensFinal: shared.reduce((a, r) => a + r.subagentTokens, 0), tokensCache: shared.reduce((a, r) => a + (r.transcriptTotal ?? 0), 0) },
  fixes: { agents: fixAll.length, meanFinal: Math.round(fixAll.reduce((a, r) => a + r.subagentTokens, 0) / (fixAll.length || 1)), meanCache: Math.round(fixAll.reduce((a, r) => a + (r.transcriptTotal ?? 0), 0) / (fixAll.length || 1)) } };
writeFileSync("out/confirm-stats.json", JSON.stringify(out, null, 1));
console.log(JSON.stringify({ summary, tiers, fits, shared: out.shared, fixes: out.fixes }, null, 1));
