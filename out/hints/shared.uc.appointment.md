# 导入提示：shared.uc.appointment

原 chunk `appointment.1751615607545.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `Y` | index.1751615607545.js | entry | ant-design-vue `message` | `ks` |
| `R` | index.1751615607545.js | entry | ant-design-vue `Modal` | `re({compatConfig:{MODE:3},name:"AModal",inheritAttrs:!1,props:xt(Cdt(),{width:520,transitionName:"zoom",maskTransitionName:"fade",confirmLoading:!1,visible:!1,okType:"primary"}),setup:function(e,n){va` |
| `M` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
| `F` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `X` | index.1751615607545.js | entry | @/utils/request `API_BASE` | `"/xf-api"` |
| `G` | index.1751615607545.js | entry | @/utils/request `STATIC_BASE` | `"/jeecg-system/sys/common/static"` |
| `Ce` | index.1751615607545.js | entry | @/legacy/utils `isMobilePhone` | `t=>{var e=/^(13[0-9]\|14[01456879]\|15[0-35-9]\|16[2567]\|17[0-8]\|18[0-9]\|19[0-35-9])\d{8}$/;return!!e.test(t)}` |
| `we` | index.1751615607545.js | entry | @/legacy `formatDateSlash` | `t=>{var e=t.getFullYear(),n=t.getMonth()+1,r=t.getDate();return t.getHours(),t.getMinutes(),t.getSeconds(),e+"/"+n+"/"+r}` |
| `Te` | index.1751615607545.js | entry | @/legacy `UPLOAD_URL` | `SX.upload` |
| `$e` | index.api.175161560754517.js | api | @/api/collegeCareerTalk `queryListInfoByCareerTalkId` | `e=>t.request({url:"/xf-college/careerTalkStudent/xfCollegeCareerTalkStudent/queryListInfoByCareerTalkId",method:"get",params:e})` |
| `Pe` | index.api.175161560754517.js | api | @/api/collegeCareerTalk `queryAttendanceListByCareerTalkId` | `e=>t.request({url:"/xf-college/careerTalkStudent/xfCollegeCareerTalkStudent/queryAttendanceListByCareerTalkId",method:"get",params:e})` |
| `De` | index.api.175161560754517.js | api | @/api/collegeCareerTalk `queryTalkDetailById` | `e=>t.request({url:"/xf-college/careerTalk/xfCollegeCareerTalk/queryTalkDetailById",method:"post",params:e})` |
| `Oe` | index.api.175161560754517.js | api | @/api/collegeCareerTalk `listPositionForCareerTalk` | `e=>t.request({url:"/xf-college/careerTalkPosition/xfCollegeCareerTalkPosition/listPositionForCareerTalk",method:"post",data:e})` |
| `je` | index.api.175161560754517.js | api | @/api/collegeCareerTalk `listNew` | `e=>t.request({url:"/xf-job/job/xfJobCompanyPosition/listNew",method:"get",params:e})` |
| `Be` | index.api.175161560754517.js | api | @/api/collegeCareerTalk `listByRoomParentOrganizationId` | `e=>t.request({url:"/xf-college/campus/xfCollegeCampus/listByRoomParentOrganizationId",method:"post",data:e})` |
| `ze` | index.api.175161560754517.js | api | @/api/collegeCareerTalk `addCompany` | `e=>t.request({url:"/xf-college/careerTalk/xfCollegeCareerTalk/addCompany",method:"post",data:e})` |
| `Re` | index.api.175161560754517.js | api | @/api/collegeCareerTalk `roomAndTimeList` | `e=>t.request({url:"/xf-college/careerRoom/xfCollegeCareerRoom/roomAndTimeList",method:"post",data:e})` |
| `Ue` | index.api.175161560754517.js | api | @/api/collegeCareerTalk `queryGroupByCtbDate` | `e=>t.request({url:"/xf-college/careerTimeBucket/xfCollegeCareerTimeBucket/queryGroupByCtbDate",method:"post",params:e})` |
| `Me` | Editor.1751615607545.js | shared | @/shared/Editor.vue `default`（reserved） | `IU(iW,[["__scopeId","data-v-4313aa41"]])` |
