# 导入提示：shared.portal.InterviewInvitation

原 chunk `InterviewInvitation.1783320636200.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `k` | index.1783320636200.js | entry | @/legacy `userStorage` | `{keys:!0,setUser(e){this.keys?localStorage.setItem(jn.USER_INFO,e):localStorage.setItem(jn.USER_INFO,JSON.stringify(e))},getUser(){const e=localStorage.getItem(jn.USER_INFO);if(e&&e!="undefined"&&e!="` |
| `R` | index.1783320636200.js | entry | @/legacy `getDictItemsByCode` | `e=>IN("/jeecg-system/sys/dict/getDictItemsByCode",e,"get")` |
| `r` | index.1783320636200.js | entry | dayjs `default` | `Rk(Owe)` |
| `A` | index.1783320636200.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略；它只是给组件挂 `__scopeId`） | `(e,t)=>{const n=e.__vccOpts\|\|e;for(const[r,a]of t)n[r]=a;return n}` |
| `X` | index.api.17833206362007.js | api | @/api/jobInterviewInvitation `interviewTemplate`（reserved） | `e=>t.request({url:"/xf-job/job/xfJobInterviewInvitation/interviewTemplate",method:"get",params:e})` |
| `Z` | index.api.17833206362007.js | api | @/api/jobInterviewInvitation `getInterviewPosition`（reserved） | `e=>t.request({url:"/xf-job/job/xfJobInterviewInvitation/getInterviewPosition",method:"post",params:e})` |
| `$` | index.api.17833206362007.js | api | @/api/jobInterviewInvitation `interviewInvitation`（reserved） | `e=>t.request({url:"/xf-job/job/xfJobInterviewInvitation/interviewInvitation",method:"post",data:e})` |
| `J` | message.1783320636200.js | shared | @/shared/message.ts `s`（reserved） | `function(a){let s=5;const t=m.success({title:"\u63D0\u4EA4\u6210\u529F",content:a}),n=setInterval(()=>{s-=1,t.update({content:a})},1e3);setTimeout(()=>{clearInterval(n),t.destroy()},s*1e3)}` |
