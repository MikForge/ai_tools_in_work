# verification-before-completion — 完成前验证

> 来源: [obra/superpowers/skills/verification-before-completion](https://github.com/obra/superpowers/tree/main/skills/verification-before-completion)

## 概述

在即将声称工作已完成、已修复或测试通过时使用，在提交或创建 PR 之前必须运行验证命令并确认输出。

## 关键设计决策

- **铁律**：没有当前的验证证据禁止声称完成。证据优先于断言
- **违反字面规则即违反精神**：将声称完成而不验证等同于不诚实
- **主动识别验证方式**：不是等到需要验证时才想验证命令，而是在实施前就识别

## 工作流程

1. 识别验证命令 → 2. 完整执行命令 → 3. 确认输出 → 4. 再声称完成

## 来源

- https://raw.githubusercontent.com/obra/superpowers/main/skills/verification-before-completion/SKILL.md
