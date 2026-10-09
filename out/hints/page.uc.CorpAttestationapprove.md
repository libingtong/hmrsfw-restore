# 导入提示：page.uc.CorpAttestationapprove

原 chunk `CorpAttestationapprove.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `Ge` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `W` | index.1751615607545.js | entry | dayjs `default` | `Oa(Trt)` |
| `Be` | index.1751615607545.js | entry | @/legacy `joinAreaNames` | `(t,e)=>{let n="";return e=="workProviceName"?(t.workProviceName&&t.workProviceId&&(n=t.workProviceName),t.workCityName&&t.workCityId&&(n=n+"/"+t.workCityName),t.workAreaName&&t.workAreaId&&(n=n+"/"+t.` |
| `ca` | index.1751615607545.js | api | @/legacy `izAlreadySubmitCompany` | `t=>Ee.request({url:"/xf-job/job/xfJobCompany/izAlreadySubmitCompany",method:"post",params:t})` |
| `$` | index.1751615607545.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:xt(Cdt(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,n){va` |
| `ga` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `Rt` | index.1751615607545.js | entry | vuex `useStore` | `function xc(t){return t===void 0&&(t=null),Ot(t!==null?t:TR)}` |
| `$t` | index.1751615607545.js | entry | @/legacy `useTagsStore` | `d0("tags",{state:()=>({list:[]}),getters:{show:t=>t.list.length>0,nameList:t=>t.list.map(e=>e.name)},actions:{delTagsItem(t){this.list.splice(t,1)},setTagsItem(t){this.list.push(t)},clearTags(){this.l` |
| `Vt` | index.1751615607545.js | api | @/legacy `queryFormSettingByCode` | `t=>Ee.request({url:"/xf-job/job/xfJobFormSetting/queryByCode",method:"post",params:t})` |
| `we` | index.1751615607545.js | entry | @/legacy `SettingCodes` | `(t=>(t.WEBPORTAL_DOMAIN="webportal_domain",t.USER_CENTE_RDEFAULT_NAME="userCenterDefaultName",t.IS_SHOW_CHANGEPWD="is_show_changepwd",t.JOB_FAIR_PASSED_IZ_EDIT_POSITION="job_fair_passed_iz_edit_positi` |
| `Et` | index.1751615607545.js | api | @/legacy `getSettingValueByCodes` | `t=>Ee.request({url:"/xf-job/job/licenseFree/xfSysBusinessSetting/getSettingValueByCodes",method:"get",params:t})` |
| `G` | index.1751615607545.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `B` | index.1751615607545.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `Mt` | index.1751615607545.js | api | @/legacy `getCompanyInfo` | `t=>Ee.request({url:"/xf-job/job/xfJobCompany/getCompanyInfo",method:"get",params:t})` |
| `Ht` | index.1751615607545.js | entry | @/legacy `decryptText` | `t=>{if(t&&typeof t=="string")try{return Df.sm4.decrypt(t,yC)}catch(e){return console.error("解密失败:",e),null}else return null}` |
| `ea` | index.1751615607545.js | api | @/legacy `getDictItemsByCode` | `t=>Ee.request({url:"/jeecg-system/sys/dict/getDictItemsByCode",method:"get",params:t})` |
| `Jt` | index.1751615607545.js | api | @/legacy `getAreaInfoByAreaId` | `t=>Ee.request({url:"/xf-job/communal/licenseFree/xfSysAreainfo/getInfoByAreaId",method:"get",params:t})` |
| `Yt` | index.1751615607545.js | api | @/legacy `getDictValueByCodeAndItems` | `t=>Ee.request({url:"/xf-job/job/licenseFree/getDictValueByCodeAndItems",method:"post",params:t})` |
| `Zt` | index.1751615607545.js | api | @/legacy `companyInfoVerifyForZZJC` | `t=>Ee.request({url:"/xf-job/job/xfJobCompany/companyInfoVerifyForZZJC",method:"post",params:t})` |
| `_` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `xe` | index.1751615607545.js | entry | ant-design-vue `Upload` | `Ft(xs,{Dragger:Ts,LIST_IGNORE:Bl,install:function(e){return e.component(xs.name,xs),e.component(Ts.name,Ts),e}})` |
| `Fe` | index.1751615607545.js | entry | @/legacy `checkFileType` | `(t,e)=>{console.log(t.type);let n=["jpg","jpeg","png","gif","JPG","JPEG","PNG","GIF"];return e&&(n=e),n.findIndex(a=>a==t.name.split(".")[1])<0?(n.join(","),!1):!0}` |
| `aa` | index.1751615607545.js | api | @/legacy `getSettingValueByCode` | `t=>Ee.request({url:"/xf-job/communal/xfSysBusinessSetting/getSettingValueByCode",method:"get",params:t})` |
| `Wt` | index.1751615607545.js | api | @/legacy `getDictValueByCodes` | `t=>Ee.request({url:"/xf-job/school/user/getDictValueByCodes",method:"post",params:t})` |
| `ta` | index.1751615607545.js | api | @/legacy `sumbitVerifyInfo` | `t=>Ee.request({url:"/xf-job/job/xfJobCompany/sumbitVerifyInfo",method:"post",data:t})` |
| `Xt` | index.1751615607545.js | api | @/legacy `queryCompanyInfo` | `t=>Ee.request({url:"/xf-job/job/xfJobCompany/queryCompanyInfo",method:"post",params:t})` |
| `Y` | index.1751615607545.js | entry | @/legacy `formatDateSlash` | `t=>{var e=t.getFullYear(),n=t.getMonth()+1,r=t.getDate();return t.getHours(),t.getMinutes(),t.getSeconds(),e+"/"+n+"/"+r}` |
| `Z` | index.1751615607545.js | entry | @ant-design/icons-vue `PlusOutlined` | `Pg` |
| `Qt` | index.1751615607545.js | entry | @/legacy `UPLOAD_URL` | `SX.upload` |
| `Se` | phone.1751615607545.js | shared | @/shared/phone.vue `default` | `u(d,[["render",m]])` |
| `ue` | dictCode.1751615607545.js | shared | @/shared/dictCode.vue `default` | `c(v,[["render",S]])` |
| `Kt` | gaode.1751615607545.js | shared | @/shared/gaode.ts `MultiDictNationSelect` | `G(ee,[["render",oe]])` |
| `el` | gaode.1751615607545.js | shared | @/shared/gaode.ts `BaiduMapModal` | `G(ae,[["__scopeId","data-v-74092770"]])` |
| `al` | gaode.1751615607545.js | shared | @/shared/gaode.ts `GaodeMapModal` | `G(pe,[["__scopeId","data-v-56312994"]])` |
| `tl` | dictCodeTreeOne.1751615607545.js | shared | @/shared/dictCodeTreeOne.vue `default` | `C(N,[["render",B]])` |
| `la` | idCard.1751615607545.js | shared | @/shared/idCard.vue `default` | `u(h,[["render",I]])` |
| `ll` | email.1751615607545.js | shared | @/shared/email.vue `default` | `l(d,[["render",f]])` |
| `rl` | dictCheckBoxAll.1751615607545.js | shared | @/shared/dictCheckBoxAll.vue `default` | `g(O,[["render",v]])` |
| `sl` | message.1751615607545.js | shared | @/shared/message.ts `infoAlert` | `function l(e,o,t){n.info({title:t\|\|"温馨提示",content:e,okText:o\|\|"确定",onOk(){}})}` |
| `je` | message.1751615607545.js | shared | @/shared/message.ts `successCountdown` | `function c(e){let o=5;const t=n.success({title:"提交成功",content:e}),s=setInterval(()=>{o-=1,t.update({content:e})},1e3);setTimeout(()=>{clearInterval(s),t.destroy()},o*1e3)}` |
| `il` | XfLoaing.1751615607545.js | shared | @/shared/XfLoaing.vue `default` | `{__name:"XfLoaing",props:{show:{type:Boolean,default:!1},text:{type:String,default:"处理中..."},showText:{type:Boolean,default:!0}},setup(e){return(u,f)=>a((t(),s("div",_,[r,e.showText?(t(),s("p",d,n(e.t` |
| `ul` | DictCodes.1751615607545.js | shared | @/shared/DictCodes.ts `DictCodes` | `(r=>(r.PROVINCE_NAME="provinceName",r.TEACHIN_STATUS="teachin_status",r.WEBSITE_CONFIG="website_config",r.PLATFORM="平台配置",r.VERIFYFORZZJC="verify_for_zzgj",r))(_\|\|{})` |
