// Checks the user-center identities of the test account, headless, with the same switch record-page uses
// (record-lib switchIdentity: header dropdown, like a person). record-page does not need anything saved: the login state
// stays one per site and it switches the identity itself before every recording. Prints identity names and pages only.
//   default: switches one context through the given identities (all four by default) and reports each;
//   --cross: also reloads a second context of the same account after every switch and reports its identity, i.e. whether
//            switching in one browser context changes the identity seen by another (README「录制」);
//   --save-legacy: after each successful switch also saves .auth/pw-usercenter-<identity>.json, the per-role states the
//            POC confirmation tools still read (pw-record, interact-confirm, verify-confirm, shell-probe).
// Run with RESTORE_ASSETS set. Usage: node tools/pw-switch-role.mjs [general|jobseeker|corp|mentor ...] [--cross] [--save-legacy]
import { chromium } from "playwright";
import { renameSync } from "node:fs";
import path from "node:path";
import { IDENTITIES, ORIGIN, TEST_HOSTS, authState, identityOf, switchIdentity } from "./record-lib.mjs";

const args = process.argv.slice(2);
const cross = args.includes("--cross"), saveLegacy = args.includes("--save-legacy");
const wanted = args.filter((a) => !a.startsWith("--"));
const list = wanted.length ? wanted : Object.keys(IDENTITIES);
if (!list.every((x) => IDENTITIES[x])) { console.error(`usage: node tools/pw-switch-role.mjs [${Object.keys(IDENTITIES).join("|")} ...] [--cross] [--save-legacy]`); process.exit(1); }
const assets = process.env.RESTORE_ASSETS;
if (!assets) { console.error("RESTORE_ASSETS must be set"); process.exit(1); }
const auth = authState(assets, "usercenter");
if (auth.missing || !auth.hasToken) { console.log(JSON.stringify({ ok: false, blocked: auth.missing ? "need-login:usercenter" : "login-expired" })); process.exit(2); }

const browser = await chromium.launch();
const open = async () => {
  const ctx = await browser.newContext({ storageState: auth.file, viewport: { width: 1440, height: 900 }, locale: "zh-CN" });
  await ctx.route("**/*", (r) => { const u = new URL(r.request().url()); return !/^https?:$/.test(u.protocol) || TEST_HOSTS.has(u.host) ? r.continue() : r.abort(); });
  const page = await ctx.newPage();
  const from = identityOf(auth.localStorage);
  await page.goto(ORIGIN.usercenter + IDENTITIES[from ?? "jobseeker"].home, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(5000);
  return page;
};
const seen = async (page) => ({ identity: identityOf(await page.evaluate(() => ({ ...localStorage })).catch(() => ({}))), path: new URL(page.url()).pathname });
const out = { ok: true, start: null, switches: [] };
try {
  const a = await open(), b = cross ? await open() : null;
  out.start = await seen(a);
  if (/\/login/i.test(out.start.path)) { out.ok = false; out.blocked = "login-expired"; }
  else for (const identity of list) {
    const r = await switchIdentity(a, identity);
    const row = { identity, ok: r.ok, ...(r.ok ? {} : { reason: r.reason }), now: await seen(a) };
    if (r.ok && saveLegacy) {
      const file = path.join(assets, ".auth", `pw-usercenter-${identity}.json`), tmp = `${file}.${process.pid}.tmp`;
      await a.context().storageState({ path: tmp }); renameSync(tmp, file); row.saved = `.auth/pw-usercenter-${identity}.json`;
    }
    if (b) { await b.reload({ waitUntil: "load" }); await b.waitForTimeout(5000); row.otherContext = await seen(b); }
    out.switches.push(row);
    if (!r.ok) out.ok = false;
  }
} finally { await browser.close(); }
console.log(JSON.stringify(out));
process.exitCode = out.ok ? 0 : out.blocked ? 2 : 1;
