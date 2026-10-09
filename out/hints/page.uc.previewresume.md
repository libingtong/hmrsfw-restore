# 导入提示：page.uc.previewresume

原 chunk `previewresume.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `R` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `ge` | index.1751615607545.js | api | @/legacy/api `interviewTemplate`（reserved） | `t=>Ee.request({url:"/xf-job/job/xfJobInterviewInvitation/interviewTemplate",method:"get",params:t})` |
| `ye` | index.1751615607545.js | api | @/legacy `getDictItemsByCode` | `t=>Ee.request({url:"/jeecg-system/sys/dict/getDictItemsByCode",method:"get",params:t})` |
| `me` | index.1751615607545.js | api | @/legacy/api `getInterviewPosition`（reserved） | `t=>Ee.request({url:"/xf-job/job/xfJobInterviewInvitation/getInterviewPosition",method:"post",params:t})` |
| `q` | index.1751615607545.js | entry | dayjs `default` | `Oa(Trt)` |
| `Ae` | index.1751615607545.js | api | @/legacy/api `interviewInvitationByFair`（reserved） | `t=>Ee.request({url:"/xf-job/job/xfJobInterviewInvitation/interviewInvitationByFair",method:"post",data:t})` |
| `xe` | index.1751615607545.js | api | @/legacy/api `interviewInvitation`（reserved） | `t=>Ee.request({url:"/xf-job/job/xfJobInterviewInvitation/interviewInvitation",method:"post",data:t})` |
| `le` | index.1751615607545.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:xt(Cdt(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,n){va` |
| `ne` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `ve` | index.1751615607545.js | api | @/legacy `getSettingValueByCode` | `t=>Ee.request({url:"/xf-job/communal/xfSysBusinessSetting/getSettingValueByCode",method:"get",params:t})` |
| `H` | index.1751615607545.js | entry | @/legacy `joinAreaNames` | `(t,e)=>{let n="";return e=="workProviceName"?(t.workProviceName&&t.workProviceId&&(n=t.workProviceName),t.workCityName&&t.workCityId&&(n=n+"/"+t.workCityName),t.workAreaName&&t.workAreaId&&(n=n+"/"+t.` |
| `be` | index.1751615607545.js | api | @/legacy/api `viewVoByIdFromCompany`（reserved） | `t=>Ee.request({url:"/xf-job/job/xfJobCurriculumVitae/viewVoByIdFromCompany",method:"get",params:t})` |
| `Ie` | index.1751615607545.js | api | @/legacy/api `viewCaredSeekerFromCompany`（reserved） | `t=>Ee.request({url:"/job/xfJobCurriculumVitae/viewCaredSeekerFromCompany?",method:"get",params:t})` |
| `X` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `Ee` | index.1751615607545.js | api | @/legacy/api `isPublishingPosition`（reserved） | `t=>Ee.request({url:"/xf-job/job/xfJobCompany/isPublishingPosition",method:"get",params:t})` |
| `Z` | index.1751615607545.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `V` | index.1751615607545.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `$` | message.1751615607545.js | shared | @/shared/message.ts `successCountdown` | `function c(e){let o=5;const t=n.success({title:"提交成功",content:e}),s=setInterval(()=>{o-=1,t.update({content:e})},1e3);setTimeout(()=>{clearInterval(s),t.destroy()},o*1e3)}` |
| `ke` | index.api.17516156075456.js | api | @/api/api-56 `viewVoByIdFromPerson` | `e=>t.request({url:"/xf-job/job/xfJobCurriculumVitae/viewVoByIdFromPerson",method:"get",params:e})` |
| `we` | index.api.17516156075456.js | api | @/api/api-56 `downPdf2`（reserved） | `e=>t.request({url:"/xf-job/job/xfJobCompanyCurriculumDownload/downPdf",method:"get",responseType:"blob",headers:{"Content-Type":"application/json; application/octet-stream"},params:e})` |
| `Qe` | index.api.17516156075456.js | api | @/api/api-56 `downPdf`（reserved） | `e=>t.request({url:"/xf-job/job/xfJobCurriculumVitae/downPdf",method:"get",responseType:"blob",headers:{"Content-Type":"application/json; application/octet-stream"},params:e})` |
