# 导入提示：page.uc.mysubscribe

原 chunk `mysubscribe.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `R` | index.api.17516156075456.js | api | @/api/api-56 `getSettingValueByCode` | `e=>t.request({url:"/xf-job/communal/xfSysBusinessSetting/getSettingValueByCode",method:"get",params:e})` |
| `B` | index.api.17516156075456.js | api | @/api/api-56 `isCanAdd` | `e=>t.request({url:"/xf-job/job/xfJobSubscribeRecord/isCanAdd",method:"get",params:e})` |
| `F` | index.api.17516156075456.js | api | @/api/api-56 `list5` | `e=>t.request({url:"/xf-job/job/xfJobSubscribeRecord/list",method:"get",params:e})` |
| `D` | index.api.17516156075456.js | api | @/api/api-56 `deleteItem6` | `e=>t.request({url:"/xf-job/job/xfJobSubscribeRecord/delete",method:"DELETE",params:e})` |
| `$` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `A` | index.1751615607545.js | entry | @/legacy `SettingCodes` | `(t=>(t.WEBPORTAL_DOMAIN="webportal_domain",t.USER_CENTE_RDEFAULT_NAME="userCenterDefaultName",t.IS_SHOW_CHANGEPWD="is_show_changepwd",t.JOB_FAIR_PASSED_IZ_EDIT_POSITION="job_fair_passed_iz_edit_positi` |
