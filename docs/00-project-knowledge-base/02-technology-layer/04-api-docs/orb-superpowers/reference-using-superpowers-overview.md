# using-superpowers — 使用 Superpowers

> **来源**：[obra/superpowers/skills/using-superpowers](https://github.com/obra/superpowers/tree/main/skills/using-superpowers)
>
> **提取**：核心设计决策 + 完整工作流程

---

## 一、核心设计

### 1.1 根本理念

建立如何查找和使用 skill 的规则。要求在响应前必须先调用 Skill 工具（包括澄清问题之前）。

### 1.2 铁律

```
IF A SKILL APPLIES TO YOUR TASK, YOU DO NOT HAVE A CHOICE. YOU MUST USE IT.
```

只要有 1% 的可能性某个 skill 适用，就绝对必须调用。

---

## 二、指令优先级

1. **用户明确指令**（CLAUDE.md、GEMINI.md、AGENTS.md、直接请求）— 最高优先级
2. **Superpowers skills** — 与默认系统行为冲突时覆盖
3. **默认系统提示** — 最低优先级

如果 CLAUDE.md 说"不使用 TDD"而某个 skill 说"始终使用 TDD"，遵循用户的指令。

---

## 三、如何访问 Skills

- 使用 Skill 工具调用 skill，它的内容被加载并呈现给你
- **禁止**用 Read 工具直接读取 skill 文件
- 子代理例外：如果作为子代理被调度执行特定任务，跳过此 skill

---

## 来源

| 资源 | URL |
|------|-----|
| SKILL.md | https://raw.githubusercontent.com/obra/superpowers/main/skills/using-superpowers/SKILL.md |
