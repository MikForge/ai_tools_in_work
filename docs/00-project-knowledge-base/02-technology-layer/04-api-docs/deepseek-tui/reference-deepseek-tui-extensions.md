# DeepSeek TUI 扩展机制

> 来源: [Hmbown/DeepSeek-TUI](https://github.com/Hmbown/DeepSeek-TUI)  
> 更新日期: 2026-05-17  
> 版本: v0.8.38

## 概述

DeepSeek TUI 扩展体系包含四条路径：

```
┌──────────┐  ┌──────────┐  ┌─────────┐  ┌────────────────┐
│  Tools   │  │  Skills  │  │  Hooks  │  │  MCP Servers   │
└──────────┘  └──────────┘  └─────────┘  └────────────────┘
```

## Skills

- 位置: `~/.deepseek/skills/`（用户级）、`.agents/skills/`（项目级）
- 格式: `SKILL.md` + companion files
- 安装: `skill-installer` skill 从 GitHub 安装
- 命令: `/skills` 查看可用列表
- 内置 starter set: `skill-creator`、`mcp-builder`、`plugin-creator`、`v4-best-practices`、`documents`、`presentations`、`spreadsheets`、`pdf`、`feishu`、`skill-installer`、`delegate`

## MCP Servers

- 配置: `~/.deepseek/mcp.json`
- 协议: Model Context Protocol (stdio / HTTP+SSE)
- 初始化: `deepseek-tui mcp init`

## Plugins

- 位置: `~/.deepseek/plugins/`
- 初始化: `deepseek-tui setup --plugins`
- 引用: 从 skill、hook 或 MCP wrapper 中引用

## 来源

| 资源 | URL |
|------|-----|
| GitHub 仓库 | https://github.com/Hmbown/DeepSeek-TUI |
| 架构文档 | https://raw.githubusercontent.com/Hmbown/DeepSeek-TUI/main/docs/ARCHITECTURE.md |
