// Compares the request sequence of a page recording with an earlier one, e.g. a record-page HAR against the POC capture
// of the same confirmation page (har/confirm/<id>.json, or a .har). Only "METHOD /path" keys are compared, never
// query values or bodies, and only the page-load phase unless --all (POC captures have no interaction phase).
// Usage: node tools/record-compare.mjs <new.har> <old.har|old.json> [--all]
// Output: {new:{requests, distinct}, old:{requests, distinct}, onlyNew:[...], onlyOld:[...], sameDistinctOrder}
import { readFileSync } from "node:fs";
import { entryKey } from "./har-body.mjs";

const [a, b] = process.argv.slice(2).filter((x) => !x.startsWith("--"));
const all = process.argv.includes("--all");
if (!a || !b) { console.error("usage: node tools/record-compare.mjs <new.har> <old.har|old.json> [--all]"); process.exit(1); }
const keys = (file) => {
  const j = JSON.parse(readFileSync(file, "utf8"));
  const list = j.log ? j.log.entries.filter((e) => all || !e._phase || e._phase === "load").map((e) => [e.request.method, e.request.url]) : j.entries.map((e) => [e.method, e.url]);
  return list.filter(([, u]) => !/\/sys\/common\/static\//.test(u)).map(([m, u]) => entryKey(m, u.replace("http://__ORIGIN__", "http://h")));
};
const x = keys(a), y = keys(b);
const dx = [...new Set(x)], dy = [...new Set(y)];
const onlyNew = dx.filter((k) => !dy.includes(k)), onlyOld = dy.filter((k) => !dx.includes(k));
const common = (d, other) => d.filter((k) => other.includes(k));
console.log(JSON.stringify({ new: { requests: x.length, distinct: dx.length }, old: { requests: y.length, distinct: dy.length }, onlyNew, onlyOld, sameDistinctOrder: JSON.stringify(common(dx, dy)) === JSON.stringify(common(dy, dx)) }));
