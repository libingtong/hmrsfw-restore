// node --test tools/test/pw-login-log.test.mjs
// pw-login.mjs records each login-flow reply as status + code / success / message only (HM-1308): the token in a
// successful reply and the request body never reach the log; SM4-encrypted replies are read only with the key from the
// environment; the sent headers are reduced to names (Origin / Referer to origin + path).
import { test } from "node:test";
import assert from "node:assert/strict";
import smCrypto from "sm-crypto";
import { summarizeReply, sentHeaders, replyLine, clean } from "../pw-login-log.mjs";

const KEY = "0123456789abcdeffedcba9876543210"; // throwaway test key
const jwt = "eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjF9.c2ln";
const ok = JSON.stringify({ success: true, code: 200, message: "登录成功", result: { token: jwt, userInfo: { id: "u1", realname: "某人" } } });
const bad = JSON.stringify({ success: false, code: 412, message: "验证码错误", result: null });

test("plain success reply: code / success / message, never the token or result", () => {
  const r = summarizeReply({ status: 200, headers: {}, text: ok });
  assert.deepEqual(r, { status: 200, encrypted: false, decrypted: null, code: 200, success: true, message: "登录成功" });
  assert.ok(!JSON.stringify(r).includes(jwt) && !JSON.stringify(r).includes("某人"));
});

test("encrypted reply is decrypted with the key; without a key it is only marked encrypted", () => {
  const cipher = smCrypto.sm4.encrypt(bad, KEY, { mode: "ecb", padding: "pkcs#7" });
  const headers = { crypto_opt: "true" };
  assert.deepEqual(summarizeReply({ status: 200, headers, text: cipher }, { sm4Key: KEY }),
    { status: 200, encrypted: true, decrypted: true, code: 412, success: false, message: "验证码错误" });
  const saved = process.env.VITE_HMRSFW_SM4_KEY; delete process.env.VITE_HMRSFW_SM4_KEY;
  try {
    const r = summarizeReply({ status: 200, headers, text: cipher });
    assert.deepEqual(r, { status: 200, encrypted: true, decrypted: false, code: null, success: null, message: null });
    assert.match(replyLine(r), /响应已加密/);
  } finally { if (saved !== undefined) process.env.VITE_HMRSFW_SM4_KEY = saved; }
  assert.equal(summarizeReply({ status: 200, headers, text: cipher }, { sm4Key: "f".repeat(32) }).decrypted, false); // wrong key
});

test("non-JSON and error statuses still give the status", () => {
  assert.deepEqual(summarizeReply({ status: 502, headers: {}, text: "<html>Bad Gateway</html>" }),
    { status: 502, encrypted: false, decrypted: null, code: null, success: null, message: null });
  assert.equal(replyLine({ status: 502, encrypted: false, code: null, success: null }), "登录接口 HTTP 502（响应不是 JSON）");
  assert.equal(replyLine({ status: 200, encrypted: false, code: 412, success: false, message: "验证码错误" }), "登录接口 HTTP 200，code 412，失败：验证码错误");
});

test("messages are cut and masked: JWTs and digit runs never pass", () => {
  assert.equal(clean(`token ${jwt} for 13800001111`), "token <jwt> for <digits>");
  assert.equal(clean("x".repeat(500)).length, 200);
  assert.equal(clean(null), null);
});

test("sent headers: names only, cookie names without values, referer without query", () => {
  const s = sentHeaders({ "Content-Type": "application/json", cookie: "a=1; JSESSIONID=secret", origin: "https://hamiwebportaltest.rencaidanao.com",
    referer: "https://hamiwebportaltest.rencaidanao.com/login?token=abc" });
  assert.deepEqual(s, { headerNames: ["content-type", "cookie", "origin", "referer"], origin: "https://hamiwebportaltest.rencaidanao.com",
    referer: "https://hamiwebportaltest.rencaidanao.com/login", cookieNames: ["a", "JSESSIONID"] });
  assert.ok(!JSON.stringify(s).includes("secret") && !JSON.stringify(s).includes("abc"));
});
