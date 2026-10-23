# 导入提示：page.portal.talents.information.newsList

原 chunk `newsList.17833206362004.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `le` | index.api.178332063620040.js | api | @/api/scan `getArticleTypeByCode`（reserved） | `e=>s.request({url:"/xf-job/job/licenseFree/getArticleTypeByCode",method:"post",params:e})` |
| `ie` | index.api.178332063620040.js | api | @/api/scan `getArticleList`（reserved） | `e=>s.request({url:"/xf-job/job/licenseFree/getArticleList",method:"get",params:e})` |
| `ce` | index.1783320636200.js | entry | @/legacy `getAppConfig` | `()=>{let e=sessionStorage.getItem("appConfig")?sessionStorage.getItem("appConfig"):document.getElementsByTagName("head")[0].getAttribute("data-config");return JSON.parse(e)}` |
| `A` | index.1783320636200.js | entry | @/legacy `getDictItemsByCode` | `e=>IN("/jeecg-system/sys/dict/getDictItemsByCode",e,"get")` |
| `oe` | index.1783320636200.js | api | @/legacy/api `getChildArticleTypeListByCode`（reserved） | `e=>ut.request({url:"/xf-job/job/licenseFree/getChildArticleTypeListByCode",method:"post",params:e})` |
| `re` | index.1783320636200.js | entry | @/legacy/utils `openLink`（reserved） | `(e,t,n)=>{let r=window.location.host;if(e.linkAddress)String(e.linkAddress).includes(r)?window.open(e.linkAddress):e.linkAddress.includes("www")\|\|e.linkAddress.includes("http")?window.open("/outLink?l` |
| `ue` | index.1783320636200.js | api | @/legacy/api `getArticleListByCode`（reserved） | `e=>ut.request({url:"/xf-job/job/licenseFree/getArticleListByCode",method:"get",params:e})` |
| `me` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `pe` | empty.1783320636200.js | shared | @/shared/empty.vue `default` | `x(i,[["render",s],["__scopeId","data-v-810a04d0"]])` |
