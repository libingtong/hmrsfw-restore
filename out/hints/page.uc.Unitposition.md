# 导入提示：page.uc.Unitposition

原 chunk `Unitposition.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `de` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `Ae` | index.1751615607545.js | api | @/legacy/api `getCompanyForMyCare` | `t=>Ee.request({url:"/xf-job/job/xfJobUserCare/getCompanyForMyCare",method:"get",params:t})` |
| `ge` | index.1751615607545.js | api | @/legacy/api `getCompanyPositionForMyCare` | `t=>Ee.request({url:"/xf-job/job/xfJobUserCare/getCompanyPositionForMyCare",method:"get",params:t})` |
| `F` | index.1751615607545.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `H` | index.1751615607545.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `L` | index.1751615607545.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:xt(Cdt(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,n){va` |
| `q` | index.1751615607545.js | api | @/legacy/api `cancel` | `t=>Ee.request({url:"/xf-job/job/xfJobUserCare/cancel",method:"get",params:t})` |
| `Z` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `pe` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
