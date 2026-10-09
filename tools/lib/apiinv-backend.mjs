// Backend side of the API reconciliation (HM-23, tools/api-inventory.mjs): every Spring MVC endpoint in a backend source
// tree (backend-new-main), as SIGNATURES only — gateway path, HTTP methods, parameter names and where they bind, the
// declared return type and the JSON shape Jackson would produce for it, whether login is required. No source text and
// no DTO implementation leaves this module; DTOs are reduced to property names and JSON types.
//
// Layout assumptions (jeecg-boot cloud, checked against the tree, see docs/backend/api-reconcile.md):
//   - each `<group>/<module>-app` with spring.application.name = <service> is one service; the gateway routes
//     `/<service>/**` to it with the first segment stripped, so the gateway path is `/<service>` + servlet path;
//   - java under `platform/` (jeecg-boot-base-core …) is in every service;
//   - Shiro: `filterChainDefinitionMap.put(url, "anon")` literals + @IgnoreAuth are anonymous; everything else needs a
//     token unless the Nacos property jeecg.shiro.excludeUrls lists it (not in the source tree);
//   - CryptoFilter is registered for "/*" in every service; WHICH urls it encrypts comes from dictionary data.
// A light Java reader (comments, strings, balanced brackets) — not a full parser; it covers what controllers and DTOs use.
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import path from "node:path";

// ---------- low-level text helpers ----------
function stripComments(src) {
  let out = "", i = 0; const n = src.length;
  while (i < n) {
    const c = src[i], d = src[i + 1];
    if (c === "/" && d === "/") { while (i < n && src[i] !== "\n") i++; continue; }
    if (c === "/" && d === "*") { i += 2; while (i < n && !(src[i] === "*" && src[i + 1] === "/")) i++; i += 2; out += " "; continue; }
    if (c === '"' && src.startsWith('"""', i)) { const j = src.indexOf('"""', i + 3); out += src.slice(i, j < 0 ? n : j + 3); i = j < 0 ? n : j + 3; continue; }
    if (c === '"' || c === "'") { let j = i + 1; while (j < n && src[j] !== c) { if (src[j] === "\\") j++; j++; } out += src.slice(i, j + 1); i = j + 1; continue; }
    out += c; i++;
  }
  return out;
}
/** Index of the bracket closing the one at `i` (skips string and char literals). */
function closeOf(s, i) {
  const open = s[i], close = { "(": ")", "{": "}", "[": "]", "<": ">" }[open];
  let depth = 0;
  for (let j = i; j < s.length; j++) {
    const c = s[j];
    if (c === '"' || c === "'") { j++; while (j < s.length && s[j] !== c) { if (s[j] === "\\") j++; j++; } continue; }
    if (c === open) depth++; else if (c === close && --depth === 0) return j;
  }
  return s.length - 1;
}
/** Split on top-level commas (outside (), <>, {}, [] and strings). */
function splitTop(s) {
  const out = []; let depth = 0, cur = "";
  for (let j = 0; j < s.length; j++) {
    const c = s[j];
    if (c === '"' || c === "'") { let k = j + 1; while (k < s.length && s[k] !== c) { if (s[k] === "\\") k++; k++; } cur += s.slice(j, k + 1); j = k; continue; }
    if ("(<{[".includes(c)) depth++; else if (")>}]".includes(c)) depth--;
    if (c === "," && depth === 0) { out.push(cur.trim()); cur = ""; } else cur += c;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}
const strings = (s) => [...String(s ?? "").matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]);

/** Leading annotations of a declaration: [{name, args}] and the rest of the text. */
function takeAnnotations(text) {
  const anns = []; let s = text.trimStart();
  for (;;) {
    const m = s.match(/^@([\w.]+)\s*/);
    if (!m || m[1] === "interface") break;
    let rest = s.slice(m[0].length), args = null;
    if (rest.startsWith("(")) { const e = closeOf(rest, 0); args = rest.slice(1, e); rest = rest.slice(e + 1); }
    anns.push({ name: m[1].split(".").pop(), args }); s = rest.trimStart();
  }
  return { anns, rest: s };
}
/** Annotation attribute: named (`value = …`) or the positional default when `name` is "value". */
function annAttr(ann, name) {
  if (!ann?.args) return null;
  const parts = splitTop(ann.args);
  for (const p of parts) { const m = p.match(/^(\w+)\s*=\s*([\s\S]*)$/); if (m && m[1] === name) return m[2].trim(); }
  if (name === "value" && parts.length && !/^\w+\s*=/.test(parts[0])) return parts[0];
  return null;
}

// ---------- type strings ----------
/** "Result<IPage<Foo>>[]" → {name:"Result", args:[…], array:1} */
export function parseType(t) {
  t = String(t).replace(/@\w+(\([^)]*\))?\s*/g, "").replace(/\bfinal\s+/g, "").trim();
  let array = 0; while (/\[\s*\]$/.test(t)) { t = t.replace(/\[\s*\]$/, "").trim(); array++; }
  if (t.endsWith("...")) { t = t.slice(0, -3).trim(); array++; }
  const lt = t.indexOf("<");
  if (lt < 0) return { name: t.replace(/^\?\s*(extends|super)\s+/, "").trim() || "?", args: [], array };
  const name = t.slice(0, lt).trim(), inner = t.slice(lt + 1, closeOf(t, lt));
  return { name: name.replace(/^\?\s*(extends|super)\s+/, ""), args: splitTop(inner).map(parseType), array };
}
export const typeText = (pt) => pt.name + (pt.args.length ? `<${pt.args.map(typeText).join(", ")}>` : "") + "[]".repeat(pt.array);

const SIMPLE = { String: "string", char: "string", Character: "string", Date: "string", LocalDate: "string", LocalDateTime: "string", LocalTime: "string", Timestamp: "string", UUID: "string",
  int: "number", Integer: "number", long: "number", Long: "number", short: "number", Short: "number", byte: "number", Byte: "number", double: "number", Double: "number", float: "number", Float: "number", BigDecimal: "number", BigInteger: "number", Number: "number",
  boolean: "boolean", Boolean: "boolean" };
const COLLECTION = new Set(["List", "ArrayList", "LinkedList", "Set", "HashSet", "LinkedHashSet", "TreeSet", "Collection", "Iterable", "JSONArray"]);
const ANY = new Set(["Object", "?", "Map", "HashMap", "LinkedHashMap", "TreeMap", "ConcurrentHashMap", "JSONObject", "JsonNode", "ObjectNode", "Serializable", "Dict"]);
// MyBatis-Plus page objects as Jackson writes them (getters of com.baomidou…Page 3.5).
const PAGE = new Set(["IPage", "Page"]);
const PAGE_KEYS = { records: null, total: "number", size: "number", current: "number", pages: "number", orders: "array", optimizeCountSql: "boolean", searchCount: "boolean", countId: "string", maxLimit: "number" };
const SERVLET = new Set(["HttpServletRequest", "HttpServletResponse", "HttpSession", "ServletRequest", "ServletResponse", "Model", "ModelMap", "BindingResult", "Principal", "Locale"]);
const isSimpleParam = (pt) => !!SIMPLE[pt.name] || (COLLECTION.has(pt.name) && pt.args.every((a) => SIMPLE[a.name])) || (pt.array && SIMPLE[pt.name]);

// ---------- class reader ----------
/** All type declarations of one file: [{simple, fqn, kind, anns, typeParams, ext, fields, methods, nested}] */
function readTypes(src, pkg) {
  const out = [];
  const re = /\b(class|interface|enum|record|@interface)\s+([A-Za-z_$][\w$]*)/g;
  const scan = (text, outerFqn, from, to) => {
    re.lastIndex = from;
    let m;
    while ((m = re.exec(text)) && m.index < to) {
      // the declaration's annotations/modifiers sit between the previous `;`/`}`/`{` and the keyword
      let st = m.index;
      while (st > from && !";{}".includes(text[st - 1])) { st--; if (text[st] === ")") { let d = 0; for (; st > from; st--) { if (text[st] === ")") d++; else if (text[st] === "(" && --d === 0) break; } } }
      const head = text.slice(st, m.index);
      const brace = text.indexOf("{", m.index);
      if (brace < 0 || brace > to) break;
      const end = closeOf(text, brace);
      const { anns } = takeAnnotations(head.replace(/\b(public|private|protected|static|final|abstract|sealed|non-sealed|strictfp)\b/g, " "));
      const decl = text.slice(m.index, brace);
      const simple = m[2], fqn = outerFqn ? `${outerFqn}.${simple}` : (pkg ? `${pkg}.${simple}` : simple);
      const afterName = decl.slice(decl.indexOf(simple) + simple.length).trimStart();
      const ownTp = afterName.startsWith("<") ? afterName.slice(0, closeOf(afterName, 0) + 1) : "";
      const tp = ownTp ? splitTop(ownTp.slice(1, -1)).map((x) => x.split(/\s+/)[0]) : [];
      const tail = afterName.slice(ownTp.length);
      const extM = tail.match(/^\s*extends\s+([\w.$]+)\s*(<)?/);
      const extText = extM ? (extM[2] ? tail.slice(tail.indexOf(extM[1]), tail.indexOf("<", tail.indexOf(extM[1])) + 1 + closeOf(tail.slice(tail.indexOf("<", tail.indexOf(extM[1]))), 0)) : extM[1]) : null;
      const t = { simple, fqn, kind: m[1], anns, typeParams: tp, ext: m[1] === "class" && extText ? parseType(extText.trim()) : null, fields: [], methods: [], bodyStart: brace + 1, bodyEnd: end };
      readMembers(text, t, brace + 1, end);
      out.push(t);
      scanNested(text, t, fqn);
      re.lastIndex = end + 1;
    }
  };
  const scanNested = (text, t, fqn) => { for (const r of t.nestedRanges ?? []) scan(text, fqn, r[0], r[1]); };
  scan(src, null, 0, src.length);
  return out;
}

/** Members at depth 1 of a class body: fields (name, type, annotations, static) and methods (with body range). */
function readMembers(s, t, from, to) {
  let i = from, start = from, paren = 0, sawEq = false;
  t.nestedRanges = [];
  while (i < to) {
    const c = s[i];
    if (c === '"' || c === "'") { let j = i + 1; while (j < to && s[j] !== c) { if (s[j] === "\\") j++; j++; } i = j + 1; continue; }
    if (c === "(") paren++; else if (c === ")") paren--;
    else if (c === "=" && paren === 0 && s[i + 1] !== "=" && !"=!<>".includes(s[i - 1])) sawEq = true;
    else if (c === "{" && paren === 0) {
      const e = closeOf(s, i);
      const head = s.slice(start, i);
      if (sawEq) { i = e + 1; continue; } // field initializer (array, lambda, anonymous class): runs to the `;`
      if (/\b(class|interface|enum|record)\s+[A-Za-z_$]/.test(head.replace(/@\w+(\([^)]*\))?/g, ""))) { t.nestedRanges.push([start, e + 1]); }
      else if (takeAnnotations(head).rest.includes("(")) addMethod(t, head, s, i, e);
      i = e + 1; start = i; sawEq = false; continue;
    } else if (c === ";" && paren === 0) {
      const head = s.slice(start, i);
      if (!sawEq && takeAnnotations(head).rest.includes("(")) addMethod(t, head, s, -1, -1); // abstract / interface method
      else addField(t, head);
      start = i + 1; sawEq = false;
    }
    i++;
  }
}
function addField(t, head) {
  const { anns, rest } = takeAnnotations(head);
  const isStatic = /\bstatic\b/.test(rest);
  const decl = rest.replace(/\b(public|private|protected|static|final|transient|volatile)\b/g, " ").split("=")[0].trim();
  const m = decl.match(/^([\s\S]+?)\s+([A-Za-z_$][\w$]*)\s*$/);
  if (!m) return;
  t.fields.push({ name: m[2], type: m[1].trim(), anns, isStatic, isPublic: /\bpublic\b/.test(rest) });
}
function addMethod(t, head, s, bodyStart, bodyEnd) {
  const { anns, rest } = takeAnnotations(head);
  const p = rest.indexOf("(");
  const before = rest.slice(0, p).trim(), params = rest.slice(p + 1, closeOf(rest, p));
  const nm = before.match(/([A-Za-z_$][\w$]*)$/);
  if (!nm) return;
  const mods = before.slice(0, before.length - nm[1].length);
  const ret = mods.replace(/\b(public|private|protected|static|final|abstract|synchronized|native|default)\b/g, " ").replace(/^\s*<[^>]*>\s*/, "").trim();
  t.methods.push({ name: nm[1], ret, params: params.trim() ? splitTop(params) : [], anns, isStatic: /\bstatic\b/.test(mods), isPublic: /\bpublic\b/.test(mods) || t.kind === "interface", body: bodyStart >= 0 ? s.slice(bodyStart + 1, bodyEnd) : "" });
}

// ---------- tree ----------
function javaFiles(root) {
  const out = [];
  const walk = (d) => { for (const n of readdirSync(d)) { if (n === "target" || n === "node_modules" || n.startsWith(".")) continue; const p = path.join(d, n); const st = statSync(p); if (st.isDirectory()) walk(p); else if (n.endsWith(".java")) out.push(p); } };
  walk(root);
  return out.sort();
}
/** Service groups: dir that holds a `*-app` module → spring.application.name of that module. */
function serviceGroups(root) {
  const groups = [];
  const walk = (d, depth) => {
    if (depth > 4) return;
    for (const n of readdirSync(d)) {
      if (n === "target" || n === "node_modules" || n.startsWith(".")) continue;
      const p = path.join(d, n);
      if (!statSync(p).isDirectory()) continue;
      for (const y of ["application.yml", "bootstrap.yml", "application.yaml"]) {
        const f = path.join(p, "src", "main", "resources", y);
        if (!existsSync(f)) continue;
        const name = appName(readFileSync(f, "utf8"));
        const pom = path.join(p, "pom.xml");
        if (name) { groups.push({ dir: path.dirname(p), app: p, service: name, platform: existsSync(pom) && /jeecg-boot-base-core/.test(readFileSync(pom, "utf8")) }); break; }
      }
      walk(p, depth + 1);
    }
  };
  walk(root, 0);
  return groups;
}
function appName(yml) {
  const lines = yml.split("\n"); let inSpring = -1, inApp = -1;
  for (const l of lines) {
    if (/^\s*#/.test(l) || !l.trim()) continue;
    const ind = l.match(/^\s*/)[0].length;
    if (inApp >= 0 && ind <= inApp) inApp = -1;
    if (inSpring >= 0 && ind <= inSpring && !/^\s*spring:/.test(l)) inSpring = -1;
    if (/^spring:\s*$/.test(l.trimEnd()) && ind === 0) { inSpring = ind; continue; }
    if (inSpring >= 0 && /^\s*application:\s*$/.test(l)) { inApp = ind; continue; }
    if (inApp >= 0) { const m = l.match(/^\s*name:\s*([\w.-]+)/); if (m) return m[1]; }
  }
  return null;
}

/** Ant-style path match (`**`, `*`). */
const antRe = (p) => new RegExp("^" + p.split("/").map((seg) => seg === "**" ? "§§" : seg.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[^/]*")).join("/").replace(/\/§§/g, "(?:/.*)?").replace(/§§/g, ".*") + "$");

// ---------- main ----------
export function scanBackend(root) {
  const groups = serviceGroups(path.join(root));
  const files = javaFiles(root);
  const index = new Map(), bySimple = new Map(), fileCtx = new Map();
  const shiroAnon = []; let cryptoAll = false;
  for (const f of files) {
    const src = stripComments(readFileSync(f, "utf8"));
    const pkg = src.match(/^\s*package\s+([\w.]+)\s*;/m)?.[1] ?? "";
    const imports = {}, wild = [];
    for (const m of src.matchAll(/^\s*import\s+(static\s+)?([\w.]+)(\.\*)?\s*;/gm)) { if (m[1]) continue; if (m[3]) wild.push(m[2]); else imports[m[2].split(".").pop()] = m[2]; }
    const rel = path.relative(root, f);
    const group = groups.filter((g) => f.startsWith(g.dir + path.sep)).sort((a, b) => b.dir.length - a.dir.length)[0];
    const ctx = { pkg, imports, wild, rel, service: group?.service ?? "*" };
    for (const m of src.matchAll(/filterChainDefinitionMap\.put\(\s*"([^"]+)"\s*,\s*"anon"\s*\)/g)) shiroAnon.push(m[1]);
    if (/new\s+CryptoFilter\s*\(/.test(src) && /addUrlPatterns\(\s*"\/\*"\s*\)/.test(src)) cryptoAll = true;
    for (const t of readTypes(src, pkg)) {
      t.ctx = ctx; index.set(t.fqn, t);
      if (!bySimple.has(t.simple)) bySimple.set(t.simple, []);
      bySimple.get(t.simple).push(t);
    }
    fileCtx.set(f, ctx);
  }

  const resolve = (name, ctx) => {
    if (!name) return null;
    if (index.has(name)) return index.get(name);
    const [head, ...tail] = name.split(".");
    const tryFqn = (fq) => index.get([fq, ...tail].join("."));
    if (ctx.imports[head]) { const r = tryFqn(ctx.imports[head]); if (r) return r; }
    { const r = tryFqn(`${ctx.pkg}.${head}`); if (r) return r; }
    for (const w of ctx.wild) { const r = tryFqn(`${w}.${head}`) ?? index.get(`${w}.${name}`); if (r) return r; }
    if (ctx.imports[head]) return null; // imported from a library: not in the tree
    const cands = (bySimple.get(name.split(".").pop()) ?? []);
    return cands.find((c) => c.ctx.service === ctx.service) ?? cands.find((c) => c.ctx.service === "*") ?? cands[0] ?? null;
  };

  // Jackson view of a class: property → {type, ctx}. Getters (getX/isX), public fields; fields too when the class has
  // no getters at all (Lombok source). @JsonIgnore drops, @JsonProperty renames, @JsonIgnoreProperties drops.
  const decap = (s) => (s.length > 1 && /[A-Z]/.test(s[1]) && /[A-Z]/.test(s[0]) ? s : s[0].toLowerCase() + s.slice(1));
  const propsCache = new Map();
  const propsOf = (t) => {
    if (propsCache.has(t.fqn)) return propsCache.get(t.fqn);
    propsCache.set(t.fqn, { props: {}, typeParams: t.typeParams });
    const props = {};
    if (t.ext) { const sup = resolve(t.ext.name, t.ctx); if (sup) { const sp = propsOf(sup); for (const [k, v] of Object.entries(sp.props)) props[k] = { ...v, bind: Object.fromEntries(sp.typeParams.map((tp, i) => [tp, t.ext.args[i] ? { pt: t.ext.args[i], ctx: t.ctx } : null])) }; } }
    const ignoredByClass = new Set(strings(annAttr(t.anns.find((a) => a.name === "JsonIgnoreProperties"), "value")));
    const fieldAnn = Object.fromEntries(t.fields.map((f) => [f.name, f.anns]));
    const lombok = t.anns.some((a) => ["Data", "Getter", "Value"].includes(a.name));
    const getters = t.methods.filter((m) => !m.isStatic && m.isPublic && m.params.length === 0 && m.ret !== "void" && (/^get[A-Z_$]/.test(m.name) || (/^is[A-Z]/.test(m.name) && /^(boolean|Boolean)$/.test(m.ret))) && m.name !== "getClass");
    const add = (name, type, anns) => {
      const all = [...(anns ?? []), ...(fieldAnn[name] ?? [])];
      if (all.some((a) => a.name === "JsonIgnore" && !/false/.test(a.args ?? "")) || all.some((a) => a.name === "JSONField" && /serialize\s*=\s*false/.test(a.args ?? "")) || all.some((a) => a.name === "JsonProperty" && /WRITE_ONLY/.test(a.args ?? ""))) { delete props[name]; return; }
      const rename = strings(annAttr(all.find((a) => a.name === "JsonProperty"), "value"))[0] ?? strings(annAttr(all.find((a) => a.name === "JSONField"), "name"))[0];
      props[rename || name] = { type, ctx: t.ctx, bind: null };
    };
    for (const g of getters) add(decap(g.name.replace(/^(get|is)/, "")), g.ret, g.anns);
    for (const f of t.fields.filter((x) => !x.isStatic && (x.isPublic || lombok || getters.length === 0))) add(f.name, f.type, f.anns);
    for (const k of ignoredByClass) delete props[k];
    const r = { props, typeParams: t.typeParams };
    propsCache.set(t.fqn, r);
    return r;
  };

  /** JSON shape for a Java type (same {type, keys, items} as apiinv-har.mjs; `any` where Java does not say). */
  const shapeOfType = (pt, ctx, bind = {}, stack = [], depth = 0) => {
    if (pt.array) { if (pt.name === "byte" && pt.array === 1) return { type: "string" }; return { type: "array", items: shapeOfType({ ...pt, array: pt.array - 1 }, ctx, bind, stack, depth + 1) }; }
    if (bind[pt.name]) { const b = bind[pt.name]; return b ? shapeOfType(b.pt, b.ctx, {}, stack, depth) : { type: "any" }; }
    if (SIMPLE[pt.name]) return { type: SIMPLE[pt.name] };
    if (COLLECTION.has(pt.name)) return { type: "array", items: pt.args[0] ? shapeOfType(pt.args[0], ctx, bind, stack, depth + 1) : { type: "any" } };
    if (ANY.has(pt.name) || /^[A-Z]$/.test(pt.name)) return { type: "any" };
    if (PAGE.has(pt.name)) {
      const keys = Object.fromEntries(Object.entries(PAGE_KEYS).map(([k, v]) => [k, v ? { type: v } : { type: "array", items: pt.args[0] ? shapeOfType(pt.args[0], ctx, bind, stack, depth + 1) : { type: "any" } }]));
      return { type: "object", keys, lib: "mybatis-plus Page" };
    }
    if (pt.name === "void" || pt.name === "Void") return { type: "none" };
    const t = resolve(pt.name, ctx);
    if (!t) return { type: "object", unresolved: pt.name };
    if (t.kind === "enum") return { type: "string" };
    if (stack.includes(t.fqn) || depth > 5) return { type: "object", recursive: t.simple };
    const { props, typeParams } = propsOf(t);
    const myBind = Object.fromEntries(typeParams.map((tp, i) => [tp, pt.args[i] ? { pt: pt.args[i], ctx } : null]));
    const keys = {};
    for (const [k, v] of Object.entries(props)) {
      const b = v.bind ? Object.fromEntries(Object.entries(v.bind).map(([n, x]) => [n, x && myBind[x.pt.name] !== undefined && !x.pt.args.length && !x.pt.array ? myBind[x.pt.name] : x])) : myBind;
      keys[k] = shapeOfType(parseType(v.type), v.ctx, b, [...stack, t.fqn], depth + 1);
    }
    return { type: "object", keys, class: t.simple };
  };
  /** Request-binding property names of a DTO (fields and setters), for @RequestBody and model attributes. */
  const inputPropsOf = (pt, ctx) => {
    if (ANY.has(pt.name) || COLLECTION.has(pt.name) || pt.array) return null;
    const t = resolve(pt.name, ctx);
    if (!t) return null;
    const names = new Set();
    for (let c = t, guard = 0; c && guard < 8; c = c.ext ? resolve(c.ext.name, c.ctx) : null, guard++) {
      for (const f of c.fields) if (!f.isStatic) names.add(f.name);
      for (const m of c.methods) if (/^set[A-Z]/.test(m.name) && m.params.length === 1) names.add(decap(m.name.slice(3)));
    }
    return [...names].sort();
  };

  const MAPPINGS = { GetMapping: ["GET"], PostMapping: ["POST"], PutMapping: ["PUT"], DeleteMapping: ["DELETE"], PatchMapping: ["PATCH"], RequestMapping: null };
  const mapPaths = (ann) => { const v = annAttr(ann, "value") ?? annAttr(ann, "path"); const s = strings(v); return s.length ? s : [""]; };
  const mapMethods = (ann) => { if (MAPPINGS[ann.name]) return MAPPINGS[ann.name]; const m = annAttr(ann, "method"); const r = [...String(m ?? "").matchAll(/RequestMethod\.(\w+)/g)].map((x) => x[1]); return r.length ? r : ["ANY"]; };
  const join = (...ps) => ("/" + ps.map((p) => p.replace(/^\/+|\/+$/g, "")).filter(Boolean).join("/")).replace(/\/{2,}/g, "/");

  const endpoints = [];
  const controllers = [...index.values()].filter((t) => t.anns.some((a) => a.name === "RestController" || a.name === "Controller"));
  const methodsWithInherited = (t) => { const out = [...t.methods]; for (let c = t.ext ? resolve(t.ext.name, t.ctx) : null, g = 0; c && g < 5; c = c.ext ? resolve(c.ext.name, c.ctx) : null, g++) out.push(...c.methods.filter((m) => m.anns.some((a) => a.name in MAPPINGS)).map((m) => ({ ...m, inheritedFrom: c.simple, ctxOverride: c.ctx }))); return out; };
  for (const t of controllers) {
    const restClass = t.anns.some((a) => a.name === "RestController") || t.anns.some((a) => a.name === "ResponseBody");
    const baseAnn = t.anns.find((a) => a.name === "RequestMapping");
    const bases = baseAnn ? mapPaths(baseAnn) : [""];
    const services = t.ctx.service === "*" ? [...new Set(groups.filter((g) => g.platform).map((g) => g.service))] : [t.ctx.service];
    for (const m of methodsWithInherited(t)) {
      const mAnn = m.anns.find((a) => a.name in MAPPINGS);
      if (!mAnn) continue;
      const ctx = m.ctxOverride ?? t.ctx;
      const params = [];
      let body = null;
      for (const raw of m.params) {
        const { anns, rest } = takeAnnotations(raw);
        const parts = rest.replace(/\bfinal\s+/g, "").trim().match(/^([\s\S]+?)\s+([A-Za-z_$][\w$]*)$/);
        if (!parts) continue;
        const pt = parseType(parts[1]), pname = parts[2];
        const a = (n) => anns.find((x) => x.name === n);
        if (a("RequestParam")) {
          const ra = a("RequestParam");
          const name = strings(annAttr(ra, "name") ?? annAttr(ra, "value"))[0] ?? pname;
          const req = !/false/.test(annAttr(ra, "required") ?? "") && annAttr(ra, "defaultValue") == null;
          params.push({ name, in: pt.name === "MultipartFile" ? "file" : "query", required: req, type: typeText(pt) });
        } else if (a("PathVariable")) params.push({ name: strings(annAttr(a("PathVariable"), "name") ?? annAttr(a("PathVariable"), "value"))[0] ?? pname, in: "path", required: true, type: typeText(pt) });
        else if (a("RequestHeader")) params.push({ name: strings(annAttr(a("RequestHeader"), "name") ?? annAttr(a("RequestHeader"), "value"))[0] ?? pname, in: "header", required: !/false/.test(annAttr(a("RequestHeader"), "required") ?? ""), type: typeText(pt) });
        else if (a("RequestBody")) { body = { type: typeText(pt), required: !/false/.test(annAttr(a("RequestBody"), "required") ?? ""), props: inputPropsOf(pt, ctx) }; }
        else if (a("RequestAttribute") || a("ApiIgnore") || SERVLET.has(pt.name)) continue;
        else if (pt.name === "MultipartFile" || pt.name === "MultipartHttpServletRequest") params.push({ name: pname, in: "file", required: false, type: typeText(pt) });
        else if (isSimpleParam(pt)) params.push({ name: pname, in: "query", required: false, type: typeText(pt) });
        else { const props = inputPropsOf(pt, ctx); params.push({ name: pname, in: "model", required: false, type: typeText(pt), props }); }
      }
      const fromRequest = [...new Set([...m.body.matchAll(/\.getParameter(?:Values)?\(\s*"([^"]+)"\s*\)/g)].map((x) => x[1]))];
      const methodRest = restClass || m.anns.some((a) => a.name === "ResponseBody");
      const retPt = parseType(m.ret || "void");
      const ret = methodRest ? shapeOfType(retPt, ctx) : { type: "view" };
      const auth = m.anns.some((a) => a.name === "IgnoreAuth") ? "anon:@IgnoreAuth" : m.anns.some((a) => a.name === "NeedLoginAuth") ? "login:@NeedLoginAuth" : null;
      for (const base of bases) for (const mp of mapPaths(mAnn)) {
        const servletPath = join(base, mp);
        const anonRule = auth ? null : shiroAnon.find((r) => antRe(r).test(servletPath));
        for (const service of services) endpoints.push({
          service, path: join(service, servletPath), servletPath, methods: mapMethods(mAnn), controller: t.simple + (m.inheritedFrom ? `(<${m.inheritedFrom})` : ""), handler: m.name, file: path.relative(root, path.join(root, (m.ctxOverride ?? t.ctx).rel)),
          params, requestParamsInBody: fromRequest, body, returnType: m.ret, returnShape: ret,
          auth: auth ?? (anonRule ? `anon:shiro(${anonRule})` : "jwt"),
        });
      }
    }
  }
  return { root: path.basename(root), groups: groups.map((g) => ({ service: g.service, dir: path.relative(root, g.dir), platform: g.platform })), counts: { javaFiles: files.length, types: index.size, controllers: controllers.length, endpoints: endpoints.length }, cryptoFilter: cryptoAll ? "registered for /* in every service (platform); urls from dictionary data" : "not found", shiroAnon, endpoints };
}
