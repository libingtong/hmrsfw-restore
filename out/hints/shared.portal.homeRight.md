# 导入提示：shared.portal.homeRight

原 chunk `homeRight.1783320636200.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `ie` | index.1783320636200.js | entry | @/legacy `getAppConfig` | `()=>{let e=sessionStorage.getItem("appConfig")?sessionStorage.getItem("appConfig"):document.getElementsByTagName("head")[0].getAttribute("data-config");return JSON.parse(e)}` |
| `Ae` | index.1783320636200.js | api | @/legacy/api `getArticleListByCode`（reserved） | `e=>ut.request({url:"/xf-job/job/licenseFree/getArticleListByCode",method:"get",params:e})` |
| `le` | index.1783320636200.js | entry | @/legacy `FeedbackModal` | `mt(vie,[["__scopeId","data-v-150e31b0"]])` |
| `oe` | index.1783320636200.js | entry | @/legacy `LoginModal`（reserved） | `mt(nne,[["__scopeId","data-v-6ac82971"]])` |
| `ae` | index.1783320636200.js | entry | @/legacy `userStorage` | `{keys:!0,setUser(e){this.keys?localStorage.setItem(jn.USER_INFO,e):localStorage.setItem(jn.USER_INFO,JSON.stringify(e))},getUser(){const e=localStorage.getItem(jn.USER_INFO);if(e&&e!="undefined"&&e!="` |
| `se` | index.1783320636200.js | api | @/legacy/api `queryAllInfoById`（reserved） | `e=>ut.request({url:"/xf-job/job/licenseFree/xfJobCustomerPageSettings/queryAllInfoById",method:"get",params:e})` |
| `te` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
