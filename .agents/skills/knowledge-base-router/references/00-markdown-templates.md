# 文档模板

agent 写文档时的结构参考。先查类型选择表确定类型，再按需加载对应模板文件（[00-md-temps/](00-md-temps/)），写完用校验规则自检。

---

## 类型选择

| 类型 | 用途 | 区别于 | 模板 |
|------|------|--------|------|
| spec | 新增功能/变更的提案 | design：spec 回答"做什么"，design 回答"怎么做" | [spec](00-md-temps/spec.md) |
| design | 系统/模块的技术方案 | spec：design 含架构、数据流、迁移路径 | [design](00-md-temps/design.md) |
| architecture | 系统整体结构 | design：architecture 关注模块边界和部署 | [architecture](00-md-temps/architecture.md) |
| solution | 问题解决方案（轻量） | design：solution 不含详细技术设计 | [solution](00-md-temps/solution.md) |
| requirement | 功能/技术需求 | spec：requirement 不含方案，只描述问题 | [requirement](00-md-temps/requirement.md) |
| api | 接口文档 | contract：api 面向使用者，contract 面向双方 | [api](00-md-temps/api.md) |
| contract | 服务/模块间契约 | api：contract 含 SLA、变更策略 | [contract](00-md-temps/contract.md) |
| standard | 编码/流程规范 | guide：standard 是规则，guide 是教程 | [standard](00-md-temps/standard.md) |
| guide | 操作指南/教程 | standard：guide 是步骤，standard 是约束 | [guide](00-md-temps/guide.md) |
| test | 测试计划 | — | [test](00-md-temps/test.md) |
| review | 代码/设计评审 | — | [review](00-md-temps/review.md) |
| changelog | 版本变更记录 | — | [changelog](00-md-temps/changelog.md) |
| benchmark | 性能基准 | — | [benchmark](00-md-temps/benchmark.md) |
| protocol | 网络/应用协议 | — | [protocol](00-md-temps/protocol.md) |
| reference | API/配置/术语参考 | — | [reference](00-md-temps/reference.md) |

---

## 校验规则

写完文档后逐条自查：

| # | 规则 | 适用类型 |
|---|------|----------|
| 1 | 摘要/概述不超过 3 句话，不熟悉上下文的人能看懂 | spec, design, architecture, solution |
| 2 | 备选方案至少 2 个且含被拒原因 | spec, design |
| 3 | 目标必须配对非目标（scope creep 防线） | design, requirement |
| 4 | 验收标准必须可验证（有数字/布尔值/可见行为） | requirement, test |
| 5 | 所有示例必须可直接复制使用 | api, reference, guide |
| 6 | 错误处理/异常路径必须覆盖 | contract, protocol, api |
| 7 | 动机/问题陈述必须给具体场景（非抽象需求） | spec, solution |
| 8 | 文件名符合 `类型-主题-行为.md`（见 [00-spec-markdown-name.md](00-spec-markdown-name.md)） | 所有 |
