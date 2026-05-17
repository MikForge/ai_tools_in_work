# systematic-debugging — 系统化调试

> **来源**：[obra/superpowers/skills/systematic-debugging](https://github.com/obra/superpowers/tree/main/skills/systematic-debugging)
>
> **提取**：核心设计决策 + 完整工作流程

---

## 一、核心设计

### 1.1 根本理念

随机修复浪费时间并产生新 bug。快速修补掩盖深层问题。

**核心原则**：在尝试修复前 ALWAYS 找到根本原因。症状修复是失败。

### 1.2 铁律

```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
```

未完成 Phase 1，不能提出修复方案。

---

## 二、适用范围

| 适用 | 不适用 |
| ---- | ------ |
| 测试失败 | 已在其他地方系统化处理的问题 |
| 生产环境 bug | |
| 意外行为 | |
| 性能问题 | |

---

## 三、工作流程

### Phase 1：调查
1. 复现问题（最小化复现步骤）
2. 收集证据（日志、堆栈、指标）
3. 排除变量（逐一隔离可能原因）
4. 定位根本原因

### Phase 2：提出修复
1. 基于根本原因设计修复
2. 评估副作用
3. 向用户提出方案

### Phase 3：实施
1. 写测试覆盖
2. 实施修复
3. 验证原问题已解决
4. 回归测试

---

## 来源

| 资源 | URL |
|------|-----|
| SKILL.md | https://raw.githubusercontent.com/obra/superpowers/main/skills/systematic-debugging/SKILL.md |
