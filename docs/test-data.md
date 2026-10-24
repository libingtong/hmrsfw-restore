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
