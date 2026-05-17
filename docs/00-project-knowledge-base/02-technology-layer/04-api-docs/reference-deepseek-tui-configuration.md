# DeepSeek TUI 配置与扩展参考

> 来源: [Hmbown/DeepSeek-TUI](https://github.com/Hmbown/DeepSeek-TUI)  
> 更新日期: 2026-05-17  
> 版本: v0.8.38

## 概述

DeepSeek TUI 是 DeepSeek V4 的终端编码 Agent，配置文件位于 `~/.deepseek/config.toml`。
扩展机制包括 Skills、Hooks、MCP Servers、Plugins 四条路径。

## 配置文件

### 路径与优先级

| 层级 | 路径 | 说明 |
|------|------|------|
| 全局默认 | `~/.deepseek/config.toml` | 用户级配置 |
| 环境变量 | `DEEPSEEK_CONFIG_PATH` | 指定配置文件路径 |
| CLI 覆盖 | `deepseek --config /path/to/config.toml` | 优先级最高 |
| 项目覆盖 | `<workspace>/.deepseek/config.toml` | 每个仓库可按需覆盖 |

来源: [CONFIGURATION.md](https://raw.githubusercontent.com/Hmbown/DeepSeek-TUI/main/docs/CONFIGURATION.md)

### 项目覆盖支持的键

| 键 | 作用 |
|----|------|
| `provider` | 切换后端 (e.g. `"nvidia-nim"`) |
| `model` | 覆盖 `default_text_model` |
| `api_key` | 仓库级密钥（通常从 `.env` 读取，**不可提交**） |
| `base_url` | 自托管端点 |
| `reasoning_effort` | 强制 `"high"` / `"max"` |
| `approval_policy` | `"never"` / `"on-request"` / `"untrusted"` |
| `sandbox_mode` | `"read-only"` / `"workspace-write"` / `"danger-full-access"` |
| `mcp_config_path` | 仓库级 MCP 服务器 |
| `notes_path` | 仓库内笔记 |
| `max_subagents` | 并发上限 (1..20) |
| `allow_shell` | 控制 shell 工具访问 |

来源: [CONFIGURATION.md](https://raw.githubusercontent.com/Hmbown/DeepSeek-TUI/main/docs/CONFIGURATION.md)

### Provider 配置示例

```toml
# ~/.deepseek/config.toml
api_key = "YOUR_DEEPSEEK_API_KEY"
default_text_model = "deepseek-v4-pro"

# 自定义 OpenAI 兼容网关
provider = "openai"
[providers.openai]
api_key = "YOUR_OPENAI_COMPATIBLE_API_KEY"
base_url = "https://your-gateway.example/v1"
```

### Profiles

```toml
api_key = "PERSONAL_KEY"
default_text_model = "deepseek-v4-pro"

[profiles.work]
api_key = "WORK_KEY"

[profiles.nvidia-nim]
provider = "nvidia-nim"
api_key = "NVIDIA_KEY"
default_text_model = "deepseek-ai/deepseek-v4-pro"

[profiles.ollama]
provider = "ollama"
base_url = "http://localhost:11434/v1"
default_text_model = "deepseek-coder:1.3b"
```

选择: `deepseek --profile work` 或 `DEEPSEEK_PROFILE=work`

## Hooks 系统

DeepSeek TUI 的 hooks 系统在工具执行前后、响应生命周期、审批生命周期等节点触发，
输出到 stdout、JSONL 文件或 Webhook。

来源: 
- [ARCHITECTURE.md](https://raw.githubusercontent.com/Hmbown/DeepSeek-TUI/main/docs/ARCHITECTURE.md)
- [crates/hooks/src/lib.rs](https://raw.githubusercontent.com/Hmbown/DeepSeek-TUI/main/crates/hooks/src/lib.rs)

### 事件类型（7 种）

| 事件 | 字段 | 说明 |
|------|------|------|
| `ResponseStart` | `response_id` | 响应开始 |
| `ResponseDelta` | `response_id`, `delta` | 响应增量（流式） |
| `ResponseEnd` | `response_id` | 响应结束 |
| `ToolLifecycle` | `response_id`, `tool_name`, `phase`, `payload` | 工具生命周期 |
| `JobLifecycle` | `job_id`, `phase`, `progress`, `detail` | 作业生命周期 |
| `ApprovalLifecycle` | `approval_id`, `phase`, `reason` | 审批生命周期 |
| `GenericEventFrame` | `frame` | 通用事件帧 |

### 输出 Sink

| Sink | 说明 |
|------|------|
| `StdoutHookSink` | JSON 事件打印到 stdout |
| `JsonlHookSink` | JSONL 追加写入文件（含时间戳） |
| Webhook | 发送到 HTTP 端点 |

多 sink 通过 `HookDispatcher` 分发，单个 sink 故障不影响其他。

### 配置格式

```toml
# ~/.deepseek/config.toml
[[hooks]]
event = "tool_call_before"
command = "echo 'Running tool: $TOOL_NAME'"
```

### TUI 内交互

- `/hooks` 或 `/hooks list` — 查看所有已配置 hooks（按事件分组，含名称、命令预览、超时、条件）
- 顶部显示 `[hooks].enabled` 全局开关状态

### 与 Claude Code Hooks 对比

| 维度 | Claude Code | DeepSeek TUI |
|------|------------|-------------|
| 事件数 | 26 个 | 7 个 |
| 配置位置 | `.claude/hooks/<name>.sh` + `settings.json` | `~/.deepseek/config.toml` 的 `[[hooks]]` |
| 输出方式 | command/http/mcp_tool/prompt/agent | stdout/jsonl/webhook |
| 条件过滤 | matcher | `hooks.rs` 支持 conditions |
| 子代理专属 | 支持 | 未单独暴露 |

## 扩展机制

来源: [ARCHITECTURE.md](https://raw.githubusercontent.com/Hmbown/DeepSeek-TUI/main/docs/ARCHITECTURE.md)

```
┌──────────┐  ┌──────────┐  ┌─────────┐  ┌────────────────┐
│  Tools   │  │  Skills  │  │  Hooks  │  │  MCP Servers   │
└──────────┘  └──────────┘  └─────────┘  └────────────────┘
```

### Skills

- 位置: `~/.deepseek/skills/`（用户级）、`.agents/skills/`（项目级）
- 格式: `SKILL.md` + companion files
- 安装: `skill-installer` skill 从 GitHub 安装
- 命令: `/skills` 查看可用列表

### MCP Servers

- 配置: `~/.deepseek/mcp.json`
- 协议: Model Context Protocol (stdio / HTTP+SSE)
- 初始化: `deepseek-tui mcp init`

### Plugins

- 位置: `~/.deepseek/plugins/`
- 初始化: `deepseek-tui setup --plugins`
- 引用: 从 skill、hook 或 MCP wrapper 中引用

## 引擎执行流

来源: [ARCHITECTURE.md](https://raw.githubusercontent.com/Hmbown/DeepSeek-TUI/main/docs/ARCHITECTURE.md)

```
Turn 开始
  → 3. Pre-execution hooks run
  → 4. 工具执行
  → 6. Post-execution hooks run  
  → 8. LSP post-edit hook (v0.8.6): edit_file/apply_patch/write_file 后收集诊断
Turn 结束
```

## 来源

| 资源 | URL |
|------|-----|
| GitHub 仓库 | https://github.com/Hmbown/DeepSeek-TUI |
| README | https://raw.githubusercontent.com/Hmbown/DeepSeek-TUI/main/README.md |
| 架构文档 | https://raw.githubusercontent.com/Hmbown/DeepSeek-TUI/main/docs/ARCHITECTURE.md |
| 配置文档 | https://raw.githubusercontent.com/Hmbown/DeepSeek-TUI/main/docs/CONFIGURATION.md |
| hooks 源码 | https://raw.githubusercontent.com/Hmbown/DeepSeek-TUI/main/crates/hooks/src/lib.rs |
