# 导入提示：page.uc.main

原 chunk `dashboard.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `Le` | mymsg.1751615607545.js | shared | @/shared/mymsg/Mymsg.vue `default`（reserved） | `T(Y,[["__scopeId","data-v-dfa9af6a"]])` |
| `Ne` | index.1751615607545.js | entry | @/legacy/store `useCommonStore` | `d0("common",{state:()=>({isShowAuthJYBF:!0}),getters:{getIsShowAuthJYBF:t=>t.isShowAuthJYBF},actions:{queryIsShowAuthJYBF(){return Wn(this,null,function*(){yield wX({code:Xo.AUTH_MENU_JYBF}).then(t=>{` |
| `pe` | index.1751615607545.js | entry | @/legacy `useTagsStore` | `d0("tags",{state:()=>({list:[]}),getters:{show:t=>t.list.length>0,nameList:t=>t.list.map(e=>e.name)},actions:{delTagsItem(t){this.list.splice(t,1)},setTagsItem(t){this.list.push(t)},clearTags(){this.l` |
| `fe` | index.1751615607545.js | entry | vuex `useStore` | `function xc(t){return t===void 0&&(t=null),Ot(t!==null?t:TR)}` |
| `U` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `Ee` | index.1751615607545.js | api | @/legacy `getSettingValueByCodes` | `t=>Ee.request({url:"/xf-job/job/licenseFree/xfSysBusinessSetting/getSettingValueByCodes",method:"get",params:t})` |
| `F` | index.1751615607545.js | entry | @/legacy `SettingCodes` | `(t=>(t.WEBPORTAL_DOMAIN="webportal_domain",t.USER_CENTE_RDEFAULT_NAME="userCenterDefaultName",t.IS_SHOW_CHANGEPWD="is_show_changepwd",t.JOB_FAIR_PASSED_IZ_EDIT_POSITION="job_fair_passed_iz_edit_positi` |
| `H` | index.1751615607545.js | api | @/legacy `getCompanyInfo` | `t=>Ee.request({url:"/xf-job/job/xfJobCompany/getCompanyInfo",method:"get",params:t})` |
| `Y` | index.1751615607545.js | entry | @/legacy/utils `setLocalStorage` | `(t,e)=>{localStorage.setItem(t,e)}` |
| `Z` | index.1751615607545.js | entry | @/legacy `decryptText` | `t=>{if(t&&typeof t=="string")try{return Df.sm4.decrypt(t,yC)}catch(e){return console.error("解密失败:",e),null}else return null}` |
| `A` | index.1751615607545.js | api | @/legacy/api `queryByCompanyId` | `t=>Ee.request({url:"/xf-job/communal/xfSysUserAuthenticateIdentityItem/queryByCompanyId",method:"post",params:t})` |
| `Re` | index.1751615607545.js | api | @/legacy/api `izCompanyComplete` | `t=>Ee.request({url:"/xf-job/job/xfJobCompany/izCompanyComplete",method:"get",params:t})` |
| `le` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `L` | index.1751615607545.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `N` | index.1751615607545.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `O` | index.1751615607545.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:xt(Cdt(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,n){va` |
| `Fe` | index.1751615607545.js | api | @/legacy/api `sysUserAuthenticateIdentityList` | `t=>Ee.request({url:"/xf-job/communal/xfSysUserAuthenticateIdentity/list",method:"get",params:t})` |
| `X` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `Je` | index.1751615607545.js | api | @/legacy `getDictItemsByCode` | `t=>Ee.request({url:"/jeecg-system/sys/dict/getDictItemsByCode",method:"get",params:t})` |
| `Ke` | index.1751615607545.js | api | @/legacy/api `listOneForWebSite` | `t=>Ee.request({url:"/xf-job/communal/xfSysUser/listOneForWebSite",method:"get",params:t})` |
| `Me` | index.1751615607545.js | entry | @/legacy `parseIdCard` | `t=>{let e=null,n=null,r=new Date,a=r.getMonth()+1,i=r.getDate(),o=0;return t.length===18&&(o=r.getFullYear()-t.substring(6,10)-1,e=t.substring(16,17),n=t.substring(6,10)+"-"+t.substring(10,12)+"-"+t.s` |
| `qe` | index.1751615607545.js | entry | dayjs `default` | `Oa(Trt)` |
| `De` | index.1751615607545.js | entry | @/legacy/utils `maskPhone3` | `t=>t?String(t).replace(/^(.{3})(?:\w+)(.{3})$/,"$1****$2"):""` |
| `He` | index.1751615607545.js | api | @/legacy/api `queryAnnouncementList` | `t=>Ee.request({url:"/xf-common/common/xfAnnouncementSendRedcord/queryAnnouncementList",method:"post",params:t})` |
| `Ye` | index.api.1751615607545.js | api | @/api/jobSupermarketMerchants `queryByUserId` | `e=>t.request({url:"/xf-job/communal/xfSysUserAuthenticateIdentityItem/queryByUserId",method:"post",params:e})` |
| `Ze` | index.api.1751615607545.js | api | @/api/jobSupermarketMerchants `getAppealFlagByXfSysUserId` | `e=>t.request({url:"/xf-job/job/xfJobAppealRecord/getAppealFlagByXfSysUserId",method:"post",params:e})` |
| `Ve` | index.api.1751615607545.js | api | @/api/jobSupermarketMerchants `addForClosDown` | `e=>t.request({url:"/xf-job/job/xfJobAppealRecord/merchants/addForClosDown",method:"post",data:e})` |
| `Ge` | index.api.1751615607545.js | api | @/api/jobSupermarketMerchants `checkIzPerfect` | `e=>t.request({url:"/xf-job/communal/xfSysUser/checkIzPerfect",method:"get",params:e})` |
| `We` | index.api.1751615607545.js | api | @/api/jobSupermarketMerchants `beJobSeeker` | `e=>t.request({url:"/xf-job/communal/xfSysUserAuthenticateIdentity/beJobSeeker",method:"post",data:e})` |
| `Xe` | index.api.1751615607545.js | api | @/api/jobSupermarketMerchants `apply` | `e=>t.request({url:"/xf-job/job/xfJobSupermarketMerchants/apply",method:"post",data:e})` |
| `Qe` | index.api.1751615607545.js | api | @/api/jobSupermarketMerchants `logout` | `e=>t.request({url:"/xf-job/job/xfJobSupermarketMerchants/logout",method:"post",data:e})` |
| `et` | market.vue_vue_type_script_setup_true_lang.1751615607545.js | shared | @/shared/market.vue `default`（reserved） | `N({__name:"market",props:{show:{type:Boolean}},emits:"submit",setup(h,{emit:i}){const c=q(),l=d({title:"",content:""});S(()=>{console.log("----jinalie")});const p=d({visible:!0}),y={},x={labelCol:{spa` |
| `tt` | addKeynote.1751615607545.js | shared | @/shared/addKeynote/AddBeOnProbation.vue `default`（reserved） | `N(L,[["__scopeId","data-v-de576056"]])` |
| `st` | addKeynote.1751615607545.js | shared | @/shared/addKeynote/AddKeynote.vue `default`（reserved） | `N(X,[["__scopeId","data-v-a5cea3e0"]])` |
| `lt` | index.api.17516156075452.js | api | @/api/sysUser `queryByIdJM` | `e=>t.request({url:"/xf-job/communal/xfSysUser/queryByIdJM",method:"get",params:e})` |
| `ot` | right.vue_vue_type_script_setup_true_lang.1751615607545.js | shared | @/shared/right.vue `default`（reserved） | `w({__name:"right",props:{},emits:[],setup(I,{emit:R}){y();const d=m(),t=v({organizationId:void 0,swiperList:[],list:[]});C(()=>{}),P(()=>{c()});const c=()=>{f({dictCode:window.businessDict}).then(e=>{` |
