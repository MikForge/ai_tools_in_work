# Knowledge Base Context Skill 设计

**日期**：2026-05-15
**状态**：design
**Parent spec**：[知识库 Skill Harness 架构索引](2026-05-15-knowledge-base-skill-architecture-design.md)
**Contract**：[Knowledge Base 共享契约设计](2026-05-15-knowledge-base-contract-design.md)
**Refines**：`knowledge-base-context`

---

## 目标

`knowledge-base-context` 是 `knowledge-base-router` package 内部的 skill-shaped internal instruction module，用于按 router handoff 按需加载项目知识库正文或摘要。它解决“Agent 不知道看什么、怎么找”的问题，但不能写文件、不能直接扫描目录、不能把全库塞进上下文。

---

## 输入输出

输入：

- `query`：搜索关键词，可选。
- `category`：分类名，可选。
- `path`：明确正文路径，可选，但必须位于配置 root 和 category 下。
- `knowledge-base-router` 传入的标准 `Worker Handoff Payload`。

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

## Handoff Payload 约束

`knowledge-base-context` 只接受符合 router spec 中 `Worker Handoff Payload Contract` 的 payload。

通用字段要求：

- `source` 必须是 `knowledge-base-router`。
- `request_origin` 必须保留原始外部来源，不得由 context 覆盖。
- `intent` 必须是 `read`。
- `kb_state` 必须是 `Ready`。
- `target_worker` 必须是 `knowledge-base-context`。
- `confirmation_status` 必须是 `not_required` 或 `confirmed`；若为 `required`，context 不执行。
- `missing_fields` 非空时，context 只报告缺失字段，不读取正文。

`worker_payload` 要求：

- `mode` 必须存在，且只能是 `browse`、`search`、`category-search` 或 `exact-path`。
- `search` 必须带 `query`。
- `category-search` 必须带 `query` 和 `category`。
- `exact-path` 必须带 `path`。
- `max_full_documents` 默认 3，不能超过 3。

context 输出 handoff recommendation 时，不得覆盖 `request_origin`；需要 author、auditor 或用户澄清时，只输出 recommendation，不自行启动下一个 worker。

---

## 模式

| 模式 | 触发 | 行为 |
| --- | --- | --- |
| 浏览模式 | 无 query/category/path | 从 root index 开始逐层展示 |
| 搜索模式 | 有 query | 通过配置分类和已配置分类索引做索引级搜索，再按命中加载正文 |
| 分类限定搜索 | 有 query + category | 跳过分类匹配，只读指定分类索引 |
| 精确路径加载 | 有 path | 校验路径属于配置 root 和分类，且被分类索引引用，再读取 |

---

## 搜索流程

1. 读取 `.knowledge-base.yml`。
2. 读取 root index。
3. 根据 query 匹配 `categories[].name` 和 `description`，得到候选分类。
4. 若用户指定 category，只使用该分类；若分类多命中且用户意图需要精确分类，列出候选让用户选择。
5. 若分类未命中或 query 更像主题搜索，遍历所有已配置 category index 的索引条目做索引级搜索。
6. 对候选分类，先根据 `categories[].path` 的第一段读取并验证 layer index。
7. 读取 category index。
8. 在 category index 中按文件名、链接文本、摘要匹配正文。
9. 加载最相关的 1-3 篇全文。
10. 其余命中只返回标题、路径和摘要。

搜索可以遍历已配置的 category index，但不得跳过分类索引直接读取目录文件清单。

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

目标 skill-shaped internal instruction module：

```yaml
name: knowledge-base-context
description: Use only when knowledge-base-router hands off a project knowledge-base read, search, browse, or context-loading request without file changes.
```

Writing Skills 参数：

| 参数 | 值 |
| --- | --- |
| Skill 名称 | `knowledge-base-context` |
| Skill 类型 | Technique |
| 触发条件 | `knowledge-base-router` 判定为 read/search/browse/context-loading，并传入 query、category 或 path handoff。 |
| 要解决的具体问题 | 防止 agent 不知道看什么、直接扫正文目录、加载过多文档或编造不存在的知识。 |
| 反面案例 | 用户或 agent 直接提出知识库查询请求时，应先进入 router；写入、发布、修复、迁移或去重不由 context 执行。 |
| 已知 rationalization | “只是读不用 router”、“索引可能不全所以直接 find”、“多读点全文更稳”、“路径在目录里就可以读”。 |
| 代码示例场景 | 用户问“有没有构建配置”，context 读取配置和索引，最多加载 3 篇相关正文，其余只列标题/路径/摘要。 |

目标目录：

```text
.agents/skills/knowledge-base-router/knowledge-base-context/
├── SKILL.md
├── zh-CN.md
└── agents/
    └── openai.yaml
```

调用控制：

- 目录名必须是 `knowledge-base-context`，与 `SKILL.md` frontmatter 的 `name` 一致。
- `agents/openai.yaml` 必须设置 `policy.allow_implicit_invocation: false`。
- 如目标运行时支持 Claude Code 扩展，`SKILL.md` frontmatter 应设置 `disable-model-invocation: true` 和 `user-invocable: false`。
- 缺少符合 router spec 的 `Worker Handoff Payload`，或缺少 `source`、`request_origin`、`intent`、`kb_state`、`target_worker`、`confirmation_status`、`worker_payload.mode` 时，必须拒绝执行并要求先进入 router。

`SKILL.md` 必备章节：

- Overview
- When to Use
- Invocation Control
- Handoff Payload Validation
- Read-Only Contract
- Browse Mode
- Search Mode
- Exact Path Mode
- Output Format
- Failure Handoffs
- Common Mistakes

依赖契约章节：

- 落地 reference：`../references/contract.md`
- [配置契约](2026-05-15-knowledge-base-contract-design.md#配置契约)
- [索引模型](2026-05-15-knowledge-base-contract-design.md#索引模型)
- [Audit Report Protocol](2026-05-15-knowledge-base-contract-design.md#audit-report-protocol)
