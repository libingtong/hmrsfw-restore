// node --test tools/test/record-write-guard.test.mjs
// Write guard of record-page (HM-992, tools/record-write-guard.mjs + tools/record-write-denylist.json): listed writes are
// not sent to the test environment and get a fixed success response, queries go out, the HAR entry is marked, the gate
// replays a marked entry without a difference, and the identity switch's own requests are untouched. Real Chromium, no
// network: the "test environment" is a route handler that records what would have been sent.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright";
import { INTERCEPTED, classify, loadDenylist, splitWrites, writeGuard } from "../record-write-guard.mjs";
import { loadHar, routeApi } from "../gate/har.mjs";
import { stepSeq } from "../gate/compare.mjs";
import { ROOT } from "../record-lib.mjs";

const list = loadDenylist();
const UC = "https://hamiusercentertest.rencaidanao.com";
const api = (p) => UC + "/xf-api" + p;
const SUBMIT = "/xf-job/job/xfJobCompany/sumbitImportantCompanyInfo";
const QUERY = "/xf-job/job/xfJobCompany/izAlreadySubmitCompany";

// Every non-GET endpoint record-page recorded up to 10-21 (writes.json of all orders), and what the guard must do with it.
const DENIED = new Set([
  "/xf-job/job/xfJobCompany/sumbitImportantCompanyInfo", "/xf-job/job/xfJobCompany/sumbitBaseCompanyInfo",
  "/xf-oddjob/oddjob/xfOddPositionApply/add", "/xf-oddjob/oddJob/licenseFree/callRecord/add", "/xf-oddjob/oddjob/xfOddUserCollect/add",
  "/xf-oddjob/oddjob/xfOddUser/userRelease", "/xf-job/job/xfJobComplaintRecord/add", "/xf-job/job/xfSysConsult/saveOne",
  "/xf-job/job/xfJobOverseasRecruitRegistration/saveOrCancel", "/xf-job/job/xfJobFeedbackRecord/add", "/xf-job/communal/xfSysUser/beSchoolGraduate",
]);
const RECORDED_POSTS = [...DENIED, ...`/jeecg-system/sys/user/phoneVerification /job/licenseFree/xfJobCompanyPosition/recommendJobList
/job/licenseFree/xfJobGovRecruitCompany/noPagelist /job/licenseFree/xfJobGovRecruitPosition/noPagelist /job/xfJobCompanyPosition/historyUsePositionList
/oddjob/xfOddUserBrowse/browseRecords /xf-college/careerTalkStudent/xfCollegeCareerTalkStudent/queryTalkStudentListInfo
/xf-college/collegeWqCompanyExpand/xfCollegeWqCompanyExpand/getWqCompanyExpandInfoByJob /xf-college/student/xfCollegeStudent/getStudentInfoById
/xf-common/common/xfAnnouncementSendRedcord/queryAnnouncementList /xf-common/common/xfAnnouncementSendRedcord/queryNoReaded
/xf-encyclopedia/encyclopedia/industry/subscribelist /xf-job/communal/licenseFree/getDictListByType /xf-job/communal/licenseFree/quenaire/List
/xf-job/communal/licenseFree/quenaire/izLogin /xf-job/communal/licenseFree/xfJobEventReleaseNew/listCyfwMh
/xf-job/communal/licenseFree/xfSysArticleType/listChildrenTreeByTypeId /xf-job/communal/xfSysArticlePositionDeliver/getDeliverList
/xf-job/communal/xfSysMultiDict/getDictListByType /xf-job/communal/xfSysOrganization/queryChildrenTreeListById /xf-job/communal/xfSysQuenaire/preview
/xf-job/communal/xfSysQuenaire/record/izEnter /xf-job/communal/xfSysQuenaireRecord/getMyAnswerRecord /xf-job/communal/xfSysUser/checkIdCard
/xf-job/communal/xfSysUserAuthenticateIdentityItem/queryByCompanyId /xf-job/communal/xfSysUserAuthenticateIdentityItem/queryByUserId
/xf-job/job/licenseFree/findJobList /xf-job/job/licenseFree/freeCompanyPositionPageList /xf-job/job/licenseFree/getPolicyDetail
/xf-job/job/licenseFree/queryHomeSettingById /xf-job/job/licenseFree/statistics/queryJobFairStatistics /xf-job/job/licenseFree/xfJobFair/updateBrowseCount
/xf-job/job/licenseFree/xfJobFairApplyInfo/queryAttendeesCompany /xf-job/job/licenseFree/xfJobFairApplyInfo/scrollBarData
/xf-job/job/xfJobBrowsingHistory/list /xf-job/job/xfJobCompany/getRecommendTalentList /xf-job/job/xfJobCompany/izAlreadySubmitCompany
/xf-job/job/xfJobCompanyPosition/checkPositionName /xf-job/job/xfJobCompanyPosition/expired/remind /xf-job/job/xfJobCompanyPosition/getMatchingDegree
/xf-job/job/xfJobCompanyPosition/izHistoryUsePositionList /xf-job/job/xfJobEventReleaseSignUp/listByUserId /xf-job/job/xfJobFair/checkIzShowApplySameNetworkFair
/xf-job/job/xfJobFairApplyInfoPerson/queryMySubscribeFair /xf-job/job/xfJobFormSetting/queryByCode /xf-job/job/xfJobLoanApplyPerson/listForUserCenter
/xf-job/job/xfJobOverseasRecruitRegistration/queryList /xf-job/school/licenseFree/updateScanTimes /xf-job/school/user/getDictValueByCodes
/xf-job/workshop/xfCommonProsperityJobApplyInfo/queryList4UserCenter /xf-oddjob/oddJob/licenseFree/appletShareSurplusJobList
/xf-oddjob/oddJob/licenseFree/callRecord/list /xf-oddjob/oddJob/licenseFree/populaFindJob /xf-oddjob/oddJob/xfOddRecommendRecord/recommendation
/xf-oddjob/oddjob/xfOddUser/Collect`.split(/\s+/)];
// record-lib switchIdentity (also pw-switch-role): the ChangeRole header component's requests (legacy usercenter ChangeRole chunk)
const SWITCH = [["GET", "/xf-job/communal/xfpermission/getUserPermissionByRoleId?roleId=1"], ["GET", "/xf-job/job/xfJobCompany/getCompanyInfo?sysUserId=1"], ["POST", "/xf-job/communal/xfSysUserAuthenticateIdentityItem/queryByCompanyId?companyId=1&businessType=10"]];

// Browser context routed like record-page: test hosts only, /xf-api/ through the guard, the rest "sent" (recorded here).
async function recordingContext(browser, guard) {
  const ctx = await browser.newContext();
  const sent = [];
  await ctx.route("**/*", (r) => {
    const q = r.request(), u = new URL(q.url());
    if (u.pathname === "/") return r.fulfill({ contentType: "text/html", body: "<html><body>page</body></html>" });
    if (/\/xf-api\//.test(q.url()) && guard.route(r)) return;
    sent.push(`${q.method()} ${u.pathname.replace(/^\/xf-api/, "")}`);
    return r.fulfill({ contentType: "application/json", body: '{"success":true,"code":200,"result":{"real":1}}' });
  });
  return { ctx, sent };
}
const call = (page, method, p, body) => page.evaluate(async ([m, url, b]) => (await fetch(url, { method: m, headers: { "content-type": "application/json" }, body: b })).text(), [method, api(p), body ?? null]);

test("denylist: every rule compiles and says why", () => {
  assert.ok(list.deny.length > 10 && list.allow.length > 0);
  // default deny: an allow entry names one endpoint (ends with "$"), never a whole category
  for (const a of list.allow) assert.ok(a.re.source.endsWith("$") && /\/[^/]+\/[^/]+\$$/.test(a.re.source.replaceAll("\\/", "/")), `allow ${a.id} names one endpoint`);
  const dir = mkdtempSync(path.join(os.tmpdir(), "record-guard-"));
  try {
    const f = path.join(dir, "l.json");
    writeFileSync(f, JSON.stringify({ queryShape: { re: "^q", why: "x" }, deny: [{ re: "/add$", why: "" }], allow: [] }));
    assert.throws(() => loadDenylist(f), /without why/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("sumbitImportantCompanyInfo is intercepted and never sent; the query beside it goes out", async () => {
  const browser = await chromium.launch();
  try {
    const guard = writeGuard(list);
    const { ctx, sent } = await recordingContext(browser, guard);
    const page = await ctx.newPage();
    await page.goto(UC + "/");
    assert.equal(await call(page, "POST", SUBMIT, '{"data":"x"}'), INTERCEPTED);
    assert.equal(await call(page, "POST", "/xf-job/job/xfJobCompany/sumbitBaseCompanyInfo", "{}"), INTERCEPTED);
    assert.match(await call(page, "POST", QUERY, "{}"), /"real":1/);
    assert.match(await call(page, "GET", "/xf-job/job/xfJobCompany/queryById?id=1"), /"real":1/);
    assert.deepEqual(sent, [`POST ${QUERY}`, "GET /xf-job/job/xfJobCompany/queryById"]);
    assert.equal(JSON.parse(INTERCEPTED).success, true);
  } finally { await browser.close(); }
});

test("query endpoints are sent: every recorded POST outside the audited writes, and query-shaped names", () => {
  for (const p of RECORDED_POSTS) {
    const c = classify(list, "POST", api(p));
    assert.equal(c.action, DENIED.has(p) ? "intercept" : "send", `${p} → ${JSON.stringify(c)}`);
    assert.ok(!c.unlisted, `${p} is classified (deny, allow or query-shaped), not left to the warning`);
  }
  for (const p of ["/a/b/queryList", "/a/xfJobFair/getFairList", "/a/b/checkPhone", "/a/xfJobCompany/izAlreadySubmitCompany", "/a/b/pageList", "/a/xfJobFairApplyInfo/queryAttendeesPosition", "/a/address/list"])
    assert.equal(classify(list, "POST", api(p)).action, "send", p);
  for (const [m, p] of [["PUT", "/a/b/edit"], ["DELETE", "/a/b/delete"], ["POST", "/a/b/delete"], ["GET", "/a/b/delBatch"], ["POST", "/a/b/cancelCollect"], ["POST", "/a/xfFairEnroll/add"], ["POST", "/a/b/signUp"], ["POST", "/a/b/publishNotice"], ["POST", "/a/b/updateInfo"], ["POST", "/a/b/remove"]])
    assert.equal(classify(list, m, api(p)).action, "intercept", `${m} ${p}`);
  // updateBrowseCount is a write by name, allowed with a reason on the list
  assert.equal(classify(list, "POST", api("/xf-job/job/licenseFree/xfJobFair/updateBrowseCount")).allow, "^/xf-job/job/licenseFree/xfJobFair/updateBrowseCount$");
  // neither listed nor query-shaped: sent, flagged for the warnings
  assert.deepEqual(classify(list, "POST", api("/xf-job/job/xfJobThing/doSomething")), { action: "send", unlisted: true });
});

// Every endpoint the two legacy bundles declare as {url, method} (631 at HM-992).
function legacyEndpoints() {
  const out = new Set();
  const walk = (d) => { for (const f of readdirSync(d)) { const p = path.join(d, f); if (statSync(p).isDirectory()) walk(p); else if (f.endsWith(".js")) for (const m of readFileSync(p, "utf8").matchAll(/url:\s*["`]([^"`]+)["`]\s*,\s*method:\s*["`](\w+)["`]/g)) out.add(m[2].toUpperCase() + " " + m[1].split("?")[0]); } };
  walk(path.join(ROOT, "legacy-dist"));
  return [...out].map((x) => x.split(" "));
}

test("legacy bundles: writes found anywhere in the name are intercepted (GET too), query-verb names never are", () => {
  const eps = legacyEndpoints();
  assert.ok(eps.length > 500, `legacy-dist endpoints: ${eps.length}`);
  for (const [m, p] of eps) {
    if (!/^(?:query|get|list|check|iz|find|search|page|is|has|count|select)/.test(p.split("/").pop())) continue;
    if (m === "DELETE" || m === "PUT") continue;
    const c = classify(list, m, api(p));
    assert.equal(c.action, "send", `${m} ${p} → ${JSON.stringify(c)}`);
  }
  const has = new Set(eps.map(([m, p]) => m + " " + p));
  const must = (m, p, action) => { assert.ok(has.has(m + " " + p), `${m} ${p} still in legacy-dist`); assert.equal(classify(list, m, api(p)).action, action, `${m} ${p}`); };
  for (const p of ["/xf-job/job/xfJobInterviewInvitation/interviewInvitation", "/xf-job/job/xfJobInterviewInvitation/interviewInvitationByFair", "/xf-job/job/xfJobFairApplyInfoPerson/fairSubscribe",
    "/xf-encyclopedia/encyclopedia/xfEncyclopediaSubscribe/unSubscribe", "/xf-job/communal/xfSysQuenaireRecord/staggingOrSubmit", "/xf-college/collegeWqSignDetail/xfCollegeWqSignDetail/notarizeOrRevocationSign",
    "/xf-job/job/xfJobFairApplyInfo/companyPositionAdd", "/xf-job/job/xfJobCompany/companyFileDataUpload", "/xf-job/communal/xfSysAttachment/batchUploadFromUserCenter",
    "/xf-job/job/xfJobCompanyPosition/refreshBatch", "/xf-job/workshop/portal/position/batchPause", "/xf-job/job/xfJobCompanyTalents/restoreTalent", "/xf-job/job/xfJobCompanyExpand/certificationUser",
    "/xf-job/job/licenseFree/xfJobCustomerKnowledgeBase/askQuestion", "/xf-authentication/authentication/licenseFree/companyFileSave", "/xf-oddjob/oddjob/xfOddUser/grounding",
    "/xf-job/communal/xfSysArticlePositionDeliver/lookUpStateUpdate", "/xf-job/school/user/newRegister", "/xf-job/job/xfJobCompanyPosition/expired/noMoreRemindersToday",
    "/xf-job/school/user/login", "/xf-job/school/user/phoneLogin", "/xf-authentication/authentication/licenseFree/forgetPassword"]) must("POST", p, "intercept");
  for (const p of ["/xf-job/communal/xfSysOrderPayRecord/alipay/scanPay", "/xf-job/job/xfJobCurriculumVitae/entrust", "/xf-job/job/xfJobCurriculumVitae/refresh", "/xf-job/job/xfJobCurriculumVitae/refreshByXfUserId", "/xf-job/job/xfJobCompanyCurriculumDownload/downPdf"]) must("GET", p, "intercept");
  // reads whose names carry a write word
  must("GET", "/xf-job/job/xfJobCompany/isPublishingPosition", "send");
  must("GET", "/xf-job/job/xfSysConsult/statics", "send");
});

test("HAR: the intercepted request is marked on the entry record-page writes, and kept out of the sent writes", async () => {
  const browser = await chromium.launch();
  try {
    const guard = writeGuard(list);
    const { ctx } = await recordingContext(browser, guard);
    const entries = [], jobs = [];
    // record-page builds each HAR entry from the requestfinished event's Request: the marking must reach that object
    ctx.on("requestfinished", (req) => { if (!/\/xf-api\//.test(req.url())) return; jobs.push((async () => {
      const res = await req.response();
      entries.push({ request: { method: req.method(), url: req.url() }, response: { status: res.status(), content: { text: await res.text() } }, _phase: "step3", ...guard.harFields(req) });
    })()); });
    const page = await ctx.newPage();
    await page.goto(UC + "/");
    await call(page, "POST", SUBMIT, "{}");
    await call(page, "POST", QUERY, "{}");
    await call(page, "POST", "/xf-job/job/xfJobThing/doSomething", "{}");
    await Promise.all(jobs);
    const sub = entries.find((e) => e.request.url.endsWith(SUBMIT)), q = entries.find((e) => e.request.url.endsWith(QUERY));
    assert.equal(sub._intercepted, true);
    assert.equal(sub._interceptRule, "submit");
    assert.equal(sub.response.content.text, INTERCEPTED);
    assert.equal(q._intercepted, undefined);
    const { writes, intercepted } = splitWrites(entries);
    assert.deepEqual(intercepted, [{ method: "POST", path: SUBMIT, count: 1, phases: ["step3"], statuses: [200], rules: ["submit"] }]);
    assert.deepEqual(writes.map((w) => w.path).sort(), ["/xf-job/job/xfJobCompany/izAlreadySubmitCompany", "/xf-job/job/xfJobThing/doSomething"]);
    assert.deepEqual([...guard.unlisted], ["POST /xf-job/job/xfJobThing/doSomething"]);
  } finally { await browser.close(); }
});

test("gate replay: an intercepted entry answers both sides alike, no request-sequence difference", async () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), "record-guard-"));
  const f = path.join(dir, "p.har");
  const entry = (p, text, extra = {}) => ({ startedDateTime: "2026-10-21T01:00:00.000Z", request: { method: "POST", url: api(p), postData: { text: "{}" } }, response: { status: 200, headers: [{ name: "content-type", value: "application/json" }], content: { text } }, ...extra });
  writeFileSync(f, JSON.stringify({ log: { entries: [entry(QUERY, '{"success":true,"result":false}'), entry(SUBMIT, INTERCEPTED, { _intercepted: true, _interceptRule: "submit" })] } }));
  const har = loadHar(f);
  rmSync(dir, { recursive: true, force: true });
  const browser = await chromium.launch();
  try {
    const side = async (submitBody = "{}") => {
      const ctx = await browser.newContext();
      await ctx.route("http://gate.test/", (r) => r.fulfill({ contentType: "text/html", body: "<html></html>" }));
      const log = [];
      let phase = "load";
      await routeApi(ctx, har, { log: (x) => log.push(x), phase: () => phase });
      const page = await ctx.newPage();
      await page.goto("http://gate.test/");
      phase = "step3";
      const bodies = [];
      for (const p of [QUERY, SUBMIT]) bodies.push(await page.evaluate(async ([u, b]) => (await fetch(u, { method: "POST", headers: { "content-type": "application/json" }, body: b })).text(), ["http://gate.test/xf-api" + p, p === SUBMIT ? submitBody : "{}"]));
      await ctx.close();
      return { log, bodies };
    };
    const orig = await side(), rest = await side();
    assert.deepEqual(orig.bodies, ['{"success":true,"result":false}', INTERCEPTED]);
    assert.deepEqual(orig.log.map((x) => x.tier), ["body", "intercepted"]);
    assert.deepEqual(stepSeq(rest.log, new Set()), stepSeq(orig.log, new Set()));
    assert.deepEqual(rest.bodies, orig.bodies);
    // control: a restored page that submits different parameters is still a difference (the body is compared, not the tier)
    const wrong = await side('{"other":1}');
    assert.equal(wrong.log[1].tier, "intercepted");
    assert.notDeepEqual(stepSeq(wrong.log, new Set()), stepSeq(orig.log, new Set()));
  } finally { await browser.close(); }
});

test("identity switch (switchIdentity / pw-switch-role) requests are never intercepted", async () => {
  // pinned by allow entries, so a broader deny rule can never catch them
  for (const [m, p] of SWITCH) assert.ok(classify(list, m, api(p)).allow, `${m} ${p} is on the allow list`);
  const all = { ...list, deny: [{ id: "everything", re: /./, words: null, methods: null, exceptQuery: false }] };
  for (const [m, p] of SWITCH) assert.equal(classify(all, m, api(p)).action, "send", `${m} ${p} with a deny-everything list`);
  const browser = await chromium.launch();
  try {
    const guard = writeGuard(list);
    const { ctx, sent } = await recordingContext(browser, guard);
    const page = await ctx.newPage();
    await page.goto(UC + "/");
    for (const [m, p] of SWITCH) assert.match(await call(page, m, p, m === "GET" ? undefined : "{}"), /"real":1/);
    assert.equal(sent.length, SWITCH.length);
    assert.equal(guard.unlisted.size, 0);
  } finally { await browser.close(); }
});
