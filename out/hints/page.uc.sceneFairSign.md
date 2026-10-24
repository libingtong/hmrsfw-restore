# 导入提示：page.uc.sceneFairSign

原 chunk `sceneFairSign.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `Q` | index.1751615607545.js | api | @/legacy `getDictItemsByCode` | `t=>Ee.request({url:"/jeecg-system/sys/dict/getDictItemsByCode",method:"get",params:t})` |
| `ee` | index.1751615607545.js | api | @/legacy/api `getArticleList`（reserved） | `t=>Ee.request({url:"/xf-job/job/licenseFree/getArticleList",method:"get",params:t})` |
| `Y` | index.1751615607545.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `D` | index.1751615607545.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `te` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `ue` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `pe` | index.1751615607545.js | entry | @/legacy/utils `validateContactPhone`（reserved） | `(t,e,n)=>e?/^1\d{10}$\|^(0\d{2,3}-?\|\(0\d{2,3}\))?[1-9]\d{4,7}(-\d{1,8})?$/.test(e)?Promise.resolve():Promise.reject("格式不正确!"):Promise.resolve()` |
| `W` | index.1751615607545.js | api | @/legacy `getSettingValueByCode` | `t=>Ee.request({url:"/xf-job/communal/xfSysBusinessSetting/getSettingValueByCode",method:"get",params:t})` |
| `X` | index.1751615607545.js | entry | @/legacy `SettingCodes` | `(t=>(t.WEBPORTAL_DOMAIN="webportal_domain",t.USER_CENTE_RDEFAULT_NAME="userCenterDefaultName",t.IS_SHOW_CHANGEPWD="is_show_changepwd",t.JOB_FAIR_PASSED_IZ_EDIT_POSITION="job_fair_passed_iz_edit_positi` |
| `_e` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `me` | index.1751615607545.js | entry | @/router `router` | `fQ({history:dQ("/"),routes:Fht})` |
| `V` | index.1751615607545.js | entry | dayjs `default` | `Oa(Trt)` |
| `Ie` | index.api.175161560754512.js | api | @/api/jobFair `checkIzShowApplySameNetworkFair` | `t=>o.request({url:"/xf-job/job/xfJobFair/checkIzShowApplySameNetworkFair",method:"post",params:t})` |
| `ke` | index.api.175161560754512.js | api | @/api/jobFair `queryBoothPlaceInfo` | `t=>o.request({url:"/xf-job/job/xfJobFair/queryBoothPlaceInfo",method:"post",data:t})` |
| `xe` | index.api.175161560754512.js | api | @/api/jobFair `queryBoothView` | `t=>o.request({url:"/xf-job/job/xfJobFair/queryBoothView",method:"post",data:t})` |
| `Ce` | index.api.175161560754512.js | api | @/api/jobFair `getCompanyAttachmentList` | `t=>o.request({url:"/xf-job/communal/xfSysAttachment/getCompanyAttachmentList",method:"get",params:t})` |
| `ze` | index.api.175161560754512.js | api | @/api/jobFair `companyPositionAdd` | `t=>o.request({url:"/xf-job/job/xfJobFairApplyInfo/companyPositionAdd",method:"post",data:t})` |
