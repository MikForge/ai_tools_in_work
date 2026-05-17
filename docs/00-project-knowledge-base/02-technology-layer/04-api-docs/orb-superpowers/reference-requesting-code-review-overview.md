# requesting-code-review — 请求代码审查

> **来源**：[obra/superpowers/skills/requesting-code-review](https://github.com/obra/superpowers/tree/main/skills/requesting-code-review)
>
> **提取**：核心设计决策 + 完整工作流程

---

## 一、核心设计

### 1.1 根本理念

调度代码审查子代理在问题级联前捕获问题。审查者获得精确构建的工作产物上下文。

**核心原则**：尽早审查，频繁审查。

---

## 二、触发时机

### 必须审查

| 时机 | 说明 |
| ---- | ---- |
| subagent-driven-development 每个任务后 | 每次调度完成后 |
| 完成主要功能后 | 功能可工作后 |
| 合并到主分支前 | 最后检查 |

### 可选但有价值

| 时机 | 说明 |
| ---- | ---- |
| 卡住时 | 新视角可能帮助突破 |
| 重构前 | 基线检查 |
| 修复复杂 bug 后 | 确认修复没有引入新问题 |

---

## 三、工作流程

1. 获取 git SHA：`BASE_SHA=$(git rev-parse HEAD~1)` `HEAD_SHA=$(git rev-parse HEAD)`
2. 调度审查子代理，提供 BASE_SHA 和 HEAD_SHA
3. 明确审查范围
4. 审查者聚焦工作产物，而非思考过程

---

## 来源

| 资源 | URL |
|------|-----|
| SKILL.md | https://raw.githubusercontent.com/obra/superpowers/main/skills/requesting-code-review/SKILL.md |
