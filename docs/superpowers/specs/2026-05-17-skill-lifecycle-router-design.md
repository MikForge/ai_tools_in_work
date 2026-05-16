# Skill Lifecycle Router — Design Spec

## Problem

Skill 开发涉及多个阶段（设计、计划、测试、反馈），但没有统一入口。用户需要自己知道每个阶段用什么工具、按什么顺序。

## What This Is

`skill-lifecycle-router` 是 skill 生命周期的调度入口。它只做一件事：**询问用户需要处理哪个阶段，然后转发到对应的子 skill**。

## Architecture

```
skill-lifecycle-router/
  SKILL.md                              # 路由（问阶段 → 调度）
  zh-CN.md
  skill-lifecycle-design/SKILL.md       # 需求 → 设计文档
  skill-lifecycle-plan/SKILL.md         # 设计 → 实现计划
  skill-lifecycle-test/SKILL.md         # TDD 编写 + 测试
  skill-lifecycle-feedback/SKILL.md     # 问题记录 + 修复循环
```

Router 本身不承载方法，不定义契约，不校验产物。各子 skill 独立工作。

## Router 行为

1. 列出 4 个阶段（design / plan / test / feedback）
2. 问用户要进哪个
3. 转发到对应的子 skill
4. 子 skill 执行完毕后，回到 router，问下一步

## 子 skill

| 子 skill | 做什么 |
| -------- | ------ |
| `skill-lifecycle-design` | 判定该不该做、定义边界和范围 |
| `skill-lifecycle-plan` | 设计 → 开发规范 → 实现计划 |
| `skill-lifecycle-test` | TDD 流程：基线测试 → 编写 → 验证 |
| `skill-lifecycle-feedback` | 记录问题、触发修复循环 |

每个子 skill 独立调用 `writing-skills`、`brainstorming`、`writing-plans` 等现有 skill，不重复造轮子。

## Non-Goals

- 不自动化流水线
- 不强制阶段顺序
- 不共享契约
- 不上游追踪
