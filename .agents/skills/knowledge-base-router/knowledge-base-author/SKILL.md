---
name: knowledge-base-author
description: 将源材料整理为知识库 Markdown 草稿。不写入磁盘。
disable-model-invocation: true
user-invocable: false
---

# Author

## 触发

Router 交接，带 `source_material`（用户材料、代码分析、会话记录）和 `writing_goal`（new-draft / revise / summarize）。

## 做

1. 读取 [00-markdown-templates.md](../references/00-markdown-templates.md) 和 [00-spec-markdown-name.md](../references/00-spec-markdown-name.md)
2. 选择文档类型、加载模板
3. 从 source_material 起草 Markdown
4. 生成 suggested_title（`类型-主题-行为.md`）和 suggested_category

## 产出

草稿内容 + suggested_category + suggested_title + suggested_summary。

## Handoff

```markdown
## Handoff
→ publisher
```
阻塞时：
```markdown
## Handoff
→ publisher
needs confirm: yes
blocked by: 分类歧义 / 文件名冲突 / 材料不足
```
