# Claude Code Settings.json 完整配置参考

## 概述

`.claude/settings.json` 是 Claude Code 项目的核心配置文件，支持 50+ 配置键，覆盖权限、沙箱、hooks、模型、UI、Agent 等全部功能。配置可提交到 git 团队共享。`.claude/settings.local.json` 提供个人覆盖（gitignored）。

官方文档：https://code.claude.com/docs/en/settings

## 配置文件位置与优先级

| 作用域 | 路径 | 可共享 |
|--------|------|:---:|
| Managed Policy | `/Library/Application Support/ClaudeCode/managed-settings.json` (macOS) | 管理员控制 |
| User | `~/.claude/settings.json` | 否 |
| Project | `.claude/settings.json` | ✅ |
| Local | `.claude/settings.local.json` | 否（gitignored） |

优先级（从高到低）：Managed → CLI 参数 → Local → Project → User。权限规则跨作用域**合并**，其他设置**覆盖**。

## 一、核心设置

| 键 | 默认值 | 说明 |
|---|--------|------|
| `model` | - | 覆盖默认模型，如 `"claude-sonnet-4-6"` |
| `modelOverrides` | `{}` | 映射 Anthropic 模型 ID 到 provider 特定 ID |
| `availableModels` | 全部 | 限制可选模型列表 `["sonnet", "haiku"]` |
| `effortLevel` | - | 持久化 effort: `"low"` / `"medium"` / `"high"` / `"xhigh"` |
| `env` | `{}` | 注入每个会话的环境变量 |
| `defaultShell` | `"bash"` | 输入框 `!` 命令的默认 shell |
| `language` | - | Claude 偏好响应语言，如 `"japanese"` |
| `outputStyle` | - | 输出风格，调整 system prompt |
| `autoUpdatesChannel` | `"latest"` | 更新频道: `"stable"` 或 `"latest"` |
| `minimumVersion` | - | 防止自动更新到此版本以下 |
| `cleanupPeriodDays` | `30` | 会话文件保留天数（最小 1） |

## 二、权限设置

```json
{
  "permissions": {
    "allow": ["Bash(npm run lint)", "Bash(npm test *)", "Read(~/.zshrc)"],
    "ask": ["Bash(git push *)"],
    "deny": ["Bash(curl *)", "Read(./.env)", "Read(./.env.*)", "Read(./secrets/**)"],
    "additionalDirectories": ["../docs/"],
    "defaultMode": "acceptEdits",
    "disableBypassPermissionsMode": "disable",
    "skipDangerousModePermissionPrompt": true
  }
}
```

权限规则语法：`Tool` 或 `Tool(specifier)`。评估顺序：**deny → ask → allow**，首次匹配胜出。

### Permission Mode 可选值

| Mode | 说明 |
|------|------|
| `default` | 每个工具调用都请求批准 |
| `acceptEdits` | 自动批准编辑类操作 |
| `plan` | 分析后才容许编辑 |
| `auto` | 自动模式 |
| `dontAsk` | 不询问 |
| `bypassPermissions` | 绕过所有权限 |

## 三、沙箱设置

```json
{
  "sandbox": {
    "enabled": false,
    "autoAllowBashIfSandboxed": true,
    "excludedCommands": ["docker *"],
    "failIfUnavailable": true,
    "allowUnsandboxedCommands": false,
    "filesystem": {
      "allowWrite": ["/tmp/build", "~/.kube"],
      "denyWrite": ["/etc", "/usr/local/bin"],
      "denyRead": ["~/.aws/credentials"],
      "allowRead": ["."]
    },
    "network": {
      "allowedDomains": ["github.com", "*.npmjs.org"],
      "deniedDomains": ["sensitive.cloud.example.com"],
      "allowUnixSockets": ["/var/run/docker.sock"],
      "allowLocalBinding": false,
      "allowAllUnixSockets": false
    }
  }
}
```

路径前缀：`/` 绝对路径，`~/` 相对家目录，`./` 或无前缀相对项目根。

## 四、Hooks 设置

| 键 | 说明 |
|----|------|
| `hooks` | 完整 hooks 配置（见 hooks 参考文档） |
| `disableAllHooks` | 禁用所有 hooks 和自定义状态行 |
| `allowedHttpHookUrls` | HTTP hook 目标 URL 白名单，支持 `*` 通配符 |
| `httpHookAllowedEnvVars` | HTTP hook 可在 headers 中插值的环境变量名白名单 |
| `statusLine` | 自定义状态行: `{"type": "command", "command": "~/.claude/statusline.sh"}` |

## 五、UI 与显示设置

| 键 | 默认 | 说明 |
|----|------|------|
| `editorMode` | `"normal"` | 键绑定: `"normal"` / `"vim"` |
| `tui` | `"default"` | 终端渲染: `"fullscreen"` / `"default"` |
| `viewMode` | `"default"` | 转录视图: `"default"` / `"verbose"` / `"focus"` |
| `theme` | - | 主题 |
| `showThinkingSummaries` | `false` | 显示扩展思考摘要 |
| `showTurnDuration` | `true` | 显示回复合时（"Cooked for 1m 6s"） |
| `autoScrollEnabled` | `true` | 全屏模式自动滚动 |
| `spinnerTipsEnabled` | `true` | spinner 中显示提示 |
| `spinnerTipsOverride` | - | 自定义 spinner 提示 `{"tips": [...], "excludeDefault": true}` |
| `spinnerVerbs` | - | 自定义动作动词 `{"mode": "replace", "verbs": [...]}` |
| `syntaxHighlightingDisabled` | `false` | 禁用语法高亮 |
| `terminalProgressBarEnabled` | `true` | 终端进度条 |
| `prefersReducedMotion` | `false` | 减少动画 |
| `preferredNotifChannel` | `"auto"` | 通知方式: `"terminal_bell"` / `"iterm2"` / `"kitty"` / `"ghostty"` |
| `awaySummaryEnabled` | `true` | 离开后回话摘要 |

## 六、Agent 与团队设置

| 键 | 说明 |
|----|------|
| `agent` | 主线程作为命名子代理运行（应用其 system prompt/工具/模型） |
| `disableAgentView` | 禁用后台 agent 和 agent 视图 |
| `teammateMode` | teammate 显示: `"auto"` / `"in-process"` / `"tmux"` |
| `plansDirectory` | plan 文件储存路径，默认 `~/.claude/plans` |

## 七、自动模式设置

| 键 | 说明 |
|----|------|
| `autoMode` | 自定义自动模式分类器规则 `{"environment": [], "allow": [], "soft_deny": [], "hard_deny": []}` |
| `disableAutoMode` | 设为 `"disable"` 禁用自动模式 |
| `useAutoModeDuringPlan` | plan 模式下使用自动模式语义，默认 `true` |

## 八、内存与 CLAUDE.md 设置

| 键 | 说明 |
|----|------|
| `autoMemoryEnabled` | 启用自动记忆，默认 `true` |
| `autoMemoryDirectory` | 自动记忆储存目录（仅 user/policy 设置） |
| `claudeMdExcludes` | 排除特定 CLAUDE.md 文件的 glob 模式 |

## 九、Git 与署名

| 键 | 说明 |
|----|------|
| `attribution.commit` | git commit 署名 trailer |
| `attribution.pr` | PR 描述署名 |
| `includeGitInstructions` | 系统 prompt 中注入 commit/PR 工作流指令，默认 `true` |
| `prUrlTemplate` | PR 徽章 URL 模板 |

## 十、MCP 服务器设置

| 键 | 说明 |
|----|------|
| `enableAllProjectMcpServers` | 自动批准所有项目 `.mcp.json` 中的服务器 |
| `enabledMcpjsonServers` | 批准的服务器列表 |
| `disabledMcpjsonServers` | 拒接的服务器列表 |

## 十一、其他

| 键 | 说明 |
|----|------|
| `companyAnnouncements` | 启动时显示的公告数组（随机轮换） |
| `feedbackSurveyRate` | 质量调查出现概率 0-1 |
| `skipWebFetchPreflight` | 跳过 WebFetch 域名安全检查 |
| `fileSuggestion` | 自定义 `@` 文件路径自动补全 |
| `respectGitignore` | `@` 文件选择器遵循 `.gitignore`，默认 `true` |
| `disableSkillShellExecution` | 禁用 skill 中内联 shell 执行 |
| `voice` | 语音听写: `{"enabled": true, "mode": "hold"}` |
| `apiKeyHelper` | 自定义脚本生成临时 API key |
| `sshConfigs` | SSH 连接配置 |
| `worktree.baseRef` | `"fresh"` (从 origin) 或 `"head"` (从本地 HEAD) |
| `worktree.symlinkDirectories` | 软链接到每个 worktree 的目录 |

## 相关

- Hooks 完整参考: https://code.claude.com/docs/en/hooks
- Memory 完整参考: https://code.claude.com/docs/en/memory
- Sub-agents 完整参考: https://code.claude.com/docs/en/sub-agents
