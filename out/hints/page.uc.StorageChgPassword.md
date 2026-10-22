# 导入提示：page.uc.StorageChgPassword

原 chunk `changepassword.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `O` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `E` | index.1751615607545.js | entry | @/legacy `validatePassword` | `function Ggt(t,e,n){let r=/^(?=.*[0-9].*)(?=.*[A-Z].*)(?=.*[a-z].*).{8,}$/;if(localStorage.getItem("pwdSymbols")&&localStorage.getItem("pwdSymbols")!=""){let a=localStorage.getItem("pwdSymbols"),i=a==` |
| `L` | index.1751615607545.js | api | @/legacy `getSettingValueByCode` | `t=>Ee.request({url:"/xf-job/communal/xfSysBusinessSetting/getSettingValueByCode",method:"get",params:t})` |
| `q` | index.1751615607545.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:xt(Cdt(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,n){va` |
| `$` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `X` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `H` | index.api.17516156075453.js | api | @/api/api-17516156075453 `changePwdWithSmsCode` | `e=>s.request({url:"/xf-job/extend/user/changePwdWithSmsCode",method:"post",data:e})` |
| `J` | index.api.17516156075453.js | api | @/api/api-17516156075453 `updatePassword` | `e=>s.request({url:"/xf-job/extend/user/updatePassword",method:"put",data:e})` |
| `Q` | SlideCaptcha.vue_vue_type_style_index_0_lang.1751615607545.js | shared | @/shared/SlideCaptcha.vue `default` | `Nr({__name:"SlideCaptcha",props:{type:{type:String,default:"0"},phone:{type:String,default:""},smsmode:{type:String,default:"1"}},emits:["timerCount"],setup(Z,{expose:lt,emit:je}){const dt=Z,S=Pr({sho` |
