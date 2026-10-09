// Print definitions of arbitrary module-level identifiers in a chunk. Usage: node tools/local-defs.mjs <chunk> name1,name2 [maxLen]
import { readFileSync } from "node:fs";
import { parse } from "@babel/parser";
import traverseModule from "@babel/traverse";
const traverse = traverseModule.default ?? traverseModule;
const [file, names, maxLen = "900"] = process.argv.slice(2);
const want = new Set(names.split(","));
const src = readFileSync(file, "utf8");
const ast = parse(src, { sourceType: "module", plugins: ["topLevelAwait"] });
const depthOf = (p) => { let d = 0, q = p; while (q) { if (q.isFunction()) d++; q = q.parentPath; } return d; };
const out = {};
const take = (name, node) => { if (want.has(name) && !out[name]) out[name] = src.slice(node.start, Math.min(node.end, node.start + Number(maxLen))).replace(/\s+/g, " "); };
traverse(ast, {
  VariableDeclarator(p) { if (depthOf(p) <= 2 && p.node.id.type === "Identifier" && p.node.init) take(p.node.id.name, p.node.init); },
  FunctionDeclaration(p) { if (depthOf(p) <= 2 && p.node.id) take(p.node.id.name, p.node); },
  ClassDeclaration(p) { if (depthOf(p) <= 2 && p.node.id) take(p.node.id.name, p.node); },
  AssignmentExpression(p) { if (depthOf(p) <= 2 && p.node.left.type === "Identifier") take(p.node.left.name, p.node.right); },
});
for (const n of want) console.log(`### ${n}\n${out[n] ?? "(not found)"}\n`);
