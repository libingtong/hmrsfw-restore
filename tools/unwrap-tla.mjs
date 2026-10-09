// Unwrap Vite's top-level-await chunk shape:  let A,B; export let __tla = Promise.all([...]).then(() => H(void 0, null, function* () { BODY }))
// into plain module statements (yield -> await), so Vue SFC recovery tools can see defineComponent at module level.
// Usage: node tools/unwrap-tla.mjs <in.js> <out.js>
import { readFileSync, writeFileSync } from "node:fs";
import { parse } from "@babel/parser";
import traverseModule from "@babel/traverse";
import generateModule from "@babel/generator";
const traverse = traverseModule.default ?? traverseModule, generate = generateModule.default ?? generateModule;
const [inFile, outFile] = process.argv.slice(2);
const src = readFileSync(inFile, "utf8");
const ast = parse(src, { sourceType: "module", plugins: ["topLevelAwait"] });
let body = null, wrapperName = null, hoisted = new Set();
const exportClause = ast.program.body.find((n) => n.type === "ExportNamedDeclaration" && !n.declaration && n.specifiers.some((sp) => sp.exported.name === "__tla"));
const tlaLocal = exportClause?.specifiers.find((sp) => sp.exported.name === "__tla")?.local.name;
traverse(ast, {
  VariableDeclarator(p) {
    if (p.node.id.type !== "Identifier" || !p.node.init) return;
    const isTla = p.node.id.name === tlaLocal || (p.node.id.name === "__tla");
    if (!isTla) return;
    let gen = null;
    p.traverse({ FunctionExpression(q) { if (q.node.generator && !gen) gen = q.node; } });
    if (gen) { body = gen.body.body; const thenArg = p.node.init.arguments?.[0]; wrapperName = thenArg?.body?.callee?.name; }
    p.remove();
  },
});
if (exportClause) exportClause.specifiers = exportClause.specifiers.filter((sp) => sp.exported.name !== "__tla");
if (!body) { console.error("no __tla wrapper found"); process.exit(2); }
// yield -> await inside the hoisted body (not inside nested generators)
traverse({ type: "File", program: { type: "Program", body, sourceType: "module", directives: [] } }, {
  noScope: true,
  YieldExpression(p) { p.replaceWith({ type: "AwaitExpression", argument: p.node.argument }); },
  FunctionExpression(p) { if (p.node.generator) p.skip(); },
});
// module-level `let A,B,C;` declarations assigned inside the body: keep them; the body assignments become plain statements
const program = ast.program;
program.body = program.body.filter((n) => !(n.type === "ImportDeclaration" && n.specifiers.every((s) => s.imported?.name === "__tla")));
for (const n of program.body) if (n.type === "ImportDeclaration") n.specifiers = n.specifiers.filter((s) => s.imported?.name !== "__tla");
// remove the async helper `var H=(e,R,t)=>new Promise(...)` if it is the wrapper
program.body = program.body.filter((n) => !(n.type === "VariableDeclaration" && n.declarations[0]?.id.name === wrapperName));
// also drop `try{return __tla_x}catch` nothing else; insert body before the export clause
const exportIdx = program.body.findIndex((n) => n.type === "ExportNamedDeclaration" && !n.declaration);
program.body.splice(exportIdx < 0 ? program.body.length : exportIdx, 0, ...body);
// convert `H(this,null,function*(){})`-style async-downlevel calls inside the body into async arrow IIFEs is left to the decompiler
const out = generate(ast, { compact: false }).code;
writeFileSync(outFile, out);
console.log(outFile, "statements", body.length);
