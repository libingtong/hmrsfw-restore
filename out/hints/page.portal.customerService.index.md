# 导入提示：page.portal.customerService.index

原 chunk `index.178332063620030.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `W` | index.1783320636200.js | entry | @/legacy `userStorage` | `{keys:!0,setUser(e){this.keys?localStorage.setItem(jn.USER_INFO,e):localStorage.setItem(jn.USER_INFO,JSON.stringify(e))},getUser(){const e=localStorage.getItem(jn.USER_INFO);if(e&&e!="undefined"&&e!="` |
| `$t` | index.1783320636200.js | api | @/legacy/api `queryAllInfoById` | `e=>ut.request({url:"/xf-job/job/licenseFree/xfJobCustomerPageSettings/queryAllInfoById",method:"get",params:e})` |
| `Z` | index.1783320636200.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `P` | index.1783320636200.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `ea` | index.1783320636200.js | api | @/legacy/api `querylistForOneUser` | `e=>ut.request({url:"/xf-job/job/xfJobCustomerConsultRecord/querylistForOneUser",method:"post",params:e})` |
| `sa` | index.1783320636200.js | entry | @/legacy/utils `formatDateTime` | `e=>{var t=e.getFullYear(),n=e.getMonth()+1,r=e.getDate(),a=e.getHours(),o=e.getMinutes(),i=e.getSeconds();return o<10&&(o="0"+o),a<10&&(a="0"+a),i<10&&(i="0"+i),t+"-"+n+"-"+r+" "+a+":"+o+":"+i}` |
| `ta` | index.1783320636200.js | api | @/legacy/api `listByPageId` | `e=>ut.request({url:"/xf-job/job/licenseFree/xfJobCustomerPageKnowledgetype/listByPageId",method:"get",params:e})` |
| `aa` | index.1783320636200.js | api | @/legacy/api `getXfSysUserInfo` | `e=>ut.request({url:"/xf-job/communal/licenseFree/xfSysUser/getXfSysUserInfo",method:"post",headers:{"X-Access-Token":e}})` |
| `la` | index.1783320636200.js | api | @/legacy/api `queryQuickQuestionsList` | `e=>ut.request({url:"/xf-job/job/licenseFree/xfJobCustomerKnowledgeBase/queryQuickQuestionsList",method:"post",params:e})` |
| `oa` | index.1783320636200.js | api | @/legacy/api `queryQuestionsList` | `e=>ut.request({url:"/xf-job/job/licenseFree/xfJobCustomerKnowledgeBase/queryQuestionsList",method:"post",params:e})` |
| `me` | index.1783320636200.js | api | @/legacy/api `askQuestion` | `e=>ut.request({url:"/xf-job/job/licenseFree/xfJobCustomerKnowledgeBase/askQuestion",method:"post",params:e})` |
| `ia` | index.1783320636200.js | entry | lodash-es `cloneDeep` | `function(e){return Gc(e,qve\|Wve)}` |
| `na` | index.1783320636200.js | api | @/legacy/api `queryQuestionsListByParams` | `e=>ut.request({url:"/xf-job/job/licenseFree/xfJobCustomerKnowledgeBase/queryQuestionsListByParams",method:"post",params:e})` |
| `ra` | index.1783320636200.js | api | @/legacy/api `updateHelpNums` | `e=>ut.request({url:"/xf-job/job/licenseFree/xfJobCustomerKnowledgeBase/updateHelpNums",method:"post",params:e})` |
| `Ce` | index.1783320636200.js | entry | ant-design-vue `message` | `D1` |
| `ca` | index.1783320636200.js | api | @/legacy/api `getInfoById` | `e=>ut.request({url:"/xf-job/job/licenseFree/xfJobCustomerMenuSettings/getInfoById",method:"post",params:e})` |
| `ga` | index.1783320636200.js | api | @/legacy/api `getKnowledgeInfoById` | `e=>ut.request({url:"/xf-job/job/licenseFree/xfJobCustomerKnowledgeBase/getKnowledgeInfoById",method:"post",params:e,timeout:3e3})` |
| `ua` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `Ie` | empty.1783320636200.js | shared | @/shared/empty.vue `default` | `x(i,[["render",s],["__scopeId","data-v-810a04d0"]])` |
