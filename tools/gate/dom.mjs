// DOM capture and HTML serialisation for the comparison.
// The page root is captured in the browser as a JSON tree (domTree) so that normalisation rules that need structure
// (attribute order, empty comment nodes) can be applied later in Node, by rules that may change after the baseline was
// recorded. serialize() reproduces the browser's outerHTML byte for byte (checked against outerHTML in tests), so the
// string rules inherited from the POC (scope ids, whitespace, …) keep their exact meaning.

// Runs in the page. Returns { tree, ltgt } where ltgt says whether this browser escapes < > inside attribute values
// (Chromium does since 2025), so serialize() can match its outerHTML.
export function domTreeInPage(root) {
  const HTML_NS = "http://www.w3.org/1999/xhtml";
  const walk = (n) => {
    if (n.nodeType === 3) return n.data;
    if (n.nodeType === 8) return { m: n.data };
    if (n.nodeType !== 1) return null;
    const a = [];
    for (const at of n.attributes) a.push([at.name, at.value]);
    const kids = n.localName === "template" && n.content ? n.content.childNodes : n.childNodes;
    const c = [];
    for (const k of kids) { const x = walk(k); if (x !== null) c.push(x); }
    return { t: n.namespaceURI === HTML_NS ? n.localName : n.tagName, a, c };
  };
  const probe = document.createElement("i");
  probe.setAttribute("x", "<");
  return { tree: walk(root), ltgt: probe.outerHTML.includes("&lt;") };
}

const VOID = new Set(["area", "base", "basefont", "bgsound", "br", "col", "embed", "frame", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr"]);
const RAW = new Set(["style", "script", "xmp", "iframe", "noembed", "noframes", "plaintext", "noscript"]);
const escText = (s) => s.replace(/&/g, "&amp;").replace(/ /g, "&nbsp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escAttr = (s, ltgt) => { s = s.replace(/&/g, "&amp;").replace(/ /g, "&nbsp;").replace(/"/g, "&quot;"); return ltgt ? s.replace(/</g, "&lt;").replace(/>/g, "&gt;") : s; };

export function serialize(node, ltgt = true, parentTag = "") {
  if (node == null) return "";
  if (typeof node === "string") return RAW.has(parentTag) ? node : escText(node);
  if ("m" in node) return `<!--${node.m}-->`;
  let s = "<" + node.t;
  for (const [k, v] of node.a) s += ` ${k}="${escAttr(v, ltgt)}"`;
  s += ">";
  if (VOID.has(node.t)) return s;
  for (const c of node.c) s += serialize(c, ltgt, node.t);
  return s + `</${node.t}>`;
}

// Tree transforms used by rules (pure: return new trees).
export function mapTree(node, fn) {
  if (node == null || typeof node === "string" || "m" in node) return node;
  const n = fn({ ...node, a: node.a.slice(), c: node.c.map((c) => mapTree(c, fn)) });
  return n;
}
export const sortAttrs = (tree) => mapTree(tree, (n) => ({ ...n, a: n.a.slice().sort((x, y) => (x[0] < y[0] ? -1 : x[0] > y[0] ? 1 : 0)) }));
export const dropEmptyComments = (tree) => mapTree(tree, (n) => ({ ...n, c: n.c.filter((c) => !(c && typeof c === "object" && "m" in c && c.m === "")) }));

// Where two normalised HTML strings first differ, as an element path made of tag names and the first class only
// (no text or attribute values: the hint goes into task metadata, which must not carry interface data).
export function firstDiff(a, b) {
  let i = 0;
  const n = Math.min(a.length, b.length);
  while (i < n && a[i] === b[i]) i++;
  if (i === a.length && i === b.length) return null;
  const stack = [];
  const re = /<(\/?)([a-zA-Z][\w:-]*)([^>]*)>/g;
  let m;
  const prefix = a.slice(0, i);
  while ((m = re.exec(prefix))) {
    const tag = m[2].toLowerCase();
    if (m[1]) { const k = stack.map((x) => x.tag).lastIndexOf(tag); if (k >= 0) stack.length = k; continue; }
    if (VOID.has(tag) || m[3].endsWith("/")) continue;
    const cls = /\bclass="([^"]*)"/.exec(m[3])?.[1].trim().split(/\s+/)[0];
    stack.push({ tag, label: tag + (cls ? "." + cls : "") });
  }
  return { offset: i, lengths: [a.length, b.length], path: stack.map((x) => x.label).join(" > ") || "(root)" };
}
