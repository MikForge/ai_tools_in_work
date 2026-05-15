# Knowledge Base Update Skill 设计

## 背景

现有 `writing-knowledge-base` skill 面向单一项目知识库结构，硬编码了 `docs/00-project-harness-knowledge-base/`、三层目录分类和 README 表格索引规则。它适合作为项目专用 skill，但不适合作为可迁移的通用知识库写入能力。

本设计将该能力改造为新的通用 skill：`knowledge-base-update`。新 skill 只提供基础骨架和原则声明，具体知识库路径、分类和索引规则全部由项目根目录的 `.knowledge-base.yml` 声明。

## 目标

- 将 skill 名称从 `writing-knowledge-base` 改为 `knowledge-base-update`。
- 移除对任何项目目录、三层结构或固定分类体系的硬编码。
- 使用 `.knowledge-base.yml` 作为唯一默认配置入口。
- 支持新增、更新、归档 Markdown 知识文档的最小通用流程。
- 写入内容后维护配置指定的索引入口。
- 为后续使用 `writing-skills` 创建或改写 skill 提供明确输入规格。

## 非目标

- 不内置 `project-layer`、`technology-layer`、`assets-layer` 等项目专用分类。
- 不自动扫描多个候选知识库目录。
- 不在缺少配置时猜测路径或创建文档。
- 不替代 `writing-plans`、`managing-project-rules`、`record-idea` 等专门 skill。
- 不实现脚本、CLI 或自动迁移工具。
- 不在本设计阶段直接修改现有 skill 文件。

## 核心原则

1. **配置优先**：知识库结构由 `.knowledge-base.yml` 决定，skill 不硬编码项目路径。
2. **最小骨架**：skill 只定义通用操作流程和边界，不定义业务分类体系。
3. **索引即入口**：任何写入、更新或归档操作完成后，都必须维护对应索引。
4. **内容不失真**：保留用户提供的知识内容，只做必要 Markdown 格式整理。
5. **显式处理不确定性**：配置缺失、分类模糊、目标文件冲突时停止并询问，不自行猜测。
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

如果两者都不存在，skill 必须停止，不写入任何知识库文件，并输出最小配置示例请求用户补齐。

不设计多级 fallback。这样可以避免 agent 在不同项目中猜测目录结构。

## 最小配置契约

推荐最小配置：

```yaml
knowledge_base:
  root: docs/knowledgebase
  index: README.md
  filename_style: kebab-case
  index_format: markdown-list
  categories:
    - name: notes
      path: notes
      index: README.md
      description: General reusable notes and references.
    - name: decisions
      path: decisions
      index: README.md
      description: Project decisions and rationale.
```

字段说明：

| 字段 | 必需 | 说明 |
|---|---|---|
| `knowledge_base.root` | 是 | 知识库根目录，相对仓库根目录。 |
| `knowledge_base.index` | 是 | 根索引文件，通常是 `README.md`。 |
| `knowledge_base.filename_style` | 是 | 文件命名风格。MVP 只要求支持 `kebab-case`。 |
| `knowledge_base.index_format` | 是 | 索引格式。MVP 支持 `markdown-list` 或 `markdown-table`。 |
| `knowledge_base.categories` | 否 | 可选分类列表。未配置时写入根目录。 |
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
description: Use when updating project knowledge-base Markdown content in a repository that declares `.knowledge-base.yml`, including adding, revising, archiving, or indexing reusable documentation.
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
   - 配置缺失或无效时停止，并给出最小配置示例。

2. **确认操作类型**
   - 支持 `add`、`update`、`archive`、`index-only` 四类最小操作。
   - 如果用户请求不清晰，先确认操作类型。

3. **确定目标位置**
   - 优先使用用户明确给出的分类、目录或文件路径。
   - 其次使用配置中的 `categories[].name` 和 `description` 判断。
   - 分类模糊时询问用户，不新增未配置分类。

4. **确定文件名**
   - 优先使用用户提供的文件名。
   - 否则从标题或内容主题生成 `kebab-case` 文件名。
   - 文件名冲突时确认是更新已有文件还是另存新文件。

5. **写入或更新文档**
   - 新文档写入目标目录。
   - 更新已有文档时先读取现有内容，再按用户意图做最小修改。
   - 归档操作只在用户明确目标位置或配置提供归档分类时执行；MVP 不发明 archive 目录。

6. **更新索引**
   - 有分类时更新分类索引。
   - 无分类时更新根索引。
   - `markdown-list` 使用链接列表。
   - `markdown-table` 默认使用 `Document` 和 `Summary` 两列。
   - 索引条目按文件名排序。

7. **汇报结果**
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

## 需要从旧 skill 移除的内容

这些内容属于项目专用逻辑，不应进入 `knowledge-base-update`：

- 固定路径 `docs/00-project-harness-knowledge-base/`。
- 三层知识库结构图。
- `01-project-layer`、`02-technology-layer`、`03-assets-layer` 分类决策树。
- “每个子目录已有 README.md 共 10 个”的假设。
- 分类模糊时固定选择“技术层 > 资产层”的规则。
- 文件名禁止日期前缀等项目偏好，除非未来由配置声明。

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

`SKILL.md` 应保持短小，重点是原则、配置契约和最小工作流。不要复制项目专用知识库结构。

`zh-CN.md` 必须与 `SKILL.md` 同步，遵循 `writing-skills` 的中英文输出要求。

## Common Mistakes

| 错误 | 正确做法 |
|---|---|
| 沿用旧 skill 的固定知识库路径 | 只读取 `.knowledge-base.yml`。 |
| 缺少配置时仍然创建文档 | 停止并请求用户补齐配置。 |
| 发明未配置分类 | 只使用配置中的分类，模糊时询问。 |
| 只写文档不更新索引 | 每次写入后维护对应索引。 |
| 自动修改 `.knowledge-base.yml` | 除非用户明确要求，否则不改配置。 |
| 大幅重写用户提供内容 | 保留原文，只做必要格式整理。 |

## 给 writing-skills 的测试场景

后续使用 `writing-skills` 创建该 skill 时，建议至少设计这些 pressure scenarios：

1. **无配置场景**
   - 用户要求“写入知识库”，仓库没有 `.knowledge-base.yml`。
   - 期望行为：agent 停止，输出最小配置示例，不写文件。

2. **固定旧路径诱惑场景**
   - 仓库存在旧的 `docs/00-project-harness-knowledge-base/`，但 `.knowledge-base.yml` 指向 `docs/knowledgebase`。
   - 期望行为：agent 使用配置路径，不使用旧硬编码路径。

3. **分类模糊场景**
   - 配置中有 `notes` 和 `decisions`，用户内容同时像笔记和决策。
   - 期望行为：agent 询问目标分类，不自行决定。

4. **文件冲突场景**
   - 目标文件已存在，用户说“保存这篇文档”。
   - 期望行为：agent 确认更新还是另存，不覆盖。

5. **索引遗漏场景**
   - agent 已写入文档但忘记更新 README。
   - 期望行为：skill 规则应强制补上索引更新。

6. **配置修改诱惑场景**
   - 用户要求写入新分类，但配置没有该分类。
   - 期望行为：agent 询问是否要先更新配置，而不是直接新增目录。

## 实施提示

实际改写时，建议新建 `.agents/skills/knowledge-base-update/`，生成新的 `SKILL.md` 和 `zh-CN.md`。旧的 `.agents/skills/writing-knowledge-base/` 是否删除、保留别名或迁移说明，应在实现计划中单独确认，避免破坏已有调用习惯。
