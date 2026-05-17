---
name: writing-knowledge-base
description: 当用户想要将 markdown 文档保存、归档或整理到项目知识库（docs/00-project-harness-knowledge-base/）时使用。触发词包括"写入知识库"、"归档文档"、"整理到知识库"、"save to KB"。
---

# 知识库文档写入

## 概述

自下而上（bottom-up）地将 MD 文档写入三层知识库：先分析内容确定归属，再写入子目录，最后更新该子目录的 README.md。

**核心原则：内容驱动分类，索引驱动发现。每一层目录都有 README.md。**

## 适用场景

- 用户提供 MD 内容要求归档到知识库
- 用户说"整理到知识库"、"归档文档"、"写入 KB"
- 需要将对话中产生的知识沉淀为可复用文档

**不适用：** 创建新规约（→ `managing-project-rules`）、编写设计文档/计划（→ `writing-plans`）、记录临时想法（→ `record-idea`）

## 知识库三层结构

```
docs/00-project-harness-knowledge-base/
├── README.md                         # 总入口
├── 01-project-layer/                 # 项目层 — "为什么"
│   ├── README.md                     #   层级导航
│   ├── 01-project-overview/
│   │   └── README.md                 #   子目录索引
│   ├── 02-core-process/
│   │   └── README.md                 #   子目录索引
│   └── 03-architecture/
│       └── README.md                 #   子目录索引
├── 02-technology-layer/              # 技术层 — "怎么做"
│   ├── README.md                     #   层级导航
│   ├── 01-middleware-config/
│   │   └── README.md                 #   子目录索引
│   ├── 02-coding-standards/
│   │   └── README.md                 #   子目录索引
│   ├── 03-third-party-libraries/
│   │   └── README.md                 #   子目录索引
│   └── 04-api-docs/
│       └── README.md                 #   子目录索引
└── 03-assets-layer/                  # 资产层 — "做过什么"
    ├── README.md                     #   层级导航
    ├── 01-prd-docs/
    │   └── README.md                 #   子目录索引
    ├── 02-technical-solutions/
    │   └── README.md                 #   子目录索引
    └── 03-test-cases/
        └── README.md                 #   子目录索引
```

**每个子目录的 README.md 是该子目录的唯一文档索引。** 层级 README.md 仅做子目录导航，不列具体文档。

## 分类决策

按以下两个问题顺序判断：

```
内容描述"为什么这样做"？
  ├── 是 → 01-project-layer/
  │   ├── 项目背景/目标 → 01-project-overview/
  │   ├── 流程/状态流转 → 02-core-process/
  │   └── 架构/模块关系 → 03-architecture/
  │
  └── 否 → 内容约束"怎么做"？
        ├── 是 → 02-technology-layer/
        │   ├── 构建/中间件配置 → 01-middleware-config/
        │   ├── 编码/命名规范   → 02-coding-standards/
        │   ├── 第三方库说明    → 03-third-party-libraries/
        │   └── API 文档       → 04-api-docs/
        │
        └── 否 → 03-assets-layer/（历史记录/方案/测试）
            ├── PRD/需求     → 01-prd-docs/
            ├── 技术方案     → 02-technical-solutions/
            └── 测试/验收    → 03-test-cases/
```

**快速对照：**

| 文档内容关键词 | 目标子目录 |
|---------------|-----------|
| 项目背景、目标、价值、边界 | `01-project-layer/01-project-overview/` |
| 启动流程、状态机、业务流转 | `01-project-layer/02-core-process/` |
| 架构图、模块依赖、分层 | `01-project-layer/03-architecture/` |
| 构建配置、环境变量、中间件 | `02-technology-layer/01-middleware-config/` |
| 命名规范、代码风格、设计模式 | `02-technology-layer/02-coding-standards/` |
| SDK 接入、第三方库使用 | `02-technology-layer/03-third-party-libraries/` |
| 接口文档、协议定义 | `02-technology-layer/04-api-docs/` |
| 需求文档、产品说明 | `03-assets-layer/01-prd-docs/` |
| 设计文档、方案选型 | `03-assets-layer/02-technical-solutions/` |
| 测试计划、用例、验收 | `03-assets-layer/03-test-cases/` |

**边界模糊时：** 技术层 > 资产层（稳定规则进技术层，一次性记录进资产层）

## 工作流（自下而上）

### 步骤 1：分析内容分类

阅读用户提供的 MD 内容，根据分类决策树确定目标层级和子目录。

**输出：** `{layer}` / `{subdirectory}` / `{filename}.md`

### 步骤 2：确定文件名

- 使用 kebab-case：`cocos-creator-build-config.md`
- 描述性且简洁，不超过 5 个英文单词或 10 个中文字
- 避免版本号、日期前缀（这些属于 git 管理范畴）

### 步骤 3：写入文档

将文档写入 `docs/00-project-harness-knowledge-base/{layer}/{subdirectory}/{filename}.md`。

保持用户提供的原始内容，仅修正明显的格式问题（如标题层级不一致）。

### 步骤 4：更新子目录 README.md

读取 `docs/00-project-harness-knowledge-base/{layer}/{subdirectory}/README.md`，在 `## 文档` 节中追加新条目。

**注意：** 每个子目录已有 README.md（共 10 个），直接追加即可。**不要**创建新的子目录，**不要**修改层级 README.md。

**子目录 README 格式：**

```markdown
# {子目录标题}

{一句话描述该子目录的用途}

## 文档

| 文档 | 说明 |
|------|------|
| [existing-doc.md](existing-doc.md) | 已有文档的描述。 |
| [new-doc.md](new-doc.md) | 新文档的一句话描述。 |
```

**索引更新规则：**
- 如果 `## 文档` 节当前是"暂无文档。"，**删除**该行并替换为完整表格（**含表头** `| 文档 | 说明 |` 和分隔符 `|------|------|`）
- 如果已有文档表格，在末尾追加新行
- 表格按文档名字母顺序排列
- 每个文档条目：`| [filename.md](filename.md) | 一句话描述（从文档首段/概述提取）。 |`
- 层级 README.md **无需更新**（它只做子目录导航，不含文档列表）

## 文件命名规范

```
✅ cocos-creator-build-config.md
✅ startup-flow-fsm-design.md
✅ player-proxy-data-model.md
❌ 2026-05-15-build-config.md        # 不要日期前缀
❌ build_config_v2.md                # 不要下划线和版本号
❌ guide.md                          # 太模糊
```

## 常见错误

| 错误 | 正确做法 |
|------|---------|
| 更新层级 README.md 而非子目录 README.md | 只更新子目录 README.md，层级 README 不动 |
| 为所有子目录添加"（暂无文档）"占位符 | 空子目录的 README 保留"暂无文档。"即可 |
| 跳过索引更新 | 写入文档后必须更新子目录 README.md |
| 创建新的子目录 | 知识库结构固定，不可新增子目录 |
| 文件名使用中文或空格 | 使用 kebab-case 英文文件名 |
| 分类模糊时不做决定 | 按"技术层 > 资产层"优先级选择 |
