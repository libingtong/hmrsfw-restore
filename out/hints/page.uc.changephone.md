# 导入提示：page.uc.changephone

原 chunk `changephone.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `M` | phone.1751615607545.js | shared | @/shared/phone.vue `default` | `u(d,[["render",m]])` |
| `E` | index.api.17516156075453.js | api | @/api/user `check` | `e=>s.request({url:"/jeecg-system/sys/duplicate/check",method:"get",params:e})` |
| `G` | index.api.17516156075453.js | api | @/api/user `phoneVerification` | `e=>s.request({url:"/jeecg-system/sys/user/phoneVerification",method:"post",data:e})` |
| `H` | index.api.17516156075453.js | api | @/api/user `changePhone` | `e=>s.request({url:"/xf-job/communal/xfSysUser/changePhone",method:"post",data:e})` |
| `W` | SlideCaptcha.vue_vue_type_style_index_0_lang.1751615607545.js | shared | @/shared/SlideCaptcha.vue `default` | `Nr({__name:"SlideCaptcha",props:{type:{type:String,default:"0"},phone:{type:String,default:""},smsmode:{type:String,default:"1"}},emits:["timerCount"],setup(Z,{expose:lt,emit:je}){const dt=Z,S=Pr({sho` |
| `ee` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `$` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `oe` | index.1751615607545.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:xt(Cdt(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,n){va` |
| `se` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
