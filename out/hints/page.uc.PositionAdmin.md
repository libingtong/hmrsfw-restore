# 导入提示：page.uc.PositionAdmin

原 chunk `PositionAdmin.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `$e` | index.1751615607545.js | api | @/legacy `detailById` | `t=>Ee.request({url:"/xf-job/job/xfJobCompanyPosition/detailById",method:"get",params:t})` |
| `Ae` | index.1751615607545.js | entry | @/legacy `joinAreaNames` | `(t,e)=>{let n="";return e=="workProviceName"?(t.workProviceName&&t.workProviceId&&(n=t.workProviceName),t.workCityName&&t.workCityId&&(n=n+"/"+t.workCityName),t.workAreaName&&t.workAreaId&&(n=n+"/"+t.` |
| `ie` | index.1751615607545.js | entry | dayjs `default` | `Oa(Trt)` |
| `V` | index.1751615607545.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:xt(Cdt(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,n){va` |
| `me` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `ce` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `de` | index.1751615607545.js | api | @/legacy `getSettingValueByCode` | `t=>Ee.request({url:"/xf-job/communal/xfSysBusinessSetting/getSettingValueByCode",method:"get",params:t})` |
| `fe` | index.1751615607545.js | entry | @/legacy `SettingCodes` | `(t=>(t.WEBPORTAL_DOMAIN="webportal_domain",t.USER_CENTE_RDEFAULT_NAME="userCenterDefaultName",t.IS_SHOW_CHANGEPWD="is_show_changepwd",t.JOB_FAIR_PASSED_IZ_EDIT_POSITION="job_fair_passed_iz_edit_positi` |
| `Ee` | index.1751615607545.js | api | @/legacy `getDictItemsByCode` | `t=>Ee.request({url:"/jeecg-system/sys/dict/getDictItemsByCode",method:"get",params:t})` |
| `Oe` | index.1751615607545.js | api | @/legacy/api `queryByCompanyId`（reserved） | `t=>Ee.request({url:"/xf-job/communal/xfSysUserAuthenticateIdentityItem/queryByCompanyId",method:"post",params:t})` |
| `Ke` | index.1751615607545.js | api | @/legacy/api `listNew`（reserved） | `t=>Ee.request({url:"/xf-job/job/xfJobCompanyPosition/listNew",method:"get",params:t})` |
| `Me` | index.1751615607545.js | api | @/legacy/api `listForAdmin`（reserved） | `t=>Ee.request({url:"/xf-job/job/xfJobFairPositionRelation/listForAdmin",method:"post",data:t})` |
| `De` | index.1751615607545.js | api | @/legacy `getCompanyInfo` | `t=>Ee.request({url:"/xf-job/job/xfJobCompany/getCompanyInfo",method:"get",params:t})` |
| `Ue` | index.1751615607545.js | entry | @/legacy `decryptText` | `t=>{if(t&&typeof t=="string")try{return Df.sm4.decrypt(t,yC)}catch(e){return console.error("解密失败:",e),null}else return null}` |
| `Ye` | index.1751615607545.js | api | @/legacy/api `izAbroadCompany`（reserved） | `t=>Ee.request({url:"/xf-job/job/xfJobCompany/izAbroadCompany",method:"get",data:t})` |
| `J` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `ve` | index.1751615607545.js | api | @/legacy/api `setUpUrgentBatch`（reserved） | `t=>Ee.request({url:"/xf-job/job/xfJobCompanyPosition/setUpUrgentBatch",method:"post",params:t})` |
| `He` | index.1751615607545.js | api | @/legacy/api `refreshBatch`（reserved） | `t=>Ee.request({url:"/xf-job/job/xfJobCompanyPosition/refreshBatch",method:"post",params:t})` |
| `xe` | index.1751615607545.js | api | @/legacy/api `enableAuseBatch`（reserved） | `t=>Ee.request({url:"/xf-job/job/xfJobCompanyPosition/enableAuseBatch",method:"post",params:t})` |
| `Le` | index.api.1751615607545.js | api | @/api/jobSupermarketMerchants `queryByUserId`（reserved） | `e=>t.request({url:"/xf-job/communal/xfSysUserAuthenticateIdentityItem/queryByUserId",method:"post",params:e})` |
| `Te` | dictCode.1751615607545.js | shared | @/shared/dictCode.vue `default` | `c(v,[["render",S]])` |
| `Xe` | positionmodal.1751615607545.js | shared | @/shared/positionmodal.vue `default` | `B(X,[["__scopeId","data-v-0ff88674"]])` |
| `Ve` | beonmodal.1751615607545.js | shared | @/shared/beonmodal.vue `default` | `h(A,[["__scopeId","data-v-1e6b66f8"]])` |
| `Ze` | index.api.175161560754511.js | api | @/api/jobCompany `myJobFairList` | `o=>t.request({url:"/xf-job/job/xfJobFair/myJobFairList",method:"post",data:o})` |
| `Qe` | index.api.175161560754511.js | api | @/api/jobCompany `myBoothList` | `o=>t.request({url:"/xf-job/job/xfJobFair/myBoothList",method:"post",data:o})` |
