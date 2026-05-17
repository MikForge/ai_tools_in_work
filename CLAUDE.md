# Claude Code Project Instructions

## 知识库访问规则（硬约束）

`docs/00-project-knowledge-base/` 是本项目的结构化知识库,受 `.knowledge-base.yml` 治理。以下规则是**硬约束**,不可绕过、不可合理化、不可”仅此一次”。

### 禁止的直接操作

**禁止**对 `docs/00-project-knowledge-base/` 目录下的任何文件或目录使用以下工具直接访问:

| 工具 | 禁止行为 |
| ---- | -------- |
| `Read` | 禁止直接读取知识库文件内容 |
| `Write` / `Edit` | 禁止直接创建或修改知识库文件 |
| `Bash` | 禁止用 `cat`/`grep`/`find`/`ls` 等命令直接扫描或读取知识库目录 |

### 唯一入口

所有知识库操作（读、写、查询、审计、维护、初始化）的**唯一入口**是 `knowledge-base-router` skill。包括但不限于:

- 用户要求查找/阅读知识库中的文档 → 必须进入 `knowledge-base-router`
- Agent 自发需要了解项目背景/约定 → 必须进入 `knowledge-base-router`
- 需要保存分析结论到知识库 → 必须进入 `knowledge-base-router`
- 检查知识库健康状态 → 必须进入 `knowledge-base-router`

### 读写路径

- **读取路径**: `knowledge-base-router` → Bootstrap Gate → `knowledge-base-context`（通过索引发现和读取文档）
- **写入路径**: `knowledge-base-router` → Bootstrap Gate → `knowledge-base-author`（生成草稿）→ 用户确认 → `knowledge-base-publisher`（写入正文+同步索引）
- **修复路径**: `knowledge-base-router` → Bootstrap Gate → `knowledge-base-auditor`（生成审计报告）→ 用户确认范围 → `knowledge-base-gardener`（执行修复）

### 状态阻断

- Bootstrap Gate 结果为 `Partial` 或 `Broken` 时,**不得**继续任何读写操作。
- 必须先进入 `knowledge-base-auditor`,需要修复时再由 `knowledge-base-gardener` 在用户确认范围内处理。
- `Empty` 状态时询问用户是否初始化,不得自动创建。

### 禁止的捷径

- 禁止”先用 Read 看看有什么,需要时再走 router”——连目录扫描都必须通过 router
- 禁止”先改正文、之后补索引”——正文与索引必须由 publisher 同步写入
- 禁止”只手动更新索引”——索引更新必须走 publisher 流程
- 禁止用 `Bash find`/`ls`/`grep` 扫描知识库目录来”了解一下有什么”——这等同于绕过索引系统
- 禁止认为”用户只是问一个问题,不是正式的知识库请求”而跳过 router ——凡是答案在知识库文件中的,就是知识库请求
