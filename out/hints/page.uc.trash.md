# 导入提示：page.uc.trash

原 chunk `trash.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `f` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `O` | index.1751615607545.js | api | @/legacy/api `queryCompanyTalentlist` | `t=>Ee.request({url:"/xf-job/job/xfJobCompanyTalents/queryCompanyTalentlist",method:"get",params:t})` |
| `j` | index.1751615607545.js | api | @/legacy/api `restoreTalent` | `t=>Ee.request({url:"/xf-job/job/xfJobCompanyTalents/restoreTalent",method:"post",params:t})` |
| `A` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `D` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `X` | InterviewInvitation.17516156075452.js | shared | @/shared/InterviewInvitation.vue `default` | `E(ae,[["__scopeId","data-v-85ce95bb"]])` |
