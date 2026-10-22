录制工具（`tools/record-page.mjs`）的验收样例，都是 POC 没有 HAR 的页面：

- 3 张带交互脚本：`rv-uc-feedback`（求职者，带提交；提交接口 `xfJobFeedbackRecord/add` 在写接口拦截名单里，不再真实写入，HM-992）、`rv-uc-mynews`（求职者）、`rv-portal-trainList`（门户）。
- 2 张只录加载，用来验证身份切换：`rv-uc-mentorhome`（职业导师）、`rv-uc-corpcenter`（招聘单位）。

身份由工单的 `role` 决定，record-page 开录前会自动切换，见根目录 README「录制」。它们不是流水线工单，工单 id 以 `rv-` 开头，交互脚本不放在 `tests/interact/`，也不会被提交到 `integration`。

```bash
export RESTORE_ASSETS=… RESTORE_STATE=… HMRSFW_NO_WHITELIST=1   # SM2_PRIVATE_KEY 可选，用于核对请求体能否解密
for id in rv-uc-feedback rv-uc-mynews rv-portal-trainList; do
  node tools/record-page.mjs $id --order tests/record-fixtures/$id.order.json --script tests/record-fixtures/$id.json
done
for id in rv-uc-mentorhome rv-uc-corpcenter; do
  node tools/record-page.mjs $id --order tests/record-fixtures/$id.order.json
done
```

`rv-uc-feedback` 的提交（`POST /xf-job/job/xfJobFeedbackRecord/add`）由写接口拦截名单挡下，不发到测试环境，录制结果的 `intercepted` 里能看到它（HM-992 之前每录一次会新增一条「测试反馈Tst-0001」）。
