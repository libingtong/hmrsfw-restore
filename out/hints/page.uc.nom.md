# 导入提示：page.uc.nom

原 chunk `nom.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `y` | dictCode.1751615607545.js | shared | @/shared/dictCode.vue `default` | `c(v,[["render",S]])` |
| `ye` | idCard.1751615607545.js | shared | @/shared/idCard.vue `default` | `u(h,[["render",I]])` |
| `Ce` | email.1751615607545.js | shared | @/shared/email.vue `default` | `l(d,[["render",f]])` |
| `V` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `Ie` | index.1751615607545.js | entry | @/legacy `useTagsStore` | `d0("tags",{state:()=>({list:[]}),getters:{show:t=>t.list.length>0,nameList:t=>t.list.map(e=>e.name)},actions:{delTagsItem(t){this.list.splice(t,1)},setTagsItem(t){this.list.push(t)},clearTags(){this.l` |
| `C` | index.1751615607545.js | entry | dayjs `default` | `Oa(Trt)` |
| `xe` | index.1751615607545.js | api | @/legacy `getDictItemsByCode` | `t=>Ee.request({url:"/jeecg-system/sys/dict/getDictItemsByCode",method:"get",params:t})` |
| `Te` | index.1751615607545.js | entry | @/legacy `SettingCodes` | `(t=>(t.WEBPORTAL_DOMAIN="webportal_domain",t.USER_CENTE_RDEFAULT_NAME="userCenterDefaultName",t.IS_SHOW_CHANGEPWD="is_show_changepwd",t.JOB_FAIR_PASSED_IZ_EDIT_POSITION="job_fair_passed_iz_edit_positi` |
| `k` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `z` | index.1751615607545.js | entry | @/legacy/utils `setLocalStorage` | `(t,e)=>{localStorage.setItem(t,e)}` |
| `Ne` | index.1751615607545.js | api | @/legacy/api `listOneForWebSite` | `t=>Ee.request({url:"/xf-job/communal/xfSysUser/listOneForWebSite",method:"get",params:t})` |
| `D` | index.1751615607545.js | entry | @/legacy `decryptText` | `t=>{if(t&&typeof t=="string")try{return Df.sm4.decrypt(t,yC)}catch(e){return console.error("解密失败:",e),null}else return null}` |
| `ke` | index.1751615607545.js | entry | @/legacy `joinAreaNames` | `(t,e)=>{let n="";return e=="workProviceName"?(t.workProviceName&&t.workProviceId&&(n=t.workProviceName),t.workCityName&&t.workCityId&&(n=n+"/"+t.workCityName),t.workAreaName&&t.workAreaId&&(n=n+"/"+t.` |
| `Pe` | index.1751615607545.js | entry | @/legacy `parseIdCard` | `t=>{let e=null,n=null,r=new Date,a=r.getMonth()+1,i=r.getDate(),o=0;return t.length===18&&(o=r.getFullYear()-t.substring(6,10)-1,e=t.substring(16,17),n=t.substring(6,10)+"-"+t.substring(10,12)+"-"+t.s` |
| `qe` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `Se` | index.api.17516156075452.js | api | @/api/sysUser `checkIdCard` | `e=>t.request({url:"/xf-job/communal/xfSysUser/checkIdCard",method:"post",data:e})` |
| `we` | index.api.17516156075452.js | api | @/api/sysUser `queryIzExistByIdPhone` | `e=>t.request({url:"/xf-job/job/xfJobUserTutorExpand/queryIzExistByIdPhone",method:"get",params:e})` |
| `Ue` | index.api.17516156075452.js | api | @/api/sysUser `checkEmail` | `e=>t.request({url:"/xf-job/communal/xfSysUser/checkEmail",method:"get",params:e})` |
| `M` | index.api.17516156075452.js | api | @/api/sysUser `getSettingValueByCode` | `e=>t.request({url:"/xf-job/communal/xfSysBusinessSetting/getSettingValueByCode",method:"get",params:e})` |
| `Fe` | index.api.17516156075452.js | api | @/api/sysUser `saveForUserCenter` | `e=>t.request({url:"/xf-job/communal/xfSysUser/saveForUserCenter",method:"post",data:e})` |
| `Ae` | index.api.17516156075452.js | api | @/api/sysUser `queryByIdJM` | `e=>t.request({url:"/xf-job/communal/xfSysUser/queryByIdJM",method:"get",params:e})` |
