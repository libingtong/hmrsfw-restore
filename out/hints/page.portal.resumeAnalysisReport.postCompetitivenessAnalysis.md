# 导入提示：page.portal.resumeAnalysisReport.postCompetitivenessAnalysis

原 chunk `postCompetitivenessAnalysis.1783320636200.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `ne` | index.1783320636200.js | entry | @/legacy `getAppConfig` | `()=>{let e=sessionStorage.getItem("appConfig")?sessionStorage.getItem("appConfig"):document.getElementsByTagName("head")[0].getAttribute("data-config");return JSON.parse(e)}` |
| `oe` | index.1783320636200.js | entry | @/legacy `userStorage` | `{keys:!0,setUser(e){this.keys?localStorage.setItem(jn.USER_INFO,e):localStorage.setItem(jn.USER_INFO,JSON.stringify(e))},getUser(){const e=localStorage.getItem(jn.USER_INFO);if(e&&e!="undefined"&&e!="` |
| `re` | index.1783320636200.js | entry | @/legacy `getDictItemsByCode` | `e=>IN("/jeecg-system/sys/dict/getDictItemsByCode",e,"get")` |
| `ce` | index.1783320636200.js | api | @/legacy/api `getArticleListNoCheck`（reserved） | `e=>ut.request({url:"/xf-job/job/licenseFree/getArticleListNoCheck",method:"post",params:e})` |
| `ve` | index.1783320636200.js | entry | @/legacy `LoginModal`（reserved） | `mt(nne,[["__scopeId","data-v-6ac82971"]])` |
| `q` | index.1783320636200.js | entry | @/legacy `openUserCenter` | `(e,t)=>{let n=rr.getters.userUrl;t=t\|\|"_blank",n&&n.charAt(n.length-1)==="/"&&(n=n.slice(0,-1)),window.open(n+"/autoLogin?toPath="+encodeURIComponent(e)+"&token="+Ze.getToken(),t)}` |
| `S` | index.1783320636200.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `j` | index.1783320636200.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `pe` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `fe` | empty.1783320636200.js | shared | @/shared/empty.vue `default` | `x(i,[["render",s],["__scopeId","data-v-810a04d0"]])` |
| `he` | statusPlace.1783320636200.js | shared | @/shared/statusPlace.vue `default`（reserved） | `q(e,[["__scopeId","data-v-aada8b76"]])` |
| `ke` | index.api.178332063620033.js | api | @/api/api-178332063620033 `queryForCompetitiveAnalysis` | `e=>o.request({url:"/xf-job/job/xfJobCurriculumVitae/queryForCompetitiveAnalysis",method:"get",params:e})` |
| `ge` | index.api.178332063620033.js | api | @/api/api-178332063620033 `recommendJobList` | `e=>o.request({url:"/xf-job/job/licenseFree/xfJobCompanyPosition/recommendJobList",method:"post",params:e})` |
