// User-center storage helpers. The original keeps SM4-encrypted JSON in localStorage and decrypts on read
// (entry export `d`: (text, key) => JSON.parse(sm4.decrypt(text, KEY))). This POC stores plaintext JSON in the
// restored storage state, so `decryptStorage` just parses; the real decoder is an integration point.
import { decryptStorage as adapterDecryptStorage } from "@/utils/crypto-adapter";
// 接入点 3：加密存储的读取（原入口导出 d：解密失败时删除该存储项并返回 null）
export const decryptStorage = <T = any>(text: string | null, key?: string): T | null => {
  if (!text || typeof text !== "string") return null;
  const v = adapterDecryptStorage(text) as T | null;
  if (v == null) { console.error("解密失败:", key); if (key) localStorage.removeItem(key); }
  return v;
};
export const getToken = (): string | null => { const v = localStorage.getItem("token"); return v && v !== "undefined" && v !== "null" ? v.replace(/^"|"$/g, "") : null; };
export const getXfSysUserId = <T = any>() => decryptStorage<T>(localStorage.getItem("xfSysUserId"), "xfSysUserId");
export const getUserById = <T = any>() => decryptStorage<T>(localStorage.getItem("userbyid"), "userbyid");

// ---- 以下为新增导出（入口导出 f、bL 用到），不改上面的已有函数 ----
import { encryptStorage as adapterEncryptStorage } from "@/utils/crypto-adapter";
/**
 * 入口导出 `f`：解密一段密文（与加密存储同一把 SM4 密钥），返回 JSON 文本，调用方再 `JSON.parse`。
 * 原包：`t => t && typeof t == "string" ? (try sm4.decrypt(t, KEY) catch → console.error + null) : null`。
 * 这里统一经 `decryptStorage` 解密（它会把明文 JSON 解析成对象），再序列化回文本，调用方式不变。
 */
export const decryptText = (text: unknown): string | null => {
  if (!text || typeof text !== "string") return null;
  const v = decryptStorage<unknown>(text);
  if (v == null) return null;
  return typeof v === "string" ? v : JSON.stringify(v);
};
/** 原包 `lpt`（`userStorage.setKey`）：对象 → 加密文本；非对象返回 null。 */
export const encryptObject = (value: unknown): string | null =>
  value && typeof value === "object" ? adapterEncryptStorage(value) : null;
