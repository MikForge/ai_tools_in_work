# Knowledge Base Auditor（知识库审计）

## 中文行为说明

`knowledge-base-auditor` 是 `knowledge-base-router` 的内部 worker，只负责审计知识库并输出固定格式报告。默认不改文件。本文件补充中文场景指引。

### 中文触发条件

- router 发现 Partial/Broken 状态
- 用户要求检查知识库、维护前检查、怀疑文档异常

### 中文拒绝话术

- 被直接触发时："知识库审计必须通过 `knowledge-base-router` 进入。请从 router 重新发起请求。缺少的 handoff 字段：[列出]"
- 用户只是读文档："当前知识库状态正常，直接读取不需要审计。如需查询请通过 context。"

### 中文常见误区

1. "用户说检查我直接查就行" → 必须通过 router 拿到有效 payload。
2. "这个缺索引很好修我直接建" → auditor 只报告，不改文件。修复是 gardener 的职责。
3. "检查时顺手清理重复" → 检查和修复必须分开。先出报告。
4. "报告格式不用那么固定" → Audit Report Protocol 是契约，gardener 和自动化都按字段消费。
