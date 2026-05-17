# DeepSeek TUI Hooks 系统

> 来源: [Hmbown/DeepSeek-TUI](https://github.com/Hmbown/DeepSeek-TUI)  
> 更新日期: 2026-05-17  
> 版本: v0.8.38

## 概述

DeepSeek TUI 的 hooks 系统在工具执行前后、响应生命周期、审批生命周期等节点触发，
输出到 stdout、JSONL 文件或 Webhook。

## 事件类型（7 种）

| 事件 | 字段 | 说明 |
|------|------|------|
| `ResponseStart` | `response_id` | 响应开始 |
| `ResponseDelta` | `response_id`, `delta` | 响应增量（流式） |
| `ResponseEnd` | `response_id` | 响应结束 |
| `ToolLifecycle` | `response_id`, `tool_name`, `phase`, `payload` | 工具生命周期 |
| `JobLifecycle` | `job_id`, `phase`, `progress`, `detail` | 作业生命周期 |
| `ApprovalLifecycle` | `approval_id`, `phase`, `reason` | 审批生命周期 |
| `GenericEventFrame` | `frame` | 通用事件帧 |

## 输出 Sink

| Sink | 说明 |
|------|------|
| `StdoutHookSink` | JSON 事件打印到 stdout |
| `JsonlHookSink` | JSONL 追加写入文件（含时间戳） |
| `WebhookHookSink` | HTTP POST JSON 到 URL，3 次重试 (200ms 指数退避) |

多 sink 通过 `HookDispatcher` 分发，单个 sink 故障不影响其他。

## 配置格式

```toml
# ~/.deepseek/config.toml
[[hooks]]
event = "tool_call_before"
command = "echo 'Running tool: $TOOL_NAME'"
```

> **注意**：ARCHITECTURE.md 快速入门使用 `[[hooks]]`，CONFIGURATION.md 使用 `[[hooks.hooks]]`。
> 后者更完整——`[hooks]` 段还有 `enabled` 等全局控制字段。两种写法均有效。

## TUI 内交互

- `/hooks` 或 `/hooks list` — 查看所有已配置 hooks
- 顶部显示 `[hooks].enabled` 全局开关状态

## 与 Claude Code Hooks 对比

| 维度 | Claude Code | DeepSeek TUI |
|------|------------|-------------|
| 事件数 | 26 个 | 7 个 |
| 配置位置 | `.claude/hooks/<name>.sh` + `settings.json` | `~/.deepseek/config.toml` 的 `[[hooks]]` |
| 输出方式 | command/http/mcp_tool/prompt/agent | stdout/jsonl/webhook |
| 条件过滤 | matcher | `hooks.rs` 支持 conditions |
| 子代理专属 | 支持 | 未单独暴露 |

## 来源

| 资源 | URL |
|------|-----|
| GitHub 仓库 | https://github.com/Hmbown/DeepSeek-TUI |
| 架构文档 | https://raw.githubusercontent.com/Hmbown/DeepSeek-TUI/main/docs/ARCHITECTURE.md |
| hooks 源码 | https://raw.githubusercontent.com/Hmbown/DeepSeek-TUI/main/crates/hooks/src/lib.rs |
