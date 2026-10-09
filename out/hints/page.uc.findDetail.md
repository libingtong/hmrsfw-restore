# 导入提示：page.uc.findDetail

原 chunk `detail.17516156075452.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `ie` | index.api.17516156075457.js | api | @/api/oddFindJobInfo `queryById`（reserved） | `d=>e.request({url:"/xf-oddjob/oddJob/xfOddFindJobInfo/queryById",method:"get",params:d})` |
| `ce` | index.api.17516156075457.js | api | @/api/oddFindJobInfo `edit2`（reserved） | `d=>e.request({url:"/xf-oddjob/oddJob/xfOddFindJobInfo/edit",method:"post",data:d})` |
| `pe` | index.api.17516156075457.js | api | @/api/oddFindJobInfo `add2`（reserved） | `d=>e.request({url:"/xf-oddjob/oddJob/xfOddFindJobInfo/add",method:"post",data:d})` |
| `J` | dictCode.1751615607545.js | shared | @/shared/dictCode.vue `default` | `c(v,[["render",S]])` |
| `me` | oddNews.1751615607545.js | shared | @/shared/oddNews/OddType.vue `default`（reserved） | `A(ie,[["__scopeId","data-v-8b4d3811"]])` |
| `fe` | oddNews.1751615607545.js | shared | @/shared/oddNews/OddNews.vue `default`（reserved） | `A(de,[["__scopeId","data-v-69c520ac"]])` |
| `N` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `ge` | index.1751615607545.js | entry | @/legacy `useTagsStore` | `d0("tags",{state:()=>({list:[]}),getters:{show:t=>t.list.length>0,nameList:t=>t.list.map(e=>e.name)},actions:{delTagsItem(t){this.list.splice(t,1)},setTagsItem(t){this.list.push(t)},clearTags(){this.l` |
| `be` | index.1751615607545.js | api | @/legacy `getDictValueByCodes` | `t=>Ee.request({url:"/xf-job/school/user/getDictValueByCodes",method:"post",params:t})` |
| `ve` | index.1751615607545.js | entry | @/legacy `joinAreaNames` | `(t,e)=>{let n="";return e=="workProviceName"?(t.workProviceName&&t.workProviceId&&(n=t.workProviceName),t.workCityName&&t.workCityId&&(n=n+"/"+t.workCityName),t.workAreaName&&t.workAreaId&&(n=n+"/"+t.` |
| `w` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `_e` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `he` | message.1751615607545.js | shared | @/shared/message.ts `successCountdown` | `function c(e){let o=5;const t=n.success({title:"提交成功",content:e}),s=setInterval(()=>{o-=1,t.update({content:e})},1e3);setTimeout(()=>{clearInterval(s),t.destroy()},o*1e3)}` |
