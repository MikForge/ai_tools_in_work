# `.knowledge-base.yml` 配置规范

## 配置位置

默认配置文件固定为仓库根目录：

```text
.knowledge-base.yml
```

配置发现顺序：

1. 用户在请求中显式指定的配置路径。
2. 当前仓库根目录的 `.knowledge-base.yml`。

如果两者都不存在且用户不是明确请求初始化，skill 必须停止，不写入任何知识库文件，并输出默认模板配置示例请求用户补齐。

不设计多级 fallback。

## 配置结构

```yaml
knowledge_base:
  root: docs/00-project-knowledge-base
  index: README.md
  filename_style: kebab-case
  index_format: markdown-list
  categories:
    - name: project-overview
      path: 01-project-layer/01-project-overview
      index: README.md
      description: Project background, goals, value, and boundaries.
    - name: core-process
      path: 01-project-layer/02-core-process
      index: README.md
      description: Core workflows, state transitions, and business processes.
    - name: architecture
      path: 01-project-layer/03-architecture
      index: README.md
      description: Architecture, module relationships, and layering.
    - name: middleware-config
      path: 02-technology-layer/01-middleware-config
      index: README.md
      description: Build, runtime, middleware, and environment configuration.
    - name: coding-standards
      path: 02-technology-layer/02-coding-standards
      index: README.md
      description: Coding conventions, naming rules, and implementation patterns.
    - name: third-party-libraries
      path: 02-technology-layer/03-third-party-libraries
      index: README.md
      description: Third-party library, SDK, and integration notes.
    - name: api-docs
      path: 02-technology-layer/04-api-docs
      index: README.md
      description: API documents, protocols, and interface contracts.
    - name: prd-docs
      path: 03-assets-layer/01-prd-docs
      index: README.md
      description: Product requirements and feature descriptions.
    - name: technical-solutions
      path: 03-assets-layer/02-technical-solutions
      index: README.md
      description: Technical solutions, design notes, and option analysis.
    - name: test-cases
      path: 03-assets-layer/03-test-cases
      index: README.md
      description: Test plans, cases, acceptance criteria, and validation records.
```

## 字段说明

| 字段 | 必需 | 说明 |
|---|---|---|
| `knowledge_base.root` | 是 | 知识库根目录，相对仓库根目录。 |
| `knowledge_base.index` | 是 | 根索引文件，通常是 `README.md`。 |
| `knowledge_base.filename_style` | 是 | 文件命名风格。MVP 只要求支持 `kebab-case`。 |
| `knowledge_base.index_format` | 是 | 索引格式。MVP 支持 `markdown-list` 或 `markdown-table`。 |
| `knowledge_base.categories` | 否 | 可选分类列表。默认模板配置 10 个叶子分类；未配置时写入根目录。 |
| `categories[].name` | 是 | 分类名，用于用户请求中的目标分类匹配。 |
| `categories[].path` | 是 | 分类目录，相对 `knowledge_base.root`。 |
| `categories[].index` | 否 | 分类索引文件。缺失时使用根配置的 `index` 文件名。 |
| `categories[].description` | 否 | 分类用途说明，用于辅助判断目标分类。 |

## 约束规则

- 未知字段不参与 MVP 行为，skill 必须忽略。
- skill 不应主动改写 `.knowledge-base.yml`，除非用户明确要求更新配置。
- `filename_style` 目前只支持 `kebab-case`。
- `index_format` 目前支持 `markdown-list` 和 `markdown-table`。
