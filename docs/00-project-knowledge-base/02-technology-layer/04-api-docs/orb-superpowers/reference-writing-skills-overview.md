# Writing Skills 设计与流程

> **来源**：[obra/superpowers/skills/writing-skills](https://github.com/obra/superpowers/tree/main/skills/writing-skills)
>
> **提取**：核心设计决策 + 完整工作流程

---

## 一、核心设计

### 1.1 根本理念

**Writing skills = TDD applied to process documentation。**

将测试驱动开发的 RED-GREEN-REFACTOR 循环完整映射到文档编写：

| TDD 概念 | Skill 创建 |
| -------- | --------- |
| **Test case** | 带 subagent 的压力场景 |
| **Production code** | Skill 文档（SKILL.md） |
| **Test fails (RED)** | Agent 无 skill 时违反规则（baseline） |
| **Test passes (GREEN)** | Agent 有 skill 后遵守规则 |
| **Refactor** | 关闭漏洞，维持合规 |
| **Write test first** | 写 skill 前先跑 baseline 场景 |
| **Watch it fail** | 记录 agent 使用的确切借口 |
| **Minimal code** | 只针对已观察到的违规写 skill |
| **Watch it pass** | 验证 agent 现在合规 |
| **Refactor cycle** | 发现新借口 → 堵上 → 重新验证 |

### 1.2 铁律

```
NO SKILL WITHOUT A FAILING TEST FIRST
```

### 1.3 设计原则

**如果在没有 skill 的情况下没有观察到 agent 失败，就无法知道 skill 是否教了正确的东西。**

---

## 二、设计决策

### 2.1 Description 格式约束（CSO）

**Description 只描述触发条件，不总结工作流。**

格式：以 "Use when..." 开头，third-person，含具体触发症状和场景。

### 2.2 Skill 类型与测试策略

| 类型 | 特征 | 示例 |
| ---- | ---- | ---- |
| Technique（操作指南） | 具体步骤和方法 | condition-based-waiting |
| Pattern（心智模型） | 思维方式和判断 | flatten-with-flags |
| Reference（文档/API） | 参考信息 | office docs |

### 2.3 目录结构

```
skills/skill-name/
├── SKILL.md
└── supporting-file.*
```

### 2.4 防规避机制

1. 显式关闭每个漏洞
2. 封堵"精神 vs 字面"论调
3. 构建合理化表格
4. 创建红旗列表

---

## 三、完整工作流程

### 阶段一：RED — 写失败测试

1. 创建压力场景
2. 不加载 skill 运行场景
3. 逐字记录 agent 的选择和合理化借口

### 阶段二：GREEN — 写最小 Skill

1. 编写 YAML frontmatter
2. Description 以 "Use when..." 开头
3. 正文针对 RED 阶段识别出的具体失败
4. 加载 skill 运行相同场景，验证合规

### 阶段三：REFACTOR — 关闭漏洞

1. 发现新借口 → 添加反驳 → 重新测试

### 阶段四：部署

- 每个 skill 独立测试，禁止批量创建
- 完成当前 skill 部署前不得开始下一个

---

## 来源

| 资源 | URL |
|------|-----|
| SKILL.md | https://raw.githubusercontent.com/obra/superpowers/main/skills/writing-skills/SKILL.md |
