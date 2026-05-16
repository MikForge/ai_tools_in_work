---
name: knowledge-base-context
description: 通过索引链按需读取知识库内容。只读，不扫描目录。
disable-model-invocation: true
user-invocable: false
---

# Context

## 触发

Router 交接，`kb_state=Ready`，`intent=read`。

## 做

**通过索引链发现，不扫描目录。**

- `browse` — 逐层展示：root index → layer index → category index → 文档列表
- `search` — 匹配 categories[].name/description → 读 category index → 匹配文档 title/summary → 加载全文（上限 3 篇）
- `exact-path` — 验证路径在配置 root + category 下 → 读全文

## 产出

匹配文档的 title、path、summary、全文（按需）。

## Handoff

```markdown
## Handoff
→ done
```
