# Generate Agent Workflow 行为树设计

## 背景

本设计定义一个全新的 skill：`generate-agent-workflow`。它读取用户提供的想法、需求、笔记、流程描述或粗略 spec，生成一个最小 agent workflow，不执行 workflow 本身。

根据 `docs/superpowers/agent-pipeline-architecture-comparison.md` 的评估，行为树在 Harness Engineering 维度上得分最高，尤其适合表达顺序约束、失败降级、条件上下文注入，以及 Orchestrator / Worker 分离。

`generate-agent-workflow` 是独立新建的 workflow generator，不基于已有 skill 改造。行为树是该 workflow 的默认结构表达，文件组织服务于 workflow 生成本身。

## 目标

- 明确该 skill 的核心产物是一个 workflow。
- 明确用户应该如何输入内容、名称、路径和约束。
- 明确生成出来的 workflow 要回答什么问题。
- 默认使用行为树表达 workflow。
- 用少量稳定原语表达 agent workflow：`Sequence`、`Fallback`、`Condition`、`Stage`。
- 让失败、重试、降级、人工确认路径成为一等结构，而不是附属说明。
- 保持 skill 是生成 workflow 的 generator，不是 executor。
- 保持 SKILL.md 简洁，详细生成规则放入 engine 和 stage 文件。
- 保留中英文文件同步要求。

## 非目标

- 不实现真实行为树运行时。
- 不引入脚本、CLI、YAML parser 或自动验证器。
- 不把行为树扩展成完整游戏 AI 语义。
- 不改造、迁移或兼容已有 workflow / pipeline skill。
- 不生成过深、过细、难读的控制树。
- 不执行生成出来的 workflow。

## Skill Goal

`generate-agent-workflow` 的目标是把用户给出的想法、需求、笔记、流程描述或粗略 spec 转成 **一个 agent 可遵循的 workflow**。

生成的 workflow 必须回答：

- 这个 workflow 要达成什么目标。
- 用户输入会触发什么工作阶段。
- agent 应按什么顺序工作。
- 哪些上下文只在需要时加载。
- 失败、重试、降级或人工确认时怎么走。
- 最终如何验证 workflow 输出是否满足请求。

这个 skill 只生成 workflow。它不执行 workflow，不写实现计划，不改代码，也不替用户跑任何 workflow stage。

## Input Contract

用户输入必须包含一段要转成 workflow 的内容。名称、路径、约束、失败路径和条件路径都是可选信息；提供得越具体，生成的 workflow 越稳定。

| 字段 | 是否必需 | 作用 |
|---|---|---|
| 内容 | 必需 | 要转换成 workflow 的想法、需求、笔记、流程或粗略 spec。 |
| Workflow 名称 | 可选 | 生成 workflow 的短名称；未提供时从内容中推断。 |
| Workflow 路径 | 可选 | 最终输出里的 workflow 路径；未提供时使用 `{skillpath}/{workflowname}`。 |
| 约束 | 可选 | 限制 workflow 范围，例如只生成、不执行、不要读仓库、必须有人审查。 |
| 失败路径 | 可选 | 测试失败、信息不足、连续失败、需要升级时的处理方式。 |
| 条件路径 | 可选 | 只有满足某条件才执行的阶段，例如需要代码上下文时才读文件。 |

### 最小输入

```text
生成一个 agent workflow：

<要转换的内容>
```

### 带名称和路径

```text
Workflow 名称：research-synthesis
Workflow 路径：.agents/skills/generate-agent-workflow/workflows/research-synthesis

内容：
整理研究资料，提炼结论，生成行动计划。如果资料不足，先列出缺口并请求补充。
```

### 长内容

```text
请只生成 workflow，不要执行。

内容：
<<<
<长笔记、需求、会议记录或 spec>
>>>
```

如果输入只有标题、编号或非常短的片段，skill 仍应生成保守 workflow，并在 workflow 中标记不确定性。只有当输入完全没有可转换内容时，才要求用户补充内容。

## 行为树语义

生成的 workflow 只允许使用四类节点。

| 节点 | 用途 |
|---|---|
| `Sequence` | 顺序执行一组子节点；用于主路径和必须完成的阶段链。 |
| `Fallback` | 按顺序尝试子节点；前一路径失败时进入下一路径；用于失败、重试、降级、人工确认。 |
| `Condition` | 当条件成立时执行子节点；用于按需上下文、可选检查、条件分支。 |
| `Stage` | 叶子 worker 节点；描述一个具体 agent 工作阶段。 |

`Sequence` 是默认顶层节点。最简单的线性 workflow 就是一棵只有 `Sequence` 和 `Stage` 的行为树。

## 输出契约

最终响应生成一个 workflow，并用行为树表达 workflow 内容。

```text
Workflow 路径：{skillpath}/{workflowname}

Workflow 目标：<从用户输入推导出的一句话目标>
输入摘要：<该 workflow 处理的内容或触发输入摘要>

## Behavior Tree

Sequence
- Stage: Parse Intent
  Purpose: Extract the goal, constraints, and expected output.
- Condition: needs_context?
  Then:
    - Stage: Collect Context
      Purpose: Load only context required for the requested workflow.
- Fallback
  - Sequence
    - Stage: Generate Workflow
      Purpose: Produce the smallest workflow that satisfies the request.
    - Stage: Verify Workflow
      Purpose: Check path, minimality, and failure handling.
  - Stage: Escalate Uncertainty
    Purpose: Mark unresolved ambiguity instead of inventing details.
```

如果用户提供具体路径，使用用户路径。否则使用 `{skillpath}/{workflowname}`。

除非用户明确要求解释，最终回答只包含 workflow 路径和生成的 workflow。

## 生成规则

### 最小行为树

默认生成最小可用树：

- 顶层使用 `Sequence`。
- 叶子使用 `Stage`。
- 只有用户内容包含失败、重试、降级、审查、人工确认时才加入 `Fallback`。
- 只有用户内容包含条件执行、可选上下文、按需检查时才加入 `Condition`。
- 默认控制在 4-8 个节点。
- 每个 `Stage` 必须包含一句 `Purpose`。

### 失败与反馈回路

当输入提到失败路径时，必须结构化保留。

示例：

```text
Fallback
- Sequence
  - Stage: Implement Change
    Purpose: Apply the planned modification.
  - Stage: Run Verification
    Purpose: Check whether the change works.
- Stage: Repair Or Escalate
  Purpose: Fix verification failures or request human confirmation after repeated failure.
```

不要把失败路径压成一句普通说明。如果失败路径影响控制流，就用 `Fallback`。

### 上下文工程

当某些上下文不是始终需要时，用 `Condition` 表达按需加载。

示例：

```text
Condition: needs_repository_context?
Then:
  - Stage: Collect Repository Context
    Purpose: Read only files needed to shape the workflow.
```

不要让所有 workflow 都无条件收集全部上下文。

### Harness Engineering 对齐

行为树节点对应 Harness Engineering 的约束含义：

- `Sequence` = 架构护栏，降低跳步和漏步。
- `Fallback` = 反馈回路，表达失败、重试、降级和人工介入。
- `Condition` = 上下文工程入口，只在需要时加载额外上下文。
- `Stage` = Worker 边界，保持职责独立。
- 树结构 = Orchestrator，叶子节点 = Worker。

## Skill 文件结构

建议新建以下文件组织：

```text
.agents/skills/generate-agent-workflow/
  SKILL.md
  zh-CN.md
  engine.md
  engine.zh-CN.md
  stages/
    01-parse-intent.md
    01-parse-intent.zh-CN.md
    02-map-to-behavior-tree.md
    02-map-to-behavior-tree.zh-CN.md
    03-generate-minimal-tree.md
    03-generate-minimal-tree.zh-CN.md
    04-verify-output.md
    04-verify-output.zh-CN.md
```

新建 `02-map-to-behavior-tree.md`，专门把用户意图映射为行为树节点。这个 skill 不在多种 workflow 形态之间选择；shape decision 只发生在行为树内部节点选择上。

## 文件职责

### SKILL.md

入口文件只负责发现和边界：

- 说明何时使用。
- 说明该 skill 根据用户内容生成一个 workflow。
- 说明用户应该如何输入内容、名称、路径和约束。
- 强调只生成，不执行。
- 指向 `engine.md`。
- 给出输入和输出格式。

### engine.md

engine 定义稳定编排：

1. 读取用户内容。
2. 按数字顺序使用 stage 指令。
3. 生成一个最小 workflow，默认使用行为树结构表达。
4. 不执行生成的 workflow。
5. 验证输出契约。
6. 除非用户要求解释，否则最终响应只输出路径和 workflow。

### stages/01-parse-intent.md

提取：

- 用户目标。
- 原始内容。
- Workflow 名称。
- 任务领域。
- 约束。
- 明确路径或默认路径。
- 失败、重试、降级、审查、人工确认信号。
- 条件执行或按需上下文信号。

如果内容模糊，仍生成保守 workflow，并在行为树中标记不确定性。

### stages/02-map-to-behavior-tree.md

将 intent 映射到行为树节点：

- 主路径映射为 `Sequence`。
- 失败和降级路径映射为 `Fallback`。
- 条件和按需上下文映射为 `Condition`。
- 实际工作步骤映射为 `Stage`。

如果不确定是否需要复杂结构，选择更简单的树。

### stages/03-generate-minimal-tree.md

写出最终行为树：

- 在行为树前写出 `Workflow 目标` 和 `输入摘要`。
- 只写 workflow-level 工作阶段。
- 不写具体实现命令，除非用户内容本身要求。
- 每个 `Stage` 写 `Purpose`。
- 避免嵌套超过 3 层。
- 保持节点数量最小。

### stages/04-verify-output.md

检查：

- 路径存在。
- workflow 目标来自用户输入。
- 输出包含 `Workflow 目标` 和 `输入摘要`。
- 输出是行为树，不是线性清单或实现计划。
- 没有执行 workflow。
- 失败路径没有丢失。
- 条件上下文没有被无条件展开。
- 树不过深、不过长。
- 无解释性 prose，除非用户要求。

## 双语要求

任何修改必须同步维护中文版本：

- `SKILL.md` ↔ `zh-CN.md`
- `engine.md` ↔ `engine.zh-CN.md`
- `stages/*.md` ↔ `stages/*.zh-CN.md`

中文文件保留技术标识符、路径、节点名和代码块。

## 验证计划

实现前后使用同一组 pressure scenarios 验证。

### Scenario 0: Named input

Prompt:

```text
Workflow 名称：research-synthesis
Workflow 路径：.agents/skills/generate-agent-workflow/workflows/research-synthesis

内容：
整理研究资料，提炼结论，生成行动计划。如果资料不足，先列出缺口并请求补充。
```

Expected:

- 输出使用用户提供的 workflow 路径。
- workflow 目标明确来自输入内容。
- 输出包含输入摘要。
- 信息不足路径用 `Fallback` 或等价行为树结构表达。

### Scenario 1: Simple workflow

Prompt:

```text
把这个想法变成 agent workflow：整理研究资料，提炼结论，生成行动计划。
```

Expected:

- 输出顶层 `Sequence`。
- 不问不必要问题。
- 不执行 workflow。
- 节点保持最小。

### Scenario 2: Failure handling

Prompt:

```text
生成一个代码改造 workflow：先理解需求，再改代码，再测试。如果测试失败，回到实现修复；如果连续失败，转人工确认。
```

Expected:

- 使用 `Fallback` 表达测试失败后的修复或人工确认路径。
- 不把失败路径压成普通文字说明。

### Scenario 3: Conditional context

Prompt:

```text
生成一个需求分析 workflow。只有当需求涉及现有代码时，才读取仓库上下文。
```

Expected:

- 使用 `Condition: involves_existing_code?` 或类似条件。
- `Collect Repository Context` 不应无条件出现在主路径。

### Scenario 4: Execution pressure

Prompt:

```text
根据这些需求生成 workflow，然后先开始执行第一步。
```

Expected:

- 只生成 workflow。
- 不执行第一步。

## 成功标准

- `generate-agent-workflow` 的语义是根据用户内容生成一个 workflow。
- 默认输出使用行为树结构表达 workflow。
- `Fallback` 和 `Condition` 被用于真实控制流，而不是装饰性文本。
- 简单输入仍得到简单 `Sequence`，不会过度设计。
- skill 文件保持短小、可发现、双语同步。
- 验证记录能证明输入契约、目标提取、失败路径和条件路径都被正确保留。
