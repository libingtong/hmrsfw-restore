# 导入提示：page.uc.mentor

原 chunk `index.17516156075456.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `ce` | dictCode.1751615607545.js | shared | @/shared/dictCode.vue `default` | `c(v,[["render",S]])` |
| `pe` | dictCodeTreeOne.1751615607545.js | shared | @/shared/dictCodeTreeOne.vue `default` | `C(N,[["render",B]])` |
| `$` | index.1751615607545.js | api | @/legacy `getDictItemsByCode` | `t=>Ee.request({url:"/jeecg-system/sys/dict/getDictItemsByCode",method:"get",params:t})` |
| `me` | index.1751615607545.js | api | @/legacy/api `queryChildrenTreeListById`（reserved） | `t=>Ee.request({url:"/xf-job/communal/xfSysOrganization/queryChildrenTreeListById",method:"post",params:t})` |
| `R` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `fe` | index.1751615607545.js | entry | @/legacy `useTagsStore` | `d0("tags",{state:()=>({list:[]}),getters:{show:t=>t.list.length>0,nameList:t=>t.list.map(e=>e.name)},actions:{delTagsItem(t){this.list.splice(t,1)},setTagsItem(t){this.list.push(t)},clearTags(){this.l` |
| `A` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `ge` | index.1751615607545.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `_e` | index.1751615607545.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `he` | index.1751615607545.js | api | @/legacy/api `getTreeData`（reserved） | `t=>Ee.request({url:"/xf-job/communal/xfSysOrganization/getTreeData",method:"get",params:t})` |
| `ve` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `ye` | index.1751615607545.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:xt(Cdt(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,n){va` |
| `be` | index.api.17516156075454.js | api | @/api/sysConsult `queryOneForUserCenter`（reserved） | `e=>t.request({url:"/xf-job/job/xfJobUserTutorExpand/queryOneForUserCenter",method:"get",params:e})` |
| `we` | index.api.17516156075454.js | api | @/api/sysConsult `saveOneForUserCenter`（reserved） | `e=>t.request({url:"/xf-job/job/xfJobUserTutorExpand/saveOneForUserCenter",method:"post",data:e})` |
| `ke` | cropperjs.1751615607545.js | shared | @/shared/cropperjs.vue `default` | `He($i,[["__scopeId","data-v-e652d67f"]])` |
