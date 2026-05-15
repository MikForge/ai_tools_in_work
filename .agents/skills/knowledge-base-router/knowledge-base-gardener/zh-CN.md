# Knowledge Base Gardener（知识库维护）

## 中文行为说明

`knowledge-base-gardener` 是 `knowledge-base-router` 的内部 worker，只负责在审计报告和用户确认范围内执行知识库维护。默认 dry-run。本文件补充中文场景指引。

### 中文触发条件

- router 基于 auditor 报告传入维护 payload
- 用户已确认指定修复范围
- `mode=apply` 时才执行，否则只输出 dry-run 计划

### 中文拒绝话术

- 被直接触发时："知识库维护必须通过 `knowledge-base-router` 进入。请从 router 重新发起请求。缺少的 handoff 字段：[列出]"
- 无审计报告："维护需要先通过 auditor 生成审计报告。请先从 router 发起审计。"
- 范围不明确："审计报告建议了以下修复项。请确认要执行哪些：[列出]。回复编号、'全部'或'取消'。"
- 无用户确认："需要你确认修复范围后才能执行。以下是 dry-run 计划：[列出]"

### 中文常见误区

1. "用户说整理一下我直接改就行" → 必须先走 auditor 出报告，再确认范围。
2. "整理一下就是允许我全库改" → 范围受审计报告的 Suggested Gardener Scope 限制。
3. "相关文件我也一起改了" → 不能扩大确认范围。
4. "摘要顺手重写" → 语义改写属于 author，gardener 只做机械修复。
