// node --test tools/test/order-files-nested.test.mjs
// A nested route's page lies inside its parent page's subComponentDir (work-orders.mjs derives subComponentDir from the
// target): page.uc.personLoan.detailInfo's target apps/uc/src/views/personLoan/detailInfo.vue sits in page.uc.personLoan's
// apps/uc/src/views/personLoan/. The parent's files (orderFiles, gate pageFiles, self-check's no-legacy set) leave the
// nested order's target and subComponentDir out; everything else under the directory stays the parent's (HM-468).
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { foreignPaths, orderFiles, subDirFiles } from "../sfc-util.mjs";
import { pageFiles } from "../gate/static.mjs";

const V = "apps/uc/src/views/";
const parent = { id: "page.x.p", type: "page", target: `${V}p.vue`, subComponentDir: `${V}p/` };
const child = { id: "page.x.p.c", type: "page", target: `${V}p/c.vue`, subComponentDir: `${V}p/c/` };
const seg = { id: "seg.x.p.1", type: "segment", page: "page.x.p", target: parent.target, subComponentDir: parent.subComponentDir };

function fixture(t, orders, files) {
  const dir = mkdtempSync(path.join(os.tmpdir(), "hm468-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const queue = path.join(dir, "queue"); mkdirSync(queue);
  for (const o of orders) writeFileSync(path.join(queue, `${o.id}.json`), JSON.stringify(o));
  writeFileSync(path.join(queue, "index.json"), "[]");
  const app = path.join(dir, "app");
  for (const f of files) { mkdirSync(path.dirname(path.join(app, f)), { recursive: true }); writeFileSync(path.join(app, f), "<template><div/></template>\n"); }
  return { queue, app, rel: (l) => l.map((f) => path.relative(app, f)).sort() };
}

test("foreignPaths: another order's target and deeper subComponentDir; not the order itself or its segments", (t) => {
  const { queue } = fixture(t, [parent, child, seg], []);
  const p = foreignPaths(parent, queue);
  assert.deepEqual([...p.files], [`${V}p/c.vue`]);
  assert.deepEqual(p.dirs, [`${V}p/c/`]);
  assert.deepEqual(foreignPaths(seg, queue), p);
  const c = foreignPaths(child, queue);
  assert.equal(c.files.size + c.dirs.length, 0);
});

test("subDirFiles skips the nested order's files and keeps the rest (same-prefix siblings included)", (t) => {
  const files = [`${V}p/c.vue`, `${V}p/c/Sub.vue`, `${V}p/c/assets/a.png`, `${V}p/Own.vue`, `${V}p/assets/b.png`, `${V}p/cx.vue`, `${V}p/c.ts`];
  const { queue, app, rel } = fixture(t, [parent, child], files);
  assert.deepEqual(rel(subDirFiles(parent, app, { queueDir: queue })), [`${V}p/Own.vue`, `${V}p/assets/b.png`, `${V}p/c.ts`, `${V}p/cx.vue`]);
  assert.deepEqual(rel(subDirFiles(child, app, { queueDir: queue })), [`${V}p/c/Sub.vue`, `${V}p/c/assets/a.png`]);
});

test("without a nested order every file under subComponentDir stays the order's", (t) => {
  const files = [`${V}p/c.vue`, `${V}p/c/Sub.vue`, `${V}p/Own.vue`];
  const { queue, app, rel } = fixture(t, [parent], files);
  assert.deepEqual(rel(subDirFiles(parent, app, { queueDir: queue })), [...files].sort());
});

test("real queue: page.uc.personLoan no longer delivers page.uc.personLoan.detailInfo's file", (t) => {
  const P = { id: "page.uc.personLoan", type: "page", target: `${V}personLoan.vue`, subComponentDir: `${V}personLoan/` };
  const D = { id: "page.uc.personLoan.detailInfo", type: "page", target: `${V}personLoan/detailInfo.vue`, subComponentDir: `${V}personLoan/detailInfo/` };
  const { app, rel } = fixture(t, [], [P.target, D.target, `${V}personLoan/Extra.vue`, `${V}personLoan/assets/x.png`]);
  assert.deepEqual(rel(orderFiles(P, app)), [P.target, `${V}personLoan/Extra.vue`].sort());
  assert.deepEqual(rel(pageFiles(P, app)), [P.target, `${V}personLoan/Extra.vue`, `${V}personLoan/assets/x.png`].sort());
  assert.deepEqual(rel(orderFiles(D, app)), [D.target]);
});
