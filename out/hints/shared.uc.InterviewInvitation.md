# 导入提示：shared.uc.InterviewInvitation

原 chunk `InterviewInvitation.17516156075452.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `k` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `U` | index.1751615607545.js | api | @/legacy/api `interviewTemplate` | `t=>Ee.request({url:"/xf-job/job/xfJobInterviewInvitation/interviewTemplate",method:"get",params:t})` |
| `N` | index.1751615607545.js | api | @/legacy `getDictItemsByCode` | `t=>Ee.request({url:"/jeecg-system/sys/dict/getDictItemsByCode",method:"get",params:t})` |
| `R` | index.1751615607545.js | api | @/legacy/api `getInterviewPosition` | `t=>Ee.request({url:"/xf-job/job/xfJobInterviewInvitation/getInterviewPosition",method:"post",params:t})` |
| `u` | index.1751615607545.js | entry | dayjs `default` | `Oa(Trt)` |
| `q` | index.1751615607545.js | api | @/legacy/api `interviewInvitationByFair` | `t=>Ee.request({url:"/xf-job/job/xfJobInterviewInvitation/interviewInvitationByFair",method:"post",data:t})` |
| `P` | index.1751615607545.js | api | @/legacy/api `interviewInvitation` | `t=>Ee.request({url:"/xf-job/job/xfJobInterviewInvitation/interviewInvitation",method:"post",data:t})` |
| `O` | index.1751615607545.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:xt(Cdt(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,n){va` |
| `E` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `D` | message.1751615607545.js | shared | @/shared/message.ts `successCountdown` | `function c(e){let o=5;const t=n.success({title:"提交成功",content:e}),s=setInterval(()=>{o-=1,t.update({content:e})},1e3);setTimeout(()=>{clearInterval(s),t.destroy()},o*1e3)}` |
