// Static file server for a built site (legacy-dist/<site> or a vite build output), always on port 0 so any number of
// gates and baselines can run side by side. Unknown paths fall back to <first root>/index.html (SPA routing).
// Extra roots are searched in order (a single-page build serves the app's public/ dir from its source instead of
// copying it).
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const MIME = { ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf", ".html": "text/html", ".mp4": "video/mp4", ".webp": "image/webp", ".pdf": "application/pdf" };

export function serveStatic(roots) {
  roots = (Array.isArray(roots) ? roots : [roots]).map((r) => path.resolve(r));
  const find = (u) => {
    for (const r of roots) {
      const f = path.join(r, u);
      if (f.startsWith(r) && existsSync(f) && statSync(f).isFile()) return f;
    }
    return path.join(roots[0], "index.html");
  };
  return new Promise((resolve, reject) => {
    const srv = createServer((req, res) => {
      let u;
      try { u = decodeURIComponent(req.url.split("?")[0]); } catch { u = "/"; }
      const f = find(u);
      res.setHeader("content-type", MIME[path.extname(f)] ?? "application/octet-stream");
      try { res.end(readFileSync(f)); } catch { res.statusCode = 404; res.end(); }
    });
    srv.on("error", reject);
    srv.listen(0, "127.0.0.1", () => resolve({ origin: `http://127.0.0.1:${srv.address().port}`, close: () => new Promise((r) => srv.close(r)) }));
  });
}
