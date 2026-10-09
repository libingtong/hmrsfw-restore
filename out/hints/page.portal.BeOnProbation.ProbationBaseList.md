# 导入提示：page.portal.BeOnProbation.ProbationBaseList

原 chunk `ProbationBaseList.1783320636200.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `_e` | index.1783320636200.js | entry | @/legacy `getAppConfig` | `()=>{let e=sessionStorage.getItem("appConfig")?sessionStorage.getItem("appConfig"):document.getElementsByTagName("head")[0].getAttribute("data-config");return JSON.parse(e)}` |
| `M` | index.1783320636200.js | entry | @/legacy `userStorage` | `{keys:!0,setUser(e){this.keys?localStorage.setItem(jn.USER_INFO,e):localStorage.setItem(jn.USER_INFO,JSON.stringify(e))},getUser(){const e=localStorage.getItem(jn.USER_INFO);if(e&&e!="undefined"&&e!="` |
| `me` | index.1783320636200.js | api | @/legacy `getDictValueByCodeAndItems` | `e=>ut.request({url:"/xf-job/job/licenseFree/getDictValueByCodeAndItems",method:"post",params:e})` |
| `B` | index.1783320636200.js | entry | @/legacy `BusinessDictLabels` | `(e=>(e.PROVINCE_NAME="provinceName",e.TEACHIN_STATUS="teachin_status",e.WEBSITE_CONFIG="website_config",e.PLATFORM="\u5E73\u53F0\u914D\u7F6E",e.INDEX_QRCODE="index_qrcode",e.TOPNAV="topNav",e.HIDE_COD` |
| `ye` | index.1783320636200.js | api | @/legacy `getAreaInfo` | `e=>ut.request({url:"/xf-job/communal/licenseFree/xfSysAreainfo/getInfo",method:"get",params:e})` |
| `he` | index.1783320636200.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `ge` | index.1783320636200.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `be` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `V` | dictCode.1783320636200.js | shared | @/shared/dictCode.vue `default` | `S(i,[["render",p]])` |
| `$` | index.api.1783320636200.js | api | @/api/api-1783320636200 `freeCompanyExpandList` | `e=>s.request({url:"/xf-job/job/licenseFree/freeCompanyExpandList",method:"post",params:e})` |
| `J` | empty.1783320636200.js | shared | @/shared/empty.vue `default` | `x(i,[["render",s],["__scopeId","data-v-810a04d0"]])` |
