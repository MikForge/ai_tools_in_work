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

1. **读取配置**
   - 读取仓库根目录 `.knowledge-base.yml`，解析 `root`、`categories`。
   - 如果 `.knowledge-base.yml` 不存在，告知用户并建议先通过 `knowledge-base-update` 初始化。

2. **匹配查询**
   - 根据用户查询在配置中匹配目标分类（通过 `categories[].name` 和 `description`）。
   - 分类模糊时，列出候选分类询问用户。

3. **搜索文档**
   - 在匹配的分类目录下搜索相关文档。
   - MVP 搜索策略：文件名关键词匹配 → 索引入口标题匹配 → 文档首段关键词匹配。
   - 不实现向量检索或全文索引。

4. **加载内容**
   - 匹配度最高的 1-3 篇文档加载全文。
   - 其余匹配文档返回标题和一句话摘要。

5. **注入上下文**
   - 将加载的内容格式化为上下文块，注入当前会话。
   - 标注文档来源路径，方便用户追溯。

## Common Mistakes

| 错误 | 正确做法 |
|---|---|
| 跳过配置直接搜索目录 | 只读取 `.knowledge-base.yml` 指向的路径。 |
| 加载过多文档塞满上下文 | 最多 3 篇全文，其余只返回摘要。 |
| 未匹配到文档时编造内容 | 明确告知"未找到相关文档"，不杜撰。 |
| 配置不存在时尝试自行查找目录 | 停止并建议通过 `knowledge-base-update` 初始化。 |

## 测试场景

1. **正常匹配场景**
   - 用户查询"项目有没有关于构建配置的文档"。
   - 期望行为：agent 在 `middleware-config` 分类下搜索，返回匹配文档的标题和摘要。

2. **跨分类匹配场景**
   - 用户查询同时匹配 `architecture` 和 `technical-solutions` 分类。
   - 期望行为：agent 列出候选分类询问用户，而不是自行决定。

3. **无匹配结果场景**
   - 用户查询的知识库中不存在。
   - 期望行为：agent 明确告知"未找到相关文档"，不编造内容。

4. **多文档命中场景**
   - 查询匹配 5 篇以上文档。
   - 期望行为：agent 加载最相关的 1-3 篇全文，其余只返回标题和摘要。

## Skill 目录结构

```text
.agents/skills/knowledge-base-read/
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
