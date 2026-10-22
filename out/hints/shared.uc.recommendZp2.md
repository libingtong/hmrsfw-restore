# 导入提示：shared.uc.recommendZp2

原 chunk `recommendZp.17516156075452.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `f` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `se` | index.1751615607545.js | api | @/legacy `getSettingValueByCode` | `t=>Ee.request({url:"/xf-job/communal/xfSysBusinessSetting/getSettingValueByCode",method:"get",params:t})` |
| `te` | index.1751615607545.js | entry | @/legacy `SettingCodes` | `(t=>(t.WEBPORTAL_DOMAIN="webportal_domain",t.USER_CENTE_RDEFAULT_NAME="userCenterDefaultName",t.IS_SHOW_CHANGEPWD="is_show_changepwd",t.JOB_FAIR_PASSED_IZ_EDIT_POSITION="job_fair_passed_iz_edit_positi` |
| `ie` | index.1751615607545.js | api | @/legacy `getDictItemsByCode` | `t=>Ee.request({url:"/jeecg-system/sys/dict/getDictItemsByCode",method:"get",params:t})` |
| `ae` | index.1751615607545.js | api | @/legacy `getCompanyInfo` | `t=>Ee.request({url:"/xf-job/job/xfJobCompany/getCompanyInfo",method:"get",params:t})` |
| `ne` | index.1751615607545.js | entry | @/legacy `decryptText` | `t=>{if(t&&typeof t=="string")try{return Df.sm4.decrypt(t,yC)}catch(e){return console.error("解密失败:",e),null}else return null}` |
| `O` | index.1751615607545.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:xt(Cdt(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,n){va` |
| `X` | index.1751615607545.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `H` | index.1751615607545.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `ce` | index.1751615607545.js | entry | dayjs `default` | `Oa(Trt)` |
| `S` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `oe` | index.1751615607545.js | api | @/legacy/api `queryAnnouncementList`（reserved） | `t=>Ee.request({url:"/xf-common/common/xfAnnouncementSendRedcord/queryAnnouncementList",method:"post",params:t})` |
| `le` | index.1751615607545.js | entry | @/legacy/utils `stripHtml`（reserved） | `t=>{let e="";if(t){let n=/<[^>]+>/g;e=t.replace(n,"")}return e}` |
| `de` | index.api.1751615607545.js | api | @/api/jobSupermarketMerchants `getFairListNew`（reserved） | `e=>t.request({url:"/xf-job/job/licenseFree/xfJobFair/getFairListNew",method:"post",data:{dataSourceType:0,provincialLevel:1,pageSize:e\|\|"100"}})` |
