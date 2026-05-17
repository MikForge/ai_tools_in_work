# Codex 扩展能力参考

## 概述

Codex 扩展能力参考：Skills、MCP、Plugins、Subagents 的官方文档入口。按扩展方式分组：指令扩展（Skills）、工具协议扩展（MCP）、能力包扩展（Plugins）、并行执行扩展（Subagents）。

## 条目

### Skills

| 名称 | 描述 | 配置/路径示例 | 说明文档 |
| --- | --- | --- | --- |
| Skills 概念 | Codex Skills 是 Markdown 指令文件，为 Agent 注入领域知识和可重复执行能力。 | `.agents/skills/*/SKILL.md` | https://developers.openai.com/codex/skills |
| Skill 发现与引用 | 通过技能名称全局查找 Skill；带 overrides 时按路径优先级加载。 | `load_skill("skill-name")`、`@skill-name` | https://developers.openai.com/codex/skills#discovery-and-referencing |
| Skill 构建 | Skill 目录结构：`SKILL.md` + 可选 companion files。 | `my-skill/SKILL.md`、`my-skill/templates/` | https://developers.openai.com/codex/skills#building-skills |
| Skill 集线器 | 社区共享 Skill 的中央仓库，可通过 `skill-installer` 安装。 | GitHub 仓库 / 本地 Skill 目录 | https://developers.openai.com/codex/skills#skill-hub |
| Skill 作用域 | Skill 按用户级、项目级、插件级分层加载，优先级覆盖。 | `~/.codex/skills/`、`<repo>/.agents/skills/` | https://developers.openai.com/codex/skills#scope-and-priority |


### MCP (Model Context Protocol)

| 名称 | 描述 | 配置/路径示例 | 说明文档 |
| --- | --- | --- | --- |
| MCP 概述 | Codex 通过 MCP 协议接入外部工具服务器，扩展 Agent 能力边界。 | `[mcp_servers.docs] command = "uvx" args = ["mcp-server-rag"]` | https://developers.openai.com/codex/mcp |
| MCP 配置 | 在 `config.toml` 中声明 MCP server，支持 stdio 和 SSE 传输。 | `[mcp_servers.my-server] command = "npx" args = ["-y", "@my/mcp-server"]` | https://developers.openai.com/codex/config-reference#configtoml |
| MCP OAuth / 凭据 | MCP server 的 OAuth 流程和凭据存储策略。 | `mcp_oauth_credentials_store = "auto"` | https://developers.openai.com/codex/config-reference#configtoml |
| Plugin-bundled MCP | 插件可打包 MCP server 配置，安装即用。 | `.mcp.json`、manifest `mcpServers` 字段 | https://developers.openai.com/codex/plugins/build#bundled-mcp-servers-and-lifecycle-hooks |


### Subagents 与多智能体

| 名称 | 描述 | 配置/路径示例 | 说明文档 |
| --- | --- | --- | --- |
| Subagents | Codex 可显式 spawn 子 agent 并并行完成探索、实现、评审等任务。 | 通过 prompt 要求 Codex spawn agents；CLI 用 `/agent` 查看 | https://developers.openai.com/codex/subagents |
| Built-in agents | 内置 `default`、`worker`、`explorer` agent 类型。 | `spawn_agent(agent_type = "explorer")` | https://developers.openai.com/codex/subagents#custom-agents |
| Custom agents | 项目级或用户级 TOML 文件定义自定义 agent。 | `~/.codex/agents/reviewer.toml`、`<repo>/.codex/agents/reviewer.toml` | https://developers.openai.com/codex/subagents#custom-agents |
| 全局 subagent 设置 | 控制并发 agent 数、嵌套深度和 CSV 批处理 worker 超时。 | `[agents] max_threads = 6`、`max_depth = 1` | https://developers.openai.com/codex/subagents#global-settings |
| Subagent concepts | 解释何时使用 subagents、上下文污染/腐化、模型选择等设计取舍。 | 用于制定多 agent 工作流策略 | https://developers.openai.com/codex/concepts/subagents |


### Plugins

| 名称 | 描述 | 配置/路径示例 | 说明文档 |
| --- | --- | --- | --- |
| Plugins 使用 | Codex 中浏览、安装、启用或禁用插件。 | CLI `/plugins` 或插件目录 | https://developers.openai.com/codex/plugins |
| Plugin 构建 | 插件作者入口，说明如何创建可分发插件。 | `$plugin-creator`、`.codex-plugin/plugin.json` | https://developers.openai.com/codex/plugins/build |
| Plugin 结构 | 插件可包含 `skills/`、`hooks/`、`.mcp.json`、`.app.json`、`assets/`。 | `my-plugin/.codex-plugin/plugin.json` | https://developers.openai.com/codex/plugins/build#plugin-structure |
| Marketplace | 本地或仓库级插件目录清单。 | `<repo>/.agents/plugins/marketplace.json`、`~/.agents/plugins/marketplace.json` | https://developers.openai.com/codex/plugins/build#marketplace-metadata |
| Plugin-bundled MCP / hooks | 插件可打包 MCP server 配置和生命周期 hooks。 | `.mcp.json`、`hooks/hooks.json`、manifest `mcpServers` / `hooks` 字段 | https://developers.openai.com/codex/plugins/build#bundled-mcp-servers-and-lifecycle-hooks |


