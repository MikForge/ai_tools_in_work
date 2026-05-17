---
name: skill-lifecycle-plan
description: 生命周期子 skill —— 从设计文档生成实现计划。内部使用，由 skill-lifecycle-router 调用。
disable-model-invocation: true
---

# Skill 生命周期 — 计划

## 概述

将设计文档转换为包含可独立执行步骤的具体实现计划。计划文档驱动 task 阶段。

**核心原则:** 设计 → 实现计划，分解为可独立执行的步骤。

## 路径约定

此子 skill 由根路由器执行。它继承：

- `ROUTER_SKILL_DIR`：根 `skill-lifecycle-router` 包目录的绝对路径。
- `TARGET_WORKSPACE`：生命周期产物所在工作区的绝对路径。
- `TARGET_SKILL_DIR`：正在创建或修改的 skill 所在目录的绝对路径（如适用）。

不要从当前工作目录解析路由器拥有的文件。不要对路由器拥有的文件或生命周期产物使用父级相对 docs 路径。

## 入口条件

设计文档必须存在。路由器在转发前检查此项。若缺失，返回 design 阶段。

## 流程

1. 从 `TARGET_WORKSPACE/docs/specs/<skill-name>-design.md` 读取设计文档
2. 将每个设计组件映射为实现任务
3. 每个任务必须可独立执行（一个操作，2-5 分钟）
4. 包含精确的文件路径、完整代码、精确的命令及预期输出
5. 将计划文档写入 `TARGET_WORKSPACE/docs/plans/<skill-name>-plan.md`
6. 在宣告完成之前运行自检

## 自检

- [ ] 计划文件存在于 `TARGET_WORKSPACE/docs/plans/<skill-name>-plan.md`
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

## 参考

从 `writing-plans` skill 中汲取方法论 —— 任务粒度、无占位符、精确路径。
