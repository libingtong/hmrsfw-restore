// AST-based: find the definition (declaration or first top-level/TLA assignment) of every module-level identifier in a chunk.
// Usage: node tools/entry-symbols.mjs <chunk> <out json>
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { parse } from "@babel/parser";
import traverseModule from "@babel/traverse";
const traverse = traverseModule.default ?? traverseModule;
export function symbolsOf(file) {
const src = readFileSync(file, "utf8");
const ast = parse(src, { sourceType: "module", plugins: ["topLevelAwait"] });
const defs = {};
const depthOf = (p) => { let d = 0, q = p; while (q) { if (q.isFunction()) d++; q = q.parentPath; } return d; };
const snippet = (node) => src.slice(node.start, Math.min(node.end, node.start + 600)).replace(/\s+/g, " ");
traverse(ast, {
  VariableDeclarator(p) { if (depthOf(p) <= 2 && p.node.id.type === "Identifier" && p.node.init) defs[p.node.id.name] ??= { kind: "decl", def: snippet(p.node.init), len: p.node.init.end - p.node.init.start }; },
  FunctionDeclaration(p) { if (depthOf(p) <= 2 && p.node.id) defs[p.node.id.name] ??= { kind: "function", def: snippet(p.node), len: p.node.end - p.node.start }; },
  ClassDeclaration(p) { if (depthOf(p) <= 2 && p.node.id) defs[p.node.id.name] ??= { kind: "class", def: snippet(p.node), len: p.node.end - p.node.start }; },
  AssignmentExpression(p) { if (depthOf(p) <= 2 && p.node.left.type === "Identifier" && p.node.operator === "=") { const n = p.node.left.name; if (!defs[n] || defs[n].kind === "assign-late") defs[n] ??= { kind: "assign", def: snippet(p.node.right), len: p.node.right.end - p.node.right.start }; } },
});
const exp = {}; for (const e of src.matchAll(/export\{([^}]+)\}/g)) for (const part of e[1].split(",")) { const [l, n] = part.trim().split(/\s+as\s+/); exp[n ?? l] = l; }
const out = {};
for (const [exported, local] of Object.entries(exp)) { const d = defs[local]; out[exported] = { local, ...(d ?? { kind: "unknown" }), componentName: d?.def.match(/name:"([A-Za-z-]+)"/)?.[1] }; }
return out;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) { const [file, outFile] = process.argv.slice(2); const out = symbolsOf(file); writeFileSync(outFile, JSON.stringify(out, null, 1)); console.log(file, "exports", Object.keys(out).length); }
