# 知识库 Skill Harness 架构设计

**日期**：2026-05-15
**状态**：design
**知识索引**：[Harness Engineering](../../knowledgebase/harness-engineering.md)

---

## 背景

项目知识库 skill 不能只是一组“会读写 Markdown 的工具”。Agent 的典型失败包括：一步到位做太多、跳过索引直接扫目录、写完正文忘记更新 README、看到局部成功就宣布完成、治理任务未经确认就批量改库。按照 Harness Engineering 的思路，这些失败不应该靠更强模型解决，而应该靠运行环境里的约束、反馈回路、上下文工程和熵管理解决。

因此，本设计把知识库能力重构为一套 **Knowledge Base Skill Harness**：人类掌舵，Agent 执行；router 控制入口，context 按需读取，author 只产草稿，publisher 才能落盘，auditor 默认报告，gardener 在确认后维护。

---

## 目标

1. 让 Agent 能按需读取、按边界调用、低误用地完成知识库任务。
2. 把初始化、读取、写作、发布、审计、治理拆成可验证的独立 skill。
3. 用 Bootstrap Gate 防止无配置、半初始化、损坏配置下的错误写入。
4. 用发布自检和治理报告阻断“过早宣布完成”和“默默批量改库”。
5. 让普通写作路径保持轻量，不加载全库治理规则。
6. 为后续创建真实 `SKILL.md` 提供清晰职责、输入输出、禁止行为和验收场景。

---

## 范围

### 覆盖对象

- 当前仓库 `.knowledge-base.yml` 指向的知识库正文 Markdown。
- 默认初始化模板目标：`docs/00-project-knowledge-base/`。
- 根索引、层索引、分类索引，用作知识库导航和发现入口。

### 不覆盖对象

- `docs/superpowers/specs/**` 设计文档。
- `docs/superpowers/plans/**` 实现计划。
- 仓库根 README、skill 仓库索引、普通任意 Markdown。
- 分类 README 本身不视为正文文档，只视为索引。
- CI、linter、后台自动任务的具体实现。它们作为未来扩展预留。

---

## 核心原则

1. **配置是唯一入口**：知识库根目录、分类、索引位置由 `.knowledge-base.yml` 决定。
2. **索引优先发现**：读取正文必须经由配置和 README 索引，不直接 `find` 或 `ls` 扫正文目录。
3. **写作与落盘分离**：`author` 只生成草稿；`publisher` 才能写文件和更新索引。
4. **治理默认报告**：`auditor` 默认只读；`gardener` 必须基于报告或明确范围执行。
5. **不确定就停下**：操作类型、分类、目标文件、覆盖意图不清楚时，只问一个问题。
6. **失败回写规则**：每个被发现的 Agent 失败模式，都应该转化为 skill 禁止行为、Common Mistakes 或验收场景。

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

## Bootstrap Gate

router 在任何读写治理动作前，必须先判断知识库环境状态。

| 状态 | 判定 | 行为 |
| --- | --- | --- |
| Ready | `.knowledge-base.yml` 存在，root、index、categories 均可解析，关键索引可达 | 进入正常路由 |
| Empty | `.knowledge-base.yml` 不存在，默认 root 也不存在 | 明确初始化请求进入 `knowledge-base-init`；普通读写先询问是否初始化 |
| Partial | 只有配置或只有目录，或部分索引缺失 | 不运行 init 覆盖，转 `knowledge-base-auditor` 产出诊断报告 |
| Broken | 配置格式错误、分类路径冲突、索引不可达 | 停止普通操作，输出错误并转审计/修复建议 |

### `knowledge-base-init` 规则

`knowledge-base-init` 只负责从零创建知识库 harness：

- 创建 `.knowledge-base.yml`。
- 创建 root、layer、category 目录。
- 创建根索引、层索引、分类索引空模板。
- 已存在任何关键结构时默认拒绝覆盖。

它不写正文、不迁移旧文档、不合并现有目录、不修复 Partial/Broken 状态。修复类工作必须进入 `auditor -> gardener`。

---

## Skill 列表

| Skill | 职责 | 权限 |
| --- | --- | --- |
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

## 详细职责

### `knowledge-base-router`

输入：用户意图、当前仓库状态。

输出：环境状态、路由决策、下一步 skill。

禁止：

- 不生成正文。
- 不写文件。
- 不直接修复知识库。
- 不绕过 Bootstrap Gate。

### `knowledge-base-init`

输入：明确初始化请求、默认模板。

输出：`.knowledge-base.yml`、目录结构、空索引。

禁止：

- 不覆盖已有配置或目录。
- 不写正文文档。
- 不处理迁移、合并、修复。
- 不在 Partial/Broken 状态下强行初始化。

### `knowledge-base-context`

输入：query、category、path 等读取意图。

输出：匹配文档全文、摘要、索引导航结果。

规则：

- 读取 `.knowledge-base.yml`。
- 通过根索引、层索引、分类索引定位文档。
- 搜索模式最多加载 3 篇全文，其余返回标题和摘要。

禁止：

- 不直接 `find` 或 `ls` 扫正文目录发现文档。
- 不写文件。
- 不编造不存在的文档。
- 不把全库正文一次性塞进上下文。

### `knowledge-base-author`

输入：用户材料、代码分析、会话内容、`context` 读取结果。

输出：Markdown 正文草稿。

规则：

- 保留事实，不虚构来源。
- 只做必要结构化、标题化、摘要化。
- 更新已有正文时应基于已读取内容做最小改写。

禁止：

- 不落盘。
- 不更新索引。
- 不决定最终分类和文件名。
- 不把治理建议混进正文发布。

### `knowledge-base-publisher`

输入：正文草稿、目标分类、文件名、操作类型。

输出：正文文件、分类索引更新，必要时更新层索引或根索引。

规则：

- 分类必须来自 `.knowledge-base.yml`。
- 文件名遵循配置中的命名风格。
- 冲突时确认是覆盖、更新还是另存。
- 写入后必须执行发布自检。

禁止：

- 不新增未配置分类。
- 不大幅改写正文内容。
- 不跳过索引更新。
- 不在自检失败时宣布完成。

### `knowledge-base-auditor`

输入：配置、索引、正文现状。

输出：审计报告、风险等级、建议修复步骤。

检查内容：

- 配置是否可解析。
- root、layer、category、index 是否存在。
- 索引链接是否指向存在文档。
- 正文是否未被索引引用。
- 是否存在重复主题、过期内容、空索引、腐烂链接。

禁止：

- 默认不改文件。
- 不做批量重组。
- 不把建议伪装成已完成修复。

### `knowledge-base-gardener`

输入：`auditor` 报告、用户确认的修复范围。

输出：去重、迁移、索引修复、腐烂修复后的文件改动。

规则：

- 每次只执行确认范围内的维护。
- 大规模移动或合并前列出影响文件。
- 执行后重新做最小自检。

禁止：

- 不绕过审计报告或明确范围。
- 不做未确认的大规模结构改动。
- 不删除正文而不保留迁移说明或用户确认。

---

## 典型流程

### 初始化

```text
用户请求初始化
  -> knowledge-base-router
  -> Bootstrap Gate = Empty
  -> knowledge-base-init
  -> 汇报创建的配置、目录、索引
```

如果状态是 Partial 或 Broken，不进入 init，改走 `knowledge-base-auditor`。

### 查询知识

```text
用户查询 / 其他 skill 请求上下文
  -> knowledge-base-router
  -> Bootstrap Gate = Ready
  -> knowledge-base-context
  -> 返回匹配文档或摘要
```

### 新建正文

```text
用户要求沉淀知识
  -> knowledge-base-router
  -> Bootstrap Gate = Ready
  -> knowledge-base-context(optional)
  -> knowledge-base-author
  -> 用户确认草稿或直接交给 publisher
  -> knowledge-base-publisher
  -> 发布自检
```

### 更新正文

```text
用户要求更新已有知识
  -> knowledge-base-router
  -> knowledge-base-context 读取现有正文
  -> knowledge-base-author 生成最小修订草稿
  -> knowledge-base-publisher 更新正文和索引
  -> 发布自检
```

### 审计与治理

```text
用户要求检查知识库
  -> knowledge-base-router
  -> knowledge-base-auditor report-only
  -> 用户确认修复范围
  -> knowledge-base-gardener apply
  -> 最小自检
```

---

## 错误处理

| 错误类型 | 示例 | 行为 |
| --- | --- | --- |
| Empty | 用户要求读取知识库但没有配置和目录 | 询问是否初始化，不自行创建 |
| Partial | 有 `.knowledge-base.yml` 但索引缺失 | 转 `auditor` 报告，不用 init 覆盖 |
| Broken | YAML 格式错误、分类路径冲突 | 停止普通操作，输出修复建议 |
| Ambiguous | 分类、操作、目标文件不清楚 | 一次只问一个问题 |
| Conflict | 文件名冲突、索引链接冲突 | 停止并让用户选择更新、另存或取消 |
| Out of Scope | 用户想写 spec、plan、README | 告知不属于知识库正文流程 |

---

## 反馈回路

### 发布反馈

```text
author 草稿
  -> publisher 写入正文
  -> publisher 更新索引
  -> publisher 自检
     - 正文文件存在
     - 分类来自配置
     - 分类索引包含正文链接
     - 链接路径可达
     - 无未确认覆盖
  -> 成功才汇报完成
```

### 治理反馈

```text
auditor 扫描配置、索引、正文
  -> report-only
  -> 用户确认范围
  -> gardener apply
  -> gardener 最小自检
  -> 失败则回到 auditor 报告
```

### 规则反馈

当 Agent 出现新失败模式时，维护者应把失败转成以下至少一种约束：

- skill 的禁止行为。
- Common Mistakes。
- 验收场景。
- 后续自动检查器规则。

---

## 失败模式与对策

| 失败模式 | 风险 | Harness 对策 |
| --- | --- | --- |
| 一步到位 | 一个 skill 又读又写又治理，耗尽上下文 | router 分流，author/publisher/auditor/gardener 分权 |
| 过早宣布完成 | 写了正文但忘记索引 | publisher 发布自检 |
| 过早标记功能完成 | 没有验证链接和冲突 | 自检失败不得宣布完成 |
| 坏模式复制 | 复制旧目录猜测、跳过配置 | context/publisher 强制读 `.knowledge-base.yml` |
| 上下文过载 | 一次加载全库正文 | context 限制全文数量，其余摘要 |
| 治理越权 | “整理一下”导致批量改库 | auditor report-only，gardener 需确认范围 |
| init 覆盖 | 半初始化状态被重置 | Bootstrap Gate 区分 Empty 与 Partial/Broken |

---

## 验收标准

新体系满足以下条件才算设计落地：

1. Agent 能仅凭 skill 名称和 description 分辨 router、init、context、author、publisher、auditor、gardener。
2. 无知识库时，普通读写不会偷偷创建文件；明确初始化才进入 `knowledge-base-init`。
3. Partial/Broken 状态不会被 init 覆盖，而是先进入 `knowledge-base-auditor`。
4. 查询只通过 `.knowledge-base.yml` 和索引定位正文，不直接扫目录。
5. 写正文必须经过 `author -> publisher`，author 不落盘。
6. publisher 写完必须更新相关索引并执行自检。
7. auditor 默认只报告，不修改文件。
8. gardener 必须有审计报告或用户明确范围。
9. 分类模糊、文件冲突、未配置分类都必须询问。
10. 普通写作路径不加载治理规则。

---

## 后续落地顺序

后续实现应按以下顺序拆分 skill：

1. `knowledge-base-router`：先实现 Bootstrap Gate 和路由规则。
2. `knowledge-base-init`：实现 Empty 状态初始化。
3. `knowledge-base-context`：实现只读索引检索。
4. `knowledge-base-author`：实现草稿生成规范。
5. `knowledge-base-publisher`：实现写入、命名、索引、自检。
6. `knowledge-base-auditor`：实现 report-only 审计。
7. `knowledge-base-gardener`：实现确认后维护。

自动化检查器、CI 阻断、后台文档园丁任务属于第二阶段。第一阶段先把约束落到 `SKILL.md`、中英文说明和验收场景。

---

## 非目标

- 不把知识库体系扩展成全仓库 Markdown 总线。
- 不让 router 持有正文写作、发布或治理规则。
- 不让 author 直接写文件。
- 不让 publisher 做全库治理。
- 不让 auditor 默认改文件。
- 不让 init 覆盖现有配置或目录。
- 不在第一阶段实现语义向量搜索、全文索引引擎、CI linter 或后台任务。
