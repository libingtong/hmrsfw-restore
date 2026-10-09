录制工具（`tools/record-page.mjs`）的验收样例：3 张 POC 没有 HAR 的页面，其中 `rv-uc-feedback` 带提交（真实写入一条意见反馈）。它们不是流水线工单，工单 id 以 `rv-` 开头，交互脚本不放在 `tests/interact/`，也不会被提交到 `integration`。

```bash
export RESTORE_ASSETS=… RESTORE_STATE=… HMRSFW_NO_WHITELIST=1   # SM2_PRIVATE_KEY 可选，用于核对请求体能否解密
for id in rv-uc-feedback rv-uc-mynews rv-portal-trainList; do
  node tools/record-page.mjs $id --order tests/record-fixtures/$id.order.json --script tests/record-fixtures/$id.json
done
```

`rv-uc-feedback` 每录一次会在测试环境新增一条标题为「测试反馈Tst-0001」的意见反馈（`POST /xf-job/job/xfJobFeedbackRecord/add`），测试环境重置时一并清掉。
