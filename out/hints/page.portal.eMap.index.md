# 导入提示：page.portal.eMap.index

原 chunk `index.178332063620031.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `oo` | adr.1783320636200.js | shared | @/shared/images `adrImg_` | `"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAfCAYAAAASsGZ+AAACgElEQVRIia3WOWhUQRzH8c9uLhOjBsWrEgvBwkoxihBFFHtB7OwEEa20T2ljIYJ2VmolKJjCQkQsFEwTiIogYiMeIPHORpPNYTEz2clmd7Mb84Nh3pt5M9/3P95/XqF0p` |
| `ao` | adr.1783320636200.js | shared | @/shared/images `adrImgA` | `"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAMCAYAAABbayygAAABCElEQVQYlWXQMUuWYRTG8d/z9L5t9ilaRQgcA3E6S/DikEMIDiptLQ5Gjg1BW3NDBC0NDTWcMzv64OCiBC59hndMuxu8BaMLDpxz/S+u4QytNVX1AHvYxR+3GvEJHyPiZ` |
| `ro` | work.1783320636200.js | shared | @/shared/images `workImg` | `"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAALCAYAAABLcGxfAAAAtUlEQVQokY2RMQrCQBBFXySiYJFKsPIGQho9gNVcwEvYeQELL2DnVf5Ukl6w8RIBawsRXJuNxDWgD5Zh3h+Ggc1CCDS4+xrYALeoRsDezA7NTI9PFsDKzEozK4FVdG8yS` |
| `lo` | index.1783320636200.js | entry | @/legacy `getAppConfig` | `()=>{let e=sessionStorage.getItem("appConfig")?sessionStorage.getItem("appConfig"):document.getElementsByTagName("head")[0].getAttribute("data-config");return JSON.parse(e)}` |
| `io` | index.1783320636200.js | api | @/legacy `getSettingValueByCode` | `e=>ut.request({url:"/xf-job/job/licenseFree/xfSysBusinessSetting/getSettingValueByCode",method:"get",params:e})` |
| `he` | index.1783320636200.js | entry | @/legacy `getDictItemsByCode` | `e=>IN("/jeecg-system/sys/dict/getDictItemsByCode",e,"get")` |
| `G` | index.1783320636200.js | entry | @/legacy `BusinessDictLabels` | `(e=>(e.PROVINCE_NAME="provinceName",e.TEACHIN_STATUS="teachin_status",e.WEBSITE_CONFIG="website_config",e.PLATFORM="\u5E73\u53F0\u914D\u7F6E",e.INDEX_QRCODE="index_qrcode",e.TOPNAV="topNav",e.HIDE_COD` |
| `so` | index.1783320636200.js | api | @/legacy `getDictValueByCodeAndItems` | `e=>ut.request({url:"/xf-job/job/licenseFree/getDictValueByCodeAndItems",method:"post",params:e})` |
| `we` | index.1783320636200.js | entry | lodash-es `debounce` | `function(e,t,n){var r,a,o,i,l,c,s=0,f=!1,d=!1,v=!0;if(typeof e!="function")throw new TypeError(Kpe);t=M3(t)\|\|0,ha(n)&&(f=!!n.leading,d="maxWait"in n,o=d?qpe(M3(n.maxWait)\|\|0,t):o,v="trailing"in n?!!n.` |
| `no` | index.1783320636200.js | api | @/legacy `getAreaInfo` | `e=>ut.request({url:"/xf-job/communal/licenseFree/xfSysAreainfo/getInfo",method:"get",params:e})` |
| `uo` | index.1783320636200.js | entry | @/legacy/utils `getCurrentLocation` | `()=>W(void 0,null,function*(){let e={longitude:0,latitude:0,accuracy:0};if(navigator.geolocation){const t={enableHighAccuracy:!0,timeout:5e3,maximumAge:0};try{const n=yield new Promise((r,a)=>{navigat` |
| `go` | index.1783320636200.js | entry | @/legacy `useStore` | `function(e){return e===void 0&&(e=null),Ft(e!==null?e:Ru)}` |
| `ye` | index.1783320636200.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `be` | index.1783320636200.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `co` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `po` | index.api.178332063620022.js | api | @/api/company2 `freeCompanyPositionPageListForMap` | `e=>c.request({url:"/xf-job/job/licenseFree/freeCompanyPositionPageListForMap",method:"post",data:e})` |
| `I` | dictCode.1783320636200.js | shared | @/shared/dictCode.vue `default` | `S(i,[["render",p]])` |
| `ho` | workType.1783320636200.js | shared | @/shared/workType.vue `default` | `ye(pe,[["__scopeId","data-v-c9091e07"]])` |
| `yo` | empty.1783320636200.js | shared | @/shared/empty.vue `default` | `x(i,[["render",s],["__scopeId","data-v-810a04d0"]])` |
| `Se` | index.api.178332063620020.js | api | @/api/service `freeServiceUnitPageListForMap` | `e=>s.request({url:"/xf-job/job/licenseFree/freeServiceUnitPageListForMap",method:"post",data:e})` |
| `le` | city.1783320636200.js | shared | @/shared/city.vue `default` | `oe(J,[["__scopeId","data-v-911d64a4"]])` |
| `Co` | gaode.vue_vue_type_style_index_0_lang.17833206362002.js | shared | @/shared/gaode2.vue `default`（reserved） | `S({__name:"gaode",props:{markers:{type:Array,required:!1},latitude:{type:String,required:!1},queryParam:{type:Object,required:!1},gaodekey:{type:Array,required:!1}},emits:["zoomendData","geolactionDat` |
