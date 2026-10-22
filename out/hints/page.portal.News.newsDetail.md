# 导入提示：page.portal.News.newsDetail

原 chunk `newsDetail.1783320636200.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `ee` | index.1783320636200.js | entry | @/legacy `userStorage` | `{keys:!0,setUser(e){this.keys?localStorage.setItem(jn.USER_INFO,e):localStorage.setItem(jn.USER_INFO,JSON.stringify(e))},getUser(){const e=localStorage.getItem(jn.USER_INFO);if(e&&e!="undefined"&&e!="` |
| `ae` | index.1783320636200.js | entry | @/legacy `openUserCenter` | `(e,t)=>{let n=rr.getters.userUrl;t=t\|\|"_blank",n&&n.charAt(n.length-1)==="/"&&(n=n.slice(0,-1)),window.open(n+"/autoLogin?toPath="+encodeURIComponent(e)+"&token="+Ze.getToken(),t)}` |
| `Ae` | index.1783320636200.js | entry | ant-design-vue `message` | `D1` |
| `le` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `Ve` | index.1783320636200.js | entry | @/legacy `VideoPlayer`（reserved） | `mt(nTt,[["__scopeId","data-v-0e6750cb"]])` |
| `ze` | index.1783320636200.js | entry | @/legacy `LoginModal`（reserved） | `mt(nne,[["__scopeId","data-v-6ac82971"]])` |
| `Pe` | index.1783320636200.js | entry | @/legacy `checkLogin` | `function(e,t,n,r){const a=Ze.getUser(),o=Ze.getCorp();return console.log("\u5224\u65AD\u5F53\u524D\u8D26\u53F7\u662F\u5426\u767B\u5F55token",Ze.getToken(),a,o),new Promise((i,l)=>{if(!Ze.getToken()){i` |
| `Ue` | index.1783320636200.js | entry | @/legacy `TEXT_GO_AUTH` | `"\u53BB\u8BA4\u8BC1"` |
| `qe` | index.1783320636200.js | entry | @/legacy `MSG_PERFECT_PERSONAL` | `"\u5F53\u524D\u8D26\u6237\u672A\u5B8C\u5584\u4E2A\u4EBA\u4FE1\u606F\uFF0C\u8BF7\u5148\u5B8C\u5584\u4E2A\u4EBA\u4FE1\u606F"` |
| `De` | index.1783320636200.js | entry | @/legacy `IDENTITY_OTHER` | `2` |
| `se` | index.1783320636200.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:Ut(O_e(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,t){va` |
| `Me` | index.1783320636200.js | entry | dayjs `default` | `Rk(Owe)` |
| `Ne` | index.1783320636200.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `Fe` | index.1783320636200.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `Ye` | index.api.17833206362008.js | api | @/api/api-08 `positionList` | `e=>t.request({url:"/xf-job/communal/xfSysArticlePosition/positionList",method:"get",params:e})` |
| `Be` | index.api.17833206362008.js | api | @/api/api-08 `deliver` | `e=>t.request({url:"/xf-job/communal/xfSysArticlePositionDeliver/deliver",method:"post",data:e})` |
| `Oe` | index.api.17833206362008.js | api | @/api/api-08 `queryById` | `e=>t.request({url:"/xf-job/school/licenseFree/XfSysArticle/queryById",method:"get",params:e})` |
| `je` | index.api.17833206362008.js | api | @/api/api-08 `updateScanTimes` | `e=>t.request({url:"/xf-job/school/licenseFree/updateScanTimes",method:"post",params:e})` |
| `$e` | index.api.17833206362008.js | api | @/api/api-08 `queryByIdDeliver` | `e=>t.request({url:"/xf-job/school/licenseFree/xfSysArticle/queryByIdDeliver",method:"get",params:e})` |
| `ie` | index.1783320636200117.js | api | @/api/api-117 `list2` | `e=>o.request({url:"/xf-job/job/xfJobCurriculumVitae/list",method:"get",params:e})` |
