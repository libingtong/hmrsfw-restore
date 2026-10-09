# 导入提示：page.uc.Enterpriseonlineservices

原 chunk `Enterpriseonlineservices.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `Ie` | index.1751615607545.js | entry | @/legacy `useTagsStore` | `d0("tags",{state:()=>({list:[]}),getters:{show:t=>t.list.length>0,nameList:t=>t.list.map(e=>e.name)},actions:{delTagsItem(t){this.list.splice(t,1)},setTagsItem(t){this.list.push(t)},clearTags(){this.l` |
| `me` | index.1751615607545.js | entry | vuex `useStore` | `function xc(t){return t===void 0&&(t=null),Ot(t!==null?t:TR)}` |
| `L` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `F` | index.1751615607545.js | api | @/legacy `getCompanyInfo` | `t=>Ee.request({url:"/xf-job/job/xfJobCompany/getCompanyInfo",method:"get",params:t})` |
| `N` | index.1751615607545.js | entry | @/legacy/utils `setLocalStorage`（reserved） | `(t,e)=>{localStorage.setItem(t,e)}` |
| `ve` | index.1751615607545.js | entry | @/legacy `decryptText` | `t=>{if(t&&typeof t=="string")try{return Df.sm4.decrypt(t,yC)}catch(e){return console.error("解密失败:",e),null}else return null}` |
| `b` | index.1751615607545.js | api | @/legacy/api `queryByCompanyId`（reserved） | `t=>Ee.request({url:"/xf-job/communal/xfSysUserAuthenticateIdentityItem/queryByCompanyId",method:"post",params:t})` |
| `$` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `J` | index.1751615607545.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `M` | index.1751615607545.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `g` | index.1751615607545.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:xt(Cdt(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,n){va` |
| `xe` | index.1751615607545.js | api | @/legacy/api `sysUserAuthenticateIdentityList`（reserved） | `t=>Ee.request({url:"/xf-job/communal/xfSysUserAuthenticateIdentity/list",method:"get",params:t})` |
| `we` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `Pe` | index.api.1751615607545.js | api | @/api/jobSupermarketMerchants `queryByUserId`（reserved） | `e=>t.request({url:"/xf-job/communal/xfSysUserAuthenticateIdentityItem/queryByUserId",method:"post",params:e})` |
| `Te` | index.api.1751615607545.js | api | @/api/jobSupermarketMerchants `getAppealFlagByXfSysUserId`（reserved） | `e=>t.request({url:"/xf-job/job/xfJobAppealRecord/getAppealFlagByXfSysUserId",method:"post",params:e})` |
| `Ce` | index.api.1751615607545.js | api | @/api/jobSupermarketMerchants `addForClosDown`（reserved） | `e=>t.request({url:"/xf-job/job/xfJobAppealRecord/merchants/addForClosDown",method:"post",data:e})` |
| `Ue` | index.api.1751615607545.js | api | @/api/jobSupermarketMerchants `checkIzPerfect`（reserved） | `e=>t.request({url:"/xf-job/communal/xfSysUser/checkIzPerfect",method:"get",params:e})` |
| `Be` | index.api.1751615607545.js | api | @/api/jobSupermarketMerchants `beJobSeeker`（reserved） | `e=>t.request({url:"/xf-job/communal/xfSysUserAuthenticateIdentity/beJobSeeker",method:"post",data:e})` |
| `Oe` | index.api.1751615607545.js | api | @/api/jobSupermarketMerchants `apply`（reserved） | `e=>t.request({url:"/xf-job/job/xfJobSupermarketMerchants/apply",method:"post",data:e})` |
| `ze` | index.api.1751615607545.js | api | @/api/jobSupermarketMerchants `logout`（reserved） | `e=>t.request({url:"/xf-job/job/xfJobSupermarketMerchants/logout",method:"post",data:e})` |
| `Ee` | market.vue_vue_type_script_setup_true_lang.1751615607545.js | shared | @/shared/market.vue `default`（reserved） | `N({__name:"market",props:{show:{type:Boolean}},emits:"submit",setup(h,{emit:i}){const c=q(),l=d({title:"",content:""});S(()=>{console.log("----jinalie")});const p=d({visible:!0}),y={},x={labelCol:{spa` |
| `Le` | addKeynote.1751615607545.js | shared | @/shared/addKeynote/AddBeOnProbation.vue `default`（reserved） | `N(L,[["__scopeId","data-v-de576056"]])` |
| `Re` | addKeynote.1751615607545.js | shared | @/shared/addKeynote/AddKeynote.vue `default`（reserved） | `N(X,[["__scopeId","data-v-a5cea3e0"]])` |
