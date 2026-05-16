---
name: knowledge-base-gardener
description: 基于审计报告执行知识库机械修复。默认 dry-run，不扩大范围。
disable-model-invocation: true
user-invocable: false
---

# Gardener

## 触发

Router 交接，带审计报告路径 + 用户确认的 `approved_scope`。

## 做

1. 从 `reports/` 读报告
2. Dry-run 先行：展示将要修改的文件和操作
3. Apply：仅在 approved_scope 范围内执行

**允许**：创建缺失索引、修复断链、索引孤儿文档、迁移分类、去重归档、重新排序

**禁止**：扩大范围、语义重写（→ author）、删除内容无确认

## 自检

- 修改的文件存在且可达
- 索引链接指向存在的文档
- 未修改 scope 外的文件

## Handoff

```markdown
## Handoff
→ done
```
