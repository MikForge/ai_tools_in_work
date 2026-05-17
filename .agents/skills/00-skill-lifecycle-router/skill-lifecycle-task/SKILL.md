---
name: skill-lifecycle-task
description: Use when an implementation plan exists and each step must be executed sequentially to generate skill artifacts including SKILL.md, scripts, and templates under a target skill directory
---

# Skill 生命周期 — 任务

## 概述

逐步执行实现计划，生成目标 skill 的 SKILL.md 及相关文件。每个计划步骤对应一个具体输出。

**核心原则:** 执行计划，产出 skill 产物。

## 语言

- 默认输出语言：zh-CN。
- 保留原文的术语：`SKILL.md`、`name`、`description`、frontmatter、路径根名称、代码标识符、YAML 字段、阶段名、平台名称。
- 生命周期阶段名保持原文：`design`、`plan`、`task`、`test`、`review`、`feedback`。
- 用户明确指定输出语言时，以用户要求为准。

## 路径声明

- 默认相对基准：除目标工作区产物外，所有路径均相对于当前 `SKILL.md` 所在目录（`skill-lifecycle-task/`）。
- router 根目录：[..](..)，相对基准为当前 `SKILL.md` 所在目录，用于定位约束文档。
- 约束文档：[skill-constrains.md](../docs/constraints/skill-constrains.md)，相对基准为当前 `SKILL.md` 所在目录，执行前必须读取。
- 目标工作区：由 router 传入的相对基准，用于解析计划文档（输入）路径。不在技能正文中写绝对路径。
- 目标技能目录：由 router 传入的相对路径，相对基准为目标工作区根目录，产物文件写入此目录下。

规则：
- 所有路径必须使用本章节声明的相对基准。
- 后续路径引用必须使用 markdown 链接语法 `[描述](相对路径)`。
- 不得依赖 cwd、`./`、`../` 或父级相对路径推断文件位置。

## 索引

- 约束文档（必读）：[skill-constrains.md](../docs/constraints/skill-constrains.md)，执行前必须读取。
- 输入：计划文档，位于目标工作区 `docs/plans/<skill-name>-plan.md`，相对基准由 router 传入。
- 输出：产物文件（SKILL.md、脚本、模板等），写入目标技能目录，相对基准由 router 传入。
- 方法论参考：`executing-plans` skill（外部技能，不在本目录内），提供逐步执行、频繁提交等方法论。

## 适用场景

适用：
- router 判定进入 task 阶段，且计划文档已存在。
- 需要按计划文档逐步生成 skill 产物文件。

不适用：
- 计划文档不存在（应先走 plan 阶段）。
- 没有明确计划文档的临时修改（使用其他适合的 skill）。

## 核心模式

按顺序执行计划步骤 → 每步产出具体文件（SKILL.md、脚本、模板等） → 每个步骤完成后提交（频繁提交） → 产物写入目标技能目录 → 运行自检 → 宣告完成。

入口条件：计划文档必须存在。router 在转发前检查此项。若缺失，返回 plan 阶段。

## 快速参考

| 项目 | 值 |
| ---- | ---- |
| 约束文档 | [skill-constrains.md](../docs/constraints/skill-constrains.md) |
| 输入 | 目标工作区 `docs/plans/<skill-name>-plan.md` |
| 输出 | 目标技能目录下的 SKILL.md 及相关文件 |
| 提交策略 | 每步完成后提交 |
| 下一阶段 | 由 skill-lifecycle-router 决定 |

## 实施步骤

1. 从目标工作区 `docs/plans/<skill-name>-plan.md` 读取计划文档
2. 按顺序执行每个计划步骤
3. 在目标技能目录下生成产物：SKILL.md、zh-CN.md、脚本、模板（按计划定义）
4. 每完成一个步骤后提交（频繁提交）
5. 在宣告完成之前运行自检

## 常见错误

| 错误 | 纠正 |
| ---- | ---- |
| 跳过计划步骤 | 每步必须有对应输出，不可跳过 |
| 产物写入错误目录 | 所有产物写入目标技能目录 |
| 缺少自检 | 宣告完成前逐项检查自检清单 |
| 使用绝对路径定位产物 | 使用 `## 路径声明` 中声明的相对基准 |

## 自检

- [ ] 每个计划步骤都有对应输出
- [ ] 无跳过或部分完成的步骤
- [ ] 所有生成的文件在其指定路径下存在于目标技能目录

## 输出

在最后生成的产物末尾追加自检声明：

```markdown
## 自检
- [x] 所有计划步骤已执行
- [x] 所有文件已在指定路径生成
- [x] 无跳过步骤
```
