# 导入提示：shared.uc.authCompany

原 chunk `authCompany.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `Q` | index.1751615607545.js | entry | @/legacy `useTagsStore` | `d0("tags",{state:()=>({list:[]}),getters:{show:t=>t.list.length>0,nameList:t=>t.list.map(e=>e.name)},actions:{delTagsItem(t){this.list.splice(t,1)},setTagsItem(t){this.list.push(t)},clearTags(){this.l` |
| `W` | index.1751615607545.js | entry | vuex `useStore` | `function xc(t){return t===void 0&&(t=null),Ot(t!==null?t:TR)}` |
| `x` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `y` | index.1751615607545.js | api | @/legacy/api `queryByCompanyId`（reserved） | `t=>Ee.request({url:"/xf-job/communal/xfSysUserAuthenticateIdentityItem/queryByCompanyId",method:"post",params:t})` |
| `T` | index.1751615607545.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `K` | index.1751615607545.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `ee` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `te` | market.vue_vue_type_script_setup_true_lang.1751615607545.js | shared | @/shared/market.vue `default`（reserved） | `N({__name:"market",props:{show:{type:Boolean}},emits:"submit",setup(h,{emit:i}){const c=q(),l=d({title:"",content:""});S(()=>{console.log("----jinalie")});const p=d({visible:!0}),y={},x={labelCol:{spa` |
| `se` | addKeynote.1751615607545.js | shared | @/shared/addKeynote/AddBeOnProbation.vue `default`（reserved） | `N(L,[["__scopeId","data-v-de576056"]])` |
| `oe` | addKeynote.1751615607545.js | shared | @/shared/addKeynote/AddKeynote.vue `default`（reserved） | `N(X,[["__scopeId","data-v-a5cea3e0"]])` |
