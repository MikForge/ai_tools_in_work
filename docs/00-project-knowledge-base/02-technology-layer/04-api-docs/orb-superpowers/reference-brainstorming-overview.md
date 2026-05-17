# brainstorming — 头脑风暴设计

> **来源**：[obra/superpowers/skills/brainstorming](https://github.com/obra/superpowers/tree/main/skills/brainstorming)
>
> **提取**：核心设计决策 + 完整工作流程

---

## 一、核心设计

### 1.1 根本理念

帮助将想法通过自然协作对话转化为完整的设计和规格文档。

### 1.2 铁律

```
DO NOT invoke any implementation skill, write any code, scaffold any 
project, or take any implementation action until you have presented a 
design and the user has approved it.
```

适用于所有项目，无论感知到的复杂度如何。

### 1.3 反模式

| 反模式 | 说明 |
| ------ | ---- |
| "过于简单无需设计" | 简单项目隐藏最隐蔽的假设，必须走设计流程 |

---

## 二、设计决策

### 2.1 Hard Gate

在所有实现操作（调用 skill、写代码、scaffold）之前必须先完成设计并获得批准。

### 2.2 范围分解

如果请求描述多个独立子系统，立即标记。先分解为子项目，再对第一个子项目走正常设计流程。每个子项目有自己的 spec → plan → implementation 循环。

### 2.3 提问策略

- 每次一个问题，一个问题搞定后再问下一个
- 优先用多选问题
- 理解目的、约束、成功标准

### 2.4 方案探索

- 每次提出 2-3 个不同方案及取舍
- 以推荐方案开头并解释理由

### 2.5 设计呈现

- 按复杂度缩放每节篇幅
- 每节完成后问"这里对吗"
- 覆盖：架构、组件、数据流、错误处理、测试

### 2.6 隔离与清晰

- 将系统拆分为每个单一职责的小单元
- 每个单元通过明确接口通信

---

## 二、完整工作流程

### 阶段一：探索上下文

检查文件、文档、最近提交。

### 阶段二：逐问澄清

一次一个问题，理解目的、约束、成功标准。

### 阶段三：提出方案

提出 2-3 个方案及取舍，推荐其一。

### 阶段四：按节呈现设计

按复杂度缩放每节，逐节获得用户确认。

### 阶段五：写入设计文档

```
docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md
```

### 阶段六：自检

占位符扫描、内部一致性、范围检查、歧义检查。

### 阶段七：用户审阅

### 阶段八：转入实施

调用 writing-plans skill。

---

## 来源

| 资源 | URL |
|------|-----|
| SKILL.md | https://raw.githubusercontent.com/obra/superpowers/main/skills/brainstorming/SKILL.md |
