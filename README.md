哈密 Vue 3 页面批量还原流水线的工作仓库。编排方案、门槛要求和各脚本之间的接口约定见 [docs/pipeline.md](docs/pipeline.md)（v3），第十二节是并行子任务共同遵守的契约。

## 目录

| 路径 | 内容 |
| --- | --- |
| `legacy-dist/` | 线上已发布的前端产物（门户 `portal/`、用户中心 `usercenter/`），还原的唯一依据。只读，不改 |
| `out/maps/`、`out/hints/` | 每个 chunk 的导入映射与提示表（脚本生成，还原员直接读） |
| `skeleton/` | 还原骨架：两个站点的 Vite 工程（`vite.portal.config.ts`、`vite.uc.config.ts`）和兼容层 |
| `restore/` | 还原结果，`restore/<app>/src/views/...`，由各还原分支写入；构建时作为 `@views` |
| `tools/` | 分析、检查、门槛脚本；`prompt-template-confirm.md` 是还原员指令主体 |
| `docs/` | `pipeline.md`（编排方案）、`crypto-adapter-spec.md`（加解密适配） |
| `batch-plan.md` | 批量还原计划 v2，工单字段见第 3 节 |

本仓库不包含 HAR、登录态、SM2 私钥、后端源码和接口返回的数据。它们只在 Mac mini 本机（`$RESTORE_ASSETS`、`$RESTORE_STATE`），见 `docs/pipeline.md` 第一、四节。提交前运行 `node tools/scan-secrets.mjs`。

## 开始工作

```bash
node tools/setup-workdir.mjs          # 准备依赖，输出一行 JSON
npm --prefix skeleton run build:portal
npm --prefix skeleton run build:uc
```

`setup-workdir.mjs` 处理四个依赖目录：根目录、`skeleton/`、`tools/vuefp/`、`tools/vuefp33/`。

- 设置了 `RESTORE_DEPS_CACHE`：各目录的 `node_modules` 软链到缓存。缓存项按「目录 + 平台 + `package-lock.json` 的 SHA-256」区分，不存在时在缓存目录里 `npm ci` 一次，用 `<缓存>/.locks/` 下的目录锁防止并发重复安装。lock 文件变了会自动生成新缓存项。
- 没有设置：在各目录原地 `npm ci`，`node_modules` 与 lock 文件一致时跳过。
- 另外建 `restore/node_modules -> ../skeleton/node_modules`，让 `restore/` 下的页面解析到骨架的依赖。
- 本地已有真实的 `node_modules` 目录时默认保留并给出警告，`--force` 改为软链。

`@views` 的解析顺序：`$RESTORE_ROOT`（含 `<app>/src/views` 的目录）> 设置了 `RESTORE_GROUP` 时的 `../restore-<group>/`（POC 布局）> `../restore/`。构建输出在 `skeleton/dist/<app>-<RESTORE_GROUP，默认 a>/`。Vite 缓存放在 `skeleton/.vite/`，不写进可能共享的 `node_modules`。

## 不入库、需要另外获取的东西

| 内容 | 获取方式 |
| --- | --- |
| 各目录的 `node_modules` | `node tools/setup-workdir.mjs` |
| `tools/vuefp/`、`tools/vuefp33/` 的参考构建 `dist/vuefp.js`（`map-vue-exports.mjs` 用） | 先跑 `setup-workdir.mjs`，再 `cd tools/vuefp && npx vite build`（`vuefp33` 同理）。两者分别是 Vue 3.2.47 / 3.3.4 运行时的指纹库，对应门户和用户中心的打包版本；`render-equiv.mjs` 用它们 `node_modules` 里的 `@vue/compiler-sfc` |
| Playwright Chromium（门槛、录制用） | `npx playwright install chromium`；`setup-workdir.mjs` 发现缺失会在 `warnings` 里提示 |
| 加解密密钥 | 复制 `skeleton/.env.example` 为 `skeleton/.env.local` 填值，不得提交 |
| HAR、登录态、原版基线、门槛产物 | 只在 Mac mini：`$RESTORE_ASSETS`、`$RESTORE_STATE` |

## 分支

- `main`：人工审查后合入。
- `integration`：门槛通过后自动合入。
- `restore/<工单id>-a<attempt>`：每次还原尝试。
