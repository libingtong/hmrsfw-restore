# 导入提示：shared.uc.complaint

原 chunk `complaint.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `B` | index.api.17516156075456.js | api | @/api/api-56 `add7` | `e=>t.request({url:"/xf-job/job/xfJobComplaintRecord/add",method:"post",data:e})` |
| `U` | index.api.17516156075452.js | api | @/api/sysUser `queryByIdJM`（reserved） | `e=>t.request({url:"/xf-job/communal/xfSysUser/queryByIdJM",method:"get",params:e})` |
| `q` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `O` | index.1751615607545.js | entry | @/legacy `decryptText` | `t=>{if(t&&typeof t=="string")try{return Df.sm4.decrypt(t,yC)}catch(e){return console.error("解密失败:",e),null}else return null}` |
| `j` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `D` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `F` | phone.1751615607545.js | shared | @/shared/phone.vue `default` | `u(d,[["render",m]])` |
