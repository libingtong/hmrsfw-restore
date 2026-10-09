# 导入提示：page.uc.signUp

原 chunk `signUp.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `oe` | index.1751615607545.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:xt(Cdt(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,n){va` |
| `A` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `te` | index.1751615607545.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `ae` | index.1751615607545.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `Se` | index.1751615607545.js | entry | @/legacy `downloadFile` | `(t,e)=>Wn(void 0,null,function*(){const n=document.createElement("a");if(e){const a=yield(yield fetch(t)).blob(),i=window.URL.createObjectURL(a);n.href=i,n.download=e}else n.href=t;n.click(),n.remove(` |
| `De` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `Ce` | index.1751615607545.js | api | @/legacy `pxRegistList` | `t=>Ee.request({url:"/xf-job/job/xfJobGovRecruitRegistration/pxRegistList",method:"get",params:t})` |
| `we` | index.1751615607545.js | api | @/legacy `getDictItemsByCode` | `t=>Ee.request({url:"/jeecg-system/sys/dict/getDictItemsByCode",method:"get",params:t})` |
| `Ne` | index.1751615607545.js | api | @/legacy `ticketToHtml` | `t=>Ee.request({url:"/xf-job/job/xfJobGovRecruitNotice/ticketToHtml?noticeId="+t.noticeId+"&registrationId="+t.registrationId,method:"post",data:t})` |
| `R` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `Ie` | index.1751615607545.js | api | @/legacy `alipayScanPay` | `t=>Ee.request({url:"/xf-job/communal/xfSysOrderPayRecord/alipay/scanPay",method:"get",params:t})` |
| `Te` | index.1751615607545.js | api | @/legacy `updateEnrollmentStatus` | `t=>Ee.request({url:"/xf-job/job/xfJobGovRecruitRegistration/updateEnrollmentStatus",method:"post",data:t})` |
| `Pe` | dictCode.1751615607545.js | shared | @/shared/dictCode.vue `default` | `c(v,[["render",S]])` |
| `$e` | WebSockets.1751615607545.js | shared | @/shared/WebSockets.ts `getWsBaseUrl` | `()=>{let o="";return(o.startsWith("http")?o:window.location.origin).replace("https://","wss://").replace("http://","ws://")}` |
| `ze` | WebSockets.1751615607545.js | shared | @/shared/WebSockets.ts `createWebSocket` | `function p(o,l,s,d,r){if(!o)return;let c=!0,n=!0,i=null,g=r\|\|15e3,e=null;return f(),a(),{ws:e,sendMessage:w,closeWs:R};function f(){e=new WebSocket(o),e.onopen=function(){l&&l()},e.onmessage=function(` |
| `Fe` | jspdf.es.min.1751615607545.js | shared | @/shared/jspdf.es.min.ts `Watermark` | `class{constructor(e){var n,a,c,o,l,h,f,g,b;this.defaultOptions={container:document.body,zIndex:9,rotate:-22,gap:[100,100],font:{}},this.options=Object.assign({},this.defaultOptions,e),this.container=t` |
| `Re` | jspdf.es.min.1751615607545.js | shared | jspdf `jsPDF` | `function Ht(r){var e,n=typeof arguments[0]=="string"?arguments[0]:"p",a=arguments[1],c=arguments[2],o=arguments[3],l=[],h=1,f=16,g="S",b=null;ve(r=r\|\|{})==="object"&&(n=r.orientation,a=r.unit\|\|a,c=r.f` |
