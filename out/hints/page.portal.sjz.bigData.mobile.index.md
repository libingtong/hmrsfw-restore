# 导入提示：page.portal.sjz.bigData.mobile.index

原 chunk `index.178332063620075.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `H` | index.1783320636200118.js | entry | echarts `init` | `function Sw(n,e,t){var i=!(t&&t.ssr);if(i){var o=Rh(n);if(o)return o}var r=new Lh(n,e,t);return r.id="ec_"+d5++,Jo[r.id]=r,i&&p1(n,og,r.id),_w(r),Cn.trigger("afterinit",r),r}` |
| `Mt` | index.1783320636200118.js | entry | echarts `graphic` | `$O` |
| `tt` | s04.1783320636200.js | shared | @/shared/images `s04ImgS` | `"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAiCAYAAACnSgJKAAACQElEQVRYhe2XT2hTQRDGf68+UG8lFEXQS4sebK1UCl6ssbQSe/DgwYNSL4IgpiJGEETw6EVSaG1RimCPHrx5SUur4p+TWLUgKEg8KFSqaBGkimlGtvtikpfk7Sbalx46Y` |
| `et` | s04.1783320636200.js | shared | @/shared/images `s04ImgA` | `"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAiCAYAAACnSgJKAAACpklEQVRYheWWzU8TURDAfwVimyY1gFDgolYsB8QEP7mgxPCReNKLN69w8IQXEzTGk3jwAicP8gcY4wGvjRC+EjUaPRRMVLDiV1mC2BbUFoExu7DNtml3txi6ByeZ7O7be` |
| `at` | s04.1783320636200.js | shared | @/shared/images `s04ImgB` | `"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAiCAYAAACnSgJKAAACtElEQVRYheVWPWhaURT+jG4mg4WQYCQGSjpIHbJKpSa2hAbcTDJ1yFJIt2YodCjtVqgE2lEEHbLU4CpmqG1JgxkKKZmSQQIhSsliS2LSRfOVc+t7+MTnM7bokAOH9+75+` |
| `ot` | s04.1783320636200.js | shared | @/shared/images `s04ImgC` | `"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAiCAYAAACnSgJKAAACuUlEQVRYheWWTUhUURTHf/cxi0g3iqgtXCkuJtvkJsiPxo9FlLVtYatA+gCtTVDQB7ZoEYgFJdWqRaTUxqiFoDNhbsJAxDIoN4EgmljklEF6T9w3M85zXu+90WDeovM48` |
| `it` | s05.1783320636200.js | shared | @/shared/images `s05Img` | `"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAiCAYAAACnSgJKAAAC20lEQVRYhdVXz08TURD+uhRChRopaKgViCFAFaNcFBISaUEPxoMnPRjPHPgDPJgYPXo00YSD8a6JB2PiBX+kVKIHjMUEYyFotWIXoSmUH8UUeJ/ZbbthSbe7JWkbZzPZz` |
| `q` | timeOut.1783320636200.js | shared | @/shared/timeOut.ts `a`（reserved） | `(t,a,i,o,s,n)=>new Promise((l,g)=>{const e=a;let r=e.getZr();e.on("mouseover",c=>{t.value&&(clearInterval(t.value),(s=="highlight"\|\|s=="all")&&(e.dispatchAction({type:"downplay",seriesIndex:0}),e.disp` |
| `U` | timeOut.1783320636200.js | shared | @/shared/timeOut.ts `l`（reserved） | `(t,a,i,o,s)=>{if(localStorage.getItem("bigDataSwitch")==="false")return;t.value&&clearInterval(t.value),a.dispatchAction({type:"downplay",seriesIndex:0});let n=0;try{const e=a.getOption();e.xAxis&&e.x` |
| `Y` | index.1783320636200.js | entry | lodash-es `cloneDeep` | `function(e){return Gc(e,qve\|Wve)}` |
| `$t` | index.1783320636200.js | entry | @/legacy `getAppConfig` | `()=>{let e=sessionStorage.getItem("appConfig")?sessionStorage.getItem("appConfig"):document.getElementsByTagName("head")[0].getAttribute("data-config");return JSON.parse(e)}` |
| `Pt` | index.1783320636200.js | entry | @/legacy `useStore` | `function(e){return e===void 0&&(e=null),Ft(e!==null?e:Ru)}` |
| `Ht` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `Ut` | index.apinew.1783320636200.js | api | @/api/deviceBasic `queryAllInfoById`（reserved） | `a=>i.request({url:"/xf-job/job/licenseFree/xfJobBigDataViewSettings/queryAllInfoById",method:"get",params:a})` |
