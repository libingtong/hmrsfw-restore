# 导入提示：page.uc.mynews

原 chunk `mynews.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `q` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `F` | index.1751615607545.js | api | @/legacy/api `queryAnnouncementList`（reserved） | `t=>Ee.request({url:"/xf-common/common/xfAnnouncementSendRedcord/queryAnnouncementList",method:"post",params:t})` |
| `L` | index.1751615607545.js | api | @/legacy/api `queryNoReaded`（reserved） | `t=>Ee.request({url:"/xf-common/common/xfAnnouncementSendRedcord/queryNoReaded",method:"post",params:t})` |
| `W` | index.1751615607545.js | api | @/legacy/api `setAllReaded`（reserved） | `t=>Ee.request({url:"/xf-common/common/xfAnnouncementSendRedcord/setAllReaded",method:"post",params:t})` |
| `B` | index.1751615607545.js | api | @/legacy/api `setReaded`（reserved） | `t=>Ee.request({url:"/xf-common/common/xfAnnouncementSendRedcord/setReaded",method:"post",params:t})` |
| `U` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
