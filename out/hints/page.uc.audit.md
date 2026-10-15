# 导入提示：page.uc.audit

原 chunk `audit.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `J` | index.api.17516156075454.js | api | @/api/sysConsult `list` | `e=>t.request({url:"/xf-job/communal/xfSysUserAuthenticateIdentityRecord/list",method:"get",params:e})` |
| `K` | index.api.1751615607545.js | api | @/api/jobSupermarketMerchants `queryByUserId` | `e=>t.request({url:"/xf-job/communal/xfSysUserAuthenticateIdentityItem/queryByUserId",method:"post",params:e})` |
| `P` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `B` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `W` | index.1751615607545.js | api | @/legacy `getDictItemsByCode` | `t=>Ee.request({url:"/jeecg-system/sys/dict/getDictItemsByCode",method:"get",params:t})` |
