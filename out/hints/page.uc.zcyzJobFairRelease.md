# 导入提示：page.uc.zcyzJobFairRelease

原 chunk `zcyzJobFairRelease.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `A` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `O` | index.1751615607545.js | api | @/legacy `getSettingValueByCode` | `t=>Ee.request({url:"/xf-job/communal/xfSysBusinessSetting/getSettingValueByCode",method:"get",params:t})` |
| `Ze` | index.1751615607545.js | api | @/legacy/api `queryById` | `t=>Ee.request({url:"/xf-job/job/xfJobFair/queryById",method:"get",params:t})` |
| `Me` | index.1751615607545.js | api | @/legacy/api `list` | `t=>Ee.request({url:"/xf-job/job/xfJobFairPositionRelation/list",method:"post",data:t})` |
| `Ye` | index.1751615607545.js | api | @/legacy `detailById` | `t=>Ee.request({url:"/xf-job/job/xfJobCompanyPosition/detailById",method:"get",params:t})` |
| `H` | index.1751615607545.js | entry | @/legacy `joinAreaNames` | `(t,e)=>{let n="";return e=="workProviceName"?(t.workProviceName&&t.workProviceId&&(n=t.workProviceName),t.workCityName&&t.workCityId&&(n=n+"/"+t.workCityName),t.workAreaName&&t.workAreaId&&(n=n+"/"+t.` |
| `Ue` | index.1751615607545.js | entry | @/legacy `getExtractPositionConfig` | `t=>new Promise((e,n)=>Wn(void 0,null,function*(){let r=yield rht(null),a={name:"提取网络职位",alert:!1},i=r[0],o=r[1];i.success&&i.result&&(a.name=i.result),o.success&&(a.alert=!0),e(a)}))` |
| `De` | index.1751615607545.js | entry | @/legacy `confirmExtract` | `(t,e)=>{Yt.confirm({title:"温馨提示",content:'是否${e}信息，在此基础上进行编辑？',centered:!0,okText:"去提取",onOk(){t()},cancelText:"取消",onCancel(){Yt.destroyAll()}})}` |
| `Ve` | index.1751615607545.js | entry | @/legacy `SettingCodes` | `(t=>(t.WEBPORTAL_DOMAIN="webportal_domain",t.USER_CENTE_RDEFAULT_NAME="userCenterDefaultName",t.IS_SHOW_CHANGEPWD="is_show_changepwd",t.JOB_FAIR_PASSED_IZ_EDIT_POSITION="job_fair_passed_iz_edit_positi` |
| `Ae` | index.1751615607545.js | entry | @/legacy `checkSensitive` | `e=>Wn(void 0,[e],function*({value:t}){const n=yield ipt({words:t,findModule:100});if(n.success)if(n.result.izSensitiveWords==!0){let r='您输入的内容涉及敏感信息：${n.result.sensitiveWords}，请修改后再操作。';return aht(r),` |
| `Oe` | index.1751615607545.js | api | @/legacy/api `addPosition` | `t=>Ee.request({url:"/xf-job/job/xfJobFairPositionRelation/addPosition",method:"post",data:t})` |
| `J` | index.1751615607545.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:xt(Cdt(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,n){va` |
| `X` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `He` | index.1751615607545.js | api | @/legacy/api `editPosition` | `t=>Ee.request({url:"/xf-job/job/xfJobFairPositionRelation/editPosition",method:"post",data:t})` |
| `Je` | index.1751615607545.js | entry | @ant-design/icons-vue `InfoCircleOutlined` | `sm` |
| `Xe` | index.1751615607545.js | entry | @ant-design/icons-vue `QuestionCircleOutlined` | `e9` |
| `$e` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `Ee` | phone.1751615607545.js | shared | @/shared/phone.vue `default` | `u(d,[["render",m]])` |
| `S` | dictCode.1751615607545.js | shared | @/shared/dictCode.vue `default` | `c(v,[["render",S]])` |
| `Qe` | extractpositionmodal.1751615607545.js | shared | @/shared/extractpositionmodal.vue `default` | `X(ae,[["__scopeId","data-v-f343505a"]])` |
| `Ge` | workType.1751615607545.js | shared | @/shared/workType.vue `default` | `q(ce,[["__scopeId","data-v-13870526"]])` |
| `$` | message.1751615607545.js | shared | @/shared/message.ts `successCountdown` | `function c(e){let o=5;const t=n.success({title:"提交成功",content:e}),s=setInterval(()=>{o-=1,t.update({content:e})},1e3);setTimeout(()=>{clearInterval(s),t.destroy()},o*1e3)}` |
