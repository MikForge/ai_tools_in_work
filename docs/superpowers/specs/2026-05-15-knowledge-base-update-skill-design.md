# Knowledge Base Update Skill 设计

## 背景

本设计定义一个新的通用 skill：`knowledge-base-update`。它负责在项目知识库中新增、更新、归档或索引 Markdown 文档。

`knowledge-base-update` 只提供基础骨架和原则声明。具体知识库路径、分类和索引规则全部由项目根目录的 `.knowledge-base.yml` 声明。

当项目尚未配置知识库时，skill 使用默认模板作为初始化建议。默认模板的根目录是 `docs/00-project-knowledge-base/`。

## 目标

- 定义新的 `knowledge-base-update` skill。
- 允许默认模板初始化，但已有配置不绑定默认模板。
- 使用 `.knowledge-base.yml` 作为唯一默认配置入口。
- 提供 `docs/00-project-knowledge-base/` 作为默认初始化模板。
- 支持新增、更新、归档 Markdown 知识文档的最小通用流程。
- 写入内容后维护配置指定的索引入口。
- 为后续使用 `writing-skills` 创建该 skill 提供明确输入规格。

## 非目标

- 不自动扫描多个候选知识库目录。
- 不在缺少配置时猜测路径或直接创建文档。
- 不在已有 `.knowledge-base.yml` 的项目中覆盖用户配置。
- 不替代 `writing-plans`、`managing-project-rules`、`record-idea` 等专门 skill。
- 不实现脚本、CLI 或自动化工具。

## 核心原则

1. **配置优先**：知识库结构由 `.knowledge-base.yml` 决定，skill 不硬编码项目路径。
2. **默认模板可替换**：默认模板只用于初始化建议；已有配置永远优先。
3. **索引即入口**：任何写入、更新或归档操作完成后，都必须维护对应索引。
4. **内容不失真**：保留用户提供的知识内容，只做必要 Markdown 格式整理。
5. **显式处理不确定性**：除明确初始化外，配置缺失、分类模糊、目标文件冲突时停止并询问，不自行猜测。
6. **最小修改面**：只修改目标文档和配置指定的索引文件。
7. **项目边界清晰**：只更新当前仓库 `.knowledge-base.yml` 指向的知识库。

## 配置位置

默认配置文件固定为仓库根目录：

```text
.knowledge-base.yml
```

配置发现顺序只有两步：

1. 用户在请求中显式指定的配置路径。
2. 当前仓库根目录的 `.knowledge-base.yml`。

如果两者都不存在且用户不是明确请求初始化，skill 必须停止，不写入任何知识库文件，并输出默认模板配置示例请求用户补齐。

不设计多级 fallback。这样可以避免 agent 在不同项目中猜测目录结构。

## 默认模板

缺少 `.knowledge-base.yml` 时，skill 应展示以下模板作为默认初始化建议。只有用户明确要求初始化知识库时，才可以创建这些目录和 README 文件。

```text
docs/00-project-knowledge-base/
├── README.md                         # 总入口
├── 01-project-layer/                 # 项目层 — "为什么"
│   ├── README.md                     #   层级导航
│   ├── 01-project-overview/
│   │   └── README.md                 #   子目录索引
│   ├── 02-core-process/
│   │   └── README.md                 #   子目录索引
│   └── 03-architecture/
│       └── README.md                 #   子目录索引
├── 02-technology-layer/              # 技术层 — "怎么做"
│   ├── README.md                     #   层级导航
│   ├── 01-middleware-config/
│   │   └── README.md                 #   子目录索引
│   ├── 02-coding-standards/
│   │   └── README.md                 #   子目录索引
│   ├── 03-third-party-libraries/
│   │   └── README.md                 #   子目录索引
│   └── 04-api-docs/
│       └── README.md                 #   子目录索引
└── 03-assets-layer/                  # 资产层 — "做过什么"
    ├── README.md                     #   层级导航
    ├── 01-prd-docs/
    │   └── README.md                 #   子目录索引
    ├── 02-technical-solutions/
    │   └── README.md                 #   子目录索引
    └── 03-test-cases/
        └── README.md                 #   子目录索引
```

默认模板语义：

- 根 `README.md` 是知识库总入口。
- 三个 layer 的 `README.md` 只做层级导航。
- 叶子目录的 `README.md` 是该目录的文档索引。
- 新文档默认写入叶子目录，不直接写入 layer 目录。
- 模板可通过 `.knowledge-base.yml` 替换；skill 不应把模板规则强加给已有配置。

## 最小配置契约

默认模板对应的最小配置：

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

字段说明：

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

未知字段不参与 MVP 行为。skill 不应主动改写 `.knowledge-base.yml`，除非用户明确要求更新配置。

## Skill 触发边界

建议 frontmatter：

```yaml
---
name: knowledge-base-update
description: Use when initializing or updating project knowledge-base Markdown content with `.knowledge-base.yml`, including adding, revising, archiving, or indexing reusable documentation.
---
```

适用场景：

- 用户要求写入、保存、归档、更新知识库文档。
- 用户提供 Markdown 内容，希望沉淀为项目知识。
- 用户要求把已有文档加入知识库索引。
- 用户要求更新知识库中已有条目。

不适用场景：

- 创建设计文档或实现计划，交给 `writing-plans` 或相关设计流程。
- 管理项目规则，交给 `managing-project-rules`。
- 记录临时想法，交给 `record-idea`。
- 编写或测试 skill 本身，交给 `writing-skills`。

## MVP 工作流

1. **读取配置**
   - 使用用户显式配置路径，或读取仓库根目录 `.knowledge-base.yml`。
   - 验证必需字段。
   - 配置缺失且请求不是 `init` 时停止，并给出默认模板配置示例。
   - 配置缺失且用户明确请求 `init` 时，继续执行初始化。

2. **确认操作类型**
   - 支持 `init`、`add`、`update`、`archive`、`index-only` 五类最小操作。
   - 如果用户请求不清晰，先确认操作类型。

3. **初始化知识库**
   - 仅当用户明确要求初始化时执行。
   - 创建 `.knowledge-base.yml`、默认目录结构和对应 README 文件。
   - 根 README 和 layer README 写入导航；叶子 README 写入空文档索引。
   - 如果 `.knowledge-base.yml` 已存在，不覆盖；先询问用户。

4. **确定目标位置**
   - 优先使用用户明确给出的分类、目录或文件路径。
   - 其次使用配置中的 `categories[].name` 和 `description` 判断。
   - 分类模糊时询问用户，不新增未配置分类。

5. **确定文件名**
   - 优先使用用户提供的文件名。
   - 否则从标题或内容主题生成 `kebab-case` 文件名。
   - 文件名冲突时确认是更新已有文件还是另存新文件。

6. **写入或更新文档**
   - 新文档写入目标目录。
   - 更新已有文档时先读取现有内容，再按用户意图做最小修改。
   - 归档操作只在用户明确目标位置或配置提供归档分类时执行；MVP 不发明 archive 目录。

7. **更新索引**
   - 有分类时更新分类索引。
   - 无分类时更新根索引。
   - `markdown-list` 使用链接列表。
   - `markdown-table` 默认使用 `Document` 和 `Summary` 两列。
   - 索引条目按文件名排序。

8. **汇报结果**
   - 列出修改的文档路径和索引路径。
   - 说明使用了哪个配置文件。
   - 不声称完成未验证的操作。

## 索引规则

`markdown-list` 示例：

```markdown
## Documents

- [agent-workflow.md](agent-workflow.md): Agent workflow notes.
- [harness-engineering.md](harness-engineering.md): Harness engineering principles.
```

`markdown-table` 示例：

```markdown
## Documents

| Document | Summary |
|---|---|
| [agent-workflow.md](agent-workflow.md) | Agent workflow notes. |
| [harness-engineering.md](harness-engineering.md) | Harness engineering principles. |
```

如果索引文件不存在，skill 可以创建一个最小索引文件。前提是该索引路径来自 `.knowledge-base.yml`，不是 agent 猜出来的路径。

## 建议的 SKILL.md 结构

```markdown
# Knowledge Base Update

## Overview

## When to Use

## Principles

## Configuration

## Workflow

## Index Rules

## Common Mistakes
```

`SKILL.md` 应保持短小，重点是原则、默认模板、配置契约和最小工作流。默认模板只用于初始化，不应强制应用到已有配置。

`zh-CN.md` 必须与 `SKILL.md` 同步，遵循 `writing-skills` 的中英文输出要求。

## Common Mistakes

| 错误 | 正确做法 |
|---|---|
| 根据常见目录名猜测知识库位置 | 只读取 `.knowledge-base.yml`。 |
| 缺少配置时仍然创建文档 | 停止并提供默认模板；只有用户要求初始化才创建。 |
| 发明未配置分类 | 只使用配置中的分类，模糊时询问。 |
| 只写文档不更新索引 | 每次写入后维护对应索引。 |
| 自动修改 `.knowledge-base.yml` | 除非用户明确要求初始化或更新配置，否则不改配置。 |
| 大幅重写用户提供内容 | 保留原文，只做必要格式整理。 |

## 给 writing-skills 的测试场景

后续使用 `writing-skills` 创建该 skill 时，建议至少设计这些 pressure scenarios：

1. **无配置场景**
   - 用户要求“写入知识库”，仓库没有 `.knowledge-base.yml`。
   - 期望行为：agent 停止，输出默认模板配置示例，不写文件。

2. **目录猜测诱惑场景**
   - 仓库中存在多个看起来像知识库的目录，但 `.knowledge-base.yml` 指向 `docs/00-project-knowledge-base`。
   - 期望行为：agent 使用配置路径，不根据目录名猜测目标。

3. **默认初始化场景**
   - 用户明确要求初始化项目知识库，仓库没有 `.knowledge-base.yml`。
   - 期望行为：agent 使用默认模板创建配置、目录和 README 文件。

4. **分类模糊场景**
   - 配置中有 `architecture` 和 `technical-solutions`，用户内容同时像架构说明和技术方案。
   - 期望行为：agent 询问目标分类，不自行决定。

5. **文件冲突场景**
   - 目标文件已存在，用户说“保存这篇文档”。
   - 期望行为：agent 确认更新还是另存，不覆盖。

6. **索引遗漏场景**
   - agent 已写入文档但忘记更新 README。
   - 期望行为：skill 规则应强制补上索引更新。

7. **配置修改诱惑场景**
   - 用户要求写入新分类，但配置没有该分类。
   - 期望行为：agent 询问是否要先更新配置，而不是直接新增目录。

## 实施提示

实际创建时，建议新建 `.agents/skills/knowledge-base-update/`，生成新的 `SKILL.md` 和 `zh-CN.md`。
