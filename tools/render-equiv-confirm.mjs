// Report-only render-equivalence pass over the confirmation pages (plan §2: not a gate until FP ≤ 10%).
// Usage: node tools/render-equiv-confirm.mjs <ids...>  → out/render-equiv-confirm.json (merged)
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
const ids = process.argv.slice(2);
const orders = JSON.parse(readFileSync("tools/confirm-orders.json", "utf8")).filter((o) => ids.includes(o.id));
const outF = "out/render-equiv-confirm.json"; const R = existsSync(outF) ? JSON.parse(readFileSync(outF, "utf8")) : {};
for (const o of orders) for (const g of ["s", "h"]) {
  const main = `restore-${g}/${o.target}`; const sub = `restore-${g}/${o.subComponentDir}`;
  const files = [main, ...(existsSync(sub) ? readdirSync(sub).filter((f) => f.endsWith(".vue")).map((f) => path.join(sub, f)) : [])];
  let res; try { const out = execFileSync("node", ["tools/render-equiv.mjs", o.site, o.sourceChunk, ...files], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: 120000 });
    res = out.split("\n").filter((l) => l.startsWith("[")).flatMap((l) => JSON.parse(l)).map((x) => ({ c: x.c, r: x.r, t: x.t, o: x.o, x: x.x }));
  } catch (e) { res = [{ c: "*", r: "ERROR", msg: String(e.stderr || e.message).split("\n").find((l) => /Error/.test(l))?.slice(0, 200) }]; }
  const v = JSON.parse(readFileSync(`out/verify-confirm/${g}/${o.id}.json`, "utf8"));
  R[`${o.id}-${g.toUpperCase()}`] = { replayPass: v.pass, ast: res, astAllEqual: res.every((x) => x.r === "EQUAL") };
  console.log(o.id, g, "replay", v.pass, "ast", res.map((x) => x.c + ":" + x.r).join(" "));
}
writeFileSync(outF, JSON.stringify(R, null, 1));
