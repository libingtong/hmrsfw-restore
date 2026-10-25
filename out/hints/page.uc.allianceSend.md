# 导入提示：page.uc.allianceSend

原 chunk `AllianceSend.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `M` | index.api.17516156075456.js | api | @/api/jobCurriculumVitae `listForUserContent2` | `e=>t.request({url:"/xf-alliance/alliance/curriculumVitaeDeliver/listForUserContent",method:"get",params:e})` |
| `A` | index.api.17516156075456.js | api | @/api/jobCurriculumVitae `add6` | `e=>t.request({url:"/xf-job/job/xfJobUserCare/add",method:"get",params:e})` |
| `B` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `k` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `E` | index.1751615607545.js | api | @/legacy/api `cancel`（reserved） | `t=>Ee.request({url:"/xf-job/job/xfJobUserCare/cancel",method:"get",params:t})` |
| `F` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `L` | dictCode.1751615607545.js | shared | @/shared/dictCode.vue `default` | `c(v,[["render",S]])` |
| `R` | complaint.1751615607545.js | shared | @/shared/complaint.vue `default`（reserved） | `D(H,[["__scopeId","data-v-53260816"]])` |
