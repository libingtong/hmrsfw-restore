# 导入提示：page.portal.train.trainList

原 chunk `trainList.1783320636200.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `ea` | card.1783320636200.js | shared | @/shared/images `cardImg_` | `"/sjz/setup/good.png"` |
| `aa` | card.1783320636200.js | shared | @/shared/images `cardImgA` | `"/sjz/setup/card.png"` |
| `sa` | three.1783320636200.js | shared | @/shared/images `threeImg_` | `"/sjz/setup/one.png"` |
| `ta` | three.1783320636200.js | shared | @/shared/images `threeImgA` | `"/sjz/setup/two.png"` |
| `la` | three.1783320636200.js | shared | @/shared/images `threeImgB` | `"/sjz/setup/three.png"` |
| `ia` | index.1783320636200.js | entry | @/legacy `getAppConfig` | `()=>{let e=sessionStorage.getItem("appConfig")?sessionStorage.getItem("appConfig"):document.getElementsByTagName("head")[0].getAttribute("data-config");return JSON.parse(e)}` |
| `N` | index.1783320636200.js | entry | @/legacy `getDictItemsByCode` | `e=>IN("/jeecg-system/sys/dict/getDictItemsByCode",e,"get")` |
| `ra` | index.1783320636200.js | api | @/legacy `getSettingValueByCode` | `e=>ut.request({url:"/xf-job/job/licenseFree/xfSysBusinessSetting/getSettingValueByCode",method:"get",params:e})` |
| `oa` | index.1783320636200.js | api | @/legacy `queryAreaChildrenTreeListById` | `e=>ut.request({url:"/xf-job/job/licenseFree/queryAreaChildrenTreeListById",method:"post",params:e})` |
| `K` | index.1783320636200.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `M` | index.1783320636200.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `ca` | index.1783320636200.js | entry | @/legacy `openArticle` | `(e,t,n)=>{if(e.keywords&&e.keywords.indexOf("toUserCenter-")!=-1){const a=XMt(e.keywords,"toUserCenter-");console.log(a),Dt(a);return}let r=window.location.host;if(e.linkAddress)String(e.linkAddress).` |
| `na` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `da` | index.api.17833206362008.js | api | @/api/api-08 `getChildArticleTypeList` | `e=>t.request({url:"/xf-job/job/licenseFree/getChildArticleTypeList",method:"post",params:e})` |
| `A` | empty.1783320636200.js | shared | @/shared/empty.vue `default` | `x(i,[["render",s],["__scopeId","data-v-810a04d0"]])` |
| `va` | index.api.178332063620021.js | api | @/api/jobPxCourse `hotListForWebsite`（reserved） | `e=>r.request({url:"/xf-job/job/licenseFree/xfJobPxCourse/hotListForWebsite",method:"get",params:e})` |
| `ma` | index.api.178332063620021.js | api | @/api/jobPxCourse `getArticleList`（reserved） | `e=>r.request({url:"/xf-job/job/licenseFree/getArticleList",method:"get",params:e})` |
| `ya` | index.api.178332063620021.js | api | @/api/jobPxCourse `listForWebsite`（reserved） | `e=>r.request({url:"/xf-job/job/licenseFree/xfJobPxCourse/listForWebsite",method:"get",params:e})` |
