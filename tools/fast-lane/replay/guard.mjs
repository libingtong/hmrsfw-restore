// Preloaded with `node --import ./guard.mjs <tool>`; does NOT touch the tool's judging logic.
// Only uses Playwright launch options so that nothing can leave this machine:
//  - Chromium resolves every host except 127.0.0.1/localhost to NOTFOUND (no DNS, no connection),
//  - no proxy is used,
//  - the page clock is pinned (ctx.clock.setFixedTime, timers keep running) so pages that render "now" (e.g. c20 falls back to
//    new Date() for the fair time) are identical between the two loads even across a minute boundary; set
//    REPLAY_FIXED_TIME=off to use the real clock, or an ISO time to pick another instant,
//  - every request that targets another host is logged (host + count only, no URL/query/body) to out/offhost-requests.log.
import pw from "playwright";
import { appendFileSync, mkdirSync } from "node:fs";
mkdirSync("out", { recursive: true });
const LOG = "out/offhost-requests.log";
const FT = process.env.REPLAY_FIXED_TIME ?? "2026-10-09T12:00:00+08:00";
const FIXED = FT === "off" ? null : new Date(FT);
const orig = pw.chromium.launch.bind(pw.chromium);
pw.chromium.launch = async (opts = {}) => {
  const args = [...(opts.args ?? []), "--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1, EXCLUDE localhost", "--no-proxy-server"];
  const browser = await orig({ ...opts, args });
  const newContext = browser.newContext.bind(browser);
  browser.newContext = async (...a) => {
    const ctx = await newContext(...a);
    if (FIXED) await ctx.clock.setFixedTime(FIXED);
    ctx.on("request", (r) => {
      let u; try { u = new URL(r.url()); } catch { return; }
      if (!/^https?:$|^wss?:$/.test(u.protocol)) return;
      if (u.hostname === "127.0.0.1" || u.hostname === "localhost") return;
      appendFileSync(LOG, `${u.protocol}//${u.host}\n`);
    });
    return ctx;
  };
  return browser;
};
