# Knowledge Base Read Skill 设计

## 背景

`knowledge-base-read` 是按需从项目知识库加载相关文档并注入当前上下文的只读 skill。供其他 agent/skill 在执行任务前拉取背景知识，无副作用。

知识库结构由项目根目录 `.knowledge-base.yml` 定义。如果配置文件不存在，停止并提示用户先通过 `knowledge-base-update` 初始化知识库。

## 触发边界

```yaml
---
name: knowledge-base-read
description: Use when needing to load relevant project knowledge from the knowledge base into context — search docs, find background info, or understand project conventions before starting work. Pure read, no side effects.
---
```

适用场景：

- 其他 skill 在执行前需要加载项目背景知识。
- 用户询问"项目有没有关于 X 的文档"。
- Agent 需要了解项目规范、架构或历史决策。
- 在执行实现任务前，自动拉取相关上下文。

不适用场景：

- 写入或修改知识库文档（→ `knowledge-base-update`）。
- 管理项目规则（→ `managing-project-rules`）。

## MVP 工作流

核心流程遵循[自顶向下搜索索引原则](#自顶向下搜索索引原则)，步骤如下：

1. **读取配置** — 读取 `.knowledge-base.yml`，解析 `root`、`categories`。不存在则停止并建议先通过 `knowledge-base-update` 初始化。
2. **确定模式**
   - 有 `query`（agent 调用 / 用户明确查询）→ 进入搜索模式，执行步骤 3-5
   - 无 `query`（用户裸调 `/knowledge-base-read`）→ 进入浏览模式，从根索引开始逐层展示，让用户选择下钻
3. **匹配分类** — 根据 query 在 `categories[].name` 和 `description` 中匹配目标分类。模糊时列出候选让用户选。
4. **读取分类索引** — 读取 `{category}/README.md`，获取文档列表。
5. **匹配文档** — 文件名关键词 → 索引入口标题 → 文档首段关键词，三级匹配。
6. **加载并输出** — 按[输出格式](#输出格式)返回结果。

## 自顶向下搜索索引原则

知识库采用层级索引结构，搜索和导航必须遵循自顶向下原则，不可跳过中间层级直接扫描文件目录。

### 索引层级

```text
.knowledge-base.yml          ← 配置入口：root、categories、index
    │
    ▼
{root}/README.md             ← 根索引：三层入口 + 分类链接
    │
    ▼
{root}/{layer}/README.md     ← 层索引：该层下的分类链接
    │
    ▼
{root}/{category}/README.md  ← 分类索引：该分类下的文档列表（最终文档清单）
```

### 搜索流程

1. **读取配置** — 解析 `.knowledge-base.yml`，获取 `root` 和 `categories`
2. **读取根索引** — 读取 `{root}/README.md`，获取三层结构和分类概览
3. **匹配分类** — 根据用户查询，在分类名称和描述中匹配目标分类
4. **读取分类索引** — 读取 `{root}/{category}/README.md`，获取该分类下的文档列表
5. **匹配文档** — 在文档列表中通过标题和摘要匹配目标文档
6. **加载文档** — 读取匹配文档的完整内容

### 关键规则

- **逐级下钻，不跳级。** 根索引 → 分类索引 → 文档内容，每一步都依赖上一级的索引导航。
- **索引是唯一入口。** 文档发现必须通过 README.md 索引，不直接 `ls` 或 `find` 目录。
- **分类索引即文档清单。** `{category}/README.md` 是本分类下全部文档的权威列表，不存在索引之外的"隐藏文档"。
- **模糊匹配时向上确认。** 查询匹配多个分类时，罗列候选分类让用户选择，确认后继续下钻。

### 浏览 vs 搜索

| 模式 | 触发条件 | 行为 |
| --- | --- | --- |
| **浏览模式** | 无 `query` 参数 | 从 `{root}/README.md` 开始，逐层展示（根 → 层 → 分类 → 文档），每层让用户选择 |
| **搜索模式** | 有 `query` 参数 | 直接匹配分类 → 读分类索引 → 匹配文档，返回结果 |

层索引（`{layer}/README.md`）仅用于浏览模式中的导航展示；搜索模式下从分类名称/描述直接定位分类索引，跳过层索引。

## 输入参数

| 参数 | 必需 | 类型 | 说明 |
| --- | --- | --- | --- |
| `query` | 否 | string | 搜索关键词。有值时进入搜索模式，空时进入浏览模式 |
| `category` | 否 | string | 指定分类名，跳过分类匹配步骤，直接在该分类下搜索 |

示例：

- `/knowledge-base-read` — 浏览模式，从根索引导航
- `/knowledge-base-read 构建配置` — 搜索模式，匹配分类后返回结果
- Agent invoke: `skill("knowledge-base-read", { query: "middleware config" })` — 程序化调用

## 输出格式

### 搜索模式输出

```markdown
## Knowledge Base Results: "<query>"

### 匹配文档（全文加载）

- **[document-title.md]({root}/{category}/document-title.md)** — <category 名称>
  <文档完整内容>

### 其他匹配（仅摘要）

- **[another-doc.md]({root}/{category}/another-doc.md)** — <一句话摘要>
```

规则：

- 最多 3 篇全文加载，其余只返回标题 + 摘要
- 每篇标注分类名和相对路径
- 无匹配时输出：`未找到与 "<query>" 相关的文档。`

### 浏览模式输出

从根索引开始，逐层展示当前层级的链接列表，每次只展示一层，等待用户选择后继续下钻。到达分类索引后列出文档列表，用户选择后加载全文。

## Common Mistakes

| 错误 | 正确做法 |
| --- | --- |
| 跳过配置直接搜索目录 | 只读取 `.knowledge-base.yml` 指向的路径 |
| 跳过索引直接 `ls` / `find` 目录 | 文档发现必须通过 README.md 索引 |
| 加载过多文档塞满上下文 | 最多 3 篇全文，其余只返回摘要 |
| 未匹配到文档时编造内容 | 明确告知"未找到相关文档"，不杜撰 |
| 配置不存在时尝试自行查找目录 | 停止并建议通过 `knowledge-base-update` 初始化 |
| 跨分类匹配时自行决定进哪个分类 | 列出候选分类询问用户 |

## 测试场景

1. **正常匹配场景**
   - 用户查询"项目有没有关于构建配置的文档"。
   - 期望行为：agent 在 `middleware-config` 分类下搜索，通过分类索引匹配文档，返回标题和摘要。

2. **跨分类匹配场景**
   - 用户查询同时匹配 `architecture` 和 `technical-solutions` 分类。
   - 期望行为：agent 列出候选分类询问用户，而不是自行决定。

3. **无匹配结果场景**
   - 用户查询的知识库中不存在。
   - 期望行为：agent 明确告知"未找到相关文档"，不编造内容。

4. **多文档命中场景**
   - 查询匹配 5 篇以上文档。
   - 期望行为：agent 加载最相关的 1-3 篇全文，其余只返回标题和摘要。

5. **自顶向下浏览场景**
   - 用户裸调 `/knowledge-base-read`，无 query 参数。
   - 期望行为：展示根索引的三层结构，用户选择层 → 展示该层下的分类，用户选择分类 → 展示文档列表，用户选择文档 → 加载全文。

6. **Agent 程序调用场景**
   - 另一 skill 调用 `skill("knowledge-base-read", { query: "coding standards" })`。
   - 期望行为：静默搜索，不进入交互式浏览，直接返回匹配文档内容。

7. **指定分类搜索场景**
   - 调用 `skill("knowledge-base-read", { query: "api", category: "api-docs" })`。
   - 期望行为：跳过分类匹配，直接在 `api-docs` 分类索引中搜索。

8. **配置不存在场景**
   - `.knowledge-base.yml` 不存在。
   - 期望行为：停止并提示"请先通过 knowledge-base-update 初始化知识库"。

9. **分类索引为空场景**
   - 匹配到分类但该分类下尚无文档。
   - 期望行为：提示"该分类下暂无文档"，不编造内容。

## Skill 目录结构

```text
.agents/skills/00-knowledge-base-read/
├── SKILL.md                    # 英文 skill 定义
└── zh-CN.md                    # 中文同步翻译
```

## 建议的 SKILL.md 结构

```markdown
# Knowledge Base Read

## Overview

## When to Use

## Principles

## Configuration

## Workflow

## Output Format
```

`SKILL.md` 应保持短小，重点是原则、配置契约和最小工作流。`zh-CN.md` 必须与 `SKILL.md` 同步，遵循 `writing-skills` 的中英文输出要求。
