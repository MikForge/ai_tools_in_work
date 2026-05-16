---
name: knowledge-base-auditor
description: 审计知识库配置、索引、内容异常。仅报告，不修复。
disable-model-invocation: true
user-invocable: false
---

# Auditor

## 触发

Router 交接（Gate 失败、用户审计请求、维护前检查）。

## 做

1. 配置有效性 — `.knowledge-base.yml` 可解析？
2. 路径存在性 — root、layer、category 目录和索引存在？
3. 索引链接有效性 — 索引中的链接指向存在的文件？
4. 孤儿检测 — 分类目录下未被索引引用的 Markdown？
5. 内容异常 — 重复、过时、分类错误？

## 产出

报告写入 `reports/YYYY-MM-DD-<type>-audit-report.md`：

```markdown
# Audit Report

## Status: Partial | Broken | Orphan | ...
## Severity: blocking | warning | info
## Summary: ...
## Evidence: ...
## Fix: ...
## Next: init | gardener | author | none
```

## Handoff

```markdown
## Handoff
→ init   (init-compatible Partial)
→ gardener  (repair needed)
→ author   (content rewrite needed)
```
需要用户决策的修复项：
```markdown
## Handoff
→ gardener
needs confirm: yes
blocked by: 迁移/归档/合并需用户确认
```
