# 导入提示：shared.portal.homeNews3

原 chunk `homeNews.17833206362003.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `ve` | index.1783320636200.js | entry | @/legacy `getAppConfig` | `()=>{let e=sessionStorage.getItem("appConfig")?sessionStorage.getItem("appConfig"):document.getElementsByTagName("head")[0].getAttribute("data-config");return JSON.parse(e)}` |
| `Ie` | index.1783320636200.js | entry | @/legacy `useStore` | `function(e){return e===void 0&&(e=null),Ft(e!==null?e:Ru)}` |
| `ke` | index.1783320636200.js | api | @/legacy `getArticleList` | `e=>ut.request({url:"/xf-job/job/licenseFree/getArticleList",method:"get",params:e})` |
| `Le` | index.1783320636200.js | api | @/legacy/api `getArticleListByTypeCodes`（reserved） | `e=>ut.request({url:"/xf-job/job/licenseFree/getArticleListByTypeCodes",method:"post",params:e})` |
| `Ae` | index.1783320636200.js | api | @/legacy `getArticleListByTypeIds` | `e=>ut.request({url:"/xf-job/job/licenseFree/getArticleListByTypeIds",method:"post",params:e})` |
| `K` | index.1783320636200.js | entry | @/legacy/utils `openLink`（reserved） | `(e,t,n)=>{let r=window.location.host;if(e.linkAddress)String(e.linkAddress).includes(r)?window.open(e.linkAddress):e.linkAddress.includes("www")\|\|e.linkAddress.includes("http")?window.open("/outLink?l` |
| `xe` | index.1783320636200.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `_e` | index.1783320636200.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `Ne` | index.1783320636200.js | entry | dayjs `default` | `Rk(Owe)` |
| `be` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `Re` | empty.1783320636200.js | shared | @/shared/empty.vue `default` | `x(i,[["render",s],["__scopeId","data-v-810a04d0"]])` |
