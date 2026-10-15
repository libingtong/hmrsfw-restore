# 导入提示：shared.uc.setStatus

原 chunk `setStatus.vue_vue_type_style_index_0_scoped_ed0660df_lang.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `R` | phone.1751615607545.js | shared | @/shared/phone.vue `default` | `u(d,[["render",m]])` |
| `H` | index.1751615607545.js | entry | @/legacy `useTagsStore` | `d0("tags",{state:()=>({list:[]}),getters:{show:t=>t.list.length>0,nameList:t=>t.list.map(e=>e.name)},actions:{delTagsItem(t){this.list.splice(t,1)},setTagsItem(t){this.list.push(t)},clearTags(){this.l` |
| `L` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `V` | index.1751615607545.js | api | @/legacy `getDictItemsByCode` | `t=>Ee.request({url:"/jeecg-system/sys/dict/getDictItemsByCode",method:"get",params:t})` |
| `f` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `$` | index.1751615607545.js | api | @/legacy/api `getSysUserByPhone` | `t=>Ee.request({url:"/xf-job/communal/xfSysUser/getSysUserByPhone",method:"get",params:t})` |
| `j` | index.1751615607545.js | api | @/legacy/api `addUserForCompany` | `t=>Ee.request({url:"/xf-job/job/xfJobUserCompany/addUserForCompany",method:"post",data:t})` |
| `E` | index.1751615607545.js | api | @/legacy/api `changeUserForCompany` | `t=>Ee.request({url:"/xf-job/job/xfJobUserCompany/changeUserForCompany",method:"post",data:t})` |
| `z` | index.1751615607545.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:xt(Cdt(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,n){va` |
| `A` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
