# 导入提示：page.uc.BeOnProbationAdmin

原 chunk `BeOnProbationAdmin.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `Ue` | index.1751615607545.js | entry | @/legacy `useTagsStore` | `d0("tags",{state:()=>({list:[]}),getters:{show:t=>t.list.length>0,nameList:t=>t.list.map(e=>e.name)},actions:{delTagsItem(t){this.list.splice(t,1)},setTagsItem(t){this.list.push(t)},clearTags(){this.l` |
| `X` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `Ke` | index.1751615607545.js | api | @/legacy/api `adminDetailId` | `t=>Ee.request({url:"/xf-job/job/xfJobCompanyExpand/adminDetailId",method:"get",params:t})` |
| `Me` | index.1751615607545.js | api | @/legacy/api `getCompanyAttachmentMax` | `t=>Ee.request({url:"/xf-job/communal/xfSysAttachment/getCompanyAttachmentMax",method:"get",params:t})` |
| `Ee` | index.1751615607545.js | api | @/legacy/api `getInternShipCompanyAttachmentMax` | `t=>Ee.request({url:"/xf-job/communal/xfSysAttachment/getInternShipCompanyAttachmentMax",method:"get",params:t})` |
| `H` | index.1751615607545.js | api | @/legacy/api `addBatchCompanyAttachment` | `t=>Ee.request({url:"/xf-job/communal/xfSysAttachment/addBatchCompanyAttachment",method:"post",params:t})` |
| `b` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `M` | index.1751615607545.js | entry | @/legacy `SettingCodes` | `(t=>(t.WEBPORTAL_DOMAIN="webportal_domain",t.USER_CENTE_RDEFAULT_NAME="userCenterDefaultName",t.IS_SHOW_CHANGEPWD="is_show_changepwd",t.JOB_FAIR_PASSED_IZ_EDIT_POSITION="job_fair_passed_iz_edit_positi` |
| `J` | index.1751615607545.js | api | @/legacy/api `getCompanyAttachmentList` | `t=>Ee.request({url:"/xf-job/communal/xfSysAttachment/getCompanyAttachmentList",method:"get",params:t})` |
| `ee` | index.1751615607545.js | api | @/legacy `getSettingValueByCode` | `t=>Ee.request({url:"/xf-job/communal/xfSysBusinessSetting/getSettingValueByCode",method:"get",params:t})` |
| `te` | index.1751615607545.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `ne` | index.1751615607545.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `Re` | index.1751615607545.js | api | @/legacy/api `setCover` | `t=>Ee.request({url:"/xf-job/communal/xfSysAttachment/setCover",method:"post",params:t})` |
| `$e` | index.1751615607545.js | api | @/legacy/api `editAdmin` | `t=>Ee.request({url:"/xf-job/job/xfJobCompanyExpand/editAdmin",method:"post",data:t})` |
| `ae` | index.1751615607545.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:xt(Cdt(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,n){va` |
| `ie` | index.1751615607545.js | api | @/legacy/api `deleteAttachment` | `t=>Ee.request({url:"/xf-job/communal/xfSysAttachment/deleteAttachment",method:"post",params:t})` |
| `qe` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `De` | workVideo.1751615607545.js | shared | @/shared/workVideo/WorkImg.vue `default`（reserved） | `E(Q,[["__scopeId","data-v-bf79a309"]])` |
| `Le` | workVideo.1751615607545.js | shared | @/shared/workVideo/WorkVideo.vue `default`（reserved） | `E(ae,[["__scopeId","data-v-c9289ee6"]])` |
| `je` | corporganic.1751615607545.js | shared | @/shared/corporganic.vue `default`（reserved） | `f(V,[["render",z]])` |
| `E` | message.1751615607545.js | shared | @/shared/message.ts `successCountdown` | `function c(e){let o=5;const t=n.success({title:"提交成功",content:e}),s=setInterval(()=>{o-=1,t.update({content:e})},1e3);setTimeout(()=>{clearInterval(s),t.destroy()},o*1e3)}` |
