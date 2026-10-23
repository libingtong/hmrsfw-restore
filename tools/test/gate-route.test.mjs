// HMRSFW_APP_DIR=<hmrsfw-vue checkout> node --test tools/test/gate-route.test.mjs
// The gate's fallback route for the work order (routePlugin) must not hide the meta of the record the app adds later
// from its router file: the portal adds router-xjhm.json's records (meta hideHeader / hideFooter …) in its first beforeEach,
// after the fallback was added (HM-250). The page stays mounted top-level by the fallback (HM-779), with the app's
// meta. Runs the generated code against the app's own vue-router. Skipped when HMRSFW_APP_DIR is not set.
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { gateRouteCode } from "../gate/appserver.mjs";

const APP = process.env.HMRSFW_APP_DIR && path.resolve(process.env.HMRSFW_APP_DIR);
const skip = !APP && "HMRSFW_APP_DIR not set";
const C = { render: () => null };
// the page module: importable under node (the gate passes /src/views/….vue, resolved by Vite)
const wo = { recordPath: "/resumeMatchAnalysisReport", route: "/resumeMatchAnalysisReport", file: "data:text/javascript,export default { render: () => null }" };

async function setup(routes = [wo]) {
  const { createRouter, createMemoryHistory } = await import(pathToFileURL(path.join(APP, "node_modules/vue-router/dist/vue-router.node.mjs")).href);
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: "/:pathMatch(.*)*", component: C }] });
  new Function("router", gateRouteCode(routes))(router); // what routePlugin appends to router.ts
  return router;
}
const leaf = (router, p) => { const m = router.resolve(p).matched; return m[m.length - 1]; };

const pathsOf = (router, p) => router.resolve(p).matched.map((r) => r.path);

test("the app's own record added later: the page stays mounted by the fallback (top-level), with the app's meta", { skip }, async () => {
  const router = await setup();
  assert.deepEqual(leaf(router, wo.recordPath).meta, {}); // before the router file is loaded
  router.addRoute({ path: "/other", component: C });
  assert.deepEqual(router.resolve(wo.recordPath).meta, {}); // unrelated records: still no meta
  router.addRoute({ path: wo.route, component: C, meta: { hideHeader: true, hideFooter: true } });
  const r = router.resolve(wo.recordPath);
  assert.deepEqual(r.meta, { hideHeader: true, hideFooter: true });
  assert.equal(r.matched.length, 1);
  assert.equal(r.matched[0].components.default.toString().includes("import("), true); // the fallback's component
  assert.equal(router.getRoutes().filter((x) => x.path === wo.route).length, 2); // app record kept, fallback in front
});

test("a child record of the app (layout parent): no layout around the page, merged meta of the chain", { skip }, async () => {
  const w = { recordPath: "/talents/talentScreen", route: "/talents/talentScreen", file: "/src/views/x.vue" };
  const router = await setup([w]);
  router.addRoute({ path: "/talents", component: C, meta: { layout: 1 }, children: [{ path: "talentScreen", component: C, meta: { hideHeader: true } }] });
  assert.deepEqual(pathsOf(router, w.recordPath), ["/talents/talentScreen"]);
  assert.deepEqual(router.resolve(w.recordPath).meta, { layout: 1, hideHeader: true });
});

test("root path: the strict fallback still wins over the app's \"/\" record", { skip }, async () => {
  const w = { recordPath: "/", route: "/", file: "/src/views/xjhm/home/index.vue" };
  const router = await setup([w]);
  const appHome = { render: () => "app" };
  router.addRoute({ path: "/", component: appHome, meta: { hideHeader: true } });
  const r = router.resolve("/");
  assert.notEqual(r.matched[0].components.default, appHome);
  assert.deepEqual(r.meta, { hideHeader: true });
});

test("the app never lists the route: the fallback still reaches the page, without meta", { skip }, async () => {
  const router = await setup();
  for (const p of ["/a", "/b/:id"]) router.addRoute({ path: p, component: C, meta: { x: 1 } });
  assert.deepEqual(pathsOf(router, wo.recordPath), [wo.route]);
  assert.deepEqual(router.resolve(wo.recordPath).meta, {});
  assert.equal(router.getRoutes().filter((r) => r.path === wo.route).length, 1);
});

test("the app already lists the route when router.ts runs: no fallback is added", { skip }, async () => {
  const { createRouter, createMemoryHistory } = await import(pathToFileURL(path.join(APP, "node_modules/vue-router/dist/vue-router.node.mjs")).href);
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: wo.route, component: C, meta: { own: 1 } }] });
  new Function("router", gateRouteCode([wo]))(router);
  assert.deepEqual(leaf(router, wo.recordPath).meta, { own: 1 });
  assert.equal(router.getRoutes().length, 1);
});

test("first navigation spread from the fallback (next({ ...to, replace: true })) lands with the app's meta", { skip }, async () => {
  const router = await setup();
  let loaded = false;
  router.beforeEach((to, _from, next) => {
    if (loaded) return next();
    loaded = true;
    router.addRoute({ path: wo.route, component: C, meta: { hideHeader: true, hideFooter: true } });
    next({ ...to, replace: true });
  });
  await router.push(wo.recordPath);
  assert.deepEqual(router.currentRoute.value.meta, { hideHeader: true, hideFooter: true });
  assert.equal(router.currentRoute.value.matched.length, 1);
});

// HM-1275: the code before, one addRoute wrapper per page (2^n route adds per app addRoute). Kept as the reference
// for the route table the shared wrapper must give.
const chainedRouteCode = (routes) => routes.map((r) => {
  const P = JSON.stringify(r.recordPath), rec = (meta) => `{ path: ${JSON.stringify(r.route)}, strict: true, meta: ${meta}, component: () => import(${JSON.stringify(r.file)}) }`;
  return `{ const unmatched = () => { const m = router.resolve(${P}).matched; return !m.length || /pathMatch/.test(m[m.length - 1].path); };
  if (unmatched()) { const add = router.addRoute; let drop = add(${rec("{}")});
    router.addRoute = (...a) => { const out = add(...a); drop(); const meta = unmatched() ? {} : { ...router.resolve(${P}).meta }; drop = add(${rec("meta")}); return out; }; } }`;
}).join("\n");

test("HM-1275: the shared wrapper leaves the same route table as the per-page chain did, after every app addRoute", { skip }, async () => {
  const { createRouter, createMemoryHistory } = await import(pathToFileURL(path.join(APP, "node_modules/vue-router/dist/vue-router.node.mjs")).href);
  const mod = (p) => `data:text/javascript,export default { name: ${JSON.stringify(p)} }`;
  const pages = [
    { recordPath: "/a", route: "/a" }, { recordPath: "/b", route: "/b" }, { recordPath: "/listed", route: "/listed" },
    { recordPath: "/a", route: "/a" }, // same path twice: only the first gets a fallback
    { recordPath: "/talents/talentScreen", route: "/talents/talentScreen" }, { recordPath: "/d/7", route: "/d/:id" }, { recordPath: "/", route: "/" },
  ].map((p, i) => ({ ...p, file: mod(`${p.route}#${i}`) }));
  const appAdds = [
    [{ path: "/other", component: C }],
    [{ path: "/a", component: C, meta: { hideHeader: true } }],
    [{ path: "/talents", name: "talents", component: C, meta: { layout: 1 }, children: [{ path: "talentScreen", component: C, meta: { hideFooter: true } }] }],
    ["talents", { path: "more", component: C, meta: { x: 2 } }],
    [{ path: "/d/:id", component: C, meta: { d: 1 } }],
    [{ path: "/", component: C, meta: { home: 1 } }],
    [{ path: "/b", component: C, meta: { b: 1 }, alias: "/b2" }],
  ];
  const routers = [chainedRouteCode, gateRouteCode].map((code) => {
    const router = createRouter({ history: createMemoryHistory(), routes: [{ path: "/listed", component: C, meta: { own: 1 } }, { path: "/:pathMatch(.*)*", component: C }] });
    new Function("router", code(pages))(router);
    return router;
  });
  const table = (router) => router.getRoutes().map((r) => [r.path, r.meta, r.strict ?? null, r.aliasOf?.path ?? null]);
  const resolved = (router) => [...new Set([...pages.map((p) => p.recordPath), "/b2", "/talents/more"])].map((p) => { const r = router.resolve(p); return [p, r.matched.map((m) => m.path), r.meta]; });
  assert.deepEqual(table(routers[1]), table(routers[0]));
  for (const a of appAdds) {
    for (const router of routers) router.addRoute(...a);
    assert.deepEqual(table(routers[1]), table(routers[0]), `after addRoute ${JSON.stringify(a.at(-1).path)}`);
    assert.deepEqual(resolved(routers[1]), resolved(routers[0]));
  }
});

test("HM-1275: 161 fallbacks (the portal's page count) and 95 app addRoute calls finish in seconds, not 2^161 adds", { skip }, async () => {
  const { createRouter, createMemoryHistory } = await import(pathToFileURL(path.join(APP, "node_modules/vue-router/dist/vue-router.node.mjs")).href);
  const pages = Array.from({ length: 161 }, (_, i) => ({ recordPath: `/p${i}`, route: `/p${i}`, file: "/src/views/x.vue" }));
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: "/:pathMatch(.*)*", component: C }] });
  const t0 = Date.now();
  new Function("router", gateRouteCode(pages))(router);
  for (let i = 0; i < 95; i++) router.addRoute({ path: `/p${i * 2}`, component: C, meta: { n: i } });
  const ms = Date.now() - t0;
  assert.ok(ms < 20000, `took ${ms} ms`);
  const fallback = (r) => String(r.components.default).includes("import(");
  assert.equal(router.getRoutes().filter(fallback).length, 161);
  assert.deepEqual(router.resolve("/p10").meta, { n: 5 });
  assert.equal(fallback(router.resolve("/p10").matched[0]), true);
});
