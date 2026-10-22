# 导入提示：page.portal.xjhm.bigData.newBigdata

原 chunk `newBigdata.1783320636200.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `ll` | index.1783320636200.js | entry | @/legacy/api `sysRandomImage`（reserved） | `function(e){let t='/sys/randomImage/${e}';return ut.request({url:t,method:"get"})}` |
| `sl` | index.1783320636200.js | api | @/legacy/api `login`（reserved） | `e=>ut.request({url:"/xf-job/school/user/login",method:"post",data:e})` |
| `Nt` | index.1783320636200.js | entry | ant-design-vue `message` | `D1` |
| `il` | index.1783320636200.js | entry | ant-design-vue `notification` | `ss` |
| `St` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `ol` | index.1783320636200.js | entry | @/legacy `getAppConfig` | `()=>{let e=sessionStorage.getItem("appConfig")?sessionStorage.getItem("appConfig"):document.getElementsByTagName("head")[0].getAttribute("data-config");return JSON.parse(e)}` |
| `nl` | index.1783320636200.js | entry | @/legacy `getWeekDay` | `function(e,t){if(e){let n=["\u661F\u671F\u65E5","\u661F\u671F\u4E00","\u661F\u671F\u4E8C","\u661F\u671F\u4E09","\u661F\u671F\u56DB","\u661F\u671F\u4E94","\u661F\u671F\u516D"];return t==0&&(n=["\u5468\` |
| `dl` | index.1783320636200.js | entry | @/legacy `useStore` | `function(e){return e===void 0&&(e=null),Ft(e!==null?e:Ru)}` |
| `cl` | bars.vue_vue_type_style_index_0_lang.1783320636200.js | shared | @/shared/bars.vue `default`（reserved） | `P({__name:"bars",props:{title:String,data:{type:Object,default:()=>[]},types:String,option:{type:Object,default:()=>{}}},emits:["mapClick"],setup(l,{emit:d}){const a=l;let s=m(null);const e=b({chart:n` |
| `$` | pie.vue_vue_type_style_index_0_lang.1783320636200.js | shared | @/shared/pie.vue `default`（reserved） | `g({__name:"pie",props:{title:String,data:{type:Object,default:()=>[]},types:String,option:{type:Object,default:()=>{}}},emits:["changeTimeData"],setup(o,{emit:p}){const a=o;let s=d(null);const e=j({ch` |
| `ml` | lines.vue_vue_type_style_index_0_lang.1783320636200.js | shared | @/shared/lines.vue `default`（reserved） | `w({__name:"lines",props:{title:String,data:{type:Object,default:()=>[]},types:String,option:{type:Object,default:()=>{}}},emits:["changeTimeData"],setup(r,{emit:p}){const t=r;let n=u(null);const o=O({` |
| `gl` | init.17833206362002.js | api | @/shared/init.ts `q`（reserved） | `a=>b.request({url:"/xf-job/job/licenseFree/xfJobBigDataViewSettings/queryAllInfoById",method:"get",params:a})` |
| `fl` | init.17833206362002.js | shared | @/shared/init/MapCommon.vue `default`（reserved） | `Y({__name:"mapCommon",props:{title:String,data:{type:Object,default:()=>[]},types:String,option:{type:Object,default:()=>{}},mapName:{type:String,default:"china"},code:{type:String,default:""}},emits:` |
| `hl` | init.17833206362002.js | api | @/shared/init.ts `r`（reserved） | `a=>b.request({url:"/job/licenseFree/xfJobBigDataContent/refreshContent",method:"post",params:a})` |
| `Cl` | init.17833206362002.js | shared | @/shared/init.ts `i`（reserved） | `a=>{const r=a.ydata,e=a.series1.data,t=a.series2.data,o=a.series1.name\|\|"\u5973",n=a.series2.name\|\|"\u7537";return{title:{show:!1},tooltip:{backgroundColor:"rgba(0, 0, 0, 0.5)",borderColor:"rgba(0, 0,` |
| `yl` | init.17833206362002.js | shared | @/shared/init.ts `a`（reserved） | `a=>{const r=["#5470c6","#fac858","#ee6666","#73c0de","#3ba272","#fc8452","#9a60b4"];return{tooltip:{confine:!0,backgroundColor:"rgba(0, 0, 0, 0.5)",borderColor:"rgba(0, 0, 0, 0.1)",color:"#fff",textSt` |
| `It` | init.17833206362002.js | shared | @/shared/init.ts `b`（reserved） | `(a,r)=>({tooltip:{confine:!0,backgroundColor:"rgba(0, 0, 0, 0.5)",borderColor:"rgba(0, 0, 0, 0.1)",color:"#fff",textStyle:{color:"#fff"},formatter:function(e,t){let o=e.data;const n=o.scale\|\|o.proport` |
| `wl` | init.17833206362002.js | shared | @/shared/init.ts `c`（reserved） | `a=>({tooltip:{confine:!0,backgroundColor:"rgba(0, 0, 0, 0.5)",borderColor:"rgba(0, 0, 0, 0.1)",color:"#fff",textStyle:{color:"#fff"},formatter:function(r,e){let t=r.data;return'${t.name} <br>${t.value` |
| `kl` | init.17833206362002.js | shared | @/shared/init.ts `d`（reserved） | `(a,r)=>{const e="/xjhm/bigdata/img1.jpg",t="/xjhm/bigdata/img2.jpg";return{tooltip:{show:!1},aspectScale:.9,geo:[{type:"map",map:a,zoom:1,z:5,top:"8%",select:{disable:!1,label:{color:"#000"},itemStyle` |
| `bl` | init.17833206362002.js | shared | @/shared/init.ts `e`（reserved） | `a=>{const{name:r,title:e,list:t}=a,o=(t==null?void 0:t.data0)\|\|[],n=(t==null?void 0:t.data1)\|\|[];if(o.length==0&&n.length==0)return;const s=e[0]\|\|"\u9700\u6C42\u4EBA\u6570",f=e[1]\|\|"\u6C42\u804C\u4EBA` |
| `xl` | init.17833206362002.js | shared | @/shared/init.ts `f`（reserved） | `a=>({color:["#F58146","#58C394","#3A5FCD","#1E90FF","#2EC7C9","#F6BD16","#E87C25","#9BCD8B","#B6A2DE","#5AB1EF","#8AB1EF","#9AB1EF","#5001EF"],tooltip:{trigger:"item",confine:!0,backgroundColor:"rgba(` |
| `_l` | dateUtil.1783320636200.js | shared | @/shared/dateUtil.ts `f`（reserved） | `function(t=void 0,r){return i(t).format(r)}` |
| `Tl` | dateUtil.1783320636200.js | shared | @/shared/dateUtil.ts `a`（reserved） | `function(t=void 0,r=n){return i(t).format(r)}` |
| `Gl` | dateUtil.1783320636200.js | shared | @/shared/dateUtil.ts `b`（reserved） | `function(t=void 0,r=o){return i(t).format(r)}` |
| `K` | vue-countup-v3.es.1783320636200.js | shared | vue-countup-v3 `default` | `A(Y(F({},B),{props:{endVal:null,startVal:{default:0},duration:{default:2.5},decimalPlaces:{default:0},autoplay:{type:Boolean,default:!0},loop:{type:[Boolean,Number],default:!1},delay:{default:0},optio` |
