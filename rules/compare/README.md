# 比对规范化规则

`gate.mjs`、`baseline.mjs` 比对时使用的全部规范化规则（docs/pipeline.md 第七节；docs/gate.md「规则文件化」）。

- 每条规则一个文件 `NN-<id>.json`，按文件名顺序加载。每条规则单独一个提交：合并或 `git revert` 只动它自己的文件，不会和其他规则冲突（同一个文件里追加的规则，回退中间一条时 git 会报冲突，已实测）。
- 改动只能走「规则变更单」（docs/pipeline.md 第十五节第 3 条）：裁定员提出、审计员复核；只认等价写法的规范化，不放宽阈值；合并后全量回归（`node tools/gate.mjs --regress`）。
- 字段：`id`、`kind`、`enabled`（false 即停用）、`since`（来源）、`why`（等价理由与证据）。
- `kind`：
  - `tree`：DOM 树变换，实现按 `id` 取自 `tools/gate/rules.mjs`；
  - `drop-attrs`：去掉 `attrs` 列出的属性；
  - `html` / `text` / `overlay`：按 `subs`（`[正则, 标志, 替换]`）依次替换规范化后的字符串；
  - `param`：参数（`pixel`：像素差上限 `maxRatio`、pixelmatch 颜色阈值 `threshold`）；
  - `shell-requests`：原站外壳的请求（站点级），加载请求集合和交互请求序列都不比较。
