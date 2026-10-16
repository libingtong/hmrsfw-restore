// Segmentation of a large page chunk (global doc §二/§四: pages ≥ 30KB are split into ~30KB segments).
// Rule (docs/work-orders.md#分段):
//   1. n = ceil(kb / 30). Whole components are packed, in source order, into n consecutive groups with the smallest
//      possible largest group (the main component, defined last, lands in the last group).
//   2. A component larger than 30KB cannot share a segment and is split in two parts: its <script setup> (setup body
//      without the returned render function) and its <template> (the render function). Parts are written as fragment
//      files and assembled by the last segment (tools/assemble-segments.mjs).
//   3. The last segment assembles and is the only one that runs the page gate; the others only pass the static self-check.
// Offsets are JS string indices (UTF-16 code units, Babel's node.start/end) into the chunk source, not byte offsets.
// A component's region starts where the previous component's definition ends: the code a compiled SFC module emits before
// its definition (the `_withScopeId` wrapper, hoisted static vnodes, constant props) belongs to that component. The
// previous component's `_export_sfc(...)` wrapper, which has no render calls, falls into the next region as well.
import { parse } from "@babel/parser";
import traverseModule from "@babel/traverse";
import { chunkSource } from "./scope.mjs";
const traverse = traverseModule.default ?? traverseModule;

export const SEGMENT_KB = 30, SPLIT_COMPONENT_KB = 30;

// component regions: [{name, start, def, end, kb, script?:[s,e], template?:[s,e]}] in source order; `def` is where the
// definition itself starts ([start, def) holds its hoisted code); `end` of the last region is the chunk end
export function componentRegions(site, chunk) {
  const src = chunkSource(site, chunk); const ast = parse(src, { sourceType: "module", plugins: ["topLevelAwait"] });
  const found = [];
  traverse(ast, {
    ObjectProperty(p) {
      const key = p.node.key.name ?? p.node.key.value; if (key !== "__name" || p.node.value.type !== "StringLiteral") return;
      const obj = p.parentPath;
      // the statement (or declarator) that holds the definition, directly under the module or the TLA generator body
      let q = obj; while (q.parentPath && !(q.parentPath.isProgram() || (q.parentPath.isBlockStatement() && q.parentPath.parentPath?.isFunction() && q.parentPath.parentPath.node.generator && q.parentPath.parentPath.node.end - q.parentPath.parentPath.node.start > src.length * 0.5))) q = q.parentPath;
      let stmtStart = q.node.start, stmtEnd = q.node.end;
      if (q.isVariableDeclaration()) { const d = q.node.declarations.find((x) => x.start <= obj.node.start && obj.node.end <= x.end); if (d) { stmtStart = d.start; stmtEnd = d.end; } }
      if (q.isExpressionStatement() && q.node.expression.type === "SequenceExpression") { const part = q.node.expression.expressions.find((x) => x.start <= obj.node.start && obj.node.end <= x.end); if (part) { stmtStart = part.start; stmtEnd = part.end; } }
      const setup = obj.node.properties.find((x) => (x.key?.name ?? x.key?.value) === "setup");
      const body = setup?.body?.body ?? setup?.value?.body?.body; const ret = body?.at(-1);
      const render = ret?.type === "ReturnStatement" && /Function/.test(ret.argument?.type ?? "") ? [ret.argument.start, ret.argument.end] : null;
      found.push({ name: p.node.value.value, at: obj.node.start, stmtStart, stmtEnd, objEnd: obj.node.end, render, setupBody: body ? [body[0]?.start ?? setup.start, ret?.start ?? setup.end] : null });
    },
  });
  found.sort((a, b) => a.at - b.at);
  return found.map((c, i) => {
    const start = i === 0 ? 0 : found[i - 1].stmtEnd; const end = i + 1 < found.length ? c.stmtEnd : src.length;
    return { name: c.name, start, def: c.stmtStart, end, kb: +((end - start) / 1024).toFixed(1), script: c.setupBody, template: c.render };
  });
}

// linear partition of sizes into k consecutive groups minimising the largest group
function partition(sizes, k) {
  const n = sizes.length; k = Math.min(k, n);
  const pre = [0]; for (const s of sizes) pre.push(pre.at(-1) + s);
  const cost = (i, j) => pre[j] - pre[i];
  const dp = Array.from({ length: k + 1 }, () => Array(n + 1).fill(Infinity)); const cut = Array.from({ length: k + 1 }, () => Array(n + 1).fill(0));
  dp[0][0] = 0;
  for (let g = 1; g <= k; g++) for (let j = 1; j <= n; j++) for (let i = g - 1; i < j; i++) { const v = Math.max(dp[g - 1][i], cost(i, j)); if (v < dp[g][j]) { dp[g][j] = v; cut[g][j] = i; } }
  const groups = []; let j = n; for (let g = k; g >= 1; g--) { const i = cut[g][j]; groups.unshift([i, j]); j = i; }
  return groups;
}

// segments: [{index, kb, range:[s,e], factRanges:[[s,e]], components:[name], parts:[{component, part:"script"|"template", range}]}]
// factRanges: where the render calls this segment restores are (static texts, directives — check-text-nodes / check-directives):
// a whole component's region; for a template part, the component's hoisted code [start, def) and its render function. A
// script part restores none: its fragment is <script setup> code, and the hoisted vnodes go with the template part.
export function segmentPlan(site, chunk, kb) {
  const regions = componentRegions(site, chunk);
  const n = Math.max(2, Math.ceil(kb / SEGMENT_KB));
  // units: a whole component, or the two parts of an oversized one
  const units = [];
  for (const r of regions) {
    if (r.kb > SPLIT_COMPONENT_KB && r.script && r.template) {
      units.push({ component: r.name, part: "script", range: [r.start, r.template[0]], facts: [], kb: +((r.template[0] - r.start) / 1024).toFixed(1) });
      units.push({ component: r.name, part: "template", range: [r.template[0], r.end], facts: [[r.start, r.def], [r.template[0], r.end]], kb: +((r.end - r.template[0]) / 1024).toFixed(1) });
    } else units.push({ component: r.name, range: [r.start, r.end], facts: [[r.start, r.end]], kb: r.kb });
  }
  const groups = partition(units.map((u) => u.kb), n);
  return groups.map(([i, j], index) => {
    const us = units.slice(i, j);
    return {
      index: index + 1, of: groups.length, kb: +us.reduce((a, u) => a + u.kb, 0).toFixed(1), range: [us[0].range[0], us.at(-1).range[1]], factRanges: us.flatMap((u) => u.facts),
      components: us.filter((u) => !u.part).map((u) => u.component),
      parts: us.filter((u) => u.part).map((u) => ({ component: u.component, part: u.part, range: u.range, kb: u.kb })),
      oversize: us.some((u) => u.kb > SEGMENT_KB * 1.2), // a part that is still clearly over 30KB
    };
  });
}
