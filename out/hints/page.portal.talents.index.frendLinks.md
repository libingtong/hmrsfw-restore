# 导入提示：page.portal.talents.index.frendLinks

原 chunk `frendLinks.17833206362002.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `J` | index.1783320636200.js | entry | @/legacy `getAppConfig` | `()=>{let e=sessionStorage.getItem("appConfig")?sessionStorage.getItem("appConfig"):document.getElementsByTagName("head")[0].getAttribute("data-config");return JSON.parse(e)}` |
| `O` | index.1783320636200.js | api | @/legacy/api `getArticleListByCode`（reserved） | `e=>ut.request({url:"/xf-job/job/licenseFree/getArticleListByCode",method:"get",params:e})` |
| `W` | index.1783320636200.js | entry | @/legacy/utils `openLink`（reserved） | `(e,t,n)=>{let r=window.location.host;if(e.linkAddress)String(e.linkAddress).includes(r)?window.open(e.linkAddress):e.linkAddress.includes("www")\|\|e.linkAddress.includes("http")?window.open("/outLink?l` |
| `g` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
