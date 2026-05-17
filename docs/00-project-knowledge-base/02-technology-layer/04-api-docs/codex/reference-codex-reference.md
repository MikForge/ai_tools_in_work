# Codex 附加参考索引

## 概述

Codex 附加参考索引：特性成熟度、最佳实践、提示词工程、沙箱、GitHub Action、远程连接、速度优化、案例和 Changelog 的官方文档入口。

## 条目

### 附加参考

| 名称 | 描述 | 配置/路径示例 | 说明文档 |
| --- | --- | --- | --- |
| 特性成熟度 | Codex 各功能的稳定性和可用性等级（GA / Beta / Experimental）。 | 企业部署时用于评估风险 | https://developers.openai.com/codex/feature-maturity |
| 最佳实践 | Codex 使用的最佳实践指南。 | 团队 onboarding 参考 | https://developers.openai.com/codex/learn/best-practices |
| 提示词工程 | Codex prompt 编写技巧和模式。 | prompt 调优参考 | https://developers.openai.com/codex/prompting |
| 自定义 & 概念 | Codex 的定制化能力和设计理念。 | 深入理解 Codex 工作方式 | https://developers.openai.com/codex/concepts/customization |
| 网络安防 | Codex 使用中的网络安全注意事项。 | 安全审计参考 | https://developers.openai.com/codex/concepts/cyber-safety |
| 沙箱概念 | Codex 沙箱机制的设计原理。 | 理解安全模型 | https://developers.openai.com/codex/concepts/sandboxing |
| 沙箱自动审核 | 沙箱中代码的自动安全审核。 | auto-review policy 配置 | https://developers.openai.com/codex/concepts/sandboxing/auto-review |
| GitHub Action | Codex GitHub Action 集成，用于 CI/CD 流程。 | `.github/workflows/codex.yml` | https://developers.openai.com/codex/github-action |
| 远程连接 | 配置 Codex 连接到远程开发环境。 | SSH / Dev Container 集成 | https://developers.openai.com/codex/remote-connections |
| 速度优化 | Codex 响应速度和性能优化建议。 | 性能调优 | https://developers.openai.com/codex/speed |
| 案例 / 使用场景 | 官方整理的 Codex 使用场景和案例。 | 团队 reference | https://developers.openai.com/codex/use-cases |
| Changelog | Codex 版本发布说明和变更历史。 | 版本更新跟踪 | https://developers.openai.com/codex/changelog |

## 使用建议

- 查"某个目录/文件应该放哪"：先看对应类型条目的说明文档，再回到 `config-reference` 确认字段名。
- 查"Codex 当前能不能支持某个开关"：优先看 `config-basic#supported-features` 和 `config-reference#configtoml`。
- 查"工具从哪里来"：MCP、Apps/connectors、Plugins 是三条不同路径；MCP 偏外部工具协议，Apps/connectors 偏 ChatGPT app 集成，Plugins 偏可分发能力包。
- 查"安全边界"：优先看 `agent-approvals-security`、`rules`、`hooks` 和 `requirements.toml`。
- 查"新增功能"：看 `feature-maturity` 确定稳定性和 `skills` / `workflows` 了解新能力模式。
- 查"是否逐字段完整"：以 `config-reference#configtoml` 和 `config-reference#requirementstoml` 为准；本页负责按类型分流，避免把完整字段表复制进知识库。


