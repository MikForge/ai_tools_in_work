# Knowledge Base Auditor 与 Gardener 设计

**日期**：2026-05-15
**状态**：design
**Parent spec**：[知识库 Skill Harness 架构索引](2026-05-15-knowledge-base-skill-architecture-design.md)
**Contract**：[Knowledge Base 共享契约设计](2026-05-15-knowledge-base-contract-design.md)
**Refines**：`knowledge-base-auditor`, `knowledge-base-gardener`

---

## 目标

`knowledge-base-auditor` 和 `knowledge-base-gardener` 共同负责知识库熵管理。auditor 默认只读并输出固定报告；gardener 只在用户确认范围后执行维护。

---

## 分工

| Skill | 职责 | 禁止 |
| --- | --- | --- |
| `knowledge-base-auditor` | 审计配置、索引、正文一致性，输出 Audit Report Protocol | 默认不改文件 |
| `knowledge-base-gardener` | 基于报告和用户确认执行去重、迁移、索引修复、腐烂修复 | 不扩大范围，不无报告执行 |

---

## Auditor 输入输出

输入：

- `.knowledge-base.yml`。
- root、layer、category 索引。
- 正文文档。
- 可选用户关注范围。

输出：

- 一个或多个 Audit Report Protocol 报告。
- 风险等级：blocking、warning、info。
- 建议修复顺序。

检查内容：

- 配置是否可解析。
- root、layer、category、index 是否存在。
- 索引链接是否指向存在文档。
- 正文是否未被索引引用。
- 是否存在重复主题、过期内容、空索引、腐烂链接。
- 是否存在正文漂移、质量异常、分类不匹配、事实冲突等文档异常。

---

## Gardener 输入输出

输入：

- auditor 报告。
- 用户确认的修复范围。
- 可选 dry-run/apply 模式。

输出：

- 修改文件列表。
- 每个修改对应的报告项。
- 最小自检结果。

允许操作：

- 创建缺失索引。
- 修复索引链接。
- 补充孤儿文档索引。
- 按确认范围移动错分文档。
- 按确认范围归档或合并重复文档。
- 机械统一索引摘要或排序。

禁止操作：

- 不绕过报告或明确范围。
- 不做未确认的大规模结构改动。
- 不删除正文而不保留迁移说明或用户确认。
- 不把语义改写伪装成机械修复。

模式规则：

- 未明确 `apply` 时，gardener 默认输出 dry-run 计划。
- 用户确认具体报告项和文件范围后，才能进入 apply。
- apply 不能修改报告 `Suggested Gardener Scope` 之外的文件。

---

## 审计流程

1. 读取配置。
2. 校验 root 和 categories。
3. 读取 root/layer/category 索引。
4. 校验索引链接。
5. 识别未索引正文。
6. 检查文档异常。
7. 输出 Audit Report Protocol。
8. 按风险等级排序。

auditor 默认不执行任何修复。

---

## 治理流程

1. 接收 auditor 报告。
2. 默认输出 dry-run 计划，列出将修改的报告项和文件。
3. 确认用户批准的报告项和文件范围。
4. 若范围不明确，先询问一个问题。
5. 执行修复。
6. 对修改范围重新做最小自检。
7. 汇报修改文件和剩余风险。

如果自检失败，gardener 不宣布完成，应回到 auditor 报告。

---

## 文档异常处理

| 类型 | auditor 行为 | gardener 行为 |
| --- | --- | --- |
| Content Drift | 报告证据和建议 | 仅在确认后应用明确替换 |
| Content Quality | 报告质量问题 | 不直接语义改写，交给 author |
| Duplicate | 报告重复关系 | 确认后合并或归档 |
| Stale | 报告过期引用 | 确认后替换明确旧引用 |
| Orphan | 报告未索引正文 | 确认后补索引或归档 |
| Misclassified | 报告分类不匹配 | 确认后迁移并更新索引 |

---

## 验收场景

1. 缺失分类索引时，auditor 输出 Partial 报告，不创建文件。
2. 用户确认缺失索引修复后，gardener 创建索引并自检。
3. 正文未被索引引用时，auditor 输出 Orphan 报告。
4. 文档内容过期时，auditor 输出 Content Drift 或 Stale 报告，并给证据。
5. 用户说“整理一下”，gardener 不直接执行，必须先 auditor。
6. gardener 执行后只修改确认范围内的文件。
7. 未明确 apply 时，gardener 只输出 dry-run 计划。

---

## Skill 落地目标

本 spec 落成两个独立 skill，不能合并成一个“治理万能入口”。

### `knowledge-base-auditor`

目标 skill：

```yaml
name: knowledge-base-auditor
description: Audits project knowledge-base configuration, indexes, links, and document anomalies in report-only mode. Use when the knowledge base may be partial, broken, stale, duplicated, misclassified, or needs inspection before maintenance.
```

目标目录：

```text
.agents/skills/knowledge-base-auditor/
├── SKILL.md
└── zh-CN.md
```

`SKILL.md` 必备章节：

- Overview
- When to Use
- Report-Only Contract
- Audit Inputs
- Audit Checks
- Audit Report Protocol
- Document Anomaly Handling
- Handoff to Gardener
- Common Mistakes

依赖契约章节：

- [配置契约](2026-05-15-knowledge-base-contract-design.md#配置契约)
- [索引模型](2026-05-15-knowledge-base-contract-design.md#索引模型)
- [Audit Report Protocol](2026-05-15-knowledge-base-contract-design.md#audit-report-protocol)
- [文档异常分类](2026-05-15-knowledge-base-contract-design.md#文档异常分类)

### `knowledge-base-gardener`

目标 skill：

```yaml
name: knowledge-base-gardener
description: Applies confirmed knowledge-base maintenance repairs from audit reports, including index fixes, orphan handling, moves, archival, and duplicate cleanup. Use only after an audit report and explicit user-confirmed scope.
```

目标目录：

```text
.agents/skills/knowledge-base-gardener/
├── SKILL.md
└── zh-CN.md
```

`SKILL.md` 必备章节：

- Overview
- When to Use
- Preconditions
- Dry-Run First Rule
- Allowed Repairs
- Scope Confirmation
- Apply Workflow
- Self-Check
- Common Mistakes

依赖契约章节：

- [配置契约](2026-05-15-knowledge-base-contract-design.md#配置契约)
- [索引模型](2026-05-15-knowledge-base-contract-design.md#索引模型)
- [Audit Report Protocol](2026-05-15-knowledge-base-contract-design.md#audit-report-protocol)
- [文档异常分类](2026-05-15-knowledge-base-contract-design.md#文档异常分类)
