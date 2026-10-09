// 由 index.1783320636200117.js 还原（脚本生成）。request 的用法与原包一致：request({ url, method, params | data })。
import { request } from "@/utils/request";

/** 原压缩名 s */
export const queryCompanyInfo = (e) => request({url:"/xf-job/job/xfJobCompany/queryCompanyInfo",method:"post",params:e});
/** 原压缩名 a */
export const izAlreadySubmitCompany = (e) => request({url:"/job/xfJobCompany/izAlreadySubmitCompany",method:"post",params:e});
/** 原压缩名 t */
export const getCompanyInfo = (e) => request({url:"/job/xfJobCompany/getCompanyInfo",method:"get",params:e});
/** 原压缩名 u */
export const getRecommendTalentList = (e) => request({url:"/xf-job/job/xfJobCompany/getRecommendTalentList",method:"post",params:e});
/** 原压缩名 m */
export const submitNewGuideCompanyInfo = (e) => request({url:"/xf-job/job/xfJobCompany/submitNewGuideCompanyInfo",method:"post",data:e});
/** 原压缩名 l */
export const verifyCompanyInfo = (e) => request({url:"/xf-job/job/xfJobCompany/verifyCompanyInfo",method:"post",data:e});
/** 原压缩名 I，导出名 k */
export const listForWebsite = (e) => request({url:"/xf-job/job/licenseFree/xfJobPxCourse/listForWebsite",method:"get",params:e});
/** 原压缩名 S，导出名 j */
export const hotListForWebsite = (e) => request({url:"/xf-job/job/licenseFree/xfJobPxCourse/hotListForWebsite",method:"get",params:e});
/** 原压缩名 G，导出名 x */
export const list = (e) => request({url:"/xf-job/communal/xfSysGuide/list",method:"get",params:e});
/** 原压缩名 g，导出名 h */
export const getCompleteStatus = (e) => request({url:"/xf-job/communal/xfSysGuideRecord/getCompleteStatus",method:"post",params:e});
/** 原压缩名 y，导出名 b */
export const setCompleteStatus = (e) => request({url:"/xf-job/communal/xfSysGuideRecord/setCompleteStatus",method:"post",params:e});
/** 原压缩名 j，导出名 c */
export const checkIdCard = (e) => request({url:"/xf-job/communal/xfSysUser/checkIdCard",method:"post",data:e});
/** 原压缩名 F，导出名 s */
export const saveForUserCenter = (e) => request({url:"/xf-job/communal/xfSysUser/saveForUserCenter",method:"post",data:e});
/** 原压缩名 v，导出名 q */
export const queryById = (e) => request({url:"/xf-job/communal/xfSysUser/queryById",method:"get",params:e});
/** 原压缩名 c，导出名 d */
export const save = (e) => request({url:"/xf-job/job/xfJobCurriculumVitae/save",method:"post",data:e});
/** 原压缩名 C，导出名 f */
export const addBatch = (e) => request({url:"/xf-job/job/xfJobCurriculumVitaeDeliver/addBatch",method:"post",data:e});
/** 原压缩名 P，导出名 v */
export const list2 = (e) => request({url:"/xf-job/job/xfJobCurriculumVitae/list",method:"get",params:e});
/** 原压缩名 J，导出名 i */
export const isPublishingPosition = (e) => request({url:"/xf-job/job/xfJobCompany/isPublishingPosition",method:"get",params:e});
/** 原压缩名 T，导出名 r */
export const cancelTalent = (e) => request({url:"/xf-job/job/xfJobCompanyTalents/cancelTalent",method:"post",params:e});
/** 原压缩名 i，导出名 a */
export const addTalent = (e) => request({url:"/xf-job/job/xfJobCompanyTalents/addTalent",method:"post",data:e});
/** 原压缩名 h，导出名 e */
export const beJobSeeker = (e) => request({url:"/xf-job/communal/xfSysUserAuthenticateIdentity/beJobSeeker",method:"post",data:e});
/** 原压缩名 q，导出名 g */
export const getQrcodeImgByObjectId = (e) => request({url:"xf-job/job/licenseFree/getQrcodeImgByObjectId",method:"post",params:e});
