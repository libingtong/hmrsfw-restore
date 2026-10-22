# 导入提示：page.uc.collage.nojob

原 chunk `nojob.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `J` | index.1751615607545.js | api | @/legacy/api `getAllInfo`（reserved） | `t=>Ee.request({url:"/xf-job/communal/xfSysAreainfo/getAllInfo",method:"post",data:t})` |
| `L` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `X` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `Y` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `W` | index.api.175161560754513.js | api | @/api/collegeWqCancelDetail `getStudentInfoById`（reserved） | `e=>t.request({url:"/xf-college/student/xfCollegeStudent/getStudentInfoById",method:"post",params:e})` |
| `ee` | index.api.175161560754513.js | api | @/api/collegeWqCancelDetail `queryById`（reserved） | `e=>t.request({url:"/xf-college/wqStudResult/xfCollegeWqStudResult/queryById",method:"get",params:e})` |
| `le` | index.api.175161560754513.js | api | @/api/collegeWqCancelDetail `edit2`（reserved） | `e=>t.request({url:e.id?"/xf-college/wqStudResult/xfCollegeWqStudResult/edit":"/xf-college/wqStudResult/xfCollegeWqStudResult/add",method:"post",data:e})` |
| `N` | dictCode.1751615607545.js | shared | @/shared/dictCode.vue `default` | `c(v,[["render",S]])` |
