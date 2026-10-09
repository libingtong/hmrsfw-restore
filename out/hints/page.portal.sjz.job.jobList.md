# 导入提示：page.portal.sjz.job.jobList

原 chunk `jobList.17833206362003.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `Ye` | index.1783320636200.js | entry | @/legacy `getAppConfig` | `()=>{let e=sessionStorage.getItem("appConfig")?sessionStorage.getItem("appConfig"):document.getElementsByTagName("head")[0].getAttribute("data-config");return JSON.parse(e)}` |
| `Ee` | index.1783320636200.js | entry | @/legacy `userStorage` | `{keys:!0,setUser(e){this.keys?localStorage.setItem(jn.USER_INFO,e):localStorage.setItem(jn.USER_INFO,JSON.stringify(e))},getUser(){const e=localStorage.getItem(jn.USER_INFO);if(e&&e!="undefined"&&e!="` |
| `We` | index.1783320636200.js | api | @/legacy `getDictListByType` | `e=>ut.request({url:"/xf-job/communal/licenseFree/getDictListByType",method:"post",params:e})` |
| `He` | index.1783320636200.js | entry | @/legacy `listToTree` | `function(e){const t=[],n={};return e.forEach(r=>{r.children=[],n[r.id]=r}),e.forEach(r=>{const a=n[r.parentId];a?a.children.push(r):t.push(r)}),t}` |
| `R` | index.1783320636200.js | entry | @/legacy `getDictItemsByCode` | `e=>IN("/jeecg-system/sys/dict/getDictItemsByCode",e,"get")` |
| `W` | index.1783320636200.js | entry | @/legacy `BusinessDictLabels` | `(e=>(e.PROVINCE_NAME="provinceName",e.TEACHIN_STATUS="teachin_status",e.WEBSITE_CONFIG="website_config",e.PLATFORM="\u5E73\u53F0\u914D\u7F6E",e.INDEX_QRCODE="index_qrcode",e.TOPNAV="topNav",e.HIDE_COD` |
| `Ze` | index.1783320636200.js | api | @/legacy `getDictValueByCodeAndItems` | `e=>ut.request({url:"/xf-job/job/licenseFree/getDictValueByCodeAndItems",method:"post",params:e})` |
| `$e` | index.1783320636200.js | entry | @/legacy `useStore` | `function(e){return e===void 0&&(e=null),Ft(e!==null?e:Ru)}` |
| `Ke` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `g` | dictCode.1783320636200.js | shared | @/shared/dictCode.vue `default` | `S(i,[["render",p]])` |
| `ea` | index.api.17833206362006.js | api | @/api/job `findJobListForWebRedis` | `e=>o.request({url:"/xf-job/job/licenseFree/findJobListForWebRedis",method:"post",data:e})` |
| `aa` | index.api.17833206362006.js | api | @/api/job `findJobListForDistance` | `e=>o.request({url:"/xf-job/job/licenseFree/findJobListForDistance",method:"post",data:e})` |
| `sa` | city.1783320636200.js | shared | @/shared/city.vue `default` | `oe(J,[["__scopeId","data-v-911d64a4"]])` |
| `ra` | workType.1783320636200.js | shared | @/shared/workType.vue `default` | `ye(pe,[["__scopeId","data-v-c9091e07"]])` |
| `oa` | workItem.17833206362002.js | shared | @/shared/workItem.vue `default`（reserved） | `Ra(ca,[["__scopeId","data-v-23adcd83"]])` |
| `na` | empty.1783320636200.js | shared | @/shared/empty.vue `default` | `x(i,[["render",s],["__scopeId","data-v-810a04d0"]])` |
| `pa` | map.17833206362002.js | shared | @/shared/map.vue `default`（reserved） | `g(c,[["__scopeId","data-v-f61d55fe"]])` |
| `ya` | GetLocationMap.vue_vue_type_script_setup_true_lang.1783320636200.js | shared | @/shared/GetLocationMap.vue `default`（reserved） | `v({__name:"GetLocationMap",props:{msg:{type:String,default:"\u83B7\u53D6\u5B9A\u4F4D\u6709\u5EF6\u8FDF\uFF0C\u8BF7\u8010\u5FC3\u7B49\u5F85\u3002\u3002\u3002"},showMsg:{type:Boolean,default:!1}},emits:` |
