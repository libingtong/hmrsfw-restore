// 加解密接入点。算法与后端 platform/jeecg-boot-base-core 对齐：
//   - 请求体：SM2 公钥加密，C1C3C2 模式，十六进制密文去掉开头的 "04"（Sm2Util.encrypt / CryptoRequestWrapper）
//   - 响应体：SM4/ECB/PKCS5Padding，密钥与密文均为十六进制（Sm4Utils.encryptEcbP / CryptoFilter）
//   - 浏览器存储：与原前端一致，SM4/ECB 加密后的 JSON 文本（sm4.decrypt(text, KEY) 再 JSON.parse）
// 密钥只从环境变量读取（见 env.d.ts 的 ImportMetaEnv 与 skeleton/.env.example），不得写入仓库。
// 规格见 docs/crypto-adapter-spec.md。
import smCrypto from "sm-crypto";

const { sm2, sm4 } = smCrypto;

/** SM2 加密模式：1 = C1C3C2（后端 Sm2Util 使用的模式），0 = C1C2C3。 */
const SM2_MODE_C1C3C2 = 1;

export interface CryptoKeys {
  /** SM2 公钥（十六进制，压缩 02/03 或非压缩 04 形式均可），用于请求体加密。 */
  sm2PublicKey?: string;
  /** SM4 密钥（32 位十六进制），用于响应解密。 */
  sm4Key?: string;
  /** 浏览器存储用的 SM4 密钥（32 位十六进制）；缺省时沿用 sm4Key。 */
  sm4StorageKey?: string;
}

export interface CryptoAdapter {
  encryptRequest: (data: unknown) => unknown;
  decryptResponse: (text: string) => unknown;
  decryptStorage: (text: string | null) => unknown;
  encryptStorage: (value: unknown) => string;
  shouldEncryptRequest: (url: string | undefined, method: string | undefined) => boolean;
}

const HEX_RE = /^[0-9a-fA-F]+$/;
const isHex = (s: string, evenLength = true) => s.length > 0 && HEX_RE.test(s) && (!evenLength || s.length % 2 === 0);
const isSm4Key = (s: string | undefined): s is string => typeof s === "string" && s.length === 32 && isHex(s);
const isSm2PublicKey = (s: string | undefined): s is string =>
  typeof s === "string" && isHex(s) && ((s.length === 66 && /^0[23]/.test(s)) || (s.length === 130 && s.startsWith("04")));

const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8", { fatal: true });
const utf8Bytes = (s: string): number[] => Array.from(encoder.encode(s));
const utf8String = (bytes: ArrayLike<number>): string => decoder.decode(Uint8Array.from(bytes));
const looksLikeJson = (s: string) => /^\s*[[{"]/.test(s) || /^\s*(true|false|null|-?\d)/.test(s);
const isBinaryBody = (d: unknown) =>
  (typeof FormData !== "undefined" && d instanceof FormData) ||
  (typeof Blob !== "undefined" && d instanceof Blob) ||
  (typeof URLSearchParams !== "undefined" && d instanceof URLSearchParams) ||
  d instanceof ArrayBuffer ||
  ArrayBuffer.isView(d);

/** SM2 公钥加密，返回去掉 "04" 前缀的十六进制密文（C1C3C2），与后端 Sm2Util.encrypt 输出一致。 */
export const sm2EncryptHex = (plain: string, publicKey: string): string => {
  const cipher = sm2.doEncrypt(utf8Bytes(plain), publicKey, SM2_MODE_C1C3C2);
  return cipher.startsWith("04") && cipher.length % 2 === 0 && cipher.length > 194 ? cipher.slice(2) : cipher;
};

/** SM4/ECB/PKCS#7（等价于后端的 PKCS5Padding）加密，返回小写十六进制密文。 */
export const sm4EncryptHex = (plain: string, key: string): string =>
  sm4.encrypt(utf8Bytes(plain), key, { mode: "ecb", padding: "pkcs#7", output: "string" }) as string;

/** SM4/ECB/PKCS#7 解密十六进制密文，返回 UTF-8 明文；密文非十六进制或填充错误时抛错。 */
export const sm4DecryptHex = (cipherHex: string, key: string): string => {
  const hex = cipherHex.trim();
  if (!isHex(hex) || hex.length % 32 !== 0) throw new Error("SM4 ciphertext is not hex or not block aligned");
  const bytes = sm4.decrypt(hex, key, { mode: "ecb", padding: "pkcs#7", output: "array" }) as number[];
  return utf8String(bytes);
};

/** 按 CryptoKeys 构造一套适配器；默认导出的函数是用环境变量里的密钥构造出来的实例。 */
export function createCryptoAdapter(keys: CryptoKeys): CryptoAdapter {
  const sm2PublicKey = isSm2PublicKey(keys.sm2PublicKey) ? keys.sm2PublicKey : undefined;
  const sm4Key = isSm4Key(keys.sm4Key) ? keys.sm4Key.toLowerCase() : undefined;
  const sm4StorageKey = isSm4Key(keys.sm4StorageKey) ? keys.sm4StorageKey.toLowerCase() : sm4Key;

  const parseJson = (text: string): unknown => {
    try {
      return JSON.parse(text);
    } catch {
      return text; // 与骨架的 parsePlain 一致：不是 JSON 的原文原样返回
    }
  };

  return {
    encryptRequest(data) {
      if (!sm2PublicKey) return data;
      if (isBinaryBody(data)) {
        console.warn("[crypto-adapter] 二进制/表单请求体不做 SM2 加密，原样发送");
        return data;
      }
      const plain = typeof data === "string" ? data : JSON.stringify(data ?? {});
      return sm2EncryptHex(plain, sm2PublicKey);
    },

    decryptResponse(text) {
      if (typeof text !== "string") return text;
      // 后端加密失败时会原样返回明文 JSON（见 Sm4Utils.encryptEcbP 的 catch），这里也兼容
      if (!sm4Key || looksLikeJson(text) || text.length === 0) return parseJson(text);
      try {
        return parseJson(sm4DecryptHex(text, sm4Key));
      } catch (e) {
        throw new Error(`[crypto-adapter] 响应解密失败: ${(e as Error).message}`);
      }
    },

    decryptStorage(text) {
      if (typeof text !== "string" || text.length === 0 || text === "undefined" || text === "null") return null;
      // 兼容明文 JSON（POC 回放的存储状态）：能直接解析就直接用
      if (looksLikeJson(text)) {
        try {
          return JSON.parse(text);
        } catch {
          /* 继续尝试解密 */
        }
      }
      if (!sm4StorageKey) return null;
      try {
        return JSON.parse(sm4DecryptHex(text, sm4StorageKey));
      } catch {
        return null; // 调用方据此删除该存储项（原前端行为）
      }
    },

    encryptStorage(value) {
      const json = JSON.stringify(value);
      return sm4StorageKey ? sm4EncryptHex(json, sm4StorageKey) : json;
    },

    /**
     * 原前端规则：POST 且 URL 包含后端下发清单（localStorage 的 "funcs"，元素形如 { value: "<url 片段>" }）中任一项；
     * 清单值为 "all" 时全部加密（与 CryptoFilter.izCryptoData 一致）。未配置 SM2 公钥时一律不加密，
     * 避免把明文包进 { data } 导致后端拿不到参数。
     */
    shouldEncryptRequest(url, method) {
      if (!sm2PublicKey || !url || (method ?? "get").toLowerCase() !== "post") return false;
      let funcs: Array<{ value?: string } | null> = [];
      try {
        const raw = localStorage.getItem("funcs");
        const parsed: unknown = raw ? JSON.parse(raw) : [];
        funcs = Array.isArray(parsed) ? parsed : [];
      } catch {
        funcs = [];
      }
      const target = url.toLowerCase();
      return funcs.some((f) => {
        const v = f?.value;
        return typeof v === "string" && v.length > 0 && (v === "all" || target.includes(v.toLowerCase()));
      });
    },
  };
}

/** 从 Vite 环境变量读取密钥；变量缺失或格式不对时给出一次性告警（只报变量名，不报值）。 */
export function readCryptoKeysFromEnv(): CryptoKeys {
  const env = (import.meta as unknown as { env?: Partial<ImportMetaEnv> }).env ?? {};
  const keys: CryptoKeys = {
    sm2PublicKey: env.VITE_HMRSFW_SM2_PUBLIC_KEY?.trim(),
    sm4Key: env.VITE_HMRSFW_SM4_KEY?.trim(),
    sm4StorageKey: env.VITE_HMRSFW_SM4_STORAGE_KEY?.trim(),
  };
  const problems: string[] = [];
  if (!keys.sm2PublicKey) problems.push("VITE_HMRSFW_SM2_PUBLIC_KEY 未配置，请求体将不加密");
  else if (!isSm2PublicKey(keys.sm2PublicKey)) problems.push("VITE_HMRSFW_SM2_PUBLIC_KEY 格式不对（应为 66 位压缩或 130 位非压缩十六进制），已忽略");
  if (!keys.sm4Key) problems.push("VITE_HMRSFW_SM4_KEY 未配置，加密响应将按明文解析");
  else if (!isSm4Key(keys.sm4Key)) problems.push("VITE_HMRSFW_SM4_KEY 格式不对（应为 32 位十六进制），已忽略");
  if (keys.sm4StorageKey && !isSm4Key(keys.sm4StorageKey)) problems.push("VITE_HMRSFW_SM4_STORAGE_KEY 格式不对（应为 32 位十六进制），已改用 VITE_HMRSFW_SM4_KEY");
  if (problems.length && typeof console !== "undefined") console.warn("[crypto-adapter] " + problems.join("；"));
  return keys;
}

const adapter = createCryptoAdapter(readCryptoKeysFromEnv());

/** 请求体加密：仅对 shouldEncryptRequest(url, method) 为 true 的 POST 请求调用。返回值作为请求体中 data 字段的值。 */
export const encryptRequest = (data: unknown): unknown => adapter.encryptRequest(data);

/** 响应解密：响应头 Crypto_Opt 为 "true" 时调用。入参是响应体原文（字符串），返回解析后的对象。 */
export const decryptResponse = (text: string): unknown => adapter.decryptResponse(text);

/** 浏览器存储解密：读取加密存储项时调用。入参是存储里的原文，返回解析后的对象；失败返回 null。 */
export const decryptStorage = (text: string | null): unknown => adapter.decryptStorage(text);

/** 浏览器存储加密：写入需要加密的存储项时调用（与 decryptStorage 互逆）。 */
export const encryptStorage = (value: unknown): string => adapter.encryptStorage(value);

/** 是否需要加密请求体（规则见 createCryptoAdapter 内的说明）。 */
export const shouldEncryptRequest = (url: string | undefined, method: string | undefined): boolean =>
  adapter.shouldEncryptRequest(url, method);
