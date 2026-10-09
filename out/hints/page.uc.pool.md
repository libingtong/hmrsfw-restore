# 导入提示：page.uc.pool

原 chunk `pool.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `k` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `D` | index.1751615607545.js | api | @/legacy/api `queryCompanyTalentlist`（reserved） | `t=>Ee.request({url:"/xf-job/job/xfJobCompanyTalents/queryCompanyTalentlist",method:"get",params:t})` |
| `E` | index.1751615607545.js | api | @/legacy/api `removeTalent`（reserved） | `t=>Ee.request({url:"/xf-job/job/xfJobCompanyTalents/removeTalent",method:"post",params:t})` |
| `J` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `Q` | index.1751615607545.js | api | @/legacy/api `isPublishingPosition`（reserved） | `t=>Ee.request({url:"/xf-job/job/xfJobCompany/isPublishingPosition",method:"get",params:t})` |
| `K` | index.1751615607545.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:xt(Cdt(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,n){va` |
| `X` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `L` | InterviewInvitation.17516156075452.js | shared | @/shared/InterviewInvitation.vue `default` | `E(ae,[["__scopeId","data-v-85ce95bb"]])` |
