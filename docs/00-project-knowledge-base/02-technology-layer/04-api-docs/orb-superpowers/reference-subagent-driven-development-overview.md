# subagent-driven-development — 子代理驱动开发

> 来源: [obra/superpowers/skills/subagent-driven-development](https://github.com/obra/superpowers/tree/main/skills/subagent-driven-development)

## 概述

在有实施计划且任务在当前会话中独立执行时使用。每个任务调度一个全新子代理，并在每次任务后执行两阶段审查：先审查规格合规性，再审查代码质量。

## 关键设计决策

- **每个任务一个新子代理**：精确构造指令和上下文确保专注和成功
- **两阶段审查**：规格合规性审查 → 代码质量审查，分开执行
- **连续执行**：不暂停与用户沟通，除非遇到 BLOCKED 或歧义
- **隔离上下文**：子代理不继承父会话历史，保留父上下文用于协调

## 工作流程

1. 加载计划 → 2. 为每个任务调度子代理 → 3. 子代理执行任务
→ 4. 两阶段审查（规格合规→代码质量）→ 5. 下一个任务

## 来源

- https://raw.githubusercontent.com/obra/superpowers/main/skills/subagent-driven-development/SKILL.md
