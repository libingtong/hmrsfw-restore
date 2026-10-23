# 导入提示：page.uc.enterprisetemplate

原 chunk `enterprisetemplate.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `Z` | dictCode.1751615607545.js | shared | @/shared/dictCode.vue `default` | `c(v,[["render",S]])` |
| `V` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `_` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `G` | index.1751615607545.js | entry | dayjs `default` | `Oa(Trt)` |
| `H` | index.1751615607545.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `Q` | index.1751615607545.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `W` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `ee` | index.api.17516156075456.js | api | @/api/api-56 `vitaeTempListByType` | `e=>t.request({url:"/job/xfJobVitaeTemplate/vitaeTempListByType",method:"post",data:e,headers:{"Content-Type":"application/x-www-form-urlencoded"}})` |
| `te` | index.api.17516156075456.js | api | @/api/api-56 `listNewForPoster` | `e=>t.request({url:"/xf-job/job/xfJobCompanyPosition/listNewForPoster",method:"post",data:e,headers:{"Content-Type":"application/x-www-form-urlencoded"}})` |
| `ae` | index.api.17516156075456.js | api | @/api/api-56 `generatePoster4PC` | `e=>t.request({url:"/xf-job/job/xfJobCompany/generatePoster4PC",method:"post",responseType:"blob",data:e})` |
