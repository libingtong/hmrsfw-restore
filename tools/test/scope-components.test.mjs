// node --test tools/test/scope-components.test.mjs
// componentsOf (tools/scope.mjs) on the original chunks: a <script setup> component whose name comes from
// defineOptions({name}) is compiled without object spread into a name-only object merged into the setup one
// (`O=re({name:"x"}),X=re(sp(sv({},O),{setup(…`). It is a component like any other (HM-1132: newBigdata's main
// component was missing from its work order, so check-components failed on a correct restoration).
import { test } from "node:test";
import assert from "node:assert/strict";
import { componentsOf } from "../scope.mjs";

test("a defineOptions({name}) component merged into its setup object is found, with its own scopeId", () => {
  assert.deepEqual(componentsOf("portal", "newBigdata.1783320636200.js").map(({ name, scopeId }) => ({ name, scopeId })), [
    { name: "manaLoginModal", scopeId: "data-v-31156f5e" },
    { name: "big-screen-view-xygsBigdata", scopeId: "data-v-866f9cbf" }, // the default export, last in source order
  ]);
});

test("a name-only object that is not merged into a setup object is still not a component", () => {
  // changepassword: route / push objects with name only; the one component is the __name one
  assert.deepEqual(componentsOf("usercenter", "changepassword.1751615607545.js").map((c) => c.name), ["changepassword"]);
});
