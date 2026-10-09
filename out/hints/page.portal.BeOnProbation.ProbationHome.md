# 导入提示：page.portal.BeOnProbation.ProbationHome

原 chunk `ProbationHome.1783320636200.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `ve` | index.1783320636200.js | entry | @/legacy `getAppConfig` | `()=>{let e=sessionStorage.getItem("appConfig")?sessionStorage.getItem("appConfig"):document.getElementsByTagName("head")[0].getAttribute("data-config");return JSON.parse(e)}` |
| `Ce` | index.1783320636200.js | api | @/legacy `getDictValueByCodeAndItems` | `e=>ut.request({url:"/xf-job/job/licenseFree/getDictValueByCodeAndItems",method:"post",params:e})` |
| `$` | index.1783320636200.js | entry | @/legacy `BusinessDictLabels` | `(e=>(e.PROVINCE_NAME="provinceName",e.TEACHIN_STATUS="teachin_status",e.WEBSITE_CONFIG="website_config",e.PLATFORM="\u5E73\u53F0\u914D\u7F6E",e.INDEX_QRCODE="index_qrcode",e.TOPNAV="topNav",e.HIDE_COD` |
| `Le` | index.1783320636200.js | api | @/legacy `getAreaInfo` | `e=>ut.request({url:"/xf-job/communal/licenseFree/xfSysAreainfo/getInfo",method:"get",params:e})` |
| `Ee` | index.1783320636200.js | entry | @/legacy `listToTree` | `function(e){const t=[],n={};return e.forEach(r=>{r.children=[],n[r.id]=r}),e.forEach(r=>{const a=n[r.parentId];a?a.children.push(r):t.push(r)}),t}` |
| `ee` | index.1783320636200.js | entry | swiper/vue `SwiperSlide` | `{name:"SwiperSlide",props:{tag:{type:String,default:"div"},swiperRef:{type:Object,required:!1},zoom:{type:Boolean,default:void 0},virtualIndex:{type:[String,Number],default:void 0}},setup(e,t){let{slo` |
| `ae` | index.1783320636200.js | entry | swiper/vue `Swiper` | `{name:"Swiper",props:{tag:{type:String,default:"div"},wrapperTag:{type:String,default:"div"},modules:{type:Array,default:void 0},init:{type:Boolean,default:void 0},direction:{type:String,default:void ` |
| `we` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `it` | index.1783320636200.js | entry | swiper `default` | `class Do{constructor(){let t,n;for(var r=arguments.length,a=new Array(r),o=0;o<r;o++)a[o]=arguments[o];if(a.length===1&&a[0].constructor&&Object.prototype.toString.call(a[0]).slice(8,-1)==="Object"?n=` |
| `nt` | index.1783320636200.js | entry | @/legacy `getCurrentUser` | `()=>Ze.getUser()` |
| `ot` | index.1783320636200.js | entry | @/legacy `getCurrentCorp` | `()=>Ze.getCorp()` |
| `ct` | index.1783320636200.js | entry | @/legacy `getDictItemsByCode` | `e=>IN("/jeecg-system/sys/dict/getDictItemsByCode",e,"get")` |
| `rt` | index.1783320636200.js | entry | @/legacy `LoginModal` | `mt(nne,[["__scopeId","data-v-6ac82971"]])` |
| `dt` | index.1783320636200.js | entry | @/legacy `checkLogin` | `function(e,t,n,r){const a=Ze.getUser(),o=Ze.getCorp();return console.log("\u5224\u65AD\u5F53\u524D\u8D26\u53F7\u662F\u5426\u767B\u5F55token",Ze.getToken(),a,o),new Promise((i,l)=>{if(!Ze.getToken()){i` |
| `pt` | index.1783320636200.js | entry | @/legacy `TEXT_GO_AUTH` | `"\u53BB\u8BA4\u8BC1"` |
| `ut` | index.1783320636200.js | entry | @/legacy `MSG_CORP_NOT_AUTH` | `"\u5F53\u524D\u8D26\u6237\u5C1A\u672A\u8FDB\u884C\u5355\u4F4D\u8BA4\u8BC1\uFF0C\u8BA4\u8BC1\u901A\u8FC7\u540E\u65B9\u53EF\u62A5\u540D\u62DB\u8058\u4F1A"` |
| `At` | index.1783320636200.js | entry | @/legacy `IDENTITY_CORP` | `1` |
| `ft` | index.1783320636200.js | api | @/legacy `queryIdentityByCompanyId` | `e=>ut.request({url:"/xf-job/communal/xfSysUserAuthenticateIdentityItem/queryByCompanyId",method:"post",params:e})` |
| `Ie` | index.1783320636200.js | entry | @/legacy `openUserCenter` | `(e,t)=>{let n=rr.getters.userUrl;t=t\|\|"_blank",n&&n.charAt(n.length-1)==="/"&&(n=n.slice(0,-1)),window.open(n+"/autoLogin?toPath="+encodeURIComponent(e)+"&token="+Ze.getToken(),t)}` |
| `Se` | index.1783320636200.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:Ut(O_e(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,t){va` |
| `V` | index.1783320636200.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `K` | index.1783320636200.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `Fe` | index.1783320636200.js | entry | @/legacy `openArticle` | `(e,t,n)=>{if(e.keywords&&e.keywords.indexOf("toUserCenter-")!=-1){const a=XMt(e.keywords,"toUserCenter-");console.log(a),Dt(a);return}let r=window.location.host;if(e.linkAddress)String(e.linkAddress).` |
| `Oe` | index.1783320636200.js | entry | dayjs `default` | `Rk(Owe)` |
| `te` | navigation.1783320636200.js | shared | swiper `Navigation` | `function(d){let{swiper:a,extendParams:s,on:l,emit:c}=d;s({navigation:{nextEl:null,prevEl:null,hideOnClick:!1,disabledClass:"swiper-button-disabled",hiddenClass:"swiper-button-hidden",lockClass:"swiper` |
| `se` | pagination.1783320636200.js | shared | swiper `Pagination` | `function(f){let{swiper:a,extendParams:P,on:p,emit:x}=f;const o="swiper-pagination";P({pagination:{el:null,bulletElement:"span",clickable:!1,hideOnClick:!1,renderBullet:null,renderProgressbar:null,rend` |
| `be` | scrollbar.1783320636200.js | shared | swiper `Scrollbar` | `function(y){let{swiper:a,extendParams:b,on:d,emit:g}=y;const v=I();let f=!1,h=null,p=null,m,n,u,E;b({scrollbar:{el:null,dragSize:"auto",hide:!1,draggable:!1,snapOnRelease:!0,lockClass:"swiper-scrollba` |
| `le` | autoplay.1783320636200.js | shared | swiper `Autoplay` | `function(y){let{swiper:a,extendParams:u,on:l,emit:t}=y,o;a.autoplay={running:!1,paused:!1},u({autoplay:{enabled:!1,delay:3e3,waitForTransition:!0,disableOnInteraction:!0,stopOnLastSlide:!1,reverseDire` |
| `yt` | effect-coverflow.1783320636200.js | shared | swiper `EffectCoverflow` | `function(o){let{swiper:s,extendParams:t,on:l}=o;t({coverflowEffect:{rotate:50,stretch:0,depth:100,scale:1,modifier:1,slideShadows:!0,transformEl:null}}),p({effect:"coverflow",swiper:s,on:l,setTranslat` |
| `kt` | index.api.1783320636200.js | api | @/api/company `freeCompanyExpandPositionList` | `e=>s.request({url:"/xf-job/job/licenseFree/freeCompanyExpandPositionList",method:"post",params:e})` |
| `xt` | index.api.1783320636200.js | api | @/api/company `freeCompanyExpandList` | `e=>s.request({url:"/xf-job/job/licenseFree/freeCompanyExpandList",method:"post",params:e})` |
| `Bt` | index.api.1783320636200.js | api | @/api/company `freeCompanyAttachmentList` | `e=>s.request({url:"/xf-job/job/licenseFree/freeCompanyAttachmentList",method:"get",params:e})` |
| `ie` | index.api.1783320636200.js | api | @/api/company `getArticleList` | `e=>s.request({url:"/xf-job/job/licenseFree/getArticleList",method:"get",params:e})` |
| `Lt` | Gigmarketgetjobpost.1783320636200.js | shared | @/shared/Gigmarketgetjobpost.vue `default` | `K(m,[["__scopeId","data-v-f188f3bf"]])` |
| `W` | empty.1783320636200.js | shared | @/shared/empty.vue `default` | `x(i,[["render",s],["__scopeId","data-v-810a04d0"]])` |
