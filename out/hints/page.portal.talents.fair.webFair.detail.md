# 导入提示：page.portal.talents.fair.webFair.detail

原 chunk `detail.178332063620012.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `zt` | index.1783320636200.js | entry | @/legacy `getAppConfig` | `()=>{let e=sessionStorage.getItem("appConfig")?sessionStorage.getItem("appConfig"):document.getElementsByTagName("head")[0].getAttribute("data-config");return JSON.parse(e)}` |
| `O` | index.1783320636200.js | entry | @/legacy `userStorage` | `{keys:!0,setUser(e){this.keys?localStorage.setItem(jn.USER_INFO,e):localStorage.setItem(jn.USER_INFO,JSON.stringify(e))},getUser(){const e=localStorage.getItem(jn.USER_INFO);if(e&&e!="undefined"&&e!="` |
| `G` | index.1783320636200.js | entry | @/legacy `getDictItemsByCode` | `e=>IN("/jeecg-system/sys/dict/getDictItemsByCode",e,"get")` |
| `gt` | index.1783320636200.js | api | @/legacy/api `getAllLevelArticleListByTypeId`（reserved） | `e=>ut.request({url:"/xf-job/job/licenseFree/getAllLevelArticleListByTypeId",method:"post",params:e})` |
| `Z` | index.1783320636200.js | entry | @/legacy `SettingCodes` | `(e=>(e.BTN_PERMISS="btn_permiss",e.UNIFYLOGINURL="unifyLoginUrl",e.UNITELOGINURL="uniteLoginUrl",e.GO_MINI_PROGRAM_PREFIX="go_mini_program_prefix",e.WX_URL="wx_url",e.QRCODE_TYPE="qrcode_type",e.FAIRS` |
| `wt` | index.1783320636200.js | api | @/legacy `getSettingValueByCodes` | `e=>ut.request({url:"/xf-job/job/licenseFree/xfSysBusinessSetting/getSettingValueByCodes",method:"get",params:e})` |
| `bt` | index.1783320636200.js | entry | @/legacy `LoginModal`（reserved） | `mt(nne,[["__scopeId","data-v-6ac82971"]])` |
| `_t` | index.1783320636200.js | entry | @/legacy `checkLogin` | `function(e,t,n,r){const a=Ze.getUser(),o=Ze.getCorp();return console.log("\u5224\u65AD\u5F53\u524D\u8D26\u53F7\u662F\u5426\u767B\u5F55token",Ze.getToken(),a,o),new Promise((i,l)=>{if(!Ze.getToken()){i` |
| `It` | index.1783320636200.js | entry | @/legacy `TEXT_GO_AUTH` | `"\u53BB\u8BA4\u8BC1"` |
| `xt` | index.1783320636200.js | entry | @/legacy `MSG_CORP_NOT_AUTH` | `"\u5F53\u524D\u8D26\u6237\u5C1A\u672A\u8FDB\u884C\u5355\u4F4D\u8BA4\u8BC1\uFF0C\u8BA4\u8BC1\u901A\u8FC7\u540E\u65B9\u53EF\u62A5\u540D\u62DB\u8058\u4F1A"` |
| `Ct` | index.1783320636200.js | entry | @/legacy `IDENTITY_CORP` | `1` |
| `St` | index.1783320636200.js | api | @/legacy `checkIzDishonesty` | `e=>ut.request({url:"/xf-job/job/xfJobFairApplyInfo/checkIzDishonesty",method:"post",data:e})` |
| `Nt` | index.1783320636200.js | entry | ant-design-vue `message` | `D1` |
| `C` | index.1783320636200.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `S` | index.1783320636200.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `he` | index.1783320636200.js | entry | dayjs `default` | `Rk(Owe)` |
| `Wt` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `W` | dictCode.1783320636200.js | shared | @/shared/dictCode.vue `default` | `S(i,[["render",p]])` |
| `Bt` | industryCode.1783320636200.js | shared | @/shared/industryCode.vue `default` | `S(i,[["render",d]])` |
| `jt` | index.api.178332063620017.js | api | @/api/api-17 `updateBrowseCount` | `e=>o.request({url:"/xf-job/job/licenseFree/xfJobFair/updateBrowseCount",method:"post",data:e})` |
| `Pt` | index.api.178332063620017.js | api | @/api/api-17 `queryById` | `e=>o.request({url:"/xf-job/job/licenseFree/xfJobFair/queryById",method:"get",params:e})` |
| `Rt` | index.api.178332063620017.js | api | @/api/api-17 `queryJobFairStatistics` | `e=>o.request({url:"/xf-job/job/licenseFree/statistics/queryJobFairStatistics",method:"post",data:e})` |
| `Et` | index.api.178332063620017.js | api | @/api/api-17 `scrollBarData` | `e=>o.request({url:"/xf-job/job/licenseFree/xfJobFairApplyInfo/scrollBarData",method:"post",data:e})` |
| `Ut` | index.api.178332063620017.js | api | @/api/api-17 `queryAttendeesCompany` | `e=>o.request({url:"/xf-job/job/licenseFree/xfJobFairApplyInfo/queryAttendeesCompany",method:"post",data:e})` |
| `qt` | index.api.178332063620017.js | api | @/api/api-17 `queryAttendeesPosition` | `e=>o.request({url:"/xf-job/job/licenseFree/xfJobFairApplyInfo/queryAttendeesPosition",method:"post",data:e})` |
| `At` | vue3-seamless-scroll.es.1783320636200.js | shared | vue3-seamless-scroll `Vue3SeamlessScroll` | `K({name:"vue3-seamless-scroll",inheritAttrs:!1,props:ae,emits:["stop","count","move"],setup(a,{slots:r,emit:v,attrs:d}){const e=a,x=o(null),b=o(null),w=o(null),T=o(null),s=o(null),c=o(0),A=o(0),u=o(0)` |
| `Ot` | workType.1783320636200.js | shared | @/shared/workType.vue `default` | `ye(pe,[["__scopeId","data-v-c9091e07"]])` |
| `fe` | empty.1783320636200.js | shared | @/shared/empty.vue `default` | `x(i,[["render",s],["__scopeId","data-v-810a04d0"]])` |
| `Vt` | city.1783320636200.js | shared | @/shared/city.vue `default` | `oe(J,[["__scopeId","data-v-911d64a4"]])` |
| `Jt` | qrcode.vue_vue_type_script_setup_true_name_demoView_lang.1783320636200.js | shared | @/shared/qrcode.vue `default` | `V(Y(Q({},O),{props:{text:{type:String,default:""},width:{type:Number,default:100},height:{type:Number,default:100},index:{type:Number,default:1},showTitle:{type:Boolean,default:!0},level:{type:String,` |
| `Gt` | index.1783320636200117.js | api | @/api/api-117 `getQrcodeImgByObjectId` | `e=>o.request({url:"xf-job/job/licenseFree/getQrcodeImgByObjectId",method:"post",params:e})` |
