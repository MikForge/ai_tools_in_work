# finishing-a-development-branch — 完成开发分支

> 来源: [obra/superpowers/skills/finishing-a-development-branch](https://github.com/obra/superpowers/tree/main/skills/finishing-a-development-branch)

## 概述

实施完成、测试通过后，决定如何集成工作的结构化流程——提供合并、PR 或清理的选项。

## 关键设计决策

- **测试先行**：在呈现任何选项之前必须先验证测试通过
- **环境感知**：自动检测工作树、git 状态来决定可用工作流
- **规范化终态**：每次提交都是可测试、可审查、可回滚的清洁状态

## 工作流程

1. 验证测试 → 2. 检测环境 → 3. 呈现选项（merge/PR/cleanup）→ 4. 执行选择 → 5. 清理

## 来源

- https://raw.githubusercontent.com/obra/superpowers/main/skills/finishing-a-development-branch/SKILL.md
