# Claude API / Anthropic SDK 工具链参考

## 概述

本文档是 Claude API 和 Anthropic SDK 完整工具链的参考索引，涵盖所有 API 端点、SDK 语言支持、可用模型、功能能力、服务端工具、Managed Agents 平台以及 Claude Code CLI 配置。每条目均标注官方文档地址。

## 一、核心 API 端点

| 端点 | 功能 | 官方文档 |
|------|------|---------|
| `POST /v1/messages` | 核心消息接口，所有功能入口 | https://platform.claude.com/docs/en/build-with-claude/messages |
| `POST /v1/messages/batches` | 异步批处理，50% 价格优惠，最多 100,000 请求/批次 | https://platform.claude.com/docs/en/build-with-claude/batch-processing |
| `POST /v1/messages/count_tokens` | Token 计数 | https://platform.claude.com/docs/en/build-with-claude/token-counting |
| `POST /v1/files` | 文件上传 API（Beta），最大 500MB/文件，100GB/组织 | https://platform.claude.com/docs/en/build-with-claude/files |
| `GET /v1/models` | 模型列表 | https://platform.claude.com/docs/en/about-claude/models/overview |
| `GET /v1/models/{id}` | 模型详情（上下文窗口、能力支持） | 同上 |

## 二、SDK 语言支持

| 语言 | 安装命令 | SDK 仓库 |
|------|---------|---------|
| Python | `pip install anthropic` | https://github.com/anthropics/anthropic-sdk-python |
| TypeScript | `npm install @anthropic-ai/sdk` | https://github.com/anthropics/anthropic-sdk-typescript |
| Java | Maven/Gradle `com.anthropic:anthropic-java` | https://github.com/anthropics/anthropic-sdk-java |
| Go | `go get github.com/anthropics/anthropic-sdk-go` | https://github.com/anthropics/anthropic-sdk-go |
| Ruby | `gem install anthropic` | https://github.com/anthropics/anthropic-sdk-ruby |
| C# | `dotnet add package Anthropic` | https://github.com/anthropics/anthropic-sdk-csharp |
| PHP | `composer require anthropic-ai/sdk` | https://github.com/anthropics/anthropic-sdk-php |

## 三、当前模型

| 模型 | Model ID | 上下文窗口 | 最大输出 | 输入价格 ($/1M tokens) | 输出价格 ($/1M tokens) |
|------|---------|-----------|---------|----------------------|----------------------|
| Claude Opus 4.7 | `claude-opus-4-7` | 1M | 128K | $5.00 | $25.00 |
| Claude Opus 4.6 | `claude-opus-4-6` | 1M | 128K | $5.00 | $25.00 |
| Claude Sonnet 4.6 | `claude-sonnet-4-6` | 1M | 64K | $3.00 | $15.00 |
| Claude Haiku 4.5 | `claude-haiku-4-5` | 200K | 64K | $1.00 | $5.00 |

模型概览文档：https://platform.claude.com/docs/en/about-claude/models/overview

## 四、推理与思考

| 功能 | 说明 | 适用模型 | 官方文档 |
|------|------|---------|---------|
| Adaptive Thinking | 自适应思考，模型动态决定思考时机与深度 | Opus 4.7/4.6, Sonnet 4.6 | https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking |
| Extended Thinking | 固定 token 预算思考（已弃用，Opus 4.7 返回 400） | Opus 4.5 及更早 | https://platform.claude.com/docs/en/build-with-claude/extended-thinking |
| Effort Parameter | `output_config.effort`: `low` / `medium` / `high` / `xhigh` / `max` | Opus 4.7/4.6/4.5, Sonnet 4.6 | https://platform.claude.com/docs/en/build-with-claude/effort |
| Task Budgets（Beta） | `output_config.task_budget`，agentic loop 总 token 预算（最低 20,000） | Opus 4.7 | https://platform.claude.com/docs/en/build-with-claude/effort |
| Thinking Display | `thinking.display`: `"omitted"`（默认）/ `"summarized"` | Opus 4.7 | https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking |

## 五、结构化输出

| 功能 | 说明 | 官方文档 |
|------|------|---------|
| JSON Outputs | `output_config.format` 约束响应为指定 JSON Schema | https://platform.claude.com/docs/en/build-with-claude/structured-outputs |
| Strict Tool Use | `strict: true`，严格验证工具参数 Schema | 同上 |
| `client.messages.parse()` | SDK 自动解析和验证响应（推荐） | 同上 |
| Zod / Pydantic 集成 | TypeScript: `zodOutputFormat`, Python: Pydantic `BaseModel` | 同上 |

## 六、用户自定义工具

| 功能 | 说明 | 官方文档 |
|------|------|---------|
| Tool Runner（Beta） | SDK 自动处理工具调用循环（`tool_runner()`） | https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview |
| Manual Agentic Loop | 手动控制工具调用循环，检查 `stop_reason` | 同上 |
| Tool Choice | `auto` / `any` / `tool` / `none`，控制何时调用工具 | 同上 |
| Parallel Tool Use | 单次响应并行调用多个工具（默认启用，可禁用） | 同上 |
| MCP Tool Conversion | Python SDK: `anthropic.lib.tools.mcp`，将 MCP 工具转为 API 类型 | 同上 |
| Tool Examples | 工具定义中提供示例调用，减少参数错误 | https://platform.claude.com/docs/en/agents-and-tools/tool-use/implement-tool-use |

## 七、服务端工具

| 工具 | Type 字符串 | 说明 | 官方文档 |
|------|-----------|------|---------|
| Code Execution | `code_execution_20260120` | 沙箱代码执行（Python 3.11, 1 CPU, 5GB RAM, 5GB 磁盘），容器可复用 30 天 | https://platform.claude.com/docs/en/agents-and-tools/tool-use/code-execution-tool |
| Web Search | `web_search_20260209` | 网络搜索，Opus 4.7/4.6/Sonnet 4.6 支持动态过滤 | https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool |
| Web Fetch | `web_fetch_20260209` | 获取指定 URL 内容 | 同上 |
| Computer Use | — | 桌面交互（截图、鼠标、键盘），可 Anthropic 托管或自托管 | https://platform.claude.com/docs/en/agents-and-tools/computer-use/overview |
| Bash Tool | `bash_20250124` | Shell 命令执行（客户端参考实现） | https://platform.claude.com/docs/en/agents-and-tools/tool-use/bash-tool |
| Text Editor | `text_editor_20250728` | 文件查看/创建/编辑，name 为 `str_replace_based_edit_tool` | https://platform.claude.com/docs/en/agents-and-tools/tool-use/text-editor-tool |
| Memory Tool | `memory_20250818` | 跨会话记忆存储（客户端实现 `/memories` 目录） | https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool |
| Tool Search | — | 动态工具发现，从大量工具库中按需加载 | https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-search-tool |
| Programmatic Tool Calling | — | 将工具调用组合为代码脚本执行，仅最终输出返回 Claude | https://platform.claude.com/docs/en/agents-and-tools/tool-use/programmatic-tool-calling |
| Advisor Tool（Beta） | `advisor_20260301` | 二级模型咨询，beta header `advisor-tool-2026-03-01` | https://platform.claude.com/docs/en/agents-and-tools/tool-use/advisor-tool |

## 八、Prompt Caching

| 功能 | 说明 | 官方文档 |
|------|------|---------|
| Ephemeral Cache | 前缀匹配缓存，5 分钟（默认）或 1 小时 TTL，最多 4 个断点 | https://platform.claude.com/docs/en/build-with-claude/prompt-caching |
| 自动缓存 | 顶层 `cache_control: {type: "ephemeral"}` 自动放置在最后可缓存块 | 同上 |
| 经济性 | 缓存写入 ~1.25×（5min）/~2×（1h），缓存读取 ~0.1× | 同上 |
| 最低缓存阈值 | Opus 4.7/4.6/4.5, Haiku 4.5: 4096 tokens; Sonnet 4.6: 2048 tokens | 同上 |

## 九、流式传输

| 功能 | 说明 | 官方文档 |
|------|------|---------|
| SSE Streaming | Server-Sent Events 实时流，6 种事件类型 | https://platform.claude.com/docs/en/build-with-claude/streaming |
| `stream.finalMessage()` | TypeScript: 获取完整 Message 对象 | 同上 |
| `stream.get_final_message()` | Python: 获取完整 Message 对象 | 同上 |
| `stream.text_stream` | Python: 纯文本流迭代器 | 同上 |
| 大输出要求 | `max_tokens > ~16000` 必须使用流式（否则 HTTP 超时） | 同上 |

## 十、上下文管理

| 功能 | 说明 | 官方文档 |
|------|------|---------|
| Compaction（Beta） | 服务端自动压缩上下文，`compact-2026-01-12` beta header | https://platform.claude.com/docs/en/build-with-claude/compaction |
| Context Editing（Beta） | 清除过时工具结果和思考块，保持转录精干 | https://platform.claude.com/docs/en/build-with-claude/context-editing |
| Context Windows | Opus 4.7/4.6, Sonnet 4.6: 1M; Haiku 4.5: 200K | https://platform.claude.com/docs/en/build-with-claude/context-windows |

## 十一、多模态

| 功能 | 说明 | 官方文档 |
|------|------|---------|
| Vision（图片理解） | Base64/URL 图片输入，支持 PNG/JPEG/GIF/WebP | https://platform.claude.com/docs/en/build-with-claude/vision |
| 高分辨率 Vision | Opus 4.7: 2576px 长边（此前 1568px），坐标 1:1 映射像素 | 同上 |
| PDF 支持 | PDF 文档输入，支持 citations | https://platform.claude.com/docs/en/build-with-claude/pdf-support |
| Files API（Beta） | 文件上传复用，`files-api-2025-04-14` beta header | https://platform.claude.com/docs/en/build-with-claude/files |
| Citations | 文档引用标注，与 `output_config.format` 互斥 | https://platform.claude.com/docs/en/build-with-claude/citations |

## 十二、Managed Agents（Beta）

托管 Agent 平台：Anthropic 运行 agent 循环并托管工具执行容器。Agent 是持久化、版本化的配置对象；Session 是每次运行的实例。Beta header: `managed-agents-2026-04-01`。

### 核心资源

| 资源 | API 路径 | 说明 | 官方文档 |
|------|---------|------|---------|
| Agents | `/v1/agents` | 持久化 agent 配置（model/system/tools/mcp_servers），版本化 | https://platform.claude.com/docs/en/managed-agents/agent-setup |
| Sessions | `/v1/sessions` | 有状态会话，SSE 事件流 + 轮询 + Webhooks | https://platform.claude.com/docs/en/managed-agents/sessions |
| Environments | `/v1/environments` | 容器执行环境模板（网络策略: `unrestricted` / `package_managers_and_custom`） | https://platform.claude.com/docs/en/managed-agents/environments |
| Vaults | `/v1/vaults` | MCP OAuth 凭据存储，自动刷新 | https://platform.claude.com/docs/en/managed-agents/vaults |
| Memory Stores | `/v1/memory_stores` | 跨会话持久记忆（FUSE 挂载，mem_/memver_ 版本化） | https://platform.claude.com/docs/en/managed-agents/memory |

### 会话交互

| 功能 | 说明 | 官方文档 |
|------|------|---------|
| Events & Streaming | SSE 事件流 + 轮询 + Webhooks，stream-first 顺序 | https://platform.claude.com/docs/en/managed-agents/events-and-streaming |
| Outcomes | `user.define_outcome` 评分驱动迭代循环 | https://platform.claude.com/docs/en/managed-agents/define-outcomes |
| Multi-Agent | 协调者 + 子 agent roster，共享容器隔离上下文 | https://platform.claude.com/docs/en/managed-agents/multi-agent |
| Webhooks | HTTPS 推送，HMAC 签名，Console 注册 | https://platform.claude.com/docs/en/managed-agents/webhooks |

### 工具与集成

| 功能 | 说明 | 官方文档 |
|------|------|---------|
| Agent Toolset | `agent_toolset_20260401`: bash/read/write/edit/glob/grep/web_fetch/web_search | https://platform.claude.com/docs/en/managed-agents/tools |
| MCP Connector | MCP 服务器连接，auth 通过 vault | https://platform.claude.com/docs/en/managed-agents/mcp-connector |
| Custom Tools | 客户端处理 `agent.custom_tool_use` → `user.custom_tool_result` | https://platform.claude.com/docs/en/managed-agents/tools |
| Skills | Anthropic 预置 (xlsx/docx/pptx/pdf) + 自定义 skills | https://platform.claude.com/docs/en/managed-agents/skills |
| GitHub 仓库 | `github_repository` 资源挂载，git proxy 注入 token | https://platform.claude.com/docs/en/managed-agents/github |
| Permission Policies | `always_allow` / `always_ask`，per-tool 可覆盖 | https://platform.claude.com/docs/en/managed-agents/permission-policies |
| Cloud Containers | 容器运行时和网络配置 | https://platform.claude.com/docs/en/managed-agents/cloud-containers |

### 快速入门与迁移

| 文档 | 地址 |
|------|------|
| Quickstart | https://platform.claude.com/docs/en/managed-agents/quickstart |
| Onboarding | https://platform.claude.com/docs/en/managed-agents/onboarding |
| Migration Guide | https://platform.claude.com/docs/en/managed-agents/migration |
| Observability | https://platform.claude.com/docs/en/managed-agents/observability |
| Client Patterns | lossless reconnect, idle-break gate, post-idle race, file-mount gotchas, secrets via custom tools |

## 十三、Claude Code CLI

| 功能 | 说明 | 官方文档 |
|------|------|---------|
| Hooks | 26 个钩子事件，支持 command/http/mcp_tool/prompt/agent 类型 | https://code.claude.com/docs/en/hooks |
| Settings | `.claude/settings.json`（项目）/ `~/.claude/settings.json`（全局） | https://code.claude.com/docs/en/settings |
| Memory（CLAUDE.md） | 项目/用户指令文件 | https://code.claude.com/docs/en/memory |
| Skills | 自定义技能（SKILL.md） | https://code.claude.com/docs/en/skills |
| MCP 集成 | 连接 MCP 服务器扩展工具 | https://code.claude.com/docs/en/mcp |
| Sub-agents | 子代理并行工作 | https://code.claude.com/docs/en/sub-agents |
| CLI 参考 | 命令行完整参考 | https://code.claude.com/docs/en/cli-reference |
| Keybindings | `~/.claude/keybindings.json` 自定义键位 | https://code.claude.com/docs/en/keybindings |

### Hook 事件清单

**会话级**: `SessionStart`, `SessionEnd`
**轮次级**: `UserPromptSubmit`, `UserPromptExpansion`, `Stop`, `StopFailure`
**工具级**: `PreToolUse`, `PostToolUse`, `PostToolUseFailure`, `PostToolBatch`, `PermissionRequest`, `PermissionDenied`
**通知/状态**: `Notification`, `TeammateIdle`, `InstructionsLoaded`, `ConfigChange`, `CwdChanged`, `FileChanged`
**子代理**: `SubagentStart`, `SubagentStop`
**任务**: `TaskCreated`, `TaskCompleted`
**上下文**: `PreCompact`, `PostCompact`
**MCP**: `Elicitation`, `ElicitationResult`
**Worktree**: `WorktreeCreate`, `WorktreeRemove`

## 十四、API 基础设施

| 功能 | 说明 | 官方文档 |
|------|------|---------|
| Rate Limits | 按 tier 和 model 的速率限制 | https://platform.claude.com/docs/en/api/rate-limits |
| Error Codes | HTTP 错误码参考（400/401/403/404/413/429/500/529） | https://platform.claude.com/docs/en/api/errors |
| Pricing | 各模型输入/输出 token 定价 | https://platform.claude.com/docs/en/pricing |
| Model Migration | 模型迁移指南（breaking changes, deprecated params） | https://platform.claude.com/docs/en/about-claude/models/migration-guide |
| Streaming | SSE 流式事件类型和最佳实践 | https://platform.claude.com/docs/en/build-with-claude/streaming |

## 十五、工具链

| 工具 | 说明 | 地址 |
|------|------|------|
| Anthropic CLI (`ant`) | 命令行管理 agents/environments/sessions，YAML 定义 + 版本控制 | https://platform.claude.com/docs/en/api/sdks/cli |
| Anthropic Console | Web 管理界面（Workspace、API Keys、Sessions） | https://console.anthropic.com |
| Claude Code | CLI 代理编码助手（VS Code / JetBrains / Terminal） | https://code.claude.com/docs |
| Status Page | 服务状态 | https://status.anthropic.com |

## 十六、Cloud Provider 接入

| 平台 | 运营方 | API 对等 | Model ID 格式 | 官方文档 |
|------|--------|---------|-------------|---------|
| First-party API | Anthropic | 完整 | `claude-opus-4-7` | https://platform.claude.com/docs |
| Claude Platform on AWS | Anthropic（SigV4 auth） | 同日对等 | `claude-opus-4-7`（无前缀） | https://platform.claude.com/docs/en/build-with-claude/claude-platform-on-aws |
| Amazon Bedrock | AWS | 子集（无 Managed Agents/服务端工具） | `anthropic.claude-opus-4-7` | https://platform.claude.com/docs/en/build-with-claude/claude-on-amazon-bedrock |

## 附录：废弃与退役模型

### 即将退役

| 模型 | 退役日期 | 替代 |
|------|---------|------|
| `claude-3-haiku-20240307` | 2026-04-19 | `claude-haiku-4-5` |
| `claude-opus-4-20250514` | 2026-06-15 | `claude-opus-4-7` |
| `claude-sonnet-4-20250514` | 2026-06-15 | `claude-sonnet-4-6` |

### 已退役

`claude-3-7-sonnet-20250219`, `claude-3-5-haiku-20241022`, `claude-3-opus-20240229`, `claude-3-5-sonnet-20241022`, `claude-3-5-sonnet-20240620`, `claude-3-sonnet-20240229`, `claude-2.1`, `claude-2.0`
