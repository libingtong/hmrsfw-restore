// node --test tools/test/pw-login-check.test.mjs
// pw-login.mjs checks each saved login state on its own (HM-967): the user center's autoLogin trades the portal token for
// its own, so the two expiries differ and must not be compared. Exit code 3 only for a missing, unreadable or expired state.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { SOON_MS, checkSaved, tokenExp } from "../pw-login-check.mjs";

const PORTAL = "https://hamiwebportaltest.rencaidanao.com", UC = "https://hamiusercentertest.rencaidanao.com";
const NOW = Date.UTC(2026, 9, 20, 9, 0, 0);
const jwt = (exp) => ["e30", Buffer.from(JSON.stringify({ exp })).toString("base64url"), "sig"].join(".");

function fixture(states) {
  const dir = mkdtempSync(path.join(os.tmpdir(), "pw-login-check-"));
  for (const [name, st] of Object.entries(states)) writeFileSync(path.join(dir, name), typeof st === "string" ? st : JSON.stringify(st));
  return dir;
}
const state = (origin, token) => ({ cookies: [], origins: [{ origin, localStorage: [{ name: "token", value: token }] }] });
const sites = (dir) => [
  { key: "portal", name: "门户", file: path.join(dir, "pw-portal.json"), origin: PORTAL },
  { key: "usercenter", name: "用户中心", file: path.join(dir, "pw-usercenter.json"), origin: UC },
];
const sec = (ms) => Math.floor(ms / 1000);

test("different expiries on the two sites pass (the HM-967 case: portal 10-21 09:13, user center 10-22 16:57)", (t) => {
  const dir = fixture({ "pw-portal.json": state(PORTAL, jwt(sec(NOW + 24 * 3600e3))), "pw-usercenter.json": state(UC, jwt(sec(NOW + 56 * 3600e3))) });
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const { ok, lines } = checkSaved(sites(dir), NOW);
  assert.equal(ok, true);
  assert.equal(lines.filter((l) => l.level === "error").length, 0);
  assert.equal(lines.filter((l) => /^\[\w+\] token 过期时间/.test(l.text)).length, 2, "each site's expiry is printed");
  assert.ok(!lines.some((l) => /不一致|同一次登录/.test(l.text)));
});

test("a missing file fails", (t) => {
  const dir = fixture({ "pw-portal.json": state(PORTAL, jwt(sec(NOW + 3600e3 * 5))) });
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const { ok, lines } = checkSaved(sites(dir), NOW);
  assert.equal(ok, false);
  assert.ok(lines.some((l) => l.level === "error" && /\[usercenter\].*不存在或读不出/.test(l.text)));
});

test("an expired token on either site fails, the other site does not rescue it", (t) => {
  const dir = fixture({ "pw-portal.json": state(PORTAL, jwt(sec(NOW - 60e3))), "pw-usercenter.json": state(UC, jwt(sec(NOW + 48 * 3600e3))) });
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const { ok, lines } = checkSaved(sites(dir), NOW);
  assert.equal(ok, false);
  assert.ok(lines.some((l) => l.level === "error" && /\[portal\].*已于.*过期/.test(l.text)));
  assert.ok(lines.some((l) => l.level === "log" && /\[usercenter\] token 过期时间/.test(l.text)));
});

test("less than 2 hours left warns but still passes; 2 hours or more does not warn", (t) => {
  const dir = fixture({ "pw-portal.json": state(PORTAL, jwt(sec(NOW + SOON_MS - 60e3))), "pw-usercenter.json": state(UC, jwt(sec(NOW + SOON_MS + 60e3))) });
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const { ok, lines } = checkSaved(sites(dir), NOW);
  assert.equal(ok, true);
  const warns = lines.filter((l) => l.level === "warn");
  assert.equal(warns.length, 1);
  assert.match(warns[0].text, /^\[portal\].*不足 2 小时/);
});

test("the token is read from the site's own origin only, and is never printed", (t) => {
  const token = jwt(sec(NOW + 10 * 3600e3));
  // the user-center file also carries a portal origin entry (same context); only the user-center origin counts
  const uc = { cookies: [], origins: [{ origin: PORTAL, localStorage: [{ name: "token", value: token }] }, { origin: UC, localStorage: [] }] };
  const dir = fixture({ "pw-portal.json": state(PORTAL, JSON.stringify(token)), "pw-usercenter.json": uc });
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  assert.equal(tokenExp(path.join(dir, "pw-portal.json"), PORTAL), sec(NOW + 10 * 3600e3), "a JSON-quoted token is read too");
  assert.equal(tokenExp(path.join(dir, "pw-usercenter.json"), UC), null);
  const { ok, lines } = checkSaved(sites(dir), NOW);
  assert.equal(ok, false);
  assert.ok(lines.every((l) => !l.text.includes(token.split(".")[1])));
});

test("unreadable JSON or a token without exp fails", (t) => {
  const dir = fixture({ "pw-portal.json": "{not json", "pw-usercenter.json": state(UC, ["e30", Buffer.from("{}").toString("base64url"), "s"].join(".")) });
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const { ok, lines } = checkSaved(sites(dir), NOW);
  assert.equal(ok, false);
  assert.equal(lines.filter((l) => l.level === "error" && /不存在或读不出/.test(l.text)).length, 2);
});
