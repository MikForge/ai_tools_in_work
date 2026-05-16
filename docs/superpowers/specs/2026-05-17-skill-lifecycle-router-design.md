# Skill Lifecycle Router — Design Spec

## Problem

Skills 缺乏上层生命周期管理。`writing-skills` 解决了"怎么写"，但没有回答"什么时候该写""该不该写""写完怎么维护""什么时候该退役"。每次都需要人工判断和手动串联工具。

## What This Is

`skill-lifecycle-router` 是 skill 全生命周期的顶层入口。它不重写现有 skill 的方法，只做编排：判断当前阶段、决定下一步、在阶段之间传递产物、引用已有 skill 完成具体工作。

## Architecture

```
skill-lifecycle-router/
  SKILL.md    # 全生命周期编排（MVP 只有一个文件）
  zh-CN.md    # 中文翻译
```

**不做子 skill。** MVP 阶段全部内容在一个 SKILL.md 里。如果某个阶段未来膨胀，再拆分子 skill——但起步必须精简。

## Lifecycle Stages

```
idea → design → plan → create → test → feedback ──→ loop back
  ↑                                                  │
  └──────────────────────────────────────────────────┘
```

| 阶段 | 做什么 | 产物 | 下一个阶段的门 |
|------|--------|------|---------------|
| **design** | 判定该不该做成 skill、定义边界和范围 | 设计文档（几句即可） | 明确"这值得做"且有清晰边界 |
| **plan** | 设计文档 → 开发规范 → 实现计划 | 实现计划 | 计划覆盖所有设计要点 |
| **create** | 按 TDD 写出 SKILL.md + zh-CN.md | 可部署的 skill 文件 | RED-GREEN 通过 |
| **test** | 回归测试、压力场景验证 | 测试报告 | 所有已知 rationalization 被堵住 |
| **feedback** | 记录线上问题、评估是否需要修复 | 问题记录 | 判断：回归修复 / 退役 / 继续观察 |

## Stage Exit Criteria (精简)

### design → plan
- [ ] 明确 skill 解决什么问题
- [ ] 明确触发条件（何时加载）
- [ ] 判定不是 CLAUDE.md 或一次性脚本能解决的
- [ ] 边界清晰，不和已有 skill 重叠

### plan → create
- [ ] 有实现计划（可引用 `writing-plans` 产出）
- [ ] 计划覆盖了 CSO、zh-CN、rationalization 防御
- [ ] 确定用何种 skill type（technique / pattern / reference / discipline）

### create → test
- [ ] SKILL.md 和 zh-CN.md 存在且同步
- [ ] RED 基线测试跑过（引用 `writing-skills` TDD 流程）
- [ ] GREEN 通过

### test → feedback
- [ ] 压力场景通过
- [ ] 常见 rationalization 被堵住
- [ ] 未发现新漏洞

### feedback → design (loop)
- [ ] 线上发现的问题已被记录
- [ ] 判断：需要回归修复 → 回到 design 阶段重走流程
- [ ] 判断：已过时/无价值 → 退役

## Integration with Existing Skills

本 skill **只编排，不重写**：

| 阶段 | 引用的现有 skill |
|------|-----------------|
| design 前期探索 | `brainstorming` |
| plan 产出实现计划 | `writing-plans` |
| create 产出 SKILL.md | `writing-skills` |
| test 执行测试 | `writing-skills`（TDD 流程） |
| feedback 问题记录 | 本 skill 直接处理（足够简单） |

## Key Design Decisions

1. **不拆子 skill。** 一个文件，500 字以内。阶段描述用 checklist，不用长篇论述。
2. **引用而非重写。** `writing-skills` 已经是可靠的"怎么写"工具，本 skill 只回答"什么时候用 writing-skills""下一步该干什么"。
3. **闭环。** feedback → design 的回路是核心价值——让 skill 不是一次性的，而是持续演进的。
4. **退役是显式决策。** 不是"放着不用"，而是主动判定、显式标记。

## Non-Goals (MVP)

- 不上游变更追踪工具
- 不自动化测试套件
- 不 CLI 工具
- 不子 skill 拆分

## File Location

```
.agents/skills/skill-lifecycle-router/
  SKILL.md
  zh-CN.md
```
