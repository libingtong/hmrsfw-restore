# 导入提示：shared.uc.usercard

原 chunk `usercard.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `i` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `b` | index.1751615607545.js | api | @/legacy/api `listOneForWebSite` | `t=>Ee.request({url:"/xf-job/communal/xfSysUser/listOneForWebSite",method:"get",params:t})` |
| `_` | index.1751615607545.js | entry | @/legacy `decryptText` | `t=>{if(t&&typeof t=="string")try{return Df.sm4.decrypt(t,yC)}catch(e){return console.error("解密失败:",e),null}else return null}` |
| `y` | index.1751615607545.js | entry | @/legacy `parseIdCard` | `t=>{let e=null,n=null,r=new Date,a=r.getMonth()+1,i=r.getDate(),o=0;return t.length===18&&(o=r.getFullYear()-t.substring(6,10)-1,e=t.substring(16,17),n=t.substring(6,10)+"-"+t.substring(10,12)+"-"+t.s` |
| `v` | index.1751615607545.js | entry | dayjs `default` | `Oa(Trt)` |
| `I` | index.1751615607545.js | entry | @/legacy/utils `maskPhone3` | `t=>t?String(t).replace(/^(.{3})(?:\w+)(.{3})$/,"$1****$2"):""` |
| `g` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `k` | index.api.17516156075452.js | api | @/api/sysUser `queryByIdJM` | `e=>t.request({url:"/xf-job/communal/xfSysUser/queryByIdJM",method:"get",params:e})` |
