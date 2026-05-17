# Codex Tools 支持类型与文档入口

## 概述

这份参考用于快速定位 Codex 本地工具、扩展点和配置类型的官方说明文档。条目按使用面分组：指令与上下文、配置开关、Skills、MCP、App/Cloud/Memories/IDE、Subagents、Plugins、Slash Commands、安全治理、Rules、Workflows、App Server。

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

### App / Cloud / Memories / IDE

| 名称 | 描述 | 配置/路径示例 | 说明文档 |
| --- | --- | --- | --- |
| Codex app | ChatGPT 集合中的 Codex 桌面应用，含项目、actions、history。 | 从 `codex app` 或 `chatgpt.com/codex` 启动 | https://developers.openai.com/codex/app |
| App commands | App 内可用的命令面板和快捷键。 | `Cmd+K` 打开命令面板 | https://developers.openai.com/codex/app/commands |
| App browser | Codex app 内的共享渲染页面视图，用于本地预览、公共页面、视觉评论和小范围浏览器验证。 | 工具栏打开、点击 URL、`Cmd/Ctrl+Shift+B` | https://developers.openai.com/codex/app/browser |
| Browser use / Browser plugin | 让 Codex 操作 in-app browser，点击、输入、截图并验证页面状态。 | 安装并启用 Browser plugin，或在 prompt 中引用 `@Browser` | https://developers.openai.com/codex/app/browser#browser-use |
| Codex Chrome extension | 当目标页面依赖 Chrome 登录态、cookies 或扩展时，使用 Chrome extension 而不是 in-app browser。 | Chrome signed-in pages | https://developers.openai.com/codex/app/chrome-extension |
| App features | App 项目、actions、review、automations 等核心功能入口。 | App 左侧导航栏 | https://developers.openai.com/codex/app/features |
| App automations | 自动化工作流，触发条件 + 执行动作。 | App automations 面板 | https://developers.openai.com/codex/app/automations |
| App review | App 中的 code review 界面与流程。 | App Review 面板 | https://developers.openai.com/codex/app/review |
| App settings | App 端设置项。 | App 设置页面 | https://developers.openai.com/codex/app/settings |
| App computer use | App 内的 computer use 能力（操作桌面/浏览器）。 | App computer use 模式 | https://developers.openai.com/codex/app/computer-use |
| Local environments / actions | Codex app 本地项目的 worktree setup steps 和常用动作按钮。 | `<repo>/.codex/` 下的本地环境配置、Run/Test actions | https://developers.openai.com/codex/app/local-environments |
| App worktrees | App 内的多分支工作区管理。 | App worktrees 面板 | https://developers.openai.com/codex/app/worktrees |
| Cloud environments | 云端任务的 container、setup script、maintenance script、环境变量、secrets、cache 和 universal image。 | `chatgpt.com/codex/settings/environments` | https://developers.openai.com/codex/cloud/environments |
| Cloud agent internet access | 云端 agent phase 的联网开关、domain allowlist 和 HTTP method 限制。 | per-environment Off/On、Common dependencies allowlist | https://developers.openai.com/codex/cloud/internet-access |
| GitHub `@codex` 与 code review | 在 GitHub PR/issue 中委派云端任务，或请求/启用 Codex code review。 | `@codex review`、`@codex fix the CI failures` | https://developers.openai.com/codex/integrations/github |
| Linear / Slack 集成 | Codex 与 Linear 和 Slack 的集成能力。 | 在 Codex app 中连接 Linear / Slack | https://developers.openai.com/codex/integrations/linear、https://developers.openai.com/codex/integrations/slack |
| Memories | 本地记忆层，保存稳定偏好、工作流、技术栈、项目约定和常见坑；强制团队规则仍应放在 `AGENTS.md` 或仓库文档。 | `[features] memories = true`、`/memories`、`[memories] use_memories = true` | https://developers.openai.com/codex/memories |
| Chronicle | Memories 的辅助能力，用于从屏幕恢复近期工作上下文。 | Codex app memory workflow | https://developers.openai.com/codex/memories/chronicle |
| IDE 集成 | 在 VS Code、Cursor、Windsurf 中安装 Codex 扩展或通过 language server protocol 使用。 | VS Code 扩展 / Cursor 集成 | https://developers.openai.com/codex/ide |
| IDE commands | IDE 中的 Codex 命令面板和快捷键。 | VS Code 命令面板中搜索 "Codex" | https://developers.openai.com/codex/ide/commands |
| IDE features | IDE 内内联编辑、多文件编辑、LSP diagnostics、terminal 集成等。 | 选中代码 → 编辑 / 修复 | https://developers.openai.com/codex/ide/features |
| IDE settings | IDE 扩展的设置项。 | VS Code settings → Codex | https://developers.openai.com/codex/ide/settings |
| IDE slash commands | IDE 中可用的 slash 命令。 | VS Code 中 `/compact`、`/review` 等 | https://developers.openai.com/codex/ide/slash-commands |

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

### Codex App Server 与迁移

| 名称 | 描述 | 配置/路径示例 | 说明文档 |
| --- | --- | --- | --- |
| Codex app server API | Codex app server 的 thread、turn、command、plugin、skill、MCP、config、filesystem 等 API。 | `thread/start`、`skills/list`、`mcpServerStatus/list` | https://developers.openai.com/codex/app-server#api-overview |
| App server item events | 运行时事件项，包括 tool call、MCP call、webSearch、imageView、fileChange 等。 | `mcpToolCall`、`webSearch`、`imageView` | https://developers.openai.com/codex/app-server#items |
| 外部 agent 配置迁移 | Codex 可迁移 instruction files、config、skills、MCP、hooks、slash commands、subagents 等。 | migration detected setup table | https://developers.openai.com/codex/migrate#what-codex-can-import |

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
