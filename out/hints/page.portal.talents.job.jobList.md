# 导入提示：page.portal.talents.job.jobList

原 chunk `jobList.17833206362004.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `Ue` | index.1783320636200.js | entry | @/utils/request `request` | `new QIe({baseURL:ct,timeout:zN})` |
| `Re` | index.1783320636200.js | entry | @/legacy `userStorage` | `{keys:!0,setUser(e){this.keys?localStorage.setItem(jn.USER_INFO,e):localStorage.setItem(jn.USER_INFO,JSON.stringify(e))},getUser(){const e=localStorage.getItem(jn.USER_INFO);if(e&&e!="undefined"&&e!="` |
| `je` | index.1783320636200.js | api | @/legacy `getDictListByType` | `e=>ut.request({url:"/xf-job/communal/licenseFree/getDictListByType",method:"post",params:e})` |
| `Je` | index.1783320636200.js | entry | @/legacy `listToTree` | `function(e){const t=[],n={};return e.forEach(r=>{r.children=[],n[r.id]=r}),e.forEach(r=>{const a=n[r.parentId];a?a.children.push(r):t.push(r)}),t}` |
| `U` | index.1783320636200.js | entry | @/legacy `getDictItemsByCode` | `e=>IN("/jeecg-system/sys/dict/getDictItemsByCode",e,"get")` |
| `Me` | index.1783320636200.js | entry | @/legacy `useStore` | `function(e){return e===void 0&&(e=null),Ft(e!==null?e:Ru)}` |
| `Ve` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `b` | dictCode.1783320636200.js | shared | @/shared/dictCode.vue `default` | `S(i,[["render",p]])` |
| `Oe` | city.1783320636200.js | shared | @/shared/city.vue `default` | `oe(J,[["__scopeId","data-v-911d64a4"]])` |
| `He` | workType.1783320636200.js | shared | @/shared/workType.vue `default` | `ye(pe,[["__scopeId","data-v-c9091e07"]])` |
| `Ee` | workItemNew.1783320636200.js | shared | @/shared/workItemNew.vue `default`（reserved） | `ua(Z,[["__scopeId","data-v-8497f6c3"]])` |
| `Ke` | empty.1783320636200.js | shared | @/shared/empty.vue `default` | `x(i,[["render",s],["__scopeId","data-v-810a04d0"]])` |
| `Xe` | map.17833206362002.js | shared | @/shared/map.vue `default`（reserved） | `g(c,[["__scopeId","data-v-f61d55fe"]])` |
