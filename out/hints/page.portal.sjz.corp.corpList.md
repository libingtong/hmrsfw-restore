# 导入提示：page.portal.sjz.corp.corpList

原 chunk `corpList.1783320636200.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `Y` | dictCode.1783320636200.js | shared | @/shared/dictCode.vue `default` | `S(i,[["render",p]])` |
| `Le` | industryCode.1783320636200.js | shared | @/shared/industryCode.vue `default` | `S(i,[["render",d]])` |
| `Ce` | index.api.178332063620014.js | api | @/api/article `freeCompanyList` | `e=>s.request({url:"/xf-job/job/licenseFree/freeCompanyList",method:"post",params:e})` |
| `Te` | index.api.178332063620014.js | api | @/api/article `freeCompanyListByTags` | `e=>s.request({url:"/xf-job/job/licenseFree/freeCompanyListByTags",method:"post",params:e})` |
| `O` | index.1783320636200.js | api | @/legacy `getSettingValueByCode` | `e=>ut.request({url:"/xf-job/job/licenseFree/xfSysBusinessSetting/getSettingValueByCode",method:"get",params:e})` |
| `Be` | index.1783320636200.js | api | @/legacy `getDictListByType` | `e=>ut.request({url:"/xf-job/communal/licenseFree/getDictListByType",method:"post",params:e})` |
| `Ie` | index.1783320636200.js | entry | @/legacy `listToTree` | `function(e){const t=[],n={};return e.forEach(r=>{r.children=[],n[r.id]=r}),e.forEach(r=>{const a=n[r.parentId];a?a.children.push(r):t.push(r)}),t}` |
| `Ue` | index.1783320636200.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `Ae` | index.1783320636200.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `Ee` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `G` | empty.1783320636200.js | shared | @/shared/empty.vue `default` | `x(i,[["render",s],["__scopeId","data-v-810a04d0"]])` |
