# Claude Code Hooks 完整参考

## 概述

Hooks 是在 Claude Code 生命周期事件触发时执行的 shell 命令、HTTP 调用、MCP 工具或 AI 评估。可用于安全管控、自动 lint、通知、上下文注入等场景。项目 hooks 脚本存放在 `.claude/hooks/` 目录。

官方文档：https://code.claude.com/docs/en/hooks

## 一、全部 26 个 Hook 事件

### 会话级

| 事件 | 触发时机 | 可阻断 | Matcher |
|------|---------|:---:|:---:|
| `SessionStart` | 会话开始或恢复 | 否 | `startup` / `resume` / `clear` / `compact` |
| `Setup` | `--init-only` / `--init` / `--maintenance` 模式 | 否 | `init` / `maintenance` |
| `SessionEnd` | 会话终止 | 否 | 结束原因 |

### 轮次级

| 事件 | 触发时机 | 可阻断 | Matcher |
|------|---------|:---:|:---:|
| `UserPromptSubmit` | 用户提交 prompt，Claude 处理前 | ✅ | 否 |
| `UserPromptExpansion` | 斜杠命令展开为 prompt | ✅ | 命令名 |
| `Stop` | Claude 响应结束 | ✅ | 否 |
| `StopFailure` | API 错误中断 | 否 | 错误类型 |

### 工具级

| 事件 | 触发时机 | 可阻断 | Matcher |
|------|---------|:---:|:---:|
| `PreToolUse` | 工具调用执行**前** | ✅ | `Bash`, `Edit\|Write`, `mcp__.*` |
| `PermissionRequest` | 权限弹窗出现 | ✅ | 工具名 |
| `PermissionDenied` | 自动模式拒绝工具 | 否 | 工具名 |
| `PostToolUse` | 工具调用成功**后** | 否 | 工具名 |
| `PostToolUseFailure` | 工具调用失败 | 否 | 工具名 |
| `PostToolBatch` | 并行工具批次完成 | ✅ | 否 |

### 交互式

| 事件 | 何时触发 | 可阻断 | Matcher |
|------|---------|:---:|:---:|
| `Notification` | 发送通知 | 否 | 通知类型 |
| `SubagentStart` | 子代理启动 | 否 | agent 类型 |
| `SubagentStop` | 子代理结束 | ✅ | agent 类型 |
| `TaskCreated` | 任务创建 | ✅ | 否 |
| `TaskCompleted` | 任务完成 | ✅ | 否 |
| `TeammateIdle` | 队友即将 idle | ✅ | 否 |
| `InstructionsLoaded` | CLAUDE.md / rules 加载 | 否 | 加载原因 |
| `ConfigChange` | 配置修改 | ✅ | 配置来源 |
| `CwdChanged` | 工作目录变更 | 否 | 始终触发 |
| `FileChanged` | 监听文件变化 | 否 | 文件名 |
| `PreCompact` | 上下文压缩前 | ✅ | 触发原因 |
| `PostCompact` | 上下文压缩后 | 否 | 触发原因 |
| `Elicitation` | MCP 请求用户输入 | ✅ | MCP 服务器名 |
| `ElicitationResult` | 用户响应 MCP | ✅ | MCP 服务器名 |
| `WorktreeCreate` | Worktree 创建 | ✅ | 否 |
| `WorktreeRemove` | Worktree 删除 | 否 | 否 |

## 二、配置架构（3 级嵌套）

```json
{
  "hooks": {
    "PreToolUse": [                          // Level 1: 事件
      {
        "matcher": "Bash|Edit",             // Level 2: 匹配器组
        "hooks": [
          {
            "type": "command",              // Level 3: Hook 处理器
            "command": "path/to/script.sh"
          }
        ]
      }
    ]
  }
}
```

### Hooks 可定义在

| 位置 | 作用域 | 可共享 |
|------|--------|:---:|
| `~/.claude/settings.json` | 用户全局 | 否 |
| `.claude/settings.json` | 项目 | ✅ |
| `.claude/settings.local.json` | 项目本地 | 否 |
| Managed policy | 组织 | 管理员 |
| Plugin `hooks/hooks.json` | 插件 | ✅ |
| Skill/agent frontmatter | 组件活跃时 | ✅ |

## 三、Hook 处理器类型

### 通用字段

| 字段 | 必需 | 说明 |
|------|:---:|------|
| `type` | ✅ | `"command"` / `"http"` / `"mcp_tool"` / `"prompt"` / `"agent"` |
| `if` | - | 权限规则语法过滤（仅工具事件生效） |
| `timeout` | - | 超时秒数。默认: 600 (command/http/mcp), 30 (prompt), 60 (agent) |
| `statusMessage` | - | Spinner 消息 |
| `once` | - | 每会话执行一次（仅 skill frontmatter 有效） |

### 1. Command Hook

```json
{
  "type": "command",
  "command": "node",
  "args": ["${CLAUDE_PLUGIN_ROOT}/scripts/lint.js", "--fix"],
  "async": false,
  "asyncRewake": false,
  "shell": "bash"
}
```

- **Exec 形式**（有 `args`）：无 shell，每个 arg 逐字传入
- **Shell 形式**（无 `args`）：通过 `sh -c` 执行，支持管道、`&&`、变量展开
- **`async`**: 后台运行，不阻塞
- **`asyncRewake`**: 后台运行，退出码 2 时唤醒 Claude

### 2. HTTP Hook

```json
{
  "type": "http",
  "url": "http://localhost:8080/hooks/pre-tool-use",
  "headers": { "Authorization": "Bearer $MY_TOKEN" },
  "allowedEnvVars": ["MY_TOKEN"]
}
```

POST JSON 到指定 URL。2xx 成功，非 2xx 非阻塞错误。HTTP hook 无法通过状态码阻断——需返回 2xx + JSON decision。

### 3. MCP Tool Hook

```json
{
  "type": "mcp_tool",
  "server": "my_server",
  "tool": "security_scan",
  "input": { "file_path": "${tool_input.file_path}" }
}
```

调用已连接的 MCP 服务器工具。

### 4. Prompt Hook

```json
{
  "type": "prompt",
  "prompt": "Given this tool call: $ARGUMENTS\nShould this be allowed? Respond with JSON: {\"decision\": \"allow\"} or {\"decision\": \"deny\"}",
  "timeout": 30
}
```

发送给 Claude 做单轮评估。

### 5. Agent Hook

```json
{
  "type": "agent",
  "prompt": "Review the file being edited: $ARGUMENTS",
  "timeout": 60
}
```

生成子 agent 执行。

## 四、Matcher 规则

| 语法 | 行为 | 示例 |
|------|------|------|
| `"*"` / `""` / 省略 | 匹配全部 | 每发生都触发 |
| 仅 `[a-zA-Z0-9_\|]` | 精确匹配或管道分隔 | `"Bash"` / `"Edit\|Write"` |
| 含其他字符 | JS 正则表达式 | `"mcp__memory__.*"` / `"^Notebook"` |

MCP 工具命名: `mcp__<server>__<tool>`。匹配需用正则: `mcp__memory__.*`（不能用 `mcp__memory`）。

## 五、stdin JSON 输入

### 通用字段（所有事件包含）

```json
{
  "session_id": "abc123",
  "transcript_path": "/path/to/transcript.jsonl",
  "cwd": "/current/working/directory",
  "permission_mode": "default",
  "hook_event_name": "PreToolUse"
}
```

### 常见工具输入

**Bash PreToolUse**:
```json
{
  "tool_name": "Bash",
  "tool_input": {
    "command": "npm test",
    "description": "Run test suite",
    "timeout": 120000
  }
}
```

**Edit PreToolUse**:
```json
{
  "tool_name": "Edit",
  "tool_input": {
    "file_path": "/path/to/file.txt",
    "old_string": "original",
    "new_string": "replacement"
  }
}
```

**Write PreToolUse**: `tool_input.file_path`, `tool_input.content`

**UserPromptSubmit**: 包含 `permission_mode` 和 `prompt`（用户文本）

## 六、退出码与输出

| 退出码 | 含义 | 效果 |
|:---:|------|------|
| **0** | 成功 | stdout 解析为 JSON |
| **2** | 阻断错误 | 阻断对应动作（PreToolUse 阻断工具，UserPromptSubmit 阻断 prompt） |
| 其他 | 非阻断错误 | stderr 首行作为通知显示 |

## 七、JSON 输出控制

### 通用字段

| 字段 | 默认 | 说明 |
|------|------|------|
| `continue` | `true` | `false` 停止 Claude |
| `stopReason` | - | 展示给用户的原因 |
| `systemMessage` | - | 用户警告 |

### PreToolUse 决策

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Database writes not allowed"
  }
}
```

`permissionDecision`: `"allow"` / `"deny"` / `"ask"` / `"defer"`

### SessionStart 上下文注入

```json
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "Current branch: feat/auth\nUncommitted: src/auth.ts"
  }
}
```

### UserPromptSubmit 阻断

```json
{
  "decision": "block",
  "reason": "Do not ask Claude about secrets"
}
```

## 八、环境变量

| 变量 | 可用在 | 说明 |
|------|--------|------|
| `CLAUDE_PROJECT_DIR` | 所有 hooks | 项目根目录 |
| `CLAUDE_ENV_FILE` | SessionStart, Setup, CwdChanged, FileChanged | 持久化环境变量的文件路径 |
| `CLAUDE_EFFORT` | 工具上下文事件 | effort 等级 |
| `CLAUDE_CODE_REMOTE` | 所有 hooks | 远程 web 环境中为 `"true"` |

### `$CLAUDE_ENV_FILE` 用法

```bash
#!/bin/bash
echo 'export NODE_ENV=production' >> "$CLAUDE_ENV_FILE"
echo 'export PATH="$PATH:./node_modules/.bin"' >> "$CLAUDE_ENV_FILE"
```

## 九、实战示例

### 阻断破坏性 rm 命令

**settings.json**:
```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Bash",
      "hooks": [{
        "type": "command",
        "if": "Bash(rm *)",
        "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/block-rm.sh"
      }]
    }]
  }
}
```

**block-rm.sh**:
```bash
#!/bin/bash
COMMAND=$(jq -r '.tool_input.command')
if echo "$COMMAND" | grep -q 'rm -rf'; then
  jq -n '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:"rm -rf blocked"}}'
else
  exit 0
fi
```

### Session Start 注入 git 上下文

```bash
#!/bin/bash
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
jq -n --arg b "$BRANCH" '{hookSpecificOutput:{hookEventName:"SessionStart",additionalContext:("Branch: "+$b)}}'
```

### 编辑后自动 lint

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [{
        "type": "command",
        "command": "npx eslint ${tool_input.file_path}",
        "timeout": 30
      }]
    }]
  }
}
```

### 桌面通知

```bash
#!/bin/bash
seq=$(printf '\033]777;notify;%s;%s\007' "Claude Code" "$(jq -r '.message // "Done"' <<<"$(cat)")")
jq -nc --arg seq "$seq" '{terminalSequence: $seq}'
```

## 十、输出限制

- 每个输出字符串最多 10,000 字符
- 超出部分保存到文件，替换为预览 + 文件路径

## 十一、禁用 Hooks

```json
{ "disableAllHooks": true }
```

Managed policy hooks 不可由用户/项目禁用。

## 相关

- Settings 完整参考: https://code.claude.com/docs/en/settings
- Sub-agents 完整参考: https://code.claude.com/docs/en/sub-agents
- Memory 完整参考: https://code.claude.com/docs/en/memory
