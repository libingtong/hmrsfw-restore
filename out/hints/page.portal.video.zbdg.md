# 导入提示：page.portal.video.zbdg

原 chunk `zbdg.1783320636200.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `M` | type.1783320636200.js | shared | @/shared/images `typeImg` | `"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAANCAYAAAB/9ZQ7AAAAQklEQVQokWP8//8/AwMDA8OXz58ZoOA/AwIw8vDywjlMDCQAkhSzIFlPZZMZ0DxESDFegOxMkp1BCMCdSbtwpp1iACeiDtJNk5iZAAAAAElFTkSuQmCC"` |
| `Ve` | liveNull.1783320636200.js | shared | @/shared/images `liveNullImg` | `"/default/liveNull.jpg"` |
| `K` | btn.1783320636200.js | shared | @/shared/images `btnImg` | `"/assets/btn.1783320636200.png"` |
| `He` | videoNull.1783320636200.js | shared | @/shared/images `videoNullImg` | `"/default/videoNull.jpg"` |
| `We` | index.1783320636200.js | entry | @/legacy `getAppConfig` | `()=>{let e=sessionStorage.getItem("appConfig")?sessionStorage.getItem("appConfig"):document.getElementsByTagName("head")[0].getAttribute("data-config");return JSON.parse(e)}` |
| `Q` | index.1783320636200.js | entry | @/legacy `userStorage` | `{keys:!0,setUser(e){this.keys?localStorage.setItem(jn.USER_INFO,e):localStorage.setItem(jn.USER_INFO,JSON.stringify(e))},getUser(){const e=localStorage.getItem(jn.USER_INFO);if(e&&e!="undefined"&&e!="` |
| `X` | index.1783320636200.js | entry | @/legacy `getDictItemsByCode` | `e=>IN("/jeecg-system/sys/dict/getDictItemsByCode",e,"get")` |
| `Ye` | index.1783320636200.js | api | @/legacy `getAreaInfo` | `e=>ut.request({url:"/xf-job/communal/licenseFree/xfSysAreainfo/getInfo",method:"get",params:e})` |
| `$e` | index.1783320636200.js | api | @/legacy/api `getAllLevelArticleListByTypeId` | `e=>ut.request({url:"/xf-job/job/licenseFree/getAllLevelArticleListByTypeId",method:"post",params:e})` |
| `Ge` | index.1783320636200.js | entry | lodash-es `debounce` | `function(e,t,n){var r,a,o,i,l,c,s=0,f=!1,d=!1,v=!0;if(typeof e!="function")throw new TypeError(Kpe);t=M3(t)\|\|0,ha(n)&&(f=!!n.leading,d="maxWait"in n,o=d?qpe(M3(n.maxWait)\|\|0,t):o,v="trailing"in n?!!n.` |
| `Je` | index.1783320636200.js | api | @/legacy `listChildrenTreeByTypeId` | `e=>ut.request({url:"/xf-job/communal/licenseFree/xfSysArticleType/listChildrenTreeByTypeId",method:"post",params:e})` |
| `Ke` | index.1783320636200.js | entry | @/legacy `VideoPlayer` | `mt(nTt,[["__scopeId","data-v-0e6750cb"]])` |
| `E` | index.1783320636200.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `Z` | index.1783320636200.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `Qe` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `et` | dictCode.1783320636200.js | shared | @/shared/dictCode.vue `default` | `S(i,[["render",p]])` |
| `at` | empty.1783320636200.js | shared | @/shared/empty.vue `default` | `x(i,[["render",s],["__scopeId","data-v-810a04d0"]])` |
| `st` | index.api.178332063620013.js | api | @/api/jobLiveTelecast `list` | `e=>s.request({url:"/xf-job/job/licenseFree/xfJobLiveTelecast/list?izFromWebSite=1",method:"get",params:e})` |
