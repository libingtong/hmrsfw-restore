# 导入提示：page.portal.fair.outFair.detail

原 chunk `detail.17833206362002.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `Pt` | outIcon.1783320636200.js | shared | @/shared/images `outIconImg` | `"/default/outIcon.png"` |
| `Rt` | down.1783320636200.js | shared | @/shared/down `arrowUpImg` | `"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAJCAYAAAAPU20uAAAAX0lEQVQYlbWOUQ2AMAxErxKwMAtYQAsWZgENk4AFtIAELLylSVkW2C/9avvu2lNfwA4sGlXAA7g/IiADJzA5jD490BfumgeG5MMGrAFahhDl/s1PGcwzSLrMrLyvSlIFr` |
| `Ut` | down.1783320636200.js | shared | @/shared/down `arrowDownImg` | `"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAJCAYAAAAPU20uAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ` |
| `Et` | index.1783320636200.js | entry | @/legacy `getAppConfig` | `()=>{let e=sessionStorage.getItem("appConfig")?sessionStorage.getItem("appConfig"):document.getElementsByTagName("head")[0].getAttribute("data-config");return JSON.parse(e)}` |
| `ke` | index.1783320636200.js | entry | @/legacy `userStorage` | `{keys:!0,setUser(e){this.keys?localStorage.setItem(jn.USER_INFO,e):localStorage.setItem(jn.USER_INFO,JSON.stringify(e))},getUser(){const e=localStorage.getItem(jn.USER_INFO);if(e&&e!="undefined"&&e!="` |
| `ge` | index.1783320636200.js | entry | @/legacy `getDictItemsByCode` | `e=>IN("/jeecg-system/sys/dict/getDictItemsByCode",e,"get")` |
| `Z` | index.1783320636200.js | entry | @/legacy `SettingCodes` | `(e=>(e.BTN_PERMISS="btn_permiss",e.UNIFYLOGINURL="unifyLoginUrl",e.UNITELOGINURL="uniteLoginUrl",e.GO_MINI_PROGRAM_PREFIX="go_mini_program_prefix",e.WX_URL="wx_url",e.QRCODE_TYPE="qrcode_type",e.FAIRS` |
| `Mt` | index.1783320636200.js | api | @/legacy `getSettingValueByCodes` | `e=>ut.request({url:"/xf-job/job/licenseFree/xfSysBusinessSetting/getSettingValueByCodes",method:"get",params:e})` |
| `At` | index.1783320636200.js | entry | @/legacy `BusinessDictLabels` | `(e=>(e.PROVINCE_NAME="provinceName",e.TEACHIN_STATUS="teachin_status",e.WEBSITE_CONFIG="website_config",e.PLATFORM="\u5E73\u53F0\u914D\u7F6E",e.INDEX_QRCODE="index_qrcode",e.TOPNAV="topNav",e.HIDE_COD` |
| `Dt` | index.1783320636200.js | api | @/legacy `getDictValueByCodeAndItems` | `e=>ut.request({url:"/xf-job/job/licenseFree/getDictValueByCodeAndItems",method:"post",params:e})` |
| `Ot` | index.1783320636200.js | api | @/legacy `getArticleListByTypeIds` | `e=>ut.request({url:"/xf-job/job/licenseFree/getArticleListByTypeIds",method:"post",params:e})` |
| `qt` | index.1783320636200.js | entry | @/legacy `LoginModal`（reserved） | `mt(nne,[["__scopeId","data-v-6ac82971"]])` |
| `Yt` | index.1783320636200.js | entry | @/legacy `checkIdentity` | `function(e){let t=e.type,n=e.content,r=e.content2,a=e.textbtn,o=e.textbtn2,i=e.alert==!1?e.alert:!0;const l=Ze.getUser(),c=Ze.getCorp();return console.log("\u5224\u65AD\u5F53\u524D\u8D26\u53F7\u662F\u` |
| `Ht` | index.1783320636200.js | api | @/legacy `checkIzDishonesty` | `e=>ut.request({url:"/xf-job/job/xfJobFairApplyInfo/checkIzDishonesty",method:"post",data:e})` |
| `Kt` | index.1783320636200.js | entry | ant-design-vue `message` | `D1` |
| `Vt` | index.1783320636200.js | entry | @/legacy `useStore` | `function(e){return e===void 0&&(e=null),Ft(e!==null?e:Ru)}` |
| `Xt` | index.1783320636200.js | entry | @/legacy `IDENTITY_CORP` | `1` |
| `Jt` | index.1783320636200.js | entry | @/legacy `MSG_CORP_NOT_AUTH` | `"\u5F53\u524D\u8D26\u6237\u5C1A\u672A\u8FDB\u884C\u5355\u4F4D\u8BA4\u8BC1\uFF0C\u8BA4\u8BC1\u901A\u8FC7\u540E\u65B9\u53EF\u62A5\u540D\u62DB\u8058\u4F1A"` |
| `$t` | index.1783320636200.js | entry | @/legacy `TEXT_GO_AUTH` | `"\u53BB\u8BA4\u8BC1"` |
| `Gt` | index.1783320636200.js | entry | @/legacy `MSG_CORP_PENDING` | `"\u5F53\u524D\u8D26\u6237\u7684\u8D44\u6599\u5C1A\u672A\u5B8C\u5584\u6216\u6B63\u5728\u5BA1\u6838\u4E2D\uFF0C\u8BF7\u5728\u5BA1\u6838\u901A\u8FC7\u540E\u62A5\u540D\u62DB\u8058\u4F1A\u3002"` |
| `S` | index.1783320636200.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `C` | index.1783320636200.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `ze` | index.1783320636200.js | entry | dayjs `default` | `Rk(Owe)` |
| `Zt` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `j` | dictCode.1783320636200.js | shared | @/shared/dictCode.vue `default` | `S(i,[["render",p]])` |
| `ao` | industryCode.1783320636200.js | shared | @/shared/industryCode.vue `default` | `S(i,[["render",d]])` |
| `oo` | index.api.178332063620017.js | api | @/api/api-17 `updateBrowseCount` | `e=>o.request({url:"/xf-job/job/licenseFree/xfJobFair/updateBrowseCount",method:"post",data:e})` |
| `lo` | index.api.178332063620017.js | api | @/api/api-17 `queryById` | `e=>o.request({url:"/xf-job/job/licenseFree/xfJobFair/queryById",method:"get",params:e})` |
| `so` | index.api.178332063620017.js | api | @/api/api-17 `queryJobFairStatistics` | `e=>o.request({url:"/xf-job/job/licenseFree/statistics/queryJobFairStatistics",method:"post",data:e})` |
| `io` | index.api.178332063620017.js | api | @/api/api-17 `scrollBarData` | `e=>o.request({url:"/xf-job/job/licenseFree/xfJobFairApplyInfo/scrollBarData",method:"post",data:e})` |
| `ro` | index.api.178332063620017.js | api | @/api/api-17 `queryAttendeesCompany` | `e=>o.request({url:"/xf-job/job/licenseFree/xfJobFairApplyInfo/queryAttendeesCompany",method:"post",data:e})` |
| `no` | index.api.178332063620017.js | api | @/api/api-17 `queryAttendeesPosition` | `e=>o.request({url:"/xf-job/job/licenseFree/xfJobFairApplyInfo/queryAttendeesPosition",method:"post",data:e})` |
| `we` | empty.1783320636200.js | shared | @/shared/empty.vue `default` | `x(i,[["render",s],["__scopeId","data-v-810a04d0"]])` |
| `uo` | vue3-seamless-scroll.es.1783320636200.js | shared | vue3-seamless-scroll `Vue3SeamlessScroll` | `K({name:"vue3-seamless-scroll",inheritAttrs:!1,props:ae,emits:["stop","count","move"],setup(a,{slots:r,emit:v,attrs:d}){const e=a,x=o(null),b=o(null),w=o(null),T=o(null),s=o(null),c=o(0),A=o(0),u=o(0)` |
| `ho` | workType.1783320636200.js | shared | @/shared/workType.vue `default` | `ye(pe,[["__scopeId","data-v-c9091e07"]])` |
| `vo` | city.1783320636200.js | shared | @/shared/city.vue `default` | `oe(J,[["__scopeId","data-v-911d64a4"]])` |
| `go` | qrcode.vue_vue_type_script_setup_true_name_demoView_lang.1783320636200.js | shared | @/shared/qrcode.vue `default` | `V(Y(Q({},O),{props:{text:{type:String,default:""},width:{type:Number,default:100},height:{type:Number,default:100},index:{type:Number,default:1},showTitle:{type:Boolean,default:!0},level:{type:String,` |
| `wo` | index.1783320636200117.js | api | @/api/api-117 `getQrcodeImgByObjectId` | `e=>o.request({url:"xf-job/job/licenseFree/getQrcodeImgByObjectId",method:"post",params:e})` |
