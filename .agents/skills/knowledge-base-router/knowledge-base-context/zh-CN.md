# Knowledge Base Context（知识库上下文读取）

## 中文行为说明

`knowledge-base-context` 是 `knowledge-base-router` 的内部 worker，只负责通过索引链按需加载知识库内容。本文件补充中文场景指引。

### 中文触发条件

- router 判定 `kb_state=Ready`，`intent=read`
- 用户或 agent 需要查询、搜索、浏览或精确加载知识库文档

### 中文拒绝话术

- 被直接触发时："知识库读取必须通过 `knowledge-base-router` 进入。请从 router 重新发起请求。缺少的 handoff 字段：[列出]"
- 多分类命中："以下分类都匹配你的查询，请选择：[列出候选分类]"
- path 未索引："该文件在分类目录中但未被索引引用，属于孤儿文档。建议通过 auditor 检查后补索引。"
- 链接断裂："索引中的链接指向的文件不存在，建议通过 auditor 检查。"

### 中文常见误区

1. "只是读一下，不用走 router" → 即使只读也需要 Bootstrap Gate。
2. "索引可能不全，我直接 ls 目录" → 必须通过索引发现文档。
3. "多加载几篇全文更保险" → 最多 3 篇全文，其余只列摘要。
4. "文件在分类目录里就能读" → 只有被索引引用的才是有效文档。
