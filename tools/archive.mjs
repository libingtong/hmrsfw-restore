// Archive a site's static build (GET only, anonymous, rate limited). Usage: node tools/archive.mjs <origin> <outDir>
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
const [origin, outDir] = process.argv.slice(2);
const seen = new Map();
const queue = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function get(p) {
  if (seen.has(p)) return seen.get(p);
  await sleep(200);
  const res = await fetch(origin + p, { headers: { accept: "*/*" } });
  if (!res.ok) { seen.set(p, null); console.log("MISS", res.status, p); return null; }
  const buf = Buffer.from(await res.arrayBuffer());
  const ct = res.headers.get("content-type") || "";
  if (p.endsWith(".js") && ct.includes("text/html")) { seen.set(p, null); console.log("HTML-FALLBACK", p); return null; }
  const file = path.join(outDir, p.replace(/^\//, "").split("?")[0]);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, buf);
  seen.set(p, { size: buf.length, sha256: createHash("sha256").update(buf).digest("hex"), contentType: ct });
  return buf.toString("utf8");
}
function enqueue(p) { if (p && !seen.has(p) && !queue.includes(p)) queue.push(p); }
const html = await get("/index.html");
for (const m of html.matchAll(/(?:src|href)="(\/[^"]+)"/g)) enqueue(m[1]);
for (const m of html.matchAll(/"(\/router\/[^"]+\.json)"/g)) enqueue(m[1]);
enqueue("/config.js"); enqueue("/router/router-xjhm.json"); enqueue("/favicon.ico");
while (queue.length) {
  const p = queue.shift();
  const text = await get(p);
  if (!text) continue;
  if (p.endsWith(".js")) {
    const dir = path.posix.dirname(p);
    for (const m of text.matchAll(/import\("\.\/([A-Za-z0-9_.-]+\.js)"\)/g)) enqueue(`${dir}/${m[1]}`);
    for (const m of text.matchAll(/from"\.\/([A-Za-z0-9_.-]+\.js)"/g)) enqueue(`${dir}/${m[1]}`);
    for (const m of text.matchAll(/"assets\/([A-Za-z0-9_.-]+\.(?:js|css))"/g)) enqueue(`/assets/${m[1]}`);
    for (const m of text.matchAll(/"(\/(?:assets|static|img|images|third|router)\/[A-Za-z0-9_./-]+\.(?:png|jpe?g|gif|svg|webp|json|js|css|woff2?|ttf|mp4))"/g)) enqueue(m[1]);
  }
  if (p.endsWith(".css")) {
    for (const m of text.matchAll(/url\(["']?(\/[^"')]+)["']?\)/g)) enqueue(m[1].split("?")[0].split("#")[0]);
    for (const m of text.matchAll(/url\(["']?\.\.\/([^"')]+)["']?\)/g)) enqueue("/" + m[1].split("?")[0].split("#")[0]);
  }
}
const manifest = Object.fromEntries([...seen].filter(([, v]) => v));
await writeFile(path.join(outDir, "manifest.json"), JSON.stringify({ origin, archivedAt: new Date().toISOString(), files: manifest }, null, 2));
console.log("archived", Object.keys(manifest).length, "files to", outDir);
