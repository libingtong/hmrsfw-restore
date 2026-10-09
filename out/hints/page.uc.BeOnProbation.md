# 导入提示：page.uc.BeOnProbation

原 chunk `BeOnProbation.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `ee` | index.1751615607545.js | entry | @/legacy `useTagsStore` | `d0("tags",{state:()=>({list:[]}),getters:{show:t=>t.list.length>0,nameList:t=>t.list.map(e=>e.name)},actions:{delTagsItem(t){this.list.splice(t,1)},setTagsItem(t){this.list.push(t)},clearTags(){this.l` |
| `N` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `ae` | index.1751615607545.js | api | @/legacy `detailById` | `t=>Ee.request({url:"/xf-job/job/xfJobCompanyPosition/detailById",method:"get",params:t})` |
| `te` | index.1751615607545.js | entry | @/legacy `joinAreaNames` | `(t,e)=>{let n="";return e=="workProviceName"?(t.workProviceName&&t.workProviceId&&(n=t.workProviceName),t.workCityName&&t.workCityId&&(n=n+"/"+t.workCityName),t.workAreaName&&t.workAreaId&&(n=n+"/"+t.` |
| `T` | index.1751615607545.js | entry | dayjs `default` | `Oa(Trt)` |
| `re` | index.1751615607545.js | api | @/legacy/api `checkPositionName` | `t=>Ee.request({url:"/xf-job/job/xfJobCompanyPosition/checkPositionName",method:"post",params:t})` |
| `se` | index.1751615607545.js | api | @/legacy/api `getrefreshTime` | `t=>Ee.request({url:"/xf-job/job/xfJobCompanyPosition/getrefreshTime",method:"post",data:t})` |
| `le` | index.1751615607545.js | api | @/legacy/api `addOrEdit` | `t=>Ee.request({url:"/xf-job/job/xfJobCompanyPosition/addOrEdit",method:"post",data:t})` |
| `ue` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `ne` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `P` | dictCode.1751615607545.js | shared | @/shared/dictCode.vue `default` | `c(v,[["render",S]])` |
| `ie` | dictCodeTreeOne.1751615607545.js | shared | @/shared/dictCodeTreeOne.vue `default` | `C(N,[["render",B]])` |
