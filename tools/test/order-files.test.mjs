// orderFiles (tools/sfc-util.mjs): a nested-route order's own target must not be swept into a sibling page's
// subComponentDir walk merely because both files sit under the same directory (HM-1382). page.uc.personLoan's static
// checks (components/text-nodes/branches) were counting page.uc.personLoan.detailInfo's component, static text and
// v-if branches as personLoan's own, comparing them against personLoan's unrelated source chunk, because
// detailInfo.vue sits inside personLoan's subComponentDir apps/uc/src/views/personLoan/.
import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { loadOrder, orderFiles } from "../sfc-util.mjs";

function personLoanAppFixture() {
  const app = mkdtempSync(path.join(os.tmpdir(), "hmrsfw-order-files-"));
  mkdirSync(path.join(app, "apps/uc/src/views/personLoan"), { recursive: true });
  writeFileSync(path.join(app, "apps/uc/src/views/personLoan.vue"), "<template><div/></template>\n");
  writeFileSync(path.join(app, "apps/uc/src/views/personLoan/detailInfo.vue"), "<template><div/></template>\n");
  return app;
}

test("page.uc.personLoan's files exclude page.uc.personLoan.detailInfo's own target", () => {
  const app = personLoanAppFixture();
  const files = orderFiles(loadOrder("page.uc.personLoan"), app).map((f) => path.relative(app, f));
  assert.deepEqual(files, ["apps/uc/src/views/personLoan.vue"]);
});

test("page.uc.personLoan.detailInfo's files still include its own target", () => {
  const app = personLoanAppFixture();
  const files = orderFiles(loadOrder("page.uc.personLoan.detailInfo"), app).map((f) => path.relative(app, f));
  assert.deepEqual(files, ["apps/uc/src/views/personLoan/detailInfo.vue"]);
});

function corpLoanAppFixture() {
  const app = mkdtempSync(path.join(os.tmpdir(), "hmrsfw-order-files-"));
  mkdirSync(path.join(app, "apps/uc/src/views/corpLoan"), { recursive: true });
  writeFileSync(path.join(app, "apps/uc/src/views/corpLoan.vue"), "<template><div/></template>\n");
  writeFileSync(path.join(app, "apps/uc/src/views/corpLoan/corpLoanInfo.vue"), "<template><div/></template>\n");
  return app;
}

test("the same holds for page.uc.corpLoan / page.uc.corpLoan.corpLoanInfo", () => {
  const app = corpLoanAppFixture();
  const files = orderFiles(loadOrder("page.uc.corpLoan"), app).map((f) => path.relative(app, f));
  assert.deepEqual(files, ["apps/uc/src/views/corpLoan.vue"]);
});

test("an order's own subComponentDir file with no separate work order still counts", () => {
  const app = mkdtempSync(path.join(os.tmpdir(), "hmrsfw-order-files-"));
  mkdirSync(path.join(app, "apps/uc/src/views/personLoan"), { recursive: true });
  writeFileSync(path.join(app, "apps/uc/src/views/personLoan.vue"), "<template><div/></template>\n");
  writeFileSync(path.join(app, "apps/uc/src/views/personLoan/helper.vue"), "<template><div/></template>\n");
  const files = orderFiles(loadOrder("page.uc.personLoan"), app).map((f) => path.relative(app, f)).sort();
  assert.deepEqual(files, ["apps/uc/src/views/personLoan.vue", "apps/uc/src/views/personLoan/helper.vue"]);
});
