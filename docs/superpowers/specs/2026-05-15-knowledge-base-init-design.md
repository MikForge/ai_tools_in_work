# Knowledge Base Init Skill 设计

**日期**：2026-05-15
**状态**：design
**Parent spec**：[知识库 Skill Harness 架构索引](2026-05-15-knowledge-base-skill-architecture-design.md)
**Contract**：[Knowledge Base 共享契约设计](2026-05-15-knowledge-base-contract-design.md)
**Refines**：`knowledge-base-init`

---

## 目标

`knowledge-base-init` 是 `knowledge-base-router` package 内部的 skill-shaped internal instruction module，只负责 Empty 状态或 init-compatible Partial 下从零创建知识库 harness。它不迁移旧文档，不合并已有目录，不修复 repair-required Partial/Broken 状态。

---

## 输入输出

输入：

- router 已判定 Bootstrap Gate = Empty，或基于 auditor 报告确认 init-compatible Partial。
- 用户明确初始化请求。
- router 传入的标准 `Worker Handoff Payload`。
- 默认配置模板。
- init-compatible Partial 中已存在且可解析的 `.knowledge-base.yml`，只读使用，不修改。

输出：

- `.knowledge-base.yml`。
- `docs/00-project-knowledge-base/` root。
- layer 目录和 layer README。
- category 目录和 category README。
- 根索引 README。

禁止：

- 不覆盖已有 `.knowledge-base.yml`。
- 不覆盖已有默认 root。
- 不写正文文档。
- 不处理迁移、合并、修复。
- 不在 repair-required Partial 或 Broken 状态下强行初始化。

---

## Handoff Payload 约束

`knowledge-base-init` 只接受符合 router spec 中 `Worker Handoff Payload Contract` 的 payload。

通用字段要求：

- `source` 必须是 `knowledge-base-router`。
- `recommended_by` 可记录触发初始化的上游建议来源，例如 `knowledge-base-auditor`；它不能替代 `source`。
- `request_origin` 必须保留原始外部来源，不得由 init 覆盖。
- `intent` 必须是 `init`。
- `target_worker` 必须是 `knowledge-base-init`。
- `kb_state` 只能是 `Empty` 或 auditor 判定的 init-compatible `Partial`。
- `confirmation_status` 必须是 `confirmed` 或 `not_required`；若为 `required`，init 不执行。
- `missing_fields` 非空时，init 只报告缺失字段，不创建文件。

`worker_payload` 要求：

- `init_mode` 必须存在，且只能是 `empty` 或 `init-compatible-partial`。
- `default_root` 和 `config_template` 可选；没有时使用本 spec 的默认模板。

init 输出后续 handoff recommendation 时，不得覆盖 `request_origin`；只能报告缺失字段、完成结果或建议回到 router，由 router 再决定是否进入 auditor/gardener。

---

## 初始化模板

第一阶段默认 root：

```text
docs/00-project-knowledge-base/
```

默认 categories 应来自配置模板，不由 agent 临时发明。模板至少覆盖：

| name | path | description |
| --- | --- | --- |
| project-overview | `01-project-layer/01-project-overview` | Project goals, scope, terminology, and high-level context. |
| core-process | `01-project-layer/02-core-process` | Core workflows, business processes, and operational sequences. |
| architecture | `01-project-layer/03-architecture` | Architecture, module relationships, layering, and design decisions. |
| middleware-config | `02-technology-layer/01-middleware-config` | Middleware, environment, service, and infrastructure configuration notes. |
| coding-standards | `02-technology-layer/02-coding-standards` | Coding conventions, review rules, style constraints, and implementation norms. |
| third-party-libraries | `02-technology-layer/03-third-party-libraries` | Third-party dependencies, library usage notes, integration constraints, and upgrade risks. |
| api-docs | `02-technology-layer/04-api-docs` | Internal or external API contracts, endpoints, schemas, and request examples. |
| prd-docs | `03-assets-layer/01-prd-docs` | Product requirements, feature narratives, user stories, and acceptance notes. |
| technical-solutions | `03-assets-layer/02-technical-solutions` | Technical solution proposals, tradeoffs, rollout notes, and decision records. |
| test-cases | `03-assets-layer/03-test-cases` | Test scenarios, validation notes, QA cases, and regression coverage ideas. |

每个默认 category 必须同时写入 `index: README.md` 和满足 contract 要求的 `description`，不能只写 `name` 与 `path`。

---

## 工作流

1. 确认 router 传入 Empty 状态，或 router 基于 auditor 报告明确标记 init-compatible Partial。
2. 再次检查要写入的配置、目录和索引不会覆盖既有文件。
3. 若 `.knowledge-base.yml` 缺失，写入默认配置；若已存在且 auditor 标记可沿用，只读使用。
4. 按默认配置或已存在配置创建缺失的 root、layer、category 目录。
5. 创建根索引，列出 layer 入口。
6. 创建 layer 索引，列出该层 categories。
7. 创建 category 索引，写入空 `## Documents`。
8. 汇报创建的文件列表。

如果第 2 步发现会覆盖既有文件，或发现需要迁移/合并/修复已有正文，停止并输出 repair-required Partial/Broken 审计建议。

init-compatible Partial 仅允许以下情况：

- 默认 root 已存在但为空。
- 默认 root 只包含 init 模板会生成的目录或索引空壳，且不会覆盖文件。
- `.knowledge-base.yml` 缺失但 auditor 明确判断没有既有正文需要迁移。
- 配置存在且可解析、无需修改字段，只缺可安全创建的目录或索引文件。

以下情况必须停止并交给 gardener：

- 任意目标文件已存在且内容不是 init 模板空壳。
- 分类目录内已有正文或未知 Markdown。
- 需要修改已有 `.knowledge-base.yml` 字段。
- 需要移动、归档、合并或重新分类既有文件。

---

## 索引模板要求

根索引：

```markdown
# Project Knowledge Base

## Layers

- [01-project-layer](01-project-layer/README.md)
- [02-technology-layer](02-technology-layer/README.md)
- [03-assets-layer](03-assets-layer/README.md)
```

层索引：

```markdown
# Project Layer

## Categories

- [project-overview](01-project-overview/README.md)
- [core-process](02-core-process/README.md)
- [architecture](03-architecture/README.md)
```

分类索引：

```markdown
# Architecture

## Documents
```

模板可以更完整，但必须保持可由 contract 的索引模型解析。

---

## 错误处理

| 场景 | 行为 |
| --- | --- |
| `.knowledge-base.yml` 已存在且 auditor 未标记 init-compatible | 停止，不覆盖 |
| `.knowledge-base.yml` 已存在且 auditor 标记 init-compatible | 只读使用配置，不修改字段 |
| 默认 root 已存在且为空或只含可安全补齐的 scaffold | 仅在 auditor 标记 init-compatible Partial 后补齐缺失结构 |
| 默认 root 已存在且含正文或未知文件 | 停止，建议 auditor/gardener |
| 创建中途失败 | 汇报已创建文件和失败点，不宣布完成 |
| 用户要求顺便写正文 | 拒绝混合，初始化后交给 author/publisher |

---

## 验收场景

1. Empty 状态初始化后，root、layer、category、索引文件均存在。
2. 已有 `.knowledge-base.yml` 时 init 拒绝覆盖；若 auditor 标记 init-compatible，只读沿用配置。
3. 已有默认 root 且 auditor 标记 init-compatible Partial 时，init 只补齐缺失 scaffold，不覆盖文件。
4. init 不创建任何正文文档。
5. init 完成汇报文件清单，不声称执行了发布或治理。

---

## Skill 落地目标

目标 skill-shaped internal instruction module：

```yaml
name: knowledge-base-init
description: Use only when knowledge-base-router hands off an Empty or auditor-reported init-compatible Partial project knowledge-base initialization.
```

Writing Skills 参数：

| 参数 | 值 |
| --- | --- |
| Skill 名称 | `knowledge-base-init` |
| Skill 类型 | Technique |
| 触发条件 | `knowledge-base-router` 判定 Empty 并确认初始化意图，或 router 基于 `knowledge-base-auditor` 报告标记 init-compatible Partial。 |
| 要解决的具体问题 | 从零创建可被 router/context/publisher/auditor 共同识别的配置、目录和索引 scaffold。 |
| 反面案例 | 用户或 agent 直接提出初始化请求时，应先进入 router；已存在需要迁移、合并、索引修复或配置修复的结构时，不使用 init。 |
| 已知 rationalization | “用户就是要初始化我可以跳过 router”、“root 已经有了我顺便覆盖一下”、“缺几个 README 我直接补，不用审计”、“初始化时顺手写第一篇正文”。 |
| 代码示例场景 | 无 `.knowledge-base.yml`、无默认 root，用户说“初始化知识库”，init 创建配置、root、layer/category 目录和索引模板。 |

目标目录：

```text
.agents/skills/knowledge-base-router/knowledge-base-init/
├── SKILL.md
├── zh-CN.md
├── agents/
│   └── openai.yaml
├── knowledge-base.yml.temp
└── templates/
    ├── root-readme.md
    ├── layer-readme.md
    └── category-readme.md
```

调用控制：

- 目录名必须是 `knowledge-base-init`，与 `SKILL.md` frontmatter 的 `name` 一致。
- `agents/openai.yaml` 必须设置 `policy.allow_implicit_invocation: false`。
- 如目标运行时支持 Claude Code 扩展，`SKILL.md` frontmatter 应设置 `disable-model-invocation: true` 和 `user-invocable: false`。
- 缺少符合 router spec 的 `Worker Handoff Payload`，或缺少 `source`、`request_origin`、`intent`、`kb_state`、`target_worker`、`confirmation_status`、`worker_payload.init_mode` 时，必须拒绝执行并要求回到 router；auditor 只能补充 init-compatible 报告，不能直接授权 init 执行。

`SKILL.md` 必备章节：

- Overview
- When to Use
- Invocation Control
- Handoff Payload Validation
- Empty-State Precondition
- Template Files
- Workflow
- Refusal Cases
- Completion Report
- Common Mistakes

依赖契约章节：

- 落地 reference：`../references/contract.md`
- [配置契约](2026-05-15-knowledge-base-contract-design.md#配置契约)
- [索引模型](2026-05-15-knowledge-base-contract-design.md#索引模型)
