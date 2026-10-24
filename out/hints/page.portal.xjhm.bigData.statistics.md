# 导入提示：page.portal.xjhm.bigData.statistics

原 chunk `statistics.17833206362002.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `se` | index.1783320636200.js | entry | @/legacy `getAppConfig` | `()=>{let e=sessionStorage.getItem("appConfig")?sessionStorage.getItem("appConfig"):document.getElementsByTagName("head")[0].getAttribute("data-config");return JSON.parse(e)}` |
| `B` | index.1783320636200.js | entry | dayjs `default` | `Rk(Owe)` |
| `ne` | index.1783320636200.js | entry | @/legacy `getWeekDay` | `function(e,t){if(e){let n=["\u661F\u671F\u65E5","\u661F\u671F\u4E00","\u661F\u671F\u4E8C","\u661F\u671F\u4E09","\u661F\u671F\u56DB","\u661F\u671F\u4E94","\u661F\u671F\u516D"];return t==0&&(n=["\u5468\` |
| `ca` | index.1783320636200.js | entry | @/legacy `getDictItemsByCode` | `e=>IN("/jeecg-system/sys/dict/getDictItemsByCode",e,"get")` |
| `oe` | index.1783320636200.js | api | @/legacy `getAreaInfo` | `e=>ut.request({url:"/xf-job/communal/licenseFree/xfSysAreainfo/getInfo",method:"get",params:e})` |
| `R` | index.1783320636200.js | entry | lodash-es `cloneDeep` | `function(e){return Gc(e,qve\|Wve)}` |
| `de` | index.1783320636200.js | entry | @/legacy `useStore` | `function(e){return e===void 0&&(e=null),Ft(e!==null?e:Ru)}` |
| `ce` | index.1783320636200.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `re` | index.1783320636200.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `pe` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `ra` | index.1783320636200120.js | entry | @/shared/index120.ts `getElementStyle` | `function o(e,t){return e&&e.currentStyle?e.currentStyle[t]:window.getComputedStyle?window.getComputedStyle(e,void 0).getPropertyValue(t):e.style[t]}` |
| `ge` | bars.vue_vue_type_style_index_0_lang.1783320636200.js | shared | @/shared/bars.vue `default`（reserved） | `P({__name:"bars",props:{title:String,data:{type:Object,default:()=>[]},types:String,option:{type:Object,default:()=>{}}},emits:["mapClick"],setup(l,{emit:d}){const a=l;let s=m(null);const e=b({chart:n` |
| `ye` | commonInit.1783320636200.js | shared | @/shared/commonInit.ts `getHorizontalBarReversedOption` | `(n,g,l)=>{let t=["rgba(255, 100, 0, 1)","rgba(9, 204, 203, 1)","rgba(133, 133, 133, 1)","#2d98fd","#ccae8e"].reverse();l==2&&(t=["rgba(37, 125, 252, 1)"]);let a=n.reverse(),r=g.reverse();return{grid:{` |
| `xe` | init.17833206362002.js | api | @/shared/init.ts `getBigDataViewSettingsById` | `a=>b.request({url:"/xf-job/job/licenseFree/xfJobBigDataViewSettings/queryAllInfoById",method:"get",params:a})` |
| `De` | init.17833206362002.js | shared | @/shared/init/MapCommon.vue `default` | `Y({__name:"mapCommon",props:{title:String,data:{type:Object,default:()=>[]},types:String,option:{type:Object,default:()=>{}},mapName:{type:String,default:"china"},code:{type:String,default:""}},emits:` |
| `ke` | init.17833206362002.js | api | @/shared/init.ts `getCompanyListForMapShow` | `a=>b.request({url:"/xf-job/job/licenseFree/getCompanyListForMapShow",method:"post",data:a})` |
| `ma` | init.17833206362002.js | shared | @/shared/init.ts `getHamiMapScatterOption` | `(a,r)=>{let e=.9;return r!="hm"&&(e=1.1),{tooltip:{show:!1,formatter:function(t){return[]}},layoutCenter:["50%","55%"],layoutSize:"100%",geo:{type:"map",map:r,zoom:e,select:{label:{color:"#fff"},itemS` |
| `we` | init.17833206362002.js | api | @/shared/init.ts `getCompanyListByTagsTypeForMapShow` | `a=>b.request({url:"/xf-job/job/licenseFree/getCompanyListByTagsTypeForMapShow",method:"post",data:a})` |
| `Se` | maps.vue_vue_type_style_index_0_lang.1783320636200.js | shared | @/shared/maps.vue `default`（reserved） | `n1({__name:"maps",props:{title:String,data:{type:Object,default:()=>[]},types:String,code:{type:String,default:""},option:{type:Object,default:()=>{}},mapName:{type:String,default:"china"},mapId:{type` |
| `Re` | initData.1783320636200.js | shared | @/shared/initData.ts `defaultApiResult` | `{success:g,message:h,code:B,result:I,timestamp:x}` |
| `Be` | initData.1783320636200.js | shared | @/shared/initData.ts `getMapChartOption` | `(t,s)=>({tooltip:{show:!1,backgroundColor:"rgba(0, 0, 0, 0)",borderColor:"rgba(0, 0, 0, 0)",color:"#fff",textStyle:{color:"#fff"}},aspectScale:.9,geo:[{type:"map",map:t,zoom:1,z:5,top:"8%",select:{dis` |
| `j` | initData.1783320636200.js | shared | @/shared/initData.ts `getMapTooltipOption` | `(t,s)=>({tooltip:{confine:!0,backgroundColor:"rgba(0, 0, 0, 0)",borderColor:"rgba(0, 0, 0, 0)",padding:0,color:"#fff",textStyle:{color:"#fff"},formatter:function(e,r){let n=e.data;if(s==1)var o='<div ` |
| `E` | vue-countup-v3.es.1783320636200.js | shared | vue-countup-v3 `default` | `A(Y(F({},B),{props:{endVal:null,startVal:{default:0},duration:{default:2.5},decimalPlaces:{default:0},autoplay:{type:Boolean,default:!0},loop:{type:[Boolean,Number],default:!1},delay:{default:0},optio` |
| `Me` | dateUtil.1783320636200.js | shared | @/shared/dateUtil.ts `formatDateByPattern` | `function(t=void 0,r){return i(t).format(r)}` |
| `Ye` | dateUtil.1783320636200.js | shared | @/shared/dateUtil.ts `formatDate` | `function(t=void 0,r=n){return i(t).format(r)}` |
| `Te` | dateUtil.1783320636200.js | shared | @/shared/dateUtil.ts `formatTime` | `function(t=void 0,r=o){return i(t).format(r)}` |
