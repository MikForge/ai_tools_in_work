# using-git-worktrees — 使用 Git Worktrees

> 来源: [obra/superpowers/skills/using-git-worktrees](https://github.com/obra/superpowers/tree/main/skills/using-git-worktrees)

## 概述

在开始需要与当前工作区隔离的功能工作或执行实施计划前使用。优先使用平台的本地 worktree 工具，回退到 git worktree。

## 关键设计决策

- **检测现有隔离**：在创建任何新工作树前先检查是否已在隔离工作区中
- **子模块保护**：区分 git worktree 和 git submodule 场景
- **按优先级选择**：平台原生工具 → git worktree 回退 → 绝不与 harness 对抗

## 工作流程

0. 检测现有隔离（检查 GIT_DIR vs GIT_COMMON）+ 子模块保护
→ 1. 使用平台原生 worktree → 2. 无原生时使用 git worktree

## 来源

- https://raw.githubusercontent.com/obra/superpowers/main/skills/using-git-worktrees/SKILL.md
