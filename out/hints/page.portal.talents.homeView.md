# 导入提示：page.portal.talents.homeView

原 chunk `homeView.1783320636200.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `oe` | index.1783320636200.js | entry | @/legacy `getAppConfig` | `()=>{let e=sessionStorage.getItem("appConfig")?sessionStorage.getItem("appConfig"):document.getElementsByTagName("head")[0].getAttribute("data-config");return JSON.parse(e)}` |
| `Je` | index.1783320636200.js | entry | @/legacy/store `useStoreGetters` | `function(e){const t=vn(),n=T4e(e);console.log(n);let r={};return Object.keys(n).forEach(a=>{const o=n[a].bind({$store:t});r[a]=F(o)}),r}` |
| `Ke` | index.1783320636200.js | api | @/legacy/api `listChildrenTreeByTypeCode` | `e=>ut.request({url:"/xf-job/communal/licenseFree/xfSysArticleType/listChildrenTreeByTypeCode",method:"post",params:e})` |
| `ce` | index.1783320636200.js | entry | @/legacy/api `queryHomeSettingById` | `e=>IN("/xf-job/job/licenseFree/queryHomeSettingById",e,"post")` |
| `Qe` | index.1783320636200.js | entry | @/legacy `LoginModal` | `mt(nne,[["__scopeId","data-v-6ac82971"]])` |
| `re` | index.1783320636200.js | entry | @/legacy `useStore` | `function(e){return e===void 0&&(e=null),Ft(e!==null?e:Ru)}` |
| `Xe` | index.1783320636200.js | entry | @/legacy/api `logout` | `e=>ut.request({url:LN.logout,method:"get",params:e})` |
| `P` | index.1783320636200.js | entry | @/legacy `openUserCenter` | `(e,t)=>{let n=rr.getters.userUrl;t=t\|\|"_blank",n&&n.charAt(n.length-1)==="/"&&(n=n.slice(0,-1)),window.open(n+"/autoLogin?toPath="+encodeURIComponent(e)+"&token="+Ze.getToken(),t)}` |
| `j` | index.1783320636200.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `J` | index.1783320636200.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `et` | index.1783320636200.js | api | @/legacy/api `queryByUserId` | `e=>ut.request({url:"/xf-job/communal/xfSysUserAuthenticateIdentityItem/queryByUserId",method:"post",params:e})` |
| `de` | index.1783320636200.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:Ut(O_e(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,t){va` |
| `ue` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `tt` | index.1783320636200.js | api | @/legacy/api `getArticleListByCode` | `e=>ut.request({url:"/xf-job/job/licenseFree/getArticleListByCode",method:"get",params:e})` |
| `st` | index.1783320636200.js | entry | @/legacy/components/Headers.vue `default` | `mt(HAt,[["__scopeId","data-v-ee377c98"]])` |
| `at` | index.1783320636200.js | entry | @/legacy/components/Foot2.vue `default` | `mt(Ace,[["__scopeId","data-v-e8fe68b2"]])` |
| `it` | denglunew.1783320636200.js | shared | @/shared/images `denglunewImg_` | `"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAXCAYAAADgKtSgAAACbklEQVRIiZWVy29NURSHv1tX0cakRYJKNQYejUckIk00BAlBgnqlE2P+FW9CjCSkIe2oHQlCqWfE0EBESSOhKCZV1UR8BneddDvOldrJytl7r9/6rbXX2WvtkkqVUQZ2A` |
| `nt` | denglunew.1783320636200.js | shared | @/shared/images `denglunewImgA` | `"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAXCAYAAAALHW+jAAAByElEQVQ4jaWUO2tUURCAv11c4gODRVATFCuDTdBCIkEQLCSVRXofmD8iCgHBzkej+CAkVkJQLKxU8AdENKyS0kSMgmgRiBsXPoudmxwv927uxoFhOHNmvp2dmXtQKdFj6` |
