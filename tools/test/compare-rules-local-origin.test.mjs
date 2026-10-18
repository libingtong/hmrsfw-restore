// node --test tools/test/compare-rules-local-origin.test.mjs
// local-origin (HM-295): absolute URLs built with new URL(p, self.location) carry the replay server's origin, a random
// port on 127.0.0.1 per side; only the port is normalised, everything else in the URL and around it is still compared.
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { ROOT } from "../gate/common.mjs";
import { loadRules, normHtml } from "../gate/rules.mjs";

const rules = loadRules(path.join(ROOT, "rules/compare"));
const el = (t, a, c = []) => ({ t, a, c });
const html = (attrs) => normHtml({ tree: el("div", [["class", "box"]], [el("div", attrs, ["x"])]), ltgt: true }, rules);
const bg = (u) => [["class", "text"], ["style", `background: url("${u}") right bottom no-repeat;`]];

test("local-origin: the replay server's port is not compared", () => {
  assert.ok(rules.ids.includes("local-origin"));
  assert.equal(html(bg("http://127.0.0.1:55844/xjhm/innovation/cydj_icon.jpg")), html(bg("http://127.0.0.1:54451/xjhm/innovation/cydj_icon.jpg")));
  assert.equal(html([["src", "http://127.0.0.1:63850/assets/lll.1783320636200.png"]]), html([["src", "http://127.0.0.1:1/assets/lll.1783320636200.png"]]));
});

test("local-origin: path, query, host, relative vs absolute and the element are still compared", () => {
  assert.notEqual(html(bg("http://127.0.0.1:1/xjhm/innovation/cydj_icon.jpg")), html(bg("http://127.0.0.1:2/xjhm/innovation/cyzx_icon.jpg")));
  assert.notEqual(html([["src", "http://127.0.0.1:1/a.png?v=1"]]), html([["src", "http://127.0.0.1:2/a.png?v=2"]]));
  assert.notEqual(html([["src", "http://127.0.0.1:1/a.png"]]), html([["src", "/a.png"]])); // absolute vs relative
  assert.notEqual(html([["src", "http://127.0.0.1:1/a.png"]]), html([["src", "http://localhost:1/a.png"]]));
  assert.notEqual(html([["src", "http://127.0.0.1:1/a.png"]]), html([["src", "https://127.0.0.1:1/a.png"]]));
  assert.notEqual(html([["src", "http://127.0.0.1:1/a.png"]]), html([["data-src", "http://127.0.0.1:2/a.png"]]));
});
