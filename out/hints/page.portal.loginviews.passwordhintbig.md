# 导入提示：page.portal.loginviews.passwordhintbig

原 chunk `passwordhintbig.1783320636200.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `ue` | index.1783320636200.js | entry | @/legacy `getAppConfig` | `()=>{let e=sessionStorage.getItem("appConfig")?sessionStorage.getItem("appConfig"):document.getElementsByTagName("head")[0].getAttribute("data-config");return JSON.parse(e)}` |
| `ne` | index.1783320636200.js | entry | @/legacy/utils `validatePassword`（reserved） | `function(e,t,n){var a;let r=/^(?=.*[0-9].*)(?=.*[A-Z].*)(?=.*[a-z].*).{8,}$/;if(localStorage.getItem("pwdSymbols")&&localStorage.getItem("pwdSymbols")!=""){let o=(a=localStorage.getItem("pwdSymbols"))` |
| `H` | index.1783320636200.js | api | @/legacy `getSettingValueByCode` | `e=>ut.request({url:"/xf-job/job/licenseFree/xfSysBusinessSetting/getSettingValueByCode",method:"get",params:e})` |
| `ce` | index.1783320636200.js | entry | @/legacy `SlideCaptcha`（reserved） | `re({__name:"SlideCaptcha",props:{type:{type:String,default:"0"},phone:{type:String,default:""},smsmode:{type:String,default:"1"},fromType:{type:String,default:"1"}},emits:["timerCount"],setup(e,{expos` |
| `h` | index.1783320636200.js | entry | ant-design-vue `message` | `D1` |
| `pe` | index.1783320636200.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:Ut(O_e(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,t){va` |
| `ie` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `me` | index.api.178332063620028.js | api | @/api/user `sms`（reserved） | `o=>s.request({url:"/xf-job/school/user/sms",method:"post",data:o})` |
| `ve` | index.api.178332063620028.js | api | @/api/user `checkVerifycode`（reserved） | `o=>s.request({url:"/xf-job/job/licenseFree/checkVerifycode",method:"post",data:o})` |
| `ge` | index.api.178332063620028.js | api | @/api/user `passwordChangeByJson`（reserved） | `o=>s.request({url:"/xf-job/job/licenseFree/passwordChangeByJson",method:"post",data:o})` |
