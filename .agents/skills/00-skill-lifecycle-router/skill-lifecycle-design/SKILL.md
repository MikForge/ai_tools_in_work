---
name: skill-lifecycle-design
description: 生命周期子 skill —— 为 skill 创建设计文档。内部使用，由 skill-lifecycle-router 调用。
disable-model-invocation: true
---

# Skill 生命周期 — 设计

## 概述

产出一份设计文档，定义要构建什么、其边界和范围。设计文档是所有下游阶段（plan、task、test、review）的权威参考。

**核心原则:** 决定是否构建，定义边界和范围，然后产出设计文档。

## 路径约定

此子 skill 由根路由器执行。它继承：

- `ROUTER_SKILL_DIR`：根 `skill-lifecycle-router` 包目录的绝对路径。
- `TARGET_WORKSPACE`：生命周期产物所在工作区的绝对路径。
- `TARGET_SKILL_DIR`：正在创建或修改的 skill 所在目录的绝对路径（如适用）。

不要从当前工作目录解析路由器拥有的文件。不要对路由器拥有的文件或生命周期产物使用父级相对 docs 路径。

## 流程

1. 阅读相关规范或参考资料以理解问题域和已有模式
2. 澄清问题：这个 skill 解决什么问题？没有它会发生什么？
3. 定义范围：哪些在范围内，哪些在范围外。明确列出非目标。
4. 设计方案：架构、组件、数据流、错误处理
5. 将设计文档写入 `TARGET_WORKSPACE/docs/specs/<skill-name>-design.md`
6. 在宣告完成之前运行自检

## 自检

在宣告完成之前，验证：
- [ ] 设计文档存在于 `TARGET_WORKSPACE/docs/specs/<skill-name>-design.md`
- [ ] 无 "TBD" 或 "TODO" 占位符
- [ ] 无相互矛盾的断言（在一个章节说 X，在另一个章节说非 X）

## 输出

在设计文档末尾追加自检声明：

```markdown
## 自检
- [x] 设计文档存在
- [x] 无 "TBD" / "TODO" 占位符
- [x] 无相互矛盾的断言
```

## 参考

从 `brainstorming` 和 `writing-skills` skill 中汲取方法论 —— 但以本生命周期的格式产出输出，而非它们的格式。
