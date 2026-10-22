# 导入提示：page.portal.LookForJob.PostDetail

原 chunk `PostDetail.1783320636200.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `Rt` | index.1783320636200.js | entry | @/legacy `userStorage` | `{keys:!0,setUser(e){this.keys?localStorage.setItem(jn.USER_INFO,e):localStorage.setItem(jn.USER_INFO,JSON.stringify(e))},getUser(){const e=localStorage.getItem(jn.USER_INFO);if(e&&e!="undefined"&&e!="` |
| `Pt` | index.1783320636200.js | entry | @/legacy `getAppConfig` | `()=>{let e=sessionStorage.getItem("appConfig")?sessionStorage.getItem("appConfig"):document.getElementsByTagName("head")[0].getAttribute("data-config");return JSON.parse(e)}` |
| `C` | index.1783320636200.js | api | @/legacy `getSettingValueByCode` | `e=>ut.request({url:"/xf-job/job/licenseFree/xfSysBusinessSetting/getSettingValueByCode",method:"get",params:e})` |
| `se` | index.1783320636200.js | entry | @/legacy `SettingCodes` | `(e=>(e.BTN_PERMISS="btn_permiss",e.UNIFYLOGINURL="unifyLoginUrl",e.UNITELOGINURL="uniteLoginUrl",e.GO_MINI_PROGRAM_PREFIX="go_mini_program_prefix",e.WX_URL="wx_url",e.QRCODE_TYPE="qrcode_type",e.FAIRS` |
| `E` | index.1783320636200.js | entry | @/legacy `BusinessDictLabels` | `(e=>(e.PROVINCE_NAME="provinceName",e.TEACHIN_STATUS="teachin_status",e.WEBSITE_CONFIG="website_config",e.PLATFORM="\u5E73\u53F0\u914D\u7F6E",e.INDEX_QRCODE="index_qrcode",e.TOPNAV="topNav",e.HIDE_COD` |
| `Lt` | index.1783320636200.js | api | @/legacy `getDictValueByCodeAndItems` | `e=>ut.request({url:"/xf-job/job/licenseFree/getDictValueByCodeAndItems",method:"post",params:e})` |
| `le` | index.1783320636200.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `ie` | index.1783320636200.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `Ot` | index.1783320636200.js | entry | @/legacy/utils `getCurrentLocation`（reserved） | `()=>W(void 0,null,function*(){let e={longitude:0,latitude:0,accuracy:0};if(navigator.geolocation){const t={enableHighAccuracy:!0,timeout:5e3,maximumAge:0};try{const n=yield new Promise((r,a)=>{navigat` |
| `qt` | index.1783320636200.js | entry | @/legacy `LoginModal`（reserved） | `mt(nne,[["__scopeId","data-v-6ac82971"]])` |
| `$` | index.1783320636200.js | entry | @/legacy `openUserCenter` | `(e,t)=>{let n=rr.getters.userUrl;t=t\|\|"_blank",n&&n.charAt(n.length-1)==="/"&&(n=n.slice(0,-1)),window.open(n+"/autoLogin?toPath="+encodeURIComponent(e)+"&token="+Ze.getToken(),t)}` |
| `A` | index.1783320636200.js | entry | @/legacy `checkLogin` | `function(e,t,n,r){const a=Ze.getUser(),o=Ze.getCorp();return console.log("\u5224\u65AD\u5F53\u524D\u8D26\u53F7\u662F\u5426\u767B\u5F55token",Ze.getToken(),a,o),new Promise((i,l)=>{if(!Ze.getToken()){i` |
| `w` | index.1783320636200.js | entry | @/legacy `TEXT_GO_AUTH` | `"\u53BB\u8BA4\u8BC1"` |
| `B` | index.1783320636200.js | entry | @/legacy `MSG_PERFECT_PERSONAL` | `"\u5F53\u524D\u8D26\u6237\u672A\u5B8C\u5584\u4E2A\u4EBA\u4FE1\u606F\uFF0C\u8BF7\u5148\u5B8C\u5584\u4E2A\u4EBA\u4FE1\u606F"` |
| `S` | index.1783320636200.js | entry | @/legacy `IDENTITY_OTHER` | `2` |
| `Nt` | index.1783320636200.js | entry | @/legacy `TEXT_GO_PERFECT` | `"\u53BB\u5B8C\u5584"` |
| `Ft` | index.1783320636200.js | entry | @/legacy `IDENTITY_PERSON` | `0` |
| `ne` | index.1783320636200.js | entry | @/legacy `checkIdentity` | `function(e){let t=e.type,n=e.content,r=e.content2,a=e.textbtn,o=e.textbtn2,i=e.alert==!1?e.alert:!0;const l=Ze.getUser(),c=Ze.getCorp();return console.log("\u5224\u65AD\u5F53\u524D\u8D26\u53F7\u662F\u` |
| `V` | index.1783320636200.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:Ut(O_e(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,t){va` |
| `W` | index.1783320636200.js | entry | ant-design-vue `message` | `D1` |
| `Mt` | index.1783320636200.js | entry | @/legacy `useStore` | `function(e){return e===void 0&&(e=null),Ft(e!==null?e:Ru)}` |
| `Ut` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `Dt` | qrcode.vue_vue_type_script_setup_true_name_demoView_lang.1783320636200.js | shared | @/shared/qrcode.vue `default` | `V(Y(Q({},O),{props:{text:{type:String,default:""},width:{type:Number,default:100},height:{type:Number,default:100},index:{type:Number,default:1},showTitle:{type:Boolean,default:!0},level:{type:String,` |
| `Et` | map.vue_vue_type_script_setup_true_lang.1783320636200.js | shared | @/shared/map2.vue `default`（reserved） | `d({__name:"map",props:{collapsed:Boolean,mentorrecord:Array,visible:Boolean,title:String,izEndReply:String,longitude:String,latitude:String,height:{type:String,default:"255px"}},setup(n){const o=n;h((` |
| `$t` | gaode.vue_vue_type_style_index_0_lang.1783320636200.js | shared | @/shared/gaode.vue `default`（reserved） | `j({__name:"gaode",props:{markers:{type:Array,required:!1},latitudeGcj02:{type:String,required:!1},longitudeGcj02:{type:String,required:!1},queryParam:{type:Object,required:!1},gaodekey:{type:Array,req` |
| `aa` | addResume.1783320636200.js | shared | @/shared/addResume.vue `default`（reserved） | `D(C,[["__scopeId","data-v-a6009624"]])` |
| `sa` | index.api.17833206362002.js | api | @/api/api-17833206362002 `queryForCompetitiveAnalysis` | `e=>a.request({url:"/xf-job/job/xfJobCurriculumVitae/queryForCompetitiveAnalysis",method:"get",params:e})` |
| `la` | index.api.17833206362002.js | api | @/api/api-17833206362002 `queryById` | `e=>a.request({url:"/xf-alliance/alliance/licenseFree/xfAllianceCompany/queryById",method:"get",params:e})` |
| `ia` | index.api.17833206362002.js | api | @/api/api-17833206362002 `freeCompanyDetailById` | `e=>a.request({url:"/xf-job/job/licenseFree/freeCompanyDetailById",method:"post",params:e})` |
| `na` | index.api.17833206362002.js | api | @/api/api-17833206362002 `queryById2` | `e=>a.request({url:"/xf-alliance/alliance/licenseFree/xfAlliancePosition/queryById",method:"get",params:e})` |
| `ra` | index.api.17833206362002.js | api | @/api/api-17833206362002 `freeCompanyPositionDetail` | `e=>a.request({url:"/xf-job/job/licenseFree/freeCompanyPositionDetail",method:"post",params:e})` |
| `ca` | index.api.17833206362002.js | api | @/api/api-17833206362002 `findLikeJobList` | `e=>a.request({url:"/xf-job/job/licenseFree/findLikeJobList",method:"post",params:e})` |
| `_e` | index.api.17833206362002.js | api | @/api/api-17833206362002 `queryIzCanDeliver` | `e=>a.request({url:"/xf-job/job/xfJobCurriculumVitae/queryIzCanDeliver",method:"get",params:e})` |
| `ge` | index.api.17833206362002.js | api | @/api/api-17833206362002 `queryIzCanDeliver2` | `e=>a.request({url:"/xf-alliance/alliance/curriculumVitaeDeliver/queryIzCanDeliver",method:"get",params:e})` |
| `Ie` | index.api.17833206362002.js | api | @/api/api-17833206362002 `add` | `e=>a.request({url:"/xf-job/job/xfJobUserCare/add",method:"get",params:e})` |
| `da` | index.api.17833206362002.js | api | @/api/api-17833206362002 `cancel` | `e=>a.request({url:"/xf-job/job/xfJobUserCare/cancel",method:"get",params:e})` |
| `pa` | index.api.17833206362006.js | api | @/api/job `getDistance`（reserved） | `e=>o.request({url:"/xf-job/job/licenseFree/getDistance",method:"post",data:e})` |
| `ya` | empty.1783320636200.js | shared | @/shared/empty.vue `default` | `x(i,[["render",s],["__scopeId","data-v-810a04d0"]])` |
| `va` | resumemodal.1783320636200.js | shared | @/shared/resumemodal.vue `default` | `D(r,[["__scopeId","data-v-30d15804"]])` |
| `_a` | complaint.1783320636200.js | shared | @/shared/complaint.vue `default`（reserved） | `$(_,[["__scopeId","data-v-78e7da48"]])` |
| `Ia` | evaluate.1783320636200.js | shared | @/shared/evaluate.vue `default`（reserved） | `j(d,[["__scopeId","data-v-15c6e00d"]])` |
