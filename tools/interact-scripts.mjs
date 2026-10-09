// Interaction scripts for the confirmation pages (plan §4.2). Same steps run on original and restored builds.
// fill: [placeholder, test value] — values are throwaway test strings; all write requests are aborted by the runner.
// optional: a missing target is recorded but does not fail the step (e.g. a list that has only one page).
export const SCRIPTS = {
  c02: [{ clickSel: ".ant-pagination-item-2", optional: true }, { clickSel: ".ant-pagination-next", optional: true }],
  c16: [{ fill: ["请输入行业名称", "软件"] }, { click: "查询" }, { click: "重置" }],
  c17: [{ fill: ["可输入招聘会名称进行搜索", "招聘"] }, { click: "搜索" }, { click: "重置" }, { clickSel: ".ant-pagination-item-2", optional: true }],
  c18: [
    { fill: ["请输入当前密码", "Tst-old-0001"] }, { fill: ["请输入登录密码", "Tst-new-0002x"] }, { fill: ["请再次输入登录密码", "Tst-new-0002x"] },
    { click: "提交", wait: 2000 }, { click: "验证码修改" },
  ],
  // form page: partial fill then submit → client-side validation messages are compared; any write is aborted
  c03: [{ fill: ["请输入姓名", "测试"] }, { fill: ["请输入企业名称", "测试企业"] }, { click: "提交", wait: 2000 }],
  // c05 omitted: dictionary job_fair_type_zcyz is empty for this tenant, so the page renders no tabs/list to operate on
  c06: [{ fill: ["请输入考试名称", "考试"] }, { click: "查询" }, { click: "重置" }],
  c07: [{ fill: ["请输入招聘会名称", "招聘"] }, { click: "查询" }, { click: "重置" }],
  // c19 opens a "提取职位信息" confirm on load when the company has history positions; dismiss it first
  c19: [{ click: "取消", optional: true }, { click: "添加职位", wait: 2000 }, { fill: ["请输入职位名称", "测试岗位"] }, { fill: ["请输入招聘人数", "2"] }, { click: "保存", wait: 2000 }],
};
