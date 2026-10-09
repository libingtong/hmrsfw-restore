// Readable equivalents of the user-center entry-chunk exports used by the sample pages (see out/shim-map.usercenter.md).
import { Modal, message, notification } from "ant-design-vue";
import dayjs from "dayjs";
import { request, API_BASE, STATIC_BASE } from "@/utils/request";
import { decryptStorage, getToken, getXfSysUserId, getUserById } from "@/legacy/storage";
export { request, API_BASE, STATIC_BASE, decryptStorage, getToken, getXfSysUserId, getUserById, Modal, message, notification, dayjs };

/** `_` : Vite's _export_sfc helper (not needed in SFCs) */
export const _export_sfc = (sfc: any, props: [string, unknown][]) => { const target = sfc.__vccOpts || sfc; for (const [k, v] of props) target[k] = v; return target; };

/** `m` (ks) : ant-design-vue message; `M` : Modal; `p` : dayjs/moment-style date lib (`_(x).format("YYYY-MM")`) */
export const antMessage = message;

/** `I` : date -> "YYYY/M/D" */
export const formatDateSlash = (t: Date) => `${t.getFullYear()}/${t.getMonth() + 1}/${t.getDate()}`;

/** `b4` : current "YYYY-MM" */
export const CURRENT_YEAR_MONTH = (() => { const d = new Date(); const m = d.getMonth() + 1; return `${d.getFullYear()}-${m > 9 ? m : "0" + m}`; })();

/** `y` : upload endpoint (SX.upload) */
export const UPLOAD_URL = "/xf-api/jeecg-system/sys/common/upload";

/** `c` : business setting codes enum (原包 Xo，完整 43 项) */
export const SettingCodes = { WEBPORTAL_DOMAIN: "webportal_domain", USER_CENTE_RDEFAULT_NAME: "userCenterDefaultName", IS_SHOW_CHANGEPWD: "is_show_changepwd", JOB_FAIR_PASSED_IZ_EDIT_POSITION: "job_fair_passed_iz_edit_position", IZ_SHOW_BOOTHNUM_CORPCENTER: "iz_show_boothNum_corpCenter", CORP_SUCCESS_INFO: "corp_success_info", SYS_VIDEO_SIZE: "sys_video_size", SYS_IMG_SIZE: "sys_img_size", CORP_REALITY_IMG: "corp_reality_img", IZ_COMPANY_BUSINESS: "iz_company_business", IZ_IZ_SHOW_SELFIMAGE: "iz_iz_show_selfImage", COMPANY_ADMIN_NUM: "company_admin_num", FAIRLIST_ROUTE: "fairlist_route", FAIRS_OUT_INFO: "fairs_out_info", FAIR_SUCCESS_INFO: "fair_success_info", FAIR_SUCCESS_INFO_SCENE: "fair_success_info_scene", RECOMMEND_JOB_MIN_SALARY_LEVEL: "recommend_job_min_salary_level", WATERMARK: "watermark", IS_SHOW_WXYY: "is_show_wxyy", ADD_VITAE_NUM: "add_vitae_num", PERSONNAL_PHOTO_NUM: "personnal_photo_num", PERSONNAL_VIDEO_NUM: "personnal_video_num", LIVE_SUCCESS_INFO: "live_success_info", IZ_SHOW_CAPTCHA: "iz_show_captcha", POSITION_ADD_INTERVAL_TIME: "position_add_interval_time", WORK_SUCCESS_INFO: "work_success_info", POST_DETAIL_COMPETITIVENESS: "post_detail_competitiveness", USER_AUTHENTICATION_TIP: "user_authentication_tip", AUTH_MENU_JYBF: "auth_menu_jybf", EXTRACT_POSITION_BTN_NAME: "extract_position_btn_name", ADD_MANAGER: "add_manager", UPDATE_MANAGER: "update_manager", PROXY_IMG_TEMPLATE: "proxy_img_template", FAIR_GUIDE: "fair_guide", FAIR_GUIDE_CONTENT: "fair_guide_content", APP_BOOTH_QRCODE_URL: "app_booth_QRCode_url", IZ_HIGH_FAIR_ZONE: "iz_high_fair_zone", ZZGJ_USERCENTER_AUTH: "zzgj_usercenter_auth", GX_AUTH_INFO: "gx_auth_info", IZ_HAS_CORP_EDIT_TAG: "iz_has_corp_edit_tag", GAODE_MAP_KEY_SECRET: "gaode_map_key_secret", CORP_ABROAD_TIP: "corp_abroad_tip", IZ_HAS_OUTFAIR_PUBLICPHONE: "iz_has_outFair_publicPhone" } as const;

/** `v` `k` `z` `ax` : api functions living in the entry chunk */
export const getSettingValueByCode = (params: unknown) => request({ url: "/xf-job/communal/xfSysBusinessSetting/getSettingValueByCode", method: "get", params });
export const getDictItemsByCode = (params: unknown) => request({ url: "/jeecg-system/sys/dict/getDictItemsByCode", method: "get", params });
export const getDictValueByCodes = (params: unknown) => request({ url: "/xf-job/school/user/getDictValueByCodes", method: "post", params });
export const getMultiDictListByType = (data: { dictTypeCode?: string }) => {
  const url = data.dictTypeCode == "ACA111_C" ? "/xf-job/communal/xfSysMultiDict/getDictListByType?dictTypeCode=AAB022_C" : "/xf-job/communal/xfSysMultiDict/getDictListByType?dictTypeCode=ACA111_C";
  return request({ url, method: "post", data });
};
const checkSensitiveWord = (data: unknown) => request({ url: "/xf-job/extend/checkSensitiveWord", method: "post", data });

/** `ad` : sensitive-word check; resolves true when the text must be changed */
export const checkSensitive = async ({ value }: { value: string }) => {
  const n: any = await checkSensitiveWord({ words: value, findModule: 100 });
  if (n.success && n.result.izSensitiveWords == true) {
    Modal.info({ title: "温馨提示", content: `您输入的内容涉及敏感信息：${n.result.sensitiveWords}，请修改后再操作。`, maskClosable: true, okText: "关闭" });
    return true;
  }
  return false;
};

/** `ay` : flat list -> tree by parentId */
export const listToTree = <T extends { id: string; parentId?: string; children?: T[] }>(list: T[]) => {
  const roots: T[] = [], byId: Record<string, T> = {};
  list.forEach((n) => { n.children = []; byId[n.id] = n; });
  list.forEach((n) => { const p = n.parentId ? byId[n.parentId] : undefined; if (p) p.children!.push(n); else roots.push(n); });
  return roots;
};

/** `x` : join area names (work / belong / ...) with "/" */
export const joinAreaNames = (t: any, kind: string) => {
  let n = "";
  const join = (names: string[]) => names.filter(Boolean).join("/");
  if (kind == "workProviceName") n = join([t.workProviceId && t.workProviceName, t.workCityId && t.workCityName, t.workAreaId && t.workAreaName, t.workTownsId && t.workTownsName, t.workVillageId && t.workVillageName]);
  else if (kind == "belongProviceName" || kind == "belongProvinceName") n = join([t.belongProviceId && t.belongProviceName, t.belongProvinceId && t.belongProvinceName, t.belongCityId && t.belongCityName, t.belongAreaId && t.belongAreaName]);
  else n = join([t.proviceName, t.cityName, t.areaName]);
  return n;
};

/** `a` : pinia "tags" store (user-center tabs) */
import { defineStore } from "pinia";
export const useTagsStore = defineStore("tags", {
  state: () => ({ list: [] as { name: string; path: string }[] }),
  getters: { show: (s) => s.list.length > 0, nameList: (s) => s.list.map((e) => e.name) },
  actions: {
    delTagsItem(i: number) { this.list.splice(i, 1); },
    setTagsItem(t: { name: string; path: string }) { this.list.push(t); },
    clearTags() { this.list = []; },
    closeTagsOther(list: { name: string; path: string }[]) { this.list = list; },
  },
});

/** wxyy.hook chunk: `_` robot image, `g` askWenXin(text) */
export const ROBOT_IMG = "/assets/j_robot.1751615607545.png";
export const askWenXin = (text: string) => {
  text = text.replace(/[\r\n]/g, "");
  const form = new FormData();
  form.append("content", text);
  return request({ url: "/xf-common/common/wenXin/singleWheel", method: "post", data: form }).then((t: any) => { if (!t.success) message.warning(t.message); return t; });
};

// ---- 入口导出补齐（见 out/shim-map.usercenter.md）----
/** `U` Upload、`P` PlusOutlined、`b` useStore：直接用 npm 包 */
export { Upload } from "ant-design-vue";
export { PlusOutlined } from "@ant-design/icons-vue";
export { useStore } from "vuex";
export { store } from "@/legacy/store";
export { decryptText, encryptObject } from "@/legacy/storage";
export { userStorage, localJson } from "@/legacy/userStorage";
export * from "@/legacy/api";
export { checkFileType, validatePassword, downloadFile, getExtractPositionConfig, confirmExtract, commonjsGlobal, getDefaultExportFromCjs } from "@/legacy/helpers";

/** `an` : de-duplicate dictionary options by `value` (keeps the first occurrence), as in the original entry */
export const uniqueByValue = <T extends { value: unknown }>(list: T[]): T[] => { const seen = new Map(); return list.filter((n) => !seen.has(n.value) && seen.set(n.value, n.value)); };

/** `o` : age / sex digit / birth date from an 18- or 15-digit ID number (port of the original helper; sex is the raw digit) */
export const parseIdCard = (t: string) => {
  let sex: string | null = null, birth: string | null = null; const now = new Date(); const m = now.getMonth() + 1, d = now.getDate(); let age = 0;
  if (t.length === 18) { age = now.getFullYear() - Number(t.substring(6, 10)) - 1; sex = t.substring(16, 17); birth = t.substring(6, 10) + "-" + t.substring(10, 12) + "-" + t.substring(12, 14); if ((t.substring(10, 12) as unknown as number) < m || (false && (t.substring(12, 14) as unknown as number) <= d)) age++; }
  if (t.length === 15) { age = now.getFullYear() - Number(t.substring(6, 8)) - 1901; sex = t.substring(13, 14); birth = "19" + t.substring(6, 8) + "-" + t.substring(8, 10) + "-" + t.substring(10, 12); if ((t.substring(8, 10) as unknown as number) < m || (false && (t.substring(10, 12) as unknown as number) <= d)) age++; }
  // original: e % 2 === 0 ? "0" : "1"; the month-equality checks use === between a string and a number, so they are always false (kept)
  const sexCode = Number(sex) % 2 === 0 ? "0" : "1";
  return { age, sex: sexCode, birth };
};
/** `a9` */ export const detailById = (params: unknown) => request({ url: "/xf-job/job/xfJobCompanyPosition/detailById", method: "get", params });
/** `aw` (the original URL has no /xf-job prefix) */ export const historyUsePositionList = (data: unknown) => request({ url: "/job/xfJobCompanyPosition/historyUsePositionList", method: "post", data });
/** `S` */ export const getDictListByType = (params: unknown) => request({ url: "/xf-job/communal/xfSysMultiDict/getDictListByType", method: "post", params });
