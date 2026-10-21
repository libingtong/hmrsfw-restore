# 导入提示：page.portal.xjhm.home.advertTop

原 chunk `advertTop.17833206362006.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `ve` | index.1783320636200.js | entry | @/legacy `getAppConfig` | `()=>{let e=sessionStorage.getItem("appConfig")?sessionStorage.getItem("appConfig"):document.getElementsByTagName("head")[0].getAttribute("data-config");return JSON.parse(e)}` |
| `Pt` | index.1783320636200.js | entry | @/legacy `getDictItemsByCode` | `e=>IN("/jeecg-system/sys/dict/getDictItemsByCode",e,"get")` |
| `zt` | index.1783320636200.js | api | @/legacy `queryAreaChildrenTreeListById` | `e=>ut.request({url:"/xf-job/job/licenseFree/queryAreaChildrenTreeListById",method:"post",params:e})` |
| `jt` | index.1783320636200.js | api | @/legacy/api `queryOrganizationByAreaId`（reserved） | `e=>ut.request({url:"/xf-job/job/licenseFree/queryOrganizationByAreaId",method:"post",params:e})` |
| `At` | index.1783320636200.js | entry | @ant-design/icons-vue `CaretDownOutlined` | `Fv` |
| `ye` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `qt` | index.1783320636200.js | entry | @/legacy/store `useStoreGetters`（reserved） | `function(e){const t=vn(),n=T4e(e);console.log(n);let r={};return Object.keys(n).forEach(a=>{const o=n[a].bind({$store:t});r[a]=F(o)}),r}` |
| `fe` | index.1783320636200.js | api | @/legacy/api `getArticleListNoCheck`（reserved） | `e=>ut.request({url:"/xf-job/job/licenseFree/getArticleListNoCheck",method:"post",params:e})` |
| `Z` | index.1783320636200.js | entry | @/legacy `BusinessDictLabels` | `(e=>(e.PROVINCE_NAME="provinceName",e.TEACHIN_STATUS="teachin_status",e.WEBSITE_CONFIG="website_config",e.PLATFORM="\u5E73\u53F0\u914D\u7F6E",e.INDEX_QRCODE="index_qrcode",e.TOPNAV="topNav",e.HIDE_COD` |
| `Rt` | index.1783320636200.js | api | @/legacy `getDictValueByCodeAndItems` | `e=>ut.request({url:"/xf-job/job/licenseFree/getDictValueByCodeAndItems",method:"post",params:e})` |
| `Et` | index.1783320636200.js | entry | @/legacy/api `queryHomeSettingById`（reserved） | `e=>IN("/xf-job/job/licenseFree/queryHomeSettingById",e,"post")` |
| `Ht` | index.1783320636200.js | api | @/legacy `getSettingValueByCode` | `e=>ut.request({url:"/xf-job/job/licenseFree/xfSysBusinessSetting/getSettingValueByCode",method:"get",params:e})` |
| `Dt` | index.1783320636200.js | entry | @/legacy/api `logout`（reserved） | `e=>ut.request({url:LN.logout,method:"get",params:e})` |
| `q` | index.1783320636200.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `R` | index.1783320636200.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `Wt` | index.1783320636200.js | entry | @/legacy/utils `openLinkAddress`（reserved） | `(e,t)=>{let n=window.location.host;e.linkAddress?String(e.linkAddress).includes(n)?window.open(e.linkAddress):e.linkAddress.includes("www")\|\|e.linkAddress.includes("http")?window.open("/outLink?link="` |
| `Vt` | index.1783320636200.js | entry | @/legacy `openUserCenter` | `(e,t)=>{let n=rr.getters.userUrl;t=t\|\|"_blank",n&&n.charAt(n.length-1)==="/"&&(n=n.slice(0,-1)),window.open(n+"/autoLogin?toPath="+encodeURIComponent(e)+"&token="+Ze.getToken(),t)}` |
| `ee` | index.1783320636200.js | entry | @/legacy/store `store`（reserved） | `E4e({state:{userInfo:null,xfSysUserId:null,userInfoavatar:"",token:"",dictCode:null,code:Dp.businessDict,talentsCode:Dp.talentsDict,talentsList:[],routes:[],userCenterPre:localStorage.getItem("userCen` |
