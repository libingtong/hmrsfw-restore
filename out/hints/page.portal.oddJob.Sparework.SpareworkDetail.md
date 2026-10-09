# 导入提示：page.portal.oddJob.Sparework.SpareworkDetail

原 chunk `SpareworkDetail.1783320636200.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `pe` | index.1783320636200.js | entry | @/legacy `userStorage` | `{keys:!0,setUser(e){this.keys?localStorage.setItem(jn.USER_INFO,e):localStorage.setItem(jn.USER_INFO,JSON.stringify(e))},getUser(){const e=localStorage.getItem(jn.USER_INFO);if(e&&e!="undefined"&&e!="` |
| `ye` | index.1783320636200.js | api | @/legacy `getSettingValueByCode` | `e=>ut.request({url:"/xf-job/job/licenseFree/xfSysBusinessSetting/getSettingValueByCode",method:"get",params:e})` |
| `be` | index.1783320636200.js | entry | @/legacy `LoginModal`（reserved） | `mt(nne,[["__scopeId","data-v-6ac82971"]])` |
| `ve` | index.1783320636200.js | entry | @/legacy `checkLogin` | `function(e,t,n,r){const a=Ze.getUser(),o=Ze.getCorp();return console.log("\u5224\u65AD\u5F53\u524D\u8D26\u53F7\u662F\u5426\u767B\u5F55token",Ze.getToken(),a,o),new Promise((i,l)=>{if(!Ze.getToken()){i` |
| `xe` | index.1783320636200.js | entry | @/legacy `TEXT_GO_PERFECT` | `"\u53BB\u5B8C\u5584"` |
| `_e` | index.1783320636200.js | entry | @/legacy `MSG_PERFECT_PERSONAL` | `"\u5F53\u524D\u8D26\u6237\u672A\u5B8C\u5584\u4E2A\u4EBA\u4FE1\u606F\uFF0C\u8BF7\u5148\u5B8C\u5584\u4E2A\u4EBA\u4FE1\u606F"` |
| `ge` | index.1783320636200.js | entry | @/legacy `IDENTITY_OTHER` | `2` |
| `he` | index.1783320636200.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `ke` | index.1783320636200.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `Te` | index.1783320636200.js | entry | @/legacy/utils `maskName`（reserved） | `function(e){if(e!=null&&e!=null){if(e.length==2)return e.substring(0,1)+"*";if(e.length==3\|\|e.length>3)return e.substring(0,1)+"**"}else return""}` |
| `we` | index.1783320636200.js | entry | @/legacy/utils `maskPhone`（reserved） | `e=>e?String(e).replace(/^(.{3})(?:\w+)(.{4})$/,"$1****$2"):""` |
| `Be` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `Oe` | index.api.178332063620024.js | api | @/api/api-24 `findJobQueryById` | `e=>o.request({url:"/xf-oddjob/oddJob/licenseFree/findJobQueryById",method:"get",params:e})` |
| `Fe` | complaint.1783320636200.js | shared | @/shared/complaint.vue `default`（reserved） | `$(_,[["__scopeId","data-v-78e7da48"]])` |
