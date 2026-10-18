// Fixed answers for third-party online services the pages call directly (not /xf-api/, so not in the HAR), installed
// as an init script on both sides by replay.mjs, like the fixed clock: the original and the restored page get the same
// input in the baseline and in every later gate run (HM-239).
//
// Baidu map JS API (vue-baidu-map-3x loads it from api.map.baidu.com; legacy-dist and hmrsfw-vue alike):
// `new BMap.LocalCity().get(cb)` asks Baidu's IP location service which city the machine is in. Whether and when it
// answers, and which city, depends on the machine's network: the page's first list request waits for it. Here every
// LocalCity instance answers `cb` with FIXED_CITY right away (next task), without the network request. Nothing else of
// the map API is touched: the map script, tiles, controls, markers and BMap.Geolocation stay as they are.
export const FIXED_CITY = { name: "哈密市", lng: 93.521591, lat: 42.824315, level: 12 }; // Hami city centre, BD-09

// Page context. The map script builds its namespace as `var z = window.BMap || {}` … `z.LocalCity = ng` and the loader
// assigns window.BMap; both assignments go through the accessors below, whichever comes first.
export function fixedLocalCity(city) {
  const wrap = (B, Real) => {
    if (typeof Real !== "function" || Real.__gateFixed) return Real;
    function LocalCity(opts) {
      const lc = new Real(opts);
      // own property: shadows the prototype's get, also after the othersearch module installs the real one
      lc.get = (cb) => { setTimeout(() => cb?.({ center: new B.Point(city.lng, city.lat), level: city.level, name: city.name }), 0); };
      return lc;
    }
    LocalCity.prototype = Real.prototype;
    LocalCity.__gateFixed = true;
    return LocalCity;
  };
  const hook = (B) => {
    if (!B || typeof B !== "object" || B.__gateLocalCity) return;
    let lc = wrap(B, B.LocalCity);
    Object.defineProperty(B, "LocalCity", { configurable: true, enumerable: true, get: () => lc, set: (v) => { lc = wrap(B, v); } });
    Object.defineProperty(B, "__gateLocalCity", { value: true });
  };
  let bmap = window.BMap;
  hook(bmap);
  Object.defineProperty(window, "BMap", { configurable: true, enumerable: true, get: () => bmap, set: (v) => { bmap = v; hook(v); } });
}
