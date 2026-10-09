# 已知差异登记

原代码本身的问题（docs/pipeline.md 第十五节第 2 条第 3 款），登记后门槛不判失败。**只能由裁定员写**，每条一个文件 `<id>.json`、一个提交。

```json
{
 "id": "kd-0001",
 "wo": "<工单id>",
 "where": "load.html",
 "orig": "<原版一侧规范化后出现的片段；requests 类写一条请求，如 \"GET /xf-job/x\"；没有写 null>",
 "rest": "<还原版一侧对应的片段；没有写 null>",
 "evidence": { "chunk": "legacy-dist/<site>/assets/<文件>", "pos": "<字节偏移或 行:列>", "why": "<原代码的问题>" },
 "by": "<裁定员>",
 "date": "2026-10-09"
}
```

- `where`：`load.html`、`load.text`、`load.overlay`、`load.requests`、`steps.requests`、`final.html`、`final.text`、`final.overlay`。
- 比对时两边的片段都换成同一个占位符 `⟦known:<id>⟧` 再比；requests 类两边都去掉这条请求。字符串类 `orig`、`rest` 都要写。
- `evidence.chunk` 必须存在，缺字段或 chunk 不存在的条目作废，门槛结果里报 `known-diffs`。
