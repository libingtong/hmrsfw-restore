# 加解密接入规格（由贵方工程师实现）

骨架工程已经预留好接入点：调用时机和数据流都接好了，默认实现是"原样返回"，因此骨架在未实现时也能构建和运行。贵方只需要在一个文件里填上实现。

## 1. 要实现的文件

两个应用各一份，内容可以相同：

- `skeleton/apps/portal/src/utils/crypto-adapter.ts`（门户）
- `skeleton/apps/uc/src/utils/crypto-adapter.ts`（用户中心）

| 函数 | 签名 | 何时被调用 | 要求 |
|---|---|---|---|
| `encryptRequest` | `(data: unknown) => unknown` | 请求拦截器在发送前调用，只针对 `shouldEncryptRequest` 返回 true 的请求 | 返回值会被包成 `{ data: <返回值> }` 作为请求体，与原前端一致 |
| `decryptResponse` | `(text: string) => unknown` | 响应头 `crypto_opt` 为 `"true"` 时调用 | 入参是响应体原文，返回解析后的对象；`crypto_opt` 不是 `"true"` 的响应由骨架自己解析 JSON |
| `decryptStorage` | `(text: string \| null) => unknown` | 读取加密的浏览器存储项时调用 | 返回解析后的对象；失败返回 `null`，调用方会删除该存储项（原前端行为） |
| `encryptStorage` | `(value: unknown) => string` | 写入需要加密的存储项时调用 | 与 `decryptStorage` 互逆 |
| `shouldEncryptRequest` | `(url, method) => boolean` | 请求拦截器调用 | 已按原前端规则实现：POST 且 URL 命中 `localStorage.funcs` 清单。如后端规则不同可修改 |

## 2. 调用点（已接好，不需要改）

- **接入点 1**：`utils/request.ts` 的请求拦截器，处理请求体加密。
- **接入点 2**：`utils/request.ts` 的响应拦截器，处理响应解密。axios 的自动解析已关闭，原文交给拦截器处理。
- **接入点 3**：浏览器存储读取。门户在 `legacy/storage.ts` 的 `readJson`，用户中心在 `legacy/storage.ts` 的 `decryptStorage`。

## 3. 参考实现与密钥

- 算法、模式和清单规则以后端源码为准，均在 `/Users/dylan/Projects/backend-new-main/platform/jeecg-boot-base-core/src/main/java/org/jeecg/` 下：
  - `common/util/Sm2Util.java`
  - `common/util/Sm4Utils.java`
  - `config/filter/CryptoFilter.java`：哪些请求和响应要加密，以及 `Crypto_Opt` 响应头。
- 原前端用的是 npm 包 `sm-crypto`。POC 目录 `node_modules/sm-crypto` 里装的是 0.3.13 版，可以直接用。
- 密钥只从环境变量读取（`import.meta.env.VITE_…`），**不得写入仓库**。建议后端同时把源码里写死的密钥常量改为从配置读取，并更换密钥。

## 4. 实现完成后的验收（由我来跑）

1. 两个应用都能 `vite build`。
2. 用已录好的密文 HAR（`har/confirm/`）回放 20 个样本页：原版与还原版的页面 HTML、文本和请求集合一致，就说明响应解密和存储解密都正确。
3. 交互比对：拦截写请求后，比较两边请求体解密后的参数，一致即说明请求加密正确。

## 5. 实现说明（2026-10-09 已实现）

- 实现文件：`skeleton/apps/portal/src/utils/crypto-adapter.ts` 与 `skeleton/apps/uc/src/utils/crypto-adapter.ts`，内容相同。类型声明在各应用的 `src/env.d.ts`（`ImportMetaEnv` 与 `sm-crypto` 模块声明）。依赖 `sm-crypto@0.3.13` 已加入 `skeleton/package.json`。
- 算法对齐后端：请求体 SM2 公钥加密、C1C3C2、十六进制密文去掉开头 `04`（`Sm2Util.encrypt`）；响应体 SM4/ECB/PKCS5Padding、十六进制密钥与密文（`Sm4Utils.encryptEcbP`）；存储项为 SM4/ECB 加密的 JSON 文本，与原前端 `JSON.parse(sm4.decrypt(text, KEY))` 互通。
- 密钥通过 Vite 环境变量注入，两个应用共用 `skeleton/.env.local`（两份 vite 配置已设 `envDir` 指向 `skeleton/`；样例见 `skeleton/.env.example`，`.env.local` 已加入 `.gitignore`）：
  - `VITE_HMRSFW_SM2_PUBLIC_KEY`：SM2 公钥（压缩 66 位或非压缩 130 位十六进制），对应 `Sm2Util.PRIVATE_KEY` 的公钥
  - `VITE_HMRSFW_SM4_KEY`：响应解密密钥（32 位十六进制），对应 `Sm4Utils.KEY`
  - `VITE_HMRSFW_SM4_STORAGE_KEY`：存储加解密密钥，留空沿用 `VITE_HMRSFW_SM4_KEY`
- 降级行为：未配置或格式不对的密钥会在控制台告警一次（只报变量名）。无 SM2 公钥时 `shouldEncryptRequest` 一律返回 false（避免把明文包进 `{ data }`）；无 SM4 密钥时加密响应按明文解析；存储项先尝试按明文 JSON 解析，再解密，失败返回 `null`。后端加密失败时会带着 `Crypto_Opt: true` 返回明文 JSON，`decryptResponse` 对此也兼容。
- 已做验证：`har/confirm/` 中 43 条密文响应全部用 `VITE_HMRSFW_SM4_KEY` 解出为合法 JSON；请求密文用后端私钥按 `Sm2Util.decrypt` 规则解回原文；存储加解密互逆且与 `sm-crypto` 原生 `sm4.encrypt/decrypt` 互通。
