# 导入提示：page.uc.Personalonlineservice

原 chunk `Personalonlineservice.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `Ie` | index.1751615607545.js | entry | @/legacy `useTagsStore` | `d0("tags",{state:()=>({list:[]}),getters:{show:t=>t.list.length>0,nameList:t=>t.list.map(e=>e.name)},actions:{delTagsItem(t){this.list.splice(t,1)},setTagsItem(t){this.list.push(t)},clearTags(){this.l` |
| `me` | index.1751615607545.js | entry | vuex `useStore` | `function xc(t){return t===void 0&&(t=null),Ot(t!==null?t:TR)}` |
| `R` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `F` | index.1751615607545.js | api | @/legacy `getCompanyInfo` | `t=>Ee.request({url:"/xf-job/job/xfJobCompany/getCompanyInfo",method:"get",params:t})` |
| `N` | index.1751615607545.js | entry | @/legacy/utils `setLocalStorage` | `(t,e)=>{localStorage.setItem(t,e)}` |
| `ve` | index.1751615607545.js | entry | @/legacy `decryptText` | `t=>{if(t&&typeof t=="string")try{return Df.sm4.decrypt(t,yC)}catch(e){return console.error("解密失败:",e),null}else return null}` |
| `g` | index.1751615607545.js | api | @/legacy/api `queryByCompanyId` | `t=>Ee.request({url:"/xf-job/communal/xfSysUserAuthenticateIdentityItem/queryByCompanyId",method:"post",params:t})` |
| `$` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `J` | index.1751615607545.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `M` | index.1751615607545.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `_` | index.1751615607545.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:xt(Cdt(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,n){va` |
| `xe` | index.1751615607545.js | api | @/legacy/api `sysUserAuthenticateIdentityList` | `t=>Ee.request({url:"/xf-job/communal/xfSysUserAuthenticateIdentity/list",method:"get",params:t})` |
| `Pe` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `we` | index.api.1751615607545.js | api | @/api/jobSupermarketMerchants `queryByUserId` | `e=>t.request({url:"/xf-job/communal/xfSysUserAuthenticateIdentityItem/queryByUserId",method:"post",params:e})` |
| `Te` | index.api.1751615607545.js | api | @/api/jobSupermarketMerchants `getAppealFlagByXfSysUserId` | `e=>t.request({url:"/xf-job/job/xfJobAppealRecord/getAppealFlagByXfSysUserId",method:"post",params:e})` |
| `Ce` | index.api.1751615607545.js | api | @/api/jobSupermarketMerchants `addForClosDown` | `e=>t.request({url:"/xf-job/job/xfJobAppealRecord/merchants/addForClosDown",method:"post",data:e})` |
| `Ue` | index.api.1751615607545.js | api | @/api/jobSupermarketMerchants `checkIzPerfect` | `e=>t.request({url:"/xf-job/communal/xfSysUser/checkIzPerfect",method:"get",params:e})` |
| `Be` | index.api.1751615607545.js | api | @/api/jobSupermarketMerchants `beJobSeeker` | `e=>t.request({url:"/xf-job/communal/xfSysUserAuthenticateIdentity/beJobSeeker",method:"post",data:e})` |
| `Oe` | index.api.1751615607545.js | api | @/api/jobSupermarketMerchants `apply` | `e=>t.request({url:"/xf-job/job/xfJobSupermarketMerchants/apply",method:"post",data:e})` |
| `ze` | index.api.1751615607545.js | api | @/api/jobSupermarketMerchants `logout` | `e=>t.request({url:"/xf-job/job/xfJobSupermarketMerchants/logout",method:"post",data:e})` |
| `Le` | market.vue_vue_type_script_setup_true_lang.1751615607545.js | shared | @/shared/market.vue `default`（reserved） | `N({__name:"market",props:{show:{type:Boolean}},emits:"submit",setup(h,{emit:i}){const c=q(),l=d({title:"",content:""});S(()=>{console.log("----jinalie")});const p=d({visible:!0}),y={},x={labelCol:{spa` |
| `Re` | addKeynote.1751615607545.js | shared | @/shared/addKeynote/AddBeOnProbation.vue `default`（reserved） | `N(L,[["__scopeId","data-v-de576056"]])` |
| `je` | addKeynote.1751615607545.js | shared | @/shared/addKeynote/AddKeynote.vue `default`（reserved） | `N(X,[["__scopeId","data-v-a5cea3e0"]])` |
