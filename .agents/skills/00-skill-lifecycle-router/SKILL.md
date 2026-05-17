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

## 适用场景

适用：
- 用户要开发一个新 skill 或修改现有 skill
- 用户需要结构化的 design → plan → task → test → review 流程
- 用户需要反馈回流机制（review/test 发现问题自动路由回对应阶段）

不适用：
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


### 反馈循环

在 review 或 test 阶段之后：读取 [评审文档目录] 或 [测试文档目录] 中的报告，如果问题章节非空则调用 [子技能-反馈] 生成反馈记录，向用户展示问题并询问修复还是继续。

### 退出条件

- review 通过（零严重 + 零重要），且用户接受结果。
- 用户保留否决权，可随时继续迭代。
- 退出前检查未解决的反馈，若有待处理问题则警告。
- 如果 review 未运行或有问题，提醒用户确认。

### 熵管理

进入某个阶段时，扫描目标工作区 [反馈文档目录]<skill-name>-feedback.md 中针对该阶段的历史问题并提醒用户。

## 快速参考

| 项目 | 值 |
| ---- | ---- |
| 阶段 | `design`、`plan`、`task`、`test`、`review`、`feedback` |
| 产物根目录 | 目标工作区下的 [设计文档目录]、[计划文档目录]、[反馈文档目录]、[测试文档目录] |
| 自检标记 | 产物以 `## 自检` 结尾且含 `- [x]` 检查项 |
| 退出条件 | review 零严重 + 零重要，用户接受 |

## 实施步骤

### 步骤 1：确定 skill

询问用户："你在开发哪个 skill？" 这将成为所有产物路径中的 `<skill-name>`。

### 步骤 2：显示阶段状态

扫描已有产物并展示：

| 阶段 | 状态 | 产物 |
|-------|--------|----------|
| design | 已完成 / 未开始 | 目标工作区 [设计文档目录]<skill-name>-design.md |
| plan | 已完成 / 未开始 | 目标工作区 [计划文档目录]<skill-name>-plan.md |
| task | 已完成 / 未开始 | 目标技能目录下的 Skill SKILL.md 及相关文件 |
| test | 已完成 / 未开始 | 目标工作区 [测试文档目录]<skill-name>-test-report.md |
| review | 已完成 / 未开始 | 目标工作区 [评审文档目录]<skill-name>-review.md |
| feedback | 有待处理问题 / 无 | 目标工作区 [反馈文档目录]<skill-name>-feedback.md |

同时扫描目标工作区 [反馈文档目录]<skill-name>-feedback.md 中未解决的问题并展示。

### 步骤 3：询问阶段

"哪个阶段？（design / plan / task / test / review / feedback）"

### 步骤 4：检查入口条件

- `plan` → 设计文档必须存在。若不存在："没有设计文档的实现计划容易偏离方向——先用 design 阶段明确边界和范围"
- `task` → 计划文档必须存在。若不存在："没有实现计划就动手容易跑偏——先用 plan 阶段明确要做什么"
- `test` → task 输出必须存在。若不存在："没有实现产物就测试是在验证空气——先完成 task 阶段"
- `review` → 目标产物必须存在（询问用户要审查哪个阶段）。若不存在："没有产物可以审查——先完成对应阶段的输出"
- `feedback` → 无条件。询问用户是用户主动发起还是由 review/test 发现触发。

### 步骤 5：执行子 skill

读取子技能 SKILL.md（如 [子技能-设计]）。按其说明执行该阶段。不要通过 Skill 工具调用 —— 作为路由器直接执行。

### 步骤 6：验证自检

子 skill 执行完毕后，检查输出产物是否以 `## 自检` 章节结尾，其中包含已勾选的项目（`- [x]`）。若缺失，该阶段未完成 —— 返回子 skill。

### 步骤 7：检查反馈触发器

在 review 或 test 阶段之后：
- 读取 [评审文档目录] 或 [测试文档目录] 中的报告
- 如果问题章节非空 → 调用 [子技能-反馈] 生成反馈记录
- 向用户展示问题："回到 <stage> 修，还是接受继续？"

### 步骤 8：循环或退出

展示更新后的阶段状态。询问："下一个阶段？还是结束？"

如果用户说"结束"：
- 检查未解决的反馈 → 若仍有待处理问题则警告
- 如果 review 通过（零严重 + 零重要）→ 确认退出
- 如果 review 未运行或有问题 → "Review 还没通过，确定要结束吗？"

## 常见错误

| 错误 | 纠正 |
|---------|-----|
| 自己执行 task | 读取对应子技能 SKILL.md（如 [子技能-任务]），按其流程执行 |
| 跳过自检验证 | 检查 `## 自检` 及 `- [x]` 项目 |
| 跳过关卡检查 | 进入阶段前验证文件存在 |
| 批量提问 | 一次一个问题 |
| 忘记反馈扫描 | 进入阶段时检查 [反馈文档目录] 中的历史问题 |

## 自检

- [ ] 子技能 SKILL.md 已按 `## 路径声明` 中声明的路径读取
- [ ] 入口条件已验证（文件存在性）
- [ ] 子技能输出的 `## 自检` 已检查且包含 `- [x]` 项目
- [ ] feedback 扫描已完成（review/test 阶段后）
- [ ] 所有路径引用使用 markdown 链接语法



## 文件目录

```
00-skill-lifecycle-router/
├── SKILL.md                              # 本文件（路由器入口）
├── docs/
│   ├── checklists/
│   │   ├── design.md                     # 设计阶段检查清单
│   │   ├── plan.md                       # 计划阶段检查清单
│   │   ├── task.md                       # 任务阶段检查清单
│   │   └── test.md                       # 测试阶段检查清单
│   ├── constraints/
│   │   ├── skill-constrains.md           # 技能约束
│   │   ├── design-constraints.md         # 设计约束
│   │   ├── plan-constraints.md           # 计划约束
│   │   ├── task-constraints.md           # 任务约束
│   │   ├── test-constraints.md           # 测试约束
│   │   └── feedback-note-constraints.md  # 反馈笔记约束
│   └── products/
│       ├── specs/                        # 设计产物输出目录
│       ├── plans/                        # 计划产物输出目录
│       ├── test/                         # 测试报告输出目录
│       └── notes/                        # 反馈笔记输出目录
├── skill-lifecycle-design/
│   ├── SKILL.md                          # 设计子技能
│   └── agents/openai.yaml
├── skill-lifecycle-plan/
│   ├── SKILL.md                          # 计划子技能
│   └── agents/openai.yaml
├── skill-lifecycle-task/
│   ├── SKILL.md                          # 任务子技能
│   └── agents/openai.yaml
├── skill-lifecycle-test/
│   ├── SKILL.md                          # 测试子技能
│   └── agents/openai.yaml
├── skill-lifecycle-review/
│   ├── SKILL.md                          # 评审子技能
│   └── agents/openai.yaml
└── skill-lifecycle-feedback/
    ├── SKILL.md                          # 反馈子技能
    └── agents/openai.yaml
```

## 关联文档/目录

[子技能-设计]: skill-lifecycle-design/SKILL.md
[子技能-计划]: skill-lifecycle-plan/SKILL.md
[子技能-任务]: skill-lifecycle-task/SKILL.md
[子技能-测试]: skill-lifecycle-test/SKILL.md
[子技能-评审]: skill-lifecycle-review/SKILL.md
[子技能-反馈]: skill-lifecycle-feedback/SKILL.md
[技能约束文档]: docs/constraints/skill-constrains.md
[设计约束文档]: docs/constraints/design-constraints.md
[计划约束文档]: docs/constraints/plan-constraints.md
[任务约束文档]: docs/constraints/task-constraints.md
[测试约束文档]: docs/constraints/test-constraints.md
[反馈笔记约束文档]: docs/constraints/feedback-note-constraints.md
[设计文档目录]: docs/products/specs/
[计划文档目录]: docs/products/plans/
[测试文档目录]: docs/products/test/
[评审文档目录]: docs/products/reviews/
[反馈文档目录]: docs/products/notes/