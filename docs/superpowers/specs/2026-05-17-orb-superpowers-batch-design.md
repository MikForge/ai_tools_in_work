# Orb-superpowers 参考文档批量收录设计

> 日期: 2026-05-17

## 背景

`orb-superpowers/` 目前只有一篇 `design-writing-skills-flow.md`。
上游 [obra/superpowers/skills](https://github.com/obra/superpowers/tree/main/skills) 共 14 个 skill 目录。

## 目标

逐篇从上游收录参考文档，每篇一个独立 markdown 文件，保持目录结构不变。

## 非目标

- 不修改已有 `design-writing-skills-flow.md`
- 不做技能测试或验证（纯文档整理）

## 设计

### 目录结构（不变）

```
orb-superpowers/
  README.md
  design-writing-skills-flow.md          # 已有
  reference-brainstorming-overview.md    # 新增
  reference-dispatching-parallel-agents-overview.md
  ...
```

### 每篇参考文档格式

1KB-2KB，统一结构：
- 概述: 触发场景（来自上游 Description）
- 关键设计决策: 2-5 条核心原则
- 工作流程: 步骤摘要
- 来源: 上游 GitHub 链接

### 处理顺序

按上游列出的目录顺序，逐个处理、逐个提交。

## 来源

| 资源 | URL |
|------|-----|
| 上游仓库 | https://github.com/obra/superpowers |
| skills 目录 | https://github.com/obra/superpowers/tree/main/skills |
