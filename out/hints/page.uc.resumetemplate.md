# 导入提示：page.uc.resumetemplate

原 chunk `resumetemplate.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `N` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `u` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `S` | index.1751615607545.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `P` | index.1751615607545.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `w` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `R` | index.api.17516156075456.js | api | @/api/api-56 `vitaeTempListForUserContent` | `e=>t.request({url:"/xf-job/job/xfJobVitaeTemplate/vitaeTempListForUserContent",method:"post",data:e,headers:{"Content-Type":"application/x-www-form-urlencoded"}})` |
| `U` | index.api.17516156075456.js | api | @/api/api-56 `saveVitaeTemplateId` | `e=>t.request({url:"/xf-job/job/xfJobCurriculumVitae/saveVitaeTemplateId",method:"post",data:e,headers:{"Content-Type":"application/x-www-form-urlencoded"}})` |
