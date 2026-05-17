# DeepSeek TUI 文档模块化拆分设计

> 日期: 2026-05-17

## 背景

现有 `reference-deepseek-tui-configuration.md` 是一篇 6KB 的综合参考文档，涵盖配置、Hooks、扩展机制、运行时。agent 加载时必须一次吞入全部内容，无法按需选择模块。

## 目标

将综合文档拆分为按模块独立的小文档，放入 `deepseek-tui/` 子目录，每个文档 1-3KB，agent 可按需加载。

## 非目标

- 不新增新的文档内容（仅拆分 + 校准）
- 不修改知识库分类体系
- 不改变知识库索引机制（走 publisher 自动处理）

## 设计

### 目录结构

```
docs/00-project-knowledge-base/02-technology-layer/04-api-docs/
  deepseek-tui/
    README.md                                    # 总索引
    reference-deepseek-tui-configuration.md       # 配置系统
    reference-deepseek-tui-hooks.md               # Hooks 系统
    reference-deepseek-tui-extensions.md          # Skills / MCP / Plugins
    reference-deepseek-tui-runtime.md             # 引擎执行流 / sub-agents / RLM / LSP
```

### 内容边界

| 文档 | 包含 | 预估大小 |
|------|------|---------|
| `configuration` | 配置文件路径/优先级、project overlay 键（含 instructions）、provider 配置、profiles | ~2KB |
| `hooks` | 7 种事件类型、3 种 Sink（含 WebhookHookSink 重试）、配置格式双写法、`/hooks` 命令、与 Claude Code 对比 | ~2KB |
| `extensions` | Skills 位置/格式/安装、MCP 配置/协议/初始化、Plugins 位置/引用、四者架构图 | ~1.5KB |
| `runtime` | 引擎执行流（10 步完整流程）、sub-agents 并发模型、RLM、LSP diagnostics | ~1.5KB |

### 总索引 (README.md)

- 指向 4 篇模块文档的链接 + 一行描述
- 标注来源 URL

### 迁移步骤

1. `knowledge-base-author` 生成 4 篇模块文档草稿 + 索引草稿
2. 用户确认
3. `knowledge-base-publisher` 写入新文件 + 更新分类索引
4. `knowledge-base-publisher` 删除旧文件 + 再次更新索引

### 验收标准

- 旧文件 `reference-deepseek-tui-configuration.md` 已删除
- `deepseek-tui/` 下有 5 个文件（1 索引 + 4 模块）
- 旧文档所有内容均在新文档中有对应
- `04-api-docs/README.md` 中索引链接指向新结构
- Git 提交记录清晰

## 风险

- 无。纯文档重组，不涉及代码或配置变更。
