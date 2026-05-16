# Claude Code 项目 .claude/ 配置目录参考

## 概述

本文档列出 Claude Code 项目根目录下 `.claude/` 各配置目录和文件的用途及对应官方文档地址。

## 配置目录/文件对照

| 路径 | 用途 | 官方文档 |
|------|------|---------|
| `.claude/settings.json` | 项目设置（团队共享，提交到 git） | https://code.claude.com/docs/en/settings |
| `.claude/settings.local.json` | 本地覆盖（gitignored，优先级高于 settings.json） | 同上 |
| `.claude/CLAUDE.md` | 项目内存指令（与根目录 `CLAUDE.md` 等效） | https://code.claude.com/docs/en/memory |
| `.claude/rules/` | 路径范围规则，`*.md` 文件，支持 YAML frontmatter `paths` 字段按 glob 匹配文件范围 | https://code.claude.com/docs/en/memory#organize-rules-with-claude/rules/ |
| `.claude/agents/` | 项目级自定义子代理定义 | https://code.claude.com/docs/en/sub-agents |
| `.claude/hooks/` | Hook 脚本存放目录（项目手动管理） | https://code.claude.com/docs/en/hooks |

## 优先级

设置文件优先级（从高到低）：

1. CLI 参数
2. `.claude/settings.local.json`
3. `.claude/settings.json`
4. `~/.claude/settings.json`

权限规则跨作用域**合并**，其他设置**覆盖**。

## 相关

- Settings 完整参考: https://code.claude.com/docs/en/settings
- Memory 完整参考: https://code.claude.com/docs/en/memory
- Hooks 完整参考: https://code.claude.com/docs/en/hooks
