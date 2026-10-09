# 导入提示：shared.portal.homeRight2

原 chunk `homeRight.17833206362002.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `j` | index.1783320636200.js | entry | @/legacy `getAppConfig` | `()=>{let e=sessionStorage.getItem("appConfig")?sessionStorage.getItem("appConfig"):document.getElementsByTagName("head")[0].getAttribute("data-config");return JSON.parse(e)}` |
| `W` | index.1783320636200.js | api | @/legacy `getDictValueByCodeAndItems` | `e=>ut.request({url:"/xf-job/job/licenseFree/getDictValueByCodeAndItems",method:"post",params:e})` |
| `L` | index.1783320636200.js | entry | @/legacy `BusinessDictLabels` | `(e=>(e.PROVINCE_NAME="provinceName",e.TEACHIN_STATUS="teachin_status",e.WEBSITE_CONFIG="website_config",e.PLATFORM="\u5E73\u53F0\u914D\u7F6E",e.INDEX_QRCODE="index_qrcode",e.TOPNAV="topNav",e.HIDE_COD` |
| `Z` | index.1783320636200.js | api | @/legacy/api `getArticleListNoCheck`（reserved） | `e=>ut.request({url:"/xf-job/job/licenseFree/getArticleListNoCheck",method:"post",params:e})` |
| `q` | index.1783320636200.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `G` | index.1783320636200.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `F` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `J` | index.1783320636200.js | entry | @/legacy/images `ENTRY_IMAGE_BY`（reserved） | `"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAACrElEQVRIib2XbWiNYRjHf3aOl5nXUSLKWNK8i6/ERCnEBx+UrPmsRERC0xqKJG9fJAcrWRZKSJQPig/basVXJtPSQWYs77rq/+h2d59nz9nO8a/Tubtfrt/9dl339QyqO` |
| `K` | index.1783320636200.js | entry | @/legacy `FeedbackModal` | `mt(vie,[["__scopeId","data-v-150e31b0"]])` |
| `M` | index.1783320636200.js | entry | @/legacy `LoginModal`（reserved） | `mt(nne,[["__scopeId","data-v-6ac82971"]])` |
| `U` | index.1783320636200.js | entry | @/legacy/images `ENTRY_IMAGE_AY`（reserved） | `"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFwAAABcCAYAAADj79JYAAAORUlEQVR4nO2daWwc5RnH/zN7en0ltkOCE+McJtAC4qyAIkILVQnQQ6X9gtpKbamqVoW2VD2kgnpBK7UqpeoHaIpQP9ACpVRVgEBQy5GUcFQlSZUAITiH7cQk8bVee+3Z3` |
| `V` | index.1783320636200.js | entry | @/legacy/utils `getUserInfo`（reserved） | `()=>{let e=Pr({userInfo:n=>n.userInfo});return(Ze.getUser()?Ze.getUser():null)\|\|(e.value?e.value:null)}` |
