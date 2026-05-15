# Knowledge Base Auditor 与 Gardener 设计

**日期**：2026-05-15
**状态**：design
**Parent spec**：[知识库 Skill Harness 架构索引](2026-05-15-knowledge-base-skill-architecture-design.md)
**Contract**：[Knowledge Base 共享契约设计](2026-05-15-knowledge-base-contract-design.md)
**Refines**：`knowledge-base-auditor`, `knowledge-base-gardener`

---

## 目标

`knowledge-base-auditor` 和 `knowledge-base-gardener` 是 `knowledge-base-router` package 内部 worker，共同负责知识库熵管理。auditor 默认只读并输出固定报告；gardener 只在用户确认范围后执行维护。

---

## 分工

| Skill | 职责 | 禁止 |
| --- | --- | --- |
| `knowledge-base-auditor` | 审计配置、索引、正文一致性，输出 Audit Report Protocol | 默认不改文件 |
| `knowledge-base-gardener` | 基于报告和用户确认执行去重、迁移、索引修复、腐烂修复 | 不扩大范围，不无报告执行 |

---

## Auditor 输入输出

输入：

- `.knowledge-base.yml`，如果存在。
- root、layer、category 索引，如果存在。
- 配置 root 下的正文文档候选，如果 root 存在。
- 可选用户关注范围。
- `knowledge-base-router` 传入的 audit/Bootstrap Gate failure handoff payload。

输出：

- 一个或多个 Audit Report Protocol 报告。
- 风险等级：blocking、warning、info。
- 建议修复顺序。
- 每个报告的 `Suggested Next Skill`。

检查内容：

- 配置是否可解析。
- root、layer、category、index 是否存在。
- 索引链接是否指向存在文档。
- 正文是否未被索引引用。
- 是否存在重复主题、过期内容、空索引、腐烂链接。
- 是否存在正文漂移、质量异常、分类不匹配、事实冲突等文档异常。
- Partial 是否属于 init-compatible bootstrap，还是必须由 gardener 修复。

---

## Gardener 输入输出

输入：

- auditor 报告。
- 用户确认的修复范围。
- 可选 dry-run/apply 模式。
- router、auditor 或用户确认后的 gardener handoff payload。

输出：

- 修改文件列表。
- 每个修改对应的报告项。
- 最小自检结果。

允许操作：

- 创建缺失索引。
- 在报告和用户确认范围内补齐或修正 `.knowledge-base.yml`。
- 修复索引链接。
- 补充孤儿文档索引。
- 按确认范围移动错分文档。
- 按确认范围归档或合并重复文档。
- 在已有来源明确时搬运或统一索引摘要，或机械排序。

禁止操作：

- 不绕过报告或明确范围。
- 不做未确认的大规模结构改动。
- 不删除正文而不保留迁移说明或用户确认。
- 不把语义改写伪装成机械修复。
- 不生成新的语义摘要；需要新摘要时交给 author。

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

Partial 判定规则：

- 仅缺初始化 scaffold、默认 root 为空或 scaffold-only、且不会覆盖既有文件时，报告为 init-compatible Partial，并建议 `knowledge-base-init`。
- 任何涉及已有正文、未知文件、孤儿文档、配置修正、索引修复、迁移或可能覆盖文件的情况，报告为 repair-required Partial，并建议 `knowledge-base-gardener`。
- Broken 不进入 init；必须先由 gardener 或用户手动修复到可解析状态。

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
8. 默认 root 已存在但为空且无配置时，auditor 可输出 init-compatible Partial，不创建文件。
9. 默认 root 已存在且含未知 Markdown 时，auditor 输出 repair-required Partial，不建议 init。

---

## Skill 落地目标

本 spec 落成两个 internal worker，不能合并成一个“治理万能入口”。外部审计或维护请求必须先进入 `knowledge-base-router`。

### `knowledge-base-auditor`

目标 internal worker skill：

```yaml
name: knowledge-base-auditor
description: Use only when knowledge-base-router hands off a project knowledge-base audit, Bootstrap Gate failure, anomaly check, or pre-maintenance inspection.
```

Writing Skills 参数：

| 参数 | 值 |
| --- | --- |
| Skill 名称 | `knowledge-base-auditor` |
| Skill 类型 | Discipline-enforcing |
| 触发条件 | `knowledge-base-router` 发现 Partial/Broken，或判定需要审计、异常检查、维护前检查。 |
| 要解决的具体问题 | 把结构异常、内容异常和修复建议转成固定报告，防止 agent 边检查边改文件。 |
| 反面案例 | 用户或 agent 直接要求检查知识库时，应先进入 router；用户只是读取已 Ready 的正文时，不用 auditor 代替 context。 |
| 已知 rationalization | “用户说检查我可以跳过 router”、“这个缺索引很好修我直接建”、“检查时顺手清理重复”、“报告格式不用那么固定”。 |
| 代码示例场景 | 配置存在但 category index 缺失，auditor 输出 blocking Partial 报告、Suggested Next Skill 和 Suggested Gardener Scope，不创建文件。 |

目标目录：

```text
.agents/skills/knowledge-base-router/auditor/
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

- 落地 reference：`../references/contract.md`
- [配置契约](2026-05-15-knowledge-base-contract-design.md#配置契约)
- [索引模型](2026-05-15-knowledge-base-contract-design.md#索引模型)
- [Audit Report Protocol](2026-05-15-knowledge-base-contract-design.md#audit-report-protocol)
- [文档异常分类](2026-05-15-knowledge-base-contract-design.md#文档异常分类)

### `knowledge-base-gardener`

目标 internal worker skill：

```yaml
name: knowledge-base-gardener
description: Use only when knowledge-base-router or knowledge-base-auditor hands off a confirmed project knowledge-base maintenance repair scope.
```

Writing Skills 参数：

| 参数 | 值 |
| --- | --- |
| Skill 名称 | `knowledge-base-gardener` |
| Skill 类型 | Discipline-enforcing |
| 触发条件 | `knowledge-base-router` 或 `knowledge-base-auditor` 传入 auditor 报告，并且用户已确认指定维护修复范围。 |
| 要解决的具体问题 | 在确认范围内修复知识库熵问题，同时防止 agent 擅自扩大范围、语义改写或批量破坏文档。 |
| 反面案例 | 用户或 agent 直接要求整理知识库时，应先进入 router；没有 auditor 报告、没有用户确认范围、只是想写新正文或发布草稿时，不用 gardener。 |
| 已知 rationalization | “用户说整理一下我可以跳过 router/auditor”、“用户说整理一下就是允许我全库改”、“报告只列了几个文件但相关文件我也一起改”、“摘要可以顺手重写”。 |
| 代码示例场景 | auditor 报告一个 Orphan 文档，用户确认补索引，gardener dry-run 后只修改对应分类索引并自检。 |

目标目录：

```text
.agents/skills/knowledge-base-router/gardener/
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

- 落地 reference：`../references/contract.md`
- [配置契约](2026-05-15-knowledge-base-contract-design.md#配置契约)
- [索引模型](2026-05-15-knowledge-base-contract-design.md#索引模型)
- [Audit Report Protocol](2026-05-15-knowledge-base-contract-design.md#audit-report-protocol)
- [文档异常分类](2026-05-15-knowledge-base-contract-design.md#文档异常分类)
