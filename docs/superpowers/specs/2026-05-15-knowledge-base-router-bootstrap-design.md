# Knowledge Base Router 与 Bootstrap Gate 设计

**日期**：2026-05-15
**状态**：design
**Parent spec**：[知识库 Skill Harness 架构索引](2026-05-15-knowledge-base-skill-architecture-design.md)
**Contract**：[Knowledge Base 共享契约设计](2026-05-15-knowledge-base-contract-design.md)
**Refines**：`knowledge-base-router`

---

## 目标

`knowledge-base-router` 是知识库体系的唯一公共入口。用户、agent 和其他 workflow/skill 的外部知识库请求都必须先进入 router。它负责环境判定、意图识别和路由编排，不负责正文生成、全文读取、文件写入或治理修复。

核心目标：

1. 在任何操作前执行 Bootstrap Gate。
2. 把用户或 agent 的知识库意图路由到正确 internal worker。
3. 遇到 Empty、Partial、Broken 时阻断普通读写。
4. 只在必要歧义处一次问一个问题。

---

## 输入输出

输入：

- 用户请求。
- agent 或其他 workflow/skill 发起的知识库请求。
- 当前仓库根目录。
- `.knowledge-base.yml` 是否存在。
- 默认 root `docs/00-project-knowledge-base/` 是否存在。
- 可选 handoff payload，例如 query、草稿、审计报告或用户确认范围。

输出：

- 环境状态：Ready、Empty、Partial、Broken。
- 意图类型：init、read、author、publish、audit、maintain。
- 下一步 internal worker。
- 必要时的单个澄清问题。
- 触发 auditor 时的 blocking/warning/info 建议等级。
- 符合本 spec 的 worker handoff payload；如果缺少必需字段，则不 handoff，先询问或报告。

禁止：

- 不生成正文。
- 不读取正文全文。
- 不写文件。
- 不直接修复知识库。
- 不绕过 Bootstrap Gate。
- 不把 external request 交给 worker 前省略 handoff 边界。

---

## Bootstrap Gate

| 状态 | 判定 | 路由 |
| --- | --- | --- |
| Ready | `.knowledge-base.yml` 存在，root、index、categories 可解析，关键索引可达 | 正常路由 |
| Empty | `.knowledge-base.yml` 不存在，默认 root 不存在 | 明确初始化则 `knowledge-base-init`，否则询问是否初始化 |
| Partial | 只有配置或只有目录，或部分索引缺失 | `knowledge-base-auditor` report-only；报告判定后进入 init-compatible bootstrap 或 gardener repair |
| Broken | 配置格式错误、分类路径冲突、索引不可达 | `knowledge-base-auditor` report-only |

Ready 的最低判定：

- YAML 可解析。
- `knowledge_base.root` 存在。
- root index 存在。
- categories 非空。
- 每个 category 有 `name`、`path`、`index`、`description`。
- 每个 category 的目录和 category index 存在。
- 每个 category path 对应的 layer index 存在。

Partial/Broken 的报告要求：

- 缺配置、缺 root、缺根索引、缺分类索引属于 `Severity=blocking`。
- 链接腐烂、孤儿正文、摘要缺失属于 `Severity=warning` 或 `info`，由 auditor 判定。
- router 不自行生成报告正文，只把状态和证据交给 auditor。
- 如果 Partial 只是缺少 scaffold 且不会覆盖既有文件，auditor 可以建议 `knowledge-base-init` 以 init-compatible Partial 模式补齐。
- 如果 Partial 涉及既有正文、迁移、索引修复或配置修正，auditor 必须建议 `knowledge-base-gardener`，不能让 init 接管。

Partial 子类型：

| 子类型 | 判定 | 后续 |
| --- | --- | --- |
| init-compatible Partial | 仅缺少初始化 scaffold，且所有待写入目标不存在，或默认 root 为空/scaffold-only | auditor 报告后可由 `knowledge-base-init` 补齐 |
| repair-required Partial | 已有正文、未知文件、冲突索引、配置修正、迁移、孤儿文档或任何会覆盖既有文件的情况 | auditor 报告后只能由 `knowledge-base-gardener` 在确认范围内修复 |

### Bootstrap Gate Evidence

router 只能收集轻量证据，不能生成完整审计报告，也不能扫描正文目录。

允许收集：

- `.knowledge-base.yml` 是否存在。
- YAML 是否可解析；解析失败时记录错误摘要。
- `knowledge_base.root`、`knowledge_base.index`、`categories` 是否存在。
- root、root index、layer index、category 目录、category index 的路径可达性。
- 缺失或冲突路径列表。

禁止收集：

- 不扫描 category 目录寻找正文。
- 不读取正文全文。
- 不判断重复、过期、事实漂移或内容质量。
- 不生成 Audit Report Protocol 正文；这些交给 auditor。

---

## 意图分类

| 用户意图 | 信号 | 路由 |
| --- | --- | --- |
| 初始化 | “初始化知识库”、“创建知识库结构” | `knowledge-base-init` |
| 查询 | “查一下”、“有没有关于 X 的文档” | `knowledge-base-context` |
| 写草稿 | “整理成知识库正文”、“写一篇知识库文档” | `knowledge-base-context(optional) -> knowledge-base-author` |
| 发布 | “保存到知识库”、“发布这篇正文” | `knowledge-base-publisher` |
| 审计 | “检查知识库”、“哪里不对劲” | `knowledge-base-auditor` |
| 治理 | “修复索引”、“去重”、“整理知识库” | `knowledge-base-auditor -> knowledge-base-gardener` |

Agent-initiated 请求：

| Agent 意图 | 信号 | 路由 |
| --- | --- | --- |
| 需要项目背景 | “需要读取项目知识库上下文”、“查一下模块约定” | `knowledge-base-context` |
| 沉淀当前结论 | “这次分析应该写进知识库”、“保存本轮总结” | `knowledge-base-author -> knowledge-base-publisher` |
| 发布已有草稿 | “已有确认草稿，需要落到知识库” | `knowledge-base-publisher` |
| 发现知识库异常 | “索引缺失/配置不对/文档可能过期” | `knowledge-base-auditor` |
| 维护或修复 | “根据审计报告修复知识库” | `knowledge-base-auditor -> knowledge-base-gardener` |

入口规则：

- 用户自然语言请求必须进入 router。
- agent 自发需要读取、写入、沉淀或维护知识库时，也必须进入 router。
- 其他 workflow/skill 想使用项目知识库时，也必须进入 router。
- internal worker 不能因为用户或 agent 的外部请求直接启动。
- internal worker 可以输出 handoff recommendation，但不能自行启动下一个 worker。
- 下一个 worker 只有在当前 router 编排链路已有完整 handoff payload，且需要的用户确认已满足时，才能继续执行；否则回到 router 或用户澄清。

歧义规则：

- 如果用户要求“写入知识库”但没有正文，先路由 author 生成草稿。
- 如果用户提供现成草稿并要求保存，路由 publisher。
- 如果用户说“整理一下知识库”，先路由 auditor，不直接 gardener。
- 如果用户只说“知识库”，缺操作类型时只问一个问题。

---

## Worker Handoff Payload Contract

所有 worker handoff payload 必须包含通用字段和目标 worker 的专属字段。字段缺失时，router 不得猜测；只能询问一个问题、要求上游 worker 补齐，或转 auditor。

通用字段：

| 字段 | 必需 | 说明 |
| --- | --- | --- |
| `source` | yes | `user`、`agent`、`workflow`、`knowledge-base-router`、`knowledge-base-auditor` 或 internal worker 名称 |
| `intent` | yes | `init`、`read`、`author`、`publish`、`audit`、`maintain` |
| `kb_state` | yes | Bootstrap Gate 输出：Ready、Empty、Partial、Broken |
| `target_worker` | yes | 下一个 internal worker 名称 |
| `original_request` | yes | 用户或 agent 的原始请求摘要 |
| `evidence` | no | Bootstrap Gate 轻量证据；不得包含正文全文 |
| `confirmation_status` | yes | `not_required`、`required`、`confirmed` |
| `missing_fields` | no | 缺字段列表；非空时不得执行 worker |

Worker 专属字段：

| target_worker | 必需字段 | 可选字段 |
| --- | --- | --- |
| `knowledge-base-init` | `bootstrap_state`、`init_mode` | `default_root`、`config_template` |
| `knowledge-base-context` | `mode` | `query`、`category`、`path`、`max_full_documents` |
| `knowledge-base-author` | `source_material`、`writing_goal` | `context_documents`、`revision_target`、`suggested_category` |
| `knowledge-base-publisher` | `operation`、`draft_or_target`、`confirmation_status` | `category`、`filename`、`summary` |
| `knowledge-base-auditor` | `audit_reason`、`bootstrap_state` | `focus_paths`、`gate_evidence` |
| `knowledge-base-gardener` | `audit_report`、`approved_scope`、`mode` | `report_items` |

字段规则：

- `knowledge-base-init.init_mode` 只能是 `empty` 或 `init-compatible-partial`；Ready、Broken 或 repair-required Partial 不能 handoff 给 init。
- `knowledge-base-context.mode` 只能是 `browse`、`search`、`category-search` 或 `exact-path`。
- `knowledge-base-context.mode=search` 时必须有 `query`；`category-search` 时必须有 `query` 和 `category`；`exact-path` 时必须有 `path`。
- `knowledge-base-context.max_full_documents` 默认 3，不能由 router 放大为无限。
- `knowledge-base-author.writing_goal=revise` 时必须有 `revision_target`。
- `knowledge-base-publisher.operation` 只能是 `add`、`update`、`rename`、`index-only`。
- `knowledge-base-publisher.operation=add` 时必须有草稿正文和目标分类；`update`、`rename`、`index-only` 时必须有目标文件或索引路径。
- `knowledge-base-publisher.confirmation_status` 必须是 `confirmed`，才能执行覆盖、更新、rename 或 index-only。
- `knowledge-base-gardener.mode` 未明确为 `apply` 时，默认为 `dry-run`。
- `knowledge-base-gardener.approved_scope` 不得大于 Audit Report Protocol 的 `Suggested Gardener Scope`。
- `knowledge-base-author` 输出的分类只是建议，不得作为 publisher 的最终分类确认。

Worker handoff recommendation 格式：

```markdown
## Handoff Recommendation

- From: <worker>
- Recommended next worker: <worker>
- Reason: <why this next step is needed>
- Payload delta:
  - <field>: <value or missing>
- Requires user confirmation: yes | no
- Missing fields:
  - <field>
```

handoff recommendation 不是执行授权。router 必须检查 payload、Bootstrap Gate 状态和确认状态后，才能启动下一个 worker。

---

## 错误处理

| 场景 | 行为 |
| --- | --- |
| Empty + 读写请求 | 询问是否初始化，不自行创建 |
| Empty + 初始化请求 | 路由 `knowledge-base-init` |
| Partial + 初始化请求 | 先路由 `knowledge-base-auditor` 判定是否 init-compatible |
| Partial/Broken + 任意读写请求 | 停止读写，路由 `knowledge-base-auditor` |
| Ready + 分类模糊 | 一次只问一个分类问题 |
| Ready + 目标文件冲突 | 路由 publisher 处理冲突确认 |
| worker handoff payload 缺必需字段 | 不执行 worker，列出缺失字段并问一个问题或退回上游 |
| worker 建议下一步但缺用户确认 | 不继续执行，先请求确认 |

---

## 验收场景

1. 无配置无目录，用户说“查项目知识库”，router 询问是否初始化。
2. 无配置无目录，用户说“初始化知识库”，router 路由 init。
3. 有配置但 root index 缺失，用户说“保存文档”，router 路由 auditor，不写文件。
4. Ready 状态下用户说“有没有构建配置”，router 路由 context。
5. Ready 状态下用户说“整理一下知识库”，router 路由 auditor，不直接 gardener。
6. 默认 root 已存在但无配置时，router 不直接 init，先路由 auditor 判定是否 init-compatible Partial。
7. agent 需要项目知识库上下文时，router 先做 Bootstrap Gate，再用 read/search handoff payload 路由 context。
8. 用户要求保存正文时，router 不直接 publisher；先做 Bootstrap Gate，并检查 publisher payload 是否包含确认草稿、operation 和确认状态。
9. author 输出 Handoff Recommendation 时，router 检查 payload 和确认状态；缺字段时不启动 publisher。

---

## Skill 落地目标

目标 public skill：

```yaml
name: knowledge-base-router
description: Use when a user, agent, workflow, or skill needs to read, write, publish, audit, maintain, or initialize the project knowledge base, or when knowledge-base state must be checked before action.
```

Writing Skills 参数：

| 参数 | 值 |
| --- | --- |
| Skill 名称 | `knowledge-base-router` |
| Skill 类型 | Discipline-enforcing |
| 触发条件 | 用户、agent、workflow 或其他 skill 提出知识库相关读、写、发布、审计、维护或初始化请求；或需要在动作前判断知识库状态。 |
| 要解决的具体问题 | 防止 agent 跳过 Bootstrap Gate、直接扫目录、直接写文件、直接调用 worker 或把治理请求路由到错误 worker。 |
| 反面案例 | 已经处于 router 编排链路内部，且上游已给出明确 worker handoff payload 时，不重复进入 router。 |
| 已知 rationalization | “只是查一下不用检查状态”、“我可以直接看看目录”、“先写了再补索引”。 |
| 代码示例场景 | 无 `.knowledge-base.yml` 且无默认 root 时，用户说“查项目知识库”，router 只询问是否初始化。 |

目标目录：

```text
.agents/skills/knowledge-base-router/
├── SKILL.md
├── zh-CN.md
├── references/
│   └── contract.md
├── init/
│   ├── SKILL.md
│   └── zh-CN.md
├── context/
│   ├── SKILL.md
│   └── zh-CN.md
├── author/
│   ├── SKILL.md
│   └── zh-CN.md
├── publisher/
│   ├── SKILL.md
│   └── zh-CN.md
├── auditor/
│   ├── SKILL.md
│   └── zh-CN.md
└── gardener/
    ├── SKILL.md
    └── zh-CN.md
```

`SKILL.md` 必备章节：

- Overview
- When to Use
- Bootstrap Gate
- Bootstrap Gate Evidence
- Intent Routing
- Agent-Initiated Requests
- External Entry Rules
- Clarification Rules
- Handoff Targets
- Worker Handoff Payload Contract
- Common Mistakes

依赖契约章节：

- 落地 reference：`references/contract.md`
- [配置契约](2026-05-15-knowledge-base-contract-design.md#配置契约)
- [索引模型](2026-05-15-knowledge-base-contract-design.md#索引模型)
- [Audit Report Protocol](2026-05-15-knowledge-base-contract-design.md#audit-report-protocol)
