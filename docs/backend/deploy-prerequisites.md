# 部署 `backend-new-main` 的前提清单（HM-18）

本文写给以后真正部署这套后端的人：要让 `backend-new-main` 跑起来，并且行为和 rencaidanao 测试环境一致，需要准备哪些东西。清单从源码整理（2026-10-10），**只写名字，不写值**。接口层的结论见 `replace-assessment.md`。

## 1. 要部署哪些服务

哈密前端（门户 + 用户中心）只调用 5 个业务服务，加上网关一共 6 个：

| 服务（`spring.application.name`） | 模块 | 哈密前端调用的接口（去重 / 调用点） | 说明 |
| --- | --- | --- | --- |
| `jeecg-gateway` | `services/gateway/gateway-app` | — | 网关。前端的 `/xf-api/<服务名>/...` 经它转发 |
| `jeecg-system` | `services/system/jeecg-system-app` | 4 / 5 | 字典、用户；网关路由用「数据库模式」时，由它把路由写进 Redis |
| `xf-job` | `services/xf-job/xf-job-app` | 433 / 482 | 主业务 |
| `xf-oddjob` | `services/xf-oddjob/xf-oddjob-app` | 39 / 41 | 零工 |
| `xf-common` | `services/xf-common/xf-common-app` | 4 / 4 | 公告等 |
| `xf-encyclopedia` | `services/xf-encyclopedia/xf-encyclopedia-app` | 2 / 2 | 百科 |

`chitone`、`xf-applet`、`xf-external`、`xf-hardware`、`xf-ministries`、`xf-pushdata`、`xxl-job-admin` 哈密前端用不到，只有在需要定时任务或对外同步时才要部署。各服务的端口写在各自的 `application.yml` 里。

`xf-college`、`xf-alliance`、`xf-talent` 源码里没有，测试环境也没有部署，不需要准备。

## 2. 构建

- JDK：Oracle JDK 8u202；Maven：3.9.9。根 `pom.xml` 的 enforcer 会拒绝其他版本。仓库里没有 Maven Wrapper。
- 仓库：根 `pom.xml` 声明了 `aliyun-public` 和 `jeecg-releases`（Jeecg 官方 nexus）。`org.jeecgframework.*` 的依赖（`jeecg-boot-starter-cloud`、`jeecg-boot-starter-job`、`jeecg-boot-starter-chatgpt`、`codegenerate`、`hibernate-re`、`autopoi-web`、`jeewx-api`、`kingbase8`）从 Jeecg 仓库取。
- **公共仓库里拿不到、要团队私有仓库提供的依赖**（这里按坐标列出，部署时以实际解析结果为准）：
  - `com.golf.bcp:bcp-sdk`（README 里提到的 BCP SDK）、`cn.com.antcloud.api:antcloud-api-ak_*`（蚂蚁链开放平台按账号生成的 SDK）：`xf-job-biz` 依赖，构建 `xf-job` 必须有；
  - `cn.com.vastdata:vastbase-jdbc`：只有 `xxl-job-admin` 用；
  - `com.dingtalk.open:zwdd-sdk-java`（浙政钉 SDK）：只有 `xf-applet` 用。
- 用 `mvn -pl <模块> -am -DskipTests clean package` 只构建上面 6 个服务即可。

## 3. Nacos

每个服务启动时从 Nacos 读配置。源码里只写了 Nacos 的连接信息，配置内容都不在源码里。

**连接信息**：`spring.cloud.nacos.config.*` 和 `spring.cloud.nacos.discovery.*` 里的 `server-addr`、`namespace`、`group`、`username`、`password`。现在 11 个服务把这些值直接写在 `application.yml` 里（见第 7 节）。`chitone` 已经改成读环境变量 `NACOS_SERVER_ADDR`、`NACOS_USERNAME`、`NACOS_PASSWORD`，部署时建议所有服务都照这样改。

**要准备的配置文件**（Data ID，`DEFAULT_GROUP`）：

- `jeecg.yaml`、`jeecg-prod.yaml`：所有服务共用；
- `<服务名>-prod.yaml`：每个服务一份。`jeecg-system` 只导入前两份，没有自己的这份。

**配置里必须有的项**：

| 配置项 | 用途 | 没有会怎样 |
| --- | --- | --- |
| `spring.datasource.dynamic.*`，数据源名 `master`、`xf-job`、`xf-job-ministries` | 源码用 `@DS` 切换这三个数据源（`xf-job` 434 处，`xf-job-ministries` 34 处，`master` 4 处） | 启动失败或查询报错 |
| Redis（`spring.redis.*`） | 登录态、缓存、网关路由（数据库模式） | 启动失败 |
| `jeecg.shiro.excludeUrls` | 免登录放行名单，逗号分隔的 Ant 路径。`ShiroConfig` 逐条注册为 `anon`，但跳过控制器上标了 `@NeedLoginAuth` 的 url（这些写进名单也仍要登录） | 门户不登录时调用的 `licenseFree` 接口全部返回 401，门户首页、找工作等匿名页面打不开 |
| `jeecg.route.config.data-type`、`jeecg.route.config.data-id` | 网关动态路由的来源。`nacos` 模式读 Data ID `<data-id>.json`；`database` 模式读 Redis 键 `sys:cache:cloud:gateway_routes`（由 `jeecg-system` 从 `sys_gateway_route` 表加载） | `data-type` 没有默认值，缺了网关加载路由时直接报错；配了但路由为空，所有请求 404 |
| `xf.request.config.data-type`、`xf.request.config.data-id`、`xf.request.config.group` | 网关的 IP 限流规则（`XfGatewayRequestLimitConfig`） | 这几项没有默认值，缺了网关很可能启动失败 |
| Sentinel 流控规则（Group `SENTINEL_GROUP`，Data ID `<服务名>-flow-rules`） | 网关限流 | 限流不生效 |
| `jeecg.path.*`、`jeecg.uploadType`、`jeecg.oss.*`、`jeecg.minio.*` | 上传、下载、静态资源 | 上传和附件下载出错 |

**`jeecg.shiro.excludeUrls` 的写法**：2026-10-10 不登录探测测试环境发现，`xf-job` 的 `/job/licenseFree/` 和 `xf-oddjob` 的 `/oddJob/licenseFree/` 是按控制器前缀通配放行的（不存在的路径也返回 404 而不是 401）；`jeecg-system` 的 `/sys/dict/getDictItemsByCode` 也放行了；名单不是全局的 `/**/licenseFree/**`。源码里哈密范围带 `licenseFree` 的接口去重后有 152 个（按调用点算 170 个，`api-reconcile.md` 用的是调用点口径），原前端都会在不登录时调用。最稳妥的做法是直接拿测试环境的这份配置；拿不到的话，至少要覆盖这 152 个接口所在的控制器前缀。

**其他业务配置**（源码里用 `@Value` 读取，没有默认值；哈密前端的主流程不一定用到，缺了只影响对应功能）：`xf.interface-request.*`（外部接口地址，95 处）、`zyrcw.*`、`wx.officalAccount.*`、`wx.subscribeAccount.*`、`aliapplet.*`、`template.companyInfo.*`、`xxl.job.*`、`third.operator.*`、`spring.mail.*`、`jeecg.elasticsearch.*`、`guyuanAppLogin.*`、`binHaiAppLogin.*`、`baidu.qianfanBearerToken`、`tianyancha.*`、`sjzdataConter.*`、`csbsm4.key`、`newjobs.*`、`chitone.huiyan.*`。这些项缺了，用到它们的 Bean 可能会在启动时报错，部署时按启动日志补齐。

## 4. 数据库

- **类型待定。** 源码同时带了达梦（`com.dameng:Dm8JdbcDriver18`，`xf-job` 的配置里还保留了达梦的兼容开关）、人大金仓（`kingbase8`）、PostgreSQL、MySQL 的驱动，`xxl-job-admin` 另外用 Vastbase。测试环境用哪种库、什么版本，要问运维。
- **源码里没有表结构**：只有 `chitone` 有一份迁移 SQL。按实体（`@TableName`）和 Mapper XML 里引用的表统计，共 491 张：

| 服务 | 涉及的表（实体 / 实体 + Mapper XML） | 主要前缀 |
| --- | --- | --- |
| `xf-job` | 281 / 329 | `xf_job_*`、`xf_sys_*`、`xf_labor_*`、`xf_school_*` |
| `xf-oddjob` | 43 / 50 | `xf_odd_*` |
| `xf-common` | 70 / 73 | `xf_sys_*`、`xf_job_*`、`xf_pushdata_*`、`xf_insurance_*` |
| `xf-encyclopedia` | 12 / 15 | `xf_encyclopedia_*` |
| `jeecg-system` | 32 / 42 | `sys_user*`、`sys_depart*`、`sys_role*`、`sys_dict*`、`sys_gateway_route` |
| 其他服务（哈密前端不用） | `xf-applet` 92、`xf-ministries` 38、`xf-hardware` 27、`xf-external` 19、`xf-pushdata` 12、`chitone` 9、`xxl-job-admin` 7 | |

  服务之间共用很多表（例如 `xf_sys_*`、`xf_job_*`），上表按服务分别统计，合计去重后是 491 张。
- **必须有的数据**（不只是结构）：
  - 字典 `sys_dict` / `sys_dict_item`：前端通过 `getDictItemsByCode` 读的各类字典，加上第 5 节的四项加密字典；
  - `sys_gateway_route`：网关用数据库模式时的路由表；
  - 地区（`xf_sys_areainfo`）、业务设置（`xf_sys_business_setting`）、资讯分类等基础数据：门户首页和筛选项依赖它们。

## 5. `CryptoFilter` 的加密字典

`platform` 的 `CryptoFilter` 对每个服务的 `/*` 生效，哪些 url 要加解密由下面四个字典决定（数据库数据，不在源码里）：

- `crypto_req_body_params_filter_always_crypto_urls`、`crypto_req_body_params_filter_exclude_urls`：请求体（SM2）；
- `crypto_response_data_filter_always_crypto_urls`、`crypto_response_data_filter_exclude_urls`：响应（SM4）。

判定规则（`CryptoFilter.izCryptoData`，请求体和响应各自判定）：`always` 名单里有 `all` 或匹配当前 url，就处理；`always` 名单非空但不匹配，就不处理；`always` 名单为空时，除了 `exclude` 名单匹配的 url（或 `exclude` 里有 `all`），**其余全部处理**。所以两个名单都空着，等于所有接口都加解密，前端会全部出错。

门户录到的请求体加密名单（`funcs`）是 10 项。测试环境有 54 个接口的响应带 `Crypto_Opt: true`。这四个字典的值必须和测试环境一致，否则前端解不开响应，或者后端解不开请求体。

## 6. SM2 / SM4 密钥

- **后端现在没有注入入口**：SM2 私钥和 SM4 密钥写死在 3 个类里（`platform` 的 `Sm2Util`、`Sm4Utils`，`xf-common-api` 的 `Sm2Util`）。`xf-job-api` 和 `xf-common-api` 的 `Sm4Utils` 不带密钥，由调用方传入。另有 `csbsm4.key` 从 Nacos 读，用于对外数据同步，和前端无关。
- **前端**（`hmrsfw-vue/.env.local`，不提交）：`VITE_HMRSFW_SM2_PUBLIC_KEY`（请求体加密）、`VITE_HMRSFW_SM4_KEY`（响应解密）、`VITE_HMRSFW_SM4_STORAGE_KEY`（浏览器存储，留空则沿用 `VITE_HMRSFW_SM4_KEY`）。
- **还原工具**：`VITE_HMRSFW_SM4_KEY`（解 HAR 里的加密响应）、`SM2_PRIVATE_KEY`（解 HAR 里的加密请求体）。
- **部署建议**：改代码，让这 3 个类从环境变量读取密钥（例如 `HMRSFW_SM2_PRIVATE_KEY`、`HMRSFW_SM4_KEY`，名字由部署方定），不再写死在源码里。前后端两边的密钥必须成对：前端 SM2 公钥对应后端私钥，前后端 SM4 密钥相同。

## 7. 安全建议

- **源码里有明文凭据。** 11 个服务的 `application.yml`（`gateway`、`system`、`xf-applet`、`xf-common`、`xf-encyclopedia`、`xf-external`、`xf-hardware`、`xf-job`、`xf-ministries`、`xf-oddjob`、`xf-pushdata`）直接写着 Nacos 的地址、账号和密码；`chitone` 虽然改成了读环境变量，默认值仍是同一组凭据；`xxl-job-admin` 的 `application.yml` 里还有数据库、邮件和管理后台的密码。这些都已经进了那个仓库的版本库。建议轮换这些凭据，改成只从环境变量注入，不留默认值。
- **SM2 私钥和 SM4 密钥写死在源码里**（见第 6 节）。前端包本来就带着 SM2 公钥和 SM4 密钥，SM4 一旦泄露，所有加密响应都能被解开。建议部署时换一套新密钥，从环境变量注入。

## 8. 部署后要实测的项

- 在门户不登录的情况下，逐个访问 `licenseFree` 接口，确认放行名单完整；
- 网关路由：确认「第一段 = 服务名、转发时去掉第一段」（HM-23 按这个规则对账，测试环境的探测结果与它一致）；
- `replace-assessment.md` 列出的 4 个参数级差异，用同样的请求比较数据；
- HAR 没覆盖的 476 个接口，按页面跑一遍，比较返回结构；
- `POST /xf-job/school/user/sms`：按 `replace-assessment.md` 待人工确认项的结果处理。
