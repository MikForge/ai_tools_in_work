# Knowledge Base Author Skill 设计

**日期**：2026-05-15
**状态**：design
**Parent spec**：[知识库 Skill Harness 架构索引](2026-05-15-knowledge-base-skill-architecture-design.md)
**Contract**：[Knowledge Base 共享契约设计](2026-05-15-knowledge-base-contract-design.md)
**Refines**：`knowledge-base-author`

---

## 目标

`knowledge-base-author` 只负责生成或修订知识库正文草稿。它不落盘，不更新索引，不决定最终分类和文件名。

---

## 输入输出

输入：

- 用户提供的材料。
- 代码分析结果。
- 会话总结。
- `knowledge-base-context` 读取的已有正文或相关背景。
- 可选写作目标：新增、修订、摘要化、结构化。

输出：

- Markdown 正文草稿。
- 建议标题。
- 建议摘要。
- 可选分类建议，但不能视为最终发布分类。

禁止：

- 不写文件。
- 不更新索引。
- 不决定最终路径。
- 不虚构来源或事实。
- 不把治理建议混进正文发布。

---

## 草稿结构

推荐正文结构：

```markdown
# <Title>

## 背景

## 核心内容

## 操作或约束

## 相关文件

## 注意事项
```

实际结构应服从材料内容，不强行填空节。

---

## 写作规则

- 保留用户原始事实，不扩写成未经证实的结论。
- 引用代码、路径、命令时保持精确。
- 从会话整理正文时，删除寒暄和过程噪音。
- 从代码分析整理正文时，区分事实、推断和建议。
- 修订已有正文时基于 context 读取结果做最小修改。
- 若材料不足以成文，提出缺失信息，不编造。

---

## 修订流程

1. 通过 context 获取现有正文。
2. 提取用户想改的范围。
3. 生成最小修订草稿。
4. 标注主要变化点。
5. 交给 publisher 或用户确认。

author 不直接覆盖原文。

---

## 分类建议

author 可以输出：

```markdown
Suggested category: architecture
Reason: 文档描述模块关系和分层约束。
```

但最终分类由 publisher 基于 `.knowledge-base.yml` 和用户确认决定。

---

## 错误处理

| 场景 | 行为 |
| --- | --- |
| 材料不足 | 说明缺什么，不编造 |
| 用户要求直接保存 | 输出草稿后交给 publisher |
| 事实冲突 | 标出冲突来源，要求确认 |
| 内容像治理报告 | 建议 auditor，不写成正文 |

---

## 验收场景

1. 给一段代码分析，author 生成 Markdown 草稿但不写文件。
2. 给已有正文和修改要求，author 生成最小修订草稿。
3. 材料中缺少关键信息时，author 不补造事实。
4. author 可以建议分类，但不声明最终路径。
5. 用户要求“顺便发布”，author 不越权，交给 publisher。

---

## SKILL.md 建议结构

```markdown
# Knowledge Base Author

## Overview
## Draft-Only Contract
## Draft Structure
## Revision Workflow
## Fact Preservation
## Handoff to Publisher
```
