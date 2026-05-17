# writing-plans — 编写实施计划

> 来源: [obra/superpowers/skills/writing-plans](https://github.com/obra/superpowers/tree/main/skills/writing-plans)

## 概述

在有一份 spec 或需求需要为多步骤任务编写实施计划时使用。在接触任何代码之前必须先编写计划。

## 关键设计决策

- **零上下文假设**：假设执行者对该代码库零上下文、品味可疑，文档化所有必要信息
- **预定义文件结构**：在定义任务前先映射出所有需要创建或修改的文件
- **小模块原则**：每个文件一个清晰职责，偏好小文件而非大文件
- **范围检查**：如果 spec 覆盖多个独立子系统，拆分为多个计划

## 输出规范

- 保存到 `docs/superpowers/plans/YYYY-MM-DD-<feature-name>.md`
- 每个计划应产生可工作、可测试的软件

## 来源

- https://raw.githubusercontent.com/obra/superpowers/main/skills/writing-plans/SKILL.md
