# subagent-driven-development — 子代理驱动开发

> **来源**：[obra/superpowers/skills/subagent-driven-development](https://github.com/obra/superpowers/tree/main/skills/subagent-driven-development)
>
> **提取**：核心设计决策 + 完整工作流程

---

## 一、核心设计

### 1.1 根本理念

通过为每个任务分发全新子代理来执行计划，每次任务后执行两阶段审查：先规格合规审查，再代码质量审查。

**核心原则**：每个任务一个全新子代理 + 两阶段审查（规格→质量）= 高质量、快速迭代

**连续执行**：不在任务间暂停与用户沟通。直接执行完计划中的所有任务。

---

## 二、何时使用

```
有实施计划？
  ├─ 任务大多独立且留在当前会话？→ subagent-driven-development
  ├─ 任务大多独立但去新会话？→ executing-plans
  └─ 无计划？→ 先 brainstorm
```

---

## 三、工作流程

### 每个任务的执行

1. 创建全新子代理（`agent_open`）
2. 精确构造该任务的指令和上下文
3. 子代理执行任务
4. 子代理完成后：
   - 第一阶段：审查规格合规性
   - 第二阶段：审查代码质量
5. 必要时修正
6. 进入下一个任务

### 停止条件

- BLOCKED 状态无法自行解决
- 真正阻碍进度的歧义
- 所有任务完成

---

## 四、关键约束

- 子代理完成任务后上下文被释放
- 禁止在任务间问"应该继续吗"
- 两阶段审查不能合并为一个步骤

---

## 来源

| 资源 | URL |
|------|-----|
| SKILL.md | https://raw.githubusercontent.com/obra/superpowers/main/skills/subagent-driven-development/SKILL.md |
