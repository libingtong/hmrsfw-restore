# 导入提示：shared.portal.workItem

原 chunk `workItem.17833206362002.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `ha` | index.1783320636200.js | entry | @/legacy/store `useStoreGetters`（reserved） | `function(e){const t=vn(),n=T4e(e);console.log(n);let r={};return Object.keys(n).forEach(a=>{const o=n[a].bind({$store:t});r[a]=F(o)}),r}` |
| `_a` | index.1783320636200.js | entry | @/legacy `useStore` | `function(e){return e===void 0&&(e=null),Ft(e!==null?e:Ru)}` |
| `H` | index.1783320636200.js | entry | lodash-es `debounce` | `function(e,t,n){var r,a,o,i,l,c,s=0,f=!1,d=!1,v=!0;if(typeof e!="function")throw new TypeError(Kpe);t=M3(t)\|\|0,ha(n)&&(f=!!n.leading,d="maxWait"in n,o=d?qpe(M3(n.maxWait)\|\|0,t):o,v="trailing"in n?!!n.` |
| `V` | index.1783320636200.js | entry | @/legacy `checkIdentity` | `function(e){let t=e.type,n=e.content,r=e.content2,a=e.textbtn,o=e.textbtn2,i=e.alert==!1?e.alert:!0;const l=Ze.getUser(),c=Ze.getCorp();return console.log("\u5224\u65AD\u5F53\u524D\u8D26\u53F7\u662F\u` |
| `w` | index.1783320636200.js | entry | @/legacy `IDENTITY_OTHER` | `2` |
| `T` | index.1783320636200.js | entry | @/legacy `TEXT_GO_AUTH` | `"\u53BB\u8BA4\u8BC1"` |
| `C` | index.1783320636200.js | entry | @/legacy/utils `getUserInfo`（reserved） | `()=>{let e=Pr({userInfo:n=>n.userInfo});return(Ze.getUser()?Ze.getUser():null)\|\|(e.value?e.value:null)}` |
| `O` | index.1783320636200.js | entry | ant-design-vue `message` | `D1` |
| `N` | index.1783320636200.js | entry | @/legacy `checkLogin` | `function(e,t,n,r){const a=Ze.getUser(),o=Ze.getCorp();return console.log("\u5224\u65AD\u5F53\u524D\u8D26\u53F7\u662F\u5426\u767B\u5F55token",Ze.getToken(),a,o),new Promise((i,l)=>{if(!Ze.getToken()){i` |
| `W` | index.1783320636200.js | entry | @/legacy `MSG_PERFECT_PERSONAL` | `"\u5F53\u524D\u8D26\u6237\u672A\u5B8C\u5584\u4E2A\u4EBA\u4FE1\u606F\uFF0C\u8BF7\u5148\u5B8C\u5584\u4E2A\u4EBA\u4FE1\u606F"` |
| `Sa` | index.1783320636200.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `wa` | index.1783320636200.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `Ta` | index.1783320636200.js | entry | @/legacy `LoginModal`（reserved） | `mt(nne,[["__scopeId","data-v-6ac82971"]])` |
| `$` | index.1783320636200.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:Ut(O_e(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,t){va` |
| `Ca` | index.1783320636200.js | entry | @/legacy `openUserCenter` | `(e,t)=>{let n=rr.getters.userUrl;t=t\|\|"_blank",n&&n.charAt(n.length-1)==="/"&&(n=n.slice(0,-1)),window.open(n+"/autoLogin?toPath="+encodeURIComponent(e)+"&token="+Ze.getToken(),t)}` |
| `Ra` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `Aa` | resumemodal.1783320636200.js | shared | @/shared/resumemodal.vue `default` | `D(r,[["__scopeId","data-v-30d15804"]])` |
| `za` | addResume.1783320636200.js | shared | @/shared/addResume.vue `default`（reserved） | `D(C,[["__scopeId","data-v-a6009624"]])` |
| `E` | index.api.17833206362002.js | api | @/api/api-17833206362002 `add` | `e=>a.request({url:"/xf-job/job/xfJobUserCare/add",method:"get",params:e})` |
| `Oa` | index.api.17833206362002.js | api | @/api/api-17833206362002 `cancel` | `e=>a.request({url:"/xf-job/job/xfJobUserCare/cancel",method:"get",params:e})` |
| `G` | index.api.17833206362002.js | api | @/api/api-17833206362002 `queryIzCanDeliver` | `e=>a.request({url:"/xf-job/job/xfJobCurriculumVitae/queryIzCanDeliver",method:"get",params:e})` |
