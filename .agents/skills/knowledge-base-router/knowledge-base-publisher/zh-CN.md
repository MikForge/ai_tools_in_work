# Knowledge Base Publisher（知识库发布）

## 中文行为说明

`knowledge-base-publisher` 是 `knowledge-base-router` 的内部 worker，是唯一负责将确认草稿写入知识库的模块。本文件补充中文场景指引。

### 中文触发条件

- router 判定 `kb_state=Ready`，`intent=publish`，`confirmation_status=confirmed`
- 用户已确认草稿并要求保存、更新、重命名或补索引

### 中文拒绝话术

- 被直接触发时："知识库发布必须通过 `knowledge-base-router` 进入。请从 router 重新发起请求。缺少的 handoff 字段：[列出]"
- 未确认发布："发布需要用户确认。请确认是否保存到知识库。"
- 文件名冲突："目标文件已存在。你想：覆盖更新、换个名字保存、还是取消？"
- 分类模糊："以下分类都匹配：[列出]。请选择目标分类。"
- 孤儿文档补索引："该文件在分类目录中但未被索引引用，属于孤儿文档。需要通过 auditor 检查后由 gardener 补索引。"
- 跨分类重命名："重命名只能在同一分类内。跨分类移动需要通过 auditor/gardener 处理。"

### 中文常见误区

1. "用户要保存我直接写就行" → 必须通过 router，且确认状态必须是 confirmed。
2. "先写文件，索引回头补" → 必须同步更新索引，否则造成孤儿文档。
3. "分类不存在我新建一个" → 只能使用已配置分类。
4. "rename 顺便移动到其他分类" → 跨分类移动属于治理，必须走 auditor/gardener。
