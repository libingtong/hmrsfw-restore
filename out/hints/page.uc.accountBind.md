# 导入提示：page.uc.accountBind

原 chunk `accountBind.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `p` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `w` | index.1751615607545.js | api | @/legacy `getDictItemsByCode` | `t=>Ee.request({url:"/jeecg-system/sys/dict/getDictItemsByCode",method:"get",params:t})` |
| `z` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `g` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `k` | index.api.17516156075453.js | api | @/api/api-17516156075453 `userBindInfo` | `e=>s.request({url:"/xf-job/communal/xfSysUserThirdAssociation/userBindInfo",method:"post",params:e})` |
| `m` | index.api.17516156075453.js | api | @/api/api-17516156075453 `deleteItem` | `e=>s.request({url:"/xf-job/communal/xfSysUserThirdAssociation/delete",method:"post",params:e})` |
