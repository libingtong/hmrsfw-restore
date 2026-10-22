# 导入提示：page.uc.liveApplyAdd

原 chunk `add.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `qe` | index.api.175161560754516.js | api | @/api/jobLiveTelecastApply `listForPickUp`（reserved） | `e=>t.request({url:"/xf-job/job/xfJobLiveTelecastApplyPosition/listForPickUp",method:"post",data:e})` |
| `Fe` | index.api.175161560754516.js | api | @/api/jobLiveTelecastApply `queryById`（reserved） | `e=>t.request({url:"/xf-job/job/xfJobLiveTelecastApply/queryById",method:"get",params:e})` |
| `Ue` | index.api.175161560754516.js | api | @/api/jobLiveTelecastApply `list2`（reserved） | `e=>t.request({url:"/xf-job/job/xfJobLiveTelecastApplyPosition/list",method:"get",params:e})` |
| `Ae` | index.api.175161560754516.js | api | @/api/jobLiveTelecastApply `save`（reserved） | `e=>t.request({url:"/xf-job/job/xfJobLiveTelecastApply/save",method:"post",data:e})` |
| `X` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `ne` | index.1751615607545.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:xt(Cdt(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,n){va` |
| `Z` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `Re` | index.1751615607545.js | entry | @/legacy `useTagsStore` | `d0("tags",{state:()=>({list:[]}),getters:{show:t=>t.list.length>0,nameList:t=>t.list.map(e=>e.name)},actions:{delTagsItem(t){this.list.splice(t,1)},setTagsItem(t){this.list.push(t)},clearTags(){this.l` |
| `te` | index.1751615607545.js | api | @/legacy `getSettingValueByCode` | `t=>Ee.request({url:"/xf-job/communal/xfSysBusinessSetting/getSettingValueByCode",method:"get",params:t})` |
| `ae` | index.1751615607545.js | entry | @/legacy `SettingCodes` | `(t=>(t.WEBPORTAL_DOMAIN="webportal_domain",t.USER_CENTE_RDEFAULT_NAME="userCenterDefaultName",t.IS_SHOW_CHANGEPWD="is_show_changepwd",t.JOB_FAIR_PASSED_IZ_EDIT_POSITION="job_fair_passed_iz_edit_positi` |
| `U` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `oe` | index.1751615607545.js | entry | @/legacy/utils `isMobilePhone`（reserved） | `t=>{var e=/^(13[0-9]\|14[01456879]\|15[0-35-9]\|16[2567]\|17[0-8]\|18[0-9]\|19[0-35-9])\d{8}$/;return!!e.test(t)}` |
| `Be` | dictCodeTreeOne.1751615607545.js | shared | @/shared/dictCodeTreeOne.vue `default` | `C(N,[["render",B]])` |
| `$e` | dictCode.1751615607545.js | shared | @/shared/dictCode.vue `default` | `c(v,[["render",S]])` |
| `se` | phone.1751615607545.js | shared | @/shared/phone.vue `default` | `u(d,[["render",m]])` |
| `E` | message.1751615607545.js | shared | @/shared/message.ts `successCountdown` | `function c(e){let o=5;const t=n.success({title:"提交成功",content:e}),s=setInterval(()=>{o-=1,t.update({content:e})},1e3);setTimeout(()=>{clearInterval(s),t.destroy()},o*1e3)}` |
