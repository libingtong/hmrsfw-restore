// JS coverage of the ORIGINAL side (docs/pipeline.md §12, HM-21): turns the V8 precise coverage Playwright collects while
// baseline.mjs replays a page under its HAR into one number per page and a list of what was not run, so the recorder can
// see which modals / tabs / branches the interaction script never reached.
// Pure functions over { url, source, functions } entries (Playwright's page.coverage.stopJSCoverage()); nothing here
// touches the network or the disk.
//   function  = functions entered / functions in the chunk (the module's top-level function is not counted)
//   block     = non-whitespace characters executed / non-whitespace characters in the chunk (V8 block ranges, innermost
//               range wins), so an `if` arm or a conditional branch that never ran counts for what it weighs
// Several runs of the same page are united: whatever any run executed counts as covered.
import { parse } from "@babel/parser";

export const COVERAGE_VERSION = 1;
const MIN_UNIT_CHARS = 12;    // uncovered stretches shorter than this are not worth a line in the report
const MAX_UNITS = 80;         // longest first; the rest are only counted in `truncated`
const MIN_DATA_CHARS = 60;    // a conditional stretch smaller than this is a message or an attribute, not a block that needs data
const MERGE_GAP = 2;          // non-space characters (`,` `)`) between two uncovered stretches that still make one unit
const isWs = (c) => c === 32 || c === 9 || c === 10 || c === 13 || c === 160 || c === 0xfeff || c === 0x2028 || c === 0x2029;

// One script of one run → { covered: Uint8Array per UTF-16 unit, fns: [{start,end,name,covered}] }.
export function paintScript(entry) {
  const n = entry.source.length;
  const covered = new Uint8Array(n);
  const ranges = [];
  const fns = [];
  for (const f of entry.functions) {
    f.ranges.forEach((r, i) => {
      ranges.push({ s: r.startOffset, e: Math.min(r.endOffset, n), c: r.count > 0 ? 1 : 0, ord: ranges.length });
      if (i === 0 && !(r.startOffset === 0 && r.endOffset >= n)) fns.push({ start: r.startOffset, end: r.endOffset, name: f.functionName || "", covered: r.count > 0 });
    });
  }
  // Outer ranges first, so a nested block (which V8 only lists when its count differs from the parent) overrides it.
  ranges.sort((a, b) => a.s - b.s || b.e - a.e || a.ord - b.ord);
  for (const r of ranges) if (r.c) covered.fill(1, r.s, r.e); else covered.fill(0, r.s, r.e);
  return { covered, fns };
}

// Union of several painted runs of one script.
export function unitePainted(list) {
  const first = list[0];
  const covered = new Uint8Array(first.covered.length);
  for (const p of list) for (let i = 0; i < covered.length; i++) if (p.covered[i]) covered[i] = 1;
  const map = new Map();
  for (const p of list) for (const f of p.fns) {
    const k = f.start + ":" + f.end, old = map.get(k);
    if (!old) map.set(k, { ...f }); else if (f.covered) old.covered = true;
  }
  return { covered, fns: [...map.values()].sort((a, b) => a.start - b.start || b.end - a.end) };
}

const pct = (a, b) => (b ? Math.round((a / b) * 10000) / 100 : 100);

export function measure(source, painted) {
  let total = 0, cov = 0;
  for (let i = 0; i < source.length; i++) { if (isWs(source.charCodeAt(i))) continue; total++; if (painted.covered[i]) cov++; }
  const fTotal = painted.fns.length, fCov = painted.fns.filter((f) => f.covered).length;
  return {
    bytes: source.length,
    function: { total: fTotal, covered: fCov, pct: pct(fCov, fTotal) },
    block: { chars: total, covered: cov, pct: pct(cov, total) },
  };
}

// Maximal stretches of never-executed code, whitespace at the edges trimmed, close neighbours merged.
export function uncoveredStretches(source, painted) {
  const out = [];
  const n = source.length;
  let i = 0;
  while (i < n) {
    if (painted.covered[i] || isWs(source.charCodeAt(i))) { i++; continue; }
    let s = i, e = i + 1;
    while (e < n && !painted.covered[e]) e++;
    while (e > s && isWs(source.charCodeAt(e - 1))) e--;
    out.push({ start: s, end: e });
    i = e;
  }
  const merged = [];
  for (const u of out) {
    const last = merged[merged.length - 1];
    if (last) {
      let gap = 0;
      for (let k = last.end; k < u.start; k++) if (!isWs(source.charCodeAt(k))) gap++;
      if (gap <= MERGE_GAP) { last.end = u.end; continue; }
    }
    merged.push({ ...u });
  }
  for (const u of merged) {
    u.chars = 0;
    for (let k = u.start; k < u.end; k++) if (!isWs(source.charCodeAt(k))) u.chars++;
  }
  return merged.filter((u) => u.chars >= MIN_UNIT_CHARS);
}

// ---- hints: what an uncovered stretch is, from the (minified) code around it ----
const keyName = (p) => (p.key ? (p.key.name ?? p.key.value ?? null) : null);
const MODAL = ["onOk", "onCancel", "okText", "cancelText", "confirmLoading", "okButtonProps"];
const TABS = ["activeKey", "onTabClick", "onUpdate:activeKey", "tabPosition", "tabBarGutter"];
const POP = ["trigger", "overlay", "onVisibleChange", "overlayClassName", "onOpenChange", "getPopupContainer"];
const FORMKEYS = ["onFinish", "onFinishFailed", "rules", "labelCol", "wrapperCol", "validateFirst"];
const hasAny = (keys, list) => list.some((k) => keys.has(k));

function ctxOfProps(keys) {
  const ctx = [];
  const overlayLike = keys.has("visible") || keys.has("open") || keys.has("onUpdate:visible") || keys.has("onUpdate:open");
  const drawerLike = keys.has("placement") || (keys.has("onClose") && !hasAny(keys, MODAL));
  if (overlayLike && drawerLike) ctx.push("drawer");
  else if (hasAny(keys, MODAL) || (overlayLike && (keys.has("footer") || keys.has("width") || keys.has("title")))) ctx.push("modal");
  if (hasAny(keys, TABS)) ctx.push("tabs");
  if (hasAny(keys, POP)) ctx.push("dropdown");
  if (hasAny(keys, FORMKEYS)) ctx.push("form");
  if (keys.has("onUpdate:current") || keys.has("onShowSizeChange") || keys.has("pageSize")) ctx.push("pagination");
  return ctx;
}

const children = (node) => {
  const out = [];
  for (const k in node) {
    if (k === "loc" || k === "start" || k === "end" || k === "extra" || k === "leadingComments" || k === "trailingComments" || k === "innerComments") continue;
    const v = node[k];
    if (Array.isArray(v)) { for (const c of v) if (c && typeof c.type === "string") out.push(c); } else if (v && typeof v.type === "string") out.push(v);
  }
  return out;
};

// Innermost-last chain of nodes that contain [s, e).
function chainOf(root, s, e) {
  const chain = [root];
  for (let node = root; ;) {
    const next = children(node).find((c) => c.start <= s && c.end >= e);
    if (!next) return chain;
    chain.push(next); node = next;
  }
}

export function parseScript(source) {
  try { return parse(source, { sourceType: "module", errorRecovery: true, allowReturnOutsideFunction: true, allowAwaitOutsideFunction: true }).program; } catch { return null; }
}

// The published chunks keep Chinese text as \uXXXX escapes.
const unescapeU = (t) => t.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));

function hintsFor(source, program, u) {
  const text = unescapeU(source.slice(u.start, u.end));
  const events = [...new Set([...text.matchAll(/(?:^|[{,\s])(?:"(onUpdate:[A-Za-z]+)"|(on[A-Z][A-Za-z]*))\s*:/g)].map((m) => m[1] ?? m[2]))].slice(0, 10);
  const texts = [];
  for (const m of text.matchAll(/"([^"\\]{1,60})"|'([^'\\]{1,60})'|`([^`\\$]{1,60})`/g)) {
    const t = (m[1] ?? m[2] ?? m[3]).trim();
    if (/[一-鿿]/.test(t) && !texts.includes(t)) texts.push(t);
    if (texts.length >= 8) break;
  }
  const classes = [];
  for (const m of text.matchAll(/(?:class|"class")\s*:\s*"([^"]{1,80})"/g)) for (const c of m[1].split(/\s+/)) if (c && !classes.includes(c) && classes.length < 8) classes.push(c);
  const ctx = [];
  const add = (c) => { if (!ctx.includes(c)) ctx.push(c); };
  let fn = null, inList = false, branch = false;
  if (program) {
    const chain = chainOf(program, u.start, u.end);
    for (let i = chain.length - 1; i >= 0; i--) {
      const nd = chain[i];
      if (nd.type === "CallExpression" && nd.arguments[1]?.type === "ObjectExpression") {
        const keys = new Set(nd.arguments[1].properties.map(keyName).filter(Boolean));
        for (const c of ctxOfProps(keys)) add(c);
        if (keys.has("key") && chain.slice(i + 1).some((x) => x.type === "ArrowFunctionExpression" && x.params.length)) inList = true;
      }
      // A slot of a component (`{ default: withCtx(...), footer: withCtx(...) }`): which slot the stretch sits in.
      if (nd.type === "ObjectProperty" && /^(CallExpression|ArrowFunctionExpression|FunctionExpression)$/.test(chain[i + 1]?.type ?? "") && ["footer", "title", "content", "overlay", "tab", "renderTabBar", "extra", "icon"].includes(keyName(nd))) add("slot:" + keyName(nd));
      if (!fn && (nd.type === "FunctionDeclaration" && nd.id)) fn = nd.id.name;
      if (!fn && (nd.type === "ObjectProperty" || nd.type === "ObjectMethod") && keyName(nd) && i < chain.length - 1 && /Function|Arrow/.test(chain[i + 1]?.type ?? nd.type)) fn = String(keyName(nd));
      if (nd.type === "ConditionalExpression" || (nd.type === "LogicalExpression" && nd.operator === "&&")) branch = true;
    }
  }
  if (/"v-if"/.test(source.slice(Math.max(0, u.start - 80), u.end + 80))) branch = true;
  if (events.some((e) => /^onUpdate:(visible|open)$/.test(e)) && !ctx.includes("modal")) add("modal");
  const interaction = ctx.some((c) => ["modal", "drawer", "tabs", "dropdown", "form"].includes(c)) || events.length > 0 || ctx.some((c) => c.startsWith("slot:"));
  const emptyState = texts.some((t) => /暂无|没有|无数据|为空|空空/.test(t)) || /Empty/i.test(classes.join(" "));
  // Messages shown after an action (validation, save result) are reached by acting on the page, not by having more data.
  const feedback = texts.some((t) => /有误|不能为空|不一致|不能晚于|不得|不正确|失败|成功|请先|请稍后/.test(t));
  let needs = "unknown";
  if ((interaction || feedback) && !emptyState) needs = "interaction";
  else if (u.chars >= MIN_DATA_CHARS && (inList || emptyState || branch)) needs = "data";
  return { fn, context: ctx, events, texts, classes, needs };
}

function lineCol(source, offset) {
  let line = 1, last = -1;
  for (let i = source.indexOf("\n"); i >= 0 && i < offset; i = source.indexOf("\n", i + 1)) { line++; last = i; }
  return { line, col: offset - last };
}

// entries: per run, the script entries of the page chunk and its shared chunks (see pickScripts).
// → { page, shared[], uncovered[], truncated, runs[], stable }
export function buildCoverage({ pageChunk, sharedChunks = [], runs }) {
  const names = [pageChunk, ...sharedChunks];
  const painted = new Map(), sources = new Map(), perRun = [];
  for (const entries of runs) {
    const row = {};
    for (const name of names) {
      const e = entries.find((x) => scriptName(x.url) === name);
      if (!e) continue;
      const p = paintScript(e);
      sources.set(name, e.source);
      (painted.get(name) ?? painted.set(name, []).get(name)).push(p);
      if (name === pageChunk) row.page = { function: measure(e.source, p).function.pct, block: measure(e.source, p).block.pct };
    }
    perRun.push(row);
  }
  const report = (name) => {
    const list = painted.get(name);
    if (!list) return { chunk: name, loaded: false };
    return { chunk: name, loaded: true, ...measure(sources.get(name), unitePainted(list)) };
  };
  const page = report(pageChunk);
  const shared = sharedChunks.map(report);
  const uncovered = [];
  let truncated = 0;
  for (const name of names) {
    const list = painted.get(name);
    if (!list) continue;
    const source = sources.get(name), u = unitePainted(list), program = parseScript(source);
    const stretches = uncoveredStretches(source, u).sort((a, b) => b.chars - a.chars);
    for (const s of stretches.slice(0, name === pageChunk ? MAX_UNITS : 20)) {
      uncovered.push({
        chunk: name, role: name === pageChunk ? "page" : "shared", start: s.start, end: s.end, ...lineCol(source, s.start), chars: s.chars,
        ...hintsFor(source, program, s), source: unescapeU(source.slice(s.start, s.end)).replace(/\s+/g, " ").slice(0, 240),
      });
    }
    truncated += Math.max(0, stretches.length - (name === pageChunk ? MAX_UNITS : 20));
  }
  const key = (r) => JSON.stringify(r.page ?? null);
  const stable = perRun.length < 2 || perRun.every((r) => key(r) === key(perRun[0]));
  return { version: COVERAGE_VERSION, metric: METRIC, runs: perRun, stable, page, shared, uncovered, truncated };
}

export const METRIC = {
  function: "functions entered / functions in the chunk (module top-level not counted)",
  block: "non-whitespace characters executed / non-whitespace characters in the chunk (V8 block coverage)",
  union: "page and shared numbers unite the baseline's runs",
};

export const scriptName = (url) => { try { return decodeURIComponent(new URL(url).pathname.split("/").pop()); } catch { return null; } };

// Keep only the scripts a page is measured on (the rest of the app shell is not the page's business).
export function pickScripts(entries, names) {
  const want = new Set(names);
  return entries.filter((e) => want.has(scriptName(e.url)));
}

// What baseline.json carries: the summary only, the details live in coverage.json.
export const summaryOf = (cov) => ({ file: "coverage.json", page: cov.page.loaded ? { function: cov.page.function.pct, block: cov.page.block.pct } : null, shared: cov.shared.map((s) => ({ chunk: s.chunk, loaded: s.loaded, ...(s.loaded ? { function: s.function.pct, block: s.block.pct } : {}) })), stable: cov.stable });
