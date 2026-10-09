# 导入提示：page.uc.fairsList

原 chunk `fairsList.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `B` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `H` | index.1751615607545.js | entry | @/legacy `SettingCodes` | `(t=>(t.WEBPORTAL_DOMAIN="webportal_domain",t.USER_CENTE_RDEFAULT_NAME="userCenterDefaultName",t.IS_SHOW_CHANGEPWD="is_show_changepwd",t.JOB_FAIR_PASSED_IZ_EDIT_POSITION="job_fair_passed_iz_edit_positi` |
| `de` | index.1751615607545.js | api | @/legacy `getSettingValueByCodes` | `t=>Ee.request({url:"/xf-job/job/licenseFree/xfSysBusinessSetting/getSettingValueByCodes",method:"get",params:t})` |
| `j` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `X` | index.1751615607545.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:xt(Cdt(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,n){va` |
| `q` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `ue` | index.1751615607545.js | entry | @/legacy `useTagsStore` | `d0("tags",{state:()=>({list:[]}),getters:{show:t=>t.list.length>0,nameList:t=>t.list.map(e=>e.name)},actions:{delTagsItem(t){this.list.splice(t,1)},setTagsItem(t){this.list.push(t)},clearTags(){this.l` |
| `pe` | index.1751615607545.js | api | @/legacy `getCompanyInfo` | `t=>Ee.request({url:"/xf-job/job/xfJobCompany/getCompanyInfo",method:"get",params:t})` |
| `fe` | index.1751615607545.js | entry | @/legacy `decryptText` | `t=>{if(t&&typeof t=="string")try{return Df.sm4.decrypt(t,yC)}catch(e){return console.error("解密失败:",e),null}else return null}` |
| `ve` | index.api.175161560754512.js | api | @/api/api-175161560754512 `checkIzShowApplySameNetworkFair` | `t=>o.request({url:"/xf-job/job/xfJobFair/checkIzShowApplySameNetworkFair",method:"post",params:t})` |
| `ye` | index.api.175161560754512.js | api | @/api/api-175161560754512 `queryFairRegions` | `t=>o.request({url:"/xf-job/job/licenseFree/queryFairRegions",method:"get",params:t})` |
| `we` | index.api.175161560754512.js | api | @/api/api-175161560754512 `updateCompIntroduc` | `t=>o.request({url:"/xf-job/job/licenseFree/updateCompIntroduc",method:"post",data:t})` |
| `Te` | index.api.175161560754512.js | api | @/api/api-175161560754512 `list` | `t=>o.request({url:"/xf-job/job/xfJobFair/list",method:"post",data:t})` |
| `ke` | index.api.175161560754512.js | api | @/api/api-175161560754512 `checkIzDishonesty` | `t=>o.request({url:"/xf-job/job/xfJobFairApplyInfo/checkIzDishonesty",method:"post",data:t})` |
| `O` | dictCode.1751615607545.js | shared | @/shared/dictCode.vue `default` | `c(v,[["render",S]])` |
| `Se` | positionmodal.1751615607545.js | shared | @/shared/positionmodal.vue `default` | `B(X,[["__scopeId","data-v-0ff88674"]])` |
| `Ie` | beonmodal.1751615607545.js | shared | @/shared/beonmodal.vue `default` | `h(A,[["__scopeId","data-v-1e6b66f8"]])` |
