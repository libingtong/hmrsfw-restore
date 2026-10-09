# 样式归还与加解密工具（E）

`docs/pipeline.md` 第二节「E 样式与加密」的四个脚本和一个数据文件。命令都在本仓库根目录运行，找产物工程用 `--app <hmrsfw-vue 检出>` 或 `HMRSFW_APP_DIR`。

| 文件 | 作用 | 谁用 |
| --- | --- | --- |
| `tools/css-by-scope.mjs` | 按 `data-v-<hash>` 从原编译样式表取回每个组件的样式，写成 `<style scoped>` | 页面、共享组件工单的预处理或后处理；`--check` 供自检和门槛 |
| `tools/postprocess-vue.mjs` | 内联 base64 / data: 资源抽成文件，压缩 CSS 展开 | `css-by-scope --write` 自动调用；也可以单独处理任意 `.vue` |
| `tools/har-decrypt.mjs` | 按后端算法解密 HAR：请求体 SM2、响应 SM4、存储 SM4；输出只含哈希的归一化请求序列 | `gate.mjs` 写请求匹配（A），`baseline.mjs` 的 `seq.json`（A/D），`e5-replay.mjs` |
| `tools/e5-replay.mjs` | 密文 HAR 回放比对：原版和还原版各回放一次，比 DOM、文本、请求、解密后的请求体、截图 | E5 验收；样式改动的截图对比 |
| `tools/copy-exemptions.json` | 复制检测的登记豁免表（D3 默认值：只豁免配置数据） | `check-copied.mjs`（C） |

## 密钥（只从环境变量读取）

| 变量 | 内容 | 谁需要 |
| --- | --- | --- |
| `SM2_PRIVATE_KEY` | SM2 私钥，64 位十六进制，解密请求体 | 门槛员、录制员（`har-decrypt`、`e5-replay`） |
| `VITE_HMRSFW_SM4_KEY` | SM4 密钥，32 位十六进制，解密响应 | 门槛员、录制员（`har-decrypt`）；构建还原版 |
| `VITE_HMRSFW_SM4_STORAGE_KEY` | 存储用 SM4 密钥，空则沿用上一项 | 同上 |
| `VITE_HMRSFW_SM2_PUBLIC_KEY` | SM2 公钥，构建还原版时注入请求层 | 构建还原版（`e5-replay` 会先构建） |

SM4 和 SM2 公钥两个变量和 `hmrsfw-vue/.env.example` 同名：Vite 构建时会读取同名环境变量，所以一套环境变量既能构建，也能解密。脚本只报告变量名是否设置，不输出值；解密结果只在内存里，落盘的只有 SHA-256。

## css-by-scope.mjs

```bash
node tools/css-by-scope.mjs <工单id> [--orders tools/confirm-orders.json | --queue queue] --app ../hmrsfw-vue          # 只出计划（JSON）
node tools/css-by-scope.mjs <工单id> ... --write    # 替换组件文件里的全部 <style>，写 assets/，再跑 postprocess-vue
node tools/css-by-scope.mjs <工单id> ... --check    # 现有 <style> 与生成结果不一致时退出码 1
node tools/css-by-scope.mjs --chunk legacy-dist/portal/assets/X.js [--css <file>]   # 只看每个 scopeId 的 CSS
```

- **scopeId 归属**：从原 chunk 的 `_export_sfc(Comp, [["__scopeId", "data-v-…"]])` 读出，组件名取 `__name`（或 `name`）。chunk 的默认导出是主组件，写到工单 `target`；其他组件写到 `subComponentDir/<组件名>.vue`。
- **反向变换**：去掉作用域属性，还原 `:deep()`、`:slotted()`、旧式 `::v-deep.x`、keyframes 改名（`name-<hash>` → `name`）。同一张样式表里不带作用域属性的规则，放进相邻组件的非 scoped `<style>`。`@media` 里混有多个组件的规则时按组件拆开。
- **往返校验**：每个生成的块都用原版本的 compiler-sfc（门户 3.2.47 `tools/vuefp`，用户中心 3.3.4 `tools/vuefp33`）重新编译，必须逐条还原出原样式表里的规则（选择器、声明、顺序）。有任何不一致就不写，退出码 1。
- **资源**：data: URI 写到页面目录的 `assets/<scopeId 短哈希>-<内容哈希>.<扩展名>`，样式里用相对路径引用。其他 `url(/assets/…)` 保持原样（指向 `public/`）。
- 工单字段：`sourceChunk`、`target`、`subComponentDir`、`app` 或 `site`；`cssCandidates` 可选，缺省时搜索 chunk 所在目录的全部 `.css`。

## postprocess-vue.mjs

```bash
node tools/postprocess-vue.mjs <file.vue | 目录> ... [--assets-dir <dir>] [--write]
```

模板里 `src` / `href` / `poster` 的 data: URI 改为相对路径；脚本里的 data: 字符串改为 `import` 资源文件；`<style>` 里的 data: URI 抽成文件，压缩的规则展开为一行一条声明。每个改过的样式块都校验和原来的规则逐条等价，不等价就保持原样并报告。`lang="scss"` 等非 CSS 块不处理。不带 `--write` 时只报告。

## har-decrypt.mjs

```bash
node tools/har-decrypt.mjs <file.har | capture.json> [--out seq.json] [--strict]   # 归一化请求序列，只含哈希
node tools/har-decrypt.mjs --check <files...>          # 每个文件解密了多少条（只输出计数）
node tools/har-decrypt.mjs --selftest [files...]       # 临时密钥自测；带文件时用其中的真实请求体和解密后的响应做样本，并与 sm2-body.mjs 逐条对比
```

供导入的函数（A 的请求匹配、D 的基线都用这些，不要再写第二份解密）：

| 函数 | 说明 |
| --- | --- |
| `readEntries(pathOrObj)` | HAR 1.2 或 POC 采集格式 → `[{method, url, status, reqBody, resBody, cryptoOpt, t}]` |
| `decryptRequestBody(text, {privateKey})` | 后端 `CryptoRequestWrapper` 的规则：非 JSON 整体是 SM2 密文；`{data: 密文}`；否则明文。返回 `{encrypted, form, value}` |
| `decryptResponseBody(text, cryptoOpt, {sm4Key})` | `Crypto_Opt: true` 时 SM4 解密，返回 `{encrypted, pkcs5Ok, jsonOk, value}`；后端加密失败回落的明文标 `fallbackPlain` |
| `decryptStorageValue(text, {sm4StorageKey})` | 浏览器存储项，失败返回 `null`（与原前端一致） |
| `decryptEntry(entry, keys)` | 一条记录整体解密（内存中） |
| `matchKey({method, url, body})` | 写请求匹配键：方法 + 路径 + 查询哈希 + 解密并规范化后的请求体哈希。SM2 每次密文不同，键相同 |
| `normalizedSequence(src, {keys})` | 归一化请求序列 `{entries, failures}`，可直接写进 `seq.json` |
| `sm2Decrypt`、`sm4Decrypt`、`isCryptoOpt`、`isLikelySm2Cipher`、`keysFromEnv`、`canonical`、`sha256`、`ENV` | 底层函数与环境变量名 |

`normalizedSequence` 每条记录的字段：`method`、`path`、`queryKeys`、`querySha256`、`status`、`reqEncrypted`、`reqForm`、`reqSha256`、`resEncrypted`、`resPkcs5Ok`、`resJsonOk`、`resSha256`、`key`。查询参数只存参数名和整体哈希，因为里面可能有 token。

## e5-replay.mjs

```bash
node tools/e5-replay.mjs [ids...] --orders tools/confirm-orders.json --app ../hmrsfw-vue [--label <name>] [--no-build]
```

- HAR 默认取 `$RESTORE_ASSETS/har/confirm-replay/<id>.har`，存储状态取 `$RESTORE_ASSETS/.auth/pw-<role>.json`，可用 `--har-dir`、`--auth-dir` 改。
- 不访问网络：`/xf-api/` 全部从 HAR 回答（密文响应带 `crypto_opt: true` 原样返回），找不到返回「not in HAR」，其他外部域名一律中止。
- 判定和回放比对一致：页面根元素 HTML、文本、浮层文字、页面级请求集合、解密后的请求体、像素差 ≤ 0.5%。原版自身有竞态，不一致时原版最多重跑 4 次。
- 每页还记录 HAR 里的密文响应数，以及原版、还原版各自实际消费了几条（`cryptoServed`）。还原版消费数大于 0 的页面，才说明请求层的解密分支被走到了。
- 产物写到 `$RESTORE_STATE/e5/<label>/`（没有 `RESTORE_STATE` 时写 `out/e5/<label>/`）。截图和 HTML 含测试环境的数据，不得提交。
