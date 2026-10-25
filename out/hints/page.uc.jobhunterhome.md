# 导入提示：page.uc.jobhunterhome

原 chunk `home.17516156075453.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `P` | newUserCard.vue_vue_type_style_index_0_scoped_399cb1b5_lang.1751615607545.js | shared | @/shared/images `newUserCardImg` | `"/assets/clogo.1751615607545.png"` |
| `Q` | index.1751615607545.js | api | @/legacy `getSettingValueByCode` | `t=>Ee.request({url:"/xf-job/communal/xfSysBusinessSetting/getSettingValueByCode",method:"get",params:t})` |
| `le` | index.1751615607545.js | entry | @/legacy `SettingCodes` | `(t=>(t.WEBPORTAL_DOMAIN="webportal_domain",t.USER_CENTE_RDEFAULT_NAME="userCenterDefaultName",t.IS_SHOW_CHANGEPWD="is_show_changepwd",t.JOB_FAIR_PASSED_IZ_EDIT_POSITION="job_fair_passed_iz_edit_positi` |
| `re` | index.1751615607545.js | api | @/legacy `getDictItemsByCode` | `t=>Ee.request({url:"/jeecg-system/sys/dict/getDictItemsByCode",method:"get",params:t})` |
| `L` | index.1751615607545.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `z` | index.1751615607545.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `W` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `de` | index.1751615607545.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:xt(Cdt(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,n){va` |
| `M` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `_e` | index.1751615607545.js | entry | @/legacy `useTagsStore` | `d0("tags",{state:()=>({list:[]}),getters:{show:t=>t.list.length>0,nameList:t=>t.list.map(e=>e.name)},actions:{delTagsItem(t){this.list.splice(t,1)},setTagsItem(t){this.list.push(t)},clearTags(){this.l` |
| `ue` | index.1751615607545.js | entry | @/legacy/utils `closeTag`（reserved） | `(t,e,n,r)=>{t.list.find((a,i)=>{if(a.name==n.name){const o=t.list[i];t.delTagsItem(i);const l=t.list[i]?t.list[i]:t.list[i-1];l?o.path===n.fullPath&&e.push(l.path):e.push(r)}e.push(r)})}` |
| `pe` | index.1751615607545.js | api | @/legacy/api `queryAnnouncementList`（reserved） | `t=>Ee.request({url:"/xf-common/common/xfAnnouncementSendRedcord/queryAnnouncementList",method:"post",params:t})` |
| `H` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `me` | index.api.17516156075456.js | api | @/api/jobCurriculumVitae `statics` | `e=>t.request({url:"/xf-job/job/xfJobCurriculumVitae/statics",method:"get",params:e})` |
| `fe` | index.api.17516156075456.js | api | @/api/jobCurriculumVitae `listNew` | `e=>t.request({url:"/xf-job/job/xfJobInterviewInvitation/listNew",method:"get",params:e})` |
| `he` | index.api.17516156075456.js | api | @/api/jobCurriculumVitae `listWithSort` | `e=>t.request({url:"/xf-job/job/xfJobCurriculumVitaeLookoverRecord/listWithSort",method:"get",params:e})` |
| `J` | index.api.17516156075456.js | api | @/api/jobCurriculumVitae `acceptOrRefuse` | `e=>t.request({url:"/xf-job/job/xfJobInterviewInvitation/acceptOrRefuse",method:"get",params:e})` |
| `ye` | right.vue_vue_type_script_setup_true_lang.1751615607545.js | shared | @/shared/right.vue `default`（reserved） | `w({__name:"right",props:{},emits:[],setup(I,{emit:R}){y();const d=m(),t=v({organizationId:void 0,swiperList:[],list:[]});C(()=>{}),P(()=>{c()});const c=()=>{f({dictCode:window.businessDict}).then(e=>{` |
| `ve` | recommendZp.1751615607545.js | shared | @/shared/recommendZp/StateCard.vue `default`（reserved） | `F(V,[["__scopeId","data-v-53902b4a"]])` |
| `ge` | recommendZp.1751615607545.js | shared | @/shared/recommendZp/RecommendZp.vue `default`（reserved） | `F(pe,[["__scopeId","data-v-063eb494"]])` |
| `ke` | default.1751615607545.js | shared | @/shared/images `defaultImg` | `"/assets/default.1751615607545.jpg"` |
| `we` | index.api.1751615607545.js | api | @/api/jobSupermarketMerchants `getRecommendTalentList`（reserved） | `e=>t.request({url:"/xf-job/job/xfJobCompany/getRecommendTalentList",method:"post",params:e})` |
| `xe` | index.api.1751615607545.js | api | @/api/jobSupermarketMerchants `recommendJobList`（reserved） | `e=>t.request({url:"/xf-job/job/licenseFree/xfJobCompanyPosition/recommendJobList",method:"post",params:e})` |
| `Ie` | mymsg.1751615607545.js | shared | @/shared/mymsg/Mymsg.vue `default` | `T(Y,[["__scopeId","data-v-dfa9af6a"]])` |
| `Se` | resumemodal.1751615607545.js | shared | @/shared/resumemodal.vue `default` | `F(le,[["__scopeId","data-v-3db338bf"]])` |
