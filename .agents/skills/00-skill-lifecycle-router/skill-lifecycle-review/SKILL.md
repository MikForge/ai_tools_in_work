---
name: skill-lifecycle-review
description: Use when a lifecycle artifact such as a design document, plan document, task output, or test report needs structured review against constraint checklists with severity-classified findings and return-stage routing
---

# Skill 生命周期 — 审查

## 概述

对生命周期产物（设计文档、计划文档、task 输出、测试报告）进行结构化审查。根据产物类型从 router 目录 `docs/constraints/` 读取对应的约束检查清单。每个发现按严重度分类，并通过反馈循环路由回对应阶段。

**核心原则:** 审查产物，而非作者。检查正确性和模式一致性。问题通过反馈回流。

## 语言

- 默认输出语言：zh-CN。
- 保留原文的术语：`SKILL.md`、`name`、`description`、frontmatter、路径根名称、代码标识符、YAML 字段、阶段名、平台名称。
- 审查严重度术语：`严重`、`重要`、`轻微`。
- 生命周期阶段名保持原文：`design`、`plan`、`task`、`test`、`review`、`feedback`。
- 用户明确指定输出语言时，以用户要求为准。

## 路径声明

- 默认相对基准：除目标工作区产物外，所有路径均相对于当前 `SKILL.md` 所在目录（`skill-lifecycle-review/`）。
- router 根目录：[..](..)，相对基准为当前 `SKILL.md` 所在目录，用于定位约束文档。
- 约束文档：[skill-constrains.md](../docs/constraints/skill-constrains.md)，相对基准为当前 `SKILL.md` 所在目录，审查前必须读取。
- 约束检查清单：位于 router 目录下的 `docs/constraints/`，按产物类型读取对应文件。
- 目标工作区：由 router 传入的相对基准，用于解析待审查产物和写入审查报告。不在技能正文中写绝对路径。
- 目标技能目录：由 router 传入的相对路径，相对基准为目标工作区根目录。

规则：
- 所有路径必须使用本章节声明的相对基准。
- 后续路径引用必须使用 markdown 链接语法 `[描述](相对路径)`。
- 不得依赖 cwd、`./`、`../` 或父级相对路径推断文件位置。

## 索引

- 约束文档（必读）：[skill-constrains.md](../docs/constraints/skill-constrains.md)，审查前必须读取以了解通用约束。
- 约束检查清单：按产物类型从 router 目录 `docs/constraints/` 读取对应的 `*-constraints.md`。
- 待审查产物：由用户指定（design/plan/task/test），位于目标工作区对应目录下。
- 审查报告：写入目标工作区 `docs/notes/<skill-name>-review.md`，相对基准由 router 传入。

## 适用场景

适用：
- router 判定进入 review 阶段，且待审查产物已存在。
- 需要对设计文档、计划文档、task 输出或测试报告进行结构化审查。

不适用：
- 待审查产物不存在（应先完成对应阶段的输出）。
- 只需要快速检查而非正式审查（使用对应子技能的自检即可）。

## 核心模式

审查产物，而非作者。检查正确性和模式一致性。每个发现标注严重度和回流目标阶段，问题通过反馈循环回流。

入口条件：目标产物必须存在。用户指定要审查哪个阶段的产物。router 在转发前检查文件是否存在。

审查流程：读取约束清单 → 读取产物 → 逐项判定（通过/发现问题） → 模式一致性检查 → 写入审查报告 → 自检。

严重度定义：

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
| 约束文档 | [skill-constrains.md](../docs/constraints/skill-constrains.md) |
| 审查报告路径 | 目标工作区 `docs/notes/<skill-name>-review.md` |
| 严重度 | `严重`、`重要`、`轻微` |
| 回流目标 | `design`、`plan`、`task`、`test` |
| 通过条件 | 零严重 + 零重要 |

## 实施步骤

1. 询问用户要审查哪个产物（design / plan / task / test）
2. 从 router 目录 `docs/constraints/` 读取对应的约束文件：
   - `design-constraints.md` 用于设计文档
   - `plan-constraints.md` 用于计划文档
   - `task-constraints.md` 用于 task 输出
   - `test-constraints.md` 用于测试报告
3. 读取目标产物
4. 对每个检查项，判定：通过 或 发现问题
5. 对每个问题，记录：
   - 严重度：严重（损坏/bug/安全） / 重要（缺失/错误/较差） / 轻微（风格/细节）
   - 回流目标阶段：design / plan / task / test
   - 文件位置：path:line
   - 问题描述：哪里有问题以及为什么重要
6. 包含模式一致性检查：此产物是否遵循项目既定模式？是否引入了新的结构模式？
7. 将审查报告写入目标工作区 `docs/notes/<skill-name>-review.md`

## 审查报告格式

```markdown
# 审查报告: <skill-name>

**审查的产物:** <path>
**约束检查清单:** router 目录 docs/constraints/<artifact-type>-constraints.md

## 优点
[哪些做得好？具体说明。]

## 问题

### <问题标题>
- **严重度:** 严重 | 重要 | 轻微
- **回流目标阶段:** design | plan | task | test
- **文件:** <path:line>
- **问题:** <描述>
- **影响:** <影响>

## 模式一致性
[模式一致性检查结果。是否有新的结构模式？它们是否符合项目约定？]

## 评估
[整体就绪程度。若零 严重 + 零 重要 → 自动通过。]
```

## 常见错误

| 错误 | 纠正 |
| ---- | ---- |
| 只写问题不写严重度 | 每个发现必须标注严重度 |
| 使用英文严重度 `Critical/Important/Minor` | 使用中文 `严重`、`重要`、`轻微` |
| 审查报告不标注回流目标阶段 | 每个问题必须指定回流到 `design`/`plan`/`task`/`test` |
| 遗漏模式一致性检查 | 每次审查必须包含模式一致性评估 |
| 使用绝对路径写审查报告位置 | 使用 `## 路径声明` 中声明的相对基准 |

## 自检

- [ ] 审查报告存在
- [ ] 每条发现标注了严重度和回流目标阶段
- [ ] 包含模式一致性检查结论
- [ ] 给出明确的整体评估

## 输出

审查报告以自检声明结尾：

```markdown
## 自检
- [x] 审查报告存在
- [x] 每条发现标注了严重度和回流目标阶段
- [x] 包含模式一致性检查结论
- [x] 整体评估明确
```
