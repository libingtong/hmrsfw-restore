// node --test tools/test/api-inventory.test.mjs
// Parsers behind tools/api-inventory.mjs on synthetic inputs: bundle chunks (api module, namespace export, enum url,
// helper call, conditional url, `$sm2`), a Java tree (mappings, annotated fields, WRITE_ONLY, generics, services) and
// HAR shapes.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { scanSite, normPath } from "../lib/apiinv-frontend.mjs";
import { scanBackend } from "../lib/apiinv-backend.mjs";
import { shapeOf, mergeShape } from "../lib/apiinv-har.mjs";

const tmp = () => mkdtempSync(path.join(os.tmpdir(), "apiinv-"));
const put = (root, rel, text) => { const f = path.join(root, rel); mkdirSync(path.dirname(f), { recursive: true }); writeFileSync(f, text); };

test("normPath strips origin, gateway prefix, query and stray spaces", () => {
  assert.equal(normPath("https://h.example/xf-api/xf-job/a/b?x=1"), "/xf-job/a/b");
  assert.equal(normPath("xf-job//a/b "), "/xf-job/a/b");
});

test("frontend: api module exports, call-site keys, namespace export, enum, helper, conditional url, $sm2", () => {
  const dir = tmp();
  try {
    put(dir, "assets/index.api.1.js", 'import{z as a}from"./index.1.js";const f=e=>a.request({url:"/xf-job/job/list",method:"post",params:e}),g=e=>a.request({url:e.id?"/xf-job/job/edit":"/xf-job/job/add",method:"post",data:e}),h=e=>a.request({url:"/xf-job/job/save",method:"post",data:e});export{f as a,g as b,h as c};');
    put(dir, "assets/ns.1.js", 'const s=e=>o.request({url:"/xf-job/ns/one",method:"get",params:e}),b=Object.freeze(Object.defineProperty({__proto__:null,one:s},Symbol.toStringTag,{value:"Module"})),_=p({},b);export{_ as o};');
    put(dir, "assets/page.1.js", 'import{a as X,b as Y,c as W}from"./index.api.1.js";import{o as N}from"./ns.1.js";const q=r({pageNo:1,pageSize:10});q.value.keyword="";X(q.value);const v=Object.assign({},u);v.extra=1;Y(v);W({data:this.$sm2({name:1,idCard:2})});N.one({id:1});');
    put(dir, "assets/index.1.js", 'var L=(e=>(e.logout="/jeecg-system/sys/logout",e))(L||{});const t=e=>z.request({url:L.logout,method:"get",params:e}),k=e=>IN("/xf-job/home/byId",e,"post");export{t as l,k as m};');
    const { chunks } = scanSite({ site: "portal", dir, apiPrefix: "/xf-api/" });
    const api = chunks["index.api.1.js"].apiFns;
    assert.deepEqual(api.map((f) => `${f.exported} ${f.method} ${f.path}`).sort(), ["a POST /xf-job/job/list", "b POST /xf-job/job/add", "b POST /xf-job/job/edit", "c POST /xf-job/job/save"]);
    assert.ok(api.every((f) => f.passThrough));
    const uses = chunks["page.1.js"].imports;
    const call = (name) => uses.find((u) => u.imported === name && u.kind === "call");
    assert.deepEqual(call("a").keys.sort(), ["keyword", "pageNo", "pageSize"]);
    assert.equal(call("b").resolved, "partial"); // Object.assign({}, u): u is unknown
    assert.deepEqual([call("c").sm2, call("c").keys.sort()], [true, ["idCard", "name"]]);
    assert.deepEqual(call("o.one").keys, ["id"]);
    assert.deepEqual(chunks["ns.1.js"].apiFns.map((f) => f.exported), ["o.one"]);
    const entry = chunks["index.1.js"].apiFns.map((f) => `${f.exported} ${f.method} ${f.path}`).sort();
    assert.deepEqual(entry, ["l GET /jeecg-system/sys/logout", "m POST /xf-job/home/byId"]);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("backend: services, mappings, params, Jackson view of DTOs", () => {
  const root = tmp();
  try {
    put(root, "services/xf-job/xf-job-app/src/main/resources/application.yml", "server:\n  port: 1\nspring:\n  application:\n    name: xf-job\n");
    put(root, "services/xf-job/xf-job-app/pom.xml", "<artifactId>jeecg-boot-base-core</artifactId>");
    put(root, "platform/core/src/main/java/org/x/Result.java", "package org.x;\npublic class Result<T> {\n   private boolean success;\n   private T result;\n   public boolean isSuccess() { return success; }\n   public T getResult() { return result; }\n}\n");
    put(root, "services/xf-job/xf-job-api/src/main/java/org/x/Item.java", 'package org.x;\npublic class Item extends Base {\n   @ApiModelProperty("name (a)")\n   private String name;\n   @JsonProperty(access = Access.WRITE_ONLY)\n   private String secretNote;\n   private Integer coordinateSystem;\n   public String getName() { return name; }\n   public String getSecretNote() { return secretNote; }\n   public Integer getCoordinateSystem() { return coordinateSystem; }\n   public void setName(String n) { this.name = n; }\n}\n');
    put(root, "services/xf-job/xf-job-api/src/main/java/org/x/Base.java", "package org.x;\npublic class Base {\n   private String id;\n   public String getId() { return id; }\n}\n");
    put(root, "services/xf-job/xf-job-biz/src/main/java/org/x/ItemController.java", [
      "package org.x;", "import java.util.List;",
      '@RestController', '@RequestMapping({"/job/item"})', "public class ItemController {",
      '   @PostMapping("/list")', '   public Result<IPage<Item>> list(Item item, @RequestParam(name = "pageNo", defaultValue = "1") Integer pageNo, HttpServletRequest req) {', '      String k = req.getParameter("keyword");', "      return null;", "   }",
      '   @IgnoreAuth', '   @RequestMapping(value = "/one/{id}", method = {RequestMethod.GET, RequestMethod.POST})', '   public Result<List<Item>> one(@PathVariable("id") String id, @RequestBody Item body) { return null; }',
      "}"].join("\n"));
    const be = scanBackend(root);
    assert.deepEqual(be.groups.map((g) => g.service), ["xf-job"]);
    const list = be.endpoints.find((e) => e.path === "/xf-job/job/item/list");
    assert.deepEqual(list.methods, ["POST"]);
    assert.equal(list.auth, "jwt");
    assert.deepEqual(list.params.find((p) => p.in === "model").props, ["coordinateSystem", "id", "name", "secretNote"]);
    assert.deepEqual(list.requestParamsInBody, ["keyword"]);
    const rows = list.returnShape.keys.result.keys.records.items.keys;
    assert.deepEqual(Object.keys(rows).sort(), ["coordinateSystem", "id", "name"]); // WRITE_ONLY dropped, inherited id kept
    assert.equal(rows.coordinateSystem.type, "number");
    const one = be.endpoints.find((e) => e.path === "/xf-job/job/item/one/{id}");
    assert.deepEqual([one.methods, one.auth, one.body.type, one.params[0].in], [["GET", "POST"], "anon:@IgnoreAuth", "Item", "path"]);
    assert.equal(one.returnShape.keys.result.type, "array");
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("har shapes keep keys and types only, and merge across samples", () => {
  const a = shapeOf({ success: true, result: { records: [{ id: "1", n: null }], total: 3 } });
  const b = shapeOf({ success: true, result: { records: [{ id: "2", n: 5, extra: "x" }], total: 4 } });
  const m = mergeShape(a, b);
  const rec = m.keys.result.keys.records.items.keys;
  assert.deepEqual(Object.keys(rec).sort(), ["extra", "id", "n"]);
  assert.deepEqual(rec.n.types, ["null", "number"]);
  assert.ok(!JSON.stringify(m).includes('"1"') && !JSON.stringify(m).includes("x\""), "no values in a shape");
});
