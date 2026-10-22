// node --test tools/test/compare-rules-baidu-tiles.test.mjs
// Baidu map tile order (HM-239): tiles are appended in the order their downloads finish; only that order is normalised,
// the tiles themselves are still compared.
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { ROOT } from "../gate/common.mjs";
import { loadRules, normHtml } from "../gate/rules.mjs";

const rules = loadRules(path.join(ROOT, "rules/compare"));
const el = (t, a, c = []) => ({ t, a, c });
const src = (x, y, shard = (x + y) % 4, z = 15) => `https://apimaponline${shard}.bdimg.com/tile/?qt=vtile&x=${x}&y=${y}&z=${z}&styles=pl&scaler=1&udt=20261015&v=3.0&from=jsapi3_0`;
const tile = (x, y, opts = {}) => el("img", [["src", src(x, y, opts.shard, opts.z)], ["style", `position: absolute; width: 256px; height: 256px; left: ${opts.left ?? (x - 5083) * 256 - 113}px; top: ${(2566 - y) * 256 - 158}px;`]]);
const layer = (tiles) => ({ tree: el("div", [["class", "map"]], [el("div", [["style", "position: absolute; z-index: -100; left: 960px; top: 450px;"]], tiles)]), ltgt: true });
const html = (tiles) => normHtml(layer(tiles), rules);
const T = [[5082, 2566], [5083, 2566], [5084, 2566], [5083, 2567], [5081, 2566], [5083, 2565]];

test("baidu-tile-order: the same tiles appended in another order are equal", () => {
  assert.ok(rules.ids.includes("baidu-tile-order"));
  const a = T.map(([x, y]) => tile(x, y));
  const b = [3, 0, 5, 1, 4, 2].map((i) => tile(...T[i]));
  assert.notEqual(normHtml({ tree: a[0], ltgt: true }, rules), normHtml({ tree: b[0], ltgt: true }, rules)); // different first child
  assert.equal(html(a), html(b));
});

test("baidu-tile-order: which tiles, their src and their position are still compared", () => {
  const a = T.map(([x, y]) => tile(x, y));
  assert.notEqual(html(a), html(a.slice(1))); // a missing tile
  assert.notEqual(html(a), html([...a.slice(1), tile(5085, 2566)])); // another tile
  assert.notEqual(html(a), html([tile(5082, 2566, { shard: 3 }), ...a.slice(1)])); // another host shard
  assert.notEqual(html(a), html([tile(5082, 2566, { z: 14 }), ...a.slice(1)])); // another zoom level
  assert.notEqual(html(a), html([tile(5082, 2566, { left: 0 }), ...a.slice(1)])); // the tile elsewhere on screen
});

test("baidu-tile-order: other children are never reordered", () => {
  const imgs = (names) => names.map((n) => el("img", [["src", `/assets/${n}.png`]]));
  assert.notEqual(html(imgs(["a", "b"])), html(imgs(["b", "a"])));
  // a container that holds anything besides Baidu tiles keeps its order
  assert.notEqual(html([tile(5083, 2566), tile(5082, 2566), el("span", [], ["x"])]), html([tile(5082, 2566), tile(5083, 2566), el("span", [], ["x"])]));
  const other = el("img", [["src", "https://example.com/tile/?qt=vtile&x=1&y=1&z=15"]]);
  assert.notEqual(html([tile(5083, 2566), other, tile(5082, 2566)]), html([tile(5082, 2566), other, tile(5083, 2566)]));
  assert.notEqual(html([el("div", [], ["a"]), el("div", [], ["b"])]), html([el("div", [], ["b"]), el("div", [], ["a"])]));
});
