// node --test tools/test/queue-drift.test.mjs
// orderDrift (tools/queue-drift.mjs, HM-949): only the fields a gate replay reads count as drift.
import { test } from "node:test";
import assert from "node:assert/strict";
import { orderDrift, REPLAY_FIELDS } from "../queue-drift.mjs";

const wo = { id: "page.portal.sjz.fair.outFair.list", type: "page", site: "portal", app: "portal", recordPath: "/fairList?type=30", recordVia: "page.portal.sjz.fair.fairList", scopeIds: ["data-v-fe7b9707"], role: "general", notes: "a", deps: { orders: ["entry.portal.c03"] } };

test("a recordPath difference is drift", () => {
  assert.deepEqual(orderDrift(wo, { ...wo, recordPath: "/fairList" }), [{ field: "recordPath", base: "/fairList?type=30", ref: "/fairList" }]);
});

test("role, notes and deps do not change a replay", () => {
  assert.deepEqual(orderDrift(wo, { ...wo, role: null, notes: "b", deps: { orders: [] } }), []);
  assert.ok(!REPLAY_FIELDS.includes("role"));
});

test("a missing field equals null; all fields when asked", () => {
  const { har, ...noHar } = { ...wo, har: null };
  assert.deepEqual(orderDrift(wo, noHar), []);
  assert.deepEqual(orderDrift(wo, { ...wo, role: null }, null).map((d) => d.field), ["role"]);
});
