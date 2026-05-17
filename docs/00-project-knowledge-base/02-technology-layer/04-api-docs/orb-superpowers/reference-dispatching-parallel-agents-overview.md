# dispatching-parallel-agents — 并行子代理调度

> 来源: [obra/superpowers/skills/dispatching-parallel-agents](https://github.com/obra/superpowers/tree/main/skills/dispatching-parallel-agents)

## 概述

在面临 2 个以上独立任务（无共享状态或顺序依赖）时，为每个独立问题域调度一个专用 agent 并行处理。

## 关键设计决策

- **隔离上下文**：每个子代理被分配精确构建的上下文，不继承父会话历史
- **并行效率**：不相关的故障无需串行调查
- **保留父上下文**：准确分配任务节省上下文用于协调

## 工作流程

1. 识别独立故障 → 2. 为每个领域创建一个 agent → 3. 调度执行 → 4. 整合结果

## 来源

- https://raw.githubusercontent.com/obra/superpowers/main/skills/dispatching-parallel-agents/SKILL.md
