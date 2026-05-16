---
name: knowledge-base-init
description: 从 Empty 或 init-compatible Partial 状态创建知识库脚手架。
disable-model-invocation: true
user-invocable: false
---

# Init

## 触发

Router 交接，`kb_state=Empty` 且用户确认 init。或 auditor 确认 init-compatible Partial。

## 做

1. 验证不会覆盖现有文件（覆盖则停止 → gardener）
2. 写入 `.knowledge-base.yml`（如不存在）
3. 创建目录：root、layer、category
4. 创建索引文件（空 README.md）

默认分类：

| name | path | description |
|------|------|-------------|
| project-overview | 01-project-layer/01-project-overview | 项目目标、范围、术语 |
| core-process | 01-project-layer/02-core-process | 核心流程、业务过程 |
| architecture | 01-project-layer/03-architecture | 架构、模块关系、分层 |
| middleware-config | 02-technology-layer/01-middleware-config | 中间件、环境配置 |
| coding-standards | 02-technology-layer/02-coding-standards | 编码规范、review 规则 |
| third-party-libraries | 02-technology-layer/03-third-party-libraries | 第三方依赖、集成约束 |
| api-docs | 02-technology-layer/04-api-docs | API 契约、端点、schema |
| prd-docs | 03-assets-layer/01-prd-docs | 产品需求、用户故事 |
| technical-solutions | 03-assets-layer/02-technical-solutions | 技术方案、决策记录 |
| test-cases | 03-assets-layer/03-test-cases | 测试场景、QA 用例 |

## 产出

列出所有创建的文件。

## Handoff

```markdown
## Handoff
→ done
```
