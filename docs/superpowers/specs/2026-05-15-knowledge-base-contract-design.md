# Knowledge Base 共享契约设计

**日期**：2026-05-15
**状态**：design
**Parent spec**：[知识库 Skill Harness 架构索引](2026-05-15-knowledge-base-skill-architecture-design.md)
**Refines**：shared contract

---

## 目标

定义所有知识库 skill 共享的稳定契约，避免 router、context、publisher、auditor、gardener 各自解释配置、索引、正文边界和审计报告格式。

本 spec 是后续所有子 spec 的公共依赖。实现 `knowledge-base-router` package 和任何 internal worker 前，必须先遵守本契约。

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
- 除 `knowledge-base-init` 在 Empty 或 init-compatible Partial 中创建配置、`knowledge-base-gardener` 在审计报告和用户确认范围内修复配置外，其他 skill 不创建或修改 `.knowledge-base.yml`。
- categories 是发布和检索的唯一分类来源，不自动新增未配置分类。
- `root`、`index`、`categories[].path`、`categories[].index` 必须是相对路径，不允许绝对路径或 `..`。
- `categories[].name` 必须唯一。
- `categories[].path` 不得互相包含或指向同一目录。

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

## Suggested Next Skill
knowledge-base-init | knowledge-base-gardener | knowledge-base-author | user-manual-fix | none

## Requires Confirmation
yes | no

## Suggested Gardener Scope
当 `Suggested Next Skill` 是 `knowledge-base-gardener` 时，列出 gardener 被允许修改的文件和动作范围；否则写 `n/a`。
```

协议规则：

- `Evidence` 必须引用实际路径、配置字段、索引链接或正文片段位置，不能只写主观判断。
- `Recommended Fix` 只能是建议，不代表已经修复。
- `Suggested Next Skill` 必须与异常类型一致；init-compatible Partial 使用 `knowledge-base-init`，语义改写使用 `knowledge-base-author`，结构修复使用 `knowledge-base-gardener`。
- `Suggested Gardener Scope` 是 gardener 执行上限，`gardener` 不能自行扩大范围。
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

## 使用方式

本 spec 是其他知识库 spec 和 implementation plan 的共享契约来源，不落成用户直接调用的 skill，也不创建 `.agents/skills/knowledge-base-contract/`。在实际 skill package 中，它落成 `knowledge-base-router` 的 supporting reference 文件：

```text
.agents/skills/knowledge-base-router/references/contract.md
```

使用规则：

- 子 spec 必须直接链接本 spec 的相关章节，例如 [配置契约](#配置契约)、[索引模型](#索引模型)、[Audit Report Protocol](#audit-report-protocol)、[文档异常分类](#文档异常分类)。
- 实现 `knowledge-base-router` 和内部 worker 时，必须把本 spec 或 `references/contract.md` 作为必读上下文。
- Writing Skills 不能根据本 spec 生成 `knowledge-base-contract/SKILL.md`。
- 如果契约需要变更，先修改本 spec，再同步检查 router、worker 子 spec 和 `references/contract.md`，不在单个 worker 中分叉契约内容。

---

## 验收标准

- 所有子 spec 引用本契约作为配置、索引和审计报告来源。
- 没有子 spec 重新定义 `.knowledge-base.yml` 字段语义。
- 没有子 spec 允许直接扫描正文目录作为文档发现路径。
- Audit Report Protocol 字段完整且可被 gardener 消费。
- Audit Report Protocol 包含 `Suggested Next Skill`，并能把 init-compatible Partial 路由到 init。
- Audit Report Protocol 包含 `Severity`，并能表达 blocking、warning、info。
- 文档异常分类覆盖正文漂移、质量、重复、过期、孤儿、错分六类问题。
- `knowledge-base-router` package 以 `references/contract.md` 承载本契约；不生成独立 contract skill，也不让 worker 维护契约副本。
