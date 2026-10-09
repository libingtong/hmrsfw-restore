# 导入提示：page.uc.allianceUnitposition

原 chunk `AllianceUnitposition.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `pe` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `ue` | index.1751615607545.js | api | @/legacy/api `getAllianceCompanyForMyCare` | `t=>Ee.request({url:"/xf-job/job/xfJobUserCare/getAllianceCompanyForMyCare",method:"post",data:t})` |
| `_e` | index.1751615607545.js | api | @/legacy/api `getAlliancePositionForMyCare` | `t=>Ee.request({url:"/xf-job/job/xfJobUserCare/getAlliancePositionForMyCare",method:"post",data:t})` |
| `F` | index.1751615607545.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `Q` | index.1751615607545.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `E` | index.1751615607545.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:xt(Cdt(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,n){va` |
| `Y` | index.1751615607545.js | api | @/legacy/api `cancel` | `t=>Ee.request({url:"/xf-job/job/xfJobUserCare/cancel",method:"get",params:t})` |
| `H` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `ge` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
