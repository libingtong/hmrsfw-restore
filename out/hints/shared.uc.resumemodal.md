# 导入提示：shared.uc.resumemodal

原 chunk `resumemodal.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `w` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `T` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `q` | index.1751615607545.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:xt(Cdt(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,n){va` |
| `F` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `P` | index.api.17516156075456.js | api | @/api/jobCurriculumVitae `listNoPage` | `e=>t.request({url:"/xf-job/job/xfJobCurriculumVitae/listNoPage",method:"get",params:e})` |
| `V` | index.api.17516156075456.js | api | @/api/jobCurriculumVitae `saveCopy` | `e=>t.request({url:"/xf-job/job/xfJobCurriculumVitae/saveCopy",method:"get",params:e})` |
