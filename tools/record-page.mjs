// Records one page work order against the TEST environment (docs/pipeline.md §6 录制员, §12):
//   1. loads the human-prepared login state of the site, $RESTORE_ASSETS/.auth/pw-<portal|usercenter>.json (never logs in,
//      never types a password; no login state → blocked need-login:<site>, token gone or redirected to login → blocked
//      login-expired);
//   2. user center: switches the account to the work order's identity (role: general / jobseeker / corp / mentor) in the
//      header dropdown, like a person would, and checks it (the login state does NOT fix the identity; an identity the
//      account cannot switch to → blocked need-role:<identity>; an order whose role is null, i.e. work-orders.mjs could not
//      decide the identity → blocked need-role-decision before anything runs, never a guessed identity). Identities of one account are session state, so runs of
//      different identities queue on an account lock (lockIdentity), runs of the same identity may go together;
//   3. pins account + identity (全局说明 §6「流程」3): they must match the first recording of that identity;
//   4. opens <test site><recordPath> headless and runs tests/interact/<id>.json for real; the identity is checked again
//      after the page load (changed → blocked role-drift). Requests to the two test hosts go out, except the writes in
//      tools/record-write-denylist.json (tools/record-write-guard.mjs, HM-992): those are NOT sent, they get a fixed
//      success response and their HAR entry carries _intercepted; a POST neither listed nor query-shaped goes out and is
//      listed in warnings (HMRSFW_NO_WHITELIST=1 is still required: unlisted writes do reach the test environment);
//      every other host, production included, is aborted;
//   5. writes all /xf-api/ traffic of the page (not of the identity switch) as HAR 1.2 to $RESTORE_ASSETS/har/pages/<id>.har:
//      request bodies exactly as sent (SM2 ciphertext kept; tools/har-body.mjs decrypts them in memory), responses as
//      received (encrypted ones keep their crypto_opt header and ciphertext), auth headers and token-named query
//      parameters redacted. Extra per-entry fields: _seq (request order), _phase
//      ("load" | "step<i>" | "after"), _crypto, _intercepted + _interceptRule (answered by the write guard); log._record carries the identity and the page's localStorage after the switch
//      with the token removed (replay needs the identity keys, e.g. radiotype, routermenu);
//   6. runs the original baseline: tools/baseline.mjs <id> --har <staged har> --publish-har <har> (A); until A is merged,
//      tools/record-baseline-placeholder.mjs with the same command line. The new HAR is staged next to the page HAR and
//      only replaces it together with the baseline (HM-1246): a recording whose baseline fails, or that is killed before
//      the baseline is written, leaves the old HAR and baseline as a matching pair, so gates running meanwhile never see
//      "HAR changed since the baseline"; the staged file is removed on failure;
//   7. on success commits tests/interact/<id>.json to the integration branch (only the script, never the HAR);
//   8. whatever the outcome, takes the script out of the working tree again (HM-1130, record-lib parkScript): a draft
//      that did not get committed goes to $RESTORE_STATE/record/<id>/draft.json and the next run puts it back, so the
//      task checkout is left clean and can be removed when the task ends.
// Concurrency: each run has its own browser; HAR staged in a temp file, renamed in by baseline.mjs; one run per work order
// ($RESTORE_STATE/locks/rec-<id>); user-center runs share the account by identity ($RESTORE_STATE/locks/account-usercenter.json:
// same identity together, another identity waits up to --wait-identity; held for the recording only, not the baseline);
// per-order notes in $RESTORE_STATE/record/<id>/. At most HMRSFW_RECORD_SLOTS (default 3) runs of the machine record at
// once ($RESTORE_STATE/locks/record-slot-<k>, held for the recording only, not the baseline; HM-1221); a run waits up to
// --wait-slot minutes (default 9) for a slot, then fails with "recording slots … busy" (rerun later, not a page problem).
// Usage: node tools/record-page.mjs <工单id> [--app <hmrsfw-vue>] [--order <file>] [--script <file>] [--no-baseline]
//        [--baseline-only] [--no-commit] [--headed] [--wait-identity <minutes, default 30>] [--wait-slot <minutes, default 9>]
//        --offline <old.har> --out <new.har>: self-test without network. The test hosts are answered from legacy-dist and
//        <old.har>; the HAR goes to <new.har>, its baseline to <new.har>.baseline/ (never $RESTORE_STATE/baseline/<id>/,
//        which the gates read; HM-1265); no commit, no role pin, no notes in $RESTORE_STATE.
// Output (one JSON line): {ok, id, steps, unstable:[...], blocked?, hint?, evidence?, error?, scriptParked?, har, entries, writes:[{method,
//        path, count, phases, statuses}] (sent), intercepted:[{… , rules}] (not sent), sm2:{bodies, decrypted, undecryptable}, baseline, committed, warnings, durationMs}
// Exit: 0 ok · 1 error or unstable · 2 blocked (needs a human: login, identity). {"locked":true} when the order is
//       already being recorded, {"locked":true, identityBusy} when another identity kept the account past --wait-identity.
//       HAR contents and response data are never printed.
import { chromium } from "playwright";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { evaluate, thresholds } from "./coverage.mjs";
import { NOT_REPEATED, apiTracker, describeStep, loadScript, runStepRetry, scriptPath, settle } from "./interact.mjs";
import { entryKey, fulfillOptions, harResponder, requestBody } from "./har-body.mjs";
import { splitWrites, writeGuard } from "./record-write-guard.mjs";
import { IDENTITIES, ORIGIN, ROOT, TEST_HOSTS, authState, checkPin, commitToIntegration, coverage, envDirs, fail, identityFingerprint, identityOf, legacyFile, lockIdentity, lockOrder, lockRecordSlot, parkScript, pin, pinKey, resolveOrder, restoreScript, switchIdentity, tokenInfo, validId } from "./record-lib.mjs";
import { ensureLegacyDist } from "./lib/shared-deps.mjs";

const t0 = Date.now();
const argv = process.argv.slice(2);
const VALUED = new Set(["--app", "--order", "--script", "--offline", "--out", "--wait-identity", "--wait-slot"]);
const opt = (n) => { const i = argv.findIndex((a) => a === n || a.startsWith(n + "=")); return i < 0 ? undefined : argv[i].includes("=") ? argv[i].slice(n.length + 1) : argv[i + 1]; };
const flag = (n) => argv.includes(n);
const OFFLINE = opt("--offline");
const id = argv.find((a, i) => !a.startsWith("--") && !VALUED.has(argv[i - 1]));
const warnings = [];
const isApi = (u) => /\/xf-api\//.test(u) && !/\/sys\/common\/static\//.test(u);
const LOGIN_PATH = /\/(login|autoLogin)(\/|$)/i;
const LOGIN_MSG = /(token|登录).{0,6}(失效|过期|无效)|请重新登录|未登录|身份.{0,4}过期/i;
const SECRET_HEADER = /^(x-access-token|token|authorization|cookie)$/i;
const SECRET_PARAM = /token/i; // e.g. portal getSysUserByToken?curToken=…
const redactUrl = (raw) => { const u = new URL(raw); for (const k of [...u.searchParams.keys()]) if (SECRET_PARAM.test(k)) u.searchParams.set(k, "[redacted]"); return u.href; };
// First lines of an error plus the lines of Playwright's call log that say why an action did not go through (a 6-line
// cut showed only "waiting for element to be visible, enabled and stable" and hid "… intercepts pointer events").
const WHY = /intercepts pointer events|element is not|not attached|performing \w+ action|\w+ action done|scheduled navigations/;
const brief = (e) => { const ls = String(e.message).split("\n").map((l) => l.trim()).filter((l) => l && !/^=+/.test(l)); return [...new Set([...ls.slice(0, 4), ...ls.slice(4).filter((l) => WHY.test(l))])].join(" | ").slice(0, 600); };
const loginHint = (site) => `登录态失效或缺失：请人工在有界面的浏览器里重新登录测试站（${ORIGIN[site]}），在 $RESTORE_ASSETS 下运行 node <本仓库>/tools/pw-login.mjs all 30，只登录门户一次（用户中心由门户的「用户中心」入口自动进入），两站都保存后窗口自动关闭，然后重跑 record-page。只需登录，不用切身份（身份由 record-page 切）。脚本不会自动登录。`;

let park = null; // {state, id, committed}: set once this run holds the order lock
function emit(o, code) {
  if (park) {
    try { const r = parkScript(park.state, park.id, { committed: park.committed }); if (r) { o = { ...o, scriptParked: r.draft }; warnings.push(r.note); } }
    catch (e) { warnings.push(`could not move the interaction script out of the checkout: ${String(e.message).split("\n")[0]}`); }
    park = null;
  }
  console.log(JSON.stringify({ ...o, warnings, durationMs: Date.now() - t0 }));
  process.exitCode = code;
}

async function record({ order, steps, assets, state, harFile, staged }) {
  const auth = authState(assets, order.site);
  if (auth.missing) return { blocked: `need-login:${order.site}`, hint: loginHint(order.site) };
  if (!auth.hasToken) return { blocked: "login-expired", hint: loginHint(order.site) };
  const { exp } = tokenInfo(auth.localStorage);
  if (!OFFLINE && exp && exp * 1000 < Date.now() + 60e3) return { blocked: "login-expired", hint: loginHint(order.site), evidence: [`token expired at ${new Date(exp * 1000).toISOString()}`] };
  const uc = order.site === "usercenter" && !OFFLINE;

  const browser = await chromium.launch({ headless: !flag("--headed") });
  try {
    const context = await browser.newContext({ storageState: auth.file, viewport: { width: 1920, height: 1080 }, locale: "zh-CN" });
    if (OFFLINE && order.site === "usercenter") {
      // no switch offline: take the identity from the given HAR when it was recorded by record-page
      const rec = JSON.parse(readFileSync(path.resolve(OFFLINE), "utf8")).log?._record;
      if (rec?.localStorage) await context.addInitScript((ls) => { for (const [k, v] of Object.entries(ls)) localStorage.setItem(k, v); }, rec.localStorage);
      else warnings.push(`offline: ${path.basename(OFFLINE)} has no recorded identity, the page runs as the identity saved in pw-usercenter.json`);
    }
    const external = new Set();
    const offline = OFFLINE ? harResponder(JSON.parse(readFileSync(path.resolve(OFFLINE), "utf8"))) : null;
    const guard = writeGuard(); // the identity switch too: its own requests are on the allow list
    await context.route("**/*", (r) => {
      const q = r.request(), u = new URL(q.url());
      if (!/^https?:$/.test(u.protocol)) return r.continue();
      if (!TEST_HOSTS.has(u.host)) { external.add(u.host); return r.abort(); }
      if (isApi(q.url()) && guard.route(r)) return;
      if (!offline) return r.continue();
      if (/\/xf-api\//.test(q.url())) return r.fulfill(fulfillOptions(offline.lookup(q.method(), q.url(), q.postData()).entry));
      return r.fulfill(legacyFile(order.site, u.pathname));
    });
    let phase = uc ? null : "load", seq = 0; // null: identity switch, not part of the page recording
    const loginSignals = [];
    const recs = new Map(), jobs = [], entries = [];
    context.on("request", (req) => { if (phase && isApi(req.url())) recs.set(req, { seq: seq++, phase, t: Date.now() }); });
    // the identity switch is not recorded, but a 401 there still means the login is gone (not a missing identity)
    context.on("response", async (res) => {
      if (phase || !isApi(res.url())) return;
      if (res.status() === 401) return loginSignals.push(`HTTP 401 on ${entryKey(res.request().method(), res.url())} (identity switch)`);
      if (res.headers()["crypto_opt"] !== "true" && /json/i.test(res.headers()["content-type"] ?? "")) {
        try { const j = await res.json(); if (j && (j.code === 401 || LOGIN_MSG.test(String(j.message ?? "")))) loginSignals.push(`login message from ${entryKey(res.request().method(), res.url())} (identity switch)`); } catch {}
      }
    });
    const collect = async (req, failed) => {
      const rec = recs.get(req); if (!rec) return;
      const res = failed ? null : await req.response().catch(() => null);
      const reqHeaders = await req.allHeaders().catch(() => req.headers());
      let text = "", encoding, resHeaders = {};
      if (res) {
        resHeaders = await res.allHeaders().catch(() => res.headers());
        const ct = resHeaders["content-type"] ?? "";
        try { if (!ct || /json|text|javascript|xml|html/i.test(ct)) text = await res.text(); else { text = (await res.body()).toString("base64"); encoding = "base64"; } } catch {}
        const crypto = resHeaders["crypto_opt"] === "true";
        if (res.status() === 401) loginSignals.push(`HTTP 401 on ${entryKey(req.method(), req.url())}`);
        else if (!crypto && /json/i.test(ct)) { try { const j = JSON.parse(text); if (j && (j.code === 401 || LOGIN_MSG.test(String(j.message ?? "")))) loginSignals.push(`login message from ${entryKey(req.method(), req.url())}`); } catch {} }
      }
      const raw = req.postData();
      const ms = Date.now() - rec.t;
      entries.push({
        startedDateTime: new Date(rec.t).toISOString(), time: ms,
        request: {
          method: req.method(), url: redactUrl(req.url()), httpVersion: "HTTP/1.1", cookies: [],
          headers: Object.entries(reqHeaders).map(([name, value]) => ({ name, value: SECRET_HEADER.test(name) ? "[redacted]" : value })),
          queryString: [...new URL(redactUrl(req.url())).searchParams].map(([name, value]) => ({ name, value })),
          ...(raw == null ? {} : { postData: { mimeType: reqHeaders["content-type"] ?? "", text: raw } }),
          headersSize: -1, bodySize: raw == null ? 0 : Buffer.byteLength(raw),
        },
        response: res
          ? { status: res.status(), statusText: res.statusText(), httpVersion: "HTTP/1.1", cookies: [], headers: Object.entries(resHeaders).filter(([k]) => k !== "set-cookie").map(([name, value]) => ({ name, value })), content: { size: text.length, mimeType: resHeaders["content-type"] ?? "", text, ...(encoding ? { encoding } : {}) }, redirectURL: "", headersSize: -1, bodySize: -1 }
          : { status: 0, statusText: "", httpVersion: "HTTP/1.1", cookies: [], headers: [], content: { size: 0, mimeType: "x-unknown" }, redirectURL: "", headersSize: -1, bodySize: -1, _error: req.failure()?.errorText ?? "failed" },
        cache: {}, timings: { send: 0, wait: ms, receive: 0 },
        _seq: rec.seq, _phase: rec.phase, _crypto: resHeaders["crypto_opt"] === "true", ...guard.harFields(req),
      });
    };
    context.on("requestfinished", (req) => jobs.push(collect(req, false)));
    context.on("requestfailed", (req) => jobs.push(collect(req, true)));
    const tracker = apiTracker(context, isApi);
    const page = await context.newPage();
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push(String(e.message).slice(0, 160)));
    page.on("dialog", (d) => d.dismiss().catch(() => {}));

    let switched = null;
    if (uc) {
      // start from the identity home the saved session is on: the header dropdown only exists on identity pages
      const from = identityOf(auth.localStorage);
      await page.goto(ORIGIN.usercenter + (from ? IDENTITIES[from].home : IDENTITIES.jobseeker.home), { waitUntil: "load", timeout: 60000 });
      await settle(page, tracker, { maxMs: 20000 });
      if (LOGIN_PATH.test(new URL(page.url()).pathname) || !(await page.evaluate(() => localStorage.getItem("token")).catch(() => null)) || loginSignals.length)
        return { blocked: "login-expired", hint: loginHint(order.site), evidence: [new URL(page.url()).pathname, ...loginSignals].slice(0, 5) };
      const sw = await switchIdentity(page, order.role);
      if (loginSignals.length || LOGIN_PATH.test(new URL(page.url()).pathname)) return { blocked: "login-expired", hint: loginHint(order.site), evidence: [new URL(page.url()).pathname, ...loginSignals].slice(0, 5) };
      if (!sw.ok) return { blocked: `need-role:${order.role}`, hint: `无法把测试账号切到「${IDENTITIES[order.role].label}」身份：${sw.reason}。请人确认该账号右上角能切出这个身份（需要的话为账号开通该身份），然后重跑 record-page。`, evidence: [sw.reason] };
      switched = sw.localStorage;
      const p = checkPin(state, pinKey(order.site, order.role), identityFingerprint(order.site, switched));
      if (!p.ok) return { blocked: `role-changed:${order.role}`, hint: `测试账号或「${IDENTITIES[order.role].label}」身份与第一次录制时固定的不同（换了账号或身份被重建）。确认要换时，删掉 $RESTORE_STATE/record/identities.json 里的 ${pinKey(order.site, order.role)} 项并重录该身份的全部页面。` };
      await settle(page, tracker, { maxMs: 15000 });
      phase = "load";
    } else if (!OFFLINE) {
      const p = checkPin(state, pinKey(order.site, order.role), identityFingerprint(order.site, auth.localStorage));
      if (!p.ok) return { blocked: `role-changed:${order.role}`, hint: "门户登录态的账号与第一次录制时固定的不同。确认要换时，删掉 $RESTORE_STATE/record/identities.json 里的 portal 项并重录门户的全部页面。" };
    }
    await page.goto(ORIGIN[order.site] + order.recordPath, { waitUntil: "load", timeout: 60000 });
    const textLength = await settle(page, tracker);
    const finalPath = new URL(page.url()).pathname;
    const live = await page.evaluate(() => ({ ...localStorage })).catch(() => ({}));
    await Promise.all(jobs);
    const why = [...(LOGIN_PATH.test(finalPath) ? [`redirected to ${finalPath}`] : []), ...(live.token ? [] : ["token cleared from localStorage"]), ...loginSignals];
    if (why.length) return { blocked: "login-expired", hint: loginHint(order.site), evidence: why.slice(0, 5) };
    if (uc && identityOf(live) !== order.role) return { blocked: `role-drift:${order.role}`, evidence: [`identity after load: ${identityOf(live) ?? "unknown"}`], hint: `切到「${IDENTITIES[order.role].label}」后，页面加载完身份又变了（页面自己改了身份，或该页面不属于这个身份）。请核对工单的 role。` };
    if (finalPath !== new URL(ORIGIN[order.site] + order.recordPath).pathname) warnings.push(`landed on ${finalPath} instead of the record path`);

    const stepResults = [];
    for (const [i, s] of steps.entries()) {
      phase = `step${i}`;
      let err = null, note = null;
      try { const r = await runStepRetry(page, s, () => tracker.idle(page)); note = r.note; if (r.retried) warnings.push(`step ${i} retried once after an action timeout`); if (r.note === NOT_REPEATED) warnings.push(`step ${i} timed out after its action was sent; not repeated`); }
      catch (e) { err = brief(e); }
      await tracker.idle(page);
      stepResults.push({ i, step: describeStep(s), err, note });
      if (err) break;
    }
    phase = "after";
    await tracker.idle(page, { maxMs: 10000 });
    await Promise.all(jobs);
    if (loginSignals.length || LOGIN_PATH.test(new URL(page.url()).pathname)) return { blocked: "login-expired", hint: loginHint(order.site), evidence: [...loginSignals, new URL(page.url()).pathname].slice(0, 5) };
    const failedAt = new URL(page.url()).pathname;
    await context.close();

    entries.sort((a, b) => a._seq - b._seq);
    const failedStep = stepResults.find((s) => s.err);
    if (failedStep) return { error: `step ${failedStep.i} failed on ${failedAt}: ${failedStep.err}`, stepResults };
    if (!entries.length) warnings.push("no /xf-api/ request recorded");
    if (external.size) warnings.push(`aborted non-test hosts: ${[...external].sort().join(", ")}`);
    if (pageErrors.length) warnings.push(`${pageErrors.length} page error(s) on the original, first: ${pageErrors[0]}`);
    for (const f of guard.failed) warnings.push(`write guard could not answer ${f} (not sent; the request failed)`);
    for (const k of [...guard.unlisted].sort()) warnings.push(`unlisted write? ${k} was sent: not on tools/record-write-denylist.json, not query-shaped; add it to deny or allow (with why)`);

    const har = { log: { version: "1.2", creator: { name: "record-page", version: "1" }, pages: [], entries, _record: { id: order.id, site: order.site, role: order.role, ...(uc ? { identity: IDENTITIES[order.role].label, localStorage: Object.fromEntries(Object.entries(live).filter(([k]) => !/token/i.test(k))) } : {}), recordPath: order.recordPath, finalPath, textLength, steps: stepResults, recordedAt: new Date().toISOString() } } };
    if (!offline && pin(state, pinKey(order.site, order.role), identityFingerprint(order.site, uc ? switched : auth.localStorage))) warnings.push(`${pinKey(order.site, order.role)} pinned by this recording`);
    mkdirSync(path.dirname(harFile), { recursive: true });
    writeFileSync(staged, JSON.stringify(har)); // published with the baseline (HM-1246), not here

    const decrypt = !!process.env.SM2_PRIVATE_KEY;
    const sm2 = { bodies: 0, decrypted: 0, undecryptable: 0 };
    for (const e of entries) {
      const b = requestBody(e.request.postData?.text ?? null, { decrypt });
      if (b.kind === "sm2" || b.kind === "sm2-undecryptable") sm2.bodies++;
      if (b.kind === "sm2" && decrypt) sm2.decrypted++;
      if (b.kind === "sm2-undecryptable") sm2.undecryptable++;
    }
    if (sm2.bodies && !decrypt) warnings.push(`SM2_PRIVATE_KEY not set: ${sm2.bodies} encrypted request bodies not checked`);
    // Non-GET requests that went out, grouped by endpoint (this backend also POSTs reads), and the requests the write guard
    // answered instead; no bodies, no response data.
    const { writes, intercepted } = splitWrites(entries);
    return { entries: entries.length, writes, intercepted, sm2, finalPath, stepResults };
  } finally { await browser.close().catch(() => {}); }
}

// Puts a staged HAR in place when no baseline does it (--no-baseline, the placeholder).
function publishHar(staged, harFile) { if (staged && existsSync(staged)) renameSync(staged, harFile); }

function baseline({ id, harFile, staged = null }) {
  const own = existsSync(path.join(ROOT, "tools/baseline.mjs"));
  const tool = own ? "tools/baseline.mjs" : "tools/record-baseline-placeholder.mjs";
  const args = [path.join(ROOT, tool), id, "--har", staged ?? harFile, ...(own && staged ? ["--publish-har", harFile] : [])];
  if (opt("--app")) args.push("--app", path.resolve(opt("--app")));
  // a self-test must not replace the page's real baseline with one naming its scratch HAR (HM-1265)
  if (own && OFFLINE) args.push("--out", `${harFile}.baseline`);
  if (own && (opt("--order") || opt("--script"))) warnings.push("--order/--script are not passed to tools/baseline.mjs; it reads queue/ and tests/interact/");
  if (!own) for (const n of ["--order", "--script"]) if (opt(n)) args.push(n, path.resolve(opt(n)));
  const r = spawnSync(process.execPath, args, { cwd: ROOT, env: process.env, encoding: "utf8", maxBuffer: 256e6, timeout: 20 * 60e3 });
  const line = (r.stdout ?? "").trim().split("\n").filter(Boolean).pop();
  let j = null; try { j = JSON.parse(line); } catch {}
  const kept = staged ? " (new HAR discarded; the previous HAR and baseline are kept)" : "";
  if (!j) throw fail(`${tool} gave no JSON (exit ${r.status}): ${(r.stderr ?? "").trim().split("\n").pop()?.slice(0, 200) ?? ""}${kept}`);
  if (j.error) throw fail(`${tool}: ${j.error}${kept}`);
  if (!own) publishHar(staged, harFile);
  return { tool, placeholder: !own, unstable: j.unstable ?? [], coverage: j.coverage ?? null, result: j };
}

let release = null, releaseIdentity = null, releaseSlot = null, staged = null;
try {
  if (!validId(id)) throw fail("usage: node tools/record-page.mjs <工单id> [--order <file>] [--script <file>] [--no-baseline] [--baseline-only] [--no-commit] [--headed]");
  const { assets, state } = envDirs();
  const baselineOnly = flag("--baseline-only");
  if (OFFLINE && !opt("--out")) throw fail("--offline <har> needs --out <file.har>: an offline self-test never writes the page HAR");
  if (!baselineOnly && !OFFLINE && process.env.HMRSFW_NO_WHITELIST !== "1") throw fail("HMRSFW_NO_WHITELIST=1 is required: recording sends requests to the test environment, writes not on tools/record-write-denylist.json included");
  const order = resolveOrder(id, opt("--order"));
  if (order.role == null) {
    emit({ ok: false, id, steps: null, unstable: [], blocked: "need-role-decision", hint: `工单没有判定身份（role 为 null）：先裁定该页面属于哪个身份（${Object.keys(IDENTITIES).join(" / ")}），写进工单的 role 后重跑 record-page。不按默认身份录制。`, ...(order.notes ? { evidence: [order.notes] } : {}) }, 2);
    throw null;
  }
  const scriptFile = opt("--script") ? path.resolve(opt("--script")) : scriptPath(id);
  const ownScript = scriptFile === scriptPath(id) && !OFFLINE;
  if (ownScript) { const r = restoreScript(state, id); if (r) warnings.push(r); }
  { const r = ensureLegacyDist(ROOT); if (r) warnings.push(r); }
  let steps = loadScript(scriptFile);
  if (!steps) {
    const cov = coverage(order);
    if (cov.required) throw fail(`interaction script required (${cov.reason}): write tests/interact/${id}.json`);
    warnings.push(`no interaction script (${cov.reason}): recording page load only`);
    steps = [];
  }
  release = lockOrder(state, id);
  if (!release) { console.log(JSON.stringify({ locked: true, id })); process.exit(0); }
  if (ownScript) park = { state, id, committed: null };
  if (!OFFLINE && !baselineOnly) {
    const slots = Number(process.env.HMRSFW_RECORD_SLOTS ?? 3), waitMin = Number(opt("--wait-slot") ?? 9);
    if (!Number.isInteger(slots) || slots < 1) throw fail("HMRSFW_RECORD_SLOTS must be a positive integer");
    if (!Number.isFinite(waitMin) || waitMin < 0) throw fail("--wait-slot <minutes> must be a non-negative number");
    releaseSlot = await lockRecordSlot(state, { slots, waitMs: waitMin * 60e3 });
    if (!releaseSlot) throw fail(`all ${slots} recording slots of this machine stayed busy for ${waitMin} min (other recordings running): not a page problem, rerun record-page later`);
  }
  if (order.site === "usercenter" && !OFFLINE && !baselineOnly) {
    const waitMin = Number(opt("--wait-identity") ?? 30);
    if (!Number.isFinite(waitMin) || waitMin < 0) throw fail("--wait-identity <minutes> must be a non-negative number");
    releaseIdentity = await lockIdentity(state, "usercenter", order.role, { waitMs: waitMin * 60e3 });
    if (!releaseIdentity) { release(); release = null; releaseSlot?.(); releaseSlot = null; console.log(JSON.stringify({ locked: true, id, identityBusy: "the test account is recording another identity; retry later" })); process.exit(0); }
  }
  const harFile = OFFLINE ? path.resolve(opt("--out")) : path.join(assets, "har", "pages", `${id}.har`);
  const noteDir = path.join(state, "record", id);

  let rec = { entries: null, writes: [], intercepted: [], sm2: null };
  if (baselineOnly) { if (!existsSync(harFile)) throw fail(`--baseline-only: no HAR for ${id} yet`); }
  else {
    staged = `${harFile}.${process.pid}.tmp`;
    try { rec = await record({ order, steps, assets, state, harFile, staged }); }
    finally { await releaseIdentity?.(); releaseIdentity = null; releaseSlot?.(); releaseSlot = null; } // the baseline and the commit do not touch the account or the test site
    if (rec.blocked) { emit({ ok: false, id, steps: steps.length, unstable: [], blocked: rec.blocked, hint: rec.hint, ...(rec.evidence ? { evidence: rec.evidence } : {}) }, 2); throw null; }
    if (rec.error) throw fail(rec.error);
    if (OFFLINE) warnings.push("offline self-test: test hosts answered from legacy-dist and the given HAR, nothing sent; no commit, role pin or notes");
  }
  if (!OFFLINE && !baselineOnly) {
    // what this recording wrote to the test environment (method/path/status only), kept for the reset after all recordings
    mkdirSync(noteDir, { recursive: true });
    const wf = path.join(noteDir, "writes.json");
    const prev = existsSync(wf) ? JSON.parse(readFileSync(wf, "utf8")) : [];
    writeFileSync(wf, JSON.stringify([...prev, { recordedAt: new Date().toISOString(), role: order.role, writes: rec.writes, intercepted: rec.intercepted }], null, 1));
  }
  if (flag("--no-baseline")) publishHar(staged, harFile);
  const base = flag("--no-baseline") ? null : baseline({ id, harFile, staged });
  if (!base) warnings.push("baseline skipped (--no-baseline)");
  else if (base.placeholder) warnings.push("baseline.mjs (A) not merged yet: placeholder checked replay stability only, no baseline written; rerun with --baseline-only after A is merged");
  const unstable = base?.unstable ?? [];
  let committed = "skipped";
  const ok = !unstable.length;
  if (ok && steps.length && !OFFLINE && !flag("--no-commit") && scriptFile === scriptPath(id))
    committed = commitToIntegration(path.relative(ROOT, scriptFile), `test(interact): ${id} interaction script (record-page)`).committed;
  if (park) park.committed = committed;
  // Coverage of the original (HM-21): only reported. A page below the thresholds still records; the recorder reads
  // `node tools/coverage.mjs report <id>` and adds interactions or hands the data gaps to the D7 request.
  const cov = base?.coverage ?? null;
  const verdict = cov && thresholds() ? evaluate({ page: cov.page && { loaded: true, function: { pct: cov.page.function }, block: { pct: cov.page.block } }, stable: cov.stable }, thresholds()) : null;
  const out = { ok, id, steps: steps.length, unstable, ...(cov ? { coverage: cov, belowThreshold: verdict?.below ?? null, ...(verdict?.below ? { coverageReasons: verdict.reasons } : {}) } : {}), har: harFile.startsWith(assets + path.sep) ? "$RESTORE_ASSETS/" + path.relative(assets, harFile) : harFile, entries: rec.entries, writes: rec.writes, intercepted: rec.intercepted, sm2: rec.sm2, baseline: base && { tool: base.tool, placeholder: base.placeholder, ...(base.placeholder ? { replay: base.result.replay } : {}) }, committed };
  if (!OFFLINE) { mkdirSync(noteDir, { recursive: true }); writeFileSync(path.join(noteDir, "result.json"), JSON.stringify({ ...out, warnings, at: new Date().toISOString() }, null, 1)); }
  emit(out, ok ? 0 : 1);
} catch (e) {
  if (e !== null) emit({ ok: false, id, steps: null, unstable: [], error: e?.userFacing ? e.message : String(e?.stack ?? e).split("\n").slice(0, 3).join(" | ") }, 1);
} finally {
  if (staged) rmSync(staged, { force: true }); // published (renamed away) on success; on failure the old HAR stays
  release?.();
  await releaseIdentity?.();
  releaseSlot?.();
}
