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

// Every `X = (params) => <instance>.request({ url, method, … })` of the chunk, in source order. Functions and the export
// table both come from the AST, never from a regex over the text, so a ";" or "}" inside a string — e.g. the header
// `"Content-Type":"application/json; application/octet-stream"` — cannot cut a config short, and a conditional url is
// found too. The url of a conditional (`url: id ? ".../edit" : ".../add"`) is its first branch, of a concatenation
// (`".../x?id=" + p.id`) its leading string; the whole config is kept verbatim in `cfg`.
export function parseApiChunk(src) {
  const ast = parse(src, { sourceType: "module", plugins: ["topLevelAwait"] });
  const exp = {}; // local binding → exported name
  for (const n of ast.program.body) {
    if (n.type !== "ExportNamedDeclaration") continue;
    for (const s of n.specifiers) if (s.type === "ExportSpecifier") exp[s.local.name ?? s.local.value] = s.exported.name ?? s.exported.value;
    for (const d of n.declaration?.declarations ?? []) if (d.id.type === "Identifier") exp[d.id.name] = d.id.name;
  }
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
  return { fns, copies: namespaceCopies(ast, src, fns, exp), exportCount: Object.keys(exp).length };
}

// `{...ns}` of a module namespace whose members are all request functions of this chunk — esbuild inlines
// `import * as ns from "./x"; export const o = { ...ns }` as
//   b=Object.freeze(Object.defineProperty({__proto__:null,getCompanyInfo:t,…},Symbol.toStringTag,{value:"Module"})),
//   _=p({},b)        (p: esbuild's __spreadValues helper; `_={...b}` without it)
// The copy has the namespace's enumerable string keys (toStringTag is not enumerable) bound to the same functions, so
// `export const o = { getCompanyInfo, … }` over the restored functions is the same object. Only exported copies count.
// the TS for one namespace copy; also appended by registry-cleanup.mjs to an API file that lacks it
export const copySource = (c, tag = "") => `// 原包 \`${c.local}=${c.def}\`：本模块 ${c.members.length} 个接口函数的命名空间对象 ${c.namespace} 的浅拷贝，键名是原包的键名\n/** 原压缩名 ${c.local}，导出名 ${c.exported}${tag} */\nexport const ${c.exported} = { ${c.members.map((m) => (m.key === m.name ? m.key : `${m.key}: ${m.name}`)).join(", ")} };`;

function namespaceCopies(ast, src, fns, exp) {
  // binding → its value: `const x=…`, or `x=…` assigned to a `let` (the top-level-await wrapper declares the module's
  // bindings first and assigns them inside the async body)
  const values = new Map(); const exported = [];
  const seen = (p, name, value) => { const b = p.scope.getBinding(name); if (!b) return; values.set(b, value); if (exp[name] && b.scope === p.scope.getProgramParent()) exported.push({ name, value, scope: p.scope }); };
  traverse(ast, {
    VariableDeclarator(p) { if (p.node.id.type === "Identifier" && p.node.init) seen(p, p.node.id.name, p.node.init); },
    AssignmentExpression(p) { if (p.node.left.type === "Identifier" && p.node.operator === "=") seen(p, p.node.left.name, p.node.right); },
  });
  const valueOf = (scope, name) => values.get(scope.getBinding(name));
  const isMember = (e, obj, prop) => e?.type === "MemberExpression" && e.object.type === "Identifier" && e.object.name === obj && (e.property.name ?? e.property.value) === prop;
  // Object.freeze(Object.defineProperty({__proto__:null, k: fn, …}, Symbol.toStringTag, {value:"Module"})) → [[k, local]]
  const namespace = (fr) => {
    if (fr?.type !== "CallExpression" || !isMember(fr.callee, "Object", "freeze")) return null;
    const dp = fr.arguments[0]; if (dp?.type !== "CallExpression" || !isMember(dp.callee, "Object", "defineProperty") || !isMember(dp.arguments[1], "Symbol", "toStringTag")) return null;
    const obj = dp.arguments[0]; if (obj?.type !== "ObjectExpression") return null;
    const members = [];
    for (const p of obj.properties) {
      const key = p.key?.name ?? p.key?.value;
      if (key === "__proto__") continue;
      if (p.type !== "ObjectProperty" || p.computed || p.value.type !== "Identifier") return null;
      members.push([key, p.value.name]);
    }
    return members;
  };
  // esbuild's __spreadValues: (a,b)=>{for(var k in b||(b={}))hasOwn.call(b,k)&&defProp(a,k,b[k]);…;return a}
  const isSpreadHelper = (f) => /ArrowFunctionExpression|FunctionExpression/.test(f?.type ?? "") && f.params.length === 2 && /^\{for\(var [\w$]+ in [\w$]+\|\|\([\w$]+=\{\}\)\)/.test(src.slice(f.body.start, f.body.end));
  const sourceOf = (e, scope) => {
    if (e.type === "CallExpression" && e.callee.type === "Identifier" && e.arguments.length === 2 && e.arguments[0].type === "ObjectExpression" && !e.arguments[0].properties.length && e.arguments[1].type === "Identifier" && isSpreadHelper(valueOf(scope, e.callee.name))) return e.arguments[1].name;
    if (e.type === "ObjectExpression" && e.properties.length === 1 && e.properties[0].type === "SpreadElement" && e.properties[0].argument.type === "Identifier") return e.properties[0].argument.name;
    return null;
  };
  const byLocal = new Map(fns.map((f) => [f.local, f]));
  const out = [];
  for (const { name, value, scope } of exported) {
    const ns = sourceOf(value, scope); const members = ns && namespace(valueOf(scope, ns));
    if (!members?.length || !members.every(([, l]) => byLocal.has(l))) continue;
    out.push({ local: name, exported: exp[name], namespace: ns, members: members.map(([key, l]) => ({ key, name: byLocal.get(l).name })), def: src.slice(value.start, value.end) });
  }
  return out;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [site, chunk, outTs] = process.argv.slice(2);
  const dir = site === "portal" ? "legacy-dist/portal" : "legacy-dist/usercenter";
  const { fns, copies, exportCount } = parseApiChunk(readFileSync(path.join(dir, "assets", chunk), "utf8"));
  const ts = [`// 由 ${chunk} 还原（脚本生成）。request 的用法与原包一致：request({ url, method, params | data })。`, `import { request } from "@/utils/request";`, "",
    ...fns.map((f) => `/** 原压缩名 ${f.local}${f.exported ? `，导出名 ${f.exported}` : ""} */\nexport const ${f.name} = (${f.params || ""}) => request(${f.cfg});`),
    ...copies.map((c) => copySource(c))].join("\n");
  writeFileSync(outTs, ts + "\n");
  writeFileSync(outTs.replace(/\.ts$/, ".map.json"), JSON.stringify(Object.fromEntries([...fns.map((f) => [f.exported ?? f.local, f.name]), ...copies.map((c) => [c.exported, c.exported])]), null, 2));
  console.log(outTs, fns.length, "functions,", copies.length, "namespace copies; exports in chunk:", exportCount);
}
