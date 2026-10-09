# 导入提示：shared.portal.init

原 chunk `init.17833206362002.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `_` | timeOut.1783320636200.js | shared | @/shared/timeOut.ts `a`（reserved） | `(t,a,i,o,s,n)=>new Promise((l,g)=>{const e=a;let r=e.getZr();e.on("mouseover",c=>{t.value&&(clearInterval(t.value),(s=="highlight"\|\|s=="all")&&(e.dispatchAction({type:"downplay",seriesIndex:0}),e.disp` |
| `N` | timeOut.1783320636200.js | shared | @/shared/timeOut.ts `l`（reserved） | `(t,a,i,o,s)=>{if(localStorage.getItem("bigDataSwitch")==="false")return;t.value&&clearInterval(t.value),a.dispatchAction({type:"downplay",seriesIndex:0});let n=0;try{const e=a.getOption();e.xAxis&&e.x` |
| `O` | index.1783320636200118.js | entry | echarts `init` | `function Sw(n,e,t){var i=!(t&&t.ssr);if(i){var o=Rh(n);if(o)return o}var r=new Lh(n,e,t);return r.id="ec_"+d5++,Jo[r.id]=r,i&&p1(n,og,r.id),_w(r),Cn.trigger("afterinit",r),r}` |
| `D` | index.1783320636200118.js | entry | echarts `registerMap` | `function hg(n,e,t){var i=ow("registerMap");i&&i(n,e,t)}` |
| `u` | index.1783320636200118.js | entry | echarts `graphic` | `$O` |
| `R` | index.1783320636200.js | api | @/legacy `getDictValueByCodeAndItems` | `e=>ut.request({url:"/xf-job/job/licenseFree/getDictValueByCodeAndItems",method:"post",params:e})` |
| `q` | index.1783320636200.js | api | @/legacy/api `getAreaInfoById` | `e=>ut.request({url:"/xf-job/communal/licenseFree/xfSysAreainfo/getAreaInfoById",method:"get",params:e})` |
| `I` | index.1783320636200.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `J` | index.1783320636200.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `M` | index.1783320636200.js | entry | axios `AxiosHeaders` | `cr` |
| `m` | index.1783320636200.js | entry | lodash-es `cloneDeep` | `function(e){return Gc(e,qve\|Wve)}` |
| `b` | index.1783320636200.js | entry | @/utils/request `request` | `new QIe({baseURL:ct,timeout:zN})` |
