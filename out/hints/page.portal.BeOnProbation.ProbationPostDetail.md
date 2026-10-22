# 导入提示：page.portal.BeOnProbation.ProbationPostDetail

原 chunk `ProbationPostDetail.1783320636200.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `Be` | index.1783320636200.js | entry | @/legacy `userStorage` | `{keys:!0,setUser(e){this.keys?localStorage.setItem(jn.USER_INFO,e):localStorage.setItem(jn.USER_INFO,JSON.stringify(e))},getUser(){const e=localStorage.getItem(jn.USER_INFO);if(e&&e!="undefined"&&e!="` |
| `Ce` | index.1783320636200.js | api | @/legacy `getSettingValueByCode` | `e=>ut.request({url:"/xf-job/job/licenseFree/xfSysBusinessSetting/getSettingValueByCode",method:"get",params:e})` |
| `Ne` | index.1783320636200.js | entry | @/legacy `LoginModal`（reserved） | `mt(nne,[["__scopeId","data-v-6ac82971"]])` |
| `qe` | index.1783320636200.js | entry | @/legacy `checkLogin` | `function(e,t,n,r){const a=Ze.getUser(),o=Ze.getCorp();return console.log("\u5224\u65AD\u5F53\u524D\u8D26\u53F7\u662F\u5426\u767B\u5F55token",Ze.getToken(),a,o),new Promise((i,l)=>{if(!Ze.getToken()){i` |
| `De` | index.1783320636200.js | entry | @/legacy `TEXT_GO_AUTH` | `"\u53BB\u8BA4\u8BC1"` |
| `Ye` | index.1783320636200.js | entry | @/legacy `MSG_PERFECT_PERSONAL` | `"\u5F53\u524D\u8D26\u6237\u672A\u5B8C\u5584\u4E2A\u4EBA\u4FE1\u606F\uFF0C\u8BF7\u5148\u5B8C\u5584\u4E2A\u4EBA\u4FE1\u606F"` |
| `Pe` | index.1783320636200.js | entry | @/legacy `IDENTITY_OTHER` | `2` |
| `Y` | index.1783320636200.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:Ut(O_e(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,t){va` |
| `Ae` | index.1783320636200.js | entry | @/legacy `openUserCenter` | `(e,t)=>{let n=rr.getters.userUrl;t=t\|\|"_blank",n&&n.charAt(n.length-1)==="/"&&(n=n.slice(0,-1)),window.open(n+"/autoLogin?toPath="+encodeURIComponent(e)+"&token="+Ze.getToken(),t)}` |
| `P` | index.1783320636200.js | entry | dayjs `default` | `Rk(Owe)` |
| `Me` | index.1783320636200.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `Re` | index.1783320636200.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `je` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `Se` | index.api.1783320636200.js | api | @/api/api-1783320636200 `freePositionDetail` | `e=>s.request({url:"/xf-job/job/licenseFree/freePositionDetail",method:"post",params:e})` |
| `Ve` | index.api.1783320636200.js | api | @/api/api-1783320636200 `freeCompanyDetailById` | `e=>s.request({url:"/xf-job/job/licenseFree/freeCompanyDetailById",method:"post",params:e})` |
| `ze` | index.api.1783320636200.js | api | @/api/api-1783320636200 `freeDetailById` | `e=>s.request({url:"/xf-job/job/licenseFree/freeDetailById",method:"post",params:e})` |
| `Oe` | index.api.17833206362002.js | api | @/api/api-17833206362002 `queryIzCanDeliver` | `e=>a.request({url:"/xf-job/job/xfJobCurriculumVitae/queryIzCanDeliver",method:"get",params:e})` |
| `Ee` | resumemodal.1783320636200.js | shared | @/shared/resumemodal.vue `default` | `D(r,[["__scopeId","data-v-30d15804"]])` |
