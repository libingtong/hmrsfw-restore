# 导入提示：page.uc.unRegister

原 chunk `unRegister.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `p` | index.1751615607545.js | api | @/legacy `getDictValueByCodeAndItems` | `t=>Ee.request({url:"/xf-job/job/licenseFree/getDictValueByCodeAndItems",method:"post",params:t})` |
| `s` | index.1751615607545.js | entry | @/legacy `userStorage` | `{keys:!0,setUser(t){this.keys?localStorage.setItem("userInfo",t):localStorage.setItem("userInfo",JSON.stringify(t))},getUser(){const t=localStorage.getItem("userInfo");if(t&&t!="undefined"&&t!="null")` |
| `g` | index.1751615607545.js | api | @/legacy `verifyUserInfoByPhone` | `t=>Ee.request({url:"/xf-job//communal/licenseFree/verifyUserInfoByPhone",method:"get",params:t})` |
| `m` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `_` | ZgIframe.1751615607545.js | shared | @/shared/ZgIframe.vue `default` | `n(v,[["__scopeId","data-v-82eca9fd"]])` |
| `v` | WebSockets.1751615607545.js | shared | @/shared/WebSockets.ts `getWsBaseUrl` | `()=>{let o="";return(o.startsWith("http")?o:window.location.origin).replace("https://","wss://").replace("http://","ws://")}` |
| `d` | WebSockets.1751615607545.js | shared | @/shared/WebSockets.ts `createWebSocket` | `function p(o,l,s,d,r){if(!o)return;let c=!0,n=!0,i=null,g=r\|\|15e3,e=null;return f(),a(),{ws:e,sendMessage:w,closeWs:R};function f(){e=new WebSocket(o),e.onopen=function(){l&&l()},e.onmessage=function(` |
