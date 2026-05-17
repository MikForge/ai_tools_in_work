---
name: skill-lifecycle-feedback
description: Use when review or test stages discover issues in skill lifecycle artifacts that must be captured as structured feedback with severity classification, source tracking, and a target return stage for the router to route back to
---

# Skill 生命周期 — 反馈

## 概述

记录用户、review 或 test 阶段发现的问题，标注严重度、来源和回流目标阶段，并为 router 提供下一步修复决策依据。

**核心原则：** 反馈是结构化路由信号；每条反馈都必须说明问题是什么、为什么重要、应回流到哪个阶段处理。

## 语言

- 默认输出语言：zh-CN。
- 保留原文的术语：`SKILL.md`、`name`、`description`、frontmatter、路径根名称、代码标识符、YAML 字段、阶段名、平台名称。
- 生命周期阶段名保持原文：`design`、`plan`、`task`、`test`、`review`、`feedback`。
- 用户明确指定输出语言时，以用户要求为准。

## 路径声明

- 默认相对基准：除目标工作区产物外，所有路径均相对于当前 `SKILL.md` 所在目录（`skill-lifecycle-feedback/`）。
- router 根目录：[..](..)，相对基准为当前 `SKILL.md` 所在目录，用于定位约束文档。
- 约束文档（技能编写）：[skill-constrains.md](../docs/constraints/skill-constrains.md)，相对基准为当前 `SKILL.md` 所在目录，写入反馈前必须读取。
- 反馈格式约束：[feedback-note-constraints.md](../docs/constraints/feedback-note-constraints.md)，相对基准为当前 `SKILL.md` 所在目录，格式化反馈条目时读取。
- 目标工作区：由 router 传入的相对基准，用于解析反馈记录和产物路径。不在技能正文中写绝对路径。

规则：
- 所有路径必须使用本章节声明的相对基准。
- 后续路径引用必须使用 markdown 链接语法 `[描述](相对路径)`。
- 不得依赖 cwd、`./`、`../` 或父级相对路径推断文件位置。
- 不得重绑定 router 或上游阶段已经声明的相对基准。

## 索引

- 反馈格式约束（必读）：[feedback-note-constraints.md](../docs/constraints/feedback-note-constraints.md)，写入反馈记录前必须读取，路径见 `## 路径声明`。
- 反馈产物目录：目标工作区下的 `docs/notes/`，反馈记录写入 `<skill-name>-feedback.md`，相对基准由 router 传入。
- 当前技能目录：本 `SKILL.md` 所在目录，仅用于定位本技能自带配置或支持文件。

## 适用场景

适用：
- 用户在 router 中选择 `feedback` 阶段，并提供针对某个 skill 或阶段的问题。
- `review` 报告中存在需要修复的问题，需要转成结构化反馈记录。
- `test` 报告中存在失败、缺口或风险，需要回流到上游阶段。
- router 需要汇总待处理问题，并询问用户回到目标阶段修复还是接受继续。

不适用：
- 只需要创建设计文档时，使用 `design` 阶段。
- 只需要执行计划、任务或测试时，使用对应阶段。
- review/test 已完全通过且没有待处理问题时，不生成新的反馈记录。

## 核心模式

反馈阶段将非结构化问题转换为可回流的反馈条目：

| 输入来源 | 必须产出 | 回流目标 |
| ---- | ---- | ---- |
| 用户描述 | 严重度、来源、目标阶段、描述 | 用户指定或根据问题归因判断 |
| review 报告 | 每个发现对应一条反馈 | `design`、`plan`、`task` 或 `test` |
| test 报告 | 每个失败或风险对应一条反馈 | `design`、`plan`、`task` 或 `test` |

严重度规则：

| 严重度 | 含义 |
| ---- | ---- |
| 严重 | 阻断、破坏正确性、安全风险或会导致下游无法继续 |
| 重要 | 缺失、错误、不足或会造成明显返工 |
| 轻微 | 风格、措辞、局部优化或非阻断改进 |

回流目标规则：

| 问题类型 | 回流目标阶段 |
| ---- | ---- |
| 目标、边界、非目标、触发条件错误 | `design` |
| 任务拆分、顺序、依赖、验收标准错误 | `plan` |
| 实现、文档落地、文件变更错误 | `task` |
| 测试策略、测试覆盖、验证方式错误 | `test` |

## 快速参考

| 项目 | 值 |
| ---- | ---- |
| 格式约束 | [feedback-note-constraints.md](../docs/constraints/feedback-note-constraints.md) |
| 反馈记录路径 | 目标工作区 `docs/notes/<skill-name>-feedback.md` |
| 写入策略 | 追加，不覆盖 |
| 允许来源 | `review`、`test`、`self-check`、`user` |
| 回流目标 | `design`、`plan`、`task`、`test` |

## 实施步骤

### 用户发起

1. 确认反馈针对的 `<skill-name>`。
2. 确认问题目标阶段：`design`、`plan`、`task` 或 `test`。
3. 读取用户描述，提取问题标题、描述、涉及文件和行号。
4. 若用户未指定严重度，根据严重度规则分配 `严重`、`重要` 或 `轻微`。
5. 读取 [feedback-note-constraints.md](../docs/constraints/feedback-note-constraints.md)，按约束格式化反馈条目。
6. 将反馈条目追加到 目标工作区 `docs/notes/<skill-name>-feedback.md`。
7. 返回 router，说明问题数量、最高严重度和建议回流目标阶段。

### 自动触发

1. 接收 router 传入的 `review` 或 `test` 报告。
2. 从报告的问题、失败、风险或缺口章节中提取每个独立问题。
3. 为每个问题标注来源：`review` 或 `test`。
4. 根据严重度规则和回流目标规则标注严重度与目标阶段。
5. 读取 [feedback-note-constraints.md](../docs/constraints/feedback-note-constraints.md)，按约束格式化反馈条目。
6. 将反馈条目追加到 目标工作区 `docs/notes/<skill-name>-feedback.md`，不得覆盖已有反馈。
7. 返回 router，说明按严重度分类的问题数量和建议下一阶段。

反馈记录格式遵循 [feedback-note-constraints.md](../docs/constraints/feedback-note-constraints.md)：

```markdown
# 反馈说明：<skill-名称>

## 问题

### <问题标题>
- **严重度：** 严重 | 重要 | 轻微
- **来源：** review | test | self-check | user
- **回流目标阶段：** design | plan | task | test
- **描述：** <发现什么以及为什么重要>
- **文件：** <路径:行号，如适用>
```

## 常见错误

| 错误 | 纠正 |
| ---- | ---- |
| 覆盖已有反馈记录 | 追加新问题，保留历史反馈 |
| 只写问题描述，不写回流阶段 | 每条反馈都必须标注 `design`、`plan`、`task` 或 `test` |
| 使用旧严重度 `Critical/Important/Minor` | 使用 `严重`、`重要`、`轻微` |
| 使用裸路径 `docs/notes/...` | 使用 `## 路径声明` 中声明的相对基准 + markdown 链接，如目标工作区 `docs/notes/<skill-name>-feedback.md` |
| 把 review/test 整份报告原样粘贴 | 提取独立问题并结构化 |
| 遇到无法归因的问题仍强行写入 | 先标注不确定点并交给 router 或用户确认 |

## 自检

在返回 router 前逐项检查：

- [ ] 已读取 [feedback-note-constraints.md](../docs/constraints/feedback-note-constraints.md)
- [ ] 反馈记录写入 目标工作区 `docs/notes/<skill-name>-feedback.md`
- [ ] 写入策略为追加，不覆盖
- [ ] 每条问题包含严重度、来源、回流目标阶段、描述
- [ ] 严重度使用 `严重`、`重要` 或 `轻微`
- [ ] 回流目标阶段是 `design`、`plan`、`task` 或 `test`
- [ ] 所有路径均使用 `## 路径声明` 中声明的路径根

验证通过后，在反馈记录末尾追加自检声明：

```markdown
## 自检
- [x] 每条问题标注了严重度
- [x] 每条问题标注了来源
- [x] 每条问题标注了回流目标阶段
- [x] 反馈记录采用追加写入
```
