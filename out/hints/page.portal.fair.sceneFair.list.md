# 导入提示：page.portal.fair.sceneFair.list

原 chunk `list.17833206362004.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `Qa` | index.1783320636200.js | entry | @/legacy `getAppConfig` | `()=>{let e=sessionStorage.getItem("appConfig")?sessionStorage.getItem("appConfig"):document.getElementsByTagName("head")[0].getAttribute("data-config");return JSON.parse(e)}` |
| `E` | index.1783320636200.js | entry | @/legacy `userStorage` | `{keys:!0,setUser(e){this.keys?localStorage.setItem(jn.USER_INFO,e):localStorage.setItem(jn.USER_INFO,JSON.stringify(e))},getUser(){const e=localStorage.getItem(jn.USER_INFO);if(e&&e!="undefined"&&e!="` |
| `Za` | index.1783320636200.js | entry | @/legacy `checkBtnPermission` | `e=>new Promise((t,n)=>W(void 0,null,function*(){let r={btn1:!0},a=yield On({code:Ea.BTN_PERMISS});if(a&&a.result){let o=g_();e.type==1?o=="0"&&fo()&&(r.btn1=!1):e.type==10&&o=="10"&&fo()&&(r.btn1=!1)}` |
| `$a` | index.1783320636200.js | entry | @/legacy `getDictItemsByCode` | `e=>IN("/jeecg-system/sys/dict/getDictItemsByCode",e,"get")` |
| `Ga` | index.1783320636200.js | api | @/legacy `getAreaInfo` | `e=>ut.request({url:"/xf-job/communal/licenseFree/xfSysAreainfo/getInfo",method:"get",params:e})` |
| `Ka` | index.1783320636200.js | entry | @/legacy `LoginModal`（reserved） | `mt(nne,[["__scopeId","data-v-6ac82971"]])` |
| `Va` | index.1783320636200.js | entry | @/legacy `useStore` | `function(e){return e===void 0&&(e=null),Ft(e!==null?e:Ru)}` |
| `Xa` | index.1783320636200.js | entry | @ant-design/icons-vue `DownOutlined` | `Fv` |
| `Q` | index.1783320636200.js | entry | @/legacy `getWeekDay` | `function(e,t){if(e){let n=["\u661F\u671F\u65E5","\u661F\u671F\u4E00","\u661F\u671F\u4E8C","\u661F\u671F\u4E09","\u661F\u671F\u56DB","\u661F\u671F\u4E94","\u661F\u671F\u516D"];return t==0&&(n=["\u5468\` |
| `I` | index.1783320636200.js | entry | dayjs `default` | `Rk(Owe)` |
| `ae` | index.1783320636200.js | entry | @/legacy `checkIdentity` | `function(e){let t=e.type,n=e.content,r=e.content2,a=e.textbtn,o=e.textbtn2,i=e.alert==!1?e.alert:!0;const l=Ze.getUser(),c=Ze.getCorp();return console.log("\u5224\u65AD\u5F53\u524D\u8D26\u53F7\u662F\u` |
| `ee` | index.1783320636200.js | entry | @/legacy `IDENTITY_CORP` | `1` |
| `te` | index.1783320636200.js | entry | @/legacy `MSG_CORP_NOT_AUTH` | `"\u5F53\u524D\u8D26\u6237\u5C1A\u672A\u8FDB\u884C\u5355\u4F4D\u8BA4\u8BC1\uFF0C\u8BA4\u8BC1\u901A\u8FC7\u540E\u65B9\u53EF\u62A5\u540D\u62DB\u8058\u4F1A"` |
| `se` | index.1783320636200.js | entry | @/legacy `TEXT_GO_AUTH` | `"\u53BB\u8BA4\u8BC1"` |
| `le` | index.1783320636200.js | entry | @/legacy `MSG_CORP_PENDING` | `"\u5F53\u524D\u8D26\u6237\u7684\u8D44\u6599\u5C1A\u672A\u5B8C\u5584\u6216\u6B63\u5728\u5BA1\u6838\u4E2D\uFF0C\u8BF7\u5728\u5BA1\u6838\u901A\u8FC7\u540E\u62A5\u540D\u62DB\u8058\u4F1A\u3002"` |
| `ie` | index.1783320636200.js | api | @/legacy `checkIzDishonesty` | `e=>ut.request({url:"/xf-job/job/xfJobFairApplyInfo/checkIzDishonesty",method:"post",data:e})` |
| `re` | index.1783320636200.js | entry | @/legacy `openUserCenter` | `(e,t)=>{let n=rr.getters.userUrl;t=t\|\|"_blank",n&&n.charAt(n.length-1)==="/"&&(n=n.slice(0,-1)),window.open(n+"/autoLogin?toPath="+encodeURIComponent(e)+"&token="+Ze.getToken(),t)}` |
| `oe` | index.1783320636200.js | entry | ant-design-vue `message` | `D1` |
| `ne` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `de` | dictCode.1783320636200.js | shared | @/shared/dictCode.vue `default` | `S(i,[["render",p]])` |
| `pe` | index.api.178332063620017.js | api | @/api/api-17 `getFairList` | `e=>o.request({url:"/xf-job/job/licenseFree/xfJobFair/getFairList",method:"post",data:e})` |
| `ye` | empty.1783320636200.js | shared | @/shared/empty.vue `default` | `x(i,[["render",s],["__scopeId","data-v-810a04d0"]])` |
