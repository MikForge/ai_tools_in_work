# Knowledge Base Publisher Skill 设计

**日期**：2026-05-15
**状态**：design
**Parent spec**：[知识库 Skill Harness 架构索引](2026-05-15-knowledge-base-skill-architecture-design.md)
**Contract**：[Knowledge Base 共享契约设计](2026-05-15-knowledge-base-contract-design.md)
**Refines**：`knowledge-base-publisher`

---

## 目标

`knowledge-base-publisher` 是唯一负责把正文草稿落盘到知识库的普通写入 skill。它负责分类、命名、冲突处理、正文写入、索引更新和发布自检。

---

## 输入输出

输入：

- Markdown 正文草稿。
- 操作类型：add、update、rename、index-only。
- 目标分类，可选。
- 文件名，可选。
- 用户确认的覆盖或另存选择。

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

## 操作类型边界

| 操作 | 前置条件 | 允许行为 |
| --- | --- | --- |
| add | 目标文件不存在 | 写入正文，新增分类索引条目 |
| update | 目标文件存在且用户确认更新 | 最小覆盖目标正文，保持索引可达 |
| rename | 目标文件存在，新文件名未冲突，且分类不变 | 同分类内重命名文件并更新分类索引 |
| index-only | 文件已存在、位于分类目录、未被索引引用 | 只补分类索引条目，不改正文 |

跨分类移动、批量迁移、重复合并、归档不属于 publisher，必须走 `auditor -> gardener`。

---

## 发布流程

1. 读取 `.knowledge-base.yml`。
2. 确认目标分类来自配置。
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
2. author 的分类建议。
3. 根据 `categories[].name` 和 `description` 判断。

若多分类可匹配，publisher 必须询问。publisher 不创建新分类；用户要求新分类时，应建议先更新配置或进入后续治理流程。

---

## 冲突处理

| 场景 | 行为 |
| --- | --- |
| 目标文件不存在 | add |
| 目标文件存在且用户明确更新 | update |
| 目标文件存在但用户未说明 | 询问 update、save-as、cancel |
| 索引已有同名链接但文件不存在 | 生成 Conflict 报告，建议 auditor |
| 文件存在但索引缺失 | 可在用户确认后补索引 |

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

`index-only` 只能把已存在、位于配置分类目录内、且用户确认的正文文件加入该分类索引。正文文件缺失、路径不属于分类、或分类索引缺失时，publisher 必须停止并建议 auditor/gardener。

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
6. index-only 只补索引，不改正文。
7. rename 只允许同分类内重命名。

---

## Skill 落地目标

目标 skill：

```yaml
name: knowledge-base-publisher
description: Use when a confirmed knowledge-base draft should be added, updated, renamed, or indexed in an already bootstrapped project knowledge base.
```

Writing Skills 参数：

| 参数 | 值 |
| --- | --- |
| Skill 名称 | `knowledge-base-publisher` |
| Skill 类型 | Discipline-enforcing |
| 触发条件 | 用户已有确认正文草稿，并要求新增、更新、重命名或只补索引到 Ready 状态知识库。 |
| 要解决的具体问题 | 防止 agent 写正文却不更新索引、覆盖冲突未确认、创建未配置分类或把发布混成全库治理。 |
| 反面案例 | 知识库不是 Ready、缺索引文件、需要跨分类迁移/去重/归档时，不使用 publisher 直接修。 |
| 已知 rationalization | “先写文件再说”、“索引稍后补”、“分类不存在我建一个”、“rename 顺便跨目录移动”。 |
| 代码示例场景 | 用户确认一篇草稿保存到 `architecture`，publisher 解析分类和文件名，写正文，更新分类索引并自检。 |

目标目录：

```text
.agents/skills/knowledge-base-publisher/
├── SKILL.md
└── zh-CN.md
```

`SKILL.md` 必备章节：

- Overview
- When to Use
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

- [配置契约](2026-05-15-knowledge-base-contract-design.md#配置契约)
- [索引模型](2026-05-15-knowledge-base-contract-design.md#索引模型)
- [Audit Report Protocol](2026-05-15-knowledge-base-contract-design.md#audit-report-protocol)
