# 导入提示：page.uc.sign.corpInfo

原 chunk `info.17516156075452.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `h` | dictCode.1751615607545.js | shared | @/shared/dictCode.vue `default` | `c(v,[["render",S]])` |
| `S` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `J` | index.1751615607545.js | entry | @/legacy `joinAreaNames` | `(t,e)=>{let n="";return e=="workProviceName"?(t.workProviceName&&t.workProviceId&&(n=t.workProviceName),t.workCityName&&t.workCityId&&(n=n+"/"+t.workCityName),t.workAreaName&&t.workAreaId&&(n=n+"/"+t.` |
| `T` | index.1751615607545.js | entry | @/legacy/utils `isPhoneOrTel`（reserved） | `t=>{let e=/^((0\d{2,3})-{0,1})?(\d{7,8})$/;return/^1[3456789]\d{9}$/.test(t)?!0:!!e.test(t)}` |
| `q` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `V` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `L` | index.api.175161560754514.js | api | @/api/collegeWqCompanyExpand `getWqCompanyExpandInfoByJob`（reserved） | `e=>t.request({url:"/xf-college/collegeWqCompanyExpand/xfCollegeWqCompanyExpand/getWqCompanyExpandInfoByJob",method:"post",params:e})` |
| `F` | index.api.175161560754514.js | api | @/api/collegeWqCompanyExpand `add`（reserved） | `e=>t.request({url:"/xf-college/collegeWqCompanyExpand/xfCollegeWqCompanyExpand/add",method:"post",data:e})` |
| `B` | index.api.175161560754514.js | api | @/api/collegeWqCompanyExpand `edit`（reserved） | `e=>t.request({url:"xf-college/collegeWqCompanyExpand/xfCollegeWqCompanyExpand/edit",method:"post",data:e})` |
