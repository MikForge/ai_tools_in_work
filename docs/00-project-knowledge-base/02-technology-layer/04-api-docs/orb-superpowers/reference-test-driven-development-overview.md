# test-driven-development — 测试驱动开发

> **来源**：[obra/superpowers/skills/test-driven-development](https://github.com/obra/superpowers/tree/main/skills/test-driven-development)
>
> **提取**：核心设计决策 + 完整工作流程

---

## 一、核心设计

### 1.1 根本理念

先写测试，观察失败，再写最小代码通过。

**核心原则**：如果没有观察测试失败，就无法确认测试是否测对了东西。

**违反字面规则即违反精神。**

### 1.2 铁律

```
WRITE TEST FIRST → WATCH IT FAIL → MINIMAL CODE TO PASS
```

---

## 二、何时使用

### 必须使用

| 场景 | 说明 |
| ---- | ---- |
| 新功能 | 任何新增行为 |
| Bug 修复 | 先写测试复现 bug |
| 重构 | 确保行为不变 |
| 行为变更 | 任何行为变化 |

### 例外（需询问用户）

| 场景 | 理由 |
| ---- | ---- |
| 一次性原型 | 不保留 |
| 生成代码 | 非手工编写 |
| 配置文件 | 非逻辑行为 |

---

## 三、工作流程

### RED：写失败测试
1. 写一个测试
2. 运行并确认失败
3. 确认测试测试了正确的东西

### GREEN：写最小代码
1. 写刚好让测试通过的最小代码
2. 不做额外设计
3. 运行并确认通过

### REFACTOR：重构
1. 清理代码
2. 保持测试通过
3. 不改变外部行为

---

## 来源

| 资源 | URL |
|------|-----|
| SKILL.md | https://raw.githubusercontent.com/obra/superpowers/main/skills/test-driven-development/SKILL.md |
