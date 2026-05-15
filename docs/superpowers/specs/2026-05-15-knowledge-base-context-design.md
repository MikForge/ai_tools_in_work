# Knowledge Base Context Skill 设计

**日期**：2026-05-15
**状态**：design
**Parent spec**：[知识库 Skill Harness 架构索引](2026-05-15-knowledge-base-skill-architecture-design.md)
**Contract**：[Knowledge Base 共享契约设计](2026-05-15-knowledge-base-contract-design.md)
**Refines**：`knowledge-base-context`

---

## 目标

`knowledge-base-context` 是纯只读 skill，用于按需加载项目知识库正文或摘要。它解决“Agent 不知道看什么、怎么找”的问题，但不能写文件、不能直接扫描目录、不能把全库塞进上下文。

---

## 输入输出

输入：

- `query`：搜索关键词，可选。
- `category`：分类名，可选。
- `path`：明确正文路径，可选，但必须位于配置 root 和 category 下。

输出：

- 匹配正文全文，最多 3 篇。
- 其他匹配的标题、路径、摘要。
- 无匹配时的明确空结果。
- 浏览模式下的下一层索引选项。

禁止：

- 不写文件。
- 不通过 `find` 或 `ls` 发现正文。
- 不加载无限文档。
- 不编造不存在的文档。

---

## 模式

| 模式 | 触发 | 行为 |
| --- | --- | --- |
| 浏览模式 | 无 query/category/path | 从 root index 开始逐层展示 |
| 搜索模式 | 有 query | 匹配 category -> 读分类索引 -> 匹配正文 |
| 分类限定搜索 | 有 query + category | 跳过分类匹配，只读指定分类索引 |
| 精确路径加载 | 有 path | 校验路径属于配置 root 和分类，且被分类索引引用，再读取 |

---

## 搜索流程

1. 读取 `.knowledge-base.yml`。
2. 读取 root index。
3. 根据 query 匹配 `categories[].name` 和 `description`。
4. 分类唯一命中时，根据 `categories[].path` 的第一段读取 layer index。
5. 分类多命中时列出候选，让用户选择。
6. 验证 layer index 指向目标 category index。
7. 读取 category index。
8. 在 category index 中按文件名、标题、摘要匹配正文。
9. 加载最相关的 1-3 篇全文。
10. 其余命中只返回标题、路径和摘要。

搜索不得跳过分类索引直接读取目录文件清单。

---

## 输出格式

搜索模式：

```markdown
## Knowledge Base Results: "<query>"

### Loaded Documents

- `<path>` — `<category>`

<document excerpt or full content>

### Other Matches

- `<path>`: <summary>
```

无结果：

```markdown
No knowledge base documents matched "<query>".
```

浏览模式每次只展示一层，等待用户选择后继续。

---

## 错误处理

| 场景 | 行为 |
| --- | --- |
| 配置不存在 | 返回 Bootstrap 失败，交给 router |
| 分类不存在 | 列出配置中的候选分类 |
| 分类索引缺失 | 输出 Audit Report Protocol 候选，建议 auditor |
| 文档链接断裂 | 输出 broken link 证据，建议 auditor |
| 多分类命中 | 一次只问一个分类选择问题 |
| path 未被分类索引引用 | 拒绝直接读取，建议 auditor 报告 Orphan |

---

## 验收场景

1. 查询 “architecture” 时，context 通过配置和索引找到 architecture 分类。
2. 分类索引中有 5 篇命中时，只加载最多 3 篇全文。
3. 分类模糊时，context 不自行决定，列出候选。
4. 分类索引链接断裂时，context 不编造内容，建议 auditor。
5. 精确 path 不在配置 root 下时，context 拒绝读取。
6. 精确 path 在分类目录内但未被索引引用时，context 拒绝读取并建议 auditor。

---

## Skill 落地目标

目标 skill：

```yaml
name: knowledge-base-context
description: Loads relevant project knowledge-base documents through configured indexes without side effects. Use when searching, browsing, or injecting knowledge-base context before other work.
```

目标目录：

```text
.agents/skills/knowledge-base-context/
├── SKILL.md
└── zh-CN.md
```

`SKILL.md` 必备章节：

- Overview
- When to Use
- Read-Only Contract
- Browse Mode
- Search Mode
- Exact Path Mode
- Output Format
- Failure Handoffs
- Common Mistakes

依赖 reference：

- `knowledge-base-contract/references/knowledge-base-config.md`
- `knowledge-base-contract/references/index-model.md`
- `knowledge-base-contract/references/audit-report-protocol.md`
