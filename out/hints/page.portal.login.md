# 导入提示：page.portal.login

原 chunk `login.17833206362002.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `Oa` | index.1783320636200.js | entry | lodash-es `toInteger` | `function(e){var t=u8e(e),n=t%1;return t===t?n?t-n:t:0}` |
| `Za` | index.1783320636200.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `qa` | index.1783320636200.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `xe` | index.1783320636200.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:Ut(O_e(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,t){va` |
| `we` | index.1783320636200.js | entry | @/legacy `openUserCenter` | `(e,t)=>{let n=rr.getters.userUrl;t=t\|\|"_blank",n&&n.charAt(n.length-1)==="/"&&(n=n.slice(0,-1)),window.open(n+"/autoLogin?toPath="+encodeURIComponent(e)+"&token="+Ze.getToken(),t)}` |
| `pe` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `Se` | index.1783320636200.js | entry | @/legacy `getAppConfig` | `()=>{let e=sessionStorage.getItem("appConfig")?sessionStorage.getItem("appConfig"):document.getElementsByTagName("head")[0].getAttribute("data-config");return JSON.parse(e)}` |
| `Wa` | index.1783320636200.js | api | @/legacy `getDictValueByCodeAndItems` | `e=>ut.request({url:"/xf-job/job/licenseFree/getDictValueByCodeAndItems",method:"post",params:e})` |
| `Y` | index.1783320636200.js | api | @/legacy `getSettingValueByCode` | `e=>ut.request({url:"/xf-job/job/licenseFree/xfSysBusinessSetting/getSettingValueByCode",method:"get",params:e})` |
| `Ga` | index.1783320636200.js | entry | @/legacy/utils `PAGE_LOAD_TIMESTAMP`（reserved） | `Date.parse(new Date)` |
| `q` | index.1783320636200.js | entry | @/legacy `userStorage` | `{keys:!0,setUser(e){this.keys?localStorage.setItem(jn.USER_INFO,e):localStorage.setItem(jn.USER_INFO,JSON.stringify(e))},getUser(){const e=localStorage.getItem(jn.USER_INFO);if(e&&e!="undefined"&&e!="` |
| `Qa` | index.1783320636200.js | entry | @/legacy/api `logout`（reserved） | `e=>ut.request({url:LN.logout,method:"get",params:e})` |
| `Fa` | index.1783320636200.js | entry | @/legacy/api `randomImage`（reserved） | `e=>ut.request({url:hte.randomImage,method:"get",params:e})` |
| `Va` | index.1783320636200.js | entry | @/legacy `getDictItemsByCode` | `e=>IN("/jeecg-system/sys/dict/getDictItemsByCode",e,"get")` |
| `Xa` | index.1783320636200.js | entry | @/legacy/api `queryHomeSettingById`（reserved） | `e=>IN("/xf-job/job/licenseFree/queryHomeSettingById",e,"post")` |
| `_e` | index.1783320636200.js | entry | @/legacy `SettingCodes` | `(e=>(e.BTN_PERMISS="btn_permiss",e.UNIFYLOGINURL="unifyLoginUrl",e.UNITELOGINURL="uniteLoginUrl",e.GO_MINI_PROGRAM_PREFIX="go_mini_program_prefix",e.WX_URL="wx_url",e.QRCODE_TYPE="qrcode_type",e.FAIRS` |
| `Ja` | index.1783320636200.js | entry | @/legacy/components/Phone.vue `default`（reserved） | `mt(hEt,[["render",mEt]])` |
| `Ya` | index.1783320636200.js | entry | @/legacy `SlideCaptcha`（reserved） | `re({__name:"SlideCaptcha",props:{type:{type:String,default:"0"},phone:{type:String,default:""},smsmode:{type:String,default:"1"},fromType:{type:String,default:"1"}},emits:["timerCount"],setup(e,{expos` |
| `Ha` | index.1783320636200.js | entry | @/legacy `useStore` | `function(e){return e===void 0&&(e=null),Ft(e!==null?e:Ru)}` |
| `H` | index.1783320636200.js | entry | ant-design-vue `message` | `D1` |
| `Ka` | index.1783320636200.js | api | @/legacy/api `login`（reserved） | `e=>ut.request({url:"/xf-job/school/user/login",method:"post",data:e})` |
| `$a` | index.1783320636200.js | api | @/legacy/api `phoneLogin`（reserved） | `e=>ut.request({url:"/xf-job/school/user/phoneLogin",method:"post",data:e})` |
| `el` | index.1783320636200.js | entry | @/legacy/utils `handleLoginSuccess`（reserved） | `e=>{let t=e.data,n=t.result.userInfo,r=t.result.token?t.result.token:"";Ze.setToken(r),Ze.setUser(n);let a;if(Ze.keys?a=JSON.parse(Ze.getKey(n)):a=n,a){let o=a.avatar;o&&Ze.setAvatar(o)}}` |
| `al` | index.1783320636200.js | api | @/legacy/api `listOneForWebSite`（reserved） | `(e,t)=>ut.request({url:"/xf-job/communal/xfSysUser/listOneForWebSite",method:"get",params:e})` |
| `ll` | index.1783320636200.js | entry | @/legacy/utils `handleXfSysUserLoaded`（reserved） | `e=>{let t=e.result.records;Ze.setXfSysUser(t[0]);let n=Ze.getUser(),r=Ze.getXfSysUser();if(n.sysUserId=n.id,n.id=r.id,n.realnameCopy=n.realname,n.realname=r.realName,n.realName=n.realname,n.sensitiveR` |
| `tl` | index.1783320636200.js | api | @/legacy/api `getCompanyInfo`（reserved） | `e=>ut.request({url:"/xf-job/job/xfJobCompany/getCompanyInfo",method:"get",params:e})` |
| `nl` | thirdParty.1783320636200.js | shared | @/shared/thirdParty.vue `default`（reserved） | `S(C,[["__scopeId","data-v-3786db17"]])` |
| `ul` | index.1783320636200117.js | api | @/api/api-117 `getCompleteStatus` | `e=>o.request({url:"/xf-job/communal/xfSysGuideRecord/getCompleteStatus",method:"post",params:e})` |
| `dl` | index.1783320636200117.js | api | @/api/api-117 `list` | `e=>o.request({url:"/xf-job/communal/xfSysGuide/list",method:"get",params:e})` |
| `pl` | index.1783320636200117.js | api | @/api/api-117 `setCompleteStatus` | `e=>o.request({url:"/xf-job/communal/xfSysGuideRecord/setCompleteStatus",method:"post",params:e})` |
