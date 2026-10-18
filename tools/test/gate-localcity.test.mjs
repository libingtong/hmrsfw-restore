// node --test tools/test/gate-localcity.test.mjs
// Fixed Baidu IP location (HM-239): the init script is run the way Playwright runs it (its source, in a fresh page
// context), then the map script's namespace build is replayed with a stand-in for the Baidu classes.
import { test } from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { FIXED_CITY, fixedLocalCity } from "../gate/thirdparty.mjs";

// A page context with the init script installed; `net` counts calls of the real LocalCity.get (= the network request).
function page() {
  const ctx = vm.createContext({ setTimeout });
  ctx.window = ctx;
  vm.runInContext(`(${fixedLocalCity.toString()})(${JSON.stringify(FIXED_CITY)})`, ctx);
  ctx.net = 0;
  return ctx;
}
// What api.map.baidu.com's getscript does: `var z = window.BMap || {}` … `z.LocalCity = ng`, the loader sets window.BMap.
const LOADER = `
  function Point(lng, lat) { this.lng = lng; this.lat = lat; }
  function ng(o) { this.Pa = []; this.opts = o; }
  ng.prototype.get = function (cb) { window.net++; this.Pa.push(cb); };
  ng.prototype.toString = function () { return "LocalCity"; };
`;
const located = (ctx, code) => new Promise((resolve) => { ctx.done = resolve; vm.runInContext(code, ctx); });
const USE = `new BMap.LocalCity().get(function (r) { done({ lng: r.center.lng, lat: r.center.lat, name: r.name, isPoint: r.center instanceof BMap.Point }); });`;

test("window.BMap set first, LocalCity added to it afterwards: fixed city, no network request", async () => {
  const ctx = page();
  const r = await located(ctx, LOADER + `window.BMap = window.BMap || {}; var z = window.BMap || {}; z.Point = Point; z.LocalCity = ng;` + USE);
  assert.deepEqual({ ...r }, { lng: FIXED_CITY.lng, lat: FIXED_CITY.lat, name: FIXED_CITY.name, isPoint: true });
  assert.equal(ctx.net, 0);
});

test("namespace built first, then assigned to window.BMap", async () => {
  const ctx = page();
  const r = await located(ctx, LOADER + `var z = {}; z.Point = Point; z.LocalCity = ng; window.BMap = z;` + USE);
  assert.equal(r.lng, FIXED_CITY.lng);
  assert.equal(ctx.net, 0);
});

test("the instance is still a LocalCity; a later prototype get (othersearch module) does not take over", async () => {
  const ctx = page();
  vm.runInContext(LOADER + `window.BMap = { Point: Point }; BMap.LocalCity = ng; var lc = new BMap.LocalCity({ x: 1 });`, ctx);
  assert.equal(vm.runInContext(`lc instanceof BMap.LocalCity && lc instanceof ng && lc.opts.x === 1 && String(lc)`, ctx), "LocalCity");
  const r = await located(ctx, `ng.prototype.get = function () { window.net++; }; lc.get(function (r) { done(r.center.lat); });`);
  assert.equal(r, FIXED_CITY.lat);
  assert.equal(ctx.net, 0);
});

test("the answer comes asynchronously, like the service's", () => {
  const ctx = page();
  vm.runInContext(LOADER + `window.BMap = { Point: Point, LocalCity: ng }; var got = null; new BMap.LocalCity().get(function (r) { got = r; });`, ctx);
  assert.equal(vm.runInContext("got", ctx), null);
});

test("pages without the map API are unaffected; other BMap members are untouched", () => {
  const ctx = page();
  assert.equal(vm.runInContext("typeof window.BMap", ctx), "undefined");
  vm.runInContext(`function G() {} window.BMap = { Geolocation: G, Map: 1 }; BMap.Map = 2;`, ctx);
  assert.equal(vm.runInContext("BMap.Geolocation === G && BMap.Map === 2 && BMap.LocalCity === undefined", ctx), true);
});
