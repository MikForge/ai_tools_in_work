# Codex 配置与 CLI 参考

## 概述

Codex 配置系统与 CLI 运行时参考：config.toml、Feature flags、模型/Provider、认证、权限、Shell 策略、Slash Commands 等配置字段和运行时命令的官方文档入口。

## 条目

### 指令与项目上下文

| 名称 | 描述 | 配置/路径示例 | 说明文档 |
| --- | --- | --- | --- |
| `AGENTS.md` / `AGENTS.override.md` | Codex 启动时读取的全局、项目、子目录指令链。 | `~/.codex/AGENTS.md`、`<repo>/AGENTS.md`、`<repo>/services/foo/AGENTS.override.md` | https://developers.openai.com/codex/guides/agents-md |
| `project_doc_fallback_filenames` | 让 Codex 把自定义文件名当作项目指令文件。 | `project_doc_fallback_filenames = ["TEAM_GUIDE.md"]` | https://developers.openai.com/codex/guides/agents-md#customize-fallback-filenames |
| `model_instructions_file` | 用单独文件替代内置模型指令。 | `model_instructions_file = "./instructions.md"` | https://developers.openai.com/codex/config-reference#configtoml |


### 配置与功能开关

| 名称 | 描述 | 配置/路径示例 | 说明文档 |
| --- | --- | --- | --- |
| `config.toml` | Codex 的主配置文件，支持用户级、项目级、系统级配置。 | `~/.codex/config.toml`、`<repo>/.codex/config.toml`、`/etc/codex/config.toml` | https://developers.openai.com/codex/config-basic |
| 配置优先级 | 决定 CLI flags、profiles、project config、user config、system config 的覆盖顺序。 | `codex --profile work -c model=gpt-5.5` | https://developers.openai.com/codex/config-basic#configuration-precedence |
| 配置字段参考 | `model`、`approval_policy`、`sandbox_mode`、`mcp_servers`、`agents`、`hooks`、`tools` 等字段全集。 | `[mcp_servers.docs]`、`[agents]`、`[features]` | https://developers.openai.com/codex/config-reference#configtoml |
| Config JSON schema | `config.toml` 的自动补全和诊断 schema。 | `#:schema https://developers.openai.com/codex/config-schema.json` | https://developers.openai.com/codex/config-schema.json |
| 配置高级功能 | 条件配置、动态 profile 切换、TOML 继承、环境变量插值。 | `[profiles."os:windows"]`、`${VAR}`、`[profiles.base]` / `extends = "base"` | https://developers.openai.com/codex/config-advanced |
| Feature flags | 控制 hooks、plugin hooks、multi-agent、apps、memories、web search 等功能面。 | `[features] hooks = true`、`multi_agent = true` | https://developers.openai.com/codex/config-basic#supported-features |
| 模型与 provider | 控制默认模型、review 模型、provider、推理强度、verbosity、本地/自定义 provider。 | `model = "gpt-5.5"`、`review_model = "gpt-5.5"`、`[model_providers.my-api]` | https://developers.openai.com/codex/config-reference#configtoml |
| 模型参考 | Codex 支持的模型列表（GPT-5.5、o-series 推理模型等）及其能力差异。 | `model = "o4-mini"` | https://developers.openai.com/codex/models |
| Profiles | 为不同工作场景配置模型、权限、web search、service tier、指令文件等覆盖项。 | `[profiles.work] model = "gpt-5.5"`、`profile = "work"` | https://developers.openai.com/codex/config-reference#configtoml |
| 认证与凭据存储 | 控制登录方式、CLI 凭据保存位置、ChatGPT workspace 限制和 MCP OAuth 回调/凭据存储。 | `forced_login_method = "api"`、`cli_auth_credentials_store = "keyring"`、`mcp_oauth_credentials_store = "auto"` | https://developers.openai.com/codex/config-reference#configtoml |
| 认证方式 | Codex 支持的认证路径：ChatGPT 账号登录 / API Key / Enterprise SSO。 | `codex` → Sign in with ChatGPT / API key setup | https://developers.openai.com/codex/auth |
| Approval / sandbox / permission profiles | 控制命令审批、filesystem/network 权限 profile、默认权限和 workspace writable roots。 | `approval_policy = "on-request"`、`default_permissions = ":workspace"`、`[permissions.locked.filesystem]` | https://developers.openai.com/codex/agent-approvals-security |
| Shell 环境策略 | 控制 shell tool 子进程继承、排除、白名单和注入的环境变量。 | `[shell_environment_policy] inherit = "core"`、`exclude = ["*_TOKEN"]` | https://developers.openai.com/codex/config-reference#configtoml |
| Web search / image viewer tools | 控制 Codex 的 web search 模式和本地图片查看工具。 | `web_search = "live"`、`tools.view_image = true` | https://developers.openai.com/codex/config-reference#configtoml |
| Tool suggestions | 控制 connector/plugin 的可发现建议和禁用清单。 | `[[tool_suggest.discoverables]] type = "plugin"`、`[[tool_suggest.disabled_tools]]` | https://developers.openai.com/codex/config-reference#configtoml |
| 历史、压缩与 token 预算 | 控制会话历史保存、自动压缩阈值、压缩 prompt、工具输出 token 上限。 | `history.persistence = "save-all"`、`model_auto_compact_token_limit = 120000`、`tool_output_token_limit = 20000` | https://developers.openai.com/codex/config-reference#configtoml |
| 配置示例 | 完整 `config.toml` 示例，含注释说明。 | 直接复制参考 | https://developers.openai.com/codex/config-sample |
| CLI 参考 | Codex CLI 命令行 flags 和子命令全集。 | `codex --help`、`codex --model gpt-5.5 --approval-policy on-request` | https://developers.openai.com/codex/cli/reference |
| CLI 特性 | TUI 模式、状态栏、keymap、自定义 slash commands 等 CLI 交互特性。 | `codex`（TUI）、`/keymap`、`/statusline` | https://developers.openai.com/codex/cli/features |
| 非交互模式 | 脚本化和 CI/CD 中的无 TUI 执行模式。 | `codex --non-interactive "analyze this"` | https://developers.openai.com/codex/noninteractive |


### Slash Commands 与运行时控制

| 名称 | 描述 | 配置/路径示例 | 说明文档 |
| --- | --- | --- | --- |
| Slash commands | Codex CLI/TUI 内置命令集合。 | `/hooks`、`/mcp`、`/agent`、`/plugins`、`/apps`、`/status`、`/review` | https://developers.openai.com/codex/cli/slash-commands |
| Custom slash commands / reusable prompts | 团队或个人可复用 prompt 快捷入口；官方 CLI features 文档将其归入 slash commands 工作流。 | 自定义 slash command / reusable prompt | https://developers.openai.com/codex/cli/features#slash-commands |
| `/init` | 在当前目录生成 `AGENTS.md` scaffold。 | `/init` | https://developers.openai.com/codex/cli/slash-commands#built-in-slash-commands |
| `/mcp` | 列出当前配置的 MCP tools。 | `/mcp verbose` | https://developers.openai.com/codex/cli/slash-commands#built-in-slash-commands |
| `/hooks` | 查看、信任或禁用 lifecycle hooks。 | `/hooks` | https://developers.openai.com/codex/cli/slash-commands#built-in-slash-commands |
| `/permissions` | 在会话中调整 Codex 可以无需询问执行的权限。 | `/permissions` | https://developers.openai.com/codex/cli/slash-commands#built-in-slash-commands |
| `/apps` / `/plugins` / `/agent` | 浏览 connectors、插件和 spawned subagent threads。 | `/apps`、`/plugins`、`/agent` | https://developers.openai.com/codex/cli/slash-commands#built-in-slash-commands |
| `/model` / `/fast` / `/plan` / `/personality` | 调整模型、Fast mode、Plan mode 和沟通风格。 | `/model`、`/fast`、`/plan`、`/personality` | https://developers.openai.com/codex/cli/slash-commands#built-in-slash-commands |
| `/diff` / `/review` | 查看工作区 diff，并请求 Codex review 当前 working tree。 | `/diff`、`/review` | https://developers.openai.com/codex/cli/slash-commands#built-in-slash-commands |
| `/compact` / `/resume` / `/fork` / `/side` | 管理上下文压缩、恢复历史会话、fork 会话和临时 side conversation。 | `/compact`、`/resume`、`/fork`、`/side` | https://developers.openai.com/codex/cli/slash-commands#built-in-slash-commands |
| `/debug-config` / `/statusline` / `/title` / `/keymap` | 调试配置层和 requirements，并交互配置 TUI 状态栏、标题和快捷键。 | `/debug-config`、`/statusline`、`/title`、`/keymap` | https://developers.openai.com/codex/cli/slash-commands#built-in-slash-commands |

## 使用建议

- 查"某个目录/文件应该放哪"：先看对应类型条目的说明文档，再回到 `config-reference` 确认字段名。
- 查"Codex 当前能不能支持某个开关"：优先看 `config-basic#supported-features` 和 `config-reference#configtoml`。
- 查"工具从哪里来"：MCP、Apps/connectors、Plugins 是三条不同路径；MCP 偏外部工具协议，Apps/connectors 偏 ChatGPT app 集成，Plugins 偏可分发能力包。
- 查"安全边界"：优先看 `agent-approvals-security`、`rules`、`hooks` 和 `requirements.toml`。
- 查"新增功能"：看 `feature-maturity` 确定稳定性和 `skills` / `workflows` 了解新能力模式。
- 查"是否逐字段完整"：以 `config-reference#configtoml` 和 `config-reference#requirementstoml` 为准；本页负责按类型分流，避免把完整字段表复制进知识库。

