# 导入提示：page.uc.login

原 chunk `index.175161560754526.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `o` | index.1751615607545.js | entry | @/legacy/store `usePermissStore`（reserved） | `d0("permiss",{state:()=>{const t=localStorage.getItem("ms_keys");return{key:t?JSON.parse(t):[],defaultList:{admin:["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16"],user:["1","2"` |
| `a` | index.1751615607545.js | entry | @/legacy/utils `removeUrlParam`（reserved） | `(t,e)=>{let n=t.split("?");if(n.length>=2){let r=encodeURIComponent(e)+"=",a=n[1].split(/[&;]/g);for(let i=a.length;i-- >0;)a[i].lastIndexOf(r,0)!==-1&&a.splice(i,1);return n[0]+(a.length>0?"?"+a.join` |
| `r` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
