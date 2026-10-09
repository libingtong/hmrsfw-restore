# 导入提示：page.uc.CorpAttestation

原 chunk `CorpAttestation.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `qt` | index.1751615607545.js | entry | @/legacy `useTagsStore` | `d0("tags",{state:()=>({list:[]}),getters:{show:t=>t.list.length>0,nameList:t=>t.list.map(e=>e.name)},actions:{delTagsItem(t){this.list.splice(t,1)},setTagsItem(t){this.list.push(t)},clearTags(){this.l` |
| `We` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `Tt` | index.1751615607545.js | api | @/legacy `queryFormSettingByCode` | `t=>Ee.request({url:"/xf-job/job/xfJobFormSetting/queryByCode",method:"post",params:t})` |
| `Fe` | index.1751615607545.js | entry | @/legacy `SettingCodes` | `(t=>(t.WEBPORTAL_DOMAIN="webportal_domain",t.USER_CENTE_RDEFAULT_NAME="userCenterDefaultName",t.IS_SHOW_CHANGEPWD="is_show_changepwd",t.JOB_FAIR_PASSED_IZ_EDIT_POSITION="job_fair_passed_iz_edit_positi` |
| `kt` | index.1751615607545.js | api | @/legacy `getSettingValueByCodes` | `t=>Ee.request({url:"/xf-job/job/licenseFree/xfSysBusinessSetting/getSettingValueByCodes",method:"get",params:t})` |
| `T` | index.1751615607545.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `k` | index.1751615607545.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `zt` | index.1751615607545.js | api | @/legacy `izAlreadySubmitCompany` | `t=>Ee.request({url:"/xf-job/job/xfJobCompany/izAlreadySubmitCompany",method:"post",params:t})` |
| `Lt` | index.1751615607545.js | api | @/legacy `getCompanyInfo` | `t=>Ee.request({url:"/xf-job/job/xfJobCompany/getCompanyInfo",method:"get",params:t})` |
| `Nt` | index.1751615607545.js | entry | @/legacy `decryptText` | `t=>{if(t&&typeof t=="string")try{return Df.sm4.decrypt(t,yC)}catch(e){return console.error("解密失败:",e),null}else return null}` |
| `Ft` | index.1751615607545.js | entry | @/legacy `joinAreaNames` | `(t,e)=>{let n="";return e=="workProviceName"?(t.workProviceName&&t.workProviceId&&(n=t.workProviceName),t.workCityName&&t.workCityId&&(n=n+"/"+t.workCityName),t.workAreaName&&t.workAreaId&&(n=n+"/"+t.` |
| `te` | index.1751615607545.js | entry | dayjs `default` | `Oa(Trt)` |
| `At` | index.1751615607545.js | api | @/legacy `getDictValueByCodeAndItems` | `t=>Ee.request({url:"/xf-job/job/licenseFree/getDictValueByCodeAndItems",method:"post",params:t})` |
| `jt` | index.1751615607545.js | api | @/legacy `companyInfoVerifyForZZJC` | `t=>Ee.request({url:"/xf-job/job/xfJobCompany/companyInfoVerifyForZZJC",method:"post",params:t})` |
| `Gt` | index.1751615607545.js | api | @/legacy `getDictValueByCodes` | `t=>Ee.request({url:"/xf-job/school/user/getDictValueByCodes",method:"post",params:t})` |
| `H` | index.1751615607545.js | entry | @/legacy `formatDateSlash` | `t=>{var e=t.getFullYear(),n=t.getMonth()+1,r=t.getDate();return t.getHours(),t.getMinutes(),t.getSeconds(),e+"/"+n+"/"+r}` |
| `U` | index.1751615607545.js | entry | @ant-design/icons-vue `PlusOutlined` | `Pg` |
| `O` | index.1751615607545.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:xt(Cdt(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,n){va` |
| `Bt` | index.1751615607545.js | entry | @/legacy `UPLOAD_URL` | `SX.upload` |
| `v` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `fe` | index.1751615607545.js | entry | ant-design-vue `Upload` | `Ft(xs,{Dragger:Ts,LIST_IGNORE:Bl,install:function(e){return e.component(xs.name,xs),e.component(Ts.name,Ts),e}})` |
| `Qe` | index.1751615607545.js | entry | @/legacy `checkFileType` | `(t,e)=>{console.log(t.type);let n=["jpg","jpeg","png","gif","JPG","JPEG","PNG","GIF"];return e&&(n=e),n.findIndex(a=>a==t.name.split(".")[1])<0?(n.join(","),!1):!0}` |
| `St` | index.1751615607545.js | api | @/legacy/api `sumbitBaseCompanyInfo`（reserved） | `t=>Ee.request({url:"/xf-job/job/xfJobCompany/sumbitBaseCompanyInfo",method:"post",data:t})` |
| `Dt` | index.1751615607545.js | api | @/legacy/api `sumbitImportantCompanyInfo`（reserved） | `t=>Ee.request({url:"/xf-job/job/xfJobCompany/sumbitImportantCompanyInfo",method:"post",data:t})` |
| `Ht` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `Ut` | dictCheckBoxAll.1751615607545.js | shared | @/shared/dictCheckBoxAll.vue `default` | `g(O,[["render",v]])` |
| `Ae` | phone.1751615607545.js | shared | @/shared/phone.vue `default` | `u(d,[["render",m]])` |
| `ne` | dictCode.1751615607545.js | shared | @/shared/dictCode.vue `default` | `c(v,[["render",S]])` |
| `Ot` | gaode.1751615607545.js | shared | @/shared/gaode.ts `MultiDictNationSelect` | `G(ee,[["render",oe]])` |
| `Rt` | gaode.1751615607545.js | shared | @/shared/gaode.ts `BaiduMapModal` | `G(ae,[["__scopeId","data-v-74092770"]])` |
| `Vt` | gaode.1751615607545.js | shared | @/shared/gaode.ts `GaodeMapModal` | `G(pe,[["__scopeId","data-v-56312994"]])` |
| `Xe` | idCard.1751615607545.js | shared | @/shared/idCard.vue `default` | `u(h,[["render",I]])` |
| `Et` | email.1751615607545.js | shared | @/shared/email.vue `default` | `l(d,[["render",f]])` |
| `$t` | dictCodeTreeOne.1751615607545.js | shared | @/shared/dictCodeTreeOne.vue `default` | `C(N,[["render",B]])` |
| `Jt` | message.1751615607545.js | shared | @/shared/message.ts `infoAlert` | `function l(e,o,t){n.info({title:t\|\|"温馨提示",content:e,okText:o\|\|"确定",onOk(){}})}` |
| `Mt` | DictCodes.1751615607545.js | shared | @/shared/DictCodes.ts `DictCodes` | `(r=>(r.PROVINCE_NAME="provinceName",r.TEACHIN_STATUS="teachin_status",r.WEBSITE_CONFIG="website_config",r.PLATFORM="平台配置",r.VERIFYFORZZJC="verify_for_zzgj",r))(_\|\|{})` |
