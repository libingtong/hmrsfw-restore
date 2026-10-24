// WebSockets in the page HAR (HM-1346). Some pages get their data only over a WebSocket: livejob detail.vue
// (/livedetail) fills its comment list from /xf-api/liveTelecastWebsocket/<live id>/<random 6-digit userId>, nothing
// over HTTP. record-page.mjs records the page's sockets with wsRecorder, the replay (har.mjs routeApi, used by
// baseline.mjs and the gate alike) answers them with routeWebSockets; nothing reaches the test environment on replay.
// HAR shape: log._webSockets (beside log.entries, so tools reading the HTTP entries are unchanged), in connection order:
//   { url, startedDateTime, _seq, _phase, _webSocketMessages: [{ type: "send" | "receive", time, opcode, data, _phase }],
//     _closed?: { by: "page" | "server", code, reason, _phase } }
//   time in seconds (as Chrome's HAR export), opcode 1 text / 2 binary (data base64), _phase the recording phase
//   ("load" | "step<i>" | "after") the frame happened in. Same redaction as the HTTP entries: token-named query
//   parameters of the URL, and the values of token / authorization / cookie keys of JSON messages (any depth;
//   "key=value" / "key: value" in other text), become "[redacted]".
// Matching a socket the page opens on replay (matchWebSocket), host and scheme ignored, token-named and _t query
// parameters dropped (as for HTTP):
//   1. "exact": same path and query;
//   2. "random-id": same query, same path except the LAST segment, all digits on both sides with the same length (a
//      client id the page draws at random, e.g. detail.vue's Math.floor(1e5 + Math.random() * 9e5));
//   3. none → the socket goes where it would have gone without the HAR (the local server, which does not speak
//      WebSocket, so the connection fails as before HM-1346). Sockets to *.rencaidanao.com are closed, never sent.
// Only those URLs are routed (a RegExp Playwright matches itself, not a function: a function routes every socket of
// the context through Playwright's relay), so a page whose HAR has no socket keeps its sockets as they were.
// The n-th connection of a browser context matching the same recorded sockets gets the n-th of them (the last one once
// they run out); every context (each baseline or gate run) starts again from the first.
// Replay of one socket: the recorded server messages go out in their recorded order; a message recorded after the
// page's k-th send waits for the page's k-th send (sends are counted, not compared: they carry the random id), and one
// recorded in a later phase waits for the replay to reach that phase (the replay's phase() says "after" once its steps
// are done; a step the replay's script does not have is "after" too). A socket the server closed in the recording is
// closed after its last message; a close by the page is the page's own business.
const SECRET = /token/i; // URL parameters, as record-page redactUrl
const SECRET_KEY = /token|authorization|cookie/i; // message keys, as record-page's redacted headers
const LAST_ID = /^\d+$/;

export const redactWsUrl = (raw) => { const u = new URL(raw); for (const k of [...u.searchParams.keys()]) if (SECRET.test(k)) u.searchParams.set(k, "[redacted]"); return u.href; };

// JSON: primitive values of token-named keys are replaced in the text itself (the rest of the message keeps its exact
// text, long numeric ids included); a token-named key holding an object or array is replaced whole, which needs a
// re-serialisation of that message.
const TOKEN_PAIR = /("[^"\\]*(?:token|authorization|cookie)[^"\\]*"\s*:\s*)("(?:[^"\\]|\\.)*"|-?\d[\d.eE+-]*|true|false)/gi;
export function redactWsData(text) {
  let parsed;
  try { parsed = JSON.parse(text); } catch { return text.replace(/([\w.-]*(?:token|authorization|cookie)[\w.-]*)(\s*[:=]\s*)(?:bearer\s+)?([^&;\s,}"']+)/gi, "$1$2[redacted]"); }
  if (typeof parsed === "string") { const r = redactWsData(parsed); return r === parsed ? text : JSON.stringify(r); }
  if (!parsed || typeof parsed !== "object") return text;
  const out = text.replace(TOKEN_PAIR, '$1"[redacted]"');
  let whole = false;
  const walk = (v) => {
    if (Array.isArray(v)) return v.map(walk);
    if (!v || typeof v !== "object") return v;
    return Object.fromEntries(Object.entries(v).map(([k, x]) => (SECRET_KEY.test(k) && x && typeof x === "object" ? ((whole = true), [k, "[redacted]"]) : [k, walk(x)])));
  };
  const deep = walk(JSON.parse(out));
  return whole ? JSON.stringify(deep) : out;
}

const targetOf = (url) => {
  const u = new URL(url.replace("http://__ORIGIN__", "http://h"));
  for (const k of [...u.searchParams.keys()]) if (SECRET.test(k) || k === "_t") u.searchParams.delete(k);
  u.searchParams.sort();
  return { segs: u.pathname.split("/"), query: u.searchParams.toString() };
};

// log._webSockets of a parsed HAR → the replay's socket list
export function webSocketsOf(harJson) {
  return { list: (harJson?.log?._webSockets ?? []).map((s) => ({ url: s.url, phase: s._phase ?? "load", frames: s._webSocketMessages ?? [], closed: s._closed ?? null, target: targetOf(s.url) })) };
}

// → { sockets: [recorded socket, …] (all that match, best tier), tier } | null
export function matchWebSocket(list, url) {
  const t = targetOf(url);
  const same = (s) => s.target.query === t.query && s.target.segs.length === t.segs.length;
  const exact = list.filter((s) => same(s) && s.target.segs.every((x, i) => x === t.segs[i]));
  if (exact.length) return { sockets: exact, tier: "exact" };
  const n = t.segs.length - 1, id = t.segs[n];
  const loose = n > 1 && LAST_ID.test(id) ? list.filter((s) => same(s) && s.target.segs.every((x, i) => (i === n ? LAST_ID.test(x) && x.length === id.length : x === t.segs[i]))) : [];
  return loose.length ? { sockets: loose, tier: "random-id" } : null;
}

// The recorded socket for the next connection to url (used: the context's connection counts) → { sock, tier } | null
function pick(list, used, url) {
  const m = matchWebSocket(list, url);
  if (!m) return null;
  const key = m.sockets.map((s) => list.indexOf(s)).join(",");
  const n = used.get(key) ?? 0;
  used.set(key, n + 1);
  return { sock: m.sockets[Math.min(n, m.sockets.length - 1)], tier: m.tier };
}

// RegExp of the URLs routeWebSockets takes: the recorded paths (a digit last segment as \d{length}) on any host, and
// any socket to *.rencaidanao.com.
const esc = (x) => x.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
export function routePattern(list) {
  const paths = [...new Set(list.map((s) => s.target.segs.map((x, i, a) => (i === a.length - 1 && i > 1 && LAST_ID.test(x) ? `\\d{${x.length}}` : esc(x))).join("\\/")))];
  return new RegExp(`^wss?:\\/\\/(?:(?:[^/?#]*\\.)?rencaidanao\\.com(?::\\d+)?(?:[/?#]|$)${paths.length ? `|[^/?#]+(?:${paths.join("|")})(?:[?#]|$)` : ""})`);
}
// "load" 0, "step<i>" i + 1, "after" past every step; anything else is never reached.
const AFTER = Number.MAX_SAFE_INTEGER;
export const phaseRank = (p) => (p === "load" ? 0 : p === "after" ? AFTER : /^step\d+$/.test(p ?? "") ? Math.min(Number(p.slice(4)) + 1, AFTER) : Infinity);

const payload = (f) => (f.opcode === 2 ? Buffer.from(f.data, "base64") : f.data);

// Answers one routed socket (a Playwright WebSocketRoute that is NOT connected to a server) from a recorded socket.
// onFrame(type, message) sees what goes either way (record-page's offline self-test records it again), onClose(code,
// reason) the page closing it (the route has a single close handler).
export function replaySocket(ws, sock, { phase, onFrame = () => {}, onClose = () => {} }) {
  const frames = sock.frames;
  let i = 0, pageSends = 0, matched = 0, done = false, timer = null;
  const stop = () => { done = true; if (timer) clearInterval(timer); timer = null; };
  const pump = () => {
    if (done) return;
    const now = phaseRank(phase());
    while (i < frames.length) {
      const f = frames[i];
      if (f.type === "send") { if (matched < pageSends) { matched++; i++; continue; } break; }
      if (phaseRank(f._phase) > now) break;
      const m = payload(f);
      onFrame("receive", m);
      ws.send(m);
      i++;
    }
    if (i >= frames.length && sock.closed?.by === "server" && phaseRank(sock.closed._phase) <= now) {
      stop();
      ws.close({ code: sock.closed.code, reason: sock.closed.reason }).catch(() => {});
      return;
    }
    // waiting for a later phase (or the server's close in one): look again as the replay moves on
    const waitsPhase = i < frames.length ? frames[i].type !== "send" : sock.closed?.by === "server";
    if (waitsPhase && !timer) { timer = setInterval(pump, 100); timer.unref?.(); }
    else if (!waitsPhase && timer) { clearInterval(timer); timer = null; }
  };
  ws.onMessage((m) => { onFrame("send", m); pageSends++; pump(); });
  ws.onClose((code, reason) => { stop(); onClose(code, reason); });
  setTimeout(pump, 0); // messages recorded before the page's first send go out once the page has its socket
}

// Routes the context's WebSockets from the HAR (har.webSockets of har.mjs loadHar). onEvent({phase, path, tier,
// recorded, type}) on every connection ("open" / "aborted") and frame ("send" / "receive"): diagnostics only.
export async function routeWebSockets(ctx, store, { phase, onEvent = () => {} }) {
  const used = new Map();
  await ctx.routeWebSocket(routePattern(store.list), (ws) => {
    const u = new URL(ws.url());
    if (/(^|\.)rencaidanao\.com$/.test(u.hostname)) { onEvent({ phase: phase(), path: "EXTERNAL " + u.host, tier: "aborted", type: "aborted" }); return ws.close().catch(() => {}); }
    const p = pick(store.list, used, ws.url());
    if (!p) return ws.connectToServer(); // the path matched, the query did not: as without the HAR
    const ev = { path: u.pathname, tier: p.tier, recorded: store.list.indexOf(p.sock) };
    onEvent({ ...ev, phase: phase(), type: "open" });
    replaySocket(ws, p.sock, { phase, onFrame: (type) => onEvent({ ...ev, phase: phase(), type }) });
  });
}

// Recording side (record-page.mjs): installs on the context a pass-through for every WebSocket and keeps what goes
// either way while phase() is set (null: the identity switch, not recorded). allow(url) false → closed, never
// connected (hosts outside the test environment, collected in `blocked`). replay = webSocketsOf(<HAR>) answers the
// sockets from that HAR instead of connecting (--offline self-test). stop() before closing the context, so the
// teardown's closes are not recorded as the server's.
export async function wsRecorder(ctx, { phase, allow, replay = null }) {
  const sockets = [], blocked = new Set();
  const used = new Map();
  let seq = 0, stopped = false;
  await ctx.routeWebSocket(/^wss?:\/\//, (ws) => {
    const u = new URL(ws.url());
    if (!allow(u)) { blocked.add(u.host); return ws.close().catch(() => {}); }
    const p = phase();
    const rec = p && !stopped ? { url: redactWsUrl(ws.url()), startedDateTime: new Date().toISOString(), _seq: seq++, _phase: p, _webSocketMessages: [] } : null;
    if (rec) sockets.push(rec);
    const note = (type, m) => {
      if (!rec || stopped) return;
      const bin = typeof m !== "string";
      rec._webSocketMessages.push({ type, time: Date.now() / 1000, opcode: bin ? 2 : 1, data: bin ? Buffer.from(m).toString("base64") : redactWsData(m), _phase: phase() ?? rec._phase });
    };
    const closed = (by, code, reason) => { if (rec && !stopped && !rec._closed) rec._closed = { by, code, reason, _phase: phase() ?? rec._phase }; };
    if (replay) {
      const r = pick(replay.list, used, ws.url());
      if (!r) return ws.close().catch(() => {}); // not in the HAR: offline, nothing to connect to
      return replaySocket(ws, r.sock, { phase: () => phase() ?? "load", onFrame: note, onClose: (code, reason) => closed("page", code, reason) });
    }
    const server = ws.connectToServer();
    ws.onMessage((m) => { note("send", m); server.send(m); });
    server.onMessage((m) => { note("receive", m); ws.send(m); });
    ws.onClose((code, reason) => { closed("page", code, reason); server.close({ code, reason }).catch(() => {}); });
    server.onClose((code, reason) => { closed("server", code, reason); ws.close({ code, reason }).catch(() => {}); });
  });
  return {
    sockets, blocked, stop: () => { stopped = true; },
    stats: () => ({ connections: sockets.length, sent: sockets.reduce((a, s) => a + s._webSocketMessages.filter((f) => f.type === "send").length, 0), received: sockets.reduce((a, s) => a + s._webSocketMessages.filter((f) => f.type === "receive").length, 0) }),
  };
}
