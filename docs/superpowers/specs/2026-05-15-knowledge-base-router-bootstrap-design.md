# Knowledge Base Router 与 Bootstrap Gate 设计

**日期**：2026-05-15
**状态**：design
**Parent spec**：[知识库 Skill Harness 架构索引](2026-05-15-knowledge-base-skill-architecture-design.md)
**Contract**：[Knowledge Base 共享契约设计](2026-05-15-knowledge-base-contract-design.md)
**Refines**：`knowledge-base-router`

---

## 目标

`knowledge-base-router` 是知识库体系的唯一用户入口。它负责环境判定、意图识别和路由，不负责正文生成、文件写入或治理修复。

核心目标：

1. 在任何操作前执行 Bootstrap Gate。
2. 把用户意图路由到正确专职 skill。
3. 遇到 Empty、Partial、Broken 时阻断普通读写。
4. 只在必要歧义处一次问一个问题。

---

## 输入输出

输入：

- 用户请求。
- 当前仓库根目录。
- `.knowledge-base.yml` 是否存在。
- 默认 root `docs/00-project-knowledge-base/` 是否存在。

输出：

- 环境状态：Ready、Empty、Partial、Broken。
- 意图类型：init、read、author、publish、audit、maintain。
- 下一步 skill。
- 必要时的单个澄清问题。

禁止：

- 不生成正文。
- 不写文件。
- 不直接修复知识库。
- 不绕过 Bootstrap Gate。

---

## Bootstrap Gate

| 状态 | 判定 | 路由 |
| --- | --- | --- |
| Ready | `.knowledge-base.yml` 存在，root、index、categories 可解析，关键索引可达 | 正常路由 |
| Empty | `.knowledge-base.yml` 不存在，默认 root 不存在 | 明确初始化则 `knowledge-base-init`，否则询问是否初始化 |
| Partial | 只有配置或只有目录，或部分索引缺失 | `knowledge-base-auditor` report-only |
| Broken | 配置格式错误、分类路径冲突、索引不可达 | `knowledge-base-auditor` report-only |

Ready 的最低判定：

- YAML 可解析。
- `knowledge_base.root` 存在。
- root index 存在。
- categories 非空。
- 每个 category 有 `name`、`path`、`index`、`description`。

---

## 意图分类

| 用户意图 | 信号 | 路由 |
| --- | --- | --- |
| 初始化 | “初始化知识库”、“创建知识库结构” | `knowledge-base-init` |
| 查询 | “查一下”、“有没有关于 X 的文档” | `knowledge-base-context` |
| 写草稿 | “整理成知识库正文”、“写一篇知识库文档” | `knowledge-base-context(optional) -> knowledge-base-author` |
| 发布 | “保存到知识库”、“发布这篇正文” | `knowledge-base-publisher` |
| 审计 | “检查知识库”、“哪里不对劲” | `knowledge-base-auditor` |
| 治理 | “修复索引”、“去重”、“整理知识库” | `knowledge-base-auditor -> knowledge-base-gardener` |

歧义规则：

- 如果用户要求“写入知识库”但没有正文，先路由 author 生成草稿。
- 如果用户提供现成草稿并要求保存，路由 publisher。
- 如果用户说“整理一下知识库”，先路由 auditor，不直接 gardener。
- 如果用户只说“知识库”，缺操作类型时只问一个问题。

---

## 错误处理

| 场景 | 行为 |
| --- | --- |
| Empty + 读写请求 | 询问是否初始化，不自行创建 |
| Empty + 初始化请求 | 路由 `knowledge-base-init` |
| Partial/Broken + 任意读写请求 | 停止读写，路由 `knowledge-base-auditor` |
| Ready + 分类模糊 | 一次只问一个分类问题 |
| Ready + 目标文件冲突 | 路由 publisher 处理冲突确认 |

---

## 验收场景

1. 无配置无目录，用户说“查项目知识库”，router 询问是否初始化。
2. 无配置无目录，用户说“初始化知识库”，router 路由 init。
3. 有配置但 root index 缺失，用户说“保存文档”，router 路由 auditor，不写文件。
4. Ready 状态下用户说“有没有构建配置”，router 路由 context。
5. Ready 状态下用户说“整理一下知识库”，router 路由 auditor，不直接 gardener。

---

## SKILL.md 建议结构

```markdown
# Knowledge Base Router

## Overview
## Bootstrap Gate
## Intent Routing
## Clarification Rules
## Common Mistakes
## Handoff Targets
```
