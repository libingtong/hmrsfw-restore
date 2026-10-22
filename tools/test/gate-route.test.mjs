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
