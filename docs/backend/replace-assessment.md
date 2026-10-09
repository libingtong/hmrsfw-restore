# 自有后端替换测试环境：接口层结论（HM-18）

HM-17 第二步：判断 `backend-new-main` 能不能在**接口层**替换 rencaidanao 测试环境。按 2026-10-10 调整后的范围，本次不在本机起后端，结论基于「后端源码 × 测试环境 HAR」的静态对账（HM-23，见 `api-reconcile.md`），加上对测试环境做的一轮不登录探测。部署这套后端需要准备什么，另见 `deploy-prerequisites.md`。

本文只有路径、状态码、字段名和计数，不含接口返回的值。

## 结论

**接口层可以替换，但有 1 个接口缺口和 2 个前提。**

- **测试环境录到的接口，结构一致。** 79 个可比对的接口里有 2 处结构差异，都有解释，没有一处会影响前端（见「结构差异」）。
- **59 条阻断项，58 条不阻断。** `xf-college`、`xf-alliance`、`xf-talent` 三个服务在测试环境也没有部署，网关的回应和不存在的服务完全一样，替换后行为不变。
- **1 个接口缺口**：`POST /xf-job/school/user/sms`（门户找回密码发短信）源码里没有。测试环境有没有，这次没有探测（会真的发短信），列为待人工确认。如果测试环境有，这是替换前唯一要补的接口。
- **前提 1：部署配置。** 门户匿名访问、请求加密、网关路由都靠源码以外的配置（Nacos 放行名单、加密字典、网关路由），部署时必须按测试环境补齐，见 `deploy-prerequisites.md`。
- **前提 2：覆盖面。** HAR 只覆盖了哈密范围 556 个接口中的 80 个。其余 476 个只做了「前端 × 源码」的静态对账：路径、方法都能对上，但返回结构和测试环境是否一致没有实证。版本漂移目前只发现 1 处（`coordinateSystem`），说明两边差得不多，但不能保证没有第二处。

## 可比对接口数

2026-10-10 在最新的 `main`（含 HM-29）上，带 `VITE_HMRSFW_SM4_KEY` 重跑了 `tools/api-inventory.mjs`。生成部分和 HM-23 合入时完全一样，`api-reconcile.md` 不需要更新。HM-23 当时已经带着 SM4 密钥跑过，所以可比对接口数不是 25，是 79。

| 项 | 数量 |
| --- | --- |
| HAR 里的接口（方法 + 路径） | 80（66 个文件、702 条记录） |
| 源码里能找到的 | 79，方法全部一致 |
| 源码里找不到的 | 1：`POST /xf-talent/talent/xfTalentCgraduateRltSubsidy/list`，测试环境自己也返回 404 |
| 逐键比对返回结构的 | 67 个接口，2664 个字段节点（后端声明了具体返回类型） |
| 只比对外层 `success/message/code/result/timestamp` 的 | 12 个接口（后端声明 `Result<?>`、`Object`、`Map`、`JSONObject`） |
| `Crypto_Opt: true` 的响应 | 54 个接口、120 条记录，用 SM4 密钥全部解开，失败 0 |
| SM2 加密的请求体 | HAR 里没有录到 |

## 结构差异（2 处，全部有解释）

| 接口 | 差异 | 原因 | 处理 |
| --- | --- | --- | --- |
| `POST /xf-oddjob/oddJob/licenseFree/needJoblist` | `$.result.records[].coordinateSystem`：源码有，测试环境没有 | 已知版本漂移：`backend-new-main` 比测试环境那一版新。同一条响应里 23 个值为 null 的字段都序列化了，所以这个键不是被省略的 | 不处理。新后端多返回一个键，前端不读它，不影响页面 |
| `GET /xf-job/communal/xfSysBusinessSetting/getSettingValueByCode` | `$.result`：后端声明是对象，测试环境返回字符串 | 源码的方法签名写的是 `Result<XfSysBusinessSetting>`，方法体实际返回 `Result.ok(<字符串>)`，两边行为相同 | 不是差异，是脚本按声明类型比对产生的误报 |

## 参数级差异（不影响结构，可能影响数据）

测试环境的请求里有 4 个接口带了源码不读的参数。参数不影响返回的结构，但如果测试环境那一版用这个参数做了过滤，替换后返回的数据可能不一样。部署后要用实际请求核对一遍。

| 接口 | 源码不读的参数 | 判断 |
| --- | --- | --- |
| `GET /xf-job/communal/licenseFree/xfSysAreainfo/getInfo` | `type` | 免登录版本只按 `parentId` 查，另外只返回启用的地区，并可能走 Redis 缓存；需要登录的同名接口按 `type` + `parentId` 查，不过滤启用状态。同一个父级下的地区本来就同级，只要测试环境那一版也只返回启用的地区，数据就一致 |
| `POST /xf-job/job/licenseFree/getArticleListByTypeIds` | `typeCodes` | 必填的 `typeIds` 也传了，后端按 `typeIds` 查；`typeCodes` 是前端多传的 |
| `POST /xf-job/job/licenseFree/getArticleListNoCheck` | `provincialLevel` | 同一个控制器里相邻的接口按 `provincialLevel` 过滤，这个接口没有。可能是版本漂移，替换后返回的条数可能变多 |
| `POST /xf-job/job/licenseFree/xfJobFairApplyInfo/queryAttendeesCompany` | `dataSourceType`（请求体） | 后端的查询对象里没有这个字段，会被忽略。可能是版本漂移 |

静态对账里「前端传了、后端不接收」共 117 条，大部分是界面字段被整体塞进了请求，后端忽略即可，明细见 `api-reconcile.md`。

## 59 条阻断项的结论

| 类别 | 条数 | 测试环境 | 结论 |
| --- | --- | --- | --- |
| `xf-talent` 服务不在源码 | 21 | 未部署（HAR 里录到 404；探测结果同下） | 两边都不提供，不阻断替换 |
| `xf-college` 服务不在源码 | 31 | 未部署（探测结果见下） | 两边都不提供，不阻断替换 |
| `xf-alliance` 服务不在源码 | 6 | 未部署（探测结果见下） | 两边都不提供，不阻断替换 |
| `POST /xf-job/school/user/sms` 不在源码 | 1 | 未探测 | 接口缺口，待人工确认 |

按服务统计，阻断替换的是 **0 条**，另有 **1 条**待人工确认。`xf-college`、`xf-alliance` 涉及的页面（用户中心宣讲会、实习签约、`allianceSend`，以及门户岗位/单位详情里的联盟分支），在测试环境本来就用不了，替换后不会变得更差。

### 测试环境不登录探测（2026-10-10）

方法：直接请求测试环境两站的 `/xf-api/` 网关，不带登录态和 cookie，不输入账号，只发 GET。写类接口（名字里有 `add`、`edit`、`cancel`、`sign`、`apply`、`update`、`notarize` 的 15 个）没有请求，它们的结论按所属服务推定。

| 请求 | 两站结果 | 含义 |
| --- | --- | --- |
| 不存在的服务 `/zz-nonexist-hm18/...` | 404，网关（WebFlux `ResponseStatusException`）回应 | 对照组：网关没有这条路由 |
| 已部署的服务 + 不存在的路径（`/xf-job/...`、`/xf-oddjob/...`、`/xf-common/...`） | 401「令牌为空」 | 对照组：路由存在，请求转发到了服务，先被登录校验拦下 |
| `/xf-talent/` + 不存在的路径、HAR 里录到的接口 | 404，网关回应 | 与不存在的服务相同 |
| `/xf-college/` + 不存在的路径（两站） | 404，网关回应 | 与不存在的服务相同 |
| `/xf-alliance/` + 不存在的路径（两站） | 404，网关回应 | 与不存在的服务相同 |
| `xf-college`、`xf-alliance` 的 22 个读接口（真实路径） | 22 个全部 404，网关回应 | 没有一个被转发到服务 |

判定：已部署的服务对任何路径都先要登录（401），这三个服务对任何路径都由网关直接返回 404，说明测试环境的网关上没有这三个服务的路由，也就是没有部署。

## 不阻断替换的前端缺陷

以下是原前端包自身的问题，测试环境同样受影响，替换后行为不变，明细见 `api-reconcile.md`：

- 前端路径缺服务前缀 15 条：网关按第一段路由，到不了任何服务；
- url 带首尾空格 1 条；
- 前端和后端方法不一致 1 条；
- 传参位置不一致 19 条：前端发 JSON 体，后端按 query 绑定。原系统本来就是这样。

## 顺带确认的部署事实

探测时顺带确认了两件和部署配置有关的事（详见 `deploy-prerequisites.md`）：

- 测试环境的门户在不登录时能访问 `licenseFree` 接口（`xfSysAreainfo/getInfo`、`needJoblist`、`findJobList` 都返回 200），也能访问 `jeecg-system` 的 `sys/dict/getDictItemsByCode`。源码里这些接口默认都要登录，说明测试环境配了 `jeecg.shiro.excludeUrls`。
- `xf-job` 的 `/job/licenseFree/` 和 `xf-oddjob` 的 `/oddJob/licenseFree/` 下，不存在的路径返回的是服务自己的 404，而不是 401，说明放行名单是按控制器前缀写的通配，不是逐个接口列出的；`xf-common` 下随便编的 `/zz/licenseFree/` 仍是 401，说明也不是全局的 `/**/licenseFree/**`。

## 待人工确认

1. `POST /xf-job/school/user/sms`（门户找回密码发短信）：测试环境上找回密码能不能收到短信？能收到，就要在 `backend-new-main` 里补这个接口，或者把前端改成调用源码里已有的短信接口；收不到，就记为「两边都不提供」。

## 复现

```bash
export VR_BACKEND_SRC=<backend-new-main 目录>
export RESTORE_ASSETS=<HAR 所在目录>
export VITE_HMRSFW_SM4_KEY=...   # 从 hmrsfw-vue/.env.local 读取，不写进命令历史
node tools/api-inventory.mjs --app <hmrsfw-vue 的 main 检出> --report docs/backend/api-reconcile.md
```

注意：`--app` 要指向最新的 `hmrsfw-vue` `main`。用了落后的本地检出，生成部分会多报一条「`api-56.ts` 不一致」（HM-29 已修）。
