// Binding graph of an entry chunk, pruned to one tenant (appCode). Used by scan-shared-gaps.mjs to decide which of the
// entry's component definitions, globals and exports the Hami build actually reaches (batch-plan.md §2, §6.3).
//
// "Units" are the module-level definitions: `var/let/const` declarators, function and class declarations, and
// assignments to hoisted variables (Vite's top-level-await wrapper `let A,B; ... H(void 0,null,function*(){ A=...; })`
// moves every definition into the generator body, so its statements count as module level too). Every other statement
// (side effects such as app.mount) is a root. An edge unit → binding exists when the unit's code references the binding.
// Tenant pruning (option keepViews below): a `switch (x.appCode)` case for another code, or the branch of `x.appCode == "0NN"` that only runs for
// another tenant, is not followed.
import { readFileSync } from "node:fs";
import path from "node:path";
import { parse } from "@babel/parser";
import traverseModule from "@babel/traverse";
import { ROOT, SITES, HAMI_APPCODE } from "./scope.mjs";
const traverse = traverseModule.default ?? traverseModule;

const isAppCodeMember = (n) => n && n.type === "MemberExpression" && !n.computed && n.property.name === "appCode";
const strLit = (n) => n && n.type === "StringLiteral" ? n.value : null;
// test like  X.appCode=="018"  /  "018"===X.appCode  /  X.appCode!="018" → {code, negate}
function appCodeTest(t) {
  if (!t || t.type !== "BinaryExpression" || !["==", "===", "!=", "!=="].includes(t.operator)) return null;
  const [a, b] = isAppCodeMember(t.left) ? [t.left, t.right] : isAppCodeMember(t.right) ? [t.right, t.left] : [null, null];
  const code = a && strLit(b); if (!code || !/^\d{3}$/.test(code)) return null;
  return { code, negate: t.operator.startsWith("!") };
}

// keepViews: for the portal's import.meta.glob page map, the set of "src/views/....vue" keys this tenant routes to; other
// keys are not followed (the map also holds eager tenant-specific App/home modules of other cities).
export function entryGraph(site, { appCode = HAMI_APPCODE, keepViews = null } = {}) {
  const cfg = SITES[site];
  const file = path.join(ROOT, cfg.dir, "assets", cfg.entry);
  const src = readFileSync(file, "utf8");
  const ast = parse(src, { sourceType: "module", plugins: ["topLevelAwait"] });

  // the TLA wrapper: the largest generator function whose body holds most of the file
  let wrapper = null;
  traverse(ast, { FunctionExpression(p) { if (p.node.generator && p.node.end - p.node.start > src.length * 0.5) { wrapper = p; p.stop(); } } });
  const units = new Map(); // key -> {key, name, start, end, refs:Set<key>, root:boolean}
  let programScope = null;
  traverse(ast, { Program(p) { programScope = p.scope; p.stop(); } });
  // module-level scopes, compared by their block node (scope objects are not shared between traversals)
  const levelBlocks = new Set([ast.program]); if (wrapper) levelBlocks.add(wrapper.node);
  const isLevel = (b) => b && levelBlocks.has(b.scope.block);
  // a binding is identified by its declaring identifier's position (scope objects differ between traversals)
  const keyOf = (scope, name) => { const b = scope.getBinding(name); return b ? `${name}@${b.identifier.start}` : `${name}@?`; };

  // statement paths for scope lookups
  const stmtPaths = [];
  traverse(ast, { Program(p) { for (const s of p.get("body")) stmtPaths.push(s); p.stop(); } });
  if (wrapper) for (const s of wrapper.get("body.body")) stmtPaths.push(s);

  let rootN = 0;
  const addUnit = (key, name, node, root = false) => { const u = { key, name, start: node.start, end: node.end, refs: new Set(), root, paths: [] }; units.set(key, u); return u; };
  const unitPaths = []; // [unit, path]
  for (const sp of stmtPaths) {
    const n = sp.node;
    if (sp.parentPath?.isProgram() && wrapper && n.start <= wrapper.node.start && n.end >= wrapper.node.end) continue; // the statement holding the wrapper: its body is walked separately
    if (n.type === "ImportDeclaration" || n.type === "ExportNamedDeclaration") continue;
    if (n.type === "VariableDeclaration") {
      sp.get("declarations").forEach((d) => { if (d.node.id.type === "Identifier") { const u = addUnit(keyOf(sp.scope, d.node.id.name), d.node.id.name, d.node); if (d.node.init) unitPaths.push([u, d.get("init")]); } else { const u = addUnit(`root:${rootN++}`, null, d.node, true); unitPaths.push([u, d]); } });
    } else if ((n.type === "FunctionDeclaration" || n.type === "ClassDeclaration") && n.id) {
      const u = addUnit(keyOf(sp.scope, n.id.name), n.id.name, n); unitPaths.push([u, sp]);
    } else if (n.type === "ExpressionStatement") {
      const e = sp.get("expression");
      const parts = e.isSequenceExpression() ? e.get("expressions") : [e];
      for (const part of parts) {
        if (part.isAssignmentExpression() && part.node.operator === "=" && part.node.left.type === "Identifier") {
          const b = part.scope.getBinding(part.node.left.name);
          if (isLevel(b)) { const key = keyOf(part.scope, part.node.left.name); const u = units.get(key) ?? addUnit(key, part.node.left.name, part.node); unitPaths.push([u, part.get("right")]); continue; }
        }
        const u = addUnit(`root:${rootN++}`, null, part.node, true); unitPaths.push([u, part]);
      }
    } else { const u = addUnit(`root:${rootN++}`, null, n, true); unitPaths.push([u, sp]); }
  }

  const otherTenant = (code) => code !== appCode;
  for (const [u, p] of unitPaths) {
    u.paths.push([p.node.start, p.node.end]);
    const visitRef = (ip) => {
      const b = ip.scope.getBinding(ip.node.name);
      if (isLevel(b)) u.refs.add(`${ip.node.name}@${b.identifier.start}`);
    };
    const pruneVisitor = {
      SwitchCase(cp) { const sw = cp.parentPath.node; const code = strLit(cp.node.test); if (isAppCodeMember(sw.discriminant) && code && otherTenant(code)) cp.skip(); },
      // the test's value is known for this tenant: skip the branch this tenant never runs
      "ConditionalExpression|IfStatement"(cp) { const t = appCodeTest(cp.node.test); if (!t) return; const taken = (t.code === appCode) !== t.negate; const dead = taken ? "alternate" : "consequent"; if (cp.node[dead]) cp.get(dead).skip(); },
      ObjectProperty(op) { const k = strLit(op.node.key); if (keepViews && k && /^\/?src\/views\/.+\.vue$/.test(k) && !keepViews.has(k.replace(/^\//, ""))) op.skip(); },
      Identifier(ip) { if (ip.isReferencedIdentifier()) visitRef(ip); },
    };
    if (p.isIdentifier && p.isIdentifier() && p.isReferencedIdentifier()) visitRef(p);
    p.traverse(pruneVisitor);
  }

  // exports: exported name -> unit key (export locals are program-level bindings)
  const exports = {};
  for (const n of ast.program.body) if (n.type === "ExportNamedDeclaration") for (const s of n.specifiers) exports[s.exported.name] = keyOf(programScope, s.local.name);

  const unitAt = (pos) => { let best = null; for (const u of units.values()) for (const [a, b] of u.paths) if (a <= pos && pos < b && (!best || b - a < best.size)) best = { u, size: b - a }; return best?.u ?? null; };
  return { site, src, units, exports, unitAt, keyOf };
}

export function reach(graph, rootKeys) {
  const seen = new Set(); const q = [...rootKeys];
  while (q.length) { const k = q.pop(); if (seen.has(k) || !graph.units.has(k)) continue; seen.add(k); for (const r of graph.units.get(k).refs) if (!seen.has(r)) q.push(r); }
  return seen;
}
