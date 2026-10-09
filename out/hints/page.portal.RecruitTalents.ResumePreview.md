# 导入提示：page.portal.RecruitTalents.ResumePreview

原 chunk `ResumePreview.1783320636200.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `Le` | index.1783320636200.js | entry | @/legacy `userStorage` | `{keys:!0,setUser(e){this.keys?localStorage.setItem(jn.USER_INFO,e):localStorage.setItem(jn.USER_INFO,JSON.stringify(e))},getUser(){const e=localStorage.getItem(jn.USER_INFO);if(e&&e!="undefined"&&e!="` |
| `V` | index.1783320636200.js | api | @/legacy `getSettingValueByCode` | `e=>ut.request({url:"/xf-job/job/licenseFree/xfSysBusinessSetting/getSettingValueByCode",method:"get",params:e})` |
| `G` | index.1783320636200.js | entry | @/legacy `getDictItemsByCode` | `e=>IN("/jeecg-system/sys/dict/getDictItemsByCode",e,"get")` |
| `Ee` | index.1783320636200.js | entry | ant-design-vue `message` | `D1` |
| `Ie` | index.1783320636200.js | entry | @/legacy `checkLogin` | `function(e,t,n,r){const a=Ze.getUser(),o=Ze.getCorp();return console.log("\u5224\u65AD\u5F53\u524D\u8D26\u53F7\u662F\u5426\u767B\u5F55token",Ze.getToken(),a,o),new Promise((i,l)=>{if(!Ze.getToken()){i` |
| `Ae` | index.1783320636200.js | entry | @/legacy `TEXT_GO_AUTH` | `"\u53BB\u8BA4\u8BC1"` |
| `Ce` | index.1783320636200.js | entry | @/legacy/utils `MSG_CORP_NOT_CERTIFIED`（reserved） | `"\u5F53\u524D\u8D26\u6237\u672A\u8BA4\u8BC1\u5355\u4F4D\u4FE1\u606F\uFF0C\u8BF7\u5148\u8BA4\u8BC1\u5355\u4F4D\u4FE1\u606F"` |
| `ze` | index.1783320636200.js | entry | @/legacy `IDENTITY_CORP` | `1` |
| `D` | index.1783320636200.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:Ut(O_e(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,t){va` |
| `Je` | index.1783320636200.js | entry | @/legacy `openUserCenter` | `(e,t)=>{let n=rr.getters.userUrl;t=t\|\|"_blank",n&&n.charAt(n.length-1)==="/"&&(n=n.slice(0,-1)),window.open(n+"/autoLogin?toPath="+encodeURIComponent(e)+"&token="+Ze.getToken(),t)}` |
| `Ne` | index.1783320636200.js | entry | @/legacy `useStore` | `function(e){return e===void 0&&(e=null),Ft(e!==null?e:Ru)}` |
| `F` | index.1783320636200.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `O` | index.1783320636200.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `je` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `We` | index.api.17833206362007.js | api | @/api/jobInterviewInvitation `viewVoByIdFromCompany`（reserved） | `e=>t.request({url:"/xf-job/job/xfJobCurriculumVitae/viewVoByIdFromCompany",method:"get",params:e})` |
| `Fe` | index.api.17833206362007.js | api | @/api/jobInterviewInvitation `downPdf`（reserved） | `e=>t.request({url:"/xf-job/job/xfJobCompanyCurriculumDownload/downPdf",method:"get",responseType:"blob",headers:{"Content-Type":"application/json; application/octet-stream"},params:e})` |
| `Oe` | index.api.17833206362007.js | api | @/api/jobInterviewInvitation `isPublishingPosition`（reserved） | `e=>t.request({url:"/xf-job/job/xfJobCompany/isPublishingPosition",method:"get",params:e})` |
| `Ye` | InterviewInvitation.1783320636200.js | shared | @/shared/InterviewInvitation.vue `default`（reserved） | `A(g,[["__scopeId","data-v-699372eb"]])` |
