# 导入提示：page.uc.CorpCenter

原 chunk `CorpCenter.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `je` | mymsg.1751615607545.js | shared | @/shared/mymsg/Mymsg.vue `default`（reserved） | `T(Y,[["__scopeId","data-v-dfa9af6a"]])` |
| `Ke` | mymsg.1751615607545.js | shared | @/shared/mymsg.ts `_`（reserved） | `"/assets/null.1751615607545.jpg"` |
| `Ze` | recommendZp.1751615607545.js | shared | @/shared/recommendZp/StateCard.vue `default`（reserved） | `F(V,[["__scopeId","data-v-53902b4a"]])` |
| `Ge` | recommendZp.1751615607545.js | shared | @/shared/recommendZp/RecommendZp.vue `default`（reserved） | `F(pe,[["__scopeId","data-v-063eb494"]])` |
| `We` | index.1751615607545.js | api | @/legacy `getSettingValueByCode` | `t=>Ee.request({url:"/xf-job/communal/xfSysBusinessSetting/getSettingValueByCode",method:"get",params:t})` |
| `F` | index.1751615607545.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:xt(Cdt(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,n){va` |
| `ee` | index.1751615607545.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `te` | index.1751615607545.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `ne` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `ge` | index.1751615607545.js | api | @/legacy `getDictItemsByCode` | `t=>Ee.request({url:"/jeecg-system/sys/dict/getDictItemsByCode",method:"get",params:t})` |
| `Ye` | index.1751615607545.js | api | @/legacy/api `setCompanyTags` | `t=>Ee.request({url:"/xf-job/job/xfJobCompany/setCompanyTags",method:"post",data:t})` |
| `G` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `V` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `q` | index.1751615607545.js | entry | @/legacy `SettingCodes` | `(t=>(t.WEBPORTAL_DOMAIN="webportal_domain",t.USER_CENTE_RDEFAULT_NAME="userCenterDefaultName",t.IS_SHOW_CHANGEPWD="is_show_changepwd",t.JOB_FAIR_PASSED_IZ_EDIT_POSITION="job_fair_passed_iz_edit_positi` |
| `Je` | index.1751615607545.js | api | @/legacy `getSettingValueByCodes` | `t=>Ee.request({url:"/xf-job/job/licenseFree/xfSysBusinessSetting/getSettingValueByCodes",method:"get",params:t})` |
| `ve` | index.1751615607545.js | api | @/legacy/api `freeCompanyDetailById` | `t=>Ee.request({url:"/xf-job/job/licenseFree/freeCompanyDetailById",method:"post",params:t})` |
| `Xe` | index.1751615607545.js | entry | @/legacy `useTagsStore` | `d0("tags",{state:()=>({list:[]}),getters:{show:t=>t.list.length>0,nameList:t=>t.list.map(e=>e.name)},actions:{delTagsItem(t){this.list.splice(t,1)},setTagsItem(t){this.list.push(t)},clearTags(){this.l` |
| `Qe` | index.1751615607545.js | entry | vuex `useStore` | `function xc(t){return t===void 0&&(t=null),Ot(t!==null?t:TR)}` |
| `et` | index.1751615607545.js | entry | @/legacy/utils `closeTag` | `(t,e,n,r)=>{t.list.find((a,i)=>{if(a.name==n.name){const o=t.list[i];t.delTagsItem(i);const l=t.list[i]?t.list[i]:t.list[i-1];l?o.path===n.fullPath&&e.push(l.path):e.push(r)}e.push(r)})}` |
| `tt` | index.1751615607545.js | api | @/legacy/api `remind` | `t=>Ee.request({url:"/xf-job/job/xfJobCompanyPosition/expired/remind",method:"post",params:t})` |
| `st` | index.1751615607545.js | api | @/legacy/api `noMoreRemindersToday` | `t=>Ee.request({url:"/xf-job/job/xfJobCompanyPosition/expired/noMoreRemindersToday",method:"post",params:t})` |
| `ot` | index.1751615607545.js | api | @/legacy/api `getCompanyStatistic` | `t=>Ee.request({url:"/xf-job/job/xfJobCompany/getCompanyStatistic",method:"get",params:t})` |
| `Z` | index.1751615607545.js | api | @/legacy/api `queryByCompanyId` | `t=>Ee.request({url:"/xf-job/communal/xfSysUserAuthenticateIdentityItem/queryByCompanyId",method:"post",params:t})` |
| `nt` | index.1751615607545.js | api | @/legacy/api `getCompanyUserList` | `t=>Ee.request({url:"/xf-job/job/xfJobUserCompany/getCompanyUserList",method:"get",params:t})` |
| `at` | index.1751615607545.js | api | @/legacy/api `queryPageListByCompanyId` | `t=>Ee.request({url:"/xf-job/job/xfJobCurriculumVitaeDeliver/queryPageListByCompanyId",method:"get",params:t})` |
| `lt` | index.1751615607545.js | api | @/legacy/api `queryPageInterviewListByCompanyId` | `t=>Ee.request({url:"/xf-job/job/xfJobInterviewInvitation/queryPageInterviewListByCompanyId",method:"get",params:t})` |
| `it` | index.1751615607545.js | api | @/legacy/api `getCount` | `t=>Ee.request({url:"/xf-job/job/xfJobCurriculumVitaeDeliver/getCount",method:"post",params:t})` |
| `ct` | index.1751615607545.js | api | @/legacy/api `queryCountOfUnFile` | `()=>Ee.request({url:"/xf-job/job/xfJobCompany/queryCountOfUnFile",method:"post"})` |
| `rt` | index.1751615607545.js | api | @/legacy/api `unBindCompany` | `t=>Ee.request({url:"/xf-job/job/xfJobUserCompany/unBindCompany",method:"post",params:t})` |
| `dt` | index.1751615607545.js | api | @/legacy/api `isPublishingPosition` | `t=>Ee.request({url:"/xf-job/job/xfJobCompany/isPublishingPosition",method:"get",params:t})` |
| `ut` | index.1751615607545.js | api | @/legacy/api `addTalent` | `t=>Ee.request({url:"/xf-job/job/xfJobCompanyTalents/addTalent",method:"post",data:t})` |
| `pt` | authCompany.1751615607545.js | shared | @/shared/authCompany.vue `default`（reserved） | `ee(Be,[["__scopeId","data-v-09e59f45"]])` |
| `Q` | index.api.17516156075456.js | api | @/api/jobCurriculumVitae `getSettingValueByCode` | `e=>t.request({url:"/xf-job/communal/xfSysBusinessSetting/getSettingValueByCode",method:"get",params:e})` |
| `_t` | setStatus.vue_vue_type_style_index_0_scoped_ed0660df_lang.1751615607545.js | shared | @/shared/setStatus.vue `default`（reserved） | `A(ee,[["__scopeId","data-v-adee5d08"]])` |
| `yt` | addKeynote.1751615607545.js | shared | @/shared/addKeynote/AddBeOnProbation.vue `default`（reserved） | `N(L,[["__scopeId","data-v-de576056"]])` |
| `ft` | addKeynote.1751615607545.js | shared | @/shared/addKeynote/AddKeynote.vue `default`（reserved） | `N(X,[["__scopeId","data-v-a5cea3e0"]])` |
| `mt` | setStatusinterview.1751615607545.js | shared | @/shared/setStatusinterview.vue `default` | `B(A,[["__scopeId","data-v-99a2d30a"]])` |
| `ht` | InterviewInvitation.17516156075452.js | shared | @/shared/InterviewInvitation.vue `default` | `E(ae,[["__scopeId","data-v-85ce95bb"]])` |
| `gt` | stateCard.vue_vue_type_style_index_0_scoped_53902b4a_lang.1751615607545.js | shared | @/shared/images `stateCardImg` | `"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAPCAYAAAACsSQRAAAAAXNSR0IArs4c6QAAAb9JREFUOE+tk81LVFEYxp/nnHtHxFHvjJiUYC0SJBNMlDYt3AWFSYKQlBvbiJjMh4Jiiwg34p1qEQRSuKl1myBIwf6Alom0btHCutcPlHGce95wv` |
| `vt` | default.1751615607545.js | shared | @/shared/images `defaultImg` | `"/assets/default.1751615607545.jpg"` |
| `kt` | index.api.1751615607545.js | api | @/api/jobSupermarketMerchants `getRecommendTalentList` | `e=>t.request({url:"/xf-job/job/xfJobCompany/getRecommendTalentList",method:"post",params:e})` |
| `bt` | index.api.1751615607545.js | api | @/api/jobSupermarketMerchants `recommendJobList` | `e=>t.request({url:"/xf-job/job/licenseFree/xfJobCompanyPosition/recommendJobList",method:"post",params:e})` |
| `Ct` | dictCheckBoxAll.1751615607545.js | shared | @/shared/dictCheckBoxAll.vue `default` | `g(O,[["render",v]])` |
| `xt` | right.vue_vue_type_script_setup_true_lang.1751615607545.js | shared | @/shared/right.vue `default`（reserved） | `w({__name:"right",props:{},emits:[],setup(I,{emit:R}){y();const d=m(),t=v({organizationId:void 0,swiperList:[],list:[]});C(()=>{}),P(()=>{c()});const c=()=>{f({dictCode:window.businessDict}).then(e=>{` |
