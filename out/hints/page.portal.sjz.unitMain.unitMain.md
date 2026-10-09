# 导入提示：page.portal.sjz.unitMain.unitMain

原 chunk `unitMain.1783320636200.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `H` | index.1783320636200.js | entry | @/legacy `userStorage` | `{keys:!0,setUser(e){this.keys?localStorage.setItem(jn.USER_INFO,e):localStorage.setItem(jn.USER_INFO,JSON.stringify(e))},getUser(){const e=localStorage.getItem(jn.USER_INFO);if(e&&e!="undefined"&&e!="` |
| `z` | index.1783320636200.js | entry | ant-design-vue `message` | `D1` |
| `W` | index.1783320636200.js | entry | @/legacy `openUserCenter` | `(e,t)=>{let n=rr.getters.userUrl;t=t\|\|"_blank",n&&n.charAt(n.length-1)==="/"&&(n=n.slice(0,-1)),window.open(n+"/autoLogin?toPath="+encodeURIComponent(e)+"&token="+Ze.getToken(),t)}` |
| `Oe` | index.1783320636200.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `qe` | index.1783320636200.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `Be` | index.1783320636200.js | entry | lodash-es `cloneDeep` | `function(e){return Gc(e,qve\|Wve)}` |
| `se` | index.1783320636200.js | entry | @/legacy/utils `formatDateSlash`（reserved） | `e=>{var t=e.getFullYear(),n=e.getMonth()+1,r=e.getDate();return e.getHours(),e.getMinutes(),e.getSeconds(),t+"/"+n+"/"+r}` |
| `$` | index.1783320636200.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:Ut(O_e(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,t){va` |
| `Ee` | index.1783320636200.js | entry | @/legacy/utils `UPLOAD_URL`（reserved） | `ct+"/jeecg-system/sys/common/upload"` |
| `ne` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `Ae` | index.1783320636200.js | entry | @/legacy `getAppConfig` | `()=>{let e=sessionStorage.getItem("appConfig")?sessionStorage.getItem("appConfig"):document.getElementsByTagName("head")[0].getAttribute("data-config");return JSON.parse(e)}` |
| `Me` | index.1783320636200.js | entry | @/legacy `FeedbackModal` | `mt(vie,[["__scopeId","data-v-150e31b0"]])` |
| `Ze` | index.1783320636200.js | entry | @/legacy `LoginModal`（reserved） | `mt(nne,[["__scopeId","data-v-6ac82971"]])` |
| `Ge` | index.api.178332063620035.js | api | @/api/jobGovRecruitCompany `noPagelist2`（reserved） | `e=>o.request({url:"/job/licenseFree/xfJobGovRecruitCompany/noPagelist",method:"post",data:e})` |
| `He` | index.api.178332063620035.js | api | @/api/jobGovRecruitCompany `noPagelist`（reserved） | `e=>o.request({url:"/job/licenseFree/xfJobGovRecruitPosition/noPagelist",method:"post",data:e})` |
| `We` | index.api.178332063620035.js | api | @/api/jobGovRecruitCompany `add`（reserved） | `e=>o.request({url:"/xf-job/job/xfJobGovRecruitRegistration/add",method:"post",data:e})` |
| `re` | index.api.178332063620035.js | api | @/api/jobGovRecruitCompany `queryByIdNew`（reserved） | `e=>o.request({url:"/xf-job/job/licenseFree/xfJobGovRecruitNotice/queryByIdNew",method:"get",params:e})` |
| `$e` | index.api.178332063620035.js | api | @/api/jobGovRecruitCompany `checkIzPerfect`（reserved） | `e=>o.request({url:"/xf-job/communal/xfSysUser/checkIzPerfect",method:"get",params:e})` |
