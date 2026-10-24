## 测试环境造数登记

只记录在测试库（`hami_test`）里为录制专门新增或修改的数据：类型、名称、主键、在哪个页面能看到。不写账号、手机号、证件号。回滚 SQL 只保存在本机，不进仓库。

### HM-1123（2026-10-24）

| 页面 | 类型 | 名称 / 内容 | 主键 | 在哪能看到 |
|---|---|---|---|---|
| `page.portal.fair.signModal` | 网络招聘会（`xf_job_hami.xf_job_fair`，`job_fair_type=20`） | 测试-录制用-网络招聘会（请勿报名） | `2112300000000000101` | 门户 `/fairList?type=web` 第一页。开放报名（`iz_open_site_enroll=1`，报名截止 2026-12-15 17:00），举办期 2026-10-24 至 2026-12-31。录制单位没有报名，所以列表接口返回 `izEnrollStatus=1`、`signStatus=0`，页面显示「报名参会」 |
| `page.uc.corpFairs` | 字典（`xf_job_jeecg_boot_hami.sys_dict` + `sys_dict_item`） | `job_fair_type_zcyz`：10 主场活动、20 系列活动、30 省外专场 | 字典 `2112300000000000201`，字典项 `…211`～`…213` | 用户中心 `/corpFairs` 的 tab 列表。之前测试库里没有这个字典，接口返回空数组，所以没有 tab，也没有「请输入招聘会名称」输入框 |

说明：
- 招聘会是复制 `2100433904057028610`（测试917）后改了名称和时间，归属机构和地区与原记录相同。
- `/corpFairs` 列表本身仍然为空：录制单位在 `job_fair_type=40` 的招聘会下没有报名记录。本次没有补报名记录。
- `page.uc.Createaresume`、`page.uc.previewresume` 不需要造数，详见 HM-1123 的结论评论。

### HM-1304（2026-10-24）

| 页面 | 类型 | 名称 / 内容 | 主键 | 在哪能看到 |
|---|---|---|---|---|
| `page.portal.answer.passwordModal` | 问卷（`xf_job_hami.xf_sys_quenaire`） | test | `2104482602328051713` | 门户 `/answer` 第一页。进行中（`status=10`），需要密码（`iz_need_password=1`），不需要登录（`iz_login=0`），有效期到 9999-12-31。匿名点它就弹出密码框 |

说明：
- 本次没有新增或修改数据。这份问卷是 HM-1070 改成普通问卷、进行中的那份（回滚 SQL 在本机）。10-24 用门户 `quenaire/List` 匿名查询（只读）确认它在列表里，`izNeedPassword=1`；`quenaire/izLogin` 返回 `false`。
- 弹窗不要求登录：`izLogin` 为假时，前端在未登录状态下直接按 `izNeedPassword==1` 打开密码框（`legacy-dist/portal/assets/index.178332063620016.js` 中 `Oe({id:s.id})` 的 else 分支）。
- 问卷密码不写在这里。录制只需要弹出密码框，不输入密码。
