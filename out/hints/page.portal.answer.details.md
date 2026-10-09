# 导入提示：page.portal.answer.details

原 chunk `details.1783320636200.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `Ce` | wenjuan.1783320636200.js | shared | @/shared/images `wenjuanImg` | `"/zcyz/wenjuan.jpg"` |
| `Oe` | index.1783320636200.js | entry | @/legacy `getAppConfig` | `()=>{let e=sessionStorage.getItem("appConfig")?sessionStorage.getItem("appConfig"):document.getElementsByTagName("head")[0].getAttribute("data-config");return JSON.parse(e)}` |
| `Fe` | index.1783320636200.js | entry | @/legacy `userStorage` | `{keys:!0,setUser(e){this.keys?localStorage.setItem(jn.USER_INFO,e):localStorage.setItem(jn.USER_INFO,JSON.stringify(e))},getUser(){const e=localStorage.getItem(jn.USER_INFO);if(e&&e!="undefined"&&e!="` |
| `q` | index.1783320636200.js | entry | @/legacy/utils `formatDateTime`（reserved） | `e=>{var t=e.getFullYear(),n=e.getMonth()+1,r=e.getDate(),a=e.getHours(),o=e.getMinutes(),i=e.getSeconds();return o<10&&(o="0"+o),a<10&&(a="0"+a),i<10&&(i="0"+i),t+"-"+n+"-"+r+" "+a+":"+o+":"+i}` |
| `k` | index.1783320636200.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:Ut(O_e(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,t){va` |
| `Re` | index.1783320636200.js | entry | @/legacy `getDictItemsByCode` | `e=>IN("/jeecg-system/sys/dict/getDictItemsByCode",e,"get")` |
| `ze` | index.1783320636200.js | entry | @/legacy `LoginModal`（reserved） | `mt(nne,[["__scopeId","data-v-6ac82971"]])` |
| `Ee` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `Ge` | index.api.178332063620011.js | api | @/api/quenaire `izLogin`（reserved） | `e=>a.request({url:"/xf-job/communal/licenseFree/quenaire/izLogin",method:"post",params:e})` |
| `Ke` | index.api.178332063620011.js | api | @/api/quenaire `preview`（reserved） | `e=>a.request({url:"/xf-job/communal/licenseFree/quenaire/preview",method:"post",params:e})` |
| `We` | index.api.178332063620011.js | api | @/api/quenaire `preview2`（reserved） | `e=>a.request({url:"/xf-job/communal/xfSysQuenaire/preview",method:"post",params:e})` |
| `$` | index.api.178332063620011.js | api | @/api/quenaire `staggingOrSubmit`（reserved） | `e=>a.request({url:"/xf-job/communal/xfSysQuenaireRecord/staggingOrSubmit",method:"post",data:e})` |
| `me` | index.api.178332063620011.js | api | @/api/quenaire `submit`（reserved） | `e=>a.request({url:"/xf-job/communal/licenseFree/quenaire/submit",method:"post",data:e})` |
