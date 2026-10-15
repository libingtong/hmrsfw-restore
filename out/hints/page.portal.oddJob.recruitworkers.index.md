# 导入提示：page.portal.oddJob.recruitworkers.index

原 chunk `index.178332063620050.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `Me` | index.1783320636200.js | entry | @/legacy `getAppConfig` | `()=>{let e=sessionStorage.getItem("appConfig")?sessionStorage.getItem("appConfig"):document.getElementsByTagName("head")[0].getAttribute("data-config");return JSON.parse(e)}` |
| `Oe` | index.1783320636200.js | entry | @/legacy `userStorage` | `{keys:!0,setUser(e){this.keys?localStorage.setItem(jn.USER_INFO,e):localStorage.setItem(jn.USER_INFO,JSON.stringify(e))},getUser(){const e=localStorage.getItem(jn.USER_INFO);if(e&&e!="undefined"&&e!="` |
| `He` | index.1783320636200.js | entry | @/legacy `getDictItemsByCode` | `e=>IN("/jeecg-system/sys/dict/getDictItemsByCode",e,"get")` |
| `Le` | index.1783320636200.js | entry | @/legacy `LoginModal` | `mt(nne,[["__scopeId","data-v-6ac82971"]])` |
| `P` | index.1783320636200.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `q` | index.1783320636200.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `Pe` | index.1783320636200.js | entry | @/legacy/utils `checkTokenLogin` | `function(){return new Promise((e,t)=>{if(Ze.getToken())e(1);else{e(3);return}})}` |
| `I` | index.1783320636200.js | entry | ant-design-vue `message` | `D1` |
| `qe` | index.1783320636200.js | entry | @/legacy `checkLogin` | `function(e,t,n,r){const a=Ze.getUser(),o=Ze.getCorp();return console.log("\u5224\u65AD\u5F53\u524D\u8D26\u53F7\u662F\u5426\u767B\u5F55token",Ze.getToken(),a,o),new Promise((i,l)=>{if(!Ze.getToken()){i` |
| `Ye` | index.1783320636200.js | entry | @/legacy `TEXT_GO_AUTH` | `"\u53BB\u8BA4\u8BC1"` |
| `Ae` | index.1783320636200.js | entry | @/legacy `MSG_PERFECT_PERSONAL` | `"\u5F53\u524D\u8D26\u6237\u672A\u5B8C\u5584\u4E2A\u4EBA\u4FE1\u606F\uFF0C\u8BF7\u5148\u5B8C\u5584\u4E2A\u4EBA\u4FE1\u606F"` |
| `Ee` | index.1783320636200.js | entry | @/legacy `IDENTITY_OTHER` | `2` |
| `Ve` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `R` | dictCode.1783320636200.js | shared | @/shared/dictCode.vue `default` | `S(i,[["render",p]])` |
| `na` | oddType.1783320636200.js | shared | @/shared/oddType.vue `default`（reserved） | `le(Z,[["__scopeId","data-v-9ac88e20"]])` |
| `ra` | nowContact.vue_vue_type_script_setup_true_lang.1783320636200.js | shared | @/shared/nowContact.vue `default`（reserved） | `y({__name:"nowContact",props:{visible:{type:Boolean,default:!1},data:{type:Object,default:{}},type:{type:String,default:"0"}},emits:["cancelClick"],setup(u,{emit:c}){const e=u;g({}),f(()=>{});const b=` |
| `ua` | empty.1783320636200.js | shared | @/shared/empty.vue `default` | `x(i,[["render",s],["__scopeId","data-v-810a04d0"]])` |
| `pa` | index.api.178332063620024.js | api | @/api/oddJob `needJoblist` | `e=>o.request({url:"/xf-oddjob/oddJob/licenseFree/needJoblist",method:"post",data:e})` |
| `ma` | index.api.178332063620024.js | api | @/api/oddJob `add3` | `e=>o.request({url:"/xf-oddjob/oddjob/xfOddPositionApply/add",method:"post",data:e})` |
| `ya` | index.api.178332063620024.js | api | @/api/oddJob `add4` | `e=>o.request({url:"/xf-oddjob/oddJob/licenseFree/callRecord/add",method:"post",data:e})` |
| `ba` | index.api.178332063620024.js | api | @/api/oddJob `add` | `e=>o.request({url:"/xf-oddjob/oddjob/xfOddUserCollect/add",method:"post",data:e})` |
| `fa` | index.api.178332063620024.js | api | @/api/oddJob `deleteItem` | `e=>o.request({url:"/xf-oddjob/oddjob/xfOddUserCollect/delete",method:"delete",params:e})` |
| `ga` | index.api.178332063620024.js | api | @/api/oddJob `add2` | `e=>o.request({url:"/xf-oddjob/oddjob/xfOddUserBrowse/add",method:"post",data:e})` |
