# Agent Skills 开放标准

> **来源**：[agentskills.io/specification](https://agentskills.io/specification)
>
> **版本**：2026-05-17（根据官方规范校准）

---

## 一、概述

Skill 是任务特定的指令包，Agent 按需加载。每个 Skill 是一个包含 `SKILL.md` 的目录。

启动时加载所有 Skill 的元数据（name + description），Agent 根据任务匹配 description，按需读取完整 `SKILL.md`。正文中引用的文件由 Agent 再次按需读取。

---

## 二、目录结构

```
skill-name/
├── SKILL.md              # 必需：元数据 + 指令
├── scripts/              # 可选：可执行代码
├── references/           # 可选：额外文档
├── assets/               # 可选：模板、资源
└── ...                   # 任意额外文件或目录
```

> `scripts/`、`references/`、`assets/` 为规范推荐目录名。实际使用任意目录名均可，只要从 `SKILL.md` 直接引用。
>
> 部分平台会在此之上增加专属目录（如 Codex 的 `agents/openai.yaml`），这些不在 Agent Skills 标准范围内。

---

## 三、SKILL.md 格式

`SKILL.md` 必须包含 **YAML frontmatter**，后跟 **Markdown 正文**。

### 3.1 Frontmatter 字段总览

所有遵循该标准的 Agent 平台均支持。共 6 个字段：

| 字段 | 必填 | 约束 |
| ---- | ---- | ---- |
| `name` | **是** | 1-64 字符。仅限小写字母、数字和连字符。不可首尾连字符，不可连续连字符。必须与父目录名一致。 |
| `description` | **是** | 1-1024 字符。非空。描述做什么 + 何时使用。 |
| `license` | 否 | 许可证名称或指向 bundled license 文件的引用。建议保持简短。 |
| `compatibility` | 否 | 1-500 字符。环境要求（目标产品、系统依赖、网络等）。大多数 skill 不需要。 |
| `metadata` | 否 | 任意 `string → string` 键值映射。建议键名唯一化以免冲突。 |
| `allowed-tools` | 否 | 空格分隔的预授权工具名。**实验性**，不同 Agent 实现的支持度不同。 |

### 3.2 最简示例

```yaml
---
name: skill-name
description: A description of what this skill does and when to use it.
---
```

### 3.3 带可选字段

```yaml
---
name: pdf-processing
description: >
  Extract PDF text, fill forms, merge files.
  Use when handling PDFs.
license: Apache-2.0
metadata:
  author: example-org
  version: "1.0"
---
```

### 3.4 `name` 字段

| 规则 | ✅ 有效 | ❌ 无效 |
| ---- | ------ | ------- |
| 1-64 字符 | `pdf-processing` | — |
| 仅限小写字母 `a-z`、数字、`-` | `data-analysis` | `PDF-Processing` |
| 不可首尾连字符 | `code-review` | `-pdf`、`pdf-` |
| 不可连续连字符 | `data-analysis` | `pdf--processing` |
| 必须与父目录名一致 | 目录 `pdf/` → `name: pdf` | 目录 `pdf/` → `name: pdf-tool` |

### 3.5 `description` 字段

1. **必须为 1-1024 字符，非空**。
2. **同时描述做什么 + 何时使用**。Agent 依赖 description 从大量 Skill 中匹配选择。
3. **包含具体关键词**（文件类型、操作动词、触发场景），提升匹配精度。
4. **不要总结工作流**。若 description 泄露流程细节，Agent 可能跳过读取正文而直接按 description 行动。

```yaml
# ✅ 好
description: >
  Extracts text and tables from PDF files, fills PDF forms, and merges
  multiple PDFs. Use when working with PDF documents or when the user
  mentions PDFs, forms, or document extraction.

# ❌ 差
description: Helps with PDFs.
```

### 3.6 `license` 字段

指定 skill 的许可证。建议保持简短（许可证名称或 bundled license 文件名）。

```yaml
license: Proprietary. LICENSE.txt has complete terms
```

### 3.7 `compatibility` 字段

仅在 skill 有特定环境要求时提供。可指示目标产品、所需系统包、网络需求等。

```yaml
compatibility: Designed for Claude Code (or similar products)
compatibility: Requires git, docker, jq, and access to the internet
compatibility: Requires Python 3.14+ and uv
```

> 大多数 skill 不需要此字段。

### 3.8 `metadata` 字段

任意 `string → string` 键值映射，存放规范未定义的额外属性。

```yaml
metadata:
  author: example-org
  version: "1.0"
```

### 3.9 `allowed-tools` 字段

空格分隔的预授权工具名。**实验性**，不同 Agent 实现的支持度不同。

```yaml
allowed-tools: Bash(git:*) Bash(jq:*) Read
```

---

## 四、Body 正文内容

Frontmatter 之后的 Markdown 正文包含 skill 的具体指令。**无格式限制**，写任何能帮助 Agent 高效执行任务的内容。

Agent 一旦决定激活某 skill，会加载整个 `SKILL.md` 文件。因此对较长内容考虑拆分到引用文件。

推荐包含：
- 分步操作说明
- 示例输入和输出
- 常见边缘情况

---

## 五、可选目录

### 5.1 `scripts/` — 可执行代码

Agent 可运行的脚本。脚本应：
- 自包含，或清晰注明依赖
- 包含有用的错误消息
- 优雅处理边缘情况

支持的语言取决于 Agent 实现，常见选项包括 Python、Bash、JavaScript。

### 5.2 `references/` — 参考文档

Agent 可按需读取的额外文档。典型文件：
- `REFERENCE.md` — 详细技术参考
- `FORMS.md` — 表单模板或结构化数据格式
- 领域特定文件（`finance.md`、`legal.md` 等）

保持单个参考文件聚焦。Agent 按需加载这些文件，**文件越小，上下文消耗越少**。

### 5.3 `assets/` — 静态资源

模板、图片、数据文件等静态资源，如：
- 文档模板、配置模板
- 图表、示例图片
- 查找表、schema 文件

---

## 六、渐进式披露

Agent 按层级逐步加载 Skill 内容：

| 层级 | 内容 | Token 量 | 加载时机 |
| ---- | ---- | -------- | -------- |
| **元数据** | `name` + `description` | ~100 tokens | 启动时（所有 skill） |
| **指令** | `SKILL.md` 正文 | < 5000 tokens 推荐 | skill 被激活时 |
| **资源** | `scripts/`、`references/`、`assets/` 中的文件 | 按需 | 任务需要时 |

因此：

- **SKILL.md 正文控制在 500 行以内**。超出则把详细参考材料移到独立文件。
- **文件引用深度不超过 1 层**。避免深层嵌套引用链。

### 文件引用格式

使用相对于 skill 根目录的相对路径：

```markdown
See [the reference guide](references/REFERENCE.md) for details.

Run the extraction script:
scripts/extract.py
```

---

## 七、正文编写原则（最佳实践）

> 以下为来自 Claude Code 文档的补充最佳实践，非 Agent Skills 标准强制要求。

### 7.1 简洁至上

**默认假设 Agent 已经很聪明**。只写 Agent 不知道的东西。

```markdown
# ✅ 简洁（约 50 tokens）
## Extract PDF text
Use pdfplumber:
```python
import pdfplumber
with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```

# ❌ 冗长（约 150 tokens）
## Extract PDF text
PDF (Portable Document Format) files are a common file format...
```

### 7.2 设置适当自由度

| 自由度 | 适用 | 形式 |
| ---- | ---- | ---- |
| **高** | 多种方法有效 | 文字指令 |
| **中** | 有首选模式 | 伪代码/带参脚本 |
| **低** | 操作脆弱，必须严格 | 精确脚本，禁止修改 |

### 7.3 反馈循环

质量关键的任务加入验证步骤：

```markdown
1. 进行修改
2. **立即验证**：`python scripts/validate.py`
3. 验证失败 → 修复 → 重新验证
4. 验证通过才继续
```

### 7.4 内容规范

- **避免时效性信息**，过时内容放 `<details>` 折叠区
- **术语统一**：始终用 "extract"，不要混用 extract/pull/get
- **默认方案优先**：提供一个推荐方法 + 例外兜底，不要列一堆选项
- **路径全部正斜杠** `/`，不用 `\`

---

## 八、可执行脚本规范（最佳实践）

- **脚本自己处理错误**，不抛给 Agent
- **明确区分执行 vs 阅读**：
  - `Run analyze_form.py` → 执行脚本
  - `See analyze_form.py for the algorithm` → 阅读参考
- **常量加注释**：`TIMEOUT = 30  # HTTP requests typically complete within 30s`

---

## 九、验证

使用官方 [`skills-ref`](https://github.com/agentskills/agentskills/tree/main/skills-ref) 参考库验证 skill：

```shell
skills-ref validate ./my-skill
```

这将检查 `SKILL.md` frontmatter 是否有效，并遵循所有命名约定。

---

## 十、发布前 Checklist

- [ ] `description` 具体、含触发关键词
- [ ] SKILL.md 正文 < 500 行
- [ ] 引用深度 ≤ 1 层
- [ ] 术语一致、无时效性信息、全正斜杠路径
- [ ] 脚本自处理错误
- [ ] 跨平台兼容时仅用标准字段
- [ ] 通过 `skills-ref validate` 验证

---

## 参考链接

| 资源 | URL |
| ---- | --- |
| Agent Skills 开放标准 | <https://agentskills.io/specification> |
| Agent Skills 首页 | <https://agentskills.io> |
| skills-ref 验证工具 | <https://github.com/agentskills/agentskills/tree/main/skills-ref> |
| 文档索引 (`llms.txt`) | <https://agentskills.io/llms.txt> |
| Claude Code Skills（扩展） | <https://code.claude.com/docs/en/skills> |
| Codex Skills（扩展） | <https://developers.openai.com/codex/skills> |
