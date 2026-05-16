---
name: knowledge-base-router
description: 项目知识库唯一入口。执行 Bootstrap Gate、意图路由、自动流转。
user-invocable: true
---

# Knowledge Base Router

## Bootstrap Gate

读取 `.knowledge-base.yml` 判断状态：

| 状态 | 条件 | 行为 |
|------|------|------|
| Ready | 配置可解析，root/index/categories 可到达 | 正常路由 |
| Empty | 无配置且默认 root 不存在 | 询问是否 init |
| Partial | 配置存在但索引缺失 | → auditor |
| Broken | 配置不可解析 | → auditor |

```yaml
# .knowledge-base.yml schema
knowledge_base:
  root: docs/00-project-knowledge-base
  index: README.md
  categories:
    - name: architecture          # 唯一标识
      path: 01-project-layer/03-architecture  # 相对 root
      index: README.md
      description: 用于分类匹配
```

## 路由表

| 意图 | Worker |
|------|--------|
| 读/查 | → context |
| 写草稿 | → author |
| 发布/保存 | → publisher |
| 审计/检查 | → auditor |
| 修复/维护 | → auditor → gardener |
| 初始化 | → init |

## 流转规则

Worker 完成后输出 `## Handoff` 块。Router 自动交接至下一个 worker。

**只有以下情况暂停**（worker 在 Handoff 中标注 `needs confirm: yes`）：
- 分类歧义、文件名冲突
- 修复需用户决策
- 缺少必要信息

## Handoff 格式

```markdown
## Handoff
→ <next-worker>
```
阻塞时：
```markdown
## Handoff
→ <next-worker>
needs confirm: yes
blocked by: <原因>
```
