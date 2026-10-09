# 导入提示：page.uc.recruitmentInformation

原 chunk `index.175161560754518.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `ie` | dictCode.1751615607545.js | shared | @/shared/dictCode.vue `default` | `c(v,[["render",S]])` |
| `se` | index.api.175161560754518.js | api | @/api/sysArticle `getArticleListForRecruitment` | `t=>e.request({url:"/xf-job/communal/xfSysArticle/getArticleListForRecruitment",method:"post",data:t})` |
| `le` | index.api.175161560754518.js | api | @/api/sysArticle `queryById` | `t=>e.request({url:"/xf-job/communal/xfSysArticle/queryById",method:"get",params:t})` |
| `ce` | index.api.175161560754518.js | api | @/api/sysArticle `setPublish` | `t=>e.request({url:"/xf-job/communal/xfSysArticle/setPublish",method:"post",params:t})` |
| `V` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `O` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `re` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
