# Codex 安全与治理参考

## 概述

Codex 安全与治理参考：Managed Requirements、安全模型、Rules、Workflows 的官方文档入口。涵盖企业级强制约束、安全审计和自动化工作流。

## 条目

### Managed Requirements 与安全治理

| 名称 | 描述 | 配置/路径示例 | 说明文档 |
| --- | --- | --- | --- |
| `requirements.toml` | 企业/系统级强制约束，用户配置无法弱化。 | `/etc/codex/requirements.toml`、云端 managed requirements | https://developers.openai.com/codex/enterprise/managed-configuration#admin-enforced-requirements-requirementstoml |
| Requirements 字段参考 | 管理 approval、sandbox、web search、MCP allowlist、managed hooks、command rules 等。 | `allowed_sandbox_modes = ["read-only", "workspace-write"]` | https://developers.openai.com/codex/config-reference#requirementstoml |
| Sandbox / approvals / permissions | Codex 命令执行的 sandbox、审批和安全边界。 | `sandbox_mode = "workspace-write"`、`approval_policy = "on-request"` | https://developers.openai.com/codex/agent-approvals-security |
| Auto review / approvals reviewer | 使用 reviewer subagent 自动评估符合条件的 approval prompt，或为 `/review` 设置专用模型。 | `approvals_reviewer = "auto_review"`、`auto_review.policy = "./policy.md"`、`review_model = "gpt-5.5"` | https://developers.openai.com/codex/config-reference#configtoml |
| 安全模型 | Codex 的安全架构、沙箱隔离、网络策略和数据保护。 | 企业部署参考 | https://developers.openai.com/codex/security |
| 安全设置 | Codex 企业安全配置步骤。 | 企业部署参考 | https://developers.openai.com/codex/security/setup |
| 威胁模型 | Codex 的安全威胁分析和缓解策略。 | 企业部署参考 | https://developers.openai.com/codex/security/threat-model |
| 企业治理 | 企业级 Codex 管理：访问令牌、管理配置、治理策略。 | Enterprise admin 控制台 | https://developers.openai.com/codex/enterprise/access-tokens、https://developers.openai.com/codex/enterprise/admin-setup、https://developers.openai.com/codex/enterprise/governance |


### Rules

| 名称 | 描述 | 配置/路径示例 | 说明文档 |
| --- | --- | --- | --- |
| Rules 概述 | Codex Rules 是细粒度的行为约束，独立于 AGENTS.md 的指令系统。 | `<repo>/.codex/rules/` | https://developers.openai.com/codex/rules |
| Rules 文件（CLAUDE.md） | CLAUDE.md 作为默认 rules 文件位置，支持项目级和子目录级 rule 文件。 | `CLAUDE.md` 或 `.codex/rules/*.md` | https://developers.openai.com/codex/rules |
| Rules 路径范围 | 按路径指定 rule 的生效范围。 | `rules/backend.md`、`rules/frontend/react.md` | https://developers.openai.com/codex/rules |
| Rules 与 AGENTS.md 的区别 | AGENTS.md 定义项目指令和工作流；Rules 定义不可协商的行为约束。 | 两者可共存但用途不同 | https://developers.openai.com/codex/rules |


### Workflows

| 名称 | 描述 | 配置/路径示例 | 说明文档 |
| --- | --- | --- | --- |
| Workflows 概述 | Codex Workflows 是预设的多步工作流模板，用于自动化重复任务。 | `~/.codex/workflows/`、`<repo>/.codex/workflows/` | https://developers.openai.com/codex/workflows |
| Workflow 结构 | YAML/Toml 定义步骤、条件、输入输出映射。 | `steps:` → `- name: ...` → `prompt: ...` | https://developers.openai.com/codex/workflows |
| Workflow 执行 | 从 CLI、slash command 或 app 触发 workflow。 | `/run my-workflow`、`codex workflow run` | https://developers.openai.com/codex/workflows |


