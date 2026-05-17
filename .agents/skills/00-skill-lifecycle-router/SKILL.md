---
name: skill-lifecycle-router
description: Skill 生命周期统一入口。路由 design/plan/task/test/review/feedback 六阶段，检查入口条件，管理反馈回流。
---

# Skill 生命周期路由器

## 概述

Skill 生命周期的 Harness 层。询问用户当前要处理哪个阶段，检查入口条件，转发到对应子 skill，管理反馈回流和退出循环。

**核心原则:** 路由器，非执行器。不包含领域知识 —— 通过读取目标子 skill 的 SKILL.md 来了解要做什么。

## 路径绑定

在任何工作流步骤之前，将 `ROUTER_SKILL_DIR` 绑定到包含根 `skill-lifecycle-router/SKILL.md` 的绝对目录。

路由器使用三个显式路径根：

| 根 | 绑定到 | 拥有 |
| ---- | -------- | ---- |
| `ROUTER_SKILL_DIR` | 包含此根路由器 `SKILL.md` 的绝对目录 | 路由器 `SKILL.md`、`zh-CN.md`、内部子 skill、路由器约束 |
| `TARGET_WORKSPACE` | 用户指定的工作区，或当前目标仓库根（当明确时） | 生命周期报告，位于 `docs/specs`、`docs/plans`、`docs/test`、`docs/notes` 下 |
| `TARGET_SKILL_DIR` | 正在创建或修改的 skill 所在目录（一旦确定目标 skill） | 目标 skill 的 `SKILL.md`、`zh-CN.md`、脚本、模板和参考资料 |

`ROUTER_SKILL_DIR` 是路由器拥有文件的唯一根：
- 子 skill 文件: `ROUTER_SKILL_DIR/skill-lifecycle-<stage>/SKILL.md`
- 路由器约束文件: `ROUTER_SKILL_DIR/docs/constraints/*.md`
- 路由器子 skill 中指向路由器拥有文件的任何相对路径

`TARGET_WORKSPACE` 绑定规则：
- 如果用户明确指定工作区，将 `TARGET_WORKSPACE` 绑定到该绝对路径。
- 否则将 `TARGET_WORKSPACE` 绑定到当前目标仓库根。
- 如果当前工作目录在仓库内，使用该仓库根而非嵌套的当前目录。
- 如果存在多个可能的工作区，在进入阶段之前询问一个问题。
- 不要将 `TARGET_WORKSPACE` 绑定到 `ROUTER_SKILL_DIR`，除非路由器包本身就是目标工作区。

永远不要从当前 shell 工作目录、项目根或 `TARGET_WORKSPACE` 解析路由器拥有的文件。如果某个路径可能同时存在于 `ROUTER_SKILL_DIR` 和项目工作区中，仅当指令明确说明 `ROUTER_SKILL_DIR` 时才使用 `ROUTER_SKILL_DIR`。

生命周期输出产物如 `TARGET_WORKSPACE/docs/specs/<skill-name>-design.md` 和 `TARGET_WORKSPACE/docs/plans/<skill-name>-plan.md` 属于目标工作区，除非用户明确另有说明。

子 skill 继承这些绑定，不得将 `ROUTER_SKILL_DIR` 重新解释为自己的目录。

## 何时使用

- 用户要开发一个新 skill 或修改现有 skill
- 用户需要结构化的 design → plan → task → test → review 流程
- 用户需要反馈回流机制（review/test 发现问题自动路由回对应阶段）

以下情况不要使用：
- 用户只是想记一个想法（用 `record-idea`）
- 用户已经有一个完整的 spec 和 plan 想要直接执行

## 工作流

### 步骤 1：确定 skill

询问用户："你在开发哪个 skill？" 这将成为所有产物路径中的 `<skill-name>`。

### 步骤 2：显示阶段状态

扫描已有产物并展示：

| 阶段 | 状态 | 产物 |
|-------|--------|----------|
| design | 已完成 / 未开始 | `TARGET_WORKSPACE/docs/specs/<skill-name>-design.md` |
| plan | 已完成 / 未开始 | `TARGET_WORKSPACE/docs/plans/<skill-name>-plan.md` |
| task | 已完成 / 未开始 | `TARGET_SKILL_DIR` 下的 Skill SKILL.md 及相关文件 |
| test | 已完成 / 未开始 | `TARGET_WORKSPACE/docs/test/<skill-name>-test-report.md` |
| review | 已完成 / 未开始 | `TARGET_WORKSPACE/docs/notes/<skill-name>-review.md` |
| feedback | 有待处理问题 / 无 | `TARGET_WORKSPACE/docs/notes/<skill-name>-feedback.md` |

同时扫描 `TARGET_WORKSPACE/docs/notes/<skill-name>-feedback.md` 中未解决的问题并展示。

### 步骤 3：询问阶段

"哪个阶段？（design / plan / task / test / review / feedback）"

### 步骤 4：检查入口条件

- `plan` → 设计文档必须存在。若不存在："没有设计文档的实现计划容易偏离方向——先用 design 阶段明确边界和范围"
- `task` → 计划文档必须存在。若不存在："没有实现计划就动手容易跑偏——先用 plan 阶段明确要做什么"
- `test` → task 输出必须存在。若不存在："没有实现产物就测试是在验证空气——先完成 task 阶段"
- `review` → 目标产物必须存在（询问用户要审查哪个阶段）。若不存在："没有产物可以审查——先完成对应阶段的输出"
- `feedback` → 无条件。询问用户是用户主动发起还是由 review/test 发现触发。

### 步骤 5：执行子 skill

读取 `ROUTER_SKILL_DIR/skill-lifecycle-<stage>/SKILL.md`。按其说明执行该阶段。不要通过 Skill 工具调用 —— 作为路由器直接执行。

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

## 熵管理

进入某个阶段时，扫描 `docs/notes/<skill-name>-feedback.md` 中针对该阶段的历史问题。提醒："上次 design 阶段有 X 个问题需要注意：..."

## 退出条件

生命周期在以下情况下终止：
- review 产生零 Critical + 零 Important 问题，且
- 用户接受结果（用户始终可以否决并继续迭代）

## 规则

1. 路由器，非执行器。读取子 skill 的 SKILL.md，按其说明执行。
2. 门禁检查仅验证存在性 —— 验证文件存在，不验证内容质量。
3. 自检声明是强制性的 —— 无声明 = 阶段未完成。
4. 一次一个问题 —— 不要批量提问。
5. 反馈循环：review 通过零 Critical+Important → 自动通过。用户保留否决权。
6. 不要对子 skill 调用 Skill 工具。直接执行它们。

## 常见错误

| 错误 | 纠正 |
|---------|-----|
| 自己执行 task | 读取子 skill SKILL.md，按其流程执行 |
| 跳过自检验证 | 检查 `## 自检` 及 `- [x]` 项目 |
| 跳过关卡检查 | 进入阶段前验证文件存在 |
| 批量提问 | 一次一个问题 |
| 忘记反馈扫描 | 进入阶段时检查 `notes/` 中的历史问题 |
