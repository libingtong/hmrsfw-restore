// 由 index.api.17833206362008.js 还原（脚本生成）。request 的用法与原包一致：request({ url, method, params | data })。
import { request } from "@/utils/request";

/** 原压缩名 b，导出名 q */
export const queryById = (e) => request({url:"/xf-job/school/licenseFree/XfSysArticle/queryById",method:"get",params:e});
/** 原压缩名 f，导出名 u */
export const updateScanTimes = (e) => request({url:"/xf-job/school/licenseFree/updateScanTimes",method:"post",params:e});
/** 原压缩名 n，导出名 g */
export const getArticleList = (e) => request({url:"/xf-job/job/licenseFree/getArticleList",method:"get",params:e});
/** 原压缩名 c，导出名 b */
export const getChildArticleTypeList = (e) => request({url:"/xf-job/job/licenseFree/getChildArticleTypeList",method:"post",params:e});
/** 原压缩名 u，导出名 a */
export const getHotArticleList = (e) => request({url:"/xf-job/job/licenseFree/getHotArticleList",method:"get",params:e});
/** 原压缩名 p，导出名 e */
export const updateViewTimes = (e) => request({url:"/xf-job/job/licenseFree/updateViewTimes",method:"post",data:e});
/** 原压缩名 m，导出名 c */
export const positionList = (e) => request({url:"/xf-job/communal/xfSysArticlePosition/positionList",method:"get",params:e});
/** 原压缩名 h，导出名 p */
export const deliver = (e) => request({url:"/xf-job/communal/xfSysArticlePositionDeliver/deliver",method:"post",data:e});
/** 原压缩名 d，导出名 d */
export const queryByIdDeliver = (e) => request({url:"/xf-job/school/licenseFree/xfSysArticle/queryByIdDeliver",method:"get",params:e});
