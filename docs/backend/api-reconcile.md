# 接口对账：前端 × backend-new-main × 测试环境（HM-23）

HM-17 第一步：在不部署后端的前提下，从接口契约上判断自有后端（`backend-new-main`）能不能替换 rencaidanao 测试环境。三方是：原前端包（`legacy-dist`）实际调用的接口、`backend-new-main` 源码提供的接口、录制的 HAR 里测试环境实际答过的接口。

## 结论

**`backend-new-main` 与测试环境部署的后端同源，但不是同一个版本；对哈密前端来说，缺 3 个服务（58 个接口）和 1 个接口。**

依据：

1. **测试环境录到的接口，后端源码几乎都有。** HAR 里 80 个接口（702 条记录）中 79 个在源码里能找到，方法全部一致；唯一找不到的 `POST /xf-talent/talent/xfTalentCgraduateRltSubsidy/list`，测试环境自己也返回 404。没有一条「测试环境 2xx、源码没有」的记录。
2. **响应字段几乎一致，有一处字段级漂移。** 67 个后端声明了具体返回类型的接口，逐键比对了 2664 个字段节点，只有两处不同：
   - `POST /xf-oddjob/oddJob/licenseFree/needJoblist`：`backend-new-main` 的 `XfOddNeedJobInfo` 有 `coordinateSystem`（字段 + getter），测试环境的响应里没有这个键。同一条响应把 23 个值为 null 的字段都序列化了，所以「没有这个键」不是被省略，而是测试环境那一版没有这个字段。这是 **`backend-new-main` 比测试环境新**（或分叉）的直接证据。
   - `GET /xf-job/communal/xfSysBusinessSetting/getSettingValueByCode`：方法签名声明 `Result<XfSysBusinessSetting>`，但方法体返回的是 `Result.ok(<String>)`，测试环境返回的也是字符串。这是源码自身的声明不准，**不是**版本差异。
3. **加密一致。** 测试环境 120 条 `Crypto_Opt: true` 的响应，用与源码 `Sm4Utils` 对应的 `VITE_HMRSFW_SM4_KEY` 全部解开；`CryptoFilter` 在源码里对每个服务注册 `/*`，加密哪些 url 由字典数据决定，和前端录到的 `funcs` 名单机制吻合。
4. **覆盖面有限。** HAR 只覆盖了哈密范围 556 个接口中的 80 个；其余 476 个只能做「前端 × 源码」的静态对账，测试环境那一侧要靠 HM-18 部署后实测补齐。

**阻断替换的差异（哈密范围，共 59 条，明细见下文生成部分）：**

| 类别 | 条数 | 说明 |
| --- | --- | --- |
| `xf-college` 服务不在源码 | 31 | 用户中心宣讲会、实习签约（`teachIn*`、`sign.*`、`collage.*` 等页面和 `appointment` 共享组件） |
| `xf-talent` 服务不在源码 | 21 | 用户中心人才补贴申报（`formDone`、`doneList`，都是 hmrsfw-vue 已验收页）。测试环境同样 404，替换后行为不变 |
| `xf-alliance` 服务不在源码 | 6 | 门户岗位/单位详情里的「联盟」分支、`resumemodal`、用户中心 `allianceSend` |
| `xf-job` 缺接口 | 1 | `POST /xf-job/school/user/sms`（门户找回密码页）。源码 `SchoolUserController` 只有 `loginSms`、`slidesSms` 等，`/sms` 只在 `jeecg-system` 的 `/sys/sms` |

`xf-college`、`xf-alliance` 测试环境有没有，HAR 里没有录到，现在无法判断；`xf-talent` 测试环境也没有。另有前端自身的缺陷（15 条路径缺服务前缀、1 条 url 带尾随空格、1 条方法不一致），测试环境同样受影响，不算替换阻断，列在下文。

**部署自有后端时必须补的、源码里没有的配置（HM-18）：**

- Nacos `jeecg.shiro.excludeUrls`：源码里哈密范围 534 个可匹配接口中 533 个默认要登录，包括 170 个 `licenseFree` 接口。原前端匿名访问门户时调用这些接口，靠的是这份放行名单。
- 字典 `crypto_req_body_params_filter_always_crypto_urls` 等四项（CryptoFilter 的加密名单）。门户录到的请求体加密名单是 10 项。
- 网关路由：`jeecg-gateway` 的路由从 Nacos / Redis 动态加载，源码里没有静态路由表；本次按「第一段 = `spring.application.name`、转发时去掉第一段」对账，HM-18 部署后要用实测确认。

## 数据来源与口径

脚本：`tools/api-inventory.mjs`（解析逻辑在 `tools/lib/apiinv-frontend.mjs`、`apiinv-backend.mjs`、`apiinv-har.mjs`），只读，不发请求。

```bash
export VR_BACKEND_SRC=<backend-new-main 目录>   # 后端源码只从环境变量读
export RESTORE_ASSETS=<HAR 所在目录>            # 读 $RESTORE_ASSETS/har，只取 recording.allowedHosts 里的测试主机
# 可选：VITE_HMRSFW_SM4_KEY（解响应）、SM2_PRIVATE_KEY（解请求体）；不设则加密内容只计数
node tools/api-inventory.mjs --app <hmrsfw-vue> [--orders <含 queue/ 的目录>] --report docs/backend/api-reconcile.md
```

输出 `out/api-inventory/{frontend,backend,har,reconcile}.json`（不入库：只有路径、参数名、字段结构，没有值，也没有源码，但可以随时重跑），并刷新本文 `api-inventory` 标记之间的部分。

**前端**

- 扫描 `legacy-dist` 两站全部 873 个 chunk（babel 解析）。识别四种写法：api 模块里导出的 `x.request({url,method,params|data})` 函数；页面、共享组件、入口里直接写的请求配置；`IN("/path", e, "post")` 这类封装调用；`url: LN.logout` 这种枚举常量。url 是条件表达式时两个分支各记一条；命名空间对象导出（`Object.defineProperty({__proto__:null,…})`）按成员追踪。
- 参数名取自调用点的对象字面量，能跟到 `reactive({...})`、`ref({...})`、`Object.assign({}, …)` 和之后的 `x.k = …` 赋值；跟不到的标为部分解析。
- 范围按工单：调用方 chunk 是某张哈密工单的 `sourceChunk`（门户按 `router-xjhm.json`，用户中心全部路由，HM-6 的口径），就算哈密范围；入口 chunk 内的调用按所在组件的绑定名归到入口组件单，归不到的记「入口未归属」，保守地计入范围。只被其他租户页面调用的单独计数，不进差异表。范围判定到 chunk 为止，没有剪 chunk 内部的 `appCode` 分支，所以个别「哈密范围」接口实际可能只在其他租户分支里走到（例如 `resumemodal` 里的 `izAlliance` 分支）。
- 工单来自 HM-6（`queue/`）。HM-6 还没合入 `main`，本次用 `--orders` 指向从 HM-6 分支解出的 `queue/`。自检：我们算出的「哈密页面用到的 api 模块导出」与工单自带的 `deps.api` 对比，两站都完全一致（门户 195 / 195，用户中心 238 / 238）。
- SM2：门户按原前端规则，POST 且 url 命中 `localStorage.funcs`（录制时的浏览器存储快照）；用户中心没有全局规则，按调用点显式的 `{data: $sm2(...)}` 判定（门户也有这种写法）。
- `hmrsfw-vue` 交叉检查：已还原的 15 个 `src/api` 模块逐个与旧 chunk 比函数数和路径集合；已还原页面里直接写的 url 全部能在旧包清单里找到。

**后端**

- 遍历 `backend-new-main` 全部 5838 个 Java 文件，读出 689 个 Controller 的映射。每个 `*-app` 模块的 `spring.application.name` 是服务名，网关路径 = `/<服务名>` + 类和方法上的映射；`platform/` 下的代码按依赖了 `jeecg-boot-base-core` 的服务展开。
- 参数：`@RequestParam`（名字、是否必填）、`@PathVariable`、`@RequestBody`（展开成 DTO 的属性名）、不带注解的简单类型和对象（按 query 绑定展开属性名）、方法体里 `getParameter("x")` 的名字。
- 返回结构：按 Jackson 的规则把声明的返回类型展开成「键 + JSON 类型」（getter 和 public 字段，继承、泛型代入，`@JsonIgnore`、`@JsonProperty(access = WRITE_ONLY)`、`@JsonIgnoreProperties` 去掉，`IPage` 按 MyBatis-Plus `Page` 的字段）。项目的 ObjectMapper 不省略 null，日期序列化为字符串。
- 登录：方法上的 `@IgnoreAuth` / `@NeedLoginAuth`，`ShiroConfig` 里写死的 `anon` 名单；其余是 `jwt`（Nacos 放行名单不在源码里，见结论）。
- 清单里只有签名：路径、方法、参数名和位置、返回类型名、字段名和 JSON 类型，以及所在类名和方法名；不含方法体和 DTO 实现。

**测试环境**

- 读 `$RESTORE_ASSETS/har` 下的 HAR 1.2 和 POC 抓包（`confirm/`、`pages/`、`raw/`），只取测试主机的 `/xf-api/` 请求；`portal/`、`usercenter/`、`confirm-replay/` 是脱敏或回放副本（主机名为 `__origin__`），跳过（501 条）。
- 每个接口记方法、路径、状态码、`Crypto_Opt`、请求体形式、query 和请求体的参数名、响应 JSON 的结构（只有键和类型，多次采样合并）。
- 本机没有 `SM2_PRIVATE_KEY`（只有门槛员、录制员持有），但 HAR 里本来就没有录到 SM2 加密的请求体，所以不影响结果。

**差异的判定**

- 路径完全相同算命中；后端 `{var}`、`*`、`/**` 按 Spring 规则匹配；只差大小写算缺失（Spring 区分大小写）。
- 缺失按原因分三类：服务不在源码、服务在但接口没有、前端路径第一段不是服务名（网关无法路由，原包缺陷）。
- 「参数名：前端传了后端不接收」只作参考：大部分是界面字段被整体塞进请求（如 `ssq`、`workAreaName`），后端忽略即可，不影响结果。「后端必填前端未传」只统计前端参数能完整解析的调用。
- 「传参位置不一致」：前端用 JSON 请求体发送、后端只按 query/表单绑定（或反过来）。源码里 `CryptoFilter` 包装请求时不会把 JSON 体并入请求参数，所以这类调用在后端拿到的是空参数；测试环境的行为相同，是原系统本来的样子，HM-18 实测时留意即可。

## 人工抽查（11 个接口）

逐个用 grep 查旧包、后端源码、HAR，与脚本输出比对。其中 SM2 加密 4 个（1–4）、写接口 5 个（2–5、11 的调用方是找回密码）。

| # | 接口 | 前端（旧包） | 后端（源码） | 测试环境（HAR） | 脚本输出 | 一致 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `POST /xf-job/school/user/login` | 门户入口与 `index.api.…28`，`method:"post"`，命中 `funcs` | `SchoolUserController.login`，`@PostMapping` | 未录到 | 命中，SM2=funcs | ✓。用户中心入口里也有这个 url，但只是没被引用的枚举定义，脚本正确地没有计为调用 |
| 2 | `POST /xf-job/job/licenseFree/passwordChangeByJson` | `index.api.…28`，命中 `funcs` | `JobLicenseFreeController.passwordChangeByJson`，POST | 未录到 | 命中，SM2=funcs | ✓ |
| 3 | `POST /xf-job/communal/xfSysUser/saveForUserCenter` | 门户 `guide` 页、用户中心 `nom` 页，`{data: $sm2(user)}` | `XfSysUserController.saveForUserCenter`，POST | 未录到 | 两站各一条，SM2=$sm2 | ✓ |
| 4 | `POST /xf-job/job/xfJobCurriculumVitae/saveUserAndVitae` | `index.api.…2`，`addResume` 里 `$sm2` | `XfJobCurriculumVitaeController.saveUserAndVitae`，POST | 未录到 | 命中，SM2=$sm2 | ✓ |
| 5 | `GET /xf-job/job/xfJobCurriculumVitaeDeliver/add` | `index.api.…2`，`method:"get"`；参数是 `Object.assign({}, user)` 再补字段 | `XfJobCurriculumVitaeDeliverController.add`，`@GetMapping`，3 个必填 | 未录到 | 命中；参数标为部分解析，不报必填缺失 | ✓（修正前曾误报必填缺失，已修） |
| 6 | `POST /xf-job/job/licenseFree/findJobList` | 14 个 chunk，全部 `post` | `JobLicenseFreeController.findJobList`，POST，`FindJobVo` 按 query 绑定 | 未录到 | 命中；前端多传 `ssq`、`work*Name` 等界面字段 | ✓ |
| 7 | `GET /xf-job/communal/xfSysBusinessSetting/getSettingValueByCode` | 用户中心 4 处，`get` | `XfSysBusinessSettingController`，`@GetMapping`，`code` 必填 | 200×59，明文 | 命中；`result` 类型差异 | ✓，类型差异是源码声明不准（见结论） |
| 8 | `POST /xf-oddjob/oddJob/licenseFree/needJoblist` | `index.api.…24`，`post` | `OddJobLicenseFreeController.queryPageList`，`Result<IPage<XfOddNeedJobInfoVo>>` | 200×1，`Crypto_Opt: true`，已解开 | 命中；少 `coordinateSystem` | ✓，字段与 getter 在源码里确实存在 |
| 9 | `POST /xf-common/common/xfAnnouncementSendRedcord/queryAnnouncementList` | 用户中心入口 | `XfAnnouncementSendRedcordController.queryAnnouncementList` | 200×5，`Crypto_Opt: true`，已解开 | 命中，字段一致 | ✓ |
| 10 | `POST /xf-talent/talent/xfTalentCgraduateRltSubsidy/list` | `index.api.…5`（用户中心 `doneList`） | 没有 `xf-talent` 服务 | 404×1 | 缺失：服务不在源码 | ✓ |
| 11 | `POST /xf-job/school/user/sms` | 门户 `index.api.…28`（找回密码页） | `/school/user` 下没有 `/sms` | 未录到 | 缺失：接口不在源码 | ✓ |

## 遗留与后续

- **HM-18**：部署时补 Nacos `jeecg.shiro.excludeUrls`、加密字典和网关路由（见结论）；用实测补齐 HAR 没覆盖的 476 个接口；确认 `xf-college`、`xf-alliance` 在测试环境是否存在，决定 59 条缺失是否真的阻断。
- **`tools/restore-api.mjs` 漏函数**：它的正则在请求配置里遇到分号就截断，`headers:{"Content-Type":"application/json; application/octet-stream"}` 这类写法会被漏掉，条件 url 也取不到。旧包里共 6 个函数受影响（见模块对账表「差异说明」列），已落到 `hmrsfw-vue` 的只有 `apps/uc/src/api/api-56.ts` 少了 2 个 `downPdf`。这不在本任务范围内，没有改。
- HM-6 合入 `main` 后，`queue/` 就在仓库里，不再需要 `--orders`。

## 生成部分

<!-- api-inventory:begin -->
生成：`node tools/api-inventory.mjs`，2026-10-09。下列数字都由脚本算出，重跑即更新。

### 三方接口数

| 来源 | 口径 | 数量 |
| --- | --- | --- |
| 前端 portal | 方法 + 路径（哈密范围 / 入口未归属 / 仅其他租户 / 无调用） | 323（222 / 8 / 92 / 1） |
| 前端 uc | 方法 + 路径（哈密范围 / 入口未归属 / 仅其他租户 / 无调用） | 379（372 / 6 / 1 / 0） |
| 前端合计 | 哈密范围（含入口未归属），两站去重后的方法 + 路径 | 556 |
| 后端 `backend-new-main` | 689 个 Controller 的映射，按服务展开（12 个服务） | 6665 |
| 测试环境 HAR | 66 个文件、702 条接口记录，方法 + 路径 | 80 |

### 差异汇总

| 类别 | 条数 | 说明 |
| --- | --- | --- |
| 前端调用、后端没有（阻断替换） | **59** | 哈密范围内：整个服务不在源码里 58 条（xf-alliance、xf-college、xf-talent），服务在、接口没有 1 条；另有 0 条只差大小写 |
| 测试环境录到、后端没有 | 1（其中 2xx：**0**） | 2xx 才是「测试环境有、`backend-new-main` 没有」的版本差异证据 |
| 前端路径缺服务前缀 | 15 | 原包缺陷：网关按第一段路由，测试环境同样到不了后端，不算替换阻断 |
| 前端 url 带首尾空格 | 1 | 原包缺陷，按去掉空格后的路径对账 |
| 方法不一致 | 1 | |
| 参数名：前端传了后端不接收 | 117 | 后端 DTO/参数里没有这个名字；多数是冗余参数，少数是改名 |
| 参数名：后端必填前端未传 | 0 | 只统计前端参数能静态解析完整的调用 |
| 传参位置不一致 | 19 | JSON 体 vs query，见下文说明 |
| 响应字段结构与后端返回类型不符 | 2 | 在 79 个可比的测试环境接口里 |
| 后端有、前端没用 | 6141 | 两站全部前端调用（含其他租户）都没匹配到的后端映射，只列数量 |

### 登录与加密（按源码）

- 哈密范围内能在后端找到的 534 个接口：默认要登录 533，ShiroConfig 静态白名单 1。其中路径带 `licenseFree`（原前端免登录调用）的 170 个在源码里同样是「默认要登录」：免登录靠 Nacos 配置 `jeecg.shiro.excludeUrls` 放行，这份配置不在源码里。录制的 HAR 全部带 token，测不出测试环境放行了哪些。
- CryptoFilter：registered for /* in every service (platform); urls from dictionary data。哪些 url 加密请求体、哪些 url 加密响应，来自字典 `crypto_req_body_params_filter_always_crypto_urls` 等四项（数据库数据）。门户录到的 `funcs`（请求体加密名单）有 10 项；测试环境 120 条响应带 `Crypto_Opt: true`，用 `VITE_HMRSFW_SM4_KEY` 全部解开（失败 0）；HAR 里没有录到 SM2 加密的请求体（0 条）。

### 前端调用、后端没有（哈密范围）

| 应用 | 方法 | 路径 | 原因 | SM2 | 测试环境 | 调用方（工单） |
| --- | --- | --- | --- | --- | --- | --- |
| portal | POST | `/xf-job/school/user/sms` | 接口不在源码 | no | 未录到 | page.portal.loginviews.passwordhintbig |
| portal | GET | `/xf-alliance/alliance/curriculumVitaeDeliver/add` | 服务不在源码 | no | 未录到 | shared.portal.resumemodal |
| uc | GET | `/xf-alliance/alliance/curriculumVitaeDeliver/listForUserContent` | 服务不在源码 | no | 未录到 | page.uc.allianceSend |
| portal | GET | `/xf-alliance/alliance/curriculumVitaeDeliver/queryIzCanDeliver` | 服务不在源码 | no | 未录到 | page.portal.LookForJob.PostDetail |
| portal | GET | `/xf-alliance/alliance/licenseFree/xfAllianceCompany/queryById` | 服务不在源码 | no | 未录到 | page.portal.LookForJob.CorpDetail, page.portal.LookForJob.PostDetail |
| portal | POST | `/xf-alliance/alliance/licenseFree/xfAlliancePosition/mh/list` | 服务不在源码 | no | 未录到 | page.portal.LookForJob.CorpDetail |
| portal | GET | `/xf-alliance/alliance/licenseFree/xfAlliancePosition/queryById` | 服务不在源码 | no | 未录到 | page.portal.LookForJob.PostDetail |
| uc | POST | `/xf-college/campus/xfCollegeCampus/listByRoomParentOrganizationId` | 服务不在源码 | no | 未录到 | shared.uc.appointment |
| uc | POST | `/xf-college/careerRoom/xfCollegeCareerRoom/roomAndTimeList` | 服务不在源码 | no | 未录到 | shared.uc.appointment |
| uc | POST | `/xf-college/careerTalk/xfCollegeCareerTalk/addCompany` | 服务不在源码 | no | 未录到 | shared.uc.appointment |
| uc | POST | `/xf-college/careerTalk/xfCollegeCareerTalk/cancelCompany` | 服务不在源码 | no | 未录到 | page.uc.teachInManage |
| uc | POST | `/xf-college/careerTalk/xfCollegeCareerTalk/cancelUnsubscribe` | 服务不在源码 | no | 未录到 | page.uc.teachInCancel |
| uc | POST | `/xf-college/careerTalk/xfCollegeCareerTalk/queryTalkDetailById` | 服务不在源码 | no | 未录到 | shared.uc.appointment |
| uc | POST | `/xf-college/careerTalk/xfCollegeCareerTalk/queryTalkListInfo` | 服务不在源码 | no | 未录到 | page.uc.teachInCancel, page.uc.teachInManage |
| uc | POST | `/xf-college/careerTalk/xfCollegeCareerTalk/updateSigninNum` | 服务不在源码 | no | 未录到 | page.uc.teachIn |
| uc | POST | `/xf-college/careerTalkPosition/xfCollegeCareerTalkPosition/listPositionForCareerTalk` | 服务不在源码 | no | 未录到 | shared.uc.appointment |
| uc | POST | `/xf-college/careerTalkStudent/xfCollegeCareerTalkStudent/cancelStudent` | 服务不在源码 | no | 未录到 | page.uc.teachIn |
| uc | GET | `/xf-college/careerTalkStudent/xfCollegeCareerTalkStudent/queryAttendanceListByCareerTalkId` | 服务不在源码 | no | 未录到 | shared.uc.appointment |
| uc | GET | `/xf-college/careerTalkStudent/xfCollegeCareerTalkStudent/queryListInfoByCareerTalkId` | 服务不在源码 | no | 未录到 | shared.uc.appointment |
| uc | POST | `/xf-college/careerTalkStudent/xfCollegeCareerTalkStudent/queryTalkStudentListInfo` | 服务不在源码 | no | 未录到 | page.uc.teachIn |
| uc | POST | `/xf-college/careerTimeBucket/xfCollegeCareerTimeBucket/queryGroupByCtbDate` | 服务不在源码 | no | 未录到 | shared.uc.appointment |
| uc | POST | `/xf-college/collegeWqCompanyExpand/xfCollegeWqCompanyExpand/add` | 服务不在源码 | no | 未录到 | page.uc.sign.corpInfo |
| uc | POST | `/xf-college/collegeWqCompanyExpand/xfCollegeWqCompanyExpand/edit` | 服务不在源码 | no | 未录到 | page.uc.sign.corpInfo |
| uc | POST | `/xf-college/collegeWqCompanyExpand/xfCollegeWqCompanyExpand/getWqCompanyExpandInfoByJob` | 服务不在源码 | no | 未录到 | page.uc.collage.studentApply, page.uc.sign.corpApply, page.uc.sign.corpInfo 等 7 张 |
| uc | POST | `/xf-college/collegeWqCompanyExpand/xfCollegeWqCompanyExpand/queryPageList` | 服务不在源码 | no | 未录到 | page.uc.collage.studentApply, seg.uc.collage.studentApply.1, seg.uc.collage.studentApply.2 |
| uc | POST | `/xf-college/collegeWqSignDetail/xfCollegeWqSignDetail/notarizeOrRevocationSign` | 服务不在源码 | no | 未录到 | page.uc.sign.corpApply, seg.uc.sign.corpApply.1, seg.uc.sign.corpApply.2 |
| uc | POST | `/xf-college/collegeWqSignDetail/xfCollegeWqSignDetail/queryList` | 服务不在源码 | no | 未录到 | page.uc.sign.corpApply, seg.uc.sign.corpApply.1, seg.uc.sign.corpApply.2 |
| uc | POST | `/xf-college/collegeWqSignDetail/xfCollegeWqSignDetail/signCompany` | 服务不在源码 | no | 未录到 | page.uc.collage.studentApply, seg.uc.collage.studentApply.1, seg.uc.collage.studentApply.2 |
| uc | POST | `/xf-college/collegeWqSignDetail/xfCollegeWqSignDetail/studentNotarizeOrRevocationSign` | 服务不在源码 | no | 未录到 | page.uc.collage.studentApply, seg.uc.collage.studentApply.1, seg.uc.collage.studentApply.2 |
| uc | POST | `/xf-college/student/xfCollegeStudent/edit` | 服务不在源码 | no | 未录到 | page.uc.collage.studentInfo |
| uc | POST | `/xf-college/student/xfCollegeStudent/getStudentInfoById` | 服务不在源码 | no | 未录到 | page.uc.collage.nojob, page.uc.collage.studentApply, page.uc.collage.studentInfo 等 5 张 |
| uc | GET | `/xf-college/student/xfCollegeStudent/queryById` | 服务不在源码 | no | 未录到 | page.uc.sign.corpApply, seg.uc.sign.corpApply.1, seg.uc.sign.corpApply.2 |
| uc | POST | `/xf-college/wqCancelDetail/xfCollegeWqCancelDetail/applyForCancel` | 服务不在源码 | no | 未录到 | page.uc.collage.studentApply, page.uc.sign.corpApply, seg.uc.collage.studentApply.1 等 6 张 |
| uc | POST | `/xf-college/wqCancelDetail/xfCollegeWqCancelDetail/byNotarizeOrRevocationCancel` | 服务不在源码 | no | 未录到 | page.uc.collage.studentApply, page.uc.sign.corpApply, seg.uc.collage.studentApply.1 等 6 张 |
| uc | POST | `/xf-college/wqCancelDetail/xfCollegeWqCancelDetail/queryList` | 服务不在源码 | no | 未录到 | page.uc.collage.studentApply, page.uc.sign.corpApply, seg.uc.collage.studentApply.1 等 6 张 |
| uc | POST | `/xf-college/wqStudResult/xfCollegeWqStudResult/add` | 服务不在源码 | no | 未录到 | page.uc.collage.nojob |
| uc | POST | `/xf-college/wqStudResult/xfCollegeWqStudResult/getWqStudResultInfoById` | 服务不在源码 | no | 未录到 | page.uc.collage.studentApply, page.uc.sign.corpApply, seg.uc.collage.studentApply.1 等 6 张 |
| uc | GET | `/xf-college/wqStudResult/xfCollegeWqStudResult/queryById` | 服务不在源码 | no | 未录到 | page.uc.collage.nojob |
| uc | GET | `/xf-talent/talent/xfTalentCgraduateRltSubsidy/checkIdCard` | 服务不在源码 | no | 未录到 | page.uc.formDone |
| uc | POST | `/xf-talent/talent/xfTalentCgraduateRltSubsidy/list` | 服务不在源码 | no | 404×1 | page.uc.doneList |
| uc | GET | `/xf-talent/talent/xfTalentCgraduateRltSubsidy/queryById` | 服务不在源码 | no | 未录到 | page.uc.formDone |
| uc | POST | `/xf-talent/talent/xfTalentCgraduateRltSubsidy/saveOrupdate` | 服务不在源码 | no | 未录到 | page.uc.formDone |
| uc | GET | `/xf-talent/talent/xfTalentCraftsmanSubsidys/checkIdCard` | 服务不在源码 | no | 未录到 | page.uc.formDone |
| uc | POST | `/xf-talent/talent/xfTalentCraftsmanSubsidys/list` | 服务不在源码 | no | 未录到 | page.uc.doneList |
| uc | GET | `/xf-talent/talent/xfTalentCraftsmanSubsidys/queryById` | 服务不在源码 | no | 未录到 | page.uc.formDone |
| uc | POST | `/xf-talent/talent/xfTalentCraftsmanSubsidys/saveOrUpdate` | 服务不在源码 | no | 未录到 | page.uc.formDone |
| uc | GET | `/xf-talent/talent/xfTalentPfiPromotion/checkIdCard` | 服务不在源码 | no | 未录到 | page.uc.formDone |
| uc | POST | `/xf-talent/talent/xfTalentPfiPromotion/list` | 服务不在源码 | no | 未录到 | page.uc.doneList |
| uc | GET | `/xf-talent/talent/xfTalentPfiPromotion/queryById` | 服务不在源码 | no | 未录到 | page.uc.formDone |
| uc | POST | `/xf-talent/talent/xfTalentPfiPromotion/saveOrUpdate` | 服务不在源码 | no | 未录到 | page.uc.formDone |
| uc | GET | `/xf-talent/talent/xfTalentPostdocPerk/checkIdCard` | 服务不在源码 | no | 未录到 | page.uc.formDone |
| uc | POST | `/xf-talent/talent/xfTalentPostdocPerk/list` | 服务不在源码 | no | 未录到 | page.uc.doneList |
| uc | GET | `/xf-talent/talent/xfTalentPostdocPerk/queryById` | 服务不在源码 | no | 未录到 | page.uc.formDone |
| uc | POST | `/xf-talent/talent/xfTalentPostdocPerk/saveOrUpdate` | 服务不在源码 | no | 未录到 | page.uc.formDone |
| uc | POST | `/xf-talent/talent/xfTalentStayUniversity/addCollegeInfo` | 服务不在源码 | no | 未录到 | page.uc.doneList |
| uc | POST | `/xf-talent/talent/xfTalentStayUniversity/getCollegeInfo` | 服务不在源码 | no | 未录到 | page.uc.doneList, page.uc.formDone |
| uc | POST | `/xf-talent/talent/xfTalentStayUniversity/list` | 服务不在源码 | no | 未录到 | page.uc.doneList |
| uc | GET | `/xf-talent/talent/xfTalentStayUniversity/queryById` | 服务不在源码 | no | 未录到 | page.uc.formDone |
| uc | POST | `/xf-talent/talent/xfTalentStayUniversity/saveOrUpdate` | 服务不在源码 | no | 未录到 | page.uc.formDone |

### 前端路径缺服务前缀（原包缺陷）

| 应用 | 方法 | 路径 | 后端 | 调用方（工单） |
| --- | --- | --- | --- | --- |
| portal | GET | `/alliance/curriculumVitaeDeliver/listNoPageForDeliver` | 补任何服务前缀都没有 | shared.portal.resumemodal |
| portal | POST | `/job/licenseFree/xfJobBigDataContent/refreshContent` | 补前缀后有：/xf-job | page.portal.xjhm.bigData.newBigdata |
| portal | POST | `/job/licenseFree/xfJobCompanyPosition/recommendJobList` | 补前缀后有：/xf-job | page.portal.cityHome.index, seg.portal.cityHome.index.1, seg.portal.cityHome.index.2 |
| portal | POST | `/job/licenseFree/xfJobGovRecruitCompany/noPagelist` | 补前缀后有：/xf-job | page.portal.sjz.unitMain.unitMain |
| portal | POST | `/job/licenseFree/xfJobGovRecruitPosition/noPagelist` | 补前缀后有：/xf-job | page.portal.sjz.unitMain.unitMain |
| portal | GET | `/job/xfJobCompany/getCompanyInfo` | 补前缀后有：/xf-job | page.portal.guide.index, seg.portal.guide.index.1, seg.portal.guide.index.2 |
| portal | GET | `/talents/information` | 补任何服务前缀都没有 | page.portal.talents.overseasRecruitment.index |
| uc | POST | `/job/licenseFree/xfJobLiveCurriculumVitaeDeliver/setStatus` | 补任何服务前缀都没有 | shared.uc.setStatusinterview |
| uc | POST | `/job/xfJobCompanyPosition/historyUsePositionList` | 补前缀后有：/xf-job | shared.uc.extractpositionmodal |
| uc | POST | `/job/xfJobComplaintRecord/undoComplaint` | 补前缀后有：/xf-job | page.uc.myaccuse |
| uc | GET | `/job/xfJobCurriculumVitae/viewCaredSeekerFromCompany` | 补前缀后有：/xf-job | page.uc.previewresume |
| uc | POST | `/job/xfJobEntrepreneurial/izQueyByIdCard` | 补前缀后有：/xf-job | page.uc.myRegistration |
| uc | POST | `/job/xfJobLoanApplyCompany/saveOrUpdateMh` | 补前缀后有：/xf-job | page.uc.corpLoan.corpLoanInfo |
| uc | POST | `/job/xfJobVitaeTemplate/vitaeTempListByType` | 补前缀后有：/xf-job | page.uc.enterprisetemplate |
| uc | POST | `/oddjob/xfOddUserBrowse/browseRecords` | 补前缀后有：/xf-oddjob | page.uc.lookList |

url 字面量带首尾空格（原包缺陷，浏览器会把空格编码进路径）：

- portal POST `/xf-job/job/licenseFree/xfJobFair/queryPageZcyzList`（去空格后后端有）

### 其他 url 字面量（不是请求配置：上传 action、拼接的下载/预览链接等）

| 应用 | 路径 | 位置 | 后端 |
| --- | --- | --- | --- |
| portal | `/liveTelecastWebsocket/` | const | 补任何服务前缀都没有 |
| portal | `/jeecg-system/sys/common/static` | assign | 有（pathvar） |
| portal | `/jeecg-system/sys/logout` | assign | 有（exact） |
| portal | `/jeecg-system/sys/common/upload` | assign | 有（exact） |
| portal | `/jeecg-system/sys/randomImage/{}` | assign | 有（pathvar） |
| portal | `/xf-job/school/user/slidesSgzSms` | assign | 有（exact） |
| portal | `/xf-authentication/authentication/licenseFree/slidesSms` | assign | 服务 xf-authentication 不在后端源码里 |
| portal | `/xf-common/common/licenseFree/invoice/check` | assign | 有（exact） |
| portal | `/xf-common/common/licenseFree/invoice/genCaptcha` | requestCaptchaDataUrl | 有（exact） |
| uc | `/xf-common/common/licenseFree/invoice/genCaptcha` | requestCaptchaDataUrl | 有（exact） |
| uc | `/payRecordQuery/licenseFree` | const | 补任何服务前缀都没有 |
| uc | `/jeecg-system/sys/common/upload` | assign | 有（exact） |
| uc | `/jeecg-system/sys/common/static` | const | 有（pathvar） |
| uc | `/xf-job/communal/xfSysMultiDict/getDictListByType` | ConditionalExpression | 有（exact） |
| uc | `/jeecg-system/sys/logout` | assign | 有（exact） |
| uc | `/jeecg-system/sys/randomImage/{}` | assign | 有（pathvar） |

### 测试环境录到、后端没有

| 方法 | 路径 | 状态码 | 原因 | 前端范围 |
| --- | --- | --- | --- | --- |
| POST | `/xf-talent/talent/xfTalentCgraduateRltSubsidy/list` | 404×1 | 服务 xf-talent 不在后端源码里 | hami |

### 方法不一致

- uc `/xf-job/workshop/xfCommonProsperityJobApplyInfo/queryById4UserCenter`：前端 GET，后端 POST

### 参数名不一致

| 应用 | 方法 | 路径 | 差异 |
| --- | --- | --- | --- |
| portal | POST | `/xf-job/communal/licenseFree/quenaire/preview` | 后端不接收：xfSysUserId |
| portal | POST | `/xf-job/communal/licenseFree/quenaire/submit` | 后端不接收：customCopywriting, recordAnonyStatus, recordAnonyStatusText |
| portal | GET | `/xf-job/communal/licenseFree/xfSysAreainfo/getInfo` | 后端不接收：type |
| portal | GET | `/xf-job/communal/licenseFree/xfSysConsult/queryMoreClassicQandA` | 后端不接收：fromType, izClassic, realName, value |
| portal | POST | `/xf-job/communal/xfSysArticlePositionDeliver/deliver` | 后端不接收：name, positionIds |
| portal | POST | `/xf-job/communal/xfSysQuenaireRecord/staggingOrSubmit` | 后端不接收：customCopywriting, recordAnonyStatus, recordAnonyStatusText |
| portal | POST | `/xf-job/communal/xfSysUser/saveForUserCenter` | 后端不接收：ssq, time |
| portal | POST | `/xf-job/job/licenseFree/findJobListForWebRedis` | 后端不接收：jobFairType, ssq, workAreaName, workCityName, workProviceName, workTownsName, workVillageName |
| portal | POST | `/xf-job/job/licenseFree/findJobList` | 后端不接收：ssq, workAreaName, workCityName, workProviceName, workTownsName, workVillageName |
| portal | POST | `/xf-job/job/licenseFree/freeCompanyExpandList` | 后端不接收：companyId, politicalOrientation, ssq, workNature |
| portal | POST | `/xf-job/job/licenseFree/freeCompanyListByTags` | 后端不接收：salaryLevel |
| portal | POST | `/xf-job/job/licenseFree/freeCompanyList` | 后端不接收：sort |
| portal | POST | `/xf-job/job/licenseFree/getAllLevelArticleListByTypeId` | 后端不接收：status |
| portal | POST | `/xf-job/job/licenseFree/getArticleListByTypeCodes` | 后端不接收：pageNo, pageSize |
| portal | POST | `/xf-job/job/licenseFree/getArticleListByTypeIds` | 后端不接收：pageNo, pageSize |
| portal | GET | `/xf-job/job/licenseFree/getArticleList` | 后端不接收：pageNum, status |
| portal | POST | `/xf-job/job/licenseFree/getArticleListNoCheck` | 后端不接收：areaId, provincialLevel, typeCode |
| portal | POST | `/xf-job/job/licenseFree/getChildArticleTypeList` | 后端不接收：pageNo, pageSize, provincialLevel, terminalType |
| portal | POST | `/xf-job/job/licenseFree/getNewsTrendPage` | 后端不接收：areaId, provincialLevel |
| portal | GET | `/xf-job/job/licenseFree/xfJobBigDataViewSettings/queryAllInfoById` | 后端不接收：izRefresh |
| portal | POST | `/xf-job/job/licenseFree/xfJobCompanyPosition/recommendJobList` | 后端不接收：sort |
| portal | GET | `/xf-job/job/licenseFree/xfJobCurriculumVitae/searchListForWebsite` | 后端不接收：hopeWorkAreaName, hopeWorkCityName, hopeWorkProviceName, hopeWorkTownsName, hopeWorkVillageName, id, positionTypeTextName, ssq |
| portal | POST | `/xf-job/job/licenseFree/xfJobCustomerKnowledgeBase/queryLatestQuestionsList` | 后端不接收：parentId |
| portal | POST | `/xf-job/job/licenseFree/xfJobCustomerKnowledgeBase/queryQuestionsListByParams` | 后端不接收：organizationId |
| portal | POST | `/xf-job/job/licenseFree/xfJobCustomerKnowledgeBase/queryQuickQuestionsList` | 后端不接收：pages, parentId, total |
| portal | POST | `/xf-job/job/licenseFree/xfJobFairApplyInfo/queryAttendeesCompany` | 后端不接收：dataSourceType |
| portal | POST | `/xf-job/job/licenseFree/xfJobLiveTelecast/updateLikeNum` | 后端不接收：action |
| portal | POST | `/xf-job/job/licenseFree/xfJobLiveTelecastPosition/queryCompanyAndPositionList` | 后端不接收：pageNo, pageSize, sysUserId |
| portal | GET | `/xf-job/job/licenseFree/xfJobPxCourse/listForWebsite` | 后端不接收：ssq |
| portal | GET | `/xf-job/job/licenseFree/xfJobUserTutorExpand/hotlistForWebsite` | 后端不接收：fromType |
| portal | GET | `/xf-job/job/licenseFree/xfJobUserTutorExpand/listForWebsite` | 后端不接收：fromType, ssq, value |
| portal | POST | `/xf-job/job/xfJobCompany/submitNewGuideCompanyInfo` | 后端不接收：ssq |
| portal | POST | `/xf-job/job/xfJobComplaintRecord/add` | 后端不接收：name, phone |
| portal | GET | `/xf-job/job/xfJobCurriculumVitae/list` | 后端不接收：pagesize |
| portal | GET | `/xf-job/job/xfJobCurriculumVitae/listNoPageForDeliver` | 后端不接收：careerTalkId, curriculumVitaeId, dataSourceType, dataSourceTypeText, fairsId, sysUserId |
| portal | POST | `/xf-job/job/xfJobCurriculumVitae/save` | 后端不接收：industryNature, ssq |
| portal | POST | `/xf-job/job/xfJobCurriculumVitaeDeliver/addBatch` | 后端不接收：sysUserId |
| portal | GET | `/xf-job/job/xfJobCurriculumVitaeDeliver/add` | 后端不接收：careerTalkId, sysUserId |
| portal | POST | `/xf-job/job/xfJobInterviewInvitation/interviewInvitation` | 后端不接收：interviewTime1, positionType, positionTypeText |
| portal | POST | `/xf-job/job/xfSysConsult/saveOne` | 后端不接收：intro, name, websiteName |
| portal | POST | `/xf-job/school/user/newRegister` | 后端不接收：aginpassword, checked |
| portal | POST | `/xf-job/school/user/phoneLogin` | 后端不接收：checkKey |
| portal | POST | `/xf-oddjob/oddJob/licenseFree/appletList` | 后端不接收：dataSourceType, jobBeginTime, jobEndTime, oddJobUseNum, salaryLevel, settlementWay, settlementWayText, sort |
| portal | POST | `/xf-oddjob/oddJob/licenseFree/appletShareSurplusJobList` | 后端不接收：dataSourceType, jobBeginTime, jobEndTime, oddJobUseNum, salaryLevel, settlementWay, settlementWayText, sort |
| portal | POST | `/xf-oddjob/oddJob/licenseFree/findJoblist` | 后端不接收：izToolsText, jobBeginTime, jobEndTime, oddJobUseNum, orgCode, positionTypeText, settlementWayText, workWayText |
| portal | GET | `/xf-oddjob/oddJob/licenseFree/findJobQueryById` | 后端不接收：userId |
| portal | GET | `/xf-oddjob/oddJob/licenseFree/getDetailById` | 后端不接收：userId |
| portal | POST | `/xf-oddjob/oddJob/licenseFree/needJoblist` | 后端不接收：izToolsText, oddJobUseNumValue, orgCode, positionTypeText, settlementWayText, workWayText |
| portal | GET | `/xf-oddjob/oddJob/licenseFree/queryById` | 后端不接收：userId |
| portal | POST | `/xf-oddjob/oddJob/licenseFree/querySearchPersonList` | 后端不接收：dataSourceType, sort |
| uc | GET | `/xf-job/communal/licenseFree/xfSysAreainfo/getInfo` | 后端不接收：type |
| uc | POST | `/xf-job/communal/xfSysArticle/addOrEditRecruitment` | 后端不接收：doc, fileName, filePath, ssq, time, townsId, townsName, villageId, villageName |
| uc | POST | `/xf-job/communal/xfSysArticlePositionDeliver/getDeliverList` | 后端不接收：educationText, lookupStatusText |
| uc | POST | `/xf-job/communal/xfSysAttachment/addBatchCompanyAttachment` | 后端不接收：type |
| uc | POST | `/xf-job/communal/xfSysUser/beSchoolGraduate` | 后端不接收：time, xfSysUserId |
| uc | POST | `/xf-job/communal/xfSysUser/saveForUserCenter` | 后端不接收：ssq, time, xfSysUserId |
| uc | GET | `/xf-job/communal/xfSysUser/setXfSysUserPhoto` | 后端不接收：headSculpturePath |
| uc | POST | `/xf-job/job/licenseFree/queryCompanyPersonInfoRegister` | 后端不接收：jobFairTypeZcyz |
| uc | GET | `/xf-job/job/licenseFree/workshop/positionType/listByParentId` | 后端不接收：async |
| uc | POST | `/xf-job/job/xfJobCompany/queryCompanyJobFairInfo` | 后端不接收：checkStatusText, hopeWorkAreaId, hopeWorkAreaName, hopeWorkCityId, hopeWorkCityName, hopeWorkProviceId, hopeWorkProviceName, hopeWorkTownsId, hopeWorkTownsName, hopeWorkVillageId, hopeWorkVillageName, jobFairStatusText, ssq |
| uc | POST | `/xf-job/job/xfJobCompany/sumbitImportantCompanyInfo` | 后端不接收：beginTime1, endTime1, ssq |
| uc | POST | `/xf-job/job/xfJobCompany/sumbitVerifyInfo` | 后端不接收：beginTime1, endTime1, ssq |
| uc | GET | `/xf-job/job/xfJobCompanyCurriculumDownload/getDownloadList` | 后端不接收：checkStatus, checkStatusText, jobFairName, name, positionStatus, positionStatusText |
| uc | POST | `/xf-job/job/xfJobCompanyExpand/certificationUser` | 后端不接收：internshipOrganizationName, name |
| uc | POST | `/xf-job/job/xfJobCompanyExpand/editAdmin` | 后端不接收：companyName |
| uc | POST | `/xf-job/job/xfJobCompanyPosition/addOrEdit` | 后端不接收：beginTime1, endTime1, ssq |
| uc | GET | `/xf-job/job/xfJobCompanyPosition/detailById` | 后端不接收：classify |
| uc | GET | `/xf-job/job/xfJobCompanyPosition/listNew` | 后端不接收：checkStatusText, fromType, jobFairBoothId, jobFairName, jobFairType, positionStatusText, type |
| uc | GET | `/xf-job/job/xfJobCompanyTalents/queryCompanyTalentlist` | 后端不接收：xfSysUserId |
| uc | POST | `/xf-job/job/xfJobComplaintRecord/add` | 后端不接收：name, phone |
| uc | POST | `/xf-job/job/xfJobCredentials/add` | 后端不接收：time |
| uc | POST | `/xf-job/job/xfJobCredentials/edit` | 后端不接收：time |
| uc | POST | `/xf-job/job/xfJobCurriculumVitae/save` | 后端不接收：ssq, welfareRequestsTextlinshi |
| uc | GET | `/xf-job/job/xfJobCurriculumVitaeDeliver/queryPageListByCompanyIdAndJobFairType` | 后端不接收：lookupStatusText, statusText |
| uc | POST | `/xf-job/job/xfJobCurriculumVitaeDeliver/queryPageListByCompanyIdForFair` | 后端不接收：lookupStatusText, statusText |
| uc | GET | `/xf-job/job/xfJobCurriculumVitaeDeliver/queryPageListByCompanyId` | 后端不接收：lookupStatusText, statusText |
| uc | GET | `/xf-job/job/xfJobCurriculumVitaeSearch/queryPageListByCompanyId` | 后端不接收：checkStatus, checkStatusText, fromType, lookupStatusText, name, positionStatus, positionStatusText, statusText, type |
| uc | POST | `/xf-job/job/xfJobEducationalExperience/add` | 后端不接收：checked, timejiesu, timekaishi |
| uc | POST | `/xf-job/job/xfJobEducationalExperience/edit` | 后端不接收：checked, timejiesu, timekaishi |
| uc | POST | `/xf-job/job/xfJobEntrepreneurial/listPage` | 后端不接收：entrepreneurialTypeText |
| uc | POST | `/xf-job/job/xfJobFair/list` | 后端不接收：jobFairTypeText, sqBeginTime, sqEndTime |
| uc | POST | `/xf-job/job/xfJobFair/myBoothList` | 后端不接收：checkStatuss, jbBeginTime, jbEndTime, jobFairTypeZcyz, sqBeginTime, sqEndTime |
| uc | POST | `/xf-job/job/xfJobFair/myJobFairList` | 后端不接收：advertiseTypeName |
| uc | POST | `/xf-job/job/xfJobFairApplyInfoPerson/queryMySubscribeFair` | 后端不接收：ssq, townsId, townsName, villageId, villageName |
| uc | POST | `/xf-job/job/xfJobFairPositionRelation/addPosition` | 后端不接收：ssq |
| uc | POST | `/xf-job/job/xfJobFairPositionRelation/editPosition` | 后端不接收：ssq |
| uc | POST | `/xf-job/job/xfJobFairPositionRelation/listForAdmin` | 后端不接收：callIden, checkStatusText |
| uc | POST | `/xf-job/job/xfJobFairUnsubscribeAuditRecord/list` | 后端不接收：checkStatusText, regionJobFairType |
| uc | POST | `/xf-job/job/xfJobInterviewInvitation/interviewInvitationByFair` | 后端不接收：interviewTime1, jobType, positionType, positionTypeText |
| uc | POST | `/xf-job/job/xfJobInterviewInvitation/interviewInvitation` | 后端不接收：interviewTime1, jobType, positionType, positionTypeText |
| uc | GET | `/xf-job/job/xfJobInterviewInvitation/queryPageInterviewListByCompanyId` | 后端不接收：acceptInvitationStatusText, lookupStatus, lookupStatusText, status, statusText |
| uc | GET | `/xf-job/job/xfJobLiveTelecastApply/list` | 后端不接收：hopeLiveTimeType |
| uc | POST | `/xf-job/job/xfJobLiveTelecastApply/save` | 后端不接收：dataSource, positionName |
| uc | GET | `/xf-job/job/xfJobOverseasRecruitRegistration/list` | 后端不接收：overseasRecruitNoticeTypeText |
| uc | POST | `/xf-job/job/xfJobSubscribeRecord/add` | 后端不接收：enableStatus1, ssq, value1, value2, welfareRequestsTextlinshi |
| uc | POST | `/xf-job/job/xfJobUserCare/getAlliancePositionForMyCare` | 后端不接收：xfSysUserId |
| uc | GET | `/xf-job/job/xfJobUserCare/getCareListForCompany` | 后端不接收：fromType, type, xfSysUserId |
| uc | POST | `/xf-job/job/xfJobUserCompany/addUserForCompany` | 后端不接收：xfSysUserId |
| uc | POST | `/xf-job/job/xfJobUserCompany/changeUserForCompany` | 后端不接收：xfSysUserId |
| uc | POST | `/xf-job/job/xfJobUserSchoolExpert/saveOneForUserCenter` | 后端不接收：ssq, valueor |
| uc | GET | `/xf-job/job/xfJobUserTutorExpand/queryIzExistByIdPhone` | 后端不接收：userId |
| uc | POST | `/xf-job/job/xfJobUserTutorExpand/saveOneForUserCenter` | 后端不接收：ssq, valueor |
| uc | POST | `/xf-job/job/xfJobWorkExperience/add` | 后端不接收：checked, timejiesu, timekaishi |
| uc | POST | `/xf-job/job/xfJobWorkExperience/edit` | 后端不接收：checked, timejiesu, timekaishi |
| uc | GET | `/xf-job/job/xfSysConsult/queryJoinedForUserCenter` | 后端不接收：izClassicText, izPublicText |
| uc | GET | `/xf-job/job/xfSysConsult/queryListForUserCenter` | 后端不接收：izClassicText, izPublicText, replyStatusText, typeText |
| uc | POST | `/xf-job/workshop/xfCommonProsperityJobApplyInfo/addOrEditApplyInfo4UserCenter` | 后端不接收：checked |
| uc | POST | `/xf-job/workshop/xfCommonProsperityJobApplyUser/addOrEdit4UserCenter` | 后端不接收：birthday, idType, idTypeText, ssq, sysUserId |
| uc | POST | `/xf-oddjob/oddJob/xfOddFindJobInfo/add` | 后端不接收：checked, salaryPayment, salaryPaymentText, ssq |
| uc | POST | `/xf-oddjob/oddJob/xfOddFindJobInfo/edit` | 后端不接收：checked, salaryPayment, salaryPaymentText, ssq |
| uc | POST | `/xf-oddjob/oddJob/xfOddNeedJobInfo/add` | 后端不接收：checked, ssq |
| uc | POST | `/xf-oddjob/oddJob/xfOddNeedJobInfo/edit` | 后端不接收：checked, ssq |
| uc | POST | `/xf-oddjob/oddjob/xfOddShareLackJobInfo/add` | 后端不接收：advertiseType, advertiseTypeText, beginTime1, classify, classifyText, dataSourceType, dataSourceTypeText, endTime1, majorRequirement, majorRequirementText, name, rideRoute, sex, sexText, ssq, workNature, workNatureText |
| uc | POST | `/xf-oddjob/oddjob/xfOddShareLackJobInfo/edit` | 后端不接收：advertiseType, advertiseTypeText, beginTime1, classify, classifyText, dataSourceType, dataSourceTypeText, endTime1, majorRequirement, majorRequirementText, name, rideRoute, sex, sexText, ssq, workNature, workNatureText |
| uc | POST | `/xf-oddjob/oddjob/xfOddShareSurplusJobInfo/add` | 后端不接收：advertiseType, advertiseTypeText, beginTime, beginTime1, classify, classifyText, companyBenefits, companyBenefitsText, dataSourceType, dataSourceTypeText, endTime, endTime1, majorRequirement, majorRequirementText, name, rideRoute, sex, sexText, ssq, workNature, workNatureText, workYears, workYearsText |
| uc | POST | `/xf-oddjob/oddjob/xfOddShareSurplusJobInfo/edit` | 后端不接收：advertiseType, advertiseTypeText, beginTime, beginTime1, classify, classifyText, companyBenefits, companyBenefitsText, dataSourceType, dataSourceTypeText, endTime, endTime1, majorRequirement, majorRequirementText, name, rideRoute, sex, sexText, ssq, workNature, workNatureText, workYears, workYearsText |
| uc | POST | `/xf-oddjob/oddjob/xfOddUser/userRelease` | 后端不接收：checkStatusText |

### 传参位置不一致

| 应用 | 方法 | 路径 | 差异 |
| --- | --- | --- | --- |
| portal | POST | `/xf-job/communal/licenseFree/xfSysAreainfo/getAllInfo` | 前端以 JSON 请求体（data）发送，后端没有 @RequestBody（参数按 query/表单绑定） |
| portal | POST | `/xf-job/job/licenseFree/queryHomeSettingById` | 前端以 JSON 请求体（data）发送，后端没有 @RequestBody（参数按 query/表单绑定） |
| portal | POST | `/xf-job/job/xfJobLoanApplyCompany/checkIsCanAdd` | 前端以 JSON 请求体（data）发送，后端没有 @RequestBody（参数按 query/表单绑定） |
| portal | POST | `/xf-job/job/xfJobLoanApplyPerson/checkIsCanAdd` | 前端以 JSON 请求体（data）发送，后端没有 @RequestBody（参数按 query/表单绑定） |
| portal | POST | `/xf-job/school/user/portalSingleLogin` | 前端以 query（params）发送，后端要求 @RequestBody |
| uc | POST | `/jeecg-system/sys/common/upload` | 前端以 JSON 请求体（data）发送，后端没有 @RequestBody（参数按 query/表单绑定） |
| uc | POST | `/xf-job/communal/xfSysAreainfo/getAllInfo` | 前端以 JSON 请求体（data）发送，后端没有 @RequestBody（参数按 query/表单绑定） |
| uc | POST | `/xf-job/job/xfJobBrowsingHistory/deleteAll` | 前端以 JSON 请求体（data）发送，后端没有 @RequestBody（参数按 query/表单绑定） |
| uc | POST | `/xf-job/job/xfJobCompanyPosition/getrefreshTime` | 前端以 JSON 请求体（data）发送，后端没有 @RequestBody（参数按 query/表单绑定） |
| uc | POST | `/xf-job/job/xfJobCompanyPosition/listNewForPoster` | 前端以 JSON 请求体（data）发送，后端没有 @RequestBody（参数按 query/表单绑定） |
| uc | POST | `/xf-job/job/xfJobCurriculumVitae/saveVitaeTemplateId` | 前端以 JSON 请求体（data）发送，后端没有 @RequestBody（参数按 query/表单绑定） |
| uc | POST | `/xf-job/job/xfJobFair/xfJobFairApplyInfo/fairParticipationToHtml` | 前端以 JSON 请求体（data）发送，后端没有 @RequestBody（参数按 query/表单绑定） |
| uc | POST | `/xf-job/job/xfJobGovRecruitNotice/ticketToHtml` | 前端以 JSON 请求体（data）发送，后端没有 @RequestBody（参数按 query/表单绑定） |
| uc | POST | `/xf-job/job/xfJobLoanApplyCompany/checkIsCanAdd` | 前端以 JSON 请求体（data）发送，后端没有 @RequestBody（参数按 query/表单绑定） |
| uc | POST | `/xf-job/job/xfJobLoanApplyCompany/queryCompanyInfo` | 前端以 JSON 请求体（data）发送，后端没有 @RequestBody（参数按 query/表单绑定） |
| uc | POST | `/xf-job/job/xfJobLoanApplyPerson/checkIsCanAdd` | 前端以 JSON 请求体（data）发送，后端没有 @RequestBody（参数按 query/表单绑定） |
| uc | POST | `/xf-job/job/xfJobLoanApplyPerson/listForUserCenter` | 前端以 JSON 请求体（data）发送，后端没有 @RequestBody（参数按 query/表单绑定） |
| uc | POST | `/xf-job/job/xfJobVitaeTemplate/vitaeTempListForUserContent` | 前端以 JSON 请求体（data）发送，后端没有 @RequestBody（参数按 query/表单绑定） |
| uc | GET | `/xf-job/workshop/xfCommonProsperityJobApplyInfo/queryById4UserCenter` | 前端以 query（params）发送，后端要求 @RequestBody |

### 测试环境响应字段与后端返回类型

`多`：测试环境返回、后端类型里没有的字段；`少`：后端类型有、测试环境没返回的字段；`类型`：JSON 类型不同。路径以 `$` 表示响应根。

| 方法 | 路径 | 后端返回类型 | 多 | 少 | 类型 |
| --- | --- | --- | --- | --- | --- |
| GET | `/xf-job/communal/xfSysBusinessSetting/getSettingValueByCode` | `Result<XfSysBusinessSetting>` |  |  | $.result: string ≠ object |
| POST | `/xf-oddjob/oddJob/licenseFree/needJoblist` | `Result<IPage<XfOddNeedJobInfoVo>>` |  | $.result.records[].coordinateSystem |  |

逐键比对的范围：67 个接口的 `result` 有具体类型，合计比对 2664 个字段节点；另有 12 个接口后端声明 `Result<?>`/`Object`/`Map`/`JSONObject`，只比对了外层 `success/message/code/result/timestamp`。

### hmrsfw-vue 已还原代码里的接口

- `src/api` 已还原 15 个模块（门户 9、用户中心 6），每个模块的函数数和路径集合与对应旧 chunk 比对：不一致 apps/uc/src/api/api-56.ts。
- 已还原页面里直接写 url 的调用 81 处（17 个文件）；不在旧包清单里的：无。

### 前端接口模块逐一对账（门户 44 + 用户中心 20 = 64，另加导出请求函数的其他 chunk）

调用追踪自检（本清单算出的「哈密页面用到的 api 模块导出」对工单 `deps.api`）：portal 195 / 195，完全一致；uc 238 / 238，完全一致。

「函数」是导出的请求函数个数，「请求」把条件 url 的两个分支分开计；「restore-api」是 `tools/restore-api.mjs` 的正则能取到的函数数，差的逐条列在最后一列。「哈密用到 / 仅其他租户」按调用方 chunk 是否属于哈密工单计。

| 应用 | chunk | 函数 | 请求 | restore-api | 导出数 | 哈密用到 | 仅其他租户 | 无调用 | hmrsfw-vue 已还原 | 差异说明 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| portal | `hotProject.1783320636200.js` | 2 | 2 | — | 4 | 2 | 0 | 0 |  | 非 index.api chunk，导出了请求函数 |
| portal | `index.1783320636200.js` | 71 | 71 | — | 237 | 55 | 16 | 0 |  | 非 index.api chunk，导出了请求函数 |
| portal | `index.1783320636200117.js` | 22 | 22 | — | 18 | 21 | 0 | 1 | api-117.ts | 非 index.api chunk，导出了请求函数 |
| portal | `index.api.1783320636200.js` | 7 | 7 | 7 | 8 | 7 | 0 | 0 | api-1783320636200.ts |  |
| portal | `index.api.17833206362002.js` | 21 | 21 | 21 | 22 | 21 | 0 | 0 | api-17833206362002.ts |  |
| portal | `index.api.17833206362003.js` | 8 | 8 | 8 | 9 | 8 | 0 | 0 |  |  |
| portal | `index.api.17833206362004.js` | 9 | 9 | 9 | 10 | 9 | 0 | 0 |  |  |
| portal | `index.api.17833206362005.js` | 3 | 3 | 3 | 4 | 3 | 0 | 0 |  |  |
| portal | `index.api.17833206362006.js` | 4 | 4 | 4 | 5 | 3 | 1 | 0 |  |  |
| portal | `index.api.17833206362007.js` | 10 | 10 | 9 | 11 | 6 | 4 | 0 |  | restore-api 漏 a（/xf-job/job/xfJobCompanyCurriculumDownload/downPdf，headers 里有分号，正则在分号处截断） |
| portal | `index.api.17833206362008.js` | 9 | 9 | 9 | 10 | 8 | 1 | 0 | api-08.ts |  |
| portal | `index.api.17833206362009.js` | 3 | 3 | 3 | 4 | 0 | 3 | 0 |  |  |
| portal | `index.api.178332063620010.js` | 3 | 3 | 3 | 4 | 0 | 3 | 0 |  |  |
| portal | `index.api.178332063620011.js` | 8 | 8 | 8 | 9 | 8 | 0 | 0 |  |  |
| portal | `index.api.178332063620012.js` | 1 | 1 | 1 | 2 | 0 | 1 | 0 |  |  |
| portal | `index.api.178332063620013.js` | 6 | 6 | 6 | 7 | 5 | 1 | 0 |  |  |
| portal | `index.api.178332063620014.js` | 5 | 5 | 5 | 6 | 5 | 0 | 0 |  |  |
| portal | `index.api.178332063620015.js` | 6 | 6 | 6 | 7 | 5 | 1 | 0 | api-15.ts |  |
| portal | `index.api.178332063620016.js` | 3 | 3 | 3 | 4 | 0 | 3 | 0 |  |  |
| portal | `index.api.178332063620017.js` | 13 | 13 | 13 | 14 | 12 | 1 | 0 | api-17.ts |  |
| portal | `index.api.178332063620018.js` | 3 | 3 | 3 | 4 | 3 | 0 | 0 |  |  |
| portal | `index.api.178332063620019.js` | 1 | 1 | 1 | 2 | 0 | 1 | 0 |  |  |
| portal | `index.api.178332063620020.js` | 4 | 4 | 4 | 5 | 4 | 0 | 0 |  |  |
| portal | `index.api.178332063620021.js` | 6 | 6 | 6 | 7 | 6 | 0 | 0 |  |  |
| portal | `index.api.178332063620022.js` | 1 | 1 | 1 | 2 | 1 | 0 | 0 |  |  |
| portal | `index.api.178332063620023.js` | 5 | 5 | 5 | 6 | 4 | 1 | 0 |  |  |
| portal | `index.api.178332063620024.js` | 23 | 23 | 23 | 24 | 22 | 1 | 0 | api-24.ts |  |
| portal | `index.api.178332063620025.js` | 6 | 6 | 6 | 9 | 0 | 6 | 0 |  |  |
| portal | `index.api.178332063620026.js` | 16 | 16 | 16 | 17 | 1 | 15 | 0 |  |  |
| portal | `index.api.178332063620027.js` | 5 | 5 | 5 | 6 | 0 | 5 | 0 |  |  |
| portal | `index.api.178332063620028.js` | 6 | 6 | 6 | 7 | 3 | 3 | 0 |  |  |
| portal | `index.api.178332063620029.js` | 5 | 5 | 5 | 6 | 0 | 5 | 0 |  |  |
| portal | `index.api.178332063620030.js` | 12 | 12 | 12 | 13 | 0 | 12 | 0 |  |  |
| portal | `index.api.178332063620031.js` | 4 | 4 | 4 | 5 | 2 | 2 | 0 |  |  |
| portal | `index.api.178332063620032.js` | 2 | 2 | 2 | 3 | 2 | 0 | 0 |  |  |
| portal | `index.api.178332063620033.js` | 8 | 8 | 8 | 9 | 8 | 0 | 0 | api-178332063620033.ts |  |
| portal | `index.api.178332063620034.js` | 1 | 1 | 1 | 2 | 1 | 0 | 0 |  |  |
| portal | `index.api.178332063620035.js` | 5 | 5 | 5 | 6 | 5 | 0 | 0 |  |  |
| portal | `index.api.178332063620036.js` | 2 | 2 | 2 | 3 | 0 | 2 | 0 |  |  |
| portal | `index.api.178332063620037.js` | 5 | 5 | 5 | 6 | 5 | 0 | 0 |  |  |
| portal | `index.api.178332063620038.js` | 7 | 7 | 6 | 8 | 0 | 7 | 0 |  | restore-api 漏 g（/xf-job/job/xfJobCompanyCurriculumDownload/downPdf，headers 里有分号，正则在分号处截断） |
| portal | `index.api.178332063620039.js` | 2 | 2 | 2 | 3 | 2 | 0 | 0 |  |  |
| portal | `index.api.178332063620040.js` | 6 | 6 | 6 | 7 | 4 | 2 | 0 |  |  |
| portal | `index.api.178332063620041.js` | 4 | 4 | 4 | 5 | 4 | 0 | 0 |  |  |
| portal | `index.api.178332063620042.js` | 4 | 4 | 4 | 5 | 0 | 4 | 0 |  |  |
| portal | `index.api.178332063620043.js` | 12 | 12 | 12 | 13 | 0 | 12 | 0 |  |  |
| portal | `index.api.178332063620044.js` | 4 | 4 | 4 | 5 | 0 | 4 | 0 |  |  |
| portal | `index.apinew.1783320636200.js` | 2 | 2 | 2 | 3 | 1 | 1 | 0 |  |  |
| portal | `init.17833206362002.js` | 4 | 4 | — | 14 | 4 | 0 | 0 |  | 非 index.api chunk，导出了请求函数 |
| portal | `talentArea.1783320636200.js` | 2 | 2 | — | 5 | 2 | 0 | 0 |  | 非 index.api chunk，导出了请求函数 |
| portal | `teach.api.1783320636200.js` | 16 | 16 | 16 | 17 | 0 | 16 | 0 |  |  |
| uc | `confPass.1751615607545.js` | 2 | 2 | — | 3 | 2 | 0 | 0 |  | 非 index.api chunk，导出了请求函数 |
| uc | `Content.vue_vue_type_script_setup_true_lang.1751615607545.js` | 5 | 5 | — | 6 | 5 | 0 | 0 |  | 非 index.api chunk，导出了请求函数 |
| uc | `index.1751615607545.js` | 112 | 112 | — | 170 | 112 | 0 | 0 |  | 非 index.api chunk，导出了请求函数 |
| uc | `index.api.1751615607545.js` | 10 | 10 | 10 | 10 | 10 | 0 | 0 |  |  |
| uc | `index.api.17516156075452.js` | 6 | 6 | 6 | 6 | 6 | 0 | 0 |  |  |
| uc | `index.api.17516156075453.js` | 8 | 8 | 8 | 8 | 8 | 0 | 0 | api-17516156075453.ts |  |
| uc | `index.api.17516156075454.js` | 9 | 9 | 9 | 9 | 9 | 0 | 0 |  |  |
| uc | `index.api.17516156075455.js` | 22 | 22 | 22 | 22 | 22 | 0 | 0 | api-17516156075455.ts |  |
| uc | `index.api.17516156075456.js` | 65 | 65 | 63 | 65 | 65 | 0 | 0 | api-56.ts | restore-api 漏 t（/xf-job/job/xfJobCurriculumVitae/downPdf，headers 里有分号，正则在分号处截断）；restore-api 漏 aa（/xf-job/job/xfJobCompanyCurriculumDownload/downPdf，headers 里有分号，正则在分号处截断）；已还原文件 63 个函数 |
| uc | `index.api.17516156075457.js` | 10 | 10 | 10 | 10 | 10 | 0 | 0 |  |  |
| uc | `index.api.17516156075458.js` | 5 | 5 | 5 | 5 | 5 | 0 | 0 |  |  |
| uc | `index.api.17516156075459.js` | 5 | 5 | 5 | 5 | 5 | 0 | 0 |  |  |
| uc | `index.api.175161560754510.js` | 10 | 10 | 9 | 10 | 10 | 0 | 0 |  | restore-api 漏 f（/xf-job/job/xfJobCompanyCurriculumDownload/downPdf，headers 里有分号，正则在分号处截断） |
| uc | `index.api.175161560754511.js` | 13 | 13 | 13 | 13 | 13 | 0 | 0 | api-175161560754511.ts |  |
| uc | `index.api.175161560754512.js` | 15 | 15 | 15 | 15 | 15 | 0 | 0 | api-175161560754512.ts |  |
| uc | `index.api.175161560754513.js` | 11 | 12 | 10 | 11 | 11 | 0 | 0 |  | restore-api 漏 i（/xf-college/wqStudResult/xfCollegeWqStudResult/edit，url 是条件表达式） |
| uc | `index.api.175161560754514.js` | 10 | 10 | 10 | 10 | 10 | 0 | 0 |  |  |
| uc | `index.api.175161560754515.js` | 5 | 5 | 5 | 5 | 5 | 0 | 0 |  |  |
| uc | `index.api.175161560754516.js` | 6 | 6 | 6 | 6 | 6 | 0 | 0 |  |  |
| uc | `index.api.175161560754517.js` | 16 | 16 | 16 | 16 | 16 | 0 | 0 |  |  |
| uc | `index.api.175161560754518.js` | 4 | 4 | 4 | 4 | 4 | 0 | 0 |  |  |
| uc | `index.api.175161560754519.js` | 4 | 4 | 4 | 4 | 4 | 0 | 0 |  |  |
| uc | `index.api.175161560754520.js` | 4 | 4 | 4 | 4 | 4 | 0 | 0 |  |  |

<!-- api-inventory:end -->
