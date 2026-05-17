# verification-before-completion — 完成前验证

> **来源**：[obra/superpowers/skills/verification-before-completion](https://github.com/obra/superpowers/tree/main/skills/verification-before-completion)
>
> **提取**：核心设计决策 + 完整工作流程

---

## 一、核心设计

### 1.1 根本理念

不经验证声称工作完成是不诚实的，而不是效率。

**核心原则**：证据优先于断言，始终。

### 1.2 铁律

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

如果在本条消息中没有运行验证命令，就不能声称它通过。

违反字面规则即违反精神。

---

## 二、工作流程

### Gate 函数

```
BEFORE claiming any status or expressing satisfaction:

1. IDENTIFY: What command proves this claim?
2. RUN: Execute the FULL command (fresh, complete)
3. CONFIRM: Read output, verify pass/fail
4. CLAIM: Only then make any success statement
```

### 正确 vs 错误

| ❌ 错误做法 | ✅ 正确做法 |
| ----------- | ----------- |
| "测试应该通过了" | "运行 pytest - 测试通过 (15/15)" |
| "修复应该是有效的" | "运行验证 - 错误不再出现" |
| "我确认功能正常" | "测试输出显示 100% 通过" |

---

## 来源

| 资源 | URL |
|------|-----|
| SKILL.md | https://raw.githubusercontent.com/obra/superpowers/main/skills/verification-before-completion/SKILL.md |
