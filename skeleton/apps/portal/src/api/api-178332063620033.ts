// 由 index.api.178332063620033.js 还原（脚本生成）。request 的用法与原包一致：request({ url, method, params | data })。
import { request } from "@/utils/request";

/** 原压缩名 u，导出名 a */
export const freeCompanyPositionDetail = (e) => request({url:"/xf-job/job/licenseFree/freeCompanyPositionDetail",method:"post",params:e});
/** 原压缩名 l，导出名 c */
export const getMatchingDegree = (e) => request({url:"/xf-job/job/xfJobCompanyPosition/getMatchingDegree",method:"post",data:e});
/** 原压缩名 b，导出名 b */
export const viewVoByIdFromPerson = (e) => request({url:"/xf-job/job/xfJobCurriculumVitae/viewVoByIdFromPerson",method:"get",params:e});
/** 原压缩名 n，导出名 d */
export const viewVoByIdFromCompany = (e) => request({url:"/xf-job/job/xfJobCurriculumVitae/viewVoByIdFromCompany",method:"get",params:e});
/** 原压缩名 f，导出名 f */
export const recommendJobList = (e) => request({url:"/xf-job/job/licenseFree/xfJobCompanyPosition/recommendJobList",method:"post",params:e});
/** 原压缩名 d，导出名 g */
export const queryForCompetitiveAnalysis = (e) => request({url:"/xf-job/job/xfJobCurriculumVitae/queryForCompetitiveAnalysis",method:"get",params:e});
/** 原压缩名 p，导出名 e */
export const addTalent = (e) => request({url:"/xf-job/job/xfJobCompanyTalents/addTalent",method:"post",data:e});
/** 原压缩名 j，导出名 i */
export const isPublishingPosition = (e) => request({url:"/xf-job/job/xfJobCompany/isPublishingPosition",method:"get",params:e});
