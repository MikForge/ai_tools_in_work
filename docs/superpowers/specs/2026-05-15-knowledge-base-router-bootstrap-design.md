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
- 可选 payload 原材料，例如 query、草稿、审计报告或用户确认范围；执行型 `Worker Handoff Payload` 只能由 router 生成。

输出：

- 环境状态：Ready、Empty、Partial、Broken。
- 意图类型：init、read、author、publish、audit、maintain。
- 下一步 internal worker。
- 必要时的单个澄清问题。
- 触发 auditor 时的 blocking/warning/info 建议等级。
- 符合本 spec 的 `Worker Handoff Payload`；如果缺少必需字段，则不 handoff，先询问或报告。

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
| Partial | 只有配置或只有目录，或 root/index/category/layer 索引缺失 | `knowledge-base-auditor` report-only；由 auditor 判定 init-compatible 或 repair-required |
| Broken | YAML 解析失败、路径越界、分类路径冲突、配置字段非法或索引路径指向 root 外 | `knowledge-base-auditor` report-only |

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
- 缺失索引文件属于 Partial；配置不可解析、路径越界或配置内部冲突属于 Broken。
- router 只输出 Ready、Empty、Partial、Broken，不判定 Partial 子类型。
- auditor 才能根据正文候选、未知文件、孤儿文档和覆盖风险，把 Partial 判定为 init-compatible 或 repair-required。

Partial 子类型：

以下子类型由 auditor 判定。router 只能把 Bootstrap Gate 轻量证据交给 auditor，不能通过扫描正文目录自行判断。

| 子类型 | 判定 | 后续 |
| --- | --- | --- |
| init-compatible Partial | 仅缺少初始化 scaffold，且所有待写入目标不存在，或默认 root 为空/scaffold-only | auditor 报告后可由 `knowledge-base-init` 补齐 |
| repair-required Partial | 已有正文、未知文件、冲突索引、配置修正、迁移、孤儿文档或任何会覆盖既有文件的情况 | auditor 报告后只能由 `knowledge-base-gardener` 在确认范围内修复 |

### Bootstrap Gate Evidence

router 只能收集轻量证据，不能生成完整审计报告，也不能扫描正文目录或判定 Partial 子类型。

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

`knowledge-base-context(optional)` 的判定规则：

- 用户已经提供足够源材料、结论、标题和写作目标时，router 可以跳过 context，直接 handoff 给 author。
- 用户要求基于已有知识库内容进行整理、合并、修订、引用或查重时，router 必须先 handoff 给 context。
- 用户材料不足但又没有明确要读知识库时，router 只问一个缺失问题，不让 author 自行扫描目录补材料。

### Agent-Initiated Requests

| Agent 意图 | 信号 | 路由 |
| --- | --- | --- |
| 需要项目背景 | “需要读取项目知识库上下文”、“查一下模块约定” | `knowledge-base-context` |
| 沉淀当前结论 | “这次分析应该写进知识库”、“保存本轮总结” | `knowledge-base-author -> user confirmation -> knowledge-base-publisher` |
| 发布已有草稿 | “已有确认草稿，需要落到知识库” | `knowledge-base-publisher` |
| 发现知识库异常 | “索引缺失/配置不对/文档可能过期” | `knowledge-base-auditor` |
| 维护或修复 | “根据审计报告修复知识库” | `knowledge-base-auditor -> knowledge-base-gardener` |

### External Entry Rules

- 用户自然语言请求必须进入 router。
- agent 自发需要读取、写入、沉淀或维护知识库时，也必须进入 router。
- 其他 workflow/skill 想使用项目知识库时，也必须进入 router。
- internal worker 不能因为用户或 agent 的外部请求直接启动。
- internal worker 可以输出 handoff recommendation，但不能自行启动下一个 worker。
- 下一个 worker 只有在当前 router 编排链路已有完整 `Worker Handoff Payload`，且需要的用户确认已满足时，才能继续执行；否则回到 router 或用户澄清。

### Internal Worker Loading Protocol

internal worker 是 `knowledge-base-router` package 内的 skill-shaped internal instruction module：目录形态和 `SKILL.md` 写法像 skill，但不是 public top-level skill，也不是外部用户可直接触发的公共入口。router 启动 worker 时必须使用显式加载协议，不依赖模型或运行时根据自然语言自动选择 worker。

加载规则：

- router 根据 `target_worker` 读取 package-relative path：`<target_worker>/SKILL.md`，例如 `knowledge-base-context/SKILL.md`。
- 如需要中文行为说明，router 同步读取对应 worker 的 package-relative `zh-CN.md`。
- 本仓库的物理落地路径是 `.agents/skills/knowledge-base-router/<target_worker>/SKILL.md`；spec 和 worker 指令不得依赖绝对路径、`.codex/skills` symlink 或 `.claude/skills` symlink。
- 所有 worker 都必须读取或遵守 `references/contract.md`；这是 package 内共享 reference，不复制成独立 contract skill。
- router 必须向 worker 传入一个完整的 `Worker Handoff Payload` 块。
- worker 在执行前先校验 payload；校验失败时只返回缺失字段或拒绝原因，不执行正文读取、写入或修复。
- router 不通过用户原话、skill 名称猜测或隐式 invocation 启动 internal worker。

调用控制字段的用途：

- `agents/openai.yaml` 和 Claude Code frontmatter 是防止外部隐式触发的护栏，不是 router 调用 worker 的唯一机制。
- 即使运行时不支持显式子 skill 调用，router 也必须按路径加载 worker 指令和共享 reference 后继续编排。
- internal worker 被直接触发时，不能把自己当作入口补跑 Bootstrap Gate；必须提示从 `knowledge-base-router` 进入。

### Clarification Rules

- 如果用户要求“写入知识库”但没有正文，先路由 author 生成草稿。
- 如果用户提供现成草稿并要求保存，路由 publisher。
- 如果用户说“整理一下知识库”，先路由 auditor，不直接 gardener。
- 如果用户只说“知识库”，缺操作类型时只问一个问题。

---

## Handoff Targets

router 只决定下一个 worker 和 `Worker Handoff Payload`，不执行 worker 职责本身。

| target_worker | 可 handoff 条件 | 不可 handoff 条件 |
| --- | --- | --- |
| `knowledge-base-init` | `kb_state=Empty` 且用户明确初始化；或 auditor 报告 init-compatible Partial | Ready、Broken、repair-required Partial、任何会覆盖既有文件的情况 |
| `knowledge-base-context` | `kb_state=Ready` 且意图是 read/search/browse/exact-path | Empty、Partial、Broken、写入/发布/治理请求 |
| `knowledge-base-author` | `kb_state=Ready` 且需要生成或修订正文草稿 | 没有材料、要求落盘、要求修复结构异常 |
| `knowledge-base-publisher` | `kb_state=Ready`、有确认草稿或明确 rename/update 目标，或有当前发布链路内的 index-only 目标，且写入意图已确认 | 未确认发布、缺少草稿或目标、目标冲突未确认、需要跨分类迁移/去重/归档、Orphan 补索引 |
| `knowledge-base-auditor` | Empty 以外的 Gate failure、用户要求检查、维护前检查、文档异常怀疑 | 用户只是读取 Ready 知识库且无异常信号 |
| `knowledge-base-gardener` | 有 Audit Report Protocol，且用户确认 `Suggested Gardener Scope` 内的修复范围 | 无报告、无确认、要求语义改写、要求新增正文 |

---

## Worker Handoff Payload Contract

所有 `Worker Handoff Payload` 必须包含通用字段和目标 worker 的专属字段。字段缺失时，router 不得猜测；只能询问一个问题、基于上游 recommendation 补齐，或转 auditor。

通用字段：

| 字段 | 必需 | 说明 |
| --- | --- | --- |
| `source` | yes | 执行型 `Worker Handoff Payload` 的直接发送者，必须是 `knowledge-base-router` |
| `request_origin` | yes | 原始外部发起者：`user`、`agent`、`workflow` 或 `skill`；进入 worker 链路后不得覆盖 |
| `recommended_by` | no | 触发本 handoff 的上游 recommendation 来源，例如 `knowledge-base-author` 或 `knowledge-base-auditor`；不能替代 `source` |
| `intent` | yes | `init`、`read`、`author`、`publish`、`audit`、`maintain` |
| `kb_state` | yes | Bootstrap Gate 输出：Ready、Empty、Partial、Broken |
| `target_worker` | yes | 下一个 internal worker 名称 |
| `original_request` | yes | 用户、agent、workflow 或 skill 的原始请求摘要 |
| `evidence` | no | Bootstrap Gate 轻量证据；不得包含正文全文 |
| `confirmation_status` | yes | `not_required`、`required`、`confirmed` |
| `missing_fields` | no | 缺字段列表；非空时不得执行 worker |

Worker 专属字段：

| target_worker | 必需字段 | 可选字段 |
| --- | --- | --- |
| `knowledge-base-init` | `init_mode` | `default_root`、`config_template` |
| `knowledge-base-context` | `mode` | `query`、`category`、`path`、`max_full_documents` |
| `knowledge-base-author` | `source_material`、`writing_goal` | `context_documents`、`revision_target`、`suggested_category` |
| `knowledge-base-publisher` | `operation`、`draft_or_target` | `category_hint`、`filename`、`summary` |
| `knowledge-base-auditor` | `audit_reason` | `focus_paths`、`gate_evidence` |
| `knowledge-base-gardener` | `audit_report`、`approved_scope` | `report_items`、`mode` |

字段规则：

- `knowledge-base-init.init_mode` 只能是 `empty` 或 `init-compatible-partial`；Ready、Broken 或 repair-required Partial 不能 handoff 给 init。
- `source` 只能是 `knowledge-base-router`；worker 不能发出执行型 `Worker Handoff Payload`。
- `recommended_by` 记录上游 recommendation 来源；worker 继续推荐下一步时只能出现在 `Handoff Recommendation` 或让 router 写入 `recommended_by`，不能覆盖 `source`。
- `request_origin` 记录最初发起者；worker 继续推荐下一步时不能覆盖 `request_origin`。
- worker 需要 Bootstrap Gate 状态时读取通用 `kb_state`，不得另造 `bootstrap_state` 字段。
- `confirmation_status=required` 表示必须先取得确认，不得执行 worker；只有 `not_required` 或 `confirmed` 才能继续 handoff。
- `missing_fields` 非空时不得执行 worker。
- `knowledge-base-context.mode` 只能是 `browse`、`search`、`category-search` 或 `exact-path`。
- `knowledge-base-context.mode=search` 时必须有 `query`；`category-search` 时必须有 `query` 和 `category`；`exact-path` 时必须有 `path`。
- `knowledge-base-context.max_full_documents` 默认 3，不能由 router 放大为无限。
- `knowledge-base-author.writing_goal=revise` 时必须有 `revision_target`。
- `knowledge-base-publisher.operation` 只能是 `add`、`update`、`rename`、`index-only`。
- `knowledge-base-publisher.operation=add` 时必须有草稿正文和已确认的发布意图；router 可传 `category_hint`，但最终分类由 publisher 基于配置和用户确认决定。
- `knowledge-base-publisher.operation=update`、`rename`、`index-only` 时必须有目标文件或索引路径。
- `knowledge-base-publisher.operation=index-only` 只能用于当前发布、更新或重命名链路内的索引补写；既有未索引 Markdown 是 Orphan，必须走 auditor -> gardener。
- `knowledge-base-publisher.confirmation_status` 必须是 `confirmed`，才能执行任何写入，包括 add、覆盖、更新、rename 或 index-only。
- `knowledge-base-gardener.mode` 未明确为 `apply` 时，默认为 `dry-run`。
- `knowledge-base-gardener.approved_scope` 不得大于 Audit Report Protocol 的 `Suggested Gardener Scope`。
- `knowledge-base-author` 输出的分类只是建议，不得作为 publisher 的最终分类确认。

router 交给 worker 的 payload 必须使用以下块格式。通用必需字段不能省略；`missing_fields` 建议始终出现，空时为 `[]`；`evidence` 有证据时出现。`worker_payload` 中目标 worker 的必需字段不能省略，可选字段只在有值或需要显式表达空值时出现，不得为了凑字段填虚假 `null`。

````markdown
## Worker Handoff Payload

```yaml
source: knowledge-base-router
request_origin: user
intent: read
kb_state: Ready
target_worker: knowledge-base-context
original_request: "用户想查询项目知识库里是否有构建配置约定"
evidence:
  - ".knowledge-base.yml parsed"
  - "root index reachable: docs/00-project-knowledge-base/README.md"
confirmation_status: not_required
missing_fields: []
worker_payload:
  mode: search
  query: "构建配置"
  max_full_documents: 3
```
````

`worker_payload` 只放目标 worker 的专属字段。通用字段不得重复塞进 `worker_payload`。

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
worker 输出 handoff recommendation 时不需要重写 `request_origin`；router 必须从当前 payload 继承原始 `request_origin`，保持 `source=knowledge-base-router`，并按需要写入 `recommended_by` 和新的 `worker_payload`。

---

## 错误处理

| 场景 | 行为 |
| --- | --- |
| Empty + 读写请求 | 询问是否初始化，不自行创建 |
| Empty + 初始化请求 | 路由 `knowledge-base-init` |
| Partial + 初始化请求 | 先路由 `knowledge-base-auditor` 判定是否 init-compatible |
| Broken + 初始化请求 | 先路由 `knowledge-base-auditor`，不进入 init |
| Partial/Broken + 任意读写请求 | 停止读写，路由 `knowledge-base-auditor` |
| Ready + 分类模糊 | 仅当分类会影响路由或 context 范围时一次只问一个分类问题；发布分类模糊交给 publisher 基于 `category_hint`、配置和用户确认处理 |
| Ready + 目标文件冲突 | 路由 publisher 处理冲突确认 |
| `Worker Handoff Payload` 缺必需字段 | 不执行 worker，列出缺失字段；必要时问用户一个问题，或基于上游 recommendation 补齐后重新生成 payload |
| worker 建议下一步但缺用户确认 | 不继续执行，先请求确认 |

---

## 验收场景

1. 无配置无目录，用户说“查项目知识库”，router 询问是否初始化。
2. 无配置无目录，用户说“初始化知识库”，router 路由 init。
3. 有配置但 root index 缺失，用户说“保存文档”，router 路由 auditor，不写文件。
4. Ready 状态下用户说“有没有构建配置”，router 路由 context。
5. Ready 状态下用户说“整理一下知识库”，router 路由 auditor，不直接 gardener。
6. 默认 root 已存在但无配置时，router 不直接 init，先路由 auditor 判定是否 init-compatible Partial。
7. agent 需要项目知识库上下文时，router 先做 Bootstrap Gate，再用 read/search `Worker Handoff Payload` 路由 context。
8. 用户要求保存正文时，router 不直接 publisher；先做 Bootstrap Gate，并检查 publisher payload 是否包含确认草稿、operation 和确认状态。
9. author 输出 Handoff Recommendation 时，router 检查 payload 和确认状态；缺字段时不启动 publisher。
10. Broken 状态下用户要求初始化时，router 路由 auditor，不让 init 覆盖或重建。
11. Partial 状态下 router 不扫描正文目录，只把轻量证据交给 auditor 判定子类型。
12. router 启动 internal worker 时，按 `target_worker` 路径加载 worker 指令和 `references/contract.md`，并传入标准 `Worker Handoff Payload`。
13. internal worker 被用户或 agent 直接触发时，不执行任务，只说明必须先进入 `knowledge-base-router` 并列出缺少的 handoff 字段。
14. agent 要求沉淀当前结论时，router 只能先路由 author 生成草稿；未获得用户确认前，不得继续 publisher 写入。

---

## Common Mistakes

- 把 Empty 之外的初始化请求直接交给 `knowledge-base-init`。
- 为了判断 Partial 子类型去扫描 category 目录或读取正文全文。
- 把 `bootstrap_state`、`state`、`kb_status` 等临时字段混入 payload，造成与 `kb_state` 不一致。
- 看到 author 输出草稿后直接启动 publisher，而没有确认 `operation`、`draft_or_target` 和 `confirmation_status`。
- 把 `category_hint` 当成最终分类；最终分类必须由 publisher 依据配置和用户确认决定。
- 用户说“整理一下知识库”时直接启动 gardener，而没有 auditor 报告和用户确认范围。
- 把 missing_fields 当作可自行补全的提示；只要 `missing_fields` 非空，就不能执行 worker。
- 依赖模型隐式 invocation 选择 internal worker，而不是由 router 按路径加载目标 worker。
- internal worker 被外部直接触发时自行补跑 Bootstrap Gate 或继续执行任务。
- 在 worker 链路中覆盖 `request_origin`，导致用户、agent 或 workflow 的原始来源丢失。

---

## Package Layout and Invocation Control

`knowledge-base-router` 是唯一允许被用户、agent、workflow 或其他 skill 隐式触发的 public skill。所有 `knowledge-base-*` worker 都是同一个 package 下的 skill-shaped internal instruction module。

目录规则：

- 任何包含 `SKILL.md` 的目录名必须与该文件 frontmatter 的 `name` 完全一致。
- internal worker 目录必须使用完整 skill 名称，例如 `knowledge-base-context/`，不能使用 `context/` 这种短名。
- shared contract 只落成 `references/contract.md`，不是独立 skill。

调用控制：

- public router 不禁用隐式触发。
- 每个 internal worker 必须包含 `agents/openai.yaml`，并设置 `policy.allow_implicit_invocation: false`。
- 如果运行时支持 Claude Code 扩展，internal worker 的 `SKILL.md` frontmatter 应设置 `disable-model-invocation: true` 和 `user-invocable: false`。
- 即使运行时不支持调用控制字段，internal worker 正文也必须拒绝缺少完整 router `Worker Handoff Payload` 的直接外部请求。
- internal worker 被直接触发时，唯一允许的行为是说明必须先进入 `knowledge-base-router`，并列出缺少的 handoff 字段。

每个 internal worker 的 `agents/openai.yaml` 最小模板：

```yaml
policy:
  allow_implicit_invocation: false
```

如目标运行时支持 Claude Code 扩展，internal worker 的 `SKILL.md` frontmatter 至少包含：

```yaml
---
name: knowledge-base-context
description: Internal worker for knowledge-base-router. Not user-invocable; executes only with a complete Worker Handoff Payload from knowledge-base-router.
disable-model-invocation: true
user-invocable: false
---
```

上例中的 `name` 必须替换成当前 worker 目录名。`description` 必须明确该 worker 不接受外部直接请求。

---

## Skill 落地目标

目标 public skill：

```yaml
name: knowledge-base-router
description: Routes project knowledge-base requests. Use when a user, agent, workflow, or skill needs to read, write, publish, audit, maintain, or initialize the project knowledge base, or when knowledge-base state must be checked before action.
```

Writing Skills 参数：

| 参数 | 值 |
| --- | --- |
| Skill 名称 | `knowledge-base-router` |
| Skill 类型 | Discipline-enforcing |
| 触发条件 | 用户、agent、workflow 或其他 skill 提出知识库相关读、写、发布、审计、维护或初始化请求；或需要在动作前判断知识库状态。 |
| 要解决的具体问题 | 防止 agent 跳过 Bootstrap Gate、直接扫目录、直接写文件、直接调用 worker 或把治理请求路由到错误 worker。 |
| 反面案例 | 已经处于 router 编排链路内部，且 router 已生成明确 `Worker Handoff Payload` 时，不重复进入 router。 |
| 已知 rationalization | “只是查一下不用检查状态”、“我可以直接看看目录”、“先写了再补索引”。 |
| 代码示例场景 | 无 `.knowledge-base.yml` 且无默认 root 时，用户说“查项目知识库”，router 只询问是否初始化。 |

目标目录：

```text
.agents/skills/knowledge-base-router/
├── SKILL.md
├── zh-CN.md
├── references/
│   └── contract.md
├── knowledge-base-init/
│   ├── SKILL.md
│   ├── zh-CN.md
│   └── agents/openai.yaml
├── knowledge-base-context/
│   ├── SKILL.md
│   ├── zh-CN.md
│   └── agents/openai.yaml
├── knowledge-base-author/
│   ├── SKILL.md
│   ├── zh-CN.md
│   └── agents/openai.yaml
├── knowledge-base-publisher/
│   ├── SKILL.md
│   ├── zh-CN.md
│   └── agents/openai.yaml
├── knowledge-base-auditor/
│   ├── SKILL.md
│   ├── zh-CN.md
│   └── agents/openai.yaml
└── knowledge-base-gardener/
    ├── SKILL.md
    ├── zh-CN.md
    └── agents/openai.yaml
```

`SKILL.md` 必备章节：

- Overview
- When to Use
- Package Layout and Invocation Control
- Bootstrap Gate
- Bootstrap Gate Evidence
- Intent Routing
- Agent-Initiated Requests
- External Entry Rules
- Internal Worker Loading Protocol
- Clarification Rules
- Handoff Targets
- Worker Handoff Payload Contract
- Common Mistakes

依赖契约章节：

- 落地 reference：`references/contract.md`
- [配置契约](2026-05-15-knowledge-base-contract-design.md#配置契约)
- [索引模型](2026-05-15-knowledge-base-contract-design.md#索引模型)
- [Audit Report Protocol](2026-05-15-knowledge-base-contract-design.md#audit-report-protocol)
