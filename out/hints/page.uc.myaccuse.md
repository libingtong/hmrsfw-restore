# 导入提示：page.uc.myaccuse

原 chunk `myaccuse.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `B` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `F` | index.1751615607545.js | api | @/legacy/api `volist` | `t=>Ee.request({url:"/xf-job/job/xfJobComplaintRecord/volist",method:"get",params:t})` |
| `P` | index.1751615607545.js | api | @/legacy `getDictItemsByCode` | `t=>Ee.request({url:"/jeecg-system/sys/dict/getDictItemsByCode",method:"get",params:t})` |
| `$` | index.1751615607545.js | api | @/legacy/api `undoComplaint` | `t=>Ee.request({url:"/job/xfJobComplaintRecord/undoComplaint",method:"post",params:t})` |
| `L` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `Q` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `E` | dictCode.1751615607545.js | shared | @/shared/dictCode.vue `default` | `c(v,[["render",S]])` |
