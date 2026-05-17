---
name: skill-lifecycle-review
description: 生命周期子 skill —— 结构化产物审查，包含模式一致性检查。内部使用，由 skill-lifecycle-router 调用。
disable-model-invocation: true
---

# Skill 生命周期 — 审查

## 概述

对生命周期产物（设计文档、计划文档、task 输出、测试报告）进行结构化审查。根据产物类型从 `ROUTER_SKILL_DIR/docs/constraints/` 读取对应的约束检查清单。每个发现按严重度分类，并通过反馈循环路由回对应阶段。

**核心原则:** 审查产物，而非作者。检查正确性和模式一致性。问题通过反馈回流。

## 路径约定

此子 skill 由根路由器执行。它继承：

- `ROUTER_SKILL_DIR`：根 `skill-lifecycle-router` 包目录的绝对路径。
- `TARGET_WORKSPACE`：生命周期产物所在工作区的绝对路径。
- `TARGET_SKILL_DIR`：正在创建或修改的 skill 所在目录的绝对路径（如适用）。

不要从当前工作目录解析路由器拥有的文件。不要对路由器拥有的文件或生命周期产物使用父级相对 docs 路径。

## 入口条件

目标产物必须存在。用户指定要审查哪个阶段的产物。路由器在转发前检查文件是否存在。

## 流程

1. 询问用户要审查哪个产物（design / plan / task / test）
2. 从 `ROUTER_SKILL_DIR/docs/constraints/` 读取对应的约束文件：
   - `design-constraints.md` 用于设计文档
   - `plan-constraints.md` 用于计划文档
   - `task-constraints.md` 用于 task 输出
   - `test-constraints.md` 用于测试报告
3. 读取目标产物
4. 对每个检查项，判定：通过 或 发现问题
5. 对每个问题，记录：
   - 严重度：Critical（损坏/bug/安全） / Important（缺失/错误/较差） / Minor（风格/细节）
   - 回流目标阶段：design / plan / task / test
   - 文件位置：path:line
   - 问题描述：哪里有问题以及为什么重要
6. 包含模式一致性检查：此产物是否遵循项目既定模式？是否引入了新的结构模式？
7. 将审查报告写入 `TARGET_WORKSPACE/docs/notes/<skill-name>-review.md`

## 审查报告格式

```markdown
# 审查报告: <skill-name>

**审查的产物:** <path>
**约束检查清单:** ROUTER_SKILL_DIR/docs/constraints/<artifact-type>-constraints.md

## 优点
[哪些做得好？具体说明。]

## 问题

### <问题标题>
- **严重度:** Critical | Important | Minor
- **回流目标阶段:** design | plan | task | test
- **文件:** <path:line>
- **问题:** <描述>
- **影响:** <影响>

## 模式一致性
[模式一致性检查结果。是否有新的结构模式？它们是否符合项目约定？]

## 评估
[整体就绪程度。若零 Critical + 零 Important → 自动通过。]
```

## 自检

- [ ] 审查报告存在
- [ ] 每条发现标注了严重度和回流目标阶段
- [ ] 包含模式一致性检查结论
- [ ] 给出明确的整体评估

## 输出

审查报告以自检声明结尾：

```markdown
## 自检
- [x] 审查报告存在
- [x] 每条发现标注了严重度和回流目标阶段
- [x] 包含模式一致性检查结论
- [x] 整体评估明确
```
