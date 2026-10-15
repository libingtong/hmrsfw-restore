# 导入提示：page.uc.consult

原 chunk `consult.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `j` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `A` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `D` | index.api.17516156075454.js | api | @/api/sysConsult `queryListForUserCenter` | `e=>t.request({url:"/xf-job/job/xfSysConsult/queryListForUserCenter",method:"get",params:e})` |
| `E` | dictCode.1751615607545.js | shared | @/shared/dictCode.vue `default` | `c(v,[["render",S]])` |
| `Q` | metormodal.1751615607545.js | shared | @/shared/metormodal.vue `default`（reserved） | `q(Ee,[["__scopeId","data-v-73e6c7c9"]])` |
