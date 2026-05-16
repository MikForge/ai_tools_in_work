# Skill Lifecycle Router — Design Spec

## Problem

Skills 缺乏上层生命周期管理。`writing-skills` 解决了"怎么写"，但没有回答"什么时候该写""该不该写""写完怎么维护""什么时候该退役"。每次都需要人工判断和手动串联工具。

## What This Is

`skill-lifecycle-router` 是 skill 全生命周期的顶层入口。采用 **router + 子 skill** 架构——router 负责阶段编排和状态流转，子 skill 负责各阶段的具体方法。

## Architecture

```
skill-lifecycle-router/                  # 顶层入口（编排 + 流转）
  SKILL.md
  zh-CN.md
  references/
    contract.md                          # 共享契约（阶段转换规则、产物格式）
  skill-lifecycle-design/                # 需求 → 设计文档
    SKILL.md
    zh-CN.md
  skill-lifecycle-plan/                  # 设计 → 开发规范 → 实现计划
    SKILL.md
    zh-CN.md
  skill-lifecycle-test/                  # TDD 基线 + 回归测试
    SKILL.md
    zh-CN.md
  skill-lifecycle-feedback/              # 问题记录 → 修复循环
    SKILL.md
    zh-CN.md
```

参考 `knowledge-base-router` 同模式：共享契约 + 独立子 worker。

## Router 职责

Router 本身（`SKILL.md`）只做编排：

1. **阶段识别** — 当前 skill 处于哪个生命周期阶段
2. **阶段调度** — 根据当前阶段转发到对应的子 skill
3. **产物校验** — 检查阶段产物是否满足出站条件
4. **循环决策** — feedback 后判定：回归 design / 退役 / 继续观察

Router **不直接**写文档、不执行测试、不产出具体内容。

## 子 skill 职责

| 子 skill | 做什么 | 产物 | 下一阶段 |
| -------- | ------ | ---- | -------- |
| `skill-lifecycle-design` | 判定该不该做、定义边界和范围 | 设计文档 | 值得做且有清晰边界 → plan |
| `skill-lifecycle-plan` | 设计 → 开发规范 → 实现计划 | 实现计划 | 计划覆盖设计要点 → test（create 合并入 test） |
| `skill-lifecycle-test` | TDD 流程：基线测试 → 编写 → 验证 | 可部署的 skill + 测试报告 | RED-GREEN 通过 → feedback |
| `skill-lifecycle-feedback` | 记录问题、触发修复循环 | 问题记录 + 修复决策 | 需要修 → design；过时 → 退役 |

## 阶段流转

```text
idea → design → plan → test → feedback ──→ design (loop)
  ↑                                        │
  └────────────────────────────────────────┘
                    │
                    └──→ 退役
```

**入站/出站条件由 `references/contract.md` 定义**，各子 skill 引用同一份契约。

## 与现有 skill 的集成

本体系 **只编排，不重写**：

| 阶段 | 引用的现有 skill |
|------|-----------------|
| design 前期探索 | `brainstorming` |
| plan 产出实现计划 | `writing-plans` |
| test 阶段的实际编写与测试 | `writing-skills` |

`writing-skills` 仍然是"怎么写"的唯一执行者。`skill-lifecycle-test` 负责"什么时候测、测什么、通不通过"，然后调用 `writing-skills` 执行 TDD 流程。

## Key Design Decisions

1. **Router + 子 skill 拆分。** 每个生命周期阶段独立目录，可独立迭代和测试。
2. **共享契约。** `references/contract.md` 定义统一的转换规则和产物格式，各子 skill 之间不直接耦合。
3. **引用而非重写。** `writing-skills` 是可靠的"编写+测试执行"工具，本体系只做生命周期决策。
4. **闭环。** feedback → design 是核心回路。退役是显式决策，不是"放着不用"。
5. **create 合并到 test。** `writing-skills` 的 TDD 流程本身就是 write+test 交替，不拆开。

## Non-Goals (MVP)

- 不上游变更追踪工具
- 不自动化测试套件
- 不 CLI 工具

## File Locations

```
.agents/skills/skill-lifecycle-router/
  SKILL.md
  zh-CN.md
  references/contract.md
  skill-lifecycle-design/SKILL.md
  skill-lifecycle-design/zh-CN.md
  skill-lifecycle-plan/SKILL.md
  skill-lifecycle-plan/zh-CN.md
  skill-lifecycle-test/SKILL.md
  skill-lifecycle-test/zh-CN.md
  skill-lifecycle-feedback/SKILL.md
  skill-lifecycle-feedback/zh-CN.md
```
