# 导入提示：page.portal.xjhm.home.index

原 chunk `index.1783320636200107.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `Q` | jqqd.1783320636200.js | shared | @/shared/images `jqqdImg` | `"/sjz/newHome/jqqd.png"` |
| `Se` | index.1783320636200.js | entry | @/legacy/utils `getCurrentSysUser` | `()=>Ze.getSysUser()` |
| `je` | index.1783320636200.js | entry | @/legacy `getAppConfig` | `()=>{let e=sessionStorage.getItem("appConfig")?sessionStorage.getItem("appConfig"):document.getElementsByTagName("head")[0].getAttribute("data-config");return JSON.parse(e)}` |
| `U` | index.1783320636200.js | entry | @/legacy `userStorage` | `{keys:!0,setUser(e){this.keys?localStorage.setItem(jn.USER_INFO,e):localStorage.setItem(jn.USER_INFO,JSON.stringify(e))},getUser(){const e=localStorage.getItem(jn.USER_INFO);if(e&&e!="undefined"&&e!="` |
| `ze` | index.1783320636200.js | entry | @/legacy/components/HomeLoginBtm.vue `default` | `mt(_re,[["__scopeId","data-v-2742027c"]])` |
| `Be` | index.1783320636200.js | entry | @/legacy/components/MoveWindow.vue `default` | `mt(cne,[["__scopeId","data-v-a15b1e15"]])` |
| `Re` | index.1783320636200.js | entry | @/legacy `LoginModal` | `mt(nne,[["__scopeId","data-v-6ac82971"]])` |
| `Ge` | index.1783320636200.js | entry | @/legacy/components/Notice.vue `default` | `re({__name:"notice",props:{visible:{type:Boolean,default:!1},newsType:{type:String,default:""}},emits:["okClick","cancelClick"],setup(e,{emit:t}){const n=e,r=st(),a=je({info:"",title:""}),o=()=>{t("ok` |
| `C` | index.1783320636200.js | entry | @/legacy `BusinessDictLabels` | `(e=>(e.PROVINCE_NAME="provinceName",e.TEACHIN_STATUS="teachin_status",e.WEBSITE_CONFIG="website_config",e.PLATFORM="\u5E73\u53F0\u914D\u7F6E",e.INDEX_QRCODE="index_qrcode",e.TOPNAV="topNav",e.HIDE_COD` |
| `Ze` | index.1783320636200.js | entry | @/legacy `checkIdentity` | `function(e){let t=e.type,n=e.content,r=e.content2,a=e.textbtn,o=e.textbtn2,i=e.alert==!1?e.alert:!0;const l=Ze.getUser(),c=Ze.getCorp();return console.log("\u5224\u65AD\u5F53\u524D\u8D26\u53F7\u662F\u` |
| `$e` | index.1783320636200.js | api | @/legacy/api `checkIsCanAdd` | `e=>ut.request({url:"/xf-job/job/xfJobLoanApplyCompany/checkIsCanAdd",method:"post",data:e})` |
| `F` | index.1783320636200.js | entry | @/legacy `openUserCenter` | `(e,t)=>{let n=rr.getters.userUrl;t=t\|\|"_blank",n&&n.charAt(n.length-1)==="/"&&(n=n.slice(0,-1)),window.open(n+"/autoLogin?toPath="+encodeURIComponent(e)+"&token="+Ze.getToken(),t)}` |
| `Z` | index.1783320636200.js | entry | @/legacy/utils `getUserInfo` | `()=>{let e=Pr({userInfo:n=>n.userInfo});return(Ze.getUser()?Ze.getUser():null)\|\|(e.value?e.value:null)}` |
| `Je` | index.1783320636200.js | api | @/legacy/api `jobLoanApplyPersonCheckIsCanAdd` | `e=>ut.request({url:"/xf-job/job/xfJobLoanApplyPerson/checkIsCanAdd",method:"post",data:e})` |
| `Qe` | index.1783320636200.js | api | @/legacy/api `getArticleListNoCheck` | `e=>ut.request({url:"/xf-job/job/licenseFree/getArticleListNoCheck",method:"post",params:e})` |
| `Ue` | index.1783320636200.js | entry | @/legacy `useStore` | `function(e){return e===void 0&&(e=null),Ft(e!==null?e:Ru)}` |
| `We` | index.1783320636200.js | entry | @/legacy `IDENTITY_CORP` | `1` |
| `Xe` | index.1783320636200.js | entry | @/legacy/utils `MSG_CORP_NOT_CERTIFIED` | `"\u5F53\u524D\u8D26\u6237\u672A\u8BA4\u8BC1\u5355\u4F4D\u4FE1\u606F\uFF0C\u8BF7\u5148\u8BA4\u8BC1\u5355\u4F4D\u4FE1\u606F"` |
| `Ye` | index.1783320636200.js | entry | @/legacy `TEXT_GO_AUTH` | `"\u53BB\u8BA4\u8BC1"` |
| `qe` | index.1783320636200.js | entry | @/legacy/utils `MSG_CORP_PENDING_2` | `"\u5F53\u524D\u8D26\u6237\u7684\u8D44\u6599\u5C1A\u672A\u5B8C\u5584\u6216\u6B63\u5728\u5BA1\u6838\u4E2D\uFF0C\u8BF7\u5728\u5BA1\u6838\u901A\u8FC7\u540E\u518D\u8FDB\u884C\u64CD\u4F5C"` |
| `b` | index.1783320636200.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `L` | index.1783320636200.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `T` | index.1783320636200.js | entry | @/legacy `openArticle` | `(e,t,n)=>{if(e.keywords&&e.keywords.indexOf("toUserCenter-")!=-1){const a=XMt(e.keywords,"toUserCenter-");console.log(a),Dt(a);return}let r=window.location.host;if(e.linkAddress)String(e.linkAddress).` |
| `He` | index.1783320636200.js | api | @/legacy `getSettingValueByCode` | `e=>ut.request({url:"/xf-job/job/licenseFree/xfSysBusinessSetting/getSettingValueByCode",method:"get",params:e})` |
| `Ke` | index.1783320636200.js | api | @/legacy/api `getLoginUserCurriculumVitaeInfo` | `()=>ut.request({url:"/xf-job/job/xfJobCurriculumVitae/getLoginUserCurriculumVitaeInfo",method:"post"})` |
| `Ve` | index.1783320636200.js | entry | @/utils/crypto-adapter `decryptSm4` | `e=>P3.sm4.decrypt(e,s8)` |
| `ei` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `si` | homeRight.17833206362002.js | shared | @/shared/homeRight2/HomeRight.vue `default`（reserved） | `F(O,[["__scopeId","data-v-4e527359"]])` |
| `ti` | homeRight.17833206362002.js | shared | @/shared/homeRight2/HomeLeft.vue `default`（reserved） | `F(E,[["__scopeId","data-v-24601f4c"]])` |
| `O` | empty.1783320636200.js | shared | @/shared/empty.vue `default` | `x(i,[["render",s],["__scopeId","data-v-810a04d0"]])` |
| `oi` | homeNews.17833206362003.js | shared | @/shared/homeNews3.vue `default`（reserved） | `be(te,[["__scopeId","data-v-f48bcb6a"]])` |
| `ri` | FriendLinks.vue_vue_type_style_index_0_lang.1783320636200.js | shared | @/shared/FriendLinks.vue `default`（reserved） | `aA({__name:"FriendLinks",props:{codeList:{type:Array,default:[]},imgType:{type:[String],default:"nanyang"}},emits:[],setup(z,{emit:pA}){const E=z,l=tA({linkList:[],loading:!1,para:{pageNo:1,pageSize:2` |
