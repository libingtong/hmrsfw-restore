# 导入提示：shared.portal.addResume

原 chunk `addResume.1783320636200.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `P` | index.1783320636200.js | entry | @/legacy `userStorage` | `{keys:!0,setUser(e){this.keys?localStorage.setItem(jn.USER_INFO,e):localStorage.setItem(jn.USER_INFO,JSON.stringify(e))},getUser(){const e=localStorage.getItem(jn.USER_INFO);if(e&&e!="undefined"&&e!="` |
| `J` | index.1783320636200.js | entry | @/legacy `getDictItemsByCode` | `e=>IN("/jeecg-system/sys/dict/getDictItemsByCode",e,"get")` |
| `L` | index.1783320636200.js | api | @/legacy/api `queryByIdJM` | `e=>ut.request({url:"/xf-job/communal/xfSysUser/queryByIdJM",method:"get",params:e})` |
| `X` | index.1783320636200.js | entry | @/utils/crypto-adapter `decryptSm4` | `e=>P3.sm4.decrypt(e,s8)` |
| `Y` | index.1783320636200.js | entry | @/legacy `validateIdCard` | `e=>{var t=[7,9,10,5,8,4,2,1,6,3,7,9,10,5,8,4,2],n=e+"";e[17];for(var r=n.substring(0,17),a=r.split(""),o=a.length,i=0,l=0;l<o;l++)i=i+a[l]*t[l];var c=/^\d{6}((((((19\|20)\d{2})(0[13-9]\|1[012])(0[1-9]\|[` |
| `U` | index.1783320636200.js | entry | ant-design-vue `message` | `D1` |
| `D` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `K` | workType.1783320636200.js | shared | @/shared/workType.vue `default` | `ye(pe,[["__scopeId","data-v-c9091e07"]])` |
| `V` | dictCode.1783320636200.js | shared | @/shared/dictCode.vue `default` | `S(i,[["render",p]])` |
| `Z` | index.1783320636200117.js | api | @/api/jobCompany `checkIdCard` | `e=>o.request({url:"/xf-job/communal/xfSysUser/checkIdCard",method:"post",data:e})` |
| `ae` | index.api.17833206362002.js | api | @/api/jobCurriculumVitae `saveUserAndVitaeWithCare` | `e=>a.request({url:"/xf-job/job/xfJobUserCare/saveUserAndVitaeWithCare",method:"post",data:e})` |
| `le` | index.api.17833206362002.js | api | @/api/jobCurriculumVitae `saveUserAndVitae` | `e=>a.request({url:"/xf-job/job/xfJobCurriculumVitae/saveUserAndVitae",method:"post",data:e})` |
