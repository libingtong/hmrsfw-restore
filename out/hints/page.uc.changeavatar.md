# 导入提示：page.uc.changeavatar

原 chunk `changeavatar.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `i` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `w` | index.1751615607545.js | api | @/legacy `getSettingValueByCode` | `t=>Ee.request({url:"/xf-job/communal/xfSysBusinessSetting/getSettingValueByCode",method:"get",params:t})` |
| `P` | index.1751615607545.js | entry | @/legacy `SettingCodes` | `(t=>(t.WEBPORTAL_DOMAIN="webportal_domain",t.USER_CENTE_RDEFAULT_NAME="userCenterDefaultName",t.IS_SHOW_CHANGEPWD="is_show_changepwd",t.JOB_FAIR_PASSED_IZ_EDIT_POSITION="job_fair_passed_iz_edit_positi` |
| `u` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `B` | index.1751615607545.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `z` | index.1751615607545.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `N` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `D` | index.api.17516156075453.js | api | @/api/api-17516156075453 `setXfSysUserPhoto` | `e=>s.request({url:"/xf-job/communal/xfSysUser/setXfSysUserPhoto",method:"get",params:e})` |
| `J` | cropperjs.1751615607545.js | shared | @/shared/cropperjs.vue `default` | `He($i,[["__scopeId","data-v-e652d67f"]])` |
