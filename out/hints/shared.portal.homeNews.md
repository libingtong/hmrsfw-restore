# 导入提示：shared.portal.homeNews

原 chunk `homeNews.17833206362002.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `as` | index.1783320636200.js | entry | @/legacy `getAppConfig` | `()=>{let e=sessionStorage.getItem("appConfig")?sessionStorage.getItem("appConfig"):document.getElementsByTagName("head")[0].getAttribute("data-config");return JSON.parse(e)}` |
| `ns` | index.1783320636200.js | api | @/legacy `getArticleListByTypeIds` | `e=>ut.request({url:"/xf-job/job/licenseFree/getArticleListByTypeIds",method:"post",params:e})` |
| `ds` | index.1783320636200.js | entry | @/legacy `useStore` | `function(e){return e===void 0&&(e=null),Ft(e!==null?e:Ru)}` |
| `cs` | index.1783320636200.js | api | @/legacy `getArticleList` | `e=>ut.request({url:"/xf-job/job/licenseFree/getArticleList",method:"get",params:e})` |
| `P` | index.1783320636200.js | entry | @/legacy `openArticle` | `(e,t,n)=>{if(e.keywords&&e.keywords.indexOf("toUserCenter-")!=-1){const a=XMt(e.keywords,"toUserCenter-");console.log(a),Dt(a);return}let r=window.location.host;if(e.linkAddress)String(e.linkAddress).` |
| `O` | index.1783320636200.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `Q` | index.1783320636200.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `V` | index.1783320636200.js | entry | dayjs `default` | `Rk(Owe)` |
| `os` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `z` | empty.1783320636200.js | shared | @/shared/empty.vue `default` | `x(i,[["render",s],["__scopeId","data-v-810a04d0"]])` |
