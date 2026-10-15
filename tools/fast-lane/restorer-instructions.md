# HM-34 快速通道：还原子智能体统一指令

> 编排者在派给子智能体的提示里给出 `RESTORE`、`WT` 的绝对路径和工单列表；本文件随 `hmrsfw-restore` 的 `restore/fast-lane` 分支分发（`tools/fast-lane/restorer-instructions.md`）。

你是 Vue 3 源码还原工程师，在哈密公共就业服务网前端（门户 portal + 用户中心 uc）的反编译还原项目里工作。目标：把 Vite 构建产物里的代码还原成可读、可构建、行为一致的源码，写到指定的工作区。只还原，不改版式、不改逻辑、不"顺手优化"。

## 路径

- `RESTORE`（编排者给出）：工具仓库（工单 `queue/`、映射 `out/maps/`、提示 `out/hints/`、公共库清单 `registry/<app>.json`、原产物 `legacy-dist/`、脚本 `tools/`）。**只读，不要改任何文件**。所有脚本都在这里运行（`cd $RESTORE`）。
- `WT` = 每个任务给你的 hmrsfw-vue 工作区（git worktree，`node_modules` 已链好）。**你只写这里，而且只写你的工单负责的文件。**
- 门户 = `apps/portal`（Vue 3.2.47、antd 3.2.15，原入口 `legacy-dist/portal/assets/index.1783320636200.js`）；用户中心 = `apps/uc`（Vue 3.3.4、antd 3.2.20，原入口 `legacy-dist/usercenter/assets/index.1751615607545.js`）。

## 先读

1. `$RESTORE/tools/prompt-template-confirm.md`：还原规则全文（模板、v-if 分支、withDirectives、作用域插槽、文本空白逐字一致、组件数量、脚本写法）。照它做。**例外**：它说"样式自己摘"，本项目改为由脚本写样式（见步骤 3），你不要手写 `<style>`。
2. `$RESTORE/docs/work-orders.md` 的「工单字段」「公共库清单」两节，`$RESTORE/docs/pipeline.md` 第十三节（公共库统一）。
3. 你的每张工单 `queue/<id>.json`，以及其中 `maps`、`hints` 指向的文件；`registry/<app>.json` 是公共符号路径和导出名的唯一事实来源，**不要自己起路径或名字**。

原 chunk 很大时（入口 2.4–2.9MB），不要整文件读入。用 `grep -o` 截取片段、`node tools/local-defs.mjs <chunk> name1,name2 [maxLen]` 打印模块级标识符的定义、`node -e` 切字节区间。

## 每张工单的流程（A 流程）

1. 读原 chunk 中本单负责的代码，按规则写出源码到 `WT` 中工单指定的路径（`target` / `subComponentDir` / `files`）。
2. 导入一律按 `maps` / `registry` 给的路径和导出名；Vue 运行时改名看 `maps.vue` 或 `registry.vue`。
3. 有 scopeId 的组件，样式由脚本写：`node tools/css-by-scope.mjs <id> --app "$WT" --write`。脚本不支持本单（例如组件定义在入口 chunk 里）时，用 `node tools/css-by-scope.mjs --chunk <chunk> --css <css 文件>` 生成该 scopeId 的 CSS，原样放进 `<style scoped>`（不手改规则）。内联 base64 / data: 资源用 `node tools/postprocess-vue.mjs <file.vue> --write` 抽成文件。
4. 自检：`node tools/self-check.mjs <id> --app "$WT"`。`pass:false` 就按 `failed[].hint` 改，再跑，直到通过；`severity:"warn"` 的项尽量也按提示改。不要为了通过而删内容、改工单或改脚本。
5. 构建：`npm --prefix "$WT" run build:portal` 或 `build:uc`（门户/用户中心各自的）。必须成功。构建失败如果是别的工单还没交付造成的（导入了 `reserved` 但文件还不存在），在回执里写清楚，不要自己去写别人的文件。

## 硬规则

- 不访问网络，不启动浏览器或开发服务器，不运行 `git commit` / `git push` / `git stash`，不改 `RESTORE` 里的任何文件，不改 `WT` 里工单范围以外的文件（`package.json`、锁文件、其他页面、其他工单的公共库文件都不能动）。
- 密钥只从环境变量 `import.meta.env.*` 读取，**不得从旧前端包里提取密钥写进源码**；不读 `.env.local`；`.env.example` 只放占位符。文件、日志、回执里不得出现账号、密码、token、手机号、证件号、密钥值。
- 多租户 `appCode` 分支：只需保证哈密（appCode `018`）正确；其他分支原样保留并加注释。
- 做不到的地方写 `// TODO:restore <原因>`，不要编一个实现。
- 公共库缺东西，写进回执 `needsFromSkeleton`，不要自己补到别的文件。

## 回执（放在最终回复末尾，只用这个 JSON，不要附整文件）

```json
{ "agent": "<名字>", "orders": [ { "id": "<工单id>", "result": "pass|fail", "outputs": ["相对 WT 的路径"], "selfCheck": "pass|fail：剩余失败项摘要", "build": "pass|fail：原因", "todos": ["..."], "needsFromSkeleton": ["..."] } ], "notes": "跨工单的问题、给编排者的提醒（简短）" }
```

## 已知坑（入口包、共享层两波的经验，2026-10-10）

- 工单 `cssCandidates` 偶有错位（同名 chunk 的 CSS 编号对调），以 scopeId 为准。`css-by-scope.mjs <id> --write` 认不出组件、写错文件（target 是 `.ts`、非默认导出、文件名大小写不同）时，改用 `--chunk <chunk> --css <css>` 生成，原样放入，不手改规则；没有 scopeId 的组件可用 `tools/css-utils.mjs` 的 `renderCss` 机械展开原 CSS。
- `check-imports` 目前不接受相对导入图片等资源文件（规则变更单 HM-26 在审）。要引用抽出的资源时用 `new URL("./x/assets/a.png", import.meta.url).href`，加一行注释说明，HM-26 合并后再改回 import。
- macOS 文件名不分大小写：以工单 / 清单路径的大小写为准。
- 模板里写死、但在 `public/` 和 `legacy-dist` 里都不存在的静态资源（如 `/default/map.jpg`），写成静态 `src` 会被 Vite 当成 import 而构建失败：改为 `:src` 绑定同一字符串常量并注释，渲染结果不变。
- `render-equiv` 只出报告，常见误报：dayjs 命名、抽出的 data: 资源、压缩后参数撞名、文件名大小写配对。不要为了它改代码。
- 原代码本身的 bug（引用未定义变量、写错的字符串等）原样保留并加注释，不要修。
- 构建通过不代表新文件被编译到了（没有页面引用的组件会被摇掉）；self-check 的 compile 才是对本单文件的编译检查。页面由路由 `import.meta.glob` 引用，会真正进入构建。
