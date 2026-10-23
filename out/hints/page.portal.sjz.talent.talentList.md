# 导入提示：page.portal.sjz.talent.talentList

原 chunk `talentList.1783320636200.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `x` | index.1783320636200.js | entry | @/legacy `userStorage` | `{keys:!0,setUser(e){this.keys?localStorage.setItem(jn.USER_INFO,e):localStorage.setItem(jn.USER_INFO,JSON.stringify(e))},getUser(){const e=localStorage.getItem(jn.USER_INFO);if(e&&e!="undefined"&&e!="` |
| `ht` | index.1783320636200.js | entry | @/legacy `getAppConfig` | `()=>{let e=sessionStorage.getItem("appConfig")?sessionStorage.getItem("appConfig"):document.getElementsByTagName("head")[0].getAttribute("data-config");return JSON.parse(e)}` |
| `mt` | index.1783320636200.js | api | @/legacy `getSettingValueByCode` | `e=>ut.request({url:"/xf-job/job/licenseFree/xfSysBusinessSetting/getSettingValueByCode",method:"get",params:e})` |
| `ne` | index.1783320636200.js | entry | @/legacy `getDictItemsByCode` | `e=>IN("/jeecg-system/sys/dict/getDictItemsByCode",e,"get")` |
| `kt` | index.1783320636200.js | entry | @/legacy `LoginModal`（reserved） | `mt(nne,[["__scopeId","data-v-6ac82971"]])` |
| `_t` | index.1783320636200.js | entry | @/legacy/utils `checkOtherLoginLink`（reserved） | `()=>W(void 0,null,function*(){let e=!1;const{success:t,result:n}=yield On({code:"login_other_link"});return t&&n&&n!=0&&(e=!0,Pte()),e})` |
| `re` | index.1783320636200.js | entry | @/legacy `openUserCenter` | `(e,t)=>{let n=rr.getters.userUrl;t=t\|\|"_blank",n&&n.charAt(n.length-1)==="/"&&(n=n.slice(0,-1)),window.open(n+"/autoLogin?toPath="+encodeURIComponent(e)+"&token="+Ze.getToken(),t)}` |
| `gt` | index.1783320636200.js | entry | @/legacy `useStore` | `function(e){return e===void 0&&(e=null),Ft(e!==null?e:Ru)}` |
| `xt` | index.1783320636200.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `bt` | index.1783320636200.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `G` | index.1783320636200.js | entry | @/legacy `checkLogin` | `function(e,t,n,r){const a=Ze.getUser(),o=Ze.getCorp();return console.log("\u5224\u65AD\u5F53\u524D\u8D26\u53F7\u662F\u5426\u767B\u5F55token",Ze.getToken(),a,o),new Promise((i,l)=>{if(!Ze.getToken()){i` |
| `Q` | index.1783320636200.js | entry | @/legacy `TEXT_GO_AUTH` | `"\u53BB\u8BA4\u8BC1"` |
| `ue` | index.1783320636200.js | entry | @/legacy/utils `MSG_CORP_NOT_CERTIFIED`（reserved） | `"\u5F53\u524D\u8D26\u6237\u672A\u8BA4\u8BC1\u5355\u4F4D\u4FE1\u606F\uFF0C\u8BF7\u5148\u8BA4\u8BC1\u5355\u4F4D\u4FE1\u606F"` |
| `Y` | index.1783320636200.js | entry | @/legacy `IDENTITY_CORP` | `1` |
| `A` | index.1783320636200.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:Ut(O_e(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,t){va` |
| `ce` | index.1783320636200.js | entry | ant-design-vue `message` | `D1` |
| `Tt` | index.1783320636200.js | entry | @/legacy/utils `MSG_CORP_NOT_AUTH_RESUME`（reserved） | `"\u5F53\u524D\u8D26\u6237\u5C1A\u672A\u8FDB\u884C\u5355\u4F4D\u8BA4\u8BC1\uFF0C\u8BA4\u8BC1\u901A\u8FC7\u540E\u65B9\u53EF\u9884\u89C8\u7B80\u5386"` |
| `wt` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `D` | dictCode.1783320636200.js | shared | @/shared/dictCode.vue `default` | `S(i,[["render",p]])` |
| `St` | index.api.178332063620023.js | api | @/api/jobCompanyTalents `searchListForWebsite`（reserved） | `e=>a.request({url:"/xf-job/job/licenseFree/xfJobCurriculumVitae/searchListForWebsite",method:"get",params:e})` |
| `zt` | index.api.178332063620023.js | api | @/api/jobCompanyTalents `addTalent`（reserved） | `e=>a.request({url:"/xf-job/job/xfJobCompanyTalents/addTalent",method:"post",data:e})` |
| `Lt` | index.api.178332063620023.js | api | @/api/jobCompanyTalents `cancelTalent`（reserved） | `e=>a.request({url:"/xf-job/job/xfJobCompanyTalents/cancelTalent",method:"post",params:e})` |
| `Wt` | index.api.178332063620023.js | api | @/api/jobCompanyTalents `isPublishingPosition`（reserved） | `e=>a.request({url:"/xf-job/job/xfJobCompany/isPublishingPosition",method:"get",params:e})` |
| `Ft` | city.1783320636200.js | shared | @/shared/city.vue `default` | `oe(J,[["__scopeId","data-v-911d64a4"]])` |
| `At` | empty.1783320636200.js | shared | @/shared/empty.vue `default` | `x(i,[["render",s],["__scopeId","data-v-810a04d0"]])` |
| `Pt` | workType.1783320636200.js | shared | @/shared/workType.vue `default` | `ye(pe,[["__scopeId","data-v-c9091e07"]])` |
| `Rt` | InterviewInvitation.1783320636200.js | shared | @/shared/InterviewInvitation.vue `default`（reserved） | `A(g,[["__scopeId","data-v-699372eb"]])` |
