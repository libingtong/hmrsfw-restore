# 导入提示：page.uc.PositionReleaseAbroad

原 chunk `PositionReleaseAbroad.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `Me` | wxyy.hook.1751615607545.js | shared | @/legacy `askWenXin` | `e=>(e=e.replace(/[\r\n]/g,""),new Promise((n,s)=>{r(e).then(t=>{t.success\|\|a.warning(t.message),n(t)}).catch(t=>{s(t)})}))` |
| `Oe` | wxyy.hook.1751615607545.js | shared | @/legacy `ROBOT_IMG` | `"/assets/j_robot.1751615607545.png"` |
| `Ee` | index.1751615607545.js | entry | @/legacy `useTagsStore` | `d0("tags",{state:()=>({list:[]}),getters:{show:t=>t.list.length>0,nameList:t=>t.list.map(e=>e.name)},actions:{delTagsItem(t){this.list.splice(t,1)},setTagsItem(t){this.list.push(t)},clearTags(){this.l` |
| `$` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `B` | index.1751615607545.js | api | @/legacy `getDictItemsByCode` | `t=>Ee.request({url:"/jeecg-system/sys/dict/getDictItemsByCode",method:"get",params:t})` |
| `Le` | index.1751615607545.js | api | @/legacy `detailById` | `t=>Ee.request({url:"/xf-job/job/xfJobCompanyPosition/detailById",method:"get",params:t})` |
| `U` | index.1751615607545.js | entry | @/legacy `joinAreaNames` | `(t,e)=>{let n="";return e=="workProviceName"?(t.workProviceName&&t.workProviceId&&(n=t.workProviceName),t.workCityName&&t.workCityId&&(n=n+"/"+t.workCityName),t.workAreaName&&t.workAreaId&&(n=n+"/"+t.` |
| `I` | index.1751615607545.js | api | @/legacy `getSettingValueByCode` | `t=>Ee.request({url:"/xf-job/communal/xfSysBusinessSetting/getSettingValueByCode",method:"get",params:t})` |
| `p` | index.1751615607545.js | entry | dayjs `default` | `Oa(Trt)` |
| `Ve` | index.1751615607545.js | api | @/legacy `getAreaInfoByAreaId` | `t=>Ee.request({url:"/xf-job/communal/licenseFree/xfSysAreainfo/getInfoByAreaId",method:"get",params:t})` |
| `We` | index.1751615607545.js | api | @/legacy/api `checkPositionName`（reserved） | `t=>Ee.request({url:"/xf-job/job/xfJobCompanyPosition/checkPositionName",method:"post",params:t})` |
| `Y` | index.1751615607545.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:xt(Cdt(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,n){va` |
| `S` | index.1751615607545.js | entry | @/legacy `SettingCodes` | `(t=>(t.WEBPORTAL_DOMAIN="webportal_domain",t.USER_CENTE_RDEFAULT_NAME="userCenterDefaultName",t.IS_SHOW_CHANGEPWD="is_show_changepwd",t.JOB_FAIR_PASSED_IZ_EDIT_POSITION="job_fair_passed_iz_edit_positi` |
| `Xe` | index.1751615607545.js | api | @/legacy `getCompanyInfo` | `t=>Ee.request({url:"/xf-job/job/xfJobCompany/getCompanyInfo",method:"get",params:t})` |
| `He` | index.1751615607545.js | entry | @/legacy `decryptText` | `t=>{if(t&&typeof t=="string")try{return Df.sm4.decrypt(t,yC)}catch(e){return console.error("解密失败:",e),null}else return null}` |
| `D` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `Ze` | index.1751615607545.js | api | @/legacy/api `addOrEdit`（reserved） | `t=>Ee.request({url:"/xf-job/job/xfJobCompanyPosition/addOrEdit",method:"post",data:t})` |
| `ze` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `$e` | phone.1751615607545.js | shared | @/shared/phone.vue `default` | `u(d,[["render",m]])` |
| `T` | dictCode.1751615607545.js | shared | @/shared/dictCode.vue `default` | `c(v,[["render",S]])` |
| `Ge` | extractpositionmodal.1751615607545.js | shared | @/shared/extractpositionmodal.vue `default` | `X(ae,[["__scopeId","data-v-f343505a"]])` |
| `x` | dateUtil.1751615607545.js | shared | @/shared/dateUtil.ts `a`（reserved） | `function D(a,e){e=e\|\|new Date;var n=a*(1e3*60*60*24),r=new Date(e.getTime()+n);return r}` |
| `Ke` | dictCheckBoxAll.1751615607545.js | shared | @/shared/dictCheckBoxAll.vue `default` | `g(O,[["render",v]])` |
| `Qe` | workType.1751615607545.js | shared | @/shared/workType.vue `default` | `q(ce,[["__scopeId","data-v-13870526"]])` |
| `F` | message.1751615607545.js | shared | @/shared/message.ts `successCountdown` | `function c(e){let o=5;const t=n.success({title:"提交成功",content:e}),s=setInterval(()=>{o-=1,t.update({content:e})},1e3);setTimeout(()=>{clearInterval(s),t.destroy()},o*1e3)}` |
