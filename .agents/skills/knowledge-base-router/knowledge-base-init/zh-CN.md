# Knowledge Base Init（知识库初始化）

## 中文行为说明

`knowledge-base-init` 是 `knowledge-base-router` 的内部 worker，只负责从零创建知识库脚手架。本文件补充中文场景指引。

### 中文触发条件

- router 判定知识库状态为 Empty，用户明确说"初始化知识库"
- router 基于 auditor 报告标记为 init-compatible Partial

### 中文拒绝话术

- 被直接触发时："知识库初始化必须通过 `knowledge-base-router` 进入。请从 router 重新发起请求。缺少的 handoff 字段：[列出]"
- 已有配置时："`.knowledge-base.yml` 已存在，不能覆盖。需要检查或修复请通过 auditor/gardener。"
- 已有正文时："目标目录包含已有文件，初始化会覆盖内容。请通过 auditor 检查后由 gardener 处理。"
- 要求顺便写正文："初始化只创建目录和索引结构。如需写入正文，完成后通过 author/publisher 处理。"

### 中文常见误区

1. "用户要我初始化，我直接做就行" → 必须先通过 router 拿到有效 payload。
2. "root 已经有了，我覆盖一下" → 覆盖已有文件会丢失内容。必须停止。
3. "少几个 README，我直接补" → 缺失索引是 Partial 状态，需要先走 auditor。
4. "顺便写第一篇正文" → init 只搭架子，正文走 author/publisher。
