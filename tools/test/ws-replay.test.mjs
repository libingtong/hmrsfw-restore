// node --test tools/test/ws-replay.test.mjs
// WebSocket recording and replay (HM-1346). livejob detail.vue (/livedetail) gets its comment list only over
// /xf-api/liveTelecastWebsocket/<live id>/<random 6-digit userId>: record-page.mjs did not record WebSocket frames and
// the replay's ctx.route cannot see them, so neither the baseline nor the gate ever showed a commentItem. Now
// record-page keeps the frames in log._webSockets and har.mjs routeApi (baseline and gate) answers them from the HAR,
// matching the random last segment. Real browser, local fixture page and a local WebSocket server; no test host.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createServer } from "node:http";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright";
import { runPage } from "../gate/replay.mjs";
import { loadHar } from "../gate/har.mjs";
import { matchWebSocket, phaseRank, redactWsData, redactWsUrl, routePattern, webSocketsOf, wsRecorder } from "../gate/ws.mjs";
import { scopeRootSel } from "../gate/common.mjs";
import { serveStatic } from "../gate/serve.mjs";

// The shape of detail.vue: a random client id in the socket URL and in the first message; the server answers with
// {total, records}, every message replaces the list. 「刷新」 sends again (the server answers it).
const PAGE = `<!doctype html><html><head><meta charset="utf-8"></head><body><main><div class="live" data-v-p><ul class="comments" data-v-p></ul><p class="state" data-v-p>状态:</p><button id="more">刷新</button></div></main><script>
const live = new URLSearchParams(location.search).get("id") || "2199000000000011001";
const userId = Math.floor(1e5 + Math.random() * 9e5);
window.__wsLog = [];
const ws = new WebSocket(location.origin.replace(/^http/, "ws") + "/xf-api/liveTelecastWebsocket/" + live + "/" + userId + "?token=page-secret");
ws.onopen = () => ws.send(JSON.stringify({ businessId: live, userId, izSendAll: "0", token: "page-secret" }));
ws.onmessage = (e) => { const s = JSON.parse(e.data); document.querySelector(".comments").innerHTML = (s.records || []).map((r) => '<li data-v-p>' + r.content + '</li>').join(""); };
const state = (t) => { window.__wsLog.push(t); document.querySelector(".state").textContent += " " + t; };
ws.onerror = () => state("error");
ws.onclose = (e) => state("close " + e.code);
document.getElementById("more").onclick = () => ws.send(JSON.stringify({ businessId: live, userId, more: 1 }));
</script></body></html>`;

const frame = (type, phase, records, extra = {}) => ({ type, time: 1, opcode: 1, data: type === "send" ? JSON.stringify({ businessId: "2199000000000011001", userId: 654321, izSendAll: "0" }) : JSON.stringify({ total: records.length, records: records.map((content) => ({ content })), ...extra }), _phase: phase });
const SOCKET = (frames, closed) => ({ url: "wss://hamiwebportaltest.rencaidanao.com/xf-api/liveTelecastWebsocket/2199000000000011001/654321?token=[redacted]", startedDateTime: "2026-10-01T00:00:00.000Z", _seq: 0, _phase: "load", _webSocketMessages: frames, ...(closed ? { _closed: closed } : {}) });

let browser, tmp, n = 0;
async function run(har, { steps = null, query = "" } = {}) {
  const root = path.join(tmp, String(n++));
  mkdirSync(root, { recursive: true });
  writeFileSync(path.join(root, "index.html"), PAGE);
  const f = path.join(root, "page.har");
  writeFileSync(f, JSON.stringify(har));
  const srv = await serveStatic(root);
  try {
    return await runPage(browser, { origin: srv.origin, url: "/" + query, storage: { localStorage: {} }, har: loadHar(f), sel: scopeRootSel("data-v-p"), steps, shotDir: root, tag: "shot" });
  } finally { await srv.close(); }
}
const harOf = (sockets, steps = []) => ({ log: { version: "1.2", entries: [], _webSockets: sockets, _record: { steps: steps.map((_, i) => ({ i })) } } });
const lines = (c) => c.text.split("\n").map((s) => s.trim()).filter((s) => s && s !== "刷新");
const items = (c) => lines(c).filter((s) => !s.startsWith("状态:"));
const stateOf = (c) => lines(c).find((s) => s.startsWith("状态:"));

test.before(async () => { browser = await chromium.launch(); tmp = mkdtempSync(path.join(os.tmpdir(), "ws-replay-")); });
test.after(async () => { await browser?.close(); rmSync(tmp, { recursive: true, force: true }); });

test("matchWebSocket: exact first, else only the last segment may differ, digits of the same length", () => {
  const { list } = webSocketsOf(harOf([SOCKET([]), { ...SOCKET([]), url: "ws://__ORIGIN__/xf-api/liveTelecastWebsocket/2199000000000011001/123456" }]));
  const m = (u) => { const r = matchWebSocket(list, u); return r ? `${r.tier}:${r.sockets.map((s) => list.indexOf(s)).join(",")}` : null; };
  assert.equal(m("ws://127.0.0.1:5/xf-api/liveTelecastWebsocket/2199000000000011001/123456"), "exact:1");
  assert.equal(m("ws://127.0.0.1:5/xf-api/liveTelecastWebsocket/2199000000000011001/654321?token=abc&_t=1"), "exact:0"); // token, _t dropped
  assert.equal(m("ws://127.0.0.1:5/xf-api/liveTelecastWebsocket/2199000000000011001/987123"), "random-id:0,1");
  assert.equal(m("ws://127.0.0.1:5/xf-api/liveTelecastWebsocket/2199000000000011001/98712"), null); // other length
  assert.equal(m("ws://127.0.0.1:5/xf-api/liveTelecastWebsocket/2199000000000011001/abcdef"), null); // not digits
  assert.equal(m("ws://127.0.0.1:5/xf-api/liveTelecastWebsocket/2199000000000011002/654321"), null); // other live id
  assert.equal(m("ws://127.0.0.1:5/xf-api/liveTelecastWebsocket/2199000000000011001/987123?x=1"), null); // other query
  assert.equal(m("ws://127.0.0.1:5/xf-api/liveTelecastWebsocket/2199000000000011001/987123/1"), null); // other depth
});

test("redaction: token-named query parameters and JSON keys, untouched messages keep their text", () => {
  assert.equal(redactWsUrl("wss://h/x/1?curToken=abc&id=2"), "wss://h/x/1?curToken=%5Bredacted%5D&id=2");
  assert.equal(redactWsData('{"a":{"X-Access-Token":"t","n":1},"list":[{"token":"t"}]}'), '{"a":{"X-Access-Token":"[redacted]","n":1},"list":[{"token":"[redacted]"}]}');
  const plain = '{ "b":1,  "a":2 }';
  assert.equal(redactWsData(plain), plain);
  assert.equal(redactWsData("auth token=abc&x=1"), "auth token=[redacted]&x=1");
  assert.equal(redactWsData('{"id":2199000000000011001,"accessToken":"abc"}'), '{"id":2199000000000011001,"accessToken":"[redacted]"}'); // long ids kept
  assert.equal(redactWsData('{"tokens":["a"],"n":1}'), '{"tokens":"[redacted]","n":1}');
  assert.equal(redactWsData("CONNECT\nX-Access-Token: abc\nAuthorization: Bearer x"), "CONNECT\nX-Access-Token: [redacted]\nAuthorization: [redacted]");
  assert.equal(redactWsData(JSON.stringify("token=abc")), '"token=[redacted]"');
  assert.ok(phaseRank("load") < phaseRank("step0") && phaseRank("step0") < phaseRank("step9") && phaseRank("step9") < phaseRank("after"));
  assert.equal(phaseRank("bogus"), Infinity);
});

test("routePattern: only recorded paths (random last segment as digits) and rencaidanao hosts are routed", () => {
  const re = routePattern(webSocketsOf(harOf([SOCKET([])])).list);
  assert.ok(re.test("ws://127.0.0.1:5/xf-api/liveTelecastWebsocket/2199000000000011001/111111"));
  assert.ok(re.test("ws://127.0.0.1:5/xf-api/liveTelecastWebsocket/2199000000000011001/111111?x=1")); // the handler decides on the query
  assert.ok(!re.test("ws://127.0.0.1:5/xf-api/liveTelecastWebsocket/2199000000000011001/11111"));
  assert.ok(!re.test("ws://127.0.0.1:5/"));
  assert.ok(re.test("wss://hamiwebportaltest.rencaidanao.com/anything"));
  const none = routePattern([]); // a HAR without sockets: only the hosts that must never be reached
  assert.ok(!none.test("ws://127.0.0.1:5/xf-api/liveTelecastWebsocket/1/111111") && none.test("wss://rencaidanao.com"));
});

test("replay: server messages answer the page's sends in recorded order; the random userId still matches", { timeout: 180000 }, async () => {
  const har = harOf([SOCKET([frame("send", "load"), frame("receive", "load", ["第一条"]), frame("receive", "load", ["第一条", "职位评论"])])]);
  const r = await run(har);
  assert.deepEqual(items(r.load.candidates[0]), ["第一条", "职位评论"]);
  assert.equal(stateOf(r.load.candidates[0]), "状态:"); // still open
  assert.deepEqual(r.webSockets.map((e) => `${e.phase} ${e.type} ${e.tier}`), ["load open random-id", "load send random-id", "load receive random-id", "load receive random-id"]);
  assert.equal(r.webSockets[0].path, "/xf-api/liveTelecastWebsocket/2199000000000011001/" + r.webSockets[0].path.split("/").pop());
  assert.deepEqual(r.load.requests, []); // not in the compared request log
});

test("replay: a message recorded after a later send or in a later phase waits for it; server close replayed; each run starts over", { timeout: 300000 }, async () => {
  const steps = [{ click: "刷新", wait: 400 }];
  const har = harOf([SOCKET([frame("send", "load"), frame("receive", "load", ["a"]), frame("send", "step0"), frame("receive", "step0", ["a", "b"]), frame("receive", "after", ["a", "b", "推送"])], { by: "server", code: 4000, reason: "bye", _phase: "after" })], steps);
  const runs = [await run(har, { steps }), await run(har, { steps })];
  for (const r of runs) {
    assert.deepEqual(items(r.load.candidates[0]), ["a"]); // load: only what answered the first send
    assert.deepEqual(items(r.final.candidates[0]), ["a", "b", "推送"]);
    assert.equal(stateOf(r.load.candidates[0]), "状态:");
    assert.equal(stateOf(r.final.candidates[0]), "状态: close 4000"); // the server's close, after its last message
    assert.deepEqual(r.webSockets.filter((e) => e.type !== "send").map((e) => `${e.phase} ${e.type}`), ["load open", "load receive", "step0 receive", "step0 receive"]);
    assert.equal(r.webSockets[0].recorded, 0);
  }
});

test("replay: a socket the HAR does not have is not answered (connection fails as before)", { timeout: 180000 }, async () => {
  const har = harOf([SOCKET([frame("send", "load"), frame("receive", "load", ["x"])])]);
  const r = await run(har, { query: "?id=2199000000000099999" });
  assert.deepEqual(items(r.load.candidates[0]), []);
  assert.equal(stateOf(r.load.candidates[0]), "状态: error close 1006");
  assert.equal(r.webSockets, undefined);
});

// Minimal RFC 6455 server: text frames only, enough for the recorder's pass-through.
function wsServer(html, onText) {
  const srv = createServer((q, res) => { res.setHeader("content-type", "text/html"); res.end(html); });
  const send = (sock, text) => { const b = Buffer.from(text); const head = b.length < 126 ? Buffer.from([0x81, b.length]) : Buffer.from([0x81, 126, b.length >> 8, b.length & 255]); sock.write(Buffer.concat([head, b])); };
  srv.on("upgrade", (q, sock) => {
    const accept = createHash("sha1").update(q.headers["sec-websocket-key"] + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11").digest("base64");
    sock.write(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`);
    let buf = Buffer.alloc(0);
    sock.on("data", (d) => {
      buf = Buffer.concat([buf, d]);
      while (buf.length >= 6) {
        const op = buf[0] & 15; let len = buf[1] & 127, off = 2;
        if (len === 126) { len = buf.readUInt16BE(2); off = 4; }
        if (buf.length < off + 4 + len) return;
        const mask = buf.subarray(off, off + 4), body = Buffer.from(buf.subarray(off + 4, off + 4 + len)).map((x, i) => x ^ mask[i % 4]);
        buf = buf.subarray(off + 4 + len);
        if (op === 8) { sock.end(Buffer.from([0x88, 0])); return; }
        if (op === 1) onText(body.toString(), (t) => send(sock, t));
      }
    });
    sock.on("error", () => {});
  });
  return new Promise((r) => srv.listen(0, "127.0.0.1", () => r({ origin: `http://127.0.0.1:${srv.address().port}`, close: () => new Promise((c) => { srv.closeAllConnections?.(); srv.close(c); }) })));
}

test("record → replay round trip: frames in order with phases, token redacted, replay renders the same", { timeout: 300000 }, async () => {
  let k = 0;
  const srv = await wsServer(PAGE, (text, reply) => { const m = JSON.parse(text); k++; reply(JSON.stringify({ total: k, records: Array.from({ length: k }, (_, i) => ({ content: `评论${i + 1}` })), ...(m.more ? {} : { izHasTopMsg: false }) })); });
  const ctx = await browser.newContext();
  let phase = "load";
  try {
    const rec = await wsRecorder(ctx, { phase: () => phase, allow: (u) => u.hostname === "127.0.0.1" });
    const page = await ctx.newPage();
    await page.goto(srv.origin + "/");
    await page.locator(".comments li").first().waitFor();
    phase = "step0";
    await page.click("#more");
    await page.locator(".comments li").nth(1).waitFor();
    phase = "after";
    rec.stop();
    await ctx.close();
    assert.equal(rec.sockets.length, 1);
    const s = rec.sockets[0];
    assert.match(s.url, /\/xf-api\/liveTelecastWebsocket\/2199000000000011001\/\d{6}\?token=%5Bredacted%5D$/);
    assert.deepEqual(s._webSocketMessages.map((f) => `${f._phase} ${f.type}`), ["load send", "load receive", "step0 send", "step0 receive"]);
    assert.equal(JSON.parse(s._webSocketMessages[0].data).token, "[redacted]");
    assert.ok(!JSON.stringify(rec.sockets).includes("page-secret"));
    assert.equal(s._closed, undefined); // the teardown after stop() is not the server's close
    assert.deepEqual(rec.stats(), { connections: 1, sent: 2, received: 2 });
    const steps = [{ click: "刷新", wait: 400 }];
    const r = await run(harOf(rec.sockets, steps), { steps });
    assert.deepEqual(items(r.load.candidates[0]), ["评论1"]);
    assert.deepEqual(items(r.final.candidates[0]), ["评论1", "评论2"]);
    // record-page --offline: the recorder answers from the given HAR instead of connecting, and records that again
    const ctx2 = await browser.newContext();
    phase = "load";
    const again = await wsRecorder(ctx2, { phase: () => phase, allow: () => true, replay: webSocketsOf(harOf(rec.sockets, steps)) });
    const p2 = await ctx2.newPage();
    await p2.goto(srv.origin + "/");
    await p2.locator(".comments li").first().waitFor();
    phase = "step0";
    await p2.click("#more");
    await p2.locator(".comments li").nth(1).waitFor();
    again.stop();
    await ctx2.close();
    assert.equal(k, 2, "offline replay did not connect to the server");
    assert.deepEqual(again.sockets[0]._webSocketMessages.map((f) => `${f._phase} ${f.type}`), ["load send", "load receive", "step0 send", "step0 receive"]);
    assert.deepEqual(again.sockets[0]._webSocketMessages.filter((f) => f.type === "receive").map((f) => f.data), s._webSocketMessages.filter((f) => f.type === "receive").map((f) => f.data));
  } finally { await srv.close(); }
});

test("recorder: sockets to hosts outside allow are closed, never connected", { timeout: 180000 }, async () => {
  const srv = await wsServer(PAGE, () => assert.fail("must not connect"));
  const ctx = await browser.newContext();
  try {
    const rec = await wsRecorder(ctx, { phase: () => "load", allow: () => false });
    const page = await ctx.newPage();
    await page.goto(srv.origin + "/");
    await page.waitForFunction(() => window.__wsLog.some((x) => x.startsWith("close")));
    assert.deepEqual([...rec.blocked], [new URL(srv.origin).host]);
    assert.deepEqual(rec.sockets, []);
    await ctx.close();
  } finally { await srv.close(); }
});
