# Claude Code Memory / CLAUDE.md / Rules 完整参考

## 概述

Claude Code 有两套互补的记忆系统：**CLAUDE.md 文件**（用户编写的持久指令）和 **Auto Memory**（Claude 自动积累的笔记）。`.claude/rules/` 允许将指令拆分为路径范围规则，按需加载。

官方文档：https://code.claude.com/docs/en/memory

## CLAUDE.md vs Auto Memory

| | CLAUDE.md | Auto Memory |
|---|----------|-------------|
| 谁写 | 你 | Claude |
| 内容 | 指令和规则 | 学习内容和模式 |
| 作用域 | 项目/用户/组织 | 每个仓库，跨 worktree 共享 |
| 加载 | 每次会话，全文 | 每次会话，前 200 行/25KB |
| 用途 | 编码规范、工作流、架构 | 构建命令、调试洞察、偏好 |

## CLAUDE.md 放置位置（加载顺序）

| 作用域 | 位置 | 用途 |
|--------|------|------|
| Managed Policy | macOS: `/Library/Application Support/ClaudeCode/CLAUDE.md` | 企业 IT 管理 |
| User | `~/.claude/CLAUDE.md` | 个人所有项目偏好 |
| Project | `./CLAUDE.md` 或 `./.claude/CLAUDE.md` | 团队共享项目指令 |
| Local | `./CLAUDE.local.md` | 个人项目特定（gitignored） |

**加载规则**：从文件系统根向下遍历到工作目录，所有 CLAUDE.md 拼接（不覆盖）。`.claude/CLAUDE.md` 与根目录 `CLAUDE.md` 等效。

## `@path` 导入

```
@AGENTS.md

See @README for project overview.
- git workflow @docs/git-instructions.md
```

- 相对路径相对于包含导入的文件解析
- 最大递归深度 5 层
- 首次遇到外部导入时显示批准对话框

## AGENTS.md 兼容

```markdown
@AGENTS.md

## Claude Code
Use plan mode for changes under `src/billing/`.
```

或直接符号链接：`ln -s AGENTS.md CLAUDE.md`

## 编写有效指令

- **大小**：目标每个文件 ≤ 200 行
- **结构**：使用 markdown 标题和列表
- **具体**："Use 2-space indentation" 而非 "Format code properly"
- **一致**：定期检查冲突

HTML 注释 `<!-- ... -->` 在注入前被剥离。

## `.claude/rules/` — 路径范围规则

将指令组织为 `.claude/rules/` 目录下的多个 Markdown 文件：

```
.claude/
├── CLAUDE.md
└── rules/
    ├── code-style.md
    ├── testing.md
    ├── security.md
    └── frontend/
        └── react.md
```

**无 `paths` frontmatter** → 全量加载，与 CLAUDE.md 同等优先级。

**有 `paths` frontmatter** → 仅在匹配文件时加载：

```markdown
---
paths:
  - "src/api/**/*.ts"
  - "lib/**/*.ts"
---

# API Development Rules
- All API endpoints must include input validation
```

### Paths 匹配模式

| 模式 | 匹配 |
|------|------|
| `**/*.ts` | 所有 TypeScript 文件 |
| `src/**/*` | `src/` 下所有文件 |
| `*.md` | 项目根 Markdown 文件 |
| `src/components/*.tsx` | 特定目录组件 |
| `src/**/*.{ts,tsx}` | 多个扩展名 |

### 跨项目共享

```bash
ln -s ~/shared-claude-rules .claude/rules/shared
ln -s ~/company-standards/security.md .claude/rules/security.md
```

### 用户级规则

`~/.claude/rules/` 对所有项目生效，优先级低于项目规则。

## CLAUDE.md 排除

```json
{
  "claudeMdExcludes": [
    "**/monorepo/CLAUDE.md",
    "/home/user/monorepo/other-team/.claude/rules/**"
  ]
}
```

Managed policy CLAUDE.md 不可排除。

## CLAUDE.md 与 `/compact` 的关系

项目根 CLAUDE.md 在 compaction 后从磁盘重新读取并重新注入。子目录嵌套的 CLAUDE.md 不自动重新注入，下次读取文件时重新加载。

## Auto Memory

### 储存位置

`~/.claude/projects/<project>/memory/`

```
memory/
├── MEMORY.md          # 索引，每会话加载前 200 行/25KB
├── debugging.md       # 详细笔记
└── api-conventions.md
```

### 配置

```json
{
  "autoMemoryEnabled": true,
  "autoMemoryDirectory": "~/my-custom-memory-dir"
}
```

- 默认启用，`/memory` 命令切换
- 停止：`{"env": {"CLAUDE_CODE_DISABLE_AUTO_MEMORY": "1"}}`
- `autoMemoryDirectory` 仅接受 user/policy 设置

## `/memory` 命令

列出所有已加载的 CLAUDE.md、CLAUDE.local.md 和 rules 文件，可切换自动记忆，浏览自动记忆文件。

## 排查

| 问题 | 检查 |
|------|------|
| CLAUDE.md 未遵循 | `/memory` 验证文件加载；提高指令具体性；检查冲突 |
| 自动记忆未知 | `/memory` 浏览自动记忆目录 |
| CLAUDE.md 过大 | 使用 path-scoped rules 替代；trim 非必须内容 |
| Compact 后丢失指令 | 仅项目根 CLAUDE.md 在 compact 后重新注入 |

## 相关

- Settings 完整参考: https://code.claude.com/docs/en/settings
- Sub-agents 完整参考: https://code.claude.com/docs/en/sub-agents
- Skills: https://code.claude.com/docs/en/skills
