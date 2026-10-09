// 由 index.api.17516156075453.js 还原（脚本生成）。request 的用法与原包一致：request({ url, method, params | data })。
import { request } from "@/utils/request";

/** 原压缩名 r，导出名 p */
export const updatePassword = (e) => request({url:"/xf-job/extend/user/updatePassword",method:"put",data:e});
/** 原压缩名 n，导出名 b */
export const phoneVerification = (e) => request({url:"/jeecg-system/sys/user/phoneVerification",method:"post",data:e});
/** 原压缩名 a，导出名 a */
export const check = (e) => request({url:"/jeecg-system/sys/duplicate/check",method:"get",params:e});
/** 原压缩名 u，导出名 d */
export const changePhone = (e) => request({url:"/xf-job/communal/xfSysUser/changePhone",method:"post",data:e});
/** 原压缩名 c，导出名 e */
export const setXfSysUserPhoto = (e) => request({url:"/xf-job/communal/xfSysUser/setXfSysUserPhoto",method:"get",params:e});
/** 原压缩名 d，导出名 c */
export const changePwdWithSmsCode = (e) => request({url:"/xf-job/extend/user/changePwdWithSmsCode",method:"post",data:e});
/** 原压缩名 h，导出名 g */
export const userBindInfo = (e) => request({url:"/xf-job/communal/xfSysUserThirdAssociation/userBindInfo",method:"post",params:e});
/** 原压缩名 m，导出名 u */
export const deleteItem = (e) => request({url:"/xf-job/communal/xfSysUserThirdAssociation/delete",method:"post",params:e});
