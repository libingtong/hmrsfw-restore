# 导入提示：page.portal.cityHome.index

原 chunk `index.178332063620024.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `mt` | card.1783320636200.js | shared | @/shared/images `cardImg_` | `"/sjz/setup/good.png"` |
| `ft` | card.1783320636200.js | shared | @/shared/images `cardImgA` | `"/sjz/setup/card.png"` |
| `vt` | rightdisab.1783320636200.js | shared | @/shared/images `rightdisabImg_` | `"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC4AAAAuCAYAAABXuSs3AAADV0lEQVRogc3Zz4tVZRzH8dccZ3C0SQ1iTI0wnQIHDIx21ghh9ENa5XLcRFED5aLU/6Es6QcoBdFiWkaLwGmRBjpJO5Eki8oBy9Q0UBxzpobBFs8zeT3eO/ece59zxzfcz` |
| `gt` | rightdisab.1783320636200.js | shared | @/shared/images `rightdisabImgA` | `"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC4AAAAuCAYAAABXuSs3AAADW0lEQVRogc3ZzWtcVRjH8U9ujU1qUiNoalOV2kahlQoVd30DqfhS3GiX6aYoGtAu1Or/0GrxBVoUxEVcuhKMC6uQxuKuFAtR1AYqxb4otDSxjcZQF+fETqYzmXvnnpn0C` |
| `ht` | rightdisab.1783320636200.js | shared | @/shared/images `rightdisabImgB` | `"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC4AAAAuCAYAAABXuSs3AAADcklEQVRogd2av08TYRiAn54FoYAGsHpqgkhSCwxngjJIYlImo85OJAp/gTsDAwsJm38BYMLExiBxookJCxjEBEI1AWHxmgoVkd9NcXgpOdorvYOv18Yn6dLv7v2eXL/7f` |
| `wt` | rightdisab.1783320636200.js | shared | @/shared/images `rightdisabImgC` | `"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC4AAAAuCAYAAABXuSs3AAADdElEQVRogd2aTU8TQRiAny5F+WpNUbRqgkhSFziUKHKQxKR4MerZCySCv8AjNw5cOPsLABNOcpZ4ouHABQzRBEIxfF5cUqEi8k2qh5eSpWzpLp3dEp+kl87uO0+2M7Mz7` |
| `he` | index.1783320636200.js | entry | @/legacy `userStorage` | `{keys:!0,setUser(e){this.keys?localStorage.setItem(jn.USER_INFO,e):localStorage.setItem(jn.USER_INFO,JSON.stringify(e))},getUser(){const e=localStorage.getItem(jn.USER_INFO);if(e&&e!="undefined"&&e!="` |
| `bt` | index.1783320636200.js | entry | @/legacy `getAppConfig` | `()=>{let e=sessionStorage.getItem("appConfig")?sessionStorage.getItem("appConfig"):document.getElementsByTagName("head")[0].getAttribute("data-config");return JSON.parse(e)}` |
| `te` | index.1783320636200.js | entry | @/legacy `getDictItemsByCode` | `e=>IN("/jeecg-system/sys/dict/getDictItemsByCode",e,"get")` |
| `kt` | index.1783320636200.js | entry | @/legacy/api `queryHomeSettingById`（reserved） | `e=>IN("/xf-job/job/licenseFree/queryHomeSettingById",e,"post")` |
| `Lt` | index.1783320636200.js | api | @/legacy/api `getArticleListNoCheck`（reserved） | `e=>ut.request({url:"/xf-job/job/licenseFree/getArticleListNoCheck",method:"post",params:e})` |
| `_t` | index.1783320636200.js | entry | @/legacy/components/TopHead.vue `default`（reserved） | `mt(Vne,[["__scopeId","data-v-15d22a66"]])` |
| `xt` | index.1783320636200.js | entry | @/legacy `LoginModal`（reserved） | `mt(nne,[["__scopeId","data-v-6ac82971"]])` |
| `T` | index.1783320636200.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `I` | index.1783320636200.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `ie` | index.1783320636200.js | entry | @/legacy `openArticle` | `(e,t,n)=>{if(e.keywords&&e.keywords.indexOf("toUserCenter-")!=-1){const a=XMt(e.keywords,"toUserCenter-");console.log(a),Dt(a);return}let r=window.location.host;if(e.linkAddress)String(e.linkAddress).` |
| `Ct` | index.1783320636200.js | entry | dayjs `default` | `Rk(Owe)` |
| `we` | index.1783320636200.js | entry | swiper/vue `SwiperSlide` | `{name:"SwiperSlide",props:{tag:{type:String,default:"div"},swiperRef:{type:Object,required:!1},zoom:{type:Boolean,default:void 0},virtualIndex:{type:[String,Number],default:void 0}},setup(e,t){let{slo` |
| `be` | index.1783320636200.js | entry | swiper/vue `Swiper` | `{name:"Swiper",props:{tag:{type:String,default:"div"},wrapperTag:{type:String,default:"div"},modules:{type:Array,default:void 0},init:{type:Boolean,default:void 0},direction:{type:String,default:void ` |
| `At` | index.1783320636200.js | entry | @/legacy `checkLogin` | `function(e,t,n,r){const a=Ze.getUser(),o=Ze.getCorp();return console.log("\u5224\u65AD\u5F53\u524D\u8D26\u53F7\u662F\u5426\u767B\u5F55token",Ze.getToken(),a,o),new Promise((i,l)=>{if(!Ze.getToken()){i` |
| `Tt` | index.1783320636200.js | entry | @/legacy `TEXT_GO_AUTH` | `"\u53BB\u8BA4\u8BC1"` |
| `It` | index.1783320636200.js | entry | @/legacy `MSG_CORP_NOT_AUTH` | `"\u5F53\u524D\u8D26\u6237\u5C1A\u672A\u8FDB\u884C\u5355\u4F4D\u8BA4\u8BC1\uFF0C\u8BA4\u8BC1\u901A\u8FC7\u540E\u65B9\u53EF\u62A5\u540D\u62DB\u8058\u4F1A"` |
| `St` | index.1783320636200.js | entry | @/legacy `IDENTITY_CORP` | `1` |
| `jt` | index.1783320636200.js | api | @/legacy `checkIzDishonesty` | `e=>ut.request({url:"/xf-job/job/xfJobFairApplyInfo/checkIzDishonesty",method:"post",data:e})` |
| `zt` | index.1783320636200.js | entry | @/legacy `openUserCenter` | `(e,t)=>{let n=rr.getters.userUrl;t=t\|\|"_blank",n&&n.charAt(n.length-1)==="/"&&(n=n.slice(0,-1)),window.open(n+"/autoLogin?toPath="+encodeURIComponent(e)+"&token="+Ze.getToken(),t)}` |
| `Nt` | index.1783320636200.js | entry | ant-design-vue `message` | `D1` |
| `Bt` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `Pt` | navigation.1783320636200.js | shared | swiper `Navigation` | `function(d){let{swiper:a,extendParams:s,on:l,emit:c}=d;s({navigation:{nextEl:null,prevEl:null,hideOnClick:!1,disabledClass:"swiper-button-disabled",hiddenClass:"swiper-button-hidden",lockClass:"swiper` |
| `Et` | pagination.1783320636200.js | shared | swiper `Pagination` | `function(f){let{swiper:a,extendParams:P,on:p,emit:x}=f;const o="swiper-pagination";P({pagination:{el:null,bulletElement:"span",clickable:!1,hideOnClick:!1,renderBullet:null,renderProgressbar:null,rend` |
| `Ut` | scrollbar.1783320636200.js | shared | swiper `Scrollbar` | `function(y){let{swiper:a,extendParams:b,on:d,emit:g}=y;const v=I();let f=!1,h=null,p=null,m,n,u,E;b({scrollbar:{el:null,dragSize:"auto",hide:!1,draggable:!1,snapOnRelease:!0,lockClass:"swiper-scrollba` |
| `qt` | autoplay.1783320636200.js | shared | swiper `Autoplay` | `function(y){let{swiper:a,extendParams:u,on:l,emit:t}=y,o;a.autoplay={running:!1,paused:!1},u({autoplay:{enabled:!1,delay:3e3,waitForTransition:!0,disableOnInteraction:!0,stopOnLastSlide:!1,reverseDire` |
| `Qt` | index.api.17833206362004.js | api | @/api/jobUserTutorExpand `queryOrganizationByAreaId`（reserved） | `e=>s.request({url:"/xf-job/job/licenseFree/queryOrganizationByAreaId",method:"post",params:e})` |
| `ke` | index.api.17833206362004.js | api | @/api/jobUserTutorExpand `getArticleList`（reserved） | `e=>s.request({url:"/xf-job/job/licenseFree/getArticleList",method:"get",params:e})` |
| `Wt` | index.api.17833206362004.js | api | @/api/jobUserTutorExpand `listForWebsite`（reserved） | `e=>s.request({url:"/xf-job/job/licenseFree/xfJobUserTutorExpand/listForWebsite",method:"get",params:e})` |
| `Mt` | index.api.17833206362004.js | api | @/api/jobUserTutorExpand `freeCompanyAllAttachmentList`（reserved） | `e=>s.request({url:"/xf-job/job/licenseFree/freeCompanyAllAttachmentList",method:"get",params:e})` |
| `Ot` | index.api.17833206362004.js | api | @/api/jobUserTutorExpand `queryMoreClassicQandA`（reserved） | `e=>s.request({url:"/xf-job/communal/licenseFree/xfSysConsult/queryMoreClassicQandA",method:"get",params:e})` |
| `Ht` | index.api.17833206362004.js | api | @/api/jobUserTutorExpand `freeCompanyExpandPositionList`（reserved） | `e=>s.request({url:"/xf-job/job/licenseFree/freeCompanyExpandPositionList",method:"post",params:e})` |
| `Kt` | index.api.17833206362004.js | api | @/api/jobUserTutorExpand `freeCompanyExpandList`（reserved） | `e=>s.request({url:"/xf-job/job/licenseFree/freeCompanyExpandList",method:"post",params:e})` |
| `Zt` | index.api.17833206362004.js | api | @/api/jobUserTutorExpand `recommendJobList`（reserved） | `e=>s.request({url:"/job/licenseFree/xfJobCompanyPosition/recommendJobList",method:"post",params:e})` |
| `Gt` | index.api.17833206362004.js | api | @/api/jobUserTutorExpand `freeKeynoteCompanySeeMoreList`（reserved） | `e=>s.request({url:"/xf-job/job/licenseFree/freeKeynoteCompanySeeMoreList",method:"post",params:e})` |
| `Xt` | index.api.178332063620020.js | api | @/api/service `freeServiceUnitPageList`（reserved） | `e=>s.request({url:"/xf-job/job/licenseFree/freeServiceUnitPageList",method:"post",params:e})` |
| `si` | index.api.178332063620017.js | api | @/api/api-17 `getFairList` | `e=>o.request({url:"/xf-job/job/licenseFree/xfJobFair/getFairList",method:"post",data:e})` |
| `S` | empty.1783320636200.js | shared | @/shared/empty.vue `default` | `x(i,[["render",s],["__scopeId","data-v-810a04d0"]])` |
| `Le` | index.api.178332063620021.js | api | @/api/jobPxCourse `listForWebsite`（reserved） | `e=>r.request({url:"/xf-job/job/licenseFree/xfJobPxCourse/listForWebsite",method:"get",params:e})` |
