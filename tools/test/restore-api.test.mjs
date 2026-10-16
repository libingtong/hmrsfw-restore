// node --test tools/test/restore-api.test.mjs
// parseApiChunk() (tools/restore-api.mjs) on synthetic chunks shaped like the real index.api.*.js: a ";" or "}" inside a
// request header or another string must not cut a config short (HM-29: api-56.ts had lost both `downPdf`), conditional
// and concatenated urls, the export table, and the CLI output on the real chunk.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseApiChunk, nameFromUrl, copySource } from "../restore-api.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const HEADER = 'headers:{"Content-Type":"application/json; application/octet-stream"}';
const chunk = [
  'import{w as t}from"./index.1.js";',
  'const r=e=>t.request({url:"/xf-job/job/xfJobCurriculumVitae/queryVoById",method:"get",params:e}),',
  `F=e=>t.request({url:"/xf-job/job/xfJobCurriculumVitae/downPdf",method:"get",responseType:"blob",${HEADER},params:e}),`,
  'k=e=>t.request({url:"/xf-job/job/xfJobInterviewInvite/list",method:"post",data:e}),',
  `se=e=>t.request({url:"/xf-job/job/xfJobCompanyCurriculumDownload/downPdf",method:"get",responseType:"blob",${HEADER},params:e}),`,
  'c=e=>t.request({url:e.id?"/xf-college/x/edit":"/xf-college/x/add",method:"post",data:e}),',
  'd=e=>t.request({url:"/xf-job/x/remove?id="+e.id,method:"delete"}),',
  'g=(e,o)=>{return t.request({url:`/xf-job/x/${e}/detail`,method:"get",params:o})},',
  'b=e=>t.request({url:"/xf-job/x/note",method:"post",data:{text:"a;b}c",sep:";"}});',
  "const z=1;",
  "export{F as a,c as b,d as c,g as d,k as e,r as f,se as g,b as h,z as i};",
].join("");

test("a ';' inside a request header does not truncate the function or the ones after it", () => {
  const { fns, exportCount } = parseApiChunk(chunk);
  assert.deepEqual(fns.map((f) => f.local), ["r", "F", "k", "se", "c", "d", "g", "b"]);
  assert.equal(exportCount, 9);
  const byLocal = Object.fromEntries(fns.map((f) => [f.local, f]));
  for (const l of ["F", "se"]) {
    assert.equal(byLocal[l].method, "get");
    assert.ok(byLocal[l].cfg.includes(HEADER), `${l}: header kept verbatim`);
    assert.ok(byLocal[l].cfg.endsWith(",params:e}"), `${l}: config ends after the header`);
  }
  // same last segment → numbered in source order, like every other duplicate name
  assert.deepEqual([byLocal.F.name, byLocal.se.name], ["downPdf", "downPdf2"]);
  assert.deepEqual([byLocal.F.exported, byLocal.se.exported], ["a", "g"]);
  assert.equal(byLocal.k.name, "list");
  assert.equal(byLocal.b.cfg, '{url:"/xf-job/x/note",method:"post",data:{text:"a;b}c",sep:";"}}');
});

test("conditional, concatenated and template urls; parameters and block bodies", () => {
  const byLocal = Object.fromEntries(parseApiChunk(chunk).fns.map((f) => [f.local, f]));
  assert.deepEqual([byLocal.c.url, byLocal.c.name], ["/xf-college/x/edit", "edit"]);
  assert.deepEqual([byLocal.d.url, byLocal.d.name, byLocal.d.method], ["/xf-job/x/remove?id=", "remove", "delete"]);
  assert.deepEqual([byLocal.g.url, byLocal.g.name, byLocal.g.params], ["/xf-job/x/${}/detail", "x", "e,o"]);
  assert.equal(byLocal.r.params, "e");
});

test("non-request functions and helper calls are not request functions", () => {
  const { fns } = parseApiChunk('const a=e=>t.get({url:"/xf-job/a"}),b=e=>IN("/xf-job/b",e,"post"),c=e=>t.request(e),d=e=>t.request({method:"get"});export{a,b,c,d};');
  assert.deepEqual(fns, []);
});

test("nameFromUrl: last segment, non-word characters, reserved words", () => {
  assert.equal(nameFromUrl("/xf-job/a/query-list?x=1"), "query_list");
  assert.equal(nameFromUrl("/xf-job/a/delete"), "deleteItem");
});

test("CLI on the real uc chunk behind api-56.ts writes all 65 functions, both downPdf included", () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), "restore-api-"));
  try {
    const out = path.join(dir, "api-56.ts");
    execFileSync(process.execPath, [path.join(ROOT, "tools/restore-api.mjs"), "uc", "index.api.17516156075456.js", out], { cwd: ROOT, stdio: "pipe" });
    const ts = readFileSync(out, "utf8");
    assert.equal((ts.match(/^export const /gm) ?? []).length, 65);
    assert.ok(ts.includes(`/** 原压缩名 F，导出名 t */\nexport const downPdf = (e) => request({url:"/xf-job/job/xfJobCurriculumVitae/downPdf",method:"get",responseType:"blob",${HEADER},params:e});`));
    assert.ok(ts.includes(`/** 原压缩名 se，导出名 aa */\nexport const downPdf2 = (e) => request({url:"/xf-job/job/xfJobCompanyCurriculumDownload/downPdf",method:"get",responseType:"blob",${HEADER},params:e});`));
    const map = JSON.parse(readFileSync(out.replace(/\.ts$/, ".map.json"), "utf8"));
    assert.deepEqual([map.t, map.aa], ["downPdf", "downPdf2"]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// HM-50: `export{_ as o}` with `_=p({},b)` — p is esbuild's __spreadValues, b the namespace object of six request
// functions, declared inside the top-level-await wrapper and assigned in its async body (index.1783320636200117.js)
const SPREAD = "var d=(s,a,t)=>a in s?U(s,a,{enumerable:!0,configurable:!0,writable:!0,value:t}):s[a]=t,p=(s,a)=>{for(var t in a||(a={}))z.call(a,t)&&d(s,t,a[t]);if(f)for(var t of f(a))R.call(a,t)&&d(s,t,a[t]);return s};";
const nsChunk = (members, { exported = true, copy = "p({},b)" } = {}) => [
  SPREAD, 'import{z as o}from"./index.1.js";let i,_,A=Promise.resolve().then(()=>{let s,a,b,w;',
  's=e=>o.request({url:"/xf-job/job/xfJobCompany/queryCompanyInfo",method:"post",params:e}),',
  'a=e=>o.request({url:"/job/xfJobCompany/getCompanyInfo",method:"get",params:e}),w=1,',
  `b=Object.freeze(Object.defineProperty({__proto__:null,${members}},Symbol.toStringTag,{value:"Module"})),_=${copy},`,
  'i=e=>o.request({url:"/xf-job/job/xfJobCompanyTalents/addTalent",method:"post",data:e})});',
  `export{i as a${exported ? ",_ as o" : ""}};`,
].join("");

test("an exported spread copy of a namespace of request functions is a namespace copy, keyed like the original", () => {
  const { fns, copies } = parseApiChunk(nsChunk("getCompanyInfo:a,queryCompanyInfo:s"));
  assert.deepEqual(fns.map((f) => f.name), ["queryCompanyInfo", "getCompanyInfo", "addTalent"]);
  assert.deepEqual(copies.map(({ local, exported, namespace, members }) => ({ local, exported, namespace, members })), [{ local: "_", exported: "o", namespace: "b", members: [{ key: "getCompanyInfo", name: "getCompanyInfo" }, { key: "queryCompanyInfo", name: "queryCompanyInfo" }] }]);
  // `{...b}` (no helper) is the same copy
  assert.equal(parseApiChunk(nsChunk("getCompanyInfo:a", { copy: "{...b}" })).copies.length, 1);
});

test("not a namespace copy: a non-function member, an unexported copy, a helper that is not the spread", () => {
  assert.deepEqual(parseApiChunk(nsChunk("getCompanyInfo:a,flag:w")).copies, []);
  assert.deepEqual(parseApiChunk(nsChunk("getCompanyInfo:a", { exported: false })).copies, []);
  assert.deepEqual(parseApiChunk(nsChunk("getCompanyInfo:a", { copy: "d({},b)" })).copies, []);
});

test("CLI on the real portal chunk behind api-117.ts adds `o` after the 22 functions, with the original keys, under its business name (names.portal.json)", () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), "restore-api-"));
  try {
    const out = path.join(dir, "api-117.ts");
    execFileSync(process.execPath, [path.join(ROOT, "tools/restore-api.mjs"), "portal", "index.1783320636200117.js", out], { cwd: ROOT, stdio: "pipe" });
    const ts = readFileSync(out, "utf8");
    assert.equal((ts.match(/^export const /gm) ?? []).length, 23);
    assert.ok(ts.trimEnd().endsWith("/** 原压缩名 _，导出名 o */\nexport const jobCompanyApi = { getCompanyInfo, getRecommendTalentList, izAlreadySubmitCompany, queryCompanyInfo, submitNewGuideCompanyInfo, verifyCompanyInfo };"));
    assert.equal(JSON.parse(readFileSync(out.replace(/\.ts$/, ".map.json"), "utf8")).o, "jobCompanyApi");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("a namespace copy is exported under the registry's business name; the comment keeps the original export name", () => {
  const [c] = parseApiChunk(nsChunk("getCompanyInfo:a,queryCompanyInfo:s")).copies;
  const ts = copySource(c, "", "jobCompanyApi");
  assert.match(ts, /\/\*\* 原压缩名 _，导出名 o \*\/\nexport const jobCompanyApi = \{ getCompanyInfo, queryCompanyInfo \};$/);
  assert.match(copySource(c), /export const o = \{/, "without a name: the original export name");
});
