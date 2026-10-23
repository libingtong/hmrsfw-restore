# 导入提示：page.uc.zcyzCorpAttestation

原 chunk `zcyzCorpAttestation.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `Ta` | index.1751615607545.js | entry | @/legacy `useTagsStore` | `d0("tags",{state:()=>({list:[]}),getters:{show:t=>t.list.length>0,nameList:t=>t.list.map(e=>e.name)},actions:{delTagsItem(t){this.list.splice(t,1)},setTagsItem(t){this.list.push(t)},clearTags(){this.l` |
| `qe` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `za` | index.1751615607545.js | api | @/legacy `queryFormSettingByCode` | `t=>Ee.request({url:"/xf-job/job/xfJobFormSetting/queryByCode",method:"post",params:t})` |
| `ge` | index.1751615607545.js | api | @/legacy `getSettingValueByCode` | `t=>Ee.request({url:"/xf-job/communal/xfSysBusinessSetting/getSettingValueByCode",method:"get",params:t})` |
| `Na` | index.1751615607545.js | entry | @/legacy `SettingCodes` | `(t=>(t.WEBPORTAL_DOMAIN="webportal_domain",t.USER_CENTE_RDEFAULT_NAME="userCenterDefaultName",t.IS_SHOW_CHANGEPWD="is_show_changepwd",t.JOB_FAIR_PASSED_IZ_EDIT_POSITION="job_fair_passed_iz_edit_positi` |
| `F` | index.1751615607545.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `G` | index.1751615607545.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `Fa` | index.1751615607545.js | api | @/legacy `izAlreadySubmitCompany` | `t=>Ee.request({url:"/xf-job/job/xfJobCompany/izAlreadySubmitCompany",method:"post",params:t})` |
| `Ga` | index.1751615607545.js | api | @/legacy `getCompanyInfo` | `t=>Ee.request({url:"/xf-job/job/xfJobCompany/getCompanyInfo",method:"get",params:t})` |
| `Aa` | index.1751615607545.js | entry | @/legacy `decryptText` | `t=>{if(t&&typeof t=="string")try{return Df.sm4.decrypt(t,yC)}catch(e){return console.error("解密失败:",e),null}else return null}` |
| `Sa` | index.1751615607545.js | entry | @/legacy `joinAreaNames` | `(t,e)=>{let n="";return e=="workProviceName"?(t.workProviceName&&t.workProviceId&&(n=t.workProviceName),t.workCityName&&t.workCityId&&(n=n+"/"+t.workCityName),t.workAreaName&&t.workAreaId&&(n=n+"/"+t.` |
| `le` | index.1751615607545.js | entry | dayjs `default` | `Oa(Trt)` |
| `v` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `ce` | index.1751615607545.js | entry | ant-design-vue `Upload` | `Ft(xs,{Dragger:Ts,LIST_IGNORE:Bl,install:function(e){return e.component(xs.name,xs),e.component(Ts.name,Ts),e}})` |
| `La` | index.1751615607545.js | api | @/legacy `getDictValueByCodes` | `t=>Ee.request({url:"/xf-job/school/user/getDictValueByCodes",method:"post",params:t})` |
| `Ua` | index.1751615607545.js | api | @/legacy/api `sumbitImportantCompanyInfo`（reserved） | `t=>Ee.request({url:"/xf-job/job/xfJobCompany/sumbitImportantCompanyInfo",method:"post",data:t})` |
| `R` | index.1751615607545.js | entry | @/legacy `formatDateSlash` | `t=>{var e=t.getFullYear(),n=t.getMonth()+1,r=t.getDate();return t.getHours(),t.getMinutes(),t.getSeconds(),e+"/"+n+"/"+r}` |
| `V` | index.1751615607545.js | entry | @ant-design/icons-vue `PlusOutlined` | `Pg` |
| `O` | index.1751615607545.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:xt(Cdt(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,n){va` |
| `ja` | index.1751615607545.js | entry | @/legacy `UPLOAD_URL` | `SX.upload` |
| `Ha` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `pe` | phone.1751615607545.js | shared | @/shared/phone.vue `default` | `u(d,[["render",m]])` |
| `Z` | dictCode.1751615607545.js | shared | @/shared/dictCode.vue `default` | `c(v,[["render",S]])` |
| `Ba` | gaode.1751615607545.js | shared | @/shared/gaode.ts `MultiDictNationSelect` | `G(ee,[["render",oe]])` |
| `Da` | gaode.1751615607545.js | shared | @/shared/gaode.ts `BaiduMapModal` | `G(ae,[["__scopeId","data-v-74092770"]])` |
| `Ra` | gaode.1751615607545.js | shared | @/shared/gaode.ts `GaodeMapModal` | `G(pe,[["__scopeId","data-v-56312994"]])` |
| `xe` | idCard.1751615607545.js | shared | @/shared/idCard.vue `default` | `u(h,[["render",I]])` |
| `Va` | email.1751615607545.js | shared | @/shared/email.vue `default` | `l(d,[["render",f]])` |
