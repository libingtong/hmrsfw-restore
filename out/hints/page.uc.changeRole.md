# 导入提示：page.uc.changeRole

原 chunk `ChangeRole.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `Z` | index.1751615607545.js | entry | vuex `useStore` | `function xc(t){return t===void 0&&(t=null),Ot(t!==null?t:TR)}` |
| `$` | index.1751615607545.js | entry | @/legacy/store `useCommonStore`（reserved） | `d0("common",{state:()=>({isShowAuthJYBF:!0}),getters:{getIsShowAuthJYBF:t=>t.isShowAuthJYBF},actions:{queryIsShowAuthJYBF(){return Wn(this,null,function*(){yield wX({code:Xo.AUTH_MENU_JYBF}).then(t=>{` |
| `H` | index.1751615607545.js | entry | @/legacy `useTagsStore` | `d0("tags",{state:()=>({list:[]}),getters:{show:t=>t.list.length>0,nameList:t=>t.list.map(e=>e.name)},actions:{delTagsItem(t){this.list.splice(t,1)},setTagsItem(t){this.list.push(t)},clearTags(){this.l` |
| `w` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `Q` | index.1751615607545.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:xt(Cdt(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,n){va` |
| `T` | index.1751615607545.js | api | @/legacy `getCompanyInfo` | `t=>Ee.request({url:"/xf-job/job/xfJobCompany/getCompanyInfo",method:"get",params:t})` |
| `b` | index.1751615607545.js | entry | @/legacy/utils `setLocalStorage`（reserved） | `(t,e)=>{localStorage.setItem(t,e)}` |
| `W` | index.1751615607545.js | api | @/legacy/api `getUserPermissionByRoleId`（reserved） | `t=>Ee.request({url:"/xf-job/communal/xfpermission/getUserPermissionByRoleId",method:"get",params:t})` |
| `ee` | index.1751615607545.js | api | @/legacy/api `queryByCompanyId`（reserved） | `t=>Ee.request({url:"/xf-job/communal/xfSysUserAuthenticateIdentityItem/queryByCompanyId",method:"post",params:t})` |
| `te` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
