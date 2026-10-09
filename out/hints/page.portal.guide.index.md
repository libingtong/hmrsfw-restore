# 导入提示：page.portal.guide.index

原 chunk `index.178332063620034.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `zt` | auth.1783320636200.js | shared | @/shared/auth.ts `a`（reserved） | `"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAWCAYAAADNX8xBAAABhElEQVQ4jaXUPWhVQRCG4UcxYgQTldQSESVgtFELwSKViuksxEqw0kpSBNFCBBsJQopooZVFUMFGsFBMiGCiCDYWWgiCWEgKsTCijf8MzJWb5dxzTPLBKXZ39j0zu9/sq` |
| `Ht` | auth.1783320636200.js | shared | @/shared/auth/OneContent.vue `default`（reserved） | `R(N,[["__scopeId","data-v-08282971"]])` |
| `Ue` | auth.1783320636200.js | shared | @/shared/auth/BackGround.vue `default`（reserved） | `R(i,[["__scopeId","data-v-b477bb74"]])` |
| `Yt` | auth.1783320636200.js | shared | @/shared/auth/ColumnContent.vue `default`（reserved） | `R(Z,[["__scopeId","data-v-edf344e0"]])` |
| `$t` | auth.1783320636200.js | shared | @/shared/auth.ts `_`（reserved） | `"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAATCAYAAAB7u5a2AAABtElEQVQ4ja2Vy0tVURSHP70pkuggFRzUoNB0HAU1ECfZ0EGDDMJJOoio/oEQonlQNJX+AUMnvRwIQqTQoJlwJz4G6SW81CSInl9sWAcOl/s4XlywOK+9vt/irLXX7lBpY` |
| `Kt` | index.1783320636200.js | entry | lodash-es `isObject` | `function(e){var t=typeof e;return e!=null&&(t=="object"\|\|t=="function")}` |
| `Qt` | index.1783320636200.js | entry | lodash-es `debounce` | `function(e,t,n){var r,a,o,i,l,c,s=0,f=!1,d=!1,v=!0;if(typeof e!="function")throw new TypeError(Kpe);t=M3(t)\|\|0,ha(n)&&(f=!!n.leading,d="maxWait"in n,o=d?qpe(M3(n.maxWait)\|\|0,t):o,v="trailing"in n?!!n.` |
| `qe` | index.1783320636200.js | entry | ant-design-vue `Form` | `Lxe` |
| `U` | index.1783320636200.js | entry | @/legacy `userStorage` | `{keys:!0,setUser(e){this.keys?localStorage.setItem(jn.USER_INFO,e):localStorage.setItem(jn.USER_INFO,JSON.stringify(e))},getUser(){const e=localStorage.getItem(jn.USER_INFO);if(e&&e!="undefined"&&e!="` |
| `Xt` | index.1783320636200.js | entry | @/legacy `validateIdCard` | `e=>{var t=[7,9,10,5,8,4,2,1,6,3,7,9,10,5,8,4,2],n=e+"";e[17];for(var r=n.substring(0,17),a=r.split(""),o=a.length,i=0,l=0;l<o;l++)i=i+a[l]*t[l];var c=/^\d{6}((((((19\|20)\d{2})(0[13-9]\|1[012])(0[1-9]\|[` |
| `Gt` | index.1783320636200.js | entry | @/legacy/utils `parseIdCard` | `e=>{let t=null,n=null,r=new Date,a=r.getMonth()+1,o=r.getDate(),i=0;return e.length===18&&(i=r.getFullYear()-e.substring(6,10)-1,t=e.substring(16,17),n=e.substring(6,10)+"-"+e.substring(10,12)+"-"+e.s` |
| `Jt` | index.1783320636200.js | entry | @/legacy/utils `isMobilePhone` | `e=>{var t=/^(13[0-9]\|14[01456879]\|15[0-35-9]\|16[2567]\|17[0-8]\|18[0-9]\|19[0-35-9])\d{8}$/;return!!t.test(e)}` |
| `Wt` | index.1783320636200.js | entry | dayjs `default` | `Rk(Owe)` |
| `oe` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `Ae` | index.1783320636200.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `je` | index.1783320636200.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `re` | index.1783320636200.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:Ut(O_e(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,t){va` |
| `Ce` | index.1783320636200.js | entry | @/legacy `openUserCenter` | `(e,t)=>{let n=rr.getters.userUrl;t=t\|\|"_blank",n&&n.charAt(n.length-1)==="/"&&(n=n.slice(0,-1)),window.open(n+"/autoLogin?toPath="+encodeURIComponent(e)+"&token="+Ze.getToken(),t)}` |
| `Pe` | index.1783320636200.js | entry | @/legacy `LoginModal` | `mt(nne,[["__scopeId","data-v-6ac82971"]])` |
| `Ie` | index.1783320636200.js | entry | @/legacy `checkLogin` | `function(e,t,n,r){const a=Ze.getUser(),o=Ze.getCorp();return console.log("\u5224\u65AD\u5F53\u524D\u8D26\u53F7\u662F\u5426\u767B\u5F55token",Ze.getToken(),a,o),new Promise((i,l)=>{if(!Ze.getToken()){i` |
| `ke` | index.1783320636200.js | entry | @/legacy `TEXT_GO_AUTH` | `"\u53BB\u8BA4\u8BC1"` |
| `Zt` | index.1783320636200.js | entry | @/legacy `MSG_CORP_NOT_AUTH` | `"\u5F53\u524D\u8D26\u6237\u5C1A\u672A\u8FDB\u884C\u5355\u4F4D\u8BA4\u8BC1\uFF0C\u8BA4\u8BC1\u901A\u8FC7\u540E\u65B9\u53EF\u62A5\u540D\u62DB\u8058\u4F1A"` |
| `Te` | index.1783320636200.js | entry | @/legacy `IDENTITY_CORP` | `1` |
| `Be` | index.1783320636200.js | entry | @/legacy/utils `MSG_CORP_NOT_CERTIFIED` | `"\u5F53\u524D\u8D26\u6237\u672A\u8BA4\u8BC1\u5355\u4F4D\u4FE1\u606F\uFF0C\u8BF7\u5148\u8BA4\u8BC1\u5355\u4F4D\u4FE1\u606F"` |
| `Oe` | index.1783320636200.js | entry | ant-design-vue `message` | `D1` |
| `ea` | index.1783320636200.js | entry | @/legacy `getAppConfig` | `()=>{let e=sessionStorage.getItem("appConfig")?sessionStorage.getItem("appConfig"):document.getElementsByTagName("head")[0].getAttribute("data-config");return JSON.parse(e)}` |
| `ta` | index.1783320636200.js | entry | @/legacy/api `queryHomeSettingById` | `e=>IN("/xf-job/job/licenseFree/queryHomeSettingById",e,"post")` |
| `aa` | index.1783320636200.js | entry | @/legacy `useStore` | `function(e){return e===void 0&&(e=null),Ft(e!==null?e:Ru)}` |
| `ia` | index.1783320636200117.js | api | @/api/jobCompany `checkIdCard` | `e=>o.request({url:"/xf-job/communal/xfSysUser/checkIdCard",method:"post",data:e})` |
| `we` | index.1783320636200117.js | api | @/api/jobCompany `saveForUserCenter` | `e=>o.request({url:"/xf-job/communal/xfSysUser/saveForUserCenter",method:"post",data:e})` |
| `de` | index.1783320636200117.js | entry | @/api/jobCompany `o`（reserved） | `p({},b)` |
| `sa` | index.1783320636200117.js | api | @/api/jobCompany `isPublishingPosition` | `e=>o.request({url:"/xf-job/job/xfJobCompany/isPublishingPosition",method:"get",params:e})` |
| `na` | index.1783320636200117.js | api | @/api/jobCompany `addTalent` | `e=>o.request({url:"/xf-job/job/xfJobCompanyTalents/addTalent",method:"post",data:e})` |
| `oa` | index.1783320636200117.js | api | @/api/jobCompany `cancelTalent` | `e=>o.request({url:"/xf-job/job/xfJobCompanyTalents/cancelTalent",method:"post",params:e})` |
| `ra` | index.1783320636200117.js | api | @/api/jobCompany `queryById` | `e=>o.request({url:"/xf-job/communal/xfSysUser/queryById",method:"get",params:e})` |
| `da` | index.1783320636200117.js | api | @/api/jobCompany `setCompleteStatus` | `e=>o.request({url:"/xf-job/communal/xfSysGuideRecord/setCompleteStatus",method:"post",params:e})` |
| `Fe` | empty.1783320636200.js | shared | @/shared/empty.vue `default` | `x(i,[["render",s],["__scopeId","data-v-810a04d0"]])` |
| `De` | dictCode.1783320636200.js | shared | @/shared/dictCode.vue `default` | `S(i,[["render",p]])` |
| `pa` | industryCode.1783320636200.js | shared | @/shared/industryCode.vue `default` | `S(i,[["render",d]])` |
| `va` | city.1783320636200.js | shared | @/shared/city.vue `default` | `oe(J,[["__scopeId","data-v-911d64a4"]])` |
| `ba` | workType.1783320636200.js | shared | @/shared/workType.vue `default` | `ye(pe,[["__scopeId","data-v-c9091e07"]])` |
| `ya` | InterviewInvitation.1783320636200.js | shared | @/shared/InterviewInvitation.vue `default`（reserved） | `A(g,[["__scopeId","data-v-699372eb"]])` |
