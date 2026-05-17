# receiving-code-review — 接收代码审查

> **来源**：[obra/superpowers/skills/receiving-code-review](https://github.com/obra/superpowers/tree/main/skills/receiving-code-review)
>
> **提取**：核心设计决策 + 完整工作流程

---

## 一、核心设计

### 1.1 根本理念

代码审查需要技术评估，而非情绪表演。

**核心原则**：实施前验证。假设前询问。技术正确性优先于社交舒适。

### 1.2 铁律

```
VERIFY before implementing.
ASK before assuming.
Technical correctness over social comfort.
```

---

## 二、响应模式

```
WHEN receiving code review feedback:

1. READ: Complete feedback without reacting
2. UNDERSTAND: Restate requirement in own words (or ask)
3. VERIFY: Check against codebase reality
4. EVALUATE: Technically sound for THIS codebase?
5. RESPOND: Technical acknowledgment or reasoned pushback
6. IMPLEMENT: One item at a time, test each
```

---

## 三、禁止回应

| 禁止模式 | 说明 |
| -------- | ---- |
| "You're absolutely right!" | 无审慎回应的模式化同意 |
| "Good catch!" | 未验证就接受 |
| "Let me fix that" | 未评估就实施 |
| 立即实施 | 跳过评估步骤 |
| 表演性同意 | 为社交舒适而非技术正确 |

---

## 四、验证清单

在实施任何反馈前：
- [ ] 这个建议在代码库实际上下文中有效吗？
- [ ] 是否存在未被提及的权衡？
- [ ] 是否有更好的解决方案？
- [ ] 这个改变会引入新问题吗？

---

## 来源

| 资源 | URL |
|------|-----|
| SKILL.md | https://raw.githubusercontent.com/obra/superpowers/main/skills/receiving-code-review/SKILL.md |
