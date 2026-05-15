# Knowledge Base Update Skill 设计

## 背景

`knowledge-base-update` 负责在项目知识库中新增、更新、归档或索引 Markdown 文档。所有写入操作通过项目根目录 `.knowledge-base.yml` 驱动，不硬编码路径。

与之协作的 `knowledge-base-read` 是只读 skill，用于按需加载知识库内容到上下文。两个 skill 各自独立，唯一的共同点是都读取 `.knowledge-base.yml`。

知识库路径、分类和索引规则全部由 `.knowledge-base.yml` 声明。默认模板仅在 `init` 时使用（即 `.knowledge-base.yml` 和目标知识库目录均不存在时），用于创建初始配置和目录结构。默认模板的根目录是 `docs/00-project-knowledge-base/`。

## 目标

- 定义 `knowledge-base-update` skill 的完整行为规格。
- 允许默认模板初始化，但已有配置不绑定默认模板。
- 使用 `.knowledge-base.yml` 作为唯一配置入口。
- 提供 `docs/00-project-knowledge-base/` 作为默认初始化模板。
- 支持新增、更新、归档 Markdown 知识文档的最小通用流程。
- 写入内容后维护配置指定的索引入口。
- 为后续使用 `writing-skills` 创建该 skill 提供明确输入规格。

## 非目标

- 不自动扫描多个候选知识库目录。
- 不在缺少配置时猜测路径或直接创建文档。
- 不在已有 `.knowledge-base.yml` 的项目中覆盖用户配置。
- 不实现语义向量搜索或全文索引引擎。
- 不实现脚本、CLI 或自动化工具。

## 核心原则

1. **配置优先**：知识库结构由 `.knowledge-base.yml` 决定，skill 不硬编码项目路径。
2. **默认模板仅 init 时使用**：只有当 `.knowledge-base.yml` 和目标知识库目录均不存在时，才使用默认模板初始化；已有配置永远优先，不覆盖。
3. **索引即入口**：任何写入、更新或归档操作完成后，都必须维护对应索引。
4. **内容不失真**：保留用户提供的知识内容，只做必要 Markdown 格式整理。
5. **显式处理不确定性**：除明确初始化外，配置缺失、分类模糊、目标文件冲突时停止并询问，不自行猜测。
6. **最小修改面**：只修改目标文档和配置指定的索引文件。
7. **项目边界清晰**：只更新当前仓库 `.knowledge-base.yml` 指向的知识库。

`.knowledge-base.yml` 的完整约束规范（配置位置、默认模板、字段说明）见 skill 目录下的 [`knowledge-base-spec.md`](../../.agents/skills/00-knowledge-base-update/knowledge-base-spec.md)。

## 触发边界

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
- 用户要求初始化项目知识库。

不适用场景：

- 查询或搜索知识库内容（→ `knowledge-base-read`）。
- 创建设计文档或实现计划，交给 `writing-plans` 或相关设计流程。
- 管理项目规则，交给 `managing-project-rules`。
- 记录临时想法，交给 `record-idea`。
- 编写或测试 skill 本身，交给 `writing-skills`。

## MVP 工作流

1. **读取配置**
   - 读取仓库根目录 `.knowledge-base.yml`。

2. **判断是否需要初始化**
   - 同时满足以下两个条件时，需要 `init`：
     - `.knowledge-base.yml` 不存在
     - 默认知识库目标目录（`docs/00-project-knowledge-base/`）不存在
   - 需要初始化时，停止当前操作并进入初始化流程（步骤 3）。
   - 不需要初始化时，跳过步骤 3 直接进入步骤 4。
   - 已有 `.knowledge-base.yml` 但目录缺失、或目录存在但无配置，均视为异常：停止并询问用户。

3. **初始化知识库（init）**
   - 仅在步骤 2 判定需要初始化时执行。
   - 从 skill 目录复制 `knowledge-base.yml.temp` 到项目根目录，重命名为 `.knowledge-base.yml`。
   - 按照配置中的 `root` 和 `categories` 创建目录结构。
   - 根索引和 layer README 写入导航内容；叶子目录 README 写入空文档索引。
   - 初始化完成后汇报结果，询问用户是否继续执行原操作。

4. **确认操作类型**
   - 支持 `add`、`update`、`archive`、`index-only` 四类操作（`init` 已在步骤 3 单独处理）。
   - 如果用户请求不清晰，先确认操作类型。

5. **确定目标位置**
   - 优先使用用户明确给出的分类、目录或文件路径。
   - 其次使用配置中的 `categories[].name` 和 `description` 判断。
   - 分类模糊时询问用户，不新增未配置分类。

6. **确定文件名**
   - 优先使用用户提供的文件名。
   - 否则从标题或内容主题生成 `kebab-case` 文件名。
   - 文件名冲突时确认是更新已有文件还是另存新文件。

7. **写入或更新文档**
   - 新文档写入目标目录。
   - 更新已有文档时先读取现有内容，再按用户意图做最小修改。
   - 归档操作只在用户明确目标位置或配置提供归档分类时执行；MVP 不发明 archive 目录。

8. **更新索引**
   - 有分类时更新分类索引。
   - 无分类时更新根索引。
   - `markdown-list` 使用链接列表。
   - `markdown-table` 默认使用 `Document` 和 `Summary` 两列。
   - 索引条目按文件名排序。

9. **汇报结果**
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

## Common Mistakes

| 错误 | 正确做法 |
|---|---|
| 根据常见目录名猜测知识库位置 | 只读取 `.knowledge-base.yml`。 |
| 缺少配置时仍然创建文档 | 停止并提供默认模板；只有用户要求初始化才创建。 |
| 发明未配置分类 | 只使用配置中的分类，模糊时询问。 |
| 只写文档不更新索引 | 每次写入后维护对应索引。 |
| 自动修改 `.knowledge-base.yml` | 除非用户明确要求初始化或更新配置，否则不改配置。 |
| 大幅重写用户提供内容 | 保留原文，只做必要格式整理。 |

## 测试场景

1. **无配置场景**
   - 用户要求"写入知识库"，仓库没有 `.knowledge-base.yml`。
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
   - 目标文件已存在，用户说"保存这篇文档"。
   - 期望行为：agent 确认更新还是另存，不覆盖。

6. **索引遗漏场景**
   - agent 已写入文档但忘记更新 README。
   - 期望行为：skill 规则应强制补上索引更新。

7. **配置修改诱惑场景**
   - 用户要求写入新分类，但配置没有该分类。
   - 期望行为：agent 询问是否要先更新配置，而不是直接新增目录。

## Skill 目录结构

```text
.agents/skills/00-knowledge-base-update/
├── SKILL.md                    # 英文 skill 定义
├── zh-CN.md                    # 中文同步翻译
└── knowledge-base.yml.temp     # 默认配置模板，仅在 init 时使用
```

`knowledge-base.yml.temp` 的内容定义见 [`knowledge-base-spec.md`](../../.agents/skills/00-knowledge-base-update/knowledge-base-spec.md)。skill 在执行 `init` 操作时，将其内容复制到项目根目录作为 `.knowledge-base.yml`。

该文件独立于 `SKILL.md` 存在的原因是：

- `init` 时直接复制，无需从 SKILL.md 中提取代码块
- 可供人类或其他工具直接阅读配置结构
- 模板与 skill 指令解耦，各自独立维护

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

## Constraint Documents
```

`SKILL.md` 应保持短小，重点是原则、配置契约和最小工作流。`## Constraint Documents` 节索引 skill 目录下的约束文档（如 `knowledge-base-spec.md`），供 agent 按需 `Read` 加载。`zh-CN.md` 必须与 `SKILL.md` 同步，遵循 `writing-skills` 的中英文输出要求。
