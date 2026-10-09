# 导入提示：page.uc.downnoviciate

原 chunk `downnoviciate.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `P` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `K` | index.1751615607545.js | api | @/legacy/api `queryPageInterviewListByCompanyId`（reserved） | `t=>Ee.request({url:"/xf-job/job/xfJobInterviewInvitation/queryPageInterviewListByCompanyId",method:"get",params:t})` |
| `W` | index.1751615607545.js | api | @/legacy/api `isPublishingPosition`（reserved） | `t=>Ee.request({url:"/xf-job/job/xfJobCompany/isPublishingPosition",method:"get",params:t})` |
| `ee` | index.1751615607545.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:xt(Cdt(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,n){va` |
| `te` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `ae` | dictCode.1751615607545.js | shared | @/shared/dictCode.vue `default` | `c(v,[["render",S]])` |
| `ie` | setStatusinterview.1751615607545.js | shared | @/shared/setStatusinterview.vue `default` | `B(A,[["__scopeId","data-v-99a2d30a"]])` |
| `ne` | InterviewInvitation.17516156075452.js | shared | @/shared/InterviewInvitation.vue `default` | `E(ae,[["__scopeId","data-v-85ce95bb"]])` |
