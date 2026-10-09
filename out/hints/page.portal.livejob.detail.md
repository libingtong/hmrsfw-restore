# 导入提示：page.portal.livejob.detail

原 chunk `detail.17833206362005.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `Kt` | index.1783320636200.js | entry | @/legacy `getAppConfig` | `()=>{let e=sessionStorage.getItem("appConfig")?sessionStorage.getItem("appConfig"):document.getElementsByTagName("head")[0].getAttribute("data-config");return JSON.parse(e)}` |
| `Ut` | index.1783320636200.js | entry | @/legacy `userStorage` | `{keys:!0,setUser(e){this.keys?localStorage.setItem(jn.USER_INFO,e):localStorage.setItem(jn.USER_INFO,JSON.stringify(e))},getUser(){const e=localStorage.getItem(jn.USER_INFO);if(e&&e!="undefined"&&e!="` |
| `Ne` | index.1783320636200.js | api | @/legacy `getSettingValueByCode` | `e=>ut.request({url:"/xf-job/job/licenseFree/xfSysBusinessSetting/getSettingValueByCode",method:"get",params:e})` |
| `Ft` | index.1783320636200.js | entry | @/legacy `getDictItemsByCode` | `e=>IN("/jeecg-system/sys/dict/getDictItemsByCode",e,"get")` |
| `Me` | index.1783320636200.js | entry | ant-design-vue `message` | `D1` |
| `Gt` | index.1783320636200.js | entry | @/legacy `useStore` | `function(e){return e===void 0&&(e=null),Ft(e!==null?e:Ru)}` |
| `E` | index.1783320636200.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `j` | index.1783320636200.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `Yt` | index.1783320636200.js | entry | @/legacy/utils `getUserInfo`（reserved） | `()=>{let e=Pr({userInfo:n=>n.userInfo});return(Ze.getUser()?Ze.getUser():null)\|\|(e.value?e.value:null)}` |
| `Qt` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `$t` | workItem.17833206362002.js | shared | @/shared/workItem.vue `default`（reserved） | `Ra(ca,[["__scopeId","data-v-23adcd83"]])` |
| `ea` | index.api.178332063620013.js | api | @/api/jobLiveTelecast `queryVoById`（reserved） | `e=>s.request({url:"/xf-job/job/licenseFree/xfJobLiveTelecast/queryVoById",method:"post",params:e})` |
| `ta` | index.api.178332063620013.js | api | @/api/jobLiveTelecast `queryCompanyAndPositionList`（reserved） | `e=>s.request({url:"/xf-job/job/licenseFree/xfJobLiveTelecastPosition/queryCompanyAndPositionList",method:"post",data:e})` |
| `aa` | index.api.178332063620013.js | api | @/api/jobLiveTelecast `submit`（reserved） | `e=>s.request({url:"/xf-job/job/licenseFree/xfJobComment/submit",method:"post",data:e})` |
| `la` | empty.1783320636200.js | shared | @/shared/empty.vue `default` | `x(i,[["render",s],["__scopeId","data-v-810a04d0"]])` |
| `oa` | qrcode.vue_vue_type_script_setup_true_name_demoView_lang.1783320636200.js | shared | @/shared/qrcode.vue `default` | `V(Y(Q({},O),{props:{text:{type:String,default:""},width:{type:Number,default:100},height:{type:Number,default:100},index:{type:Number,default:1},showTitle:{type:Boolean,default:!0},level:{type:String,` |
| `ra` | likeBtn.1783320636200.js | shared | @/shared/likeBtn.vue `default`（reserved） | `R(w,[["__scopeId","data-v-a81e5626"]])` |
