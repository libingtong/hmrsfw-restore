# 导入提示：page.portal.jobMarket.index

原 chunk `index.178332063620038.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `ga` | rightdisab.1783320636200.js | shared | @/shared/images `rightdisabImg_` | `"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC4AAAAuCAYAAABXuSs3AAADV0lEQVRogc3Zz4tVZRzH8dccZ3C0SQ1iTI0wnQIHDIx21ghh9ENa5XLcRFED5aLU/6Es6QcoBdFiWkaLwGmRBjpJO5Eki8oBy9Q0UBxzpobBFs8zeT3eO/ece59zxzfcz` |
| `fa` | rightdisab.1783320636200.js | shared | @/shared/images `rightdisabImgA` | `"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC4AAAAuCAYAAABXuSs3AAADW0lEQVRogc3ZzWtcVRjH8U9ujU1qUiNoalOV2kahlQoVd30DqfhS3GiX6aYoGtAu1Or/0GrxBVoUxEVcuhKMC6uQxuKuFAtR1AYqxb4otDSxjcZQF+fETqYzmXvnnpn0C` |
| `va` | rightdisab.1783320636200.js | shared | @/shared/images `rightdisabImgB` | `"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC4AAAAuCAYAAABXuSs3AAADcklEQVRogd2av08TYRiAn54FoYAGsHpqgkhSCwxngjJIYlImo85OJAp/gTsDAwsJm38BYMLExiBxookJCxjEBEI1AWHxmgoVkd9NcXgpOdorvYOv18Yn6dLv7v2eXL/7f` |
| `ka` | rightdisab.1783320636200.js | shared | @/shared/images `rightdisabImgC` | `"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC4AAAAuCAYAAABXuSs3AAADdElEQVRogd2aTU8TQRiAny5F+WpNUbRqgkhSFziUKHKQxKR4MerZCySCv8AjNw5cOPsLABNOcpZ4ouHABQzRBEIxfF5cUqEi8k2qh5eSpWzpLp3dEp+kl87uO0+2M7Mz7` |
| `$` | empty.1783320636200.js | shared | @/shared/empty.vue `default` | `x(i,[["render",s],["__scopeId","data-v-810a04d0"]])` |
| `ha` | index.1783320636200118.js | entry | echarts `init` | `function Sw(n,e,t){var i=!(t&&t.ssr);if(i){var o=Rh(n);if(o)return o}var r=new Lh(n,e,t);return r.id="ec_"+d5++,Jo[r.id]=r,i&&p1(n,og,r.id),_w(r),Cn.trigger("afterinit",r),r}` |
| `Aa` | index.1783320636200118.js | entry | echarts `registerMap` | `function hg(n,e,t){var i=ow("registerMap");i&&i(n,e,t)}` |
| `La` | henan.1783320636200.js | shared | @/assets/geo/henan.json `default` | `{type:e,features:t}` |
| `wa` | index.1783320636200.js | entry | @/legacy `getAppConfig` | `()=>{let e=sessionStorage.getItem("appConfig")?sessionStorage.getItem("appConfig"):document.getElementsByTagName("head")[0].getAttribute("data-config");return JSON.parse(e)}` |
| `Ca` | index.1783320636200.js | entry | @/legacy `getDictItemsByCode` | `e=>IN("/jeecg-system/sys/dict/getDictItemsByCode",e,"get")` |
| `xa` | index.1783320636200.js | api | @/legacy `getAreaInfo` | `e=>ut.request({url:"/xf-job/communal/licenseFree/xfSysAreainfo/getInfo",method:"get",params:e})` |
| `Z` | index.1783320636200.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `j` | index.1783320636200.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `Sa` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `Pa` | index.api.178332063620020.js | api | @/api/service `queryById`（reserved） | `e=>s.request({url:"/xf-job/school/licenseFree/XfSysArticle/queryById",method:"get",params:e})` |
| `Da` | index.api.178332063620020.js | api | @/api/service `freeServiceUnitPageList`（reserved） | `e=>s.request({url:"/xf-job/job/licenseFree/freeServiceUnitPageList",method:"post",params:e})` |
| `Ia` | index.api.178332063620026.js | api | @/api/sysConsult `findJobList`（reserved） | `e=>s.request({url:"/xf-job/job/licenseFree/findJobList",method:"post",params:e})` |
