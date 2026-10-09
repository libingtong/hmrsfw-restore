# 导入提示：page.portal.talents.cityHome.index

原 chunk `index.178332063620094.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `Re` | index.1783320636200.js | entry | @/legacy `getAppConfig` | `()=>{let e=sessionStorage.getItem("appConfig")?sessionStorage.getItem("appConfig"):document.getElementsByTagName("head")[0].getAttribute("data-config");return JSON.parse(e)}` |
| `R` | index.1783320636200.js | entry | @/legacy `userStorage` | `{keys:!0,setUser(e){this.keys?localStorage.setItem(jn.USER_INFO,e):localStorage.setItem(jn.USER_INFO,JSON.stringify(e))},getUser(){const e=localStorage.getItem(jn.USER_INFO);if(e&&e!="undefined"&&e!="` |
| `We` | index.1783320636200.js | api | @/legacy/api `listForWebsite` | `e=>ut.request({url:"/xf-job/job/licenseFree/xfJobPxCourse/listForWebsite",method:"get",params:e})` |
| `qe` | index.1783320636200.js | entry | @/legacy/api `queryHomeSettingById` | `e=>IN("/xf-job/job/licenseFree/queryHomeSettingById",e,"post")` |
| `De` | index.1783320636200.js | api | @/legacy/api `queryLatestQuestionsList` | `e=>ut.request({url:"/xf-job/job/licenseFree/xfJobCustomerKnowledgeBase/queryLatestQuestionsList",method:"post",params:e})` |
| `Ge` | index.1783320636200.js | api | @/legacy/api `queryQuestionsList` | `e=>ut.request({url:"/xf-job/job/licenseFree/xfJobCustomerKnowledgeBase/queryQuestionsList",method:"post",params:e})` |
| `Xe` | index.1783320636200.js | api | @/legacy/api `getArticleListByCode` | `e=>ut.request({url:"/xf-job/job/licenseFree/getArticleListByCode",method:"get",params:e})` |
| `je` | index.1783320636200.js | entry | @/legacy `useStore` | `function(e){return e===void 0&&(e=null),Ft(e!==null?e:Ru)}` |
| `Je` | index.1783320636200.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `Oe` | index.1783320636200.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `Ee` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `pa` | empty.1783320636200.js | shared | @/shared/empty.vue `default` | `x(i,[["render",s],["__scopeId","data-v-810a04d0"]])` |
| `_a` | talentArea.1783320636200.js | api | @/views/talents/cityHome/talentArea.vue `default` | `l=>x.request({url:"/xf-job/job/licenseFree/findJobList",method:"post",params:l})` |
| `ya` | talentArea.1783320636200.js | api | @/views/talents/cityHome/talentArea.vue `default` | `l=>x.request({url:"/xf-job/job/licenseFree/xfJobCurriculumVitae/searchListForWebsite",method:"get",params:l})` |
| `va` | talentArea.1783320636200.js | shared | @/views/talents/cityHome/talentArea.vue `default` | `_e(G,[["__scopeId","data-v-c45867e5"]])` |
| `ba` | adsCenter.1783320636200.js | shared | @/shared/adsCenter.vue `default`（reserved） | `W(m,[["__scopeId","data-v-25c7a495"]])` |
| `za` | homeRight.1783320636200.js | shared | @/shared/homeRight.vue `default`（reserved） | `te(X,[["__scopeId","data-v-85da16f2"]])` |
| `Ta` | index.api.178332063620014.js | api | @/api/article `freeCompanyList` | `e=>s.request({url:"/xf-job/job/licenseFree/freeCompanyList",method:"post",params:e})` |
