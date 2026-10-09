# 导入提示：shared.uc.metormodal

原 chunk `metormodal.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `E` | default.1751615607545.js | shared | @/shared/images `defaultImg` | `"/assets/default.1751615607545.jpg"` |
| `R` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `O` | index.1751615607545.js | entry | @/legacy `decryptText` | `t=>{if(t&&typeof t=="string")try{return Df.sm4.decrypt(t,yC)}catch(e){return console.error("解密失败:",e),null}else return null}` |
| `B` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `U` | index.1751615607545.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:xt(Cdt(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,n){va` |
| `S` | index.1751615607545.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `C` | index.1751615607545.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `q` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `D` | index.api.17516156075454.js | api | @/api/sysConsult `queryById`（reserved） | `e=>t.request({url:"/xf-job/job/xfSysConsult/queryById",method:"get",params:e})` |
| `$` | index.api.17516156075454.js | api | @/api/sysConsult `queryOneForUserCenter`（reserved） | `e=>t.request({url:"/xf-job/job/xfJobUserTutorExpand/queryOneForUserCenter",method:"get",params:e})` |
| `j` | index.api.17516156075454.js | api | @/api/sysConsult `checkIzCanReply`（reserved） | `e=>t.request({url:"/xf-job/job/xfSysConsultReply/checkIzCanReply",method:"get",params:e})` |
| `A` | index.api.17516156075454.js | api | @/api/sysConsult `saveOne`（reserved） | `e=>t.request({url:"/xf-job/job/xfSysConsultReply/saveOne",method:"post",data:e})` |
| `V` | unfold.1751615607545.js | shared | @/shared/unfold.vue `default` | `m(x,[["__scopeId","data-v-334f6655"]])` |
