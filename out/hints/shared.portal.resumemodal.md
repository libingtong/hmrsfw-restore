# 导入提示：shared.portal.resumemodal

原 chunk `resumemodal.1783320636200.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `T` | index.1783320636200.js | entry | @/legacy `userStorage` | `{keys:!0,setUser(e){this.keys?localStorage.setItem(jn.USER_INFO,e):localStorage.setItem(jn.USER_INFO,JSON.stringify(e))},getUser(){const e=localStorage.getItem(jn.USER_INFO);if(e&&e!="undefined"&&e!="` |
| `x` | index.1783320636200.js | entry | @/legacy `openUserCenter` | `(e,t)=>{let n=rr.getters.userUrl;t=t\|\|"_blank",n&&n.charAt(n.length-1)==="/"&&(n=n.slice(0,-1)),window.open(n+"/autoLogin?toPath="+encodeURIComponent(e)+"&token="+Ze.getToken(),t)}` |
| `S` | index.1783320636200.js | entry | ant-design-vue `message` | `D1` |
| `D` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `J` | index.api.17833206362002.js | api | @/api/jobCurriculumVitae `listNoPageForDeliver` | `e=>a.request({url:"/xf-job/job/xfJobCurriculumVitae/listNoPageForDeliver",method:"get",params:e})` |
| `N` | index.api.17833206362002.js | api | @/api/jobCurriculumVitae `listNoPageForDeliver2` | `e=>a.request({url:"/alliance/curriculumVitaeDeliver/listNoPageForDeliver",method:"get",params:e})` |
| `Z` | index.api.17833206362002.js | api | @/api/jobCurriculumVitae `add2` | `e=>a.request({url:"/xf-job/job/xfJobCurriculumVitaeDeliver/add",method:"get",params:e})` |
| `$` | index.api.17833206362002.js | api | @/api/jobCurriculumVitae `add3` | `e=>a.request({url:"/xf-alliance/alliance/curriculumVitaeDeliver/add",method:"get",params:e})` |
