# 导入提示：page.portal.LookForJob.CorpDetail

原 chunk `CorpDetail.1783320636200.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `It` | index.1783320636200.js | entry | @/legacy `userStorage` | `{keys:!0,setUser(e){this.keys?localStorage.setItem(jn.USER_INFO,e):localStorage.setItem(jn.USER_INFO,JSON.stringify(e))},getUser(){const e=localStorage.getItem(jn.USER_INFO);if(e&&e!="undefined"&&e!="` |
| `ht` | index.1783320636200.js | entry | @/legacy `getAppConfig` | `()=>{let e=sessionStorage.getItem("appConfig")?sessionStorage.getItem("appConfig"):document.getElementsByTagName("head")[0].getAttribute("data-config");return JSON.parse(e)}` |
| `$` | index.1783320636200.js | api | @/legacy `getSettingValueByCode` | `e=>ut.request({url:"/xf-job/job/licenseFree/xfSysBusinessSetting/getSettingValueByCode",method:"get",params:e})` |
| `_t` | index.1783320636200.js | entry | @/legacy `checkBtnPermission` | `e=>new Promise((t,n)=>W(void 0,null,function*(){let r={btn1:!0},a=yield On({code:Ea.BTN_PERMISS});if(a&&a.result){let o=g_();e.type==1?o=="0"&&fo()&&(r.btn1=!1):e.type==10&&o=="10"&&fo()&&(r.btn1=!1)}` |
| `E` | index.1783320636200.js | entry | @/legacy `SettingCodes` | `(e=>(e.BTN_PERMISS="btn_permiss",e.UNIFYLOGINURL="unifyLoginUrl",e.UNITELOGINURL="uniteLoginUrl",e.GO_MINI_PROGRAM_PREFIX="go_mini_program_prefix",e.WX_URL="wx_url",e.QRCODE_TYPE="qrcode_type",e.FAIRS` |
| `kt` | index.1783320636200.js | api | @/legacy `getSettingValueByCodes` | `e=>ut.request({url:"/xf-job/job/licenseFree/xfSysBusinessSetting/getSettingValueByCodes",method:"get",params:e})` |
| `J` | index.1783320636200.js | entry | @/legacy `BusinessDictLabels` | `(e=>(e.PROVINCE_NAME="provinceName",e.TEACHIN_STATUS="teachin_status",e.WEBSITE_CONFIG="website_config",e.PLATFORM="\u5E73\u53F0\u914D\u7F6E",e.INDEX_QRCODE="index_qrcode",e.TOPNAV="topNav",e.HIDE_COD` |
| `vt` | index.1783320636200.js | api | @/legacy `getDictValueByCodeAndItems` | `e=>ut.request({url:"/xf-job/job/licenseFree/getDictValueByCodeAndItems",method:"post",params:e})` |
| `x` | index.1783320636200.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `A` | index.1783320636200.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `bt` | index.1783320636200.js | entry | @/legacy `LoginModal` | `mt(nne,[["__scopeId","data-v-6ac82971"]])` |
| `q` | index.1783320636200.js | entry | @/legacy `checkLogin` | `function(e,t,n,r){const a=Ze.getUser(),o=Ze.getCorp();return console.log("\u5224\u65AD\u5F53\u524D\u8D26\u53F7\u662F\u5426\u767B\u5F55token",Ze.getToken(),a,o),new Promise((i,l)=>{if(!Ze.getToken()){i` |
| `Ct` | index.1783320636200.js | entry | @/legacy `TEXT_GO_PERFECT` | `"\u53BB\u5B8C\u5584"` |
| `z` | index.1783320636200.js | entry | @/legacy `MSG_PERFECT_PERSONAL` | `"\u5F53\u524D\u8D26\u6237\u672A\u5B8C\u5584\u4E2A\u4EBA\u4FE1\u606F\uFF0C\u8BF7\u5148\u5B8C\u5584\u4E2A\u4EBA\u4FE1\u606F"` |
| `ee` | index.1783320636200.js | entry | @/legacy `IDENTITY_PERSON` | `0` |
| `F` | index.1783320636200.js | entry | @/legacy `TEXT_GO_AUTH` | `"\u53BB\u8BA4\u8BC1"` |
| `D` | index.1783320636200.js | entry | ant-design-vue `message` | `D1` |
| `Tt` | index.1783320636200.js | entry | @/legacy `useStore` | `function(e){return e===void 0&&(e=null),Ft(e!==null?e:Ru)}` |
| `te` | index.1783320636200.js | entry | @/legacy `IDENTITY_OTHER` | `2` |
| `ce` | index.1783320636200.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:Ut(O_e(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,t){va` |
| `wt` | index.1783320636200.js | entry | @/legacy `openUserCenter` | `(e,t)=>{let n=rr.getters.userUrl;t=t\|\|"_blank",n&&n.charAt(n.length-1)==="/"&&(n=n.slice(0,-1)),window.open(n+"/autoLogin?toPath="+encodeURIComponent(e)+"&token="+Ze.getToken(),t)}` |
| `xt` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `St` | unfold.1783320636200.js | shared | @/shared/unfold.vue `default`（reserved） | `T(s,[["__scopeId","data-v-cc9c6323"]])` |
| `Jt` | index.api.17833206362002.js | api | @/api/jobCurriculumVitae `updateApplyInfoBrowseCount` | `e=>a.request({url:"/xf-job/job/licenseFree/updateApplyInfoBrowseCount",method:"post",data:e})` |
| `Dt` | index.api.17833206362002.js | api | @/api/jobCurriculumVitae `queryCompanyCount` | `e=>a.request({url:"/xf-job/job/licenseFree/queryCompanyCount",method:"post",data:e})` |
| `Vt` | index.api.17833206362002.js | api | @/api/jobCurriculumVitae `queryById` | `e=>a.request({url:"/xf-alliance/alliance/licenseFree/xfAllianceCompany/queryById",method:"get",params:e})` |
| `Ht` | index.api.17833206362002.js | api | @/api/jobCurriculumVitae `freeCompanyDetailById` | `e=>a.request({url:"/xf-job/job/licenseFree/freeCompanyDetailById",method:"post",params:e})` |
| `Gt` | index.api.17833206362002.js | api | @/api/jobCurriculumVitae `findJobFwlzphList` | `e=>a.request({url:"/xf-job/job/licenseFree/findJobFwlzphList",method:"post",params:e})` |
| `Wt` | index.api.17833206362002.js | api | @/api/jobCurriculumVitae `list` | `e=>a.request({url:"/xf-alliance/alliance/licenseFree/xfAlliancePosition/mh/list",method:"post",data:e})` |
| `Mt` | index.api.17833206362002.js | api | @/api/jobCurriculumVitae `findJobList` | `e=>a.request({url:"/xf-job/job/licenseFree/findJobList",method:"post",params:e})` |
| `de` | index.api.17833206362002.js | api | @/api/jobCurriculumVitae `add` | `e=>a.request({url:"/xf-job/job/xfJobUserCare/add",method:"get",params:e})` |
| `ue` | index.api.17833206362002.js | api | @/api/jobCurriculumVitae `cancel` | `e=>a.request({url:"/xf-job/job/xfJobUserCare/cancel",method:"get",params:e})` |
| `Xt` | index.api.17833206362002.js | api | @/api/jobCurriculumVitae `queryIzCanDeliver` | `e=>a.request({url:"/xf-job/job/xfJobCurriculumVitae/queryIzCanDeliver",method:"get",params:e})` |
| `V` | empty.1783320636200.js | shared | @/shared/empty.vue `default` | `x(i,[["render",s],["__scopeId","data-v-810a04d0"]])` |
| `Zt` | resumemodal.1783320636200.js | shared | @/shared/resumemodal.vue `default` | `D(r,[["__scopeId","data-v-30d15804"]])` |
| `$t` | complaint.1783320636200.js | shared | @/shared/complaint.vue `default`（reserved） | `$(_,[["__scopeId","data-v-78e7da48"]])` |
| `ta` | qrcode.vue_vue_type_script_setup_true_name_demoView_lang.1783320636200.js | shared | @/shared/qrcode.vue `default` | `V(Y(Q({},O),{props:{text:{type:String,default:""},width:{type:Number,default:100},height:{type:Number,default:100},index:{type:Number,default:1},showTitle:{type:Boolean,default:!0},level:{type:String,` |
| `sa` | index.1783320636200117.js | api | @/api/jobCompany `getQrcodeImgByObjectId` | `e=>o.request({url:"xf-job/job/licenseFree/getQrcodeImgByObjectId",method:"post",params:e})` |
| `la` | GetLocationMap.vue_vue_type_script_setup_true_lang.1783320636200.js | shared | @/shared/GetLocationMap.vue `default`（reserved） | `v({__name:"GetLocationMap",props:{msg:{type:String,default:"\u83B7\u53D6\u5B9A\u4F4D\u6709\u5EF6\u8FDF\uFF0C\u8BF7\u8010\u5FC3\u7B49\u5F85\u3002\u3002\u3002"},showMsg:{type:Boolean,default:!1}},emits:` |
| `ia` | index.api.17833206362006.js | api | @/api/job `getDistance` | `e=>o.request({url:"/xf-job/job/licenseFree/getDistance",method:"post",data:e})` |
