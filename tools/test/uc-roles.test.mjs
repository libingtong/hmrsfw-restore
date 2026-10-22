// node --test tools/test/uc-roles.test.mjs
// Arbiter decisions (tools/uc-role-decisions.json, HM-227) in ucRoles() on the real user-center page orders: every cited
// evidence location exists in legacy-dist, a decided page gets its role (its limit and data need in its notes), a pending
// page stays null with the question in its notes, and a decision never replaces a role the automatic rules found.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { ROOT } from "../scope.mjs";
import { ucRoles } from "../uc-roles.mjs";

const D = JSON.parse(readFileSync(path.join(ROOT, "tools/uc-role-decisions.json"), "utf8"));
const pages = readdirSync(path.join(ROOT, "queue")).filter((f) => f.startsWith("page.uc.")).map((f) => JSON.parse(readFileSync(path.join(ROOT, "queue", f), "utf8"))).filter((o) => o.type === "page");
const staticPart = (p) => p.replace(/\/:.*$/, "") || "/";
const rolePath = (o) => staticPart((o.routes?.[0]?.path ?? o.recordPath).replace(/[?#].*$/, "")); // as uc-roles.mjs: recordPath ids (HM-48) do not change the identity

test("every evidence location exists in legacy-dist", () => {
  for (const [p, d] of [...Object.entries(D.decided), ...Object.entries(D.pending)]) {
    assert.ok(d.evidence?.length, `${p}: no evidence`);
    for (const e of d.evidence) {
      const [file, line, col] = e.split(":"); assert.ok(existsSync(path.join(ROOT, file)), `${p}: ${file} missing`);
      const text = readFileSync(path.join(ROOT, file), "utf8").split("\n")[Number(line) - 1];
      assert.ok(text !== undefined && Number(col) <= text.length, `${p}: ${e} out of range`);
    }
  }
});

test("decided → role (+ limit / data need in notes), pending → null with the question, rule roles kept", () => {
  const roles = ucRoles(pages);
  for (const o of pages) {
    const p = rolePath(o), r = roles.get(o.id);
    if (D.decided[p]) assert.ok(r.role && (r.role === D.decided[p].role || !r.by.startsWith("裁定")), `${o.id}: ${JSON.stringify(r)}`);
    if (D.decided[p] && r.by.startsWith("裁定")) {
      const { limit, dataNeed } = D.decided[p];
      for (const t of [limit, dataNeed].filter(Boolean)) assert.ok(r.notes?.includes(t), `${o.id}: notes miss ${t}`);
      if (dataNeed) assert.ok(r.notes.includes("需造数") && r.dataNeed === dataNeed, `${o.id}: ${JSON.stringify(r)}`);
      if (!limit && !dataNeed) assert.equal(r.notes, undefined, o.id);
    }
    if (D.pending[p]) assert.ok(r.role === null ? r.notes.includes("需要确认") : !r.by.startsWith("裁定"), `${o.id}: ${JSON.stringify(r)}`);
  }
  const paths = new Set(pages.map((o) => rolePath(o)));
  for (const p of [...Object.keys(D.decided), ...Object.keys(D.pending)]) assert.ok(paths.has(p), `${p}: no page order`);
});
