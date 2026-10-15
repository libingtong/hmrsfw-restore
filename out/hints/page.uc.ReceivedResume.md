# 导入提示：page.uc.ReceivedResume

原 chunk `ReceivedResume.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `O` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `we` | index.1751615607545.js | api | @/legacy `getDictItemsByCode` | `t=>Ee.request({url:"/jeecg-system/sys/dict/getDictItemsByCode",method:"get",params:t})` |
| `Ne` | index.1751615607545.js | api | @/legacy `getSettingValueByCode` | `t=>Ee.request({url:"/xf-job/communal/xfSysBusinessSetting/getSettingValueByCode",method:"get",params:t})` |
| `Ce` | index.1751615607545.js | entry | @/legacy `SettingCodes` | `(t=>(t.WEBPORTAL_DOMAIN="webportal_domain",t.USER_CENTE_RDEFAULT_NAME="userCenterDefaultName",t.IS_SHOW_CHANGEPWD="is_show_changepwd",t.JOB_FAIR_PASSED_IZ_EDIT_POSITION="job_fair_passed_iz_edit_positi` |
| `Ke` | index.1751615607545.js | api | @/legacy `getCompanyInfo` | `t=>Ee.request({url:"/xf-job/job/xfJobCompany/getCompanyInfo",method:"get",params:t})` |
| `Ue` | index.1751615607545.js | entry | @/legacy `decryptText` | `t=>{if(t&&typeof t=="string")try{return Df.sm4.decrypt(t,yC)}catch(e){return console.error("解密失败:",e),null}else return null}` |
| `V` | index.1751615607545.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:xt(Cdt(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,n){va` |
| `Re` | index.1751615607545.js | api | @/legacy/api `isPublishingPosition` | `t=>Ee.request({url:"/xf-job/job/xfJobCompany/isPublishingPosition",method:"get",params:t})` |
| `$` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `Ve` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `ze` | index.api.175161560754510.js | api | @/api/jobCurriculumVitaeDeliver `queryPageListByCompanyIdForFair` | `e=>t.request({url:"/xf-job/job/xfJobCurriculumVitaeDeliver/queryPageListByCompanyIdForFair",method:"post",data:e})` |
| `Pe` | index.api.175161560754510.js | api | @/api/jobCurriculumVitaeDeliver `queryPageListByCompanyId` | `e=>t.request({url:"/xf-job/job/xfJobCurriculumVitaeDeliver/queryPageListByCompanyId",method:"get",params:e})` |
| `je` | index.api.175161560754510.js | api | @/api/jobCurriculumVitaeDeliver `getHouseSetting` | `()=>t.request({url:"/xf-job/job/xfJobCurriculumVitaeDeliver/getHouseSetting",method:"post"})` |
| `Ae` | index.api.175161560754510.js | api | @/api/jobCurriculumVitaeDeliver `addTalent` | `e=>t.request({url:"/xf-job/job/xfJobCompanyTalents/addTalent",method:"post",data:e})` |
| `Fe` | index.api.175161560754510.js | api | @/api/jobCurriculumVitaeDeliver `downPdf` | `e=>t.request({url:"/xf-job/job/xfJobCompanyCurriculumDownload/downPdf",method:"get",responseType:"blob",headers:{"Content-Type":"application/json; application/octet-stream"},params:e})` |
| `D` | dictCode.1751615607545.js | shared | @/shared/dictCode.vue `default` | `c(v,[["render",S]])` |
| `qe` | setStatusinterview.1751615607545.js | shared | @/shared/setStatusinterview.vue `default` | `B(A,[["__scopeId","data-v-99a2d30a"]])` |
| `Oe` | InterviewInvitation.17516156075452.js | shared | @/shared/InterviewInvitation.vue `default` | `E(ae,[["__scopeId","data-v-85ce95bb"]])` |
| `$e` | iframeModal.1751615607545.js | shared | @/shared/iframeModal.vue `default`（reserved） | `n(C,[["__scopeId","data-v-ceee5e90"]])` |
