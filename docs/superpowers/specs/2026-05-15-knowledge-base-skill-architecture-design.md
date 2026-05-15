# 知识库 Skill Harness 架构索引

**日期**：2026-05-15
**状态**：design-index
**知识索引**：[Harness Engineering](../../knowledgebase/harness-engineering.md)

---

## 定位

这份文档是 Knowledge Base Skill Harness 的父级架构索引，不作为直接开发输入。实际开发必须进入对应子 spec，每个子 spec 以本文作为索引和全局约束来源。

父 spec 负责回答：

- 为什么知识库 skill 要采用 Harness 化架构。
- 全局分层、调用边界和不可违反的不变量是什么。
- 每个细化 spec 负责哪一块。
- 后续实现应该按什么顺序拆解。

子 spec 负责回答：

- 单个 skill 或共享契约的输入输出、流程、错误处理和验收场景。
- 该部分如何落成 `SKILL.md`、`zh-CN.md`、模板或测试提示。

---

## 背景

项目知识库 skill 不能只是一组“会读写 Markdown 的工具”。Agent 的典型失败包括：一步到位做太多、跳过索引直接扫目录、写完正文忘记更新 README、看到局部成功就宣布完成、治理任务未经确认就批量改库。按照 Harness Engineering 的思路，这些失败不应该靠更强模型解决，而应该靠运行环境里的约束、反馈回路、上下文工程和熵管理解决。

因此，本体系把知识库能力重构为 **Knowledge Base Skill Harness**：人类掌舵，Agent 执行；router 控制入口，context 按需读取，author 只产草稿，publisher 才能落盘，auditor 默认报告，gardener 在确认后维护。

---

## 子 Spec 索引

| 子 spec | 范围 | 依赖 |
| --- | --- | --- |
| [knowledge-base-contract-design](2026-05-15-knowledge-base-contract-design.md) | 共享契约：`.knowledge-base.yml`、索引层级、正文边界、命名、Audit Report Protocol | 本文 |
| [knowledge-base-router-bootstrap-design](2026-05-15-knowledge-base-router-bootstrap-design.md) | `knowledge-base-router`、Bootstrap Gate、Ready/Empty/Partial/Broken 判定、路由 | contract |
| [knowledge-base-init-design](2026-05-15-knowledge-base-init-design.md) | `knowledge-base-init` 从零创建配置、目录、索引模板 | contract、router |
| [knowledge-base-context-design](2026-05-15-knowledge-base-context-design.md) | `knowledge-base-context` 只读检索、浏览、上下文加载上限 | contract、router |
| [knowledge-base-author-design](2026-05-15-knowledge-base-author-design.md) | `knowledge-base-author` 正文草稿、事实保真、修订草稿 | contract、context |
| [knowledge-base-publisher-design](2026-05-15-knowledge-base-publisher-design.md) | `knowledge-base-publisher` 分类、命名、冲突处理、写入、索引、自检 | contract、author |
| [knowledge-base-auditor-gardener-design](2026-05-15-knowledge-base-auditor-gardener-design.md) | `knowledge-base-auditor` report-only 与 `knowledge-base-gardener` 确认后维护 | contract |

Harness 版本开发应以本索引和上表子 spec 为准。

---

## 总体架构

采用 Harness 化的 router + gate + worker 结构。

```text
knowledge-base-router
  -> Bootstrap Gate
     -> Empty: knowledge-base-init
     -> Partial/Broken: knowledge-base-auditor
     -> Ready:
        -> read/search: knowledge-base-context
        -> draft/write: knowledge-base-context(optional) -> knowledge-base-author
        -> publish: knowledge-base-publisher
        -> audit: knowledge-base-auditor
        -> maintain: knowledge-base-auditor -> knowledge-base-gardener
```

`knowledge-base-router` 是用户手动调用入口。若未来需要保留旧名 `knowledge-base`，它只能作为薄别名转发到 `knowledge-base-router`，不持有正文、发布或治理规则。

---

## 全局不变量

1. **配置是唯一入口**：知识库根目录、分类、索引位置由 `.knowledge-base.yml` 决定。
2. **索引优先发现**：读取正文必须经由配置和 README 索引，不直接 `find` 或 `ls` 扫正文目录。
3. **写作与落盘分离**：`author` 只生成草稿；`publisher` 才能写文件和更新索引。
4. **治理默认报告**：`auditor` 默认只读；`gardener` 必须基于报告或明确范围执行。
5. **Bootstrap Gate 先行**：router 在任何读写治理动作前，先判断 Ready、Empty、Partial、Broken。
6. **不确定就停下**：操作类型、分类、目标文件、覆盖意图不清楚时，一次只问一个问题。
7. **报告协议固定**：Partial、Broken、Conflict 和文档异常必须输出 contract 中定义的 Audit Report Protocol。
8. **失败回写规则**：每个被发现的 Agent 失败模式，都应该转化为 skill 禁止行为、Common Mistakes 或验收场景。

---

## Skill 列表

| Skill | 职责 | 权限 |
| --- | --- | --- |
| `knowledge-base-contract` | 共享配置、索引、命名和审计报告契约 | support reference，不直接执行业务流程 |
| `knowledge-base-router` | 环境判定、意图识别、路由 | 只读轻量状态，不写文件 |
| `knowledge-base-init` | 从零初始化配置、目录、索引模板 | 仅 Empty 状态下写结构文件 |
| `knowledge-base-context` | 按需读取知识库正文或摘要 | 只读，不直接扫目录 |
| `knowledge-base-author` | 生成或改写 Markdown 正文草稿 | 不落盘，不决定最终路径 |
| `knowledge-base-publisher` | 分类、命名、写入、冲突处理、索引更新 | 只改目标正文和相关索引 |
| `knowledge-base-auditor` | 审计配置、索引、正文一致性 | 默认只读，输出报告 |
| `knowledge-base-gardener` | 去重、迁移、索引修复、腐烂修复 | 基于报告或明确确认执行 |

---

## 分层约束

```text
router
  -> init
  -> context
  -> author
  -> publisher
  -> auditor
  -> gardener
```

约束规则：

- `router` 可以调用所有专职 skill，但不能生成正文、写文件或做治理。
- `contract` 只能作为共享 reference 被读取，不能执行用户任务。
- `init` 只能处理 Empty 状态，不能覆盖或修复 Partial/Broken。
- `context` 只读配置和索引，不调用 `publisher` 或 `gardener`。
- `author` 可以使用 `context` 的结果，但不能自己全库扫描或落盘。
- `publisher` 可读取目标文件和相关索引，但不能做全库治理。
- `auditor` 可读取全库配置、索引、正文，但默认只报告。
- `gardener` 必须基于 `auditor` 报告或用户明确范围执行。

---

## Harness 四护栏映射

| Harness 护栏 | 知识库体系落地 |
| --- | --- |
| 上下文工程 | `context` 通过 `.knowledge-base.yml` 和 README 索引逐级读取，限制全文加载数量 |
| 架构约束 | router/context/author/publisher/auditor/gardener/init 分层，明确读写权限和禁止反向越权 |
| 反馈回路 | `publisher` 发布后自检；`auditor` 把异常转成报告；失败案例回写到 skill 规则 |
| 熵管理 | `auditor` 发现重复、过期、孤儿文档、索引腐烂；`gardener` 在确认后修复 |

---

## 推荐落地顺序

1. 先实现 [knowledge-base-contract-design](2026-05-15-knowledge-base-contract-design.md)，确保所有 skill 共用同一配置、索引和报告协议。
2. 实现 [knowledge-base-router-bootstrap-design](2026-05-15-knowledge-base-router-bootstrap-design.md)，把入口和 Bootstrap Gate 固定下来。
3. 实现 [knowledge-base-init-design](2026-05-15-knowledge-base-init-design.md)，让 Empty 状态可进入 Ready。
4. 实现 [knowledge-base-context-design](2026-05-15-knowledge-base-context-design.md)，提供安全只读上下文。
5. 实现 [knowledge-base-author-design](2026-05-15-knowledge-base-author-design.md)，提供正文草稿生成。
6. 实现 [knowledge-base-publisher-design](2026-05-15-knowledge-base-publisher-design.md)，完成写入、索引和自检。
7. 实现 [knowledge-base-auditor-gardener-design](2026-05-15-knowledge-base-auditor-gardener-design.md)，补上治理和熵管理。

---

## 父 Spec 验收标准

- 子 spec 覆盖全部 skill 和共享契约。
- 每个子 spec 都引用本文作为 parent spec。
- 父 spec 不包含足以直接实现某个 skill 的全部细节，避免成为巨型开发输入。
- 所有子 spec 使用相同的 skill 名称、配置入口、索引模型和报告协议。
- 后续 implementation plan 必须选择一个子 spec 作为输入，不直接以本文作为唯一输入。

---

## 非目标

- 不把知识库体系扩展成全仓库 Markdown 总线。
- 不让 router 持有正文写作、发布或治理规则。
- 不让 author 直接写文件。
- 不让 publisher 做全库治理。
- 不让 auditor 默认改文件。
- 不让 init 覆盖现有配置或目录。
- 不在第一阶段实现语义向量搜索、全文索引引擎、CI linter 或后台任务。
