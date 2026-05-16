# Claude Code 子代理完整参考

## 概述

子代理（Subagents）是专门的 AI 助手，处理特定类型任务。每个子代理在独立的上下文中运行，配有自己的系统提示、工具访问权限和独立的权限模式。Claude 根据子代理的描述自动判断何时委派任务。

官方文档：https://code.claude.com/docs/en/sub-agents

## 内置子代理

| 代理 | 模型 | 工具 | 用途 |
|------|------|------|------|
| **Explore** | Haiku | 只读 | 快速代码搜索和探索 |
| **Plan** | 继承主会话 | 只读 | Plan mode 中的研究 |
| **General-purpose** | 继承主会话 | 全部工具 | 复杂的多步操作 |
| statusline-setup | Sonnet | - | 配置状态行 |
| claude-code-guide | Haiku | - | 查询 Claude Code 功能 |

## 子代理作用域

| 位置 | 作用域 | 优先级 |
|------|--------|:---:|
| Managed settings | 组织级 | 1（最高） |
| `--agents` CLI 标志 | 当前会话 | 2 |
| `.claude/agents/` | 当前项目 | 3 |
| `~/.claude/agents/` | 所有项目 | 4 |
| Plugin `agents/` 目录 | 插件启用时 | 5（最低） |

项目子代理（`.claude/agents/`）可提交到版本控制，团队共享。目录递归扫描，可按子目录组织。

## 创建子代理 — Markdown 文件格式

子代理定义为带 YAML frontmatter 的 Markdown 文件：

```markdown
---
name: code-reviewer
description: Expert code reviewer. Use proactively after making changes.
model: sonnet
tools: Read, Grep, Glob, Bash
---

You are a senior code reviewer. Focus on code quality, security, and best practices.
When reviewing:

1. Check for correctness and logical errors
2. Look for security vulnerabilities
3. Verify error handling is complete
4. Ensure code follows project conventions

Report each issue with the file path, line number, explanation, and suggested fix.
```

### Frontmatter 字段

| 字段 | 必需 | 说明 |
|------|:---:|------|
| `name` | ✅ | 全局唯一标识符 |
| `description` | ✅ | Claude 用此判断何时委派（需具体） |
| `model` | - | 模型别名: `"sonnet"` / `"haiku"` / `"opus"`，默认继承 |
| `tools` | - | 工具列表（逗号分隔），省略则继承全部工具 |
| `permissionMode` | - | 权限模式，默认继承 |
| `skills` | - | 启用的技能列表 |
| `color` | - | 子代理 UI 背景色 |
| `hooks` | - | 子代理专属 hooks（见 hooks 参考） |

### 工具限制

```yaml
# 只读代理
tools: Read, Grep, Glob

# 无 Write/Edit 访问
tools: Read, Grep, Glob, Bash

# 继承所有工具（省略 tools）
```

## `/agents` 命令

- **Running 标签**：显示活跃子代理，可打开或停止
- **Library 标签**：查看所有可用子代理，创建/编辑/删除自定义子代理
- **Generate with Claude**：描述子代理，Claude 自动生成标识符、提示、工具选择

## CLI 定义（`--agents`）

```bash
claude --agents '{
  "code-reviewer": {
    "description": "Expert code reviewer. Use proactively after code changes.",
    "prompt": "You are a senior code reviewer...",
    "tools": ["Read", "Grep", "Glob", "Bash"],
    "model": "sonnet"
  }
}'
```

仅当前会话有效，不储存到磁盘。

## 子代理记忆

子代理可启用持久记忆（User scope），储存路径 `~/.claude/agent-memory/`。子代理跨会话积累洞察。

## 使用模式

### 上下文保持

将探索工作保留在主对话之外的子代理上下文中，只返回摘要。

### 约束执行

```yaml
tools: Read, Grep, Glob, Bash
```

### 跨项目复用

将通用子代理放在 `~/.claude/agents/` 中。

### 成本控制

```yaml
model: haiku
```

### 背景代理

`claude agents --bg "Task description"` 启动独立会话，可在 Agent 视图中监控。

## 与 Auto Memory 的关系

子代理拥有独立的自动记忆空间，可写入 `~/.claude/projects/<project>/memory/` 或子代理专属目录。

## 相关

- Settings 完整参考: https://code.claude.com/docs/en/settings
- Hooks 完整参考: https://code.claude.com/docs/en/hooks
- Agent view / background agents: https://code.claude.com/docs/en/agent-view
- Agent teams: https://code.claude.com/docs/en/agent-teams
