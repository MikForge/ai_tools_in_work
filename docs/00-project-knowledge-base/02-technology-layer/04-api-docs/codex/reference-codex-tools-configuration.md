# Codex Tools 支持类型与文档入口

## 概述

这份参考用于快速定位 Codex 本地工具、扩展点和配置类型的官方说明文档。条目按使用面分组：指令、配置、运行界面、扩展机制、工具接入、治理安全、观测和运行时命令。

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
| Feature flags | 控制 hooks、plugin hooks、multi-agent、apps、memories、web search 等功能面。 | `[features] hooks = true`、`multi_agent = true` | https://developers.openai.com/codex/config-basic#supported-features |
| 模型与 provider | 控制默认模型、review 模型、provider、推理强度、verbosity、本地/自定义 provider。 | `model = "gpt-5.5"`、`review_model = "gpt-5.5"`、`[model_providers.my-api]` | https://developers.openai.com/codex/config-reference#configtoml |
| Profiles | 为不同工作场景配置模型、权限、web search、service tier、指令文件等覆盖项。 | `[profiles.work] model = "gpt-5.5"`、`profile = "work"` | https://developers.openai.com/codex/config-reference#configtoml |
| 认证与凭据存储 | 控制登录方式、CLI 凭据保存位置、ChatGPT workspace 限制和 MCP OAuth 回调/凭据存储。 | `forced_login_method = "api"`、`cli_auth_credentials_store = "keyring"`、`mcp_oauth_credentials_store = "auto"` | https://developers.openai.com/codex/config-reference#configtoml |
| Approval / sandbox / permission profiles | 控制命令审批、filesystem/network 权限 profile、默认权限和 workspace writable roots。 | `approval_policy = "on-request"`、`default_permissions = ":workspace"`、`[permissions.locked.filesystem]` | https://developers.openai.com/codex/agent-approvals-security |
| Shell 环境策略 | 控制 shell tool 子进程继承、排除、白名单和注入的环境变量。 | `[shell_environment_policy] inherit = "core"`、`exclude = ["*_TOKEN"]` | https://developers.openai.com/codex/config-reference#configtoml |
| Web search / image viewer tools | 控制 Codex 的 web search 模式和本地图片查看工具。 | `web_search = "live"`、`tools.view_image = true` | https://developers.openai.com/codex/config-reference#configtoml |
| Tool suggestions | 控制 connector/plugin 的可发现建议和禁用清单。 | `[[tool_suggest.discoverables]] type = "plugin"`、`[[tool_suggest.disabled_tools]]` | https://developers.openai.com/codex/config-reference#configtoml |
| 历史、压缩与 token 预算 | 控制会话历史保存、自动压缩阈值、压缩 prompt、工具输出 token 上限。 | `history.persistence = "save-all"`、`model_auto_compact_token_limit = 120000`、`tool_output_token_limit = 20000` | https://developers.openai.com/codex/config-reference#configtoml |
| TUI、通知与快捷键 | 控制 TUI 状态栏、窗口标题、通知、动画、主题和 keymap。 | `[tui] notifications = true`、`tui.status_line = ["model", "tokens"]`、`[tui.keymap.global]` | https://developers.openai.com/codex/config-reference#configtoml |
| 观测与日志 | 控制本地日志目录、通知命令、OpenTelemetry logs/traces/metrics 导出。 | `log_dir = "~/.codex/log"`、`notify = ["osascript", "..."]`、`[otel] exporter = "otlp-http"` | https://developers.openai.com/codex/config-reference#configtoml |
| 项目信任与根目录检测 | 控制 project-scoped `.codex/` 是否加载、项目根标记和项目指令读取上限。 | `[projects."/repo"] trust_level = "trusted"`、`project_root_markers = [".git"]` | https://developers.openai.com/codex/config-reference#configtoml |

### Skills

| 名称 | 描述 | 配置/路径示例 | 说明文档 |
| --- | --- | --- | --- |
| Skills / `SKILL.md` | 复用工作流的本地能力包，目录内必须包含 `SKILL.md`。 | `<repo>/.agents/skills/my-skill/SKILL.md`、`~/.agents/skills/my-skill/SKILL.md` | https://developers.openai.com/codex/skills |
| Skill 启用/禁用 | 在配置中按 skill 路径控制可用状态。 | `[[skills.config]] path = "/path/to/skill/SKILL.md" enabled = false` | https://developers.openai.com/codex/skills#enable-or-disable-skills |
| Skill 可选元数据 | 为 Codex app 提供展示名、图标、隐式调用策略和工具依赖声明。 | `<skill>/agents/openai.yaml` | https://developers.openai.com/codex/skills#optional-metadata |

### Hooks 与 Rules

| 名称 | 描述 | 配置/路径示例 | 说明文档 |
| --- | --- | --- | --- |
| Hooks / `hooks.json` | 生命周期钩子，可在会话开始、工具调用前后、用户 prompt 提交、停止时运行命令。 | `~/.codex/hooks.json`、`<repo>/.codex/hooks.json`、`[hooks]` | https://developers.openai.com/codex/hooks |
| Hook events | 当前支持 `SessionStart`、`PreToolUse`、`PermissionRequest`、`PostToolUse`、`UserPromptSubmit`、`Stop`。 | `[[hooks.PreToolUse]] matcher = "^Bash$"` | https://developers.openai.com/codex/hooks#hooks |
| Rules / `.rules` | 控制哪些命令可在 sandbox 外运行、需要审批或被禁止。 | `~/.codex/rules/default.rules`、`<repo>/.codex/rules/default.rules` | https://developers.openai.com/codex/rules |
| `prefix_rule` | Rules 的命令前缀规则，支持 `allow`、`prompt`、`forbidden`。 | `prefix_rule(pattern = ["gh", "pr", "view"], decision = "prompt")` | https://developers.openai.com/codex/rules#create-a-rules-file |

### MCP、Apps 与 Connectors

| 名称 | 描述 | 配置/路径示例 | 说明文档 |
| --- | --- | --- | --- |
| MCP servers | 让 Codex 连接第三方工具、文档、浏览器、Figma、GitHub 等外部上下文。 | `[mcp_servers.context7] command = "npx"`、`[mcp_servers.figma] url = "https://mcp.figma.com/mcp"` | https://developers.openai.com/codex/mcp |
| MCP stdio server | 由本地命令启动的 MCP server。 | `codex mcp add context7 -- npx -y @upstash/context7-mcp` | https://developers.openai.com/codex/mcp#stdio-servers |
| MCP streamable HTTP server | 通过 URL 访问的 MCP server，支持 bearer token 和 OAuth。 | `url = "https://example.com/mcp"` | https://developers.openai.com/codex/mcp#streamable-http-servers |
| MCP tool allow/deny | 对单个 MCP server 暴露的工具做 allowlist/denylist、超时、required 配置。 | `enabled_tools = ["search"]`、`disabled_tools = ["delete"]`、`required = true` | https://developers.openai.com/codex/config-reference#configtoml |
| Apps / connectors | 在 Codex 中启用 ChatGPT apps/connectors，并控制工具审批模式。 | `apps.<id>.enabled = true`、`apps.<id>.tools.<tool>.approval_mode = "prompt"` | https://developers.openai.com/codex/config-reference#configtoml |

### Codex 使用界面、浏览器与记忆

| 名称 | 描述 | 配置/路径示例 | 说明文档 |
| --- | --- | --- | --- |
| Codex Quickstart | Codex 的 App、IDE extension、CLI、Cloud 四种入口与首次设置路径。 | Codex app、VS Code/Cursor/Windsurf extension、`codex` CLI、`chatgpt.com/codex` | https://developers.openai.com/codex/quickstart |
| Codex app | 本地桌面 app 入口，承载项目选择、本地线程、浏览器、review pane、插件等体验。 | macOS / Windows Codex app | https://developers.openai.com/codex/app |
| Codex IDE extension | 在 IDE 侧边栏中使用 Codex Agent mode。 | VS Code、Cursor、Windsurf extension | https://developers.openai.com/codex/ide |
| Codex CLI | 终端 TUI/CLI 入口，支持 slash commands、MCP、hooks、plugins、agents 等控制面。 | `npm install -g @openai/codex`、`brew install codex` | https://developers.openai.com/codex/cli |
| Codex Cloud | 浏览器中的云端任务入口，可连接 GitHub repo、运行后台任务、创建 PR，也支持在 GitHub PR 中 `@codex` 委派任务。 | `https://chatgpt.com/codex` | https://developers.openai.com/codex/cloud |
| Non-interactive mode / `codex exec` | 脚本、CI、定时任务和管道中的 headless Codex；支持 JSONL 事件流、结构化输出 schema、stdin piping、resume。 | `codex exec --json "triage failing tests"`、`codex exec --output-schema ./schema.json` | https://developers.openai.com/codex/noninteractive |
| CLI image inputs | 将截图、设计稿或本地图片作为上下文交给 Codex。 | `codex -i screenshot.png "Explain this error"`、`codex --image img1.png,img2.jpg` | https://developers.openai.com/codex/cli/features#image-inputs |
| CLI image generation | 在 CLI 中让 Codex 生成或编辑图片资产，也可显式调用 `$imagegen`。 | `$imagegen`、附加参考图后生成 icon/banner/sprite | https://developers.openai.com/codex/cli/features#image-generation |
| Remote TUI / app server | 在一台机器运行 Codex app server，在另一台机器用 TUI 连接远程 workspace。 | `codex app-server --listen ws://127.0.0.1:4500`、`codex --remote ws://127.0.0.1:4500` | https://developers.openai.com/codex/cli/features#connect-the-tui-to-a-remote-app-server |
| In-app browser | Codex app 内的共享渲染页面视图，用于本地预览、公共页面、视觉评论和小范围浏览器验证。 | 工具栏打开、点击 URL、`Cmd/Ctrl+Shift+B` | https://developers.openai.com/codex/app/browser |
| Browser use / Browser plugin | 让 Codex 操作 in-app browser，点击、输入、截图并验证页面状态。 | 安装并启用 Browser plugin，或在 prompt 中引用 `@Browser` | https://developers.openai.com/codex/app/browser#browser-use |
| Codex Chrome extension | 当目标页面依赖 Chrome 登录态、cookies 或扩展时，使用 Chrome extension 而不是 in-app browser。 | Chrome signed-in pages | https://developers.openai.com/codex/app/chrome-extension |
| Local environments / actions | Codex app 本地项目的 worktree setup steps 和常用动作按钮。 | `<repo>/.codex/` 下的本地环境配置、Run/Test actions | https://developers.openai.com/codex/app/local-environments |
| Cloud environments | 云端任务的 container、setup script、maintenance script、环境变量、secrets、cache 和 universal image。 | `chatgpt.com/codex/settings/environments` | https://developers.openai.com/codex/cloud/environments |
| Cloud agent internet access | 云端 agent phase 的联网开关、domain allowlist 和 HTTP method 限制。 | per-environment Off/On、Common dependencies allowlist | https://developers.openai.com/codex/cloud/internet-access |
| GitHub `@codex` 与 code review | 在 GitHub PR/issue 中委派云端任务，或请求/启用 Codex code review。 | `@codex review`、`@codex fix the CI failures` | https://developers.openai.com/codex/integrations/github |
| Memories | 本地记忆层，保存稳定偏好、工作流、技术栈、项目约定和常见坑；强制团队规则仍应放在 `AGENTS.md` 或仓库文档。 | `[features] memories = true`、`/memories`、`[memories] use_memories = true` | https://developers.openai.com/codex/memories |
| Chronicle | Memories 的辅助能力，用于从屏幕恢复近期工作上下文。 | Codex app memory workflow | https://developers.openai.com/codex/memories/chronicle |

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

### Codex App Server 与迁移

| 名称 | 描述 | 配置/路径示例 | 说明文档 |
| --- | --- | --- | --- |
| Codex app server API | Codex app server 的 thread、turn、command、plugin、skill、MCP、config、filesystem 等 API。 | `thread/start`、`skills/list`、`mcpServerStatus/list` | https://developers.openai.com/codex/app-server#api-overview |
| App server item events | 运行时事件项，包括 tool call、MCP call、webSearch、imageView、fileChange 等。 | `mcpToolCall`、`webSearch`、`imageView` | https://developers.openai.com/codex/app-server#items |
| 外部 agent 配置迁移 | Codex 可迁移 instruction files、config、skills、MCP、hooks、slash commands、subagents 等。 | migration detected setup table | https://developers.openai.com/codex/migrate#what-codex-can-import |

## 使用建议

- 查“某个目录/文件应该放哪”：先看对应类型条目的说明文档，再回到 `config-reference` 确认字段名。
- 查“Codex 当前能不能支持某个开关”：优先看 `config-basic#supported-features` 和 `config-reference#configtoml`。
- 查“工具从哪里来”：MCP、Apps/connectors、Plugins 是三条不同路径；MCP 偏外部工具协议，Apps/connectors 偏 ChatGPT app 集成，Plugins 偏可分发能力包。
- 查“安全边界”：优先看 `agent-approvals-security`、`rules`、`hooks` 和 `requirements.toml`。
- 查“是否逐字段完整”：以 `config-reference#configtoml` 和 `config-reference#requirementstoml` 为准；本页负责按类型分流，避免把完整字段表复制进知识库。
