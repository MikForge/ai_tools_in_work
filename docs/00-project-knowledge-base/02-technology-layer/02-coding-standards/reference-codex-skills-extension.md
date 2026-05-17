# Codex Skills 扩展

> **基于**：[Agent Skills 开放标准](reference-agent-skills-specification.md)，Codex 在其上增加了独立的 `agents/openai.yaml` 配置文件。
>
> **来源**：[Codex Skills 文档](https://developers.openai.com/codex/skills)
>
> **版本**：2026-05-15

---

## 与标准的关系

Codex 完全遵循 [Agent Skills 开放标准](reference-agent-skills-specification.md)，`SKILL.md` 仅包含标准字段（`name`、`description` 等，均为必填）。

**关键区别**：Codex **不在 SKILL.md 中扩展字段**，而是使用独立的 `agents/openai.yaml` 文件存放所有扩展配置。

---

## `agents/openai.yaml` 结构

```yaml
interface:
  display_name: "My Skill"          # 用户界面显示名
  short_description: "..."          # 用户界面描述
  icon_small: ./assets/icon.svg      # 小图标路径
  icon_large: ./assets/icon.png     # 大图标路径
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

---

## 字段说明

### `interface` — 用户界面

| 字段 | 类型 | 说明 |
| ---- | ---- | ---- |
| `display_name` | string（可选） | Codex 应用 UI 中的显示名 |
| `short_description` | string（可选） | UI 中显示的简短描述 |
| `icon_small` | path（可选） | 小图标（SVG）路径，如 `./assets/icon.svg` |
| `icon_large` | path（可选） | 大图标（PNG）路径，如 `./assets/icon.png` |
| `brand_color` | hex string（可选） | 品牌色，如 `#3B82F6` |
| `default_prompt` | string（可选） | skill 的默认环绕提示词 |

### `policy` — 调用策略

| 字段 | 类型 | 说明 |
| ---- | ---- | ---- |
| `allow_implicit_invocation` | boolean（可选，默认 `true`） | `false` 时 Codex 不会基于用户提示隐式调用 skill。显式 `$skill` 调用仍然有效。 |

### `dependencies` — 工具依赖

| 字段 | 说明 |
| ---- | ---- |
| `tools[]` | MCP 工具依赖列表。每项含： |
| `tools[].type` | 工具类型，如 `mcp` |
| `tools[].value` | MCP 服务名 |
| `tools[].description` | 人类可读的描述 |
| `tools[].transport` | 传输协议，如 `streamable_http` |
| `tools[].url` | MCP 端点 URL |

---

## "仅手动调用"配置

**SKILL.md**：

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

**agents/openai.yaml**：

```yaml
policy:
  allow_implicit_invocation: false
```

---

## 与 Claude Code "仅手动调用"的等价关系

| 平台 | 字段 | 位置 |
| ---- | ---- | ---- |
| Claude Code | `disable-model-invocation: true` | `SKILL.md` frontmatter |
| Codex | `policy.allow_implicit_invocation: false` | `agents/openai.yaml` |
| Agent Skills 标准 | 无 | — |

---

## 平台专属 Checklist 补充

- [ ] 扩展配置写入 `agents/openai.yaml`（非 `SKILL.md` frontmatter）
- [ ] 如需禁止隐式调用，设置 `policy.allow_implicit_invocation: false`
- [ ] UI 信息（`display_name`、图标、品牌色）按需填写
- [ ] MCP 工具依赖在 `dependencies.tools[]` 中声明

---

## 参考链接

| 资源 | URL |
| ---- | --- |
| Codex Skills 文档 | <https://developers.openai.com/codex/skills> |
| Codex 创建 Skill | <https://developers.openai.com/codex/skills/create-skill> |
| openai/skills GitHub | <https://github.com/openai/skills> |
| Agent Skills 开放标准 | <https://agentskills.io/specification> |
