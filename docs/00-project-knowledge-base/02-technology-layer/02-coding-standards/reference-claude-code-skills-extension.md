# Claude Code Skills 扩展

> **基于**：[Agent Skills 开放标准](reference-agent-skills-specification.md)，Claude Code 在其上增加了 12 个扩展字段。
>
> **来源**：[Claude Code Skills 文档](https://code.claude.com/docs/en/skills)
>
> **版本**：2026-05-17

---

## 与标准的关系

Claude Code 完全遵循 [Agent Skills 开放标准](reference-agent-skills-specification.md)，配置文件仍然是 `SKILL.md`。在此基础上：

- `name` 改为**可选**（省略时默认使用目录名）
- `description` 改为**推荐但非必填**（省略时默认使用正文首段）
- 新增 12 个扩展字段，全部写在 `SKILL.md` frontmatter 中

---

## 扩展字段总览

所有扩展字段均写在 `SKILL.md` frontmatter YAML 中。

### 调用控制

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

### 触发与参数

| 字段 | 类型 | 说明 |
| ---- | ---- | ---- |
| `when_to_use` | string | 附加触发上下文（触发短语、示例请求）。追加到 `description` 后，共享 1536 字符上限。 |
| `paths` | string / list | glob 模式，限制 skill 仅在操作匹配文件时自动激活。与路径特定规则格式相同。 |
| `argument-hint` | string | 自动补全提示。如 `[issue-number]` 或 `[filename] [format]`。 |
| `arguments` | string / list | 命名位置参数。用于 skill 正文中的 `$name` 变量替换，按顺序映射。 |

### 执行环境

| 字段 | 类型 | 说明 |
| ---- | ---- | ---- |
| `model` | string | skill 激活时的模型覆盖（如 `claude-opus-4-7`）。仅影响当前 turn，不写入设置。`inherit` 保持当前模型。 |
| `effort` | string | skill 激活时的 effort level。可选：`low`、`medium`、`high`、`xhigh`、`max`。继承会话设置。 |
| `context` | string | 设为 `fork` 时，skill 在隔离子 agent 中运行，无权访问会话历史。仅适用于有明确任务指令的 skill。 |
| `agent` | string | `context: fork` 时的子 agent 类型。可选：`Explore`、`Plan`、`general-purpose` 或自定义 agent。默认 `general-purpose`。 |
| `hooks` | object | skill 生命周期 hook。格式同 `.claude/settings.json` 中的 hooks 配置。 |
| `shell` | string | `` !`command` `` 和 ` ```! ` 块使用的 shell。`bash`（默认）或 `powershell`（需 `CLAUDE_CODE_USE_POWERSHELL_TOOL=1`）。 |

### 字符串替换变量

| 变量 | 说明 |
| ---- | ---- |
| `$ARGUMENTS` | 所有传入参数 |
| `$ARGUMENTS[N]` / `$N` | 按索引访问参数，`$0` = 第一个 |
| `$name` | `arguments` 列表中声明的命名参数 |
| `${CLAUDE_SESSION_ID}` | 当前 session ID |
| `${CLAUDE_EFFORT}` | 当前 effort level |
| `${CLAUDE_SKILL_DIR}` | skill 目录的绝对路径 |

---

## 动态上下文注入

`` !`<command>` `` 语法在 skill 内容送达 Claude **之前**执行 shell 命令，将输出内联替换占位符。Claude 只看到最终结果，不看到命令本身。

```yaml
---
name: pr-summary
description: Summarize changes in a pull request
context: fork
agent: Explore
allowed-tools: Bash(gh *)
---

## Pull request context
- PR diff: !`gh pr diff`
- PR comments: !`gh pr view --comments`
- Changed files: !`gh pr diff --name-only`

## Your task
Summarize this pull request...
```

执行流程：

1. 每个 `` !`<command>` `` 立即执行（Claude 看到内容之前）
2. 输出替换占位符
3. Claude 收到已渲染完成的 prompt

**多行命令**使用 ` ```! ` 开头的 fenced code block：

````markdown
## Environment
```!
node --version
npm --version
git status --short
```
````

- 替换在原始文件上**只运行一次**。命令输出作为纯文本插入，不会再次扫描 `` !`...` `` 占位符。
- 在 [settings](/en/settings) 中设置 `"disableSkillShellExecution": true` 可全局禁用此行为（仅影响 user/project/plugin 来源的 skill，bundled/managed skill 不受影响）。被禁用的命令替换为 `[shell command execution disabled by policy]`。

> 在 skill 正文中包含 `ultrathink` 关键词可在 skill 运行时触发深度推理模式。

---

## Skill 可见性覆盖（`skillOverrides`）

通过 [settings](/en/settings) 中的 `skillOverrides` 控制 skill 可见性，无需修改 `SKILL.md` frontmatter。适用于不想编辑的共享 repo skill 或 MCP server 提供的 skill。`/skills` 菜单可直接操作：选中 skill 按 `Space` 循环状态，`Enter` 保存到 `.claude/settings.local.json`。

| 值 | Claude 可见 | `/` 菜单 |
| --- | :---: | :---: |
| `"on"`（默认） | name + description | ✅ |
| `"name-only"` | 仅 name | ✅ |
| `"user-invocable-only"` | 隐藏 | ✅ |
| `"off"` | 隐藏 | ❌ |

```json
{
  "skillOverrides": {
    "legacy-context": "name-only",
    "deploy": "off"
  }
}
```

> Plugin skill 不受 `skillOverrides` 影响，通过 `/plugin` 管理。

---

## Skill 生命周期

- **激活时**：渲染后的 `SKILL.md` 内容作为单条消息进入会话，**跨 turn 持久保留**。Claude Code 不会在后续 turn 重新读取 skill 文件。
- **自动压缩时**：每个 skill 保留前 **5,000 tokens**，所有 re-attached skill 共享 **25,000 tokens** 总预算。预算从最近使用的 skill 开始填充，较早的 skill 在压缩后可能被完全丢弃。
- **如果 skill 似乎失效**：内容通常仍在上下文中，是模型选择了其他方案。强化 `description` 和指令，或使用 hooks 强制执行。若 skill 体量大或之后调用了多个其他 skill，压缩后重新调用可恢复完整内容。

---

## Skill 位置与层级

| 层级 | 路径 | 范围 |
| ---- | ---- | ---- |
| 企业 | Managed settings | 组织内所有用户 |
| 个人 | `~/.claude/skills/<name>/SKILL.md` | 所有项目 |
| 项目 | `.claude/skills/<name>/SKILL.md` | 当前项目 |
| 插件 | `<plugin>/skills/<name>/SKILL.md` | 插件启用时 |

覆盖优先级：**企业 > 个人 > 项目**。Plugin skill 使用 `plugin-name:skill-name` 命名空间，不与其他层级冲突。`.claude/commands/` 中的文件与 skill 同名时，skill 优先。

**热更新**：Claude Code 监听 skill 目录的文件变更。添加、编辑、删除 skill 在当前会话内即时生效。新建会话启动时还不存在的顶级 skills 目录需重启 Claude Code。

**嵌套发现**：项目 skill 从起始目录及其所有父目录向上到仓库根加载。在子目录中操作文件时，还会按需发现嵌套 `.claude/skills/` 目录（如 `packages/frontend/.claude/skills/`），支持 monorepo 场景。

---

## `allowed-tools` 在 Claude Code 中的行为

`allowed-tools` 来自 [Agent Skills 标准](reference-agent-skills-specification.md)，Claude Code 完全支持。需要注意：

- 它**授权**列出的工具免审批使用，**不限制**其他工具（仍可调用，由权限设置管控）。
- 对于项目 `.claude/skills/` 中的 skill，需 accept workspace trust 后才生效。
- 可通过 deny rules 反向限制某 skill 的工具使用。

---

## 限制 Skill 访问

默认 Claude 可调用所有未设置 `disable-model-invocation: true` 的 skill。三种控制方式：

| 方式 | 作用 |
| ---- | ---- |
| `/permissions` 中 deny `Skill` 工具 | 禁用全部 skill |
| 权限规则 `Skill(name)` / `Skill(name *)` | 允许或拒绝特定 skill |
| `disable-model-invocation: true` | 隐藏单个 skill |

```text
# 仅允许特定 skill
Skill(commit)
Skill(review-pr *)

# 拒绝特定 skill
Skill(deploy *)
```

> `user-invocable: false` 仅控制菜单显示，**不阻止**程序化调用。要阻止 Claude 自动调用，必须用 `disable-model-invocation: true`。

---

## "仅手动调用"配置

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

---

## 平台专属 Checklist 补充

- [ ] `description` 具体、含触发关键词
- [ ] 如需禁止自动调用，设置 `disable-model-invocation: true`
- [ ] 如需从 `/` 菜单隐藏，设置 `user-invocable: false`
- [ ] 如需隔离执行，使用 `context: fork` + `agent`
- [ ] 如需动态数据，使用 `` !`<command>` `` 或 ` ```! ` 上下文注入
- [ ] 如需调整可见性不修改源文件，使用 `skillOverrides` 设置
- [ ] 平台专属字段写在 `SKILL.md` frontmatter（非 `agents/openai.yaml`）
- [ ] 项目 skill 注意 workspace trust 对 `allowed-tools` 的影响

---

## 参考链接

| 资源 | URL |
| ---- | --- |
| Claude Code Skills 文档 | <https://code.claude.com/docs/en/skills> |
| Agent Skills 开放标准 | <https://agentskills.io/specification> |
