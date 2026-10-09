# 导入提示：page.uc.addNewsDetails

原 chunk `addNewsDetails.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `Fe` | Editor.1751615607545.js | shared | @/shared/Editor.vue `default`（reserved） | `IU(iW,[["__scopeId","data-v-4313aa41"]])` |
| `Re` | dictCode.1751615607545.js | shared | @/shared/dictCode.vue `default` | `c(v,[["render",S]])` |
| `ze` | index.1751615607545.js | entry | @/legacy `useTagsStore` | `d0("tags",{state:()=>({list:[]}),getters:{show:t=>t.list.length>0,nameList:t=>t.list.map(e=>e.name)},actions:{delTagsItem(t){this.list.splice(t,1)},setTagsItem(t){this.list.push(t)},clearTags(){this.l` |
| `ae` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `Ge` | index.1751615607545.js | api | @/legacy `getSettingValueByCode` | `t=>Ee.request({url:"/xf-job/communal/xfSysBusinessSetting/getSettingValueByCode",method:"get",params:t})` |
| `y` | index.1751615607545.js | entry | dayjs `default` | `Oa(Trt)` |
| `Me` | index.1751615607545.js | entry | @/legacy/utils `formatDateTime` | `t=>{var e=t.getFullYear(),n=t.getMonth()+1,r=t.getDate(),a=t.getHours(),i=t.getMinutes(),o=t.getSeconds();return e+"-"+n+"-"+r+" "+a+":"+i+":"+o}` |
| `D` | index.1751615607545.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `B` | index.1751615607545.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `I` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `Oe` | index.1751615607545.js | entry | @/legacy `formatDateSlash` | `t=>{var e=t.getFullYear(),n=t.getMonth()+1,r=t.getDate();return t.getHours(),t.getMinutes(),t.getSeconds(),e+"/"+n+"/"+r}` |
| `Ye` | index.1751615607545.js | entry | @/legacy `UPLOAD_URL` | `SX.upload` |
| `He` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `Je` | index.api.175161560754518.js | api | @/api/sysArticle `queryById` | `t=>e.request({url:"/xf-job/communal/xfSysArticle/queryById",method:"get",params:t})` |
| `Ae` | index.api.175161560754518.js | api | @/api/sysArticle `addOrEditRecruitment` | `t=>e.request({url:"/xf-job/communal/xfSysArticle/addOrEditRecruitment",method:"post",data:t})` |
