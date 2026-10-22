# 导入提示：page.uc.autoLogin

原 chunk `autoLogin.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `f` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `v` | index.1751615607545.js | entry | @/legacy/utils `getUrlParams`（reserved） | `function Xgt(t=location.href){let e=t.split("?")[1]\|\|"",n={},r=e.split("&");for(let a=0,i=r.length;a<i;a++){const o=r[a].indexOf("=");let l=[r[a].substring(0,o),r[a].substring(o+1)];n[l[0]]=l[1]}retur` |
| `_` | index.1751615607545.js | api | @/legacy `getDictItemsByCode` | `t=>Ee.request({url:"/jeecg-system/sys/dict/getDictItemsByCode",method:"get",params:t})` |
| `s` | index.1751615607545.js | entry | @/legacy/store `vuexStore`（reserved） | `jht` |
| `N` | index.1751615607545.js | api | @/legacy/api `getSysUserByToken`（reserved） | `t=>Ee.request({url:"/xf-job/communal/xfSysUser/getSysUserByToken",method:"get",params:{curToken:t}})` |
| `S` | index.1751615607545.js | entry | @/legacy `decryptText` | `t=>{if(t&&typeof t=="string")try{return Df.sm4.decrypt(t,yC)}catch(e){return console.error("解密失败:",e),null}else return null}` |
| `G` | index.1751615607545.js | entry | @/utils/crypto-adapter `encryptStorage` | `t=>t&&typeof t=="object"&&t!==null?Df.sm4.encrypt(JSON.stringify(t),yC):null` |
| `p` | index.1751615607545.js | entry | @/legacy/utils `setLocalStorage`（reserved） | `(t,e)=>{localStorage.setItem(t,e)}` |
| `P` | index.1751615607545.js | api | @/legacy/api `listOneForWebSite`（reserved） | `t=>Ee.request({url:"/xf-job/communal/xfSysUser/listOneForWebSite",method:"get",params:t})` |
| `w` | index.1751615607545.js | api | @/legacy `getSettingValueByCode` | `t=>Ee.request({url:"/xf-job/communal/xfSysBusinessSetting/getSettingValueByCode",method:"get",params:t})` |
| `q` | index.1751615607545.js | entry | @/legacy `SettingCodes` | `(t=>(t.WEBPORTAL_DOMAIN="webportal_domain",t.USER_CENTE_RDEFAULT_NAME="userCenterDefaultName",t.IS_SHOW_CHANGEPWD="is_show_changepwd",t.JOB_FAIR_PASSED_IZ_EDIT_POSITION="job_fair_passed_iz_edit_positi` |
| `B` | index.1751615607545.js | api | @/legacy `getCompanyInfo` | `t=>Ee.request({url:"/xf-job/job/xfJobCompany/getCompanyInfo",method:"get",params:t})` |
| `D` | index.1751615607545.js | api | @/legacy/api `queryByIdJM`（reserved） | `t=>Ee.request({url:"/xf-job/communal/xfSysUser/queryByIdJM",method:"get",params:t})` |
| `E` | index.1751615607545.js | api | @/legacy/api `sysUserAuthenticateIdentityList`（reserved） | `t=>Ee.request({url:"/xf-job/communal/xfSysUserAuthenticateIdentity/list",method:"get",params:t})` |
