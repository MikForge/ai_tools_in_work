---
name: managing-project-rules
description: Use when creating, editing, or organizing .claude/rules/ files — adding project constraints, deciding where to put a new rule, splitting or merging rules, or maintaining the rules index
---

# Managing Project Rules

## Overview

`.claude/rules/` 是条件规则目录。规则文件通过 frontmatter `globs` 按文件路径懒加载——编辑匹配 glob 的文件时，规则内容自动注入 AI 上下文。

## 决策框架：约束放哪里

| 约束类型 | 放哪里 | 触发方式 |
| --- | --- | --- |
| 项目全局概览、API 速查、规范索引 | `CLAUDE.md` | 始终加载 |
| 按文件路径触发的领域规范 | `.claude/rules/<domain>.md` | 匹配 glob 时加载 |
| 复杂多步审查任务 | `.claude/agents/<name>.md` | 通过 Agent 工具调用 |
| 机械性强制检查（阻止违规） | `.claude/hooks/<name>.sh` | PreToolUse/PostToolUse |

**关键判断**：能用 `hooks/` 机械检查的不用 `rules/`，审美的/判断性的才用 `rules/`。

## 创建 Rule

### 1. 先检查现有 rules

读取 `.claude/rules/` 下所有文件，确认：
- 新规则是否已部分被现有规则覆盖 → 追加到现有文件
- 新规则是否与现有规则冲突 → 需要协调

### 2. 确定文件名

kebab-case，描述领域：`core-module.md` / `ui-system.md` / `puremvc-patterns.md`

### 3. 写 frontmatter

```yaml
---
globs: assets/core/**/*    # 必填：匹配文件路径
---
```

`globs` 常用模式：
- `assets/core/**/*` — 整个 core 目录
- `assets/script/**/*` — 整个业务层
- `assets/script/game/view/**/*` — 特定子目录
- 多 glob：每行一个，或用逗号分隔

### 4. 写规则内容

- 标题明确领域：`# 核心层分层约束`
- 用简短表格、代码对比块（❌/✅），不用长段落
- 一条规则聚焦一个领域，不要塞进无关内容
- 写「做什么/不做什么」，不解释「为什么」（除非反直觉）

### 5. 同步索引

规则创建/删除后，必须更新两份索引：

**CLAUDE.md**「详细规范索引」表格：
```markdown
| 规范 | 文件 |
| --- | --- |
| ... | ... |
| 新规则描述 | `.claude/rules/new-rule.md` |
```

**`.claude/README.md`** rules 表格（逐条记录 glob 范围和说明）。

## 编辑 Rule

- 读完整现有规则再改
- 保持领域聚焦；如果新内容属于不同领域 → 新建文件
- 修改 glob 范围时同步更新 CLAUDE.md 和 README 的索引

## 常见错误

| 错误 | 正确做法 |
| --- | --- |
| 把详细规范塞进 CLAUDE.md | CLAUDE.md 只放概览和索引，详细规范放 rules/ |
| 忘记写 `globs` frontmatter | 没有 globs 的规则永远不会被加载 |
| 规则间内容重叠 | 创建前先检查现有 rules |
| 创建后不更新索引 | CLAUDE.md 和 .claude/README.md 都要同步 |
| 用 hooks/ 能做的事写成了 rule | 机械检查用 hook 脚本，节省上下文 |
