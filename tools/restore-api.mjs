// Turn an index.api.*.js chunk into a readable TS module. Usage: node tools/restore-api.mjs <site> <chunk> <outTs>
// parseApiChunk() is shared with registry.mjs, so the registry's function names are the ones this script writes.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parse } from "@babel/parser";
import traverseModule from "@babel/traverse";
const traverse = traverseModule.default ?? traverseModule;

const RESERVED = new Set("delete default export import new class function return var let const if else for while switch case break continue do in of try catch finally throw typeof void with yield await enum extends super this null true false".split(" "));
// function name from the url: last path segment, non-word characters → "_", reserved words get "Item"
export const nameFromUrl = (url) => { const n = url.split("?")[0].split("/").filter(Boolean).pop().replace(/[^\w]/g, "_"); return RESERVED.has(n) ? n + "Item" : n; };

// Every `X = (params) => <instance>.request({ url, method, … })` of the chunk, in source order (AST, so configs that
// contain ";" — e.g. a Content-Type header — or a conditional url are found too). The url of a conditional
// (`url: id ? ".../edit" : ".../add"`) is its first branch, of a concatenation (`".../x?id=" + p.id`) its leading string;
// the whole config is kept verbatim in `cfg`.
export function parseApiChunk(src) {
  const exp = {}; for (const e of src.matchAll(/export\{([^}]+)\}/g)) for (const part of e[1].split(",")) { const [l, n] = part.trim().split(/\s+as\s+/); exp[l] = n ?? l; }
  const ast = parse(src, { sourceType: "module", plugins: ["topLevelAwait"] });
  const fns = [];
  const take = (local, fn) => {
    if (!fn || !/ArrowFunctionExpression|FunctionExpression/.test(fn.type)) return;
    const call = fn.body.type === "CallExpression" ? fn.body : fn.body.type === "BlockStatement" && fn.body.body.length === 1 && fn.body.body[0].type === "ReturnStatement" ? fn.body.body[0].argument : null;
    if (call?.type !== "CallExpression" || call.callee.type !== "MemberExpression" || call.callee.property.name !== "request" || call.arguments[0]?.type !== "ObjectExpression") return;
    const obj = call.arguments[0]; const prop = (k) => obj.properties.find((p) => (p.key?.name ?? p.key?.value) === k)?.value;
    const u = prop("url"); const str = (n) => n?.type === "StringLiteral" ? n.value : n?.type === "TemplateLiteral" ? n.quasis.map((q) => q.value.cooked).join("${}") : n?.type === "ConditionalExpression" ? str(n.consequent) : n?.type === "BinaryExpression" && n.operator === "+" ? str(n.left) : null;
    const url = str(u); if (!url) return;
    const method = prop("method")?.type === "StringLiteral" ? prop("method").value : "get";
    fns.push({ local, exported: exp[local], params: src.slice(fn.params[0]?.start ?? fn.start, fn.params.at(-1)?.end ?? fn.start).replace(/^\(|\)$/g, ""), url, method, cfg: src.slice(obj.start, obj.end), name: nameFromUrl(url.replace(/\$\{\}.*$/, "")), at: fn.start });
  };
  traverse(ast, {
    VariableDeclarator(p) { if (p.node.id.type === "Identifier") take(p.node.id.name, p.node.init); },
    AssignmentExpression(p) { if (p.node.left.type === "Identifier") take(p.node.left.name, p.node.right); },
  });
  fns.sort((a, b) => a.at - b.at);
  const seen = {}; for (const f of fns) { seen[f.name] = (seen[f.name] ?? 0) + 1; if (seen[f.name] > 1) f.name += seen[f.name]; }
  return { fns, exportCount: Object.keys(exp).length };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [site, chunk, outTs] = process.argv.slice(2);
  const dir = site === "portal" ? "legacy-dist/portal" : "legacy-dist/usercenter";
  const { fns, exportCount } = parseApiChunk(readFileSync(path.join(dir, "assets", chunk), "utf8"));
  const ts = [`// 由 ${chunk} 还原（脚本生成）。request 的用法与原包一致：request({ url, method, params | data })。`, `import { request } from "@/utils/request";`, "",
    ...fns.map((f) => `/** 原压缩名 ${f.local}${f.exported ? `，导出名 ${f.exported}` : ""} */\nexport const ${f.name} = (${f.params || ""}) => request(${f.cfg});`)].join("\n");
  writeFileSync(outTs, ts + "\n");
  writeFileSync(outTs.replace(/\.ts$/, ".map.json"), JSON.stringify(Object.fromEntries(fns.map((f) => [f.exported ?? f.local, f.name])), null, 2));
  console.log(outTs, fns.length, "functions; exports in chunk:", exportCount);
}
