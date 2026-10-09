// Records one page work order against the TEST environment (docs/pipeline.md §6 录制员, §12):
//   1. loads the human-prepared login state $RESTORE_ASSETS/.auth/pw-<role>.json (never logs in, never types a password;
//      no login state → blocked need-role, token gone or redirected to login → blocked login-expired);
//   2. pins the account role (全局说明 §6「流程」3): role keys must match the first recording with that role;
//   3. opens <test site><recordPath> headless and runs tests/interact/<id>.json for real. Every request to the two test
//      hosts goes out, writes included (HMRSFW_NO_WHITELIST=1 is required as the acknowledgement); every other host,
//      production included, is aborted;
//   4. writes all /xf-api/ traffic as HAR 1.2 to $RESTORE_ASSETS/har/pages/<id>.har: request bodies exactly as sent
//      (SM2 ciphertext kept; tools/har-body.mjs decrypts them in memory), responses as received (encrypted ones keep their
//      crypto_opt header and ciphertext), auth headers and token-named query parameters redacted. Extra per-entry fields: _seq (request order), _phase
//      ("load" | "step<i>" | "after"), _crypto;
//   5. runs the original baseline: tools/baseline.mjs <id> --har <har> (A); until A is merged,
//      tools/record-baseline-placeholder.mjs with the same command line;
//   6. on success commits tests/interact/<id>.json to the integration branch (only the script, never the HAR).
// Concurrency: each run has its own browser; HAR written via temp file + rename; one run per work order
// ($RESTORE_STATE/locks/rec-<id>); per-order notes in $RESTORE_STATE/record/<id>/ (no shared append file).
// Usage: node tools/record-page.mjs <工单id> [--app <hmrsfw-vue>] [--order <file>] [--script <file>] [--no-baseline]
//        [--baseline-only] [--no-commit] [--headed]
//        --offline <old.har> --out <new.har>: self-test without network. The test hosts are answered from legacy-dist and
//        <old.har>; the HAR goes to <new.har>; no commit, no role pin, no notes in $RESTORE_STATE.
// Output (one JSON line): {ok, id, steps, unstable:[...], blocked?, hint?, evidence?, error?, har, entries, writes:[{method,
//        path, count, phases, statuses}], sm2:{bodies, decrypted, undecryptable}, baseline, committed, warnings, durationMs}
// Exit: 0 ok · 1 error or unstable · 2 blocked (needs a human: login, other role). {"locked":true} when the order is
//       already being recorded. HAR contents and response data are never printed.
import { chromium } from "playwright";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { apiTracker, describeStep, loadScript, runStepRetry, scriptPath, settle } from "./interact.mjs";
import { entryKey, fulfillOptions, harResponder, requestBody } from "./har-body.mjs";
import { ORIGIN, ROOT, TEST_HOSTS, authState, checkRolePin, pinRole, commitToIntegration, coverage, envDirs, fail, legacyFile, lockOrder, resolveOrder, roleDrift, validId } from "./record-lib.mjs";

const t0 = Date.now();
const argv = process.argv.slice(2);
const VALUED = new Set(["--app", "--order", "--script", "--offline", "--out"]);
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
const brief = (e) => String(e.message).split("\n").map((l) => l.trim()).filter((l) => l && !/^=+/.test(l)).slice(0, 6).join(" | ").slice(0, 400);
const loginHint = (role, site) => `登录态失效或缺失：请人工在有界面的浏览器里重新登录测试站（${ORIGIN[site]}），把登录态保存为 $RESTORE_ASSETS/.auth/pw-${role}.json（在 $RESTORE_ASSETS 下运行 node tools/pw-login.mjs ${role} …；单位等角色用 pw-switch-role.mjs 切换后保存），然后重跑 record-page。脚本不会自动登录。`;

function emit(o, code) {
  console.log(JSON.stringify({ ...o, warnings, durationMs: Date.now() - t0 }));
  process.exitCode = code;
}

async function record({ order, steps, assets, state, harFile }) {
  const auth = authState(assets, order.role, order.site);
  if (auth.missing) return { blocked: `need-role:${order.role}`, hint: `没有角色 ${order.role} 的登录态（$RESTORE_ASSETS/.auth/pw-${order.role}.json），需要人准备该角色的测试账号并登录。` };
  if (!auth.hasToken) return { blocked: "login-expired", hint: loginHint(order.role, order.site) };
  const pin = checkRolePin(state, order.role, auth.localStorage);
  if (!pin.ok) return { blocked: `role-changed:${order.role}`, hint: `pw-${order.role}.json 的角色与第一次录制时固定的角色不同。请人切回原角色后重新保存登录态；确需更换角色时，删掉 $RESTORE_STATE/record/roles.json 里的 ${order.role} 项并重录该角色的全部页面。` };

  const browser = await chromium.launch({ headless: !flag("--headed") });
  try {
    const context = await browser.newContext({ storageState: auth.file, viewport: { width: 1920, height: 1080 }, locale: "zh-CN" });
    const external = new Set();
    const offline = OFFLINE ? harResponder(JSON.parse(readFileSync(path.resolve(OFFLINE), "utf8"))) : null;
    await context.route("**/*", (r) => {
      const q = r.request(), u = new URL(q.url());
      if (!/^https?:$/.test(u.protocol)) return r.continue();
      if (!TEST_HOSTS.has(u.host)) { external.add(u.host); return r.abort(); }
      if (!offline) return r.continue();
      if (/\/xf-api\//.test(q.url())) return r.fulfill(fulfillOptions(offline.lookup(q.method(), q.url(), q.postData()).entry));
      return r.fulfill(legacyFile(order.site, u.pathname));
    });
    let phase = "load", seq = 0;
    const loginSignals = [];
    const recs = new Map(), jobs = [], entries = [];
    context.on("request", (req) => { if (isApi(req.url())) recs.set(req, { seq: seq++, phase, t: Date.now() }); });
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
        _seq: rec.seq, _phase: rec.phase, _crypto: resHeaders["crypto_opt"] === "true",
      });
    };
    context.on("requestfinished", (req) => jobs.push(collect(req, false)));
    context.on("requestfailed", (req) => jobs.push(collect(req, true)));
    const tracker = apiTracker(context, isApi);
    const page = await context.newPage();
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push(String(e.message).slice(0, 160)));
    page.on("dialog", (d) => d.dismiss().catch(() => {}));

    await page.goto(ORIGIN[order.site] + order.recordPath, { waitUntil: "load", timeout: 60000 });
    const textLength = await settle(page, tracker);
    const finalPath = new URL(page.url()).pathname;
    const live = await page.evaluate(() => ({ ...localStorage })).catch(() => ({}));
    await Promise.all(jobs);
    const why = [...(LOGIN_PATH.test(finalPath) ? [`redirected to ${finalPath}`] : []), ...(live.token ? [] : ["token cleared from localStorage"]), ...loginSignals];
    if (why.length) return { blocked: "login-expired", hint: loginHint(order.role, order.site), evidence: why.slice(0, 5) };
    const drift = roleDrift(auth.localStorage, live);
    if (drift.length) return { blocked: `role-drift:${order.role}`, evidence: drift.map((k) => `localStorage ${k} changed after load`), hint: "页面加载后账号角色与登录态里的角色不一致（可能有人在别处切换了角色）。请人切回固定角色并重新保存登录态。" };
    if (finalPath !== new URL(ORIGIN[order.site] + order.recordPath).pathname) warnings.push(`landed on ${finalPath} instead of the record path`);

    const stepResults = [];
    for (const [i, s] of steps.entries()) {
      phase = `step${i}`;
      let err = null, note = null;
      try { const r = await runStepRetry(page, s, () => tracker.idle(page)); note = r.note; if (r.retried) warnings.push(`step ${i} retried once after an action timeout`); }
      catch (e) { err = brief(e); }
      await tracker.idle(page);
      stepResults.push({ i, step: describeStep(s), err, note });
      if (err) break;
    }
    phase = "after";
    await tracker.idle(page, { maxMs: 10000 });
    await Promise.all(jobs);
    if (loginSignals.length || LOGIN_PATH.test(new URL(page.url()).pathname)) return { blocked: "login-expired", hint: loginHint(order.role, order.site), evidence: [...loginSignals, new URL(page.url()).pathname].slice(0, 5) };
    const failedAt = new URL(page.url()).pathname;
    await context.close();

    entries.sort((a, b) => a._seq - b._seq);
    const failedStep = stepResults.find((s) => s.err);
    if (failedStep) return { error: `step ${failedStep.i} failed on ${failedAt}: ${failedStep.err}`, stepResults };
    if (!entries.length) warnings.push("no /xf-api/ request recorded");
    if (external.size) warnings.push(`aborted non-test hosts: ${[...external].sort().join(", ")}`);
    if (pageErrors.length) warnings.push(`${pageErrors.length} page error(s) on the original, first: ${pageErrors[0]}`);

    const har = { log: { version: "1.2", creator: { name: "record-page", version: "1" }, pages: [], entries, _record: { id: order.id, site: order.site, role: order.role, recordPath: order.recordPath, finalPath, textLength, steps: stepResults, recordedAt: new Date().toISOString() } } };
    if (!offline && pinRole(state, order.role, auth.localStorage)) warnings.push(`role ${order.role} pinned by this recording`);
    mkdirSync(path.dirname(harFile), { recursive: true });
    const tmp = `${harFile}.${process.pid}.tmp`;
    writeFileSync(tmp, JSON.stringify(har));
    renameSync(tmp, harFile);

    const decrypt = !!process.env.SM2_PRIVATE_KEY;
    const sm2 = { bodies: 0, decrypted: 0, undecryptable: 0 };
    for (const e of entries) {
      const b = requestBody(e.request.postData?.text ?? null, { decrypt });
      if (b.kind === "sm2" || b.kind === "sm2-undecryptable") sm2.bodies++;
      if (b.kind === "sm2" && decrypt) sm2.decrypted++;
      if (b.kind === "sm2-undecryptable") sm2.undecryptable++;
    }
    if (sm2.bodies && !decrypt) warnings.push(`SM2_PRIVATE_KEY not set: ${sm2.bodies} encrypted request bodies not checked`);
    // Non-GET requests grouped by endpoint (this backend also POSTs reads); no bodies, no response data.
    const writes = [];
    for (const e of entries.filter((x) => !["GET", "HEAD", "OPTIONS"].includes(x.request.method))) {
      const p = entryKey(e.request.method, e.request.url).split(" ")[1];
      let w = writes.find((x) => x.method === e.request.method && x.path === p);
      if (!w) writes.push((w = { method: e.request.method, path: p, count: 0, phases: [], statuses: [] }));
      w.count++;
      if (!w.phases.includes(e._phase)) w.phases.push(e._phase);
      if (!w.statuses.includes(e.response.status)) w.statuses.push(e.response.status);
    }
    return { entries: entries.length, writes, sm2, finalPath, stepResults };
  } finally { await browser.close().catch(() => {}); }
}

function baseline({ id, harFile }) {
  const own = existsSync(path.join(ROOT, "tools/baseline.mjs"));
  const tool = own ? "tools/baseline.mjs" : "tools/record-baseline-placeholder.mjs";
  const args = [path.join(ROOT, tool), id, "--har", harFile];
  if (opt("--app")) args.push("--app", path.resolve(opt("--app")));
  if (own && (opt("--order") || opt("--script"))) warnings.push("--order/--script are not passed to tools/baseline.mjs; it reads queue/ and tests/interact/");
  if (!own) for (const n of ["--order", "--script"]) if (opt(n)) args.push(n, path.resolve(opt(n)));
  const r = spawnSync(process.execPath, args, { cwd: ROOT, env: process.env, encoding: "utf8", maxBuffer: 256e6, timeout: 20 * 60e3 });
  const line = (r.stdout ?? "").trim().split("\n").filter(Boolean).pop();
  let j = null; try { j = JSON.parse(line); } catch {}
  if (!j) throw fail(`${tool} gave no JSON (exit ${r.status}): ${(r.stderr ?? "").trim().split("\n").pop()?.slice(0, 200) ?? ""}`);
  if (j.error) throw fail(`${tool}: ${j.error}`);
  return { tool, placeholder: !own, unstable: j.unstable ?? [], result: j };
}

let release = null;
try {
  if (!validId(id)) throw fail("usage: node tools/record-page.mjs <工单id> [--order <file>] [--script <file>] [--no-baseline] [--baseline-only] [--no-commit] [--headed]");
  const { assets, state } = envDirs();
  const baselineOnly = flag("--baseline-only");
  if (OFFLINE && !opt("--out")) throw fail("--offline <har> needs --out <file.har>: an offline self-test never writes the page HAR");
  if (!baselineOnly && !OFFLINE && process.env.HMRSFW_NO_WHITELIST !== "1") throw fail("HMRSFW_NO_WHITELIST=1 is required: recording sends every request, writes included, to the test environment");
  const order = resolveOrder(id, opt("--order"));
  const scriptFile = opt("--script") ? path.resolve(opt("--script")) : scriptPath(id);
  let steps = loadScript(scriptFile);
  if (!steps) {
    const cov = coverage(order);
    if (cov.required) throw fail(`interaction script required (${cov.reason}): write tests/interact/${id}.json`);
    warnings.push(`no interaction script (${cov.reason}): recording page load only`);
    steps = [];
  }
  release = lockOrder(state, id);
  if (!release) { console.log(JSON.stringify({ locked: true, id })); process.exit(0); }
  const harFile = OFFLINE ? path.resolve(opt("--out")) : path.join(assets, "har", "pages", `${id}.har`);
  const noteDir = path.join(state, "record", id);

  let rec = { entries: null, writes: [], sm2: null };
  if (baselineOnly) { if (!existsSync(harFile)) throw fail(`--baseline-only: no HAR for ${id} yet`); }
  else {
    rec = await record({ order, steps, assets, state, harFile });
    if (rec.blocked) { emit({ ok: false, id, steps: steps.length, unstable: [], blocked: rec.blocked, hint: rec.hint, ...(rec.evidence ? { evidence: rec.evidence } : {}) }, 2); throw null; }
    if (rec.error) throw fail(rec.error);
    if (OFFLINE) warnings.push("offline self-test: test hosts answered from legacy-dist and the given HAR, nothing sent; no commit, role pin or notes");
  }
  if (!OFFLINE && !baselineOnly) {
    // what this recording wrote to the test environment (method/path/status only), kept for the reset after all recordings
    mkdirSync(noteDir, { recursive: true });
    const wf = path.join(noteDir, "writes.json");
    const prev = existsSync(wf) ? JSON.parse(readFileSync(wf, "utf8")) : [];
    writeFileSync(wf, JSON.stringify([...prev, { recordedAt: new Date().toISOString(), role: order.role, writes: rec.writes }], null, 1));
  }
  const base = flag("--no-baseline") ? null : baseline({ id, harFile });
  if (!base) warnings.push("baseline skipped (--no-baseline)");
  else if (base.placeholder) warnings.push("baseline.mjs (A) not merged yet: placeholder checked replay stability only, no baseline written; rerun with --baseline-only after A is merged");
  const unstable = base?.unstable ?? [];
  let committed = "skipped";
  const ok = !unstable.length;
  if (ok && steps.length && !OFFLINE && !flag("--no-commit") && scriptFile === scriptPath(id))
    committed = commitToIntegration(path.relative(ROOT, scriptFile), `test(interact): ${id} interaction script (record-page)`).committed;
  const out = { ok, id, steps: steps.length, unstable, har: harFile.startsWith(assets + path.sep) ? "$RESTORE_ASSETS/" + path.relative(assets, harFile) : harFile, entries: rec.entries, writes: rec.writes, sm2: rec.sm2, baseline: base && { tool: base.tool, placeholder: base.placeholder, ...(base.placeholder ? { replay: base.result.replay } : {}) }, committed };
  if (!OFFLINE) { mkdirSync(noteDir, { recursive: true }); writeFileSync(path.join(noteDir, "result.json"), JSON.stringify({ ...out, warnings, at: new Date().toISOString() }, null, 1)); }
  emit(out, ok ? 0 : 1);
} catch (e) {
  if (e !== null) emit({ ok: false, id, steps: null, unstable: [], error: e?.userFacing ? e.message : String(e?.stack ?? e).split("\n").slice(0, 3).join(" | ") }, 1);
} finally {
  release?.();
}
