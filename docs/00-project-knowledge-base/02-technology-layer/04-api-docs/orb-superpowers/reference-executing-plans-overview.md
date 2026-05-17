# executing-plans — 执行实施计划

> **来源**：[obra/superpowers/skills/executing-plans](https://github.com/obra/superpowers/tree/main/skills/executing-plans)
>
> **提取**：核心设计决策 + 完整工作流程

---

## 一、核心设计

### 1.1 根本理念

加载计划、批判性审阅、执行所有任务、完成时报告。

**开始声明**："I'm using the executing-plans skill to implement this plan."

### 1.2 平台推荐

如果平台支持子代理（如 Claude Code、Codex），应使用 `subagent-driven-development` 替代。

---

## 二、工作流程

### Step 1：加载并审阅计划

1. 读取计划文件
2. 批判性审阅——识别对计划的疑问或关切
3. 如果有疑虑：在执行前向用户提出
4. 无疑虑：创建 TodoWrite 并开始

### Step 2：执行任务

对每个任务：
1. 标记为 in_progress
2. 精确遵循每个步骤
3. 按要求运行验证
4. 标记为 completed

### Step 3：报告完成

明确声明所有任务已完成，记录任何偏差。

---

## 三、关键约束

- 加载计划后必须先审阅后执行
- 逐任务提交状态，不跳过验证
- 平台支持子代理时优先使用 subagent-driven-development

---

## 来源

| 资源 | URL |
|------|-----|
| SKILL.md | https://raw.githubusercontent.com/obra/superpowers/main/skills/executing-plans/SKILL.md |
