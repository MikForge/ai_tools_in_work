---
name: knowledge-base-update
description: 当需要初始化、写入、更新、归档或索引项目知识库中的 Markdown 文档时使用。触发词包括"写入知识库"、"save to KB"、"归档文档"、"archive this doc"、"初始化知识库"、"init knowledge base"、"索引这个文档"。
---

# Knowledge Base Update

## 概述

配置驱动的 skill，用于将 Markdown 文档写入项目知识库。所有路径、分类和索引规则均来自仓库根目录的 `.knowledge-base.yml`。禁止硬编码目录路径。

## 适用场景

- 用户要求写入、保存、归档或更新知识库文档
- 用户提供 Markdown 内容希望沉淀为项目知识
- 用户要求将已有文档登记到知识库索引
- 用户要求初始化项目知识库

**不适用：** 读取/搜索知识库内容（→ `knowledge-base-read`）、编写设计文档（→ `writing-plans`）、管理项目规则（→ `managing-project-rules`）、记录想法（→ `record-idea`）。

## 原则

1. **配置优先**：`.knowledge-base.yml` 定义根目录、分类、索引格式和文件命名规范。始终先读取配置。
2. **模板仅 init 时使用**：只有当 `.knowledge-base.yml` 和目标知识库目录均不存在时，才使用 `knowledge-base.yml.temp`。绝不覆盖已有配置。
3. **索引强制执行**：每次写入、更新或归档后必须更新对应索引文件。Agent 会忘记这一步——维护索引是你的责任。
4. **不确定时停止**：配置缺失、分类模糊、文件冲突 → 停止并询问用户。禁止猜测。
5. **最小修改面**：只修改目标文档及其索引。不要改动层级 README 或配置，除非用户明确要求。

## 配置

读取仓库根目录的 `.knowledge-base.yml`。完整 schema 和默认模板见 [`knowledge-base-spec.md`](knowledge-base-spec.md)。

配置发现顺序：
1. 用户请求中显式指定的配置路径
2. 仓库根目录的 `.knowledge-base.yml`

如果两者都不存在且用户未要求初始化 → 停止，展示默认模板，让用户确认。

## 工作流

```
用户请求
    │
    ▼
读取 .knowledge-base.yml
    │
    ├── 配置存在? ──否── 目标目录存在? ──否── → 初始化（步骤 3）
    │                          │
    │                          是 → 停止："配置缺失但目录存在——请解决此不一致"
    │
    └── 配置存在? ──是── → 继续操作
```

### 步骤 1：读取配置

从仓库根目录读取 `.knowledge-base.yml`。解析 `root`、`categories`、`index_format`、`filename_style`。

### 步骤 2：判断是否需要初始化

同时满足以下两个条件时才需要初始化：
- `.knowledge-base.yml` 不存在
- 默认知识库目标目录（`docs/00-project-knowledge-base/`）不存在

仅一个缺失视为异常——停止并询问用户解决。

### 步骤 3：初始化（仅两个条件都满足时）

1. 从 skill 目录复制 `knowledge-base.yml.temp` 到仓库根目录，重命名为 `.knowledge-base.yml`
2. 按配置创建目录结构：`root/` 和所有 `categories[].path/`
3. 写入根 `README.md` 作为总入口
4. 写入层级 `README.md` 作为导航（仅层级目录）
5. 写入叶子目录 `README.md` 作为空文档索引
6. 汇报创建结果，询问用户是否继续原操作

### 步骤 4：确认操作类型

四种操作：
- **add** — 新增文档到指定分类
- **update** — 修改已有文档，保留原始内容
- **archive** — 将文档移出活跃分类（仅当配置中存在归档路径时）
- **index-only** — 将已有文件登记到索引，不修改文件内容

操作不清晰时询问用户。

### 步骤 5：确定目标位置

优先级：
1. 用户明确指定的分类、目录或路径
2. 根据配置中的 `categories[].name` 和 `description` 匹配
3. **分类模糊时** → 列出候选分类，询问用户。禁止猜测。

### 步骤 6：确定文件名

遵循 `类型-主题-行为.md` 命名规范。适用于 `docs/00-project-knowledge-base/**` 正文文档；`README.md` 仅限目录索引使用。

**结构：** `类型-主题-行为.md` —— 三部分均为必填：
- `类型`：文档类别 — `requirement`、`spec`、`design`、`architecture`、`solution`、`guide`、`test`、`verification`
- `主题`：稳定对象（模块、系统、功能域、资源对象、业务对象）
- `行为`：动作/切面 — `总览`、`流程`、`设计`、`实现`、`重构`、`接入`、`配置`、`说明`、`验证`、`测试`、`迁移`
- 无明确动作时默认 `行为`：`总览`
- 扩展名固定为 `.md`

**优先级：**
1. 用户提供的完整文件名 — 须通过校验：非保留名（非 `README.md`）、必须有 `.md` 扩展名、不含路径分隔符、无临时命名痕迹（`副本`、`copy`、`new`、`final`、`最新版`、`(1)`）
2. 外部参数（命名语言、候选类型/主题/行为）
3. 默认生成 — 默认允许中文文件名；英文模式：主题转 slug，类型/行为使用受控标识

**同名文件处理：**
- 同一主题+行为、内容持续演进 → 原地更新（不因版本迭代自动拆新文件）
- 需长期并存 → 在 `主题` 中补充稳定限定词：`客户端`、`服务端`、`编辑器`、`V2`、`预研`、`正式版`
- 不自动生成随机名，不默认覆盖
- 限定词优先使用稳定词，避免时间戳、随机编号或情绪化词语

**迁移规则：** `内容触碰即迁移，索引触碰不迁移。`
- 必须重命名：新建、正文更新、重写、拆分、合并、归档
- 可保留：仅索引操作、目录移动且正文未改（且旧名已合规）

完整规范（例外、重名、拆分/合并规则）见：[`00-spec-markdown-name.md`](00-spec-markdown-name.md)。

### 步骤 7：写入或更新文档

- **add**：将新文件写入目标目录
- **update**：先读取已有内容，按用户意图做最小修改
- **archive**：仅在配置中有归档路径时移动文件；否则询问用户
- **index-only**：跳过此步骤，直接进入步骤 8

保留用户原始内容。仅修正明显的 Markdown 格式问题。

### 步骤 8：更新索引

**此步骤为强制步骤。禁止跳过。**

- 如果分类配置了 `index` → 更新分类索引
- 否则 → 更新根索引（`knowledge_base.index`）
- `markdown-list` 格式：链接列表
- `markdown-table` 格式：`| 文档 | 说明 |` 表格
- 按文件名首字母排序
- 如果索引文件不存在且路径来自配置 → 创建最小索引文件

### 步骤 9：汇报结果

列出所有修改的文件（文档 + 索引），说明使用了哪个配置文件。禁止声称完成未验证的操作。

## 索引规则

**markdown-list：**
```markdown
## 文档

- [agent-workflow.md](agent-workflow.md)：Agent 工作流说明。
- [harness-engineering.md](harness-engineering.md)：Harness 工程原则。
```

**markdown-table：**
```markdown
## 文档

| 文档 | 说明 |
|---|---|
| [agent-workflow.md](agent-workflow.md) | Agent 工作流说明。 |
| [harness-engineering.md](harness-engineering.md) | Harness 工程原则。 |
```

新条目的说明从文档首段或标题提取。

## 常见错误

| 错误 | 正确做法 |
|------|---------|
| 根据目录名猜测知识库位置 | 读取 `.knowledge-base.yml`。只信任配置。 |
| 没有配置就创建文档 | 停止，展示默认模板，让用户确认初始化。 |
| 发明未配置的分类 | 只使用配置中的分类。分类模糊时询问用户。 |
| 写入文档但跳过索引更新 | **强制步骤：** 每次写入后必须更新索引。 |
| 自动修改 `.knowledge-base.yml` | 除非用户明确要求更新配置，否则不改。 |
| 大幅重写用户提供内容 | 保留原文。仅修正明显的格式问题。 |
| 不经询问就创建整个目录结构 | 初始化时只创建配置指定的内容，然后询问用户是否继续。 |

## 约束文档

- [`knowledge-base-spec.md`](knowledge-base-spec.md) — `.knowledge-base.yml` 完整 schema、字段说明和默认模板
- [`00-spec-markdown-name.md`](00-spec-markdown-name.md) — 知识库正文文档的 Markdown 命名规范
