---
name: skill-lifecycle-router
description: Skill 生命周期统一入口。路由 design/plan/task/test/review/feedback 六阶段，检查入口条件，管理反馈回流。
---

# Skill Lifecycle Router（技能生命周期路由器）

## 概述

Skill 生命周期的 Harness 层。询问用户当前要处理哪个阶段，检查入口条件，转发到对应子 skill，管理反馈回流和退出循环。

**核心原则：** 路由器，不是执行器。不承载领域知识——读取目标子 skill 的 SKILL.md 来了解该做什么。

## 路径绑定

执行任何工作流步骤前，先将 `ROUTER_SKILL_DIR` 绑定为根 `skill-lifecycle-router/SKILL.md` 所在目录的绝对路径。

router 使用三个显式路径根：

| 路径根 | 绑定到 | 归属 |
| ------ | ------ | ---- |
| `ROUTER_SKILL_DIR` | 当前根 router `SKILL.md` 所在目录的绝对路径 | router `SKILL.md`、`zh-CN.md`、内部子 skill、router 约束 |
| `TARGET_WORKSPACE` | 用户指定的工作区；如无歧义，则为当前目标仓库根目录 | `docs/specs`、`docs/plans`、`docs/test`、`docs/notes` 下的生命周期报告 |
| `TARGET_SKILL_DIR` | 已确定的正在创建或修改的目标 skill 目录 | 目标 skill 的 `SKILL.md`、`zh-CN.md`、scripts、templates、references |

`ROUTER_SKILL_DIR` 是 router 自有文件的唯一根目录：
- 子 skill 文件：`ROUTER_SKILL_DIR/skill-lifecycle-<stage>/SKILL.md`
- router 约束文件：`ROUTER_SKILL_DIR/docs/constraints/*.md`
- router 子 skill 中任何指向 router 自有文件的相对路径

`TARGET_WORKSPACE` 绑定规则：
- 如果用户明确指定 workspace，则绑定到该绝对路径。
- 否则绑定到当前目标仓库根目录。
- 如果当前工作目录位于某个仓库内部，使用该仓库根目录，而不是嵌套的当前目录。
- 如果存在多个可能的 workspace，进入阶段前只问一个问题。
- 除非 router package 本身就是目标工作区，否则不要把 `TARGET_WORKSPACE` 绑定为 `ROUTER_SKILL_DIR`。

禁止从当前 shell 工作目录、项目根目录或 `TARGET_WORKSPACE` 解析 router 自有文件。如果某个路径在 `ROUTER_SKILL_DIR` 和项目工作区中都可能存在，只有指令明确写 `ROUTER_SKILL_DIR` 时才使用 `ROUTER_SKILL_DIR`。

生命周期输出产物，例如 `TARGET_WORKSPACE/docs/specs/<skill-name>-design.md` 和 `TARGET_WORKSPACE/docs/plans/<skill-name>-plan.md`，默认属于目标工作区，除非用户明确另有说明。

子 skill 继承这些绑定，不能把 `ROUTER_SKILL_DIR` 重新解释为子 skill 自己的目录。

## 使用场景

- 用户要开发一个新 skill 或修改现有 skill
- 用户需要结构化的 design → plan → task → test → review 流程
- 用户需要反馈回流机制（review/test 发现问题自动路由回对应阶段）

不要用于：
- 用户只是想记一个想法（用 `record-idea`）
- 用户已经有一个完整的 spec 和 plan 想要直接执行

## 工作流

### 步骤 1：确定 skill

问用户："你在开发哪个 skill？" 这个名称成为所有产物路径中的 `<skill-name>`。

### 步骤 2：展示阶段状态

扫描已有产物，展示：

| 阶段 | 状态 | 产物 |
|------|------|------|
| design | 已完成 / 未开始 | `TARGET_WORKSPACE/docs/specs/<skill-name>-design.md` |
| plan | 已完成 / 未开始 | `TARGET_WORKSPACE/docs/plans/<skill-name>-plan.md` |
| task | 已完成 / 未开始 | `TARGET_SKILL_DIR` 下的 Skill SKILL.md 及相关文件 |
| test | 已完成 / 未开始 | `TARGET_WORKSPACE/docs/test/<skill-name>-test-report.md` |
| review | 已完成 / 未开始 | `TARGET_WORKSPACE/docs/notes/<skill-name>-review.md` |
| feedback | 有待处理问题 / 无 | `TARGET_WORKSPACE/docs/notes/<skill-name>-feedback.md` |

同时扫描 `TARGET_WORKSPACE/docs/notes/<skill-name>-feedback.md`，列出未解决的问题。

### 步骤 3：询问阶段

"进哪个阶段？（design / plan / task / test / review / feedback）"

### 步骤 4：检查入口条件

- `plan` → design doc 必须存在。不存在时："没有设计文档的实现计划容易偏离方向——先用 design 阶段明确边界和范围"
- `task` → plan doc 必须存在。不存在时："没有实现计划就动手容易跑偏——先用 plan 阶段明确要做什么"
- `test` → task 产物必须存在。不存在时："没有实现产物就测试是在验证空气——先完成 task 阶段"
- `review` → 目标产物必须存在（先问用户审查哪个阶段的产物）。不存在时："没有产物可以审查——先完成对应阶段的输出"
- `feedback` → 无条件。问用户是主动记录还是由 review/test 触发。

### 步骤 5：执行子 skill

读取 `ROUTER_SKILL_DIR/skill-lifecycle-<stage>/SKILL.md`，按其中指令执行。不要通过 Skill 工具调用——直接作为 router 执行。

### 步骤 6：验证自检声明

子 skill 执行完毕后，检查产物文件末尾是否有 `## Self-Check` 段并包含已勾选项目（`- [x]`）。缺少自检声明 = 阶段未完成，退回子 skill。

### 步骤 7：检查 feedback 触发

review 或 test 阶段完成后：
- 读取 review/test report
- 如果 Issues 段非空 → 调用 feedback 子 skill 生成 feedback note
- 向用户展示问题："回到 <stage> 修，还是接受继续？"

### 步骤 8：循环或退出

展示更新后的阶段状态。问："下一步？还是结束？"

用户说"结束"时：
- 检查是否有未处理 feedback → 有的话警告
- 如果 review 已通过（零 Critical + 零 Important）→ 确认退出
- 如果 review 未跑或有问题 → "Review 还没通过，确定要结束吗？"

## 熵管理

进入某个阶段时，扫描 `docs/notes/<skill-name>-feedback.md` 中目标为该阶段的历史问题。提醒："上次 design 阶段有 X 个问题需要注意：..."

## 退出条件

生命周期终止条件：
- review 产出零 Critical + 零 Important 问题，且
- 用户接受结果（用户随时可以否决并继续迭代）

## 规则

1. 路由器，不是执行器。读取子 skill SKILL.md，执行其中指令。
2. Gate 检查仅验证存在性——检查文件是否存在，不校验内容质量。
3. 自检声明是强制性的——没有声明 = 阶段未完成。
4. 每次只问一个问题——不批量。
5. 反馈循环：review 零 Critical+Important 自动通过，用户保留否决权。
6. 不要用 Skill 工具调用子 skill，直接执行。
