# 导入提示：page.portal.sjz.archivesSearch.index

原 chunk `index.178332063620071.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `vt` | bg.1783320636200.js | shared | @/shared/images `bgImg` | `"/assets/bg.178332063620012.jpg"` |
| `ht` | index.1783320636200.js | entry | swiper `default` | `class Do{constructor(){let t,n;for(var r=arguments.length,a=new Array(r),o=0;o<r;o++)a[o]=arguments[o];if(a.length===1&&a[0].constructor&&Object.prototype.toString.call(a[0]).slice(8,-1)==="Object"?n=` |
| `yt` | index.1783320636200.js | entry | @/legacy `getAppConfig` | `()=>{let e=sessionStorage.getItem("appConfig")?sessionStorage.getItem("appConfig"):document.getElementsByTagName("head")[0].getAttribute("data-config");return JSON.parse(e)}` |
| `ft` | index.1783320636200.js | entry | @/legacy `SlideCaptcha`（reserved） | `re({__name:"SlideCaptcha",props:{type:{type:String,default:"0"},phone:{type:String,default:""},smsmode:{type:String,default:"1"},fromType:{type:String,default:"1"}},emits:["timerCount"],setup(e,{expos` |
| `wt` | index.1783320636200.js | entry | @/legacy `useStore` | `function(e){return e===void 0&&(e=null),Ft(e!==null?e:Ru)}` |
| `E` | index.1783320636200.js | entry | ant-design-vue `message` | `D1` |
| `_t` | index.1783320636200.js | api | @/legacy `getSettingValueByCode` | `e=>ut.request({url:"/xf-job/job/licenseFree/xfSysBusinessSetting/getSettingValueByCode",method:"get",params:e})` |
| `kt` | index.1783320636200.js | entry | @/legacy `validateIdCard` | `e=>{var t=[7,9,10,5,8,4,2,1,6,3,7,9,10,5,8,4,2],n=e+"";e[17];for(var r=n.substring(0,17),a=r.split(""),o=a.length,i=0,l=0;l<o;l++)i=i+a[l]*t[l];var c=/^\d{6}((((((19\|20)\d{2})(0[13-9]\|1[012])(0[1-9]\|[` |
| `K` | index.1783320636200.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `X` | index.1783320636200.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `bt` | index.1783320636200.js | entry | @/legacy `openArticle` | `(e,t,n)=>{if(e.keywords&&e.keywords.indexOf("toUserCenter-")!=-1){const a=XMt(e.keywords,"toUserCenter-");console.log(a),Dt(a);return}let r=window.location.host;if(e.linkAddress)String(e.linkAddress).` |
| `Ct` | index.1783320636200.js | entry | swiper/vue `Swiper` | `{name:"Swiper",props:{tag:{type:String,default:"div"},wrapperTag:{type:String,default:"div"},modules:{type:Array,default:void 0},init:{type:Boolean,default:void 0},direction:{type:String,default:void ` |
| `St` | index.1783320636200.js | entry | swiper/vue `SwiperSlide` | `{name:"SwiperSlide",props:{tag:{type:String,default:"div"},swiperRef:{type:Object,required:!1},zoom:{type:Boolean,default:void 0},virtualIndex:{type:[String,Number],default:void 0}},setup(e,t){let{slo` |
| `xt` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `Lt` | navigation.1783320636200.js | shared | swiper `Navigation` | `function(d){let{swiper:a,extendParams:s,on:l,emit:c}=d;s({navigation:{nextEl:null,prevEl:null,hideOnClick:!1,disabledClass:"swiper-button-disabled",hiddenClass:"swiper-button-hidden",lockClass:"swiper` |
| `Nt` | pagination.1783320636200.js | shared | swiper `Pagination` | `function(f){let{swiper:a,extendParams:P,on:p,emit:x}=f;const o="swiper-pagination";P({pagination:{el:null,bulletElement:"span",clickable:!1,hideOnClick:!1,renderBullet:null,renderProgressbar:null,rend` |
| `Et` | autoplay.1783320636200.js | shared | swiper `Autoplay` | `function(y){let{swiper:a,extendParams:u,on:l,emit:t}=y,o;a.autoplay={running:!1,paused:!1},u({autoplay:{enabled:!1,delay:3e3,waitForTransition:!0,disableOnInteraction:!0,stopOnLastSlide:!1,reverseDire` |
| `Bt` | grid.1783320636200.js | shared | swiper `Grid` | `function P(g){let{swiper:a,extendParams:S}=g;S({grid:{rows:1,fill:"column"}});let n,f,w;const z=t=>{const{slidesPerView:e}=a.params,{rows:i,fill:c}=a.params.grid;f=n/i,w=Math.floor(t/i),Math.floor(t/i` |
| `Ot` | effect-coverflow.1783320636200.js | shared | swiper `EffectCoverflow` | `function(o){let{swiper:s,extendParams:t,on:l}=o;t({coverflowEffect:{rotate:50,stretch:0,depth:100,scale:1,modifier:1,slideShadows:!0,transformEl:null}}),p({effect:"coverflow",swiper:s,on:l,setTranslat` |
| `At` | index.api.17833206362008.js | api | @/api/api-08 `queryById` | `e=>t.request({url:"/xf-job/school/licenseFree/XfSysArticle/queryById",method:"get",params:e})` |
| `zt` | index.api.178332063620015.js | api | @/api/api-15 `getChildArticleTypeList` | `e=>t.request({url:"/xf-job/job/licenseFree/getChildArticleTypeList",method:"post",params:e})` |
| `F` | index.api.178332063620015.js | api | @/api/api-15 `getArticleList` | `e=>t.request({url:"/xf-job/job/licenseFree/getArticleList",method:"get",params:e})` |
| `qt` | index.api.178332063620015.js | api | @/api/api-15 `freeArchiveServiceOrgList` | `e=>t.request({url:"/xf-job/job/licenseFree/freeArchiveServiceOrgList",method:"post",params:e})` |
| `Zt` | index.api.178332063620015.js | api | @/api/api-15 `freeArchiveInfoPageList3` | `e=>t.request({url:"/xf-job/job/licenseFree/hm/freeArchiveInfoPageList",method:"post",data:e})` |
| `Dt` | index.api.178332063620015.js | api | @/api/api-15 `freeArchiveInfoPageList` | `e=>t.request({url:"/xf-job/job/licenseFree/freeArchiveInfoPageList",method:"post",params:e})` |
| `Q` | empty.1783320636200.js | shared | @/shared/empty.vue `default` | `x(i,[["render",s],["__scopeId","data-v-810a04d0"]])` |
