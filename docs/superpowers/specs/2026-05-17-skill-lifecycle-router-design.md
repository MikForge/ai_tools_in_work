# Skill Lifecycle Router — Design Spec

## Problem

Skill 开发涉及多个阶段（设计、计划、执行、测试、审查、反馈），但没有统一入口。用户需要自己知道每个阶段用什么工具、按什么顺序。更关键的是：各阶段孤立运行，**下游不知道上游产出了什么，反馈无法回流到源头**。

更深层的问题是——Harness Engineering 的核心发现：**瓶颈不在 Agent 智能，在基础设施。** 五个独立团队得出一致结论。当前 skill 开发缺少的不是更好的指令或更多的上下文，而是一个约束 Agent 行为、回流错误信号、阻止坏模式复制的运行环境。

## What This Is

`skill-lifecycle-router` 是 skill 生命周期的 **Harness 层**——它在子 skill 和现有 skill 之上，提供**入口约束、出口自检、反馈回流和熵管理**。对用户和 Agent 而言，它只做一件事：**询问当前要处理哪个阶段，转发到对应子 skill，并在阶段结束后展示状态**。

## 设计原则 — Harness Engineering 范式

本设计遵循 Harness Engineering「人类掌舵，智能体执行」的核心理念。Router 不是给 Agent 更好的 prompt（Prompt Engineering），也不是把全部上下文一次性塞给 Agent（Context Engineering 的误用），而是**为 Agent 构建一个稳定入口 + 按需检索 + 约束阻断 + 反馈回流 + 熵管理的运行环境**——让 Agent 在正确的时间获得正确的信息，在违反约束时被阻断并知道为什么，在失败后信号能回到源头。

核心悖论直接适用：

> 为了获得更高的 AI 自主性，运行时必须受到更严格的约束。

### 范式定位

| 层次 | 本设计的对应 | 解决什么问题 |
| ---- | ------------ | ------------ |
| **Harness 层** | `skill-lifecycle-router` — 入口条件、产物校验、反馈回流、阶段定位、熵管理 | Agent 如何可靠地运行 |
| Agent 框架层 | 子 skill — design / plan / task / test / review / feedback | Agent 如何执行具体任务 |
| SDK/API 层 | `brainstorming`、`writing-plans`、`test-driven-development` 等现有 skill | 模型调用、工具注册 |

Router 不替代子 skill，不替代现有 skill。它位于它们**之上**，提供约束和反馈——正如 Harness 层位于 Agent 框架之上。

### 四道护栏在本设计中的映射

| 护栏（Harness 定义） | 本设计对应机制 |
| -------------------- | -------------- |
| **护栏一：上下文工程** — 稳定极简入口 + 按需检索 | Router 统一入口，展示当前阶段和已有产物；子 skill 只读取前置阶段产物文件，不预设全部上下文 |
| **护栏二：架构约束** — 分层依赖 + 自动阻断 + 解释 why | design → plan → task → test 分层依赖链；入口条件阻断（前置产物不存在拒入并解释为什么和怎么补）；review 阶段模式一致性检查 |
| **护栏三：反馈回路** — Agent 审 Agent + 验证反查 | 两层审查：验证审产物（第一层） + 验证有效性反查（第二层，审验证者）；review 阶段结构化审查产物；出口自检防过早宣布胜利；feedback 统一标注回流阶段 |
| **护栏四：熵管理** — 持续小规模偿还 + 规则进化 | 后续进入同阶段时提醒历史上类似失败；周期性审查 feedback 历史孵化新规则；反馈回流即修复不积压 |

### Agent 三种失败模式的防御

| 失败模式 | 表现 | 本设计防御 |
| -------- | ---- | ---------- |
| 一步到位（One-shotting） | Agent 试图一次完成所有功能，耗尽上下文 | Router 强制分阶段，每阶段产出单一文件 |
| 过早宣布胜利 | 看到部分进展就宣布完成 | **阶段出口自检** — 产物存在、无占位符、无矛盾 |
| 过早标记功能完成 | 写完代码就标记完成，从未测试 | **test 自检**要求验证通过；**验证有效性反查** — 如验证全通过但产物质量可疑，判定验证边界不足 |

### 模式复制防御

Agent 极度擅长模式复制——包括复制坏模式和错误的架构模式。没有约束的 Agent 会以可怕的速度积累技术债务。

本设计的防御：**review 阶段的审查范围必须包含模式一致性检查**。审查不只检查"对不对"，还检查"像不像已有的好模式"。如果当前产物引入了与项目中已验证模式不一致的结构，review 必须标注。

## Architecture

只有 router 的 `SKILL.md` 暴露为可调用 skill（`/skill-lifecycle-router`）。子 skill 嵌套在 router 目录内，不暴露为独立 skill，仅由 router 内部读取并执行。

```text
skill-lifecycle-router/
  SKILL.md                              # 暴露为 /skill-lifecycle-router — 路由 + 约束 + 反馈 + 规则进化
  zh-CN.md
  constraints/                          # 约束规范
    design-constraints.md               # design doc 审查清单
    plan-constraints.md                 # plan doc 审查清单
    task-constraints.md                 # task 产物审查清单
    test-constraints.md                 # test report 审查清单
    feedback-note-constraints.md        # feedback note 格式约束
  skill-lifecycle-design/SKILL.md       # 内部 — 产出 design doc
  skill-lifecycle-plan/SKILL.md         # 内部 — 产出 plan doc（入口条件：design doc 存在）
  skill-lifecycle-task/SKILL.md         # 内部 — 按 plan 执行实现（入口条件：plan doc 存在）
  skill-lifecycle-test/SKILL.md         # 内部 — 产出 test report（入口条件：task 产物存在）
  skill-lifecycle-review/SKILL.md       # 内部 — 审查产物 + 模式一致性检查，按产物类型读取 constraints/ 下对应清单，问题通过 feedback 回流
  skill-lifecycle-feedback/SKILL.md     # 内部 — 产出 feedback note + 回流路由（用户可选；review/test 也可触发）
```

## Router 行为

1. 列出 6 个阶段（design / plan / task / test / review / feedback）和当前各阶段产物状态
2. 问用户要进哪个
3. 检查入口条件：
   - `plan` 需要 design doc 存在
   - `task` 需要 plan doc 存在
   - `test` 需要 task 产物存在
   - `review` 需要目标产物存在（用户指定审查哪个阶段的产物）
   - `feedback` 无前置条件（用户随时可触发；review/test 检测到问题也会自动触发）
4. 条件不满足时，Router 不仅阻断，还**解释为什么**这条约束存在（受 Harness 约束护栏启发：Linter 报错信息本身也是上下文工程——不仅告诉 Agent 违反了什么，还解释为什么这条规则存在，以及如何修复）
5. 条件满足 → 转发到对应子 skill
6. 子 skill 执行完毕后，回到 router，展示当前状态，问下一步

## 阶段产物与入口条件

| 阶段 | 产物 | 前置条件 | 不满足时的解释 |
| ---- | ---- | -------- | -------------- |
| design | `skill-lifecycle-router/specs/<skill-name>-design.md` | 无 | — |
| plan | `skill-lifecycle-router/plans/<skill-name>-plan.md` | design doc 存在 | "没有设计文档的实现计划容易偏离方向——先用 design 阶段明确边界和范围" |
| task | 目标 skill 的 `SKILL.md` 及相关文件 | plan doc 存在 | "没有实现计划就动手容易跑偏——先用 plan 阶段明确要做什么" |
| test | `skill-lifecycle-router/test/<skill-name>-test-report.md` | task 产物存在 | "没有实现产物就测试是在验证空气——先完成 task 阶段" |
| review | `skill-lifecycle-router/notes/<skill-name>-review.md` → 问题通过 feedback 回流 | 目标产物存在 | "没有产物可以审查——先完成对应阶段的输出" |
| feedback | `skill-lifecycle-router/notes/<skill-name>-feedback.md` | 无（用户可选；review/test 检测到问题也会触发） | — |

入口条件检查只验证文件存在性，不校验内容质量。Router 不替代人工判断。

## 护栏三：反馈回路

feedback 阶段的核心价值不是"记录问题"，而是**把信号回流到正确的阶段**：

```text
review 发现设计缺陷 → feedback 记录（标注回流: design）→ 回到 design 修改设计
review 发现计划遗漏 → feedback 记录（标注回流: plan）→ 回到 plan 补充计划
review 发现实现问题 → feedback 记录（标注回流: plan 或 design）→ 回到对应阶段
review 发现模式偏离 → feedback 记录（标注回流: design）→ 回到 design 对齐模式
test 发现文档缺口   → feedback 记录（标注回流: design）→ 回到 design 补充文档
test 发现设计缺陷   → feedback 记录（标注回流: design）→ 回到 design 修改设计
test 全通过但可疑   → feedback 记录（标注: test 边界不足）→ 回到 test 重新设计测试
子 skill 自检失败   → feedback 自动记录        → 路由到对应阶段
```

**Agent 审 Agent 的两层结构：**

- **review 阶段**：独立审查者审产物。Agent A 产出 → Agent B（review skill）结构化审查 → 缺陷回流。对应 Harness 原文"代码审查从人对人变成 Agent 对 Agent"。
- **两层审查**：第一层：**验证审产物**——Agent 按约束规范验证产物，验证是产物的自动化审查者。第二层：**反查审验证**——如果验证全通过但产物有肉眼可见问题，Harness 判定验证无效，强制 Agent 重新考虑验证边界。对应 Harness 原文"AI 写的测试通过了有 bug 的代码 → 判定测试无效"。

feedback 是信号路由器——review 和 test 都是信号源，feedback 统一标注严重度和回流阶段，路由回源头。

**feedback 触发机制**：review/test 子 skill 完成后，router 检查其产物。若 report 中 Issues 段非空，router 调用 feedback 子 skill，按 `constraints/feedback-note-constraints.md` 格式生成 feedback note，存入 `notes/<skill-name>-feedback.md`。（Issues 段格式由 `constraints/` 下对应审查清单定义。）Router 随后展示问题数量和回流目标阶段，询问用户："回去修，还是接受继续？"

**反馈循环终止条件**：review 阶段产出零 Critical + 零 Important 问题时，router 视为自动通过。同时用户保留否决权——review 通过后用户仍可说"不满意，回去改"；review 发现问题后用户也可说"这些问题我认了，继续"。自动化判定（review）+ 人工否决权（用户），两者叠加决定是否退出循环。

## 护栏三：阶段出口自检

每个子 skill 在宣布完成前，必须自检产物。这是 Harness 反馈回路的核心实践——**Agent 在宣布胜利之前，必须先验证自己的输出**：

- **design**：设计文档存在、无 "TBD" 占位符、无矛盾断言
- **plan**：计划文件存在、每个步骤可独立验证
- **task**：产物符合 plan 步骤、每个步骤有对应产出
- **test**：验证通过/失败结果明确、失败项有定位信息；**追加反查**——如果全部通过但产物有肉眼可见问题，判定验证边界不足，不通过
- **review**：审查报告存在、每条发现标注了严重度和建议回流阶段、包含模式一致性检查结论
- **feedback**：每条问题标注了严重度和建议回流阶段

`test` 的反查规则直接来自 Harness 实践：如果验证通过了有缺陷的产物，Harness 判定验证无效，强制 Agent 重新考虑验证边界。

自检失败时，子 skill 不宣布完成，而是产出 feedback note 并标注回流到自身。

**自检执行机制**：自检是子 skill 的职责，不是 router 的职责。但 router 要求每个产物文件末尾附带自检声明：

```markdown
## Self-Check
- [x] 产物文件存在
- [x] 无 "TBD" / "TODO" 占位符
- [x] 无矛盾断言
```

以上为 design 阶段自检示例。各阶段自检项不同，子 skill 按 L133-138 定义各自的清单。Router 只检查声明**存在**，不校验声明内容的正确性——校验质量是 review 阶段的事。缺少自检声明视为阶段未完成。

## 护栏四：熵管理

Harness 的熵管理分两个时间尺度：

**短期（每次 feedback 触发）**：feedback 记录的问题不只是回流到源头修复——router 在阶段切换时扫描 `notes/` 下的 feedback 记录，提取与当前阶段相关的历史问题，提醒 Agent 注意类似失败。不额外维护独立的失败案例库。

**长期（周期性触发）**：当 feedback 积累到一定数量，用户可通过 `review` 审查 feedback 历史，识别反复出现的失败模式，将其编码为 router 的新入口条件或子 skill 的新自检项。这是 **router 规则的进化机制**——规则不是设计时拍板的，而是从 Agent 的每一次失败中生长出来的。

## 子 skill

| 子 skill | 做什么 | 参考哪些现有 skill |
| -------- | ------ | ------------------ |
| `skill-lifecycle-design` | 判定该不该做、定义边界和范围、产出设计文档 | `brainstorming` + `writing-skills` |
| `skill-lifecycle-plan` | 设计 → 实现计划、分解为可独立执行的步骤 | `writing-plans` |
| `skill-lifecycle-task` | 按 plan 执行实现、产出 skill 产物 | `executing-plans` |
| `skill-lifecycle-test` | 验证产物格式、完整性、结构 + 验证有效性反查，问题通过 feedback 回流 | `writing-skills`（验证标准） |
| `skill-lifecycle-review` | 结构化审查产物 + 模式一致性检查，问题通过 feedback 回流 | 独立设计（文档审查，非代码审查） |
| `skill-lifecycle-feedback` | 记录问题、标注严重度和回流阶段、触发修复循环 | 独立设计 |

Router 不做方法承载——它只路由到对应子 skill，由子 skill 自行参考现有 skill 执行。各子 skill 独立工作，不重复造轮子。

## Future Scope

以下 Harness 核心关注点（持久化、确定性重放、成本控制、可观测性、错误恢复）属于 Harness 框架提供持久价值的"20%"，但本设计的 v1 不做：

- **阶段执行可观测性**：每个阶段花费多少 token、多长时间、几轮对话
- **确定性重放**：给定同一份 design doc + plan doc，能否重现相同的实现
- **成本控制**：按阶段预算 token 上限
- **错误恢复**：阶段中途失败后的恢复策略

## Non-Goals

- 不替代人工决策（每个阶段的进入、接受/回流由人拍板——Harness 范式中人类掌舵）
- 不强制阶段顺序（用户可以直接跳到任意已满足入口条件的阶段）
- 不共享契约（各子 skill 的输入输出格式独立定义）
- 不追踪内容级变更历史（git 已经做这件事）
