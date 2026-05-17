# requesting-code-review — 请求代码审查

> 来源: [obra/superpowers/skills/requesting-code-review](https://github.com/obra/superpowers/tree/main/skills/requesting-code-review)

## 概述

在完成任务、实施主要功能或合并前，调度代码审查子代理以在问题级联前捕获问题。

## 关键设计决策

- **审查早审查勤**：每个任务完成后、主要功能后、合并到主分支前必须审查
- **精确上下文**：审查者获得精心构建的工作产物上下文，而非父会话历史
- **聚焦产物**：审查者聚焦工作产物本身，而非创建者的思考过程

## 触发时机

- 必须：子代理开发每个任务后、主要功能后、合并前
- 可选：卡住时、重构前、修复复杂 bug 后

## 来源

- https://raw.githubusercontent.com/obra/superpowers/main/skills/requesting-code-review/SKILL.md
