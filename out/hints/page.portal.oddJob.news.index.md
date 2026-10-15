# 导入提示：page.portal.oddJob.news.index

原 chunk `index.178332063620049.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `_e` | index.api.178332063620024.js | api | @/api/oddJob `getChildArticleTypeList` | `e=>o.request({url:"/xf-job/job/licenseFree/getChildArticleTypeList",method:"post",params:e})` |
| `de` | index.api.178332063620024.js | api | @/api/oddJob `getArticleList` | `e=>o.request({url:"/xf-job/school/licenseFree/getArticleList",method:"get",params:e})` |
| `be` | index.api.17833206362008.js | api | @/api/sysArticle `getHotArticleList` | `e=>t.request({url:"/xf-job/job/licenseFree/getHotArticleList",method:"get",params:e})` |
| `q` | empty.1783320636200.js | shared | @/shared/empty.vue `default` | `x(i,[["render",s],["__scopeId","data-v-810a04d0"]])` |
| `he` | index.1783320636200.js | entry | @/legacy `getAppConfig` | `()=>{let e=sessionStorage.getItem("appConfig")?sessionStorage.getItem("appConfig"):document.getElementsByTagName("head")[0].getAttribute("data-config");return JSON.parse(e)}` |
| `ye` | index.1783320636200.js | entry | @/legacy `BusinessDictLabels` | `(e=>(e.PROVINCE_NAME="provinceName",e.TEACHIN_STATUS="teachin_status",e.WEBSITE_CONFIG="website_config",e.PLATFORM="\u5E73\u53F0\u914D\u7F6E",e.INDEX_QRCODE="index_qrcode",e.TOPNAV="topNav",e.HIDE_COD` |
| `xe` | index.1783320636200.js | api | @/legacy `getDictValueByCodeAndItems` | `e=>ut.request({url:"/xf-job/job/licenseFree/getDictValueByCodeAndItems",method:"post",params:e})` |
| `ge` | index.1783320636200.js | entry | @/legacy `listToTree` | `function(e){const t=[],n={};return e.forEach(r=>{r.children=[],n[r.id]=r}),e.forEach(r=>{const a=n[r.parentId];a?a.children.push(r):t.push(r)}),t}` |
| `we` | index.1783320636200.js | entry | swiper/vue `Swiper` | `{name:"Swiper",props:{tag:{type:String,default:"div"},wrapperTag:{type:String,default:"div"},modules:{type:Array,default:void 0},init:{type:Boolean,default:void 0},direction:{type:String,default:void ` |
| `ke` | index.1783320636200.js | entry | swiper/vue `SwiperSlide` | `{name:"SwiperSlide",props:{tag:{type:String,default:"div"},swiperRef:{type:Object,required:!1},zoom:{type:Boolean,default:void 0},virtualIndex:{type:[String,Number],default:void 0}},setup(e,t){let{slo` |
| `H` | index.1783320636200.js | entry | @/legacy `openArticle` | `(e,t,n)=>{if(e.keywords&&e.keywords.indexOf("toUserCenter-")!=-1){const a=XMt(e.keywords,"toUserCenter-");console.log(a),Dt(a);return}let r=window.location.host;if(e.linkAddress)String(e.linkAddress).` |
| `Ce` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `Be` | navigation.1783320636200.js | shared | swiper `Navigation` | `function(d){let{swiper:a,extendParams:s,on:l,emit:c}=d;s({navigation:{nextEl:null,prevEl:null,hideOnClick:!1,disabledClass:"swiper-button-disabled",hiddenClass:"swiper-button-hidden",lockClass:"swiper` |
| `Se` | pagination.1783320636200.js | shared | swiper `Pagination` | `function(f){let{swiper:a,extendParams:P,on:p,emit:x}=f;const o="swiper-pagination";P({pagination:{el:null,bulletElement:"span",clickable:!1,hideOnClick:!1,renderBullet:null,renderProgressbar:null,rend` |
| `Te` | scrollbar.1783320636200.js | shared | swiper `Scrollbar` | `function(y){let{swiper:a,extendParams:b,on:d,emit:g}=y;const v=I();let f=!1,h=null,p=null,m,n,u,E;b({scrollbar:{el:null,dragSize:"auto",hide:!1,draggable:!1,snapOnRelease:!0,lockClass:"swiper-scrollba` |
| `Ie` | autoplay.1783320636200.js | shared | swiper `Autoplay` | `function(y){let{swiper:a,extendParams:u,on:l,emit:t}=y,o;a.autoplay={running:!1,paused:!1},u({autoplay:{enabled:!1,delay:3e3,waitForTransition:!0,disableOnInteraction:!0,stopOnLastSlide:!1,reverseDire` |
