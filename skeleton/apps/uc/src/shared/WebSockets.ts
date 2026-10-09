// Restored from WebSockets.<hash>.js: WebSocket with heartbeat and reconnect (behaviour kept as in the original,
// including that reconnect is only attempted while `canReconnect` is still true and the lock is free).
export function createWebSocket(url: string, onOpen?: () => void, onMessage?: (data: unknown) => void, heartbeat?: unknown, interval?: number) {
  if (!url) return;
  let canReconnect = true, lockReconnect = true, keepAlive: boolean | null = null; const gap = interval || 15000; let ws: WebSocket | null = null;
  connect(); sendHeartbeat();
  return { ws, sendMessage, closeWs };
  function connect() {
    ws = new WebSocket(url);
    ws.onopen = () => { onOpen && onOpen(); };
    ws.onmessage = (event) => { if (event) { const data = event.data; onMessage ? onMessage(data) : (canReconnect = false); } };
    ws.onerror = () => { console.log("----onerror报错重连"); reconnect(); };
    ws.onclose = () => { console.log("----onerror关闭重连"); keepAlive ? reconnect() : ws!.close(); };
  }
  function reconnect() {
    if (!canReconnect || lockReconnect) return;
    console.log("----canRe", canReconnect); console.log("----lockRe", lockReconnect);
    lockReconnect = true; setTimeout(() => { connect(); lockReconnect = false; }, 1000);
  }
  function sendHeartbeat() { if (ws && ws.readyState == 1) ws.send(JSON.stringify(heartbeat)); setTimeout(() => { sendHeartbeat(); }, gap); }
  function sendMessage(msg: string) { console.log("----------"); if (ws && ws.readyState == 1) ws.send(msg); else console.log("-----ws没有开"); }
  function closeWs() { keepAlive = false; console.log("------关闭"); ws!.close(); }
}
/** `g`: WebSocket base URL derived from the page origin (the original's configured base is an empty string). */
export const getWsBaseUrl = () => { const base = ""; return (base.startsWith("http") ? base : window.location.origin).replace("https://", "wss://").replace("http://", "ws://"); };
export { createWebSocket as c, getWsBaseUrl as g };
