# 导入提示：page.portal.fair.signModal

原 chunk `signModal.1783320636200.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `pe` | index.1783320636200.js | entry | @/legacy `getAppConfig` | `()=>{let e=sessionStorage.getItem("appConfig")?sessionStorage.getItem("appConfig"):document.getElementsByTagName("head")[0].getAttribute("data-config");return JSON.parse(e)}` |
| `R` | index.1783320636200.js | entry | @/legacy `userStorage` | `{keys:!0,setUser(e){this.keys?localStorage.setItem(jn.USER_INFO,e):localStorage.setItem(jn.USER_INFO,JSON.stringify(e))},getUser(){const e=localStorage.getItem(jn.USER_INFO);if(e&&e!="undefined"&&e!="` |
| `A` | index.1783320636200.js | entry | @/legacy `SettingCodes` | `(e=>(e.BTN_PERMISS="btn_permiss",e.UNIFYLOGINURL="unifyLoginUrl",e.UNITELOGINURL="uniteLoginUrl",e.GO_MINI_PROGRAM_PREFIX="go_mini_program_prefix",e.WX_URL="wx_url",e.QRCODE_TYPE="qrcode_type",e.FAIRS` |
| `he` | index.1783320636200.js | api | @/legacy `getSettingValueByCodes` | `e=>ut.request({url:"/xf-job/job/licenseFree/xfSysBusinessSetting/getSettingValueByCodes",method:"get",params:e})` |
| `w` | index.1783320636200.js | entry | @/legacy `openUserCenter` | `(e,t)=>{let n=rr.getters.userUrl;t=t\|\|"_blank",n&&n.charAt(n.length-1)==="/"&&(n=n.slice(0,-1)),window.open(n+"/autoLogin?toPath="+encodeURIComponent(e)+"&token="+Ze.getToken(),t)}` |
| `d` | index.1783320636200.js | entry | ant-design-vue `message` | `D1` |
| `de` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `fe` | index.api.178332063620017.js | api | @/api/api-17 `checkIzShowApplySameNetworkFair` | `e=>o.request({url:"/xf-job/job/xfJobFair/checkIzShowApplySameNetworkFair",method:"post",params:e})` |
| `be` | index.api.178332063620017.js | api | @/api/api-17 `queryFairRegions` | `e=>o.request({url:"/xf-job/job/licenseFree/queryFairRegions",method:"get",params:e})` |
| `ve` | index.api.178332063620017.js | api | @/api/api-17 `updateCompIntroduc` | `e=>o.request({url:"/xf-job/job/licenseFree/updateCompIntroduc",method:"post",data:e})` |
