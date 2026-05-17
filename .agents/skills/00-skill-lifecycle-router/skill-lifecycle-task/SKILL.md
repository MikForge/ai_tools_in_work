---
name: skill-lifecycle-task
description: 生命周期子 skill —— 执行计划步骤并生成 skill 产物。内部使用，由 skill-lifecycle-router 调用。
disable-model-invocation: true
---

# Skill 生命周期 — 任务

## 概述

逐步执行实现计划，生成目标 skill 的 SKILL.md 及相关文件。每个计划步骤对应一个具体输出。

**核心原则:** 执行计划，产出 skill 产物。

## 路径约定

此子 skill 由根路由器执行。它继承：

- `ROUTER_SKILL_DIR`：根 `skill-lifecycle-router` 包目录的绝对路径。
- `TARGET_WORKSPACE`：生命周期产物所在工作区的绝对路径。
- `TARGET_SKILL_DIR`：正在创建或修改的 skill 所在目录的绝对路径（如适用）。

不要从当前工作目录解析路由器拥有的文件。不要对路由器拥有的文件或生命周期产物使用父级相对 docs 路径。

## 入口条件

计划文档必须存在。路由器在转发前检查此项。若缺失，返回 plan 阶段。

## 流程

1. 从 `TARGET_WORKSPACE/docs/plans/<skill-name>-plan.md` 读取计划文档
2. 按顺序执行每个计划步骤
3. 在 `TARGET_SKILL_DIR` 下生成产物：SKILL.md、zh-CN.md、脚本、模板（按计划定义）
4. 每完成一个步骤后提交（频繁提交）
5. 在宣告完成之前运行自检

## 自检

- [ ] 每个计划步骤都有对应输出
- [ ] 无跳过或部分完成的步骤
- [ ] 所有生成的文件在其指定路径下存在于 `TARGET_SKILL_DIR`

## 输出

在最后生成的产物末尾追加自检声明：

```markdown
## 自检
- [x] 所有计划步骤已执行
- [x] 所有文件已在指定路径生成
- [x] 无跳过步骤
```

## 参考

从 `executing-plans` skill 中汲取方法论 —— 逐步执行、频繁提交。
