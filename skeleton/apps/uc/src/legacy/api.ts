// 入口包里直接定义的接口函数（原包用 `Ee.request`，Ee 即入口导出 `w`）。函数按 url 末段命名。
import { request } from "@/utils/request";
import type { AxiosRequestConfig } from "axios";

/** `w`（原局部名 Ee）：入口的请求实例，页面/接口模块用 `w.request({...})`。这里统一转给 `@/utils/request`。 */
export const http = { request: <T = unknown>(config: AxiosRequestConfig) => request<T>(config) };

/** `A` */ export const queryAreaChildrenTreeListById = (params: unknown) => request({ url: "/xf-job/job/licenseFree/queryAreaChildrenTreeListById", method: "post", params });
/** `E` */ export const queryFormSettingByCode = (params: unknown) => request({ url: "/xf-job/job/xfJobFormSetting/queryByCode", method: "post", params });
/** `F` */ export const izAlreadySubmitCompany = (params: unknown) => request({ url: "/xf-job/job/xfJobCompany/izAlreadySubmitCompany", method: "post", params });
/** `G` */ export const getDictValueByCodeAndItems = (params: unknown) => request({ url: "/xf-job/job/licenseFree/getDictValueByCodeAndItems", method: "post", params });
/** `H` */ export const companyInfoVerifyForZZJC = (params: unknown) => request({ url: "/xf-job/job/xfJobCompany/companyInfoVerifyForZZJC", method: "post", params });
/** `O` */ export const getAreaInfoByAreaId = (params: unknown) => request({ url: "/xf-job/communal/licenseFree/xfSysAreainfo/getInfoByAreaId", method: "get", params });
/** `Q`（url 原文拼写为 sumbit） */ export const sumbitVerifyInfo = (data: unknown) => request({ url: "/xf-job/job/xfJobCompany/sumbitVerifyInfo", method: "post", data });
/** `R` */ export const queryCompanyInfo = (params: unknown) => request({ url: "/xf-job/job/xfJobCompany/queryCompanyInfo", method: "post", params });
/** `e` */ export const getCompanyInfo = (params: unknown) => request({ url: "/xf-job/job/xfJobCompany/getCompanyInfo", method: "get", params });
/** `g` */ export const getSettingValueByCodes = (params: unknown) => request({ url: "/xf-job/job/licenseFree/xfSysBusinessSetting/getSettingValueByCodes", method: "get", params });
/** `bM`（url 原文含双斜杠） */ export const verifyUserInfoByPhone = (params: unknown) => request({ url: "/xf-job//communal/licenseFree/verifyUserInfoByPhone", method: "get", params });
/** `bc` */ export const pxRegistList = (params: unknown) => request({ url: "/xf-job/job/xfJobGovRecruitRegistration/pxRegistList", method: "get", params });
/** `bd` */ export const ticketToHtml = (data: { noticeId: string; registrationId: string; [k: string]: unknown }) =>
  request({ url: "/xf-job/job/xfJobGovRecruitNotice/ticketToHtml?noticeId=" + data.noticeId + "&registrationId=" + data.registrationId, method: "post", data });
/** `be` */ export const alipayScanPay = (params: unknown) => request({ url: "/xf-job/communal/xfSysOrderPayRecord/alipay/scanPay", method: "get", params });
/** `bf` */ export const updateEnrollmentStatus = (data: unknown) => request({ url: "/xf-job/job/xfJobGovRecruitRegistration/updateEnrollmentStatus", method: "post", data });
/** `bx` */ export const queryCertificateList = (params: unknown) => request({ url: "/xf-job/communal/xfCloudClassroomCertificate/list", method: "get", params });
/** 原包 eht（`aa` 内部用） */ export const izHistoryUsePositionList = (data: unknown) => request({ url: "/xf-job/job/xfJobCompanyPosition/izHistoryUsePositionList", method: "post", data });
