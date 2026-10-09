// Local receiver for the browser capture scripts in scripts/hmrsfw/. Listens on 127.0.0.1 only.
//   POST /save?name=<id>   writes the request body to <out-dir>/<id>.json
//   GET  /file/<name>.js   serves a capture script from scripts/hmrsfw/ (read-only, .js files only)
// Usage: node scripts/hmrsfw/receiver.mjs <out-dir>
import http from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const RECEIVER_PORT = Number(process.env.HMRSFW_RECEIVER_PORT ?? 38765);

const OUT = process.argv[2];
const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));

http.createServer((req, res) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Private-Network": "true",
  };
  if (req.method === "OPTIONS") { res.writeHead(204, cors); return res.end(); }
  const url = new URL(req.url, "http://x");
  if (req.method === "GET" && url.pathname.startsWith("/file/")) {
    const name = path.basename(url.pathname);
    if (!/^[a-zA-Z0-9_-]+\.js$/.test(name)) { res.writeHead(404, cors); return res.end(); }
    readFile(path.join(SCRIPTS, name), "utf8").then(
      (body) => { res.writeHead(200, { ...cors, "Content-Type": "text/javascript" }); res.end(body); },
      () => { res.writeHead(404, cors); res.end(); },
    );
    return;
  }
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", async () => {
    const name = (url.searchParams.get("name") || "x").replace(/[^a-zA-Z0-9_-]/g, "_");
    await writeFile(path.join(OUT, `${name}.json`), body);
    res.writeHead(200, cors); res.end("ok");
  });
}).listen(RECEIVER_PORT, "127.0.0.1", () => console.log(`listening on 127.0.0.1:${RECEIVER_PORT}`));
