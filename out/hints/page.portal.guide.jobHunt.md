# 导入提示：page.portal.guide.jobHunt

原 chunk `jobHunt.1783320636200.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `Xa` | auth.1783320636200.js | shared | @/shared/auth/OneContent.vue `default` | `R(N,[["__scopeId","data-v-08282971"]])` |
| `Fe` | auth.1783320636200.js | shared | @/shared/auth/BackGround.vue `default` | `R(i,[["__scopeId","data-v-b477bb74"]])` |
| `Ka` | auth.1783320636200.js | shared | @/shared/auth/ColumnContent.vue `default` | `R(Z,[["__scopeId","data-v-edf344e0"]])` |
| `$a` | auth.1783320636200.js | shared | @/shared/auth.ts `nextPageIconImg` | `"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAATCAYAAAB7u5a2AAABtElEQVQ4ja2Vy0tVURSHP70pkuggFRzUoNB0HAU1ECfZ0EGDDMJJOoio/oEQonlQNJX+AUMnvRwIQqTQoJlwJz4G6SW81CSInl9sWAcOl/s4XlywOK+9vt/irLXX7lBpY` |
| `Za` | auth.1783320636200.js | shared | @/shared/auth.ts `realNameAuthImg` | `"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAWCAYAAADNX8xBAAABhElEQVQ4jaXUPWhVQRCG4UcxYgQTldQSESVgtFELwSKViuksxEqw0kpSBNFCBBsJQopooZVFUMFGsFBMiGCiCDYWWgiCWEgKsTCijf8MzJWb5dxzTPLBKXZ39j0zu9/sq` |
| `Se` | index.1783320636200.js | entry | ant-design-vue `Form` | `Lxe` |
| `M` | index.1783320636200.js | entry | @/legacy `userStorage` | `{keys:!0,setUser(e){this.keys?localStorage.setItem(jn.USER_INFO,e):localStorage.setItem(jn.USER_INFO,JSON.stringify(e))},getUser(){const e=localStorage.getItem(jn.USER_INFO);if(e&&e!="undefined"&&e!="` |
| `De` | index.1783320636200.js | entry | dayjs `default` | `Rk(Owe)` |
| `at` | index.1783320636200.js | api | @/legacy `getSettingValueByCode` | `e=>ut.request({url:"/xf-job/job/licenseFree/xfSysBusinessSetting/getSettingValueByCode",method:"get",params:e})` |
| `tt` | index.1783320636200.js | entry | @/legacy `validateIdCard` | `e=>{var t=[7,9,10,5,8,4,2,1,6,3,7,9,10,5,8,4,2],n=e+"";e[17];for(var r=n.substring(0,17),a=r.split(""),o=a.length,i=0,l=0;l<o;l++)i=i+a[l]*t[l];var c=/^\d{6}((((((19\|20)\d{2})(0[13-9]\|1[012])(0[1-9]\|[` |
| `lt` | index.1783320636200.js | entry | @/legacy/utils `parseIdCard`（reserved） | `e=>{let t=null,n=null,r=new Date,a=r.getMonth()+1,o=r.getDate(),i=0;return e.length===18&&(i=r.getFullYear()-e.substring(6,10)-1,t=e.substring(16,17),n=e.substring(6,10)+"-"+e.substring(10,12)+"-"+e.s` |
| `st` | index.1783320636200.js | entry | @/legacy/utils `isMobilePhone`（reserved） | `e=>{var t=/^(13[0-9]\|14[01456879]\|15[0-35-9]\|16[2567]\|17[0-8]\|18[0-9]\|19[0-35-9])\d{8}$/;return!!t.test(e)}` |
| `ge` | index.1783320636200.js | entry | ant-design-vue `message` | `D1` |
| `me` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `it` | index.1783320636200.js | api | @/legacy/api `getAllInfo`（reserved） | `e=>ut.request({url:"/xf-job/communal/licenseFree/xfSysAreainfo/getAllInfo",method:"post",data:e})` |
| `Re` | index.1783320636200.js | api | @/legacy `getDictListByType` | `e=>ut.request({url:"/xf-job/communal/licenseFree/getDictListByType",method:"post",params:e})` |
| `Me` | index.1783320636200.js | entry | @/legacy `listToTree` | `function(e){const t=[],n={};return e.forEach(r=>{r.children=[],n[r.id]=r}),e.forEach(r=>{const a=n[r.parentId];a?a.children.push(r):t.push(r)}),t}` |
| `ot` | index.1783320636200.js | entry | @/legacy `getDictItemsByCode` | `e=>IN("/jeecg-system/sys/dict/getDictItemsByCode",e,"get")` |
| `rt` | index.1783320636200.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `nt` | index.1783320636200.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `Ee` | index.1783320636200.js | entry | @/legacy `LoginModal`（reserved） | `mt(nne,[["__scopeId","data-v-6ac82971"]])` |
| `Ue` | index.1783320636200.js | entry | @/legacy `checkLogin` | `function(e,t,n,r){const a=Ze.getUser(),o=Ze.getCorp();return console.log("\u5224\u65AD\u5F53\u524D\u8D26\u53F7\u662F\u5426\u767B\u5F55token",Ze.getToken(),a,o),new Promise((i,l)=>{if(!Ze.getToken()){i` |
| `qe` | index.1783320636200.js | entry | @/legacy `TEXT_GO_AUTH` | `"\u53BB\u8BA4\u8BC1"` |
| `Pe` | index.1783320636200.js | entry | @/legacy `MSG_PERFECT_PERSONAL` | `"\u5F53\u524D\u8D26\u6237\u672A\u5B8C\u5584\u4E2A\u4EBA\u4FE1\u606F\uFF0C\u8BF7\u5148\u5B8C\u5584\u4E2A\u4EBA\u4FE1\u606F"` |
| `Be` | index.1783320636200.js | entry | @/legacy `IDENTITY_OTHER` | `2` |
| `Le` | index.1783320636200.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:Ut(O_e(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,t){va` |
| `Ve` | index.1783320636200.js | entry | @/legacy `openUserCenter` | `(e,t)=>{let n=rr.getters.userUrl;t=t\|\|"_blank",n&&n.charAt(n.length-1)==="/"&&(n=n.slice(0,-1)),window.open(n+"/autoLogin?toPath="+encodeURIComponent(e)+"&token="+Ze.getToken(),t)}` |
| `dt` | index.1783320636200.js | entry | @/legacy `getAppConfig` | `()=>{let e=sessionStorage.getItem("appConfig")?sessionStorage.getItem("appConfig"):document.getElementsByTagName("head")[0].getAttribute("data-config");return JSON.parse(e)}` |
| `ct` | index.1783320636200.js | entry | @/legacy/api `queryHomeSettingById`（reserved） | `e=>IN("/xf-job/job/licenseFree/queryHomeSettingById",e,"post")` |
| `ut` | index.1783320636200.js | api | @/legacy/api `listOneForWebSite`（reserved） | `(e,t)=>ut.request({url:"/xf-job/communal/xfSysUser/listOneForWebSite",method:"get",params:e})` |
| `pt` | index.1783320636200.js | entry | @/legacy `useStore` | `function(e){return e===void 0&&(e=null),Ft(e!==null?e:Ru)}` |
| `mt` | index.1783320636200.js | api | @/legacy/api `recommendJobList`（reserved） | `e=>ut.request({url:"/xf-job/job/licenseFree/xfJobCompanyPosition/recommendJobList",method:"post",params:e})` |
| `gt` | index.1783320636200117.js | api | @/api/api-117 `checkIdCard` | `e=>o.request({url:"/xf-job/communal/xfSysUser/checkIdCard",method:"post",data:e})` |
| `fe` | index.1783320636200117.js | api | @/api/api-117 `saveForUserCenter` | `e=>o.request({url:"/xf-job/communal/xfSysUser/saveForUserCenter",method:"post",data:e})` |
| `Qe` | index.1783320636200117.js | api | @/api/api-117 `setCompleteStatus` | `e=>o.request({url:"/xf-job/communal/xfSysGuideRecord/setCompleteStatus",method:"post",params:e})` |
| `ft` | index.1783320636200117.js | api | @/api/api-117 `save` | `e=>o.request({url:"/xf-job/job/xfJobCurriculumVitae/save",method:"post",data:e})` |
| `vt` | index.1783320636200117.js | api | @/api/api-117 `list2` | `e=>o.request({url:"/xf-job/job/xfJobCurriculumVitae/list",method:"get",params:e})` |
| `yt` | index.1783320636200117.js | api | @/api/api-117 `beJobSeeker` | `e=>o.request({url:"/xf-job/communal/xfSysUserAuthenticateIdentity/beJobSeeker",method:"post",data:e})` |
| `xt` | index.1783320636200117.js | api | @/api/api-117 `addBatch` | `e=>o.request({url:"/xf-job/job/xfJobCurriculumVitaeDeliver/addBatch",method:"post",data:e})` |
| `Tt` | empty.1783320636200.js | shared | @/shared/empty.vue `default` | `x(i,[["render",s],["__scopeId","data-v-810a04d0"]])` |
| `se` | dictCode.1783320636200.js | shared | @/shared/dictCode.vue `default` | `S(i,[["render",p]])` |
| `Ct` | workType.1783320636200.js | shared | @/shared/workType.vue `default` | `ye(pe,[["__scopeId","data-v-c9091e07"]])` |
| `wt` | resumemodal.1783320636200.js | shared | @/shared/resumemodal.vue `default` | `D(r,[["__scopeId","data-v-30d15804"]])` |
| `At` | index.api.17833206362002.js | api | @/api/api-17833206362002 `add` | `e=>a.request({url:"/xf-job/job/xfJobUserCare/add",method:"get",params:e})` |
| `St` | index.api.17833206362002.js | api | @/api/api-17833206362002 `cancel` | `e=>a.request({url:"/xf-job/job/xfJobUserCare/cancel",method:"get",params:e})` |
| `Ut` | index.api.17833206362002.js | api | @/api/api-17833206362002 `queryIzCanDeliver` | `e=>a.request({url:"/xf-job/job/xfJobCurriculumVitae/queryIzCanDeliver",method:"get",params:e})` |
