---
name: skill-lifecycle-router
description: Use when developing a new skill or modifying an existing one through structured design, plan, task, test, and review stages with feedback loop routing
---

# Skill 生命周期路由器

## 概述

Skill 生命周期的 Harness 层。询问用户当前要处理哪个阶段，检查入口条件，转发到对应子 skill，管理反馈回流和退出循环。

**核心原则:** 路由器，非执行器。不包含领域知识 —— 通过读取目标子 skill 的 SKILL.md 来了解要做什么。

## 语言

- 默认输出语言：zh-CN。
- 保留原文的术语：`SKILL.md`、`name`、`description`、frontmatter、路径根名称、代码标识符、YAML 字段、阶段名、平台名称。
- 生命周期阶段名保持原文：`design`、`plan`、`task`、`test`、`review`、`feedback`。
- 产物类型名保持原文：`specs`、`plans`、`notes`、`test`。
- 用户明确指定输出语言时，以用户要求为准。

## 路径声明

- 默认相对基准：除目标工作区产物外，所有路径均相对于当前 `SKILL.md` 所在目录（`skill-lifecycle-router/`）。
- 子技能：[skill-lifecycle-design/SKILL.md](skill-lifecycle-design/SKILL.md)、[skill-lifecycle-plan/SKILL.md](skill-lifecycle-plan/SKILL.md)、[skill-lifecycle-task/SKILL.md](skill-lifecycle-task/SKILL.md)、[skill-lifecycle-test/SKILL.md](skill-lifecycle-test/SKILL.md)、[skill-lifecycle-review/SKILL.md](skill-lifecycle-review/SKILL.md)、[skill-lifecycle-feedback/SKILL.md](skill-lifecycle-feedback/SKILL.md)，相对基准为当前 `SKILL.md` 所在目录。
- 约束文档：[skill-constrains.md](docs/constraints/skill-constrains.md)，相对基准为当前 `SKILL.md` 所在目录。
- 反馈格式约束：[feedback-note-constraints.md](docs/constraints/feedback-note-constraints.md)，相对基准为当前 `SKILL.md` 所在目录，feedback 子技能使用。
- 目标工作区：由用户在运行时指定（或默认为当前仓库根），作为生命周期产物的相对基准。
- 目标技能目录：由 router 在确定目标 skill 后绑定，相对基准为目标工作区根目录。

目标工作区绑定规则：
- 如果用户明确指定工作区，使用该路径作为目标工作区相对基准。
- 否则使用当前目标仓库根作为目标工作区相对基准。
- 如果当前工作目录在仓库内，使用该仓库根而非嵌套的当前目录。
- 如果存在多个可能的工作区，在进入阶段之前询问用户。
- 除非 router 包本身就是目标工作区，否则不将目标工作区绑定到 router 自身目录。

规则：
- 所有路径必须使用本章节声明的相对基准。
- 后续路径引用必须使用 markdown 链接语法 `[描述](相对路径)`。
- router 拥有的文件（子技能、约束文档）从当前 SKILL.md 所在目录解析，不从目标工作区解析。
- 生命周期产物属于目标工作区，不在 router 目录下生成。

## 索引

- 约束文档（必读）：[skill-constrains.md](docs/constraints/skill-constrains.md)，阶段执行前读取以了解通用约束。
- 子技能：按用户选择的阶段读取对应的 [skill-lifecycle-<stage>/SKILL.md](skill-lifecycle-design/SKILL.md)，路径见 `## 路径声明`。
- 产物目录（目标工作区）：
  - 设计文档：`docs/specs/<skill-name>-design.md`
  - 计划文档：`docs/plans/<skill-name>-plan.md`
  - 测试报告：`docs/test/<skill-name>-test-report.md`
  - 审查报告：`docs/notes/<skill-name>-review.md`
  - 反馈记录：`docs/notes/<skill-name>-feedback.md`
- 反馈格式约束：[feedback-note-constraints.md](docs/constraints/feedback-note-constraints.md)，feedback 阶段读取。

## 适用场景

适用：
- 用户要开发一个新 skill 或修改现有 skill
- 用户需要结构化的 design → plan → task → test → review 流程
- 用户需要反馈回流机制（review/test 发现问题自动路由回对应阶段）

不适用：
- 用户只是想记一个想法（用 `record-idea`）
- 用户已经有一个完整的 spec 和 plan 想要直接执行

## 核心模式

路由器，非执行器。读取子 skill 的 SKILL.md，按其说明执行。不包含领域知识。

### 阶段流转

询问 skill → 展示阶段状态 → 询问目标阶段 → 检查入口条件 → 执行子 skill → 验证自检 → 检查反馈触发器 → 循环或退出。

### 入口条件

- `plan` → 设计文档必须存在。若不存在则提示先走 design。
- `task` → 计划文档必须存在。若不存在则提示先走 plan。
- `test` → task 输出必须存在。若不存在则提示先完成 task。
- `review` → 目标产物必须存在（询问用户要审查哪个阶段）。若不存在则提示先完成对应阶段。
- `feedback` → 无条件进入。询问用户是主动发起还是由 review/test 发现触发。

### 自检验证

子 skill 执行完毕后，检查输出产物是否以 `## 自检` 章节结尾，其中包含已勾选的项目（`- [x]`）。若缺失，该阶段未完成，返回子 skill。

### 反馈循环

在 review 或 test 阶段之后：读取 review/test 报告，如果问题章节非空则调用 feedback 子 skill 生成反馈记录，向用户展示问题并询问修复还是继续。

### 退出条件

- review 通过（零严重 + 零重要），且用户接受结果。
- 用户保留否决权，可随时继续迭代。
- 退出前检查未解决的反馈，若有待处理问题则警告。
- 如果 review 未运行或有问题，提醒用户确认。

### 熵管理

进入某个阶段时，扫描目标工作区 `docs/notes/<skill-name>-feedback.md` 中针对该阶段的历史问题并提醒用户。

## 快速参考

| 项目 | 值 |
| ---- | ---- |
| 约束文档 | [skill-constrains.md](docs/constraints/skill-constrains.md) |
| 阶段 | `design`、`plan`、`task`、`test`、`review`、`feedback` |
| 产物根目录 | 目标工作区下的 `docs/specs/`、`docs/plans/`、`docs/notes/`、`docs/test/` |
| 自检标记 | 产物以 `## 自检` 结尾且含 `- [x]` 检查项 |
| 退出条件 | review 零严重 + 零重要，用户接受 |

## 实施步骤

### 步骤 1：确定 skill

询问用户："你在开发哪个 skill？" 这将成为所有产物路径中的 `<skill-name>`。

### 步骤 2：显示阶段状态

扫描已有产物并展示：

| 阶段 | 状态 | 产物 |
|-------|--------|----------|
| design | 已完成 / 未开始 | `目标工作区 docs/specs/<skill-name>-design.md` |
| plan | 已完成 / 未开始 | `目标工作区 docs/plans/<skill-name>-plan.md` |
| task | 已完成 / 未开始 | `目标技能目录` 下的 Skill SKILL.md 及相关文件 |
| test | 已完成 / 未开始 | `目标工作区 docs/test/<skill-name>-test-report.md` |
| review | 已完成 / 未开始 | `目标工作区 docs/notes/<skill-name>-review.md` |
| feedback | 有待处理问题 / 无 | `目标工作区 docs/notes/<skill-name>-feedback.md` |

同时扫描 `目标工作区 docs/notes/<skill-name>-feedback.md` 中未解决的问题并展示。

### 步骤 3：询问阶段

"哪个阶段？（design / plan / task / test / review / feedback）"

### 步骤 4：检查入口条件

- `plan` → 设计文档必须存在。若不存在："没有设计文档的实现计划容易偏离方向——先用 design 阶段明确边界和范围"
- `task` → 计划文档必须存在。若不存在："没有实现计划就动手容易跑偏——先用 plan 阶段明确要做什么"
- `test` → task 输出必须存在。若不存在："没有实现产物就测试是在验证空气——先完成 task 阶段"
- `review` → 目标产物必须存在（询问用户要审查哪个阶段）。若不存在："没有产物可以审查——先完成对应阶段的输出"
- `feedback` → 无条件。询问用户是用户主动发起还是由 review/test 发现触发。

### 步骤 5：执行子 skill

读取 [skill-lifecycle-<stage>/SKILL.md](skill-lifecycle-design/SKILL.md)。按其说明执行该阶段。不要通过 Skill 工具调用 —— 作为路由器直接执行。

### 步骤 6：验证自检

子 skill 执行完毕后，检查输出产物是否以 `## 自检` 章节结尾，其中包含已勾选的项目（`- [x]`）。若缺失，该阶段未完成 —— 返回子 skill。

### 步骤 7：检查反馈触发器

在 review 或 test 阶段之后：
- 读取 review/test 报告
- 如果问题章节非空 → 调用 feedback 子 skill 生成反馈记录
- 向用户展示问题："回到 <stage> 修，还是接受继续？"

### 步骤 8：循环或退出

展示更新后的阶段状态。询问："下一个阶段？还是结束？"

如果用户说"结束"：
- 检查未解决的反馈 → 若仍有待处理问题则警告
- 如果 review 通过（零 Critical + 零 Important）→ 确认退出
- 如果 review 未运行或有问题 → "Review 还没通过，确定要结束吗？"

## 常见错误

| 错误 | 纠正 |
|---------|-----|
| 自己执行 task | 读取子 skill SKILL.md，按其流程执行 |
| 跳过自检验证 | 检查 `## 自检` 及 `- [x]` 项目 |
| 跳过关卡检查 | 进入阶段前验证文件存在 |
| 批量提问 | 一次一个问题 |
| 忘记反馈扫描 | 进入阶段时检查 `docs/notes/` 中的历史问题 |

## 自检

- [ ] 子技能 SKILL.md 已按 `## 路径声明` 中声明的路径读取
- [ ] 入口条件已验证（文件存在性）
- [ ] 子技能输出的 `## 自检` 已检查且包含 `- [x]` 项目
- [ ] feedback 扫描已完成（review/test 阶段后）
- [ ] 所有路径引用使用 markdown 链接语法
