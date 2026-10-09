// 由 index.api.175161560754511.js 还原（脚本生成）。request 的用法与原包一致：request({ url, method, params | data })。
import { request } from "@/utils/request";

/** 原压缩名 a，导出名 m */
export const myJobFairList = (o) => request({url:"/xf-job/job/xfJobFair/myJobFairList",method:"post",data:o});
/** 原压缩名 r，导出名 a */
export const myBoothList = (o) => request({url:"/xf-job/job/xfJobFair/myBoothList",method:"post",data:o});
/** 原压缩名 n，导出名 h */
export const addOrUpdate = (o) => request({url:"/xf-job/job/xfJobFairApplyUnsubscribe/addOrUpdate",method:"post",data:o});
/** 原压缩名 s，导出名 k */
export const fairParticipationToHtml = (o) => request({url:"/xf-job/job/xfJobFair/xfJobFairApplyInfo/fairParticipationToHtml?xfJobFairId="+o.xfJobFairId+"&applyInfoId="+o.applyInfoId,method:"post",data:o});
/** 原压缩名 p，导出名 i */
export const queryCompanyJobFairInfo = (o) => request({url:"/xf-job/job/xfJobCompany/queryCompanyJobFairInfo",method:"post",data:o});
/** 原压缩名 u，导出名 j */
export const queryCompanyDataReport = (o) => request({url:"/xf-job/job/xfJobCompany/queryCompanyDataReport",method:"post",data:o});
/** 原压缩名 m，导出名 c */
export const companyDataReport = (o) => request({url:"/xf-job/job/xfJobCompany/companyDataReport",method:"post",data:o});
/** 原压缩名 b，导出名 b */
export const queryCompanyIntentionResumeInfo = (o) => request({url:"/xf-job/job/xfJobCompany/queryCompanyIntentionResumeInfo",method:"post",data:o});
/** 原压缩名 y，导出名 e */
export const companyIntentionResumeUpload = (o) => request({url:"/xf-job/job/xfJobCompany/companyIntentionResumeUpload",method:"post",data:o});
/** 原压缩名 d，导出名 f */
export const queryCompanyFileDataInfo = (o) => request({url:"/xf-job/job/xfJobCompany/queryCompanyFileDataInfo",method:"post",data:o});
/** 原压缩名 i，导出名 g */
export const companyFileDataUpload = (o) => request({url:"/xf-job/job/xfJobCompany/companyFileDataUpload",method:"post",data:o});
/** 原压缩名 f，导出名 d */
export const queryCompanyPositionSelected = (o) => request({url:"/xf-job/job/licenseFree/queryCompanyPositionSelected",method:"post",params:o});
/** 原压缩名 l，导出名 q */
export const queryCompanyPersonInfoRegister = (o) => request({url:"/xf-job/job/licenseFree/queryCompanyPersonInfoRegister",method:"post",data:o});
