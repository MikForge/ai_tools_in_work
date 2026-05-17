# dispatching-parallel-agents — 并行子代理调度

> **来源**：[obra/superpowers/skills/dispatching-parallel-agents](https://github.com/obra/superpowers/tree/main/skills/dispatching-parallel-agents)
>
> **提取**：核心设计决策 + 完整工作流程

---

## 一、核心设计

### 1.1 根本理念

你作为协调者将任务委托给具有隔离上下文的专用 agent。通过精确构建它们的指令和上下文，确保它们专注并成功完成任务。

**核心原则**：按独立问题域分发一个 agent，让它们并行工作。

### 1.2 何时使用

```
多故障？
  ├─ 相关（同一子系统）→ 单 agent 调查全部
  └─ 独立？
       ├─ 可以并行？→ 并行分发
       └─ 需要串行？→ 串行 agent
```

---

## 二、设计决策

| 决策 | 说明 |
| ---- | ---- |
| **隔离上下文** | 子代理不应继承父会话的上下文或历史 |
| **并行效率** | 多个不相关故障串行调查浪费时间 |
| **上下文保留** | 精确分配任务节省父上下文用于协调 |

---

## 三、工作流程

1. 识别独立故障/任务集
2. 为每个问题域创建一个专用 agent
3. 精确构造每个 agent 的指令和上下文
4. 并行调度执行
5. 整合各 agent 结果

---

## 来源

| 资源 | URL |
|------|-----|
| SKILL.md | https://raw.githubusercontent.com/obra/superpowers/main/skills/dispatching-parallel-agents/SKILL.md |
