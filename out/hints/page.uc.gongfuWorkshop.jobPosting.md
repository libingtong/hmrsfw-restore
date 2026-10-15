# 导入提示：page.uc.gongfuWorkshop.jobPosting

原 chunk `index.175161560754524.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `A` | index.1751615607545.js | entry | @/legacy `http` | `new cpt({baseURL:Li,timeout:cvt})` |
| `R` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `ue` | index.1751615607545.js | entry | @/legacy `useTagsStore` | `d0("tags",{state:()=>({list:[]}),getters:{show:t=>t.list.length>0,nameList:t=>t.list.map(e=>e.name)},actions:{delTagsItem(t){this.list.splice(t,1)},setTagsItem(t){this.list.push(t)},clearTags(){this.l` |
| `X` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `te` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `re` | index.1751615607545.js | entry | @/legacy `parseIdCard` | `t=>{let e=null,n=null,r=new Date,a=r.getMonth()+1,i=r.getDate(),o=0;return t.length===18&&(o=r.getFullYear()-t.substring(6,10)-1,e=t.substring(16,17),n=t.substring(6,10)+"-"+t.substring(10,12)+"-"+t.s` |
| `_e` | index.1751615607545.js | entry | @/legacy/utils `setLocalStorage` | `(t,e)=>{localStorage.setItem(t,e)}` |
| `be` | index.1751615607545.js | entry | @/legacy `decryptText` | `t=>{if(t&&typeof t=="string")try{return Df.sm4.decrypt(t,yC)}catch(e){return console.error("解密失败:",e),null}else return null}` |
| `ve` | index.1751615607545.js | entry | @/legacy `joinAreaNames` | `(t,e)=>{let n="";return e=="workProviceName"?(t.workProviceName&&t.workProviceId&&(n=t.workProviceName),t.workCityName&&t.workCityId&&(n=n+"/"+t.workCityName),t.workAreaName&&t.workAreaId&&(n=n+"/"+t.` |
| `ye` | index.1751615607545.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:xt(Cdt(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,n){va` |
| `he` | index.1751615607545.js | entry | @/legacy/utils `maskPhone` | `t=>t?String(t).replace(/^(.{3})(?:\w+)(.{4})$/,"$1****$2"):""` |
| `ke` | idCard.1751615607545.js | shared | @/shared/idCard.vue `default` | `u(h,[["render",I]])` |
| `xe` | dictCode.1751615607545.js | shared | @/shared/dictCode.vue `default` | `c(v,[["render",S]])` |
| `Ce` | workshopNews.1751615607545.js | shared | @/shared/workshopNews/WorkshopType.vue `default`（reserved） | `A(re,[["__scopeId","data-v-cde39009"]])` |
| `Ie` | workshopNews.1751615607545.js | shared | @/shared/workshopNews/WorkshopNews.vue `default`（reserved） | `A(de,[["__scopeId","data-v-623d9692"]])` |
| `we` | message.1751615607545.js | shared | @/shared/message.ts `successCountdown` | `function c(e){let o=5;const t=n.success({title:"提交成功",content:e}),s=setInterval(()=>{o-=1,t.update({content:e})},1e3);setTimeout(()=>{clearInterval(s),t.destroy()},o*1e3)}` |
