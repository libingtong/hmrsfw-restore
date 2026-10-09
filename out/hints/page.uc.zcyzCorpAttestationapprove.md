# 导入提示：page.uc.zcyzCorpAttestationapprove

原 chunk `zcyzCorpAttestationapprove.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `xe` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `ue` | index.1751615607545.js | entry | dayjs `default` | `Oa(Trt)` |
| `we` | index.1751615607545.js | entry | @/legacy `joinAreaNames` | `(t,e)=>{let n="";return e=="workProviceName"?(t.workProviceName&&t.workProviceId&&(n=t.workProviceName),t.workCityName&&t.workCityId&&(n=n+"/"+t.workCityName),t.workAreaName&&t.workAreaId&&(n=n+"/"+t.` |
| `Oe` | index.1751615607545.js | api | @/legacy `izAlreadySubmitCompany` | `t=>Ee.request({url:"/xf-job/job/xfJobCompany/izAlreadySubmitCompany",method:"post",params:t})` |
| `Z` | index.1751615607545.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:xt(Cdt(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,n){va` |
| `Ve` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `ll` | index.1751615607545.js | entry | vuex `useStore` | `function xc(t){return t===void 0&&(t=null),Ot(t!==null?t:TR)}` |
| `tl` | index.1751615607545.js | entry | @/legacy `useTagsStore` | `d0("tags",{state:()=>({list:[]}),getters:{show:t=>t.list.length>0,nameList:t=>t.list.map(e=>e.name)},actions:{delTagsItem(t){this.list.splice(t,1)},setTagsItem(t){this.list.push(t)},clearTags(){this.l` |
| `rl` | index.1751615607545.js | api | @/legacy `queryFormSettingByCode` | `t=>Ee.request({url:"/xf-job/job/xfJobFormSetting/queryByCode",method:"post",params:t})` |
| `pe` | index.1751615607545.js | api | @/legacy `getSettingValueByCode` | `t=>Ee.request({url:"/xf-job/communal/xfSysBusinessSetting/getSettingValueByCode",method:"get",params:t})` |
| `qe` | index.1751615607545.js | entry | @/legacy `SettingCodes` | `(t=>(t.WEBPORTAL_DOMAIN="webportal_domain",t.USER_CENTE_RDEFAULT_NAME="userCenterDefaultName",t.IS_SHOW_CHANGEPWD="is_show_changepwd",t.JOB_FAIR_PASSED_IZ_EDIT_POSITION="job_fair_passed_iz_edit_positi` |
| `A` | index.1751615607545.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `z` | index.1751615607545.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `sl` | index.1751615607545.js | api | @/legacy `getCompanyInfo` | `t=>Ee.request({url:"/xf-job/job/xfJobCompany/getCompanyInfo",method:"get",params:t})` |
| `ul` | index.1751615607545.js | entry | @/legacy `decryptText` | `t=>{if(t&&typeof t=="string")try{return Df.sm4.decrypt(t,yC)}catch(e){return console.error("解密失败:",e),null}else return null}` |
| `Re` | index.1751615607545.js | api | @/legacy `getDictItemsByCode` | `t=>Ee.request({url:"/jeecg-system/sys/dict/getDictItemsByCode",method:"get",params:t})` |
| `il` | index.1751615607545.js | api | @/legacy `getAreaInfoByAreaId` | `t=>Ee.request({url:"/xf-job/communal/licenseFree/xfSysAreainfo/getInfoByAreaId",method:"get",params:t})` |
| `q` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `Pe` | index.1751615607545.js | entry | ant-design-vue `Upload` | `Ft(xs,{Dragger:Ts,LIST_IGNORE:Bl,install:function(e){return e.component(xs.name,xs),e.component(Ts.name,Ts),e}})` |
| `nl` | index.1751615607545.js | api | @/legacy `getDictValueByCodes` | `t=>Ee.request({url:"/xf-job/school/user/getDictValueByCodes",method:"post",params:t})` |
| `ol` | index.1751615607545.js | api | @/legacy `sumbitVerifyInfo` | `t=>Ee.request({url:"/xf-job/job/xfJobCompany/sumbitVerifyInfo",method:"post",data:t})` |
| `dl` | index.1751615607545.js | api | @/legacy `queryCompanyInfo` | `t=>Ee.request({url:"/xf-job/job/xfJobCompany/queryCompanyInfo",method:"post",params:t})` |
| `le` | index.1751615607545.js | entry | @/legacy `formatDateSlash` | `t=>{var e=t.getFullYear(),n=t.getMonth()+1,r=t.getDate();return t.getHours(),t.getMinutes(),t.getSeconds(),e+"/"+n+"/"+r}` |
| `te` | index.1751615607545.js | entry | @ant-design/icons-vue `PlusOutlined` | `Pg` |
| `gl` | index.1751615607545.js | entry | @/legacy `UPLOAD_URL` | `SX.upload` |
| `ve` | phone.1751615607545.js | shared | @/shared/phone.vue `default` | `u(d,[["render",m]])` |
| `L` | dictCode.1751615607545.js | shared | @/shared/dictCode.vue `default` | `c(v,[["render",S]])` |
| `je` | gaode.1751615607545.js | shared | @/shared/gaode.ts `MultiDictNationSelect` | `G(ee,[["render",oe]])` |
| `cl` | gaode.1751615607545.js | shared | @/shared/gaode.ts `BaiduMapModal` | `G(ae,[["__scopeId","data-v-74092770"]])` |
| `ml` | gaode.1751615607545.js | shared | @/shared/gaode.ts `GaodeMapModal` | `G(pe,[["__scopeId","data-v-56312994"]])` |
| `Te` | idCard.1751615607545.js | shared | @/shared/idCard.vue `default` | `u(h,[["render",I]])` |
| `pl` | email.1751615607545.js | shared | @/shared/email.vue `default` | `l(d,[["render",f]])` |
| `ke` | message.1751615607545.js | shared | @/shared/message.ts `successCountdown` | `function c(e){let o=5;const t=n.success({title:"提交成功",content:e}),s=setInterval(()=>{o-=1,t.update({content:e})},1e3);setTimeout(()=>{clearInterval(s),t.destroy()},o*1e3)}` |
| `hl` | XfLoaing.1751615607545.js | shared | @/shared/XfLoaing.vue `default` | `{__name:"XfLoaing",props:{show:{type:Boolean,default:!1},text:{type:String,default:"处理中..."},showText:{type:Boolean,default:!0}},setup(e){return(u,f)=>a((t(),s("div",_,[r,e.showText?(t(),s("p",d,n(e.t` |
