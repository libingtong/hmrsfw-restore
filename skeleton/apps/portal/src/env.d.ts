/// <reference types="vite/client" />

// 加解密密钥只通过 Vite 环境变量注入（skeleton/.env.local，已被 .gitignore 忽略；样例见 skeleton/.env.example）。
interface ImportMetaEnv {
  /** SM2 公钥（十六进制，压缩 02/03 或非压缩 04 形式），用于请求体加密。 */
  readonly VITE_HMRSFW_SM2_PUBLIC_KEY?: string;
  /** SM4 密钥（32 位十六进制），用于响应解密。 */
  readonly VITE_HMRSFW_SM4_KEY?: string;
  /** 浏览器存储用的 SM4 密钥（32 位十六进制）；缺省时沿用 VITE_HMRSFW_SM4_KEY。 */
  readonly VITE_HMRSFW_SM4_STORAGE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// sm-crypto 0.3.13 没有类型声明，这里只声明用到的部分。
declare module "sm-crypto" {
  export type ByteInput = string | number[] | Uint8Array;
  export interface Sm4Options {
    padding?: "pkcs#7" | "pkcs#5" | "none" | null;
    mode?: "ecb" | "cbc";
    iv?: ByteInput;
    output?: "string" | "array";
  }
  export const sm2: {
    /** cipherMode: 1 = C1C3C2（默认），0 = C1C2C3；返回不带 "04" 前缀的十六进制密文。 */
    doEncrypt(msg: ByteInput, publicKey: string, cipherMode?: 0 | 1): string;
    doDecrypt(encryptData: string, privateKey: string, cipherMode?: 0 | 1, options?: { output?: "string" | "array" }): string | number[];
    generateKeyPairHex(): { publicKey: string; privateKey: string };
    getPublicKeyFromPrivateKey(privateKey: string): string;
  };
  export const sm3: (input: ByteInput, options?: { key?: ByteInput }) => string;
  export const sm4: {
    /** 字符串入参按 UTF-8 编码；output 为 "string" 时返回十六进制密文。 */
    encrypt(input: ByteInput, key: ByteInput, options?: Sm4Options): string | number[];
    /** 字符串入参按十六进制解析；output 为 "string" 时返回 UTF-8 明文。 */
    decrypt(input: ByteInput, key: ByteInput, options?: Sm4Options): string | number[];
  };
  const smCrypto: { sm2: typeof sm2; sm3: typeof sm3; sm4: typeof sm4 };
  export default smCrypto;
}
