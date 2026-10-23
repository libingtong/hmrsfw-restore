# 导入提示：page.uc.Createaresume

原 chunk `Createaresume.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `Je` | wxyy.hook.1751615607545.js | shared | @/legacy `ROBOT_IMG` | `"/assets/j_robot.1751615607545.png"` |
| `Jl` | wxyy.hook.1751615607545.js | shared | @/legacy `askWenXin` | `e=>(e=e.replace(/[\r\n]/g,""),new Promise((n,s)=>{r(e).then(t=>{t.success\|\|a.warning(t.message),n(t)}).catch(t=>{s(t)})}))` |
| `$l` | unfold.1751615607545.js | shared | @/shared/unfold.vue `default` | `m(x,[["__scopeId","data-v-334f6655"]])` |
| `le` | dictCode.1751615607545.js | shared | @/shared/dictCode.vue `default` | `c(v,[["render",S]])` |
| `Dl` | index.1751615607545.js | entry | @/legacy `useTagsStore` | `d0("tags",{state:()=>({list:[]}),getters:{show:t=>t.list.length>0,nameList:t=>t.list.map(e=>e.name)},actions:{delTagsItem(t){this.list.splice(t,1)},setTagsItem(t){this.list.push(t)},clearTags(){this.l` |
| `he` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `Ue` | index.1751615607545.js | api | @/legacy `getSettingValueByCode` | `t=>Ee.request({url:"/xf-job/communal/xfSysBusinessSetting/getSettingValueByCode",method:"get",params:t})` |
| `Vl` | index.1751615607545.js | entry | @/legacy `SettingCodes` | `(t=>(t.WEBPORTAL_DOMAIN="webportal_domain",t.USER_CENTE_RDEFAULT_NAME="userCenterDefaultName",t.IS_SHOW_CHANGEPWD="is_show_changepwd",t.JOB_FAIR_PASSED_IZ_EDIT_POSITION="job_fair_passed_iz_edit_positi` |
| `G` | index.1751615607545.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:xt(Cdt(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,n){va` |
| `Gl` | index.1751615607545.js | entry | @/legacy `joinAreaNames` | `(t,e)=>{let n="";return e=="workProviceName"?(t.workProviceName&&t.workProviceId&&(n=t.workProviceName),t.workCityName&&t.workCityId&&(n=n+"/"+t.workCityName),t.workAreaName&&t.workAreaId&&(n=n+"/"+t.` |
| `Be` | index.1751615607545.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `Le` | index.1751615607545.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `Xl` | index.1751615607545.js | api | @/legacy `getDictValueByCodes` | `t=>Ee.request({url:"/xf-job/school/user/getDictValueByCodes",method:"post",params:t})` |
| `N` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `ge` | index.1751615607545.js | entry | @/legacy `checkSensitive` | `e=>Wn(void 0,[e],function*({value:t}){const n=yield ipt({words:t,findModule:100});if(n.success)if(n.result.izSensitiveWords==!0){let r='您输入的内容涉及敏感信息：${n.result.sensitiveWords}，请修改后再操作。';return aht(r),` |
| `_` | index.1751615607545.js | entry | dayjs `default` | `Oa(Trt)` |
| `ae` | index.1751615607545.js | entry | @/legacy `CURRENT_YEAR_MONTH` | `tht+"-"+nht` |
| `Zl` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `Kl` | dictCodeByType.1751615607545.js | shared | @/shared/dictCodeByType.vue `default` | `f(V,[["render",B]])` |
| `ea` | workType.1751615607545.js | shared | @/shared/workType.vue `default` | `q(ce,[["__scopeId","data-v-13870526"]])` |
| `sa` | resumemodal.1751615607545.js | shared | @/shared/resumemodal.vue `default` | `F(le,[["__scopeId","data-v-3db338bf"]])` |
| `la` | cropperjs.1751615607545.js | shared | @/shared/cropperjs.vue `default` | `He($i,[["__scopeId","data-v-e652d67f"]])` |
| `aa` | index.api.17516156075456.js | api | @/api/api-56 `getVitaeNumByXfSysUserId` | `e=>t.request({url:"/xf-job/job/xfJobCurriculumVitae/getVitaeNumByXfSysUserId",method:"get",params:e})` |
| `ta` | index.api.17516156075456.js | api | @/api/api-56 `queryPositionIzOnly` | `e=>t.request({url:"/xf-job/job/xfJobCurriculumVitae/queryPositionIzOnly",method:"get",params:e})` |
| `ia` | index.api.17516156075456.js | api | @/api/api-56 `queryIzCanCreatVitae` | `e=>t.request({url:"/xf-job/job/xfJobCurriculumVitae/queryIzCanCreatVitae",method:"get",params:e})` |
| `oa` | index.api.17516156075456.js | api | @/api/api-56 `queryVoById` | `e=>t.request({url:"/xf-job/job/xfJobCurriculumVitae/queryVoById",method:"get",params:e})` |
| `na` | index.api.17516156075456.js | api | @/api/api-56 `list2` | `e=>t.request({url:"/xf-job/job/xfJobWorkExperience/list",method:"get",params:e})` |
| `He` | index.api.17516156075456.js | api | @/api/api-56 `list3` | `e=>t.request({url:"/xf-job/job/xfJobEducationalExperience/list",method:"get",params:e})` |
| `ra` | index.api.17516156075456.js | api | @/api/api-56 `list4` | `e=>t.request({url:"/xf-job/job/xfJobCredentials/list",method:"get",params:e})` |
| `be` | index.api.17516156075456.js | api | @/api/api-56 `save` | `e=>t.request({url:"/xf-job/job/xfJobCurriculumVitae/save",method:"post",data:e})` |
| `ua` | index.api.17516156075456.js | api | @/api/api-56 `deleteItem2` | `e=>t.request({url:"/xf-job/job/xfJobWorkExperience/delete",method:"delete",params:e})` |
| `da` | index.api.17516156075456.js | api | @/api/api-56 `edit` | `e=>t.request({url:"/xf-job/job/xfJobWorkExperience/edit",method:"post",data:e})` |
| `ca` | index.api.17516156075456.js | api | @/api/api-56 `add` | `e=>t.request({url:"/xf-job/job/xfJobWorkExperience/add",method:"post",data:e})` |
| `Pe` | index.api.17516156075456.js | api | @/api/api-56 `deleteItem3` | `e=>t.request({url:"/xf-job/job/xfJobEducationalExperience/delete",method:"delete",params:e})` |
| `We` | index.api.17516156075456.js | api | @/api/api-56 `edit2` | `e=>t.request({url:"/xf-job/job/xfJobEducationalExperience/edit",method:"post",data:e})` |
| `Oe` | index.api.17516156075456.js | api | @/api/api-56 `add2` | `e=>t.request({url:"/xf-job/job/xfJobEducationalExperience/add",method:"post",data:e})` |
| `fa` | index.api.17516156075456.js | api | @/api/api-56 `deleteItem4` | `e=>t.request({url:"/xf-job/job/xfJobCredentials/delete",method:"delete",params:e})` |
| `pa` | index.api.17516156075456.js | api | @/api/api-56 `edit3` | `e=>t.request({url:"/xf-job/job/xfJobCredentials/edit",method:"post",data:e})` |
| `ma` | index.api.17516156075456.js | api | @/api/api-56 `add3` | `e=>t.request({url:"/xf-job/job/xfJobCredentials/add",method:"post",data:e})` |
| `ha` | index.api.17516156075456.js | api | @/api/api-56 `queryById` | `e=>t.request({url:"/xf-job/job/xfJobWorkExperience/queryById",method:"get",params:e})` |
| `Qe` | index.api.17516156075456.js | api | @/api/api-56 `queryById2` | `e=>t.request({url:"/xf-job/job/xfJobEducationalExperience/queryById",method:"get",params:e})` |
| `ga` | index.api.17516156075456.js | api | @/api/api-56 `queryById3` | `e=>t.request({url:"/xf-job/job/xfJobCredentials/queryById",method:"get",params:e})` |
