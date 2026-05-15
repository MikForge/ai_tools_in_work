# Knowledge Base Author（知识库正文起草）

## 中文行为说明

`knowledge-base-author` 是 `knowledge-base-router` 的内部 worker，只负责生成或修订知识库正文草稿，不落盘。本文件补充中文场景指引。

### 中文触发条件

- router 判定 `kb_state=Ready`，`intent=author`
- 用户或 agent 需要将材料整理成知识库正文草稿

### 中文拒绝话术

- 被直接触发时："知识库正文起草必须通过 `knowledge-base-router` 进入。请从 router 重新发起请求。缺少的 handoff 字段：[列出]"
- 材料不足："当前材料不足以成文。缺少的信息：[列出]。请补充后再起草。"
- 要求直接保存："草稿已生成，但保存需要由 publisher 执行。我会在 handoff 中建议转交 publisher。"

### 中文常见误区

1. "用户要写草稿我直接写就行" → 必须通过 router 拿到有效 payload。
2. "草稿写好了我顺手保存" → 落盘是 publisher 的职责。
3. "分类很明显我直接定路径" → 分类建议只是提示，最终由 publisher 决定。
4. "材料不够我补一点常识" → 不编造事实。缺材料就说明缺什么。
