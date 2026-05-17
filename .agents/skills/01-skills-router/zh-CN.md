---
name: skills-router
description: 当用户想调用某个 skill 但未指定具体是哪个、目标 skill 缺少必要参数、或用户不确定如何继续操作时使用
disable-model-invocation: true
---

# Skills Router（技能路由器）

## 概述

路由器，非执行器。通过引导式提问收集上下文，确认完整后委托给目标 skill 执行。本身不含领域知识——通过读取目标 `SKILL.md`，或已验证为新鲜的 `references/<target-skill>/context.md`，来了解该问什么。

## 适用场景

- 用户想用某个 skill 但没指定具体是哪个
- 目标 skill 需要的参数用户尚未提供
- 用户说"我想做 X"但不确定如何操作
- 多个 skill 可能适用，需要缩小范围

不适用：

- 用户已提供完整上下文和目标 skill 名称
- 用户已通过 `/skill-name` 明确调用特定 skill

## 工作流

### 第一步：确定目标 skill

列出可用 skill 及其描述，询问用户想调用哪一个。
如果用户已经说了名称（如"我想用 X"），确认即可。

**确认后验证目标 skill 是否存在：** 检查 `.agents/skills/<目标-skill>/SKILL.md` 是否存在。如果不存在，立即停止并告知用户目标 skill 不存在。禁止继续进入第二步。

禁止跳过此步骤。禁止假设用户想要哪个 skill。

### 第二步：读取目标规范

**首先运行新鲜度检查脚本：**

```bash
bash .agents/skills/01-skills-router/scripts/check-reference-staleness.sh
```

**然后根据以下决策表解读输出。**

脚本可能输出逐 skill 的状态行或摘要信息。将目标 skill 对应的输出匹配到对应动作。

| 目标 skill 的脚本输出 | 动作 |
| --- | --- |
| `FRESH <skill> ...` | 使用已有的 `references/<目标-skill>/context.md`。提取必需输入、前置条件、路由提示、常见错误和之前的反馈。 |
| `STALE <skill> ...` | 直接读取目标 `SKILL.md`。context 文件已过时，需要刷新。 |
| `MISSING_CONTEXT <skill> ...` | 直接读取目标 `SKILL.md`。context 文件尚不存在——需要创建。 |
| `MISSING_TARGET <skill> ...` | 立即停止并告知用户。目标 skill 目录已不存在。禁止为不存在的目标创建 router context。 |
| `INVALID <skill> ...` 或 `INVALID_CONTEXT <skill> ...` | 直接读取目标 `SKILL.md`。context 文件或 freshness 行格式错误，需要修复。 |
| `No router freshness rows found.` | freshness 表中完全没有记录——目标 skill 从未被路由过。直接读取目标 `SKILL.md`。 |
| 脚本执行失败（文件缺失、无执行权限、崩溃） | 直接读取目标 `SKILL.md`。本次路由跳过 context 缓存；向用户报告脚本错误以便排查。此时仅使用 `SKILL.md` 进入第三步。 |

**当动作是"直接读取目标 SKILL.md"时（FRESH 和 MISSING_TARGET 之外的所有行）：**

创建或刷新 context 文件是**第二步中必须立即执行的动作**，不是之后再做的 TODO——除非脚本本身执行失败。在询问第一个路由问题前，基于目标 `SKILL.md` 创建或更新 `references/<目标-skill>/context.md`（缺少父目录时一并创建）。内容只保留 router 需要的信息：

- 必需的用户输入和缺失参数
- router 必须确认的前置条件或门禁
- 一次一问的路由提示或决策点
- 常见错误，以及之前路由暴露出的反馈

创建或更新 context.md 后，在 `references/freshness.md` 中更新或新增该目标 skill 行，写入目标 skill 目录的最新 mtime 和当前同步时间。重新运行新鲜度检查。如果报告 `FRESH`，使用已刷新的 context。如果仍报告问题，本次路由继续以目标 `SKILL.md` 为准，并把该 reference 保持为待修复状态。

目标 skill 目录仍然是权威来源。Router context 文件是派生缓存和反馈记录；只有通过新鲜度校验后才可使用。

不要把新鲜度元数据放进 `context.md`；所有新鲜度记录都放在 `references/freshness.md`。

读取项目配置文件或依赖记忆不能替代此步骤。

### 第三步：引导式逐一提问

基于第二步的发现，向用户收集所有缺失参数。

一次只问一个问题。每条回答决定下一个问题的方向。

**例外——跳过提问：** 如果用户已在前置对话中提供了目标 skill 所需的全部参数（目标 skill 名称、文件路径、岗位名称等所有信息），直接进入第四步。

禁止批量提问。禁止在同一条消息中问"第一……第二……第三……"。
即使用户催促说"快点"或"直接问就行"。

**中断——放弃或切换 skill：**

- **放弃**（"算了"、"不搞了"、"cancel"）：立即停止。保留部分生成的文件不动；下次路由同一 skill 时会自动刷新。
- **切换到另一个 skill**：回到第一步重新确认新目标，然后第二步重新读取新目标的 `SKILL.md`。前一个 skill 的上下文不能沿用。

### 第四步：委托执行

上下文收集完整后，使用当前运行环境的 skill 加载机制：

- **DeepSeek TUI：** `load_skill({ name: "<目标-skill-名称>" })`
- **Claude Code：** `Skill({ skill: "<目标-skill-名称>" })`

对话上下文（包括第三步的所有问答）自动对目标 skill 可用。

禁止自己执行任务。你是路由器，不是执行器。

## 规则

1. 委托给目标 skill。禁止自己执行任务。
2. 在提问前先读目标 SKILL.md，或读取已验证为新鲜的 `context.md`。禁止假设参数。
3. 一次一个问题，除非用户已在前置对话中提供了全部必需参数。禁止批量提问。即使有时间压力。
4. 如果目标 skill 不存在，立即停止并告知用户。
5. 读其他项目文件（配置、README）不能替代第二步。
6. 如果用户中途切换到另一个 skill，回到第一步重新确认，然后第二步重新读取新目标的 `SKILL.md`。前一个 skill 的上下文不能沿用。
7. 如果新鲜度检查脚本执行失败，回退到直接读取 `SKILL.md`，跳过 context 缓存。

## 常见错误

| 错误 | 纠正 |
| ---- | ---- |
| 跳过第二步，凭记忆提问 | 先读 SKILL.md 或新鲜 context 文件——你的记忆可能已过时 |
| 把新鲜度元数据放进 context.md | `context.md` 只保留上下文；改 `references/freshness.md` |
| 使用过期 context 文件 | 运行过期检查；过期 context 必须从目标 SKILL.md 刷新 |
| 把 `需要刷新` 当成之后再做的 TODO | 在第二步刷新 context 和 freshness 行，再询问第一个问题 |
| 把 `MISSING_TARGET` 当成可刷新的状态 | 停止并告知用户目标 skill 不存在 |
| 读了项目配置而非目标规范 | 配置 ≠ skill 规范。只有目标 SKILL.md 或新鲜 context 文件能告诉你该问什么 |
| 一次问三个以上问题 | 逐条提问——下一条问题取决于上一条回答 |
| 自己执行任务 | 通过 `load_skill({ name: "..." })` 或 `Skill({ skill: "..." })` 委托——你是路由器 |
| skill 不存在仍继续 | 停止并告知用户 |
| 用户切换 skill，沿用旧上下文 | 回到第二步——重新读取新目标的 SKILL.md |

## 危险信号——立即停止，回到第二步

- "这个 skill 我了解，不用读它的 SKILL.md"
- "context 文件已经存在，不用检查是否过期"
- "把 last_synced_mtime 放进 context.md 更方便"
- "配置已经加载了，我直接问……"（配置 ≠ 目标 SKILL.md）
- "一起问了节省时间"
- "这个简单，我直接处理"
- "配置已经读过了，换这个 skill 直接问就行"（切换 → 重新读）

**以上全部意味着：验证当前目标 context，或读取目标 SKILL.md。从第二步重新开始。**