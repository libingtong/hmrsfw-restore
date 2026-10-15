# 导入提示：page.uc.needDetail

原 chunk `detail.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `Se` | index.api.17516156075457.js | api | @/api/oddFindJobInfo `getDetailById` | `d=>e.request({url:"/xf-oddjob/oddJob/xfOddNeedJobInfo/getDetailById",method:"get",params:d})` |
| `Ue` | index.api.17516156075457.js | api | @/api/oddFindJobInfo `edit` | `d=>e.request({url:"/xf-oddjob/oddJob/xfOddNeedJobInfo/edit",method:"post",data:d})` |
| `Re` | index.api.17516156075457.js | api | @/api/oddFindJobInfo `add` | `d=>e.request({url:"/xf-oddjob/oddJob/xfOddNeedJobInfo/add",method:"post",data:d})` |
| `V` | dictCode.1751615607545.js | shared | @/shared/dictCode.vue `default` | `c(v,[["render",S]])` |
| `ze` | mapInfo.1751615607545.js | shared | @/shared/mapInfo.vue `default`（reserved） | `$(D,[["__scopeId","data-v-ca2ac43c"]])` |
| `Me` | oddNews.1751615607545.js | shared | @/shared/oddNews/OddType.vue `default`（reserved） | `A(ie,[["__scopeId","data-v-8b4d3811"]])` |
| `Ae` | oddNews.1751615607545.js | shared | @/shared/oddNews/OddNews.vue `default`（reserved） | `A(de,[["__scopeId","data-v-69c520ac"]])` |
| `F` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `De` | index.1751615607545.js | entry | @/legacy `useTagsStore` | `d0("tags",{state:()=>({list:[]}),getters:{show:t=>t.list.length>0,nameList:t=>t.list.map(e=>e.name)},actions:{delTagsItem(t){this.list.splice(t,1)},setTagsItem(t){this.list.push(t)},clearTags(){this.l` |
| `Je` | index.1751615607545.js | api | @/legacy `getDictValueByCodes` | `t=>Ee.request({url:"/xf-job/school/user/getDictValueByCodes",method:"post",params:t})` |
| `Ve` | index.1751615607545.js | entry | @/legacy `joinAreaNames` | `(t,e)=>{let n="";return e=="workProviceName"?(t.workProviceName&&t.workProviceId&&(n=t.workProviceName),t.workCityName&&t.workCityId&&(n=n+"/"+t.workCityName),t.workAreaName&&t.workAreaId&&(n=n+"/"+t.` |
| `Fe` | index.1751615607545.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `Be` | index.1751615607545.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `L` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `Ye` | index.1751615607545.js | entry | @/legacy `formatDateSlash` | `t=>{var e=t.getFullYear(),n=t.getMonth()+1,r=t.getDate();return t.getHours(),t.getMinutes(),t.getSeconds(),e+"/"+n+"/"+r}` |
| `He` | index.1751615607545.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:xt(Cdt(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,n){va` |
| `Oe` | index.1751615607545.js | entry | @/legacy `UPLOAD_URL` | `SX.upload` |
| `Ee` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `$e` | message.1751615607545.js | shared | @/shared/message.ts `successCountdown` | `function c(e){let o=5;const t=n.success({title:"提交成功",content:e}),s=setInterval(()=>{o-=1,t.update({content:e})},1e3);setTimeout(()=>{clearInterval(s),t.destroy()},o*1e3)}` |
