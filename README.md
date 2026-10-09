哈密 Vue 3 页面批量还原流水线的工具仓库。编排方案、门槛要求和各脚本之间的接口约定见 [docs/pipeline.md](docs/pipeline.md)（v3.2），第十二节是并行子任务共同遵守的契约，第十三节是公共库统一，第十五节是自治与升级给人的边界。

## 两个仓库的分工

| 仓库 | 放什么 | 谁写 |
| --- | --- | --- |
| [`libingtong/hmrsfw-vue`](https://github.com/libingtong/hmrsfw-vue) | 产物工程：两个应用（`apps/portal`、`apps/uc`）的干净 Vue 源码、两份 vite 配置、`package.json`/lock。就是最终交付物 | 还原员、修正员（只写工单指定的页面目录）；入口包、共享组件工单（公共库） |
| `libingtong/hmrsfw-restore`（本仓库） | 工具、`legacy-dist`、映射、工单、回执、公共库清单 `registry` | 工程子任务；工单、回执、清单由对应脚本和角色写 |

两个仓库都用 `main`（人工合并）、`integration`（门槛通过后自动合并）两条主干；还原尝试在 `hmrsfw-vue` 上开 `restore/<工单id>-a<attempt>` 分支。

**工具怎么找到产物工程**：通过参数 `--app <hmrsfw-vue 检出目录>` 或环境变量 `HMRSFW_APP_DIR`，参数优先；两者都没有就报错退出，没有默认路径。共用实现是 `tools/app-dir.mjs` 的 `appDir()`，新脚本直接引用它。

## 目录

| 路径 | 内容 |
| --- | --- |
| `legacy-dist/` | 线上已发布的前端产物（门户 `portal/`、用户中心 `usercenter/`），还原的唯一依据。只读，不改 |
| `out/maps/`、`out/hints/` | 每个 chunk 的导入映射与提示表（脚本生成，还原员直接读） |
| `tools/` | 分析、检查、门槛脚本；`prompt-template-confirm.md` 是还原员指令主体 |
| `docs/` | `pipeline.md`（编排方案）、`crypto-adapter-spec.md`（加解密适配） |
| `batch-plan.md` | 批量还原计划 v2，工单字段见第 3 节 |

`queue/`、`registry/`、`receipts/`、`tests/interact/` 由阶段 2 的子任务按第十二节建立。

本仓库不包含 HAR、登录态、SM2 私钥、后端源码和接口返回的数据。它们只在 Mac mini 本机（`$RESTORE_ASSETS`、`$RESTORE_STATE`），见 `docs/pipeline.md` 第一、四节。提交前运行 `node tools/scan-secrets.mjs`。

## 开始工作

```bash
git clone https://github.com/libingtong/hmrsfw-restore
git clone https://github.com/libingtong/hmrsfw-vue
cd hmrsfw-restore
export HMRSFW_APP_DIR=$PWD/../hmrsfw-vue   # 或者每条命令带 --app ../hmrsfw-vue
node tools/setup-workdir.mjs                # 准备两个检出的依赖，输出一行 JSON
npm --prefix "$HMRSFW_APP_DIR" run build    # 构建两个应用，输出 hmrsfw-vue/dist/portal、dist/uc
```

`setup-workdir.mjs` 处理四个依赖目录：本仓库的根目录、`tools/vuefp/`、`tools/vuefp33/`，以及 `hmrsfw-vue` 检出的根目录。

- 设置了 `RESTORE_DEPS_CACHE`：各目录的 `node_modules` 软链到缓存。缓存项按「目录 + 平台 + Node 主版本 + `package-lock.json` 的 SHA-256」区分，`hmrsfw-vue` 的缓存项按它自己的 lock 文件建。缓存项不存在时在缓存目录里 `npm ci` 一次，用 `<缓存>/.locks/` 下的目录锁防止并发重复安装。lock 文件变了会自动生成新缓存项。
- 没有设置：在各目录原地 `npm ci`，`node_modules` 与 lock 文件一致时跳过。
- `hmrsfw-vue` 的 `.gitignore` 只忽略 `node_modules/` 目录，不覆盖软链，所以脚本会把 `/node_modules` 写进该检出的 `.git/info/exclude`，不改它的任何受控文件。
- 本地已有真实的 `node_modules` 目录时默认保留并给出警告，`--force` 改为软链。

## 不入库、需要另外获取的东西

| 内容 | 获取方式 |
| --- | --- |
| 各目录的 `node_modules` | `node tools/setup-workdir.mjs` |
| `tools/vuefp/`、`tools/vuefp33/` 的参考构建 `dist/vuefp.js`（`map-vue-exports.mjs` 用） | 先跑 `setup-workdir.mjs`，再 `cd tools/vuefp && npx vite build`（`vuefp33` 同理）。两者分别是 Vue 3.2.47 / 3.3.4 运行时的指纹库，对应门户和用户中心的打包版本；`render-equiv.mjs` 用它们 `node_modules` 里的 `@vue/compiler-sfc` |
| Playwright Chromium（门槛、录制用） | `npx playwright install chromium`；`setup-workdir.mjs` 发现缺失会在 `warnings` 里提示 |
| 加解密密钥 | 在 `hmrsfw-vue` 里复制 `.env.example` 为 `.env.local` 填值，不得提交 |
| HAR、登录态、原版基线、门槛产物 | 只在 Mac mini：`$RESTORE_ASSETS`、`$RESTORE_STATE` |

## 分支

- `main`：人工审查后合入。
- `integration`：门槛通过后自动合入。
