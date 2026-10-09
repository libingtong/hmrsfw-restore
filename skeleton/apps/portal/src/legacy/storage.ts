// Mirrors the entry chunk's user storage helper (exported as `S`, locals ke/ee/D/G/R in the samples).
// The original stores encrypted strings; this POC keeps plaintext JSON in localStorage (restored storage state).
export const KEYS = {
  SETTING_BY_TYPE: "SettingByType", WEB_SITE_NAME: "websiteName", USER_INFO: "userInfo", SYS_USER_ID: "sysUserId", TOKEN: "token",
  TYPES: "types", USER_INFO_AVATAR: "userInfoavatar", REDIRCT_URL: "redirctUrl", IDENITYTYPE: "idenityType", CORPINFO: "corpInfo", XFSYSUSERID: "xfSysUserId", COORD: "coord",
} as const;

import { decryptStorage } from "@/utils/crypto-adapter";
// 接入点 3：加密存储的读取（原入口 Ze.getUser 等：存储项为密文时先解密再解析）
const readJson = <T = any>(key: string): T | null => {
  const v = localStorage.getItem(key);
  if (!v || v === "undefined" || v === "null") return null;
  try { return JSON.parse(v) as T; } catch { return (decryptStorage(v) ?? null) as T | null; }
};

export const userStorage = {
  setUser(v: unknown) { localStorage.setItem(KEYS.USER_INFO, JSON.stringify(v)); },
  getUser<T = any>(): T | null { return readJson<T>(KEYS.USER_INFO); },
  getUserNokey<T = any>(): T | null { return readJson<T>(KEYS.USER_INFO); },
  setCorp(v: unknown) { localStorage.setItem(KEYS.CORPINFO, JSON.stringify(v)); },
  getCorp<T = any>(): T | null { return readJson<T>(KEYS.CORPINFO); },
  setXfSysUser(v: unknown) { localStorage.setItem(KEYS.XFSYSUSERID, JSON.stringify(v)); },
  getXfSysUser<T = any>(): T | null { return readJson<T>(KEYS.XFSYSUSERID); },
  setToken(v: string) { localStorage.setItem(KEYS.TOKEN, v); },
  getToken(): string | null { const v = localStorage.getItem(KEYS.TOKEN); return v && v !== "undefined" && v !== "null" ? v.replace(/^"|"$/g, "") : null; },
  getIdentityType(): string | null { return localStorage.getItem(KEYS.IDENITYTYPE); },
  remove(key: string) { localStorage.removeItem(key); },
  clear() { Object.values(KEYS).forEach((k) => localStorage.removeItem(k)); },
};

// Xc in the entry chunk
export const jsonStorage = {
  set(k: string, v: unknown) { localStorage.setItem(k, JSON.stringify(v)); },
  get<T = any>(k: string): T | undefined { return readJson<T>(k) ?? undefined; },
  remove(k: string) { localStorage.removeItem(k); },
};
