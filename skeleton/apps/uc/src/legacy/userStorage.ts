// 入口导出 `bL`（原局部名 Pd）：localStorage 里用户/单位信息的读写工具。keys=true 时存的是密文，读时解密。
import { decryptText, encryptObject } from "@/legacy/storage";

const isSet = (v: string | null): v is string => !!v && v != "undefined" && v != "null";

/** `Vu`：明文 JSON 的 localStorage 小工具（userStorage.getUser 失败时用它清理登录态） */
export const localJson = {
  set(key: string, value: unknown) { localStorage.setItem(key, JSON.stringify(value)); },
  get(key: string) { const v = localStorage.getItem(key); if (isSet(v)) return JSON.parse(v); },
  remove(key: string) { localStorage.removeItem(key); },
};

export const userStorage = {
  keys: true,
  setUser(t: any) { this.keys ? localStorage.setItem("userInfo", t) : localStorage.setItem("userInfo", JSON.stringify(t)); },
  getUser() {
    const t = localStorage.getItem("userInfo");
    if (!isSet(t)) return null;
    if (!this.keys) return JSON.parse(t);
    try {
      return JSON.parse(this.getKey(t) as string);
    } catch {
      localJson.remove("userInfo"); localJson.remove("xfSysUserId"); localJson.remove("corpInfo"); localJson.remove("token");
      return null;
    }
  },
  getUserNokey() { const t = localStorage.getItem("userInfo"); return isSet(t) ? JSON.parse(t) : null; },
  setCorp(t: any) { this.keys ? localStorage.setItem("corpInfo", t) : localStorage.setItem("corpInfo", JSON.stringify(t)); },
  getCorp() { const t = localStorage.getItem("corpInfo"); return isSet(t) ? (this.keys ? JSON.parse(this.getKey(t) as string) : JSON.parse(t)) : null; },
  getCropNokey() { const t = localStorage.getItem("corpInfo"); return isSet(t) ? JSON.parse(t) : null; },
  setSysUser(t: any) { this.keys ? localStorage.setItem("sysUserId", t) : localStorage.setItem("sysUserId", JSON.stringify(t)); },
  getSysUser() {
    const t = localStorage.getItem("sysUserId");
    console.log("-----log", t);
    return isSet(t) ? (this.keys ? JSON.parse(this.getKey(t) as string) : JSON.parse(t)) : null;
  },
  setXfSysUser(t: any) { this.keys ? localStorage.setItem("xfSysUserId", t) : localStorage.setItem("xfSysUserId", JSON.stringify(t)); },
  getXfSysUser() { const t = localStorage.getItem("xfSysUserId"); return isSet(t) ? (this.keys ? JSON.parse(this.getKey(t) as string) : JSON.parse(t)) : null; },
  setAvatar(t: string) { localStorage.setItem("userInfoavatar", t); },
  getAvatar(_t?: unknown) { const e = localStorage.getItem("userInfoavatar"); return isSet(e) ? e : null; },
  setToken(t: string) { localStorage.setItem("token", t); },
  getToken() { const t = localStorage.getItem("token"); return isSet(t) ? t : null; },
  remove(t: string) { localStorage.removeItem(t); },
  /** 密文 → JSON 文本（原包 xX，即入口导出 `f`） */
  getKey(t: string): string | null { let e: string | null = null; try { e = decryptText(t); } catch { /* 原包吞掉异常 */ } return e; },
  /** 对象 → 密文（原包 lpt） */
  setKey(t: unknown): string | null { let e: string | null = null; try { e = encryptObject(t); } catch { /* 原包吞掉异常 */ } return e; },
};
