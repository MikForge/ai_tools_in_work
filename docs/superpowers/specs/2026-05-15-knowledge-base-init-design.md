# Knowledge Base Init Skill 设计

**日期**：2026-05-15
**状态**：design
**Parent spec**：[知识库 Skill Harness 架构索引](2026-05-15-knowledge-base-skill-architecture-design.md)
**Contract**：[Knowledge Base 共享契约设计](2026-05-15-knowledge-base-contract-design.md)
**Refines**：`knowledge-base-init`

---

## 目标

`knowledge-base-init` 只负责 Empty 状态下从零创建知识库 harness。它不迁移旧文档，不合并已有目录，不修复 Partial/Broken 状态。

---

## 输入输出

输入：

- router 已判定 Bootstrap Gate = Empty。
- 用户明确初始化请求。
- 默认配置模板。

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
- 不在 Partial/Broken 状态下强行初始化。

---

## 初始化模板

第一阶段默认 root：

```text
docs/00-project-knowledge-base/
```

默认 categories 应来自配置模板，不由 agent 临时发明。模板至少覆盖：

| name | path |
| --- | --- |
| project-overview | `01-project-layer/01-project-overview` |
| core-process | `01-project-layer/02-core-process` |
| architecture | `01-project-layer/03-architecture` |
| middleware-config | `02-technology-layer/01-middleware-config` |
| coding-standards | `02-technology-layer/02-coding-standards` |
| third-party-libraries | `02-technology-layer/03-third-party-libraries` |
| api-docs | `02-technology-layer/04-api-docs` |
| prd-docs | `03-assets-layer/01-prd-docs` |
| technical-solutions | `03-assets-layer/02-technical-solutions` |
| test-cases | `03-assets-layer/03-test-cases` |

每个默认 category 必须同时写入 `index: README.md` 和满足 contract 要求的 `description`，不能只写 `name` 与 `path`。

---

## 工作流

1. 确认 router 传入 Empty 状态。
2. 再次检查 `.knowledge-base.yml` 和默认 root 均不存在。
3. 写入 `.knowledge-base.yml`。
4. 创建 root、layer、category 目录。
5. 创建根索引，列出 layer 入口。
6. 创建 layer 索引，列出该层 categories。
7. 创建 category 索引，写入空 `## Documents`。
8. 汇报创建的文件列表。

如果第 2 步发现任何关键结构已存在，停止并输出 Partial/Broken 审计建议。

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
| `.knowledge-base.yml` 已存在 | 停止，不覆盖 |
| 默认 root 已存在 | 停止，不覆盖 |
| 创建中途失败 | 汇报已创建文件和失败点，不宣布完成 |
| 用户要求顺便写正文 | 拒绝混合，初始化后交给 author/publisher |

---

## 验收场景

1. Empty 状态初始化后，root、layer、category、索引文件均存在。
2. 已有 `.knowledge-base.yml` 时 init 拒绝覆盖。
3. 已有默认 root 时 init 拒绝覆盖。
4. init 不创建任何正文文档。
5. init 完成汇报文件清单，不声称执行了发布或治理。

---

## SKILL.md 建议结构

```markdown
# Knowledge Base Init

## Overview
## Empty-State Precondition
## Template Files
## Workflow
## Refusal Cases
## Completion Report
```
