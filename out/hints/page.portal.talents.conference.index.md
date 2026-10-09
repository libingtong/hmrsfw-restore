# 导入提示：page.portal.talents.conference.index

原 chunk `index.178332063620095.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `ye` | index.1783320636200.js | entry | @/legacy `getAppConfig` | `()=>{let e=sessionStorage.getItem("appConfig")?sessionStorage.getItem("appConfig"):document.getElementsByTagName("head")[0].getAttribute("data-config");return JSON.parse(e)}` |
| `Le` | index.1783320636200.js | entry | @/legacy/api `queryHomeSettingById` | `e=>IN("/xf-job/job/licenseFree/queryHomeSettingById",e,"post")` |
| `L` | index.1783320636200.js | api | @/legacy/api `getArticleListByCode` | `e=>ut.request({url:"/xf-job/job/licenseFree/getArticleListByCode",method:"get",params:e})` |
| `be` | index.1783320636200.js | entry | @/legacy `useStore` | `function(e){return e===void 0&&(e=null),Ft(e!==null?e:Ru)}` |
| `we` | index.1783320636200.js | entry | @/legacy/utils `openLinkAddress` | `(e,t)=>{let n=window.location.host;e.linkAddress?String(e.linkAddress).includes(n)?window.open(e.linkAddress):e.linkAddress.includes("www")\|\|e.linkAddress.includes("http")?window.open("/outLink?link="` |
| `Ce` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `ze` | index.api.178332063620039.js | api | @/api/sysMeeting `getMeetingInfo` | `t=>m.request({url:"xf-job/communal/licenseFree/xfSysMeeting/getMeetingInfo",method:"get",params:t})` |
| `Ge` | icon.vue_vue_type_style_index_0_lang.1783320636200.js | shared | @/shared/icon.vue `default`（reserved） | `e({__name:"icon",props:{name:{type:String,default:""}},setup(l){const c=l,s=t(()=>o[c.name]\|\|"");return(v,w)=>(r(),i("div",{innerHTML:a(s),class:"icon-svg"},null,8,g))}})` |
