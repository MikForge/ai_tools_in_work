# executing-plans — 执行实施计划

> 来源: [obra/superpowers/skills/executing-plans](https://github.com/obra/superpowers/tree/main/skills/executing-plans)

## 概述

在有一个已编写的实施计划需要通过独立会话执行，并设置审查检查点时使用。

## 关键设计决策

- **先审查再执行**：加载计划后必须批判性审阅，有疑问先提出
- **逐任务提交**：每个任务包括 loading → in_progress → verification → completed
- **子代理优先**：如果平台支持子代理，应使用 subagent-driven-development 代替

## 工作流程

1. 加载并审阅计划 → 2. 有疑问先沟通 → 3. 逐任务执行 → 4. 报告完成

## 来源

- https://raw.githubusercontent.com/obra/superpowers/main/skills/executing-plans/SKILL.md
