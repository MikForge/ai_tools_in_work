---
name: skill-lifecycle-plan
description: Use when a skill design document exists and needs conversion into an executable implementation plan with independently verifiable steps, precise file paths, and concrete commands
---

# Skill 生命周期 — 计划

## 概述

将设计文档转换为包含可独立执行步骤的具体实现计划。计划文档驱动 task 阶段。

**核心原则:** 设计 → 实现计划，分解为可独立执行的步骤。

## 语言

- 默认输出语言：zh-CN。
- 保留原文的术语：`SKILL.md`、`name`、`description`、frontmatter、路径根名称、代码标识符、YAML 字段、阶段名、平台名称。
- 生命周期阶段名保持原文：`design`、`plan`、`task`、`test`、`review`、`feedback`。
- 用户明确指定输出语言时，以用户要求为准。

## 路径声明

- 默认相对基准：除目标工作区产物外，所有路径均相对于当前 `SKILL.md` 所在目录（`skill-lifecycle-plan/`）。
- router 根目录：[..](..)，相对基准为当前 `SKILL.md` 所在目录，用于定位约束文档和兄弟子技能。
- 约束文档：[skill-constrains.md](../docs/constraints/skill-constrains.md)，相对基准为当前 `SKILL.md` 所在目录，执行前必须读取。
- 目标工作区：由 router 传入的相对基准，用于解析设计文档（输入）和计划文档（输出）路径。不在技能正文中写绝对路径。
- 目标技能目录：由 router 传入的相对路径，相对基准为目标工作区根目录。

规则：
- 所有路径必须使用本章节声明的相对基准。
- 后续路径引用必须使用 markdown 链接语法 `[描述](相对路径)`。
- 不得依赖 cwd、`./`、`../` 或父级相对路径推断文件位置。
- 不得重绑定 router 或上游阶段已经声明的相对基准。

## 索引

- 约束文档（必读）：[skill-constrains.md](../docs/constraints/skill-constrains.md)，执行前必须读取以了解通用约束。
- 输入：设计文档，位于目标工作区 `docs/specs/<skill-name>-design.md`，相对基准由 router 传入。
- 输出：计划文档，写入目标工作区 `docs/plans/<skill-name>-plan.md`，相对基准由 router 传入。
- 方法论参考：`writing-plans` skill（外部技能，不在本目录内），提供任务粒度、无占位符、精确路径等方法论。

## 适用场景

适用：
- router 判定进入 plan 阶段，且设计文档已存在。
- 需要将设计文档中的组件、边界、非目标转换为可独立执行的具体步骤。

不适用：
- 设计文档不存在（应先走 design 阶段）。
- 用户只想粗略记录想法（使用 record-idea）。

## 核心模式

设计文档 → 逐个组件映射为任务 → 每个任务独立可执行（2-5 分钟） → 精确文件路径 + 完整代码/命令 + 预期输出 → 写入计划文档 → 运行自检 → 宣告完成。

入口条件：设计文档必须存在。router 在转发前检查此项。若缺失，返回 design 阶段。

## 快速参考

| 项目 | 值 |
| ---- | ---- |
| 约束文档 | [skill-constrains.md](../docs/constraints/skill-constrains.md) |
| 输入 | 目标工作区 `docs/specs/<skill-name>-design.md` |
| 输出 | 目标工作区 `docs/plans/<skill-name>-plan.md` |
| 任务粒度 | 单步可独立验证，2-5 分钟 |
| 下一阶段 | 由 skill-lifecycle-router 决定 |

## 实施步骤

1. 从 目标工作区 docs/specs/<skill-name>-design.md 读取设计文档
2. 将每个设计组件映射为实现任务
3. 每个任务必须可独立执行（一个操作，2-5 分钟）
4. 包含精确的文件路径、完整代码、精确的命令及预期输出
5. 将计划文档写入 目标工作区 docs/plans/<skill-name>-plan.md
6. 在宣告完成之前运行自检

## 常见错误

| 错误 | 纠正 |
| ---- | ---- |
| 计划步骤包含 TBD/TODO 占位符 | 补齐具体内容后宣告完成 |
| 步骤引用后续步骤的输出 | 每步必须独立可验证，不依赖后续步骤 |
| 使用绝对路径写产物位置 | 使用 `## 路径声明` 中声明的相对基准 |
| 跳过自检直接宣告完成 | 逐项验证自检清单 |

## 自检

- [ ] 计划文件存在于 目标工作区 docs/plans/<skill-name>-plan.md
- [ ] 每个步骤可独立验证 —— 无前向引用，无"类似任务 N"的描述
- [ ] 无 "TBD" 或 "TODO" 占位符

## 输出

在计划文档末尾追加自检声明：

```markdown
## 自检
- [x] 计划文件存在
- [x] 每个步骤可独立验证
- [x] 无 "TBD" / "TODO" 占位符
```
