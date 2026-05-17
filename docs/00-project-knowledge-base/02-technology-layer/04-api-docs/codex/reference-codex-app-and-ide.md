# Codex 运行环境参考

## 概述

Codex 运行环境参考：桌面 App、Cloud、Memories、IDE 集成、App Server API 的官方文档入口。涵盖本地开发、云端执行、记忆层和外部工具集成。

## 条目

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


### Codex App Server 与迁移

| 名称 | 描述 | 配置/路径示例 | 说明文档 |
| --- | --- | --- | --- |
| Codex app server API | Codex app server 的 thread、turn、command、plugin、skill、MCP、config、filesystem 等 API。 | `thread/start`、`skills/list`、`mcpServerStatus/list` | https://developers.openai.com/codex/app-server#api-overview |
| App server item events | 运行时事件项，包括 tool call、MCP call、webSearch、imageView、fileChange 等。 | `mcpToolCall`、`webSearch`、`imageView` | https://developers.openai.com/codex/app-server#items |
| 外部 agent 配置迁移 | Codex 可迁移 instruction files、config、skills、MCP、hooks、slash commands、subagents 等。 | migration detected setup table | https://developers.openai.com/codex/migrate#what-codex-can-import |


