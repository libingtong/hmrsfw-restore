# 导入提示：page.uc.formDone

原 chunk `formDone.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `ce` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `Oe` | index.1751615607545.js | entry | @/legacy `useTagsStore` | `d0("tags",{state:()=>({list:[]}),getters:{show:t=>t.list.length>0,nameList:t=>t.list.map(e=>e.name)},actions:{delTagsItem(t){this.list.splice(t,1)},setTagsItem(t){this.list.push(t)},clearTags(){this.l` |
| `Ne` | index.1751615607545.js | api | @/legacy `getDictItemsByCode` | `t=>Ee.request({url:"/jeecg-system/sys/dict/getDictItemsByCode",method:"get",params:t})` |
| `Me` | index.1751615607545.js | api | @/legacy `queryAreaChildrenTreeListById` | `t=>Ee.request({url:"/xf-job/job/licenseFree/queryAreaChildrenTreeListById",method:"post",params:t})` |
| `le` | index.1751615607545.js | entry | dayjs `default` | `Oa(Trt)` |
| `ue` | index.1751615607545.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `re` | index.1751615607545.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `L` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `fe` | index.1751615607545.js | entry | @/legacy `formatDateSlash` | `t=>{var e=t.getFullYear(),n=t.getMonth()+1,r=t.getDate();return t.getHours(),t.getMinutes(),t.getSeconds(),e+"/"+n+"/"+r}` |
| `ke` | index.1751615607545.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:xt(Cdt(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,n){va` |
| `We` | index.1751615607545.js | entry | @/legacy `UPLOAD_URL` | `SX.upload` |
| `De` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `ya` | index.1751615607545.js | entry | ant-design-vue `Upload` | `Ft(xs,{Dragger:Ts,LIST_IGNORE:Bl,install:function(e){return e.component(xs.name,xs),e.component(Ts.name,Ts),e}})` |
| `Ca` | index.api.17516156075455.js | api | @/api/talentStayUniversity `checkIdCard3` | `t=>e.request({url:"/xf-talent/talent/xfTalentCraftsmanSubsidys/checkIdCard",method:"get",params:t})` |
| `xa` | index.api.17516156075455.js | api | @/api/talentStayUniversity `queryById3` | `t=>e.request({url:"/xf-talent/talent/xfTalentCraftsmanSubsidys/queryById",method:"get",params:t})` |
| `wa` | index.api.17516156075455.js | api | @/api/talentStayUniversity `saveOrUpdate3` | `t=>e.request({url:"/xf-talent/talent/xfTalentCraftsmanSubsidys/saveOrUpdate",method:"post",data:t})` |
| `ua` | index.api.17516156075455.js | api | @/api/talentStayUniversity `checkIdCard` | `t=>e.request({url:"/xf-talent/talent/xfTalentCgraduateRltSubsidy/checkIdCard",method:"get",params:t})` |
| `ra` | index.api.17516156075455.js | api | @/api/talentStayUniversity `queryById4` | `t=>e.request({url:"/xf-talent/talent/xfTalentCgraduateRltSubsidy/queryById",method:"get",params:t})` |
| `ka` | index.api.17516156075455.js | api | @/api/talentStayUniversity `saveOrupdate` | `t=>e.request({url:"/xf-talent/talent/xfTalentCgraduateRltSubsidy/saveOrupdate",method:"post",data:t})` |
| `Ia` | index.api.17516156075455.js | api | @/api/talentStayUniversity `checkIdCard2` | `t=>e.request({url:"/xf-talent/talent/xfTalentPfiPromotion/checkIdCard",method:"get",params:t})` |
| `La` | index.api.17516156075455.js | api | @/api/talentStayUniversity `queryById2` | `t=>e.request({url:"/xf-talent/talent/xfTalentPfiPromotion/queryById",method:"get",params:t})` |
| `Pa` | index.api.17516156075455.js | api | @/api/talentStayUniversity `saveOrUpdate2` | `t=>e.request({url:"/xf-talent/talent/xfTalentPfiPromotion/saveOrUpdate",method:"post",data:t})` |
| `Na` | index.api.17516156075455.js | api | @/api/talentStayUniversity `queryById` | `t=>e.request({url:"/xf-talent/talent/xfTalentStayUniversity/queryById",method:"get",params:t})` |
| `Ta` | index.api.17516156075455.js | api | @/api/talentStayUniversity `getCollegeInfo` | `t=>e.request({url:"/xf-talent/talent/xfTalentStayUniversity/getCollegeInfo",method:"post",data:t})` |
| `Ua` | index.api.17516156075455.js | api | @/api/talentStayUniversity `saveOrUpdate` | `t=>e.request({url:"/xf-talent/talent/xfTalentStayUniversity/saveOrUpdate",method:"post",data:t})` |
| `na` | index.api.17516156075455.js | api | @/api/talentStayUniversity `checkIdCard4` | `t=>e.request({url:"/xf-talent/talent/xfTalentPostdocPerk/checkIdCard",method:"get",params:t})` |
| `ia` | index.api.17516156075455.js | api | @/api/talentStayUniversity `queryById5` | `t=>e.request({url:"/xf-talent/talent/xfTalentPostdocPerk/queryById",method:"get",params:t})` |
| `oa` | index.api.17516156075455.js | api | @/api/talentStayUniversity `saveOrUpdate4` | `t=>e.request({url:"/xf-talent/talent/xfTalentPostdocPerk/saveOrUpdate",method:"post",data:t})` |
| `Ie` | dictCode.1751615607545.js | shared | @/shared/dictCode.vue `default` | `c(v,[["render",S]])` |
| `Ve` | idCard.1751615607545.js | shared | @/shared/idCard.vue `default` | `u(h,[["render",I]])` |
