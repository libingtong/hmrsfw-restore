# 导入提示：page.portal.oddJob.index

原 chunk `index.178332063620048.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `G` | index.1783320636200.js | entry | @/legacy `userStorage` | `{keys:!0,setUser(e){this.keys?localStorage.setItem(jn.USER_INFO,e):localStorage.setItem(jn.USER_INFO,JSON.stringify(e))},getUser(){const e=localStorage.getItem(jn.USER_INFO);if(e&&e!="undefined"&&e!="` |
| `Fs` | index.1783320636200.js | api | @/legacy `listAuthenticateIdentity` | `e=>ut.request({url:"/xf-job/communal/xfSysUserAuthenticateIdentity/list",method:"get",params:e})` |
| `Bs` | index.1783320636200.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:Ut(O_e(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,t){va` |
| `K` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `Ds` | index.1783320636200.js | entry | swiper `default` | `class Do{constructor(){let t,n;for(var r=arguments.length,a=new Array(r),o=0;o<r;o++)a[o]=arguments[o];if(a.length===1&&a[0].constructor&&Object.prototype.toString.call(a[0]).slice(8,-1)==="Object"?n=` |
| `Es` | index.1783320636200.js | entry | @/legacy `getAppConfig` | `()=>{let e=sessionStorage.getItem("appConfig")?sessionStorage.getItem("appConfig"):document.getElementsByTagName("head")[0].getAttribute("data-config");return JSON.parse(e)}` |
| `Ps` | index.1783320636200.js | entry | @/legacy `getDictItemsByCode` | `e=>IN("/jeecg-system/sys/dict/getDictItemsByCode",e,"get")` |
| `As` | index.1783320636200.js | api | @/legacy `getSettingValueByCode` | `e=>ut.request({url:"/xf-job/job/licenseFree/xfSysBusinessSetting/getSettingValueByCode",method:"get",params:e})` |
| `Is` | index.1783320636200.js | entry | @/legacy `LoginModal` | `mt(nne,[["__scopeId","data-v-6ac82971"]])` |
| `js` | index.1783320636200.js | entry | @/legacy `checkLogin` | `function(e,t,n,r){const a=Ze.getUser(),o=Ze.getCorp();return console.log("\u5224\u65AD\u5F53\u524D\u8D26\u53F7\u662F\u5426\u767B\u5F55token",Ze.getToken(),a,o),new Promise((i,l)=>{if(!Ze.getToken()){i` |
| `zs` | index.1783320636200.js | entry | @/legacy `TEXT_GO_PERFECT` | `"\u53BB\u5B8C\u5584"` |
| `Os` | index.1783320636200.js | entry | @/legacy `MSG_PERFECT_PERSONAL` | `"\u5F53\u524D\u8D26\u6237\u672A\u5B8C\u5584\u4E2A\u4EBA\u4FE1\u606F\uFF0C\u8BF7\u5148\u5B8C\u5584\u4E2A\u4EBA\u4FE1\u606F"` |
| `Us` | index.1783320636200.js | entry | @/legacy `IDENTITY_PERSON` | `0` |
| `Q` | index.1783320636200.js | entry | @/legacy `openUserCenter` | `(e,t)=>{let n=rr.getters.userUrl;t=t\|\|"_blank",n&&n.charAt(n.length-1)==="/"&&(n=n.slice(0,-1)),window.open(n+"/autoLogin?toPath="+encodeURIComponent(e)+"&token="+Ze.getToken(),t)}` |
| `X` | index.1783320636200.js | entry | @/legacy `openArticle` | `(e,t,n)=>{if(e.keywords&&e.keywords.indexOf("toUserCenter-")!=-1){const a=XMt(e.keywords,"toUserCenter-");console.log(a),Dt(a);return}let r=window.location.host;if(e.linkAddress)String(e.linkAddress).` |
| `N` | index.1783320636200.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `C` | index.1783320636200.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `Hs` | navigation.1783320636200.js | shared | swiper `Navigation` | `function(d){let{swiper:a,extendParams:s,on:l,emit:c}=d;s({navigation:{nextEl:null,prevEl:null,hideOnClick:!1,disabledClass:"swiper-button-disabled",hiddenClass:"swiper-button-hidden",lockClass:"swiper` |
| `Vs` | pagination.1783320636200.js | shared | swiper `Pagination` | `function(f){let{swiper:a,extendParams:P,on:p,emit:x}=f;const o="swiper-pagination";P({pagination:{el:null,bulletElement:"span",clickable:!1,hideOnClick:!1,renderBullet:null,renderProgressbar:null,rend` |
| `Zs` | autoplay.1783320636200.js | shared | swiper `Autoplay` | `function(y){let{swiper:a,extendParams:u,on:l,emit:t}=y,o;a.autoplay={running:!1,paused:!1},u({autoplay:{enabled:!1,delay:3e3,waitForTransition:!0,disableOnInteraction:!0,stopOnLastSlide:!1,reverseDire` |
| `Gs` | effect-coverflow.1783320636200.js | shared | swiper `EffectCoverflow` | `function(o){let{swiper:s,extendParams:t,on:l}=o;t({coverflowEffect:{rotate:50,stretch:0,depth:100,scale:1,modifier:1,slideShadows:!0,transformEl:null}}),p({effect:"coverflow",swiper:s,on:l,setTranslat` |
| `ea` | homeNews.17833206362002.js | shared | @/shared/homeNews.vue `default` | `os(Qe,[["__scopeId","data-v-51b3470e"]])` |
| `aa` | index.api.178332063620024.js | api | @/api/oddJob `recommendation` | `e=>o.request({url:"/xf-oddjob/oddJob/xfOddRecommendRecord/recommendation",method:"post",data:e})` |
| `la` | index.api.178332063620024.js | api | @/api/oddJob `loadTreeRoot` | `e=>o.request({url:"/xf-oddjob/oddJob/licenseFree/loadTreeRoot",method:"get",params:e})` |
| `ta` | index.api.178332063620024.js | api | @/api/oddJob `getArticleList` | `e=>o.request({url:"/xf-job/school/licenseFree/getArticleList",method:"get",params:e})` |
| `ia` | index.api.178332063620024.js | api | @/api/oddJob `needJoblist` | `e=>o.request({url:"/xf-oddjob/oddJob/licenseFree/needJoblist",method:"post",data:e})` |
| `na` | index.api.178332063620024.js | api | @/api/oddJob `findJoblist` | `e=>o.request({url:"/xf-oddjob/oddJob/licenseFree/findJoblist",method:"post",data:e})` |
| `ra` | index.api.178332063620024.js | api | @/api/oddJob `add2` | `e=>o.request({url:"/xf-oddjob/oddjob/xfOddUserBrowse/add",method:"post",data:e})` |
| `re` | empty.1783320636200.js | shared | @/shared/empty.vue `default` | `x(i,[["render",s],["__scopeId","data-v-810a04d0"]])` |
