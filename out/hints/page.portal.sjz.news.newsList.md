# 导入提示：page.portal.sjz.news.newsList

原 chunk `newsList.17833206362003.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `F` | index.api.178332063620018.js | api | @/api/child `getArticleTypeById` | `e=>l.request({url:"/xf-job/job/licenseFree/getArticleTypeById",method:"post",params:e})` |
| `G` | index.api.178332063620018.js | api | @/api/child `getChildArticleTypeList` | `e=>l.request({url:"/xf-job/job/licenseFree/getChildArticleTypeList",method:"post",params:e})` |
| `H` | index.api.178332063620018.js | api | @/api/child `getArticleList` | `e=>l.request({url:"/xf-job/job/licenseFree/getArticleList",method:"get",params:e})` |
| `pe` | empty.1783320636200.js | shared | @/shared/empty.vue `default` | `x(i,[["render",s],["__scopeId","data-v-810a04d0"]])` |
| `fe` | index.1783320636200.js | entry | @/legacy `getAppConfig` | `()=>{let e=sessionStorage.getItem("appConfig")?sessionStorage.getItem("appConfig"):document.getElementsByTagName("head")[0].getAttribute("data-config");return JSON.parse(e)}` |
| `Y` | index.1783320636200.js | entry | @/legacy `getDictItemsByCode` | `e=>IN("/jeecg-system/sys/dict/getDictItemsByCode",e,"get")` |
| `ve` | index.1783320636200.js | entry | @/legacy `openArticle` | `(e,t,n)=>{if(e.keywords&&e.keywords.indexOf("toUserCenter-")!=-1){const a=XMt(e.keywords,"toUserCenter-");console.log(a),Dt(a);return}let r=window.location.host;if(e.linkAddress)String(e.linkAddress).` |
| `ge` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
