# 导入提示：page.portal.sjz.school.index

原 chunk `index.178332063620084.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `ra` | videoNull.1783320636200.js | shared | @/shared/images `videoNullImg` | `"/default/videoNull.jpg"` |
| `E` | index.1783320636200.js | entry | @/utils/request `request` | `new QIe({baseURL:ct,timeout:zN})` |
| `na` | index.1783320636200.js | entry | @/legacy `getAppConfig` | `()=>{let e=sessionStorage.getItem("appConfig")?sessionStorage.getItem("appConfig"):document.getElementsByTagName("head")[0].getAttribute("data-config");return JSON.parse(e)}` |
| `ce` | index.1783320636200.js | entry | @/legacy `userStorage` | `{keys:!0,setUser(e){this.keys?localStorage.setItem(jn.USER_INFO,e):localStorage.setItem(jn.USER_INFO,JSON.stringify(e))},getUser(){const e=localStorage.getItem(jn.USER_INFO);if(e&&e!="undefined"&&e!="` |
| `ca` | index.1783320636200.js | entry | @/legacy `LoginModal` | `mt(nne,[["__scopeId","data-v-6ac82971"]])` |
| `de` | index.1783320636200.js | entry | @/legacy `getDictItemsByCode` | `e=>IN("/jeecg-system/sys/dict/getDictItemsByCode",e,"get")` |
| `da` | index.1783320636200.js | api | @/legacy/api `getArticleListNoCheck` | `e=>ut.request({url:"/xf-job/job/licenseFree/getArticleListNoCheck",method:"post",params:e})` |
| `pa` | index.1783320636200.js | entry | @/legacy/api `queryHomeSettingById` | `e=>IN("/xf-job/job/licenseFree/queryHomeSettingById",e,"post")` |
| `ua` | index.1783320636200.js | api | @/legacy/api `getArticleListByTypeCodes` | `e=>ut.request({url:"/xf-job/job/licenseFree/getArticleListByTypeCodes",method:"post",params:e})` |
| `fa` | index.1783320636200.js | api | @/legacy `getSettingValueByCode` | `e=>ut.request({url:"/xf-job/job/licenseFree/xfSysBusinessSetting/getSettingValueByCode",method:"get",params:e})` |
| `B` | index.1783320636200.js | entry | @/legacy `openArticle` | `(e,t,n)=>{if(e.keywords&&e.keywords.indexOf("toUserCenter-")!=-1){const a=XMt(e.keywords,"toUserCenter-");console.log(a),Dt(a);return}let r=window.location.host;if(e.linkAddress)String(e.linkAddress).` |
| `I` | index.1783320636200.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `A` | index.1783320636200.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `M` | index.1783320636200.js | entry | dayjs `default` | `Rk(Owe)` |
| `ha` | index.1783320636200.js | entry | swiper/vue `Swiper` | `{name:"Swiper",props:{tag:{type:String,default:"div"},wrapperTag:{type:String,default:"div"},modules:{type:Array,default:void 0},init:{type:Boolean,default:void 0},direction:{type:String,default:void ` |
| `ya` | index.1783320636200.js | entry | swiper/vue `SwiperSlide` | `{name:"SwiperSlide",props:{tag:{type:String,default:"div"},swiperRef:{type:Object,required:!1},zoom:{type:Boolean,default:void 0},virtualIndex:{type:[String,Number],default:void 0}},setup(e,t){let{slo` |
| `va` | index.1783320636200.js | entry | @/legacy `checkLogin` | `function(e,t,n,r){const a=Ze.getUser(),o=Ze.getCorp();return console.log("\u5224\u65AD\u5F53\u524D\u8D26\u53F7\u662F\u5426\u767B\u5F55token",Ze.getToken(),a,o),new Promise((i,l)=>{if(!Ze.getToken()){i` |
| `ma` | index.1783320636200.js | entry | @/legacy `TEXT_GO_AUTH` | `"\u53BB\u8BA4\u8BC1"` |
| `ga` | index.1783320636200.js | entry | @/legacy `MSG_CORP_NOT_AUTH` | `"\u5F53\u524D\u8D26\u6237\u5C1A\u672A\u8FDB\u884C\u5355\u4F4D\u8BA4\u8BC1\uFF0C\u8BA4\u8BC1\u901A\u8FC7\u540E\u65B9\u53EF\u62A5\u540D\u62DB\u8058\u4F1A"` |
| `ba` | index.1783320636200.js | entry | @/legacy `IDENTITY_CORP` | `1` |
| `ka` | index.1783320636200.js | api | @/legacy `checkIzDishonesty` | `e=>ut.request({url:"/xf-job/job/xfJobFairApplyInfo/checkIzDishonesty",method:"post",data:e})` |
| `wa` | index.1783320636200.js | entry | @/legacy `openUserCenter` | `(e,t)=>{let n=rr.getters.userUrl;t=t\|\|"_blank",n&&n.charAt(n.length-1)==="/"&&(n=n.slice(0,-1)),window.open(n+"/autoLogin?toPath="+encodeURIComponent(e)+"&token="+Ze.getToken(),t)}` |
| `xa` | index.1783320636200.js | entry | ant-design-vue `message` | `D1` |
| `_a` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `Sa` | tagcanvas.vue_vue_type_style_index_0_lang.1783320636200.js | shared | @/shared/tagcanvas.vue `default`（reserved） | `ui({__name:"tagcanvas",props:{wordArr:{type:Array,default:[]}},emits:["changeName"],setup(R,{emit:Z}){const L=R,E=[];ci(()=>{L.wordArr.map((x,F)=>{E.push({value:F+1,name:x,light:!1})}),M(!1),gi(()=>{V` |
| `q` | empty.1783320636200.js | shared | @/shared/empty.vue `default` | `x(i,[["render",s],["__scopeId","data-v-810a04d0"]])` |
| `Ca` | navigation.1783320636200.js | shared | swiper `Navigation` | `function(d){let{swiper:a,extendParams:s,on:l,emit:c}=d;s({navigation:{nextEl:null,prevEl:null,hideOnClick:!1,disabledClass:"swiper-button-disabled",hiddenClass:"swiper-button-hidden",lockClass:"swiper` |
| `Na` | pagination.1783320636200.js | shared | swiper `Pagination` | `function(f){let{swiper:a,extendParams:P,on:p,emit:x}=f;const o="swiper-pagination";P({pagination:{el:null,bulletElement:"span",clickable:!1,hideOnClick:!1,renderBullet:null,renderProgressbar:null,rend` |
| `Ba` | scrollbar.1783320636200.js | shared | swiper `Scrollbar` | `function(y){let{swiper:a,extendParams:b,on:d,emit:g}=y;const v=I();let f=!1,h=null,p=null,m,n,u,E;b({scrollbar:{el:null,dragSize:"auto",hide:!1,draggable:!1,snapOnRelease:!0,lockClass:"swiper-scrollba` |
