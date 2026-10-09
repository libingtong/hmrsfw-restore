# 导入提示：shared.uc.setStatusinterview

原 chunk `setStatusinterview.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `x` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `I` | index.1751615607545.js | api | @/legacy `getDictItemsByCode` | `t=>Ee.request({url:"/jeecg-system/sys/dict/getDictItemsByCode",method:"get",params:t})` |
| `g` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `L` | index.1751615607545.js | api | @/legacy/api `jobCurriculumVitaeDeliverSetStatus` | `t=>Ee.request({url:"/xf-job/job/xfJobCurriculumVitaeDeliver/setStatus",method:"get",params:t})` |
| `T` | index.1751615607545.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:xt(Cdt(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,n){va` |
| `B` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `M` | index.api.175161560754510.js | api | @/api/jobCurriculumVitaeDeliver `setStatus` | `e=>t.request({url:"/job/licenseFree/xfJobLiveCurriculumVitaeDeliver/setStatus",method:"post",data:e})` |
