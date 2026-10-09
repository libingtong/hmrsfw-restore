// Request layer mirroring the original axios wrapper: baseURL /xf-api, token headers, response body returned as-is.
// Encrypted responses: in this POC the HAR replay serves plaintext (captured after the app's own decryption),
// so no decryption happens here. The real decoder is a later integration point.
import axios, { type AxiosRequestConfig } from "axios";
import { encryptRequest, decryptResponse, shouldEncryptRequest } from "./crypto-adapter";
import { userStorage } from "@/legacy/storage";

export const API_BASE = "/xf-api";
export const STATIC_BASE = "/jeecg-system/sys/common/static";

const parsePlain = (d: unknown) => { if (typeof d !== "string") return d; try { return JSON.parse(d); } catch { return d; } };
const instance = axios.create({ baseURL: API_BASE, timeout: 60 * 1000, transformResponse: [(d) => d] }); // 保留原文，解析交给拦截器
instance.interceptors.request.use((config) => {
  const token = userStorage.getToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = token;
    (config.headers as Record<string, string>)["X-Access-Token"] = token;
  }
  // 接入点 1：请求体加密（原前端：命中清单的 POST 请求，请求体改为 { data: 密文 }）
  if (shouldEncryptRequest(config.url, config.method)) config.data = { data: encryptRequest(config.data) };
  return config;
});
instance.interceptors.response.use(
  // 接入点 2：响应解密（原前端：响应头 crypto_opt 为 "true" 时解密后 JSON.parse）
  (res) => (res.headers?.["crypto_opt"] === "true" ? decryptResponse(res.data) : parsePlain(res.data)),
  (err) => Promise.reject(err),
);

export type ApiResponse<T = unknown> = { success?: boolean; code?: number; message?: string; result?: T; [k: string]: unknown };
export const request = <T = unknown>(config: AxiosRequestConfig): Promise<ApiResponse<T>> => instance.request(config) as unknown as Promise<ApiResponse<T>>;
// cached GET helper used by the original for dictionary lookups (IN in the entry chunk)
const cache = new Map<string, Promise<ApiResponse>>();
export const cachedRequest = (url: string, params: unknown, method = "get") => {
  const key = url + JSON.stringify(params) + method;
  if (!cache.has(key)) cache.set(key, request({ url, method, params }));
  return cache.get(key)!;
};
