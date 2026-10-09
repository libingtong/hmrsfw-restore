# 导入提示：page.uc.graduates

原 chunk `index.17516156075458.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `j` | dictCode.1751615607545.js | shared | @/shared/dictCode.vue `default` | `c(v,[["render",S]])` |
| `N` | index.1751615607545.js | entry | @/legacy `http` | `new cpt({baseURL:Li,timeout:cvt})` |
| `x` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `$` | index.1751615607545.js | entry | vuex `useStore` | `function xc(t){return t===void 0&&(t=null),Ot(t!==null?t:TR)}` |
| `A` | index.1751615607545.js | entry | @/legacy `useTagsStore` | `d0("tags",{state:()=>({list:[]}),getters:{show:t=>t.list.length>0,nameList:t=>t.list.map(e=>e.name)},actions:{delTagsItem(t){this.list.splice(t,1)},setTagsItem(t){this.list.push(t)},clearTags(){this.l` |
| `L` | index.1751615607545.js | api | @/legacy/api `listOneForWebSite`（reserved） | `t=>Ee.request({url:"/xf-job/communal/xfSysUser/listOneForWebSite",method:"get",params:t})` |
| `T` | index.1751615607545.js | entry | @/legacy `decryptText` | `t=>{if(t&&typeof t=="string")try{return Df.sm4.decrypt(t,yC)}catch(e){return console.error("解密失败:",e),null}else return null}` |
| `Q` | index.1751615607545.js | entry | @/legacy/utils `setLocalStorage`（reserved） | `(t,e)=>{localStorage.setItem(t,e)}` |
| `S` | index.1751615607545.js | entry | dayjs `default` | `Oa(Trt)` |
| `I` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `W` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
