# Knowledge Base 共享契约设计

**日期**：2026-05-15
**状态**：design
**Parent spec**：[知识库 Skill Harness 架构索引](2026-05-15-knowledge-base-skill-architecture-design.md)
**Refines**：shared contract

---

## 目标

定义所有知识库 skill 共享的稳定契约，避免 router、context、publisher、auditor、gardener 各自解释配置、索引、正文边界和审计报告格式。

本 spec 是后续所有子 spec 的公共依赖。实现任何知识库 skill 前，必须先遵守本契约。

---

## 覆盖范围

- `.knowledge-base.yml` 配置结构。
- 知识库正文和索引的边界。
- 根索引、层索引、分类索引的层级关系。
- 文件命名、分类匹配、索引条目格式。
- Audit Report Protocol。
- 文档异常分类。

不覆盖具体 skill 的交互流程、模板文件内容或执行计划。

---

## 配置契约

配置文件固定在仓库根目录：

```text
.knowledge-base.yml
```

最小结构：

```yaml
knowledge_base:
  root: docs/00-project-knowledge-base
  index: README.md
  filename_style: kebab-case
  index_format: markdown-list
  categories:
    - name: architecture
      path: 01-project-layer/03-architecture
      index: README.md
      description: Architecture, module relationships, and layering.
```

字段规则：

| 字段 | 必需 | 说明 |
| --- | --- | --- |
| `knowledge_base.root` | yes | 知识库根目录，相对仓库根目录 |
| `knowledge_base.index` | yes | 根索引文件名，默认 `README.md` |
| `knowledge_base.filename_style` | yes | 文件名风格，第一阶段只支持 `kebab-case` |
| `knowledge_base.index_format` | yes | 索引格式，第一阶段只支持 `markdown-list` |
| `knowledge_base.categories[].name` | yes | 稳定分类标识 |
| `knowledge_base.categories[].path` | yes | 分类目录，相对 `root` |
| `knowledge_base.categories[].index` | yes | 分类索引文件名，默认 `README.md` |
| `knowledge_base.categories[].description` | yes | 用于分类匹配的人类描述 |

配置约束：

- skill 不根据常见目录名猜测知识库位置。
- 已有配置优先于默认模板。
- 除 `knowledge-base-init` 明确初始化外，其他 skill 不创建或修改 `.knowledge-base.yml`。
- categories 是发布和检索的唯一分类来源，不自动新增未配置分类。

---

## 正文边界

有效正文文档必须同时满足：

- 位于 `.knowledge-base.yml` 的 `root` 之下。
- 位于某个配置分类的 `path` 之下。
- 文件名不是该分类的 `index`。
- 通过分类索引可发现。

位于分类目录但未被分类索引引用的 Markdown 是 Orphan 候选，只能由 `auditor` 报告，再由 `gardener` 在确认后补索引或归档。

以下不视为知识库正文：

- `README.md` 索引文件。
- `docs/superpowers/specs/**`。
- `docs/superpowers/plans/**`。
- 仓库根 README。
- skill 仓库索引。
- 未被 `.knowledge-base.yml` 管辖的普通 Markdown。

---

## 索引模型

知识库采用自顶向下索引结构。

```text
.knowledge-base.yml
  -> {root}/{index}
     -> {root}/{layer}/README.md
        -> {root}/{category.path}/{category.index}
           -> 正文文档
```

规则：

- `layer` 由 `categories[].path` 的第一段确定，例如 `01-project-layer/03-architecture` 的 layer 是 `01-project-layer`。
- layer index 固定使用 `{root}/{layer}/README.md`。
- category index 使用 `{root}/{categories[].path}/{categories[].index}`。
- `context` 通过索引发现文档，不直接扫描目录。
- `publisher` 写入正文后必须更新分类索引。
- `auditor` 可以扫描配置、索引和正文来发现异常，但默认只报告。
- `gardener` 可以在确认后修复索引，但不能扩大报告范围。

索引条目格式：

```markdown
## Documents

- [agent-skill-harness.md](agent-skill-harness.md): Agent skill harness architecture notes.
```

索引条目规则：

- 链接路径必须相对当前索引文件。
- 冒号后的摘要应来自正文首段、author 建议摘要或用户提供摘要。
- 摘要不得由 publisher 无依据编造；缺摘要时使用文件标题或留空摘要并报告。

条目排序：

- 同一分类索引内按文件名升序。
- 重新排序属于机械修复，可由 `gardener` 在确认后执行。

---

## 命名契约

第一阶段文件名只支持 `kebab-case`：

```text
agent-skill-harness.md
knowledge-base-router-bootstrap.md
```

生成文件名时：

- 优先使用用户明确提供的文件名。
- 其次从标题或主题生成。
- 不使用空格、中文标点、下划线、大写字母。
- 冲突时停止并询问更新、另存或取消。

---

## Audit Report Protocol

`knowledge-base-auditor` 不能用自由散文描述“感觉不对”。任何 Partial、Broken、Conflict 或 Document Anomaly 都必须转成固定报告结构，让用户、`knowledge-base-gardener` 和后续自动检查器能按字段消费。

```markdown
# Knowledge Base Audit Report

## Status
Partial | Broken | Conflict | Content Drift | Content Quality | Duplicate | Stale | Orphan | Misclassified | Warning

## Severity
blocking | warning | info

## Summary
一句话说明为什么当前状态不能继续普通读写，或为什么该文档需要处理。

## Evidence
- Expected: 期望状态
- Actual: 实际状态
- Files:
  - `<path>`
- Config source: `.knowledge-base.yml`

## Impact
说明该异常会导致的风险，例如索引链断裂、读不到文档、覆盖风险、分类不可判定、事实误导。

## Recommended Fix
给出建议动作，但不直接执行。

## Requires Confirmation
yes | no

## Suggested Gardener Scope
列出 `knowledge-base-gardener` 被允许修改的文件和动作范围。
```

协议规则：

- `Evidence` 必须引用实际路径、配置字段、索引链接或正文片段位置，不能只写主观判断。
- `Recommended Fix` 只能是建议，不代表已经修复。
- `Suggested Gardener Scope` 是执行上限，`gardener` 不能自行扩大范围。
- `Severity=blocking` 表示 router/publisher/context 必须停止普通读写。
- `Severity=warning` 表示普通读取可继续，但发布或治理前需要确认。
- `Severity=info` 表示不阻塞，仅用于维护提示。
- 结构性问题使用 `Partial`、`Broken`、`Conflict`、`Warning`。
- 正文内容问题使用 `Content Drift`、`Content Quality`、`Duplicate`、`Stale`、`Orphan`、`Misclassified`。
- 涉及事实改写、合并、归档、迁移时，`Requires Confirmation` 必须为 `yes`。

---

## 文档异常分类

| 类型 | 定义 | 默认处理 |
| --- | --- | --- |
| Content Drift | 正文描述与仓库、配置、实际文件不一致 | 报告证据，进入 author 修订草稿 |
| Content Quality | 标题泛、缺摘要、结构混乱、来源不清 | 报告质量问题，进入 author 改写草稿 |
| Duplicate | 多篇正文主题重复或结论冲突 | 报告重复关系，等待用户确认 |
| Stale | 引用旧目录、旧命令、旧 skill 名称 | 报告过期引用，等待确认修复 |
| Orphan | 正文存在但未被分类索引引用 | 报告孤儿文档，等待补索引或归档 |
| Misclassified | 正文内容与当前分类不匹配 | 报告分类建议，等待迁移确认 |

---

## 落地目标

本 spec 不落成用户直接调用的业务 skill。它落成共享 reference 包，供其他知识库 skill 按需引用。

目标 support skill：

```yaml
name: knowledge-base-contract
description: Provides shared project knowledge-base contracts for configuration, index structure, naming, audit reports, and document anomalies. Use as a reference dependency for other knowledge-base skills rather than as a user-facing workflow.
```

目标目录：

```text
.agents/skills/knowledge-base-contract/
├── SKILL.md
├── zh-CN.md
└── references/
    ├── knowledge-base-config.md
    ├── index-model.md
    ├── audit-report-protocol.md
    └── document-anomalies.md
```

`knowledge-base-contract/SKILL.md` 用途：

- 作为共享契约索引，不直接执行读写发布治理。
- description 应说明它提供知识库配置、索引、命名、审计报告协议的约束。
- 可设为低触发或仅供其他 knowledge-base skill 引用；具体调用控制在 implementation plan 中决定。

其他知识库 skill 必须在自身 `SKILL.md` 中引用本包的 relevant references，而不是复制一份不同版本的契约。

---

## 验收标准

- 所有子 spec 引用本契约作为配置、索引和审计报告来源。
- 没有子 spec 重新定义 `.knowledge-base.yml` 字段语义。
- 没有子 spec 允许直接扫描正文目录作为文档发现路径。
- Audit Report Protocol 字段完整且可被 gardener 消费。
- Audit Report Protocol 包含 `Severity`，并能表达 blocking、warning、info。
- 文档异常分类覆盖正文漂移、质量、重复、过期、孤儿、错分六类问题。
- 落地时存在 `knowledge-base-contract` 共享 reference 包，其他 knowledge-base skill 不各自维护冲突版本。
