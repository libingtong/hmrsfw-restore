# 导入提示：page.uc.oddjob.need.add

原 chunk `need-job-add.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `Te` | index.api.175161560754519.js | api | @/api/oddShareSurplusJobInfo `queryById` | `o=>d.request({url:"/xf-oddjob/oddjob/xfOddShareSurplusJobInfo/queryById",method:"get",params:o})` |
| `xe` | index.api.175161560754519.js | api | @/api/oddShareSurplusJobInfo `edit` | `o=>d.request({url:"/xf-oddjob/oddjob/xfOddShareSurplusJobInfo/edit",method:"post",data:o})` |
| `Ne` | index.api.175161560754519.js | api | @/api/oddShareSurplusJobInfo `add` | `o=>d.request({url:"/xf-oddjob/oddjob/xfOddShareSurplusJobInfo/add",method:"post",data:o})` |
| `Ie` | index.1751615607545.js | entry | @/legacy `useTagsStore` | `d0("tags",{state:()=>({list:[]}),getters:{show:t=>t.list.length>0,nameList:t=>t.list.map(e=>e.name)},actions:{delTagsItem(t){this.list.splice(t,1)},setTagsItem(t){this.list.push(t)},clearTags(){this.l` |
| `M` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `j` | index.1751615607545.js | api | @/legacy `getSettingValueByCode` | `t=>Ee.request({url:"/xf-job/communal/xfSysBusinessSetting/getSettingValueByCode",method:"get",params:t})` |
| `F` | index.1751615607545.js | entry | @/legacy `SettingCodes` | `(t=>(t.WEBPORTAL_DOMAIN="webportal_domain",t.USER_CENTE_RDEFAULT_NAME="userCenterDefaultName",t.IS_SHOW_CHANGEPWD="is_show_changepwd",t.JOB_FAIR_PASSED_IZ_EDIT_POSITION="job_fair_passed_iz_edit_positi` |
| `V` | index.1751615607545.js | api | @/legacy `getDictItemsByCode` | `t=>Ee.request({url:"/jeecg-system/sys/dict/getDictItemsByCode",method:"get",params:t})` |
| `Ce` | index.1751615607545.js | api | @/legacy `getCompanyInfo` | `t=>Ee.request({url:"/xf-job/job/xfJobCompany/getCompanyInfo",method:"get",params:t})` |
| `Pe` | index.1751615607545.js | entry | @/legacy `decryptText` | `t=>{if(t&&typeof t=="string")try{return Df.sm4.decrypt(t,yC)}catch(e){return console.error("解密失败:",e),null}else return null}` |
| `A` | index.1751615607545.js | entry | dayjs `default` | `Oa(Trt)` |
| `R` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `S` | index.1751615607545.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:xt(Cdt(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,n){va` |
| `we` | index.1751615607545.js | entry | @/legacy `checkSensitive` | `e=>Wn(void 0,[e],function*({value:t}){const n=yield ipt({words:t,findModule:100});if(n.success)if(n.result.izSensitiveWords==!0){let r='您输入的内容涉及敏感信息：${n.result.sensitiveWords}，请修改后再操作。';return aht(r),` |
| `Ae` | index.1751615607545.js | entry | @/legacy `joinAreaNames` | `(t,e)=>{let n="";return e=="workProviceName"?(t.workProviceName&&t.workProviceId&&(n=t.workProviceName),t.workCityName&&t.workCityId&&(n=n+"/"+t.workCityName),t.workAreaName&&t.workAreaId&&(n=n+"/"+t.` |
| `Se` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `qe` | phone.1751615607545.js | shared | @/shared/phone.vue `default` | `u(d,[["render",m]])` |
| `We` | dictCode.1751615607545.js | shared | @/shared/dictCode.vue `default` | `c(v,[["render",S]])` |
| `Ue` | extractpositionmodal.1751615607545.js | shared | @/shared/extractpositionmodal.vue `default` | `X(ae,[["__scopeId","data-v-f343505a"]])` |
| `De` | workType.1751615607545.js | shared | @/shared/workType.vue `default` | `q(ce,[["__scopeId","data-v-13870526"]])` |
| `Ye` | Content.vue_vue_type_script_setup_true_lang.1751615607545.js | shared | @/shared/Content/Content.vue `default`（reserved） | `y({__name:"Content",props:{show:Boolean},emits:["update:show"],setup(e,{emit:i}){const t=e,u=p({info:""}),d=()=>{i("update:show")};return b({}),x(()=>{h({dictCode:window.businessDict}).then(r=>{r.succ` |
