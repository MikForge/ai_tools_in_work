# Knowledge Base Publisher Skill 设计

**日期**：2026-05-15
**状态**：design
**Parent spec**：[知识库 Skill Harness 架构索引](2026-05-15-knowledge-base-skill-architecture-design.md)
**Contract**：[Knowledge Base 共享契约设计](2026-05-15-knowledge-base-contract-design.md)
**Refines**：`knowledge-base-publisher`

---

## 目标

`knowledge-base-publisher` 是 `knowledge-base-router` package 内部的 skill-shaped internal instruction module，也是唯一负责把确认正文草稿落盘到知识库的普通写入 worker。它负责分类、命名、冲突处理、正文写入、索引更新和发布自检。

---

## 输入输出

输入：

- Markdown 正文草稿。
- 操作类型：add、update、rename、index-only。
- `category_hint`，可选，来自用户、router 或 author 建议；不能视为最终分类。
- 文件名，可选。
- 用户确认的覆盖或另存选择。
- `knowledge-base-router` 传入的标准 `Worker Handoff Payload`。

输出：

- 写入或更新的正文路径。
- 更新的分类索引路径。
- 必要时更新的层索引或根索引路径。
- 发布自检结果。

禁止：

- 不新增未配置分类。
- 不大幅改写正文。
- 不跳过索引更新。
- 不创建缺失的 root/layer/category index 文件；缺失索引属于 auditor/gardener。
- 不做全库治理。
- 不在自检失败时宣布完成。

---

## Handoff Payload 约束

`knowledge-base-publisher` 只接受符合 router spec 中 `Worker Handoff Payload Contract` 的 payload。

通用字段要求：

- `source` 必须是 `knowledge-base-router`。
- `request_origin` 必须保留原始外部来源，不得由 publisher 覆盖。
- `intent` 必须是 `publish`。
- `kb_state` 必须是 `Ready`。
- `target_worker` 必须是 `knowledge-base-publisher`。
- `confirmation_status` 必须是 `confirmed`；否则 publisher 不执行任何写入，包括 add、update、rename 或 index-only。
- `missing_fields` 非空时，publisher 只报告缺失字段，不写文件。

`worker_payload` 要求：

- `operation` 必须存在，且只能是 `add`、`update`、`rename` 或 `index-only`。
- `draft_or_target` 必须存在；`add` 必须包含确认草稿正文，`update`、`rename` 必须包含目标文件或索引路径，`index-only` 必须包含当前发布链路内的目标文件和待补索引路径。
- `category_hint`、`filename`、`summary` 可选；`category_hint` 不能视为最终分类确认。
- `operation=index-only` 只能用于当前 add/update/rename 发布链路内的索引补写；既有未索引 Markdown 属于 Orphan，必须停止并建议 auditor -> gardener。

publisher 不输出会直接启动 gardener 或 author 的执行授权；如发现结构异常、跨分类迁移、重复合并或需要语义改写，只能输出 Handoff Recommendation 并保留 `request_origin`。

---

## 操作类型边界

| 操作 | 前置条件 | 允许行为 |
| --- | --- | --- |
| add | 有确认草稿、确认发布意图，且目标文件不存在 | 确认分类后写入正文，新增分类索引条目 |
| update | 目标文件存在且用户确认更新 | 最小覆盖目标正文，保持索引可达 |
| rename | 目标文件存在，新文件名未冲突，且分类不变 | 同分类内重命名文件并更新分类索引 |
| index-only | 当前 add/update/rename 发布链路内的目标文件已确认，正文文件存在，且只缺对应索引条目 | 只补当前发布链路内的分类索引条目，不改正文 |

跨分类移动、批量迁移、重复合并、归档不属于 publisher，必须走 `auditor -> gardener`。

---

## 发布流程

1. 读取 `.knowledge-base.yml`。
2. 解析并确认目标分类来自配置。
3. 确认或生成 `kebab-case` 文件名。
4. 检查目标文件是否存在。
5. 冲突时询问 update、save-as 或 cancel。
6. 写入正文或执行最小更新。
7. 更新分类索引。
8. 必要时补齐 layer/root 索引入口；只补链接条目，不创建缺失索引文件。
9. 执行发布自检。
10. 汇报改动文件。

---

## 分类规则

优先级：

1. 用户明确指定分类。
2. router 传入的 `category_hint` 或 author 的分类建议。
3. 根据 `categories[].name` 和 `description` 判断。

router 和 author 只能提供分类建议或 hint。publisher 必须基于 `.knowledge-base.yml` 和用户确认决定最终分类。

若多分类可匹配，publisher 必须询问。publisher 不创建新分类；用户要求新分类时，应建议先更新配置或进入后续治理流程。

---

## 冲突处理

| 场景 | 行为 |
| --- | --- |
| 目标文件不存在 | add |
| 目标文件存在且用户明确更新 | update |
| 目标文件存在但用户未说明 | 询问 update、save-as、cancel |
| 索引已有同名链接但文件不存在 | 生成 Conflict 报告，建议 auditor |
| 当前发布链路内文件存在但索引缺失 | 可在用户确认后用 index-only 补索引 |
| 既有文件存在但未被索引引用 | 视为 Orphan，停止并建议 auditor/gardener |

---

## 索引更新

publisher 只更新：

- 目标分类索引。
- 必要时的 layer/root 索引入口，仅限索引文件已存在时补链接条目。

它不做：

- 创建缺失索引文件。
- 全库重复扫描。
- 大规模排序之外的重组。
- 跨分类迁移。

分类索引条目遵循 contract 的 `markdown-list` 格式。

### `rename` 边界

`rename` 只允许同一分类内的文件重命名，并同步更新该分类索引。跨分类移动、批量迁移、合并重复文档属于 `auditor -> gardener` 治理流程。

### `index-only` 边界

`index-only` 只能处理当前 add/update/rename 发布链路内的索引补写，例如正文已由本次 publisher 流程写入或重命名成功，但分类索引条目缺失或需要重试。既有 Markdown 已位于分类目录但未被分类索引引用时，按 contract 视为 Orphan 候选，publisher 必须停止并建议 auditor -> gardener。正文文件缺失、路径不属于分类、或分类索引缺失时，publisher 也必须停止并建议 auditor/gardener。

---

## 发布自检

发布后必须检查：

- 正文文件存在。
- 正文路径位于配置 root 和目标 category 下。
- 分类来自 `.knowledge-base.yml`。
- 分类索引包含正文链接。
- 链接路径可达。
- 没有未确认覆盖。
- 对 `index-only`，正文内容未被修改。
- 对 `rename`，旧链接已移除，新链接可达。

任何一项失败，都不得宣布完成；应输出失败项和建议下一步。

---

## 验收场景

1. add 新正文后，正文文件和分类索引同时更新。
2. 文件名冲突时，publisher 停止并询问。
3. 分类未配置时，publisher 不新建分类。
4. 索引更新失败时，publisher 不宣布发布完成。
5. update 现有正文时，publisher 做最小写入并保留索引可达。
6. index-only 只补当前发布链路内的索引，不改正文。
7. rename 只允许同分类内重命名。
8. 既有未索引 Markdown 需要补索引时，publisher 不执行 index-only，建议 auditor/gardener 报告 Orphan。

---

## Skill 落地目标

目标 skill-shaped internal instruction module：

```yaml
name: knowledge-base-publisher
description: Use only when knowledge-base-router hands off a confirmed knowledge-base draft, update, rename, or same-publish-chain index-only request for a Ready project knowledge base.
```

Writing Skills 参数：

| 参数 | 值 |
| --- | --- |
| Skill 名称 | `knowledge-base-publisher` |
| Skill 类型 | Discipline-enforcing |
| 触发条件 | `knowledge-base-router` 判定 Ready，并传入确认正文草稿、更新、重命名或当前发布链路内的 index-only 请求。 |
| 要解决的具体问题 | 防止 agent 写正文却不更新索引、覆盖冲突未确认、创建未配置分类或把发布混成全库治理。 |
| 反面案例 | 用户或 agent 直接要求保存到知识库时，应先进入 router；知识库不是 Ready、缺索引文件、需要跨分类迁移/去重/归档时，不使用 publisher 直接修。 |
| 已知 rationalization | “用户要保存我可以直接 publisher”、“先写文件再说”、“索引稍后补”、“分类不存在我建一个”、“rename 顺便跨目录移动”。 |
| 代码示例场景 | 用户确认一篇草稿保存到 `architecture`，publisher 解析分类和文件名，写正文，更新分类索引并自检。 |

目标目录：

```text
.agents/skills/knowledge-base-router/knowledge-base-publisher/
├── SKILL.md
├── zh-CN.md
└── agents/
    └── openai.yaml
```

调用控制：

- 目录名必须是 `knowledge-base-publisher`，与 `SKILL.md` frontmatter 的 `name` 一致。
- `agents/openai.yaml` 必须设置 `policy.allow_implicit_invocation: false`。
- 如目标运行时支持 Claude Code 扩展，`SKILL.md` frontmatter 应设置 `disable-model-invocation: true` 和 `user-invocable: false`。
- 缺少符合 router spec 的 `Worker Handoff Payload`，缺少 `source`、`request_origin`、`intent`、`kb_state`、`target_worker`、`confirmation_status`、`worker_payload.operation`、`worker_payload.draft_or_target`，或 `confirmation_status` 不是 `confirmed` 时，必须拒绝执行并要求回到 router。

`SKILL.md` 必备章节：

- Overview
- When to Use
- Invocation Control
- Handoff Payload Validation
- Publish Inputs
- Operation Boundaries
- Category Resolution
- File Naming
- Conflict Handling
- Index Update
- Rename and Index-Only Rules
- Publish Self-Check
- Common Mistakes

依赖契约章节：

- 落地 reference：`../references/contract.md`
- [配置契约](2026-05-15-knowledge-base-contract-design.md#配置契约)
- [索引模型](2026-05-15-knowledge-base-contract-design.md#索引模型)
- [Audit Report Protocol](2026-05-15-knowledge-base-contract-design.md#audit-report-protocol)
