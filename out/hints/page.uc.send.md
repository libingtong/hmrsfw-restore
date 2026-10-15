# 导入提示：page.uc.send

原 chunk `send.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `A` | index.api.17516156075456.js | api | @/api/jobCurriculumVitae `listForUserContent` | `e=>t.request({url:"/xf-job/job/xfJobCurriculumVitaeDeliver/listForUserContent",method:"get",params:e})` |
| `L` | index.api.17516156075456.js | api | @/api/jobCurriculumVitae `add6` | `e=>t.request({url:"/xf-job/job/xfJobUserCare/add",method:"get",params:e})` |
| `Q` | index.api.17516156075456.js | api | @/api/jobCurriculumVitae `undoAllComplaintByType` | `e=>t.request({url:"/xf-job/job/xfJobComplaintRecord/undoAllComplaintByType",method:"post",params:e})` |
| `J` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `k` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `W` | index.1751615607545.js | api | @/legacy/api `cancel` | `t=>Ee.request({url:"/xf-job/job/xfJobUserCare/cancel",method:"get",params:t})` |
| `X` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `Y` | dictCode.1751615607545.js | shared | @/shared/dictCode.vue `default` | `c(v,[["render",S]])` |
| `Z` | complaint.1751615607545.js | shared | @/shared/complaint.vue `default`（reserved） | `D(H,[["__scopeId","data-v-53260816"]])` |
