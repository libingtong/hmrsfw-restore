# 导入提示：page.uc.RecIntResume

原 chunk `RecIntResume.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `F` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `ie` | index.1751615607545.js | api | @/legacy/api `queryPageListByCompanyId` | `t=>Ee.request({url:"/xf-job/job/xfJobCurriculumVitaeDeliver/queryPageListByCompanyId",method:"get",params:t})` |
| `ne` | index.1751615607545.js | api | @/legacy/api `isPublishingPosition` | `t=>Ee.request({url:"/xf-job/job/xfJobCompany/isPublishingPosition",method:"get",params:t})` |
| `O` | index.1751615607545.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:xt(Cdt(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,n){va` |
| `se` | index.1751615607545.js | api | @/legacy/api `addTalent` | `t=>Ee.request({url:"/xf-job/job/xfJobCompanyTalents/addTalent",method:"post",data:t})` |
| `le` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `ce` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `U` | dictCode.1751615607545.js | shared | @/shared/dictCode.vue `default` | `c(v,[["render",S]])` |
| `ue` | setStatusinterview.1751615607545.js | shared | @/shared/setStatusinterview.vue `default` | `B(A,[["__scopeId","data-v-99a2d30a"]])` |
| `re` | InterviewInvitation.17516156075452.js | shared | @/shared/InterviewInvitation.vue `default` | `E(ae,[["__scopeId","data-v-85ce95bb"]])` |
