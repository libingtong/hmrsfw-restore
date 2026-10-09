// 由 index.api.17516156075456.js 还原（脚本生成）。request 的用法与原包一致：request({ url, method, params | data })。
import { request } from "@/utils/request";

/** 原压缩名 r，导出名 g */
export const queryRuleList = (e) => request({url:"/xf-job/job/xfJobIntegralRule/queryRuleList",method:"post",params:e});
/** 原压缩名 s，导出名 a */
export const queryDetailList = (e) => request({url:"/xf-job/job/xfJobIntegralDetailRecord/queryDetailList",method:"post",data:e});
/** 原压缩名 u，导出名 c */
export const statics = (e) => request({url:"/xf-job/job/xfJobCurriculumVitae/statics",method:"get",params:e});
/** 原压缩名 a，导出名 y */
export const queryVoById = (e) => request({url:"/xf-job/job/xfJobCurriculumVitae/queryVoById",method:"get",params:e});
/** 原压缩名 n，导出名 C */
export const save = (e) => request({url:"/xf-job/job/xfJobCurriculumVitae/save",method:"post",data:e});
/** 原压缩名 l，导出名 l */
export const list = (e) => request({url:"/xf-job/job/xfJobCurriculumVitae/list",method:"get",params:e});
/** 原压缩名 d，导出名 f */
export const listNoPage = (e) => request({url:"/xf-job/job/xfJobCurriculumVitae/listNoPage",method:"get",params:e});
/** 原压缩名 i，导出名 b */
export const getSettingValueByCode = (e) => request({url:"/xf-job/communal/xfSysBusinessSetting/getSettingValueByCode",method:"get",params:e});
/** 原压缩名 b，导出名 i */
export const getVitaeNumByXfSysUserId = (e) => request({url:"/xf-job/job/xfJobCurriculumVitae/getVitaeNumByXfSysUserId",method:"get",params:e});
/** 原压缩名 c，导出名 m */
export const queryIzCanCreatVitae = (e) => request({url:"/xf-job/job/xfJobCurriculumVitae/queryIzCanCreatVitae",method:"get",params:e});
/** 原压缩名 x，导出名 h */
export const saveCopy = (e) => request({url:"/xf-job/job/xfJobCurriculumVitae/saveCopy",method:"get",params:e});
/** 原压缩名 f，导出名 v */
export const deleteItem = (e) => request({url:"/xf-job/job/xfJobCurriculumVitae/delete",method:"delete",params:e});
/** 原压缩名 m，导出名 z */
export const list2 = (e) => request({url:"/xf-job/job/xfJobWorkExperience/list",method:"get",params:e});
/** 原压缩名 j，导出名 F */
export const add = (e) => request({url:"/xf-job/job/xfJobWorkExperience/add",method:"post",data:e});
/** 原压缩名 p，导出名 M */
export const queryById = (e) => request({url:"/xf-job/job/xfJobWorkExperience/queryById",method:"get",params:e});
/** 原压缩名 g，导出名 D */
export const deleteItem2 = (e) => request({url:"/xf-job/job/xfJobWorkExperience/delete",method:"delete",params:e});
/** 原压缩名 h，导出名 E */
export const edit = (e) => request({url:"/xf-job/job/xfJobWorkExperience/edit",method:"post",data:e});
/** 原压缩名 q，导出名 A */
export const list3 = (e) => request({url:"/xf-job/job/xfJobEducationalExperience/list",method:"get",params:e});
/** 原压缩名 y，导出名 I */
export const add2 = (e) => request({url:"/xf-job/job/xfJobEducationalExperience/add",method:"post",data:e});
/** 原压缩名 J，导出名 H */
export const edit2 = (e) => request({url:"/xf-job/job/xfJobEducationalExperience/edit",method:"post",data:e});
/** 原压缩名 C，导出名 N */
export const queryById2 = (e) => request({url:"/xf-job/job/xfJobEducationalExperience/queryById",method:"get",params:e});
/** 原压缩名 V，导出名 G */
export const deleteItem3 = (e) => request({url:"/xf-job/job/xfJobEducationalExperience/delete",method:"delete",params:e});
/** 原压缩名 E，导出名 B */
export const list4 = (e) => request({url:"/xf-job/job/xfJobCredentials/list",method:"get",params:e});
/** 原压缩名 w，导出名 L */
export const add3 = (e) => request({url:"/xf-job/job/xfJobCredentials/add",method:"post",data:e});
/** 原压缩名 I，导出名 K */
export const edit3 = (e) => request({url:"/xf-job/job/xfJobCredentials/edit",method:"post",data:e});
/** 原压缩名 B，导出名 O */
export const queryById3 = (e) => request({url:"/xf-job/job/xfJobCredentials/queryById",method:"get",params:e});
/** 原压缩名 P，导出名 J */
export const deleteItem4 = (e) => request({url:"/xf-job/job/xfJobCredentials/delete",method:"delete",params:e});
/** 原压缩名 T，导出名 o */
export const izPublic = (e) => request({url:"/xf-job/job/xfJobCurriculumVitae/izPublic",method:"get",params:e});
/** 原压缩名 v，导出名 r */
export const refresh = (e) => request({url:"/xf-job/job/xfJobCurriculumVitae/refresh",method:"get",params:e});
/** 原压缩名 S，导出名 q */
export const showElegant = (e) => request({url:"/xf-job/job/xfJobCurriculumVitae/showElegant",method:"get",params:e});
/** 原压缩名 L，导出名 s */
export const entrust = (e) => request({url:"/xf-job/job/xfJobCurriculumVitae/entrust",method:"get",params:e});
/** 原压缩名 R，导出名 j */
export const isRefreshed = (e) => request({url:"/xf-job/job/xfJobCurriculumVitae/isRefreshed",method:"get",params:e});
/** 原压缩名 U，导出名 k */
export const refreshByXfUserId = (e) => request({url:"/xf-job/job/xfJobCurriculumVitae/refreshByXfUserId",method:"get",params:e});
/** 原压缩名 k，导出名 d */
export const listNew = (e) => request({url:"/xf-job/job/xfJobInterviewInvitation/listNew",method:"get",params:e});
/** 原压缩名 W，导出名 p */
export const acceptOrRefuse = (e) => request({url:"/xf-job/job/xfJobInterviewInvitation/acceptOrRefuse",method:"get",params:e});
/** 原压缩名 D，导出名 e */
export const listWithSort = (e) => request({url:"/xf-job/job/xfJobCurriculumVitaeLookoverRecord/listWithSort",method:"get",params:e});
/** 原压缩名 N，导出名 u */
export const queryIzCanDeleteViares = (e) => request({url:"/xf-job/job/xfJobCurriculumVitae/queryIzCanDeleteViares",method:"get",params:e});
/** 原压缩名 z，导出名 w */
export const showDefault = (e) => request({url:"/xf-job/job/xfJobCurriculumVitae/showDefault",method:"get",params:e});
/** 原压缩名 A，导出名 x */
export const queryPositionIzOnly = (e) => request({url:"/xf-job/job/xfJobCurriculumVitae/queryPositionIzOnly",method:"get",params:e});
/** 原压缩名 O，导出名 n */
export const saveName = (e) => request({url:"/xf-job/job/xfJobCurriculumVitae/saveName",method:"get",params:e});
/** 原压缩名 X，导出名 U */
export const listForUserContent = (e) => request({url:"/xf-job/job/xfJobCurriculumVitaeDeliver/listForUserContent",method:"get",params:e});
/** 原压缩名 M，导出名 a0 */
export const companyList = (e) => request({url:"/xf-job/job/xfJobShieldList/companyList",method:"get",params:e});
/** 原压缩名 G，导出名 Z */
export const getCompany = (e) => request({url:"/xf-job/job/xfJobShieldList/getCompany",method:"get",params:e});
/** 原压缩名 H，导出名 $ */
export const add4 = (e) => request({url:"/xf-job/job/xfJobShieldList/add",method:"get",params:e});
/** 原压缩名 K，导出名 _ */
export const cancel = (e) => request({url:"/xf-job/job/xfJobShieldList/cancel",method:"get",params:e});
/** 原压缩名 Q，导出名 a9 */
export const viewVoByIdFromPerson = (e) => request({url:"/xf-job/job/xfJobCurriculumVitae/viewVoByIdFromPerson",method:"get",params:e});
/** 原压缩名 Y，导出名 a1 */
export const getPersonalFilelistForUser = (e) => request({url:"/xf-job/communal/xfSysAttachment/getPersonalFilelistForUser",method:"get",params:e});
/** 原压缩名 Z，导出名 a2 */
export const batchUploadFromUserCenter = (e) => request({url:"/xf-job/communal/xfSysAttachment/batchUploadFromUserCenter",method:"post",params:e});
/** 原压缩名 _，导出名 a3 */
export const deleteItem5 = (e) => request({url:"/xf-job/communal/xfSysAttachment/delete",method:"delete",params:e});
/** 原压缩名 $，导出名 a5 */
export const list5 = (e) => request({url:"/xf-job/job/xfJobSubscribeRecord/list",method:"get",params:e});
/** 原压缩名 ee，导出名 a8 */
export const add5 = (e) => request({url:"/xf-job/job/xfJobSubscribeRecord/add",method:"post",data:e});
/** 原压缩名 te，导出名 a4 */
export const isCanAdd = (e) => request({url:"/xf-job/job/xfJobSubscribeRecord/isCanAdd",method:"get",params:e});
/** 原压缩名 oe，导出名 a7 */
export const queryById4 = (e) => request({url:"/xf-job/job/xfJobSubscribeRecord/queryById",method:"get",params:e});
/** 原压缩名 re，导出名 a6 */
export const deleteItem6 = (e) => request({url:"/xf-job/job/xfJobSubscribeRecord/delete",method:"DELETE",params:e});
/** 原压缩名 ue，导出名 P */
export const vitaeTempListForUserContent = (e) => request({url:"/xf-job/job/xfJobVitaeTemplate/vitaeTempListForUserContent",method:"post",data:e,headers:{"Content-Type":"application/x-www-form-urlencoded"}});
/** 原压缩名 ae，导出名 Q */
export const saveVitaeTemplateId = (e) => request({url:"/xf-job/job/xfJobCurriculumVitae/saveVitaeTemplateId",method:"post",data:e,headers:{"Content-Type":"application/x-www-form-urlencoded"}});
/** 原压缩名 ne，导出名 R */
export const vitaeTempListByType = (e) => request({url:"/job/xfJobVitaeTemplate/vitaeTempListByType",method:"post",data:e,headers:{"Content-Type":"application/x-www-form-urlencoded"}});
/** 原压缩名 le，导出名 S */
export const listNewForPoster = (e) => request({url:"/xf-job/job/xfJobCompanyPosition/listNewForPoster",method:"post",data:e,headers:{"Content-Type":"application/x-www-form-urlencoded"}});
/** 原压缩名 de，导出名 T */
export const generatePoster4PC = (e) => request({url:"/xf-job/job/xfJobCompany/generatePoster4PC",method:"post",responseType:"blob",data:e});
/** 原压缩名 ie，导出名 V */
export const add6 = (e) => request({url:"/xf-job/job/xfJobUserCare/add",method:"get",params:e});
/** 原压缩名 be，导出名 X */
export const add7 = (e) => request({url:"/xf-job/job/xfJobComplaintRecord/add",method:"post",data:e});
/** 原压缩名 ce，导出名 W */
export const undoAllComplaintByType = (e) => request({url:"/xf-job/job/xfJobComplaintRecord/undoAllComplaintByType",method:"post",params:e});
/** 原压缩名 xe，导出名 Y */
export const listForUserContent2 = (e) => request({url:"/xf-alliance/alliance/curriculumVitaeDeliver/listForUserContent",method:"get",params:e});
