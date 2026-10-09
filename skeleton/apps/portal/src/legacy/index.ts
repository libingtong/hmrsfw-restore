// Readable equivalents of the entry-chunk exports that the sample pages import from "./index.<ts>.js".
// See out/shim-map.portal.md for the alias -> name table. Behaviour is kept close to the original; click-time
// flows (login checks) are simplified where they only matter after user interaction.
import { Modal, message, notification } from "ant-design-vue";
import { DownOutlined } from "@ant-design/icons-vue";
import dayjs from "dayjs";
import { useStore as vuexUseStore } from "vuex";
import { Swiper, SwiperSlide } from "swiper/vue";
import SwiperCore from "swiper";
import { request, cachedRequest, API_BASE, STATIC_BASE } from "@/utils/request";
import { userStorage, jsonStorage, KEYS } from "@/legacy/storage";
import { store } from "@/store";
export { request, API_BASE, STATIC_BASE, userStorage, jsonStorage, KEYS, Modal, message, notification, dayjs, Swiper, SwiperSlide, SwiperCore };
export { default as LoginModal } from "@/legacy/LoginModal.vue";
export { default as VideoPlayer } from "@/legacy/VideoPlayer.vue";
export { default as SlideCaptcha } from "@/legacy/SlideCaptcha.vue";

/** `_` : Vite's _export_sfc helper (attach __scopeId etc.). Not needed in SFCs; kept for completeness. */
export const _export_sfc = (sfc: any, props: [string, unknown][]) => { const target = sfc.__vccOpts || sfc; for (const [k, v] of props) target[k] = v; return target; };

/** `c` : current tenant config (appCode 018 = 哈密) from config.js */
export const getAppConfig = () => {
  const raw = sessionStorage.getItem("appConfig") || document.getElementsByTagName("head")[0].getAttribute("data-config");
  return raw ? JSON.parse(raw) : null;
};

/** `u` : vuex useStore (inject("store")) */
export const useStore = () => (vuexUseStore() ?? store);

/** `h` : cached dictionary lookup `/jeecg-system/sys/dict/getDictItemsByCode` */
export const getDictItemsByCode = (params: unknown) => cachedRequest("/jeecg-system/sys/dict/getDictItemsByCode", params, "get");

/** `w` `K` `L` `ad` `am` `ap` `aD` `bW` `e` : api functions living in the entry chunk */
export const getSettingValueByCode = (params: unknown) => request({ url: "/xf-job/job/licenseFree/xfSysBusinessSetting/getSettingValueByCode", method: "get", params });
export const getSettingValueByCodes = (params: unknown) => request({ url: "/xf-job/job/licenseFree/xfSysBusinessSetting/getSettingValueByCodes", method: "get", params });
export const getDictListByType = (params: unknown) => request({ url: "/xf-job/communal/licenseFree/getDictListByType", method: "post", params });
// Entry export `bb`: same name in the old code base but a different endpoint (job service, used for corp industry lists).
export const getCorpIndustryListByType = (params: unknown) => request({ url: "/xf-job/job/licenseFree/getDictListByType", method: "post", params });
export const listChildrenTreeByTypeId = (params: unknown) => request({ url: "/xf-job/communal/licenseFree/xfSysArticleType/listChildrenTreeByTypeId", method: "post", params });
export const getArticleList = (params: unknown) => request({ url: "/xf-job/job/licenseFree/getArticleList", method: "get", params });
export const getArticleListByTypeIds = (params: unknown) => request({ url: "/xf-job/job/licenseFree/getArticleListByTypeIds", method: "post", params });
export const checkIzDishonesty = (data: unknown) => request({ url: "/xf-job/job/xfJobFairApplyInfo/checkIzDishonesty", method: "post", data });
export const listAuthenticateIdentity = (params: unknown) => request({ url: "/xf-job/communal/xfSysUserAuthenticateIdentity/list", method: "get", params });
export const getAreaInfo = (params: unknown) => request({ url: "/xf-job/communal/licenseFree/xfSysAreainfo/getInfo", method: "get", params });
const checkIzPerfect = (params: unknown) => request({ url: "/xf-job/communal/xfSysUser/checkIzPerfect", method: "get", params });
const queryIdentityByUserId = (params: unknown) => request({ url: "/xf-job/communal/xfSysUserAuthenticateIdentityItem/queryByUserId", method: "post", params });
const getCompanyInfo = (params: unknown) => request({ url: "/xf-job/job/xfJobCompany/getCompanyInfo", method: "get", params });

/** `J` : business setting codes enum (partial, extend as needed) */
export const SettingCodes = { BTN_PERMISS: "btn_permiss", UNIFYLOGINURL: "unifyLoginUrl", UNITELOGINURL: "uniteLoginUrl", GO_MINI_PROGRAM_PREFIX: "go_mini_program_prefix", WX_URL: "wx_url", QRCODE_TYPE: "qrcode_type", FAIRS_OUT_INFO: "fairs_out_info", IZ_HIGH_FAIR_ZONE: "iz_high_fair_zone", NO_DATA: "no_data", CHAT_KEY: "chat_key", JOB_IZ_IM_CHAT_OPEN: "job_iz_im_chat_open", JOB_IZ_IM_CHAT_TEXT: "job_iz_im_chat_text", JOB_IM_SWITCH: "job_im_switch", JOB_IZ_IM_INTERVIEW: "job_iz_im_interview", JOB_IM_APPID: "job_im_appid", JOB_IM_SECRETKEY: "job_im_secretkey", IZ_TO_FAIRLIST: "iz_to_fairList", USE_SALARY_LEVEL: "useSalaryLevel", IZ_HAS_OUTFAIR_PUBLICPHONE: "iz_has_outFair_publicPhone" } as const;

/** `p` `x` `q` `ba` `C` : prompt strings; `y` `r` `E` : identity type numbers */
export const TEXT_GO_AUTH = "去认证";
export const TEXT_GO_PERFECT = "去完善";
export const MSG_PERFECT_PERSONAL = "当前账户未完善个人信息，请先完善个人信息";
export const MSG_CORP_NOT_AUTH = "当前账户尚未进行单位认证，认证通过后方可报名招聘会";
export const MSG_CORP_PENDING = "当前账户的资料尚未完善或正在审核中，请在审核通过后报名招聘会。";
export const IDENTITY_PERSON = 0;
export const IDENTITY_CORP = 1;
export const IDENTITY_OTHER = 2;

/** `v` / Dt : open a path in the user center with auto-login */
export const openUserCenter = (toPath: string, target = "_blank") => {
  let base: string = store.getters.userUrl || "";
  if (base.endsWith("/")) base = base.slice(0, -1);
  window.open(base + "/autoLogin?toPath=" + encodeURIComponent(toPath) + "&token=" + userStorage.getToken(), target);
};

/** `n` : open an article (news) according to its keywords / linkAddress */
export const openArticle = (article: any, noDetail?: boolean, opts?: { pre?: string }) => {
  if (article.keywords && article.keywords.indexOf("toUserCenter-") !== -1) { openUserCenter(article.keywords.split("toUserCenter-")[1]); return; }
  const host = window.location.host;
  if (article.linkAddress) {
    if (String(article.linkAddress).includes(host)) window.open(article.linkAddress);
    else if (article.linkAddress.includes("www") || article.linkAddress.includes("http")) window.open("/outLink?link=" + encodeURIComponent(article.linkAddress), "_blank");
    else window.open(article.linkAddress);
  } else if (!noDetail) {
    let url = "/newsDetail?id=" + article.id;
    if (opts && opts.pre) url = opts.pre + url;
    window.open(url, "_blank");
  }
};

/** `F` / D2 : resolve 1 when the personal profile is complete, otherwise prompt and resolve 0 */
export const checkPerfect = () => new Promise<number>((resolve) => {
  const user = userStorage.getUser();
  checkIzPerfect({ xfSysUserId: user?.id }).then((r: any) => {
    if (r.result == "true") resolve(1);
    else { Modal.confirm({ title: "温馨提示", content: MSG_PERFECT_PERSONAL, centered: true, okText: TEXT_GO_PERFECT, onOk() { openUserCenter("nom"); }, cancelText: "取消", onCancel() { Modal.destroyAll(); } }); resolve(0); }
  });
});

/** `o` : login / identity check. resolves 3 = not logged in, 1 = ok, 0 = blocked (simplified faithful port) */
export const checkLogin = (type: number, content?: string, okText?: string, cancelText?: string) => new Promise<number>((resolve) => {
  const user = userStorage.getUser();
  if (!userStorage.getToken()) { resolve(3); return; }
  if (type == 0) { resolve(checkPerfect() as unknown as number); return; }
  queryIdentityByUserId({ xfUserId: user?.id, businessType: 0 }).then((c: any) => {
    if (!c.success) return;
    c.result.forEach((item: any) => {
      if (item.type == 10 && type == 1) {
        checkIzPerfect({ xfSysUserId: user?.id }).then((d: any) => {
          if (d.result == "true") {
            if (item.checkStatus == 10) getCompanyInfo({ sysUserId: user?.sysUserId }).then((v: any) => { if (v.success) { userStorage.setCorp(v.result); resolve(1); } });
            else { Modal.confirm({ title: "温馨提示", content, centered: true, okText, onOk() { openUserCenter("main"); }, cancelText: cancelText ?? "取消", onCancel() { Modal.destroyAll(); } }); resolve(0); }
          } else { Modal.confirm({ title: "温馨提示", content: MSG_PERFECT_PERSONAL, centered: true, okText: TEXT_GO_PERFECT, onOk() { openUserCenter("nom"); }, cancelText: "取消" }); resolve(0); }
        });
      }
    });
  });
});

/** `I` : button permission by business setting + identity type */
export const checkBtnPermission = (e: { type: number }) => new Promise<{ btn1: boolean }>(async (resolve) => {
  const r = { btn1: true };
  const a: any = await getSettingValueByCode({ code: SettingCodes.BTN_PERMISS });
  if (a && a.result) {
    const identity = userStorage.getIdentityType();
    if (e.type == 1) { if (identity == "0" && userStorage.getUser()) r.btn1 = false; }
    else if (e.type == 10) { if (identity == "10" && userStorage.getUser()) r.btn1 = false; }
  }
  resolve(r);
});

/** `O` : identity check with custom prompts (port of the entry's long variant; resolves like checkLogin) */
export const checkIdentity = (opts: { type: number; content?: string; content2?: string; textbtn?: string; textbtn2?: string; alert?: boolean }) => checkLogin(opts.type, opts.content, opts.textbtn, opts.textbtn2);

/** `t` : flat list -> tree by parentId */
export const listToTree = <T extends { id: string; parentId?: string; children?: T[] }>(list: T[]) => {
  const roots: T[] = [], byId: Record<string, T> = {};
  list.forEach((n) => { n.children = []; byId[n.id] = n; });
  list.forEach((n) => { const p = n.parentId ? byId[n.parentId] : undefined; if (p) p.children!.push(n); else roots.push(n); });
  return roots;
};

/** `a2` : 身份证校验 */
export const validateIdCard = (id: string) => {
  const re = /^\d{6}((((((19|20)\d{2})(0[13-9]|1[012])(0[1-9]|[12]\d|30))|(((19|20)\d{2})(0[13578]|1[02])31)|((19|20)\d{2})02(0[1-9]|1\d|2[0-8])|((((19|20)([13579][26]|[2468][048]|0[48]))|(2000))0229))\d{3})|((((\d{2})(0[13-9]|1[012])(0[1-9]|[12]\d|30))|((\d{2})(0[13578]|1[02])31)|((\d{2})02(0[1-9]|1\d|2[0-8]))|(([13579][26]|[2468][048]|0[048])0229))\d{2}))(\d|X|x)$/;
  return re.test(id);
};

/** `bc` : select suffix icon component */
export const SelectSuffixIcon = DownOutlined;
/** `A` : ant-design-vue message (D1) */
export const antMessage = message;

// ---- 以下为 20 个确认样本页面额外用到的入口导出（D a6 aQ aa g j k l s）----

/** `a6` : 全局组件 featback（意见反馈弹窗，data-v-150e31b0） */
export { default as FeedbackModal } from "@/legacy/FeedbackModal.vue";

/** `D` : 业务字典 label 枚举（原 TS enum Wt），配合 getDictValueByCodeAndItems({ dictCode: businessDict, labels }) 使用 */
export const BusinessDictLabels = {
  PROVINCE_NAME: "provinceName",
  TEACHIN_STATUS: "teachin_status",
  WEBSITE_CONFIG: "website_config",
  PLATFORM: "平台配置",
  INDEX_QRCODE: "index_qrcode",
  TOPNAV: "topNav",
  HIDE_CODE: "hide_code",
  HIDE_ORGAN: "hide_organ",
  HIDE_SERVICE: "hide_service",
  VIRTUAL_LINK: "virtual_link",
  VIRTUAL_ENTER_OPEN: "virtual_enter_open",
  WEB_FAIR_DETAIL_RIGHT_AD: "web_fair_detail_right_ad",
  WEB_FAIR_DETAIL_NUM_AD: "web_fair_detail_num_ad",
  NODATA_IMG: "nodata_img",
  DEFAULT_ORGANIZATION_ID: "default_organization_id",
  ORGCODE: "orgCode",
  INDEX_TOP_AD: "index_top_ad",
  CORPBG: "corp_bg",
  POSITIONBG: "position_bg",
  FAIRBG: "fair_bg",
  SERVICEBG: "service_bg",
  HOME_RIGHT_BG: "home_right_top",
  FEEDBACK_FLOAT: "feedBack_float",
  LINGGONG_BANNER: "linggong_banner",
  LINGGONG_NEWS: "linggong_news",
  LINGGONG_ADS: "linggong_ads",
  CHAT_OPEN: "chat_open",
  CHAT_KEY: "chat_key",
  GET_LOCATION: "get_location",
  CITY_BANNER: "city_banner",
  LIVE_COMMENT: "live_comment",
  GUIDANCE_AREA: "guidance_area",
  SALARY_BANNER_BG: "salary_banner_bg",
  SALARY_LEFT_BG: "salary_left_bg",
  HEADERS_BG: "headers_bg",
  HOME_HOLIDAY_IMG: "home_holiday_img",
  INDEX_LEFT_QRCODE: "index_left_qrcode",
  INDEX_HEADERS_BG: "index_headers_bg",
} as const;

/** `aQ` : 日期 -> 星期几；short 传 0 时返回"周X"，否则"星期X"；无日期返回 " " */
export const getWeekDay = (date: string | number | Date | null | undefined, short?: number | string) => {
  if (!date) return " ";
  let names = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
  // eslint-disable-next-line eqeqeq
  if ((short as unknown) == 0) names = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  return names[new Date(date).getDay()];
};

/** `aa` : 取租户业务字典（appConfig.businessDict）的全部字典项。原包在模块加载时读一次 appConfig，这里在调用时读 */
export const getBusinessDictItems = () => request({ url: "/jeecg-system/sys/dict/getDictItemsByCode", method: "get", params: { dictCode: getAppConfig()?.businessDict } });

/** `g` : 按字典码 + labels 取字典值 */
export const getDictValueByCodeAndItems = (params: unknown) => request({ url: "/xf-job/job/licenseFree/getDictValueByCodeAndItems", method: "post", params });

/** `j` : 当前登录用户（userStorage.getUser()） */
export const getCurrentUser = () => userStorage.getUser();

/** `k` : 当前单位信息（userStorage.getCorp()） */
export const getCurrentCorp = () => userStorage.getCorp();

/** `s` : 按单位查认证身份项 */
export const queryIdentityByCompanyId = (params: unknown) => request({ url: "/xf-job/communal/xfSysUserAuthenticateIdentityItem/queryByCompanyId", method: "post", params });

/** `W` */ export const queryAreaChildrenTreeListById = (params: unknown) => request({ url: "/xf-job/job/licenseFree/queryAreaChildrenTreeListById", method: "post", params });
/** `X` */ export const getInfoByAreaId = (params: unknown) => request({ url: "/xf-job/communal/licenseFree/xfSysAreainfo/getInfoByAreaId", method: "get", params });
