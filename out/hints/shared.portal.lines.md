# 导入提示：shared.portal.lines

原 chunk `lines.vue_vue_type_style_index_0_lang.1783320636200.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `_` | timeOut.1783320636200.js | shared | @/shared/timeOut.ts `bindChartHoverPause` | `(t,a,i,o,s,n)=>new Promise((l,g)=>{const e=a;let r=e.getZr();e.on("mouseover",c=>{t.value&&(clearInterval(t.value),(s=="highlight"\|\|s=="all")&&(e.dispatchAction({type:"downplay",seriesIndex:0}),e.disp` |
| `f` | timeOut.1783320636200.js | shared | @/shared/timeOut.ts `startChartHighlightLoop` | `(t,a,i,o,s)=>{if(localStorage.getItem("bigDataSwitch")==="false")return;t.value&&clearInterval(t.value),a.dispatchAction({type:"downplay",seriesIndex:0});let n=0;try{const e=a.getOption();e.xAxis&&e.x` |
| `v` | index.1783320636200118.js | entry | echarts `getInstanceByDom` | `function Rh(n){return Jo[pP(n,og)]}` |
| `y` | index.1783320636200118.js | entry | echarts `init` | `function Sw(n,e,t){var i=!(t&&t.ssr);if(i){var o=Rh(n);if(o)return o}var r=new Lh(n,e,t);return r.id="ec_"+d5++,Jo[r.id]=r,i&&p1(n,og,r.id),_w(r),Cn.trigger("afterinit",r),r}` |
| `c` | index.1783320636200.js | entry | lodash-es `cloneDeep` | `function(e){return Gc(e,qve\|Wve)}` |
