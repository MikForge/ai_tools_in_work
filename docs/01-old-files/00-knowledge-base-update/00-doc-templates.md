# 文档模板

每种文档类型的推荐结构和必填/可选节。模板来源标注在节名旁。

`*` 表示社区暂无标准模板，以下为建议结构。

---

## architecture

> 来源：[arc42](https://docs.arc42.org/)

### 必填节

- **引言与目标**（Introduction & Goals）— 驱动因素、质量目标、利益相关者
- **上下文与范围**（Context & Scope）— 系统边界、外部接口
- **方案策略**（Solution Strategy）— 关键架构决策和思路
- **构建块视图**（Building Block View）— 模块/组件划分与职责

### 可选节

- 约束（Constraints）
- 运行时视图（Runtime View）
- 部署视图（Deployment View）
- 概念（Concepts）
- 架构决策（Architecture Decisions）— 与方案策略互补
- 质量（Quality）
- 风险与技术债（Risks & Technical Debt）
- 术语表（Glossary）

---

## standard

> 来源：[C++ Core Guidelines](https://isocpp.github.io/CppCoreGuidelines/) 等社区编码规范结构

### 必填节

- **引言**（Introduction）— 受众、目标、范围
- **理念**（Philosophy）— 核心原则（不超过 5 条）
- **规则**（Rules）— 按域分组，每条含：编号、标题、理由、示例

### 可选节

- 自动化检查（Enforcement）
- 例外情况（Exceptions）
- 参考文献（References）
- 术语表（Glossary）

---

## spec

> 来源：[Rust RFC](https://github.com/rust-lang/rfcs) 模板

### 必填节

- **摘要**（Summary）— 一段话说明是什么
- **动机**（Motivation）— 解决什么问题，给具体场景
- **技术说明**（Reference-level explanation）— 技术细节、边界情况、与现有功能的交互
- **缺陷**（Drawbacks）— 为什么不做的理由

### 可选节

- 用户指南级说明（Guide-level explanation）
- 理由与备选方案（Rationale and alternatives）
- 先前经验（Prior art）— 其他项目/论文参考
- 待解决问题（Unresolved questions）
- 未来可能（Future possibilities）

---

## design

> 来源：[Google Design Doc](https://www.industrialempathy.com/posts/design-docs-at-google/) 实践

### 必填节

- **上下文与范围**（Context & scope）— 背景和范围（客观事实）
- **目标与非目标**（Goals & non-goals）— 目标清单 + 明确定义不做什么
- **方案概述**（Design overview）— 记录关键 trade-off
- **备选方案**（Alternatives considered）— 备选方案及被拒原因

### 可选节

- 系统上下文图（System-context-diagram）
- 接口设计（APIs）— 只画相关部分
- 数据存储（Data storage）
- 代码/伪代码（Code / pseudo-code）— 仅在算法新颖时出现
- 横切关注点（Cross-cutting concerns）— 安全、隐私、可观测性

---

## api

> 来源：[I'd Rather Be Writing API 文档课程](https://idratherbewriting.com/learnapidoc/)

### 必填节

- **资源描述**（Resource description）— 资源是什么、做什么
- **端点与方法**（Endpoints & methods）— URL + HTTP 方法
- **参数**（Parameters）— 参数名、类型、必填/可选、说明
- **请求示例**（Request example）— 可复制的请求示例
- **响应示例与结构**（Response example & schema）— 响应示例 + 字段释义

### 可选节

- 认证与授权（Authentication / authorization）
- 状态码与错误码（Status & error codes）
- 速率限制（Rate limiting）
- 速查表（Quick reference）
- 术语表（Glossary）

---

## changelog

> 来源：[Keep a Changelog](https://keepachangelog.com/en/1.1.0/)

### 必填节

- **版本头** — `## [version] - YYYY-MM-DD`
- **变更分类** — 每版本按需出现：
  - `Added`（新增）— 新功能
  - `Changed`（变更）— 已有功能修改
  - `Deprecated`（废弃）— 即将移除
  - `Removed`（移除）— 已移除
  - `Fixed`（修复）— 缺陷修复
  - `Security`（安全）— 安全漏洞

### 可选节

- `[Unreleased]` 未发布变更汇总
- `[YANKED]` 已撤回版本标记
- 语义化版本申明（SemVer）

---

## test

> 来源：[SoftwareTestingHelp](https://www.softwaretestinghelp.com/test-plan-sample/) 测试计划模板

### 必填节

- **引言**（Introduction）— 被测对象概要
- **目标**（Objectives）— 测试目标
- **范围**（Scope）— 测什么 + 怎么测
- **测试策略**（Testing strategy）— 单元/集成/性能/验收等分层策略
- **被测功能**（Features to be tested）— 功能清单
- **排除功能**（Features NOT to be tested）— 明确排除的功能及原因

### 可选节

- 软硬件环境要求（Hardware / environment requirements）
- 测试排期（Test schedule）
- 管控流程（Control procedures）— 缺陷上报与变更
- 人员与职责（Resources / roles & responsibilities）
- 依赖项（Dependencies）
- 风险与假设（Risks / assumptions）
- 工具（Tools）
- 审批（Approvals）

---

## review

> 来源：[Google 代码评审指南](https://google.github.io/eng-practices/review/)

### 必填节

- **上下文**（Context）— 评审范围、涉及的代码/设计
- **总体评价**（Summary）
- **发现**（Findings）— 问题清单，按严重度分级

### 可选节

- **建议**（Recommendations）— 改进意见
- **后续项**（Follow-up items）
- **审批**（Approval）— 结论及签署

---

## contract `*`

### 必填节

- **参与方**（Parties）— 调用方与服务方
- **接口定义**（Interface definition）— 端点、方法、参数、返回
- **数据结构**（Schema）— 请求/响应结构
- **错误处理**（Error handling）— 错误码与含义

### 可选节

- 服务等级承诺（SLAs）
- 速率限制（Rate limiting）
- 版本管理（Versioning）
- 废弃策略（Deprecation policy）

---

## requirement `*`

### 必填节

- **背景**（Background）— 背景上下文
- **问题陈述**（Problem statement）— 要解决什么问题
- **目标与非目标**（Goals & non-goals）
- **功能需求**（Functional requirements）— 按优先级排
- **验收标准**（Acceptance criteria）

### 可选节

- 用户故事/用例（User stories / use cases）
- 非功能需求（Non-functional requirements）— 性能、安全、合规
- 依赖项（Dependencies）
- 术语表（Glossary）

---

## protocol `*`

### 必填节

- **概述**（Overview）— 协议用途和定位
- **消息格式**（Message format）— 结构定义、字段说明
- **状态机/交互流程**（State machine / flows）— 交互序列、状态变迁
- **错误处理**（Error handling）— 异常情况的协议行为

### 可选节

- 版本协商（Version negotiation）
- 安全考量（Security considerations）
- 示例（Examples）
- 参考实现（Reference implementation）

---

## solution `*`

### 必填节

- **问题**（Problem）— 当前状况与痛点
- **方案**（Proposed solution）— 方案描述
- **理由**（Rationale）— 为什么是这个方案
- **影响评估**（Impact assessment）— 影响范围、利弊

### 可选节

- 备选方案（Alternatives considered）
- 成本/资源估算（Cost / resource estimate）
- 时间线/里程碑（Timeline / milestones）
- 风险与缓解（Risks & mitigations）

---

## guide `*`

### 必填节

- **前置条件**（Prerequisites）— 环境、权限、知识
- **操作步骤**（Steps）— 逐步操作，每步有预期结果
- **预期结果**（Expected outcome）— 完成后的可验证状态

### 可选节

- 排障（Troubleshooting）
- 下一步/相关指南（Next steps / related guides）
- 截图/图示（Screenshots / diagrams）

---

## reference `*`

### 必填节

- **概述**（Overview）— 覆盖范围和约定
- **条目**（Entries）— 按逻辑分组，每条含：
  - 名称/签名
  - 描述
  - 参数（如有）
  - 示例

### 可选节

- 参见（See also）— 交叉引用
- 版本历史（Version history）

---

## benchmark `*`

### 必填节

- **目的**（Purpose）— 基准测试目的和场景
- **方法论**（Methodology）— 测试方法、工具、参数
- **环境**（Environment）— 硬件/软件/网络环境
- **结果**（Results）— 数据（表格/图表）
- **分析**（Analysis）— 结论与解读

### 可选节

- 原始数据（Raw data）
- 基线对比（Comparison to baseline）
- 建议（Recommendations）
- 可复现性（Reproducibility）
