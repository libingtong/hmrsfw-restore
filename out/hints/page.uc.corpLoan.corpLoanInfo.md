# 导入提示：page.uc.corpLoan.corpLoanInfo

原 chunk `corpLoanInfo.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `Ye` | index.api.17516156075459.js | api | @/api/jobLoanApplyCompany `checkIsCanAdd`（reserved） | `o=>t.request({url:"/xf-job/job/xfJobLoanApplyCompany/checkIsCanAdd",method:"post",data:o})` |
| `Ee` | index.api.17516156075459.js | api | @/api/jobLoanApplyCompany `saveOrUpdateMh`（reserved） | `o=>t.request({url:"/job/xfJobLoanApplyCompany/saveOrUpdateMh",method:"post",data:o})` |
| `Se` | index.api.17516156075459.js | api | @/api/jobLoanApplyCompany `queryById`（reserved） | `o=>t.request({url:"/xf-job/job/xfJobLoanApplyCompany/queryById",method:"post",params:o})` |
| `$e` | index.api.17516156075459.js | api | @/api/jobLoanApplyCompany `queryCompanyInfo`（reserved） | `o=>t.request({url:"/xf-job/job/xfJobLoanApplyCompany/queryCompanyInfo",method:"post",data:o})` |
| `T` | dictCode.1751615607545.js | shared | @/shared/dictCode.vue `default` | `c(v,[["render",S]])` |
| `De` | idCard.1751615607545.js | shared | @/shared/idCard.vue `default` | `u(h,[["render",I]])` |
| `M` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `He` | index.1751615607545.js | entry | @/legacy `useTagsStore` | `d0("tags",{state:()=>({list:[]}),getters:{show:t=>t.list.length>0,nameList:t=>t.list.map(e=>e.name)},actions:{delTagsItem(t){this.list.splice(t,1)},setTagsItem(t){this.list.push(t)},clearTags(){this.l` |
| `v` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `ze` | index.1751615607545.js | api | @/legacy `getDictItemsByCode` | `t=>Ee.request({url:"/jeecg-system/sys/dict/getDictItemsByCode",method:"get",params:t})` |
| `Be` | index.1751615607545.js | entry | @/legacy/components/Notice.vue `default`（reserved） | `re({__name:"notice",props:{visible:{type:Boolean,default:!1},newsType:{type:String,default:""}},emits:["okClick","cancelClick"],setup(t,{emit:e}){const n=t,r=Et({info:"",title:""}),a=()=>{e("okClick")` |
| `Y` | index.1751615607545.js | entry | ant-design-vue `Upload` | `Ft(xs,{Dragger:Ts,LIST_IGNORE:Bl,install:function(e){return e.component(xs.name,xs),e.component(Ts.name,Ts),e}})` |
| `Oe` | index.1751615607545.js | entry | dayjs `default` | `Oa(Trt)` |
| `E` | index.1751615607545.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `S` | index.1751615607545.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `J` | index.1751615607545.js | entry | @/legacy `formatDateSlash` | `t=>{var e=t.getFullYear(),n=t.getMonth()+1,r=t.getDate();return t.getHours(),t.getMinutes(),t.getSeconds(),e+"/"+n+"/"+r}` |
| `Ze` | index.1751615607545.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:xt(Cdt(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,n){va` |
| `Ge` | index.1751615607545.js | entry | @/legacy `UPLOAD_URL` | `SX.upload` |
| `Je` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
