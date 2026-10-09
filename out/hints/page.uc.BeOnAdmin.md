# 导入提示：page.uc.BeOnAdmin

原 chunk `BeOnAdmin.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `D` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `re` | index.1751615607545.js | api | @/legacy/api `listNew` | `t=>Ee.request({url:"/xf-job/job/xfJobCompanyPosition/listNew",method:"get",params:t})` |
| `pe` | index.1751615607545.js | api | @/legacy `getDictItemsByCode` | `t=>Ee.request({url:"/jeecg-system/sys/dict/getDictItemsByCode",method:"get",params:t})` |
| `I` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `R` | index.1751615607545.js | api | @/legacy/api `enableAuseBatch` | `t=>Ee.request({url:"/xf-job/job/xfJobCompanyPosition/enableAuseBatch",method:"post",params:t})` |
| `me` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `K` | dictCode.1751615607545.js | shared | @/shared/dictCode.vue `default` | `c(v,[["render",S]])` |
| `_e` | positionmodal.1751615607545.js | shared | @/shared/positionmodal.vue `default` | `B(X,[["__scopeId","data-v-0ff88674"]])` |
| `fe` | beonmodal.1751615607545.js | shared | @/shared/beonmodal.vue `default` | `h(A,[["__scopeId","data-v-1e6b66f8"]])` |
