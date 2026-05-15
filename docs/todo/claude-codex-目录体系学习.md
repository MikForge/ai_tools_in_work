2026-05-11

# Claude Codex 目录体系学习

## 动机 / 背景

Claude Code / Codex 的配置分布在 `.claude/` 和 `.codex/` 下的多个子目录中——skills、hooks、agents、rules 等，每个目录承担不同职责。目前对这套目录体系的理解是零散的，需要一个结构化学习计划，理清各目录的作用边界和协作关系。

## 大致思路

逐个目录深挖，了解可配置项和最佳实践：

| 目录 | 学习目标 |
|---|---|
| skills | skill 的加载链路、SKILL.md 规范、安装与版本管理 |
| hooks | 事件触发机制、hook 类型（pre/post）、配置方式、排错 |
| agents | 自定义 agent 定义、subagent 类型、权限模型、隔离模式 |
| rules | 规则文件格式、作用域（project/user）、与 CLAUDE.md 的关系 |
| settings | settings.json vs settings.local.json、权限配置、环境变量 |
| memory | 记忆系统机制、类型分类、MEMORY.md 索引格式 |

## 关键约束 / 注意点

- 以官方文档为准，社区资料可能有版本滞后
- 关注 `.claude/` 和 `.codex/` 的差异点，避免混用
- 优先理清当前仓库已用到的目录（skills、rules），再扩展其他

## 相关资源

- [.claude/](.claude/)
- [.codex/](.codex/)
- [.agents/skills/README.md](.agents/skills/README.md)
