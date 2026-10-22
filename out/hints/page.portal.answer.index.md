# 导入提示：page.portal.answer.index

原 chunk `index.178332063620016.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `qe` | wenjuan.1783320636200.js | shared | @/shared/images `wenjuanImg` | `"/zcyz/wenjuan.jpg"` |
| `ze` | index.1783320636200.js | entry | @/legacy `getAppConfig` | `()=>{let e=sessionStorage.getItem("appConfig")?sessionStorage.getItem("appConfig"):document.getElementsByTagName("head")[0].getAttribute("data-config");return JSON.parse(e)}` |
| `O` | index.1783320636200.js | entry | @/legacy `userStorage` | `{keys:!0,setUser(e){this.keys?localStorage.setItem(jn.USER_INFO,e):localStorage.setItem(jn.USER_INFO,JSON.stringify(e))},getUser(){const e=localStorage.getItem(jn.USER_INFO);if(e&&e!="undefined"&&e!="` |
| `Ce` | index.1783320636200.js | api | @/legacy/api `getXfSysUserInfo`（reserved） | `e=>ut.request({url:"/xf-job/communal/licenseFree/xfSysUser/getXfSysUserInfo",method:"post",headers:{"X-Access-Token":e}})` |
| `be` | index.1783320636200.js | entry | @/legacy `LoginModal`（reserved） | `mt(nne,[["__scopeId","data-v-6ac82971"]])` |
| `j` | index.1783320636200.js | entry | @/legacy `checkPerfect` | `function(){return new Promise((e,t)=>{const n=Ze.getUser();console.log("\u6253\u5370userinfo",n),vi({xfSysUserId:n.id}).then(r=>{r.result=="true"?e(1):(Kt.confirm({title:"\u6E29\u99A8\u63D0\u793A",con` |
| `l` | index.1783320636200.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:Ut(O_e(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,t){va` |
| `Le` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `Be` | index.api.178332063620011.js | api | @/api/quenaire `List`（reserved） | `e=>a.request({url:"/xf-job/communal/licenseFree/quenaire/List",method:"post",params:e})` |
| `Oe` | index.api.178332063620011.js | api | @/api/quenaire `izLogin`（reserved） | `e=>a.request({url:"/xf-job/communal/licenseFree/quenaire/izLogin",method:"post",params:e})` |
| `E` | index.api.178332063620011.js | api | @/api/quenaire `izEnter`（reserved） | `e=>a.request({url:"/xf-job/communal/xfSysQuenaire/record/izEnter",method:"post",params:e})` |
| `Ie` | empty.1783320636200.js | shared | @/shared/empty.vue `default` | `x(i,[["render",s],["__scopeId","data-v-810a04d0"]])` |
