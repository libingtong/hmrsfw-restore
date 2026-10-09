// Minimal vuex store mirroring the getters the sample pages read (userUrl, userInfo, sysUserid, dictList).
import { createStore } from "vuex";
import { userStorage } from "@/legacy/storage";
import { request } from "@/utils/request";

export const store = createStore({
  state: () => ({
    userInfo: null as unknown,
    xfSysUserId: null as unknown,
    userInfoavatar: "",
    token: "",
    dictCode: null as unknown,
    code: "job_pc_common_xjhm",
    talentsCode: "",
    talentsList: [] as unknown[],
    routes: [] as unknown[],
    userCenterPre: localStorage.getItem("userCenterPre"),
    navLinks: [] as unknown[],
    siteinfo: null as unknown,
    userUrl: localStorage.getItem("userUrl") || "https://hamiusercentertest.rencaidanao.com",
  }),
  getters: {
    sysUserid: (s) => s.xfSysUserId ?? userStorage.getXfSysUser(),
    xfSysUser: (s) => s.xfSysUserId ?? userStorage.getXfSysUser(),
    userInfo: (s) => s.userInfo ?? userStorage.getUser(),
    dictList: (s) => s.dictCode ?? null,
    userUrl: (s) => s.userUrl,
    noDataImg: (s) => (s.siteinfo as any)?.noDataImg ?? null,
    targetWay: () => "_blank", // original: link target from site config (default new tab)
  },
  actions: {
    // original: loads a dictionary list into state.dictCode (array of {label,value}) for the given dictCode
    async getDictCode({ state }, payload: { dictCode: string }) {
      const res: any = await request({ url: "/jeecg-system/sys/dict/getDictItemsByCode", method: "get", params: { dictCode: payload.dictCode } });
      if (res && res.success) state.dictCode = res.result;
      return res;
    },
  },
  mutations: {
    setSiteInfo(s, v) { s.siteinfo = v; },
    setNavLinks(s, v) { s.navLinks = v; },
    setUserInfo(s, v) { s.userInfo = v; },
  },
});
