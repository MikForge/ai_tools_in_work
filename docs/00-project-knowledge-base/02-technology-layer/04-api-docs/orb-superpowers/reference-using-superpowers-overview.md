# using-superpowers — 使用 Superpowers

> 来源: [obra/superpowers/skills/using-superpowers](https://github.com/obra/superpowers/tree/main/skills/using-superpowers)

## 概述

在开始任何对话时使用。建立如何查找和使用 skill 的规则，要求在响应前必须先调用 Skill 工具（包括澄清问题之前）。

## 关键设计决策

- **必须使用**：只要有 1% 的可能性某个 skill 适用，就绝对必须调用
- **子代理例外**：如果作为子代理被调度执行特定任务，跳过此 skill
- **优先级规则**：用户明确指令 > Superpowers skills > 默认系统提示
- **不通过 READ 直接访问**：必须使用 Skill 工具加载，禁止 Read 工具直接读取 skill 文件

## 核心约束

- 如果某个 skill 适用于任务，没有选择的余地
- 不可以合理化为由绕过 skill 调用

## 来源

- https://raw.githubusercontent.com/obra/superpowers/main/skills/using-superpowers/SKILL.md
