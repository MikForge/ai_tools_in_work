2026-05-13

# 使用 AgentsMesh 同步多目录

## 动机 / 背景

Claude Code 和 Codex 的配置分布在 `.claude/`、`.codex/`、`AGENTS.md`、`CLAUDE.md`、skills、hooks、agents、rules 等多个位置。手动维护容易重复、遗漏或产生平台差异。AgentsMesh 已经提供 canonical 中间层、导入、生成、检查和 diff 能力，适合作为同步基础。

## 大致思路

- 直接评估并使用 AgentsMesh，而不是自建完整同步器。
- 用 AgentsMesh 的 canonical 目录维护共享模块，再生成 Claude Code 和 Codex CLI 的目标文件。
- 优先覆盖 instructions、skills、hooks、agents、rules 等高价值目录。
- 同步前先使用 `import`、`diff`、`generate --dry-run`，确认不会破坏现有配置。

## 关键约束 / 注意点

- AgentsMesh 默认使用 `.agentsmesh/`，需要决定是否接受该目录名，还是额外映射到 `.codex-claude-sync/`。
- 当前仓库已有 `.agents/skills/` 作为 skill 源目录，需确认和 AgentsMesh canonical skills 的关系。
- 对 `.claude/settings.json`、`.codex/config.toml`、`AGENTS.md`、`CLAUDE.md` 的生成必须先 dry-run。
- 不同平台模块并非完全一一对应，hooks、agents、rules 需要保守同步。

## 相关资源

- AgentsMesh 文档：<https://samplexbro.github.io/agentsmesh/>
- AgentsMesh GitHub：<https://github.com/sampleXbro/agentsmesh>
- 当前相关记录：`docs/todo/claude-codex-目录体系学习.md`
