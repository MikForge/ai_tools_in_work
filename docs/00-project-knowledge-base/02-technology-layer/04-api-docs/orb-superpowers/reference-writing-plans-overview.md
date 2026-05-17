# writing-plans — 编写实施计划

> **来源**：[obra/superpowers/skills/writing-plans](https://github.com/obra/superpowers/tree/main/skills/writing-plans)
>
> **提取**：核心设计决策 + 完整工作流程

---

## 一、核心设计

### 1.1 根本理念

编写全面的实施计划，假定执行者对代码库零上下文且品味可疑。文档化他们需要的所有信息。

**开始声明**："I'm using the writing-plans skill to create the implementation plan."

### 1.2 保存位置

```
docs/superpowers/plans/YYYY-MM-DD-<feature-name>.md
```

---

## 二、范围检查

如果 spec 覆盖多个独立子系统，应在 brainstorming 阶段已分解。若非，建议拆分为多个计划——每个子系统一个。

---

## 三、文件结构

在定义任务前，先映射出哪些文件将创建或修改，以及每个文件的职责：

- 设计清晰边界和明确接口的单元
- 每个文件一个明确职责
- 偏好小文件而非大文件

---

## 四、任务拆分

每个任务包含：
- 精确的职责边界
- 需要修改的文件
- 实现步骤
- 如何验证

---

## 五、约束

| 约束 | 说明 |
| ---- | ---- |
| DRY | 不要重复 |
| YAGNI | 只做需要的 |
| TDD | 先测试后实现 |
| 频繁提交 | 每个可工作状态提交一次 |

---

## 来源

| 资源 | URL |
|------|-----|
| SKILL.md | https://raw.githubusercontent.com/obra/superpowers/main/skills/writing-plans/SKILL.md |
