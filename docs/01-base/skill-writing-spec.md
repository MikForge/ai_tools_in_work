# Agent Skill 编写规范

> **来源**：[Agent Skills 开放标准](https://agentskills.io/specification) + [Claude Code Skills 文档](https://code.claude.com/docs/en/skills) + [Codex Skills 文档](https://developers.openai.com/codex/skills)
>
> **版本**：2026-05-15

---

## 一、什么是 Skill

Skill 是任务特定的指令包，Agent 按需加载。每个 Skill 是一个包含 `SKILL.md` 的目录。

**加载机制**：启动时加载所有 Skill 的元数据（name + description）；Agent 根据任务匹配 description，按需读取完整 `SKILL.md`；正文中引用的文件由 Agent 再次按需读取。

**核心价值**：把专业指令从系统提示词中抽离，保持上下文窗口干净，同时不丢失可发现性。

---

## 二、目录结构

```
skill-name/
├── SKILL.md              # 主文件（必需）
├── agents/
│   └── openai.yaml       # Codex 专属扩展配置（可选）
├── scripts/              # 可执行脚本（可选）
├── references/           # 额外参考文档（可选）
└── assets/               # 静态资源（可选）
```

> `scripts/`、`references/`、`assets/` 为规范推荐目录名。实际使用任意目录名均可，只要从 `SKILL.md` 直接引用。引用深度不超过 1 层。

---

## 三、Frontmatter 字段总览

Skill 的配置字段来自 **三层规范**，自底向上叠加：

```
┌──────────────────────────────────────────────┐
│  Claude Code 扩展（SKILL.md frontmatter）      │
│  disable-model-invocation, user-invocable,    │
│  context, agent, model, effort, hooks, ...    │
│  ┌──────────────────────────────────────────┐ │
│  │  Codex 扩展（agents/openai.yaml）          │ │
│  │  policy.allow_implicit_invocation,        │ │
│  │  interface.*, dependencies.tools[]        │ │
│  │  ┌──────────────────────────────────────┐ │ │
│  │  │  Agent Skills 开放标准（SKILL.md）     │ │ │
│  │  │  name, description, license,         │ │ │
│  │  │  compatibility, metadata,            │ │ │
│  │  │  allowed-tools                       │ │ │
│  │  └──────────────────────────────────────┘ │ │
│  └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

---

### 3.1 Agent Skills 开放标准（跨平台通用）

**来源**：[agentskills.io/specification](https://agentskills.io/specification)

所有遵循该标准的 Agent 平台均支持。共 6 个字段：

| 字段 | 必填 | 约束 |
| ---- | ---- | ---- |
| `name` | **是** | 1-64 字符。仅限小写 `a-z`、数字、`-`。不可首尾连字符，不可连续连字符。必须与父目录名一致。 |
| `description` | **是** | 1-1024 字符。描述做什么 + 何时使用。**必须用第三人称**。 |
| `license` | 否 | 许可证名称或指向 bundled license 文件的引用。建议保持简短。 |
| `compatibility` | 否 | 1-500 字符。环境要求（目标产品、系统依赖、网络等）。大多数 skill 不需要。 |
| `metadata` | 否 | 任意 `string → string` 键值映射。存放规范未定义的额外属性。建议键名唯一化以免冲突。 |
| `allowed-tools` | 否 | 空格分隔的预授权工具名。**实验性**，不同 Agent 实现的支持度不同。 |

**最简示例**：

```yaml
---
name: pdf-processing
description: >
  Extract text and tables from PDF files, fill forms, merge documents.
  Use when working with PDF files or when the user mentions PDFs, forms,
  or document extraction.
---
```

**带可选字段**：

```yaml
---
name: pdf-processing
description: >
  Extract text and tables from PDF files, fill forms, merge documents.
  Use when working with PDF files or when the user mentions PDFs.
license: Apache-2.0
compatibility: Requires Python 3.11+ and uv
metadata:
  author: example-org
  version: "1.0"
allowed-tools: Bash(git:*) Bash(jq:*) Read
---
```

#### `name` 详细约束

| 规则 | ✅ 有效 | ❌ 无效 |
| ---- | ------ | ------- |
| 仅限小写 `a-z`、数字、`-` | `pdf-processing` | `PDF-Processing` |
| 不可首尾连字符 | `code-review` | `-pdf`、`pdf-` |
| 不可连续连字符 | `data-analysis` | `pdf--processing` |
| 必须与父目录名一致 | 目录 `pdf/` → `name: pdf` | 目录 `pdf/` → `name: pdf-tool` |

#### `description` 规则

1. **必须用第三人称**（description 被注入 system prompt）。
   - ✅ `Processes Excel files and generates reports.`
   - ❌ `I can help you process Excel files.`
   - ❌ `You can use this to process Excel files.`

2. **同时描述做什么 + 何时使用**。Agent 依赖 description 从大量 Skill 中选择。

3. **包含具体关键词**（文件类型、操作动词、触发场景）。

4. **不要总结工作流**。若 description 泄露流程，Agent 可能按 description 行动而跳过读取正文。

```yaml
# ✅ 好
description: >
  Extract text and tables from PDF files, fill forms, merge documents.
  Use when working with PDF files or when the user mentions PDFs, forms.

# ❌ 差
description: Helps with documents
description: I can help you with PDF files
```

---

### 3.2 Claude Code 扩展（SKILL.md frontmatter）

**来源**：[code.claude.com/docs/en/skills](https://code.claude.com/docs/en/skills)

Claude Code 在标准基础上增加了 12 个扩展字段，全部写在 `SKILL.md` frontmatter 中。

> **注意**：`name` 在 Claude Code 中**改为可选**（省略时默认目录名）。`description` **改为推荐但非必填**（省略时默认正文首段）。

#### 调用控制

| 字段 | 类型 | 默认 | 说明 |
| ---- | ---- | ---- | ---- |
| `disable-model-invocation` | boolean | `false` | **`true` 时禁止 Claude 自动加载此 skill**，仅用户可通过 `/name` 手动调用。适用于 `/deploy`、`/commit` 等有副作用的操作。同时阻止 skill 被预加载到子 agent 中。 |
| `user-invocable` | boolean | `true` | **`false` 时从 `/` 菜单隐藏**，仅 Claude 可自动调用。适用于纯背景知识 skill。 |

两种字段的组合效果：

| 配置 | 用户 `/` 调用 | Claude 自动调用 | description 是否加载 |
| ---- | :----------: | :------------: | -------------------- |
| （默认，都不设） | ✅ | ✅ | 始终在上下文中 |
| `disable-model-invocation: true` | ✅ | ❌ | 不在上下文中，仅手动触发时加载 |
| `user-invocable: false` | ❌ | ✅ | 始终在上下文中 |

```yaml
# 仅用户可手动调用
---
name: deploy
description: Deploy the application to production
disable-model-invocation: true
---

# 仅 Claude 可自动调用
---
name: legacy-system-context
description: Context about the legacy system architecture
user-invocable: false
---
```

#### 触发与参数

| 字段 | 类型 | 说明 |
| ---- | ---- | ---- |
| `when_to_use` | string | 附加触发上下文（触发短语、示例请求）。追加到 `description` 后，共享 1536 字符上限。 |
| `paths` | string / list | glob 模式，限制 skill 仅在操作匹配文件时自动激活。与路径特定规则格式相同。 |
| `argument-hint` | string | 自动补全提示。如 `[issue-number]` 或 `[filename] [format]`。 |
| `arguments` | string / list | 命名位置参数。用于 skill 正文中的 `$name` 变量替换，按顺序映射。 |

#### 执行环境

| 字段 | 类型 | 说明 |
| ---- | ---- | ---- |
| `model` | string | skill 激活时的模型覆盖（如 `claude-opus-4-7`）。仅影响当前 turn，不写入设置。`inherit` 保持当前模型。 |
| `effort` | string | skill 激活时的 effort level。可选：`low`、`medium`、`high`、`xhigh`、`max`。继承会话设置。 |
| `context` | string | 设为 `fork` 时，skill 在隔离子 agent 中运行，无权访问会话历史。仅适用于有明确任务指令的 skill。 |
| `agent` | string | `context: fork` 时的子 agent 类型。可选：`Explore`、`Plan`、`general-purpose` 或自定义 agent。默认 `general-purpose`。 |
| `hooks` | object | skill 生命周期 hook。格式同 `.claude/settings.json` 中的 hooks 配置。 |
| `shell` | string | `` !`command` `` 和 ` ```! ` 块使用的 shell。`bash`（默认）或 `powershell`（需 `CLAUDE_CODE_USE_POWERSHELL_TOOL=1`）。 |

#### 字符串替换变量

| 变量 | 说明 |
| ---- | ---- |
| `$ARGUMENTS` | 所有传入参数 |
| `$ARGUMENTS[N]` / `$N` | 按索引访问参数，`$0` = 第一个 |
| `$name` | `arguments` 列表中声明的命名参数 |
| `${CLAUDE_SESSION_ID}` | 当前 session ID |
| `${CLAUDE_EFFORT}` | 当前 effort level |
| `${CLAUDE_SKILL_DIR}` | skill 目录的绝对路径 |

---

### 3.3 Codex 扩展（`agents/openai.yaml`）

**来源**：[developers.openai.com/codex/skills](https://developers.openai.com/codex/skills)

Codex **不在 SKILL.md 中扩展字段**，而是使用独立的 `agents/openai.yaml` 文件。SKILL.md 仅包含标准字段（`name`、`description`）。

> Codex 也遵循 [Agent Skills 开放标准](https://agentskills.io/specification)，`SKILL.md` 格式与标准完全一致。

#### `agents/openai.yaml` 结构

```yaml
interface:
  display_name: "My Skill"          # 用户界面显示名
  short_description: "..."          # 用户界面描述
  icon_small: assets/icon.svg       # 小图标路径
  icon_large: assets/icon.png       # 大图标路径
  brand_color: "#3B82F6"            # 品牌色（hex）
  default_prompt: "..."             # 默认环绕提示词

policy:
  allow_implicit_invocation: true   # false = 禁止隐式触发，仅 $skill 显式调用

dependencies:
  tools:
    - type: mcp
      value: someMcpServer
      description: Human-readable description
      transport: streamable_http
      url: https://example.com/mcp
```

#### 字段说明

| 层级 | 字段 | 说明 |
| ---- | ---- | ---- |
| `interface` | `display_name` | Codex 应用 UI 中的显示名 |
| `interface` | `short_description` | UI 中显示的简短描述 |
| `interface` | `icon_small` | 小图标（SVG）路径 |
| `interface` | `icon_large` | 大图标（PNG）路径 |
| `interface` | `brand_color` | 品牌色（十六进制），如 `#3B82F6` |
| `interface` | `default_prompt` | skill 的默认环绕提示词 |
| `policy` | `allow_implicit_invocation` | **`false` 时 Codex 不会基于用户提示隐式调用 skill**。显式 `$skill` 调用仍然有效。默认 `true`。 |
| `dependencies` | `tools[]` | MCP 工具依赖列表。每项含 `type`、`value`、`description`、`transport`、`url` |

---

## 四、三层规范对比

| 能力 | Agent Skills 标准 | Claude Code | Codex |
| ---- | :---: | :---: | :---: |
| 配置文件 | SKILL.md | SKILL.md | SKILL.md + `agents/openai.yaml` |
| `name` / `description` | **必填** | 可选（有默认值） | **必填** |
| `license` | ✅ | ✅ | — |
| `compatibility` | ✅ | ✅ | — |
| `metadata` | ✅ | ✅ | — |
| `allowed-tools` | ✅（实验性） | ✅ | — |
| `disable-model-invocation` | — | ✅ | — |
| `user-invocable` | — | ✅ | — |
| `when_to_use` | — | ✅ | — |
| `argument-hint` / `arguments` | — | ✅ | — |
| `model` / `effort` | — | ✅ | — |
| `context: fork` / `agent` | — | ✅ | — |
| `hooks` | — | ✅ | — |
| `paths` | — | ✅ | — |
| `shell` | — | ✅ | — |
| `interface.*` | — | — | ✅（`agents/openai.yaml`） |
| `policy.allow_implicit_invocation` | — | — | ✅（`agents/openai.yaml`） |
| `dependencies.tools[]` | — | — | ✅（`agents/openai.yaml`） |

### "仅手动调用"的等价字段

三者都支持禁止 Agent 自动触发 skill，但字段名和位置不同：

| 平台 | 字段 | 位置 |
| ---- | ---- | ---- |
| Claude Code | `disable-model-invocation: true` | SKILL.md frontmatter |
| Codex | `policy.allow_implicit_invocation: false` | `agents/openai.yaml` |
| 通用标准 | 无 | — |

---

## 五、正文编写原则

### 5.1 简洁至上

**默认假设 Agent 已经很聪明**。只写 Agent 不知道的东西。SKILL.md 正文控制在 **500 行以内**，超出则拆分到独立文件。

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

### 5.2 渐进式披露

`SKILL.md` 是概览和导航，详细内容放独立文件。**引用深度不超过 1 层**。

```markdown
# SKILL.md
## Quick start
[核心用法，5-10 行]

## Advanced features
**Form filling**: See [FORMS.md](FORMS.md) for complete guide
**API reference**: See [REFERENCE.md](REFERENCE.md) for all methods
```

超过 100 行的参考文件，顶部加目录。

### 5.3 设置适当自由度

| 自由度 | 适用 | 形式 |
| ---- | ---- | ---- |
| **高** | 多种方法有效 | 文字指令 |
| **中** | 有首选模式 | 伪代码/带参脚本 |
| **低** | 操作脆弱，必须严格 | 精确脚本，禁止修改 |

### 5.4 反馈循环

质量关键的任务加入验证步骤：

```markdown
1. 进行修改
2. **立即验证**：`python scripts/validate.py`
3. 验证失败 → 修复 → 重新验证
4. 验证通过才继续
```

### 5.5 内容规范

- **避免时效性信息**，过时内容放 `<details>` 折叠区
- **术语统一**：始终用 "extract"，不要混用 extract/pull/get
- **默认方案优先**：提供一个推荐方法 + 例外兜底，不要列一堆选项
- **路径全部正斜杠** `/`，不用 `\`

---

## 六、可执行脚本规范

- **脚本自己处理错误**，不抛给 Agent
- **明确区分执行 vs 阅读**：
  - `Run analyze_form.py` → 执行脚本
  - `See analyze_form.py for the algorithm` → 阅读参考
- **常量加注释**：`TIMEOUT = 30  # HTTP requests typically complete within 30s`

---

## 七、"仅手动调用"的实际配置示例

### Claude Code

```yaml
---
name: deploy
description: Deploy the application to production
disable-model-invocation: true
---

Deploy $ARGUMENTS to production:
1. Run the test suite
2. Build the application
3. Push to the deployment target
4. Verify the deployment succeeded
```

### Codex

`SKILL.md`：

```yaml
---
name: deploy
description: Deploy the application to production. Use when user wants to deploy.
---

Deploy to production:
1. Run tests
2. Build
3. Push
4. Verify
```

`agents/openai.yaml`：

```yaml
policy:
  allow_implicit_invocation: false
```

---

## 八、发布前 Checklist

- [ ] `description` 具体、第三人称、含触发关键词
- [ ] SKILL.md 正文 < 500 行
- [ ] 引用深度 ≤ 1 层
- [ ] 术语一致、无时效性信息、全正斜杠路径
- [ ] 脚本自处理错误
- [ ] 跨平台兼容字段仅用标准字段（如需跨 Claude Code / Codex 使用）
- [ ] 目标平台专属字段写入正确位置（Claude Code → SKILL.md；Codex → `agents/openai.yaml`）

---

## 九、参考链接

| 资源 | URL |
| ---- | --- |
| Agent Skills 开放标准 | <https://agentskills.io/specification> |
| Claude Code Skills | <https://code.claude.com/docs/en/skills> |
| Codex Skills | <https://developers.openai.com/codex/skills> |
| Codex 创建 Skill | <https://developers.openai.com/codex/skills/create-skill> |
| openai/skills GitHub | <https://github.com/openai/skills> |
