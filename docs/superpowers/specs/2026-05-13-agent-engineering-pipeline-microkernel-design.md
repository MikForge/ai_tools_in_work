# Agent Engineering Pipeline 微内核设计

## 背景

`agent-engineering-pipeline` 目前是一个非常轻量的 skill，只有 `SKILL.md` 和 `zh-CN.md`。它要求 agent 读取输入内容并生成一个最小工作流 pipeline，但还没有定义 pipeline 形态、stage 契约、失败回退行为，也没有说明未来维护者应该如何扩展它。

### Harness Engineering 评估框架

本设计的选择依据是 **Harness Engineering** 的核心理念：构建约束、反馈回路、上下文工程和熵管理，而非优化模型本身。它定义了七个维度来衡量架构模式是否适合 agent pipeline：

| # | 维度 | 含义 | 要求 |
|---|------|------|------|
| D1 | 架构约束 | 显式控制流，强制顺序和分层 | LLM 不会跳过/遗漏步骤 |
| D2 | 反馈回路 | 失败→重试→审查→降级→人工介入 | 异常路径可在 pipeline 中表达 |
| D3 | 上下文工程 | 按需注入，不堆料 | 阶段执行时只载入所需上下文 |
| D4 | 熵管理 | 独立修复，不扩散 | 修改一个 stage 不影响其他 |
| D5 | Orch/Worker 分离 | 编排逻辑与执行逻辑解耦 | 结构定义"何时做"，Stage 定义"怎么做" |
| D6 | Human Steer | 人类可理解、可干预 | 维护者读一遍即知流程全貌 |
| D7 | LLM 解读可靠性 | Agent 不误读结构 | 结构越简单，出错概率越低 |

### 为何选择 Plugin / Microkernel

在 14 种候选架构模式中，行为树以 30/35 分排名第一，但 Plugin / Microkernel（21/35）在当前阶段更务实：

- **D4 熵管理满分（5/5）**：增删改某个 stage 完全不动其他文件，最符合 `agent-engineering-pipeline` 当前最紧迫的需求——让 skill 可维护、可扩展。
- **D6 Human Steer 强（4/5）**：engine + 独立 stage 文件的结构，维护者逐文件阅读即可理解。
- **D7 LLM 解读可靠（4/5）**：每个文件职责单一，agent 加载当前 stage 即可执行，不易混淆。
- **迁移路径清晰**：微内核的 engine（顺序编排）+ 独立 stage 文件，可以平滑升级到行为树——engine 从数值顺序升级为 `Sequence/Fallback/Condition`，stage 文件保持不动。

Plugin / Microkernel 的短板是 D1（架构约束弱，顺序靠文件命名约定）和 D2（反馈回路缺失，engine 不处理异常）。这些将在后续行为树迁移中补足。

目标不是构建运行时执行器。该 skill 仍然是一个 **pipeline generator**，但它的指令结构会模块化：一个很小的 engine 定义编排规则，独立的 stage 文档定义每个阶段如何参与生成 pipeline。

## 目标

- 让 skill 足够小，便于 agent 加载并可靠遵循。
- 将编排规则与 stage 级生成指导分离。
- 让新增或修改 stage 成为局部改动，避免改一个 stage 就重写整个 skill。
- 保留双语 skill 输出：`SKILL.md` 和 `zh-CN.md` 必须保持同步。
- 为未来迁移到行为树风格控制流预留简单路径。
- 在修改实际 skill 文件之前，先应用 `writing-skills` 的质量规则。

## 非目标

- 不实现真实 pipeline executor。
- 不引入脚本、CLI 或运行时代码。
- 本阶段不直接把 skill 改成完整行为树格式。
- 不把每一条很小的指令都拆成单独文件，避免让 skill 更难使用。

## 建议目录结构

```text
.agents/skills/agent-engineering-pipeline/
  SKILL.md
  zh-CN.md
  engine.md
  engine.zh-CN.md
  stages/
    01-parse-intent.md
    01-parse-intent.zh-CN.md
    02-select-pipeline-shape.md
    02-select-pipeline-shape.zh-CN.md
    03-generate-minimal-pipeline.md
    03-generate-minimal-pipeline.zh-CN.md
    04-verify-output.md
    04-verify-output.zh-CN.md
```

`SKILL.md` 保持为 discovery entrypoint。`engine.md` 定义编排契约。每个 `stages/*.md` 文件只负责一个生成关注点。

## Skill 入口

`SKILL.md` 应保持简短。它应该：

- 说明什么时候使用该 skill。
- 说明这是 pipeline generator，不是 pipeline executor。
- 要求 agent 遵循 `engine.md`。
- 定义最终输出格式。

入口文件应避免重复所有 stage 细节。重复会削弱微内核结构。

## Engine 契约

`engine.md` 定义稳定的控制规则：

1. 按数字顺序运行 stages。
2. 只在需要时加载当前 stage 指令。
3. 不执行生成出来的 pipeline。
4. 生成满足输入要求的最小 pipeline。
5. 如果某个 stage 无法产出有把握的结果，降级为更简单的线性 pipeline，并在生成的 pipeline 中记录不确定性。
6. 除非用户明确要求解释，否则最终回答只能包含生成的 pipeline 路径和 pipeline 内容。

engine 有意保持轻量。它回答 **什么时候做每个 stage**，stage 文件回答 **这个 stage 怎么做**。

## Stage 契约

每个 stage 文件应遵循同一套紧凑结构：

```markdown
# Stage Name

## Purpose

一到两句话说明该 stage 的目的。

## Input

该 stage 从用户请求或上一个 stage 读取什么。

## Output

该 stage 必须产出什么。

## Rules

- 最小化的 stage 专属规则。

## Failure / Fallback

如果该 stage 不确定，应如何处理。
```

### Stage 1: Parse Intent

Purpose：提取用户目标、目标领域、约束，以及期望的 pipeline 路径。

Fallback：如果目标路径不明确，严格按当前 skill 要求使用 `{skillpath}/{piplinename}`。

### Stage 2: Select Pipeline Shape

Purpose：为生成的工作流选择最小形态。

默认形态：Gate Checklist / linear stage sequence。

允许升级：

- 当内容需要失败处理时，使用 `on_failure` 标注。
- 只有当用户输入明确需要分支或回退时，才使用类似行为树的 `Sequence/Fallback/Condition`。

### Stage 3: Generate Minimal Pipeline

Purpose：编写 pipeline 本身。

Rules：

- 优先控制在 3-5 个 stages。
- 每个 stage 必须有清晰目的。
- 除非必要，避免写实现细节。
- 不执行任何 stage。

### Stage 4: Verify Output

Purpose：在最终响应前检查生成的 pipeline。

Checks：

- 是否匹配用户请求内容？
- 是否足够最小？
- 是否避免了执行？
- 是否包含必需路径？
- fallback 或 condition 标注是否只在有用时出现？

## 输出格式

最终响应应保留当前 skill 的核心契约：

```text
Pipeline 路径：{skillpath}/{piplinename}

<generated pipeline>
```

如果用户提供了具体 skill path 或 pipeline name，则使用用户提供的值。否则保留占位符格式。

## 双语要求

由于该仓库保持中英文 skill 文件，每个新增 skill 文档都必须有中文对应文件：

- `engine.md` ↔ `engine.zh-CN.md`
- `stages/01-parse-intent.md` ↔ `stages/01-parse-intent.zh-CN.md`
- 等等。

中文文件必须完整保留代码块、文件名、技术标识符和占位符。

## Writing-Skills 验证计划

在编辑实际 skill 之前，遵循 `writing-skills`：

核心要求：

- 先观察 baseline failure，再写或改 skill。
- 只针对观察到的失败补规则，避免凭想象堆文档。
- 每次修改 `SKILL.md` 都必须同步修改 `zh-CN.md`。
- 每个新增 stage 文档都必须有对应 `.zh-CN.md` 文件。
- 在没有验证记录之前，不声明 skill edit 完成。

### RED: Baseline Scenarios

在没有重设计 skill 指令的情况下，至少运行以下压力场景并记录失败：

1. **模糊内容**：用户给出粗略想法并要求生成 pipeline。预期失败：agent 过度设计，或提出不必要问题。
2. **实现压力**：用户要求 pipeline，但暗示“开始执行”。预期失败：agent 开始实现，而不是只生成 pipeline。
3. **复杂内容**：用户给出包含失败路径的内容。预期失败：agent 输出扁平列表并遗漏 fallback 行为。

由于当前环境不应在没有明确请求的情况下 spawn subagents，这些场景可以先记录为手动 baseline prompts；如果用户授权，再运行 subagent-based pressure tests。

每个 baseline 场景记录以下字段：

```markdown
## Scenario: <name>

Prompt:
<完整压力提示>

Expected failure:
<希望暴露的问题>

Observed behavior:
<agent 实际行为，尽量保留原话>

Failure classification:
- over-design
- executes-instead-of-generates
- misses-fallback
- asks-unnecessary-question
- ignores-output-contract

Rule needed:
<后续 skill 中需要新增或强化的规则>
```

### GREEN: Minimal Skill Edit

只实现足以解决 baseline failures 的微内核结构：

- 将 `SKILL.md` 缩短为入口指令。
- 新增 `engine.md`。
- 新增四个 stage 文件。
- 新增同步的中文版本。

最小编辑范围：

| 文件 | 作用 | 是否必须 |
|---|---|---|
| `SKILL.md` | discovery entrypoint，指向 `engine.md` | 是 |
| `zh-CN.md` | `SKILL.md` 的中文同步版本 | 是 |
| `engine.md` | 微内核编排契约 | 是 |
| `engine.zh-CN.md` | `engine.md` 的中文同步版本 | 是 |
| `stages/*.md` | 独立 stage 指令 | 是 |
| `stages/*.zh-CN.md` | stage 中文同步版本 | 是 |

GREEN 通过标准：

- 三个 baseline 场景都能得到符合输出契约的 pipeline。
- 输出中没有执行动作，只生成 pipeline。
- 模糊输入不会导致过度设计。
- 复杂输入中的失败路径不会被丢弃。
- 中英文文件结构一致。

### REFACTOR: Close Loopholes

测试重设计后的 skill 之后，只针对观察到的失败添加规则：

- 如果 agents 执行了生成出来的 pipeline，加强 "generator only" 规则。
- 如果 agents 生成过长 pipeline，加强 minimality 规则。
- 如果 agents 忽略 fallback 路径，加强 Stage 2 和 Stage 4。

REFACTOR 不允许做的事：

- 不新增未被测试暴露的问题规则。
- 不把 engine 写成完整执行器。
- 不把 stage 文件扩写成长篇教程。
- 不为了覆盖未来行为树迁移而提前引入复杂语法。

## Skill 文档质量检查

实现时按 `writing-skills` 检查以下内容：

| 检查项 | 要求 |
|---|---|
| Frontmatter | `name` 和 `description` 存在；`description` 只描述触发条件，不总结流程 |
| Entry point | `SKILL.md` 足够短，只负责发现、边界和跳转 |
| CSO | 描述中包含 `pipeline`、`workflow`、`before design`、`before implementation` 等搜索关键词 |
| 双语同步 | 英文和中文文件同结构、同顺序、同规则 |
| 支持文件 | 只为 engine 和 stage 拆文件，不新增无用 supporting files |
| 示例数量 | 只保留一个最小输出示例，避免多示例稀释 |
| 常见错误 | 明确禁止执行 pipeline、过度生成、遗漏 fallback |

## 压力测试矩阵

| 场景 | 输入压力 | 预期输出 | 失败即说明 |
|---|---|---|---|
| Ambiguous content | 用户只给粗略想法 | 生成最小 3-5 stage pipeline 或记录不确定性 | minimality / path fallback 不足 |
| Implementation pressure | 用户暗示马上执行 | 只输出 pipeline，不执行任何 stage | generator-only 规则不足 |
| Complex failure path | 输入含失败、重试、人工介入 | pipeline 包含必要 `on_failure` 或 fallback stage | failure path 选择不足 |
| Over-specific request | 用户要求很多细节 | 只保留 pipeline 级结构，不写实现步骤 | stage 边界不足 |
| Bilingual sync | 修改英文文件后检查中文文件 | 中文文件结构同步 | writing-skills 同步要求未落实 |

## 向行为树迁移路径

该微内核设计不应阻碍后续行为树版本。

桥接路径如下：

```text
engine.md numeric stage order
  → stage-level on_failure / on_condition annotations
  → behavior-tree-like Sequence / Fallback / Condition
  → full behavior tree if complexity justifies it
```

第一版实现应将 `Sequence/Fallback/Condition` 保持为可选的生成输出，而不是 skill 自身的内部架构。

## 验收标准

- `SKILL.md` 保持简洁，并指向 `engine.md`。
- `engine.md` 清晰区分编排与 stage 执行细节。
- 存在四个 stage 文件，且每个文件都有 Purpose/Input/Output/Rules/Failure sections。
- `zh-CN.md` 和所有 `.zh-CN.md` 伴随文件存在，并且结构同步。
- 该 skill 仍然只输出生成的 pipeline，不执行 pipeline。
- 在声明 skill edit 完成之前，已记录 baseline 和 redesigned-skill pressure scenarios。
- 至少三个 RED baseline 场景有记录。
- GREEN 后同一批场景有复测记录。
- 若新增规则，能追溯到某个观察到的失败。
- 文档中没有未同步的中英文规则差异。

## 待决策项

是否运行 subagent pressure tests 应在实现前决定。如果未授权，第一轮使用已记录的手动场景，并将 subagent 测试留作后续质量步骤。
