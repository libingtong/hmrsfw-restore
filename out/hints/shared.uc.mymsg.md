# 导入提示：shared.uc.mymsg

原 chunk `mymsg.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `B` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `A` | index.1751615607545.js | api | @/legacy/api `queryAnnouncementList` | `t=>Ee.request({url:"/xf-common/common/xfAnnouncementSendRedcord/queryAnnouncementList",method:"post",params:t})` |
| `L` | index.1751615607545.js | entry | @/legacy/utils `stripHtml` | `t=>{let e="";if(t){let n=/<[^>]+>/g;e=t.replace(n,"")}return e}` |
| `R` | index.1751615607545.js | api | @/legacy/api `queryNoReaded` | `t=>Ee.request({url:"/xf-common/common/xfAnnouncementSendRedcord/queryNoReaded",method:"post",params:t})` |
| `T` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
