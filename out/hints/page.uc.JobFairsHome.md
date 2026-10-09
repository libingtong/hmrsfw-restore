# 导入提示：page.uc.JobFairsHome

原 chunk `JobFairsHome.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `Re` | jspdf.es.min.1751615607545.js | shared | @/shared/jspdf.es.min.ts `Watermark` | `class{constructor(e){var n,a,c,o,l,h,f,g,b;this.defaultOptions={container:document.body,zIndex:9,rotate:-22,gap:[100,100],font:{}},this.options=Object.assign({},this.defaultOptions,e),this.container=t` |
| `Ke` | jspdf.es.min.1751615607545.js | shared | jspdf `jsPDF` | `function Ht(r){var e,n=typeof arguments[0]=="string"?arguments[0]:"p",a=arguments[1],c=arguments[2],o=arguments[3],l=[],h=1,f=16,g="S",b=null;ve(r=r\|\|{})==="object"&&(n=r.orientation,a=r.unit\|\|a,c=r.f` |
| `Ae` | index.api.175161560754511.js | api | @/api/api-175161560754511 `addOrUpdate` | `o=>t.request({url:"/xf-job/job/xfJobFairApplyUnsubscribe/addOrUpdate",method:"post",data:o})` |
| `He` | index.api.175161560754511.js | api | @/api/api-175161560754511 `myJobFairList` | `o=>t.request({url:"/xf-job/job/xfJobFair/myJobFairList",method:"post",data:o})` |
| `Je` | index.api.175161560754511.js | api | @/api/api-175161560754511 `fairParticipationToHtml` | `o=>t.request({url:"/xf-job/job/xfJobFair/xfJobFairApplyInfo/fairParticipationToHtml?xfJobFairId="+o.xfJobFairId+"&applyInfoId="+o.applyInfoId,method:"post",data:o})` |
| `ae` | dictCode.1751615607545.js | shared | @/shared/dictCode.vue `default` | `c(v,[["render",S]])` |
| `qe` | positionmodal.1751615607545.js | shared | @/shared/positionmodal.vue `default` | `B(X,[["__scopeId","data-v-0ff88674"]])` |
| `De` | beonmodal.1751615607545.js | shared | @/shared/beonmodal.vue `default` | `h(A,[["__scopeId","data-v-1e6b66f8"]])` |
| `ze` | index.175161560754529.js | entry | @/shared/CancelReasonModal.vue `default` | `g(I,[["__scopeId","data-v-db987c98"]])` |
| `Le` | index.1751615607545.js | entry | @/legacy `useTagsStore` | `d0("tags",{state:()=>({list:[]}),getters:{show:t=>t.list.length>0,nameList:t=>t.list.map(e=>e.name)},actions:{delTagsItem(t){this.list.splice(t,1)},setTagsItem(t){this.list.push(t)},clearTags(){this.l` |
| `ie` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `oe` | index.1751615607545.js | api | @/legacy `getDictItemsByCode` | `t=>Ee.request({url:"/jeecg-system/sys/dict/getDictItemsByCode",method:"get",params:t})` |
| `H` | index.1751615607545.js | api | @/legacy `getSettingValueByCode` | `t=>Ee.request({url:"/xf-job/communal/xfSysBusinessSetting/getSettingValueByCode",method:"get",params:t})` |
| `J` | index.1751615607545.js | entry | @/legacy `SettingCodes` | `(t=>(t.WEBPORTAL_DOMAIN="webportal_domain",t.USER_CENTE_RDEFAULT_NAME="userCenterDefaultName",t.IS_SHOW_CHANGEPWD="is_show_changepwd",t.JOB_FAIR_PASSED_IZ_EDIT_POSITION="job_fair_passed_iz_edit_positi` |
| `$` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `Me` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `W` | message.1751615607545.js | shared | @/shared/message.ts `successCountdown` | `function c(e){let o=5;const t=n.success({title:"提交成功",content:e}),s=setInterval(()=>{o-=1,t.update({content:e})},1e3);setTimeout(()=>{clearInterval(s),t.destroy()},o*1e3)}` |
